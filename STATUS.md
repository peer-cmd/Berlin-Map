# STATUS

## Last completed (2026-10-01)

- Steps 0–2: catalogue `config/sources.json` + map definitions `config/maps/`; viewer with DE/EN, grouped layers, view selector, stepped/categorical styles, points, legend, downloads, embed mode, OpenFreeMap.
- Colours: values use one-family ramps (earth = money, violet = ownership, plum = social, ink = density); categories use Grootens-style named colours. Land-use view colours not final (Peer: "leave it for now").
- Step 3: 13 new sources acquired and processed (all verified live): Eigentumskonzentration 2025 (6 types joined on `plr_schl`), LWU parcels, Erhaltungsgebiete (Milieuschutz + städtebauliche Eigenart), Vorkaufsrecht, Sanierungsgebiete, Entwicklungsbereiche, Großsiedlungen, StEP Wohnen 2040 quarters + housing-potential points, MSS 2025, Wohnatlas 2022 (5 services joined on `prognoseraum_nummer`), Einwohnerdichte 2025, LOR planning areas.
- Pipeline: multi-part sources (`parts`, `process.combine` join/concat), key aliases (`plr_id`, `pgr_id`), `simplify_m`, `precision`, `keep_fields` (CSV keeps all fields). Raw GeoJSON no longer in git; provenance files are.
- Viewer: lazy loading (GeoJSON fetched when a layer is first shown), `render: "outline"` for planning-law areas, point size by category, notes per source, stacking points > outlines > fills.
- Maps: `?map=vergesellschaftung` (website) and `?map=research` (all layers).

- Step 4: merged the website branch (`claude/modest-einstein-vjlgy6`: karte.html, Hintergrund, Impressum, Datenschutz, self-hosted fonts, .htaccess). `karte.html` now loads `?map=vergesellschaftung` with all 14 layers; `scripts/export_site.py --zip` builds `02_Vergesellschaftung/karte/` and `website-upload.zip` (tested unpacked on a static server).

- Step 4a (2026-10-03): viewer groups are collapsible (open if a layer is visible, count when closed); visible layers and views are written to `?layers=` so links reopen the same map; error banners show setup hints (run.bat, update_data.bat) only on localhost/file://, the website shows a reload message.

- Model (2026-10-15): DWE-Studie 2025 (Holm/Thonke/Arpagaus) replaces the DWE draft-law preset; the five positions of `02_Vergesellschaftung` reproduce their sources' own results; `node 02_Vergesellschaftung/pruefung.js` checks them (details in `parameterpruefung.md`, log in `entwicklungsprotokoll.md`).

- Model charts (2026-10-16): the four cashflow/debt charts on the model page are replaced by "Kaufpreis und Finanzierung", "Wohin die Miete geht" and "Schulden und Rücklage" (cost, repayment and financing kept apart; details in `entwicklungsprotokoll.md`).

- Step 4b (2026-10-16): Wohnatlas time series 2004–2022 (source `wohnatlas` replaces `wohnatlas2022`; 23 types, older years matched to the 2022 areas by a grid crosswalk, change views for rent, social housing and municipal share). FNP 2025 as three layers (areas, retail overlay, symbols) in both maps; on the website as group "Flächennutzungsplan 2025". Pipeline: `match: "geometry"`, `derive`, `only_geometry`, `filter`; smoke test covers the crosswalk.

- Colours (2026-10-16): model charts in print colours after three test palettes (see `02_Vergesellschaftung/entwicklungsprotokoll.md`); FNP areas: residential in pink steps W1–W4, other building land in greys, green and water pale. Site interface unchanged.

## Next

5. Tempelhofer Feld map (`config/maps/tempelhofer-feld.json`): BRW time series, B-Pläne, FNP 2025 (mixed polygon/point geometry, needs handling), Grünanlagen, Klimaanalyse 2022, StEP Wohnen. Verify each service first.

## Open

- Website: GitHub Pages from `main`, https://peer-cmd.github.io/Berlin-Map/02_Vergesellschaftung/index.html. Changes go live after merging into `main`.
- Model source still missing: full AG Sozialisierung 2021 report (financing behind the 17 Mrd € claim of Gerhardt/Holm); the uploaded Gerhardt 2021 slides do not contain it.
- Einwohnerdichte GeoJSON is 12.5 MB (26,613 blocks); loads only on demand. Vector tiles if it feels slow.
- Not yet included: Denkmale (9,578), StEP Vorrangkulisse Innenentwicklung.
- Wohnatlas colours are a first draft.

## Open: colour logic for model charts (continue in next chat)

Live on the website (since 2026-10-16, PR #33): model charts in palette "A2" (`model-calc.js`): repayment cyan `#00A0E3`, interest pink `#FF3D8B`, surplus yellow `#FFE500`, deficit dark magenta `#9C0059`, Land equity orange `#FF8A1E`, bank loan violet `#6E62D6`, bond light violet `#B8B2E8`, operating costs grey. FNP: housing pink W1–W4, other building land grey. Site interface (`style.css`, turquoise) must stay unchanged.

Peer's feedback so far:
- Pink/magenta across all charts reads like a "feminist site"; pink is fine only for housing (FNP).
- The large violet/blue areas (bank loan, bond) in "Kaufpreis und Finanzierung" and "Schulden und Rücklage" are too much.
- Wants red, yellow, blue, green, in the spirit of Joost Grootens, and above all a coherent logic: every colour one meaning across all charts (and map).

Tested and rejected or open (renders made by injecting colours into `Chart.instances` in a headless browser; images not kept):
- A/B/C (print colours / grey with two signals / ultramarine–vermilion–lime), A2 = A with dark-magenta deficit (applied).
- G1/G2: primary colours (repayment green, interest red, surplus yellow, deficit dark red, equity orange, loans dark blue or light blue): "right direction", but large blue area disliked.
- K1–K3: loans light grey, sand, black: "try harder".
- P1–P4: loans as structure instead of colour (outline, black dot screen, dark-blue dot screen, hatching); own money solid, borrowed money open.

Grootens (sources: Domus 2013 interview, Eye 2010, Atlas of the Copenhagens): Pantone spot inks incl. fluorescent and metallic; two palettes (strong foreground, light background); colour coding stays constant through a book; blue/green dot patterns for transitions.

Next: derive the palette from a meaning system first (e.g. money in / money out / owed / owned; Land vs. AöR vs. tenants), then assign colours, then test all five charts and the FNP together.
