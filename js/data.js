/* Asya'da Beş Türk rotası: tüm içerik verisi.
   Rota bilgisi buradan düzenlenir; js/app.js'e dokunmak gerekmez.
   Değişiklikten sonra: node tools/validate.js  */
/* ---------- VERİ ----------
   t: tür (sehir, liman, gecit, bogaz, bolge)
   c: konum güveni (kesin, yaklasik, belirsiz, cikarim)
   br: kol (ana, b1 = Emrullah Bey, b2 = Selim Sami ve İbrahim)
   p: öncelik; etiketin hangi yakınlıkta görüneceği (1 her zaman, 2 orta, 3 yakın)
   r: metindeki Rumi tarih, m: Miladi karşılık, fix: metindeki dönüşüm hatası
   wp: Wikipedia maddesi, "dil:Başlık" biçiminde (ör. "tr:Kaşgar"). Sayfa bu maddenin görselini ve bağlantısını gösterir.
       Eşleşmesi doğrulanamayan yerlerde (Ziyaret, Çiçeklibel, Kaşıkçıbeli) bilinçli olarak yok. */
const PH={
  hazirlik:{n:"Hazırlık ve deniz yolu",span:"Haziran–Ağustos 1914",note:"Selim Sami'nin telgrafıyla başlayan yolculuk. Grup İzmir'den tüccar kılığında Karadeniz adlı vapurla çıkar, Süveyş ve Kızıldeniz üzerinden Hint Okyanusu'na geçer."},
  hindistan:{n:"Hindistan'dan Pamir'e",span:"15 Eylül – 15 Kasım 1914 (iki ay)",note:"Hint İstiklal Komitesi ile Huddam-ı Kâbe cemiyetinden (Mevlana Şevket Ali) yardım alınır. Peşaver'den sonra Malakand ve Lavari geçitleri, Çitral vadisi, Vahan koridoru ve Tağdumbaş Pamiri aşılır. Metin, Peşaver'den Yenihisar'a kadarki yerleri sırayla sayar ama ara tarih vermez."},
  kasgar:{n:"Kaşgar",span:"Kasım 1914 – Nisan 1915",note:"Heyet Yenihisar'da bir süre kaldıktan sonra ikiye bölünüp Kaşgar'a gider. İngiliz kaydına göre Şubat 1915'te Kaşgar'daki beş Türk, İngiliz ve Rus konsoloslarının isteğiyle Çinli vali tarafından gözaltına alınmıştı; metin bunu anmıyor."},
  esaret:{n:"Rus esareti",span:"Nisan 1915 – 14 Ağustos 1916",note:"Pamir'de yakalanan grup idam edilmek üzere Taşkent'e götürülür. Alman elçisi von Hintze'nin Çin hükümeti nezdindeki girişimiyle idamdan kurtulurlar ve kalebend olarak Yedisu'ya sürülürler. Toplam 1 yıl 3 ay esaret."},
  isyan:{n:"Kaçış ve Kırgız isyanı",span:"Ağustos 1916 – 1917 başı",note:"Kulca'da bir ay saklandıktan sonra isyandaki Kırgızların başına geçmeleri istenir. Togan'a göre Kasım ortasında katılırlar. Yedisu isyanı Ağustos 1916'da başlamış, Eylül–Ekim'de büyük ölçüde bastırılmıştı; katılım tarihi son evreye denk gelir."},
  cikis:{n:"Doğu Türkistan'dan çıkış",span:"1917 – 29 Haziran 1918",note:"Ruslar onları Çinlilerden ister. Kuçar'dan Taklamakan aşılarak Hoten'e, sonra Urumçi ve Barköl'e gidilir. Şanghay'a varılır; orada Hollanda elçiliği ve Japonlarla ilişki kurulur."},
  donus:{n:"Dönüş",span:"1919 – 10 Mart 1921",note:"Grup üç kola ayrılır. Hamburg'dan sonra yazar, diğer arkadaşlarının akıbeti hakkında bilgi vermez."}
};
const S=[
 {id:1,nm:"İzmir",mo:"İzmir",lat:38.42,lon:27.14,wp:"tr:İzmir",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:1,r:"1 Haziran 1330 · 10 Haziran 1330 · 9 Temmuz 1330",m:"14 Haz 1914 · 23 Haz 1914 · 22 Tem 1914",ev:"Selim Sami'den 1769 sayılı telgraf gelir (14 Haz). Adil Hikmet kolordusuyla ilişiğini keser (23 Haz). Grup tüccar kılığında Karadeniz vapuruna biner (22 Tem). Saparaliyev de çıkış tarihini 22 Temmuz 1914 verir."},
 {id:2,nm:"Beyrut",mo:"Beyrut, Lübnan",lat:33.90,lon:35.50,wp:"tr:Beyrut",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:2,r:"Temmuz 1330",m:"Temmuz 1914",ev:"Vapurun ilk uğrak limanı."},
 {id:3,nm:"Port Said",mo:"Port Said, Mısır",lat:31.26,lon:32.30,wp:"tr:Port Said",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:2,r:"Temmuz 1330",m:"Temmuz 1914",ev:"Süveyş Kanalı'nın Akdeniz girişi."},
 {id:4,nm:"Süveyş Kanalı",mo:"Süveyş, Mısır",lat:29.97,lon:32.55,wp:"tr:Süveyş Kanalı",t:"bogaz",c:"cikarim",ph:"hazirlik",br:"ana",p:3,r:"",m:"Temmuz 1914",ev:"Metinde adı geçmez. Port Said'den Kızıldeniz'e geçmenin tek yolu kanal olduğu için listeye çıkarım olarak eklendi."},
 {id:5,nm:"Cidde",mo:"Cidde, Suudi Arabistan",lat:21.49,lon:39.18,wp:"tr:Cidde",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:2,r:"Temmuz 1330",m:"Temmuz 1914",ev:"Kızıldeniz'de uğrak limanı."},
 {id:6,nm:"Hudeyde",mo:"Hudeyde (Al Hudaydah), Yemen",lat:14.80,lon:42.95,wp:"tr:El-Hudeyde",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:2,r:"22 Temmuz 1330",m:"4 Ağu 1914",ev:"Osmanlı topraklarındaki son liman. Grup buradan ayrılır."},
 {id:7,nm:"Babülmendeb",mo:"Bab-el-Mandeb Boğazı",lat:12.58,lon:43.33,wp:"tr:Babülmendep Boğazı",t:"bogaz",c:"kesin",ph:"hazirlik",br:"ana",p:2,r:"Temmuz–Ağustos 1330",m:"Ağustos 1914",ev:"Kızıldeniz'den Aden Körfezi ve Hint denizine çıkış."},
 {id:8,nm:"Bombay",mo:"Mumbai, Hindistan",lat:18.94,lon:72.84,wp:"tr:Mumbai",t:"liman",c:"kesin",ph:"hazirlik",br:"ana",p:1,r:"Ağustos 1330",m:"Ağustos 1914",ev:"Dünya Savaşı başlamıştır, Osmanlı henüz girmemiştir. Grup limanda ve şehirde gözaltına alınır, İngilizler peşlerine casus takar. Türk şehbenderliğinden pasaport çıkarırlar. Hint İstiklal Komitesi yardım eder; editöre göre Adil Bey bundan hiç söz etmez."},
 {id:9,nm:"Peşaver",mo:"Peshawar, Pakistan",lat:34.01,lon:71.58,wp:"tr:Peşaver",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:1,r:"Ağustos–Eylül 1330",m:"Ağu–Eyl 1914",ev:"Kara yolculuğunun ilk durağı. Metindeki sıra: Peşaver, Lahor, tekrar Lahor ve Peşaver."},
 {id:10,nm:"Lahor",mo:"Lahore, Pakistan",lat:31.55,lon:74.34,wp:"tr:Lahor",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:1,r:"Eylül 1330",m:"Eylül 1914",ev:"İki kez uğranır. Huddam-ı Kâbe çevresinden yardım görülen yerlerden biri olması muhtemel; metin ayrıntı vermez."},
 {id:11,nm:"Peşaver (ikinci kez)",mo:"Peshawar, Pakistan",lat:34.01,lon:71.58,wp:"tr:Peşaver",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:3,r:"2 Eylül 1330",m:"15 Eyl 1914",ev:"Asıl yürüyüş buradan başlar. Peşaver'den Yenihisar'a yolculuk tam iki ay sürer.",dup:true},
 {id:12,nm:"Melkend",mo:"Malakand Geçidi, Pakistan",lat:34.565,lon:71.93,wp:"en:Malakand Pass",t:"gecit",c:"yaklasik",ph:"hindistan",br:"ana",p:2,r:"Eylül 1330",m:"Eylül 1914",ev:"Peşaver ovasından Swat ve Dir'e açılan geçit. Metindeki Melkend, Malakand'ın okunuşu olarak alındı."},
 {id:13,nm:"Dir",mo:"Dir, Pakistan",lat:35.205,lon:71.876,wp:"en:Dir (city)",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:2,r:"Eylül 1330",m:"Eylül 1914",ev:"Dir hanlığının merkezi. Editöre göre buradan sonraki yerler Keşmir'in batısındadır."},
 {id:14,nm:"Ziyaret",mo:"Dir–Çitral yolu (tam yeri bilinmiyor)",lat:35.29,lon:71.83,t:"sehir",c:"belirsiz",ph:"hindistan",br:"ana",p:3,r:"Eylül 1330",m:"Eylül 1914",ev:"Bölgede Ziarat adlı birçok türbe köyü var. Metindeki sıraya göre Dir ile Deruş arasında; nokta bu yol üzerinde tahminidir."},
 {id:15,nm:"Lavari Geçidi",mo:"Lowari Geçidi, Pakistan (3.118 m)",lat:35.35,lon:71.80,wp:"en:Lowari Pass",t:"gecit",c:"cikarim",ph:"hindistan",br:"ana",p:3,r:"",m:"Eylül 1914",ev:"Metinde adı geçmez. Dir'den Deruş'a giden yol bu geçitten aşar; çıkarım olarak eklendi."},
 {id:16,nm:"Deruş",mo:"Drosh, Pakistan",lat:35.563,lon:71.787,wp:"en:Drosh",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:3,r:"Eylül–Ekim 1330",m:"Eyl–Eki 1914",ev:"Çitral vadisinin güney girişindeki kasaba."},
 {id:17,nm:"Çatral",mo:"Chitral, Pakistan",lat:35.851,lon:71.786,wp:"tr:Çitral",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:2,r:"Eylül–Ekim 1330",m:"Eyl–Eki 1914",ev:"Çitral mehterliğinin merkezi."},
 {id:18,nm:"Baharek",mo:"Baharak, Bedahşan? (doğrulanamadı)",lat:36.93,lon:70.90,wp:"en:Baharak, Afghanistan",t:"sehir",c:"belirsiz",ph:"hindistan",br:"ana",p:3,r:"Ekim 1330",m:"Ekim 1914",ev:"En sorunlu tanımlama. Bilinen Baharak Afganistan Bedahşan'dadır; doğruysa grup Çitral'den Dorah geçidiyle Bedahşan'a geçip Vahan'a dönmüş olmalı. Çitral'den Vahan'a olağan yol ise Yarhun vadisi ve Barogil geçidinden geçer. Nokta bu belirsizlikle gösterildi."},
 {id:19,nm:"Serhadd-i Vahan",mo:"Sarhad-e Wakhan, Afganistan",lat:36.98,lon:73.47,wp:"en:Sarhad, Afghanistan",t:"sehir",c:"yaklasik",ph:"hindistan",br:"ana",p:2,r:"Ekim 1330",m:"Ekim 1914",ev:"Vahan koridorunun doğu ucundaki son yerleşim. Pamir'e çıkışın kapısı."},
 {id:20,nm:"Tağ Tombaşbeli",mo:"Tağdumbaş Pamiri geçidi, büyük olasılıkla Vahcir (Wakhjir), yaklaşık 4.900 m",lat:37.09,lon:74.49,wp:"tr:Vahcir Geçidi",t:"gecit",c:"yaklasik",ph:"hindistan",br:"ana",p:1,r:"Ekim–Kasım 1330",m:"Eki–Kas 1914",ev:"'Bel' Türkçede geçit demektir: Tağdumbaş beli. Vahan'dan Tağdumbaş Pamiri'ne, yani Çin topraklarına inen geçit. Yolculuğun en yüksek noktası olması muhtemel."},
 {id:21,nm:"Oy",mo:"Tağdumbaş vadisi (tam yeri bilinmiyor)",lat:37.25,lon:74.95,wp:"en:Taghdumbash Pamir",t:"sehir",c:"belirsiz",ph:"hindistan",br:"ana",p:3,r:"Kasım 1330",m:"Kasım 1914",ev:"Geçit ile Tabdar arasında bir konak yeri olarak sıralanmış. Nokta vadide tahminidir."},
 {id:22,nm:"Tabdar",mo:"Dafdar (Tafdar), Taşkurgan ilçesi",lat:37.42,lon:75.10,wp:"en:Dafdar",t:"sehir",c:"yaklasik",ph:"hindistan",br:"ana",p:3,r:"Kasım 1330",m:"Kasım 1914",ev:"Tağdumbaş vadisindeki Dafdar köyü olarak tanımlandı."},
 {id:23,nm:"Taş Kurgan",mo:"Taşkurgan, Sincan",lat:37.775,lon:75.227,wp:"tr:Taşkurgan",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:1,r:"Kasım 1330",m:"Kasım 1914",ev:"Sarıkol'un merkezi ve eski kale. Grup Nisan 1915'te yakalandıktan sonra buraya geri getirilir."},
 {id:24,nm:"Çiçeklibel",mo:"Çiçeklik geçidi (Chichiklik)",lat:38.06,lon:75.42,t:"gecit",c:"yaklasik",ph:"hindistan",br:"ana",p:2,r:"Kasım 1330",m:"Kasım 1914",ev:"Taşkurgan'dan Kaşgar ovasına inen eski yol üzerindeki yüksek yayla ve geçit. Aurel Stein de bu yolu kullanmıştı."},
 {id:25,nm:"Kaşıkçıbeli",mo:"Çiçeklik ile Yenihisar arasında bir geçit (doğrulanamadı)",lat:38.45,lon:75.75,t:"gecit",c:"belirsiz",ph:"hindistan",br:"ana",p:3,r:"Kasım 1330",m:"Kasım 1914",ev:"Adı haritalarda eşleşmedi. Sıraya göre Pamir'den ovaya inişteki son geçit; nokta tahminidir."},
 {id:26,nm:"Yenihisar",mo:"Yengisar (Yingjisha), Sincan",lat:38.93,lon:76.17,wp:"tr:Yengisar İlçesi",t:"sehir",c:"kesin",ph:"hindistan",br:"ana",p:1,r:"2 Teşrin-i Sani 1330",m:"15 Kas 1914",ev:"Doğu Türkistan'a ayak basılır. Heyet burada bir süre kalır."},
 {id:27,nm:"Kaşgar",mo:"Kaşgar, Sincan",lat:39.47,lon:75.99,wp:"tr:Kaşgar",t:"sehir",c:"kesin",ph:"kasgar",br:"ana",p:1,r:"1 Nisan 1331 (ayrılış)",m:"Kasım 1914 – 14 Nis 1915",ev:"Heyet ikiye bölünerek gelir, çeşitli kişilerle görüşüp halkı aydınlatmaya çalışır. 14 Nisan 1915'te Afganistan'a gitmek üzere ayrılır."},
 {id:28,nm:"Pamir (yakalanma yeri)",mo:"Adı verilmemiş, Çin topraklarında",lat:37.45,lon:74.85,wp:"tr:Pamir Dağları",t:"bolge",c:"belirsiz",ph:"esaret",br:"ana",p:2,r:"14 Nisan 1331",m:"27 Nis 1915",ev:"Kalın kar üzerinde zorlukla ilerlerken Ruslar tarafından Çin topraklarında yakalanırlar. Afganistan yönüne gittikleri için Taşkurgan'ın güneyi varsayıldı."},
 {id:29,nm:"Taş Kurgan (esir olarak)",mo:"Taşkurgan, Sincan",lat:37.775,lon:75.227,wp:"tr:Taşkurgan",t:"sehir",c:"kesin",ph:"esaret",br:"ana",p:3,r:"Nisan 1331",m:"Nisan 1915",ev:"Yakalandıktan sonra buraya götürülürler.",dup:true},
 {id:30,nm:"Taşkent",mo:"Taşkent, Özbekistan",lat:41.31,lon:69.28,wp:"tr:Taşkent",t:"sehir",c:"kesin",ph:"esaret",br:"ana",p:1,r:"Haziran 1331 (hapisten çıkış)",m:"Mayıs – 14 Haz/14 Tem 1915",ev:"İdam edilmek üzere sevk edilirler. Doğu Türkistan Türklerinin girişimleri ve Alman elçisi von Hintze sayesinde kurtulurlar. Taşkurgan'dan Taşkent'e güzergâh metinde yok."},
 {id:31,nm:"Kapal",mo:"Kapal, Kazakistan",lat:45.12,lon:79.07,wp:"en:Qapal",t:"sehir",c:"kesin",ph:"esaret",br:"ana",p:1,r:"1331 yazı",m:"Yaz 1915",ev:"Balkaş Gölü'nün güneydoğusunda. Kalebend (kale hapsi) olarak gönderilirler."},
 {id:32,nm:"Sarhan",mo:"Sarkand, Kazakistan",lat:45.41,lon:79.91,wp:"en:Sarkand",t:"sehir",c:"kesin",ph:"esaret",br:"ana",p:2,r:"1 Ağustos 1332 (kaçış)",m:"14 Ağu 1916",ev:"Kırgız ve Kazakların yaşadığı yer. 1 yıl 3 ay esaretten sonra buradan kaçarlar. Her yerde Tatar tüccar, öğretmen ve şairlerden iyi karşılık görürler."},
 {id:33,nm:"Kulca",mo:"Gulca (Yining), Sincan",lat:43.91,lon:81.32,wp:"tr:Gulca",t:"sehir",c:"kesin",ph:"isyan",br:"ana",p:1,r:"Ağustos–Eylül 1332",m:"Ağu–Eyl 1916",ev:"Bir ay kalıp izlerini kaybettirirler. Türkçü Tatar aydını Abdullah Bubi isyandaki Kırgızların başına geçmelerini önerir. Emrullah Bey Alman elçisiyle görüşmek üzere Pekin'e gönderilir."},
 {id:34,nm:"Kırgız isyancılarına katılım",mo:"Yeri verilmemiş; Tekes–Narınkol çevresi varsayıldı",lat:42.85,lon:80.40,wp:"en:Tekes County",t:"bolge",c:"belirsiz",ph:"isyan",br:"ana",p:2,r:"Teşrin-i Sani 1332 ortası",m:"Kasım 1916 ortası",ev:"Togan'a göre Kasım ortasında Kırgızlara katılıp isyanı idare ederler. Kuropatkin isyanı şiddetle bastırır. Not: Yedisu isyanının ana evresi bu tarihten önce sona ermişti."},
 {id:35,nm:"Kuçar",mo:"Kuça (Kuqa), Sincan",lat:41.72,lon:82.96,wp:"tr:Kuçar İlçesi",t:"sehir",c:"kesin",ph:"cikis",br:"ana",p:1,r:"1333 başı",m:"1917 başı",ev:"Dağlara çekildikten sonra gelinir. Ruslar onları Çinlilerden ister. Afgan kökenli İngiliz konsolosunun evinde bir süre saklanırlar."},
 {id:36,nm:"Taklamakan çölü",mo:"Taklamakan (Kuça–Hoten hattı)",lat:39.40,lon:81.70,wp:"tr:Taklamakan Çölü",t:"bolge",c:"yaklasik",ph:"cikis",br:"ana",p:2,r:"1333",m:"1917",ev:"İzlerini kaybettirmek için çöl aşılır. Muhtemelen Hoten deryası yatağı boyunca; metin güzergâh vermez."},
 {id:37,nm:"Hoten",mo:"Hoten (Hotan), Sincan",lat:37.11,lon:79.93,wp:"en:Hotan",t:"sehir",c:"kesin",ph:"cikis",br:"ana",p:1,r:"1333",m:"1917",ev:"Çin hükümeti onlardan şüphelenir. Pekin'deki Alman elçisinin girişimleri sürer; ancak Çin Mart 1917'de Almanya ile ilişkisini kesmiştir."},
 {id:38,nm:"Urumçi",mo:"Urumçi, Sincan",lat:43.83,lon:87.62,wp:"tr:Urumçi",t:"sehir",c:"kesin",ph:"cikis",br:"ana",p:1,r:"1333–1334",m:"1917–1918",ev:"Şanghay'a gitme teklifini kabul ederler; bir süre burada kalırlar. Hoten'den buraya güzergâh metinde yok."},
 {id:39,nm:"Barköl",mo:"Barköl, Sincan",lat:43.60,lon:93.02,wp:"en:Barkol Kazakh Autonomous County",t:"sehir",c:"kesin",ph:"cikis",br:"ana",p:2,r:"1334",m:"1918",ev:"Bir müddet kalınır. Doğu Türkistan'daki son durak."},
 {id:40,nm:"Şanghay",mo:"Şanghay, Çin",lat:31.23,lon:121.47,wp:"tr:Şanghay",t:"liman",c:"kesin",ph:"cikis",br:"ana",p:1,r:"",m:"29 Haz 1918 – Nis 1920",ev:"Varışta yine İngiliz takibi. Almanya'nın yenilgisinden sonra Türk-Alman çıkarlarını izleyen Hollanda elçiliğinin yardımıyla rahat yaşarlar, Japonlarla sıkı ilişki kurarlar. Barköl'den buraya güzergâh metinde yok."},
 {id:41,nm:"Hamburg",mo:"Hamburg, Almanya",lat:53.55,lon:9.99,wp:"tr:Hamburg",t:"liman",c:"kesin",ph:"donus",br:"ana",p:1,r:"1 Nisan 1336 (Şanghay'dan çıkış)",m:"1 Nis 1920",fix:"Metinde 14 Nis 1920 yazıyor; 1917 sonrası Rumi tarihe gün eklenmez.",ev:"Adil Hikmet, Hüseyin Bey ve Tortumlu İsmail Abbas Japon vapuru İskotland Maru (Scotland Maru) ile gelir. Ara limanlar metinde yok."},
 {id:42,nm:"İstanbul",mo:"İstanbul",lat:41.01,lon:28.98,wp:"tr:İstanbul",t:"liman",c:"kesin",ph:"donus",br:"ana",p:1,r:"10 Mart 1337",m:"10 Mar 1921",fix:"Metinde 23 Mar 1921 yazıyor.",ev:"Reşitpaşa vapuruyla dönecekken İngilizlerin onu yakalayacağını öğrenen Almanlar tarafından kaçırılır; İstanbul'a ancak bu tarihte dönebilir. Hamburg'dan güzergâh metinde yok."},
 {id:43,nm:"Pekin",mo:"Pekin, Çin",lat:39.90,lon:116.40,wp:"tr:Pekin",t:"sehir",c:"kesin",ph:"isyan",br:"b1",p:1,r:"1332 sonbaharı",m:"Sonbahar 1916",ev:"Emrullah Bey Kulca'dan, Alman elçisiyle görüşüp yardım sağlamak için gönderilir. Güzergâh metinde yok."},
 {id:44,nm:"Afganistan",mo:"Afganistan (Kâbil işaretlendi)",lat:34.53,lon:69.17,wp:"tr:Kâbil",t:"bolge",c:"yaklasik",ph:"donus",br:"b1",p:2,r:"1334–1335",m:"1918–1919",ev:"Emrullah Bey'in dönüş yolu. Pekin'den Afganistan'a nasıl geçtiği metinde yok."},
 {id:45,nm:"Türkistan",mo:"Batı Türkistan (Buhara işaretlendi)",lat:39.77,lon:64.42,wp:"tr:Buhara",t:"bolge",c:"belirsiz",ph:"donus",br:"b1",p:3,r:"1335",m:"1919",ev:"Metin yalnızca 'Türkistan' der; nokta temsilîdir."},
 {id:46,nm:"Batum",mo:"Batum, Gürcistan",lat:41.64,lon:41.64,wp:"tr:Batum",t:"liman",c:"kesin",ph:"donus",br:"b1",p:2,r:"1335",m:"1919",ev:"Karadeniz'e çıkış."},
 {id:47,nm:"Trabzon",mo:"Trabzon",lat:41.00,lon:39.72,wp:"tr:Trabzon",t:"liman",c:"kesin",ph:"donus",br:"b1",p:2,r:"1335",m:"1919",ev:"Son ara durak."},
 {id:48,nm:"İstanbul (Emrullah Bey)",mo:"İstanbul",lat:41.01,lon:28.98,wp:"tr:İstanbul",t:"liman",c:"kesin",ph:"donus",br:"b1",p:3,r:"19 Temmuz 1335",m:"19 Tem 1919",ev:"Emrullah Bey, gruptan önce İstanbul'a döner. 1917 sonrası olduğu için Rumi ve Miladi gün aynıdır.",dup:true},
 {id:49,nm:"Mançurya",mo:"Mançurya (Harbin işaretlendi)",lat:45.75,lon:126.65,wp:"tr:Harbin",t:"bolge",c:"yaklasik",ph:"donus",br:"b2",p:1,r:"31 Mart 1336",m:"31 Mar 1920",fix:"Metinde 13 Nis 1920 yazıyor.",ev:"Selim Sami ve İbrahim Bey, Japonların yardımıyla Şanghay'dan Mançurya yoluyla Rusya'ya geçer. Sonrası metinde yok. Saparaliyev'e göre Selim Sami 1927'de öldü."}
];
/* Bölümler: [kimden, kime, tür, kol]. Tür: sea, land, captive, unknown */
const SEG=[
 [1,2,"sea"],[2,3,"sea"],[3,4,"sea"],[4,5,"sea"],[5,6,"sea"],[6,7,"sea"],[7,8,"sea"],
 [8,9,"unknown"],[9,10,"land"],[10,11,"land"],[11,12,"land"],[12,13,"land"],[13,14,"land"],[14,15,"land"],[15,16,"land"],[16,17,"land"],[17,18,"land"],[18,19,"land"],[19,20,"land"],[20,21,"land"],[21,22,"land"],[22,23,"land"],[23,24,"land"],[24,25,"land"],[25,26,"land"],[26,27,"land"],
 [27,28,"land"],[28,29,"captive"],[29,30,"captive"],[30,31,"captive"],[31,32,"captive"],
 [32,33,"land"],[33,34,"land"],[34,35,"land"],[35,36,"land"],[36,37,"land"],[37,38,"unknown"],[38,39,"land"],[39,40,"unknown"],
 [40,41,"unknown"],[41,42,"unknown"],
 [33,43,"unknown","b1"],[43,44,"unknown","b1"],[44,45,"unknown","b1"],[45,46,"unknown","b1"],[46,47,"sea","b1"],[47,48,"sea","b1"],
 [40,49,"unknown","b2"]
];
/* Bölüm süreleri: anahtar "kimden-kime", SEG ile birebir.
   d: tahmini yolculuk süresi (duraklarda geçen bekleme hariç)
   k: dayanak. "metin" = metindeki iki tarihten hesaplandı; "tahmin" = metinde tarih yok,
      dönemin olağan hızından (vapur günde ~450 km, tren günde ~500 km, dağ yolunda yaya/atlı günde 15–30 km) kestirildi;
      "bilinmiyor" = metin güzergâhı da süreyi de vermiyor
   n: gerekçe. Mesafeler sayfada kuş uçuşu hesaplanır; dağ yolları bundan epey uzundur. */
const SURE={
 "1-2":{d:"2–3 gün",k:"tahmin",n:"İzmir'den 22 Temmuz'da çıkan vapur 4 Ağustos'ta Hudeyde'dedir: beş ayak ve liman beklemeleri toplam 13 gün (metinden). Bu ayak vapur hızıyla 2–3 gün."},
 "2-3":{d:"1 gün",k:"tahmin",n:"Kısa bir kıyı ayağı. İzmir–Hudeyde arasının toplam 13 gün sürdüğü metinden biliniyor."},
 "3-4":{d:"1 gün",k:"tahmin",n:"1914'te Süveyş Kanalı'ndan geçiş yaklaşık 15–18 saat sürüyordu."},
 "4-5":{d:"2–3 gün",k:"tahmin",n:"Kızıldeniz boyunca vapur hızıyla. İzmir–Hudeyde arası toplam 13 gün (metinden)."},
 "5-6":{d:"2 gün",k:"tahmin",n:"Cidde'den Hudeyde'ye; varış 22 Temmuz 1330 = 4 Ağustos 1914 (metinden)."},
 "6-7":{d:"1 gün",k:"tahmin",n:"Hudeyde'den boğaza kısa bir ayak."},
 "7-8":{d:"7–9 gün",k:"tahmin",n:"Arap Denizi'ni aşan en uzun deniz ayağı; Bombay'a Ağustos'ta varılır (metinden), gün verilmez."},
 "8-9":{d:"2–3 gün",k:"tahmin",n:"Metin güzergâh vermez. Bombay'dan Peşaver'e demiryolu vardı; trenle 2–3 gün. Bombay'daki gözaltı süresi bilinmiyor."},
 "9-10":{d:"1 gün",k:"tahmin",n:"Peşaver–Lahor arası demiryoluyla bir günlük yol."},
 "10-11":{d:"1 gün",k:"tahmin",n:"Lahor'dan Peşaver'e dönüş, demiryoluyla. 2 Eylül 1330 = 15 Eylül 1914'te Peşaver'dedirler (metinden)."},
 "11-12":{d:"2–3 gün",k:"tahmin",n:"Peşaver (15 Eylül) ile Yenihisar (15 Kasım) arası tam iki ay, 61 gün (metinden). Ara duraklara tarih verilmediği için bu süre mesafe ve araziye göre paylaştırıldı; kalan günler konaklamalardır."},
 "12-13":{d:"3–4 gün",k:"tahmin",n:"Swat ve Panjkora vadileri boyunca atlı yolculuk. Peşaver–Yenihisar arası toplam 61 gün (metinden)."},
 "13-14":{d:"1 gün",k:"tahmin",n:"Kısa bir ayak; Ziyaret'in yeri belirsiz."},
 "14-15":{d:"1 gün",k:"tahmin",n:"Lavari geçidine tırmanış (3.118 m). Eylül sonunda geçit henüz açıktır."},
 "15-16":{d:"1–2 gün",k:"tahmin",n:"Geçitten Çitral vadisine iniş."},
 "16-17":{d:"1–2 gün",k:"tahmin",n:"Çitral nehri boyunca vadi yolu."},
 "17-18":{d:"6–8 gün",k:"tahmin",n:"Baharak Bedahşan'daki yerse Dorah geçidi üzerinden; yer belirsiz olduğu için süre de belirsizdir."},
 "18-19":{d:"9–12 gün",k:"tahmin",n:"Vahan koridoru boyunca Penç nehri vadisi; yükseklik ve Ekim soğuğu yürüyüşü yavaşlatır."},
 "19-20":{d:"4–6 gün",k:"tahmin",n:"Vahan'ın doğu ucundan Vahcir geçidine (yaklaşık 4.900 m). Yolculuğun en zor bölümü olmalı."},
 "20-21":{d:"1–2 gün",k:"tahmin",n:"Geçitten Tağdumbaş Pamiri'ne iniş."},
 "21-22":{d:"1 gün",k:"tahmin",n:"Tağdumbaş vadisinde bir konak."},
 "22-23":{d:"1–2 gün",k:"tahmin",n:"Vadi boyunca Taşkurgan'a."},
 "23-24":{d:"2 gün",k:"tahmin",n:"Taşkurgan'dan Çiçeklik yaylasına tırmanış."},
 "24-25":{d:"2–3 gün",k:"tahmin",n:"Pamir'den ovaya inen dağ yolu; Kaşıkçıbeli'nin yeri belirsiz."},
 "25-26":{d:"2–3 gün",k:"tahmin",n:"Ovaya iniş. Yenihisar'a 2 Teşrin-i Sani 1330 = 15 Kasım 1914'te varılır (metinden)."},
 "26-27":{d:"2 gün",k:"tahmin",n:"Ova yolu, günde 30 km kadar. Heyet Yenihisar'da bir süre kalır; Kaşgar'a varış günü metinde yok."},
 "27-28":{d:"13 gün",k:"metin",n:"Kaşgar'dan 1 Nisan 1331 = 14 Nisan 1915'te çıkılır, 14 Nisan 1331 = 27 Nisan 1915'te yakalanılır. Kalın kar yürüyüşü yavaşlatır."},
 "28-29":{d:"1–2 gün",k:"tahmin",n:"Esir olarak Taşkurgan'a geri getirilirler."},
 "29-30":{d:"3–5 hafta",k:"tahmin",n:"Güzergâh metinde yok. Nisan sonunda Taşkurgan'da, Mayıs'ta Taşkent'tedirler (metinden). Büyük olasılıkla Pamir üzerinden Fergana'ya, oradan trenle."},
 "30-31":{d:"3–4 hafta",k:"tahmin",n:"Taşkent'te hapisten çıkış Haziran 1331 (metinden), Kapal'a varış 1915 yazı. Dönemde Taşkent–Yedisu arasında demiryolu yoktu; posta yoluyla."},
 "31-32":{d:"2–3 gün",k:"tahmin",n:"Kapal ile Sarkand arası kısa bir yol. Yedisu'daki esaret toplam 1 yıl 3 ay (metinden)."},
 "32-33":{d:"1–2 hafta",k:"tahmin",n:"1 Ağustos 1332 = 14 Ağustos 1916'da Sarkand'dan kaçış (metinden). Kaçak olarak Çin sınırına; Kulca'da bir ay saklanırlar (metinden)."},
 "33-34":{d:"1 hafta",k:"tahmin",n:"Kulca'dan Ağustos–Eylül'de ayrılırlar, Kırgızlara Kasım ortasında katılırlar (metinden); arada geçen yaklaşık iki ayın ne kadarı yolda geçti bilinmiyor."},
 "34-35":{d:"2–4 hafta",k:"tahmin",n:"Tanrı Dağları kışın aşılır; Kuçar'a 1917 başında varılır (metinden)."},
 "35-36":{d:"7–10 gün",k:"tahmin",n:"Kuça'dan Hoten deryası yatağı boyunca çöl yolu; kervanlar Kuça–Hoten arasını 15–20 günde alırdı."},
 "36-37":{d:"7–10 gün",k:"tahmin",n:"Çölün güney yarısı, Hoten'e varış."},
 "37-38":{d:"5–8 hafta",k:"tahmin",n:"Güzergâh metinde yok. Aksu ve Turfan üzerinden kervan yolu 1.500 km'yi aşar."},
 "38-39":{d:"2–3 hafta",k:"tahmin",n:"Urumçi'den Tanrı Dağları'nın kuzey eteğiyle Barköl'e kervan yolu."},
 "39-40":{d:"2–3 ay",k:"tahmin",n:"Güzergâh metinde yok. Hami ve Gansu üzerinden kervanla demiryolu başına, sonra trenle; Şanghay'a 29 Haziran 1918'de varılır (metinden)."},
 "40-41":{d:"6–7 hafta",k:"tahmin",n:"1 Nisan 1920'de Şanghay'dan Japon vapuruyla çıkılır (metinden). Hint Okyanusu ve Süveyş üzerinden deniz yolu kuş uçuşunun iki katından uzundur."},
 "41-42":{d:"1–2 hafta (yol)",k:"metin",n:"Hamburg'a 1920 baharında varılır, İstanbul'a dönüş 10 Mart 1921 (metinden): arada yaklaşık 10 ay geçer. Yolun kendisi metinde yok; trenle 1–2 hafta."},
 "33-43":{d:"2–3 ay",k:"tahmin",n:"Güzergâh metinde yok. Kulca'dan Pekin'e kervan ve tren yolu; Emrullah Bey 1916 sonbaharında gönderilir (metinden)."},
 "43-44":{d:"bilinmiyor",k:"bilinmiyor",n:"Pekin'den Afganistan'a nasıl ve ne zaman geçtiği metinde yok. 1916 sonbaharı ile 1918–1919 arası."},
 "44-45":{d:"bilinmiyor",k:"bilinmiyor",n:"Metin yalnızca 'Türkistan' der; yol ve süre yok."},
 "45-46":{d:"1–2 hafta",k:"tahmin",n:"Buhara'dan Krasnovodsk'a trenle, Hazar'ı vapurla, Bakü'den Batum'a trenle. Emrullah Bey 19 Temmuz 1919'da İstanbul'dadır (metinden)."},
 "46-47":{d:"1 gün",k:"tahmin",n:"Batum'dan Trabzon'a kısa bir vapur yolu."},
 "47-48":{d:"2–3 gün",k:"tahmin",n:"Karadeniz kıyısı boyunca vapurla. İstanbul'a varış 19 Temmuz 1919 (metinden)."},
 "40-49":{d:"1 hafta",k:"tahmin",n:"Şanghay'dan 31 Mart 1920'de ayrılırlar (metinden). Vapur ve Güney Mançurya demiryoluyla Harbin'e yaklaşık bir hafta."}
};
const byId=Object.fromEntries(S.map(s=>[s.id,s]));
const TYPE={sehir:"Şehir / yerleşim",liman:"Liman",gecit:"Geçit",bogaz:"Boğaz / kanal",bolge:"Bölge"};
const CONF={kesin:"Kesin",yaklasik:"Yaklaşık",belirsiz:"Belirsiz",cikarim:"Çıkarım"};
const BR={ana:"Ana grup (Adil Hikmet)",b1:"Emrullah Bey",b2:"Selim Sami ve İbrahim Bey"};
const VIEWS={all:null,sea:[1,2,3,4,5,6,7,8],passes:[9,10,12,13,15,17,18,19,20,23,24,25,26,27],captive:[23,27,28,30,31,32,33,34],exit:[33,35,36,37,38,39,40],"return":[40,41,42,43,44,46,49]};

