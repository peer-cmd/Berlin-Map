// Hover explanations for [data-term] elements. The text is the first sentence
// of the matching glossary entry in content.js (SITE_INCLUDES.glossary), so each
// definition exists only once. Matching: data-term against each <dt>, split at
// " / " (outside brackets) and " vs. ", with and without its bracketed part, case-insensitive.
(function(){
  "use strict";
  var html = (window.SITE_INCLUDES || {}).glossary;
  if(!html) return;
  var tpl = document.createElement('template');
  tpl.innerHTML = html;

  var entries = {};
  tpl.content.querySelectorAll('dt').forEach(function(dt){
    var dd = dt.nextElementSibling;
    if(!dd) return;
    var text = dd.textContent.trim();
    dt.textContent.split(/ \/ (?![^(]*\))| vs\. /).forEach(function(part, i){
      [part, part.replace(/\s*\(.*?\)/g, ''), (part.match(/\((.*?)\)/) || [])[1]].forEach(function(k){
        if(k) entries[k.trim().toLowerCase()] = {text: text, main: i === 0};
      });
    });
  });

  // Sentence break: ". " outside brackets, followed by an upper-case letter or an opening quote.
  function sentences(text){
    var list = [], depth = 0, start = 0;
    for(var i = 0; i < text.length; i++){
      var c = text[i];
      if(c === '(') depth++;
      else if(c === ')') depth = Math.max(0, depth - 1);
      else if(depth === 0 && /[.!?]/.test(c) && text[i+1] === ' ' && /[A-ZÄÖÜ„"]/.test(text[i+2] || '')){
        list.push(text.slice(start, i + 1));
        start = i + 2;
      }
    }
    list.push(text.slice(start));
    return list;
  }
  // First sentence of the entry; for a secondary term of a combined entry
  // ("Bestandsmiete vs. Neuvertragsmiete"), the first sentence that names it.
  function explain(term){
    var e = entries[term.toLowerCase()];
    if(!e) return null;
    var list = sentences(e.text);
    if(e.main) return list[0];
    var hit = list.filter(function(s){ return s.toLowerCase().indexOf(term.toLowerCase()) !== -1; })[0];
    return hit || list[0];
  }

  var tip = document.createElement('div');
  tip.className = 'term-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);

  function show(el){
    var text = explain(el.getAttribute('data-term'));
    if(!text) return;
    tip.textContent = text;
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var top = r.bottom + 6;
    if(top + h > window.innerHeight - 8) top = r.top - h - 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hide(){ tip.hidden = true; }

  document.querySelectorAll('[data-term]').forEach(function(el){
    if(!explain(el.getAttribute('data-term'))){
      el.removeAttribute('data-term');
      return;
    }
    el.tabIndex = 0;
    el.addEventListener('mouseenter', function(){ show(el); });
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', function(){ show(el); });
    el.addEventListener('blur', hide);
  });
  document.addEventListener('scroll', hide, true);
})();
