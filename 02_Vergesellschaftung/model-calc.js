(function(){
  "use strict";

  // A page cached from an older version may lack newer controls; a detached stand-in keeps the
  // script running instead of stopping all charts. Existence checks use byId.
  const byId = id => document.getElementById(id);
  const stand = {};
  const $ = id => byId(id) || (stand[id] = stand[id] || document.createElement('input'));

  const defaults = {
    units:240000, price:2085, purchaseFactor:100,
    financing:'kredit', rate:3.5, riskPremium:0, term:30, rateResetYears:10, rateIncrement:1.0, onceCosts:405, maintBacklog:20000, integrationCosts:2,
    baseRent:7.63, rentGrowth:1.5, costInflation:2.5, avgSize:65, opex:40, opexMode:'percent', opexAbsolute:2.2,
    freeMarketRent:15.8, munizRent:6.29, cpiGrowth:2.0, incomeGrowth:3.0,
    mode:'none', buildCost:3500, reinvestQuota1:100,
    sozialRent:6.5, convCost:0, sozialImmediate:0, sozialTurnover:5, sozialQuota:63, reinvestQuota2:0,
    // Vergabe bei Neuvermietung nach Bernt/Holm 2023, S. 13–14: Fluktuation 5 %/Jahr, davon 63 % an
    // WBS-Inhaber*innen (Quote der Landeseigenen) = 6.999 von 222.183 Wohnungen im ersten Jahr (≈ 3,15 %).
    // Einmal an WBS-Haushalte vergebene Wohnungen bleiben gebunden; der Anteil nähert sich daher 63 %
    // des Bestands und erreicht nicht 100 %. Die Presets setzen sozialQuota 0, ihre Ergebnisse bleiben unverändert.
    horizon:50
  };
  let state = Object.assign({}, defaults);
  // Gespeicherte Szenarien (höchstens MAX_SAVED) bleiben im Browser (localStorage);
  // ohne Speicher (privates Fenster) nur bis zum Neuladen.
  const STORE_KEY = 'vergesellschaftung-szenarien';
  const MAX_SAVED = 5;
  let savedScenarios = [];
  // Ältere Speicherungen und Links mit dem Regler „Fester Zeitplan“ (sozialPaceRate):
  // 0 bleibt ohne Vergabe bei Neuvermietung, jeder andere Wert übernimmt die Voreinstellung.
  function migrateState(v){
    if(v && v.sozialPaceRate!==undefined && v.sozialQuota===undefined) v.sozialQuota = v.sozialPaceRate>0 ? defaults.sozialQuota : 0;
    if(v) delete v.sozialPaceRate;
    return v;
  }
  try{
    let stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if(stored && !Array.isArray(stored)) stored = [stored.A, stored.B]; // frühere Speicherung mit A/B
    savedScenarios = (stored || []).filter(Boolean).slice(0, MAX_SAVED).map(v=>Object.assign({}, defaults, migrateState(v)));
  }catch(e){}
  function storeScenarios(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(savedScenarios)); }catch(e){}
  }

  const sliderIds = ['units','price','purchaseFactor','rate','riskPremium','term','rateResetYears','rateIncrement','onceCosts','maintBacklog','integrationCosts',
    'baseRent','rentGrowth','costInflation','avgSize','opex','opexAbsolute','freeMarketRent','munizRent','cpiGrowth','incomeGrowth','buildCost','reinvestQuota1',
    'sozialRent','convCost','sozialImmediate','sozialTurnover','sozialQuota','reinvestQuota2','horizon'];

  // Parameter, die im Kern €/m² sind, aber wahlweise auch als €-Betrag pro Wohnung
  // bedient werden koennen (verlinkte Zweitfelder, zwei Wege dieselbe Groesse einzugeben).
  // "monthly:true" heisst: der €/m²-Wert ist bereits ein Monatswert (z.B. Miete), also
  // ist der Pro-Wohnung-Wert = €/m²-Wert * avgSize (kein weiterer Faktor).
  const perUnitFields = [
    { key:'price', decimals:0 },
    { key:'baseRent', decimals:0 },
    { key:'opexAbsolute', decimals:0 },
    { key:'buildCost', decimals:0 },
    { key:'sozialRent', decimals:0 },
    { key:'convCost', decimals:0 }
  ];

  // Fixed axis width (px) so every "Jahr"-chart's plot area starts/ends at the same x-position.
  const AXIS_W = 72;
  function fixAxisWidth(scale){ scale.width = AXIS_W; }
  // Year axis: label year 1 and every 5th year (every 10th beyond 60 years), so all "Jahr"-charts share the same ticks and the last year shows.
  const YEAR_TICKS = { font:{family:'IBM Plex Mono',size:9}, autoSkip:false, maxRotation:0,
    callback(v){ const t = Number(this.getLabelForValue(v)); const step = this.chart.data.labels.length>60 ? 10 : 5;
      return (t===1 || t%step===0) ? t : ''; } };

  function escapeHtml(t){ return String(t).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function fmtInt(n){ return Math.round(n).toLocaleString('de-DE'); }
  function fmtEUR(n){
    const sign = n<0 ? '−' : '';
    n = Math.abs(n);
    if(n>=1e9) return sign+(n/1e9).toLocaleString('de-DE',{maximumFractionDigits:2})+' Mrd €';
    if(n>=1e6) return sign+(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio €';
    return sign+fmtInt(n)+' €';
  }
  function fmtYear(y){ return (y===null) ? '> Horizont' : ('Jahr '+y); }

  function pmt(rate, nper, pv){
    if(nper<=0) return 0;
    if(rate===0) return pv/nper;
    return pv * rate / (1 - Math.pow(1+rate,-nper));
  }

  // ---- core simulation for one price-per-sqm scenario (€/m² Verkehrswert) ----
  function runScenario(pricePerSqm, p){
    const fullValue = p.units*p.avgSize*pricePerSqm;
    const principal = fullValue*(p.purchaseFactor/100);
    let balance = principal;
    let currentRate = p.rate/100 + p.riskPremium/100;
    let annuity = p.financing==='kredit' ? pmt(currentRate, p.term, principal) : 0;

    let units = p.units;
    let sozialUnits = 0;
    // Herkunft der Sozialwohnungen: sofort (Jahr 1), bei Neuvermietung, aus Überschuss
    let sozImm = 0, sozFix = 0, sozSur = 0;
    // Einmalkosten bei Übernahme (Jahr 0): Transaktionskosten, Sanierungsstau, Integrationskosten.
    // Werden hier als Startsaldo verbucht, damit sie im Jahr-für-Jahr-Verlauf, im Cashflow-Chart
    // und in der Break-even-Berechnung sichtbar/wirksam sind -- statt nur am Ende vom Nettoergebnis
    // abgezogen zu werden, ohne je im Cashflow-Verlauf aufzutauchen.
    const upfrontCosts = p.onceCosts*1e6 + p.maintBacklog*p.units + principal*((p.integrationCosts||0)/100);
    let cum = -upfrontCosts;
    const rows = [];
    let breakEvenYear = null;
    const opexPerUnitBase = p.opexMode==='absolute'
      ? p.avgSize*p.opexAbsolute*12
      : p.avgSize*p.baseRent*12*(p.opex/100);

    for(let t=1;t<=p.horizon;t++){
      const rent = p.baseRent*Math.pow(1+p.rentGrowth/100, t-1);
      // Sozialmiete darf die Ausgangsmiete nie übersteigen (sonst würde Umwandlung die Miete erhöhen statt senken)
      const sozialRent = Math.min(p.sozialRent, p.baseRent)*Math.pow(1+p.rentGrowth/100, t-1);

      // Umwandlung zu Jahresbeginn, unabhängig vom Cashflow des Jahres (die Kosten mindern ihn unten):
      // in Jahr 1 der sofort umgewandelte Anteil, danach jedes Jahr die Vergabe bei Neuvermietung:
      // von f × Bestand frei werdenden Wohnungen gehen q an WBS-Haushalte; gebundene Wohnungen bleiben gebunden,
      // neu gebunden werden also f × (q × Bestand − bereits gebundene), bis der Anteil q erreicht ist.
      // Die Umwandlung ist unabhängig vom Reinvestitionsmodus (Neubau/keine) immer aktiv.
      let fixedConversionCost = 0;
      {
        if(t===1){
          const newImm = Math.min(p.units*((p.sozialImmediate||0)/100), Math.max(p.units - sozialUnits,0));
          sozImm += newImm; sozialUnits += newImm;
          fixedConversionCost += newImm*p.convCost*p.avgSize;
        }
        const newFix = Math.min(Math.max((p.sozialTurnover||0)/100*((p.sozialQuota||0)/100*p.units - sozialUnits), 0), Math.max(p.units - sozialUnits,0));
        sozFix += newFix; sozialUnits += newFix;
        fixedConversionCost += newFix*p.convCost*p.avgSize;
      }

      // Neubauwohnungen bleiben bei der Modellmiete; umgewandelt wird nur der übernommene Bestand.
      const income = (units - sozialUnits)*p.avgSize*rent*12 + sozialUnits*p.avgSize*sozialRent*12;

      const opexPerUnit = opexPerUnitBase*Math.pow(1+p.costInflation/100, t-1);
      const opexAmt = units*opexPerUnit;
      const noi = income - opexAmt;

      // financing with rate reset at end of Zinsbindung
      let annuityThisYear = 0;
      if(p.financing==='kredit' && t<=p.term){
        if(t === p.rateResetYears+1 && p.rateResetYears < p.term){
          currentRate = p.rate/100 + p.riskPremium/100 + p.rateIncrement/100;
          const remainingTerm = p.term - p.rateResetYears;
          annuity = pmt(currentRate, remainingTerm, balance);
        }
        const interestPortion = balance*currentRate;
        let principalPortion = annuity - interestPortion;
        if(principalPortion > balance) principalPortion = balance;
        balance = Math.max(balance - principalPortion, 0);
        annuityThisYear = annuity;
      }

      const cashflow = noi - annuityThisYear - fixedConversionCost;

      if(p.financing==='kredit'){
        cum += cashflow;
        if(breakEvenYear===null && cum>0) breakEvenYear = t;
      } else {
        cum += noi - fixedConversionCost;
        if(breakEvenYear===null && cum>principal) breakEvenYear = t;
      }

      rows.push({t, rent, sozialRent, income, noi, annuity:annuityThisYear, cashflow,
        cumForChart: p.financing==='kredit' ? cum : (cum-principal),
        units, sozialUnits, sozImm, sozFix, sozSur, rateNow: currentRate*100,
        avgRent: income/(units*p.avgSize*12),
        balance: p.financing==='kredit' ? balance : null});

      // reinvestment for next year -- spending is subtracted from the cash reserve (cum) so it is
      // counted exactly once (either as cash-on-hand, or converted into recorded asset/stock value),
      // never both. This also means it delays break-even/Kapitalposition, as real capex would.
      // Zuerst der Anteil „Aus Überschuss" für weitere Sozialwohnungen, danach Neubau aus dem Rest.
      let surplusLeft = Math.max(cashflow,0);
      if(p.reinvestQuota2>0){
        // As many units as this year's surplus can carry: each new social unit costs its one-off
        // conversion cost plus next year's rent loss (model rent − social rent), so the cash flow
        // stays roughly at zero instead of turning negative.
        const capacity = p.units - sozialUnits;
        const convBudget = surplusLeft*(p.reinvestQuota2/100);
        const rentLossNext = (p.baseRent - Math.min(p.sozialRent, p.baseRent))*Math.pow(1+p.rentGrowth/100, t)*p.avgSize*12;
        const costPerUnit = p.convCost*p.avgSize + rentLossNext;
        const newSozial = costPerUnit>0 ? Math.min(convBudget/costPerUnit, Math.max(capacity,0)) : Math.max(capacity,0);
        const actualSpend = newSozial*p.convCost*p.avgSize; // capped if capacity is reached
        sozialUnits = sozialUnits + newSozial;
        sozSur += newSozial;
        cum -= actualSpend;
        surplusLeft -= Math.min(newSozial*costPerUnit, convBudget);
      }
      if(p.mode==='neubau'){
        const buildSpend = surplusLeft*(p.reinvestQuota1/100);
        const newUnits = buildSpend/(p.buildCost*p.avgSize);
        units = units + newUnits;
        cum -= buildSpend;
      }
    }

    // Einmalkosten sind bereits im Startsaldo von cum enthalten (s.o.), daher hier kein erneuter Abzug.
    const netResult = rows[rows.length-1].cumForChart;

    return {
      principal, fullValue, rows, breakEvenYear, netResult,
      finalUnits: rows[rows.length-1].units,
      finalSozial: rows[rows.length-1].sozialUnits
    };
  }

  function readState(){
    state.units = +$('units').value;
    state.price = +$('price').value;
    state.purchaseFactor = +$('purchaseFactor').value;
    state.rate = +$('rate').value;
    state.riskPremium = +$('riskPremium').value;
    state.term = +$('term').value;
    state.rateResetYears = +$('rateResetYears').value;
    state.rateIncrement = +$('rateIncrement').value;
    state.onceCosts = +$('onceCosts').value;
    state.maintBacklog = +$('maintBacklog').value;
    state.integrationCosts = +$('integrationCosts').value;
    state.baseRent = +$('baseRent').value;
    state.rentGrowth = +$('rentGrowth').value;
    state.costInflation = +$('costInflation').value;
    state.avgSize = +$('avgSize').value;
    state.opex = +$('opex').value;
    state.opexAbsolute = +$('opexAbsolute').value;
    state.freeMarketRent = +$('freeMarketRent').value;
    state.munizRent = +$('munizRent').value;
    state.cpiGrowth = +$('cpiGrowth').value;
    state.incomeGrowth = +$('incomeGrowth').value;
    state.mode = $('mode').value;
    state.buildCost = +$('buildCost').value;
    state.reinvestQuota1 = +$('reinvestQuota1').value;
    state.sozialRent = +$('sozialRent').value;
    state.convCost = +$('convCost').value;
    state.sozialImmediate = +$('sozialImmediate').value;
    state.reinvestQuota2 = +$('reinvestQuota2').value;
    state.sozialTurnover = +$('sozialTurnover').value;
    state.sozialQuota = +$('sozialQuota').value;
    state.horizon = +$('horizon').value;
  }

  function updateLabels(){
    $('v-units').textContent = fmtInt(state.units);
    $('v-price').textContent = fmtInt(state.price)+' €/m²';
    const total = state.units*state.avgSize*state.price/1e9;
    $('v-totalDerived').textContent = total.toLocaleString('de-DE',{maximumFractionDigits:1})+' Mrd €';
    $('v-purchaseFactor').textContent = state.purchaseFactor+' %';
    const effPricePerSqm = state.price*(state.purchaseFactor/100);
    const effTotal = total*(state.purchaseFactor/100);
    $('v-effectivePrice').textContent = fmtInt(effPricePerSqm)+' €/m² · '+effTotal.toLocaleString('de-DE',{maximumFractionDigits:1});
    $('v-rate').textContent = state.rate.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
    $('v-riskPremium').textContent = '+'+state.riskPremium.toLocaleString('de-DE',{minimumFractionDigits:1})+' pp';
    $('v-term').textContent = state.term+' J.';
    $('v-rateResetYears').textContent = state.rateResetYears+' J.';
    $('v-rateIncrement').textContent = '+'+state.rateIncrement.toLocaleString('de-DE',{minimumFractionDigits:1})+' pp';
    $('v-onceCosts').textContent = fmtInt(state.onceCosts)+' Mio €';
    $('v-maintBacklog').textContent = fmtInt(state.maintBacklog)+' €';
    $('v-integrationCosts').textContent = state.integrationCosts.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
    $('v-baseRent').textContent = state.baseRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-rentGrowth').textContent = state.rentGrowth.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
    $('v-costInflation').textContent = state.costInflation.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
    $('v-avgSize').textContent = state.avgSize+' m²';
    $('v-opex').textContent = state.opex+' %';
    $('v-opexAbsolute').textContent = state.opexAbsolute.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('wrap-opex-percent').style.display = state.opexMode==='percent' ? 'block' : 'none';
    $('wrap-opex-absolute').style.display = state.opexMode==='absolute' ? 'block' : 'none';
    $('v-freeMarketRent').textContent = state.freeMarketRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-munizRent').textContent = state.munizRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-cpiGrowth').textContent = state.cpiGrowth.toLocaleString('de-DE',{minimumFractionDigits:1})+' %/J.';
    $('v-incomeGrowth').textContent = state.incomeGrowth.toLocaleString('de-DE',{minimumFractionDigits:1})+' %/J.';
    $('v-buildCost').textContent = fmtInt(state.buildCost)+' €/m²';
    $('v-reinvestQuota1').textContent = state.reinvestQuota1+' %';
    $('v-sozialRent').textContent = state.sozialRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('hint-sozialRentCap').style.display = state.sozialRent > state.baseRent ? 'block' : 'none';
    $('v-convCost').textContent = fmtInt(state.convCost)+' €/m²';
    $('v-sozialImmediate').textContent = state.sozialImmediate+' %';
    $('v-sozialTurnover').textContent = state.sozialTurnover.toLocaleString('de-DE',{maximumFractionDigits:1})+' %/Jahr';
    $('v-sozialQuota').textContent = state.sozialQuota+' %';
    $('v-reinvestQuota2').textContent = state.reinvestQuota2+' %';
    $('v-horizon').textContent = state.horizon+' Jahre';

    // verlinkte "pro Wohnung"-Zweitfelder aktualisieren (nicht ueberschreiben waehrend der Nutzer tippt)
    perUnitFields.forEach(({key, decimals})=>{
      const el = $(key+'PerUnit');
      if(document.activeElement !== el){
        const perUnit = state[key]*state.avgSize;
        el.value = Math.round(perUnit*Math.pow(10,decimals))/Math.pow(10,decimals);
      }
    });

    $('wrap-rate').style.opacity = state.financing==='kredit' ? 1 : 0.35;
    $('wrap-term').style.opacity = state.financing==='kredit' ? 1 : 0.35;
    $('wrap-reset').style.opacity = state.financing==='kredit' ? 1 : 0.35;
    $('wrap-increment').style.opacity = state.financing==='kredit' ? 1 : 0.35;
    $('rate').disabled = state.financing!=='kredit';
    $('term').disabled = state.financing!=='kredit';
    $('rateResetYears').disabled = state.financing!=='kredit';
    $('rateIncrement').disabled = state.financing!=='kredit';

    $('panel-neubau').classList.toggle('show', state.mode==='neubau');
  }

  let chartCashflow, chartCumulative, chartStock, chartRent, chartBalance, chartCapital, chartSozial, chartTenantSavings, chartScenarios, chartRateSens, chartCompSens, chartCompareCum, chartCompareBalance, chartCompareRent;

  const vlinePlugin = {
    id: 'vlineMarker',
    afterDatasetsDraw(chart, args, opts){
      const idx = chart.options.plugins.vlineMarker && chart.options.plugins.vlineMarker.index;
      if(idx===null || idx===undefined) return;
      const xScale = chart.scales.x;
      const yArea = chart.chartArea;
      if(!xScale || !yArea) return;
      const xPix = xScale.getPixelForValue(idx);
      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#6B6B63';
      ctx.setLineDash([3,3]);
      ctx.lineWidth = 1;
      ctx.moveTo(xPix, yArea.top);
      ctx.lineTo(xPix, yArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#14171A';
      ctx.font = "9px 'IBM Plex Mono'";
      const label = (opts && opts.label) || '';
      // Label rechts der Linie; links davon, wenn es sonst über die Zeichenfläche (und die rechte Achse) hinausragt.
      if(xPix+4+ctx.measureText(label).width > yArea.right){ ctx.textAlign = 'right'; ctx.fillText(label, xPix-4, yArea.top+10); }
      else ctx.fillText(label, xPix+4, yArea.top+10);
      ctx.restore();
    }
  };
  Chart.register(vlinePlugin);
  Chart.defaults.color = '#14171A';
  // Phones: the canvas height attributes (70/80) give very flat charts at ~340 px width.
  if (window.matchMedia('(max-width:600px)').matches) Chart.defaults.aspectRatio = 1.8;

  function initCharts(){
    const ctx1 = $('chartCashflow').getContext('2d');
    chartCashflow = new Chart(ctx1, {
      data:{ labels:[], datasets:[
        {type:'bar', label:'Jahres-Cashflow', data:[], backgroundColor:[], yAxisID:'y', order:2},
        {type:'line', label:'Null', data:[], borderColor:'#9A9A90', borderWidth:1, pointRadius:0, borderDash:[2,3], yAxisID:'y', order:3}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }}
        },
        scales:{
          x:{ offset:false, title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:YEAR_TICKS },
          y:{ position:'left', afterFit:fixAxisWidth, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx1b = $('chartCumulative').getContext('2d');
    chartCumulative = new Chart(ctx1b, {
      data:{ labels:[], datasets:[
        {type:'line', label:'Kumuliert', data:[], borderColor:'#00788C', backgroundColor:'transparent', borderWidth:2.2, pointRadius:0, tension:0.15, yAxisID:'y', order:1},
        {type:'line', label:'Null', data:[], borderColor:'#9A9A90', borderWidth:1, pointRadius:0, borderDash:[2,3], yAxisID:'y', order:3}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }},
          vlineMarker:{ index:null, label:'' }
        },
        scales:{
          x:{ offset:false, title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:YEAR_TICKS },
          y:{ position:'left', afterFit:fixAxisWidth, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx2 = $('chartStock').getContext('2d');
    chartStock = new Chart(ctx2, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Bestand', data:[], borderColor:'#109A82', backgroundColor:'rgba(16,154,130,0.08)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false} },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx3 = $('chartRent').getContext('2d');
    chartRent = new Chart(ctx3, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Freier Markt', data:[], borderColor:'#E0435C', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.15},
        {label:'Kommunale Wohnungsgesellschaften', data:[], borderColor:'#A9762C', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.15},
        {label:'Verbraucherpreise (CPI, indexiert)', data:[], borderColor:'#6B6B63', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Haushaltseinkommen (indexiert)', data:[], borderColor:'#109A82', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Ø Miete im Bestand (Modell)', data:[], borderColor:'#00788C', backgroundColor:'rgba(0,120,140,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+ctx.parsed.y.toLocaleString('de-DE',{maximumFractionDigits:2})+' €/m²' }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>v.toLocaleString('de-DE',{maximumFractionDigits:1})+' €'}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx5 = $('chartBalance').getContext('2d');
    chartBalance = new Chart(ctx5, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Restschuld', data:[], borderColor:'#00788C', backgroundColor:'rgba(0,120,140,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }},
          vlineMarker:{ index:null, label:'' }
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx6 = $('chartCapital').getContext('2d');
    chartCapital = new Chart(ctx6, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Vermögenswert Bestand', data:[], borderColor:'#93AECB', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.1},
        {label:'Restschuld', data:[], borderColor:'#E0435C', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.1},
        {label:'Kumulierter Cashflow', data:[], borderColor:'#A9762C', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.1},
        {label:'Nettoposition', data:[], borderColor:'#109A82', backgroundColor:'rgba(16,154,130,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    // Sozialanteil nach Herkunft (sofort / bei Neuvermietung / aus Überschuss), gestapelt
    const fmtPct = v => v.toLocaleString('de-DE',{maximumFractionDigits:0})+' %';
    chartSozial = new Chart($('chartSozial').getContext('2d'), {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Sofort', data:[], borderColor:'#00788C', backgroundColor:'rgba(0,120,140,0.35)', borderWidth:1.5, pointRadius:0, fill:'origin', tension:0.15},
        {label:'Bei Neuvermietung', data:[], borderColor:'#A9762C', backgroundColor:'rgba(169,118,44,0.35)', borderWidth:1.5, pointRadius:0, fill:'-1', tension:0.15},
        {label:'Aus Überschuss', data:[], borderColor:'#109A82', backgroundColor:'rgba(16,154,130,0.35)', borderWidth:1.5, pointRadius:0, fill:'-1', tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{mode:'index', intersect:false, callbacks:{ label: ctx => ctx.dataset.label+': '+fmtPct(ctx.parsed.y - (ctx.datasetIndex ? ctx.chart.data.datasets[ctx.datasetIndex-1].data[ctx.dataIndex] : 0)) }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ min:0, max:100, afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtPct(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    chartTenantSavings = new Chart($('chartTenantSavings').getContext('2d'), {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Kumulierte Mieteinsparung', data:[], borderColor:'#109A82', backgroundColor:'rgba(16,154,130,0.10)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    if(byId('chartScenarios')) initScenarioChart();

    // Beide Sensitivitätsdiagramme: Nettoergebnis (links) und Break-even-Jahr (rechts) je Reglerwert.
    const sensChart = (id, xTitle) => new Chart($(id).getContext('2d'), {
      data:{ labels:[], datasets:[
        {type:'line', label:'Nettoergebnis', data:[], borderColor:'#00788C', backgroundColor:'rgba(0,120,140,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15, yAxisID:'y'},
        {type:'line', label:'Break-even (Jahr)', data:[], borderColor:'#A9762C', backgroundColor:'transparent', borderWidth:1.5, borderDash:[4,2], pointRadius:0, tension:0.15, yAxisID:'y1'}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+(ctx.dataset.label==='Break-even (Jahr)' ? (ctx.parsed.y===null?'kein Break-even':('Jahr '+ctx.parsed.y)) : fmtEUR(ctx.parsed.y)) }},
          vlineMarker:{ index:null, label:'' }
        },
        scales:{
          x:{ title:{display:true,text:xTitle,font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxRotation:0} },
          y:{ position:'left', suggestedMin:-45e9, suggestedMax:10e9, afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} },
          y1:{ position:'right', afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>'Jahr '+v}, grid:{display:false} }
        }
      }
    });
    chartRateSens = sensChart('chartRateSens', 'Zinssatz %');
    chartCompSens = sensChart('chartCompSens', 'Entschädigungsquote %');
    // Chart.js misst im geschlossenen <details> eine Breite von 0; beim Öffnen neu messen.
    $('sensPanel').addEventListener('toggle', ()=>{ chartRateSens.resize(); chartCompSens.resize(); });
    // Sprunglinks „Die Sensitivität“ und „Die Tabellen“ öffnen die zugeklappten Panels.
    [['sensitivitaet',['sensPanel']],['tabellen',['comparePanel','tablePanel']]].forEach(([target, panels])=>{
      document.querySelectorAll('a[href="#'+target+'"]').forEach(a=>a.addEventListener('click', ()=>{ panels.forEach(id=>{ $(id).open = true; }); }));
    });

    // Modellvergleich: eine Linie je Position, Datensätze werden in updateCompareCharts gesetzt.
    const compareChart = (id, fmt) => new Chart($(id).getContext('2d'), {
      type:'line',
      data:{ labels:[], datasets:[] },
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmt(ctx.parsed.y) }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:YEAR_TICKS },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmt(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });
    const fmtRent = v => v.toLocaleString('de-DE',{maximumFractionDigits:2})+' €';
    chartCompareCum = compareChart('chartCompareCum', fmtEUR);
    chartCompareBalance = compareChart('chartCompareBalance', fmtEUR);
    chartCompareRent = compareChart('chartCompareRent', fmtRent);
  }

  function render(){
    readState();
    updateLabels();

    const result = runScenario(state.price, state);

    // ---- stats ----
    // Kennzahlen oben: eine Nachkommastelle, Break-even als Halbsatz unter dem Nettoergebnis.
    const mrd1 = n => (n<0?'−':'')+(Math.abs(n)/1e9).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' Mrd €';
    $('s-kaufpreis').textContent = mrd1(result.principal);
    $('s-kaufpreis-sub').textContent = state.purchaseFactor+' % vom Verkehrswert';
    $('s-netto-label').textContent = 'nach '+state.horizon+' Jahren';
    $('s-netto').textContent = mrd1(result.netResult);
    $('s-netto').className = 'value '+(result.netResult>=0?'pos':'neg');
    $('s-netto-sub').textContent = result.breakEvenYear===null ? 'kein Break-even im Zeitraum' : 'Break-even in Jahr '+result.breakEvenYear;



    // ---- Jahres-Cashflow (bars) ----
    const labels = result.rows.map(r=>r.t);
    const cfValues = result.rows.map(r=>r.cashflow);
    chartCashflow.data.labels = labels;
    chartCashflow.data.datasets[0].data = cfValues;
    chartCashflow.data.datasets[0].backgroundColor = cfValues.map(v=> v>=0 ? '#109A82' : '#E0435C');
    chartCashflow.data.datasets[1].data = labels.map(()=>0);
    chartCashflow.update('none');

    // ---- Kumulierter Cashflow (line) ----
    chartCumulative.data.labels = labels;
    chartCumulative.data.datasets[0].data = result.rows.map(r=>r.cumForChart);
    chartCumulative.data.datasets[1].data = labels.map(()=>0);
    if(result.breakEvenYear){
      chartCumulative.options.plugins.vlineMarker.index = result.breakEvenYear-1;
      chartCumulative.options.plugins.vlineMarker.label = 'Break-even (Jahr '+result.breakEvenYear+')';
    } else {
      chartCumulative.options.plugins.vlineMarker.index = null;
    }
    chartCumulative.update('none');

    // ---- chart stock (conditional) ----
    const showStock = state.mode==='neubau';
    $('stockPanelWrap').style.display = showStock ? 'block' : 'none';
    if(showStock){
      $('stock-title').textContent = 'Der Bestand mit Neubau';
      $('stock-sub').textContent = 'Zahl der Wohnungen, wenn die Überschüsse in Neubau fließen (Einstellung unter „Der Überschuss“).';
      chartStock.data.labels = labels;
      chartStock.data.datasets[0].label = 'Wohnungen gesamt';
      chartStock.data.datasets[0].data = result.rows.map(r=>Math.round(r.units));
      chartStock.update('none');
    }

    // ---- chart rent level ----
    chartRent.data.labels = labels;
    chartRent.data.datasets[0].data = labels.map(t=>state.freeMarketRent*Math.pow(1.03,t-1));
    chartRent.data.datasets[1].data = labels.map(t=>state.munizRent*Math.pow(1.02,t-1));
    chartRent.data.datasets[2].data = labels.map(t=>state.baseRent*Math.pow(1+state.cpiGrowth/100,t-1));
    chartRent.data.datasets[3].data = labels.map(t=>state.baseRent*Math.pow(1+state.incomeGrowth/100,t-1));
    chartRent.data.datasets[4].data = result.rows.map(r=>r.avgRent);
    chartRent.update('none');

    // ---- chart Restschuld (conditional on Kredit) ----
    const showBalance = state.financing==='kredit';
    $('balancePanelWrap').style.display = showBalance ? 'block' : 'none';
    if(showBalance){
      chartBalance.data.labels = labels;
      chartBalance.data.datasets[0].data = result.rows.map(r=>r.balance);
      if(state.rateResetYears < state.term && state.rateResetYears < state.horizon){
        chartBalance.options.plugins.vlineMarker.index = state.rateResetYears;
        chartBalance.options.plugins.vlineMarker.label = 'Ende Zinsbindung';
      } else {
        chartBalance.options.plugins.vlineMarker.index = null;
      }
      chartBalance.update('none');
    }

    // ---- chart Kapitalposition (Vermögenswert Bestand vs. Restschuld) ----
    chartCapital.data.labels = labels;
    chartCapital.data.datasets[0].data = result.rows.map(r=>state.price*state.avgSize*r.units);
    chartCapital.data.datasets[1].data = result.rows.map(r=>r.balance||0);
    chartCapital.data.datasets[2].data = result.rows.map(r=>r.cumForChart);
    chartCapital.data.datasets[3].data = result.rows.map(r=>(state.price*state.avgSize*r.units)-(r.balance||0)+r.cumForChart);
    chartCapital.update('none');

    // ---- Die Sozialwohnungen und die Ersparnis der Mieter (nur bei Umwandlung in Sozialwohnungen) ----
    {
      chartSozial.data.labels = labels;
      chartSozial.data.datasets[0].data = result.rows.map(r=>r.sozImm/state.units*100);
      chartSozial.data.datasets[1].data = result.rows.map(r=>(r.sozImm+r.sozFix)/state.units*100);
      chartSozial.data.datasets[2].data = result.rows.map(r=>r.sozialUnits/state.units*100);
      chartSozial.update('none');
      // Mieterersparnis: Differenz Modellmiete − Sozialmiete × Wohnungen mit Sozialmiete, kumuliert
      let cumSavings = 0;
      chartTenantSavings.data.labels = labels;
      chartTenantSavings.data.datasets[0].data = result.rows.map(r=>{
        cumSavings += (r.rent - r.sozialRent) * r.sozialUnits * state.avgSize * 12;
        return cumSavings;
      });
      chartTenantSavings.update('none');
    }


    // ---- Sensitivität: Achsenbereich aus allen Presets an beiden Enden des Reglers ----
    // (bei aktuellem Zeithorizont/Bestand), damit die Achse beim Presetwechsel stabil bleibt.
    const sensRange = (key, ends) => {
      let lo = 0, hi = 0;
      Object.values(presets).forEach(preset=>{
        ends.forEach(v=>{
          const p = Object.assign({}, state, preset, {[key]:v});
          const r = runScenario(p.price, p);
          if(r.netResult<lo) lo = r.netResult;
          if(r.netResult>hi) hi = r.netResult;
        });
      });
      const pad = (hi-lo)*0.08 || 1e9;
      return [lo-pad, hi+pad];
    };

    // ---- chart Sensitivität Zinssatz (nur bei Kreditfinanzierung) ----
    const showRateSens = state.financing==='kredit';
    $('rateSensWrap').style.display = showRateSens ? 'block' : 'none';
    if(showRateSens){
      const rateSteps = [];
      for(let r=0; r<=7; r+=0.5) rateSteps.push(Math.round(r*10)/10);
      const rateResults = rateSteps.map(r=>runScenario(state.price, Object.assign({}, state, {rate:r})));
      chartRateSens.data.labels = rateSteps.map(r=>r.toLocaleString('de-DE',{minimumFractionDigits:1}));
      chartRateSens.data.datasets[0].data = rateResults.map(r=>r.netResult);
      chartRateSens.data.datasets[1].data = rateResults.map(r=>r.breakEvenYear);
      chartRateSens.options.scales.y1.ticks.display = rateResults.some(r=>r.breakEvenYear!==null);
      const [rateLo, rateHi] = sensRange('rate', [0,7]);
      chartRateSens.options.scales.y.suggestedMin = rateLo;
      chartRateSens.options.scales.y.suggestedMax = rateHi;
      const rateIdx = rateSteps.reduce((best,r,i)=> Math.abs(r-state.rate)<Math.abs(rateSteps[best]-state.rate) ? i : best, 0);
      chartRateSens.options.plugins.vlineMarker.index = rateIdx;
      chartRateSens.options.plugins.vlineMarker.label = 'aktuell: '+state.rate.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
      chartRateSens.update('none');
    }

    // ---- chart Sensitivität Entschädigungsquote (bei aktuellen Reglereinstellungen, Quote variiert) ----
    const pfSteps = [];
    for(let pf=40; pf<=100; pf+=5) pfSteps.push(pf);
    const pfResults = pfSteps.map(pf=>{
      const p = Object.assign({}, state, {purchaseFactor:pf});
      return runScenario(state.price, p);
    });
    chartCompSens.data.labels = pfSteps;
    chartCompSens.data.datasets[0].data = pfResults.map(r=>r.netResult);
    chartCompSens.data.datasets[1].data = pfResults.map(r=>r.breakEvenYear);
    chartCompSens.options.scales.y1.ticks.display = pfResults.some(r=>r.breakEvenYear!==null);
    const [compLo, compHi] = sensRange('purchaseFactor', [50,100]);
    chartCompSens.options.scales.y.suggestedMin = compLo;
    chartCompSens.options.scales.y.suggestedMax = compHi;
    let pfIdx = pfSteps.reduce((best,pf,i)=> Math.abs(pf-state.purchaseFactor)<Math.abs(pfSteps[best]-state.purchaseFactor) ? i : best, 0);
    chartCompSens.options.plugins.vlineMarker.index = pfIdx;
    chartCompSens.options.plugins.vlineMarker.label = 'aktuell: '+state.purchaseFactor+' %';
    chartCompSens.update('none');

    // ---- table ----
    const tbody = $('dataTableBody');
    tbody.innerHTML = result.rows.map(r=>{
      const stockCell = (state.mode==='neubau' ? fmtInt(r.units) : fmtInt(state.units))+' / '+fmtInt(r.sozialUnits);
      return '<tr><td>'+r.t+'</td><td>'+r.rent.toLocaleString('de-DE',{maximumFractionDigits:2})+'</td>'+
        '<td>'+r.avgRent.toLocaleString('de-DE',{maximumFractionDigits:2})+'</td>'+
        '<td>'+fmtEUR(r.income)+'</td><td>'+fmtEUR(r.noi)+'</td><td>'+fmtEUR(r.annuity)+'</td>'+
        '<td>'+fmtEUR(r.cashflow)+'</td><td>'+fmtEUR(r.cumForChart)+'</td><td>'+stockCell+'</td></tr>';
    }).join('');

    renderCompareTable();
  }

  function describeSnapshot(s){
    const finParts = [s.financing==='kredit' ? ('Kredit '+s.rate+'%') : 'Eigenmittel'];
    const modeLabel = s.mode==='neubau' ? 'Neubau' : 'keine Reinvest.';
    const sozialLabel = 'Sozial: sofort '+s.sozialImmediate+' %, '+'WBS-Quote '+s.sozialQuota+' % bei '+s.sozialTurnover+' % Fluktuation, Überschuss '+s.reinvestQuota2+' %';
    return finParts[0]+' · '+modeLabel+' · '+sozialLabel+' · '+s.purchaseFactor+'% Kaufpreis';
  }

  function renderCompareTable(){
    const slots = compareEntries();
    if(chartScenarios) updateScenarioChart(true);
    updateCompareCharts(slots);

    const headRow = $('compareHeadRow');
    const activeBtn = document.querySelector('.preset-btn.active');
    const currentLabel = 'Aktuell'+(activeBtn ? ' ('+activeBtn.textContent+')' : '');
    headRow.innerHTML = '<th style="text-align:left;">Kennzahl</th><th>'+currentLabel+'</th>'+
      slots.map(v=>'<th>'+escapeHtml(v.label)+'</th>').join('');

    const currentResult = runScenario(state.price, state);
    const results = [ {label:currentLabel, s:state, r:currentResult} ].concat(
      slots.map(v=>({label:v.label, s:v.p, r:v.r}))
    );

    const rowsDef = [
      ['Konfiguration', r=>describeSnapshot(r.s)],
      ['Kaufpreis (Basis)', r=>fmtEUR(r.r.principal)],
      ['Break-even (Basis)', r=>fmtYear(r.r.breakEvenYear)],
      ['Nettoergebnis (Basis)', r=>fmtEUR(r.r.netResult)],
      ['Bestandseffekt (Basis)', r=>{
        const parts = [];
        if(r.s.mode==='neubau') parts.push('+'+fmtInt(r.r.finalUnits-r.s.units)+' Whg.');
        parts.push((r.r.finalSozial/r.s.units*100).toLocaleString('de-DE',{maximumFractionDigits:1})+'% sozial');
        return parts.join(' · ');
      }]
    ];

    const body = $('compareBody');
    body.innerHTML = rowsDef.map(([label, fn])=>{
      return '<tr><td style="text-align:left;color:var(--ink);">'+label+'</td>'+
        results.map(r=>'<td>'+fn(r)+'</td>').join('')+'</tr>';
    }).join('');
  }

  // Die fünf Positionen und die gespeicherten Szenarien, alle über den eingestellten Horizont.
  // Farben folgen der Position, nicht dem Rang; gespeicherte Szenarien sind grau gestrichelt.
  const PRESET_ORDER = [['linke','Faire-Mieten-Modell','#00788C'],['dwe2025','DWE-Gesetzentwurf','#A9762C'],['holm','Bernt/Holm','#6B3FA0'],['rechnungshof','Rechnungshof','#E0435C'],['gegenmodell','IW/Empirica','#4A6FA5']];
  const SAVED_DASH = [[6,3],[2,3],[8,3,2,3],[4,4],[1,2]];
  function compareEntries(){
    const horizon = state.horizon;
    const entries = PRESET_ORDER.map(([key,label,color])=>({label, color, p:Object.assign({}, defaults, presets[key], {horizon})}))
      .concat(savedScenarios.map((v,i)=>({label:v.label, color:'#6B6B63', dash:SAVED_DASH[i%SAVED_DASH.length], p:Object.assign({}, v, {horizon})})));
    entries.forEach(e=>{ e.r = runScenario(e.p.price, e.p); });
    return entries;
  }

  function updateCompareCharts(slots){
    if(!chartCompareCum) return;
    const current = runScenario(state.price, state);
    const entries = [{label:'Aktuell', color:'#14171A', current:true, r:current}].concat(slots);
    const labels = current.rows.map(r=>r.t);
    const set = (chart, key) => {
      chart.data.labels = labels;
      chart.data.datasets = entries.map(e=>({
        label:e.label, data:e.r.rows.map(r=>r[key]), borderColor:e.color, backgroundColor:'transparent',
        borderWidth:e.current ? 3 : 1.5, borderDash:e.dash || [], pointRadius:0, tension:0.15, order:e.current ? 0 : 1
      }));
      chart.update('none');
    };
    set(chartCompareCum, 'cumForChart');
    set(chartCompareBalance, 'balance');
    set(chartCompareRent, 'avgRent');
    const legend = entries.map(e=>'<span><i class="swatch" style="background:'+e.color+'"></i>'+escapeHtml(e.label)+'</span>').join('');
    document.querySelectorAll('.compare-legend').forEach(el=>{ el.innerHTML = legend; });
  }

  function initScenarioChart(){
    const ctx8 = $('chartScenarios').getContext('2d');
    chartScenarios = new Chart(ctx8, {
      data:{ labels:[], datasets:[
        {type:'bar', label:'Kaufpreis', data:[], backgroundColor:'#93AECB', yAxisID:'y', order:2, categoryPercentage:0.45, barPercentage:0.9},
        {type:'bar', label:'Nettoergebnis', data:[], backgroundColor:[], yAxisID:'y', order:2, categoryPercentage:0.45, barPercentage:0.9}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }}
        },
        scales:{
          x:{ grid:{display:false}, ticks:{font:{family:'IBM Plex Mono',size:9}} },
          y:{ position:'left', ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });
  }

  // Szenario-Übersicht: die fünf Voreinstellungen, unabhängig von den aktuellen Reglern
  // withSaved (Modellseite): gespeicherte Szenarien als weitere Balken, alle über den eingestellten Horizont.
  function updateScenarioChart(withSaved){
    const horizon = withSaved ? state.horizon : defaults.horizon;
    const entries = PRESET_ORDER.map(([key,label])=>({label, p:Object.assign({}, defaults, presets[key])}));
    if(withSaved){
      entries.unshift({label:'Aktuell', p:state});
      savedScenarios.forEach(v=>entries.push({label:v.label, p:v}));
    }
    const presetResults = entries.map(({label,p})=>{
      const r = runScenario(p.price, Object.assign({}, p, {horizon}));
      return {label, principal:r.principal, netResult:r.netResult, breakEvenYear:r.breakEvenYear};
    });
    chartScenarios.data.labels = presetResults.map(r=>r.label);
    chartScenarios.data.datasets[0].data = presetResults.map(r=>r.principal);
    chartScenarios.data.datasets[1].data = presetResults.map(r=>r.netResult);
    chartScenarios.data.datasets[1].backgroundColor = presetResults.map(r=>r.netResult>=0?'#109A82':'#E0435C');
    chartScenarios.update('none');
    // Break-even als Satz statt als zweite Achse: im Horizont erreichen ihn meist nur wenige Positionen.
    const be = presetResults.filter(r=>r.breakEvenYear!==null);
    const beList = be.map(r=>r.label+' (Jahr '+r.breakEvenYear+')').join(', ');
    const beText = be.length===0 ? 'Keine Position erreicht innerhalb des Horizonts den Break-even.'
      : be.length===presetResults.length ? 'Break-even: '+beList+'.'
      : 'Innerhalb des Horizonts '+(be.length===1?'erreicht':'erreichen')+' nur '+beList+' den Break-even.';
    if(byId('scenario-breakeven')) $('scenario-breakeven').textContent = beText;
    if(byId('scenario-horizon')) $('scenario-horizon').textContent = defaults.horizon;
  }

  const presets = {
    linke: {
      // Faire-Mieten-Modell (Holm et al. / DWE-Papier): Entschädigung deutlich unter Verkehrswert,
      // ~14 Mrd € bei 3,70 €/m² Zielmiete. Verkehrswert einheitlich 2.085 €/m² (s. Rechnungshof) —
      // der Unterschied zu den anderen Modellen liegt in der Entschädigungsquote, nicht im Verkehrswert
      // (897/2085 ≈ 43,0 % vom Verkehrswert, entspricht ca. 14 Mrd € Gesamtkompensation).
      price: 2085, purchaseFactor: 43.0,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      baseRent: 3.70, rentGrowth: 0.5, costInflation: 2.5,
      opexMode: 'percent', opex: 40, mode: 'none', sozialQuota: 0
    },
    holm: {
      // Bernt & Holm 2023: Ist-Miete-Modell, Mietsenkung auf Landeseigenen-Niveau 6,29 €/m².
      // Verkehrswert einheitlich 2.085 €/m² — Entschädigungsquote 1538/2085 ≈ 73,8 % vom
      // Verkehrswert, entspricht ca. 24 Mrd € Gesamtkompensation.
      price: 2085, purchaseFactor: 73.8,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      baseRent: 6.29, rentGrowth: 1.5, costInflation: 2.0,
      opexMode: 'percent', opex: 35, mode: 'none', sozialQuota: 0
    },
    rechnungshof: {
      // Rechnungshof Berlin 2024: verkehrswertorientiert (~32,5 Mrd € bei 100% Entschädigungsquote), Bewirtschaftungskosten absolut 2,20 €/m²
      price: 2085, purchaseFactor: 100,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 30, rateResetYears: 10, rateIncrement: 1.0,
      baseRent: 6.71, rentGrowth: 1.5, costInflation: 2.0,
      opexMode: 'absolute', opexAbsolute: 2.20, mode: 'none', sozialQuota: 0
    },
    gegenmodell: {
      // IW Köln/Empirica 2026 (Bankengutachten): verkehrswertnah + Risikoprämie/Kapitalflucht-These
      price: 2085, purchaseFactor: 100,
      financing: 'kredit', rate: 3.5, riskPremium: 0.5, term: 30, rateResetYears: 5, rateIncrement: 2.0,
      baseRent: 7.63, rentGrowth: 1.5, costInflation: 3.0,
      opexMode: 'percent', opex: 40, mode: 'none', sozialQuota: 0
    },
    dwe2025: {
      // DWE-Gesetzentwurf, Stand 26.09.2025 (§§ 12-18 VergG-E): Entschädigung nach Sachwertverfahren
      // mit auf 2011-2013 eingefrorenem, seither nur 3,5%/Jahr fortgeschriebenem Bodenwert -- nicht
      // dem aktuellen Verkehrswert. Ausgedrückt als Anteil vom (uniform gehaltenen) Verkehrswert
      // 2085 €/m² ergibt das die vom PwC-Whitepaper (Heim/Hackelberg) bestaetigten 40-60%; Mittelwert
      // 50% verwendet -- ergibt bei 220.000 Wohnungen ≈14,9 Mrd €, mittig in der bestaetigten
      // 14,5-17,0-Mrd.-€-Spanne. Bestandsgröße 220.000 (nicht 240.000) laut PwC-Zitat des Gesetzentwurfs.
      // Zahlung erfolgt real über 100-jährige Schuldverschreibungen (Zinssatz 3,5%, keine Zinsbindungs-
      // Neuverhandlung) statt Bankkredit; eine echte endfällige Anleihe ist im Modell nicht abbildbar,
      // aber eine 100-jährige Annuität bei 3,5% liegt bei ≈3,6%/Jahr Zahlung -- de facto tilgungsfrei
      // innerhalb fast jedes hier darstellbaren Zeithorizonts (max. 100 Jahre) und damit eine nahe Annäherung.
      units: 220000, price: 2085, purchaseFactor: 50,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 100, rateResetYears: 100, rateIncrement: 0,
      baseRent: 3.70, rentGrowth: 0.5, costInflation: 2.5,
      opexMode: 'percent', opex: 40, mode: 'none', sozialQuota: 0
    }
  };

  // Seiten ohne Regler (Die Zahlen) zeigen nur die Szenario-Übersicht.
  if(!byId('chartCashflow')){
    if(byId('chartScenarios')){ initScenarioChart(); updateScenarioChart(); }
    return;
  }

  // ---- events ----
  sliderIds.forEach(id=>{
    $(id).addEventListener('input', render);
  });

  // Ruecklaeufige Bindung: "pro Wohnung"-Zweitfeld editieren -> €/m²-Regler + state aktualisieren.
  // Gerundet/geclamped auf den erlaubten Bereich des zugehoerigen Reglers, damit beide Felder
  // immer denselben (ggf. geclampten) Wert zeigen -- nie stillschweigend auseinanderlaufen.
  perUnitFields.forEach(({key})=>{
    const el = $(key+'PerUnit');
    const slider = $(key);
    el.addEventListener('input', ()=>{
      const entered = +el.value;
      if(!isFinite(entered) || state.avgSize<=0) return;
      let raw = entered/state.avgSize;
      const min = +slider.min, max = +slider.max, step = +slider.step || 1;
      raw = Math.min(max, Math.max(min, raw));
      raw = Math.round(raw/step)*step;
      raw = Math.round(raw*1000)/1000; // Gleitkomma-Reste vermeiden
      slider.value = raw;
      render();
    });
  });
  $('mode').addEventListener('change', render);
  document.querySelectorAll('#seg-financing button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#seg-financing button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.financing = btn.dataset.val;
      render();
    });
  });
  document.querySelectorAll('#seg-opexmode button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#seg-opexmode button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.opexMode = btn.dataset.val;
      render();
    });
  });
  function applyState(overrides){
    state = Object.assign({}, defaults, overrides);
    sliderIds.forEach(id=>{ $(id).value = state[id]; });
    $('mode').value = state.mode;
    document.querySelectorAll('#seg-financing button').forEach(b=>b.classList.toggle('active', b.dataset.val===state.financing));
    document.querySelectorAll('#seg-opexmode button').forEach(b=>b.classList.toggle('active', b.dataset.val===state.opexMode));
    render();
  }

  $('resetBtn').addEventListener('click', ()=>{
    applyState({});
    document.querySelectorAll('.preset-btn').forEach(b=>b.classList.remove('active'));
  });

  $('printBtn').addEventListener('click', ()=>{
    document.querySelectorAll('details.panel').forEach(d => d.open = true);
    window.print();
  });


  document.querySelectorAll('.preset-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.preset-btn').forEach(b=>b.classList.toggle('active', b===btn));
      applyState(presets[btn.dataset.preset]);
    });
  });
  // Sobald ein Regler, Feld oder Umschalter bewegt wird, ist es nicht mehr das Preset: Markierung aufheben.
  const clearPreset = ()=>{
    const active = document.querySelectorAll('.preset-btn.active');
    active.forEach(b=>b.classList.remove('active'));
    if(active.length) renderCompareTable();
  };
  const controlsEl = document.querySelector('.controls');
  if(controlsEl){
    controlsEl.addEventListener('input', e=>{ if(e.target.id!=='saveLabel') clearPreset(); });
    controlsEl.addEventListener('change', e=>{ if(e.target.id==='mode') clearPreset(); });
    controlsEl.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click', clearPreset));
  }

  // Gespeicherte Szenarien als Schaltflächen unter den Presets: Klick lädt, × löscht.
  function renderSavedButtons(activeIdx){
    const box = $('savedSlots');
    box.innerHTML = '';
    savedScenarios.forEach((v,i)=>{
      const row = document.createElement('div');
      row.className = 'saved-row';
      const btn = document.createElement('button');
      btn.className = 'preset-btn'+(i===activeIdx ? ' active' : '');
      btn.textContent = v.label;
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.preset-btn').forEach(b=>b.classList.toggle('active', b===btn));
        const s = Object.assign({}, v); delete s.label;
        applyState(s);
      });
      const del = document.createElement('button');
      del.className = 'snap-clear';
      del.textContent = '×';
      del.title = v.label+' löschen';
      del.addEventListener('click', ()=>{
        const activeBtn = box.querySelector('.preset-btn.active');
        let keep = activeBtn ? [...box.querySelectorAll('.preset-btn')].indexOf(activeBtn) : -1;
        savedScenarios.splice(i, 1);
        if(keep===i) keep = -1; else if(keep>i) keep--;
        storeScenarios();
        renderSavedButtons(keep);
        render();
      });
      row.append(btn, del);
      box.append(row);
    });
  }

  // Ein Feld, eine Schaltfläche: gleicher Name überschreibt, sonst neues Szenario (bei MAX_SAVED fällt das älteste weg).
  function saveScenario(){
    readState();
    const name = $('saveLabel').value.trim() || ('Szenario '+(savedScenarios.length+1));
    const entry = Object.assign({}, state, { label: name });
    let idx = savedScenarios.findIndex(v=>v.label===name);
    if(idx>=0) savedScenarios[idx] = entry;
    else {
      if(savedScenarios.length>=MAX_SAVED) savedScenarios.shift();
      savedScenarios.push(entry);
      idx = savedScenarios.length-1;
    }
    storeScenarios();
    $('saveLabel').value = '';
    document.querySelectorAll('.preset-btn.active').forEach(b=>b.classList.remove('active'));
    renderSavedButtons(idx);
    render();
  }

  // Link teilen: nur die Abweichungen von den Standardwerten, lesbar als #s=schlüssel:wert,…
  const textKeys = { financing:['kredit','eigen'], opexMode:['percent','absolute'], mode:['none','neubau'] };
  function encodeState(s){
    return Object.keys(defaults).filter(k=>s[k]!==defaults[k]).map(k=>k+':'+s[k]).join(',');
  }
  function decodeState(str){
    const out = {};
    str.split(',').forEach(pair=>{
      const [k, v] = pair.split(':');
      if(k==='sozialPaceRate' && isFinite(+v)){ out.sozialPaceRate = +v; return; }
      if(!(k in defaults) || v===undefined) return;
      if(textKeys[k]){ if(textKeys[k].includes(v)) out[k] = v; }
      else if(isFinite(+v)) out[k] = +v;
    });
    return migrateState(out);
  }
  $('shareBtn').addEventListener('click', ()=>{
    readState();
    const hash = '#s='+encodeState(state);
    history.replaceState(null, '', hash);
    const btn = $('shareBtn');
    const done = text=>{ btn.textContent = text; setTimeout(()=>{ btn.textContent = 'Link kopieren'; }, 2000); };
    if(navigator.clipboard) navigator.clipboard.writeText(location.href).then(()=>done('Link kopiert'), ()=>done('Link steht in der Adresszeile'));
    else done('Link steht in der Adresszeile');
  });
  $('saveBtn').addEventListener('click', saveScenario);
  $('saveLabel').addEventListener('keydown', e=>{ if(e.key==='Enter') saveScenario(); });

  initCharts();
  renderSavedButtons();
  if(location.hash.startsWith('#s=')) applyState(decodeState(decodeURIComponent(location.hash.slice(3))));
  else render();
})();
