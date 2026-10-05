# Asya'da Beş Türk rotası

Adil Hikmet Bey'in *Asya'da Beş Türk* hatıratına göre, beş Osmanlı'nın 1914-1921 arasındaki yolculuğunu gösteren etkileşimli harita ve sıralı durak listesi.

Rota İzmir'den deniz yoluyla Bombay'a, Hindukuş ve Pamir geçitleri üzerinden Kaşgar'a, Rus esaretinde Yedisu'ya (Kapal, Sarkand), oradan Kulca, Kuçar, Taklamakan, Hoten, Urumçi ve Barköl üzerinden Şanghay'a, son olarak Hamburg ve İstanbul'a uzanır. Emrullah Bey ile Selim Sami ve İbrahim Bey'in ayrı dönüş kolları da haritada.

## Özellikler

- 49 kayıt (46 ayrı yer, 3 ikinci ziyaret), metindeki sırasıyla; 5 geçit, 1 boğaz, 1 kanal
- Her durak için metindeki ad, günümüz adı, koordinat, Rumi ve Miladi tarih, olay özeti
- Konum güveni: kesin, yaklaşık, belirsiz, çıkarım (metinde adı geçmeyen ama zorunlu olarak geçilmiş yer)
- 1917 Rumi takvim reformunu dikkate alan tarih denetimi ve kaynak metindeki dönüşüm hatalarının düzeltmesi
- Her durakta önceki duraktan kuş uçuşu mesafe ve tahmini yol süresi; sürenin dayanağı (metinden, tahmin, bilinmiyor) ve gerekçesi
- Dört harita altlığı: eski harita (Natural Earth), uydu görüntüsü (Esri), canlı uydu (NASA GIBS, VIIRS günlük görüntü, gün seçilebilir), yükselti (OpenTopoMap)
- Durak kartında Wikipedia maddesinin görseli ve bağlantısı, ayrıca Wikimedia Commons'ta o noktanın 10 km yakınında çekilmiş fotoğraflar (yazar ve lisansıyla)
- CSV ve GeoJSON dışa aktarımı (QGIS vb. için)
- Açık ve koyu tema, telefon genişliğinde çalışır

## Çalıştırma

Derleme adımı yok. `index.html` dosyasını tarayıcıda açmak yeterli. İsterseniz yerel sunucuyla:

```bash
npm run serve        # http://localhost:8000
```

Leaflet ve topojson cdnjs'ten, yazı tipleri Google Fonts'tan, uydu karoları ve durak görselleri ilgili servislerden yüklenir; bu yüzden internet gerekir. Eski harita altlığı yereldeki `data/geo.js`'ten çizilir.

## Dizin yapısı

```
index.html            sayfa iskeleti
css/style.css         tüm stiller ve tema renkleri (açık/koyu)
js/data.js            BÜTÜN İÇERİK: evreler, duraklar, bölümler, bölüm süreleri, görünümler
js/app.js             harita (Leaflet), altlıklar, detay kartı, görseller, liste, CSV kopyalama
data/geo.js           üretilmiş harita verisi (window.GEO); elle düzenlenmez
data/stops.csv        üretilmiş; npm run export
data/route.geojson    üretilmiş; npm run export
tools/validate.js     veri tutarlılık ve tarih denetimi
tools/export.js       CSV ve GeoJSON üretimi
tools/build-geo.js    data/geo.js üretimi
tools/fetch-ne.js     Natural Earth göl/nehir verisini indirir
```

## Veriyi düzenleme

Durak eklemek veya düzeltmek için yalnızca `js/data.js` değişir. Sonra:

```bash
npm run check        # doğrula, sonra CSV ve GeoJSON'u yeniden üret
```

Doğrulayıcı şunları denetler: sıra numaralarının 1..n olması, zorunlu alanlar, izinli değerler, koordinat aralığı, bölüm ve görünüm referansları, Rumi tarihlerin Miladi karşılıkları.

### Durak alanları

| Alan | Anlamı |
|---|---|
| `id` | Yolculuk sırası. Listedeki sıra ile aynı olmalı. |
| `nm` | Metindeki yazım |
| `mo` | Günümüz adı veya tanımlama notu |
| `lat`, `lon` | Ondalık derece (WGS84) |
| `t` | `sehir`, `liman`, `gecit`, `bogaz`, `bolge` |
| `c` | `kesin`, `yaklasik`, `belirsiz`, `cikarim` |
| `ph` | Evre anahtarı (`PH` nesnesinde) |
| `br` | `ana`, `b1` (Emrullah Bey), `b2` (Selim Sami ve İbrahim) |
| `p` | Etiket önceliği: 1 her zaman, 2 orta yakınlıkta, 3 yakın |
| `r` | Metindeki Rumi tarih (ör. `9 Temmuz 1330`) |
| `m` | Miladi karşılık (ör. `22 Tem 1914`; aylar 3 harf) |
| `fix` | Kaynak metindeki tarih hatası notu |
| `ev` | Olay özeti |
| `dup` | Aynı yere ikinci ziyaret; haritada ayrı nokta çizilmez |
| `wp` | Wikipedia maddesi, `dil:Başlık` (ör. `tr:Kaşgar`). Eşleşmesi doğrulanamayan yerlerde yok. |

Bölümler `SEG` dizisinde `[kimden, kime, tür, kol]` biçimindedir. Tür: `sea`, `land`, `captive`, `unknown` (metinde güzergâh yok).

Bölüm süreleri `SURE` nesnesinde `"kimden-kime"` anahtarıyla durur: `d` tahmini süre, `k` dayanak (`metin`, `tahmin`, `bilinmiyor`), `n` gerekçe. Mesafe veriye yazılmaz; koordinatlardan kuş uçuşu hesaplanır. Dağ yolları bundan epey uzundur.

### Takvim kuralı

Rumi yıl Mart'ta başlar. 1333 öncesinde Rumi tarihe 13 gün eklenir. 1917'de 16 Şubat 1332'nin ertesi günü 1 Mart 1333 ilan edildi; o tarihten sonra gün ve ay Miladi ile aynıdır. Kaynak metin 1336 ve 1337 tarihlerine de 13 gün eklemiş; bu sayfada düzeltilmiş halleri gösteriliyor.

## Harita verisini yeniden üretme

Yalnızca harita kutusu, ayrıntı düzeyi veya katmanlar değişecekse gerekir:

```bash
npm install
npm run geo:fetch
npm run geo:build
```

## Kaynaklar

- Adil Hikmet Bey, *Asya'da Beş Türk*, haz. Yusuf Gedikli, Ötüken Neşriyat. Hatırat ilk kez 1928'de Cumhuriyet gazetesinde eski harflerle tefrika edildi.
- Kitap üzerine yazılmış değerlendirme metni, bölüm 5.2 ("Beş Türk'ün Orta Asya'daki hayatı"): rota ve tarihlerin ana kaynağı.
- Döölötbek Saparaliyev, "XX. Yüzyılın Başındaki Kırgız-Türk Siyasi İlişkiler Hakkında Osmanlı ve Rus Arşivlerinden Yeni Bilgiler", XVII. Türk Tarih Kongresi, TTK, 2018. <https://makale.isam.org.tr/bitstreams/90e356ff-b026-4186-ba6c-2d0df9ddcff8/download>
- Şubat 1915 Kaşgar kaydı: <https://www.jadidonline.com/node/1000>
- Harita verisi: Natural Earth (kamu malı), world-atlas paketi üzerinden.
- Altlıklar: Esri World Imagery, NASA GIBS (VIIRS SNPP gerçek renk), OpenTopoMap (CC-BY-SA). Görseller: Wikipedia ve Wikimedia Commons; lisansları dosya sayfalarında.

Koordinatlar ve yer adı eşleştirmeleri bu proje için yapılmıştır. Belirsiz eşleştirmeler sayfada ve veride açıkça işaretlidir.

## Lisans

Kod: MIT (bkz. `LICENSE`). Harita verisi Natural Earth, kamu malı. Uydu karoları ve görseller sayfaya kaynağından yüklenir, depoda bulunmaz. Olay özetleri bu proje için yazılmıştır; kitaptan doğrudan alıntı içermez.
