# STATUS

## Last completed (2026-10-01)

- Steps 0–2: catalogue `config/sources.json` + map definitions `config/maps/`; viewer with DE/EN, grouped layers, view selector, stepped/categorical styles, points, legend, downloads, embed mode, OpenFreeMap.
- Colours: values use one-family ramps (earth = money, violet = ownership, plum = social, ink = density); categories use Grootens-style named colours. Land-use view colours not final (Peer: "leave it for now").
- Step 3: 13 new sources acquired and processed (all verified live): Eigentumskonzentration 2025 (6 types joined on `plr_schl`), LWU parcels, Erhaltungsgebiete (Milieuschutz + städtebauliche Eigenart), Vorkaufsrecht, Sanierungsgebiete, Entwicklungsbereiche, Großsiedlungen, StEP Wohnen 2040 quarters + housing-potential points, MSS 2025, Wohnatlas 2022 (5 services joined on `prognoseraum_nummer`), Einwohnerdichte 2025, LOR planning areas.
- Pipeline: multi-part sources (`parts`, `process.combine` join/concat), key aliases (`plr_id`, `pgr_id`), `simplify_m`, `precision`, `keep_fields` (CSV keeps all fields). Raw GeoJSON no longer in git; provenance files are.
- Viewer: lazy loading (GeoJSON fetched when a layer is first shown), `render: "outline"` for planning-law areas, point size by category, notes per source, stacking points > outlines > fills.
- Maps: `?map=vergesellschaftung` (website) and `?map=research` (all layers).

## Next

4. Website: `02_Vergesellschaftung/karte.html` with nav entry on all pages.
5. Tempelhofer Feld map (`config/maps/tempelhofer-feld.json`): BRW time series, B-Pläne, FNP 2025 (mixed polygon/point geometry, needs handling), Grünanlagen, Klimaanalyse 2022, StEP Wohnen. Verify each service first.

## Open

- How is the website published? Decides whether `karte.html` points to `../web/` or the map is copied into the site.
- Publishing: exclude `02_Vergesellschaftung/archive/` and `pdf/` from the public site?
- Einwohnerdichte GeoJSON is 12.5 MB (26,613 blocks); loads only on demand. Vector tiles if it feels slow.
- Panel is long with 15 layers; collapsible groups would help.
- Not yet included: Denkmale (9,578), FNP 2025, Wohnatlas time series (geometry changed 2022: 58 vs 60 areas), StEP Vorrangkulisse Innenentwicklung.
