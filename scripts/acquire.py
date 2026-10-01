"""Download WFS layers into data/raw/ with a provenance record.

Usage:
    python scripts/acquire.py                  # all enabled WFS layers
    python scripts/acquire.py --layer brw2026
    python scripts/acquire.py --map research   # sources used by config/maps/research.json
    python scripts/acquire.py --base-url http://127.0.0.1:8099/wfs   # test against a mock

Each run writes three files per layer, stamped with the UTC retrieval time:
    <id>_<stamp>.geojson            server response, unmodified
    <id>_<stamp>.capabilities.xml   GetCapabilities response
    <id>_<stamp>.provenance.json    URLs, hashes, counts, licence text from the service
Older retrievals are kept, so every processed file can be traced to its raw source.
"""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from common import RAW_DIR, load_config, select_layers, title

UA = "berlin-map-research/1.0 (local research tool)"


def http_get(url, timeout, retries=3):
    """GET with retries. Returns (bytes, content_type)."""
    last = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read(), r.headers.get("Content-Type", "")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
            if attempt < retries:
                wait = 2 ** attempt
                print(f"  attempt {attempt} failed ({e}); retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
    raise RuntimeError(f"request failed after {retries} attempts: {last}\n  URL: {url}")


def wfs_url(src, base_url, **extra):
    params = {"service": "WFS", "version": src["version"], **extra}
    return base_url + "?" + urllib.parse.urlencode(params, safe=":/")


def xml_text(xml, tag):
    m = re.search(rf"<(?:ows:)?{tag}>(.*?)</(?:ows:)?{tag}>", xml, re.S)
    return m.group(1).strip() if m else None


def acquire(layer, base_url_override, timeout):
    src = layer["source"]
    base = base_url_override or src["base_url"]
    lid = layer["id"]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    print(f"[{lid}] {base}")

    # 1. Capabilities: confirms the service answers and records its stated terms.
    cap_url = wfs_url(src, base, request="GetCapabilities")
    cap, _ = http_get(cap_url, timeout)
    cap_xml = cap.decode("utf-8", "replace")
    if "<WFS_Capabilities" not in cap_xml and ":WFS_Capabilities" not in cap_xml:
        raise RuntimeError(f"GetCapabilities did not return a WFS capabilities document:\n{cap_xml[:300]}")
    if src["type_name"] not in cap_xml:
        raise RuntimeError(f"feature type {src['type_name']} not listed in capabilities")

    # 2. Expected feature count.
    hits_url = wfs_url(src, base, request="GetFeature", typeNames=src["type_name"], resultType="hits")
    hits, _ = http_get(hits_url, timeout)
    m = re.search(r'numberMatched="(\d+)"', hits.decode("utf-8", "replace"))
    if not m:
        raise RuntimeError("could not read numberMatched from resultType=hits response")
    expected = int(m.group(1))
    print(f"  service reports {expected} features")

    # 3. The data itself.
    get_url = wfs_url(src, base, request="GetFeature", typeNames=src["type_name"],
                      outputFormat=src["output_format"], srsName=src["srs_name"])
    body, ctype = http_get(get_url, timeout * 4)
    if not body.lstrip().startswith(b"{"):
        raise RuntimeError(f"server did not return JSON (Content-Type {ctype}):\n{body[:400].decode('utf-8', 'replace')}")
    try:
        data = json.loads(body)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"invalid JSON from server: {e}")
    if data.get("type") != "FeatureCollection":
        raise RuntimeError("response is not a GeoJSON FeatureCollection")
    got = len(data.get("features", []))
    if got != expected:
        raise RuntimeError(f"received {got} features but service reports {expected} (server limit or truncation)")
    print(f"  received {got} features, {len(body) / 1e6:.1f} MB")

    # 4. Write raw + provenance (atomic rename so a failed run never leaves a partial file).
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    stem = RAW_DIR / f"{lid}_{stamp}"
    raw_path = stem.with_suffix(".geojson")
    for path, content in ((raw_path, body), (stem.with_suffix(".capabilities.xml"), cap)):
        tmp = path.with_name(path.name + ".part")
        tmp.write_bytes(content)
        tmp.replace(path)

    prov = {
        "layer_id": lid,
        "title": title(layer),
        "retrieved_utc": stamp,
        "request_urls": {"capabilities": cap_url, "hits": hits_url, "data": get_url},
        "service_base_url": base,
        "type_name": src["type_name"],
        "wfs_version": src["version"],
        "requested_srs": src["srs_name"],
        "response_crs": data.get("crs"),
        "feature_count": got,
        "raw_file": raw_path.name,
        "raw_bytes": len(body),
        "raw_sha256": hashlib.sha256(body).hexdigest(),
        "service_server_timestamp": data.get("timeStamp"),
        "service_title": xml_text(cap_xml, "Title"),
        "service_fees": xml_text(cap_xml, "Fees"),
        "service_access_constraints": xml_text(cap_xml, "AccessConstraints"),
        "dataset_page": src.get("dataset_page"),
        "publisher": layer.get("publisher"),
        "license": layer.get("license"),
    }
    prov_path = stem.with_suffix(".provenance.json")
    tmp = prov_path.with_name(prov_path.name + ".part")
    tmp.write_text(json.dumps(prov, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(prov_path)
    print(f"  wrote {raw_path.name} (+ capabilities, provenance)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--layer", help="source id from config/sources.json (default: all enabled WFS sources)")
    ap.add_argument("--map", help="only the sources used by config/maps/<MAP>.json")
    ap.add_argument("--base-url", help="override the WFS base URL (testing)")
    ap.add_argument("--timeout", type=int, default=60, help="seconds per request (default 60)")
    args = ap.parse_args()

    layers = select_layers(load_config(), args.layer, args.map)
    if not layers:
        sys.exit("No enabled WFS layers in config.")
    failed = 0
    for layer in layers:
        try:
            acquire(layer, args.base_url, args.timeout)
        except Exception as e:  # report per layer, keep going
            failed += 1
            print(f"ERROR [{layer['id']}]: {e}", file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
