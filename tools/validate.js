#!/usr/bin/env node
/* Veri doğrulama: js/data.js'i tarayıcı dışında yükler ve tutarlılığı denetler.
   Kullanım: node tools/validate.js   (hata varsa çıkış kodu 1)

   Denetlenenler:
   1. Kimlikler 1..n sıralı ve benzersiz mi (liste sırası = yolculuk sırası)
   2. Zorunlu alanlar ve izinli değerler (tür, konum güveni, kol, evre)
   3. Koordinatlar makul aralıkta mı
   4. Bölümler (SEG) ve görünümler (VIEWS) var olan duraklara mı işaret ediyor
   5. Rumi tarihlerin Miladi karşılıkları doğru mu (1917 takvim reformu dahil)
   6. Bölüm süreleri (SURE) her bölüm için var mı, dayanak türü geçerli mi
   7. Wikipedia alanı "dil:Başlık" biçiminde mi */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
// data.js tarayıcı için "const" ile yazıldı; aynı kodu yalıtılmış bağlamda çalıştırıp değişkenleri geri alıyoruz
const { PH, S, SEG, SURE, VIEWS, TYPE, CONF, BR } = vm.runInNewContext(src + '\n;({PH,S,SEG,SURE,VIEWS,TYPE,CONF,BR})');

const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

// 1. Kimlik sırası
S.forEach((s, i) => { if (s.id !== i + 1) err(`Sıra bozuk: ${i + 1}. kayıt id=${s.id} (${s.nm})`); });
const ids = new Set(S.map(s => s.id));
if (ids.size !== S.length) err('Yinelenen id var');

// 2. Alanlar
for (const s of S) {
  for (const f of ['nm', 'mo', 'lat', 'lon', 't', 'c', 'ph', 'br', 'p', 'm', 'ev'])
    if (s[f] === undefined || s[f] === '') err(`#${s.id} ${s.nm}: "${f}" eksik`);
  if (!TYPE[s.t]) err(`#${s.id}: bilinmeyen tür "${s.t}"`);
  if (!CONF[s.c]) err(`#${s.id}: bilinmeyen konum güveni "${s.c}"`);
  if (!BR[s.br]) err(`#${s.id}: bilinmeyen kol "${s.br}"`);
  if (!PH[s.ph]) err(`#${s.id}: bilinmeyen evre "${s.ph}"`);
  if (![1, 2, 3].includes(s.p)) err(`#${s.id}: öncelik 1, 2 veya 3 olmalı`);
  // 3. Koordinat kutusu: geo.js'in kapsadığı alanla aynı
  if (s.lon < -15 || s.lon > 135 || s.lat < -5 || s.lat > 62) err(`#${s.id}: koordinat harita kutusunun dışında`);
  if (s.c === 'kesin' && /\?|bilinmiyor|doğrulanamadı/.test(s.mo)) warn(`#${s.id}: "kesin" işaretli ama günümüz adı belirsizlik içeriyor`);
}

// 4. Bölüm ve görünüm referansları
SEG.forEach(([a, b, mode, br], i) => {
  if (!ids.has(a) || !ids.has(b)) err(`SEG[${i}] var olmayan durağa işaret ediyor: ${a} -> ${b}`);
  if (!['sea', 'land', 'captive', 'unknown'].includes(mode)) err(`SEG[${i}] bilinmeyen tür "${mode}"`);
  if (br !== undefined && !BR[br]) err(`SEG[${i}] bilinmeyen kol "${br}"`);
});
// Sayfa "önceki duraktan" bilgisini durağa gelen tek bölümden okur; birden fazla gelen bölüm olmamalı
const incoming = {};
SEG.forEach(([a, b]) => { if (incoming[b]) err(`#${b} durağına birden fazla bölüm geliyor (${incoming[b]} ve ${a})`); incoming[b] = a; });
for (const [k, list] of Object.entries(VIEWS)) (list || []).forEach(id => { if (!ids.has(id)) err(`VIEWS.${k} içinde olmayan id ${id}`); });
// Her durak en az bir bölümle bağlı olmalı (ikinci ziyaretler dahil)
for (const s of S) if (!SEG.some(([a, b]) => a === s.id || b === s.id)) warn(`#${s.id} ${s.nm} hiçbir bölüme bağlı değil`);

// 5. Rumi -> Miladi
// Rumi yıl Mart'ta başlar. 1917 öncesi: Jülyen gün/ay, Miladi'ye +13 gün.
// 16 Şubat 1332'den sonra 1 Mart 1333 geldi: o tarihten itibaren gün ve ay Miladi ile aynı.
const RM = ['Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Teşrin-i Evvel', 'Teşrin-i Sani', 'Kanun-ı Evvel', 'Kanun-ı Sani', 'Şubat'];
const GM = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
function rumiToGreg(day, month, ry) {
  const mi = RM.indexOf(month); if (mi < 0) return null;
  const jsMonth = (mi + 2) % 12;              // Mart=2 ... Şubat=1
  const gy = ry + 584 + (mi >= 10 ? 1 : 0);   // Kanun-ı Sani ve Şubat bir sonraki Miladi yıla düşer
  const d = new Date(Date.UTC(gy, jsMonth, day));
  if (ry < 1333) d.setUTCDate(d.getUTCDate() + 13);
  return `${d.getUTCDate()} ${GM[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const rumiRe = new RegExp(`(\\d{1,2}) (${RM.join('|')}) (\\d{4})`, 'g');
let checked = 0;
for (const s of S) {
  const greg = new Set([...(s.m || '').matchAll(new RegExp(`\\d{1,2} (?:${GM.join('|')}) \\d{4}`, 'g'))].map(x => x[0]));
  for (const [, d, mon, y] of (s.r || '').matchAll(rumiRe)) {
    const exp = rumiToGreg(+d, mon, +y); checked++;
    if (!greg.has(exp)) err(`#${s.id} ${s.nm}: "${d} ${mon} ${y}" = ${exp} olmalı; Miladi alanda bulunamadı ("${s.m}")`);
  }
}

// 6. Bölüm süreleri
const segKeys = new Set(SEG.map(([a, b]) => `${a}-${b}`));
for (const k of segKeys) if (!SURE[k]) warn(`SURE["${k}"] yok; sayfada süre "bilinmiyor" görünür`);
for (const [k, v] of Object.entries(SURE)) {
  if (!segKeys.has(k)) err(`SURE["${k}"] hiçbir bölüme karşılık gelmiyor`);
  if (!['metin', 'tahmin', 'bilinmiyor'].includes(v.k)) err(`SURE["${k}"] bilinmeyen dayanak "${v.k}"`);
  if (!v.d || !v.n) err(`SURE["${k}"] süre (d) veya gerekçe (n) eksik`);
}

// 7. Wikipedia alanı
for (const s of S) if (s.wp !== undefined && !/^[a-z]{2,3}:\S/.test(s.wp)) err(`#${s.id}: wp "dil:Başlık" biçiminde olmalı ("${s.wp}")`);

console.log(`${S.length} durak, ${SEG.length} bölüm, ${checked} Rumi tarih denetlendi.`);
warnings.forEach(w => console.log('UYARI  ' + w));
errors.forEach(e => console.log('HATA   ' + e));
if (errors.length) process.exit(1);
console.log('Veri tutarlı.');
