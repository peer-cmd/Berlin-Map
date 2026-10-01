"""Copy the map into the website folder for upload (Strato, static webspace).
Usage: python scripts/export_site.py [--site 02_Vergesellschaftung]

Writes <site>/karte/: app.js, map.css, vendor/, layers.json, <id>.geojson, <id>.meta.json.
<site>/karte.html loads these. Upload the whole <site> folder by SFTP afterwards.
"""
import argparse
import json
import shutil
import sys

from common import CONFIG, PROCESSED_DIR, ROOT, load_config, select_layers


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--site", default="02_Vergesellschaftung", help="website folder, relative to the repo root")
    args = ap.parse_args()

    site = ROOT / args.site
    if not (site / "karte.html").exists():
        sys.exit(f"ERROR: {site / 'karte.html'} not found")
    out = site / "karte"

    cfg = load_config()
    layers = select_layers(cfg)
    data = []
    for layer in layers:
        geo, meta = PROCESSED_DIR / f"{layer['id']}.geojson", PROCESSED_DIR / f"{layer['id']}.meta.json"
        if not geo.exists() or not meta.exists():
            sys.exit(f"ERROR: {geo.name} or {meta.name} missing. Run acquire.py and process.py first.")
        m = json.loads(meta.read_text(encoding="utf-8"))
        # tests/smoke.py leaves mock output in data/; never publish it.
        if m.get("provenance", {}).get("service_base_url") != layer["source"]["base_url"]:
            sys.exit(f"ERROR: {meta.name} does not come from {layer['source']['base_url']} "
                     "(mock data from tests/smoke.py?). Run acquire.py and process.py first.")
        data += [geo, meta]

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "web" / "vendor", out / "vendor")
    shutil.copy2(ROOT / "web" / "app.js", out / "app.js")
    shutil.copy2(ROOT / "web" / "style.css", out / "map.css")
    shutil.copy2(CONFIG, out / "layers.json")
    for f in data:
        shutil.copy2(f, out / f.name)

    total = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"Wrote {out.relative_to(ROOT)} ({total / 1e6:.1f} MB, {len(layers)} layer(s)).")
    print(f"Upload the folder {args.site}/ (including .htaccess) to the Strato webspace.")


if __name__ == "__main__":
    main()
