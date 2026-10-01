"""Shared paths and config loading. Standard library only."""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config" / "sources.json"
MAPS_DIR = ROOT / "config" / "maps"
# BERLIN_MAP_DATA redirects all data output (used by tests/smoke.py so tests never touch data/).
DATA_DIR = Path(os.environ.get("BERLIN_MAP_DATA", ROOT / "data"))
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"


def load_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"ERROR: cannot read {path}: {e}")


def load_config(path=CONFIG):
    return load_json(path)


def title(entry, lang="de"):
    t = entry.get("title")
    return t.get(lang) or next(iter(t.values())) if isinstance(t, dict) else t


def select_layers(cfg, layer_id=None, map_id=None):
    """WFS sources to work on: one named by layer_id (even if disabled), those used by
    config/maps/<map_id>.json, or else all enabled ones."""
    layers = [l for l in cfg["sources"] if l.get("source", {}).get("type") == "wfs"]
    if layer_id:
        layers = [l for l in layers if l["id"] == layer_id]
        if not layers:
            sys.exit(f"ERROR: no WFS source '{layer_id}' in {CONFIG.name}")
    elif map_id:
        m = load_json(MAPS_DIR / f"{map_id}.json")
        used = {ly["source"] for g in m["groups"] for ly in g["layers"]}
        missing = used - {l["id"] for l in layers}
        if missing:
            sys.exit(f"ERROR: map '{map_id}' uses unknown sources {sorted(missing)}")
        layers = [l for l in layers if l["id"] in used]
    else:
        layers = [l for l in layers if l.get("enabled")]
    return layers
