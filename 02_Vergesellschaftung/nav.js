// Small screens: "Menü" button for the site nav; on the model pages a "Parameter"
// button that slides the controls in from the left (CSS in style.css, "Mobile").
(function () {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  function button(cls, text, controls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = text;
    b.setAttribute('aria-expanded', 'false');
    if (controls) b.setAttribute('aria-controls', controls);
    return b;
  }

  if (!nav.id) nav.id = 'site-nav';
  var menuBtn = button('nav-toggle', 'Menü', nav.id);
  var active = nav.querySelector('a.active');
  var bar = document.createElement('div');
  bar.className = 'nav-bar';
  bar.appendChild(menuBtn);
  if (active) {
    var current = document.createElement('span');
    current.className = 'nav-current';
    current.textContent = active.textContent;
    bar.appendChild(current);
  }
  nav.insertBefore(bar, nav.firstChild);

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });

  var controls = document.querySelector('.model-page .controls');
  var setDrawer = function () {};
  if (controls) {
    if (!controls.id) controls.id = 'controls';
    var drawerBtn = button('drawer-toggle', 'Parameter', controls.id);
    bar.appendChild(drawerBtn);
    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
    var closeBtn = button('drawer-close', 'Schließen', controls.id);
    controls.insertBefore(closeBtn, controls.firstChild);

    setDrawer = function (open) {
      document.body.classList.toggle('controls-open', open);
      drawerBtn.setAttribute('aria-expanded', String(open));
      closeBtn.setAttribute('aria-expanded', String(open));
      if (open) setMenu(false);
    };
    drawerBtn.addEventListener('click', function () { setDrawer(!document.body.classList.contains('controls-open')); });
    closeBtn.addEventListener('click', function () { setDrawer(false); });
    backdrop.addEventListener('click', function () { setDrawer(false); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); setDrawer(false); }
  });
})();
