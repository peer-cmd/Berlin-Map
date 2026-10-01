# Extraction — Abschlussbericht der Expertenkommission zum Volksentscheid Vergesellschaftung (2023)

Source: `pdf/Expertenkommission_2023_Abschlussbericht-Vergesellschaftung.pdf` → markdown (158 pages)
This is the Berlin Senate's expert commission on Art. 15 GG socialization (majority opinion + Sondervoten). The single most important legal-methodological document in the corpus for compensation modeling.

## Data

- Commission composition on compensation question: 9 members (majority) vs. 3 members (Sondervotum) vs. 1 further separate statement.
- Three recognized valuation methods under § 199 Abs. 1 BauGB / ImmoWertV (¶247): **Vergleichswertverfahren**, **Ertragswertverfahren**, **Sachwertverfahren**. Ertragswertverfahren is the standard method for non-owner-occupied rental housing (¶247).
- §16 Abs. 2 PfandBG (Pfandbriefgesetz) — Beleihungswert methodology — cited as a precedent for a valuation method deliberately less sensitive to current market-price dynamics (¶254).
- Legal chain: Art. 15 S. 1, 2 GG → Art. 14 Abs. 3 S. 3, 4 GG (compensation via "gerechte Abwägung" / just balancing of community and individual interests) (¶209).
- Entitled parties (Beteiligte, ¶211–219): dinglich Berechtigte (registered property-right holders per Grundbuch) and Pfandrechtsinhaber (mortgage/lien holders) — **not** shareholders of the holding companies (Anteilseigner explicitly excluded, ¶214–219), even if share value falls as a result.

## Relational / Modeling

**Majority position on compensation basis (¶615–629, Executive Summary ¶42):** compensation for socialization (Art. 15) need not equal compensation for ordinary expropriation (Art. 14). Three sub-approaches proposed by (parts of) the majority:
1. Base compensation on the **returns from the intended nonprofit-oriented management** of the housing stock post-socialization (i.e., a hypothetical low-rent income stream).
2. Derive compensation from **abstract fiscal affordability limits** (what the state budget/rent-financed system can bear).
3. Base compensation on a **hypothetical Ertragswert** computed under constitutionally-permissible, compensation-free content/limit provisions (Schrankenbestimmungen) serving the same public-interest goals — i.e., an Ertragswert calculated using capped/regulated rather than market rents.
   A different subgroup within the majority insists Verkehrswert (market value) remains the mandatory starting point, but allows fiscal-affordability limits or hypothetical Ertragswert values to act as an **upper ceiling**, plus further discounts beyond what ordinary expropriation would allow.

**Minority (Sondervotum, 3 members, ¶631–636):** compensation must always start from Verkehrswert (market value), discounts from it are possible, but it may not fall as far below full expropriation compensation as the majority envisions. Also argues parent companies of Objektgesellschaften should be separately compensated for further financial damages.

**Rejected approach — DW&E's own "Zweckentschädigungsverfahren" (¶8952–8961, quoting Sondervotum Durner/Eichberger/Waldhoff):** valuing based on achievable income from rents set at what is "affordable for low/middle incomes" (Leistbarkeit) is explicitly held **unconstitutional** by (at least) part of the commission.

**Verkehrswert-side refinements even for the market-value camp (¶249–256):**
- `Compensation basis = Kaufpreis (purchase price paid) + Ausgleich für werterhöhende Verwendungen nach Erwerb` — **not** current market value — because value increases not attributable to the owner's "own contribution" (eigene Leistung) are "leistungslos" (unearned) and need not be compensated. This excludes gains from (a) public planning decisions and (b) general market dynamics/speculation.
  - Stichtag principle: for purchases after a reference date (proposed: date the referendum was approved by the Senat), Verkehrswert *at that Stichtag* applies instead of the purchase price.
- **Sozialbindung discount** (¶252–256): Art. 14 Abs. 2 GG social-obligation of property justifies an *additional* discount below Verkehrswert, on top of excluding unearned gains, precisely because housing has an unusually high degree of social function. Concrete mechanisms proposed:
  - Use the **Beleihungswert** (mortgage lending value per §16 Abs.2 PfandBG, deliberately smoothed/less market-sensitive) at time of purchase (or at Stichtag for later purchases) instead of Kaufpreis/Verkehrswert.
  - Or: use market prices from before the onset of the "besondere Marktdynamik" (the post-2010 low-interest-rate real estate boom).
  - Or: use a Verkehrswert computed via the **Sachwertverfahren** rather than Ertragswertverfahren (typically yields a lower figure for rental portfolios, since it doesn't capitalize achievable market rent).

**Synthetic modeling framework proposed in the Anhang (¶8986 ff., Arbeitsschritte 1–6) — directly usable as a model skeleton:**
1. **Arbeitsschritt 1** — build a synthetic housing portfolio (optionally split into sub-portfolios by condition/rent level relative to Mietspiegel); define a BAU (business-as-usual) counterfactual scenario with projected cash flows/rent increases.
2. **Arbeitsschritt 2** — compute compensation under multiple valuation approaches in parallel:
   - (a) **Freier Marktwert**: hypothetical arm's-length sale price in the current market.
   - (b) **Verkehrswert per ImmoWertV**: Ertragswertverfahren (primary), Sachwertverfahren (secondary/comparison).
   - (c) **DCF valuation**, varying: (i) future rent level assumption (BAU rents / frozen current rents / rents from 10 years ago / hypothetical constitutional federal rent cap), (ii) ongoing costs (maintenance, operating, financing), (iii) modernization/energy-retrofit capex and subsidy/Umlage assumptions, (iv) capital costs/discount rate (multiple scenarios: typical risk-adjusted housing-company cost of capital vs. regulated-network-industry cost of capital); plus (c.2) a reverse-engineered compensation level consistent with a target post-socialization rent level (the DW&E-style approach) for comparison purposes only.
   - Also benchmark against IFRS/HGB balance-sheet values and stock-market-implied values for listed comparables.
3. **Arbeitsschritt 2a/2b** — model one-off transaction costs to the *former* owners (Vorfälligkeitsentschädigung for loan payoff, "Auftrennungsaufwand"), and address the Art. 3 Abs. 1 GG equal-treatment problem across heterogeneous portfolios (acquisition date, condition).
4. **Arbeitsschritt 3** — one-off costs on the *state/AöR* side: notary/settlement costs, Grunderwerbsteuer (± Länderfinanzausgleich effects), valuation/advisory costs, AöR set-up and administrative transition costs, litigation-cost risk.
5. **Arbeitsschritt 4** — financing of the AöR: base assumption is **no budget subsidies** ("Schwarze-Null"-Annahme) — compensation payments must be refinanced entirely from future rental income; scenario variants include a state guarantee, full state capital provision (AöR reimburses financing cost), or DW&E's proposal of AöR/state-issued bonds (Schuldverschreibungen); model varies repayment (Tilgung) periods and interest-rate-risk approaches.
6. **Arbeitsschritt 5/5a** — operating-cost modeling of the AöR vs BAU (synergies, no cost-shifting into umlagefähige Betriebskosten, long-term efficiency focus, staff cost differences) and tax-revenue effects pre/post socialization.
7. **Arbeitsschritt 6** — aggregate rent-level trajectory comparison (post-socialization vs BAU) as a function of which compensation approach (Step 2) was chosen — this is the key output relationship the whole model is built to produce: **Entschädigungshöhe (approach chosen) → AöR financing structure/cost → achievable rent trajectory**, benchmarked against past Land-Berlin buyback experience.

This Arbeitsschritt sequence is essentially a ready-made architecture for Peer's financial model: Portfolio → BAU counterfactual → parallel compensation valuations (market/Verkehrswert/DCF) → one-off costs → AöR financing (debt, guarantee, tenor, rate) → operating cost model → resulting rent path, compared across compensation-methodology scenarios.
