# Geliştirme kılavuzu (bölüm yazarları için)

Proje: **Mırıltıdan Ezgiye**, Türkçe, statik (HTML + CSS + düz JS, derleme yok) etkileşimli şan eğitimi.
Klasör: `/Users/koraytoksoz/Projects/yz/san`. Yerel sunucu açık: **http://localhost:8857/index.html** (başka port açma).

Okunacaklar (sırayla):
1. `PLAN.md`: slayt listesi, her slaytın deneyi, tasarım planı ("nota defteri ve mürekkep kalemi").
2. `docs/arastirma.md`: doğrulanmış kaynaklar. Bilimsel iddiaları buradan al; burada olmayan bir iddiayı kullanacaksan kaynağını kendin doğrula (WebSearch) ya da `docs/kontrol/` notuna "doğrulanmadı" diye yaz.
3. Örnek slayt: `js/content/04-perde.js` + `js/demos/04-perde.js` (perde eşleme). Bu yapıyı ve dili örnek al.
4. Ortak bileşenler: `js/lib.js`, `js/egri.js`, `js/alistirma.js`, `js/aralik.js`, `js/kayit.js`, `js/ses.js`, `js/pitch.js`, `js/analiz.js`, `js/spektrogram.js`, `js/audio.js`, `js/koma.js`, `js/usul.js`, `js/data/*.js`, `css/style.css`. **Bunları değiştirme.** Ortak bir bileşende hata ya da eksik görürsen raporunda yaz; gerekiyorsa kendi demo dosyanın içinde küçük bir yardımcı yaz.

## Dosyalar ve sahiplik

Her bölümün üç dosyası var; yalnızca sana verilen bölümlerin dosyalarını yaz:
- `js/content/NN-ad.js`: slaytların HTML'i (`L.slide(\`...\`)`), metin, sunucu notları.
- `js/demos/NN-ad.js`: deneyler (`window.Demos.<ad> = (stage, slide) => ({ enter, leave, toggle })`), hayalet el senaryoları.
- `css/d/NN-ad.css`: yalnızca o bölümün stilleri. **Seçicileri slayt kimliğiyle başlat** (`#ses-telleri .x {…}`), başka bölümlere sızmasın.
- `tools/narration-parts/NN.json`: anlatım metinleri `{ "slayt-id": "metin", … }`.
- `docs/kontrol/NN.md`: şan eğitmenine sorulacak, emin olmadığın pedagojik bilgiler ve alıştırmalar (madde madde, hangi slayt).

Slayt kimlikleri ve sırası PLAN.md'deki tablodadır; kimlikleri değiştirme (başka bölümler bağlantı veriyor).

## Slayt HTML yapısı

```html
<section class="slide" data-chapter="4" data-demo="perdeEsleme" id="perde-esleme" data-tool>
  <div class="text">
    <h2>Başlık</h2>
    <p class="lead">Bir iki cümlelik giriş.</p>
    <p>…</p>
    <h3>Ara başlık</h3>
    <details class="more"><summary>Daha fazla: …</summary><p>…</p></details>
    <p class="health">Sağlık notu (ilgili slaytlarda): zorlanınca, ağrıyınca ya da ses kısılınca durun.</p>
    <p class="try">Deneyde ne yapılacağı (mikrofonlu ve mikrofonsuz).</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul><li>Sunucu notu, kaynak künyeleri, sayılar…</li></ul></aside>
</section>
```
- `data-tool`: her gün dönülecek çalışma aracıysa (PLAN.md'de ★).
- `data-chapter`: bölüm numarası. Bölüm etiketi otomatik eklenir.
- Metin sütunu ~250–420 kelime; uzun ayrıntıyı `details.more` içine koy. Her slaytta `p.lead`, en az bir `p.try`, sunucu notlarında kaynak.
- Sınıflar: `.c-tam .c-pes .c-tiz` (renk kodu metinde), `.fosfor` (fosforlu vurgu), `.health` (kırmızı kalem sağlık notu), `.kaynak`, `.tartismali` (tartışmalı konu etiketi), `.nota`/`.mono` (nota adı), `.num`.
- Bağlantılar (yeni sekmede, `target="_blank" rel="noopener"`):
  - Müzik teorisi: `https://egitim.koraytoksoz.com/muzik/#harmonik-dizisi` (diğer kimlikler: tini, araliklar, major-gam, turk-muzigi, makam-seyri, aksak, konsonans, tamperaman…)
  - Klarnet: `https://egitim.koraytoksoz.com/klarnet/#koma` (perdeler, makam-nedir, makamlar, cinsler, usul-nedir, metronom, susleme, taksim)
  - Gitar: `https://egitim.koraytoksoz.com/gitar/`
- Site içi slayt bağlantısı: `<a href="#ses-araligi">ses aralığı ölçeri</a>`.

## Dil ve içerik kuralları

- Bütün metin Türkçe; sade, kısa cümleler; "siz" diliyle. Yerleşik yabancı terimler (passaggio, belting, appoggio, bel canto, falsetto, legato, vibrato, formant, tessitura) **ilk geçtiklerinde Türkçe açıklamasıyla**.
- **Yön ifadesi yok**: "sağdaki", "soldaki", "yukarıdaki", "aşağıdaki" yazma; "deneyde", "grafikte", "perde eğrisinde" de.
- Ölçümler yaklaşıktır; sonuçları yargılamadan, cesaretlendirerek söyle: "yanlış" değil "biraz pes, biraz yukarı". "Sen tenorsun" değil "aralığın şu türlerin tipik aralığıyla örtüşüyor".
- Mitlerden kaçın, tartışmalıyı "tartışmalı" diye sun. Tıbbi tavsiye ve teşhis yok. KBB eşiği: kılavuza göre ses kısıklığı **4 hafta** içinde geçmezse (şarkıcılar ve sesini meslek olarak kullananlar için daha erken) KBB'ye (arastirma.md bölüm 10).
- Telif: yalnızca `js/data/ezgiler.js`'teki kamu malı ezgiler ve kendi yazdığın kısa egzersizler. Telifli şarkı adı/sözü/ezgisi yok. Türkü ezgisi ekleme (kontrol listesine öneri olarak yaz).
- Anatomi: stilize, tek renk mürekkep çizimi (SVG ya da tuval), birkaç çizgi + fosforlu/pes renk vurgusu; gerçekçi ya da ürkütücü olmasın.

## Görsel kurallar

- Sahne kartlara bölünmez. Ana deney yüzeyi bir "defter sayfası": `h("div.sheet")` (gerekirse `.margin`). Kontroller sayfanın üstünde `.controls` satırında (`L.btn`, `L.ibtn`, `L.seg`, `L.slider`).
- Renkler yalnızca token'lardan (`L.C.ink`, `C.porte`, `C.fosfor`, `C.tam`, `C.pes`, `C.tiz`, `C.kirmizi`, `C.grafit`, `C.kagit`…; CSS'te `var(--ink)` vb.). Karanlık temada da çalışmalı (`themechange` olayında yeniden çiz).
- Yazı: `L.FONT.display` (Anybody; `font-variation-settings: "wdth" 70–85`), `L.FONT.body`, `L.FONT.mono` (nota adları, sayılar).
- Ölçüm sonuçları: `h("div.olcumler", h("div.olcum.tam", h("b", "5,8 Hz"), h("small", "vibrato hızı")))`.
- Hareket yalnızca kullanıcıya cevap veren hareket + deneyin kendi animasyonu. `prefers-reduced-motion`'a saygı.
- Mobil (390 px): tek sütun; sahne en az ~300 px yükseklikte, kontroller sarılır, yatay kaydırma yok.

## Deney sözleşmesi

```js
window.Demos.adim = (stage, slide) => {
  // yalnızca DOM kur; ses bağlamına dokunma (Snd.ctx), mikrofonu açma
  return {
    enter() { /* döngüleri başlat, önizleme çiz */ },
    leave() { /* bütün sesleri ve döngüleri durdur, mikrofon dinleyicilerini kaldır */ },
    toggle() { /* Boşluk tuşu: alıştırmayı başlat/durdur (yoksa koyma) */ },
  };
};
window.GuideScenarios["slayt-id"] = [{ click: "=Tam düğme metni" }, { wait: 500 }, { slide: "label:Kaydırıcı etiketi", to: 0.7 }];
```
- **Ses bağlamı**: sayfa açılırken `Snd.ctx`'e dokunma (tarayıcı uyarısı konsola düşer). Ses yalnızca kullanıcı hareketinden sonra (`Snd.ready()` null dönerse çalmaz, kullanıcıya "Sesi açmak için dokunun" çıkar).
- **Mikrofon**: yalnızca bir düğmeye basınca (`Alistirma.MicSatiri()` ya da `Mic.start()` bir click içinde). Slayttan çıkınca mikrofon kendiliğinden kapanır. Hayalet el senaryoları **mikrofonu açan ya da Alistirma başlatan** düğmelere tıklamamalı (izin penceresi açılır); yalnızca segment, kaydırıcı, "Dinle" gibi güvenli kontroller.
- **Her deney mikrofonsuz da anlamlı olmalı**: örnek sentez ses (`Alistirma.ornekSoyle`), önizleme (`Alistirma.onizleme`), kaydırıcılarla keşif.
- Anlatım çalarken mikrofon ölçümü otomatik bekler (`Mic.bekle`); Egri bunu kendisi gösterir.
- Hayalet el senaryolarındaki her hedef sayfada bulunmalı (ekran görüntüsü aracı denetler). Bulucular: `"=Metin"` (tam düğme metni), `"Metin"` (ile başlayan), `"label:aria-label"` (kaydırıcı), `"aria:…"`, `"css:seçici"`.

## Ortak API (kısa)

- `L`: `h(spec, attrs, ...kids)`, `s()` (SVG), `canvas(el, onResize)` → `{ctx, w, h}`, `loop(fn)` → `{start, stop}`, `slider({label,min,max,step,value,fmt,oninput})`, `seg([[k, etiket]], değer, onchange, ariaLabel)`, `btn(etiket, onclick, "primary sm ghost")`, `ibtn("play"|"stop"|"mic"|"rec"|"down", etiket, onclick, cls)` (`.setLabel`, `.setIcon`), `nn(midi)` (tercihe göre Do4/C4), `fmtNum`, `fmtHz`, `fmtCents`, `fmtSure`, `perdeRenk(sent)`, `sapmaSoz(sent)`, `text(ctx, s, x, y, {size,color,align,weight,font})`, `piyano(ctx, x, y, w, h, {lo, hi, serit, isaret, bolgeler})`, `store.get/set` (anahtarlar otomatik `san.` önekli), `prefs` (`referans`, `kulaklik`, `sesBolge`, `notaAdi`, `gorunum`), `toast(msg)`, `C` (renkler), `FONT`.
- `N` (notalar.js): `mtof`, `ftom`, `cents`, `nearest`, `ad(m)`, `parse("Sol4")`, `isBlack`, `aralikAdi(n)`, `MAJOR`, `HECE`.
- `Snd` (audio.js): `unlock()`, `ready()` (bağlam ya da null), `running()`, `ctx`, `bus`, `note(f, {type,dur,gain,attack,release,when})`, `pluck(f, opts)`, `drone({type,freq,gain})` → `{setFreq, setGain, stop}`, `drum(kind, when)`, `scheduler({step, interval})`, `referans(notalar|midi, {dur, when, tur, unlu, olcmeyiSurdur})` → `{t0, sure, stop}` (kulaklık yoksa çalarken mikrofon ölçümü bekler), `own(x)` (slayt değişince durdurulur), `stopAll()`.
- `Ses` (ses.js, kaynak–filtre sentez): `canli(param)` → `{set(param), stop()}` canlı ses; `soyle(notalar, opts)` → `{t0, sure, olaylar, stop}`; `ezgi(sr, notalar, opts)` → `{data, olaylar, sure}` (saf); `uret(sr, sn, param)`; `kaynakSpektrum(oq, n)`; `filtreYaniti(formantlar, f)`; `hedefFormant(param)`; `SESSIZ`; `Formant` (tablo, `UNLULER`, `KAYNAK`, `sentez(tip, unlu)`); `BAS` (ezgi verisinin baştaki boşluğu, sn).
  - Parametreler: `f0, tip ("erkek"|"kadin"|"cocuk"), unlu ("a"…"ü"), formantlar, gurluk 0–1, vibHiz, vibGen (± sent), nefes 0–1, oq (açık faz oranı 0,3–0,9; düşük = sıkı/göğüs, yüksek = nefesli/falsetto), sf (şarkıcı formantı 0–1), karanlik (−1 parlak … +1 koyu/kapalı), acik (ağız açıklığı), f1 (doğrudan F1), nazal 0–1, jitter, glide`.
  - Ezgi notası: `{ m | f, d (sn), u (ünlü), c ("s", "nd": önündeki sessiz harfler), g (gürlük), vib: {hiz, gen, gecikme} | false, glide }` ya da `{ r: sn }` (sus).
- `Pitch` (saf): `yinSes(buf, sr)`, `Takipci()`, `izle(veri, sr)` → kareler. `Mic`: `start()`, `stop()`, `state`, `onFrame(fn)` → off, `onState(fn)`, `analyser` (spektrogram için), `stream`, `message(err)`. Kare: `{t (bağlam saati), sesli, midi, ham, ham0, f0, clarity, rms, db, bekle}`.
- `Analiz` (saf): `vibrato(kareler)` → `{hiz, genislik, merkez, duzen, var}`, `sabitlik(kareler, {hedef})` → `{ortSapma, titreme, kayma, gurlukStd, isabet, ortalamaSapma}`, `AralikOlcer()`, `kirilmalar(kareler)`, `histogram`, `tessitura`, `SssOlcer()`, `spektrum(x, sr)`, `formantTahmin(x, sr)`, `bantOrani`, `agirlikMerkezi`.
- `Egri(kap, {mod: "akis"|"sabit", pencere, sure, aralik:[lo,hi], tol, okuma, gecis, renkNota})`: `.dinle(fn)` (Mic'e bağlan) → off, `.basla(t0)`, `.push(kare)`, `.hedefler([{t0,t1,m,hece}])`, `.aralik(lo,hi)`, `.sure(s)`, `.mod(m)`, `.imlec(t)`, `.temizle()`, `.katmanEkle(noktalar, {ad, renk})`, `.katmanSil()`, `.oynat(kareler, baslangic)`, `.durum(metin, {buyuk})`, `.baslat()`, `.durdur()`, `.noktalar`, `.simdi`. `Egri.anahtar()` renk anahtarı. Eğri bir `div.sheet.egri-kap` içine konur.
- `Alistirma`: `MicSatiri({onAc, onKapa, kompakt})` → `{el}`; `Alistirma({egri, cumleler: () => [[{m,d,hece}]], tol (sayı ya da fn), tur, onBasla, onDur, onDurum, onSonuc(sonuc, i), onBitti, dinlet})` → `{baslat, durdur, toggle, calisiyor}`; `ornekSoyle(egri, notalar, {sapma, when, egriBasla})`; `onizleme(egri, notalar, {sapma})`; `puanla`; `sonucSozu(sonuc)`; `dogrulukKaydet(tur, oran)`.
- `Aralik`: `get()` → `{lo, hi, kaynak}`, `set(lo, hi, "olcum"|"elle")`, `perdele(göreliNotalar, {pay})` → başlangıç MIDI, `Serit({lo, hi, duzenle, isaret, bolgeler})` → `{el, ciz}`, `TURLER`, `ortusme()`, `gecmis()`. Olay: `aralikchange`.
- `Kayit`: `baslat({ad, hedefler, t0})` → `{durdur(): Promise<kayıt>}`, `oynat(kayit, egri)`, `indir(kayit)`, `kaliciKaydet(kayit, {olcum, etiket})`, `kalicilar(etiket)`, `noktalar(x)`, `Liste({egri})`, `GIZLILIK` (arayüzde gösterilecek metin).
- `Spektrogram(kap, {fmax, bant:[a,b], bantAd, formantlar, taban, tavan})`: `.canli(Mic.analyser)`, `.ciz(veri, sr)`, `.durdur()`, `.set(k, v)`. Varsayılan taban/tavan (−95/−25 dB) mikrofon içindir; `ciz()` ile durağan sentez için `taban: -66, tavan: -16` kullanın.
- `Mic.son`: son ölçüm karesi. `Snd.drone({..., filtre: false})`: alçak geçiren süzgeçsiz (çıplak kaynak sesi).
- `MicSatiri` `onKapa`'yı yalnızca açık mikrofon kapanınca çağırır.
- Türk müziği: `K` (koma.js: `PERDELER`, `perde(ad)`, `perdeKoma(k)`, `perdeFrekans(k, ahenk)`, `enYakinPerde(f, {ahenk})` → `{perde, komaSapma, centSapma}`, `AHENKLER`, `KOMA_CENT`), `MAKAMLAR` (`dizi` koma, `cumle`), `USULLER`, `Usul.cal(usul, {tempo, onAdim})`.
- `Ezgiler.notalar(id, {bas, tempo})` → `[{m, d, hece, u}]` (aralığa göre perdelenir). Kimlikler: nese, frere, yildiz, besli-inis, uclu, basamak, oktav, sabah, legato.

## Anlatım metinleri

- Slayt başına 20–40 saniye (≈ 280–520 karakter). Metni tekrar etmez, slaytın ana fikrini ve deneyde ne yapılacağını anlatır.
- Anlatıcı şarkı söylemez. Okunuş için yazımı uyarla: "pasajyo", "beltin", "falseto", "formant", "lip tril", "bel kanto", "apoccio", "tesitura", "vibrato". Kısaltma ve simge yok ("Hz" → "hertz", "%" → "yüzde", "±" → "artı eksi").

## Doğrulama (her yazar kendi slaytları için)

```
NODE_PATH=/Users/koraytoksoz/Projects/Games/PlayForge/node_modules BASE=http://localhost:8857 \
  node tools/shots.js <kendi-geçici-klasörün> slayt-id,slayt-id 1440x860,1180x820,390x844
```
- Ekran görüntülerini aç ve bak (Read aracıyla PNG). Konsolda hata/uyarı kalmasın; rehber hedefleri bulunsun.
- Mikrofonlu deneyleri sahte mikrofonla dene: Chromium bayrakları `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>` ve bağlam izni `permissions: ["microphone"]` (bkz. `tools/wav_uret.js`; WAV üretmek için `node tools/wav_uret.js <klasör>` ya da `Ses.ezgi` ile kendin üret). Sayfada `Mic.start()` ile başlatıp kareleri ya da arayüz sonucunu oku.
- Birim testleri: `node test/hepsi.js` (ortak dosyalara dokunmadığın için geçmeye devam etmeli).

## Bölümler arası paylaşılan kayıtlar (localStorage, `L.store`)

| Anahtar | Biçim | Yazan | Okuyan |
|---|---|---|---|
| `aralik` | `{lo, hi, kaynak, tarih}` (`Aralik.set` yazar) | 5. bölüm ölçer, ayarlar | hepsi |
| `aralikGecmis` | `[{tarih, lo, hi}]` (`Aralik.set` yazar) | — | 11. bölüm |
| `dogruluk` | `[{tarih, tur, oran}]` (`Alistirma.dogrulukKaydet`) | 4. bölüm, ısınma, makam | 11. bölüm |
| `sss` | `[{tarih, sure, duzen}]` | 2. bölüm "sss" | 11. bölüm |
| `uzunSes` | `[{tarih, ortSapma, titreme, gurlukStd, sure}]` | 2. bölüm uzun ses | 11. bölüm |
| `vibrato` | `[{tarih, hiz, genislik, duzen}]` | 8. bölüm ölçer | 11. bölüm |
| `kulakOyunu` | `{enIyi: {aralik, soyle}}` | 4. bölüm oyun | 11. bölüm |
| `isinma` | `[{tarih, dakika}]` | 3. bölüm rutin | 11. bölüm |
| `kayitlar` | (`Kayit.kaliciKaydet`) | 4., 10., 11. bölüm | 11. bölüm |
| `kirilma` | `[{tarih, sayi, enBuyuk}]` (passaggio alıştırması; sayi = kırılma sayısı, enBuyuk = yarım ses) | 6. bölüm | 11. bölüm |
| `detone` | eşik geçmişi (4. bölüm kulak testi) | 4. bölüm | 11. bölüm (isteğe bağlı) |
| `pratik` | tamamlanan günlük planlar | 11. bölüm | 11. bölüm |
| `kirilmaYeri` | MIDI (ölçülen ilk kırılma) | 6. bölüm passaggio | 6. bölüm |

Listeler en fazla ~200 öğe tutsun (`slice(-200)`).
