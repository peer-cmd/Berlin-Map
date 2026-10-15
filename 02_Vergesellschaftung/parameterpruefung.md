# Die Parameter der fünf Positionen

Prüfung der Voreinstellungen in `model-calc.js` (`defaults`, `presets`) gegen die Quellen in `pdf/`. Stand 15.10.2026, alle Fundstellen am Original-PDF geprüft. Seitenangaben nach PDF-Seite, wie in `quellenbelege.md`.

Grundsatz: Jede Position rechnet nur mit den Werten ihrer Quelle und soll deren Ergebnis treffen. Was eine Quelle nicht ansetzt, steht in den `defaults` neutral (0 bzw. aus) und lässt sich im Modell zuschalten. Die Ergebnisse prüft `node pruefung.js` (Abschnitt „Ergebnis der Quelle und Modell“).

Befund: **✓** Wert der Quelle · **≈** Wert der Quelle, vereinfacht · **ü** die Quelle nennt keinen Wert, übernommen von einer anderen Position (Herkunft angegeben).

Bewirtschaftung in €/m² und Monat bei der Wohnungsgröße der Position. Bausteine nach Rechnungshof (S. 25–26) bei 61 m²: Verwaltung 343,69 €/Whg. p. a. = 0,47; Instandhaltung 17,18 €/m² p. a. = 1,43; Betriebskosten 3,60 €/m² p. a. = 0,30; Modernisierung 12 €/m² p. a. = 1,00; zusammen 3,20; Mietausfallwagnis 2 % der Miete als eigener Regler.

## Faire-Mieten-Modell (DWE 2022), Preset `linke`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Bestand | 243.000 × 62 m² | 240.000 × 62 | 243.000 Whg. à 62 m² | DWE 2022, S. 102 | ✓ |
| Ausgangsmiete | 4,04 €/m² | 4,04 | leistbare Miete 4,04 €/m² | S. 89, 97 | ✓ |
| Bewirtschaftung | 2,76 €/m² | 2,76 | Instandsetzung 2,00, Verwaltung 0,68, Mietausfall 0,08 | S. 89, 97 | ✓ |
| Mietsteigerung, Kosteninflation | 0,43 % | 0,4 | 0,43 %/Jahr ab dem zweiten Jahr | S. 89, 97 | ✓ |
| Entschädigung | 31,83 % = 10,0 Mrd. € | 31,8 % = 9,9 | Reinertrag aus 40 Jahren = 10 Mrd. € | S. 102 | ✓ |
| Finanzierung | 0 %, 40 Jahre | 0 %, 40 | unverzinste Schuldverschreibungen, Tilgung 1/40 pro Jahr | S. 96 | ✓ |
| Einmalige Kosten | 0 | 200 Mio. € | keine | – | 0 |
| Betrachtungszeitraum | 40 Jahre | 50 | Abführungsdauer 40 Jahre | S. 102 | ✓ |

## DWE-Gesetzentwurf (2025), Preset `dwe2025`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Bestand | 220.000 × 62 m² | 220.000 × 62 | ≈ 220.000 | PwC, S. 3, Fn. 1–2 | ✓ (62 m² ü Senat/DWE 2022) |
| Entschädigung | 55,38 % = 15,75 Mrd. € | 55,4 % | 14,5–17,0 Mrd. €, Mitte 15,75 | PwC, S. 3 | ✓ |
| Finanzierung | 3,5 %, Annuität über 100 Jahre | 3,5 %, 100 | fester Zins 3,5 %, gleichbleibende Annuität über 100 Jahre | Entwurf, S. 7 | ✓ |
| Ausgangsmiete | 7,63 €/m², keine Erhöhung | 4,04, +0,4 % | Entwurf nennt keine; Factsheet: „ohne Mieterhöhungen“ | PwC, S. 3; Bernt/Holm, S. 12 (Tab. 2) | ü Bernt/Holm |
| Bewirtschaftung | 2,76 €/m², +0,43 % | 2,76, +0,4 % | Entwurf nennt keine | DWE 2022, S. 89, 97 | ü Faire-Mieten-Modell |
| Betrachtungszeitraum | 100 Jahre | 50 | Laufzeit der Schuldverschreibungen | Entwurf, S. 7 | ✓ |

Das Factsheet vom 26.09.2025 mit den Annahmen der Initiative liegt nicht in `pdf/`; die Miete ist deshalb übernommen.

## Bernt/Holm (2023), Preset `holm`

Kombination: Mieten nach Bernt/Holm, Entschädigung nach Gerhardt/Holm 2021, Finanzierung, Kosten und Bewertung nach Rechnungshof. Gerhardt/Holm nennen 17 Mrd. € als ohne zusätzliche Mittel refinanzierbar; ihre Finanzierungsannahmen liegen nur als Kurzfassung vor, die Aussage ist deshalb nicht nachrechenbar.

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Ausgangsmiete | 6,39 €/m² | 6,39 | Mietsenkungsmodell 7,63 → 6,39 €/m² | Bernt/Holm, S. 12 (Tab. 2) | ✓ |
| Mietsteigerung | 1,6 %, auch in der Anfangsphase | 1,6 | Landeseigene 2016–2021, Trendfortschreibung | S. 22 (Tab. 6) | ✓ |
| Entschädigung | 55,69 % = 17,0 Mrd. € | 54,8 % | Gerhardt/Holm 2021: Ertragswert mit LWU-Mieten 17 Mrd. € | DWE 2022, S. 112 | ✓ |
| Bestand | 240.000 × 61 m² | 240.000 × 62 | Studie: 222.183 Whg. à 63 m²; die 17 Mrd. € beziehen sich auf den ganzen Bestand | S. 12 (Tab. 2) | ü Rechnungshof |
| Bewirtschaftung | 2,86 €/m² + 2 % Mietausfall | 2,98 | Instandsetzung 18,54 + Modernisierung 6,53 €/m² p. a. der Landeseigenen = 2,09; Verwaltung 0,47, Betriebskosten 0,30 | S. 23 (Tab. 8, 9) | ≈ Bausteine RH |
| Finanzierung, Inflation, Bewertung | wie Rechnungshof | 4,2 %, 2 % | keine Angabe | – | ü Rechnungshof |

## Rechnungshof (2024), Preset `rechnungshof`

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Bestand | 240.000 × 61 m² | 240.000 × 62 | 240.000 Whg., 61 m² | RH, S. 25 | ✓ |
| Ausgangsmiete | 7,16 €/m² | 7,16 | Mietspiegel 2023 | S. 9, 25 | ✓ |
| Mietsteigerung | 1 % im 2. Jahr, danach 2 % | 2,0 | 1 % bis 2024, 2 % ab 2025 | S. 26 | ✓ |
| Kosteninflation | 10 % in Jahr 1 und 2, danach 2 % | 2,0 | 10 % bis 2024, 2 % ab 2025 | S. 26 | ✓ |
| Bewirtschaftung | 3,20 €/m² + 2 % Mietausfall | 3,34 bei 62 m² | Verwaltung, Instandhaltung, Betriebskosten, Modernisierung rd. 12 €/m², Mietausfall 2 % | S. 25–26 | ✓ |
| Finanzierung | AöR 80 % zu 4,5 %, Land 20 % zu 3,0 %, je 30 Jahre | 4,2 % auf 100 % | 80 % Fremdkapital AöR, 20 % Eigenkapital Land | S. 11, 27 | ✓ |
| Entschädigung | 95,01 % = 29,0 Mrd. € | 100 % = 31,0 | Szenarien 8, 11, 29, 36 Mrd. € | S. 11–13 | ✓ (Preset 29; `pruefung.js` rechnet alle vier) |
| Bewertung | Barwert, 3,15 % ab Beginn Jahr 1 | nominal | Kapitalwerte; Zinsstrukturkurve + 75 bp | S. 27, 30 | ≈ fester Satz, an Ansicht 12 angepasst |
| Betrachtungszeitraum | 32 Jahre | 50 | Planungszeitraum 32 Jahre | S. 9 | ✓ |

Anfangsphase: Die Kennzahl Verschuldung/EBITDA (Ansicht 8, S. 29) ergibt für Jahr 1 ein EBITDA von 804 Mio. €; das trifft das Modell (807 Mio. €) nur, wenn die Inflation von 10 % schon im ersten Jahr auf die Kostenansätze wirkt und die Miete erst im zweiten Jahr steigt. So rechnet die Anfangsphase.

## IW/Empirica (2026), Preset `gegenmodell`

Das Gutachten rechnet kein eigenes Ergebnis der AöR. Die Position ist die Rechnung des Rechnungshofs (29 Mrd. €) mit den Einwänden des Gutachtens; alle übrigen Werte sind die des Rechnungshofs (`pruefung.js` prüft das).

| Parameter | Modell | vorher | Quelle | Fundstelle | Befund |
|---|---|---|---|---|---|
| Modernisierung | 19 €/m² p. a. → Bewirtschaftung 3,78 €/m² | 3,93 bei 62 m² | 13–25 €/m² p. a. bei LEG, Vonovia, VivaWest; Holm et al. 2025 setzen 6–12 an | IW, S. 17 | ≈ Mitte der Spanne |
| Kosteninflation | 2,7 % nach der Anfangsphase | 2,7 | Inflation voraussichtlich 2,7 % (März 2026) | S. 17 | ✓ |
| Einmalige Kosten | 200 Mio. € | 200 (alle Positionen) | Integrationskosten Vonovia/Deutsche Wohnen, eher Untergrenze | S. 17 | ✓ |
| Mehrkosten Landesschulden | 400 Mio. € pro Jahr | +0,5 Pp. auf den Kredit | +0,5 Pp. Risikoprämie auf die Landesschulden = rd. 400 Mio. € pro Jahr | S. 23 | ✓ |
| Ausgangsmiete, Finanzierung, Bestand | wie Rechnungshof | 7,63 €/m², 4,2 % | keine Angabe | – | ü Rechnungshof |

## Gemeinsame Annahmen (`defaults`)

| Parameter | Modell | vorher | Quelle | Befund |
|---|---|---|---|---|
| Einmalige Kosten | 0 | 200 Mio. € | nur IW/Empirica nennt Integrationskosten | 0 |
| Eigenkapitalanteil, Mehrkosten Landesschulden, Mietausfallwagnis, Anfangsphase | 0 bzw. keine | – | je Position aus der Quelle | 0 |
| Fehlbeträge verzinsen | aus | – | keine Quelle rechnet so | aus |
| Bewertung | nominal, Abzinsung 3,15 % wenn Barwert | nominal | Rechnungshof | – |
| Referenz freier Markt | 16,75 €/m², +6,0 %/Jahr | 15,80 €/m², +3 % ohne Quelle | Angebotsmiete Anfang 2012 7,40, Anfang 2026 16,75 €/m² | IW, S. 12 | ✓ (Rate eigene Rechnung) |
| Verkehrswert | 2.085 €/m² | 2.085 | Modellannahme in der Spanne des Gutachterausschusses (1.634–4.247 €/m²); Liegenschaftszinssätze 2025, S. 16 | – offengelegt |
| Sanierungsstau, Integrationskosten (%) | 0 | 0 | keine Quelle | 0 |

## Regler

- Entschädigungsquote `step="0.01"` (Summen der Quellen exakt), Anzahl Wohnungen `step="1000"` (243.000), Mietsteigerung und Kosteninflation `step="0.01"` (0,43 %).
- Neu: Eigenkapitalanteil und Zins des Landes, Mehrkosten Landesschulden, Fehlbeträge verzinsen, Anfangsphase (Jahre, Inflation, Mietsteigerung), Mietausfallwagnis, Steigerung freier Markt, Bewertung (nominal/Barwert) mit Abzinsungssatz.

## Ergebnis der Quelle und Modell

`node pruefung.js`, Stand 15.10.2026: alle Prüfungen bestanden.

| Position | Ergebnis der Quelle | Modell | Toleranz |
|---|---|---|---|
| Rechnungshof, Ansicht 12 (S. 30) | Jahreswerte 1–10 für 8, 11, 29, 36 Mrd. € | größte Abweichung 17 Mio. € (8 Mrd.), 15 (11), 12 (29), 12 (36) | 25 Mio. € |
| Rechnungshof, Ansicht 4 (S. 18) | Ø nach 10/20/30 Jahren, 29 Mrd.: −717 / −576 / −464 Mio. € | −711 / −576 / −467 | 25 Mio. € |
| Rechnungshof, Ansicht 6 (S. 21) | erforderliche Ausgangsmiete 6,3 / 7,2 / 12,1 / 14,1 €/m² | 6,17 / 7,02 / 12,10 / 14,08 | 0,2 €/m² |
| Rechnungshof, Ansicht 12 | Gewinnschwelle 29 und 36 Mrd.: 31. Jahr | 31. Jahr | – |
| Faire-Mieten-Modell (S. 96, 102) | 10 Mrd. € = Reinertrag aus 40 Jahren, aus den Mieten bedient | Reinertrag 10,08 Mrd. €, Saldo Jahr 40 +0,08 Mrd. €, tiefster Stand −0,18 Mrd. € | Saldo ≥ 0 |
| DWE-Gesetzentwurf (PwC, S. 3) | ohne Mieterhöhungen und Haushaltsmittel refinanzierbar | kumulierter Saldo nie negativ (tiefster Stand +0,23 Mrd. €), Fehlbeträge nur in Jahr 97–100 | Saldo ≥ 0 |
| IW/Empirica | kein eigenes Ergebnis | weicht vom Rechnungshof nur in Modernisierung, Inflation, Integrationskosten, Landesschulden ab | – |
| Bernt/Holm | nur Mieten | 6,39 €/m², +1,6 %; unter den Bedingungen des Rechnungshofs Ø −263 Mio. € pro Jahr (Jahre 1–10) | – |

Bei 8 und 11 Mrd. € liegt das Modell in allen Jahren 12–17 Mio. € über dem Bericht; die Ursache ist offen (vermutlich die Zinsstrukturkurve).

## Wirkung (Modellrechnung, Voreinstellung der Position)

| Position | Kaufpreis (Mrd. €) | Ergebnis AöR, Ø Jahr 1–10 (Mio. €) | Nettoergebnis (Mrd. €) | Zeitraum, Bewertung |
|---|---|---|---|---|
| Faire-Mieten-Modell | 10,0 (vorher 9,9) | −14 | +0,1 | 40 Jahre, nominal |
| DWE-Gesetzentwurf | 15,75 (15,8) | +219 | +11,6 | 100 Jahre, nominal |
| Bernt/Holm | 17,0 (17,0) | −263 | −8,0 | 32 Jahre, Barwert |
| Rechnungshof | 29,0 (31,0) | −711 | −19,1 | 32 Jahre, Barwert |
| IW/Empirica | 29,0 (31,0) | −843 | −32,9 | 32 Jahre, Barwert |

Das Nettoergebnis enthält den Kapitaldienst des Landes für den Eigenkapitalanteil (Rechnungshof: rd. 300 Mio. € pro Jahr) und bei IW/Empirica die Mehrkosten der Landesschulden.

## Offen

- Gerhardt/Holm (2021): nur Kurzfassung (DWE 2022, S. 112); deren Finanzierungsannahmen fehlen.
- Holm et al. (2025), von IW zitiert (8–11 Mrd. €, Modernisierung 6–12 €/m²), liegt nicht im Projektordner.
- DWE-Factsheet 2025 (14,5–17,0 Mrd. €, Mieten) nur über PwC belegt.
- Rechnungshof, Ansicht 5 (Finanzierungszeitraum bis 80 Jahre, Zuschuss zur Zinsdeckung 6,7 und 12,3 Mrd. €): rechnet mit flexibler Tilgung aus den Mieterlösen; das bildet das Modell nicht ab.
- Voreinstellung ohne Position (`defaults`: 7,63 €/m², 1,5 %, 2,5 %, 40 %, 3,5 % mit Zinsänderung nach 10 Jahren) ist freier Startwert ohne Quelle.
