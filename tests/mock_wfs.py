"""Minimal mock of the Berlin BRW WFS for offline tests.
Serves GetCapabilities, resultType=hits and GeoJSON GetFeature at /wfs, using the real
attribute schema and synthetic polygons. Usage: python tests/mock_wfs.py [port]
"""
import json
import random
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

NUTZUNG = ["W - Wohngebiet", "G - Gewerbe", "M1 - Kerngebiet", "M2 - Mischgebiet",
           "GB - Gemeinbedarf", "SF-KGA - Sonstige Flächen - Kleingartenfläche",
           "LF-F - Flächen der Land-o. Forstwirtschaft - forstwirtschaftliche Fläche"]
BEZIRKE = ["Spandau", "Mitte", "Pankow", "Neukölln", "Lichtenberg"]
VALUES = [0.6, 3.8, 15, 80, 250, 480, 900, 1500, 2400, 4000, 9000, 60000]


def make():
    rnd = random.Random(7)
    feats = []
    n = 0
    for i in range(30):
        for j in range(30):
            x0, y0 = 13.10 + i * 0.02, 52.36 + j * 0.01
            shell = [[x0, y0], [x0 + .019, y0], [x0 + .019, y0 + .009], [x0, y0 + .009], [x0, y0]]
            rings = [shell]
            if n % 50 == 0:  # a hole
                rings.append([[x0 + .005, y0 + .003], [x0 + .005, y0 + .006], [x0 + .01, y0 + .006],
                              [x0 + .01, y0 + .003], [x0 + .005, y0 + .003]])
            n += 1
            feats.append({"type": "Feature", "id": f"brw2026_vector.{1000 + n}",
                          "geometry": {"type": "MultiPolygon", "coordinates": [rings]},
                          "properties": {"bezirk": rnd.choice(BEZIRKE), "brw": rnd.choice(VALUES),
                                         "nutzung": rnd.choice(NUTZUNG), "stichtag": "2026-01-01",
                                         "anwert": rnd.choice([None, None, "SU"]), "verfahrensart": None,
                                         "gfz": rnd.choice([None, 0.7, 1.2, 2.5]),
                                         "beitragszustand": "Beitragsfrei nach BauGB", "lumnum": None,
                                         "brwid": str(1000 + n)}})
    # one null-geometry feature to exercise the skip path
    feats.append({"type": "Feature", "id": "brw2026_vector.9999", "geometry": None,
                  "properties": {"bezirk": "Mitte", "brw": 1, "brwid": "9999", "stichtag": "2026-01-01"}})
    return feats


FEATS = make()
CAPS = ('<?xml version="1.0"?><wfs:WFS_Capabilities xmlns:wfs="http://www.opengis.net/wfs/2.0" '
        'xmlns:ows="http://www.opengis.net/ows/1.1"><ows:ServiceIdentification><ows:Title>MOCK</ows:Title>'
        '<ows:Fees>mock fees</ows:Fees><ows:AccessConstraints>none</ows:AccessConstraints>'
        '</ows:ServiceIdentification><wfs:FeatureTypeList><wfs:FeatureType><wfs:Name>brw2026:brw2026_vector'
        '</wfs:Name></wfs:FeatureType></wfs:FeatureTypeList></wfs:WFS_Capabilities>')


class H(BaseHTTPRequestHandler):
    def do_GET(self):
        q = {k.lower(): v[0] for k, v in parse_qs(urlparse(self.path).query).items()}
        req = q.get("request", "").lower()
        if req == "getcapabilities":
            body, ct = CAPS.encode(), "text/xml"
        elif req == "getfeature" and q.get("resulttype") == "hits":
            body, ct = f'<wfs:FeatureCollection numberMatched="{len(FEATS)}" numberReturned="0"/>'.encode(), "text/xml"
        elif req == "getfeature":
            body = json.dumps({"type": "FeatureCollection", "features": FEATS, "numberMatched": len(FEATS),
                               "timeStamp": "mock", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}}}).encode()
            ct = "application/json"
        else:
            body, ct = b"<ExceptionReport/>", "text/xml"
        self.send_response(200)
        self.send_header("Content-Type", ct)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    HTTPServer(("127.0.0.1", port), H).serve_forever()
