(function(){
  "use strict";
  document.querySelectorAll('[data-include]').forEach(function(el){
    var src = el.getAttribute('data-include');
    fetch(src).then(function(r){
      if(!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function(html){
      el.innerHTML = html;
    }).catch(function(err){
      el.innerHTML = '<p class="hint">Inhalt konnte nicht geladen werden (' + src + ').</p>';
      console.error('include failed:', src, err);
    });
  });
})();
