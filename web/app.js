/* Berlin Research Map. Layers, styles and popups are driven by ../config/layers.json. */
(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const banner = (msg) => { const b = $("banner"); b.innerHTML = msg; b.hidden = !msg; };

  let cfg;
  try {
    const r = await fetch("../config/layers.json");
    if (!r.ok) throw new Error("HTTP " + r.status);
    cfg = await r.json();
  } catch (e) {
    banner("Cannot load config/layers.json (" + esc(e.message) + "). Start the map with run.bat; opening index.html directly does not work.");
    return;
  }

  // ---------- formatting ----------
  const fmt = {
    eur: (v) => (v == null ? "–" : Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " €/m²"),
    number: (v) => (v == null ? "–" : Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 })),
    date: (v) => (v ? String(v).slice(0, 10).split("-").reverse().join(".") : "–"),
    link: (v, f) => (v ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(f.link_text || v)}</a>` : "–"),
    text: (v) => (v == null || v === "" ? "–" : esc(v)),
  };
  const fieldHtml = (v, f) => (fmt[f.format] || fmt.text)(v, f);

  // ---------- basemap ----------
  const bm = cfg.basemap;
  const rasterSrc = (s) => ({ type: "raster", tiles: s.tiles, tileSize: s.tileSize, maxzoom: s.maxzoom, attribution: bm.attribution });
  const map = new maplibregl.Map({
    container: "map",
    center: cfg.map.center, zoom: cfg.map.zoom, minZoom: cfg.map.minZoom, maxZoom: cfg.map.maxZoom,
    maxBounds: cfg.map.maxBounds, hash: true, dragRotate: false, pitchWithRotate: false,
    attributionControl: { compact: false },
    style: {
      version: 8,
      sources: { base: rasterSrc(bm.base), labels: rasterSrc(bm.labels) },
      layers: [
        { id: "background", type: "background", paint: { "background-color": bm.background } },
        { id: "base", type: "raster", source: "base", paint: { "raster-saturation": -1, "raster-opacity": 0.9 } },
        { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.85 } },
      ],
    },
  });
  const mapReady = new Promise((res) => map.once("style.load", res));
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

  let tileErrors = 0;
  map.on("error", (e) => {
    const url = (e && e.error && (e.error.url || e.error.message)) || "";
    if (!/basemaps\.cartocdn\.com/.test(url)) console.error("map error:", e.error);
    if (/basemaps\.cartocdn\.com/.test(url) && ++tileErrors === 3)
      banner("Basemap tiles are not loading (offline or blocked). Land-value layers still work. Adjust config/layers.json → basemap to change the provider.");
  });

  // ---------- data layers ----------
  const entries = [];
  const dataLayers = cfg.layers.filter((l) => l.enabled);
  const loaded = await Promise.all(dataLayers.map(loadLayer));
  await mapReady;

  async function loadLayer(layer) {
    try {
      const [g, m] = await Promise.all([
        fetch(`../data/processed/${layer.id}.geojson`), fetch(`../data/processed/${layer.id}.meta.json`),
      ]);
      if (!g.ok) throw new Error("HTTP " + g.status);
      return { layer, geojson: await g.json(), meta: m.ok ? await m.json() : null };
    } catch (e) {
      banner(`Data for “${esc(layer.title)}” not found (${esc(e.message)}). Run update_data.bat, then reload.`);
      return null;
    }
  }

  function stepColor(style) {
    const expr = ["step", ["to-number", ["get", style.property], 0], style.colors[0]];
    style.breaks.forEach((b, i) => expr.push(b, style.colors[i + 1]));
    return expr;
  }

  function addLayer(entry) {
    const { layer, geojson } = entry;
    const st = layer.style;
    map.addSource(layer.id, { type: "geojson", data: geojson, tolerance: 0.2 });
    map.addLayer({
      id: layer.id + "-fill", type: "fill", source: layer.id,
      paint: {
        "fill-color": stepColor(st),
        "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], Math.min(1, st.fill_opacity + 0.17), st.fill_opacity],
      },
    }, "labels");
    map.addLayer({
      id: layer.id + "-line", type: "line", source: layer.id,
      paint: {
        "line-color": st.outline,
        "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.95, 0.28],
        "line-width": ["interpolate", ["linear"], ["zoom"],
          9, ["case", ["boolean", ["feature-state", "hover"], false], 1.2, 0.2],
          15, ["case", ["boolean", ["feature-state", "hover"], false], 2.2, 0.8]],
      },
    }, "labels");

    let hovered = null;
    const setHover = (id) => {
      if (hovered !== null) map.setFeatureState({ source: layer.id, id: hovered }, { hover: false });
      hovered = id;
      if (id !== null) map.setFeatureState({ source: layer.id, id }, { hover: true });
    };
    map.on("mousemove", layer.id + "-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features[0];
      if (f && f.id !== hovered) setHover(f.id);
    });
    map.on("mouseleave", layer.id + "-fill", () => { map.getCanvas().style.cursor = ""; setHover(null); });
    entry.visibleIds = [layer.id + "-fill", layer.id + "-line"];
  }

  // ---------- popup ----------
  function zoneHtml(layer, p) {
    const rows = layer.popup.fields
      .filter((f) => p[f.key] != null && p[f.key] !== "")
      .map((f) => `<dt>${esc(f.label)}</dt><dd>${fieldHtml(p[f.key], f)}</dd>`).join("");
    const t = layer.popup.title;
    return `<div class="zone"><div class="zone-value">${fieldHtml(p[t.key], t)}</div><dl>${rows}</dl></div>`;
  }
  function sourceLine(entry) {
    const { layer, meta } = entry;
    const prov = meta && meta.provenance;
    const got = prov ? " · retrieved " + prov.retrieved_utc.slice(0, 8).replace(/(\d{4})(\d\d)(\d\d)/, "$3.$2.$1") : "";
    return `${esc(layer.publisher)}, ${esc(layer.title)} · <a href="${esc(layer.license.url)}" target="_blank" rel="noopener">${esc(layer.license.id)}</a>${got}`;
  }
  map.on("click", (e) => {
    for (const entry of entries) {
      const ids = entry.visibleIds[0];
      if (!map.getLayer(ids) || map.getLayoutProperty(ids, "visibility") === "none") continue;
      const seen = new Set();
      const feats = map.queryRenderedFeatures(e.point, { layers: [ids] }).filter((f) => !seen.has(f.id) && seen.add(f.id));
      if (!feats.length) continue;
      const head = feats.length > 1 ? `<div class="pop-head">${feats.length} zones at this point</div>` : "";
      new maplibregl.Popup({ maxWidth: "340px", closeButton: true })
        .setLngLat(e.lngLat)
        .setHTML(head + feats.map((f) => zoneHtml(entry.layer, f.properties)).join("") +
                 `<div class="pop-src">Source: ${sourceLine(entry)}</div>`)
        .addTo(map);
      return;
    }
  });

  // ---------- panel ----------
  function toggle(label, checked, onChange, cls) {
    const l = document.createElement("label");
    if (cls) l.className = cls;
    l.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}><span>${esc(label)}</span>`;
    l.firstChild.addEventListener("change", (e) => onChange(e.target.checked));
    $("toggles").appendChild(l);
  }
  const setVis = (id, on) => map.setLayoutProperty(id, "visibility", on ? "visible" : "none");

  for (const d of loaded) {
    if (!d) continue;
    addLayer(d);
    entries.push(d);
    toggle(d.layer.title, true, (on) => d.visibleIds.forEach((id) => setVis(id, on)));

    const st = d.layer.style, f = (n) => Number(n).toLocaleString("de-DE");
    $("legend-title").textContent = d.layer.title; $("legend-unit").textContent = "Class limits in " + st.unit;
    const rows = st.colors.map((c, i) => {
      const lo = i === 0 ? null : st.breaks[i - 1], hi = i === st.breaks.length ? null : st.breaks[i];
      const text = lo == null ? `< ${f(hi)}` : hi == null ? `≥ ${f(lo)}` : `${f(lo)} – ${f(hi)}`;
      return `<div class="legend-row"><i style="background:${c}"></i><span>${text}</span></div>`;
    });
    $("legend").innerHTML = rows.join("");
    $("legend-section").hidden = false;
  }
  toggle("Basemap", true, (on) => setVis("base", on));
  toggle("Place labels", true, (on) => setVis("labels", on));

  $("source-text").innerHTML = entries.map((e) => {
    const m = e.meta, w = m && m.warnings && m.warnings.length ? ` <em>(${m.warnings.length} processing warning${m.warnings.length > 1 ? "s" : ""}, see data/processed/${e.layer.id}.meta.json)</em>` : "";
    return `<p>${sourceLine(e)}${m ? ` · ${m.feature_count} zones` : ""}${w}</p>`;
  }).join("") + `<p>Basemap: ${bm.attribution}</p>`;

  window.__map = map; // for debugging in the console
})();
