# Open problem: the cumulative cash flow of the DWE-Studie 2025

Status 2026-10-16. Branch `claude/lucid-cerf-8ocw6w`, not yet merged into `main`.

## The problem

For the preset "DWE-Studie 2025" (Holm/Thonke/Arpagaus 2025), the chart "Der Cashflow kumuliert" rises above zero by year 28 ("Break-even Jahr 28") and then falls to −1.9 bn € in years 29–30. In "Der Cashflow pro Jahr", a Sondertilgung bar of −2.3 bn € in year 29 squashes all other bars. Readers take this for a collapse. Compared with the other four positions, the DWE curve looks like a different kind of calculation.

## Why it happens

- The cumulative curve is the AöR's cash balance (`cumForChart` in `model-calc.js`, `runScenario`): rents minus operating costs, interest, fees and **all repayment**, minus the Land's payments, starting with the one-off costs and the equity paid in year 0. The remaining debt does not appear in it.
- The DWE preset finances half the debt with an interest-only bond (*endfällige Anleihe*, 4 %, refinanced every 7 years) and repays debt from surpluses (cash sweep, reserve of three months of debt service).
- Years 23–28: the bank loan is repaid; surpluses of about 330 M € a year build up in the reserve while 3.08 bn € of bond is still outstanding. The curve rises to +0.31 bn €.
- Year 29: at the bond refinancing the reserve repays 2.29 bn €. Year 30: the last 0.79 bn € is due. The curve falls by exactly the amount the debt falls.
- Without the cash sweep, the drop would come in year 30 (3.08 bn € repayment). The drop is real money leaving, nothing is lost.
- The break-even (`cum > 0`) ignores the remaining debt: in year 28 3.08 bn € is still owed.

Yearly values (M €, nominal): `node` with `presets.holm2025` and `runScenario`, columns `aoer`, `sweptPV`, `cumForChart`, `balance`.

## Constraints

- The cash view is the right measure for the core question: can the rents carry the purchase, **including repayment**? Repayment must stay visible as a burden.
- Every preset must keep reproducing its source; `node pruefung.js` must pass. It checks the AöR result (Rechnungshof Ansicht 12), debt service in years 1–2, the reserve never falling below zero and the debt being repaid (DWE-Studie), and the Faire-Mieten-Modell cash balance in year 40.
- Rules in `CLAUDE.md` (02_Vergesellschaftung): version tags, both build scripts, `entwicklungsprotokoll.md`.

## Rejected approach (implemented and reverted, commit 75df416 / revert 0acd686)

Net position with the housing valued at purchase price (cash − remaining debt + purchase price). The curve rose steadily for DWE (+0.1 → +8.2 bn €), but:
- the bars showed only the surplus before repayment, so the 8.1 bn € the AöR has to repay from rents disappeared;
- the housing counted as wealth that never loses value, so every repayment looked like a gain and the curve could only rise;
- the headline results flipped (Rechnungshof −19.1 → −1.6, DWE −1.9 → +8.2 bn €).

Also rejected: cash minus remaining debt without the housing (starts at −10 to −30 bn €, half a balance sheet).

## Options still open

1. **Remaining debt as a second, dashed line** in "Der Cashflow kumuliert". Cash curve unchanged; the drop in years 29–30 stays visible, but the debt falls to zero at the same time.
2. **Break-even only when cash covers the remaining debt** (`cum − balance > 0`). DWE: no break-even within 30 years; Faire-Mieten-Modell: year 40 instead of 37; the others: none, as before. Net result unchanged.
3. **Sondertilgung in the bar chart** drawn separately (hatched, own scale or labelled as repayment), so year 29 does not squash the other years.
4. **Caption** on the bond refinancing every 7 years and the cash sweep.

Options 1 and 2 change no cash figure. Present-value mode (*Barwert*): `cumForChart` is discounted, `balance` is nominal; any combination of the two must discount the debt as well.

## Also open

- Year 8: the study repays 0.63 bn € of the bond from the reserve (S. 33), the model only 0.38 bn €. The model accumulates about 0.27 bn € less free cash flow in years 1–7. Cause not found (rent, operating costs or how the fee is booked); compare with the study's Rechenmodell, rows 36, 45, 50, 51. `pruefung.js` does not check the size of each repayment.

## Code locations

- `model-calc.js`: `runScenario` (yearly loop, cash sweep, `cumForChart`, `breakEvenYear`), chart setup `initCharts` (`chartCashflow`, `chartCumulative`), chart update in `render` (search "Jahres-Cashflow"), comparison `updateCompareCharts`.
- `vergesellschaftung-modell-v37.html`: captions of "Der Cashflow pro Jahr" and "Der Cashflow kumuliert"; then `python3 build_kompakt.py`.
- `content.js`: glossary entries Cashflow, Break-even, Nettoergebnis, Restschuld.
- `pdf/markdown/171125final_Studie_Finanzierungsoptionen_Vergesellschaftung_BERICHT_ee37ff1957.md`, around lines 1730–1765 and 1855–1870: the study's cash sweep.
