# Araştırma notları: şan ve ses bilimi kursu için doğrulanmış kaynaklar

Hazırlanma tarihi: 2026-10-21. Her maddede bir güven etiketi var:

- **[DOĞRULANDI]**: değer veya iddia birincil kaynağın metninden ya da resmi özetinden (PubMed/yayıncı) okundu.
- **[İKİNCİL]**: bir ikincil kaynaktan (Wikipedia, inceleme makalesi, veri tabanı, başka bir makalenin aktarımı) alındı. Birincil metin okunamadı.
- **[BELİRSİZ]**: doğrulanamadı ya da kaynaklar çelişiyor. Kullanmadan önce kontrol edin.

Künyelerin (yazar, yıl, başlık, dergi, cilt, sayfa, DOI) hepsi Crossref API ile kontrol edildi. Aksi yazıyorsa durum belirtilmiştir.

---

## 1. Türkçe ünlülerin formant frekansları

### 1a. Ana kaynak: Malkoç (2009), yetişkin erkek ve kadın, F0–F4 **[DOĞRULANDI]**

**Künye:** Malkoç, E. (2009). Türkçe ünlü formant frekans değerleri ve bu değerlere dayalı ünlü dörtgeni. *Dil Dergisi*, Sayı 146 (Ekim-Kasım-Aralık 2009), s. 71–85. PDF: https://dergipark.org.tr/tr/download/article-file/780177

- **Yöntem:** 10 erkek ve 10 kadın ölçünlü Türkçe konuşucusu, metinden okuma. Ünlüler CV/VC seslemlerinden alındı, konuşucu başına her ünlüden 5 örnek ölçüldü. Ölçüm ünlünün orta bölgesinden Praat ile yapıldı.
- **Değerler:** Aşağıdaki değerler makalenin Tablo 1'indeki ortalamalardır (Hz). PDF metni çıkarılıp okundu.
- **Not 1:** Makale künyesi 2009 sayısında, ama metin içindeki karşılaştırma tablolarında kendi çalışmasını "Malkoç (2011)" diye anıyor. Atıfta dergi sayısını (2009, sayı 146) kullanın.
- **Not 2:** Şekil 1'deki erkek tablosunda yazım hatası var. "[ı] 306 2109" yazan satır aslında [i]'ye ait. Tablo 1'deki değerler doğrudur.

| Ünlü | Kadın F0 | Kadın F1 | Kadın F2 | Kadın F3 | Kadın F4 | Erkek F0 | Erkek F1 | Erkek F2 | Erkek F3 | Erkek F4 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | 236 | 771 | 1338 | 2998 | 4168 | 130 | 642 | 1128 | 2714 | 3707 |
| e | 231 | 578 | 2205 | 2961 | 4128 | 127 | 470 | 1866 | 2563 | 3715 |
| ı | 233 | 492 | 1629 | 2976 | 4232 | 128 | 396 | 1500 | 2479 | 3782 |
| i | 245 | 430 | 2591 | 3325 | 4308 | 138 | 306 | 2111 | 2897 | 3751 |
| o | 243 | 564 | 959 | 2976 | 3794 | 130 | 483 | 860 | 2733 | 3668 |
| ö | 212 | 543 | 1636 | 2764 | 3947 | 124 | 469 | 1510 | 2439 | 3554 |
| u | 247 | 452 | 961 | 2940 | 3825 | 141 | 379 | 980 | 2490 | 3558 |
| ü | 234 | 424 | 1938 | 2742 | 3694 | 139 | 333 | 1769 | 2337 | 3342 |

Standart sapmalar da makalede var. Örneğin erkek F1 için 41–62 Hz, kadın F2 için 95–269 Hz. Erkek [ı] satırında "Minimum" değerleri ortalamayla aynı yazılmış; bu muhtemelen bir dizgi hatası.

**Koda yapıştırılabilir hali (Malkoç 2009, Tablo 1, Hz):**

```js
// Malkoç E. (2009) Dil Dergisi 146:71-85, Tablo 1 ortalamaları
// [F1, F2, F3, F4]
const TR_FORMANTS = {
  male: {
    a: [642, 1128, 2714, 3707], e: [470, 1866, 2563, 3715],
    ı: [396, 1500, 2479, 3782], i: [306, 2111, 2897, 3751],
    o: [483,  860, 2733, 3668], ö: [469, 1510, 2439, 3554],
    u: [379,  980, 2490, 3558], ü: [333, 1769, 2337, 3342],
  },
  female: {
    a: [771, 1338, 2998, 4168], e: [578, 2205, 2961, 4128],
    ı: [492, 1629, 2976, 4232], i: [430, 2591, 3325, 4308],
    o: [564,  959, 2976, 3794], ö: [543, 1636, 2764, 3947],
    u: [452,  961, 2940, 3825], ü: [424, 1938, 2742, 3694],
  },
  // child: TAHMİN, aşağıdaki 1c bölümüne bakın (ölçülmüş Türkçe veri değil)
  child_estimated: {
    a: [830, 1480, 3270], e: [620, 2440, 3230],
    ı: [530, 1800, 3250], i: [460, 2860, 3630],
    o: [600, 1060, 3250], ö: [580, 1810, 3020],
    u: [480, 1060, 3210], ü: [450, 2140, 2990],
  },
};
```

### 1b. Karşılaştırma için diğer Türkçe çalışmalar

Bu değerlerin hepsi Malkoç (2009) Tablo 2 ve 3'ten aktarılmıştır **[İKİNCİL]**.

**Erkek (F1/F2/F3, Hz):**

| Ünlü | Kılıç (2000) | Türk ve ark. (2004) | Davutoğlu (2010) |
|---|---|---|---|
| a | 664/1081/2577 | 596/1382/2690 | 615/1274 |
| e | 526/1772/2525 | 486/1834/2614 | 519/1759 |
| ı | 355/1482/2405 | 537/1578/2722 | 392/1557 |
| i | 278/2275/2570 | 347/2079/2879 | 340/2000 |
| o | 432/811/2587 | 468/1065/2695 | 498/1038 |
| ö | 427/1548/2346 | 527/1526/2558 | 462/1419 |
| u | 295/786/2226 | 323/955/2420 | 385/1037 |
| ü | 279/1715/2288 | 372/1633/2369 | 345/1540 |

**Kadın (F1/F2/F3, Hz):**

| Ünlü | Türk ve ark. (2004) | Davutoğlu (2010) |
|---|---|---|
| a | 698/1464/2743 | 665/1405 |
| e | 508/1476/2654 | 547/2048 |
| ı | 839/1798/2846 | 439/1766 |
| i | 511/1990/2980 | 398/2347 |
| o | 585/1110/2443 | 526/1063 |
| ö | 506/1222/2218 | 500/1663 |
| u | 546/1292/2513 | 433/1107 |
| ü | 433/1729/2541 | 416/1812 |

Türk ve ark. kadın değerlerinde [ı] F1 = 839 ve [e] F2 = 1476 gibi tutarsız görünen değerler var. Bunlar aktarım ya da orijinal hata olabilir, bu sütunu kullanmayın.

**Kaynakların künyeleri (Malkoç'un kaynakçasından):**

- Kılıç, M. A. (2000). Türkiye Türkçesindeki ünlülerin sesbilgisel özellikleri. 10. Uluslararası Türk Dilbilim Kurultayı (ICTL), 16–18 Ağustos 2000, İstanbul. 5 erkek konuşucu, yalın ünlüler.
- Türk, O., Şaylı, Ö., Özsoy, A. S., Arslan, L. M. (2004). Türkçede ünlülerin formant incelemesi. 18. Dilbilim Kurultayı, 20–21 Mayıs 2004, Ankara. Malkoç'a göre örneklem 14 kadın, 15 erkek ve 23 çocuktan (15 erkek, 8 kız) oluşuyor. **Bu çalışmanın çocuk verisi var, ancak tam metnine ulaşamadım** (ResearchGate 403 verdi). Başlık bazı kaynaklarda "Türkçe'de Ünlülerin Formant Analizi", yılı bazılarında 2003 olarak geçiyor **[BELİRSİZ]**.
- Davutoğlu, A. Y. (2010). Standart Türkçedeki ünlülerin akustik analizi ve fonetik altyapı. Yayımlanmamış doktora tezi, İstanbul.

**Diğer ilgili kaynaklar:**

- Kılıç, M. A., Öğüt, F. (2004). A high unrounded vowel in Turkish: is it a central or back vowel? *Speech Communication*, 43(1–2), 143–154. doi:10.1016/j.specom.2004.03.001. Künye Crossref'te doğrulandı **[DOĞRULANDI: künye]**, içerik okunmadı. Konusu /ı/'nın merkezî mi art mı olduğu. Malkoç (2009) da kendi verisine dayanarak /ı/'yı "orta dil ünlüsü" olarak yorumluyor (Selen 1979'u destekleyerek).
- Önen, C., Aydınlı, F. E., Kemaloğlu, Y. K. (2026; çevrimiçi 22.08.2025). Acoustic characteristics of Contemporary Türkiye Turkish vowels produced by Turkish adult females. *Folia Phoniatrica et Logopaedica*, 78(4), 328–339. doi:10.1159/000548102. 51 kadın konuşucu, 18–45 yaş, F1–F5. Sayısal tablolar ücretli erişimde, okunamadı. Özete göre F1 en yüksek /a/, en düşük /i/; F2 en yüksek /i/, en düşük /u/ **[DOĞRULANDI: özet]**. Kadın verisi için en güncel ve en büyük örneklemli kaynak bu; tam metin edinilirse tercih edilmeli.

### 1c. Çocuk verisi

- **Ölçülmüş Türkçe çocuk formantları:** Türk ve ark. (2004) dışında bir kaynak bulamadım, onun da tam metnine ulaşamadım. Kılıç'ın erkek çocuklar için tablo verdiği bir çalışmadan arama sonuçlarında söz ediliyor ama künyesini doğrulayamadım **[BELİRSİZ]**.
- **Yedek kaynak, Hillenbrand ve ark. (1995) [DOĞRULANDI: künye; değerler veri setinden hesaplandı]:** Hillenbrand, J., Getty, L. A., Clark, M. J., Wheeler, K. (1995). Acoustic characteristics of American English vowels. *JASA*, 97(5), 3099–3111. doi:10.1121/1.411872.
  - Örneklem 45 erkek, 48 kadın, 46 çocuk (10–12 yaş), hVd hecelerinde.
  - Aşağıdaki çocuk ortalamaları CRAN'daki `phonTools` R paketinin `h95` veri setinden benim hesapladığım değerlerdir (oğlan ve kız birleşik).
  - Bu veri setinde eksik F2/F3 değerlerinin bir kısmı doldurulmuş (imputed). Bu yüzden makalenin yayımlanmış tablosundan birkaç Hz sapabilir.
- **İkinci yedek, Peterson ve Barney (1952):** Peterson, G. E., Barney, H. L. (1952). Control methods used in a study of the vowels. *JASA*, 24(2), 175–184. doi:10.1121/1.1906875. Değerler yine `phonTools::pb52` veri setinden hesaplandı.

**Eşleme ve çocuk ortalamaları (F0/F1/F2/F3, Hz):**

| Türkçe | En yakın İngilizce ünlü (kelime) | Hillenbrand 1995 çocuk | Peterson & Barney 1952 çocuk |
|---|---|---|---|
| a | /ɑ/ (hod) | 231/992/1685/2937 | 258/1030/1383/3188 |
| e | /ɛ/ (head) | 230/740/2279/3297 | 259/700/2616/3564 |
| i | /i/ (heed) | 246/452/3082/3686 | 270/360/3178/3763 |
| o | /o/ (hoed; İngilizcede çift ünlümsü) ya da /ɔ/ (hawed) | /o/: 238/599/1140/3006; /ɔ/: 232/836/1304/2953 | /ɔ/: 259/694/1064/3263 |
| u | /u/ (who'd; Amerikan /u/ öne kaymış, F2 yüksek) | 247/493/1401/2985 | 278/432/1193/3250 |
| ı, ö, ü | İngilizcede karşılığı yok | – | – |

/ʊ/ (hood) ve /ʌ/ (hud) ı'ya kabaca yaklaştırılabilir ama bu fonetik olarak zayıf bir eşleme.

**Önerilen tahmin yöntemi [TAHMİN, kaynak değil]:** Türkçe çocuk değerleri için Malkoç'un kadın değerlerini, Hillenbrand'daki çocuk/kadın oranlarıyla ölçekledim. Oranlar 5 ortak ünlünün medyanıdır: F1 ×1.07, F2 ×1.11, F3 ×1.09. Sonuçlar yukarıdaki `child_estimated` nesnesinde. Kursta "yaklaşık / tahmini" diye etiketleyin.

---

## 2. Şarkıcı formantı (singer's formant)

- **Frekans bölgesi ve kaynağı [DOĞRULANDI: özet]:** Klasik opera şarkıcılarının sesli seslerinde "3 kHz civarında belirgin bir spektrum zarfı tepesi"dir. Esas olarak F3, F4 ve F5'in kümelenmesinden doğan bir rezonans olgusudur. Merkez frekansı, ses türünün perde aralığı yükseldikçe hafifçe artar.
  - Kaynak: Sundberg, J. (2001). Level and center frequency of the singer's formant. *Journal of Voice*, 15(2), 176–186. doi:10.1016/S0892-1997(01)00019-4 (PubMed 11411472).
- **Pratikte kullanılan aralık:** Erkek seslerde yaklaşık 2.4–3.2 kHz, kadınlarda daha yüksek ve daha az belirgin. Bu, yaygın ders kitabı bilgisi **[İKİNCİL]**. Kesin aralık için Sundberg (2001) tam metnine bakılmalı.
- **Klasik makale [DOĞRULANDI: künye]:** Sundberg, J. (1974). Articulatory interpretation of the "singing formant". *JASA*, 55(4), 838–844. doi:10.1121/1.1914609.
  - Özet ücretli erişimde, okunamadı. İçerdiği bilinen iddia **[İKİNCİL]**: gırtlak tüpü (epilaryngeal tube) ağzının kesit alanı, üstteki yutak kesitinin yaklaşık 1/6'sından küçük olduğunda gırtlak tüpü kendi rezonansını verir. Bu, F3–F5'i bir araya toplar. Gırtlağın alçaltılması da etkiye katkıda bulunur.
- **Müzikal tiyatro şarkıcılarında şarkıcı formantı yoktur** (Sundberg & Romedahl 2009 girişi) **[DOĞRULANDI: özet]**. Kaynak: Sundberg, J., Romedahl, C. (2009). Text intelligibility and the singer's formant—a relationship? *J Voice*, 23(5), 539–545. doi:10.1016/j.jvoice.2008.01.010. Bulgu: anlaşılırlık müzikal tiyatro şarkıcılarında biraz daha yüksek çıkmış.
- **Kitap:** bkz. madde 16.

---

## 3. Vibrato

**Klasik şarkıcılarda hız:**

- Prame (1994) ölçümü: 10 ünlü şarkıcının uzun tutulan notalarında vibrato hızı yaklaşık 5.5 Hz (Pavarotti) ile 6.7 Hz (Marian Anderson) arasında. Kaynak, Prame'in bir meslektaşının 1999 tarihli liste mesajı **[İKİNCİL]**. Makale künyesi: Prame, E. (1994). Measurements of the vibrato rate of ten singers. *JASA*, 96(4), 1979–1984. doi:10.1121/1.410141 **[DOĞRULANDI: künye]**.
- "Klasik eğitimli şarkıcılarda F0 modülasyon hızı 5–7 Hz, genişliği %6–8" **[İKİNCİL, verbatim]**. Kaynak: Lester-Smith, R. A., Derrick, E., Larson, C. R. (2024). Characterization of source-filter interactions in vocal vibrato using a neck-surface vibration sensor: a pilot study. *J Voice*, 38(1), 1–9. doi:10.1016/j.jvoice.2021.08.004 (PMC8995401). Makale bu cümle için Prame 1994, Ramig & Shipp 1987, Seidner 1995, Shipp ve ark. 1980 ve Sundberg 1995'e atıf yapıyor. Aynı cümle yoğunluk modülasyonunu 5–10 Hz, %23–38 olarak veriyor.
- Ramig & Shipp (1987): vibratoda ortalama 5.5 Hz (vokal tremorda 6.8 Hz) **[İKİNCİL]**.
- Mitchell & Kenny (2010): eğitim sürecinde vibrato genişliği (VE) arttı, hız "klasik şarkıcılar için beklenen sınırlar içinde" kaldı **[DOĞRULANDI: özet]**. Künye: Mitchell, H. F., Kenny, D. T. (2010). Change in vibrato rate and extent during tertiary training in classical singing students. *J Voice*, 24(4), 427–434. doi:10.1016/j.jvoice.2008.12.003.

**Klasik şarkıcılarda genişlik (extent):**

- Tepe-ortalama yaklaşık ±50–100 cent. %6–8'lik F0 modülasyonu yaklaşık ±100–130 cent eder, ama "%"nin tepe-tepe mi tepe-ortalama mı olduğu kaynakta net değil **[BELİRSİZ]**.
- Prame (1994) için aktarılan "tipik olarak ±60 cent" değeri yine yalnızca liste mesajından **[İKİNCİL]**.
- Prame, E. (1997). Vibrato extent and intonation in professional Western lyric singing. *JASA*, 102(1), 616–621. doi:10.1121/1.419735 **[DOĞRULANDI: künye]**. Sayısal değerleri okunamadı (özet ücretli erişimde). Bu çalışmadan bir genişlik değeri aktarmadan önce makaleyi edinin **[BELİRSİZ]**.
- Sundberg, J. (1994). Acoustic and psychoacoustic aspects of vocal vibrato. KTH STL-QPSR 35(2–3), 45–68. Ayrıca Dejonckere, Hirano & Sundberg (Ed.), *Vibrato*, Singular, 1995, s. 35–62. KTH sunucusu 500 hatası verdiği için okunamadı **[BELİRSİZ]**.

**Kod için önerilen varsayılan:** hız 5.5–6.5 Hz (merkez 6 Hz), genişlik ±50–80 cent. Kabul edilebilir aralık hız 4.5–7.5 Hz, genişlik ±30–150 cent. Bu bir mühendislik tercihidir, kaynak değildir.

**Pop ve erken müzik:** Pop/CCM ve erken müzik (Barok) icrasında düz ton (straight tone) yaygın, vibrato daha dar veya geç başlatılır. Bu konuda sayısal birincil kaynak doğrulayamadım **[BELİRSİZ]**. Kursta stil farkı olarak söyleyin, sayı vermeyin.

---

## 4. Solunum, diyafram, "diyaframdan söyle", appoggio

- **Watson & Hixon (1985) [DOĞRULANDI: özet, UMN Experts sayfası]:** 6 klasik eğitimli erkek bariton incelenmiş. Bulgular:
  - Karın, diyafram ve göğüs kafesini performans için en uygun konuma "ayarlayan" bir duruş (posturing) öğesidir.
  - Göğüs kafesi soluk verme dürtüsünü düzenleyen basınç-akış üreticisidir.
  - Diyafram esas olarak akciğerleri yeniden dolduran bir soluk alma öğesidir.
  - Şarkıcıların kendi solunumlarını nasıl tarif ettikleri ile gerçekte nasıl soludukları arasında çok az örtüşme vardır.
  - Künye: Watson, P. J., Hixon, T. J. (1985). Respiratory kinematics in classical (opera) singers. *Journal of Speech and Hearing Research*, 28(1), 104–122. doi:10.1044/jshr.2801.104.
- **Önemli nüans, Leanderson, Sundberg & von Euler (1987) [DOĞRULANDI: özet]:** 4 profesyonel erkek şarkıcının hepsinde diyaframın tutarlı kullanımı görülmüş. Diyafram özellikle cümle başında, pasif geri yaylanma basıncı istenen subglottik basınçtan yüksekken fren olarak devreye giriyor. Bunun örnekleri: inen oktav, yüksekten yumuşağa geçiş, /p/ patlaması. Bir denekte cümle boyunca diyafram tonusu vardı.
  - Künye: Leanderson, R., Sundberg, J., von Euler, C. (1987). Role of diaphragmatic activity during singing: a study of transdiaphragmatic pressures. *Journal of Applied Physiology*, 62(1), 259–270. doi:10.1152/jappl.1987.62.1.259.
  - **Sonuç:** "Diyafram soluk verirken tamamen pasiftir" demek fazla kesin olur. Doğru ifade şudur: diyafram soluk almanın ana kasıdır. Soluk verirken kasılarak itme yapmaz, ama özellikle yüksek akciğer hacminde soluk vermeyi frenleyecek şekilde aktif kalabilir.
- **Salomoni, van den Hoorn & Hodges (2016) [DOĞRULANDI]:** Klasik şarkıcılarda akciğer hacmi değişiminin %35'i karından gelirken eğitimsizlerde bu oran %14. Şarkıcılar fonasyondan önce karın duvarını tutarlı biçimde içe alıyor.
  - Künye: Salomoni, S., van den Hoorn, W., Hodges, P. (2016). Breathing and singing: objective characterization of breathing patterns in classical singers. *PLoS One*, 11(5), e0155084. doi:10.1371/journal.pone.0155084.
- **"Diyaframdan söyle" ifadesi:**
  - Yanlış olan: diyafram doğrudan "havayı itmez". Diyafram his yoluyla algılanamaz ve istemli olarak tek başına kontrol edilemez (bu son kısım ders kitabı bilgisi **[İKİNCİL]**).
  - Doğru olan: ifadenin kastettiği şey, karın ve göğüs kafesi kaslarıyla dengeli ve sürekli bir subglottik basınç sağlamak ve soluk vermeyi kontrollü yapmaktır. Bu yorum yukarıdaki iki çalışmayla tutarlı.
- **Appoggio (Miller) [İKİNCİL]:** Miller, *The Structure of Singing* (1986) kitabında appoggio'yu şöyle tanımlar: göğüs kemiği yüksek ve kaburgalar açık tutulur, soluk alma kaslarının (diyafram, dış kaburgalar arası kaslar) soluk vermeye karşı direnci korunur, böylece soluk verme yavaşlatılır ("lutta vocale", soluk alma ile soluk verme kasları arasındaki denge). Kitabı doğrudan okuyamadım. Sayfa numarası için kitaba bakın (ilgili bölüm 2. bölüm, "The Breath Management").

---

## 5. SOVT (yarı kapalı ses yolu) ve ısınmanın etkinliği

- **Titze (2006) [DOĞRULANDI: özet]:**
  - Künye: Titze, I. R. (2006). Voice training and therapy with a semi-occluded vocal tract: rationale and scientific underpinnings. *Journal of Speech, Language, and Hearing Research*, 49(2), 448–459. doi:10.1044/1092-4388(2006/035).
  - Yöntem bilgisayar simülasyonu: kendiliğinden salınan ses teli modeli ve 44 kesitli ses yolu.
  - Dudakta yarı kapanma ortalama supraglottik ve intraglottik basıncı yükselterek kaynak-ses yolu etkileşimini artırır. Ses teli addüksiyonu ve epilarenks daralmasıyla empedans eşleşmesi sesi daha verimli ve çarpışma açısından daha ekonomik yapabilir.
  - Kapsadığı egzersizler: dudak titretme, dil titretme, bilabial frikatifler, mırıldanma, tüp veya pipetle fonasyon.
- **Disfoni tedavisinde kanıt zayıf [DOĞRULANDI: özet]:**
  - Künye: Pozzali, I. ve ark. (2024). Effectiveness of SOVTEs in patients with dysphonia: a systematic review and meta-analysis. *J Voice*, 38(1), 245.e17–245.e35. doi:10.1016/j.jvoice.2021.06.009.
  - 8 çalışma incelenmiş, kanıt kalitesi her analizde "çok düşük".
  - SOVTE'ler diğer tedavilerden anlamlı olarak üstün değil, ama lehine bir eğilim var. Subglottik basıncı düşürmede etkili bulunmuşlar.
- **Isınmanın etkinliği karışık:**
  - Motel, Fisher & Leydon (2003) **[DOĞRULANDI: özet]**: 10 sopranoda ısınma, yüksek perdede fonasyon eşik basıncını *artırdı*, rahat ve düşük perdede fark yoktu. Künye: *J Voice*, 17(2), 160–167. doi:10.1016/s0892-1997(03)00003-1.
  - Saldías ve ark. (2020) **[DOĞRULANDI: özet]**: 22 CCM şarkıcısında su direnci ısınması ile açık ses yolu ısınması karşılaştırıldı. Fizyolojik etkiler farklı, öz algı benzer çıktı. Yazarlar ısınmanın plasebo etkisi yaratabileceğini söylüyor. Künye: *Folia Phoniatr Logop*, 72(1), 1–12. doi:10.1159/000494722.
  - Hoch & Sandage (2018) **[DOĞRULANDI: özet]**: Şan pedagojisi metinleri ısınmanın beceri kazanma yönüne odaklanıyor, yorgunluk yönetimi ihmal ediliyor. Künye: *J Voice*, 32(1), 79–84. doi:10.1016/j.jvoice.2017.03.018.
  - Ribeiro ve ark. (2016) sistematik derleme **[DOĞRULANDI: özet]**: Konuşma sesi ısınması ve soğuması üzerine. Pozitif değişiklikler raporlanmış, ama süre ve egzersiz konusunda uzlaşı yok. Künye: *Revista CEFAC*, 18(6). doi:10.1590/1982-0216201618617215.
  - **Kurs için özet:** Isınma muhtemelen faydalıdır ve zararsızdır, ama kanıt tabanı küçük, yöntemsel olarak zayıf ve sonuçları tutarsız.

---

## 6. Konjenital amüzi ve kötü perde söyleme

- **Peretz & Vuvan (2017) [DOĞRULANDI: özet]:**
  - Künye: Peretz, I., Vuvan, D. T. (2017). Prevalence of congenital amusia. *European Journal of Human Genetics*, 25(5), 625–630. doi:10.1038/ejhg.2017.15 (PMID 28224991).
  - 20.000 katılımcı, 3 objektif test ve anket kullanılmış.
  - **Yaygınlık %1.5**, kadınlarda biraz daha fazla. Birinci derece akrabaların %46'sı da etkilenmiş. Müzik eğitimi açığı azaltmıyor.
  - Özet, %4 tahmininin "1980'den kalma tek bir testle yapılmış tek bir tahmin" olduğunu söylüyor.
- **Kalmus & Fry (1980) [DOĞRULANDI: künye; %4 değeri Peretz & Vuvan özetinden]:** Kalmus, H., Fry, D. B. (1980). On tune deafness (dysmelodia): frequency, development, genetics and musical background. *Annals of Human Genetics*, 43(4), 369–382. doi:10.1111/j.1469-1809.1980.tb01571.x.
- **Pfordresher & Brown (2007) [İKİNCİL: özet arama sonuçlarından, PDF yazarın sitesinde]:**
  - Künye: Pfordresher, P. Q., Brown, S. (2007). Poor-pitch singing in the absence of "tone deafness". *Music Perception*, 25(2), 95–115. doi:10.1525/mp.2007.25.2.95. PDF: https://www.acsu.buffalo.edu/~pqp/pdfs/Pfordresher&Brown_2007_MP.pdf
  - Katılımcıların %10–15'i en az 1 yarım ses sapmayla taklit etti ve "kötü perde şarkıcısı" sayıldı.
  - Hatalar tutarlı transpozisyonlar şeklindeydi, aralıklar sıkıştırılmıştı. Bu kişilerin perde ayırt etme becerisi iyi şarkıcılarla aynıydı.
  - Yazarlar sorunu algıdan çok algılanan perde ile vokal eylem arasındaki eşleme hatası (sensorimotor mismapping) olarak yorumluyor.
- Dalla Bella, Berkowska & Sowiński (2011) derlemesi de nüfusun %10–15'inin kötü şarkıcı olduğunu söylüyor **[DOĞRULANDI: özet]**. Künye: Disorders of pitch production in tone deafness. *Frontiers in Psychology*, 2:164. doi:10.3389/fpsyg.2011.00164.

---

## 7. Ses türleri: tipik aralıklar ve passaggio

**Tipik aralıklar [İKİNCİL]:** Wikipedia "Voice type" maddesinden. Madde tipik aralıklar için çoğunlukla satır içi kaynak vermiyor. Uç değerler için McKinney (1994, *The Diagnosis and Correction of Vocal Faults*, Genovex) ve Boldrey (1994, *Guide to Operatic Roles and Arias*, Caldwell) kaynak gösteriliyor.

| Tür | Tipik aralık |
|---|---|
| Soprano | C4–C6 |
| Mezzo-soprano | A3–A5 |
| Kontralto (alto) | F3–F5 |
| Kontrtenor | Madde içinde çelişkili: görsel altyazısı E3–E5, metin C4–C6 ("kaynak gerekli" etiketli) **[BELİRSİZ]**. Pratikte G3–E5 veya F5 civarı kullanılır. |
| Tenor | C3–C5 |
| Bariton | A2–A4 |
| Bas | E2–E4 |

**Passaggio (Miller) [İKİNCİL: Wikipedia "Passaggio" maddesi, Miller'ın kitaplarına sayfa numarasıyla atıf yapıyor]:**

| Tür | Primo passaggio | Secondo passaggio | Kaynak |
|---|---|---|---|
| Tenorino | E4 | A4 | Miller, *Training Tenor Voices* (1993), s. 9–13 |
| Tenore leggero | E♭4 | A♭4 | aynı |
| Spieltenor | E♭4 / D4 | A♭4 / G4 | aynı |
| Tenore lirico | D4 | G4 | aynı |
| Lirico spinto | C♯4 | F♯4 | aynı |
| Robusto / drammatico | C4 | F4 | aynı |
| Heldentenor | C4 | F4 | aynı |
| Lirik bariton | B3 | E4 | Miller, *Securing Baritone, Bass-Baritone, and Bass Voices* (2008), s. 9 |
| Dramatik (Verdi) bariton | B♭3 | E♭4 | aynı |
| Bas-bariton | A3 | D4 | aynı |
| Lirik bas | A♭3 | D♭4 | aynı |
| Basso profondo | G3 | C4 | aynı |
| Soprano | E♭4 | F♯5 | Miller, *The Structure of Singing* (1986), s. 134–135 |
| Mezzo-soprano | E4 | E5 / F5 | aynı |
| Kontralto | G♯4 / A4 | D5 | aynı |

Wikipedia, erkekler için Miller'ın "primo passaggio" kavramını herkesin kabul etmediğini de belirtiyor.

---

## 8. Registerler: M1 / M2 ve kapalı oran

- **Henrich (2006) [DOĞRULANDI: özet]:** Garcia'dan bugüne register kavramı tarihsel olarak ele alınıyor. EGG ile saptanan geçiş olgularına dayanan "laringeal mekanizma" kavramı tanıtılıyor.
  - Künye: Henrich, N. (2006). Mirroring the voice from Garcia to the present day: some insights into singing voice registers. *Logopedics Phoniatrics Vocology*, 31(1), 3–14. doi:10.1080/14015430500344844.
- **Henrich ve ark. (2005) [DOĞRULANDI: özet], açık oran verileri:**
  - Künye: Henrich, N., d'Alessandro, C., Doval, B., Castellengo, M. (2005). Glottal open quotient in singing: measurements and correlation with laryngeal mechanisms, vocal intensity, and fundamental frequency. *JASA*, 117(3), 1417–1430. doi:10.1121/1.1850031.
  - M1 göğüs, modal ve erkek "head" registerini kapsar. M2, erkeklerde falseto ve kadınlarda head registerdir.
  - **Açık oran (OQ):** M1'de 0.3–0.8, M2'de 0.5–0.95. Kapalı oran CQ = 1 − OQ olduğundan **M1'de CQ yaklaşık 0.2–0.7, M2'de yaklaşık 0.05–0.5**.
  - OQ, M1'de ses şiddetiyle, M2'de F0 ile güçlü biçimde ilişkili.

---

## 9. Belting

- **Sundberg, Gramming & LoVetri (1993) [DOĞRULANDI: özet]:** Tek bir kadın denek (LoVetri) incelenmiş. Belting çok yüksek subglottik basınç ve ses düzeyi ile görece yüksek glottal addüksiyon gösteriyor. Özette belting'in "sıklıkla ses işlevi bozukluklarıyla ilişkilendirildiği" belirtiliyor.
  - Künye: *J Voice*, 7(4), 301–310. doi:10.1016/s0892-1997(05)80118-3.
- **Bourne & Garnier (2012) [DOĞRULANDI: özet]:**
  - Künye: *JASA*, 131(2), 1586–1594. doi:10.1121/1.3675010.
  - Kadın müzikal tiyatro sesi, F#4–D5 arasında incelenmiş.
  - "Chesty belt" ve "twangy belt"te şarkıcılar R1'i sistematik olarak 2f0'a (H2) ayarlamış, bu C5'e kadar sürmüş.
  - Kapalı oran, EGG simetrisi, SPL ve 1 kHz üstü enerji chesty belt'te "legit"ten anlamlı olarak yüksek.
  - Bourne, Garnier & Samson (2016) aynı ölçümleri erkek müzikal tiyatro sesi için yapmış: *JASA*, 140(1), 610–621. doi:10.1121/1.4954751.
- **Yükselmiş gırtlak:** Belting'de gırtlak yüksekliğinin arttığı pedagojide yaygın bir iddia, ama yukarıdaki özetlerde geçmiyor. Doğrulamadım **[BELİRSİZ]**.
- **Sağlık:** Belting'in kendi başına zararlı olduğunu gösteren kontrollü bir kanıt bulmadım. 1993 makalesi bu ilişkiyi yalnızca "sıklıkla ilişkilendirilir" diye aktarıyor. Konu tartışmalı. Kursta "doğası gereği zararlı değil, yüksek basınç ve addüksiyon nedeniyle yük fazla; dozaj ve teknik önemli" şeklinde dengeli bir ifade kullanın.

---

## 10. Ses sağlığı

- **Ses kısıklığında KBB'ye başvuru [DOĞRULANDI: resmi özet]:** AAO-HNS 2018 kılavuzu (KAS 3) şöyle der: disfoni **4 hafta içinde düzelmez veya iyileşmezse**, ya da ciddi bir neden şüphesi varsa süreye bakılmaksızın, laringoskopi yapılmalı veya laringoskopi yapabilen bir klinisyene sevk edilmeli.
  - "2–3 hafta" değil **4 hafta**. Kılavuz ayrıca profesyonel ses kullanıcılarını, sigara öyküsünü, yakın zamanda geçirilmiş entübasyon veya cerrahiyi, boyunda kitleyi ve solunum sıkıntısını hızlandırılmış değerlendirme gerektiren faktörler olarak sayar. Kursta "şarkıcılar için daha erken başvuru makul" denebilir.
  - Künye: Stachler, R. J., Francis, D. O., Schwartz, S. R. ve ark. (2018). Clinical practice guideline: hoarseness (dysphonia) (update). *Otolaryngology–Head and Neck Surgery*, 158(1_suppl), S1–S42. doi:10.1177/0194599817751030. Executive summary: 158(3), 409–426. doi:10.1177/0194599817751031 (PMID 29494316).
- **Fısıltı [DOĞRULANDI: özet]:** 100 hastada fiberoptik inceleme yapılmış.
  - %69'unda fısıltıda supraglottik hiperfonksiyon arttı, %18'inde değişmedi, %13'ünde azaldı. 12 hastada fısıltıda ses telleri hiç temas etmedi.
  - Sonuç: fısıltı çoğu hastada daha fazla hiperfonksiyon içeriyor ama herkeste değil.
  - Künye: Rubin, A. D., Praneetvatakul, V., Gherson, S., Moyer, C. A., Sataloff, R. T. (2006). Laryngeal hyperfunction during whispering: reality or myth? *J Voice*, 20(1), 121–127. doi:10.1016/j.jvoice.2004.10.007.
- **Hidrasyon [DOĞRULANDI: özet]:**
  - Sistemik dehidrasyon (oruç, sıvı almama) ses parametrelerini olumsuz etkiliyor. Kafein alımı ses üretimini olumsuz etkilemiyor gibi görünüyor.
  - Ağızdan solumayla yüzey kuruması jitter, shimmer, NHR, fonasyon eşik basıncı ve algılanan eforu kötüleştiriyor.
  - Buhar solumak NHR, shimmer ve jitter'i iyileştiriyor. İzotonik nebülizasyon fonasyon eşik basıncını düşürüyor.
  - Künye: Alves, M., Krüger, E., Pillay, B., van Lierde, K., van der Linde, J. (2019). The effect of hydration on voice quality in adults: a systematic review. *J Voice*, 33(1), 125.e13–125.e28. doi:10.1016/j.jvoice.2017.10.001.
  - Ek derleme (künye doğrulandı, içerik okunmadı): Leydon, C., Sivasankar, M., Falciglia, D. L., Atkins, C., Fisher, K. V. (2009). Vocal fold surface hydration: a review. *J Voice*, 23(6), 658–665. doi:10.1016/j.jvoice.2008.03.010.
- **Boğaz temizleme:** Ses hijyeni programlarında sık sık kaçınılması önerilir (yutkunma, su içme gibi alternatifler önerilir). Doğrudan kontrollü kanıt bulmadım **[BELİRSİZ]**. "Uzman görüşü" olarak sunun.

---

## 11. Ünlü değiştirme ve F1 takibi (sopranolar)

- **Joliveau, Smith & Wolfe (2004a), Nature [DOĞRULANDI: künye]:** Tuning of vocal tract resonance by sopranos. *Nature*, 427(6970), 116. doi:10.1038/427116a.
- **Joliveau, Smith & Wolfe (2004b), JASA [DOĞRULANDI: özet]:** Vocal tract resonances in singing: the soprano voice. *JASA*, 116(4), 2434–2439. doi:10.1121/1.1791717.
  - Bulgu: f0, konuşmadaki R1 değerini aştığında R1, f0 ile birlikte yükselerek R1 ≈ f0 olur. R2 de yükselir.
  - Sonuç olarak ünlüler (R2, R1) düzleminde birbirine yaklaşıp örtüşür, bu da anlaşılırlık kaybı demektir.
- **Henrich, Smith & Wolfe (2011) [DOĞRULANDI: özet]:**
  - Künye: *JASA*, 129(2), 1024–1035. doi:10.1121/1.3518766.
  - Sopranolar R1:f0 ayarı yapıyor, çoğu zaman bununla birlikte R2:2f0 ayarı da kullanıyor. Altolar R1:f0 veya R1:2f0 kullanıyor. Tenor ve baritonlar R1:2f0 ve R1:3f0 kullanıyor.
- Sundberg'in "formant tuning" makalesi (künye doğrulandı): Carlsson, G., Sundberg, J. (1992). Formant frequency tuning in singing. *J Voice*, 6(3), 256–260. doi:10.1016/s0892-1997(05)80150-x.

---

## 12. Yakınlık etkisi (proximity effect)

- **Shure eğitim yayınları ve kullanım kılavuzları [DOĞRULANDI: arama özeti]:** Yönlü mikrofonlar kaynağa yaklaştıkça bas frekansları giderek yükseltir. Örneğin Shure SM57 kılavuzu, yaklaşık 6 mm mesafede 100 Hz altında 6–10 dB artış veriyor. Omni mikrofonlarda bu etki görülmez.
  - Kaynak: SM57 User Guide, https://pubs.shure.com/view/guide/SM57/en-US.pdf
  - Kaynak: "Microphone Techniques for Live Sound Reinforcement" (Shure educational publication).
- **Akademik referans [DOĞRULANDI: künye; bölüm içeriği okunmadı]:** Eargle, J. (2004). The pressure gradient microphone. *The Microphone Book* (2. baskı), Focal Press, s. 50–65. doi:10.1016/b978-0-240-51961-6.50008-0. Yeni baskısı: Rayburn, R. A. (2012), *Eargle's The Microphone Book* (3. baskı), s. 61–80.
- **Mekanizma:** Basınç gradyanı mikrofonları yakın alanda küresel dalga cephesine maruz kalır ve gradyan bileşeni düşük frekanslarda artar. Bu standart akustik bilgisidir **[İKİNCİL]**.

---

## 13. Kamu malı (public domain) durumu

| Eser | Yıl | Besteci / ölüm | Durum |
|---|---|---|---|
| Nicola Vaccai, *Metodo pratico di canto italiano per camera* (ders 1, "Manca sollecita più dell'usato") | **1832** (Londra dönemi; Wikipedia ve başka biyografiler 1832 veriyor). Yayın şehri ve tam künye doğrulanmadı **[İKİNCİL]**. | Vaccai 15.3.1790 Tolentino – 5 (veya 6) Ağustos 1848 (Pesaro; Wikipedia infobox Tolentino diyor, çelişkili) | Kamu malı (ölümünün üzerinden 170+ yıl geçti) |
| Giuseppe Concone, *50 Leçons de chant* (*50 Lessons*), Op. 9 | IMSLP'deki baskıların çoğu tarihsiz. Schirmer baskısı 1892. Özgün yayın Paris dönemine (1837–1848) ait olmalı **[BELİRSİZ]**. | Concone 12.9.1801 Torino – **1 Haziran 1861** Torino. HMML otorite kaydı ve Deutsche Biographie 1801–1861 veriyor. Wikipedia infobox'taki 1867 yanlış görünüyor. | Kamu malı. IMSLP partisyonları "Public Domain" işaretli. Modern düzenlemelere ve kayıtlara dikkat edin (ör. IMSLP'deki 2020 Cavaleri eşlik kayıtları CC BY-NC-SA). |
| "Frère Jacques" | Ezginin bilinen en eski hali yaklaşık 1780 tarihli bir Fransız el yazması ("Frère Blaise"; BnF 1775–1785 diyor). İlk basım 1811 (Fuld). Rameau atfı doğrulanmamış. **[İKİNCİL: Wikipedia]** | Anonim / geleneksel | Kamu malı |
| "Ah! vous dirai-je, maman" (Twinkle Twinkle ezgisi) | Ezgi ilk kez **1761**'de yayımlandı (List 1978 aktarımıyla). Sözlü ilk basım 1774. Mozart'ın KV 265 varyasyonları 1781 veya 1782. **[İKİNCİL: Wikipedia]** | Anonim | Kamu malı |
| Beethoven, "Neşeye Övgü" ezgisi (9. Senfoni, 4. bölüm) | Senfoni 1824'te tamamlandı, ilk icrası 7 Mayıs 1824, Viyana (Kärntnertor). **[İKİNCİL: Wikipedia]** | Beethoven 1770–1827 (genel bilgi) | Ezgi kamu malı. Avrupa marşı olarak kullanılan Karajan düzenlemesi (1972) ayrı bir eserdir. Kendi düzenlemenizi yapın. Karajan düzenlemesinin telif durumunu doğrulamadım. |

**Not:** Kamu malı olan ezgi ile modern bir baskının dizgisi, düzenlemesi veya eşliği farklı şeylerdir. Ezgiyi kendiniz notaya alın veya kodlayın.

---

## 14. Anonim Türk halk türküleri (TRT repertuvarı)

Kaynak: Türkü Dostları veri tabanı (turkudostlari.net). Sayfalar doğrudan çekilip okundu **[İKİNCİL: güvenilir hobi veri tabanı, TRT'nin resmî kaydı değil]**. Repertükül (repertukul.com) aynı numaraları veriyor (arama özetiyle). Bu türkülerde "eser sahibi" yerine kaynak kişi yazılıyor, yani söz ve müzik anonimdir.

| Türkü | TRT Rep. No | Yöre | Kaynak kişi | Derleyen | Notlar |
|---|---|---|---|---|---|
| Üsküdar'a Gider İken (Kâtibim), 1. varyant | **1140** | İstanbul | Nuri Halil Poyraz (TRT arşivinde kaynak "Yöre Ekibi" olarak geçiyor) | Muzaffer Sarısözen, 08.11.1945 | Repertükül'e göre makam Nihavent, usul 4/4 (doğrulanmadı). Kökeni tartışmalı: ezgi Balkanlar ve Orta Doğu'da yaygın. Koçu'ya atfedilen İskoç alayı marşı teorisi doğrulanmamış bir rivayet. Ezgi yine de anonim/geleneksel. https://www.turkudostlari.net/soz.asp?turku=995 |
| Çanakkale İçinde (Aynalı Çarşı), 1. varyant | **461** | Kastamonu | İhsan Ozanoğlu | Muzaffer Sarısözen | Bilinen "Çanakkale içinde aynalı çarşı… Of gençliğim eyvah" versiyonu. Kerkük varyantı da var. https://www.turkudostlari.net/soz.asp?turku=306. Ayrıca 8. varyant: Denizli, kaynak kişi ve derleyen Mustafa Salman, Balıkesir Halkevi yayını, 1937. TRT numarası yok. https://www.turkudostlari.net/soz.asp?turku=17086 |
| Sarı Gelin (Erzurum Çarşı Pazar), 1. varyant | **615** | Erzurum | Faruk Kaleli | Muzaffer Sarısözen (yalnızca Repertükül'e göre; TD sayfasında derleyen yazmıyor) **[İKİNCİL]** | Ezgi Ermeni ("Sari Aghjik") ve Azerbaycan gelenekleri tarafından da sahipleniliyor. Kursta "Anadolu ve Kafkasya'da ortak ezgi" demek daha güvenli. Oyun havası olarak da söyleniyor. https://www.turkudostlari.net/soz.asp?turku=856 |
| Entarisi Ala Benziyor | **621** | İstanbul | Veli Kanık | Muzaffer Sarısözen | Repertükül'e göre Hicaz, 9/8 (doğrulanmadı). Aksak 9/8 usulü yeni başlayanlar için ritmik olarak zor olabilir. https://www.turkudostlari.net/soz.asp?turku=2207 |

**Telif notları:**

- 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) md. 6/4, "musiki aranjman ve tertipleri"ni işlenme eser sayar. Md. 6'nın son fıkrasına göre "işleyenin hususiyetini taşıyan" işlenmeler eser olarak korunur. Koruma süresi md. 27'ye göre eser sahibinin ölümünden sonra 70 yıldır.
- Kanunda halk bilgisi veya folklor için özel bir hüküm bulamadım (metin mevzuat.gov.tr'den indirilip tarandı) **[DOĞRULANDI]**.
- **Pratik çıkarım:** Anonim ezgi ve söz serbesttir. Ancak belirli bir TRT notası, düzenleme, dizgi veya kayıt (ve derleyenin özgün katkısı) ayrıca korunabilir. Kendi transkripsiyonunuzu, basit bir ezgi kaydı olarak yapın ve TRT nota görselini kopyalamayın.
- Anonim türkülerde telif uygulamasının belirsizliği basında da tartışılıyor (ör. Yalçın Bayer, Hürriyet, "Anonim türkülerin telifi nereye gidiyor"). Hukuki görüş için avukata danışılmalı. Ben avukat değilim **[BELİRSİZ: hukuki yorum]**.

---

## 15. Genizsilik (nazalite)

- **Birch ve ark. (2002) [DOĞRULANDI: özet]:**
  - Künye: Birch, P., Gümoes, B., Stavad, H., Prytz, S., Björkner, E., Sundberg, J. (2002). Velum behavior in professional classic operatic singing. *J Voice*, 16(1), 61–71. doi:10.1016/s0892-1997(02)00073-5.
  - 17 profesyonel opera şarkıcısında [a, i, u] ünlüleri incelenmiş. Pek çok şarkıcıda en azından bazı perdelerde velofaringeal açıklık (VPO) bulunmuş.
  - Uzman paneli, algılanan nazal kalite ile VPO varlığı arasında **ilişki bulmamış**.
- **Sundberg ve ark. (2007) [DOĞRULANDI: özet]:**
  - Künye: Sundberg, J., Birch, P., Gümoes, B., Stavad, H., Prytz, S., Karle, A. (2007). Experimental findings on the nasal tract resonator in singing. *J Voice*, 21(2), 127–137. doi:10.1016/j.jvoice.2005.11.005.
  - İdealize edilmiş modelde VPO, nazal rezonans frekansında bir sıfır (antiformant) oluşturuyor. Gerçekçi modellerde bu etki, özellikle maksiller sinüslerle, ağır biçimde sönümleniyor.
  - /a/'da VPO F1'i zayıflatıyor ve şarkıcı formantının göreli düzeyini artırıyor.
- **Nazal formant ve antiformant frekansları:** "Yaklaşık 250 Hz civarında nazal formant (nasal murmur), 500–1000+ Hz'de antiformant" değerleri ders kitabı düzeyinde yaygın bilgidir (ör. Kent & Read, *The Acoustic Analysis of Speech*). Ben birincil kaynaktan doğrulamadım **[İKİNCİL/BELİRSİZ]**. İlgili klasik makale (künye doğrulandı): Lindqvist-Gauffin, J., Sundberg, J. (1976). Acoustic properties of the nasal tract. *Phonetica*, 33(3), 161–168. doi:10.1159/000259720.

---

## 16. Temel kitap künyeleri [DOĞRULANDI: Open Library]

- **Sundberg, J. (1987).** *The Science of the Singing Voice.* DeKalb, IL: Northern Illinois University Press. ISBN 0-87580-120-X (978-0-87580-120-9), ciltli. Karton kapak baskısı 1989, ISBN 0-87580-542-6 (978-0-87580-542-9).
- **Titze, I. R. (1994).** *Principles of Voice Production.* Englewood Cliffs, NJ: Prentice Hall. ISBN 0-13-717893-X. İkinci baskı: Iowa City: National Center for Voice and Speech, 2000, ISBN 0-87414-122-2 (978-0-87414-122-1).
- **Miller, R. (1986).** *The Structure of Singing: System and Art in Vocal Technique.* New York: Schirmer Books. ISBN 0-02-872660-X (978-0-02-872660-1). Sonraki baskıları Schirmer/Thomson Learning tarafından yapıldı, ISBN 0-534-25535-3.
- **Miller'ın diğer kitapları:**
  - *Training Tenor Voices* (Schirmer, 1993).
  - *Solutions for Singers* (Oxford University Press, 2004). Bu kitabın bölümleri Crossref'te OUP DOI'leriyle kayıtlı, örneğin "The Phenomenon of Vibrato", doi:10.1093/oso/9780195160055.003.0006.
  - *Securing Baritone, Bass-Baritone, and Bass Voices* (Oxford University Press, 2008).
- **NCVS (National Center for Voice and Speech) [DOĞRULANDI]:** https://ncvs.org. Sitede *Principles of Voice Production* kitabını destekleyen eğitimler (tutorials) bulunuyor.

---

## 17. YIN [DOĞRULANDI: künye]

de Cheveigné, A., Kawahara, H. (2002). YIN, a fundamental frequency estimator for speech and music. *JASA*, 111(4), 1917–1930. doi:10.1121/1.1458024.

## 18. Glottal darbe modelleri

- **Rosenberg [DOĞRULANDI: künye]:** Rosenberg, A. E. (1971). Effect of glottal pulse shape on the quality of natural vowels. *JASA*, 49(2B), 583–590. doi:10.1121/1.1912389.
- **LF modeli [İKİNCİL: çok sayıda atıfta aynı künye; özgün PDF'e erişilemedi]:** Fant, G., Liljencrants, J., Lin, Q. (1985). A four-parameter model of glottal flow. *STL-QPSR* (KTH Speech Transmission Laboratory Quarterly Progress and Status Report), 26(4), 1–13. Fransız-İsveç Sempozyumu'nda sunuldu (Grenoble, 22–24 Nisan 1985). DOI yok.

---

## Açık kalan / doğrulanamayan konular (özet)

1. Ölçülmüş Türkçe çocuk formantları: Türk ve ark. 2004'te var ama metne ulaşılamadı. Tablodaki çocuk değerleri tahmindir.
2. Prame 1994 ve 1997'nin sayısal vibrato değerleri (birincil metin okunamadı).
3. Sundberg 1974'ün özeti ve şarkıcı formantının kesin Hz aralığı (2001 özeti "yaklaşık 3 kHz" diyor).
4. Belting'de gırtlak yüksekliği. Belting'in sağlık etkileri (kanıt yok veya tartışmalı).
5. Kontrtenor tipik aralığı (Wikipedia içinde çelişkili).
6. Concone Op. 9'un ilk yayın yılı. Vaccai Metodo'nun yayın şehri ve yayıncısı.
7. Nazal formant ve antiformant Hz değerleri (ders kitabı bilgisi, birincil kaynak okunmadı).
8. Boğaz temizlemenin zararına dair doğrudan kanıt.
9. Karajan'ın Avrupa marşı düzenlemesinin telif durumu.
