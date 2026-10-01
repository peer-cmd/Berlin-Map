"""Offline pipeline test: mock WFS -> acquire -> process, in a temporary data folder.
Run: python tests/smoke.py   (data/ is not touched)"""
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
from http.server import HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
import mock_wfs  # noqa: E402

srv = HTTPServer(("127.0.0.1", 8099), mock_wfs.H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
time.sleep(0.3)
py = sys.executable
with tempfile.TemporaryDirectory() as tmp:
    env = {**os.environ, "BERLIN_MAP_DATA": tmp}
    subprocess.run([py, str(ROOT / "scripts/acquire.py"), "--layer", "brw2026",
                    "--base-url", "http://127.0.0.1:8099/wfs"], check=True, env=env)
    subprocess.run([py, str(ROOT / "scripts/process.py"), "--layer", "brw2026"], check=True, env=env)
    out = Path(tmp) / "processed"
    meta = json.loads((out / "brw2026.meta.json").read_text(encoding="utf-8"))
    assert meta["feature_count"] == 900, meta["feature_count"]
    assert meta["skipped"] == {"null geometry": 1}, meta["skipped"]
    assert meta["provenance"]["raw_sha256"]
    assert "brw" in meta["stats"] and "gfz" in meta["stats"], meta["stats"]
    rows = (out / "brw2026.csv").read_text(encoding="utf-8-sig").splitlines()
    assert len(rows) == 901 and rows[0].startswith("fid,") and rows[0].endswith(",area_m2"), rows[0]
print("SMOKE TEST OK")
