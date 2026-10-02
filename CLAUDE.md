# Berlin Research Map

MapLibre map of Berlin for architectural and urban research. The data core is project-neutral; projects (e.g. `02_Vergesellschaftung/`, later Tempelhofer Feld) select layers through map definitions. Status and next steps: `STATUS.md`.

## Structure and commands

- `config/sources.json` is the dataset catalogue: services, licences, fields with DE/EN labels, units, and named views (styles). No project assumptions here.
- `config/maps/<id>.json` is a map definition: which sources, grouping, order, initial view, language. A new project needs only a new file here.
- `python scripts/acquire.py [--layer ID | --map ID]` downloads the WFS into `data/raw/` with a provenance file. Needs network access to `gdi.berlin.de`.
- `python scripts/process.py [--layer ID | --map ID]` writes `data/processed/<id>.geojson`, `<id>.csv` (attribute table) and `<id>.meta.json`.
- `python scripts/serve.py` serves the repo root; the map is at `/web/?map=<id>` (`&lang=en`, `&embed=1`, `&layers=id:view,...`).
- `python tests/smoke.py` runs the pipeline against a mock WFS in a temporary folder; `data/` is not touched.
- Multi-type sources: `source.parts` (each may have its own `base_url`, `rename`, `value`) with `process.combine` = `join` (on `key`) or `concat` (adds `field`). Raw GeoJSON is git-ignored; provenance files are committed.
- `python scripts/export_site.py [--map vergesellschaftung]` copies viewer, vendor, catalogue, map definition and the processed data that map uses into `02_Vergesellschaftung/karte/` (gitignored) for `karte.html`; `--zip` also writes `website-upload.zip`. The website is static and hosted on Strato (upload of `02_Vergesellschaftung/`).
- `web/app.js` reads its paths from `<body data-base data-data data-map>`; one file serves `web/` and the website.
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
- Eigentumskonzentration shares are % of parcel area of residential/mixed land per PLR (not dwellings); municipal companies and cooperatives are subsets of legal persons (Datenformatbeschreibung SenSBW 2025).
- StEP Wohnen 2040 "Neue Stadtquartiere" geometry is schematic: circles of ~900 m radius.
- Wohnatlas 2022 uses 58 Prognoseräume (LOR 2021); earlier years use 60, so years cannot be joined by key.
- Basemap: OpenFreeMap positron style (no key). CARTO tiles need an API key; do not use them.

## 02_Vergesellschaftung (separate project)

Static site: cost and financing model for the socialisation of large Berlin housing companies (Art. 15 GG). German-language content.

- Edit `vergesellschaftung-modell-v37.html`, then run `python3 build_kompakt.py`; `modell-kompakt.html` is generated.
- Edit `quellenbelege.md`, then run `python3 build_quellenbelege.py`; `quellenbelege.html` is generated.
- Model logic and presets: `model-calc.js`. Shared glossary and timeline text: `content.js` (loaded by `include.js`, works from file://).
- Hover explanations on the model pages: `data-term="<glossary term>"` on a label; `tooltips.js` shows the first sentence of the matching glossary entry. Add new terms to the glossary in `content.js`, not as hints in the controls.
- Pages load `style.css`, `model-calc.js`, `content.js` (and on the model pages `tooltips.js`) with `?v=YYYYMMDD` so browsers fetch new versions; after changing one of these files, update the tag in all pages and both build scripts.
- Chart.js 4.4.0 is vendored in `vendor/`. Primary sources are PDFs in `pdf/` with Markdown extractions in `pdf/markdown/`.
- Every number needs a source with page, in the footnotes of `zahlen.html` or in `quellenbelege.md` (page "Die Quellen", ordered by document); quote verbatim only from the original PDF. Log changes in `entwicklungsprotokoll.md`.
