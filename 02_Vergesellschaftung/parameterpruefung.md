# Die Parameter der fünf Positionen

Prüfung der Voreinstellungen in `model-calc.js` (`defaults`, `presets`) gegen die Quellen in `pdf/`. Stand 06.10.2026. Seitenangaben nach PDF-Seite, wie in `quellenbelege.md`.

Befund: **✓** belegt · **≈** gerundet oder zulässig vereinfacht · **✗** weicht von der Quelle ab · **–** keine Quelle, Modellannahme.
Spalte „Modell“: Wert nach der Korrektur der Mietsteigerung vom 06.10.2026; in Klammern der Wert davor.

## Faire-Mieten-Modell (DWE 2022), Preset `linke`

| Parameter | Modell | Quelle | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|---|
| Ausgangsmiete | 3,70 €/m² | 4,04 €/m² leistbare Miete (Gesetzentwurf 2022); 3,70 €/m² nur in einer Fußnote eines Fremdbeitrags | DWE 2022, S. 102 (4,04); S. 117, Fn. 15 (3,70) | ✗ | 4,04 |
| Bewirtschaftungskosten | 40 % der Miete = 1,48 €/m² | 2,76 €/m² (Instandsetzung 2,00, Verwaltung 0,68, Mietausfall 0,08) | DWE 2022, S. 97, 102 | ✗ | absolut 2,76 €/m² |
| Mietsteigerung | 0,4 % (0,5 %) | 0,43 %/Jahr, Reallohnentwicklung 1991–2019 | DWE 2022, S. 97 | ≈ | – |
| Kosteninflation | 0,4 % (2,5 %) | dieselben 0,43 %/Jahr für die Bewirtschaftungskosten | DWE 2022, S. 97 | ≈ | – |
| Entschädigung | 43 % = 14,0 Mrd. € (im Modell-Regler 45 % = 14,6 Mrd. €, s. u.) | 10 Mrd. € (243.000 Whg., 62 m²); früher 7,3–13,2 Mrd. €; IW zitiert 8–11 Mrd. € | DWE 2022, S. 102; S. 10; IW 2026, S. 8 | ✗ | 30,7 % = 10,0 Mrd. € |
| Finanzierung | Kredit 3,5 %, 30 Jahre | unverzinste Schuldverschreibungen, 40 Jahre, Tilgung 1/40 pro Jahr | DWE 2022, S. 96 | ✗ | Zins 0 %, Laufzeit 40, Zinsbindung 40 |
| Grunderwerbsteuer | in „Einmalige Kosten“ nicht getrennt | 0 % für Vergesellschaftungen | DWE 2022, S. 99 | – | s. gemeinsame Annahmen |

## DWE-Gesetzentwurf (2025), Preset `dwe2025`

| Parameter | Modell | Quelle | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|---|
| Bestand | 220.000 | ≈ 220.000 laut PwC-Zitat | PwC, Fn. 1–2 | ✓ | – |
| Entschädigung | 50 % = 14,9 Mrd. € | 14,5–17,0 Mrd. € bzw. 40–60 % (Factsheet, über PwC) | PwC, Fn. 1–2 | ✓ | – |
| Finanzierung | 3,5 %, 100 Jahre | Schuldverschreibungen, fester Zins 3,5 %, Tilgung über 100 Jahre | Gesetzentwurf 2025, S. 7 | ✓ | – |
| Ausgangsmiete | 3,70 €/m² | Entwurf nennt keine Miete | – | – | dem Faire-Mieten-Modell folgen (4,04), falls dort geändert |
| Mietsteigerung | 0,4 % (0,5 %) | keine Angabe | – | – | übernommen vom Faire-Mieten-Modell |
| Bewirtschaftung, Kosteninflation | 40 %, 2,5 % | keine Angabe | – | – | dem Faire-Mieten-Modell folgen (2,76 €/m², 0,4 %) |

## Bernt/Holm (2023), Preset `holm`

| Parameter | Modell | Quelle | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|---|
| Ausgangsmiete | 6,29 €/m² | Mietsenkungsmodell: 7,63 → **6,39 €/m²**; 6,29 ist der LWU-Wert 2021 | Bernt/Holm, S. 12 (Tab. 2); S. 22 (Tab. 6) | ✗ | 6,39 |
| Mietsteigerung | 1,6 % (1,5 %) | LWU 2016–2021: 1,6 %/Jahr, Trendfortschreibung | S. 11, S. 22 (Tab. 6) | ✓ | – |
| Entschädigung | 73,8 % = 24,0 Mrd. € (im Modell-Regler 75 % = 24,4 Mrd. €) | Studie nennt keine Summe. Holm (mit Gerhardt 2021): Ertragswert mit LWU-Mieten **17 Mrd. €**; bis 17 Mrd. € aus Mieten refinanzierbar | DWE 2022, S. 112 | – | 52,3 % = 17,0 Mrd. € |
| Bewirtschaftungskosten | 35 % = 2,20 €/m² | keine Gesamtangabe; LWU Instandsetzung 18,54 + Modernisierung 6,53 €/m² p. a. = 2,09 €/m² im Monat, ohne Verwaltung | S. 23 (Tab. 8, 9) | – | belassen, als Annahme kennzeichnen |
| Kosteninflation | 2,0 % | keine Angabe | – | – | – |
| Finanzierung | 3,5 %, 30 Jahre, keine Zinsänderung | keine Angabe | – | – | – |

## Rechnungshof (2024), Preset `rechnungshof`

| Parameter | Modell | Quelle | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|---|
| Ausgangsmiete | 6,71 €/m² | **7,16 €/m²** (Mietspiegel 2023) | RH, S. 9, 25 | ✗ | 7,16 |
| Mietsteigerung | 2,0 % (1,5 %) | 1 % bis 2024, 2 % ab 2025 | RH, S. 11, 26 | ≈ | – |
| Kosteninflation | 2,0 % | 10 % bis 2024, 2 % ab 2025 | RH, S. 11, 26 | ≈ | – |
| Bewirtschaftung | absolut 2,20 €/m² | Verwaltung 343,69 €/Whg., Instandhaltung 17,18, Betriebskosten 3,60 €/m² p. a. **plus** Modernisierung rd. 12 €/m² p. a. **plus** Mietausfallwagnis 2 % | RH, S. 25–26 | ✗ | 3,30 €/m² (2,17 + 1,00 Modernisierung + 0,14 Mietausfall, bei 65 m²) |
| Zins | 3,5 %, nach 10 Jahren +1,0 Pp. | AöR 4,5 % (80 % Fremdkapital), Land 3,0 % (20 % Eigenkapital), beide 30 Jahre fest; gewichtet 4,2 % | RH, S. 27 | ✗ | 4,2 %, Zinsbindung 30, Aufschlag 0 |
| Laufzeit | 30 Jahre | 30 Jahre | RH, S. 9, 27 | ✓ | – |
| Entschädigung | 100 % = 32,5 Mrd. € | Szenarien 29 und 36 Mrd. € (32,5 = Mitte) | RH, S. 12, 23 | ✓ | – |
| Wohnungsgröße | 65 m² | 61 m² | RH, S. 25 | ≈ | gemeinsame Basis, bereits offengelegt |
| Sanierungsstau | 20.000 €/Whg. (gemeinsam) | „noch nicht berücksichtigt“; Ergebnis daher Untergrenze | RH, S. 11 | – | s. gemeinsame Annahmen |

## IW/Empirica (2026), Preset `gegenmodell`

| Parameter | Modell | Quelle | Fundstelle | Befund | Vorschlag |
|---|---|---|---|---|---|
| Entschädigung | 100 % = 32,5 Mrd. € | eigene Summe fehlt; zitiert Senat 29–39 Mrd. € | IW, S. 8 | ≈ | – |
| Ausgangsmiete | 7,63 €/m² | IW nennt keine; 7,63 = Konzerne 2021 (Bernt/Holm); PwC: Adler/Vonovia 2024/25 8,39 €/m² | Bernt/Holm, S. 12; PwC | – | belassen oder 8,39 (aktueller) |
| Risikoprämie | +0,5 Pp. | „Selbst eine geringe zusätzliche Risikoprämie von 0,5 Prozentpunkten“, bezogen auf die Landesschulden (≈ 400 Mio. €/Jahr) | IW, S. 23 | ≈ | belassen; Übertragung auf den AöR-Kredit kennzeichnen |
| Zinsbindung, Zinsänderung | 5 Jahre, +2,0 Pp. | keine Angabe | – | – | als Annahme kennzeichnen |
| Kosteninflation | 3,0 % | keine Angabe; erwartete Inflation 2,7 % (März 2026) | IW, S. 17 | – | 2,7 oder als Annahme kennzeichnen |
| Mietsteigerung | 1,5 % | keine Angabe | – | – | als Annahme kennzeichnen |
| Bewirtschaftung | 40 % = 3,05 €/m² | keine Gesamtangabe; Modernisierung 13–25 €/m² p. a. bei LEG, Vonovia, VivaWest | IW, S. 17 | – | als Annahme kennzeichnen |

## Gemeinsame Annahmen (alle Positionen)

| Parameter | Modell | Quelle | Fundstelle | Befund | Anmerkung |
|---|---|---|---|---|---|
| Bestand | 240.000 | DWE ≈ 240.000; RH rd. 240.000; Sodan bis 243.000; Bernt 222.183 | `zahlen.html`, Fn. 1, 5, 6 | ✓ | – |
| Wohnungsgröße | 65 m² | RH 61; Senat 62; DWE 2022 62; Bernt 63 | RH, S. 25; DWE 2022, S. 102; Bernt, S. 12 | ✗ | keine Quelle nennt 65; 62 ist der häufigste Wert |
| Verkehrswert | 2.085 €/m² | Gutachterausschuss: Mittel 2.644, Spanne 1.634–4.247 €/m² | Liegenschaftszinssätze 2025, S. 16 | – | bereits als Modellannahme offengelegt |
| Einmalige Kosten | 405 Mio. € | in keiner Quelle; Senat: Erwerbsnebenkosten 1,5–2,9 Mrd. € bei Verkehrswert; DWE: Grunderwerbsteuer 0 % | Sodan, S. 68; DWE 2022, S. 99 | – | Herkunft klären |
| Sanierungsstau | 20.000 €/Whg. = 4,8 Mrd. € | in keiner Quelle; Glossar nennt ihn „illustrativ“ | `content.js` | – | belastet alle Positionen gleich; RH rechnet ohne |
| Integrationskosten | 2 % des Kaufpreises | IW: Vonovia kalkulierte 200 Mio. € für die Fusion mit Deutsche Wohnen | IW, S. 17 | – | als % des Kaufpreises steigen sie mit der Entschädigung (14 Mrd. → 280 Mio., 32,5 Mrd. → 650 Mio.); ein fester Betrag wäre sachgerechter |

## Fehler im Modell: Regler „Entschädigungsquote“

Der Regler hat `min="40" step="5"`. Der Browser rundet 43 auf 45 und 73,8 auf 75 (in Chromium geprüft). Die Schaltflächen auf der Modellseite rechnen daher mit 14,6 und 24,4 Mrd. €, die Grafik auf „Die Zahlen“ mit 14,0 und 24,0 Mrd. €. Werte unter 40 % (Vorschlag 30,7 %) sind nicht einstellbar. Vorschlag: `min="20" step="0.1"`.

## Wirkung (Modellrechnung, 50 Jahre)

| Position | Stand vor 06.10. | Nach Korrektur Mietsteigerung | Mit allen Vorschlägen |
|---|---|---|---|
| Faire-Mieten-Modell | 14,0 Mrd. €; Ø Cashflow J. 1–10 −362 Mio. €; Netto −16,1 Mrd. € | −337 Mio. €; −5,3 Mrd. € | 10,0 Mrd. €; −6 Mio. €; −2,2 Mrd. € |
| DWE-Gesetzentwurf | 14,9; −174; −20,8 | −177; −21,7 | unverändert, solange Miete/Kosten nicht dem Faire-Mieten-Modell folgen |
| Bernt/Holm | 24,0; −496; +7,1 | −490; +9,5 | 17,0; −97; +21,9 |
| Rechnungshof | 32,5; −875; −4,5 | −844; +9,2 | 32,5; −1.136; −2,5 |
| IW/Empirica | 32,5; −1.216; −31,9 | unverändert | unverändert |

## Abgleich mit dem Rechnungshof

Der Rechnungshof nennt für 29 Mrd. € Zuschüsse von rd. 700 Mio. €/Jahr, für 36 Mrd. € rd. 1 Mrd. €/Jahr in den ersten zehn Jahren (S. 23). Mit seinen eigenen Parametern rechnet das Modell nach: 80 % der Summe als AöR-Kredit zu 4,5 % über 30 Jahre (die 20 % Eigenkapital trägt das Land gesondert), 7,16 €/m², 61 m², Bewirtschaftung 3,30 €/m², Mietsteigerung 2 %, ohne Sanierungsstau, Einmal- und Integrationskosten. Ergebnis: Ø Cashflow J. 1–10 −682 Mio. € (29 Mrd.) und −1.026 Mio. € (36 Mrd.). Die vorgeschlagenen Werte reproduzieren den Bericht damit auf wenige Prozent genau.

Für das Preset ergeben sich zwei Lesarten: (a) gewichteter Zins 4,2 % auf die volle Summe, das zeigt die Gesamtbelastung von AöR und Land (Ø −1.136 Mio. €); (b) 4,5 % auf 80 % der Summe, das entspricht der Kennzahl „Zuschüsse“ des Rechnungshofs (Ø −854 Mio. € bei 32,5 Mrd. € und 61 m², ohne Sanierungsstau). Die Tabelle oben schlägt (a) vor.
