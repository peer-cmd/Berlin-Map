# Berlin Research Map

Browser map of Berlin built with MapLibre GL JS 5.24 (vendored in `web/vendor`, BSD-3). Phase 1 shows the Bodenrichtwerte 01.01.2026.

## Windows setup

1. Install Python 3.8 or newer from python.org (tick "Add python.exe to PATH"). No other packages are needed.
2. Double-click `update_data.bat`. It downloads the WFS data and processes it.
3. Double-click `run.bat`. The map opens at http://127.0.0.1:8000/web/. Opening `index.html` directly does not work (browsers block local `fetch`).

Re-run `update_data.bat` whenever the data should be refreshed. Each download is kept in `data/raw/` with a provenance file.

## Website (Strato)

The map is published as `02_Vergesellschaftung/karte.html`, linked as "Karte" in the site navigation. Strato serves static files only, so the map assets are copied into the site folder:

1. `update_data.bat` ends with `scripts/export_site.py`, which writes `02_Vergesellschaftung/karte/` (app, MapLibre, `layers.json`, GeoJSON, `meta.json`). The folder is build output and not tracked in git. The export refuses mock data from `tests/smoke.py`.
2. Upload the contents of `02_Vergesellschaftung/` by SFTP (e.g. FileZilla, host and login from the Strato customer area), including `.htaccess`, `fonts/`, `vendor/` and `karte/`. Do not upload `vergesellschaftung-modell-v37.html` (replaced by `modell-kompakt.html` plus `hintergrund.html`), `archive/`, `pdf/`, `Bibliography/`, the `.bib` file and the `.md` files.
3. Check after the first upload: the GeoJSON response should carry `Content-Encoding: gzip` (set in `.htaccess`, about 1 MB instead of 5.4 MB).

Fonts and Chart.js are served from the site itself (`fonts/`, `vendor/`). The only third-party request is the basemap on `karte.html` (`tiles.openfreemap.org`), declared in `datenschutz.html`. `impressum.html` and `datenschutz.html` are linked from every page footer and from the map panel.

## Layout

| Path | Role |
|---|---|
| `config/layers.json` | Single source of truth: services, licences, class breaks, colours, popup fields, basemap |
| `scripts/acquire.py` | WFS download, count check, raw file plus provenance (URLs, SHA-256, licence text from the service) |
| `scripts/process.py` | Validation, coordinate rounding, size-ordered features, output to `data/processed/` |
| `scripts/serve.py` | Local web server |
| `scripts/export_site.py` | Copies the map into `02_Vergesellschaftung/karte/` for upload |
| `web/` | Frontend, reads only `config/` and `data/processed/` |
| `tests/` | Mock WFS and `smoke.py` (offline pipeline test; writes mock files into `data/`, so run `update_data.bat` afterwards) |

## Data (verified 2026-10-01)

- Service: `https://gdi.berlin.de/services/wfs/brw2026`, WFS 2.0.0, feature type `brw2026:brw2026_vector`, 1623 features, MultiPolygon, native CRS EPSG:25833. The scripts request `srsName=EPSG:4326`, so the server reprojects and GDAL is not needed.
- Attributes: `bezirk, brw (€/m²), nutzung, stichtag, anwert, verfahrensart, gfz, beitragszustand, lumnum, brwid`.
- Licence: Datenlizenz Deutschland – Zero – 2.0 (dl-de-zero-2.0), no access restrictions per the service capabilities. Publisher: Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin.
- Basemap: OpenFreeMap positron vector style (OpenMapTiles, OpenStreetMap data), no key. Attribution comes with the style. Change `basemap.style` in `config/layers.json` to switch provider.

## Phase 2: B-Pläne (not implemented)

`config/layers.json` already holds a disabled entry `bplan_festgesetzt`. Service `https://gdi.berlin.de/services/wfs/bplan` (WFS 2.0.0) offers `bplan:b_bp_fs` (festgesetzt, 2846 features), `bplan:a_bp_iv` (im Verfahren) and `bplan:c_bp_ak` (außer Kraft). Attributes of `b_bp_fs` include `planid, planname, planartname, verfahrensart, bezirk, bp_rechtsstand, festsg_am, url_www, scan_www, inhalt`. To activate: set `enabled` to true, add `style` and `popup` blocks, check the licence text, run `update_data.bat`. The scripts and frontend handle layers generically. Open points: geometry type is declared generic, and the frontend currently supports the stepped colour style only (a categorical style needs adding).

## Larger data later

If a layer grows beyond a few MB, convert to vector tiles with tippecanoe or GDAL's MVT driver and swap the GeoJSON source for a `vector` source; nothing else changes.
