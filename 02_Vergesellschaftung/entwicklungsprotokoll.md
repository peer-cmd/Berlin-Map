# Entwicklungsprotokoll — Vergesellschaftungsmodell

Läuft parallel zur Datei, damit Entscheidungen auch in einer neuen Konversation nachvollziehbar sind, ohne den ganzen HTML-Code neu zu lesen.

## Aktueller Stand

- **Aktuelle Datei:** `vergesellschaftung-modell-v37.html` (einzige Version im Hauptordner)
- **Archiv:** `archive/` — alle Vorversionen (v13–v36, plus die drei frühesten Entwürfe `vergesellschaftung-modell.html`, `_1`, `_3`), aufgehoben zum Diff, nicht mehr aktiv gepflegt
- **Quellen:** `pdf/` — Primärquellen (Expertenkommission 2023, Rechnungshof/BBU-Gutachten, Bernt/Holm-Studie, DWE-Band, Becker 2024, OECD, Sodan-Rechtsgutachten)

## 2026-10-03 — Die Zahlen: Tabellen einheitlich

Alle Tabellen beginnen mit einer Bezeichnung (Position, Szenario, Posten), dann „Angabe der Quelle“, rechts die Modellwerte („… im Modell“) mit Einheit im Kopf und reinen Zahlen in den Zellen; Näherungen mit „≈“. Bestand und Mieten jetzt je Position in Modellreihenfolge (Bestand mit BBU/Sodan als Vergleichszeile, Spalte „Wohnungen im Modell“). Neue Zeile Rechnungshof in „Die Mieten“: Ausgangsmiete 6,71 €/m² aus `model-calc.js`, als „Modellannahme, Beleg fehlt“ markiert — offen. Keine neuen Quellenzahlen; Fußnotennummern unverändert.

## 2026-10-03 — Modell: Schieberegler-Linie gleichmäßig

Die Linie der Schieberegler war ein 1 px hoher Hintergrund; bei Bildschirm-Zoom ≠ 100 % wurde sie je nach Position 1 oder 2 Gerätepixel dick. Jetzt `border-top` auf der Spur (Browser runden Rahmen auf ganze Pixel). Geprüft bei 100, 125 und 150 %. Versions-Tag `style.css?v=20261003o`.

## 2026-10-03 — Die Zahlen: Zwischentitel violett

h3 auf „Die Zahlen“ (Positionen, „Die Grenzen des Modells“) in derselben Farbe wie die Titel der Chronologie (`--gl-violet`). Versions-Tag `style.css?v=20261003n`.

## 2026-10-03 — Die Chronologie: Volksentscheid 2021

Neuer Eintrag „Volksentscheid“ unter 2021: Ergebnis 57,6 % der abgegebenen Stimmen (Expertenkommission, S. 8, amtliches Endergebnis) und 59,1 % der gültigen Stimmen (DWE 2022, S. 4; Bernt/Holm, S. 5), Wortlaut des Stimmzettels (Expertenkommission, S. 26), Einsetzung der Kommission (S. 8). Zitate am PDF geprüft.

Ergebnis überall einheitlich als „59,1 % der gültigen Stimmen“ (Startseite, Modell, Zeitleiste in `content.js`); vorher nannten Modellseite und Zeitleiste 56,4 % ohne Beleg. Versions-Tag auf `content.js?v=20261003d`.

## 2026-10-03 — Die Zahlen: Positionen als eigene Abschnitte

Neue Reihenfolge: Bestand, Verkehrswert, Kosten, Mieten, Positionen, Rechenweg. Unter „Die Positionen“ je ein kurzer Absatz (h3) für Faire-Mieten-Modell, DWE-Gesetzentwurf, Bernt/Holm, Rechnungshof (mit beiden Tabellen), IW/Empirica, jeweils mit der Annahme des Modells. DWE-Gesetzentwurf aus „Der Rechenweg“, Bernt/Holm aus „Die Kosten im Vergleich“ dorthin verschoben und gekürzt (Satz zur Segregation entfällt). Chart „Die fünf Positionen im Modell“ steht jetzt im Rechenweg, nach der Erklärung der Annahmen. Keine neuen Zahlen; Fußnotennummern unverändert.

## 2026-10-03 — Die Zahlen: Verkehrswert vor die Kosten

„Der Verkehrswert“ steht jetzt zwischen „Der Bestand“ und „Die Kosten im Vergleich“ (auch in der Abschnittsnavigation), damit die gemeinsame Berechnungsgrundlage vor dem Kostenvergleich erklärt ist. Aufzählung der fünf Entschädigungsquoten dort gestrichen (steht in der Positionstabelle); „Die Kosten im Vergleich“ verweist auf den Abschnitt oben. Fußnotennummern unverändert.

## 2026-10-03 — Modell: Chart-Untertitel gekürzt

Untertitel der Charts gestrichen: Hinweise „Markierung zeigt …“ (Zinssatz, Quote), Bernt/Holm-Satz unter Mietersparnis, Erläuterung zum Landesvermögen. Cashflow-Untertitel auf drei Sätze gekürzt.

## 2026-10-03 — Die Zahlen: Mieten und Rechnungshof als Tabellen

„Die Mieten“: Liste → Tabelle (Miete / Angabe der Quelle / Im Modell). „Der Rechnungshof“: Szenarientabelle (Herkunft S. 12 f., Zuschüsse S. 19/23, Ausgangsmieten Ansicht 6, S. 21) und Tabelle der Bewirtschaftungskosten (S. 25, Anhang 1) mit Umrechnung auf €/m² und Monat bei 61 m². Neue Fn. 16. Verweis „(siehe Das Recht)“ unter „Der Verkehrswert“ entfernt. Alle Werte aus `pdf/markdown/rs-beratungsbericht-vergesellschaftung.md` geprüft.

Offen: Rechnungshof datiert die Senatsschätzung auf 2018 (Schreiben vom 23.04.2018), die Schätzungstabelle nennt „Senat 2019“ (nach BBU-Sodan 2019).

## 2026-10-03 — Die Zahlen: Positionstabelle mit Quellenangabe

Tabelle der fünf Positionen zeigt jetzt Angabe der Quelle neben Entschädigungsquote und Entschädigung des Modells (Spalte „Quote (Modellannahme)“ → „Entschädigungsquote (Modell)“). Faire-Mieten-Modell und Rechnungshof-Szenarien aus der Schätzungstabelle entfernt (stehen in der Positionstabelle bzw. unter „Der Rechnungshof“); diese heißt jetzt „Weitere Schätzungen in den Quellen“. Absatz zur Senatsschätzung (29–36 / 29–39) entfernt, Werte stehen in der Tabelle.

Offen: Faire-Mieten-Modell — Quelle 8–11 Mrd. €, Modell ≈ 14 Mrd. € (897 €/m², Herkunft nicht belegt). Bernt/Holm nennen keine Gesamtsumme; ≈ 24 Mrd. € beruht auf 1.538 €/m², Herkunft nicht belegt.

## 2026-10-03 — Chronologie-Titel violett; Glossar-Spalten beginnen mit Buchstaben

Dokumenttitel (h3) in `quellenbelege.html` in der Farbe der Glossarbegriffe: `body.chron-page` (gesetzt in `build_quellenbelege.py`), Farbe `--gl-violet` jetzt in `:root`. Glossar: jeder Buchstabe mit seinen Einträgen in `<section class="gl-group">` (`content.js`), `break-inside:avoid`, so dass Spalten nur zwischen Buchstaben umbrechen. Versionstags: `style.css?v=20261003m`, `content.js?v=20261003c`.

## 2026-10-03 — Einheitliche Namen der fünf Positionen

Kurzname (Schaltflächen, Grafik, Fließtext) / Vollname (Erstnennung, Tabellen): Faire-Mieten-Modell / Faire-Mieten-Modell (DWE 2022); DWE-Gesetzentwurf / DWE-Gesetzentwurf (2025); Bernt/Holm / Bernt/Holm (2023); Rechnungshof / Rechnungshof (2024); IW/Empirica / IW/Empirica (2026). „Gegenmodell“ entfällt (Abschnitt und Sprunglink in `zahlen.html` jetzt „IW/Empirica“, Anker `#iw-empirica`). Einheitliche Reihenfolge nach steigender Quote in Schaltflächen und Grafik. Fußnoten behalten die Zitierform. Interne Preset-Schlüssel (`linke`, `gegenmodell`) unverändert. Versionstag: `model-calc.js?v=20261003f`.

## 2026-10-03 — Die Zahlen: Quelle, Modellannahme, Modellergebnis getrennt

Texte in `zahlen.html` präzisiert: gemeinsame Berechnungsgrundlage (240.000 Wohnungen, 65 m², 2.085 €/m², Quote variiert) als Operation des Modells ausgewiesen; Hinweis, dass die Quellenschätzungen nur eingeschränkt vergleichbar sind; Kasten (`.note-box`) mit den drei Ebenen; Tabellenköpfe und Erläuterungen mit „Quelle:“/„Modell:“. „Konsens aller Lager“ ersetzt; Segregation, Vertrauensbruch, Armutsschwelle, Referenzmiete den Quellen zugeschrieben; „mittig in der Spanne“ (14,9 in 14,5–17,0) korrigiert; „Grenzen des Modells“ mit Satz zu Vergleich statt Prognose, Wohnungsgröße als eigener Absatz.

Offen (nur intern):
- Herkunft von 2.085 €/m² nicht belegt: laut Eintrag unten „Rechnungshof-Schätzung“, in den Markdown-Extraktionen von Rechnungshof und BBU nicht gefunden.
- „Kaufpreise für leerstehende Eigentumswohnungen spielen dafür keine Rolle“ ohne Beleg.
- 65 m² „(DWE/BBU)“: Seitenangabe fehlt.
- Gegenmodell: Zinsaufschlag +0,5 pp ist Modellannahme; das IW-Argument betrifft Entschädigung unter Marktwert, das Preset rechnet aber mit 100 %.

## 2026-10-03 — Die Quellen: eigene Seite

„Die Quellen“ (Liste und Hinweis zu Modellannahmen/Referenzwerten) aus dem Footer von `zahlen.html` auf die neue Seite `quellen.html` verschoben; Sprunglink `#quellen` entfernt. Alle Footer verlinken „Quellen“ vor Impressum und Datenschutz (auch `karte.html`, `build_quellenbelege.py`). CSS `.colophon-sources` entfernt. Versionstag: `style.css?v=20261003l`.

## 2026-10-03 — Die Zahlen: „Die offenen Punkte“ entfernt

Abschnitt und Sprunglink in `zahlen.html` gelöscht. Übernommen: Abbildung des DWE-Gesetzentwurfs (Sachwertverfahren, 50 % auf 2.085 €/m², 100-jährige Schuldverschreibungen als 100-jähriger Kredit) als Absatz unter „Der Rechenweg“; Wohnungsgröße 61 vs. 65 m² unter „Die Grenzen des Modells“. Fußnote 16 (DWE-Gesetzentwurf) ist jetzt 15; die alte Fn. 15 (PwC, aktuellere Mieten) entfällt.

Weiter offen (nur intern):
- DWE-Factsheet (14,5–17,0 Mrd. €, 40–60 %) liegt nicht im Projektordner; belegt nur über das PwC-Whitepaper, Fn. 1–2.
- PwC-Whitepaper (Heim/Hackelberg): Auftraggeber auf den geprüften Seiten nicht angegeben.
- PwC nennt für 2024/25 Bestandsmieten Ø 6,82 €/m² (landeseigene) und 8,39 €/m² (Adler/Vonovia), nach Unternehmensangaben; Modell verwendet weiter Bernt/Holm 6,29 und 7,63 €/m².
- Neuvertragsmiete Ø 15,80 €/m² (Berlin Hyp/CBRE Wohnmarktreport 2026) nicht geprüft, Bericht nicht im Projektordner; ebenso das IW-Gutachten zu Refinanzierungsrisiken.

## 2026-10-03 — Die Zahlen: Quellen in den Footer

In `zahlen.html` steht „Die Quellen“ (Liste und Hinweis zu Modellannahmen/Referenzwerten) jetzt im Footer (`.colophon-sources` innerhalb von `.colophon`), unter den Anmerkungen. Sprunglink `#quellen` bleibt. Versionstag: `style.css?v=20261003k`.

## 2026-10-03 — Das Recht: Verweise auf Die Zahlen entfernt

In `recht.html` drei Verweissätze auf `zahlen.html` (Quoten, Sachwertverfahren/offene Punkte, Szenarien des Rechnungshofs) gelöscht.

## 2026-10-03 — Übersicht: „Der rechtliche Rahmen“ und „Das Projekt“ entfernt

Beide Abschnitte aus `index.html` gelöscht. Der Inhalt von „Der rechtliche Rahmen“ (Art. 14 Abs. 3 vs. Art. 15 GG, fehlende Rechtsprechung, Streitpunkt Verkehrswert) steht bereits ausführlicher und mit Fußnoten in `recht.html`; nichts übernommen.

## 2026-10-03 — Navigation: Glossar hinter Chronologie

In der Navigation aller Seiten (und in `build_quellenbelege.py`) steht „Glossar“ jetzt rechts von „Die Chronologie“. Verweissatz unter dem Glossar in `glossar.html` und Einleitungssatz der Chronologie in `index.html` gelöscht.

## 2026-10-03 — Glossar volle Breite, vier Spalten

`glossar.html` nutzt `.bg-page.full` (ohne `--content-width`); das Glossar steht dort in vier Spalten (`columns:4 220px`, auf schmalen Bildschirmen weniger). Im Modell (v37) bleibt es zweispaltig. Versionstag: `style.css?v=20261003j`.

## 2026-10-03 — Chronologie: Einleitung und „Nicht geprüft" entfernt

In `quellenbelege.md` die Einleitung und den Abschnitt „Nicht geprüft" (Wohnmarktreport 2026, DWE-Factsheet, IW-Gutachten Refinanzierungsrisiken) gelöscht. Der Prüfstatus dieser Quellen steht weiter unter „Die offenen Punkte" in `zahlen.html`.

## 2026-10-03 — Eigene Szenarien unter die Presets

Die Felder „A speichern"/„B speichern" stehen jetzt direkt unter den fünf Preset-Buttons. Gruppentitel „Eigene Szenarien", „Aktuelle Einstellung sichern als:" und der Hinweis zur Vergleichstabelle sind entfernt.

## 2026-10-03 — Chronologie auf der Startseite gekürzt

Einleitung und Einträge der Chronologie in `index.html` auf je einen kurzen Satz gekürzt; Details stehen in `quellenbelege.html`. Defekten Link `zahlen.html#recht` auf `zahlen.html#kosten` korrigiert.

## 2026-10-03 — Quellenhinweise der Mietregler in den Tooltip

Die drei Hinweiszeilen unter „Ausgangsmiete", „Referenz: freier Markt" und „Referenz: kommunale WoGes." stehen nicht mehr dauerhaft im Modell. Sie sind als `data-note` am Label hinterlegt; `tooltips.js` zeigt sie beim Überfahren oder Antippen unter dem Glossarsatz an (Klasse `.term-tip-note`). Versionstags: `style.css?v=20261003i`, `tooltips.js?v=20261003a`.

## 2026-10-03 — „Hintergrund" wird „Das Recht"

`hintergrund.html` heißt jetzt `recht.html` (Navigation: „Das Recht"); alle Links, `build_quellenbelege.py` und die generierten Seiten sind angepasst. Die Seite enthält nur noch rechtliche Themen, mit eigenen Fußnoten: Art. 15 GG und fehlende Rechtsprechung (BBU-Sodan 2019, S. 103; Expertenkommission 2023, S. 127), Mehrheit vs. Sondervotum (aus `zahlen.html` verschoben), Wertermittlung nach ImmoWertV (Expertenkommission 2023, S. 70, Rn. 247 f.), rechtliche Einordnung des Rechnungshof-Berichts (S. 7; § 4, Zitat S. 24) und die Kritik der Expertenkommission (S. 60, Rn. 202). Zitat Art. 15 GG korrigiert („regelt" statt „bestimmt").

Nach `zahlen.html` verschoben: Rechenweg und Grenzen des Modells, Quellenliste mit Referenzwerten, zusätzliche Befunde von Bernt/Holm (neue Fn. 12, S. 4, 6, 11, 14–18). Gestrichen, weil auf „Die Zahlen" belegt vorhanden: Bestand, Entschädigungsspanne, Rechnungshof-Beträge, unbelegte €/m²-Spannen der Wertermittlung und das nicht belegte Zitat zum Liegenschaftszins „zur Bemessung von Enteignungsentschädigungen". Fußnoten in `zahlen.html` neu nummeriert. `quellenbelege.md`: Rechnungshof-Schlussfolgerung am Original auf S. 24 geprüft.

## 2026-10-02 — Voreinstellung „Fester Zeitplan“ aus Bernt/Holm

Der Regler „Fester Zeitplan“ (Die Sozialwohnungen) startet bei 3,2 %/Jahr statt 0. Quelle: Bernt/Holm 2023, S. 13–14: 63 % der Neuvermietungen an WBS-Inhaber*innen (Quote der Landeseigenen) bei 5 % Fluktuation = 6.999 Wohnungen/Jahr; 6.999 / 222.183 ≈ 3,15 %. „Sofort umgewandelt“ und „Aus Überschuss“ bleiben bei 0, da die Quelle die Vergabe nur bei Neuvermietung annimmt. Die fünf Presets setzen `sozialPaceRate: 0`, ihre Ergebnisse bleiben unverändert. Beleg in `quellenbelege.md`, Erläuterung im Glossar (Umwandlungstempo).

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

## 2026-10-02 — Szenario-Übersicht nach „Die Zahlen erklärt", Horizont-Hinweis zum kumulierten Cashflow

Der Hinweis „Nettoergebnis verläuft nicht linear …" steht jetzt in der Unterzeile des Diagramms „Kumulierter Cashflow" (vorher unter dem Horizont-Regler). Das Diagramm „Szenario-Übersicht" ist von der Modellseite nach `zahlen.html` gewandert, direkt unter die Tabelle der fünf Positionen; es rechnet mit den Standardannahmen und 50 Jahren Horizont. `model-calc.js`: Aufbau und Aktualisierung des Diagramms als `initScenarioChart()`/`updateScenarioChart()`; `presets` vor die Event-Bindungen verschoben; auf Seiten ohne Regler zeichnet das Skript nur dieses Diagramm. `zahlen.html` lädt dafür `vendor/chart.umd.js` und `model-calc.js`.

## 2026-10-02 — „Die Zahlen erklärt": Fußnoten am Seitenende

Die acht Fußnotenblöcke nach den Abschnitten sind zu einer Liste „Anmerkungen" (Fn. 1–16) am Seitenende zusammengefasst. Der Link „Volle Belege: Quellenbelege" im Seitenkopf entfällt.

## 2026-10-02 — „Die Zahlen" und „Die Quellen"

„Die Zahlen erklärt" heißt jetzt „Die Zahlen" und enthält den Zahlenabgleich aus den bisherigen Quellenbelegen: Tabelle der Bestandsangaben je Quelle, Tabelle aller Kostenschätzungen mit Fundstelle, Detailwerte zu Mietabsenkung und Gutachterausschuss, Offene Punkte zur Neuvertragsmiete und zur Abbildung des DWE-Gesetzentwurfs (neue Fn. 17). `quellenbelege.md`/`.html` heißt auf der Website „Die Quellen" und ist nach Dokumenten gegliedert (Datei, Herkunft, verwendete Fundstellen, Zitate, Reichweite); die Abschnitte 1–4, 9 und 10.1 sind in `zahlen.html` aufgegangen. `build_quellenbelege.py` versteht jetzt Markdown-Links. Navigation auf allen Seiten und Beschreibungen auf der Startseite angepasst. Dateinamen bleiben unverändert.

## 2026-10-02 — Modellseite: Spalten in Fensterhöhe, sichtbare Scrollbalken

Ab 1161 px Breite füllt das Layout die Fensterhöhe unterhalb von Navigation und Kopf; Regler-, Ergebnis- (und in v37 Hintergrund-)Spalte scrollen jeweils für sich und enden am unteren Fensterrand (vorher je 100vh hoch, also unten abgeschnitten, solange die Seite nicht mitgescrollt war). Dafür `<body class="model-page">` in v37; `build_kompakt.py` an den neuen Body-Tag angepasst. Scrollbalken der Spalten und der Vergleichstabelle sind dauerhaft sichtbar gestaltet (`::-webkit-scrollbar`, Fallback `scrollbar-color`). Druck und schmale Bildschirme unverändert.

## 2026-10-02 — Versionsparameter gegen veraltete Browser-Caches

Alle Seiten laden `style.css`, `model-calc.js` und `content.js` jetzt mit `?v=20261002` (auch in beiden Build-Skripten). Anlass: Die Layoutänderung der Modellseite war deployt, im Browser wirkte aber noch die zwischengespeicherte alte `style.css`. Bei künftigen Änderungen an diesen Dateien den Parameter erhöhen.

## 2026-10-02 — Einfache Überschriften auf der ganzen Website

Überschriften als kurze Nominalgruppen mit Artikel, ohne Fragen und ohne Zahlen. „Die Zahlen": Der Bestand, Die Kosten im Vergleich, Die fünf Positionen im Modell, Der Rechnungshof, Die Mieten, Der Verkehrswert, Der Rechtsstreit, Das Gegenmodell, Die offenen Punkte, Die Anmerkungen. Hintergrund (und v37): Der rechtliche Rahmen, Der Rechenweg, Die Grenzen des Modells, Die Wertermittlung, Der Bestand, Die Entschädigungsspanne, Die Studie von Bernt und Holm, Der Rechnungshof, Die Quellen. Modell: Gruppen „Die Finanzen", „Die Mieter", „Der Überschuss", „Eigene Szenarien"; Diagramme z. B. „Der Cashflow pro Jahr", „Die Restschuld", „Die Ersparnis der Mieter"; Verweise auf „Abschnitt 04" ersetzt durch „Einstellungen unter ‚Der Überschuss'". „Die Quellen": Abschnitte nach Urheber und Jahr („Die Expertenkommission (2023)" usw.). Impressum und Datenschutz unverändert (rechtlich übliche Überschriften). Versionsparameter auf `?v=20261002b`.

## 2026-10-02 — Modell: Erklärungen beim Überfahren, Glossar ergänzt

Definitionen unter den Reglern (Risikoprämie, Zinsbindung, Einmalige Kosten, Integrationskosten, Sanierungsstau, Kosteninflation, Umwandlungskosten, Umwandlungstempo, CPI, Haushaltseinkommen) entfernt; sie stehen im Glossar. Unter den Reglern bleiben Quellenangaben (Ausgangsmiete, Rechnungshof S. 25, freier Markt, kommunale WoGes.), berechnete Werte und Warnungen. Reglernamen, Kennzahlen, Diagrammtitel und Tabellenköpfe mit `data-term` werden beim Überfahren gelb hinterlegt und zeigen den ersten Satz des passenden Glossareintrags (`tooltips.js`, Text aus `content.js`). Glossar um 20 Einträge ergänzt: Betrachtungszeitraum, Finanzierungsmodus, Zinssatz, Zinsaufschlag, Schuldendienst, Cashflow, Kosteninflation, Ausgangsmiete, Mietsteigerung, Landeseigene Wohnungsgesellschaften, CPI, Haushaltseinkommen, Baukosten Neubau, Sozialmiete, Umwandlungskosten, Umwandlungstempo, Nettoergebnis, Bestandseffekt, Mieterersparnis, Einmalige Kosten. `build_kompakt.py` behält `content.js` in `modell-kompakt.html`. Versionsparameter auf `?v=20261002c`.

## 2026-10-02 — Glossar im Wörterbuchsatz

Glossar alphabetisch sortiert, mit violetten Buchstabenköpfen (A, B, C …). Jeder Eintrag beginnt mit dem fetten Stichwort, die Erklärung läuft in derselben Zeile weiter; Folgezeilen hängend eingezogen. Rechts- und Quellenangaben in den Einträgen (`<span class="src">`: § 194 BauGB, § 558 BGB, ImmoWertV, IW Köln/Empirica, Bernt/Holm, IW Consult, Expertenkommission, Art. 14 GG) in Türkis. `glossar.html` zweispaltig mit Trennlinie (`class="two-col"`, unter 640 px einspaltig); Hintergrundspalte der Modellseite einspaltig. `tooltips.js` trennt Stichwörter an „ / " nur noch außerhalb von Klammern (vorher fehlte die Erklärung zu „Modus"). Versionsparameter auf `?v=20261002d`.

## 2026-10-02 — Kennzahlen-Kacheln: eine Schriftgröße

Die vier Kacheln über den Diagrammen (Entschädigungsquote, Break-even, Nettoergebnis, Bestandseffekt) setzen Bezeichnung, Wert und Zusatzzeile in 12 px (vorher 9,5 / 20 / 10,5 px); Bezeichnung ohne Versalien, Wert fett. Innenabstand 8/12 px statt 14/16 px, die Kacheln sind dadurch etwa halb so hoch. Versionsparameter auf `?v=20261002e`.

## 2026-10-02 — Glossar: zwei Spalten, getrennte Einträge, Farbe

Das Glossar ist überall zweispaltig mit Trennlinie, auch in der Hintergrundspalte der Modellseite (`div.glossary`, `columns:2 280px`; bei schmalem Fenster einspaltig). Jeder Eintrag ist ein eigener Absatz mit 8 px Abstand und bricht nicht über die Spalte. Stichwörter in Violett, Buchstabenköpfe größer in Türkis mit türkiser Linie, Quellenangaben weiter in Türkis. Versionsparameter auf `?v=20261002f`, damit Browser die neue `style.css` und `content.js` laden.

## 2026-10-02 — Diagramme: keine Randnotizen, Erläuterung über volle Breite

Die Kurzangaben rechts neben den Diagrammtiteln (`<span class="caption">`, z. B. „nach Schuldendienst · Zinsbindung 10 J., danach +1,0 pp", „Modellergebnis", „Vergleichsrechnung") entfernt, auf der Modellseite und in `zahlen.html`; die zugehörigen Zuweisungen in `model-calc.js` und die Regel `.panel-head .caption` in `style.css` entfallen. Die Erläuterung unter jedem Titel (`.panel-sub`) läuft über die volle Breite des Diagrammrahmens (vorher höchstens 74 Zeichen). Versionsparameter auf `?v=20261002g`.

## 2026-10-02 — Übersicht: ein Abschnitt je Seite

Die Seitenbeschreibungen auf `index.html` stehen nicht mehr als fortlaufende Liste (`dl.glossary`), sondern wie „Der Volksentscheid": je Seite eine Überschrift (`h2`) mit Link und ein Absatz (`p.lead`). Verlinkte Überschriften (`.bg-page h2 a`) in der Überschriftfarbe ohne Unterstreichung, beim Überfahren gelb hinterlegt (#FFE55C, wie die Begriffe auf der Modellseite). Versionsparameter auf `?v=20261002h`.

## 2026-10-02 — Einleitungsabsätze größer

`.bg-page .lead` in 14,5 px statt 13 px (Übersicht und weitere Seiten mit Einleitungsabsatz). Versionsparameter auf `?v=20261002i`.

## 2026-10-02 — Regler rund, Schiene schwarz, keine Trennlinien

Reglerknopf rund (`border-radius:50%`), Schiene 1 px schwarz (`var(--ink)`) statt 2 px grau. Die Linien zwischen den Abschnitten der Reglerspalte (`.group`) entfallen. Versionsparameter auf `?v=20261002j`.

## 2026-10-02 — Ergebnisrahmen mit Titel, ohne Bestandseffekt

Seitentitel, Urteilszeile („Bei diesen Annahmen: …", mit „Ergebnisse drucken") und die Kennzahlen stehen in einem gemeinsamen Rahmen (`section.summary`) oben in der Ergebnisspalte; der Titelkopf (`.masthead`) über den Spalten entfällt auf der Modellseite. Kachel „Bestandseffekt" entfernt (HTML und Zuweisung in `model-calc.js`), die drei übrigen Kennzahlen dreispaltig ohne Trennlinien. Positionsknöpfe (Faire-Mieten-Modell, Gegenmodell …) in 13 px statt 11,5 px. Versionsparameter auf `?v=20261002k`.

## 2026-10-02 — „Die Zahlen" ruhiger gesetzt

Fließtext und Listen auf den Inhaltsseiten im Flattersatz mit Silbentrennung (vorher Blocksatz mit breiten Lücken); nur die Einleitungsabsätze (`p.lead`, Übersicht) bleiben im Blocksatz. Sprungleiste (`.jump-nav`) als schlichte Textlinks in der Überschriftschrift statt umrandeter Knöpfe, gelb beim Überfahren. Abstand vor Abschnittsüberschriften 32 px statt 20 px. Das Diagramm „Die fünf Positionen im Modell" steht ohne Rahmen im Text. Regel `sup.fn + sup.fn::before` entfernt: Sie setzte vor Fußnotenzeichen ein Komma, sobald die vorige Fußnote im selben Absatz stand, auch mit Text dazwischen („Nebenkosten).,³"). Versionsparameter auf `?v=20261002l`.

## 2026-10-02 — Fließtext einheitlich 14,5 px

Fließtext auf allen Inhaltsseiten (`.bg-page p`, Listen, Zeitleiste, Hinweiskästen) in 14,5 px wie der Einleitungsabsatz der Übersicht; vorher 12,5–13 px. Glossar, Tabellen, Quellenliste und Fußnotenliste behalten ihre kleineren Größen. Überschriften damit über der Textgröße: `h2` 16 px, `h3` 14,5 px (vorher je 13 px); Diagrammüberschrift auf „Die Zahlen" wie `h2`. Fußnotenzeichen 10,5 px. Versionsparameter auf `?v=20261002m`.

## 2026-10-02 — „Die Chronologie"

Die Seite „Die Quellen" (`quellenbelege.md`/`.html`) heißt jetzt „Die Chronologie" und ordnet die Dokumente nach Erscheinungsdatum, das jüngste zuerst: IW Köln/Empirica (23.06.2026), PwC (undatiert, jüngstes Abrufdatum 05.05.2026), DWE-Gesetzentwurf (26.09.2025), Gutachterausschuss (Amtsblatt 19.09.2025), Rechnungshof (2024), Bernt/Holm (Online-Studie 1/2023) nach der Expertenkommission (Juni 2023), DWE-Buch (2022), BBU-Sodan (2019). „Weitere Quellen" und „Nicht geprüfte Quellen" bleiben am Ende, innerhalb ebenfalls nach Jahr geordnet. Navigation auf allen Seiten, Seitentitel in `build_quellenbelege.py` und Beschreibung auf der Startseite angepasst. Die Abschnitte „Die Quellen" in `hintergrund.html` und auf der Modellseite (Literaturliste) bleiben unverändert. Dateinamen bleiben unverändert.

## 2026-10-02 — „Die Chronologie" im Glossar-Layout

„Die Chronologie" ist gesetzt wie das Glossar: zweispaltig, Jahre als türkise Köpfe (statt Buchstaben), je Dokument ein Eintrag mit violettem Titel (Urheber und Titel des Dokuments) und Kurzbeschreibung, die Fundstellen als eingerückte Einträge mit fettem Stichwort statt Aufzählungspunkten (`.chronik .gl-points` in `style.css`). Dateinamen der PDFs und Ordnerpfade sind aus dem Text entfernt; jedes Dokument steht mit Titel, Datum und Umfang. „Weitere Quellen" sind in die Jahre einsortiert (Becker 2024, OECD 2024, Stoll 2022); die OECD-Angabe korrigiert: Zitierangabe „OECD (2024)", vorher irrtümlich Juli 2023. Autorenname im PwC-Whitepaper laut Titelseite: Prof. Dr. Florian Hackelberg. `build_quellenbelege.py` erzeugt die Glossar-Struktur (`##` Jahr, `###` Dokument, `- **Stichwort:**` Fundstelle). Versionsparameter auf `?v=20261002n`.

## 2026-10-02 — „Die Chronologie" einspaltig

Glossar-Layout für „Die Chronologie" zurückgenommen: eine Spalte, Fließtext in der üblichen Größe (14,5 px). Jahre als `h2`, Dokumente als `h3`, Fundstellen als Absätze mit fettem Stichwort, ohne Aufzählungspunkte. Regeln `.chronik` aus `style.css` entfernt. Versionsparameter auf `?v=20261002o`.

## 2026-10-02 — Karte: Legende unten rechts, Quellen zum Aufklappen

Die Legende steht nicht mehr im Ebenen-Panel, sondern in einem eigenen Kasten unten rechts über der Karte (`aside#legend-section`); sie erscheint, sobald eine Ebene sichtbar ist. Die Quellen sind im Panel zu einem aufklappbaren Eintrag „Quellen" (`details#source`) zusammengefasst und standardmäßig geschlossen. Gleiche Änderung in `web/index.html` und `web/style.css`; `karte/map.css` lädt mit `?v=20261002o`.

## 2026-10-02 — Modell: Diagramme ohne senkrechte Achsentitel, bündige Jahresachsen

Senkrechte Achsentitel entfernt („Jahres-Cashflow", „Kumuliert", „Mio €/Jahr", „Nettoergebnis", „Break-even (Jahr)", „Kaufpreis / Nettoergebnis"). Wo der Titel die Einheit trug, steht sie jetzt an den Achsenwerten (Zuschussbedarf in € statt Mio €, Break-even als „Jahr …"). Alle Jahresdiagramme haben dieselbe Achsenbreite links und rechts und dieselbe Beschriftung (Jahr 1 und jedes 5. Jahr, ab 60 Jahren jedes 10.); Jahr 1 und das letzte Jahr stehen in allen Diagrammen an derselben Stelle. Vorher waren „Der Cashflow pro Jahr" (Balkenversatz) und „Der Cashflow kumuliert" (fehlender rechter Rand) verschoben. Versionsparameter auf `?v=20261002p`.

## 2026-10-02 — Modell: Urteilszeile und Einzel-Legenden entfernt

Die Urteilszeile im Ergebnisrahmen („Bei diesen Annahmen: Defizit von … nach … Jahren — …") entfällt (HTML und Zuweisung in `model-calc.js`); damit entfällt auch der dort angehängte Hinweis zum Bestandswachstum bzw. Sozialanteil im Modus „Neubau"/„Umwandlung". „Ergebnisse drucken" steht rechts neben dem Seitentitel. Legenden unter „Der Cashflow pro Jahr" („Jahres-Cashflow positiv/negativ") und „Der Cashflow kumuliert" („kumulierter Cashflow") entfernt. Versionsparameter auf `?v=20261002q`.

## 2026-10-02 — Übersicht: „Der Ablauf seit 2021" in „Die Chronologie" aufgenommen

Die Startseite hat nur noch einen Abschnitt „Die Chronologie": Einleitung und darunter eine Liste (links Datum und Name fett, rechts Kurzbeschreibung), das jüngste zuerst wie auf `quellenbelege.html`. Abgleich mit der Chronologie und den Quellen: Die Expertenkommission tagte ab 29.04.2022, nicht ab 2021 (Abschlussbericht S. 10, Übergabe 28.06.2023 S. 14). Der Volksentscheid erhielt 59,1 % der gültigen Stimmen (DWE-Hg 2022, S. 4); die bisherigen 56,4 % hatten keinen Beleg im Korpus, Beleg in `quellenbelege.md` ergänzt. Offen: `content.js` (Timeline, „2021–2023", „56,4 %") und der Einleitungstext in `vergesellschaftung-modell-v37.html` tragen noch die alten Angaben.

## 2026-10-02 — Modell: frischere Signalfarben

Rot `#B23A34` → `#E0435C` (zum Pink hin), Grün `#2F7D46` und `#3A7D44` → `#109A82` (zum Blaugrün hin), in `model-calc.js`, den CSS-Variablen `--red`/`--green` und den Legendenfeldern, damit Diagramme, Legenden und Zahlenseite übereinstimmen.

## 2026-10-02 — Die Zahlen: Tabellen im Raster

`zahlen.html` erhält `class="zahlen-page"`; dort haben alle Tabellenzellen einen Rahmen, die Kopfzeile steht in Space Grotesk fett (600) statt IBM Plex Mono in Versalien, auf hellgrauem Grund.

## 2026-10-02 — Modell: Sozialwohnungen sofort oder schrittweise

**Problem:** Die Grafik „Die Sozialwohnungen" zeigte nur den Pfad „aus Überschuss", unabhängig vom gewählten Modus, und rechnete mit Umwandlungskosten von 1.200 €/m² (≈ 78.000 € je Wohnung). Im öffentlichen Eigentum ist die Umwandlung eine Mietentscheidung; das Modell zahlte also an sich selbst und erfasste zusätzlich die entgangene Miete.

**Änderung:**
- Neues Umwandlungstempo „Sofort": der gesamte Bestand trägt ab Jahr 1 die Sozialmiete (fester Zeitplan mit 100 %).
- „Aus Überschuss" wandelt jedes Jahr so viele Wohnungen um, wie der Überschuss an entgangener Miete (Modellmiete − Sozialmiete) und Umwandlungskosten trägt; der Cashflow bleibt dadurch etwa bei null.
- Umwandlungskosten: Standard 0 €/m², Regler ab 0; Glossar erklärt, wofür ein Wert über 0 steht.
- Panel „Die Sozialwohnungen": drei Pfade (sofort, fester Zeitplan, aus Überschuss) als Anteil am Bestand und darunter als kumulierter Cashflow; „Die Ersparnis der Mieter" zeigt dieselben drei Pfade.

## 2026-10-02 — Fix: leere Diagramme nach dem Sozialwohnungs-Update

Ein Browser mit zwischengespeicherter alter Seite lud das neue `model-calc.js`; dort fehlte die Zeichenfläche `chartSozialCum`, `getContext` auf `null` brach `initCharts` ab, und kein Diagramm wurde gezeichnet. `model-calc.js` überspringt die Grafik jetzt, wenn die Zeichenfläche fehlt. Mit alter Seite und neuem Skript nachgestellt und geprüft.

## 2026-10-02 — Modell: Umwandlungstempo als kombinierbare Regler

Die drei Pfade sind keine Vergleichsgrafik mehr, sondern Regler links unter „Der Überschuss" → „Umwandlung in Sozialwohnungen", die zusammenwirken: „Sofort umgewandelt" (Anteil ab Jahr 1, 0–100 %), „Fester Zeitplan" (0–20 %/Jahr des Gesamtbestands) und „Aus Überschuss" (Anteil des Überschusses, 0–100 %, ersetzt die Reinvestitionsquote dieses Modus). Standard 0 % / 0 %/Jahr / 100 % entspricht dem bisherigen Standard. „Die Sozialwohnungen" zeigt den Sozialanteil gestapelt nach Herkunft; die Cashflow-Grafik darunter entfällt. „Die Sozialwohnungen" und „Die Ersparnis der Mieter" erscheinen nur im Modus „Umwandlung in Sozialwohnungen"; die Bestandsgrafik nur noch bei Neubau. `$()` liefert für fehlende Elemente einen losgelösten Platzhalter, damit eine zwischengespeicherte ältere Seite das Skript nicht abbricht.

## 2026-10-02 — Modell: Kennzahlen im Kopf auf zwei Zeilen

Entschädigungsquote, Break-even und Nettoergebnis stehen je auf zwei Zeilen: Bezeichnung und Wert in der ersten, Erläuterung in der zweiten; die drei Spalten sind so breit wie ihr Inhalt. Ist der Kopfrahmen schmaler als 700 px (Container-Abfrage), stehen die drei Kennzahlen untereinander.

## 2026-10-02 — Modell: Gesamtwert und Kaufpreis unter der Entschädigungsquote

Die Hinweise „Gesamtwert = Wohnungen × Größe × Verkehrswert/m²" (unter dem Verkehrswert) und „Tatsächlicher Kaufpreis" (unter der Entschädigungsquote) sind zu einer Zeile unter der Entschädigungsquote zusammengefasst: „Kaufpreis 1.564 €/m² · 24,4 von 32,5 Mrd €". Das Feld „≈ pro Wohnung … € Verkehrswert" steht jetzt ebenfalls dort.

## 2026-10-02 — Akzentfarbe Petrol statt Dunkelblau

`--blue` und alle festen `#1E3A5F` (Überschriften, Navigation, Fußnotenlinks, Schaltflächen, Diagrammlinien in `model-calc.js`) sind jetzt `#00788C`, die Farbe der Buchstaben im Glossar.

## 2026-10-03 — Modell: Sozialwohnungen als eigene, immer aktive Gruppe

Die Umwandlung in Sozialwohnungen ist in allen Positionen das Ziel und keine Frage der Reinvestition. „Der Überschuss" bietet nur noch „Keine Reinvestition" und „Neubau"; die neue Gruppe „Die Sozialwohnungen" (Sozialmiete, Umwandlungskosten, Sofort, Fester Zeitplan, Aus Überschuss) wirkt immer. Der Anteil „Aus Überschuss" geht zuerst in die Umwandlung, Neubau erhält die Reinvestitionsquote vom Rest; umgewandelt wird nur der übernommene Bestand, Neubauwohnungen bleiben bei der Modellmiete. Standard 0 % / 0 %/Jahr / 0 %: alle Presets und Kennzahlen bleiben unverändert (gegen die vorige Version geprüft). „Die Sozialwohnungen" und „Die Ersparnis der Mieter" sind immer sichtbar; Jahr-für-Jahr-Tabelle und Szenariovergleich zeigen Bestand und Sozialanteil.

## 2026-10-03 — Modell: Preset-Schaltflächen gelb

Die fünf Preset-Schaltflächen werden beim Überfahren, beim Klicken und als gewähltes Preset gelb (`#FFE55C`, wie die Überschriften-Links); „Zurücksetzen" hebt die Auswahl auf.

## 2026-10-03 — Modell: Beschriftungen „Modus" entfernt

Die Beschriftungen „Modus" (Finanzierung) und „Bewirtschaftungskosten-Modus" über den Umschaltern sind entfernt; die Umschalter Kredit/Eigenmittel und % der Miete/Absolut €/m² bleiben. Verweis im Hintergrundtext angepasst.

## 2026-10-03 — Modell: „Ergebnisse drucken" unter „Zurücksetzen"

Die Schaltfläche „Ergebnisse drucken" steht jetzt links unter „Zurücksetzen", in derselben Breite; der leere Rahmen oben rechts im Kopf ist entfernt.

## 2026-10-03 — Modell: Preset-Schaltflächen grün, Markierung endet bei Änderung

Hover und gewähltes Preset jetzt in `--green` (`#109A82`) mit weißer Schrift statt Gelb. Sobald ein Regler, ein Zahlenfeld, der Reinvestitionsmodus oder ein Umschalter geändert wird, verschwindet die Markierung, weil die Einstellung dann nicht mehr dem Preset entspricht; das Eintippen eines Szenarionamens zählt nicht.

## 2026-10-03 — Modell: Sprung zwischen „Die Finanzen" und „Die Mieter"

Rechts neben der Überschrift „Die Finanzen" steht „Die Mieter" als Link zum Abschnitt mit Mieten, Sozialwohnungen und Mieterersparnis; dort führt „Die Finanzen" zurück. Der aktuelle Abschnitt steht in Petrol, der andere grau unterstrichen, beim Überfahren grün; Bildlauf weich.

## 2026-10-03 — Modell: Sensitivitätsdiagramme unter „Sensitivität"

Die Diagramme „Der Zuschussbedarf je Zinssatz" und „Das Ergebnis je Entschädigungsquote" stehen nicht mehr zwischen den Zeitreihen unter „Die Finanzen", sondern im zugeklappten Abschnitt „Sensitivität" unter der Jahr-für-Jahr-Tabelle. Das Zinsdiagramm heißt jetzt „Das Ergebnis je Zinssatz" und zeigt wie das Entschädigungsdiagramm Nettoergebnis (mit Vorzeichen, statt auf 0 gekappt) und Break-even-Jahr; bei Eigenmitteln ist es ausgeblendet. Der Durchschnitt über den Horizont entfällt, weil er mit dem Zuschussbedarf des Rechnungshofs (erste zehn Jahre) nicht vergleichbar war. Achsenbereich beider Diagramme aus allen Presets an den Reglerenden.

## 2026-10-03 — Zahlen: „Die fünf Positionen im Modell" ohne Break-even-Achse

Die rechte Achse mit dem Break-even-Jahr ist entfernt: Nach 50 Jahren erreicht nur Bernt/Holm den Break-even (Jahr 45), die Achse trug also einen einzigen Punkt und zeigte doppelte gerundete Beschriftungen. Das Break-even-Jahr steht jetzt als Satz im Untertitel, aus dem Modell berechnet. Die Legende hat nur noch „Kaufpreis" und „Nettoergebnis" (grün/rot), der Untertitel ist gekürzt.

## 2026-10-03 — Modell: gespeicherte Szenarien als Schaltflächen, Link teilen, Übersichtsdiagramm

Nach „A speichern"/„B speichern" erscheint das Szenario als Schaltfläche (gestrichelt) unter den fünf Positionen; ein Klick lädt es in die Regler, × löscht es. Die Szenarien bleiben im Browser gespeichert (localStorage) und sind auf beiden Modellseiten verfügbar. „Link kopieren" schreibt die Abweichungen von den Standardwerten in die Adresse (`#s=schlüssel:wert,…`); wer den Link öffnet, bekommt dieselbe Einstellung. „Der Szenario-Vergleich" zeigt über der Tabelle Kaufpreis und Nettoergebnis der fünf Positionen und der gespeicherten Szenarien über den eingestellten Betrachtungszeitraum; die Spalte „Aktuell" nennt die gewählte Position oder das geladene Szenario. Lange Tabellenzellen brechen jetzt um.

## 2026-10-03 — Modell: ein Feld und eine Schaltfläche zum Speichern

Die zwei Zeilen „A speichern"/„B speichern" sind durch ein Namensfeld und „Speichern" ersetzt (auch mit Enter). Jedes Speichern legt eine neue Schaltfläche an, höchstens fünf; bei gleichem Namen wird das Szenario überschrieben, beim sechsten fällt das älteste weg. Ohne Namen heißt es „Szenario n". Früher gespeicherte A/B-Szenarien werden übernommen.

## 2026-10-03 — Zahlen: Tabelle „Weitere Schätzungen in den Quellen" entfernt

Die sechs Zeilen (DWE-Frühschätzung, BBU-Schätzung, Senat 2019 mit und ohne Erwerbsnebenkosten, Kreditbedarf der Anstalt, Landeshaushalt 2019) stehen jetzt mit allen Seitenangaben unter BBU-Sodan 2019 in `quellenbelege.md` („Die Chronologie").

## 2026-10-04 — Das Recht: neuer Text

`recht.html` hat einen neuen Text: Art. 15 GG und Landesverfassung (Art. 23 VvB, Art. 142 GG), Verweis auf Art. 14 Abs. 3 Satz 3 und 4 GG, Mehrheit und Sondervotum, Wertermittlung (ImmoWertV, Ertragswert, Sachwertverfahren des DWE-Entwurfs nach BewG), Rechnungshof und neuer Abschnitt „Was bleibt offen?“ (Sprunglink „Offene Fragen“). Die wörtlichen Zitate von Rechnungshof und Kommission sind entfallen. Fußnoten neu nummeriert (1–11); neu belegt: Landesverfassung (Expertenkommission 2023, S. 18, Rn. 49 f.; S. 94, Rn. 344), Ansätze der Mehrheit (S. 17, Rn. 42), Sondervotum ergänzt um S. 17, Rn. 43, DWE-Gesetzentwurf 2025 (§§ 13–16, S. 8 f.).
Fußnote 10 präzisiert: Der Rechnungshof stützt das rechtliche Risiko auf die Rechtsprechung zu Art. 14 Abs. 3 GG (Rechnungshof Berlin 2024, S. 12 und S. 22 f.); am Text geprüft.
