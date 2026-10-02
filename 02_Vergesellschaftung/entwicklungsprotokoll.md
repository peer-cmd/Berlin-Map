# Entwicklungsprotokoll — Vergesellschaftungsmodell

Läuft parallel zur Datei, damit Entscheidungen auch in einer neuen Konversation nachvollziehbar sind, ohne den ganzen HTML-Code neu zu lesen.

## Aktueller Stand

- **Aktuelle Datei:** `vergesellschaftung-modell-v37.html` (einzige Version im Hauptordner)
- **Archiv:** `archive/` — alle Vorversionen (v13–v36, plus die drei frühesten Entwürfe `vergesellschaftung-modell.html`, `_1`, `_3`), aufgehoben zum Diff, nicht mehr aktiv gepflegt
- **Quellen:** `pdf/` — Primärquellen (Expertenkommission 2023, Rechnungshof/BBU-Gutachten, Bernt/Holm-Studie, DWE-Band, Becker 2024, OECD, Sodan-Rechtsgutachten)

## 2026-07-20 — Fix: Verkehrswert vs. Entschädigungsquote

**Fehler:** Die vier Modell-Presets (Faire-Mieten/DWE, Bernt/Holm, Rechnungshof, Gegenmodell) hatten unterschiedliche `price`-Werte (€/m² Verkehrswert) bei einheitlichem `purchaseFactor` (100 %). Das war konzeptionell falsch: Der Verkehrswert (§ 194 BauGB) ist eine objektive Bewertungsgröße und unterscheidet sich nicht je nach politischer Position. Was sich unterscheidet, ist die **Entschädigungsquote** — der Anteil des Verkehrswerts, der tatsächlich gezahlt werden soll. Das ist genau die im Abschlussbericht der Expertenkommission dokumentierte Streitfrage (Mehrheitsvotum: Entschädigung auch unterhalb des Verkehrswerts zulässig; Sondervotum: voller Verkehrswert erforderlich).

**Fix:** Einheitlicher Verkehrswert von 2.085 €/m² (Rechnungshof-Schätzung, „verkehrswertnah") für alle vier Presets. Die ursprünglich recherchierten Gesamtkompensations-Summen (Faire-Mieten ≈ 14 Mrd €, Bernt/Holm ≈ 24 Mrd €) wurden erhalten, indem die Entschädigungsquote entsprechend gesenkt wurde — nicht der Verkehrswert:

| Preset | vorher (price / Quote) | nachher (price / Quote) | Gesamtkompensation |
|---|---|---|---|
| Faire-Mieten-Modell (DWE) | 897 €/m² / 100 % | 2.085 €/m² / 43,0 % | ≈ 14,0 Mrd € (unverändert) |
| Bernt/Holm (empirisch) | 1.538 €/m² / 100 % | 2.085 €/m² / 73,8 % | ≈ 24,0 Mrd € (unverändert) |
| Rechnungshof (verkehrswertnah) | 2.085 €/m² / 100 % | unverändert | ≈ 32,5 Mrd € |
| Gegenmodell (IW/Empirica) | 2.085 €/m² / 100 % | unverändert | ≈ 32,5 Mrd € |

Rechenweg: neue Quote = alter price / 2.085 × 100 (z. B. 897/2.085 = 43,0 %). Die Gesamtsumme (Bestand × Ø Größe × Verkehrswert × Quote) bleibt dadurch exakt gleich — nur die Aufteilung in „Wert" und „Quote" ist jetzt korrekt.

**Nebenkorrektur:** Der Regler für die Entschädigungsquote hatte `min="50"`, wodurch der 43-%-Wert beim Setzen auf 50 % geklemmt worden wäre (der Code liest den Zustand aus dem Reglerwert zurück, s. Zeile ~1285 `state.purchaseFactor = +$('purchaseFactor').value`). Min auf 40 gesetzt; ebenso die Schrittweite der Sensitivitäts-Chart (`pfSteps`) von 50–100 auf 40–100 erweitert, damit der Marker für das Faire-Mieten-Preset sichtbar bleibt.

**Korrektur (war falsch):** „Gegenmodell (IW/Empirica 2026)" ist doch belegt — `pdf/Gutachten-Auswirkungen-der-Vergesellschaftung-privater-Wohnungsunternehmen-in-Berlin.pdf` (Deschermeier/Voigtländer, IW Köln, im Auftrag von Berliner Sparkasse/Volksbank/DKB/IBB, Köln 2026). Deckt sich mit dem Code-Preset: Risikoprämien-Argument bei Entschädigung unter Marktwert ist zentrales Thema dieses Gutachtens.

**Neuer offener Punkt aus diesem Gutachten:** Es zitiert für das Faire-Mieten-Modell eine Gesamtsumme von **8–11 Mrd €** (Holm et al., 2025) — abweichend von den ≈14 Mrd €, die im `linke`-Preset-Kommentar stehen. Ebenso nennt es die amtliche Kostenschätzung des Senats mit **29–39 Mrd €**, während an anderer Stelle in v37 „29–36 Mrd €" steht. Nicht korrigiert, da unklar ist, welche Quelle/Version hier massgeblich sein soll — mit Peer abzuklären.

## 2026-07-20 — Chart-Review

11 Charts durchgesehen (Jahres-Cashflow, Kumulierter Cashflow, Restschuld, Kapitalposition, Szenario-Übersicht, Zinssensitivität, Entschädigungsquote-Sensitivität, Mietniveau, Bestandsentwicklung, Zunahme Sozialwohnungen, Mieteinsparung). Jedes bildet eine eigene Frage ab (z. B. jährlicher vs. kumulierter Cashflow; reine Restschuld vs. Netto-Vermögensposition inkl. Bestand+Cashflow). Keine Dopplung gefunden — Entscheidung: alle 11 bleiben.

## 2026-07-20 — Website: Übersicht + Zahlen-Erklärung

Auf Wunsch drei verlinkte Seiten mit gemeinsamem Stylesheet (`style.css`, aus dem bisherigen Inline-`<style>` von v37 extrahiert) statt einer einzelnen Modell-Datei:

- `index.html` — Landingpage/Übersicht, neutral-dokumentarischer Ton, verlinkt Modell und Zahlen-Seite.
- `vergesellschaftung-modell-v37.html` — unverändertes Modell, jetzt mit `<link rel="stylesheet" href="style.css">` statt Inline-CSS, plus Nav-Leiste oben.
- `zahlen.html` — erklärt die Zahlen aus dem Modell in normaler Sprache mit leichter Quellenangabe (Kurzverweis, z. B. „BBU-Sodan, S. 68"); Grundlage ist `quellenbelege.md`, das die volle Beleglage behält.

Gemeinsame Navigation (`.site-nav`) oben auf allen drei Seiten. `style.css` enthält jetzt auch generische Klassen für Prosa-Seiten außerhalb des Modell-Tools (`.cta`, `.cta-row`, `sup.src`), damit `index.html`/`zahlen.html` dieselbe Optik ohne eigenes CSS nutzen können.

## 2026-07-20 — Glossar-Einzelseite + kompakte Modellansicht

Zwei weitere Seiten, auf Wunsch:

- `glossar.html` — Glossar als eigenständige Seite (Inhalt 1:1 aus dem Glossar in v37 übernommen, dort unverändert stehen gelassen — keine Duplikat-Entfernung, da v37 laut Anweisung nicht inhaltlich verändert werden sollte).
- `modell-kompakt.html` — Kopie von `vergesellschaftung-modell-v37.html` **ohne** die linke Hintergrund-Spalte (`.bg-col`, enthält Einführung/Modelle/Rechnungshof-Bericht/Glossar/Quellen). Gleiche Rechenlogik, gleiche IDs, nur 2-spaltiges Layout (`class="layout no-bg"` statt 3-spaltig) — reines Rechen-Tool für schnelles Durchspielen ohne Scrollen durch Fließtext. `v37.html` bleibt dabei unverändert (bis auf die Nav-Leiste), um Vergleichbarkeit zu erhalten.

Neue CSS-Klasse `.layout.no-bg` in `style.css` (2 statt 3 Grid-Spalten). Nav auf allen fünf Seiten um „Modell (kompakt)" und „Glossar" ergänzt.

## 2026-07-20 — Einheitliche Seitenbreite

Neue CSS-Variable `--content-width` (980px, vorher fest 760px) in `style.css` — bestimmt die Breite von `index.html`, `zahlen.html`, `glossar.html` zentral an einer Stelle. `vergesellschaftung-modell-v37.html` bleibt ausgenommen: die dortige `.bg-col .bg-page`-Regel überschreibt weiterhin auf `max-width:none` (unverändert, spezifischer Selektor gewinnt). `modell-kompakt.html` nutzt `.bg-page` gar nicht mehr (Spalte entfernt) und war durch das `.app`-Raster (1440px) bereits breiter — für diese Seite ändert sich nichts, es gab nichts zu begrenzen.

## 2026-07-20 — Seitenbreite nachjustiert, Modell-kompakt einbezogen

`--content-width` von 980px auf 820px reduziert („ein bisschen mehr als 760, nicht so viel wie 980"). Zusätzlich `modell-kompakt.html` in die Breitenvorgabe aufgenommen (war zuvor ausgenommen): `<div class="app">` trägt dort jetzt die Klasse `narrow`, die in `style.css` `.app.narrow{max-width:var(--content-width);}` auslöst und das Grid auf eine Spalte umstellt (`.app.narrow .layout{grid-template-columns:1fr;}` — dieselbe Umstellung, die vorher nur bei schmalen Bildschirmen per `@media`-Regel griff, jetzt unabhängig von der Fenstergröße). `vergesellschaftung-modell-v37.html` bleibt bewusst ohne diese Klasse und behält sein breites 3-Spalten-Raster.

## 2026-07-20 — Korrektur: Modell-kompakt bleibt breit

Rückgängig gemacht: `modell-kompakt.html` sollte doch nicht auf `--content-width` (820px) beschränkt werden — die zweispaltige Nebeneinander-Darstellung von Reglern und Ergebnissen ist wichtiger als einheitliche Seitenbreite. `class="narrow"` wieder entfernt, `.app.narrow`-Regeln aus `style.css` wieder gelöscht (nicht mehr verwendet). `modell-kompakt.html` nutzt wieder das normale `.app`-Raster (bis 1440px) mit den zwei Spalten nebeneinander. Die Breitenvorgabe von 820px gilt damit nur noch für `index.html`, `zahlen.html`, `glossar.html`.

## Ordnerstruktur (Referenz)

```
08_Vergesellschaftung/
├── index.html                           ← Landingpage
├── zahlen.html                          ← Zahlen erklärt (reader-friendly)
├── glossar.html                         ← Glossar als Einzelseite
├── vergesellschaftung-modell-v37.html   ← vollständiges Modell (mit Hintergrundspalte)
├── modell-kompakt.html                  ← dieselbe Modell-Logik ohne Hintergrundspalte
├── style.css                            ← gemeinsames Stylesheet aller Seiten
├── quellenbelege.md                     ← volle Beleglage mit Seitenzahlen
├── entwicklungsprotokoll.md             ← diese Datei
├── archive/                             ← v13–v36 + frühe Entwürfe
└── pdf/                                 ← Primärquellen
```

## 2026-09-06 — Architektur-Refactor: geteilte Includes; Rechnungshof-Quelle ergänzt

**Anlass:** Glossar und Zeitlicher-Ablauf-Block existierten wortgleich (aber mit driftendem Inhalt) in bis zu drei Dateien; die Rechenlogik existierte identisch, aber unabhängig kopiert, in `vergesellschaftung-modell-v37.html` und `modell-kompakt.html`. Jede künftige Korrektur musste sonst mehrfach von Hand nachgezogen werden — genau das war beim Sondervotum-Wortlaut bereits passiert (in `glossar.html`/`zahlen.html` korrigiert, in v37 nicht).

**Architektur-Fix:**
- `model-calc.js` — die komplette Rechen-/Chart-Logik aus v37 extrahiert (897 Zeilen, war in v37 und `modell-kompakt.html` identisch dupliziert). Beide HTML-Dateien laden sie jetzt per `<script src="model-calc.js">`.
- `glossary-content.html` — das Fach-Glossar (27 Einträge) als eigene Datei. `glossar.html` und v37 laden es per `<div data-include="glossary-content.html">`.
- `timeline-content.html` — der „Zeitlicher Ablauf"-Absatz als eigene Datei (index.html hatte die aktuellere Version inkl. 2026-Zeile, v37 nicht). Beide Seiten laden ihn per Include.
- `include.js` — kleiner gemeinsamer Loader (`fetch()` + `innerHTML`) für alle `data-include`-Divs, eingebunden in `index.html`, `glossar.html`, `vergesellschaftung-modell-v37.html`.
- Funktioniert über `http(s)`, nicht verlässlich über `file://` — unkritisch, da das Projekt langfristig veröffentlicht werden soll (mit lokalem Testserver: `python3 -m http.server` im Projektordner, dann `localhost:8899/index.html`).
- **Nicht** zusammengeführt: die längeren, unterschiedlich langen Hintergrundtexte (Einführung/Rechtlicher Rahmen) in `index.html` vs. dem v37-Hintergrund-Tab — das sind bewusst unterschiedlich ausführliche Fassungen für Landingpage vs. Modell-Tab, kein Duplikat.

**Neue Quelle:** Der Rechnungshof-Beratungsbericht (20.02.2024) fehlte bislang komplett im Ordner. Direkter PDF-Download war netzwerkseitig blockiert (Cloud-Umgebung und lokaler Rechner); stattdessen über Web-Fetch verifiziert und dokumentiert in `pdf/markdown/Rechnungshof_2024_Beratungsbericht-Vergesellschaftung.extract.md`. Dabei drei bestehende Ungenauigkeiten in v37 aufgedeckt und korrigiert:
1. Das „S. 23"-Zitat zur 11-Mrd.-Schwelle sitzt tatsächlich auf **S. 16**, mit anderem Wortlaut.
2. Der „700 Mio. €"-Zuschussbedarf ist die untere Grenze einer **700-Mio.–1-Mrd.-€-Spanne über zehn Jahre**, kein fixer 30-Jahres-Wert.
3. Die zitierten **2,20 €/m²/Monat** Bewirtschaftungskosten finden sich im Bericht nicht — dort stehen 17,18 €/m² (Instandhaltung) + 3,60 €/m² (Betriebskosten), beide **pro Jahr**. Ersetzt; die planwirtschaft.works-Anekdote zur „55-Cent-Lücke" war an die falsche Zahl gebunden und wurde entfernt.

**Weitere Inhalts-Fixes (aus `quellenbelege.md` §9, jetzt in v37 nachgezogen):**
- 29–36 vs. 29–39 Mrd. € im Abschnitt „Entschädigungsspanne" erklärt (Entschädigung allein vs. inkl. Erwerbsnebenkosten — kein Widerspruch).
- Kommissionskritik am Rechnungshof (Expertenkommission-Abschlussbericht, S. 60, § 202) im Abschnitt „Der Bericht des Landesrechnungshofs" ergänzt.
- Sondervotum-Wortlaut war bereits über den Glossar-Include vereinheitlicht (s. o.).
- `zahlen.html` aktualisiert: „Offene Punkte" auf den verbleibenden Punkt reduziert (Bericht liegt weiterhin nur als Web-Fetch-Extraktion vor, nicht als lokale PDF).

**Verifiziert:** Alle fünf Seiten unter einem lokalen Testserver (`python3 -m http.server`) mit HTTP 200 geladen, alle vier geteilten Dateien (`model-calc.js`, `include.js`, `glossary-content.html`, `timeline-content.html`) erfolgreich ausgeliefert; öffnende/schließende `<div>`-Tags in allen fünf Dateien ausgeglichen; die für `model-calc.js` benötigten Element-IDs (`chartCashflow`, `units`, `verdictText`) in v37 und `modell-kompakt.html` vorhanden. Ein Sichttest im echten Browser (Regler bewegen, Charts prüfen) steht noch aus.

**Offen:**
- Rechnungshof-Bericht liegt weiterhin nicht als lokale PDF vor (nur Web-Fetch-Extraktion) — bei Gelegenheit direkt herunterladen und `pdf_to_markdown.py`-Pipeline wie bei den anderen neun Quellen durchlaufen lassen.
- Die 80/20-Fremd-/Eigenkapital-Annahme des Rechnungshofs ist im Modelltext erwähnt, aber nicht mit dem Modell-Default (`financing:'kredit'`, kein expliziter Eigenkapitalanteil) abgeglichen.

## 2026-09-06 (Teil 2) — Vier neue PDFs; Selbstkorrektur der Rechnungshof-Zitate

**Anlass:** Peer hat vier neue Dateien in `pdf/` gelegt.

**Verarbeitet, in den Corpus aufgenommen:**
- `rs-beratungsbericht-vergesellschaftung.pdf` — die echte Rechnungshof-PDF (die vorher nur als Web-Fetch-Auszug vorlag). Mit `pdf_to_markdown.py` konvertiert, Extract-Datei neu geschrieben.
- `2025_09_26_dwe_vergesellschaftungsgesetz_2d336724db.pdf` — DWE's aktueller Gesetzentwurf, Stand 26.09.2025 (neuer als die im 2022er Buch enthaltene Fassung).
- `pwc-whitepaper-vergesellschaftung-grosser-wohnungsunternehmen-berlin.pdf` — neue kritische Analyse (Heim/Hackelberg), ähnlich IW Köln/Empirica, mit Fokus auf Bankensicherheiten/internationale Investoren.

**Nicht verarbeitet, mit Peer zu klären:**
- `2026_beratungsbericht_zuwendungen_senkultgz_gesamt.pdf` — ein Rechnungshof-Bericht, aber zu einem anderen Thema (Zuwendungsprüfung bei der Senatsverwaltung für Kultur und Gesellschaftlichen Zusammenhalt). Vermutlich versehentlich hinzugefügt.

**Wichtige Selbstkorrektur:** Die echte Rechnungshof-PDF zeigte, dass meine vorherige "Korrektur" der v37-Zitate (2026-09-06, Teil 1, auf Basis eines Web-Fetch) selbst fehlerhaft war — sie hatte das ursprüngliche, korrekte S.-23-Zitat durch eine ähnliche, aber andere Passage von S. 16 ersetzt. Mit der echten PDF zurückkorrigiert: Das S.-23-Zitat in v37 war von Anfang an wortgenau richtig. Ebenso präzisiert: der Zuschussbedarf ist szenariogenau (29 Mrd. € → 700 Mio. €/Jahr, 36 Mrd. € → 1 Mrd. €/Jahr), nicht die vage Spanne, die ich zuvor daraus gemacht hatte. Die 2,20-€/m²/Monat-Zahl ist kein wörtliches Zitat, aber ein plausibel hergeleiteter Aggregatwert aus den drei S.-25-Einzelposten (jetzt in v37 so gekennzeichnet, nicht mehr entfernt). Details: `quellenbelege.md` Abschnitt 7.

**Wichtiger inhaltlicher Fund, noch nicht ins Modell übernommen (Entscheidung bei Peer):** Der 2025er DWE-Gesetzentwurf verwendet ein **Sachwertverfahren** mit auf 2011–2013 eingefrorenem, nur mit 3,5 %/Jahr fortgeschriebenem Bodenwert — strukturell anders als die Verkehrswert-×-Quote-Logik des Modells — sowie Zahlung über 100-jährige Schuldverschreibungen statt bar, und eine Bestandsgröße von ≈220.000 statt 240.000 Wohnungen. Details und Optionen: `quellenbelege.md` Abschnitt 10.

**Noch offen:**
- DWE-Factsheet (mit den Zahlen 40–60 %, 14,5–17,0 Mrd. €) ist noch nicht im Ordner, nur per URL referenziert.
- Ob/wie das Modell die 2025er Gesetzentwurf-Parameter aufnehmen soll — Preset aktualisieren, fünften Preset ergänzen, oder nur im Hintergrundtext erwähnen.

## 2026-09-16 — Fünftes Preset: DWE-Gesetzentwurf 2025

Auf Wunsch als eigenständiges fünftes Preset umgesetzt (Alternative zu Update des bestehenden „Faire-Mieten"-Presets oder reiner Hintergrundtext-Erwähnung — s. `quellenbelege.md` Abschnitt 10).

**Geändert:**
- `model-calc.js` — neues Preset `dwe2025` (units 220.000, purchaseFactor 50 %, term/rateResetYears 100 Jahre bei 3,5 % Zins, baseRent 3,70 wie „Faire-Mieten"); in `presetOrder` für den Szenario-Vergleichs-Chart ergänzt.
- `vergesellschaftung-modell-v37.html`, `modell-kompakt.html` — Preset-Button ergänzt; Regler „Kreditlaufzeit" (`term`, war max 40) und „Zinsbindung" (`rateResetYears`, war max 30) auf max. 100 Jahre erweitert, um die 100-jährige Anleihen-Annäherung überhaupt einstellen zu können. Bestehende vier Presets bleiben unverändert (alle Werte lagen ohnehin innerhalb der alten Obergrenzen).
- `index.html` — „vier" → „fünf" Positionen, neues Preset benannt.
- `zahlen.html` — neue Tabellenzeile im Kosten-Vergleich; „vier" → „fünf" im Einleitungstext.
- `quellenbelege.md` — Abschnitt 10.1 mit vollständiger Parameterableitung (Herkunft jeder Zahl, was bewusst nicht 1:1 nachgebildet wurde).

**Bewusste Vereinfachung (dokumentiert in `quellenbelege.md` 10.1):** Der reale Gesetzentwurf zahlt über eine endfällige 100-jährige Anleihe, nicht über einen amortisierenden Kredit; das Modell kennt nur Letzteres. Eine 100-Jahres-Annuität bei 3,5 % liegt rechnerisch nahe an reinem Zins (≈3,6 %/Jahr) und ist damit innerhalb jedes darstellbaren Zeithorizonts (≤ 50 Jahre) eine nahe Annäherung — aber keine exakte Nachbildung. Eine echte endfällige Finanzierungsart wurde nicht implementiert (hätte Änderungen im Rechenkern statt nur im Preset erfordert).

**Noch offen (unverändert):**
- DWE-Factsheet weiterhin nicht im `pdf/`-Ordner (nur per URL referenziert).
- `2026_beratungsbericht_zuwendungen_senkultgz_gesamt.pdf` — vermutlich versehentlich hinzugefügtes, themenfremdes PDF — noch mit Peer abzuklären.
- Sichttest im echten Browser (Regler bewegen, Charts prüfen) seit dem Include-Refactor (2026-09-06) weiterhin ausstehend.

## 2026-10-01 — Neue Seite „Karte" (Bodenrichtwerte 2026)

- `karte.html` — Bodenrichtwerte 01.01.2026 als interaktive Karte (MapLibre), in der Navigation aller Seiten als „Karte" verlinkt. Daten: WFS `brw2026` der Senatsverwaltung, dl-de-zero-2.0; Grundkarte OpenFreeMap.
- `karte/` — Build-Ausgabe von `scripts/export_site.py` im Repo-Wurzelordner (nicht in git). Wird nach jeder Datenaktualisierung neu erzeugt (`update_data.bat`).
- `.htaccess` — gzip und Cache-Header für Strato; `style.css` um `.map-page`/`.map-wrap` ergänzt.
- Hosting: Strato, Upload des Ordners per SFTP.

**Offen:** Datenschutzerklärung muss die Kachelabrufe bei `tiles.openfreemap.org` nennen; Impressum für die öffentliche Seite.

## 2026-10-01 (Teil 2) — Website: nur Kompaktmodell, Seite „Hintergrund", Impressum, Datenschutz

- Navigation: Übersicht · Modell (`modell-kompakt.html`) · Hintergrund · Die Zahlen erklärt · Glossar · Karte. `vergesellschaftung-modell-v37.html` bleibt im Ordner, wird aber nicht mehr verlinkt und nicht hochgeladen; alle Links zeigen auf `modell-kompakt.html`.
- `hintergrund.html` — die Hintergrundspalte aus v37: Rechtlicher Rahmen, Wie das Modell rechnet (inkl. nicht abgebildeter Faktoren, Ertragswert/Vergleichswert, Bestand, Entschädigungsspanne, Bernt & Holm), Bericht des Landesrechnungshofs, Quellen. Einführung/Zeitlicher Ablauf (schon auf `index.html`) und Glossar (schon `glossar.html`) nicht doppelt.
- `impressum.html` (§ 5 DDG, § 18 Abs. 2 MStV) und `datenschutz.html` (Hosting STRATO, OpenFreeMap auf der Karte, E-Mail, Betroffenenrechte), verlinkt im Seitenfuß aller Seiten und im Kartenpanel. Die alten Impressum-Zeilen (§ 5 TMG/RStV, Gmail-Adresse) im Modell entfernt.
- Google Fonts und Chart.js 4.4.0 lokal (`fonts/`, `vendor/`); einzige Fremdanfrage ist die Grundkarte auf `karte.html`.

**Offen:** STRATO-Firmenname (GmbH) und E-Mail-Domain `peerfrantzen.com` prüfen; Auftragsverarbeitungsvertrag mit STRATO im Kundenlogin abschließen (die Datenschutzerklärung setzt ihn voraus). `index.html` und `zahlen.html` verweisen noch auf `pdf/`, `quellenbelege.md` und `entwicklungsprotokoll.md`, die nicht hochgeladen werden.

## 2026-10-01 — Layout und Inhalt „Die Zahlen erklärt"; Includes ohne fetch; Quellenbelege als Seite

**Geändert:**
- `style.css` — Tabellen in `.bg-page` umbrechen wieder (globale `th,td`-Regeln mit `nowrap` griffen durch); Masthead auf Index, Zahlen, Glossar an der Textspalte ausgerichtet; Fließtext dieser Seiten im Blocksatz mit Silbentrennung; `sup.src` durch nummerierte Fußnoten (`sup.fn` + `ol.source-list`) ersetzt.
- `zahlen.html` — Fußnoten je Abschnitt; Kostentabelle zeigt jetzt die fünf Modell-Presets (Betrag, Quote, Hintergrund), Senatsschätzung 28,8–36 / 30–39 Mrd. € als Text darunter; eigener Abschnitt Rechnungshof mit den am Original-PDF geprüften Angaben (S. 23: 11-Mrd.-Schwelle, 700 Mio. € bei 29 Mrd. €, 1 Mrd. € bei 36 Mrd. €; S. 25: Bewirtschaftungskosten, 2,20 €/m² als Umrechnung); Arbeitsprotokoll-Formulierungen entfernt; „Offene Punkte" nennt die inhaltlich offenen Fragen aus `quellenbelege.md` Abschnitt 9/10.
- Masthead-Untertitel auf Index, Zahlen, Glossar, Modell (kompakt) entfernt.
- `glossary-content.html`, `timeline-content.html` → `content.js` (`window.SITE_INCLUDES`); `include.js` liest daraus statt per `fetch()`. Seiten funktionieren damit auch per Doppelklick (file://). v37 lud `include.js` bisher gar nicht — Zeitlicher Ablauf und Glossar blieben dort leer; jetzt eingebunden.
- `build_quellenbelege.py` (neu) erzeugt `quellenbelege.html` aus `quellenbelege.md`. Nach jeder Änderung an der .md erneut ausführen. Verlinkt von Zahlen, Index, Glossar.

**Noch offen:**
- `quellenbelege.md` Abschnitt 2 meldet „noch in v37 zu präzisieren" für 29–36 vs. 29–39; v37 trennt beides inzwischen (Abschnitt „Entschädigungsspanne"). Status in der .md nachziehen.

## 2026-10-01 (Teil 2) — Aufräumen: Modelltext, Seitenstruktur, Quellenbelege, Dateien

**Geändert:**
- v37: Szenario-Übersicht „5 Voreinstellungen"/„fünf"; Liste „Entschädigungsspanne" um DWE-Gesetzentwurf 2025 ergänzt; Sondervotum wie in Glossar/Zahlen beschrieben (Verkehrswert als Ausgangspunkt, enge Abschläge; „> 36 Mrd. €, vergleichswertorientiert" entfernt, da ohne Beleg); Spaltenlabel „Hintergründen" → „Hintergrund"; Neuvertragsmiete 15,80 €/m² und „IW Köln — Refinanzierungsrisiken" als ungeprüft gekennzeichnet; Modell-Stand September 2026. Die Kommissionskritik am Rechnungshof stand bereits im Modelltext (Status in `quellenbelege.md` war veraltet).
- `build_kompakt.py` (neu) erzeugt `modell-kompakt.html` aus v37 (ohne Hintergrundspalte). Nur noch v37 bearbeiten, dann Skript ausführen.
- Chart.js 4.4.0 lokal unter `vendor/chart.umd.js` (MIT, Lizenz in `vendor/chart.js-LICENSE.md`), statt CDN.
- Navigation auf allen Seiten um „Quellenbelege" ergänzt; Übersicht listet alle Seiten; Stand Oktober 2026.
- `quellenbelege.md` auf Belege reduziert. Entfernte Prüfstatus-Notizen (alle erledigt): 29–36/29–39 in v37 getrennt; Sondervotum in v37 präzisiert; Kommissionskritik in v37 vorhanden; Rechnungshof-Zitate S. 23 am Original-PDF bestätigt (die Web-Fetch-Fassung hatte S. 16 und S. 23 vermischt — wörtliche Zitate nur aus Original-PDFs übernehmen); 897/1.538 €/m² durch einheitlich 2.085 €/m² ersetzt.
- Gelöscht: `pdf/test_write.txt`, themenfremder Rechnungshof-Bericht `pdf/2026_beratungsbericht_zuwendungen_senkultgz_gesamt.pdf` samt Markdown-Extraktion.
- `My Collection_All.bib` bleibt im Projektordner (Pfad in `Bibliography/scripts/corpus_search.py` erwartet).
- Regler Verkehrswert: Schrittweite 20 → 5 €/m². Bei Schritt 20 (ab 500) rastete 2.085 auf 2.080 ein; alle Presets rechneten dadurch mit 2.080 statt 2.085 €/m² (32,45 statt 32,53 Mrd. € bei 100 %).

## 2026-10-02 — Untertitel im Seitenkopf entfernt

Die Zeile unter der Überschrift im `masthead` entfällt auf allen Seiten: `hintergrund.html`, `impressum.html`, `datenschutz.html` und `modell-kompakt.html` (dort fügte `build_kompakt.py` sie ein; Ersetzung gestrichen, Seite neu erzeugt). Die Zeile „Berlin, Art. 15 GG — Projektübersicht" in `index.html` war bereits entfernt.

## 2026-10-02 — Kein grauer Text

`--muted` und `--faint` stehen in `style.css` und `web/style.css` jetzt auf der Textfarbe `--ink` (#14171A); beide Tokens färben nur Text. In `model-calc.js` setzt `Chart.defaults.color` Achsen- und Legendenschrift auf Schwarz, ebenso die Beschriftung der senkrechten Markierungslinie. Graue Linien in den Diagrammen (CPI, Nulllinie, Raster) bleiben.

## 2026-10-02 — Einleitungssätze gestrichen, Tabelle „Die Zahlen erklärt"

Gestrichen: der Lead-Absatz auf `hintergrund.html` (Verweis auf Übersicht und Glossar) und der Lead-Absatz auf `zahlen.html` (Erklärung der Seite, Verweis auf die Quellenbelege). Tabelle der Entschädigungspositionen: `.bg-page table` ohne `table-layout:fixed`, damit die Spalten nach Inhalt breit werden statt vier gleich breiter Spalten; Betrag und Quote mit neuer Klasse `.num` rechtsbündig und ohne Umbruch. Betrifft auch die Tabelle in `quellenbelege.html`.

## 2026-10-02 — Startseite: Überschriften, Seitenbeschreibungen, Zeitleiste

`index.html`: Überschriften direkt formuliert („Der Volksentscheid", „Der Ablauf seit 2021", „Der rechtliche Rahmen", „Das Projekt"); die zwei Buttons unter dem Einleitungsabsatz und die Überschrift „Seiten" entfallen; Seitennamen mit Artikel („Das Modell" usw.) und ausführlicheren Beschreibungen. Die Kartenbeschreibung nennt jetzt alle Ebenen der Karte (vorher nur Bodenrichtwerte). Zeitleiste in `content.js` als `<dl class="timeline">` (Jahr | Text, zweispaltig mit Abstand); `.timeline-p` entfällt, gilt auch für v37/`modell-kompakt.html`.

## 2026-10-02 — Modellseite: Gruppentitel entfernt, Horizont 50/100 Jahre

Gruppentitel „Voreinstellungen", „Zeithorizont" und „Ergebnisse" entfernt. Betrachtungszeitraum: Standard 50 Jahre (vorher 30), Maximum 100 Jahre (vorher 50); `defaults.horizon` in `model-calc.js` angepasst. Kommentar zum DWE-2025-Preset (100-jährige Schuldverschreibung) auf das neue Maximum aktualisiert.
