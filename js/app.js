/* Asya'da Beş Türk rotası: harita, detay kartı, liste ve CSV.
   Bağımlılıklar (index.html'de sırayla yüklenir): data/geo.js (window.GEO), Leaflet, topojson, js/data.js
   Neden Leaflet: uydu ve yükselti altlıkları dünya genelinde Web Mercator karolarıyla yayınlanır.
   Kendi "eski harita" altlığımız da aynı projeksiyonda çizilir; böylece altlık değişince rota yerinden oynamaz. */
let active=null; // seçili durak kimliği
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- YARDIMCILAR ---------- */
// Büyük daire (kuş uçuşu) mesafesi, km. Haversine formülü; Dünya yarıçapı 6371 km.
function km(a,b){
  const r=Math.PI/180, dLat=(b.lat-a.lat)*r, dLon=(b.lon-a.lon)*r;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
  return 2*6371*Math.asin(Math.sqrt(h));
}
const fmtKm=n=>`${Math.round(n).toLocaleString("tr-TR")} km`;
// Her durağa gelen bölüm: [kimden, kime, tür, kol]. Bir durağa yalnızca bir bölüm gelir (doğrulayıcı da bunu varsayar).
const inSeg=Object.fromEntries(SEG.map(d=>[d[1],d]));
const legOf=id=>{const d=inSeg[id]; if(!d) return null; return {from:byId[d[0]],dist:km(byId[d[0]],byId[id]),sure:SURE[`${d[0]}-${d[1]}`],mode:d[2]}};
const BASIS={metin:"metinden",tahmin:"tahmin",bilinmiyor:"bilinmiyor"};
function wpInfo(s){
  if(!s.wp) return null;
  const i=s.wp.indexOf(":"), lang=s.wp.slice(0,i), title=s.wp.slice(i+1), slug=encodeURIComponent(title.replace(/ /g,"_"));
  return {lang,title,url:`https://${lang}.wikipedia.org/wiki/${slug}`,api:`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`};
}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}

/* ---------- KÜNYE ---------- */
const passes=S.filter(s=>s.t==="gecit"||s.t==="bogaz").length;
const mainKm=SEG.filter(d=>!d[3]).reduce((t,d)=>t+km(byId[d[0]],byId[d[1]]),0);
document.getElementById("facts").innerHTML=
 `<span><b>${S.filter(s=>!s.dup).length}</b> ayrı durak</span><span><b>${passes}</b> geçit ve boğaz</span><span><b>${S.filter(s=>s.c==="belirsiz").length}</b> belirsiz konum</span><span>Ana kol kuş uçuşu <b>${fmtKm(mainKm)}</b></span><span>Gidiş <b>22 Tem 1914</b></span><span>Son dönüş <b>10 Mar 1921</b></span>`;

/* ---------- HARİTA ---------- */
const mapbox=document.querySelector(".mapbox");
const map=L.map("map",{zoomControl:false,minZoom:2,maxZoom:16,zoomSnap:.25,zoomDelta:.5,wheelPxPerZoomLevel:100,worldCopyJump:true});
map.attributionControl.setPrefix(false);
// Kendi vektör altlığımız karoların (z 200) üstünde, rotanın (z 400) altında dursun
map.createPane("eski").style.zIndex=250;
// Leaflet yollara varsayılan renk özniteliği yazar; CSS sınıfı bunları ezer, böylece renkler yine tokenlardan gelir
const vec=(data,cls)=>L.geoJSON(data,{pane:"eski",interactive:false,style:()=>({className:cls})});
const land=topojson.feature(GEO,GEO.objects.land);
// Enlem-boylam ağı: 10 derecede bir, yalnızca rota kuşağında
const gratLines=[];
for(let x=-20;x<=150;x+=10) gratLines.push([[-10,x],[70,x]].map(([a,b])=>[b,a]));
for(let y=0;y<=70;y+=10) gratLines.push([[y,-30],[y,160]].map(([a,b])=>[b,a]));
// Bölge adları: haritayı okumayı kolaylaştıran coğrafi yön işaretleri
const REG=[["Pamir",37.9,73.6],["Hindukuş",35.9,70.6],["Taklamakan",38.9,83.8],["Tanrı Dağları",42.2,79.2],["Yedisu",44.6,77.2],["Balkaş",46.4,75.6],["Kızıldeniz",19.5,38.6],["Arap Denizi",15.5,63],["Akdeniz",34.2,22],["Gobi",42.5,103],["Hint Okyanusu",5,75]];
const regLayer=L.layerGroup(REG.map(([n,lat,lon])=>L.marker([lat,lon],{pane:"eski",interactive:false,keyboard:false,
  icon:L.divIcon({className:"region-lbl",html:n.toLocaleUpperCase("tr"),iconSize:[200,20],iconAnchor:[100,10]})})));
const eski=L.layerGroup([
  vec(land,"coast2"),vec(land,"coast1"),vec(land,"land"),
  vec({type:"MultiLineString",coordinates:gratLines},"grat"),regLayer
]);
const hydro=L.layerGroup([vec(topojson.feature(GEO,GEO.objects.rivers),"rivers"),vec(topojson.feature(GEO,GEO.objects.lakes),"lakes")]);
const borders=vec(topojson.mesh(GEO,GEO.objects.countries,(a,b)=>a!==b),"borders");

// Gerçek görüntü altlıkları. Hepsi anahtarsız ve ücretsiz kullanılabilir; kaynak yazısı haritanın sağ altında görünür.
// Canlı uydu: NASA GIBS, VIIRS uydusunun günlük gerçek renk mozaiği. Bugünün görüntüsü gün içinde tamamlandığı için varsayılan dün.
const isoDay=d=>d.toISOString().slice(0,10);
let liveDay=isoDay(new Date(Date.now()-864e5));
const gibsUrl=d=>`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
const live=L.tileLayer(gibsUrl(liveDay),{maxNativeZoom:9,maxZoom:16,attribution:'<a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>, VIIRS'});
const places=()=>L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxNativeZoom:13,maxZoom:16});
const BASES={
  eski,
  uydu:L.layerGroup([L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxNativeZoom:18,maxZoom:16,attribution:"Görüntü: Esri, Maxar, Earthstar Geographics"}),places()]),
  canli:L.layerGroup([live,places()]),
  topo:L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{subdomains:"abc",maxNativeZoom:17,maxZoom:16,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları, SRTM, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'})
};
let base="eski";
function setBase(b){
  map.removeLayer(BASES[base]); base=b; BASES[b].addTo(map);
  mapbox.className=`mapbox base-${b}`;
  document.getElementById("livenote").hidden=b!=="canli";
}
// Canlı uydu için gün seçici: bulutlar ve uydunun yörünge boşlukları o günün gerçek görüntüsüdür
document.getElementById("livenote").innerHTML=
 `<label>NASA VIIRS görüntüsü, gün: <input type="date" id="liveday" value="${liveDay}" min="2012-01-20" max="${liveDay}"></label>`;
document.getElementById("liveday").onchange=e=>{if(e.target.value){liveDay=e.target.value; live.setUrl(gibsUrl(liveDay))}};

/* ---------- ROTA VE DURAKLAR ---------- */
const groups={ana:L.layerGroup(),b1:L.layerGroup(),b2:L.layerGroup()};
const segLayer={};
SEG.forEach(([a,b,mode,br])=>{
  const A=byId[a],B=byId[b];
  segLayer[b]=L.polyline([[A.lat,A.lon],[B.lat,B.lon]],{className:`seg ${mode} ${br||""}`,interactive:false}).addTo(groups[br||"ana"]);
});
const SHAPE={
  gecit:'<path class="mk" d="M0,-7L6.5,5H-6.5Z"/>',
  bogaz:'<path class="mk" d="M0,-6L6,0L0,6L-6,0Z"/>',
  bolge:'<circle class="mk" r="7"/>',
  liman:'<rect class="mk" x="-4.5" y="-4.5" width="9" height="9"/>',
  sehir:'<circle class="mk" r="4.5"/>'
};
// Aynı noktayı paylaşan ikinci ziyaretlerin numarası ana etikete eklenir; haritada ayrı nokta çizilmez
const dupNums={}; S.filter(s=>s.dup).forEach(s=>{const o=S.find(x=>!x.dup&&x.lat===s.lat&&x.lon===s.lon); if(o)(dupNums[o.id]=dupNums[o.id]||[]).push(s.id)});
const markers={};
S.filter(s=>!s.dup).forEach(s=>{
  const icon=L.divIcon({className:"stopicon",iconSize:[26,26],iconAnchor:[13,13],
    html:`<svg class="stop t-${s.t} c-${s.c} ph-${s.ph} br-${s.br}" viewBox="-13 -13 26 26" width="26" height="26" aria-hidden="true"><circle class="halo" r="11"/>${SHAPE[s.t]}<text class="q" text-anchor="middle" dy="3.5">?</text></svg>`});
  const m=L.marker([s.lat,s.lon],{icon,title:s.nm,alt:s.nm,keyboard:true,riseOnHover:true})
    .on("click",()=>select(s.id,true))
    // Klavyeyle seçim: işaret her haritaya eklendiğinde yeni bir öğe olarak oluşur, dinleyici de yeniden bağlanır
    .on("add",e=>e.target.getElement().addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select(s.id,true)}}))
    .addTo(groups[s.br]);
  m.bindTooltip(`<span class="n">${[s.id,...(dupNums[s.id]||[])].join(", ")}</span> ${esc(s.nm.replace(" (Emrullah Bey)",""))}`,
    {permanent:true,direction:"right",offset:[9,0],className:`slbl p${s.p}`,interactive:false});
  markers[s.id]=m;
});
Object.values(groups).forEach(g=>g.addTo(map));
hydro.addTo(map);
setBase("eski");

// Etiket yoğunluğu: öncelik 1 her zaman, 2 orta yakınlıkta, 3 yakında. CSS bu sınıflara bakar.
function zoomClass(){
  const z=map.getZoom(), el=map.getContainer();
  el.classList.remove("zl-1","zl-2","zl-3");
  el.classList.add(z<4.5?"zl-1":z<6.5?"zl-2":"zl-3");
}
map.on("zoomend",zoomClass);

const allBounds=L.latLngBounds(S.map(s=>[s.lat,s.lon]));
map.fitBounds(allBounds,{padding:[30,30]}); zoomClass();
function fitIds(ids){
  const b=ids?L.latLngBounds(ids.map(i=>[byId[i].lat,byId[i].lon])):allBounds;
  if(reduceMotion) map.fitBounds(b,{padding:[50,50],maxZoom:9});
  else map.flyToBounds(b,{padding:[50,50],maxZoom:9,duration:.9});
}
document.getElementById("zin").onclick=()=>map.zoomIn(.75);
document.getElementById("zout").onclick=()=>map.zoomOut(.75);
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("[data-view]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  fitIds(VIEWS[b.dataset.view]);
});
document.querySelectorAll("[data-base]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("[data-base]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  setBase(b.dataset.base);
});
function tog(id,fn){const b=document.getElementById(id);b.onclick=()=>{const on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",on);fn(on)}}
const showLayer=l=>on=>on?l.addTo(map):map.removeLayer(l);
tog("t-b1",showLayer(groups.b1)); tog("t-b2",showLayer(groups.b2));
tog("t-hydro",showLayer(hydro));
tog("t-borders",showLayer(borders));

/* ---------- LEJANT ---------- */
const sw=(svgInner)=>`<svg width="30" height="14" viewBox="0 0 30 14" aria-hidden="true">${svgInner}</svg>`;
document.getElementById("legend").innerHTML=[
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--route)" stroke-width="2.6"/>'),"Kara yolu (metinde sırasıyla)"],
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--route)" stroke-width="3" stroke-dasharray="1 6" stroke-linecap="round"/>'),"Deniz yolu"],
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--captive)" stroke-width="2.6" stroke-dasharray="8 5"/>'),"Esir olarak sevk"],
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--unk)" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round"/>'),"Güzergâhı metinde yok"],
 [sw('<path d="M15,1L21,12H9Z" fill="var(--pass)"/>'),"Geçit"],
 [sw('<path d="M15,1L21,7L15,13L9,7Z" fill="var(--pass)"/>'),"Boğaz / kanal"],
 [sw('<rect x="10" y="2.5" width="9" height="9" fill="var(--route)"/>'),"Liman"],
 [sw('<circle cx="15" cy="7" r="4.5" fill="var(--route)"/>'),"Yerleşim"],
 [sw('<circle cx="15" cy="7" r="5.5" fill="none" stroke="var(--muted)" stroke-dasharray="2 2"/>'),"Bölge"],
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--b1)" stroke-width="2.6"/>'),"Emrullah Bey kolu"],
 [sw('<line x1="2" y1="7" x2="28" y2="7" stroke="var(--b2)" stroke-width="2.6"/>'),"Selim Sami ve İbrahim kolu"]
].map(([s,t])=>`<span>${s}${t}</span>`).join("");

/* ---------- GÖRSELLER ---------- */
// İstekler önbelleğe alınır: aynı durağa dönünce yeniden indirilmez
const cache=new Map();
const getJSON=u=>{if(!cache.has(u))cache.set(u,fetch(u).then(r=>r.ok?r.json():null).catch(()=>null));return cache.get(u)};
const plain=html=>new DOMParser().parseFromString(html||"","text/html").body.textContent.trim();
// Görsel adresinden Commons dosya sayfasını bulur: lisans ve yazar bilgisi o sayfadadır
const filePage=src=>{const f=decodeURIComponent((src||"").split("/").pop()); return f?`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(f)}`:null};

async function loadPics(s){
  const box=document.getElementById("pics"); if(!box) return;
  const w=wpInfo(s);
  // 1) Wikipedia maddesinin ana görseli
  const sum=w?await getJSON(w.api):null;
  let leadFile=null, html="";
  if(sum&&sum.thumbnail){
    const big=sum.originalimage?sum.originalimage.source:sum.thumbnail.source;
    leadFile=decodeURIComponent(big.split("/").pop());
    html+=`<figure class="lead"><a href="${esc(filePage(big))}" target="_blank" rel="noopener"><img src="${esc(sum.thumbnail.source)}" alt="${esc(sum.title)}" loading="lazy"></a>
      <figcaption>${esc(sum.title)}${sum.description?`, ${esc(sum.description)}`:""}. Görsel: Wikimedia Commons</figcaption></figure>`;
  }
  // 2) Wikimedia Commons'ta bu noktanın 10 km yakınında konum etiketiyle yüklenmiş fotoğraflar
  const geo=await getJSON(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggscoord=${s.lat}|${s.lon}&ggsradius=10000&ggslimit=40&ggsnamespace=6&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=360&iiextmetadatafilter=Artist|LicenseShortName`);
  if(active!==s.id) return; // kullanıcı bu arada başka durağa geçtiyse eski sonucu yazma
  const photos=geo&&geo.query?Object.values(geo.query.pages).sort((a,b)=>a.index-b.index)
    .filter(p=>p.imageinfo&&p.imageinfo[0].mime==="image/jpeg"&&p.title.replace(/^File:/,"").replace(/ /g,"_")!==(leadFile||"").replace(/ /g,"_"))
    .slice(0,4):[];
  if(photos.length){
    const note=s.c==="kesin"?"":" Konum kesin olmadığı için fotoğraflar da yaklaşık bir yeri gösterir.";
    html+=`<div class="cap">Bu noktanın 10 km yakınında çekilmiş fotoğraflar (Wikimedia Commons).${note}</div><div class="thumbs">${photos.map(p=>{
      const ii=p.imageinfo[0], m=ii.extmetadata||{};
      const credit=[plain(m.Artist&&m.Artist.value),m.LicenseShortName&&m.LicenseShortName.value].filter(Boolean).join(", ");
      return `<a href="${esc(ii.descriptionurl)}" target="_blank" rel="noopener" title="${esc(credit)}"><img src="${esc(ii.thumburl)}" alt="${esc(p.title.replace(/^File:|\.\w+$/g,""))}" loading="lazy"></a>`}).join("")}</div>`;
  }
  if(!html) html=`<div class="cap">Bu yer için görsel bulunamadı.</div>`;
  if(w) html+=`<a class="wiki" href="${esc(w.url)}" target="_blank" rel="noopener">Wikipedia'da oku: ${esc(sum&&sum.title||w.title)}</a>`;
  box.innerHTML=html;
}

/* ---------- DETAY KARTI ---------- */
const order=S.map(s=>s.id); // listedeki sıra = veri sırası
function legHtml(s){
  const g=legOf(s.id);
  if(!g) return `<div class="leg"><span class="h">Yol</span><span class="big">Yolculuğun başlangıcı</span></div>`;
  const su=g.sure||{d:"bilinmiyor",k:"bilinmiyor",n:""};
  return `<div class="leg"><span class="h">Önceki duraktan: ${g.from.id}. ${esc(g.from.nm)}</span>
    <span class="big"><b>${fmtKm(g.dist)}</b> kuş uçuşu · ${esc(su.d)}<span class="basis ${su.k}">${BASIS[su.k]}</span></span>
    ${su.n?`<span class="why">${esc(su.n)}</span>`:""}</div>`;
}
function detail(s){
  const i=order.indexOf(s.id);
  document.getElementById("detail").innerHTML=`
   <div class="num">Durak ${s.id} / ${S.length} · ${esc(PH[s.ph].n)}</div>
   <h2>${esc(s.nm)}</h2>
   <div class="modern">${esc(s.mo)}</div>
   <div style="display:flex;flex-wrap:wrap;gap:6px"><span class="tag t-${s.t}">${TYPE[s.t]}</span><span class="tag c-${s.c}">${CONF[s.c]}</span></div>
   <dl class="kv">
     <dt>Miladi</dt><dd class="mono">${esc(s.m)}</dd>
     ${s.r?`<dt>Rumi</dt><dd class="mono">${esc(s.r)}</dd>`:""}
     ${s.fix?`<dt>Düzeltme</dt><dd class="fix">${esc(s.fix)}</dd>`:""}
     <dt>Kol</dt><dd>${BR[s.br]}</dd>
     <dt>Koordinat</dt><dd class="mono">${s.lat.toFixed(2)}° K, ${s.lon.toFixed(2)}° D</dd>
   </dl>
   ${legHtml(s)}
   <p class="ev-text">${esc(s.ev)}</p>
   <div class="pics" id="pics"><div class="cap">Görseller yükleniyor…</div></div>
   <div class="navbtns"><button id="prev" ${i<=0?"disabled":""}>Önceki</button><button id="next" ${i>=S.length-1?"disabled":""}>Sonraki</button></div>`;
  document.getElementById("prev").onclick=()=>select(order[i-1],true);
  document.getElementById("next").onclick=()=>select(order[i+1],true);
  loadPics(s);
}
const svgOf=id=>{const m=markers[id]; return m&&m.getElement()?m.getElement().querySelector("svg"):null};
const pinOf=s=>s.dup?S.find(x=>!x.dup&&x.lat===s.lat&&x.lon===s.lon):s;
function select(id,zoomTo,scrollList){
  const prev=active&&pinOf(byId[active]);
  if(prev){const el=svgOf(prev.id); el&&el.classList.remove("active"); const t=markers[prev.id].getTooltip(); t&&t.getElement()&&t.getElement().classList.remove("on")}
  if(active&&segLayer[active]&&segLayer[active].getElement()) segLayer[active].getElement().classList.remove("on");
  active=id; const s=byId[id], tgt=pinOf(s);
  const el=svgOf(tgt.id); el&&el.classList.add("active");
  const tt=markers[tgt.id].getTooltip(); tt&&tt.getElement()&&tt.getElement().classList.add("on");
  // seçilen durağa gelen bölümü kalınlaştır: "önceki duraktan" bilgisinin haritadaki karşılığı
  if(segLayer[id]&&segLayer[id].getElement()) segLayer[id].getElement().classList.add("on");
  document.querySelectorAll("tr.row").forEach(r=>r.classList.toggle("active",+r.dataset.id===id));
  detail(s);
  if(zoomTo){
    // seçilen durak ile aynı koldaki komşularını birlikte göster
    const near=[id-1,id,id+1].filter(x=>byId[x]&&byId[x].br===s.br).map(x=>[byId[x].lat,byId[x].lon]);
    const b=L.latLngBounds(near);
    if(reduceMotion) map.fitBounds(b,{padding:[70,70],maxZoom:9});
    else map.flyToBounds(b,{padding:[70,70],maxZoom:9,duration:.8});
  }
  if(scrollList){const r=document.querySelector(`tr.row[data-id="${id}"]`); r&&r.scrollIntoView({block:"nearest"})}
}

/* ---------- LİSTE ---------- */
let filter="all";
function legCell(s){
  const g=legOf(s.id); if(!g) return `<span class="s">Başlangıç</span>`;
  return `${fmtKm(g.dist)}<span class="s">${esc(g.sure?g.sure.d:"bilinmiyor")}</span>`;
}
function renderList(){
  const keep=s=>filter==="all"||(filter==="gecit"&&(s.t==="gecit"||s.t==="bogaz"))||(filter==="liman"&&s.t==="liman")||(filter==="belirsiz"&&(s.c==="belirsiz"||s.c==="cikarim"));
  document.getElementById("list").innerHTML=Object.entries(PH).map(([k,ph])=>{
    const rows=S.filter(s=>s.ph===k&&keep(s)); if(!rows.length) return "";
    return `<div class="phase"><div class="phase-head"><h2>${ph.n}</h2><span class="span">${ph.span}</span></div>
     <p class="phase-note">${ph.note}</p>
     <div class="tablewrap"><table><thead><tr><th>Sıra</th><th>Metindeki ad / günümüz</th><th>Tür</th><th>Tarih (Miladi / Rumi)</th><th>Önceki duraktan</th><th>Olay</th></tr></thead><tbody>
     ${rows.map(s=>`<tr class="row br-${s.br}${s.id===active?" active":""}" data-id="${s.id}" tabindex="0">
       <td class="seq">${s.id}</td>
       <td class="name"><b>${esc(s.nm)}</b><span>${esc(s.mo)}</span></td>
       <td><div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start"><span class="tag t-${s.t}">${TYPE[s.t]}</span><span class="tag c-${s.c}">${CONF[s.c]}</span></div></td>
       <td class="date">${esc(s.m)}${s.r?`<br><span class="r">${esc(s.r)}</span>`:""}${s.fix?`<br><span class="fix">${esc(s.fix)}</span>`:""}</td>
       <td class="legc">${legCell(s)}</td>
       <td class="ev">${s.br!=="ana"?`<i>${BR[s.br]}.</i> `:""}${esc(s.ev)}</td></tr>`).join("")}
     </tbody></table></div></div>`}).join("");
  document.querySelectorAll("tr.row").forEach(r=>{
    const go=()=>{select(+r.dataset.id,true); mapbox.scrollIntoView({block:"nearest",behavior:reduceMotion?"auto":"smooth"})};
    r.onclick=go; r.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();go()}};
  });
}
document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{
  filter=b.dataset.filter; document.querySelectorAll("[data-filter]").forEach(x=>x.setAttribute("aria-pressed",x===b)); renderList();
});
renderList();

/* ---------- CSV ---------- */
// Sütunlar tools/export.js ile aynı tutulmalı
document.getElementById("copycsv").onclick=async()=>{
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const head=["sira","metindeki_ad","gunumuz","enlem","boylam","tur","konum_guveni","kol","evre","miladi","rumi","duzeltme","olay","onceki_durak","mesafe_km","tahmini_sure","sure_dayanagi","sure_gerekcesi","wikipedia"];
  const csv=[head.join(",")].concat(S.map(s=>{
    const g=legOf(s.id), su=g&&g.sure, w=wpInfo(s);
    return [s.id,s.nm,s.mo,s.lat,s.lon,TYPE[s.t],CONF[s.c],BR[s.br],PH[s.ph].n,s.m,s.r,s.fix,s.ev,
      g?g.from.id:"",g?Math.round(g.dist):"",su?su.d:"",su?BASIS[su.k]:"",su?su.n:"",w?w.url:""].map(q).join(",")})).join("\n");
  const t=document.getElementById("toast");
  try{await navigator.clipboard.writeText(csv); t.textContent="CSV panoya kopyalandı ("+S.length+" satır)";}
  catch(e){ // pano izni yoksa metni seçilebilir halde göster
    t.textContent="Pano erişimi yok; metin aşağıda seçildi.";
    let ta=document.getElementById("csvout"); if(!ta){ta=document.createElement("textarea");ta.id="csvout";ta.style.cssText="width:100%;height:160px;font:14px var(--f-data);background:var(--card);color:var(--ink);border:1px solid var(--border)";document.getElementById("list").before(ta)}
    ta.value=csv; ta.select();
  }
};

select(1,false);
