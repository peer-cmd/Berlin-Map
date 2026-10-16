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


def simplify_ring(ring, tol_m):
    """Douglas-Peucker in metres (local equirectangular scale). Keeps the ring closed; returns
    the input if simplification would leave fewer than 4 points."""
    if tol_m <= 0 or len(ring) <= 4:
        return ring
    kx, ky = M_PER_DEG_LON_AT_52_5, M_PER_DEG_LAT
    pts = [(x * kx, y * ky) for x, y in ring]
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        (x1, y1), (x2, y2) = pts[i], pts[j]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy)
        best, idx = 0.0, None
        for k in range(i + 1, j):
            px, py = pts[k]
            d = abs(dy * (px - x1) - dx * (py - y1)) / norm if norm else math.hypot(px - x1, py - y1)
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol_m:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    out = [p for p, k in zip(ring, keep) if k]
    return out if len(out) >= 4 else ring


def simplify_geometry(geom, tol_m):
    if not tol_m or geom["type"] != "MultiPolygon":
        return geom
    return {"type": "MultiPolygon",
            "coordinates": [[simplify_ring(r, tol_m) for r in poly] for poly in geom["coordinates"]]}


def rasterize(features, key, step_m):
    """Even-odd scanline fill of each feature's polygon rings on a grid of step_m (cell centres).
    Returns {(col, row): key value}. Standard library stand-in for polygon intersection."""
    kx, ky = M_PER_DEG_LON_AT_52_5, M_PER_DEG_LAT
    cells = {}
    for f in features:
        g = f.get("geometry") or {}
        t = g.get("type")
        polys = [g["coordinates"]] if t == "Polygon" else g["coordinates"] if t == "MultiPolygon" else []
        rows = {}
        for ring in (r for p in polys for r in p):
            pts = [(x * kx / step_m - 0.5, y * ky / step_m - 0.5) for x, y in (q[:2] for q in ring)]
            for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
                if y1 == y2:
                    continue
                for j in range(math.ceil(min(y1, y2)), math.ceil(max(y1, y2))):
                    rows.setdefault(j, []).append(x1 + (j - y1) * (x2 - x1) / (y2 - y1))
        v = f["properties"].get(key)
        for j, xs in rows.items():
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for i in range(math.ceil(a), math.ceil(b)):
                    cells[(i, j)] = v
    return cells


def crosswalk(base, other, key, other_key, step_m, threshold):
    """Match areas of an older geometry to the base geometry by overlap on a grid.
    An old area maps to a base area when each covers at least `threshold` of the other.
    Returns ({old key: base key}, report rows for every old area)."""
    a, b = rasterize(base, key, step_m), rasterize(other, other_key, step_m)
    tot_a, tot_b, both = Counter(a.values()), Counter(b.values()), Counter()
    for cell, ok in b.items():
        if cell in a:
            both[(ok, a[cell])] += 1
    best = {}
    for (ok, bk), n in both.items():
        if n > best.get(ok, (None, 0))[1]:
            best[ok] = (bk, n)
    mapping, rows = {}, []
    for ok in sorted(tot_b, key=str):
        bk, n = best.get(ok, (None, 0))
        s_old, s_new = n / tot_b[ok], (n / tot_a[bk] if bk is not None else 0.0)
        matched = s_old >= threshold and s_new >= threshold
        if matched:
            mapping[ok] = bk
        rows.append({"old_key": ok, "base_key": bk, "share_of_old": round(s_old, 4),
                     "share_of_base": round(s_new, 4), "matched": matched})
    return mapping, rows


def combine_parts(parts, combine, warnings, report=None):
    """parts: list of (part_config, features). Returns one feature list.
    join:   geometry from the first part; attributes of the other parts added by key. A part with
            "match": "geometry" (older area boundaries) joins through crosswalk(); its report
            goes to report[fingerprint] = {"type_names": [...], "rows": [...]}.
    concat: all features of all parts; combine["field"] records which part each came from."""
    for cfg, feats in parts:
        for f in feats:
            props = f.get("properties") or {}
            for old, new in (cfg.get("rename") or {}).items():
                if old in props:
                    props[new] = props.pop(old)
            f["properties"] = props
    if len(parts) == 1:
        return parts[0][1]
    mode = (combine or {}).get("mode")
    if mode == "concat":
        field = combine["field"]
        out = []
        for cfg, feats in parts:
            for f in feats:
                f["properties"][field] = cfg.get("value", cfg["type_name"])
                out.append(f)
        return out
    if mode == "join":
        key = combine["key"]
        base = parts[0][1]
        for cfg, feats in parts[1:]:
            k = cfg.get("key", key)
            index = {}
            if cfg.get("match") == "geometry":
                fp = hashlib.sha256(json.dumps([(f["properties"].get(k), f.get("geometry")) for f in feats],
                                               sort_keys=True).encode()).hexdigest()[:12]
                if report is None:
                    report = {}
                if fp not in report:
                    mapping, rows = crosswalk(base, feats, key, k, combine.get("grid_m", 50),
                                              combine.get("match_threshold", 0.97))
                    report[fp] = {"type_names": [], "mapping": mapping, "rows": rows}
                    n = sum(1 for f in base if f["properties"].get(key) not in mapping.values())
                    if n:
                        warnings.append(f"{n} features have no matching area in the older geometry "
                                        f"(crosswalk {fp}); older values left empty")
                report[fp]["type_names"].append(cfg["type_name"])
                for f in feats:
                    mk = report[fp]["mapping"].get(f["properties"].get(k))
                    if mk is not None:
                        index.setdefault(mk, f["properties"])
                for f in base:
                    other = index.get(f["properties"].get(key))
                    for name, val in (other or {}).items():
                        f["properties"].setdefault(name, val)
                continue
            for f in feats:
                index.setdefault(f["properties"].get(k), f["properties"])
            unmatched = 0
            for f in base:
                other = index.get(f["properties"].get(key))
                if other is None:
                    unmatched += 1
                    continue
                for name, val in other.items():
                    f["properties"].setdefault(name, val)
            if unmatched:
                warnings.append(f"{unmatched} features without a match in {cfg['type_name']} on {key}")
        return base
    sys.exit("ERROR: source has several parts but no process.combine mode (join or concat)")


def process(layer):
    lid = layer["id"]
    opts = layer.get("process", {})
    kind = layer.get("geometry", "polygon")
    global PRECISION
    PRECISION = opts.get("precision", 6)
    prov_path = latest_provenance(lid)
    prov = json.loads(prov_path.read_text(encoding="utf-8"))
    part_cfgs = layer["source"].get("parts") or [{"type_name": layer["source"]["type_name"]}]
    records = prov.get("parts") or [prov]
    if len(records) != len(part_cfgs):
        sys.exit(f"ERROR [{lid}]: {prov_path.name} has {len(records)} parts, config has {len(part_cfgs)}. Re-run acquire.py.")
    warnings = []
    parts = []
    for cfg, rec in zip(part_cfgs, records):
        raw_path = RAW_DIR / rec["raw_file"]
        raw_bytes = raw_path.read_bytes()
        if hashlib.sha256(raw_bytes).hexdigest() != rec["raw_sha256"]:
            sys.exit(f"ERROR [{lid}]: {raw_path.name} does not match its recorded SHA-256. Re-run acquire.py.")
        feats = json.loads(raw_bytes)["features"]
        print(f"[{lid}] {raw_path.name}: {len(feats)} features")
        parts.append((cfg, feats))
    xwalk = {}
    raw_features = combine_parts(parts, opts.get("combine"), warnings, xwalk)

    for new, old in (opts.get("alias") or {}).items():
        for f in raw_features:
            if new not in f["properties"] and old in f["properties"]:
                f["properties"][new] = f["properties"][old]

    # Derived fields: change between two years of the same indicator, computed from source values.
    for d in opts.get("derive") or []:
        for f in raw_features:
            p = f["properties"]
            a, b = p.get(d["from"]), p.get(d["to"])
            if not (isinstance(a, (int, float)) and isinstance(b, (int, float))):
                continue
            if d["op"] == "pct_change" and a:
                p[d["field"]] = round((b / a - 1) * 100, 1)
            elif d["op"] == "diff":
                p[d["field"]] = round(b - a, 2)

    # One service can feed several sources, split by geometry type or by an attribute
    # (e.g. FNP areas, overlay areas and symbols). Features are selected, never changed.
    n = len(raw_features)
    if opts.get("only_geometry"):
        allowed = {"polygon": ("Polygon", "MultiPolygon"), "point": ("Point", "MultiPoint"),
                   "line": ("LineString", "MultiLineString")}[kind]
        raw_features = [f for f in raw_features if (f.get("geometry") or {}).get("type") in allowed]
    flt = opts.get("filter")
    if flt:
        inside = lambda f: f["properties"].get(flt["property"]) in flt.get("include", flt.get("exclude", []))
        raw_features = [f for f in raw_features if inside(f) == ("include" in flt)]
    filtered = n - len(raw_features)

    skipped = Counter()
    kept = []
    for f in raw_features:
        geom, info = clean_geometry(f.get("geometry"), kind)
        if geom is None:
            skipped[info] += 1
            continue
        kept.append((info, f.get("properties") or {}, simplify_geometry(geom, opts.get("simplify_m"))))

    if opts.get("sort") == "area_desc":
        kept.sort(key=lambda k: -k[0])

    features = [
        {"type": "Feature", "id": i, "properties": props, "geometry": geom}
        for i, (_, props, geom) in enumerate(kept)
    ]

    # Validation report (warnings only; nothing is altered).
    id_field = opts.get("id_field")
    if id_field:
        dup = [k for k, n in Counter(p.get(id_field) for _, p, _ in kept).items() if n > 1]
        if dup:
            warnings.append(f"{len(dup)} duplicate {id_field} values (e.g. {dup[:3]})")
    stats, missing_by_count = {}, {}
    for view in layer.get("views", {}).values():
        st = view.get("style", {})
        prop = st.get("property")
        if st.get("kind") == "step" and prop and prop not in stats:
            s, missing = numeric_stats(kept, prop)
            if s:
                stats[prop] = s
            if missing:
                missing_by_count.setdefault(missing, []).append(prop)
        elif st.get("kind") == "categorical" and prop:
            known = {v for c in st.get("categories", []) for v in c.get("values", [])}
            other = Counter(p.get(prop) for _, p, _ in kept if p.get(prop) not in known)
            if other:
                warnings.append(f"{sum(other.values())} features with {prop} outside the styled categories: "
                                f"{dict(other.most_common(5))}")
    for missing, props in missing_by_count.items():
        warnings.append(f"{missing} features without numeric {props[0]}" if len(props) == 1 else
                        f"{missing} features without numeric values in {len(props)} fields ({', '.join(props)})")
    if skipped:
        warnings.append(f"skipped features: {dict(skipped)}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / f"{lid}.geojson"
    csv_text = attribute_csv([(f, k[0]) for f, k in zip(features, kept)], kind)
    keep_fields = opts.get("keep_fields")  # GeoJSON for the web may carry fewer fields; the CSV keeps all
    if keep_fields:
        for f in features:
            f["properties"] = {k: v for k, v in f["properties"].items() if k in keep_fields}
    payload = json.dumps({"type": "FeatureCollection", "features": features},
                         ensure_ascii=False, separators=(",", ":"))
    for path, text in ((out_path, payload), (PROCESSED_DIR / f"{lid}.csv", csv_text)):
        tmp = path.with_name(path.name + ".part")
        tmp.write_text(text, encoding="utf-8-sig" if path.suffix == ".csv" else "utf-8", newline="")
        tmp.replace(path)

    files = {"geojson": out_path.name, "csv": f"{lid}.csv"}
    if xwalk:
        rows = [{"crosswalk": fp, "type_names": " ".join(r["type_names"]), **row}
                for fp, r in xwalk.items() for row in r["rows"]]
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=list(rows[0]), lineterminator="\n")
        w.writeheader()
        w.writerows(rows)
        files["crosswalk"] = f"{lid}.crosswalk.csv"
        (PROCESSED_DIR / files["crosswalk"]).write_text(buf.getvalue(), encoding="utf-8-sig", newline="")

    meta = {
        "layer_id": lid,
        "title": title(layer),
        "geometry": kind,
        "processed_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "feature_count": len(features),
        "skipped": dict(skipped),
        "filtered": filtered,
        "warnings": warnings,
        "stats": stats,
        "output_bytes": len(payload.encode("utf-8")),
        "processing": {k: opts[k] for k in ("precision", "simplify_m", "keep_fields", "combine", "alias",
                                                "derive", "only_geometry", "filter") if k in opts},
        "files": files,
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
