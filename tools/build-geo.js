#!/usr/bin/env node
// data/geo.js'i üretir: kara, ülke sınırları, göller, nehirler tek bir TopoJSON içinde (window.GEO).
// Kullanım (depo kökünden): npm install && npm run geo:fetch && npm run geo:build
// Neden script dosyası, neden JSON değil: index.html doğrudan dosyadan (file://) açıldığında fetch çalışmaz,
// <script> ile yüklenen veri ise hem yerelde hem GitHub Pages'te çalışır.
// Boyut ayarı: simplify(..., quantile 0.45) ve quantize(2e4). Daha ayrıntılı kıyı için 0.45'i düşürün.
const fs=require('fs');
const tc=require('topojson-client'), ts=require('topojson-server'), simp=require('topojson-simplify');
const BB=[-15,-5,135,62]; // lon/lat sınır kutusu: Hamburg'dan Mançurya'ya
const inBB=(f)=>{ // özelliğin herhangi bir noktası kutuda mı
  let hit=false; const walk=c=>{ if(hit) return; if(typeof c[0]==='number'){ if(c[0]>=BB[0]&&c[0]<=BB[2]&&c[1]>=BB[1]&&c[1]<=BB[3]) hit=true; } else c.forEach(walk); };
  walk(f.geometry.coordinates); return hit; };
const land=tc.feature(JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json')), 'land');
const cw=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const countries=tc.feature(cw,'countries'); countries.features=countries.features.filter(inBB).map(f=>({type:'Feature',properties:{},geometry:f.geometry}));
const lakes=JSON.parse(fs.readFileSync('tools/src/ne_50m_lakes.geojson')); lakes.features=lakes.features.filter(inBB).map(f=>({type:'Feature',properties:{n:f.properties.name||''},geometry:f.geometry}));
const rivers=JSON.parse(fs.readFileSync('tools/src/ne_50m_rivers_lake_centerlines.geojson')); rivers.features=rivers.features.filter(f=>f.geometry&&inBB(f)).map(f=>({type:'Feature',properties:{},geometry:f.geometry}));
let topo=ts.topology({land, countries, lakes, rivers}, 1e5);
topo=simp.presimplify(topo); topo=simp.simplify(topo, simp.quantile(topo, 0.45));
topo=require('topojson-client').quantize(topo,2e4);
fs.writeFileSync('data/geo.js','window.GEO='+JSON.stringify(topo)+';');
console.log('lakes',lakes.features.length,'rivers',rivers.features.length,'bytes',fs.statSync('data/geo.js').size);
