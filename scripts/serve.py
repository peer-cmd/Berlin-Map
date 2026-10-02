"""Serve the project folder on http://127.0.0.1:8000/ and open the map.
Usage: python scripts/serve.py [--port 8000] [--no-browser]
"""
import argparse
import http.server
import socketserver
import sys
import webbrowser
from functools import partial

from common import PROCESSED_DIR, ROOT


class Handler(http.server.SimpleHTTPRequestHandler):
    # Explicit types: Windows takes them from the registry, which is often wrong for .js.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
        ".geojson": "application/geo+json", ".html": "text/html; charset=utf-8",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path in ("", "/"):
            self.send_response(302)
            self.send_header("Location", "/02_Vergesellschaftung/")
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        if "404" in fmt % args:
            sys.stderr.write("  " + fmt % args + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--no-browser", action="store_true")
    a = ap.parse_args()
    if not any(PROCESSED_DIR.glob("*.geojson")):
        print("NOTE: no processed data yet. Run scripts\\update_data.bat first.", file=sys.stderr)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        srv = socketserver.TCPServer(("127.0.0.1", a.port), partial(Handler, directory=str(ROOT)))
    except OSError as e:
        sys.exit(f"ERROR: cannot bind port {a.port}: {e}. Try --port 8001.")
    url = f"http://127.0.0.1:{a.port}/web/"
    print(f"Serving {ROOT}\n  {url}\nCtrl+C to stop.")
    if not a.no_browser:
        webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
