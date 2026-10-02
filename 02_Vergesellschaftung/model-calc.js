(function(){
  "use strict";

  const $ = id => document.getElementById(id);

  const defaults = {
    units:240000, price:2085, purchaseFactor:100,
    financing:'kredit', rate:3.5, riskPremium:0, term:30, rateResetYears:10, rateIncrement:1.0, onceCosts:405, maintBacklog:20000, integrationCosts:2,
    baseRent:7.63, rentGrowth:1.5, costInflation:2.5, avgSize:65, opex:40, opexMode:'percent', opexAbsolute:2.2,
    freeMarketRent:15.8, munizRent:6.29, cpiGrowth:2.0, incomeGrowth:3.0,
    mode:'none', buildCost:3500, reinvestQuota1:100,
    sozialRent:6.5, convCost:1200, reinvestQuota2:100, sozialPace:'surplus', sozialPaceRate:3.3,
    horizon:50
  };
  let state = Object.assign({}, defaults);
  let savedScenarios = { A: null, B: null };

  const sliderIds = ['units','price','purchaseFactor','rate','riskPremium','term','rateResetYears','rateIncrement','onceCosts','maintBacklog','integrationCosts',
    'baseRent','rentGrowth','costInflation','avgSize','opex','opexAbsolute','freeMarketRent','munizRent','cpiGrowth','incomeGrowth','buildCost','reinvestQuota1',
    'sozialRent','convCost','reinvestQuota2','sozialPaceRate','horizon'];

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
  const AXIS_W = 100;
  function fixAxisWidth(scale){ scale.width = AXIS_W; }

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

      // fixed-schedule conversion: happens at the start of the year, in fixed steps,
      // independent of that year's cashflow (its cost then reduces this year's cashflow below)
      let fixedConversionCost = 0;
      if(p.mode==='sozial' && p.sozialPace==='fixed'){
        const capacityBefore = p.units - sozialUnits;
        const newSozialFixed = Math.min(p.units*((p.sozialPaceRate||0)/100), Math.max(capacityBefore,0));
        sozialUnits = sozialUnits + newSozialFixed;
        fixedConversionCost = newSozialFixed*p.convCost*p.avgSize;
      }

      let income;
      if(p.mode==='sozial'){
        const marketUnits = units - sozialUnits;
        income = marketUnits*p.avgSize*rent*12 + sozialUnits*p.avgSize*sozialRent*12;
      } else {
        income = units*p.avgSize*rent*12;
      }

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
        units, sozialUnits, rateNow: currentRate*100,
        avgRent: income/(units*p.avgSize*12),
        balance: p.financing==='kredit' ? balance : null});

      // reinvestment for next year -- spending is subtracted from the cash reserve (cum) so it is
      // counted exactly once (either as cash-on-hand, or converted into recorded asset/stock value),
      // never both. This also means it delays break-even/Kapitalposition, as real capex would.
      if(p.mode==='neubau'){
        const buildSpend = Math.max(cashflow,0)*(p.reinvestQuota1/100);
        const newUnits = buildSpend/(p.buildCost*p.avgSize);
        units = units + newUnits;
        cum -= buildSpend;
      } else if(p.mode==='sozial' && p.sozialPace!=='fixed'){
        const capacity = p.units - sozialUnits;
        const convBudget = Math.max(cashflow,0)*(p.reinvestQuota2/100);
        const newSozial = Math.min(convBudget/(p.convCost*p.avgSize), Math.max(capacity,0));
        const actualSpend = newSozial*p.convCost*p.avgSize; // capped if capacity is reached
        sozialUnits = sozialUnits + newSozial;
        cum -= actualSpend;
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
    state.reinvestQuota2 = +$('reinvestQuota2').value;
    state.sozialPaceRate = +$('sozialPaceRate').value;
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
    $('v-effectivePrice').textContent = fmtInt(effPricePerSqm)+' €/m² · '+effTotal.toLocaleString('de-DE',{maximumFractionDigits:1})+' Mrd €';
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
    $('v-reinvestQuota2').textContent = state.reinvestQuota2+' %';
    $('v-sozialPaceRate').textContent = state.sozialPaceRate.toLocaleString('de-DE',{minimumFractionDigits:1})+' %/Jahr';
    $('wrap-reinvestQuota2').style.display = state.sozialPace==='fixed' ? 'none' : 'block';
    $('wrap-sozialPaceRate').style.display = state.sozialPace==='fixed' ? 'block' : 'none';
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
    $('panel-sozial').classList.toggle('show', state.mode==='sozial');
  }

  let chartCashflow, chartCumulative, chartStock, chartRent, chartBalance, chartCapital, chartSozial, chartTenantSavings, chartScenarios, chartRateSens, chartCompSens;

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
      ctx.fillText(label, xPix+4, yArea.top+10);
      ctx.restore();
    }
  };
  Chart.register(vlinePlugin);
  Chart.defaults.color = '#14171A';

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
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ position:'left', afterFit:fixAxisWidth, title:{display:true,text:'Jahres-Cashflow',font:{family:'IBM Plex Mono',size:9}}, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx1b = $('chartCumulative').getContext('2d');
    chartCumulative = new Chart(ctx1b, {
      data:{ labels:[], datasets:[
        {type:'line', label:'Kumuliert', data:[], borderColor:'#1E3A5F', backgroundColor:'transparent', borderWidth:2.2, pointRadius:0, tension:0.15, yAxisID:'y', order:1},
        {type:'line', label:'Null', data:[], borderColor:'#9A9A90', borderWidth:1, pointRadius:0, borderDash:[2,3], yAxisID:'y', order:3}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }},
          vlineMarker:{ index:null, label:'' }
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ position:'left', afterFit:fixAxisWidth, title:{display:true,text:'Kumuliert',font:{family:'IBM Plex Mono',size:9}}, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx2 = $('chartStock').getContext('2d');
    chartStock = new Chart(ctx2, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Bestand', data:[], borderColor:'#2F7D46', backgroundColor:'rgba(47,125,70,0.08)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false} },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx3 = $('chartRent').getContext('2d');
    chartRent = new Chart(ctx3, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Freier Markt', data:[], borderColor:'#B23A34', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.15},
        {label:'Kommunale Wohnungsgesellschaften', data:[], borderColor:'#A9762C', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.15},
        {label:'Verbraucherpreise (CPI, indexiert)', data:[], borderColor:'#6B6B63', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Haushaltseinkommen (indexiert)', data:[], borderColor:'#3A7D44', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Ø Miete im Bestand (Modell)', data:[], borderColor:'#1E3A5F', backgroundColor:'rgba(30,58,95,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15}
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
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>v.toLocaleString('de-DE',{maximumFractionDigits:1})+' €'}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx5 = $('chartBalance').getContext('2d');
    chartBalance = new Chart(ctx5, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Restschuld', data:[], borderColor:'#1E3A5F', backgroundColor:'rgba(30,58,95,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
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
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx6 = $('chartCapital').getContext('2d');
    chartCapital = new Chart(ctx6, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Vermögenswert Bestand', data:[], borderColor:'#93AECB', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.1},
        {label:'Restschuld', data:[], borderColor:'#B23A34', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.1},
        {label:'Kumulierter Cashflow', data:[], borderColor:'#A9762C', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.1},
        {label:'Nettoposition', data:[], borderColor:'#2F7D46', backgroundColor:'rgba(47,125,70,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
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
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx7 = $('chartSozial').getContext('2d');
    chartSozial = new Chart(ctx7, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Sozialwohnungen', data:[], borderColor:'#A9762C', backgroundColor:'rgba(169,118,44,0.08)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtInt(ctx.parsed.y)+' Whg.' }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx7b = $('chartTenantSavings').getContext('2d');
    chartTenantSavings = new Chart(ctx7b, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Kumulierte Mieteinsparung', data:[], borderColor:'#2F7D46', backgroundColor:'rgba(47,125,70,0.10)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        layout:{padding:{right:AXIS_W}},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y) }}
        },
        scales:{
          x:{ title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}, maxTicksLimit:15} },
          y:{ afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    if($('chartScenarios')) initScenarioChart();

    const ctx9 = $('chartRateSens').getContext('2d');
    chartRateSens = new Chart(ctx9, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Ø jährlicher Zuschussbedarf', data:[], borderColor:'#B23A34', backgroundColor:'rgba(178,58,52,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.2}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        interaction:{mode:'index', intersect:false},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+fmtEUR(ctx.parsed.y*1e6) }},
          vlineMarker:{ index:null, label:'' }
        },
        scales:{
          x:{ title:{display:true,text:'Zinssatz %',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}} },
          y:{ min:0, suggestedMax:1800, title:{display:true,text:'Mio €/Jahr',font:{family:'IBM Plex Mono',size:9}}, ticks:{font:{family:'IBM Plex Mono',size:9}}, grid:{color:'#EAEAE4'} }
        }
      }
    });

    const ctx10 = $('chartCompSens').getContext('2d');
    chartCompSens = new Chart(ctx10, {
      data:{ labels:[], datasets:[
        {type:'line', label:'Nettoergebnis', data:[], borderColor:'#1E3A5F', backgroundColor:'rgba(30,58,95,0.06)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15, yAxisID:'y'},
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
          x:{ title:{display:true,text:'Entschädigungsquote %',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'#EAEAE4'}, ticks:{font:{family:'IBM Plex Mono',size:9}} },
          y:{ position:'left', suggestedMin:-45e9, suggestedMax:10e9, title:{display:true,text:'Nettoergebnis',font:{family:'IBM Plex Mono',size:9}}, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'} },
          y1:{ position:'right', title:{display:true,text:'Break-even (Jahr)',font:{family:'IBM Plex Mono',size:9}}, ticks:{font:{family:'IBM Plex Mono',size:9}}, grid:{display:false} }
        }
      }
    });
  }

  function render(){
    readState();
    updateLabels();

    const result = runScenario(state.price, state);

    // ---- stats ----
    $('s-kaufpreis').textContent = state.purchaseFactor+' % vom Verkehrswert';
    $('s-kaufpreis-sub').textContent = fmtInt(state.price*(state.purchaseFactor/100))+' €/m² · '+fmtEUR(result.principal)+' gesamt';

    // ---- verdict banner ----
    const verdictEl = $('verdictBanner');
    const isPos = result.netResult >= 0;
    verdictEl.className = 'verdict '+(isPos ? 'pos' : 'neg');
    const beText = result.breakEvenYear ? ('Break-even in Jahr '+result.breakEvenYear) : ('kein Break-even innerhalb von '+state.horizon+' Jahren');
    const modeText = state.mode==='neubau' ? (', dabei wächst der Bestand um '+fmtInt(result.finalUnits-state.units)+' Wohnungen')
      : state.mode==='sozial' ? (', dabei steigt der Sozialanteil auf '+(result.finalSozial/state.units*100).toLocaleString('de-DE',{maximumFractionDigits:1})+' %')
      : '';
    $('verdictText').innerHTML = 'Bei diesen Annahmen: '+(isPos?'Überschuss':'Defizit')+' von '+fmtEUR(Math.abs(result.netResult))+' nach '+state.horizon+' Jahren — '+beText+modeText+'.';

    $('s-breakeven').textContent = fmtYear(result.breakEvenYear);

    $('s-netto').textContent = fmtEUR(result.netResult);
    $('s-netto').className = 'value '+(result.netResult>=0?'pos':'neg');
    $('s-netto-sub').textContent = 'nach '+state.horizon+' Jahren';

    if(state.mode==='neubau'){
      const delta = result.finalUnits - state.units;
      $('s-bestand').textContent = '+'+fmtInt(delta);
      $('s-bestand-sub').textContent = 'neue Wohnungen';
    } else if(state.mode==='sozial'){
      const share = result.finalSozial/state.units*100;
      $('s-bestand').textContent = share.toLocaleString('de-DE',{maximumFractionDigits:1})+' %';
      $('s-bestand-sub').textContent = 'Sozialanteil';
    } else {
      $('s-bestand').textContent = '—';
      $('s-bestand-sub').textContent = 'keine Reinvestition';
    }


    // ---- Jahres-Cashflow (bars) ----
    const labels = result.rows.map(r=>r.t);
    const cfValues = result.rows.map(r=>r.cashflow);
    chartCashflow.data.labels = labels;
    chartCashflow.data.datasets[0].data = cfValues;
    chartCashflow.data.datasets[0].backgroundColor = cfValues.map(v=> v>=0 ? '#2F7D46' : '#B23A34');
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
    const showStock = state.mode!=='none';
    $('stockPanelWrap').style.display = showStock ? 'block' : 'none';
    if(showStock){
      $('stock-title').textContent = state.mode==='neubau' ? 'Der Bestand mit Neubau' : 'Der Sozialanteil am Bestand';
      $('stock-sub').textContent = state.mode==='neubau'
        ? 'Wachstum des Wohnungsbestands durch Reinvestition des Cashflow-Überschusses in Neubau, eingestellt unter „Der Überschuss“.'
        : 'Zunahme des mit Sozialmiete belegten Anteils am Bestand durch Reinvestition des Cashflow-Überschusses, eingestellt unter „Der Überschuss“.';
      chartStock.data.labels = labels;
      if(state.mode==='neubau'){
        chartStock.data.datasets[0].label = 'Wohnungen gesamt';
        chartStock.data.datasets[0].data = result.rows.map(r=>Math.round(r.units));
      } else {
        chartStock.data.datasets[0].label = 'Sozialwohnungen';
        chartStock.data.datasets[0].data = result.rows.map(r=>Math.round(r.sozialUnits));
      }
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

    // ---- chart Zunahme Sozialwohnungen (Vergleichsrechnung, unabhängig vom gewählten Modus) ----
    const sozialParams = Object.assign({}, state, {mode:'sozial'});
    const sozialResult = runScenario(state.price, sozialParams);
    const sozialData = sozialResult.rows.map(r=>Math.round(r.sozialUnits));
    chartSozial.data.labels = sozialResult.rows.map(r=>r.t);
    chartSozial.data.datasets[0].data = sozialData;
    chartSozial.options.scales.y.suggestedMax = state.units;
    chartSozial.update('none');

    // ---- chart Mieteinsparung für Mieter (kumuliert, aus derselben Sozial-Vergleichsrechnung) ----
    let cumSavings = 0;
    const savingsData = sozialResult.rows.map(r=>{
      const savingPerYear = (r.rent - r.sozialRent) * r.sozialUnits * state.avgSize * 12;
      cumSavings += savingPerYear;
      return cumSavings;
    });
    chartTenantSavings.data.labels = sozialResult.rows.map(r=>r.t);
    chartTenantSavings.data.datasets[0].data = savingsData;
    chartTenantSavings.update('none');

    if(chartScenarios) updateScenarioChart();

    // ---- chart Zinssensitivität (bei aktuellen Reglereinstellungen, Zins variiert) ----
    const rateSteps = [];
    for(let r=0; r<=7; r+=0.5) rateSteps.push(Math.round(r*10)/10);
    const rateSubsidy = rateSteps.map(r=>{
      const p = Object.assign({}, state, {rate:r});
      const res = runScenario(state.price, p);
      return res.netResult<0 ? (-res.netResult/state.horizon/1e6) : 0;
    });
    chartRateSens.data.labels = rateSteps.map(r=>r.toLocaleString('de-DE',{minimumFractionDigits:1})+' %');
    chartRateSens.data.datasets[0].data = rateSubsidy;
    let rateIdx = rateSteps.reduce((best,r,i)=> Math.abs(r-state.rate)<Math.abs(rateSteps[best]-state.rate) ? i : best, 0);
    chartRateSens.options.plugins.vlineMarker.index = rateIdx;
    chartRateSens.options.plugins.vlineMarker.label = 'aktuell: '+state.rate.toLocaleString('de-DE',{minimumFractionDigits:1})+' %';
    chartRateSens.update('none');

    // ---- chart Sensitivität Entschädigungsquote (bei aktuellen Reglereinstellungen, Quote variiert) ----
    const pfSteps = [];
    for(let pf=40; pf<=100; pf+=5) pfSteps.push(pf);
    const pfResults = pfSteps.map(pf=>{
      const p = Object.assign({}, state, {purchaseFactor:pf});
      return runScenario(state.price, p);
    });
    chartCompSens.data.labels = pfSteps.map(pf=>pf+' %');
    chartCompSens.data.datasets[0].data = pfResults.map(r=>r.netResult);
    chartCompSens.data.datasets[1].data = pfResults.map(r=>r.breakEvenYear);
    // Range derived from all presets (at current Zeithorizont/Bestand) rather than a
    // fixed constant, so the axis stays stable when switching presets but still adapts
    // correctly if Zeithorizont, Bestandsgröße etc. are changed.
    let compLo = 0, compHi = 0;
    Object.values(presets).forEach(preset=>{
      [50,100].forEach(pf=>{
        const p = Object.assign({}, state, preset, {purchaseFactor:pf});
        const r = runScenario(p.price, p);
        if(r.netResult<compLo) compLo = r.netResult;
        if(r.netResult>compHi) compHi = r.netResult;
      });
    });
    const compPad = (compHi-compLo)*0.08 || 1e9;
    chartCompSens.options.scales.y.suggestedMin = compLo-compPad;
    chartCompSens.options.scales.y.suggestedMax = compHi+compPad;
    let pfIdx = pfSteps.reduce((best,pf,i)=> Math.abs(pf-state.purchaseFactor)<Math.abs(pfSteps[best]-state.purchaseFactor) ? i : best, 0);
    chartCompSens.options.plugins.vlineMarker.index = pfIdx;
    chartCompSens.options.plugins.vlineMarker.label = 'aktuell: '+state.purchaseFactor+' %';
    chartCompSens.update('none');

    // ---- table ----
    const tbody = $('dataTableBody');
    tbody.innerHTML = result.rows.map(r=>{
      const stockCell = state.mode==='sozial' ? fmtInt(r.sozialUnits) : (state.mode==='neubau' ? fmtInt(r.units) : '–');
      return '<tr><td>'+r.t+'</td><td>'+r.rent.toLocaleString('de-DE',{maximumFractionDigits:2})+'</td>'+
        '<td>'+r.avgRent.toLocaleString('de-DE',{maximumFractionDigits:2})+'</td>'+
        '<td>'+fmtEUR(r.income)+'</td><td>'+fmtEUR(r.noi)+'</td><td>'+fmtEUR(r.annuity)+'</td>'+
        '<td>'+fmtEUR(r.cashflow)+'</td><td>'+fmtEUR(r.cumForChart)+'</td><td>'+stockCell+'</td></tr>';
    }).join('');

    renderCompareTable();
  }

  function describeSnapshot(s){
    const finParts = [s.financing==='kredit' ? ('Kredit '+s.rate+'%') : 'Eigenmittel'];
    const sozialPaceLabel = s.sozialPace==='fixed' ? (' (fest '+s.sozialPaceRate+'%/J.)') : ' (aus Überschuss)';
    const modeLabel = s.mode==='neubau' ? 'Neubau' : (s.mode==='sozial' ? ('Sozialumwandlung'+sozialPaceLabel) : 'keine Reinvest.');
    return finParts[0]+' · '+modeLabel+' · '+s.purchaseFactor+'% Kaufpreis';
  }

  function renderCompareTable(){
    const slots = Object.entries(savedScenarios).filter(([k,v])=>v!==null);
    const wrap = $('comparePanel');
    if(slots.length===0){ wrap.style.display='none'; return; }
    wrap.style.display='block';

    const headRow = $('compareHeadRow');
    headRow.innerHTML = '<th style="text-align:left;">Kennzahl</th><th>Aktuell</th>'+
      slots.map(([k,v])=>'<th>'+(v.label||('Szenario '+k))+'</th>').join('');

    const currentResult = runScenario(state.price, state);
    const results = [ {label:'Aktuell', s:state, r:currentResult} ].concat(
      slots.map(([k,v])=>({label:v.label||('Szenario '+k), s:v, r: runScenario(v.price, v)}))
    );

    const rowsDef = [
      ['Konfiguration', r=>describeSnapshot(r.s)],
      ['Kaufpreis (Basis)', r=>fmtEUR(r.r.principal)],
      ['Break-even (Basis)', r=>fmtYear(r.r.breakEvenYear)],
      ['Nettoergebnis (Basis)', r=>fmtEUR(r.r.netResult)],
      ['Bestandseffekt (Basis)', r=>{
        if(r.s.mode==='neubau') return '+'+fmtInt(r.r.finalUnits-r.s.units)+' Whg.';
        if(r.s.mode==='sozial') return (r.r.finalSozial/r.s.units*100).toLocaleString('de-DE',{maximumFractionDigits:1})+'% sozial';
        return '–';
      }]
    ];

    const body = $('compareBody');
    body.innerHTML = rowsDef.map(([label, fn])=>{
      return '<tr><td style="text-align:left;color:var(--ink);">'+label+'</td>'+
        results.map(r=>'<td>'+fn(r)+'</td>').join('')+'</tr>';
    }).join('');
  }

  function initScenarioChart(){
    const ctx8 = $('chartScenarios').getContext('2d');
    chartScenarios = new Chart(ctx8, {
      data:{ labels:[], datasets:[
        {type:'bar', label:'Kaufpreis', data:[], backgroundColor:'#93AECB', yAxisID:'y', order:2},
        {type:'bar', label:'Nettoergebnis', data:[], backgroundColor:[], yAxisID:'y', order:2},
        {type:'line', label:'Break-even (Jahr)', data:[], borderColor:'#14171A', backgroundColor:'#14171A', borderWidth:1.5, pointRadius:4, pointBackgroundColor:'#14171A', showLine:false, yAxisID:'y1', order:1}
      ]},
      options:{
        responsive:true,
        animation:{duration:250},
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{ label: ctx => ctx.dataset.label+': '+(ctx.dataset.label==='Break-even (Jahr)' ? (ctx.parsed.y===null?'kein Break-even':('Jahr '+ctx.parsed.y)) : fmtEUR(ctx.parsed.y)) }}
        },
        scales:{
          x:{ grid:{display:false}, ticks:{font:{family:'IBM Plex Mono',size:9}} },
          y:{ position:'left', title:{display:true,text:'Kaufpreis / Nettoergebnis',font:{family:'IBM Plex Mono',size:9}}, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} },
          y1:{ position:'right', title:{display:true,text:'Break-even (Jahr)',font:{family:'IBM Plex Mono',size:9}}, ticks:{ font:{family:'IBM Plex Mono',size:9} }, grid:{display:false} }
        }
      }
    });
  }

  // Szenario-Übersicht: die fünf Voreinstellungen, unabhängig von den aktuellen Reglern
  function updateScenarioChart(){
    const presetOrder = [['linke','Faire-Mieten'],['holm','Holm'],['rechnungshof','Rechnungshof'],['gegenmodell','Gegenmodell'],['dwe2025','DWE 2025']];
    const presetResults = presetOrder.map(([key,label])=>{
      const p = Object.assign({}, defaults, presets[key]);
      const r = runScenario(p.price, p);
      return {label, principal:r.principal, netResult:r.netResult, breakEvenYear:r.breakEvenYear};
    });
    chartScenarios.data.labels = presetResults.map(r=>r.label);
    chartScenarios.data.datasets[0].data = presetResults.map(r=>r.principal);
    chartScenarios.data.datasets[1].data = presetResults.map(r=>r.netResult);
    chartScenarios.data.datasets[1].backgroundColor = presetResults.map(r=>r.netResult>=0?'#2F7D46':'#B23A34');
    chartScenarios.data.datasets[2].data = presetResults.map(r=>r.breakEvenYear);
    chartScenarios.update('none');
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
      opexMode: 'percent', opex: 40, mode: 'none'
    },
    holm: {
      // Bernt & Holm 2023: Ist-Miete-Modell, Mietsenkung auf Landeseigenen-Niveau 6,29 €/m².
      // Verkehrswert einheitlich 2.085 €/m² — Entschädigungsquote 1538/2085 ≈ 73,8 % vom
      // Verkehrswert, entspricht ca. 24 Mrd € Gesamtkompensation.
      price: 2085, purchaseFactor: 73.8,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      baseRent: 6.29, rentGrowth: 1.5, costInflation: 2.0,
      opexMode: 'percent', opex: 35, mode: 'none'
    },
    rechnungshof: {
      // Rechnungshof Berlin 2024: verkehrswertorientiert (~32,5 Mrd € bei 100% Entschädigungsquote), Bewirtschaftungskosten absolut 2,20 €/m²
      price: 2085, purchaseFactor: 100,
      financing: 'kredit', rate: 3.5, riskPremium: 0, term: 30, rateResetYears: 10, rateIncrement: 1.0,
      baseRent: 6.71, rentGrowth: 1.5, costInflation: 2.0,
      opexMode: 'absolute', opexAbsolute: 2.20, mode: 'none'
    },
    gegenmodell: {
      // IW Köln/Empirica 2026 (Bankengutachten): verkehrswertnah + Risikoprämie/Kapitalflucht-These
      price: 2085, purchaseFactor: 100,
      financing: 'kredit', rate: 3.5, riskPremium: 0.5, term: 30, rateResetYears: 5, rateIncrement: 2.0,
      baseRent: 7.63, rentGrowth: 1.5, costInflation: 3.0,
      opexMode: 'percent', opex: 40, mode: 'none'
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
      opexMode: 'percent', opex: 40, mode: 'none'
    }
  };

  // Seiten ohne Regler (Die Zahlen) zeigen nur die Szenario-Übersicht.
  if(!$('chartCashflow')){
    if($('chartScenarios')){ initScenarioChart(); updateScenarioChart(); }
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
  document.querySelectorAll('#seg-sozialpace button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#seg-sozialpace button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.sozialPace = btn.dataset.val;
      render();
    });
  });
  function applyState(overrides){
    state = Object.assign({}, defaults, overrides);
    sliderIds.forEach(id=>{ $(id).value = state[id]; });
    $('mode').value = state.mode;
    document.querySelectorAll('#seg-financing button').forEach(b=>b.classList.toggle('active', b.dataset.val===state.financing));
    document.querySelectorAll('#seg-opexmode button').forEach(b=>b.classList.toggle('active', b.dataset.val===state.opexMode));
    document.querySelectorAll('#seg-sozialpace button').forEach(b=>b.classList.toggle('active', b.dataset.val===state.sozialPace));
    render();
  }

  $('resetBtn').addEventListener('click', ()=>applyState({}));

  $('printBtn').addEventListener('click', ()=>{
    document.querySelectorAll('details.panel').forEach(d => d.open = true);
    window.print();
  });


  document.querySelectorAll('.preset-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>applyState(presets[btn.dataset.preset]));
  });

  function saveSlot(key, labelInputId){
    readState();
    const labelVal = $(labelInputId).value.trim();
    savedScenarios[key] = Object.assign({}, state, { label: labelVal || ('Szenario '+key) });
    render();
  }
  $('saveA').addEventListener('click', ()=>saveSlot('A','labelA'));
  $('saveB').addEventListener('click', ()=>saveSlot('B','labelB'));

  initCharts();
  render();
})();
