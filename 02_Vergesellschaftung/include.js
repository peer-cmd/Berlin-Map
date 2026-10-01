(function(){
  "use strict";
  var src = window.SITE_INCLUDES || {};
  document.querySelectorAll('[data-include]').forEach(function(el){
    var key = el.getAttribute('data-include');
    el.innerHTML = src[key] !== undefined ? src[key]
      : '<p class="hint">Inhalt konnte nicht geladen werden (' + key + ').</p>';
  });
})();
