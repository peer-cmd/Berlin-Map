# Berlin Research Map

MapLibre map of Berlin for architectural and urban research. Phase 1 (Bodenrichtwerte 2026) is implemented; Phase 2 (B-Pläne) is a disabled entry in `config/layers.json`.

## Structure and commands

- `config/layers.json` holds services, licences, styles and popup fields. Change behaviour there first.
- `python scripts/acquire.py` downloads the WFS into `data/raw/` with a provenance file. Needs network access to `gdi.berlin.de`.
- `python scripts/process.py` writes `data/processed/<id>.geojson` and `<id>.meta.json`.
- `python scripts/serve.py` serves the repo root; the map is at `/web/`.
- `python scripts/export_site.py` copies app, vendor, config and processed data into `02_Vergesellschaftung/karte/` (gitignored) for `karte.html`. The website is static and hosted on Strato (SFTP upload of `02_Vergesellschaftung/`).
- `web/app.js` reads its paths from `<body data-config data-data>`; one file serves `web/` and the website. UI language is German.
- `python tests/smoke.py` runs the pipeline against a mock WFS and overwrites `data/` with mock output. Run acquire and process again afterwards.
- Python standard library only. MapLibre 5.24 is vendored in `web/vendor/`.

## Rules

- Never invent endpoints or fields. Check the live service (GetCapabilities, DescribeFeatureType) before using them.
- Never digitise features by hand; all geometry comes from the services.
- Keep provenance: every processed file traces to a raw download via `meta.json`.
- Return only changed sections when editing; reuse existing CSS classes and config keys.
- Titles and labels are factual and descriptive.

## Known facts (verified 2026-10-01)

- BRW WFS: `https://gdi.berlin.de/services/wfs/brw2026`, type `brw2026:brw2026_vector`, 1623 features, EPSG:4326 requested, licence dl-de-zero-2.0.
- B-Plan WFS: `https://gdi.berlin.de/services/wfs/bplan`, types `bplan:b_bp_fs` (2846), `a_bp_iv`, `c_bp_ak`.
- Basemap: OpenFreeMap positron style (no key). CARTO tiles need an API key; do not use them.
