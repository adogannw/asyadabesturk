#!/usr/bin/env node
/* Natural Earth göl ve nehir verisini tools/src/ altına indirir (yalnızca harita verisi yeniden üretilecekse gerekir).
   Kullanım: node tools/fetch-ne.js   (Node 18+ gerekir, yerleşik fetch kullanılıyor)
   Kara ve ülke sınırları npm'deki world-atlas paketinden gelir; bu dosyalar oraya dahil değil. */
const fs = require('fs');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const FILES = ['ne_50m_lakes.geojson', 'ne_50m_rivers_lake_centerlines.geojson'];
const dir = path.join(__dirname, 'src');
fs.mkdirSync(dir, { recursive: true });

(async () => {
  for (const f of FILES) {
    const out = path.join(dir, f);
    if (fs.existsSync(out)) { console.log(`var: ${f}`); continue; }
    const res = await fetch(BASE + f);
    if (!res.ok) throw new Error(`${f} indirilemedi: HTTP ${res.status}`);
    fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
    console.log(`indirildi: ${f}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
