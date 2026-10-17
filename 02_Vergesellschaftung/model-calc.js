(function(){
  "use strict";

  // A page cached from an older version may lack newer controls; a detached stand-in keeps the
  // script running instead of stopping all charts. Existence checks use byId.
  const byId = id => document.getElementById(id);
  const stand = {};
  const $ = id => byId(id) || (stand[id] = stand[id] || document.createElement('input'));

  // Grundsatz: Jede Position rechnet nur mit den Werten ihrer Quelle. Was eine Quelle nicht ansetzt, steht
  // hier neutral (0 bzw. aus) und lässt sich von Hand zuschalten. Prüfung gegen die Ergebnisse der Quellen: pruefung.js.
  const defaults = {
    units:240000, price:2085, purchaseFactor:100,
    financing:'kredit', rate:3.5, riskPremium:0, term:30, rateResetYears:10, rateIncrement:1.0, onceCosts:0, maintBacklog:0,
    // Eigenkapitalanteil: Teil des Kaufpreises, den das Land über einen eigenen Kredit (Landeszins, gleiche Laufzeit)
    // aufbringt; die AöR leiht nur den Rest. Mehrkosten Landesschulden: Mio € pro Jahr, die das Land zusätzlich trägt.
    equityShare:0, equityRate:3.0, landDebtCost:0,
    // Zweite Tranche als endfällige Anleihe (Anteil am Fremdkapital der AöR, Zins, Laufzeit bis zur Erneuerung);
    // Strukturierungsentgelt in % je neuer Zins- bzw. Anleiheperiode; anfängliche Tilgung in % (0 = Annuität über
    // die Laufzeit); Überschüsse tilgen: Rücklage über drei Monatsraten tilgt zu Beginn jeder neuen Periode.
    bondShare:0, bondRate:4.0, bondReset:7, feeRate:0, initialRepayment:0, sweep:'aus',
    // Bewirtschaftung in €/m² und Monat; Voreinstellung 3,05 = 40 % von 7,63 €/m², der frühere Standard „% der Miete“ (ohne Quelle).
    baseRent:7.63, rentGrowth:1.5, costInflation:2.5, avgSize:62, opexAbsolute:3.05,
    // Mietausfallwagnis in % der Mieteinnahmen (zusätzlich zu den Bewirtschaftungskosten).
    vacancyRate:0,
    // Anfangsphase: in den ersten startYears Jahren gelten eigene Raten; die Kosten steigen schon im ersten Jahr,
    // die Mieten ab dem zweiten (Rechnungshof 2024, S. 26; nachgerechnet an Ansicht 8, S. 29).
    startYears:0, startInflation:10, startRentGrowth:1,
    // Referenz freier Markt: Angebotsmiete Anfang 2026 16,75 €/m² (IW/Empirica 2026, S. 12), fortgeschrieben mit
    // 2,3 % pro Jahr, der Steigerung der ortsüblichen Vergleichsmiete bei Bernt/Holm 2023 (S. 13, 22, Tab. 6).
    // Die Steigerung der Angebotsmieten 2012–2026 (6,0 % pro Jahr) ist keine Prognose und wird nicht fortgeschrieben.
    freeMarketRent:16.75, freeMarketGrowth:2.3, munizRent:6.39, munizGrowth:1.6, cpiGrowth:2.0, incomeGrowth:3.0,
    mode:'none', buildCost:3500, reinvestQuota1:100,
    // Bewertung: 'nominal' summiert die Jahreswerte, 'barwert' zinst sie mit discountRate auf den Beginn von Jahr 1 ab.
    // Fehlbeträge verzinsen: ein negativer Kassenstand kostet Zinsen zum Kreditzins, eine Rücklage bringt keine
    // (keine Quelle rechnet so; bei Barwert zählt der Zeitwert doppelt).
    valuation:'nominal', discountRate:3.15, deficitInterest:'aus',
    // Grenze Sozialmiete = Miete der Landeseigenen: 6,39 €/m², das Niveau, auf das Bernt/Holm 2023 die Mieten
    // senken (S. 12, Tab. 2); Wachstum 1,6 %/Jahr, Mittel 2016–2021 (S. 22, Tab. 6). Liegt die Ø Miete im
    // Bestand höchstens auf dieser Grenze, gilt der Bestand als Sozialwohnungen.
    // Wohnungsgröße 62 m²: Senat 2018 (zitiert RH 2024, S. 25), DWE 2022, S. 102; RH 61, Bernt/Holm 63.
    // Einmalige Kosten und Sanierungsstau: keine gemeinsame Quelle, daher 0.
    horizon:50
  };
  let state = Object.assign({}, defaults);
  // Gespeicherte Szenarien (höchstens MAX_SAVED) bleiben im Browser (localStorage);
  // ohne Speicher (privates Fenster) nur bis zum Neuladen.
  const STORE_KEY = 'vergesellschaftung-szenarien';
  const MAX_SAVED = 5;
  let savedScenarios = [];
  // Ältere Speicherungen enthalten noch die Regler der entfernten Gruppe „Die Sozialwohnungen“.
  // Bis 2026-10-17 gab es Integrationskosten (% des Kaufpreises) und Bewirtschaftung als % der Miete.
  const OBSOLETE_KEYS = ['sozialRent','convCost','sozialImmediate','sozialTurnover','sozialQuota','reinvestQuota2','sozialPaceRate',
    'integrationCosts','opex','opexMode'];
  function migrateState(v){
    if(!v) return v;
    // „% der Miete“ wird zu €/m²: Anteil an der Ausgangsmiete der Speicherung. Ältere Links ohne opexMode
    // standen auf dem damaligen Standard „% der Miete“.
    if(v.opexMode==='percent' || (v.opexMode===undefined && 'opex' in v)){
      const rent = v.baseRent!==undefined ? v.baseRent : defaults.baseRent;
      v.opexAbsolute = Math.round(rent*(v.opex!==undefined ? v.opex : 40))/100;
    }
    OBSOLETE_KEYS.forEach(k=>{ delete v[k]; });
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

  const sliderIds = ['units','price','purchaseFactor','rate','riskPremium','term','rateResetYears','rateIncrement','onceCosts','maintBacklog',
    'equityShare','equityRate','landDebtCost','bondShare','bondRate','bondReset','feeRate','initialRepayment',
    'baseRent','rentGrowth','costInflation','avgSize','opexAbsolute','vacancyRate','startYears','startInflation','startRentGrowth',
    'freeMarketRent','freeMarketGrowth','munizRent','cpiGrowth','incomeGrowth','buildCost','reinvestQuota1','discountRate','horizon'];
  // Umschalter (Schaltflächengruppen) und der Zustand, den sie setzen.
  const segIds = { financing:'seg-financing', valuation:'seg-valuation', deficitInterest:'seg-deficit', sweep:'seg-sweep' };

  // Parameter, die im Kern €/m² sind, aber wahlweise auch als €-Betrag pro Wohnung
  // bedient werden koennen (verlinkte Zweitfelder, zwei Wege dieselbe Groesse einzugeben).
  // "monthly:true" heisst: der €/m²-Wert ist bereits ein Monatswert (z.B. Miete), also
  // ist der Pro-Wohnung-Wert = €/m²-Wert * avgSize (kein weiterer Faktor).
  const perUnitFields = [
    { key:'price', decimals:0 },
    { key:'baseRent', decimals:0 },
    { key:'opexAbsolute', decimals:0 },
    { key:'buildCost', decimals:0 }
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
  function fmtQuote(v){ return v.toLocaleString('de-DE',{maximumFractionDigits:2})+' %'; }
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

  // Grenze Sozialmiete im Jahr t: Miete der Landeseigenen, fortgeschrieben mit ihrem Wachstum
  function munizLimit(p, t){ return p.munizRent*Math.pow(1+p.munizGrowth/100, t-1); }
  // Wie lange der Bestand unter der Grenze bleibt: alle Jahre, bis Jahr X oder nie
  function fmtLimit(r, horizon){
    if(r.belowLimitYears>=horizon) return 'alle Jahre';
    return r.belowLimitYears>0 ? 'bis Jahr '+r.belowLimitYears : 'nie';
  }

  // ---- core simulation for one price-per-sqm scenario (€/m² Verkehrswert) ----
  function runScenario(pricePerSqm, p){
    const fullValue = p.units*p.avgSize*pricePerSqm;
    const principal = fullValue*(p.purchaseFactor/100);
    const kredit = p.financing==='kredit';
    // Bei Kredit bringt das Land den Eigenkapitalanteil über einen eigenen Kredit auf, die AöR leiht den Rest.
    const equity = kredit ? principal*((p.equityShare||0)/100) : 0;
    // Fremdkapital der AöR: Annuitätendarlehen und, wahlweise, endfällige Anleihe.
    const debt = principal - equity;
    let bondBalance = debt*((p.bondShare||0)/100);
    let balance = debt - bondBalance;
    let currentRate = p.rate/100 + p.riskPremium/100;
    let bondRateNow = (p.bondRate||0)/100;
    // Annuität: über die Laufzeit, oder aus Zins und fester anfänglicher Tilgung (bleibt nach der Zinsbindung gleich).
    const fixedRepayment = (p.initialRepayment||0) > 0;
    let annuity = !kredit ? 0 : fixedRepayment ? balance*(currentRate + p.initialRepayment/100) : pmt(currentRate, p.term, balance);
    let reserve = 0, lastService = 0;
    const equityRate = (p.equityRate||0)/100;
    // Ohne Zins des Landes zahlt das Land seinen Anteil bei der Übernahme ein (Einmalzahlung in Jahr 0),
    // mit Zins über einen eigenen Kredit mit derselben Laufzeit.
    const equityUpfront = equityRate > 0 ? 0 : equity;
    let equityBalance = equity - equityUpfront;
    const equityAnnuity = pmt(equityRate, p.term, equityBalance);

    // Fortschreibung; in der Anfangsphase steigen die Kosten schon im ersten Jahr, die Mieten ab dem zweiten.
    const N = p.startYears||0;
    const costIndex = t => N>0
      ? Math.pow(1+p.startInflation/100, Math.min(t,N))*Math.pow(1+p.costInflation/100, Math.max(0,t-N))
      : Math.pow(1+p.costInflation/100, t-1);
    const rentIndex = t => N>0
      ? Math.pow(1+p.startRentGrowth/100, Math.min(t,N)-1)*Math.pow(1+p.rentGrowth/100, Math.max(0,t-N))
      : Math.pow(1+p.rentGrowth/100, t-1);
    // Barwert: Abzinsung auf den Beginn von Jahr 1 (wie Rechnungshof 2024, Ansicht 12).
    const discount = p.valuation==='barwert';
    const df = t => discount ? Math.pow(1+p.discountRate/100, -(t-1)) : 1;

    let units = p.units, bookNew = 0;
    // Jahre ab Jahr 1, in denen die Ø Miete höchstens auf der Grenze Sozialmiete liegt
    let belowLimitYears = 0, belowLimit = true;
    // Einmalkosten bei Übernahme (Jahr 0): Transaktion und Integration, Sanierungsstau.
    // Werden hier als Startsaldo verbucht, damit sie im Jahr-für-Jahr-Verlauf, im Cashflow-Chart
    // und in der Break-even-Berechnung sichtbar/wirksam sind -- statt nur am Ende vom Nettoergebnis
    // abgezogen zu werden, ohne je im Cashflow-Verlauf aufzutauchen.
    const upfrontCosts = p.onceCosts*1e6 + p.maintBacklog*p.units + equityUpfront;
    // cash: nominaler Kassenstand (Grundlage der Zinsen auf Fehlbeträge); cum: kumuliert, nominal oder als Barwert.
    let cash = -upfrontCosts, cum = -upfrontCosts;
    const rows = [];
    let breakEvenYear = null;
    const opexPerUnitBase = p.avgSize*p.opexAbsolute*12;

    for(let t=1;t<=p.horizon;t++){
      const rent = p.baseRent*rentIndex(t);
      const income = units*p.avgSize*rent*12;
      const limit = munizLimit(p, t);
      if(belowLimit && rent <= limit*(1+1e-9)) belowLimitYears = t; else belowLimit = false;

      const ci = costIndex(t);
      const opexAmt = units*opexPerUnitBase*ci + income*((p.vacancyRate||0)/100);
      const noi = income - opexAmt;

      // financing with rate reset at end of Zinsbindung
      // Kapitaldienst der AöR: Annuität, Anleihezinsen, Strukturierungsentgelte, Restzahlung am Laufzeitende.
      let annuityThisYear = 0, swept = 0;
      // Aufschlüsselung je Jahr (nominal): Zinsen und Tilgung je Kreditart, Sondertilgungen, Entgelte.
      let loanInt = 0, loanPrin = 0, bondInt = 0, bondPrin = 0, sweptLoan = 0, sweptBond = 0, feesNow = 0;
      if(kredit && t<=p.term){
        if(t === p.rateResetYears+1 && p.rateResetYears < p.term){
          currentRate = p.rate/100 + p.riskPremium/100 + p.rateIncrement/100;
          if(!fixedRepayment) annuity = pmt(currentRate, p.term - p.rateResetYears, balance);
        }
        const loanRenew = t>1 && p.rateResetYears>0 && (t-1)%p.rateResetYears===0;
        const bondRenew = t>1 && p.bondReset>0 && (t-1)%p.bondReset===0 && bondBalance>0;
        if(t === p.bondReset+1) bondRateNow += p.rateIncrement/100;   // einmaliger Aufschlag wie beim Darlehen
        // Überschüsse tilgen: Rücklage über einem Viertel des letzten Kapitaldienstes, zuerst die Anleihe.
        if(p.sweep==='an' && (loanRenew || bondRenew) && reserve > lastService/4){
          let use = reserve - lastService/4;
          const b = Math.min(use, bondBalance); bondBalance -= b; use -= b;
          const l = Math.min(use, balance); balance -= l;
          swept = b + l; reserve -= swept; sweptBond = b; sweptLoan = l;
        }
        const feeRate = (p.feeRate||0)/100;
        let fees = 0;
        if(t === 1) fees = (balance + bondBalance)*feeRate;
        else { if(loanRenew) fees += balance*feeRate; if(bondRenew) fees += bondBalance*feeRate; }
        let loanService = 0;
        if(balance > 0){
          const interestPortion = balance*currentRate;
          let principalPortion = t===p.term ? balance : Math.min(annuity - interestPortion, balance);
          balance = Math.max(balance - principalPortion, 0);
          loanService = interestPortion + principalPortion;
          loanInt = interestPortion; loanPrin = principalPortion;
        }
        let bondService = bondBalance*bondRateNow;
        bondInt = bondService;
        if(t===p.term){ bondPrin = bondBalance; bondService += bondBalance; bondBalance = 0; }
        feesNow = fees;
        annuityThisYear = loanService + bondService + fees;
        lastService = annuityThisYear;
      }

      // Ergebnis der AöR: Überschuss bzw. Zuschussbedarf aus Bewirtschaftung und ihrem Kapitaldienst.
      const aoer = noi - annuityThisYear;
      if(p.sweep==='an') reserve += aoer;
      // Land: Kapitaldienst für den Eigenkapitalanteil und Mehrkosten der Landesschulden.
      let land = (p.landDebtCost||0)*1e6;
      let landInt = 0, landPrin = 0;
      if(kredit && t<=p.term && equityBalance>0){
        let pr = equityAnnuity - equityBalance*equityRate;
        if(pr > equityBalance) pr = equityBalance;
        landInt = equityBalance*equityRate; landPrin = pr;
        equityBalance = Math.max(equityBalance - pr, 0);
        land += equityAnnuity;
      }
      const interest = (p.deficitInterest==='an' && cash<0) ? cash*currentRate : 0;
      const cashflow = aoer - land + interest;
      const d = df(t);
      // Getilgte Rücklage verlässt die Kasse und senkt die Schuld um denselben Betrag.
      cash += cashflow - swept;
      cum += (cashflow - swept)*d;
      if(breakEvenYear===null && (kredit ? cum>0 : cum>principal)) breakEvenYear = t;

      rows.push({t, rent, limit, income, noi, annuity:annuityThisYear, aoer:aoer*d, land:land*d, interest:interest*d,
        cashflow:cashflow*d, sweptPV: swept*d,
        cumForChart: kredit ? cum : (cum-principal),
        units, bookNew, rateNow: currentRate*100,
        avgRent: income/(units*p.avgSize*12),
        service: annuityThisYear, swept,
        parts: {opex:opexAmt, loanInt, loanPrin, bondInt, bondPrin, fees:feesNow, sweptLoan, sweptBond, landInt, landPrin, land, cashInterest:interest, cash, loanBal:kredit?balance:0, bondBal:kredit?bondBalance:0, equityBal:equityBalance, build:0},
        balance: kredit ? balance+bondBalance+equityBalance : null});

      // reinvestment for next year -- spending is subtracted from the cash reserve (cum) so it is
      // counted exactly once (either as cash-on-hand, or converted into recorded asset/stock value),
      // never both. This also means it delays break-even/Kapitalposition, as real capex would.
      // Baukosten steigen mit den Kosten; neue Wohnungen gehen mit ihren Baukosten in den Vermögenswert ein.
      if(p.mode==='neubau'){
        const buildSpend = Math.max(cashflow,0)*(p.reinvestQuota1/100);
        units += buildSpend/(p.buildCost*ci*p.avgSize);
        bookNew += buildSpend;
        rows[rows.length-1].parts.build = buildSpend;
        cash -= buildSpend;
        cum -= buildSpend*d;
      }
    }

    // Einmalkosten sind bereits im Startsaldo von cum enthalten (s.o.), daher hier kein erneuter Abzug.
    const last = rows[rows.length-1];
    const first10 = rows.slice(0, 10);
    return {
      principal, fullValue, equity, rows, breakEvenYear, netResult: last.cumForChart,
      upfrontCosts, equityUpfront, bondStart: kredit ? debt*((p.bondShare||0)/100) : 0, loanStart: kredit ? debt*(1-(p.bondShare||0)/100) : 0,
      finalUnits: last.units,
      finalDebt: last.balance || 0,
      aoerAvg10: first10.reduce((s,r)=>s+r.aoer, 0)/first10.length,
      belowLimitYears
    };
  }

  // Umschalter setzen den Zustand beim Klick; Regler werden hier gelesen. Fehlt ein Regler (alte Seite im Cache),
  // bleibt der bisherige Wert.
  function readState(){
    sliderIds.forEach(id=>{ if(byId(id)) state[id] = +byId(id).value; });
    state.mode = $('mode').value;
  }

  function updateLabels(){
    $('v-units').textContent = fmtInt(state.units);
    $('v-price').textContent = fmtInt(state.price)+' €/m²';
    const total = state.units*state.avgSize*state.price/1e9;
    $('v-totalDerived').textContent = total.toLocaleString('de-DE',{maximumFractionDigits:1})+' Mrd €';
    $('v-purchaseFactor').textContent = fmtQuote(state.purchaseFactor);
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
    $('v-baseRent').textContent = state.baseRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-rentGrowth').textContent = state.rentGrowth.toLocaleString('de-DE',{minimumFractionDigits:1, maximumFractionDigits:2})+' %';
    $('v-costInflation').textContent = state.costInflation.toLocaleString('de-DE',{minimumFractionDigits:1, maximumFractionDigits:2})+' %';
    $('v-avgSize').textContent = state.avgSize+' m²';
    $('v-opexAbsolute').textContent = state.opexAbsolute.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-freeMarketRent').textContent = state.freeMarketRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-munizRent').textContent = state.munizRent.toLocaleString('de-DE',{minimumFractionDigits:2})+' €/m²';
    $('v-cpiGrowth').textContent = state.cpiGrowth.toLocaleString('de-DE',{minimumFractionDigits:1})+' %/J.';
    $('v-incomeGrowth').textContent = state.incomeGrowth.toLocaleString('de-DE',{minimumFractionDigits:1})+' %/J.';
    $('v-buildCost').textContent = fmtInt(state.buildCost)+' €/m²';
    $('v-reinvestQuota1').textContent = state.reinvestQuota1+' %';
    $('v-horizon').textContent = state.horizon+' Jahre';
    const pct = (v, d) => v.toLocaleString('de-DE',{minimumFractionDigits:d, maximumFractionDigits:2})+' %';
    $('v-equityShare').textContent = state.equityShare+' %';
    $('v-equityRate').textContent = pct(state.equityRate, 1);
    $('v-landDebtCost').textContent = fmtInt(state.landDebtCost)+' Mio €/J.';
    $('v-vacancyRate').textContent = pct(state.vacancyRate, 1);
    $('v-startYears').textContent = state.startYears===0 ? 'keine' : state.startYears+' J.';
    $('v-startInflation').textContent = pct(state.startInflation, 1);
    $('v-startRentGrowth').textContent = pct(state.startRentGrowth, 1);
    $('v-freeMarketGrowth').textContent = pct(state.freeMarketGrowth, 1)+'/J.';
    $('v-discountRate').textContent = pct(state.discountRate, 2);
    $('v-initialRepayment').textContent = state.initialRepayment>0 ? pct(state.initialRepayment, 2) : 'Annuität';
    $('v-bondShare').textContent = state.bondShare+' %';
    $('v-bondRate').textContent = pct(state.bondRate, 1);
    $('v-bondReset').textContent = state.bondReset+' J.';
    $('v-feeRate').textContent = pct(state.feeRate, 1);

    // verlinkte "pro Wohnung"-Zweitfelder aktualisieren (nicht ueberschreiben waehrend der Nutzer tippt)
    perUnitFields.forEach(({key, decimals})=>{
      const el = $(key+'PerUnit');
      if(document.activeElement !== el){
        const perUnit = state[key]*state.avgSize;
        el.value = Math.round(perUnit*Math.pow(10,decimals))/Math.pow(10,decimals);
      }
    });

    renderDepends();
    renderPresetNotes();

  }

  // Alle Regler bleiben sichtbar und bedienbar, damit sich jede Position als Grundlage eines eigenen Modells
  // weiterbearbeiten lässt. Wirkt ein Regler gerade nicht, sagt ein Hinweis darunter, wovon er abhängt.
  const NEEDS = {
    kredit: ()=>state.financing==='kredit',
    equity: ()=>state.financing!=='kredit' || state.equityShare>0,
    reset: ()=>state.rateResetYears<state.term,
    bond: ()=>state.bondShare>0,
    start: ()=>state.startYears>0,
    barwert: ()=>state.valuation==='barwert',
    deficitNominal: ()=>!(state.deficitInterest==='an' && state.valuation==='barwert'),
    neubau: ()=>state.mode==='neubau'
  };
  function renderDepends(){
    document.querySelectorAll('.hint.needs').forEach(el=>{
      const met = NEEDS[el.dataset.needs];
      el.hidden = !met || met();
    });
  }
  // „Weitere Annahmen“: Zahl der Werte, die vom Standard abweichen (etwa weil eine Position sie setzt).
  const segKeyById = Object.fromEntries(Object.entries(segIds).map(([k,id])=>[id,k]));
  function renderPresetNotes(){
    document.querySelectorAll('details.more').forEach(box=>{
      const note = box.querySelector('.more-note');
      if(!note) return;
      const keys = [...box.querySelectorAll('input[type=range], select')].map(el=>el.id)
        .concat([...box.querySelectorAll('.seg')].map(el=>segKeyById[el.id]));
      const n = keys.filter(k=>k in defaults && state[k]!==defaults[k]).length;
      note.textContent = n ? ' · '+n+' vom Standard abweichend' : '';
    });
  }

  let chartCashflow, chartCumulative, chartStock, chartRent, chartBalance, chartCapital, chartScenarios, chartRateSens, chartCompSens, chartCompareCum, chartCompareBalance, chartCompareRent;

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
      ctx.strokeStyle = '#9A9A92';
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

  function initCharts(){
    if(byId('chartCashflow')){
    const ctx1 = $('chartCashflow').getContext('2d');
    chartCashflow = new Chart(ctx1, {
      data:{ labels:[], datasets:[
        // Gestapelt: Ergebnis der AöR (mit Zinsen auf den Kassenstand), Zahlungen des Landes, Sondertilgungen.
        {type:'bar', label:'Ergebnis der AöR', data:[], backgroundColor:[], yAxisID:'y', order:2, stack:'cf'},
        {type:'bar', label:'Land', data:[], backgroundColor:'#FF8A1E', yAxisID:'y', order:2, stack:'cf'},
        {type:'bar', label:'Sondertilgung', data:[], backgroundColor:'#B8B2E8', yAxisID:'y', order:2, stack:'cf'},
        {type:'line', label:'Null', data:[], borderColor:'#9A9A90', borderWidth:1, pointRadius:0, borderDash:[2,3], yAxisID:'y', order:3, stack:'null'}
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
          x:{ offset:false, stacked:true, title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:YEAR_TICKS },
          y:{ position:'left', stacked:true, afterFit:fixAxisWidth, ticks:{ font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v) }, grid:{color:'#EAEAE4'} }
        }
      }
    });
    }

    if(byId('chartCumulative')){
    const ctx1b = $('chartCumulative').getContext('2d');
    chartCumulative = new Chart(ctx1b, {
      data:{ labels:[], datasets:[
        {type:'line', label:'Kumuliert', data:[], borderColor:'#00A0E3', backgroundColor:'transparent', borderWidth:2.2, pointRadius:0, tension:0.15, yAxisID:'y', order:1},
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
    }

    const ctx2 = $('chartStock').getContext('2d');
    chartStock = new Chart(ctx2, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Bestand', data:[], borderColor:'#C8B400', backgroundColor:'rgba(200,180,0,0.10)', borderWidth:2, pointRadius:0, fill:true, tension:0.15}
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
        {label:'Freier Markt', data:[], borderColor:'#FF3D8B', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.15},
        {label:'Grenze Sozialmiete (Landeseigene)', data:[], borderColor:'#FF8A1E', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.15},
        {label:'Verbraucherpreise (CPI, indexiert)', data:[], borderColor:'#9A9A92', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Haushaltseinkommen (indexiert)', data:[], borderColor:'#C8B400', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.15},
        {label:'Ø Miete im Bestand (Modell)', data:[], borderColor:'#00A0E3', backgroundColor:'rgba(0,160,227,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15}
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

    if(byId('chartBalance')){
    const ctx5 = $('chartBalance').getContext('2d');
    chartBalance = new Chart(ctx5, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Restschuld', data:[], borderColor:'#00A0E3', backgroundColor:'rgba(0,160,227,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
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
    }

    if(byId('chartCapital')){
    const ctx6 = $('chartCapital').getContext('2d');
    chartCapital = new Chart(ctx6, {
      type:'line',
      data:{ labels:[], datasets:[
        {label:'Vermögenswert Bestand', data:[], borderColor:'#B8B2E8', backgroundColor:'transparent', borderWidth:1.5, borderDash:[3,3], pointRadius:0, tension:0.1},
        {label:'Restschuld', data:[], borderColor:'#FF3D8B', backgroundColor:'transparent', borderWidth:1.5, borderDash:[6,2], pointRadius:0, tension:0.1},
        {label:'Kumulierter Cashflow', data:[], borderColor:'#FF8A1E', backgroundColor:'transparent', borderWidth:1.2, borderDash:[1,3], pointRadius:0, tension:0.1},
        {label:'Nettoposition', data:[], borderColor:'#C8B400', backgroundColor:'rgba(200,180,0,0.10)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.1}
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
    }

    if(byId('chartScenarios')) initScenarioChart();
    if(byId('chartFinance')) initFinanceCharts();

    // Beide Sensitivitätsdiagramme: Nettoergebnis (links) und Break-even-Jahr (rechts) je Reglerwert.
    const sensChart = (id, xTitle) => new Chart($(id).getContext('2d'), {
      data:{ labels:[], datasets:[
        {type:'line', label:'Nettoergebnis', data:[], borderColor:'#00A0E3', backgroundColor:'rgba(0,160,227,0.08)', borderWidth:2.2, pointRadius:0, fill:true, tension:0.15, yAxisID:'y'},
        {type:'line', label:'Break-even (Jahr)', data:[], borderColor:'#FF8A1E', backgroundColor:'transparent', borderWidth:1.5, borderDash:[4,2], pointRadius:0, tension:0.15, yAxisID:'y1'}
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

  // ---- Finanzierung, Mietverwendung, Schulden ----
  // Drei Begriffe: Aufwand (Bewirtschaftung, Zinsen, Entgelte) ist verbraucht; Tilgung wandelt Schulden in Eigentum;
  // Finanzierung sagt, woher das Geld für den Kauf kommt. Alle Werte nominal.
  let chartFinance, chartRentUse, chartDebt, finUnit = 'mio';
  const FC = {equity:'#FF8A1E', bank:'#6E62D6', bond:'#B8B2E8', once:'#9A9A92', opex:'#D4D4CC', interest:'#FF3D8B',
    repay:'#00A0E3', build:'#8FD3F2', rest:'#FFE500', deficit:'#9C0059', landBal:'#FFC48A', landPaid:'#FF8A1E'};
  const finBar = (label, color) => ({type:'bar', label, data:[], backgroundColor:color, stack:'s', categoryPercentage:0.9, barPercentage:0.9});
  const finLine = label => ({type:'line', label, data:[], borderColor:'#222', borderWidth:1.8, pointRadius:0, tension:0, stack:'line', order:0});
  const finFmtQ = v => v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €/m²';
  const finFmtStock = v => Math.round(v).toLocaleString('de-DE')+' €/m²';
  function finYearOptions(fmt){
    return { responsive:true, animation:{duration:250}, interaction:{mode:'index', intersect:false},
      layout:{padding:{right:AXIS_W}},
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmt(c.parsed.y)}} },
      scales:{ x:{stacked:true, offset:true, title:{display:true,text:'Jahr',font:{family:'IBM Plex Mono',size:10}}, grid:{display:false}, ticks:YEAR_TICKS},
        y:{stacked:true, afterFit:fixAxisWidth, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmt(v)}, grid:{color:'#EAEAE4'}} } };
  }
  function initFinanceCharts(){
    chartFinance = new Chart($('chartFinance').getContext('2d'), {type:'bar',
      data:{labels:[], datasets:[finBar('Eigenkapital des Landes',FC.equity), finBar('Bankdarlehen der AöR',FC.bank), finBar('Anleihe der AöR',FC.bond), finBar('Einmalkosten',FC.once)]},
      options:{indexAxis:'y', responsive:true, maintainAspectRatio:false, animation:{duration:250},
        plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmtEUR(c.parsed.x)}}},
        scales:{x:{stacked:true, ticks:{font:{family:'IBM Plex Mono',size:9}, callback:v=>fmtEUR(v)}, grid:{color:'#EAEAE4'}},
          y:{stacked:true, grid:{display:false}, afterFit:s=>{ s.width = Math.max(s.width, 140); }, ticks:{autoSkip:false, font:{family:'IBM Plex Sans',size:11}}}}}});
    chartRentUse = new Chart($('chartRentUse').getContext('2d'), {data:{labels:[], datasets:[
      finLine('Mieteinnahmen'), finBar('Bewirtschaftung',FC.opex), finBar('Zinsen und Entgelte',FC.interest),
      finBar('Tilgung',FC.repay), finBar('Neubau',FC.build), finBar('Überschuss',FC.rest), finBar('Fehlbetrag',FC.deficit)]}, options:finYearOptions(fmtEUR)});
    chartDebt = new Chart($('chartDebt').getContext('2d'), {data:{labels:[], datasets:[
      finLine('Nettokosten für Berlin'), finBar('Bankdarlehen der AöR',FC.bank), finBar('Anleihe der AöR',FC.bond),
      finBar('Kredit des Landes (Eigenkapital)',FC.landBal), finBar('Vom Land bereits gezahlt',FC.landPaid),
      finBar('Rücklage der AöR',FC.rest), finBar('Aufgelaufene Fehlbeträge der AöR',FC.deficit)]}, options:finYearOptions(fmtEUR)});
    document.querySelectorAll('#seg-finunit button').forEach(b=>b.addEventListener('click', ()=>{
      finUnit = b.dataset.val;
      document.querySelectorAll('#seg-finunit button').forEach(x=>x.classList.toggle('active', x===b));
      render();
    }));
  }
  function finLegend(id, chart){
    if(!byId(id)) return;
    byId(id).innerHTML = chart.data.datasets.filter(d=>d.data.some(v=>Math.abs(v)>1e-6)).map(d=>
      '<span><i class="swatch" style="background:'+(d.type==='line'?'#222':d.backgroundColor)+';height:'+(d.type==='line'?2:8)+'px"></i>'+d.label+'</span>').join('');
  }
  function renderFinance(result){
    // 1 · Kaufpreis und Finanzierung: aktuelle Einstellung und alle Positionen.
    const entries = [['Ihre Einstellung', result, state]].concat(PRESET_ORDER.map(([key,label])=>{
      const p = Object.assign({}, defaults, presets[key]); return [label, runScenario(p.price, p), p]; }));
    chartFinance.data.labels = entries.map(e=>e[0]);
    // Im Modus Eigenmittel zahlt das Land den ganzen Kaufpreis aus dem Haushalt.
    const fromBudget = (r, p) => p.financing==='kredit' ? r.equity : r.principal;
    const fin = [(r,p)=>fromBudget(r,p), r=>r.loanStart, r=>r.bondStart, r=>r.upfrontCosts-r.equityUpfront];
    fin.forEach((f,i)=>{ chartFinance.data.datasets[i].data = entries.map(e=>f(e[1], e[2])); });
    chartFinance.update('none');
    finLegend('legFinance', chartFinance);

    const rows = result.rows, labels = rows.map(r=>r.t);
    const area = state.units*state.avgSize;
    const flow = finUnit==='qm' ? v => v/(area*12) : v => v;     // € je m² und Monat
    const stock = finUnit==='qm' ? v => v/area : v => v;         // € je m² Wohnfläche
    // 2 · Wohin die Miete geht
    const q = rows.map(r=>r.parts);
    const interest = rows.map((r,i)=>q[i].loanInt+q[i].bondInt+q[i].fees-q[i].cashInterest);
    const restNom = rows.map((r,i)=>r.income-q[i].opex-interest[i]-q[i].loanPrin-q[i].bondPrin);
    const ds2 = chartRentUse.data.datasets;
    chartRentUse.data.labels = labels;
    ds2[0].data = rows.map(r=>flow(r.income));
    ds2[1].data = q.map(x=>flow(x.opex));
    ds2[2].data = interest.map(flow);
    ds2[3].data = q.map(x=>flow(x.loanPrin+x.bondPrin));
    ds2[4].data = q.map(x=>flow(x.build));
    ds2[5].data = restNom.map((v,i)=>flow(Math.max(v,0)-q[i].build));
    ds2[6].data = restNom.map(v=>flow(Math.min(v,0)));
    const f2 = finUnit==='qm' ? finFmtQ : fmtEUR;
    chartRentUse.options.plugins.tooltip.callbacks.label = c=>c.dataset.label+': '+f2(Math.abs(c.parsed.y));
    chartRentUse.options.scales.y.ticks.callback = v=>f2(v);
    chartRentUse.update('none');
    finLegend('legRentUse', chartRentUse);
    // 3 · Schulden und Rücklage
    // Rücklage der AöR: Überschüsse minus Sondertilgungen und Neubau; das Land zahlt Einmalkosten, Eigenkapital
    // (im Modus Eigenmittel den ganzen Kaufpreis) und seine laufenden Beträge.
    const budget = state.financing==='kredit' ? 0 : result.principal;
    let aoerCash = 0, landPaid = result.upfrontCosts + budget;
    const acc = rows.map((r,i)=>{ aoerCash += restNom[i] - q[i].sweptLoan - q[i].sweptBond - q[i].build; landPaid += q[i].land; return [aoerCash, landPaid]; });
    const ds3 = chartDebt.data.datasets;
    chartDebt.data.labels = labels;
    ds3[0].data = q.map(x=>stock(x.cash-budget-(x.loanBal+x.bondBal+x.equityBal)));
    ds3[1].data = q.map(x=>stock(-x.loanBal));
    ds3[2].data = q.map(x=>stock(-x.bondBal));
    ds3[3].data = q.map(x=>stock(-x.equityBal));
    ds3[4].data = acc.map(a=>stock(-a[1]));
    ds3[5].data = acc.map(a=>stock(Math.max(a[0],0)));
    ds3[6].data = acc.map(a=>stock(Math.min(a[0],0)));
    const f3 = finUnit==='qm' ? finFmtStock : fmtEUR;
    chartDebt.options.plugins.tooltip.callbacks.label = c=>c.dataset.label+': '+f3(c.parsed.y);
    chartDebt.options.scales.y.ticks.callback = v=>f3(v);
    chartDebt.update('none');
    finLegend('legDebt', chartDebt);
  }

  function render(){
    readState();
    updateLabels();

    const result = runScenario(state.price, state);

    // ---- stats ----
    // Kennzahlen oben: eine Nachkommastelle, Break-even als Halbsatz unter dem Nettoergebnis.
    const mrd1 = n => (n<0?'−':'')+(Math.abs(n)/1e9).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' Mrd €';
    $('s-kaufpreis').textContent = mrd1(result.principal);
    // Eigenkapital des Landes ausweisen; ohne Zins des Landes trägt das Modell keine Finanzierungskosten dafür.
    $('s-kaufpreis-sub').textContent = fmtQuote(state.purchaseFactor)+' vom Verkehrswert'
      + (result.equity>0 ? ', davon '+mrd1(result.equity)+' Eigenkapital des Landes'
        + (state.equityRate>0 ? '' : ', ohne Finanzierungskosten des Landes') : '');
    $('s-netto-label').textContent = 'nach '+state.horizon+' Jahren';
    $('s-netto').textContent = mrd1(result.netResult);
    $('s-netto').className = 'value '+(result.netResult>=0?'pos':'neg');
    $('s-netto-sub').textContent = result.breakEvenYear===null ? 'kein Break-even im Zeitraum' : 'Break-even in Jahr '+result.breakEvenYear;
    // Ergebnis der AöR im Mittel der Jahre 1–10 (vergleichbar mit dem Zuschussbedarf beim Rechnungshof) und offene Schuld am Ende.
    $('s-aoer').textContent = fmtEUR(result.aoerAvg10)+' pro Jahr';
    $('s-aoer').className = 'value '+(result.aoerAvg10>=0?'pos':'neg');
    $('s-rest').textContent = mrd1(result.finalDebt);
    $('s-valuation').textContent = state.valuation==='barwert'
      ? 'Barwerte, abgezinst mit '+state.discountRate.toLocaleString('de-DE',{maximumFractionDigits:2})+' % auf den Beginn von Jahr 1'
      : 'nominale Werte';
    if(byId('tableNote')) $('tableNote').textContent = state.valuation==='barwert'
      ? 'Ergebnis AöR, Land, Cashflow und Kumuliert als Barwerte; Mieteinnahmen, NOI und Annuität nominal.' : 'Alle Werte nominal.';


    // ---- Jahres-Cashflow (bars) ----
    const labels = result.rows.map(r=>r.t);
    // Die drei Teile ergeben zusammen die Veränderung der kumulierten Kurve.
    const aoerValues = result.rows.map(r=>r.aoer + r.interest);
    if(chartCashflow){
    chartCashflow.data.labels = labels;
    chartCashflow.data.datasets[0].data = aoerValues;
    chartCashflow.data.datasets[0].backgroundColor = aoerValues.map(v=> v>=0 ? '#FFE500' : '#FF3D8B');
    chartCashflow.data.datasets[1].data = result.rows.map(r=>-r.land);
    chartCashflow.data.datasets[2].data = result.rows.map(r=>-r.sweptPV);
    chartCashflow.data.datasets[3].data = labels.map(()=>0);
    chartCashflow.update('none');
    }

    // ---- Kumulierter Cashflow (line) ----
    if(chartCumulative){
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
    }

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
    chartRent.data.datasets[0].data = labels.map(t=>state.freeMarketRent*Math.pow(1+state.freeMarketGrowth/100,t-1));
    chartRent.data.datasets[1].data = labels.map(t=>munizLimit(state, t));
    chartRent.data.datasets[2].data = labels.map(t=>state.baseRent*Math.pow(1+state.cpiGrowth/100,t-1));
    chartRent.data.datasets[3].data = labels.map(t=>state.baseRent*Math.pow(1+state.incomeGrowth/100,t-1));
    chartRent.data.datasets[4].data = result.rows.map(r=>r.avgRent);
    // Achse nach den Mieten im Bestand und den Referenzen; die Marktmiete darf oben hinauslaufen,
    // damit eine steile Linie die übrigen nicht platt drückt.
    const others = chartRent.data.datasets.slice(1).flatMap(d=>d.data);
    chartRent.options.scales.y.max = Math.ceil(Math.max(Math.max(...others)*1.5, state.freeMarketRent*1.2)/5)*5;
    chartRent.update('none');
    const limitText = fmtLimit(result, state.horizon);
    $('rentLimitNote').textContent = 'Ø Miete höchstens auf der Grenze Sozialmiete: '+limitText+'.';

    // ---- chart Restschuld (conditional on Kredit) ----
    const showBalance = state.financing==='kredit';
    if(byId('balancePanelWrap')) $('balancePanelWrap').style.display = showBalance ? 'block' : 'none';
    if(chartBalance && showBalance){
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
    if(chartCapital){
    chartCapital.data.labels = labels;
    // Übernommener Bestand zum Verkehrswert, neu gebaute Wohnungen zu ihren Baukosten.
    const assetValue = r => state.price*state.avgSize*state.units + r.bookNew;
    chartCapital.data.datasets[0].data = result.rows.map(assetValue);
    chartCapital.data.datasets[1].data = result.rows.map(r=>r.balance||0);
    chartCapital.data.datasets[2].data = result.rows.map(r=>r.cumForChart);
    chartCapital.data.datasets[3].data = result.rows.map(r=>assetValue(r)-(r.balance||0)+r.cumForChart);
    chartCapital.update('none');
    }
    if(chartFinance) renderFinance(result);

    // ---- Sensitivität: Achsenbereich aus allen Presets an beiden Enden des Reglers ----
    // (bei aktuellem Zeithorizont/Bestand), damit die Achse beim Presetwechsel stabil bleibt.
    const sensRange = (key, ends) => {
      let lo = 0, hi = 0;
      Object.values(presets).forEach(preset=>{
        ends.forEach(v=>{
          const p = Object.assign({}, state, preset, {[key]:v, horizon:state.horizon});
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
    for(let pf=20; pf<=100; pf+=5) pfSteps.push(pf);
    const pfResults = pfSteps.map(pf=>{
      const p = Object.assign({}, state, {purchaseFactor:pf});
      return runScenario(state.price, p);
    });
    chartCompSens.data.labels = pfSteps;
    chartCompSens.data.datasets[0].data = pfResults.map(r=>r.netResult);
    chartCompSens.data.datasets[1].data = pfResults.map(r=>r.breakEvenYear);
    chartCompSens.options.scales.y1.ticks.display = pfResults.some(r=>r.breakEvenYear!==null);
    const [compLo, compHi] = sensRange('purchaseFactor', [20,100]);
    chartCompSens.options.scales.y.suggestedMin = compLo;
    chartCompSens.options.scales.y.suggestedMax = compHi;
    let pfIdx = pfSteps.reduce((best,pf,i)=> Math.abs(pf-state.purchaseFactor)<Math.abs(pfSteps[best]-state.purchaseFactor) ? i : best, 0);
    chartCompSens.options.plugins.vlineMarker.index = pfIdx;
    chartCompSens.options.plugins.vlineMarker.label = 'aktuell: '+fmtQuote(state.purchaseFactor);
    chartCompSens.update('none');

    // ---- table ----
    const tbody = $('dataTableBody');
    tbody.innerHTML = result.rows.map(r=>{
      const stockCell = state.mode==='neubau' ? fmtInt(r.units) : fmtInt(state.units);
      return '<tr><td>'+r.t+'</td><td>'+r.avgRent.toLocaleString('de-DE',{maximumFractionDigits:2})+'</td>'+
        '<td>'+fmtEUR(r.income)+'</td><td>'+fmtEUR(r.noi)+'</td><td>'+fmtEUR(r.annuity)+'</td>'+
        '<td>'+fmtEUR(r.aoer)+'</td><td>'+fmtEUR(-r.land)+'</td>'+
        '<td>'+fmtEUR(r.cashflow)+'</td><td>'+fmtEUR(r.cumForChart)+'</td><td>'+fmtEUR(r.balance||0)+'</td><td>'+stockCell+'</td></tr>';
    }).join('');

    renderCompareTable();
  }

  function describeSnapshot(s){
    const finParts = [s.financing==='kredit' ? ('Kredit '+s.rate+'%') : 'Eigenmittel'];
    const modeLabel = s.mode==='neubau' ? 'Neubau' : 'keine Reinvest.';
    return finParts[0]+' · '+modeLabel+' · '+fmtQuote(s.purchaseFactor)+' Kaufpreis'+(s.valuation==='barwert' ? ' · Barwert' : '');
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
      ['davon Eigenkapital des Landes', r=>r.r.equity>0 ? fmtEUR(r.r.equity)+(r.s.equityRate>0 ? ' zu '+fmtQuote(r.s.equityRate) : ' ohne Zins') : '–'],
      ['Break-even (Basis)', r=>fmtYear(r.r.breakEvenYear)],
      ['Nettoergebnis (Basis)', r=>fmtEUR(r.r.netResult)],
      ['Ergebnis AöR, Ø Jahr 1–10', r=>fmtEUR(r.r.aoerAvg10)],
      ['Restschuld am Ende', r=>fmtEUR(r.r.finalDebt)],
      ['Bestandseffekt (Basis)', r=>{
        const parts = [];
        if(r.s.mode==='neubau') parts.push('+'+fmtInt(r.r.finalUnits-r.s.units)+' Whg.');
        parts.push('Sozialmiete: '+fmtLimit(r.r, r.s.horizon));
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
  const PRESET_ORDER = [['linke','Faire-Mieten-Modell','#00A0E3'],['holm2025','DWE-Studie 2025','#FF8A1E'],['holm','Bernt/Holm','#6E62D6'],['rechnungshof','Rechnungshof','#FF3D8B'],['gegenmodell','IW/Empirica','#9C0059']];
  const SAVED_DASH = [[6,3],[2,3],[8,3,2,3],[4,4],[1,2]];
  function compareEntries(){
    const horizon = state.horizon;
    const entries = PRESET_ORDER.map(([key,label,color])=>({label, color, p:Object.assign({}, defaults, presets[key], {horizon})}))
      .concat(savedScenarios.map((v,i)=>({label:v.label, color:'#9A9A92', dash:SAVED_DASH[i%SAVED_DASH.length], p:Object.assign({}, v, {horizon})})));
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
        {type:'bar', label:'Kaufpreis', data:[], backgroundColor:'#B8B2E8', yAxisID:'y', order:2, categoryPercentage:0.45, barPercentage:0.9},
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
    chartScenarios.data.datasets[1].backgroundColor = presetResults.map(r=>r.netResult>=0?'#FFE500':'#FF3D8B');
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

  // Alle Werte mit Fundstelle: parameterpruefung.md; Abgleich mit den Ergebnissen der Quellen: pruefung.js.
  // Jede Position übernimmt nur die Werte ihrer Quelle; nicht genannte Werte stehen auf den neutralen defaults.
  // Die Quote bildet die Entschädigungssumme der Quelle ab (Verkehrswert 2.085 €/m² als gemeinsame Bezugsgröße).
  const presets = {
    linke: {
      // Faire-Mieten-Modell im DWE-Gesetzentwurf 2022 (DWE 2022, S. 89, 96–97, 102): 243.000 Wohnungen à 62 m²,
      // leistbare Miete 4,04 €/m², Bewirtschaftung 2,76 €/m² (einschließlich Mietausfall), beide ab dem
      // zweiten Jahr +0,43 %/Jahr; Entschädigung = Reinertrag aus 40 Jahren = 10 Mrd €, gezahlt in
      // unverzinsten Schuldverschreibungen, 1/40 Tilgung pro Jahr. 10 Mrd € = 31,83 % von 31,41 Mrd €.
      units: 243000, avgSize: 62, price: 2085, purchaseFactor: 31.83,
      financing: 'kredit', rate: 0, riskPremium: 0, term: 40, rateResetYears: 40, rateIncrement: 0,
      baseRent: 4.04, rentGrowth: 0.43, costInflation: 0.43,
      opexAbsolute: 2.76, mode: 'none', horizon: 40
    },
    holm2025: {
      // Holm/Thonke/Arpagaus 2025, Kurzstudie im Auftrag von DWE, Grundmodell (S. 19–21, 28–34): 240.000 Whg.
      // à 61 m², Miete 7,00 €/m² +1 %/Jahr; Bewirtschaftung „LWU“ 3,73 €/m² = 3,59 + Mietausfall 2 %, +2 %/Jahr;
      // 20 % Eigenkapital, je 40 % Annuitätendarlehen (4,5 %, 10 Jahre fest, Tilgung anfangs 3,59 %) und endfällige
      // Anleihe (4,0 %, 7 Jahre), danach je +2 Prozentpunkte; Strukturierungsentgelt 1 % je Periode; Überschüsse
      // tilgen (Cash Sweep, Rücklage drei Monatsraten); Laufzeit 30 Jahre. Ergebnis: 10,11 Mrd € aus den Mieten
      // refinanzierbar = 33,12 % von 30,52 Mrd €. Das Eigenkapital (2,02 Mrd €) bringt das Land bei der Übernahme
      // ein (S. 25); einen Zins dafür nennt die Studie nicht, das Modell bucht es als Einmalzahlung in Jahr 0.
      units: 240000, avgSize: 61, price: 2085, purchaseFactor: 33.12,
      financing: 'kredit', rate: 4.5, riskPremium: 0, term: 30, rateResetYears: 10, rateIncrement: 2,
      initialRepayment: 3.59, bondShare: 50, bondRate: 4.0, bondReset: 7, feeRate: 1, sweep: 'an',
      equityShare: 20, equityRate: 0,
      baseRent: 7.00, rentGrowth: 1, costInflation: 2,
      opexAbsolute: 3.59, vacancyRate: 2, mode: 'none', horizon: 30
    },
    holm: {
      // Bernt/Holm 2023 rechnen nur die Mieten: Mietsenkungsmodell 7,63 → 6,39 €/m² (S. 12, Tab. 2), danach
      // Trend der Landeseigenen 1,6 %/Jahr (S. 22, Tab. 6). Entschädigung 17 Mrd € nach Gerhardt/Holm 2021
      // (DWE 2022, S. 112) = 55,69 % von 30,53 Mrd €; deren Finanzierungsbedingungen liegen nicht vor.
      // Finanzierung, Kosten und Bewertung daher wie Rechnungshof (Kombination, kein Ergebnis der Quelle).
      // Bewirtschaftung 2,86 €/m² bei 61 m²: Instandsetzung 18,54 + Modernisierung 6,53 €/m² p. a. der
      // Landeseigenen (S. 23, Tab. 8, 9) = 2,09, Verwaltung 0,47 und Betriebskosten 0,30 nach Rechnungshof.
      units: 240000, avgSize: 61, price: 2085, purchaseFactor: 55.69,
      financing: 'kredit', rate: 4.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      equityShare: 20, equityRate: 3.0,
      baseRent: 6.39, rentGrowth: 1.6, costInflation: 2.0, startYears: 2, startInflation: 10, startRentGrowth: 1.6,
      opexAbsolute: 2.86, vacancyRate: 2, mode: 'none',
      valuation: 'barwert', discountRate: 3.15, horizon: 32
    },
    rechnungshof: {
      // Rechnungshof 2024, Ansicht 2 und Anhang 1 (S. 11, 25–27): 240.000 Wohnungen à 61 m², Miete 7,16 €/m²;
      // Verwaltung 343,69 €/Whg., Instandhaltung 17,18 €/m², Betriebskosten 3,60 €/m², Modernisierung 12 €/m²
      // p. a. = 3,20 €/m² im Monat, Mietausfallwagnis 2 %; Inflation 10 % bis 2024, dann 2 %; Mieten +1 % bis
      // 2024, dann +2 %; AöR-Kredit 80 % zu 4,5 %, Eigenkapital des Landes 20 % zu 3 %, je 30 Jahre; Planung
      // 32 Jahre. Szenario 29 Mrd € = 95,01 % von 30,52 Mrd €. Werte als Kapitalwerte (Ansicht 12); Zinsstruktur
      // + 75 bp vereinfacht zu einem festen Satz von 3,15 %, angepasst an Ansicht 12 (siehe pruefung.js).
      units: 240000, avgSize: 61, price: 2085, purchaseFactor: 95.01,
      financing: 'kredit', rate: 4.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      equityShare: 20, equityRate: 3.0,
      baseRent: 7.16, rentGrowth: 2.0, costInflation: 2.0, startYears: 2, startInflation: 10, startRentGrowth: 1,
      opexAbsolute: 3.20, vacancyRate: 2, mode: 'none',
      valuation: 'barwert', discountRate: 3.15, horizon: 32
    },
    gegenmodell: {
      // IW Köln/Empirica 2026 rechnet kein eigenes Ergebnis der AöR. Die Position ist die Rechnung des
      // Rechnungshofs (29 Mrd €) mit den Einwänden des Gutachtens: Modernisierung 13–25 €/m² p. a. statt
      // 12 (Mitte 19: 3,20 − 1,00 + 1,58 = 3,78 €/m²) und Inflation 2,7 % (S. 17); Integrationskosten
      // mindestens 200 Mio € (S. 17); +0,5 Prozentpunkte auf die Landesschulden = rd. 400 Mio € pro Jahr (S. 23).
      units: 240000, avgSize: 61, price: 2085, purchaseFactor: 95.01,
      financing: 'kredit', rate: 4.5, riskPremium: 0, term: 30, rateResetYears: 30, rateIncrement: 0,
      equityShare: 20, equityRate: 3.0, onceCosts: 200, landDebtCost: 400,
      baseRent: 7.16, rentGrowth: 2.0, costInflation: 2.7, startYears: 2, startInflation: 10, startRentGrowth: 1,
      opexAbsolute: 3.78, vacancyRate: 2, mode: 'none',
      valuation: 'barwert', discountRate: 3.15, horizon: 32
    }
  };

  // Für die Prüfung unter Node (pruefung.js): Rechenkern ohne Seite.
  if(typeof module !== 'undefined' && module.exports){
    module.exports = { defaults, presets, runScenario };
    return;
  }

  Chart.register(vlinePlugin);
  Chart.defaults.color = '#14171A';
  // Phones: the canvas height attributes (70/80) give very flat charts at ~340 px width.
  if (window.matchMedia('(max-width:600px)').matches) Chart.defaults.aspectRatio = 1.8;

  // Seiten ohne Regler (Die Zahlen) zeigen nur die Szenario-Übersicht.
  if(!byId('chartCashflow') && !byId('chartRentUse')){
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
  Object.entries(segIds).forEach(([key, id])=>{
    document.querySelectorAll('#'+id+' button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        state[key] = btn.dataset.val;
        render();
      });
    });
  });
  function applyState(overrides){
    state = Object.assign({}, defaults, overrides);
    sliderIds.forEach(id=>{ $(id).value = state[id]; });
    $('mode').value = state.mode;
    Object.entries(segIds).forEach(([key, id])=>{
      document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('active', b.dataset.val===state[key]));
    });
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
  const textKeys = { financing:['kredit','eigen'], mode:['none','neubau'],
    valuation:['nominal','barwert'], deficitInterest:['aus','an'], sweep:['aus','an'] };
  function encodeState(s){
    return Object.keys(defaults).filter(k=>s[k]!==defaults[k]).map(k=>k+':'+s[k]).join(',');
  }
  function decodeState(str){
    const out = {};
    str.split(',').forEach(pair=>{
      const [k, v] = pair.split(':');
      if(!(k in defaults || OBSOLETE_KEYS.includes(k)) || v===undefined) return;
      if(k==='opexMode') out[k] = v;
      else if(textKeys[k]){ if(textKeys[k].includes(v)) out[k] = v; }
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
