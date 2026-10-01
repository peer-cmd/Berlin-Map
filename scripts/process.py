"""Turn the newest raw download into the file the map loads.

Usage:
    python scripts/process.py                  # all enabled WFS layers
    python scripts/process.py --layer brw2026
    python scripts/process.py --map research

Steps: validate geometry and attributes, round coordinates to 6 decimals (about 0.1 m),
drop empty or degenerate geometry, assign numeric feature ids, order polygons by
descending area so small zones draw above large ones, write compact GeoJSON, an
attribute table <id>.csv (for spreadsheets, joins and other projects) and a
<id>.meta.json holding provenance, statistics and attribution for the frontend.
Features are never edited or created by hand; attributes pass through unchanged.
"""
import argparse
import csv
import io
import hashlib
import json
import math
import sys
from collections import Counter
from datetime import datetime, timezone

from common import PROCESSED_DIR, RAW_DIR, load_config, select_layers, title

PRECISION = 6
M_PER_DEG_LAT = 110_540.0
M_PER_DEG_LON_AT_52_5 = 111_320.0 * math.cos(math.radians(52.5))


def latest_provenance(layer_id):
    files = sorted(RAW_DIR.glob(f"{layer_id}_*.provenance.json"))
    if not files:
        sys.exit(f"ERROR [{layer_id}]: no raw data in {RAW_DIR}. Run scripts/acquire.py first.")
    return files[-1]


def clean_ring(ring):
    out = [[round(x, PRECISION), round(y, PRECISION)] for x, y in (p[:2] for p in ring)]
    dedup = [out[0]]
    for p in out[1:]:
        if p != dedup[-1]:
            dedup.append(p)
    if dedup[0] != dedup[-1]:
        dedup.append(dedup[0])
    return dedup if len(dedup) >= 4 else None


def ring_area(ring):
    s = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        s += x1 * y2 - x2 * y1
    return abs(s) / 2 * M_PER_DEG_LAT * M_PER_DEG_LON_AT_52_5


def clean_polygon(rings):
    """Returns (rings, area_m2) or None. First ring is the shell, the rest are holes."""
    cleaned = [clean_ring(r) for r in rings]
    if not cleaned or cleaned[0] is None:
        return None
    holes = [r for r in cleaned[1:] if r]
    area = ring_area(cleaned[0]) - sum(ring_area(h) for h in holes)
    return [cleaned[0]] + holes, max(area, 0.0)


def clean_point(p):
    return [round(p[0], PRECISION), round(p[1], PRECISION)]


def clean_line(line):
    out = [clean_point(p) for p in line]
    dedup = [out[0]] if out else []
    for p in out[1:]:
        if p != dedup[-1]:
            dedup.append(p)
    return dedup if len(dedup) >= 2 else None


def clean_geometry(geom, kind="polygon"):
    """Normalise to MultiPolygon, MultiPoint or MultiLineString according to the source's
    declared geometry kind. Returns (geometry, area_m2) or (None, reason)."""
    if not geom:
        return None, "null geometry"
    t = geom.get("type")
    c = geom.get("coordinates")
    if kind == "point":
        pts = [c] if t == "Point" else c if t == "MultiPoint" else None
        if pts is None:
            return None, f"unsupported geometry type {t}"
        pts = [clean_point(p) for p in pts if p]
        return ({"type": "MultiPoint", "coordinates": pts}, 0.0) if pts else (None, "degenerate geometry")
    if kind == "line":
        lines = [c] if t == "LineString" else c if t == "MultiLineString" else None
        if lines is None:
            return None, f"unsupported geometry type {t}"
        lines = [l for l in (clean_line(x) for x in lines) if l]
        return ({"type": "MultiLineString", "coordinates": lines}, 0.0) if lines else (None, "degenerate geometry")
    if t == "Polygon":
        polys = [c]
    elif t == "MultiPolygon":
        polys = c
    else:
        return None, f"unsupported geometry type {t}"
    out, total = [], 0.0
    for p in polys:
        r = clean_polygon(p)
        if r:
            out.append(r[0])
            total += r[1]
    if not out:
        return None, "degenerate geometry"
    return {"type": "MultiPolygon", "coordinates": out}, total


def numeric_stats(kept, prop):
    vals = sorted(p[prop] for _, p, _ in kept if isinstance(p.get(prop), (int, float)))
    if not vals:
        return None, len(kept)
    q = lambda x: vals[int(x * (len(vals) - 1))]
    return {"min": vals[0], "max": vals[-1], "median": q(0.5), "p05": q(0.05), "p95": q(0.95),
            "count": len(vals)}, len(kept) - len(vals)


def attribute_csv(features, kind):
    """One row per feature: id, attributes, plus area (polygons) or coordinates (points)."""
    keys = []
    for f, _ in features:
        for k in f["properties"]:
            if k not in keys:
                keys.append(k)
    extra = ["area_m2"] if kind == "polygon" else ["lon", "lat"] if kind == "point" else []
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["fid"] + keys + extra)
    for f, area in features:
        row = [f["id"]] + [f["properties"].get(k) for k in keys]
        if kind == "polygon":
            row.append(round(area))
        elif kind == "point":
            row += f["geometry"]["coordinates"][0]
        w.writerow(["" if v is None else v for v in row])
    return buf.getvalue()


def process(layer):
    lid = layer["id"]
    opts = layer.get("process", {})
    kind = layer.get("geometry", "polygon")
    prov_path = latest_provenance(lid)
    prov = json.loads(prov_path.read_text(encoding="utf-8"))
    raw_path = RAW_DIR / prov["raw_file"]
    raw_bytes = raw_path.read_bytes()
    if hashlib.sha256(raw_bytes).hexdigest() != prov["raw_sha256"]:
        sys.exit(f"ERROR [{lid}]: {raw_path.name} does not match its recorded SHA-256. Re-run acquire.py.")
    data = json.loads(raw_bytes)
    print(f"[{lid}] {raw_path.name}: {len(data['features'])} features")

    skipped = Counter()
    kept = []
    for f in data["features"]:
        geom, info = clean_geometry(f.get("geometry"), kind)
        if geom is None:
            skipped[info] += 1
            continue
        kept.append((info, f.get("properties") or {}, geom))

    if opts.get("sort") == "area_desc":
        kept.sort(key=lambda k: -k[0])

    features = [
        {"type": "Feature", "id": i, "properties": props, "geometry": geom}
        for i, (_, props, geom) in enumerate(kept)
    ]

    # Validation report (warnings only; nothing is altered).
    warnings = []
    id_field = opts.get("id_field")
    if id_field:
        dup = [k for k, n in Counter(p.get(id_field) for _, p, _ in kept).items() if n > 1]
        if dup:
            warnings.append(f"{len(dup)} duplicate {id_field} values (e.g. {dup[:3]})")
    stats = {}
    for view in layer.get("views", {}).values():
        st = view.get("style", {})
        prop = st.get("property")
        if st.get("kind") == "step" and prop and prop not in stats:
            s, missing = numeric_stats(kept, prop)
            if s:
                stats[prop] = s
            if missing:
                warnings.append(f"{missing} features without numeric {prop}")
        elif st.get("kind") == "categorical" and prop:
            known = {v for c in st.get("categories", []) for v in c.get("values", [])}
            other = Counter(p.get(prop) for _, p, _ in kept if p.get(prop) not in known)
            if other:
                warnings.append(f"{sum(other.values())} features with {prop} outside the styled categories: "
                                f"{dict(other.most_common(5))}")
    if skipped:
        warnings.append(f"skipped features: {dict(skipped)}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / f"{lid}.geojson"
    payload = json.dumps({"type": "FeatureCollection", "features": features},
                         ensure_ascii=False, separators=(",", ":"))
    csv_text = attribute_csv([(f, k[0]) for f, k in zip(features, kept)], kind)
    for path, text in ((out_path, payload), (PROCESSED_DIR / f"{lid}.csv", csv_text)):
        tmp = path.with_name(path.name + ".part")
        tmp.write_text(text, encoding="utf-8-sig" if path.suffix == ".csv" else "utf-8", newline="")
        tmp.replace(path)

    meta = {
        "layer_id": lid,
        "title": title(layer),
        "geometry": kind,
        "processed_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "feature_count": len(features),
        "skipped": dict(skipped),
        "warnings": warnings,
        "stats": stats,
        "output_bytes": len(payload.encode("utf-8")),
        "files": {"geojson": out_path.name, "csv": f"{lid}.csv"},
        "provenance": prov,
        "provenance_file": prov_path.name,
    }
    (PROCESSED_DIR / f"{lid}.meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"  wrote {out_path.name} ({meta['output_bytes'] / 1e6:.1f} MB) and {lid}.csv: {len(features)} features")
    for prop, st in stats.items():
        print(f"  {prop}: min {st['min']}, median {st['median']}, max {st['max']}")
    for w in warnings:
        print(f"  WARNING: {w}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--layer", help="source id (default: all enabled WFS sources)")
    ap.add_argument("--map", help="only the sources used by config/maps/<MAP>.json")
    args = ap.parse_args()
    layers = select_layers(load_config(), args.layer, args.map)
    if not layers:
        sys.exit("No enabled WFS sources in config.")
    for layer in layers:
        process(layer)


if __name__ == "__main__":
    main()
