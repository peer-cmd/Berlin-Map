# Extraction — OECD PH4.2 Social Rental Housing Stock (2024/2025 update)

Source: `pdf/OECD_PH4.2_Social-Rental-Housing-Stock.pdf` → markdown (6 pages). OECD Affordable Housing Database indicator, last updated 24/11/2025.
Purely comparative/contextual data — no equations; figures live in charts (not machine-readable from this text-only extraction) but the narrative gives key benchmark numbers.

## Data

- Social housing (social rental housing) = residential rental accommodation at sub-market prices, allocated by non-market rules (definition, Salvi Del Pero et al. 2016).
- OECD-wide: **≈28 million social rental dwellings**, averaging **7% of total housing stock** (8% in the EU).
- Highest share (>20% of stock): Austria, Denmark, Netherlands.
- Moderate share (10–19%): Finland, France, Iceland, Ireland, United Kingdom.
- Small share (2–10%): Australia, Belgium, Canada, Czechia, **Germany**, Hungary, Italy, Japan, Korea, New Zealand, Norway, Poland, Slovak Republic, Slovenia, Switzerland, USA.
- Smallest (<2%): Colombia, Estonia, Israel, Latvia, Lithuania, Portugal, Spain.
- No social rental sector (per this definition): Chile, Mexico (armed-forces only), Türkiye (different definition), Sweden (municipal but not below-market).
- Providers: regional/municipal authorities/agencies provide ≥50% of stock in 14 countries; central-government direct provision in Belgium, Canada, Denmark, Korea, Luxembourg, Malta, New Zealand, Portugal, Romania, Slovenia; strong non-/limited-profit associations in Netherlands, Finland, Austria, UK (England). Germany: providers not centrally tracked, but "in most states, majority of social dwellings are provided by municipalities or other public institutions as well as housing cooperatives; in some states, private providers hold a significant share."
- Trend: share of social housing **decreased in 18 of 25 OECD countries** over the past decade (2010s–2022); largest declines (>2pp): Finland, Netherlands, Poland; small-to-moderate declines (0.25–2pp) incl. **Germany**; increases (>2.5pp): Iceland, Korea.

## Relational / Modeling

- Not a modeling/formula source — purely comparative benchmark data. Useful only as external context: it establishes that Germany's social-housing share is small (2–10% band) and declining, which supports (as background motivation, not as an input variable) the case for socialization-style interventions, but contributes no reusable equation, discount rate, or cost parameter for the compensation/financing model itself.
- If a benchmarking section of the model wants an OECD comparator line, the usable numeric anchor is: **DE social-housing share ≈ within 2–10% of stock, declining by 0.25–2pp since ~2010**, versus OECD/EU averages of 7–8%.
