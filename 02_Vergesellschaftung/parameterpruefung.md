# Die Parameter der fünf Positionen

Prüfung der Voreinstellungen in `model-calc.js` (`defaults`, `presets`) gegen die Quellen in `pdf/`. Stand 06.10.2026, alle Fundstellen am Original-PDF geprüft. Seitenangaben nach PDF-Seite, wie in `quellenbelege.md`.

Befund: **✓** Wert der Quelle · **≈** Wert der Quelle, vereinfacht · **ü** die Quelle nennt keinen Wert, übernommen von einer anderen Position (Herkunft angegeben).

Bewirtschaftung in €/m² und Monat bei 62 m². Bausteine nach Rechnungshof (S. 25–26), wo eine Quelle keinen Gesamtwert nennt: Verwaltung 343,69 €/Whg. p. a. = 0,46; Instandhaltung 17,18 €/m² p. a. = 1,43; Betriebskosten 3,60 €/m² p. a. = 0,30; zusammen 2,19; Mietausfallwagnis 2 % der Miete.

## Faire-Mieten-Modell (DWE 2022), Preset `linke`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Ausgangsmiete | 4,04 €/m² | 3,70 | leistbare Miete 4,04 €/m² im Gesetzentwurf; 3,70 nur in einer Fußnote eines Fremdbeitrags | DWE 2022, S. 97, 102; S. 117 | ✓ |
| Bewirtschaftung | 2,76 €/m² | 40 % = 1,48 | Instandsetzung 2,00, Verwaltung 0,68, Mietausfall 0,08 | S. 97, 102 | ✓ |
| Mietsteigerung, Kosteninflation | 0,4 % | 0,5 / 2,5 % | 0,43 %/Jahr für Miete und Bewirtschaftung | S. 97 | ≈ |
| Entschädigung | 31,8 % = 9,9 Mrd. € | 43 % = 14,0 | 10 Mrd. € für 243.000 Whg. à 62 m², auf 240.000 Whg. umgerechnet | S. 102 | ✓ |
| Finanzierung | 0 %, 40 Jahre | 3,5 %, 30 Jahre | unverzinste Schuldverschreibungen, Tilgung 1/40 pro Jahr | S. 96 | ✓ |

## DWE-Gesetzentwurf (2025), Preset `dwe2025`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Bestand | 220.000 | – | ≈ 220.000 | PwC, Fn. 1–2 | ✓ |
| Entschädigung | 55,4 % = 15,8 Mrd. € | 50 % = 14,9 | 14,5–17,0 Mrd. €, Mitte 15,75 | PwC, Fn. 1–2 | ✓ |
| Finanzierung | 3,5 %, 100 Jahre | – | fester Zins 3,5 %, Tilgung über 100 Jahre | Entwurf, S. 7 | ✓ |
| Miete, Bewirtschaftung, Fortschreibung | 4,04 €/m², 2,76 €/m², 0,4 % | 3,70, 40 %, 0,5/2,5 % | Entwurf nennt keine | – | ü Faire-Mieten-Modell |

## Bernt/Holm (2023), Preset `holm`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Ausgangsmiete | 6,39 €/m² | 6,29 | Mietsenkungsmodell 7,63 → 6,39 €/m² | Bernt/Holm, S. 12 (Tab. 2) | ✓ |
| Mietsteigerung | 1,6 % | 1,5 | Landeseigene 2016–2021, Trendfortschreibung | S. 22 (Tab. 6) | ✓ |
| Entschädigung | 54,8 % = 17,0 Mrd. € | 73,8 % = 24,0 | Studie nennt keine; Gerhardt/Holm 2021: Ertragswert mit LWU-Mieten 17 Mrd. € | DWE 2022, S. 112 | ✓ |
| Bewirtschaftung | 2,98 €/m² | 35 % = 2,20 | Instandsetzung 18,54 + Modernisierung 6,53 €/m² p. a. der Landeseigenen = 2,09; dazu Verwaltung, Betriebskosten, Mietausfall | S. 23 (Tab. 8, 9) | ≈ Bausteine RH |
| Zins, Laufzeit | 4,2 %, 30 Jahre | 3,5 %, 30 | keine Angabe (Kurzfassung) | – | ü Rechnungshof |
| Kosteninflation | 2,0 % | 2,0 | keine Angabe | – | ü Rechnungshof |

## Rechnungshof (2024), Preset `rechnungshof`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Ausgangsmiete | 7,16 €/m² | 6,71 | Mietspiegel 2023 | RH, S. 9, 25 | ✓ |
| Mietsteigerung | 2,0 % | 1,5 | 1 % bis 2024, 2 % ab 2025 | S. 26 | ≈ |
| Kosteninflation | 2,0 % | 2,0 | 10 % bis 2024, 2 % ab 2025 | S. 26 | ≈ |
| Bewirtschaftung | 3,34 €/m² | 2,20 | 2,19 + Modernisierung rd. 12 €/m² p. a. (1,00) + Mietausfall 2 % (0,14) | S. 25–26 | ✓ |
| Zins | 4,2 %, fest 30 Jahre | 3,5 %, nach 10 J. +1,0 | 80 % AöR-Kredit 4,5 %, 20 % Eigenkapital des Landes 3,0 %, je 30 Jahre; gewichtete Annuität weicht < 0,1 % ab | S. 27 | ≈ |
| Entschädigung | 100 % = 31,0 Mrd. € | 100 % = 32,5 | Szenarien 29 und 36 Mrd. € | S. 12, 23 | ✓ |

## IW/Empirica (2026), Preset `gegenmodell`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Entschädigung | 100 % = 31,0 Mrd. € | 100 % = 32,5 | Verkehrswert; zitiert Senat 29–39 Mrd. € | IW, S. 8 | ✓ |
| Risikoprämie | +0,5 Pp. | +0,5 | 0,5 Pp. auf die Finanzierungskosten des Landes | S. 23 | ≈ auf den Kredit übertragen |
| Bewirtschaftung | 3,93 €/m² | 40 % = 3,05 | Modernisierung 13–25 €/m² p. a. (Mitte 19 = 1,58) + 2,19 + Mietausfall 0,15 | S. 17 | ≈ Bausteine RH |
| Kosteninflation | 2,7 % | 3,0 | Inflation voraussichtlich 2,7 % (März 2026) | S. 17 | ✓ |
| Ausgangsmiete | 7,63 €/m² | 7,63 | IW nennt keine; Konzerne 2021 ohne Mietsenkung | Bernt/Holm, S. 12 | ü Bernt/Holm |
| Zins, Zinsbindung | 4,2 %, fest 30 Jahre | 3,5 %, nach 5 J. +2,0 | keine Angabe | – | ü Rechnungshof |
| Mietsteigerung | 2,0 % | 1,5 | keine Angabe | – | ü Rechnungshof |

## Gemeinsame Annahmen (`defaults`)

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Bestand | 240.000 | 240.000 | DWE, RH, Senat | `zahlen.html`, Fn. 1, 6 | ✓ |
| Wohnungsgröße | 62 m² | 65 | Senat 62, DWE 2022 62, RH 61, Bernt/Holm 63; 65 in keiner Quelle | RH, S. 25; DWE 2022, S. 102; Bernt/Holm, S. 12 | ✓ |
| Verkehrswert | 2.085 €/m² | 2.085 | Modellannahme in der Spanne des Gutachterausschusses (1.634–4.247 €/m²) | Liegenschaftszinssätze 2025, S. 16 | – offengelegt |
| Einmalige Kosten | 200 Mio. € | 405 | Integrationskosten Vonovia/Deutsche Wohnen, laut IW eher Untergrenze; 405 in keiner Quelle | IW, S. 17 | ✓ |
| Integrationskosten (% des Kaufpreises) | 0 % | 2 % | keine Quelle nennt einen Prozentsatz | – | 0 |
| Sanierungsstau | 0 € | 20.000 €/Whg. | keine Quelle beziffert ihn; RH rechnet ohne | RH, S. 11 | 0 |

## Regler

- Entschädigungsquote: `min="20" step="0.1"` (vorher 40/5; der Browser rundete 43 auf 45 und 73,8 auf 75).
- Ausgangsmiete und Bewirtschaftung absolut: Schritt 0,01 €/m², damit 4,04, 7,16, 2,98, 3,34 und 3,93 einstellbar sind.
- Sensitivität der Entschädigungsquote ab 20 %.

## Wirkung (Modellrechnung, 50 Jahre)

| Position | Kaufpreis (Mrd. €) | Ø Cashflow Jahr 1–10 (Mio. €) | Nettoergebnis (Mrd. €) | Break-even |
|---|---|---|---|---|
| Faire-Mieten-Modell | 9,9 (vorher 14,0) | −14 (−362) | +2,6 (−16,1) | Jahr 41 (–) |
| DWE-Gesetzentwurf | 15,8 (14,9) | −356 (−174) | −17,1 (−20,8) | – (–) |
| Bernt/Holm | 17,0 (24,0) | −363 (−496) | +11,0 (+7,1) | Jahr 40 (45) |
| Rechnungshof | 31,0 (32,5) | −1.091 (−875) | +2,4 (−4,5) | Jahr 49 (–) |
| IW/Empirica | 31,0 (32,5) | −1.251 (−1.216) | −15,9 (−31,9) | – (–) |

Das Faire-Mieten-Modell trägt sich wie in der Quelle angelegt: Die Entschädigung entspricht dem Reinertrag, der Cashflow liegt nahe null. Der DWE-Gesetzentwurf wird mit der Miete des Faire-Mieten-Modells (4,04 €/m²) und 3,5 % Zins negativ; der Entwurf selbst nennt keine Miete.

## Abgleich mit dem Rechnungshof

Mit seinen eigenen Werten (61 m², 80 % der Summe als Kredit zu 4,5 %, Bewirtschaftung 3,35 €/m² bei 61 m²) ergibt das Modell Ø −691 Mio. € (29 Mrd. €) und −1.036 Mio. € (36 Mrd. €) in den Jahren 1–10. Der Bericht nennt rd. 700 Mio. € und rd. 1 Mrd. € Zuschuss (S. 23). Das Preset rechnet dagegen 4,2 % auf die volle Summe und zeigt damit die Belastung von AöR und Land zusammen.

## Offen

- Gerhardt/Holm (2021) liegen nur als Kurzfassung vor (DWE 2022, S. 112); deren Finanzierungsannahmen fehlen.
- Holm et al. (2025), von IW zitiert (8–11 Mrd. €, Modernisierung 6–12 €/m²), liegt nicht im Projektordner.
- DWE-Factsheet 2025 (14,5–17,0 Mrd. €) nur über PwC belegt.
- Voreinstellung ohne Position (`defaults`: 7,63 €/m², 1,5 %, 2,5 %, 40 %, 3,5 % mit Zinsänderung nach 10 Jahren) ist freier Startwert ohne Quelle.
