// Screenshots der Modell-Diagramme in drei Varianten: 0 heute, A Graustufen für Positionen, B eigene Farben für Positionen.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const ROOT = '/home/user/Berlin-Map/02_Vergesellschaftung';
const OUT = path.join(ROOT, 'test-farben');
const CHARTS = ['chartRent', 'chartCompareCum', 'chartCompareRent', 'chartScenarios', 'chartRateSens', 'chartRentUse', 'chartDebt'];

function patch(variant) {
  const INK = '#14171A';
  const POS = {
    A: ['#2E2E2A', '#55554F', '#7A7A73', '#9E9E97', '#BDBDB6'],
    B: ['#2E9E4F', '#8C9A1F', '#8A5A2B', '#D0201A', '#1B2E7A'],
  }[variant];
  const POS_NAMES = ['Faire-Mieten-Modell', 'DWE-Studie 2025', 'Bernt/Holm', 'Rechnungshof', 'IW/Empirica'];
  const SALDO = { fill: { target: 'origin', above: 'rgba(255,229,0,0.45)', below: 'rgba(156,0,89,0.18)' } };

  // Beschriftung am Linienende, Überschneidungen werden auseinandergeschoben.
  Chart.register({
    id: 'endLabels',
    afterDatasetsDraw(chart) {
      const items = [];
      chart.data.datasets.forEach((d, i) => {
        if (!d.endLabel || !chart.isDatasetVisible(i)) return;
        const pts = chart.getDatasetMeta(i).data.filter(p => p && !p.skip && Number.isFinite(p.y));
        if (!pts.length) return;
        const p = pts[pts.length - 1];
        items.push({ y: Math.max(p.y, chart.chartArea.top + 6), x: p.x, text: d.endLabel, color: d.labelColor || d.borderColor, bold: d.borderWidth >= 2.5 });
      });
      items.sort((a, b) => a.y - b.y);
      for (let k = 1; k < items.length; k++) if (items[k].y - items[k - 1].y < 11) items[k].y = items[k - 1].y + 11;
      const ctx = chart.ctx;
      ctx.save();
      ctx.textBaseline = 'middle';
      items.forEach(it => {
        ctx.font = (it.bold ? '600 ' : '') + '10px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = it.color;
        ctx.fillText(it.text, it.x + 5, it.y);
      });
      ctx.restore();
    },
  });
  const get = id => Chart.getChart(id);
  const padRight = (c, px) => { c.config.options.layout = { padding: { top: 0, left: 0, bottom: 0, right: px } }; };
  const ref = (d, dash, label) => Object.assign(d, { borderColor: '#7A7A73', backgroundColor: 'transparent', borderWidth: 1.2, borderDash: dash, endLabel: label, fill: false });

  // Die Mieten: Modell schwarz, Referenzen grau.
  let c = get('chartRent');
  const [market, social, cpi, income, model] = c.data.datasets;
  ref(market, [6, 3], 'Freier Markt');
  ref(social, [2, 2], 'Grenze Sozialmiete');
  ref(cpi, [1, 3], 'Verbraucherpreise');
  ref(income, [8, 2, 2, 2], 'Einkommen');
  Object.assign(model, { borderColor: INK, backgroundColor: 'transparent', fill: false, borderWidth: 2.4, endLabel: 'Ø Miete Bestand' });
  padRight(c, 112); c.update('none');

  // Bestand: Modellgröße, schwarz.
  c = get('chartStock');
  Object.assign(c.data.datasets[0], { borderColor: INK, backgroundColor: 'rgba(20,23,26,0.05)', borderWidth: 2.2, endLabel: 'Bestand' });
  padRight(c, 60); c.update('none');

  // Vergleich: Positionen in der Reihenfolge der Entschädigungsquote.
  ['chartCompareCum', 'chartCompareRent'].forEach(id => {
    const ch = get(id);
    ch.data.datasets.forEach(d => {
      const k = POS_NAMES.indexOf(d.label);
      if (d.label === 'Aktuell') Object.assign(d, { borderColor: INK, borderWidth: 3, endLabel: 'Ihre Einstellung' });
      else if (k >= 0) Object.assign(d, { borderColor: POS[k], borderWidth: 1.6, endLabel: d.label });
    });
    padRight(ch, 118); ch.update('none');
  });

  // Szenarien: Kaufpreis grau, Nettoergebnis als Saldo gelb oder dunkelmagenta.
  c = get('chartScenarios');
  c.data.datasets[0].backgroundColor = c.data.datasets[0].data.map(() => '#9E9E97');
  c.data.datasets[1].backgroundColor = c.data.datasets[1].data.map(v => v >= 0 ? '#FFE500' : '#9C0059');
  c.update('none');

  // Sensitivität: Nettoergebnis schwarz mit Saldo-Fläche, Break-even grau gestrichelt.
  c = get('chartRateSens');
  Object.assign(c.data.datasets[0], { borderColor: INK, borderWidth: 2.2 }, SALDO);
  Object.assign(c.data.datasets[1], { borderColor: '#7A7A73', borderWidth: 1.4, borderDash: [4, 2] });
  c.update('none');

  // Geld-Diagramme: Linie in Textschwarz wie alle Modelllinien.
  ['chartRentUse', 'chartDebt'].forEach(id => { const ch = get(id); ch.data.datasets[0].borderColor = INK; ch.update('none'); });
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const v of ['0', 'A', 'B']) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(ROOT, 'vergesellschaftung-modell-v37.html'));
    await page.waitForTimeout(800);
    await page.evaluate(() => { document.querySelectorAll('details.panel').forEach(d => { d.open = true; }); });
    await page.waitForTimeout(600);
    if (v !== '0') await page.evaluate(patch, v);
    await page.waitForTimeout(300);
    for (const id of CHARTS) {
      await page.locator('#' + id).scrollIntoViewIfNeeded();
      await page.locator('#' + id).screenshot({ path: path.join(OUT, `${id}-${v}.png`) });
    }
    await page.close();
  }
  await browser.close();
})();
