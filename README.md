# Mırıltıdan Ezgiye

**Canlı site: https://egitim.koraytoksoz.com/san/** (bütün eğitimler: https://egitim.koraytoksoz.com)

Şarkı söylemeyi hiç çalışmamış birine sesini tanımayı ve kullanmayı, her slaytta mikrofonla ya da mikrofonsuz yapılabilen bir deneyle öğreten Türkçe, etkileşimli bir şan eğitimi ve günlük çalışma aracı.

Hazırlayan: **Koray Toksöz**

*An interactive, Turkish-language singing course for complete beginners: how the voice works, breathing, warm-up and vocal health, singing in tune, range and voice types, registers and passaggio, resonance, vibrato, diction and styles including Turkish makam music. A live microphone pitch curve, a range meter, a vibrato meter and recording run entirely in the browser. Code: MIT · Content: CC BY 4.0.*

## İçerik

| Bölüm | Deneyler |
| --- | --- |
| Giriş | "aaa" deyince sesin perde eğrisi kapağa kalemle çizilir; başlığın harf genişliği gürlükle değişir |
| 1. Ses nasıl çıkar? | Dokunulan ses aygıtı kesiti; ağır çekim ses telleri ve glotis akımı; kaynak × filtre = ünlü; Türkçenin sekiz ünlüsü formant haritasında (mikrofonla kendi ünlünüz); şarkıcı formantı spektrogramda |
| 2. Nefes ve destek | Diyafram ve kaburgalar; uzun "sss" ölçer; destekli uzun ses (perde ve gürlük sabitliği); duruş |
| 3. Isınma ve ses sağlığı | Pipet (SOVT) basınç deneyi; 5/10/15 dakikalık ısınma rutini; ses sağlığı kartları |
| 4. Doğru perdede söylemek | Perde eşleme (dört seviye); "pes mi tiz mi?" kulak eşiği; aralıklar ve majör gam; kamu malı ezgiler ve kayıt; kulak oyunu |
| 5. Ses aralığı ve ses türleri | Ses aralığı ölçer (siren ya da gam); ses türlerinin tipik aralıklarıyla örtüşme; tessitura histogramı |
| 6. Ses bölgeleri ve passaggio | Göğüs, karışık, kafa sesi, falsetto; sirende kırılmanın bulunması; kırılmayı yumuşatma alıştırmaları; belting |
| 7. Rezonans ve tını | Ünlü düzeltme (F1 ve perde); açık–kapalı, parlak–koyu; burun sesi |
| 8. Vibrato ve süsleme | Vibrato ölçer (hız ve genişlik); düz ses ve vibrato; tril, apojiatura, çarpma, gırtlak, kaydırma, sürme |
| 9. Diksiyon | Türkçe ünlüler şarkıda; sessiz harfler ve legato; nefes yerleri |
| 10. Tarzlar | Bel canto vokalizi; pop ve mikrofon tekniği; 53 komalık akort aleti ve makam dizileri; usulle söylemek; uzun hava |
| 11. Pratik | 10/20/40 dakikalık günlük plan; kendini kaydet ve karşılaştır; ilerleme grafikleri; kapanış |

Ek olarak:
- **Tek perde eğrisi bileşeni:** zaman soldan sağa, perde dikey; arka planda piyano rulosu ya da porte. Hedef notalar fosforlu bantlar; sesiniz kalem çizgisi: renk hedefe yakınlık (tam üstünde yeşil, biraz pes çivit, biraz tiz turuncu), kalınlık gürlük, sessiz harf ve sessizlik boşluk. Kayıtlar aynı bileşende üst üste konur.
- **Ses aralığı şeridi:** ölçülen en pes ve en tiz rahat nota bütün sitede hatırlanır; alıştırmalar ona göre perdelenir.
- **Önce dinle, sonra söyle:** kulaklık yoksa referans çalarken ölçüm durur (mikrofon hoparlörü duymasın); kulaklık modunda birlikte söylenir. Sesli anlatım çalarken de ölçüm bekler.
- **Mikrofon:** yalnızca düğmeye basınca istenir; yankı giderme, gürültü bastırma ve otomatik kazanç kapalıdır. Ses yalnızca tarayıcıda işlenir, hiçbir yere gönderilmez; slayttan çıkınca ya da sekme gizlenince kapanır. HTTPS ya da localhost gerekir.
- **Kayıt:** ses yalnızca sekmenin belleğinde durur ve indirilebilir; kalıcı olarak (localStorage) yalnızca perde eğrisi ve ölçümler saklanır.
- **Sentez ses:** bütün şarkıcı sesleri tarayıcıda kaynak–filtre modeliyle üretilir; gerçek insan sesi kaydı yoktur (`audio/ornek/` ileride eklenecek kayıtlar için boş).
- **Sesli anlatım, hayalet el, tanım balonları, sunucu notları** ve her slaytta kaynaklar.

## Çalıştırma

Derleme adımı ve bağımlılık yok. `index.html` dosyasına çift tıklamak yeterli (`file://` ile de çalışır; mikrofon hariç). Mikrofonu denemek için yerel sunucu:

```sh
python3 tools/serve.py 8857   # önbelleksiz geliştirme sunucusu
# http://localhost:8857
```

## Kısayollar

| Tuş | İşlev |
| --- | --- |
| → / ← | İleri / geri |
| Boşluk | Slayttaki alıştırmayı (dinle → söyle) başlat / durdur |
| A | Sesli anlatımı aç/kapat (P: duraklat) |
| G | Deney gösterimlerini (hayalet el) aç/kapat |
| M | Sesi kapat/aç |
| N | Sunucu notları |
| T | Açıklama metnini gizle (sunum modu) |
| O | Tüm slaytlar |
| F | Tam ekran |

Her slaytın bağlantısı adres çubuğunda durur (ör. `#ses-araligi`). Alt çubukta mikrofon, kulaklık modu ve ayarlar (referans sesi: sentez ses, piyano ya da sinüs; nota adları; ses aralığı) var.

## Yapı

- **`index.html`:** İskelet ve alt çubuk; slaytlar `js/content/NN-*.js` dosyalarından eklenir.
- **`js/pitch.js`:** YIN perde algılama (insan sesi için: 70–1100 Hz, oktav denetimi), perde takipçisi (ses var/yok kararı, medyan, hafif yumuşatma), mikrofon (AudioWorklet; yoksa AnalyserNode).
- **`js/analiz.js`:** Vibrato, sabitlik, ses aralığı, kırılma, tessitura, "sss" ölçerleri; FFT, LPC ile formant tahmini.
- **`js/ses.js`:** Kaynak–filtre sentezi (Rosenberg glotis darbesi, beş formant rezonatörü, vibrato, nefes, şarkıcı formantı, burun rezonansı, sessiz harfler). Saf hesap kısmı Node'da da çalışır.
- **`js/egri.js`:** Sitenin tek perde eğrisi bileşeni. **`js/spektrogram.js`:** sonagraf tarzı spektrogram.
- **`js/alistirma.js`, `js/aralik.js`, `js/kayit.js`:** Dinle → söyle alıştırmaları, ses aralığı şeridi, kayıt.
- **`js/koma.js`, `js/usul.js`, `js/data/makamlar.js`, `js/data/usuller.js`:** 53 komalık perde hesabı, makam ve usul verisi (klarnet eğitiminden).
- **`js/data/formantlar.js`, `js/data/ezgiler.js`, `js/notalar.js`:** Türkçe ünlülerin formantları, ezgiler ve egzersizler, nota ↔ frekans.
- **`js/audio.js`, `js/lib.js`, `js/app.js`, `js/panels.js`, `js/narrator.js`, `js/guide.js`, `js/glossary.js`:** Ses motoru, yardımcılar, slayt motoru, alt çubuk panelleri, sesli anlatım, hayalet el, tanım balonları.
- **`js/demos/NN-*.js`, `css/d/NN-*.css`:** Bölüm bölüm deneyler ve stiller.
- **`audio/<slayt-id>.mp3`:** Anlatım sesleri; metinler `tools/narration.json`.
- **`docs/`:** `kontrol-listesi.md` (şan eğitmeninin gözden geçireceği maddeler), `arastirma.md` (kaynak notları), `GELISTIRME.md` (geliştirici kılavuzu). `PLAN.md` ilk plan.

## Yeniden üretme ve testler

**Anlatım sesleri** ElevenLabs ile üretilir: ses "İrem" (`voice_id` `hy7OAv1nH3Eqqj96Aude`), model `eleven_multilingual_v2`, dil `tr`. Metinler `tools/narration.json` (bölüm taslakları `tools/narration-parts/`, birleştirme `node tools/narration_merge.js`).

```sh
node test/hepsi.js   # YIN (sinüs ve sentezli ünlüler ±3 sent, oktav hatası, sessizlik ve gürültü),
                     # vibrato, sabitlik, aralık, kırılma, nota ↔ frekans ↔ sent, 53 koma (klarnet eğitimiyle aynı),
                     # formant tablosu (kaynakla ve sentezle tutarlılık)

# Tarayıcı araçları playwright-core ister (depoda yok):
npm i --prefix /tmp/pw playwright-core
export NODE_PATH=/tmp/pw/node_modules
python3 tools/serve.py 8857 &
BASE=http://localhost:8857 node tools/shots.js /tmp/shots   # 3 boyutta ekran görüntüsü, konsol hataları, hayalet el hedefleri
node tools/mic_check.js 8857 /tmp/wav                       # sahte mikrofon girişiyle (sentezlenmiş WAV) perde eğrisi,
                                                            # vibrato ölçer, aralık ölçer ve perde eşleme
node tools/wav_uret.js /tmp/wav                             # test sesleri: ünlüler, vibrato, siren, sessiz harfli ezgi
```

## Yayınlama

```sh
tools/deploy.sh            # varsayılan koray@koraytoksoz.com → ~/egitim.koraytoksoz.com/san/
```

Betik `index.html` içindeki `?v=` sürüm etiketini yeniler ve `rsync` ile yalnızca değişen dosyaları gönderir (`tools/`, `test/`, `docs/` ve belgeler gönderilmez, `--delete` kullanılmaz). `.htaccess` HTTPS yönlendirmesini (mikrofon için gerekli), sıkıştırmayı, önbellek ayarlarını ve `Permissions-Policy: microphone=(self)` başlığını içerir.

## Kaynaklar ve ileri okuma

### Sitedeki bilgilerin dayandığı kaynaklar

Ayrıntılı notlar ve güven etiketleri `docs/arastirma.md` dosyasında; her slaytın sunucu notlarında kullandığı künyeler var.

**Kitaplar**
- J. Sundberg, *The Science of the Singing Voice*, Northern Illinois University Press (1987). ISBN 0-87580-120-X.
- I. R. Titze, *Principles of Voice Production*, Prentice Hall (1994); 2. baskı NCVS (2000). ISBN 0-87414-122-2.
- R. Miller, *The Structure of Singing: System and Art in Vocal Technique*, Schirmer (1986). ISBN 0-02-872660-X.

**Ses bilimi**
- J. Sundberg, "Articulatory interpretation of the 'singing formant'", *JASA* 55(4), 1974, 838–844. doi:10.1121/1.1914609
- J. Sundberg, "Level and center frequency of the singer's formant", *Journal of Voice* 15(2), 2001, 176–186. doi:10.1016/S0892-1997(01)00019-4
- E. Prame, "Measurements of the vibrato rate of ten singers", *JASA* 96(4), 1994, 1979–1984. doi:10.1121/1.410141
- N. Henrich, "Mirroring the voice from Garcia to the present day: some insights into singing voice registers", *Logopedics Phoniatrics Vocology* 31(1), 2006, 3–14. doi:10.1080/14015430500344844
- E. Joliveau, J. Smith, J. Wolfe, "Tuning of vocal tract resonance by sopranos", *Nature* 427(6970), 2004, 116. doi:10.1038/427116a
- C. D. Bourne ve M. Garnier, "Physiological and acoustic characteristics of the female music theater voice", *JASA* 131(2), 2012, 1586–1594. doi:10.1121/1.3675010
- P. J. Watson ve T. J. Hixon, "Respiratory kinematics in classical (opera) singers", *J Speech Hear Res* 28(1), 1985, 104–122. doi:10.1044/jshr.2801.104
- R. Leanderson, J. Sundberg, C. von Euler, "Role of diaphragmatic activity during singing", *J Appl Physiol* 62(1), 1987, 259–270. doi:10.1152/jappl.1987.62.1.259
- I. R. Titze, "Voice training and therapy with a semi-occluded vocal tract", *JSLHR* 49(2), 2006, 448–459. doi:10.1044/1092-4388(2006/035)
- E. Malkoç, "Türkçe ünlülerin akustik özellikleri", *Dil Dergisi* 146, 2009, 71–85 (Türkçe ünlülerin formantları).

**Perde, kulak ve amüzi**
- I. Peretz ve D. T. Vuvan, "Prevalence of congenital amusia", *European Journal of Human Genetics* 25(5), 2017, 625–630. doi:10.1038/ejhg.2017.15
- P. Q. Pfordresher ve S. Brown, "Poor-pitch singing in the absence of 'tone deafness'", *Music Perception* 25(2), 2007, 95–115. doi:10.1525/mp.2007.25.2.95
- H. Levitt, "Transformed up-down methods in psychoacoustics", *JASA* 49(2B), 1971, 467–477.

**Ses sağlığı**
- R. J. Stachler ve ark., "Clinical practice guideline: hoarseness (dysphonia) (update)", *Otolaryngology–Head and Neck Surgery* 158(1_suppl), 2018, S1–S42. doi:10.1177/0194599817751030
- A. D. Rubin ve ark., "Laryngeal hyperfunction during whispering: reality or myth?", *Journal of Voice* 20(1), 2006, 121–127. doi:10.1016/j.jvoice.2004.10.007
- M. Alves ve ark., "The effect of hydration on voice quality in adults: a systematic review", *Journal of Voice* 33(1), 2019, 125.e13–125.e28. doi:10.1016/j.jvoice.2017.10.001

**Sinyal işleme ve sentez**
- A. de Cheveigné ve H. Kawahara, "YIN, a fundamental frequency estimator for speech and music", *JASA* 111(4), 2002, 1917–1930. doi:10.1121/1.1458024
- A. E. Rosenberg, "Effect of glottal pulse shape on the quality of natural vowels", *JASA* 49(2B), 1971, 583–590. doi:10.1121/1.1912389
- D. H. Klatt, "Software for a cascade/parallel formant synthesizer", *JASA* 67(3), 1980, 971–995.

**Türk müziği:** perde, makam ve usul kaynakları klarnet eğitiminin (Nefesten Taksime) `js/klarnet.js`, `js/data/makamlar.js` ve `js/data/usuller.js` dosyalarında: TDV İslâm Ansiklopedisi makam ve usul maddeleri, Arel–Ezgi–Uzdilek sistemi.

### Konuyu derinleştirmek için

- **J. Sundberg, *The Science of the Singing Voice*:** ses biliminin şarkıcılar için klasik giriş kitabı.
- **R. Miller, *The Structure of Singing*:** İtalyan okulunun (appoggio, passaggio) sistemli anlatımı.
- **[NCVS, National Center for Voice and Speech](https://ncvs.org):** Titze'nin ses üretimi eğitimleri.
- **Concone, *50 Lessons* Op. 9 ve Vaccai, *Metodo pratico di canto* (1832):** kamu malı klasik şan etütleri.
- **Müzik teorisi:** [Titreşimden Şarkıya](https://egitim.koraytoksoz.com/muzik/) (harmonik dizisi, aralıklar, makamlar) ve [Nefesten Taksime](https://egitim.koraytoksoz.com/klarnet/) (koma, makam, usul).

## Lisans

| Bölüm | Lisans |
| --- | --- |
| Kod (`js/`, `css/`, `tools/`, `test/`, `index.html`) | MIT |
| İçerik (slayt metinleri, notlar, sözlük, egzersizler, anlatım metinleri ve sesleri, kontrol listesi) | CC BY 4.0 |
| Türkçe ünlü formantları | Malkoç (2009) ölçüm ortalamaları, kaynak gösterilerek |
| Yazı tipleri (Anybody, Atkinson Hyperlegible Next ve Mono) | SIL OFL 1.1 (Google Fonts'tan yüklenir) |
| Kamu malı ezgiler | Neşeye Övgü (Beethoven, 1824), Frère Jacques, Ah! vous dirai-je, maman (1761) |

Anlatım sesleri ElevenLabs ücretli abonelikle "İrem" sesiyle üretilmiştir; CC BY 4.0 kapsamında paylaşılır, bir kişiyi taklit etmek ya da yanıltıcı amaçla kullanılamaz. Ayrıntılar `LICENSE` dosyasında. GitHub bu dosyayı "Other" olarak gösterir; çift lisans tek bir standart lisansa uymaz.

Önerilen atıf: *Koray Toksöz, Mırıltıdan Ezgiye, https://egitim.koraytoksoz.com/san/*

Bu site bir şan eğitmeninin yerini tutmaz.
