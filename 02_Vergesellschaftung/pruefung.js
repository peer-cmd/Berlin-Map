// Prüft die Positionen in model-calc.js gegen die Ergebnisse ihrer Quellen.
// Aufruf: node pruefung.js   (Exit-Code 1, wenn eine Prüfung fehlschlägt)
// Fundstellen nach PDF-Seite, wie in parameterpruefung.md.
"use strict";
const { defaults, presets, runScenario } = require("./model-calc.js");

let failed = 0;
const fmt = (v, d = 0) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
function check(label, ok, detail) {
  if (!ok) failed++;
  console.log(`${ok ? "ok    " : "FEHLER"} ${label}${detail ? " — " + detail : ""}`);
}
const run = (key, over = {}) => {
  const p = Object.assign({}, defaults, presets[key], over);
  return { p, r: runScenario(p.price, p) };
};
const quoteFor = (p, eur) => eur / (p.units * p.avgSize * p.price) * 100;
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

// ---- Rechnungshof 2024 ----
console.log("\nRechnungshof 2024 (Ansichten 4, 6, 12; S. 18, 21, 30)");
const RH12 = { // Ansicht 12: Überschuss (+) bzw. Unterdeckung (−) der AöR, Jahre 1–10, Kapitalwerte in Mio €
  8: [210, 150, 156, 161, 166, 171, 176, 180, 183, 186],
  11: [62, 9, 19, 28, 38, 46, 55, 63, 70, 77],
  29: [-822, -840, -801, -768, -736, -704, -672, -641, -610, -580],
  36: [-1166, -1170, -1120, -1077, -1036, -996, -955, -914, -874, -835],
};
const RH4 = { 8: [174, 186, 193], 11: [47, 77, 99], 29: [-717, -576, -464], 36: [-1014, -830, -683] }; // Ø nach 10, 20, 30 Jahren
const RH6 = { 8: 6.3, 11: 7.2, 29: 12.1, 36: 14.1 }; // erforderliche Ausgangsmiete ohne Zuschüsse über 30 Jahre
const TOL_MIO = 25, TOL_RENT = 0.2;
for (const E of [8, 11, 29, 36]) {
  const base = Object.assign({}, defaults, presets.rechnungshof);
  const pf = quoteFor(base, E * 1e9);
  const { r } = run("rechnungshof", { purchaseFactor: pf });
  const yrs = r.rows.slice(0, 10).map(x => x.aoer / 1e6);
  const dev = Math.max(...yrs.map((v, i) => Math.abs(v - RH12[E][i])));
  check(`${E} Mrd €, Jahre 1–10`, dev <= TOL_MIO, `Modell ${yrs.map(v => fmt(v)).join(" ")} | Quelle ${RH12[E].join(" ")} | größte Abweichung ${fmt(dev)} Mio €`);
  const avgs = [10, 20, 30].map(n => mean(r.rows.slice(0, n).map(x => x.aoer)) / 1e6);
  const devA = Math.max(...avgs.map((v, i) => Math.abs(v - RH4[E][i])));
  check(`${E} Mrd €, Ø nach 10/20/30 Jahren`, devA <= TOL_MIO, `Modell ${avgs.map(v => fmt(v)).join(" / ")} | Quelle ${RH4[E].join(" / ")}`);
  // Ausgangsmiete, bei der in keinem der 30 Finanzierungsjahre ein Zuschuss nötig ist
  let lo = 2, hi = 30;
  for (let k = 0; k < 50; k++) {
    const mid = (lo + hi) / 2;
    const rr = run("rechnungshof", { purchaseFactor: pf, baseRent: mid }).r;
    Math.min(...rr.rows.slice(0, 30).map(x => x.aoer)) >= 0 ? (hi = mid) : (lo = mid);
  }
  check(`${E} Mrd €, erforderliche Ausgangsmiete`, Math.abs(hi - RH6[E]) <= TOL_RENT, `Modell ${fmt(hi, 2)} €/m² | Quelle rd. ${fmt(RH6[E], 1)} €/m²`);
  if (E >= 29) {
    const first = r.rows.find(x => x.aoer > 0);
    check(`${E} Mrd €, Gewinnschwelle der AöR`, first && first.t === 31, `Modell Jahr ${first ? first.t : "–"} | Quelle 31. Jahr`);
  }
}
{
  const { r } = run("rechnungshof");
  check("Preset: Kaufpreis 29 Mrd €", Math.abs(r.principal / 1e9 - 29) < 0.05, `${fmt(r.principal / 1e9, 2)} Mrd €`);
}

// ---- Faire-Mieten-Modell (DWE 2022) ----
console.log("\nFaire-Mieten-Modell (DWE 2022, S. 89, 96–97, 102)");
{
  const { r } = run("linke", { horizon: 40 });
  const sumNoi = r.rows.reduce((s, x) => s + x.noi, 0);
  check("Entschädigung 10 Mrd €", Math.abs(r.principal / 1e9 - 10) < 0.05, `${fmt(r.principal / 1e9, 2)} Mrd €`);
  check("Reinertrag aus 40 Jahren = Entschädigung", Math.abs(sumNoi / r.principal - 1) < 0.01, `Reinertrag ${fmt(sumNoi / 1e9, 2)} Mrd €`);
  const minCum = Math.min(...r.rows.map(x => x.cumForChart));
  check("aus den Mieten bedient, Land haftet nicht (Kassenstand Jahr 40 ≥ 0)", r.cashResult >= 0,
    `Kassenstand Jahr 40 ${fmt(r.cashResult / 1e9, 2)} Mrd €; tiefster Stand ${fmt(minCum / 1e9, 2)} Mrd € (feste Tilgung 1/40 bei steigendem Reinertrag)`);
}

// ---- Holm/Thonke/Arpagaus 2025 (Kurzstudie im Auftrag von DWE) ----
console.log("\nHolm/Thonke/Arpagaus 2025 (S. 33–37, Tabellen 7, 8, 13)");
{
  // Ohne Zuschuss: die Rücklage der AöR (Überschüsse abzüglich Sondertilgungen) wird nie negativ, die Schuld ist am Ende getilgt.
  const reserveMin = r => { let rv = 0, min = 0; r.rows.forEach(x => { rv += x.aoer - x.swept; min = Math.min(min, rv); }); return min; };
  const carries = r => reserveMin(r) >= -1e6 && r.finalDebt < 1e6;
  const sumAt = (over, eur) => { const p = Object.assign({}, defaults, presets.holm2025, over); return Object.assign(over, { purchaseFactor: quoteFor(p, eur) }); };
  const maxSum = over => { let lo = 1, hi = 30; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; carries(run("holm2025", sumAt(Object.assign({}, over), m * 1e9)).r) ? (lo = m) : (hi = m); } return lo; };
  const { r } = run("holm2025");
  check("Entschädigung 10,11 Mrd €", Math.abs(r.principal / 1e9 - 10.11) < 0.01, `${fmt(r.principal / 1e9, 2)} Mrd €`);
  const debt = r.principal - r.equity;
  check("davon Eigenkapital des Landes 2,02 Mrd €, aus den Mieten 8,09 Mrd € (Tabelle 8; Tabelle 14a „ohne Eigenkapital“: 8,09)",
    Math.abs(r.equity / 1e9 - 2.02) < 0.01 && Math.abs(debt / 1e9 - 8.09) < 0.01, `Eigenkapital ${fmt(r.equity / 1e9, 2)}, Fremdkapital ${fmt(debt / 1e9, 2)} Mrd €`);
  const ds = r.rows.slice(0, 2).map(x => x.service / 1e6);
  check("Kapitaldienst Jahr 1 und 2 (Tabelle 8: 0,37 + 0,20 Mrd € mit Entgelt; danach 0,33 + 0,16)", Math.abs(ds[0] - 569) <= 5 && Math.abs(ds[1] - 489) <= 5, `Modell ${ds.map(v => fmt(v)).join(" / ")} Mio €`);
  check("aus den Mieten refinanziert, ohne Zuschuss, nach 30 Jahren getilgt", carries(r), `tiefster Stand der Rücklage ${fmt(reserveMin(r) / 1e6)} Mio €, Restschuld ${fmt(r.finalDebt / 1e9, 2)} Mrd €`);
  const m30 = maxSum({});
  check("größte refinanzierbare Summe, 30 Jahre (Studie 10,11 Mrd €)", Math.abs(m30 - 10.11) <= 0.3, `Modell ${fmt(m30, 2)} Mrd €`);
  const m90 = maxSum({ term: 90, horizon: 90, initialRepayment: 0.1, rentGrowth: 1.7 });
  check("größte refinanzierbare Summe, 90 Jahre (Tabelle 13: 13,56 Mrd €)", Math.abs(m90 - 13.56) <= 0.3, `Modell ${fmt(m90, 2)} Mrd €`);
  const m60 = maxSum({ term: 60, horizon: 60, initialRepayment: 0.65, rentGrowth: 1.2 });
  console.log(`  Hinweis: 60 Jahre (Tabelle 13: 12,57 Mrd €) ergibt im Modell ${fmt(m60, 2)} Mrd €; den Tilgungsverlauf dieser Variante legt die Studie nicht offen.`);
  console.log("  Hinweis: Die übrigen Zellen von Tabelle 15 setzen je Variante eine eigene Anfangstilgung an, die die Studie nicht nennt; sie werden nicht geprüft.");
}

// ---- IW/Empirica 2026: nur die Einwände weichen vom Rechnungshof ab ----
console.log("\nIW/Empirica 2026 (S. 17, 23): Rechnung des Rechnungshofs mit den Einwänden des Gutachtens");
{
  const allowed = new Set(["opexAbsolute", "costInflation", "onceCosts", "landDebtCost"]);
  const a = Object.assign({}, defaults, presets.rechnungshof), b = Object.assign({}, defaults, presets.gegenmodell);
  const diff = Object.keys(b).filter(k => a[k] !== b[k]);
  check("weicht nur bei Modernisierung, Inflation, Integrationskosten, Landesschulden ab", diff.every(k => allowed.has(k)), diff.join(", "));
}

// ---- Bernt/Holm 2023 ----
console.log("\nBernt/Holm 2023 (S. 12, 22) und Gerhardt/Holm 2021 (DWE 2022, S. 112)");
{
  const p = Object.assign({}, defaults, presets.holm);
  check("Mietsenkung auf 6,39 €/m², danach +1,6 %/Jahr", p.baseRent === 6.39 && p.rentGrowth === 1.6 && p.startRentGrowth === 1.6);
  const { r } = run("holm");
  check("Entschädigung 17 Mrd €", Math.abs(r.principal / 1e9 - 17) < 0.05, `${fmt(r.principal / 1e9, 2)} Mrd €`);
  console.log(`  Hinweis: Unter den Bedingungen des Rechnungshofs Ø ${fmt(r.aoerAvg10 / 1e6)} Mio € pro Jahr (Jahre 1–10). Gerhardt/Holm nennen 17 Mrd € als refinanzierbar;\n  ihre Finanzierungsbedingungen liegen nicht vor, die Aussage ist daher nicht nachrechenbar.`);
}

// ---- Gemeinsam ----
console.log("\nAlle Positionen");
for (const [key, pr] of Object.entries(presets)) {
  const p = Object.assign({}, defaults, pr);
  if (key !== "gegenmodell") check(`${key}: keine Einmal- oder Landeszusatzkosten`, p.onceCosts === 0 && p.landDebtCost === 0);
}

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlle Prüfungen bestanden.");
process.exit(failed ? 1 : 0);
