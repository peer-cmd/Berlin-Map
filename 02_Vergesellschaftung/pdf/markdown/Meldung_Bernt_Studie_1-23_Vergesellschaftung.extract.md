# Extraction — Bernt/Holm-Studie 1/23: Wirkungen einer Vergesellschaftung

Source: `pdf/Meldung_Bernt_Studie_1-23_Vergesellschaftung.pdf` → markdown (23 pages). Impact study modeling post-socialization rent trajectories and housing-supply/segregation effects for ≈222,000 units held by 6 large Berlin landlords (Adler/ADO, Grand City Properties, Heimstaden/Akelius, Vonovia, Deutsche Wohnen, Covivio), benchmarked against Berlin's landeseigene Wohnungsunternehmen (LWU).

## Data

**Portfolio and current rents (Tabelle 2, 2021 data):**
| Unternehmen | Bestand Berlin | Ø Wohnungsgröße | Ø Bestandsmiete/m² |
|---|---|---|---|
| Adler/ADO | 19,830 | 69 m² | 8.71 € |
| Grand City Properties | 8,025 | 72 m² | 8.70 € |
| Heimstaden/Akelius | 18,577 | 64 m² | 9.36 € |
| Vonovia | 45,838 | 64 m² | 7.10 € |
| Deutsche Wohnen | 113,202 | 59 m² | 7.15 € |
| Covivio | 16,711 | 68 m² | 8.20 € |
| **Gesamt** | **222,183** | **63 m²** | **7.63 €** |

- Target rent level (current LWU average, 2021): **6.39 €/m²** (net cold).
- Historical rent series (Abb. 4/5): Konzerne 2016 ≈ 5.80 €/m² → 2021 = 7.63 €/m²; LWU 2016 ≈ 6.30 €/m² → 2021 = 6.39 €/m²; trend-extrapolated to 2030 under two scenarios (see below).
- Per-company absorption of the rent cut ("Absenkung je m²" = current − 6.39€, "Entlastung pro Wohnung/Monat"): ranges from Vonovia (0.71 €/m², 45.34 €/month) and Deutsche Wohnen (0.76 €/m², 45.07 €/month) up to Heimstaden/Akelius (2.97 €/m², 189.24 €/month).
- **Weighted average relief: 929.80 €/household/year ≈ 16% of Nettokaltmiete.**
- Ortsübliche Vergleichsmiete (comparable market rent) assumed growth: **+2.3%/year**.
- WBS (Wohnberechtigungsschein, social-housing eligibility) demand data (2021/22): ≈969,000 Berlin households WBS-eligible; 45,608–49,834 WBS holders unable to find a WBS-eligible unit; 40,000–45,000 new WBS approvals/year; assumed acute annual need = **50,000 WBS households/year**.
- LWU supply to WBS holders: avg. 9,349 units/year (2016–2021) ≈ 1/5 of the waiting list.
- "Bündnis" voluntary agreement: large landlords (>3,000 units) pledge 30% of re-lets to WBS holders — but only Vonovia/Deutsche Wohnen (≈160,000 units) are actually signed on; at an assumed 5%/year fluctuation (turnover) rate this yields **2,836 additional WBS placements/year**.
- Post-socialization scenario: if socialized stock follows the **same WBS-allocation quota as LWU (63% of re-lets)**, at 5% fluctuation on 222,000 units → **6,999 units/year** to WBS holders, i.e. **4,613 more/year** than the Bündnis scenario → total supply potential rises to **16,348 units/year** (vs. 9,349 status quo, 11,735 under Bündnis).
- Cumulative modeled "Versorgungseffekt" to 2030 (static model, no new in-migration/income change assumed): **≈150,000 households housed** — exceeds the current WBS-eligible count, illustrating the model is a stock-depletion approximation, not a steady-state one.
- Segregation data: Steglitz-Zehlendorf holds ~1/10 the landeseigene-Wohnungen stock of Lichtenberg, and builds ~1/10 the geförderter-Neubau — used to argue socialized stock (spread across all 6 companies' locations) would be spatially more even than new construction, which concentrates at the periphery/East.

## Relational / Modeling

- **Two explicit rent-path scenarios, both anchored on trend-extrapolation of 2016–2021 growth rates for Konzerne and LWU separately, then diverging post-socialization:**
  1. **Mietsenkungsmodell (rent-cut model):** `Miete_sozialisiert(2023) = LWU-Niveau (6.39 €/m²)` immediately, i.e. an instantaneous drop from 7.63 to 6.39 €/m², then grows slowly thereafter (implicitly tracking the LWU trend growth rate). This is the aggressive/immediate-relief scenario.
  2. **Mietenstoppmodell (rent-freeze model):** existing (above-LWU-level) rents are **frozen** at their current level per household until the LWU comparison level "catches up" via the LWU's own trend growth; re-let (Wiedervermietung) rents are set to the ortsübliche Vergleichsmiete (local reference rent, growing at 2.3%/year), so the average blends down gradually via tenant turnover rather than a step change. Slower, but described as producing a comparable long-run price-dampening effect market-wide (because socialized rents feed into future Mietspiegel).
- **Reusable rent-relief formula:** `Entlastung_Unternehmen = (Bestandsmiete_2021 − 6.39€/m²) × Ø_Wohnungsgröße × 12` gives the annual per-household saving; aggregated with portfolio weights gives the 929.80 €/household/year headline figure. This is a directly reusable template for Peer's model if he wants a rent-relief output conditional on whatever target rent his own compensation/financing scenario implies (i.e., swap in a model-derived target rent instead of the fixed 6.39€ LWU benchmark).
- **WBS supply-allocation formula:** `WBS_Vermietungen/Jahr = Bestand × Fluktuationsrate (5%) × WBS-Quote (30% Bündnis / 63% LWU-equivalent post-Vergesellschaftung)` — a simple stock-turnover model for distributional/access effects, structurally separate from (but complementary to) the financial compensation model; could be bolted on as a "social output" module once a compensation/financing scenario pins down whether full LWU-parity in rents (and hence LWU-parity in allocation policy) is financially sustainable.
- Note: this document assumes the LWU rent level (6.39€) as exogenously given and does **not** derive it from a compensation/Ertragswert calculation — it is a pure rent/social-supply impact study, meant to be paired with (not substituted for) the compensation-and-financing extracts from the Expertenkommission, DWE-Hg, BBU-Sodan, and Gutachten-DKB documents.
