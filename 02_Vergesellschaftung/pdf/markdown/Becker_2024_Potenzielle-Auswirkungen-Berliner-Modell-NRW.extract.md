# Extraction — Becker (2024), Potenzielle Auswirkungen des Berliner Modells auf NRW

Source: `pdf/Becker_2024_Potenzielle-Auswirkungen-Berliner-Modell-NRW.pdf` → markdown (81 pages). A thesis-style transferability/spatial-impact study, not a financial-valuation source — no compensation formulas. Its value here is (a) NRW housing-market data, (b) a legal-transferability survey, (c) a replicable spatial-counting methodology.

## Data

- Companies matching the Berlin ≥3,000-unit threshold, private/for-profit only (co-ops, municipal and church-affiliated providers excluded, per Expertenkommission 2023): **13 companies identified in the relevant scope**.
- Address/unit data availability: 11 of 13 companies disclose only currently-vacant listings (max 351 addresses found, TAG Immobilien); LEG discloses ≈3,200 addresses; Vonovia's 2016 portfolio list yielded ≈55,000 addresses covering **356,894 Wohneinheiten** → average **6.49 Wohneinheiten/address** (used as an extrapolation factor for addresses without unit counts). 55,275 addresses were geocoded (QGIS) in total.
- NRW housing-market context (via NRW.Bank, Holm et al. 2021, Statistisches Bundesamt):
  - Households not adequately/affordably housed: **NRW 1,340,042** (highest in Germany) vs. Berlin 694,442, Bavaria (Großstädte) 487,008.
  - NRW population ≈18 million, 8,717,000 households; 29 of Germany's 77 Großstädte are in NRW, housing 3,717,584 households (42.5% of NRW households).
  - Homelessness in NRW: +62.3% from 2021→2022, reaching 78,400 people (2022, likely undercounted).
  - Wohnungssuchend (actively housing-seeking) in NRW 2022: 1.1% of households = 195,100 people.
  - Sozialwohnungsbestand: NRW holds **40% of Germany's social housing stock**; fell from 527,300 units (2011) to 435,025 (current); Bavaria 133,129; Berlin 104,757; all other Länder <82,000. NRW's stock is projected to shrink a further **50% by 2035**.
- Hamburg comparison: "Hamburg enteignet" campaign proposed a 500-unit threshold (vs. Berlin's 3,000), estimated to affect 70,000–100,000 units = **9.6–13.7% of Hamburg's rental market**.
- Legal transferability: Art.-15-style socialization powers are **explicit** in the state constitutions of Bayern, Bremen, Hessen, Rheinland-Pfalz, Saarland; **implicitly available** (per cited legal opinions) in Brandenburg, NRW, Sachsen, Sachsen-Anhalt; not explicit in the remaining 7 Länder. All 8 reviewed legal opinions (commissioned by Die Linke's Bundestagsfraktion) found socialization constitutionally feasible **and none required market-value or speculative-profit-inclusive compensation**.

## Relational / Modeling

- No valuation/compensation formula in this document — it is entirely downstream of the compensation question, modeling instead *where* the affected housing stock is and *who* lives there.
- **Reusable extrapolation relation:** where only address counts (not unit counts) are available for a portfolio, `geschätzte_Wohneinheiten ≈ Adressen × 6.49` (empirical average units/address from the one company — Vonovia — with full disclosure). Useful as a placeholder multiplier if Peer's model needs to estimate portfolio size from incomplete address lists.
- **Spatial-impact method (transferable methodology, not a number):** buffer analysis at 2,500 m and 10 km around each address to measure clustering; cross-tabulation of address density against Mindestsicherungsquote/SGB-II quota (social segregation), Migrationshintergrund/Ausländeranteil (ethnic segregation), Soziale-Stadt/Quartiersmanagement program areas, existing Sozialwohnungsbestand per statistical area, and local average rents — used to argue that dense holdings in areas with low existing social-housing stock and higher segregation markers would have an outsized anti-displacement / rent-dampening effect if socialized. This is a plausible complementary (distributional/spatial) module to sit alongside Peer's financial model, but it does not itself supply valuation inputs.
- Confirms (again, independently) the qualitative finding already in the Expertenkommission/BBU-Sodan extracts: legal consensus across 8 independent opinions is that compensation need not track market value — this is corroborating context, not a new formula.
