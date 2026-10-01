# Extraction — Rechnungshof von Berlin (2024), Beratungsbericht zur Vergesellschaftung

**Provenance note (differs from the other 9 corpus files):** This PDF is not stored locally in `pdf/` — repeated attempts to download it directly (from the cloud workspace and from this computer) were blocked by network/egress policy. The text below was retrieved via a web-fetch-and-summarize tool against the official URL, in two passes (one for verbatim quotes, one for structure/TOC). It is not a full page-by-page OCR transcript like the other files in this folder, and quotes should be treated as reliable but not immune to transcription drift — if a citation here becomes load-bearing for something public, re-verify against the PDF directly (e.g. print/re-fetch it) before publishing.

**Source:** Rechnungshof von Berlin — "Bericht nach § 88 Abs. 2 Landeshaushaltsordnung (LHO) zu den Auswirkungen einer Vergesellschaftung großer Wohnungsunternehmen auf den Landeshaushalt". Beschlossen vom Großen Kollegium (Präsidentin Karin Klingen + drei Direktor:innen), 20.02.2024. Adressiert an den Regierenden Bürgermeister, die Senatsverwaltung für Finanzen und die Senatsverwaltung für Stadtentwicklung. 30 Seiten (inkl. Deckblatt, Anhänge).
URL: `https://www.berlin.de/rechnungshof/veroeffentlichungen/veroeffentlichungen/rs-beratungsbericht-vergesellschaftung.pdf`

## Table of contents (as fetched)

```
1 Anlass des Beratungsberichts nach § 88 Abs. 2 LHO ........... S. 6
2 Methodisches Vorgehen ......................................... S. 8
  2.1 Annahmen und Datengrundlage ............................... S. 8
  2.2 DCF-Methode zur Abschätzung der jährlichen Kapitalflüsse ... S. 13
  2.3 Szenario- und Sensitivitätsanalyse ........................ S. 14
3 Ergebnisse des Berechnungsmodells ............................. S. 15
  3.1 Vor-Analyse: Kapitaldienst- und Kapitalmarktfähigkeit ...... S. 15
  3.2 Zuschüsse des Landes über 30 Jahre ......................... S. 18
  3.3 Finanzierungszeitraum ohne Zuschüsse ....................... S. 19
  3.4 Erforderliche Ausgangsmiete ohne Zuschüsse .................. S. 21
4 Schlussfolgerungen ............................................ S. 22
Anhang 1–3
```

## Data / verbatim quotes

- **Four scenarios (§2.1, S. 11–13):** 8 Mrd. € (abgeleitet aus dem Faire-Mieten-Modell der Initiative), 11 Mrd. € (abgeleitet aus der Finanzierbarkeits-Argumentation der Initiative), 29 Mrd. € (untere Grenze der amtlichen Kostenschätzung des Senats), 36 Mrd. € (obere Grenze derselben amtlichen Kostenschätzung). All four are **exogenous inputs the Rechnungshof adopted from other sources, not its own valuation** — explicitly: "Der Rechnungshof hat sich nicht mit einer angemessenen Entschädigungssumme beschäftigt." The report assumes an 80/20 debt-to-equity financing split but takes no position on the compensation quota itself.
- **11-Mrd.-threshold claim, corrected location (§3.1, S. 16):** "Dagegen bestehen bereits bei einer Entschädigungssumme von 11 Mrd. € in den ersten Jahren nach einer Vergesellschaftung strukturelle Finanzierungsdefizite einer AöR." — **This is on S. 16, not S. 23 as currently cited in `vergesellschaftung-modell-v37.html`, and the wording differs from the model's paraphrase** ("Bereits Entschädigungssummen über 11 Mrd. € [führen] wegen der hohen Finanzierungskosten unweigerlich zu Defiziten…").
- **Annual subsidy figure (§3.2, S. 19):** "Diese sind langfristig und erheblich. In einem Zeitraum von zehn Jahren nach Vergesellschaftung befinden sich diese in einer Spanne zwischen jährlich rd. 700 Mio. € (rd. 1,8 % des prognostizierten jährlichen Haushaltsvolumens gemäß Finanzplanung 2023 bis 2027) und 1 Mrd. €" — the model's "~700 Mio. €/Jahr" figure **is supported**, but it's the low end of a 700 Mio.–1 Mrd. € range, not a single point estimate, and applies to a 10-year window, not the full 30-year horizon.
- **Operating-cost figures (S. 25–26):** Instandhaltung 17,18 €/m² **p.a.**, Betriebskosten 3,60 €/m² **p.a.** — **no "2,20 €/m²/Monat" figure was found anywhere in the fetched text.** The model's claim that the Rechnungshof uses 2,20 €/m²/Monat as an absolute operating-cost figure (S. 25) does not match what this source actually gives on that page (annual, not monthly, and a different number). This needs correcting or removing, not just re-citing — I could not locate where the 2,20 €/Monat figure originated.
- **Core conclusion (§4, S. 22):** "Eine Vergesellschaftung kann nur verhältnismäßig sein, wenn dadurch die Mieten gesenkt oder zumindest entdynamisiert werden. Im Ergebnis sieht der Rechnungshof daher keine Möglichkeit, eine Vergesellschaftung mit vertretbaren Risiken umzusetzen." — matches the model's existing paraphrase of Klingen's public statement; this is the report's own written conclusion, not just a press quote.

## Not verified / could not locate in the fetched text

- The exact "S. 23" quote as currently phrased in v37 (see above — a related but differently worded and differently located passage exists on S. 16).
- Any "700 Mio." figure tied specifically to the 29–36-Mrd.-€ scenario as v37 implies; the actual 700-Mio.–1-Mrd. figure in §3.2 isn't scenario-specific in the fetched text.
- The 2,20 €/m²/Monat Bewirtschaftungskosten figure.

## Relational / modeling relevance

- This is the single most model-relevant primary source in the corpus after the Expertenkommission report and BBU-Sodan — it directly underlies the "Der Bericht des Landesrechnungshofs" section of `vergesellschaftung-modell-v37.html` and the four ideological presets' scenario framing (8/11/29/36 Mrd. €).
- Confirms the 240,000-unit basis is shared with the other sources (§2.1 assumptions).
- The 80/20 debt/equity financing assumption (§2.1) is not currently reflected as a documented assumption in the model's own financing section — worth checking whether v37's default financing mix should note this as the Rechnungshof's own assumption, distinct from the model's own defaults.
