# STATUS

## Last completed (2026-10-01)

- Steps 0–2 of the plan: config split into `config/sources.json` (catalogue) and `config/maps/research.json`; pipeline writes GeoJSON + CSV + meta; `--map` option; smoke test isolated in a temp folder.
- Viewer: map definitions, DE/EN, grouped layer list, view selector, stepped and categorical styles, points and lines, legend per visible layer, download links, embed mode, `layers=` parameter, OpenFreeMap with fallback, website colour tokens and IBM Plex fonts.

## Next

3. Socialisation sources into `config/sources.json` (verified list in `CLAUDE.md` → Known facts) and `config/maps/vergesellschaftung.json`; acquire, process, check sizes. Normalise planning-area keys (`plr_schl` / `plr_id`).
4. Website: `02_Vergesellschaftung/karte.html` with nav entry on all pages.
5. Later: `config/maps/tempelhofer-feld.json` (BRW series, B-Pläne, FNP 2025, Grünanlagen, Klimaanalyse 2022, Einwohnerdichte, StEP Wohnen) — verify each service first.

## Open

- How is the website published (GitHub Pages / other host / CMS)? Decides whether `karte.html` points to `../web/` or the map is copied into the site.
- Publishing: exclude `02_Vergesellschaftung/archive/` and `pdf/` (third-party PDFs) from the public site?
- Raw downloads (~6.5 MB each) are committed to git; consider keeping only provenance files in git, as the Actions workflow already does.
