"""Copy the map into the website folder for upload (Strato, static webspace).
Usage: python scripts/export_site.py [--site 02_Vergesellschaftung] [--map vergesellschaftung] [--zip]

Writes <site>/karte/: app.js, map.css, vendor/, sources.json (only the sources the map uses),
maps/<map>.json, and <id>.geojson, <id>.csv, <id>.meta.json for each of those sources.
<site>/karte.html loads these. With --zip, also writes website-upload.zip at the repo root:
the site folder without working material (archive, PDFs, bibliography, notes), ready to upload.
"""
import argparse
import json
import shutil
import sys
import zipfile

from common import CONFIG, MAPS_DIR, PROCESSED_DIR, ROOT, load_config, load_json

# Working material that stays out of the public site.
EXCLUDE_DIRS = {"archive", "pdf", "Bibliography"}
EXCLUDE_FILES = {"vergesellschaftung-modell-v37.html"}
EXCLUDE_SUFFIXES = {".md", ".bib", ".py"}  # licence files are always kept


def part_urls(src):
    s = src["source"]
    return [p.get("base_url", s["base_url"]) for p in s["parts"]] if s.get("parts") else [s["base_url"]]


def check_provenance(src, meta):
    """Refuse data that does not come from the configured service (e.g. mock output of a test)."""
    prov = meta.get("provenance", {})
    got = [p.get("service_base_url") for p in prov.get("parts", [prov])]
    if got != part_urls(src):
        sys.exit(f"ERROR: {src['id']}.meta.json does not come from {part_urls(src)}. "
                 "Run acquire.py and process.py first.")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--site", default="02_Vergesellschaftung", help="website folder, relative to the repo root")
    ap.add_argument("--map", default="vergesellschaftung", help="map definition in config/maps/")
    ap.add_argument("--zip", action="store_true", help="also write website-upload.zip")
    args = ap.parse_args()

    site = ROOT / args.site
    if not (site / "karte.html").exists():
        sys.exit(f"ERROR: {site / 'karte.html'} not found")
    out = site / "karte"

    cfg = load_config()
    mdef = load_json(MAPS_DIR / f"{args.map}.json")
    used = [ly["source"] for g in mdef["groups"] for ly in g["layers"]]
    by_id = {s["id"]: s for s in cfg["sources"]}
    missing = [u for u in used if u not in by_id]
    if missing:
        sys.exit(f"ERROR: map '{args.map}' uses unknown sources {missing}")

    data = []
    for sid in dict.fromkeys(used):
        files = [PROCESSED_DIR / f"{sid}{ext}" for ext in (".geojson", ".meta.json", ".csv")]
        absent = [f.name for f in files if not f.exists()]
        if absent:
            sys.exit(f"ERROR: {', '.join(absent)} missing. Run acquire.py and process.py first.")
        check_provenance(by_id[sid], json.loads(files[1].read_text(encoding="utf-8")))
        data += files

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "web" / "vendor", out / "vendor")
    shutil.copy2(ROOT / "web" / "app.js", out / "app.js")
    shutil.copy2(ROOT / "web" / "style.css", out / "map.css")
    catalogue = {**cfg, "sources": [by_id[s] for s in dict.fromkeys(used)]}
    (out / "sources.json").write_text(json.dumps(catalogue, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "maps").mkdir()
    shutil.copy2(MAPS_DIR / f"{args.map}.json", out / "maps" / f"{args.map}.json")
    for f in data:
        shutil.copy2(f, out / f.name)

    total = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"Wrote {out.relative_to(ROOT)} ({total / 1e6:.1f} MB, {len(data) // 3} layer(s), map '{args.map}').")

    if args.zip:
        zpath = ROOT / "website-upload.zip"
        n = 0
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(site.rglob("*")):
                rel = f.relative_to(site)
                if not f.is_file() or rel.parts[0] in EXCLUDE_DIRS or f.name in EXCLUDE_FILES \
                        or (f.suffix in EXCLUDE_SUFFIXES and "LICENSE" not in f.name) or "__pycache__" in rel.parts:
                    continue
                z.write(f, rel.as_posix())
                n += 1
        print(f"Wrote {zpath.name} ({zpath.stat().st_size / 1e6:.1f} MB, {n} files). "
              "Unpack it into the web root on Strato, keeping .htaccess.")
    else:
        print(f"Upload the folder {args.site}/ (including .htaccess) to the Strato webspace.")


if __name__ == "__main__":
    main()
