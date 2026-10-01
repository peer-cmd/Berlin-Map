# Extraction — DWE (Hg.), "Wie Vergesellschaftung gelingt" (2022)

Source: `pdf/DWE-Hg_2022_Wie-Vergesellschaftung-gelingt.pdf` → markdown (149 pages)
This is the "Deutsche Wohnen & Co enteignen" (DW&E) initiative's own book, including its full draft law text ("Gesetz zur Überführung von Wohnimmobilien in Gemeineigentum") with official Gesetzesbegründung (explanatory memorandum). This is the primary source for the "Faire-Mieten-Modell" compensation formula that other documents (Sodan, Expertenkommission) reference and critique.

## Data

**Faire-Mieten-Modell parameters (§5 Abs. 2 Nr. 1 draft law, as of 2021/22):**
- Anfängliche leistbare Nettokaltmiete: **4,04 €/m²/Monat**, derived as 60% of the median net household income of one-person households (1.074 €/month), with 30% Mietbelastung (bruttowarm), area cap 45 m² (1 person).
- Leistbare Höchstmieten by household size (60% of median income, various area caps): 4,04 €/m² (1 person, 45 m²) up to 5,35 €/m² (2 persons, 60 m², 1.611 €/month income); 3-person cap 75 m²; 4-person cap 85 m².
- Bewirtschaftungskosten deducted from leistbare Miete: **2,76 €/m²/month total**, composed of:
  - Erhaltungs-/Erneuerungsbeitrag: 2,00 €/m² (borrowed from Austrian WGG §14d)
  - Verwaltungskosten: 0,68 €/m² (from official Senate cost-estimate methodology)
  - Mietausfallwagnis: 0,08 €/m² (= 2% of Nettokaltmiete, industry standard)
- Both leistbare Miete and Bewirtschaftungskosten indexed at **+0,43%/year** (≈ geometric mean of real wage growth 1991–2019).
- Compensation payout period: **40 years** (= average depreciation period per § 7 Abs. 4 EStG).
- Compensation instrument: unverzinsliche (0%) Schuldverschreibungen (bonds), tradeable, amortized 1/40 per year — 0% rate justified as approximating then-current government bond yields, given the Reinertrag itself is indexed.
- Gewerberaum (commercial space) compensation: Ertragswert = **15× Jahresnettokaltmiete** (Ist-Miete, i.e. actual agreed rent, not leistbare Miete) — the 15× multiple is explicitly derived from §16 Abs. 2 PfandBG (bank Beleihungswert methodology). Rent cap for this calc: **21,48 €/m²/month** (derived from 2013 average 1b-Lage Berlin retail rent of 20 €, +7,41% inflation to 2020).
- Unbebaute Grundstücke (vacant land): compensated at Bodenrichtwert as of **1 January 2013**, plus inflation adjustment to Stichtag (2013 chosen to exclude post-2013 speculative land-price run-up).
- Threshold for the law's scope: **≥ 3,000 Wohnungen** per (parent+subsidiary) company; Stichtag for the draft law was the 2021 referendum date, with automatic re-triggering every 3 years (next: 26 Sept 2024).
- Ordnungswidrigkeit (regulatory fine) cap: up to **€20 million**.
- **Comparative total-compensation estimates (four independently derived models, Gerhardt/Holm 2021, Tagesspiegel):**
  - Based on outstanding credits/mortgages on the affected portfolios: **€23 billion**
  - Based on companies' own investment (purchase + modernization capex): **€16 billion**
  - Ertragswertberechnung using landeseigene (state-owned) companies' actual rent levels: **€17 billion**
  - Ertragswertberechnung using leistbare Mieten for low-income households (≈ the Faire-Mieten-Modell logic): **€14.5 billion**
  - All four fall well below the official Senate cost estimate of **€29–39 billion** (a slightly different range than the €28.8–36bn cited elsewhere — likely a later/updated official estimate).
  - **Self-financing threshold: up to ≈€17 billion compensation is refinanceable purely from ongoing rental income, without rent increases or extra public funds; above that, additional annual public funds would be needed over an extended period.**
- Public new-build cost context (same chapter): building 7,000 new dwellings/year requires ≈€250m/year; 10,000/year requires ≈€350m/year in public funds; landeseigene Wohnungsunternehmen profits fell from €352m (2015) to €259m (2019) — insufficient to self-fund this; actual delivery by state-owned companies runs at only ≈2,500 units/year against a 7,000/year target. DW&E's own socialization target: ≈240,000 apartments (→ >550,000 total public/social units, ≈1/3 of Berlin's rental stock, if landeseigene stock added).
- Housing-need context: Berlin needs ≈350,000 additional affordable (<6€/m²) dwellings, plus ≈90,000 Transferleistungsempfänger households where actual rent exceeds state-paid Kosten der Unterkunft.

## Relational / Modeling

- **Core Faire-Mieten-Modell formula:**
  `Reinertrag_t = leistbare_Miete_t − Bewirtschaftungskosten_t` (both indexed from a 2021/22 base at +0.43%/year)
  `Entschädigung = Σ_{t=1}^{40} Reinertrag_t` (i.e., the full 40-year stream of net income at capped/affordable rents is paid out as the compensation, in the form of amortizing non-interest-bearing bonds — effectively the compensation *is* the future income stream, not a lump-sum discounted present value).
  This is legally a "Zweckentschädigungsverfahren" (purpose-bound compensation procedure): a special Ertragswertverfahren where the *rent input* to the standard formula is the target post-socialization affordable rent, not the market/actual rent — this is precisely the approach both the BBU-Sodan opinion and (in part) the Expertenkommission majority hold unconstitutional (see other extract files) when generalized below full market value without individualized justification.
- **Gewerberaum sub-formula:** `Ertragswert_Gewerbe = 15 × min(Ist-Jahresnettokaltmiete, 21.48 €/m² × 12 × Fläche)` — a straight capitalization multiple (not a discounted stream), explicitly anchored to bank lending-value practice (§16 Abs.2 PfandBG), not a market Verkehrswert.
- **Vacant land sub-formula:** `Entschädigung_Boden = Bodenrichtwert(01.01.2013) × (1 + kumulierte Inflation bis Stichtag)` — using a pre-boom reference date rather than the current Bodenrichtwert, structurally identical in spirit to the "Stichtag vor Marktdynamik" idea floated (but not adopted) in the Expertenkommission report.
- **Financing relation (implicit no-budget-subsidy design):** `AöR-Mieteinnahmen (aus leistbarer Miete) − Bewirtschaftungskosten = Entschädigungszahlung (Tilgung Schuldverschreibung)`, i.e. compensation is designed to be a wash against rental cash flow by construction — the model's central financing claim is that Land Berlin bears no direct budget cost (bonds serviced from rent, 0% coupon, Land only liable as backstop guarantor). This is the direct empirical/legal target of the BBU-Sodan critique (Schuldenbremse exposure if AöR debt is imputed to the Land) and of the Expertenkommission's Arbeitsschritt 4 (which treats financing structure as a scenario variable rather than a given).
- **Self-financing-ceiling relation:** compensation levels feed monotonically into required public subsidy — below ≈€17bn, `öffentliche_Zuschüsse = 0`; above it, a "Finanzierungslücke" opens that scales with the excess over €17bn and must be closed by either extra annual public funds or higher rents (undermining the "Faire-Mieten" goal) — this is the key threshold/kink an integrated model should reproduce.
- Cross-reference: the 15× commercial multiplier and the §16 Abs.2 PfandBG Beleihungswert concept recur in the Expertenkommission report (as a *Sozialbindungs-discount mechanism* for residential compensation too) — worth treating as a shared building block across sources rather than reinventing separately.
