/* Berlin Research Map.
   Reads the dataset catalogue ../config/sources.json and one map definition ../config/maps/<map>.json.
   URL parameters:
     map=<id>              map definition (default "research")
     lang=de|en            interface and label language (default: the map's "lang")
     embed=1               hide the side panel behind a button, for iframes
     layers=id[:view],...  show only these layers, optionally with a given view
   The map position is kept in the URL hash (#zoom/lat/lon). */
(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const banner = (msg) => { const b = $("banner"); b.innerHTML = msg; b.hidden = !msg; };
  const params = new URLSearchParams(location.search);
  const mapId = (params.get("map") || "research").replace(/[^a-z0-9_-]/gi, "");

  async function getJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    return r.json();
  }

  let catalogue, def;
  try {
    [catalogue, def] = await Promise.all([getJson("../config/sources.json"), getJson(`../config/maps/${mapId}.json`)]);
  } catch (e) {
    banner(`Konfiguration nicht lesbar / cannot read configuration (${esc(e.message)}). Start the map with run.bat; opening index.html directly does not work.`);
    return;
  }

  // ---------- language ----------
  const lang = params.get("lang") || def.lang || "de";
  document.documentElement.lang = lang;
  const t = (v) => (v && typeof v === "object" ? v[lang] ?? v.de ?? Object.values(v)[0] : v ?? "");
  const UI = {
    de: { layers: "Ebenen", basemap: "Grundkarte", labels: "Beschriftung", legend: "Legende", sources: "Quellen",
          retrieved: "abgerufen", atPoint: "Objekte an diesem Punkt", source: "Quelle", noData: "Daten fehlen",
          runUpdate: "update_data.bat ausführen und neu laden", warnings: "Verarbeitungshinweis(e)",
          noValue: "ohne Wert", other: "Sonstige", basemapFail: "Grundkarte lädt nicht (offline oder blockiert). Die Datenebenen funktionieren weiter.",
          download: "Download", close: "Schließen", view: "Darstellung" },
    en: { layers: "Layers", basemap: "Basemap", labels: "Place labels", legend: "Legend", sources: "Sources",
          retrieved: "retrieved", atPoint: "features at this point", source: "Source", noData: "data missing",
          runUpdate: "run update_data.bat, then reload", warnings: "processing note(s)",
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
  const only = params.get("layers")
    ? Object.fromEntries(params.get("layers").split(",").map((x) => x.split(":")))
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

  await Promise.all(items.map(async (it) => {
    try {
      const [g, m] = await Promise.all([
        fetch(`../data/processed/${it.src.id}.geojson`), fetch(`../data/processed/${it.src.id}.meta.json`),
      ]);
      if (!g.ok) throw new Error("HTTP " + g.status);
      it.geojson = await g.json();
      it.meta = m.ok ? await m.json() : null;
    } catch (e) {
      it.failed = true;
      banner(`${esc(t(it.src.title))}: ${UI.noData} (${esc(e.message)}). ${UI.runUpdate}.`);
    }
  }));
  await mapReady;

  // Data goes below the first label layer of the basemap; the rest of the basemap is "base".
  const styleLayers = map.getStyle().layers;
  const firstSymbol = (styleLayers.find((l) => l.type === "symbol") || {}).id;
  const baseIds = styleLayers.filter((l) => l.type !== "symbol").map((l) => l.id);
  const labelIds = styleLayers.filter((l) => l.type === "symbol").map((l) => l.id);

  // ---------- styling ----------
  // Colours may be palette names from config/sources.json → palette ("vermilion", or "heat" for a ramp).
  const PAL = catalogue.palette || { named: {}, sequential: {} };
  const col = (c) => PAL.named[c] || c;
  const ramp = (cs) => (typeof cs === "string" ? PAL.sequential[cs] : cs).map(col);
  function colorExpr(style) {
    const value = ["get", style.property];
    if (style.kind === "step") {
      const colors = ramp(style.colors);
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
    return col(style.color || "ultramarine");
  }
  const currentStyle = (it) => (it.view ? it.src.views[it.view].style : { kind: "single", color: it.def.color || "#4a6fa5" });
  const hover = (a, b) => ["case", ["boolean", ["feature-state", "hover"], false], a, b];

  function addItem(it) {
    const id = it.src.id, color = colorExpr(currentStyle(it)), vis = it.visible ? "visible" : "none";
    map.addSource(id, { type: "geojson", data: it.geojson, tolerance: 0.2 });
    if (it.kind === "point") {
      map.addLayer({ id: id + "-main", type: "circle", source: id, layout: { visibility: vis }, paint: {
        "circle-color": color, "circle-opacity": Math.min(1, it.opacity + 0.1),
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 2.5, 15, 6],
        "circle-stroke-color": "#14171a", "circle-stroke-width": hover(1.5, 0.4),
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
      map.addLayer({ id: id + "-main", type: "fill", source: id, layout: { visibility: vis }, paint: {
        "fill-color": color, "fill-opacity": hover(Math.min(1, it.opacity + 0.17), it.opacity),
      } }, firstSymbol);
      map.addLayer({ id: id + "-line", type: "line", source: id, layout: { visibility: vis }, paint: {
        "line-color": hover("#14171a", col(it.def.outline || def.outline || "#14171a")),
        "line-opacity": hover(0.95, 0.6),
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, hover(1.2, 0.3), 15, hover(2.2, 1)],
      } }, firstSymbol);
      it.layerIds = [id + "-main", id + "-line"];
      it.colorProps = [[id + "-main", "fill-color"]];
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

  const ready = items.filter((it) => !it.failed);
  // Listed first = drawn on top: add bottom-up.
  [...ready].reverse().forEach(addItem);

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
      rows = ramp(st.colors).map((c, i) => {
        const lo = i === 0 ? null : st.breaks[i - 1], hi = i === st.breaks.length ? null : st.breaks[i];
        return sw(c, lo == null ? `< ${num(hi)}` : hi == null ? `≥ ${num(lo)}` : `${num(lo)} – ${num(hi)}`);
      }).join("");
    } else if (st.kind === "categorical") {
      rows = st.categories.map((c) => sw(col(c.color), esc(t(c.label)))).join("");
    } else {
      rows = sw(col(st.color || "ultramarine"), esc(t(it.src.title)));
    }
    const viewLabel = it.view && it.views.length > 1 ? ` · ${esc(t(it.src.views[it.view].label))}` : "";
    return `<div class="legend-block"><div class="legend-title">${esc(t(it.src.title))}${viewLabel}</div>${unit}${rows}</div>`;
  }
  function renderLegend() {
    const vis = ready.filter((it) => it.visible);
    $("legend").innerHTML = vis.map(legendHtml).join("");
    $("legend-section").hidden = !vis.length;
  }

  // ---------- panel ----------
  const setVis = (ids, on) => ids.forEach((id) => map.setLayoutProperty(id, "visibility", on ? "visible" : "none"));
  function checkbox(label, checked, onChange, cls) {
    const l = document.createElement("label");
    l.className = "toggle" + (cls ? " " + cls : "");
    l.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}><span>${esc(label)}</span>`;
    l.firstChild.addEventListener("change", (e) => onChange(e.target.checked));
    return l;
  }
  let lastGroup = null;
  for (const it of ready) {
    if (it.group !== lastGroup) {
      const h = document.createElement("h3");
      h.textContent = t(it.group.title);
      $("toggles").appendChild(h);
      lastGroup = it.group;
    }
    const row = document.createElement("div");
    row.className = "layer-row";
    row.appendChild(checkbox(t(it.src.title), it.visible, (on) => { it.visible = on; setVis(it.layerIds, on); renderLegend(); }));
    if (it.views.length > 1) {
      const sel = document.createElement("select");
      sel.setAttribute("aria-label", UI.view);
      sel.innerHTML = it.views.map((k) => `<option value="${esc(k)}"${k === it.view ? " selected" : ""}>${esc(t(it.src.views[k].label))}</option>`).join("");
      sel.addEventListener("change", () => {
        it.view = sel.value;
        const c = colorExpr(currentStyle(it));
        it.colorProps.forEach(([lid, prop]) => map.setPaintProperty(lid, prop, c));
        renderLegend();
      });
      row.appendChild(sel);
    }
    $("toggles").appendChild(row);
  }
  const hb = document.createElement("h3");
  hb.textContent = UI.basemap;
  $("toggles").appendChild(hb);
  $("toggles").appendChild(checkbox(UI.basemap, true, (on) => setVis(baseIds, on)));
  $("toggles").appendChild(checkbox(UI.labels, true, (on) => setVis(labelIds, on)));
  renderLegend();

  $("source-text").innerHTML = ready.map((it) => {
    const m = it.meta;
    const n = m ? ` · ${m.feature_count} ${esc(t(it.src.unit_label) || "")}`.trimEnd() : "";
    const w = m && m.warnings && m.warnings.length ? ` · <span title="${esc(m.warnings.join("\n"))}">${m.warnings.length} ${UI.warnings}</span>` : "";
    const dl = ` · ${UI.download}: <a href="../data/processed/${esc(it.src.id)}.geojson" download>GeoJSON</a>` +
      (m && m.files && m.files.csv ? `, <a href="../data/processed/${esc(m.files.csv)}" download>CSV</a>` : "");
    return `<p>${sourceLine(it)}${n}${w}${dl}</p>`;
  }).join("") + `<p>${UI.basemap}: ${bm.attribution}</p>`;

  window.__map = map; // for debugging in the console
})();
