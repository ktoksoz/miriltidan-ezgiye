/* Türkçenin sekiz ünlüsünün formant frekansları (Hz).
   KAYNAK değerleri docs/arastirma.md'deki çalışmalardan aynen alınır; sentez (js/ses.js) SENTEZ tablosunu kullanır.
   test/formant.test.js tabloyu kaynakla ve sentezle karşılaştırır. */
(function (root) {
  const UNLULER = ["a", "e", "ı", "i", "o", "ö", "u", "ü"];
  // Ünlü özellikleri (Türkçe dil bilgisindeki sekizli tablo)
  const OZELLIK = {
    a: { kalin: true, yuvarlak: false, genis: true }, e: { kalin: false, yuvarlak: false, genis: true },
    ı: { kalin: true, yuvarlak: false, genis: false }, i: { kalin: false, yuvarlak: false, genis: false },
    o: { kalin: true, yuvarlak: true, genis: true }, ö: { kalin: false, yuvarlak: true, genis: true },
    u: { kalin: true, yuvarlak: true, genis: false }, ü: { kalin: false, yuvarlak: true, genis: false },
  };
  /* Erkek ve kadın: Malkoç, E. (2009). Türkçe ünlülerin akustik özellikleri. Dil Dergisi 146: 71–85, Tablo 1
     (10 erkek, 10 kadın konuşucunun ortalamaları; F1–F4). Çocuk: Türkçe ölçüm bulunamadı; TAHMİNİ değerler:
     kadın değerleri Hillenbrand ve ark. (1995, JASA 97: 3099) çocuk/kadın oranlarıyla ölçeklendi
     (F1 ×1,07, F2 ×1,11, F3 ×1,09). Ayrıntı: docs/arastirma.md, bölüm 1. */
  const KAYNAK = {
    kaynak: "Malkoç 2009 (erkek, kadın); çocuk tahmini (Hillenbrand ve ark. 1995 oranları)",
    erkek: {
      a: [642, 1128, 2714, 3707], e: [470, 1866, 2563, 3715], ı: [396, 1500, 2479, 3782], i: [306, 2111, 2897, 3751],
      o: [483, 860, 2733, 3668], ö: [469, 1510, 2439, 3554], u: [379, 980, 2490, 3558], ü: [333, 1769, 2337, 3342],
    },
    kadin: {
      a: [771, 1338, 2998, 4168], e: [578, 2205, 2961, 4128], ı: [492, 1629, 2976, 4232], i: [430, 2591, 3325, 4308],
      o: [564, 959, 2976, 3794], ö: [543, 1636, 2764, 3947], u: [452, 961, 2940, 3825], ü: [424, 1938, 2742, 3694],
    },
    cocuk: { // tahmini
      a: [830, 1480, 3270], e: [620, 2440, 3230], ı: [530, 1800, 3250], i: [460, 2860, 3630],
      o: [600, 1060, 3250], ö: [580, 1810, 3020], u: [480, 1060, 3210], ü: [450, 2140, 2990],
    },
  };
  // F4 ölçülmemişse (çocuk) ve F5 için yaklaşık değerler; bant genişlikleri (Hz) sentez için
  const UST = { erkek: [3700, 4200], kadin: [4100, 4700], cocuk: [4400, 5100] };
  const BANT = [70, 95, 130, 170, 220];

  // Sentezde kullanılan tam tablo: [[F, B] × 5]
  function sentez(tip, unlu) {
    const f = KAYNAK[tip][unlu];
    const fs = [f[0], f[1], f[2], f[3] || UST[tip][0], UST[tip][1]];
    // komşu formantlar birbirine çok yaklaşmasın (rezonatörler birleşmesin)
    if (fs[3] < fs[2] + 300) fs[3] = fs[2] + 300;
    if (fs[4] < fs[3] + 350) fs[4] = fs[3] + 350;
    return fs.map((F, i) => [F, BANT[i] * (tip === "erkek" ? 1 : 1.15)]);
  }

  const out = { UNLULER, OZELLIK, KAYNAK, UST, BANT, sentez };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else root.Formant = out;
})(typeof window !== "undefined" ? window : globalThis);
