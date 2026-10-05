#!/usr/bin/env node
/* js/data.js'ten CBS (QGIS vb.) için dosya üretir.
   Kullanım: node tools/export.js
   Çıktılar:
     data/stops.csv        tüm duraklar, UTF-8 BOM'lu (Excel Türkçe karakterleri doğru açsın diye)
     data/route.geojson    duraklar (Point) + bölümler (LineString), EPSG:4326 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8');
const { PH, S, SEG, SURE, TYPE, CONF, BR } = vm.runInNewContext(src + '\n;({PH,S,SEG,SURE,TYPE,CONF,BR})');
const byId = Object.fromEntries(S.map(s => [s.id, s]));

// Kuş uçuşu mesafe (haversine, km). js/app.js'teki km() ile aynı formül; sayfa ile dosyalar aynı sayıyı versin diye.
function km(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
const BASIS = { metin: 'metinden', tahmin: 'tahmin', bilinmiyor: 'bilinmiyor' };
const inSeg = Object.fromEntries(SEG.map(d => [d[1], d]));
const wpUrl = s => { if (!s.wp) return ''; const i = s.wp.indexOf(':'); return `https://${s.wp.slice(0, i)}.wikipedia.org/wiki/${encodeURIComponent(s.wp.slice(i + 1).replace(/ /g, '_'))}`; };

// CSV: sayfadaki "CSV kopyala" düğmesiyle aynı sütunlar
const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
const head = ['sira', 'metindeki_ad', 'gunumuz', 'enlem', 'boylam', 'tur', 'konum_guveni', 'kol', 'evre', 'miladi', 'rumi', 'duzeltme', 'olay', 'onceki_durak', 'mesafe_km', 'tahmini_sure', 'sure_dayanagi', 'sure_gerekcesi', 'wikipedia'];
const rows = S.map(s => {
  const d = inSeg[s.id], su = d && SURE[`${d[0]}-${d[1]}`];
  return [s.id, s.nm, s.mo, s.lat, s.lon, TYPE[s.t], CONF[s.c], BR[s.br], PH[s.ph].n, s.m, s.r, s.fix, s.ev,
    d ? d[0] : '', d ? Math.round(km(byId[d[0]], s)) : '', su ? su.d : '', su ? BASIS[su.k] : '', su ? su.n : '', wpUrl(s)].map(q).join(',');
});
fs.writeFileSync(path.join(root, 'data', 'stops.csv'), '﻿' + [head.join(','), ...rows].join('\n') + '\n');

// GeoJSON: GeoJSON koordinat sırası [boylam, enlem]
const MODE = { sea: 'deniz', land: 'kara', captive: 'esir sevki', unknown: 'güzergâh bilinmiyor' };
const features = [
  ...S.map(s => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
    properties: { sira: s.id, ad: s.nm, gunumuz: s.mo, tur: TYPE[s.t], guven: CONF[s.c], kol: BR[s.br], evre: PH[s.ph].n, miladi: s.m, rumi: s.r || null, duzeltme: s.fix || null, olay: s.ev, ikinci_ziyaret: !!s.dup, wikipedia: wpUrl(s) || null }
  })),
  ...SEG.map(([a, b, mode, br]) => {
    const su = SURE[`${a}-${b}`];
    return {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[byId[a].lon, byId[a].lat], [byId[b].lon, byId[b].lat]] },
      properties: { kimden: a, kime: b, tur: MODE[mode], kol: BR[br || 'ana'], mesafe_km: Math.round(km(byId[a], byId[b])),
        tahmini_sure: su ? su.d : null, sure_dayanagi: su ? BASIS[su.k] : null, sure_gerekcesi: su ? su.n : null }
    };
  })
];
fs.writeFileSync(path.join(root, 'data', 'route.geojson'), JSON.stringify({ type: 'FeatureCollection', features }, null, 1) + '\n');
console.log(`data/stops.csv (${S.length} satır) ve data/route.geojson (${features.length} öğe) yazıldı.`);
