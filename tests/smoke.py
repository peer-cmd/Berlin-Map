"""Offline pipeline test: mock WFS -> acquire -> process. Run: python tests/smoke.py"""
import json
import subprocess
import sys
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
subprocess.run([py, str(ROOT / "scripts/acquire.py"), "--layer", "brw2026",
                "--base-url", "http://127.0.0.1:8099/wfs"], check=True)
subprocess.run([py, str(ROOT / "scripts/process.py"), "--layer", "brw2026"], check=True)
meta = json.loads((ROOT / "data/processed/brw2026.meta.json").read_text(encoding="utf-8"))
assert meta["feature_count"] == 900, meta["feature_count"]
assert meta["skipped"] == {"null geometry": 1}, meta["skipped"]
assert meta["provenance"]["raw_sha256"]
print("SMOKE TEST OK")
