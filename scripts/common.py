"""Shared paths and config loading. Standard library only."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config" / "layers.json"
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"


def load_config(path=CONFIG):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"ERROR: cannot read config {path}: {e}")


def select_layers(cfg, layer_id=None):
    """Enabled WFS layers, or the one layer named by layer_id (even if disabled)."""
    layers = [l for l in cfg["layers"] if l.get("source", {}).get("type") == "wfs"]
    if layer_id:
        layers = [l for l in layers if l["id"] == layer_id]
        if not layers:
            sys.exit(f"ERROR: no WFS layer '{layer_id}' in config")
    else:
        layers = [l for l in layers if l.get("enabled")]
    return layers
