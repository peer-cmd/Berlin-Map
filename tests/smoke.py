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
# combine_parts and simplify_ring without network
sys.path.insert(0, str(ROOT / "scripts"))
import process  # noqa: E402
sq = lambda x: {"type": "Polygon", "coordinates": [[[x, 0], [x + 1, 0], [x + 1, 1], [x, 1], [x, 0]]]}
a = [{"properties": {"k": "1", "a": 5}, "geometry": sq(0)}, {"properties": {"k": "2", "a": 6}, "geometry": sq(2)}]
b = [{"properties": {"k": "1", "b": 7}, "geometry": sq(0)}]
w = []
joined = process.combine_parts([({"type_name": "A"}, a), ({"type_name": "B", "rename": {"b": "bb"}}, b)],
                               {"mode": "join", "key": "k"}, w)
assert joined[0]["properties"] == {"k": "1", "a": 5, "bb": 7} and len(w) == 1, (joined, w)
cat = process.combine_parts([({"type_name": "A", "value": "x"}, [dict(f, properties=dict(f["properties"])) for f in a]),
                             ({"type_name": "B", "value": "y"}, [dict(f, properties=dict(f["properties"])) for f in b])],
                            {"mode": "concat", "field": "teil"}, [])
assert [f["properties"]["teil"] for f in cat] == ["x", "x", "y"], cat
ring = [[13.0 + i * 1e-6, 52.5 + (1e-7 if i % 2 else 0)] for i in range(50)] + [[13.0, 52.6], [13.0, 52.5]]
assert len(process.simplify_ring(ring, 1.0)) < len(ring) and process.simplify_ring(ring, 1.0)[0] == ring[0]
print("SMOKE TEST OK")
