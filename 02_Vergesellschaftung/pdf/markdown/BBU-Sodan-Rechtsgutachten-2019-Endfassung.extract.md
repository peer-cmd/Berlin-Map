# Extraction — Sodan-Rechtsgutachten für den BBU (2019, Endfassung)

Source: `pdf/BBU-Sodan-Rechtsgutachten-2019-Endfassung.pdf` → markdown (108 pages)
Commissioned by BBU Verband Berlin-Brandenburgischer Wohnungsunternehmen (landlord association). Concludes the "Deutsche Wohnen & Co. enteignen" socialization law would be unconstitutional. Read via its own "Zusammenfassung in Leitsätzen" (22 headline theses, pp.102–108).

## Data

- **Compensation cost estimates for the full DW&E socialization (as of 2019), all cited in the doc (Leitsatz 2):**
  - DW&E initiative's own estimate: **€7.3–13.7 billion**
  - BBU's own (conservative) estimate: **€25 billion**
  - Official cost estimate, Senatsverwaltung für Inneres und Sport: **€28.8–36 billion**
- **DW&E's proposed financing structure (Leitsatz 15):**
  - 20% of the compensation sum funded by Land Berlin via an Eigenkapitaleinlage (equity injection) into the new AöR
  - 80% financed via loans raised by the AöR itself, backed by Land-Berlin guarantees (Bürgschaften) where needed
- **Senate's own financing estimate (Leitsatz 15):**
  - Land Berlin's required Eigenkapitaleinlage (equity, incl. further one-off costs): **≈ €6–8 billion**
  - AöR credit volume: **€23–28.8 billion**
  - Threshold for applying the law: **> 2,999 (i.e. ≥ 3,000) Wohnungen** per company (Leitsatz 21)
- Legal-institutional facts: Art. 15 S.1/2 GG, Art. 14 Abs. 3 S.3/4 GG; Berlin state constitution Art. 23 Abs.1 VvB (property guarantee, "inhaltsgleich" with Art. 14 GG); Schuldenbremse Art. 109 Abs. 3 GG binding from budget year 2020 (Art. 143d Abs.1 S.4 GG).

## Relational / Modeling

- **Headline legal conclusion on compensation basis (Leitsatz 22):** "Ausgangspunkt der Abwägung ist der Verkehrswert des Objekts" — market value is the mandatory starting point for compensation under Art. 14 Abs. 3 S. 3 GG (applied to Art. 15 via S. 2). Deviations are possible when general-interest or affected-party circumstances justify them **in the individual case**, but a compensation level fixed generically "deutlich unterhalb des Marktwertes" (clearly below market value) is impermissible.
  → This is the direct counter-position to the Expertenkommission majority's "hypothetical Ertragswert / fiscal affordability" approaches (see `Expertenkommission_2023...extract.md`): Sodan's opinion treats Verkehrswert as a floor, not merely a ceiling or reference point.
- **Financing-structure relation embedded in the DW&E proposal:**
  `Gesamtentschädigung = 0.20 × Gesamtentschädigung (Landeszuschuss/Eigenkapital) + 0.80 × Gesamtentschädigung (AöR-Kredit, Land-verbürgt)`
  Applied to the low/high cost estimates this implies a Land-Berlin equity contribution of roughly €1.5–2.7bn (20% of €7.3–13.7bn, DW&E's own figures) up to the Senate's own €6–8bn estimate (which is not simply 20% of its €28.8–36bn figure, since it also includes "weitere einmalige Kosten" — one-off transaction/setup costs — layered on top of the equity share).
- **Debt-brake constraint relation:** if the AöR's raised credit (€23–28.8bn per Senate estimate) is treated as attributable to the Land Berlin budget (zugerechnet), this is argued to conflict with the Schuldenbremse (Art. 109 Abs. 3 GG) — i.e., in this model, off-balance-sheet AöR debt vs. on-balance-sheet Land debt is a first-order legal/fiscal risk variable, not just a modeling nicety.
- No explicit valuation formula (Ertragswert/DCF) is reproduced in this excerpt — the opinion argues from legal doctrine on the *Verkehrswert-as-floor* principle rather than presenting its own numerical model; the €25bn / €28.8–36bn figures are external inputs the opinion cites, not derived within it.
