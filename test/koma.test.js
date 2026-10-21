/* 53 koma hesabı: klarnet eğitimindeki değerlerle aynı sonuç */
const { eq, ok } = require("./_t.js");
const path = require("path"), fs = require("fs");
const K = require("../js/koma.js");
const { MAKAMLAR } = require("../js/data/makamlar.js");
eq("1 koma ≈ 22,642 sent", K.KOMA_CENT, 22.6415, 1e-4);
// klarnet eğitimindeki test değerleri (klarnet/test/klarnet.test.js)
const PERDE = { "Rast": 0, "Dügâh": 9, "Kürdî": 13, "Segâh": 17, "Bûselik": 18, "Çârgâh": 22, "Hicaz": 27, "Nîm hicaz": 26, "Dik kürdî": 14,
  "Nevâ": 31, "Hisar": 36, "Hüseynî": 40, "Acem": 44, "Eviç": 48, "Mâhur": 49, "Gerdâniye": 53, "Irak": -5, "Muhayyer": 62 };
for (const [ad, k] of Object.entries(PERDE)) eq(`${ad} = ${k} koma`, (K.perde(ad) || {}).koma, k);
eq("Segâh: Si'den 15,1 sent pes", K.perdeYazili(17).sapma, -15.09, 0.01);
eq("Eviç: Fa♯'den 13,2 sent pes", K.perdeYazili(48).sapma, -13.21, 0.01);
eq("Bolahenkte Dügâh ≈ 330 Hz", K.perdeFrekans(9, "bolahenk"), 330.0, 0.5);
const ey = K.enYakinPerde(330, { ahenk: "bolahenk" });
eq("Akort: 330 Hz bolahenkte Dügâh", ey.perde.ad, "Dügâh");
const mk = (id) => MAKAMLAR.find((m) => m.id === id);
eq("Hicaz dizisi (TDV: Dügâh'ta hicaz dörtlüsü + Nevâ'da rast beşlisi)", mk("hicaz").dizi.map((k) => K.perdeKoma(k).ad), ["Dügâh", "Dik kürdî", "Nîm hicaz", "Nevâ", "Hüseynî", "Eviç", "Gerdâniye", "Muhayyer"]);
eq("Uşşak dizisi", mk("ussak").dizi.map((k) => K.perdeKoma(k).ad), ["Dügâh", "Segâh", "Çârgâh", "Nevâ", "Hüseynî", "Acem", "Gerdâniye", "Muhayyer"]);
eq("Rast dizisi", mk("rast").dizi.map((k) => K.perdeKoma(k).ad), ["Rast", "Dügâh", "Segâh", "Çârgâh", "Nevâ", "Hüseynî", "Eviç", "Gerdâniye"]);
// klarnet projesi yanımızdaysa: bütün perdeler, frekanslar ve en yakın perde birebir aynı mı?
const kp = path.resolve(__dirname, "../../klarnet/js/klarnet.js");
if (fs.existsSync(kp)) {
  const KK = require(kp);
  eq("perde listesi klarnetle aynı", K.PERDELER.map((p) => [p.ad, p.koma, p.harf, p.isaret]), KK.PERDELER.map((p) => [p.ad, p.koma, p.harf, p.isaret]));
  let fark = 0;
  for (const ah of Object.keys(K.AHENKLER)) for (let k = -40; k <= 80; k++) fark = Math.max(fark, Math.abs(K.perdeFrekans(k, ah) - KK.perdeFrekans(k, ah)));
  eq("perde frekansları klarnetle aynı", fark, 0, 1e-9);
  let ayni = true;
  for (let f = 150; f < 900; f += 3.7) { const a = K.enYakinPerde(f), b = KK.enYakinPerde(f); if (a.perde.ad !== b.perde.ad || Math.abs(a.centSapma - b.centSapma) > 1e-9) ayni = false; }
  ok("en yakın perde ve sapma klarnetle aynı", ayni);
  const km = require(path.resolve(__dirname, "../../klarnet/js/data/makamlar.js"));
  eq("makam dizileri klarnetle aynı", MAKAMLAR.map((m) => m.dizi), km.MAKAMLAR.map((m) => m.dizi));
} else console.log("(klarnet projesi bulunamadı: karşılaştırma atlandı)");
