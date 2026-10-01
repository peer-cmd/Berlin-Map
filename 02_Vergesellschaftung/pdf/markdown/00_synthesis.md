# Synthesis — Vergesellschaftung Financial Model Corpus

Combines the nine per-PDF extracts in this folder into one cross-referenced view: compensation/valuation, cost estimates, financing, rent modeling, and legal transferability. Each claim below names its source; see `<name>.extract.md` for the full extraction and `<name>.md` for the full text.

## 1. Compensation and valuation approaches

Three positions run through the corpus on what "compensation" (Entschädigung) means under Art. 15 GG:

- **Verkehrswert as a hard floor.** BBU-Sodan (Sodan 2019 legal opinion) argues market value is the constitutional minimum; anything below it risks unconstitutionality.
- **Verkehrswert as a starting point that can be discounted.** The Expertenkommission (2023) lays out three approaches, ranging from market-value-anchored to purpose-adjusted valuation with Sozialbindung discounts.
- **A purpose-built formula well below market value.** DW&E's own "Faire-Mieten-Modell" (DWE-Hg 2022) derives compensation from what a leistbare Miete (affordable rent, 4.04–5.35 €/m²) can service over 40 years, not from market comparables. Stoll (2022) confirms this is deliberate: the campaign's compensation proposal is explicitly "deutlich unter Marktwert."

The Expertenkommission's six-step framework (Arbeitsschritte 1–6) is the most complete integrated model in the corpus — it sequences valuation, Sozialbindung discount, and financing into one pipeline — and is the natural backbone for Peer's own model, with the other sources supplying parameters or alternative assumptions at each step.

## 2. Cost estimates compared

| Source | Estimate | Method / basis |
|---|---|---|
| BBU-Sodan (2019) | €7.3–39bn | Range across cited studies, Verkehrswert-anchored |
| DWE-Hg (2022) | €14.5–23bn (4 variants) | Faire-Mieten-Modell, 2013 Bodenrichtwert land valuation |
| Gutachten-Auswirkungen (2023/24, updated) | €8–11bn vs €29–39bn | Two-scenario split (discounted vs. Verkehrswert), using 2024 Vonovia–HOWOGE transaction as a market benchmark |

The spread is driven almost entirely by which valuation doctrine is applied (§1), not by disagreement over the underlying unit count (~222,000–240,000 units across sources). Gutachten-Auswirkungen is the most recent and the only one benchmarked against an actual 2024 transaction price, which makes it the more defensible current anchor.

## 3. Financing structure

- DW&E's own proposal: **20/80 equity/debt split**, financed via a **40-year, 0%-interest bond** (DWE-Hg 2022).
- DWE-Hg sets a **€17bn self-financing ceiling** — above this, the Faire-Mieten-Modell's own rent income cannot service the debt.
- Gutachten-Auswirkungen models **bank exposure at 70% leverage** and cites Berlin's public debt rising from €67bn to €76bn as the fiscal backdrop.
- The **France 1981/82 nationalization** is used by Gutachten-Auswirkungen as a real-world precedent for sovereign spread impact: a peak widening of 7.1 percentage points, offered as a bound on what a Berlin/German sovereign-risk reaction might look like.

Read together: the financing question is not just "how much compensation" (§2) but "how much of it is debt-serviceable from rent income at what leverage" — DWE-Hg's €17bn ceiling and Gutachten-Auswirkungen's 70%-leverage exposure model are complementary components of the same constraint, one from the revenue side, one from the balance-sheet side.

## 4. Rent modeling

- **DWE-Hg's Faire-Mieten-Modell**: leistbare Miete 4.04–5.35 €/m², Bewirtschaftungskosten 2.76 €/m², 15× multiplier for commercial rent, land valued at 2013 Bodenrichtwert.
- **Bernt-Studie (1/23)**: models post-socialization rents for ≈222,000 units across 6 companies, with two explicit scenarios:
  - *Mietsenkungsmodell*: immediate drop to the LWU benchmark (6.39 €/m²).
  - *Mietenstoppmodell*: freeze at current rent, converge gradually via turnover and a 2.3%/year reference-rent growth assumption.
  - Reusable formula: `Entlastung = (Bestandsmiete − Zielmiete) × Wohnungsgröße × 12`, yielding a weighted **929.80 €/household/year** relief figure.
- **Meldung_Bernt / 05-02-010-2500 Liegenschaftszinssatz regression**: `0.644 + 0.132×Objektmiete + 0.0013304×1096 [+0.167 for City/Ost/West]` — an independent valuation-parameter source usable to cross-check the land/yield assumptions feeding into either rent model.

DWE-Hg's target rent (4.04–5.35 €/m²) is *derived* from debt-service capacity; Bernt's target rent (6.39 €/m², the LWU average) is an *observed* benchmark. They are not the same number and should not be conflated in a combined model — Peer's model should treat them as two candidate target-rent inputs to the same relief-formula template (§4, Bernt) and see which is financially consistent with the €17bn ceiling (§3, DWE-Hg).

## 5. Distributional / WBS access effects

Bernt-Studie's WBS allocation formula — `WBS_Vermietungen/Jahr = Bestand × Fluktuationsrate (5%) × WBS-Quote (30% Bündnis / 63% LWU-parity)` — is a separate, bolt-on module: it takes a financing scenario's surviving unit count as given and models social-access outcomes, rather than feeding back into the compensation math. No other source in the corpus models this distributional layer.

## 6. Legal and geographic transferability

- Becker (2024) extends the Berlin model to NRW: 13 qualifying companies, a 6.49-units/address extrapolation multiplier, and notes an 8-Gutachten consensus that the legal mechanism (not the specific compensation formula) transfers across states.
- This means the valuation/financing debate in §1–§3 is Berlin-specific in its numbers but the underlying Art. 15 GG mechanism, per Becker's cited consensus, is not.

## 7. International and non-quantitative context

- OECD PH4.2 supplies comparative social-rental-housing stock benchmarks only — useful as an external sanity check on post-socialization stock size, not as a modeling input.
- Stoll (2022) is discourse analysis (framing, governance concepts for the proposed AöR, political risk) with no quantitative content; retained for argumentative/political context, not for the model.

## 8. Cross-reference gaps

- No source in the corpus reconciles the Bernt LWU-benchmark rent (6.39 €/m²) with the DWE-Hg debt-service-derived rent (4.04–5.35 €/m²) against a single balance sheet — this is the main synthesis gap a combined model would need to fill.
- The Verkehrswert-floor doctrine (BBU-Sodan) and the Sozialbindung-discount approach (Expertenkommission) are argued as alternatives but never quantified against each other on the same unit count — Gutachten-Auswirkungen's two-scenario €8–11bn/€29–39bn split is the closest the corpus comes to that comparison, and is the recommended pair of bounding cases for a Peer model.
