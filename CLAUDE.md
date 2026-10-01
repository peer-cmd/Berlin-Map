# Berlin Research Map

MapLibre map of Berlin for architectural and urban research. The data core is project-neutral; projects (e.g. `02_Vergesellschaftung/`, later Tempelhofer Feld) select layers through map definitions. Status and next steps: `STATUS.md`.

## Structure and commands

- `config/sources.json` is the dataset catalogue: services, licences, fields with DE/EN labels, units, and named views (styles). No project assumptions here.
- `config/maps/<id>.json` is a map definition: which sources, grouping, order, initial view, language. A new project needs only a new file here.
- `python scripts/acquire.py [--layer ID | --map ID]` downloads the WFS into `data/raw/` with a provenance file. Needs network access to `gdi.berlin.de`.
- `python scripts/process.py [--layer ID | --map ID]` writes `data/processed/<id>.geojson`, `<id>.csv` (attribute table) and `<id>.meta.json`.
- `python scripts/serve.py` serves the repo root; the map is at `/web/?map=<id>` (`&lang=en`, `&embed=1`, `&layers=id:view,...`).
- `python tests/smoke.py` runs the pipeline against a mock WFS in a temporary folder; `data/` is not touched.
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
- Basemap: OpenFreeMap positron style (no key), configured in `config/sources.json` → `basemaps`. Do not use CARTO.
- Catalogue: CSW `https://gdi.berlin.de/geonetwork/srv/ger/csw` lists 663 WFS services. Verified for later steps (all dl-de-zero-2.0 unless noted): `eigentumstruktur` (6 types, 542 PLR, field `plr_schl`), `lwu` (`lwu:lwu_fls`, 5544 parcels), `erhaltungsverordnungsgebiete` (`erhaltgeb_em` 82, `erhaltgeb_es` 94), `vorkaufsrechtsverordnungen` (5), `grosssiedlungen` (83), `wa_01/04/05/07/10_*` (Wohnatlas, 58–60 Prognoseräume, one type per year), `mss_2025` (542 PLR, field `plr_id`), `lor_2021` (CC-BY 3.0, Amt für Statistik), `sanier`, `entwicklungsbereiche`, `denkmale` (9578), `fnp_2025` (6641), `step_wo_2040`, `brw2002`–`brw2025`.
