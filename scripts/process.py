"""Turn the newest raw download into the file the map loads.

Usage:
    python scripts/process.py                  # all enabled WFS layers
    python scripts/process.py --layer brw2026

Steps: validate geometry and attributes, round coordinates to 6 decimals (about 0.1 m),
drop empty or degenerate geometry, assign numeric feature ids, order features by
descending area so small zones draw above large ones, write compact GeoJSON plus a
<id>.meta.json holding provenance, statistics and attribution for the frontend.
Features are never edited or created by hand; attributes pass through unchanged.
"""
import argparse
import hashlib
import json
import math
import sys
from collections import Counter
from datetime import datetime, timezone

from common import PROCESSED_DIR, RAW_DIR, load_config, select_layers

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


def clean_geometry(geom):
    """Normalise to MultiPolygon. Returns (geometry, area_m2) or (None, reason)."""
    if not geom:
        return None, "null geometry"
    t = geom.get("type")
    if t == "Polygon":
        polys = [geom["coordinates"]]
    elif t == "MultiPolygon":
        polys = geom["coordinates"]
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


def process(layer):
    lid = layer["id"]
    opts = layer.get("process", {})
    style = layer.get("style", {})
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
        geom, info = clean_geometry(f.get("geometry"))
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
    prop = style.get("property")
    if prop:
        vals = sorted(p[prop] for _, p, _ in kept if isinstance(p.get(prop), (int, float)))
        missing = len(kept) - len(vals)
        if missing:
            warnings.append(f"{missing} features without numeric {prop}")
        if vals:
            q = lambda x: vals[int(x * (len(vals) - 1))]
            stats = {"property": prop, "min": vals[0], "max": vals[-1],
                     "median": q(0.5), "p05": q(0.05), "p95": q(0.95)}
    if skipped:
        warnings.append(f"skipped features: {dict(skipped)}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / f"{lid}.geojson"
    payload = json.dumps({"type": "FeatureCollection", "features": features},
                         ensure_ascii=False, separators=(",", ":"))
    tmp = out_path.with_name(out_path.name + ".part")
    tmp.write_text(payload, encoding="utf-8")
    tmp.replace(out_path)

    meta = {
        "layer_id": lid,
        "title": layer.get("title"),
        "processed_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "feature_count": len(features),
        "skipped": dict(skipped),
        "warnings": warnings,
        "stats": stats,
        "output_bytes": len(payload.encode("utf-8")),
        "provenance": prov,
        "provenance_file": prov_path.name,
    }
    (PROCESSED_DIR / f"{lid}.meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"  wrote {out_path.name}: {len(features)} features, {meta['output_bytes'] / 1e6:.1f} MB")
    if stats:
        print(f"  {prop}: min {stats['min']}, median {stats['median']}, max {stats['max']}")
    for w in warnings:
        print(f"  WARNING: {w}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--layer", help="layer id (default: all enabled WFS layers)")
    args = ap.parse_args()
    layers = select_layers(load_config(), args.layer)
    if not layers:
        sys.exit("No enabled WFS layers in config.")
    for layer in layers:
        process(layer)


if __name__ == "__main__":
    main()
