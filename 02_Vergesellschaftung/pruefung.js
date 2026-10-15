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
  check("aus den Mieten bedient, Land haftet nicht (Saldo Jahr 40 ≥ 0)", r.netResult >= 0,
    `Saldo Jahr 40 ${fmt(r.netResult / 1e9, 2)} Mrd €; tiefster Stand ${fmt(minCum / 1e9, 2)} Mrd € (feste Tilgung 1/40 bei steigendem Reinertrag)`);
}

// ---- DWE-Gesetzentwurf 2025 ----
console.log("\nDWE-Gesetzentwurf 2025 (Entwurf S. 7; PwC S. 3)");
{
  const { r } = run("dwe2025", { horizon: 100 });
  check("Entschädigung 15,75 Mrd € (Mitte 14,5–17,0)", Math.abs(r.principal / 1e9 - 15.75) < 0.05, `${fmt(r.principal / 1e9, 2)} Mrd €`);
  // „ohne zusätzliche Haushaltsmittel“: der kumulierte Saldo der AöR wird nie negativ, die Schuld ist nach 100 Jahren getilgt.
  const neg = r.rows.filter(x => x.cashflow < 0).map(x => x.t);
  const minCum = Math.min(...r.rows.map(x => x.cumForChart));
  check("ohne Mieterhöhung und ohne Haushaltsmittel refinanziert (kumulierter Saldo nie negativ)", minCum >= 0 && r.finalDebt < 1,
    `tiefster Stand ${fmt(minCum / 1e9, 2)} Mrd €; Jahre mit Fehlbetrag: ${neg.length ? neg[0] + "–" + neg[neg.length - 1] : "keine"} (aus Überschüssen gedeckt)`);
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
  check(`${key}: keine Zinsen auf Fehlbeträge`, p.deficitInterest === "aus");
  if (key !== "gegenmodell") check(`${key}: keine Einmal- oder Landeszusatzkosten`, p.onceCosts === 0 && p.landDebtCost === 0);
}

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlle Prüfungen bestanden.");
process.exit(failed ? 1 : 0);
