/* Berlin Research Map.
   Reads the dataset catalogue <base>sources.json and one map definition <base>maps/<map>.json.
   Paths come from <body data-base data-data data-map>: defaults ../config/ and ../data/processed/ under web/;
   the website's karte.html uses karte/ for both (built by scripts/export_site.py).
   URL parameters:
     map=<id>              map definition (default "research")
     lang=de|en            interface and label language (default: the map's "lang")
     embed=1               hide the side panel behind a button, for iframes
     layers=id[:view],...  show only these layers, optionally with a given view
   The map position is kept in the URL hash (#zoom/lat/lon); layer changes are written back to layers=.
   Setup hints (run.bat, update_data.bat) appear only when the map runs locally. */
(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const banner = (msg) => { const b = $("banner"); b.innerHTML = msg; b.hidden = !msg; };
  const params = new URLSearchParams(location.search);
  const BASE = document.body.dataset.base || "../config/";
  const DATA_DIR = document.body.dataset.data || "../data/processed/";
  const mapId = (params.get("map") || document.body.dataset.map || "research").replace(/[^a-z0-9_-]/gi, "");
  const LOCAL = location.protocol === "file:" || /^(localhost|127\.|\[::1\]$)/.test(location.hostname);

  async function getJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    return r.json();
  }

  let catalogue, def;
  try {
    [catalogue, def] = await Promise.all([getJson(`${BASE}sources.json`), getJson(`${BASE}maps/${mapId}.json`)]);
  } catch (e) {
    console.error(e);
    banner(LOCAL
      ? `Konfiguration nicht lesbar / cannot read configuration (${esc(e.message)}). Start the map with run.bat; opening index.html directly does not work.`
      : params.get("lang") === "en"
        ? "The map could not be loaded. Please reload the page or try again later."
        : "Die Karte konnte nicht geladen werden. Bitte die Seite neu laden oder später erneut versuchen.");
    return;
  }

  // ---------- language ----------
  const lang = params.get("lang") || def.lang || "de";
  document.documentElement.lang = lang;
  const t = (v) => (v && typeof v === "object" ? v[lang] ?? v.de ?? Object.values(v)[0] : v ?? "");
  const UI = {
    de: { layers: "Ebenen", basemap: "Grundkarte", labels: "Beschriftung", legend: "Legende", sources: "Quellen",
          retrieved: "abgerufen", atPoint: "Objekte an diesem Punkt", source: "Quelle",
          noData: LOCAL ? "Daten fehlen" : "Daten konnten nicht geladen werden",
          runUpdate: LOCAL ? "update_data.bat ausführen und neu laden" : "Bitte die Seite neu laden oder später erneut versuchen", warnings: "Verarbeitungshinweis(e)",
          noValue: "ohne Wert", other: "Sonstige", basemapFail: "Grundkarte lädt nicht (offline oder blockiert). Die Datenebenen funktionieren weiter.",
          download: "Download", close: "Schließen", view: "Darstellung" },
    en: { layers: "Layers", basemap: "Basemap", labels: "Place labels", legend: "Legend", sources: "Sources",
          retrieved: "retrieved", atPoint: "features at this point", source: "Source",
          noData: LOCAL ? "data missing" : "data could not be loaded",
          runUpdate: LOCAL ? "run update_data.bat, then reload" : "please reload the page or try again later", warnings: "processing note(s)",
          noValue: "no value", other: "Other", basemapFail: "Basemap is not loading (offline or blocked). Data layers still work.",
          download: "Download", close: "Close", view: "Display" },
  }[lang] || {};
  document.title = t(def.title);
  $("map-title").textContent = t(def.title);
  $("h-layers").textContent = UI.layers;
  $("h-legend").textContent = UI.legend;
  $("h-sources").textContent = UI.sources;
  $("panel-toggle").textContent = UI.layers;

  // ---------- formatting ----------
  const num = (v) => Number(v).toLocaleString(lang === "de" ? "de-DE" : "en-GB", { maximumFractionDigits: 2 });
  const fmt = {
    number: (v, f) => (v == null || v === "" ? "–" : num(v) + (f.unit ? " " + esc(f.unit) : "")),
    date: (v) => (v ? String(v).slice(0, 10).split("-").reverse().join(".") : "–"),
    link: (v, f) => (v ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(f.link_text || v)}</a>` : "–"),
    text: (v) => (v == null || v === "" ? "–" : esc(v)),
  };
  const fieldHtml = (v, f) => (fmt[f.format] || fmt.text)(v, f);

  // ---------- embed mode ----------
  if (params.get("embed") === "1") {
    document.body.classList.add("embed");
    $("panel").hidden = true;
    $("panel-toggle").hidden = false;
    $("panel-toggle").addEventListener("click", () => {
      $("panel").hidden = !$("panel").hidden;
      $("panel-toggle").textContent = $("panel").hidden ? UI.layers : UI.close;
    });
  }

  // ---------- basemap ----------
  const bm = catalogue.basemaps[def.basemap];
  const v = def.view;
  const map = new maplibregl.Map({
    container: "map", style: bm.style,
    center: v.center, zoom: v.zoom, minZoom: v.minZoom, maxZoom: v.maxZoom, maxBounds: v.maxBounds,
    hash: true, dragRotate: false, pitchWithRotate: false, attributionControl: { compact: false },
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
  // If the basemap style cannot be fetched, fall back to a plain background so the data still shows.
  let styleLoaded = false, tileErrors = 0;
  const mapReady = new Promise((res) => map.once("style.load", () => { styleLoaded = true; res(); }));
  map.on("error", (e) => {
    const msg = String((e && e.error && (e.error.url || e.error.message)) || "");
    if (!styleLoaded && msg.includes(bm.style)) {
      banner(UI.basemapFail);
      map.setStyle({ version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f2f3f0" } }] });
    } else if (/openfreemap|openmaptiles/i.test(msg)) {
      if (++tileErrors === 5) banner(UI.basemapFail);
    } else console.error("map error:", e.error);
  });

  // ---------- items: map definition joined with catalogue ----------
  const byId = Object.fromEntries(catalogue.sources.map((s) => [s.id, s]));
  const only = params.has("layers")
    ? Object.fromEntries(params.get("layers").split(",").filter(Boolean).map((x) => x.split(":")))
    : null;
  const items = [];
  for (const g of def.groups) {
    for (const ly of g.layers) {
      const src = byId[ly.source];
      if (!src) { console.error("unknown source", ly.source); continue; }
      const views = (ly.views || Object.keys(src.views || {})).filter((k) => src.views && src.views[k]);
      let view = views[0];
      if (only && only[ly.source] && views.includes(only[ly.source])) view = only[ly.source];
      items.push({
        group: g, def: ly, src, views, view, kind: src.geometry || "polygon",
        visible: only ? ly.source in only : ly.visible !== false,
        opacity: ly.opacity ?? 0.78,
      });
    }
  }

  // Metadata (small) for every layer up front; GeoJSON only when a layer is first shown.
  await Promise.all(items.map(async (it) => {
    try {
      const m = await fetch(`${DATA_DIR}${it.src.id}.meta.json`);
      if (!m.ok) throw new Error("HTTP " + m.status);
      it.meta = await m.json();
    } catch (e) {
      it.failed = true;
      console.error(it.src.id, e);
    }
  }));
  const missing = items.filter((it) => it.failed);
  if (missing.length) banner(`${missing.map((it) => esc(t(it.src.title))).join(", ")}: ${UI.noData}. ${UI.runUpdate}.`);
  const ready = items.filter((it) => !it.failed);

  async function ensureData(it) {
    if (it.geojson) return true;
    if (!it.loading) {
      it.loading = fetch(`${DATA_DIR}${it.src.id}.geojson`)
        .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then((g) => { it.geojson = g; if (map.getSource(it.src.id)) map.getSource(it.src.id).setData(g); return true; })
        .catch((e) => { banner(`${esc(t(it.src.title))}: ${UI.noData} (${esc(e.message)}). ${UI.runUpdate}.`); it.loading = null; return false; });
    }
    return it.loading;
  }
  const initial = Promise.all(ready.filter((it) => it.visible).map(ensureData));
  await mapReady;

  // Data goes below the first label layer of the basemap; the rest of the basemap is "base".
  const styleLayers = map.getStyle().layers;
  const firstSymbol = (styleLayers.find((l) => l.type === "symbol") || {}).id;
  const baseIds = styleLayers.filter((l) => l.type !== "symbol").map((l) => l.id);
  const labelIds = styleLayers.filter((l) => l.type === "symbol").map((l) => l.id);

  // ---------- styling ----------
  // Colours may be palette names from config/sources.json → palette ("pink", or "earth" for a ramp).
  const PAL = catalogue.palette || { named: {}, sequential: {} };
  const col = (c) => PAL.named[c] || c;
  // A ramp with more colours than the view has classes is sampled evenly, so one ramp serves any class count.
  function ramp(cs, n) {
    const all = (typeof cs === "string" ? PAL.sequential[cs] : cs).map(col);
    if (!n || n >= all.length) return all;
    return Array.from({ length: n }, (_, i) => all[Math.round((i * (all.length - 1)) / (n - 1))]);
  }
  function colorExpr(style) {
    const value = ["get", style.property];
    if (style.kind === "step") {
      const colors = ramp(style.colors, style.breaks.length + 1);
      const expr = ["step", ["to-number", value], colors[0]];
      style.breaks.forEach((b, i) => expr.push(b, colors[i + 1]));
      return ["case", ["==", ["typeof", value], "number"], expr, col(style.missing_color || "grey")];
    }
    if (style.kind === "categorical") {
      const expr = ["match", ["to-string", value]];
      for (const c of style.categories) expr.push(c.values.length === 1 ? c.values[0] : c.values, col(c.color));
      expr.push(col(style.other_color || "grey"));
      return expr;
    }
    return col(style.color || "violet");
  }
  const currentStyle = (it) => (it.view ? it.src.views[it.view].style : { kind: "single", color: it.def.color || "violet" });
  const opacityOf = (it) => currentStyle(it).opacity ?? it.opacity;
  const hover = (a, b) => ["case", ["boolean", ["feature-state", "hover"], false], a, b];
  const fillOpacity = (it) => (it.def.render === "outline" ? hover(0.22, 0.06) : hover(Math.min(1, opacityOf(it) + 0.17), opacityOf(it)));
  function sizeExpr(size) {
    const expr = ["match", ["to-string", ["get", size.property]]];
    for (const [k, r] of Object.entries(size.values)) expr.push(k, r);
    expr.push(size.default || 4);
    return expr;
  }

  function addItem(it) {
    const id = it.src.id, color = colorExpr(currentStyle(it)), vis = it.visible ? "visible" : "none";
    map.addSource(id, { type: "geojson", data: it.geojson || { type: "FeatureCollection", features: [] }, tolerance: 0.2 });
    if (it.kind === "point") {
      const r = it.src.size ? sizeExpr(it.src.size) : 4;
      map.addLayer({ id: id + "-main", type: "circle", source: id, layout: { visibility: vis }, paint: {
        "circle-color": color, "circle-opacity": Math.min(1, opacityOf(it) + 0.1),
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, ["*", 0.75, r], 15, ["*", 1.6, r]],
        "circle-stroke-color": "#14171a", "circle-stroke-width": hover(1.5, 0.5),
      } }, firstSymbol);
      it.layerIds = [id + "-main"];
      it.colorProps = [[id + "-main", "circle-color"]];
    } else if (it.kind === "line") {
      map.addLayer({ id: id + "-main", type: "line", source: id, layout: { visibility: vis }, paint: {
        "line-color": color, "line-opacity": it.opacity,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, hover(2, 1), 15, hover(5, 3)],
      } }, firstSymbol);
      it.layerIds = [id + "-main"];
      it.colorProps = [[id + "-main", "line-color"]];
    } else {
      const outline = it.def.render === "outline";
      map.addLayer({ id: id + "-main", type: "fill", source: id, layout: { visibility: vis }, paint: {
        "fill-color": color, "fill-opacity": fillOpacity(it),
      } }, firstSymbol);
      map.addLayer({ id: id + "-line", type: "line", source: id, layout: { visibility: vis }, paint: outline ? {
        "line-color": color, "line-opacity": 0.95,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, hover(2.5, 1.4 * (it.def.weight ?? 1)), 15, hover(4.5, 3 * (it.def.weight ?? 1))],
      } : {
        "line-color": hover("#14171a", col(it.def.outline || def.outline || "#14171a")),
        "line-opacity": hover(0.95, 0.28),
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, hover(1.2, 0.2), 15, hover(2.2, 0.8)],
      } }, firstSymbol);
      it.layerIds = [id + "-main", id + "-line"];
      it.colorProps = [[id + "-main", "fill-color"]].concat(outline ? [[id + "-line", "line-color"]] : []);
    }

    let hovered = null;
    const setHover = (fid) => {
      if (hovered !== null) map.setFeatureState({ source: id, id: hovered }, { hover: false });
      hovered = fid;
      if (fid !== null) map.setFeatureState({ source: id, id: fid }, { hover: true });
    };
    map.on("mousemove", id + "-main", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features[0];
      if (f && f.id !== hovered) setHover(f.id);
    });
    map.on("mouseleave", id + "-main", () => { map.getCanvas().style.cursor = ""; setHover(null); });
  }

  // Stacking: points above outlines above area fills; within each tier, listed first = drawn on top.
  const tier = (it) => (it.kind === "point" ? 2 : it.kind === "line" || it.def.render === "outline" ? 1 : 0);
  [...ready].reverse().sort((x, y) => tier(x) - tier(y)).forEach(addItem);
  await initial;

  // ---------- popup ----------
  function featureHtml(it, p) {
    const fields = it.src.fields || Object.keys(p).map((k) => ({ key: k, label: k }));
    const titleField = fields.find((f) => f.key === it.src.popup_title);
    const rows = fields
      .filter((f) => f !== titleField && p[f.key] != null && p[f.key] !== "")
      .map((f) => `<dt>${esc(t(f.label))}</dt><dd>${fieldHtml(p[f.key], f)}</dd>`).join("");
    const head = titleField ? `<div class="zone-value">${fieldHtml(p[titleField.key], titleField)}</div>` : "";
    return `<div class="zone"><div class="zone-layer">${esc(t(it.src.title))}</div>${head}<dl>${rows}</dl></div>`;
  }
  function sourceLine(it) {
    const prov = it.meta && it.meta.provenance;
    const got = prov ? ` · ${UI.retrieved} ` + prov.retrieved_utc.slice(0, 8).replace(/(\d{4})(\d\d)(\d\d)/, "$3.$2.$1") : "";
    const lic = it.src.license;
    return `${esc(it.src.publisher)}, ${esc(t(it.src.title))} · <a href="${esc(lic.url)}" target="_blank" rel="noopener">${esc(lic.id)}</a>${got}`;
  }
  map.on("click", (e) => {
    for (const it of ready) {
      if (!it.visible) continue;
      const seen = new Set();
      const feats = map.queryRenderedFeatures(e.point, { layers: [it.src.id + "-main"] })
        .filter((f) => !seen.has(f.id) && seen.add(f.id));
      if (!feats.length) continue;
      const head = feats.length > 1 ? `<div class="pop-head">${feats.length} ${UI.atPoint}</div>` : "";
      new maplibregl.Popup({ maxWidth: "340px" })
        .setLngLat(e.lngLat)
        .setHTML(head + feats.slice(0, 20).map((f) => featureHtml(it, f.properties)).join("") +
                 (it.src.note ? `<div class="pop-note">${esc(t(it.src.note))}</div>` : "") +
                 `<div class="pop-src">${UI.source}: ${sourceLine(it)}</div>`)
        .addTo(map);
      return;
    }
  });

  // ---------- legend ----------
  function legendHtml(it) {
    const st = currentStyle(it);
    const sw = (c, text) => `<div class="legend-row"><i class="sw-${it.kind}" style="background:${esc(c)}"></i><span>${text}</span></div>`;
    let rows = "", unit = "";
    if (st.kind === "step") {
      unit = st.unit ? `<div class="legend-unit">${esc(st.unit)}</div>` : "";
      rows = ramp(st.colors, st.breaks.length + 1).map((c, i) => {
        const lo = i === 0 ? null : st.breaks[i - 1], hi = i === st.breaks.length ? null : st.breaks[i];
        return sw(c, lo == null ? `< ${num(hi)}` : hi == null ? `≥ ${num(lo)}` : `${num(lo)} – ${num(hi)}`);
      }).join("");
      const noValue = it.geojson && it.geojson.features.some((f) => typeof f.properties[st.property] !== "number");
      if (noValue && col(st.missing_color || "grey") !== col("none")) rows += sw(col(st.missing_color || "grey"), UI.noValue);
    } else if (st.kind === "categorical") {
      rows = st.categories.map((c) => sw(col(c.color), esc(t(c.label)))).join("");
    } else {
      rows = sw(col(st.color || "violet"), esc(t(it.src.title)));
    }
    if (it.kind === "point" && it.src.size) {
      rows += `<div class="legend-unit legend-sub">${esc(t(it.src.size.label))}</div>` + Object.entries(it.src.size.values).map(([k, r]) =>
        `<div class="legend-row"><i class="sw-size" style="width:${2 * r}px;height:${2 * r}px"></i><span>${esc(k)}</span></div>`).join("");
    }
    const viewLabel = it.view && it.views.length > 1 ? ` · ${esc(t(it.src.views[it.view].label))}` : "";
    return `<div class="legend-block"><div class="legend-title">${esc(t(it.src.title))}${viewLabel}</div>${unit}${rows}</div>`;
  }
  // One line per layer for the closed sheet on phones: title and colour strip.
  function miniHtml(it) {
    const st = currentStyle(it);
    let colors = [], ends = ["", ""];
    if (st.kind === "step") {
      colors = ramp(st.colors, st.breaks.length + 1);
      ends = [`< ${num(st.breaks[0])}`, `≥ ${num(st.breaks[st.breaks.length - 1])}`];
    } else if (st.kind === "categorical") colors = st.categories.map((c) => col(c.color));
    else colors = [col(st.color || "violet")];
    const strip = colors.map((c) => `<i class="sw-${it.kind}" style="background:${esc(c)}"></i>`).join("");
    const lo = ends[0] ? `<span>${esc(ends[0])}</span>` : "", hi = ends[1] ? `<span>${esc(ends[1])}</span>` : "";
    return `<div class="mini-row"><span class="mini-title">${esc(t(it.src.title))}</span><span class="mini-scale">${lo}${strip}${hi}</span></div>`;
  }
  function renderLegend() {
    const vis = ready.filter((it) => it.visible);
    $("legend").innerHTML = vis.map(legendHtml).join("");
    $("legend-section").hidden = !vis.length;
    if (sheet) sheet.mini.innerHTML = vis.map(miniHtml).join("");
  }

  // ---------- phones: panel and legend share one sheet at the bottom ----------
  // Closed: a bar with the tabs and one colour strip per visible layer. Open: the chosen tab fills half the map.
  const sheet = params.get("embed") === "1" ? null : (() => {
    const bar = document.createElement("div");
    bar.id = "sheet-bar";
    bar.innerHTML = `<div class="sheet-head" role="tablist">
        <button type="button" role="tab" data-tab="layers">${esc(UI.layers)}</button>
        <button type="button" role="tab" data-tab="legend">${esc(UI.legend)}</button>
        <button type="button" class="sheet-toggle" aria-label="${esc(UI.close)}"></button>
      </div><div class="sheet-mini"></div>`;
    $("panel").parentNode.insertBefore(bar, $("panel"));
    const body = document.body, mq = matchMedia("(max-width: 600px)");
    const tabs = bar.querySelectorAll("[data-tab]");
    const set = (tab) => {
      body.classList.toggle("sheet-open", !!tab);
      if (tab) body.dataset.sheet = tab;
      tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
      bar.querySelector(".sheet-toggle").textContent = tab ? "▾" : "▴";
    };
    tabs.forEach((b) => b.addEventListener("click", () =>
      set(body.classList.contains("sheet-open") && body.dataset.sheet === b.dataset.tab ? null : b.dataset.tab)));
    bar.querySelector(".sheet-toggle").addEventListener("click", () =>
      set(body.classList.contains("sheet-open") ? null : body.dataset.sheet || "legend"));
    bar.querySelector(".sheet-mini").addEventListener("click", () => set("legend"));
    map.on("click", () => set(null));
    // Keep scale bar and attribution above the closed bar.
    new ResizeObserver(() => bar.parentNode.style.setProperty("--sheet-bar", bar.offsetHeight + "px")).observe(bar);
    const apply = () => body.classList.toggle("sheet", mq.matches);
    mq.addEventListener("change", apply);
    apply();
    set(null);
    return { mini: bar.querySelector(".sheet-mini") };
  })();

  // ---------- panel ----------
  const setVis = (ids, on) => ids.forEach((id) => map.setLayoutProperty(id, "visibility", on ? "visible" : "none"));
  function checkbox(label, checked, onChange, cls) {
    const l = document.createElement("label");
    l.className = "toggle" + (cls ? " " + cls : "");
    l.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}><span>${esc(label)}</span>`;
    l.firstChild.addEventListener("change", (e) => onChange(e.target.checked));
    return l;
  }
  // Current layers and views go into ?layers= so a copied link reopens the same map.
  function syncUrl() {
    const p = new URLSearchParams(location.search);
    p.set("layers", ready.filter((it) => it.visible).map((it) => (it.views.length > 1 ? `${it.src.id}:${it.view}` : it.src.id)).join(","));
    history.replaceState(history.state, "", `${location.pathname}?${p.toString().replace(/%2C/g, ",").replace(/%3A/g, ":")}${location.hash}`);
  }
  // Each group is a <details>; groups with a visible layer start open. The count shows visible layers when closed.
  function group(title, open) {
    const d = document.createElement("details");
    d.className = "group";
    d.open = open;
    d.innerHTML = `<summary><span>${esc(title)}</span><span class="group-count"></span></summary>`;
    $("toggles").appendChild(d);
    return d;
  }
  const groupBox = new Map();
  const updateCounts = () => groupBox.forEach((d, g) => {
    const n = ready.filter((it) => it.group === g && it.visible).length;
    d.querySelector(".group-count").textContent = n ? String(n) : "";
  });
  for (const it of ready) {
    if (!groupBox.has(it.group)) groupBox.set(it.group, group(t(it.group.title), ready.some((x) => x.group === it.group && x.visible)));
    const row = document.createElement("div");
    row.className = "layer-row";
    row.appendChild(checkbox(t(it.src.title), it.visible, async (on) => {
      it.visible = on;
      setVis(it.layerIds, on);
      updateCounts();
      syncUrl();
      if (on) await ensureData(it);
      renderLegend();
    }));
    if (it.views.length > 1) {
      const sel = document.createElement("select");
      sel.setAttribute("aria-label", UI.view);
      sel.innerHTML = it.views.map((k) => `<option value="${esc(k)}"${k === it.view ? " selected" : ""}>${esc(t(it.src.views[k].label))}</option>`).join("");
      sel.addEventListener("change", () => {
        it.view = sel.value;
        const c = colorExpr(currentStyle(it));
        it.colorProps.forEach(([lid, prop]) => map.setPaintProperty(lid, prop, c));
        if (it.kind === "polygon") map.setPaintProperty(it.src.id + "-main", "fill-opacity", fillOpacity(it));
        syncUrl();
        renderLegend();
      });
      row.appendChild(sel);
    }
    groupBox.get(it.group).appendChild(row);
  }
  updateCounts();
  const gb = group(UI.basemap, false);
  gb.appendChild(checkbox(UI.basemap, true, (on) => setVis(baseIds, on)));
  gb.appendChild(checkbox(UI.labels, true, (on) => setVis(labelIds, on)));
  renderLegend();

  $("source-text").innerHTML = ready.map((it) => {
    const m = it.meta;
    const n = m ? ` · ${m.feature_count} ${esc(t(it.src.unit_label) || "")}`.trimEnd() : "";
    const w = m && m.warnings && m.warnings.length ? ` · <span title="${esc(m.warnings.join("\n"))}">${m.warnings.length} ${UI.warnings}</span>` : "";
    const dl = ` · ${UI.download}: <a href="${DATA_DIR}${esc(it.src.id)}.geojson" download>GeoJSON</a>` +
      (m && m.files && m.files.csv ? `, <a href="${DATA_DIR}${esc(m.files.csv)}" download>CSV</a>` : "");
    const note = it.src.note ? `<br><span class="src-note">${esc(t(it.src.note))}</span>` : "";
    return `<p>${sourceLine(it)}${n}${w}${dl}${note}</p>`;
  }).join("") + `<p>${UI.basemap}: ${bm.attribution}</p>`;

  window.__map = map; // for debugging in the console
})();
