/* Çözümleme testleri: vibratolu sentetik seste merkez perde, vibrato hızı ve genişliği; sabitlik; ses aralığı;
   sirende kırılma; "sss" ölçer. */
const { eq, ok } = require("./_t.js");
const P = require("../js/pitch.js");
const S = require("../js/ses.js");
const A = require("../js/analiz.js");
const N = require("../js/notalar.js");
const SR = 48000;

// 1) vibrato: farklı hız/genişlik/ses türleri
const DURUM = [
  { tip: "kadin", m: 69, hiz: 5.5, gen: 50, u: "a" },
  { tip: "kadin", m: 76, hiz: 6.5, gen: 80, u: "o" },
  { tip: "erkek", m: 50, hiz: 5.0, gen: 40, u: "a" },
  { tip: "erkek", m: 57, hiz: 7.0, gen: 25, u: "e" },
  { tip: "cocuk", m: 72, hiz: 6.0, gen: 60, u: "i" },
];
for (const d of DURUM) {
  const x = S.uret(SR, 3, { f0: N.mtof(d.m), tip: d.tip, unlu: d.u, vibHiz: d.hiz, vibGen: d.gen });
  const v = A.vibrato(P.izle(x, SR));
  const ad = `${d.tip} ${N.ad(d.m)} vibrato ${d.hiz} Hz ±${d.gen} sent`;
  ok(ad + ": merkez ±5 sent", v && Math.abs(v.merkez - d.m) * 100 <= 5, v && ((v.merkez - d.m) * 100).toFixed(1));
  ok(ad + ": hız ±0,3 Hz", v && Math.abs(v.hiz - d.hiz) <= 0.3, v && v.hiz.toFixed(2));
  ok(ad + ": genişlik ±%15", v && Math.abs(v.genislik - d.gen) <= d.gen * 0.15, v && v.genislik.toFixed(1));
  ok(ad + ": vibrato var", v && v.var);
}
// düz ses: vibrato yok
{
  const x = S.uret(SR, 3, { f0: 220, tip: "kadin", unlu: "a", vibGen: 0 });
  const v = A.vibrato(P.izle(x, SR));
  ok("düz seste vibrato yok", v && !v.var && v.genislik < 5, v && v.genislik.toFixed(2));
}
// geç başlayan vibrato (pop): ölçülen hız yine doğru
{
  const r = S.ezgi(SR, [{ m: 64, d: 3, u: "a", vib: { hiz: 5.8, gen: 45, gecikme: 1 } }], { tip: "kadin" });
  const k = P.izle(r.data, SR).filter((q) => q.t > 1.4);
  const v = A.vibrato(k);
  ok("geç vibrato: hız 5,8 Hz ±0,4", v && Math.abs(v.hiz - 5.8) <= 0.4, v && v.hiz.toFixed(2));
}

// 2) sabitlik: hedefe 20 sent pes, yavaş kayma
{
  const r = S.ezgi(SR, [{ f: N.mtof(60 - 0.2), d: 4, u: "a" }], { tip: "erkek" });
  const s = A.sabitlik(P.izle(r.data, SR), { hedef: 60 });
  ok("sabitlik: ortalama sapma −20 sent ±3", s && Math.abs(s.ortalamaSapma + 20) <= 3, s && s.ortalamaSapma.toFixed(1));
  ok("sabitlik: titreme < 2 sent (düz ses)", s && s.titreme < 2, s && s.titreme.toFixed(2));
  // kayan ses: 4 sn'de 40 sent tizleşen
  const n = 40, notalar = [];
  for (let i = 0; i < n; i++) notalar.push({ f: N.mtof(60 + 0.4 * i / n), d: 0.1, u: "a", glide: 0.05 });
  const r2 = S.ezgi(SR, notalar, { tip: "erkek" });
  const s2 = A.sabitlik(P.izle(r2.data, SR));
  ok("sabitlik: kayma ≈ +10 sent/sn", s2 && Math.abs(s2.kayma - 10) <= 2.5, s2 && s2.kayma.toFixed(2));
}

// 3) ses aralığı: G3'ten D5'e gam (her nota 0,6 sn) + arada hızlı siren uçları sayılmamalı
{
  const notalar = [];
  for (let m = 55; m <= 74; m += 2) notalar.push({ m, d: 0.6, u: "a" });
  // 0,15 sn'lik çok tiz bir "çığlık" (sayılmamalı)
  notalar.push({ m: 84, d: 0.15, u: "a" });
  notalar.push({ m: 60, d: 0.6, u: "a" });
  const r = S.ezgi(SR, notalar, { tip: "kadin" });
  const ao = A.AralikOlcer();
  P.izle(r.data, SR).forEach((k) => ao.push(k));
  eq("aralık ölçer: en pes G3", ao.lo, 55);
  eq("aralık ölçer: en tiz C♯5 (kısa çığlık sayılmaz)", ao.hi, 73);
}

// 4) sirende kırılma: perdede 3 yarım seslik ani sıçrama
{
  const notalar = [];
  for (let i = 0; i <= 30; i++) notalar.push({ f: N.mtof(55 + i * 0.25), d: 0.05, u: "u", glide: 0.04 });
  // 62,5'ten sonra 0,25 yerine 3,25 yarım ses: 3 yarım seslik kırılma
  for (let i = 0; i <= 16; i++) notalar.push({ f: N.mtof(65.75 + i * 0.25), d: 0.05, u: "u", glide: i ? 0.04 : 0.004 });
  const r = S.ezgi(SR, notalar, { tip: "erkek" });
  const kr = A.kirilmalar(P.izle(r.data, SR));
  ok("siren: bir kırılma bulundu", kr.length === 1, JSON.stringify(kr.map((k) => k.sicrama.toFixed(2))));
  ok("kırılma ~ +3 yarım ses", kr.length && Math.abs(kr[0].sicrama - 3) < 1.2, kr.length && kr[0].sicrama.toFixed(2));
  // kırılmasız siren
  const n2 = [];
  for (let i = 0; i <= 60; i++) n2.push({ f: N.mtof(55 + i * 0.25), d: 0.05, u: "u", glide: 0.04 });
  const kr2 = A.kirilmalar(P.izle(S.ezgi(SR, n2, { tip: "erkek" }).data, SR));
  eq("kırılmasız sirende kırılma yok", kr2.length, 0);
}

// 5) "sss" ölçer: 3 sn sss
{
  const r = S.ezgi(SR, [{ m: 60, d: 6, c: "ssssssssssssssssssssssssss" }, { r: 1 }], {});
  // yalnız sürtünme kısmı: ünlüden önce kes
  const x = r.data.slice(0, Math.round(SR * 2.75));
  const sss = A.SssOlcer();
  let son = null;
  // gerçek mikrofon gibi: ölçülebilir taban gürültüsü ekle
  const rand = S.rng(9);
  const y = new Float32Array(x.length + SR);
  y.set(x);
  for (let i = 0; i < y.length; i++) y[i] += rand() * 0.0005;
  P.izle(y, SR).forEach((k) => { const q = sss.push(k); if (q.bitti) son = q; else if (q.aktif) son = q; });
  ok("sss süresi ≈ 2,6 sn ±0,25", son && Math.abs(son.sure - 2.6) <= 0.25, son && son.sure.toFixed(2));
}

// 6) formant tahmini: erkek /a/ ve /i/ F1–F2 yaklaşık
{
  for (const u of ["a", "i", "u"]) {
    const f = S.Formant.KAYNAK.erkek[u];
    const x = S.uret(SR, 0.5, { f0: 120, tip: "erkek", unlu: u, nefes: 0.02 });
    const ft = A.formantTahmin(x.subarray(8000, 8000 + 2048), SR);
    const [F1, F2] = ft.formantlar;
    ok(`LPC erkek /${u}/: F1 ±%15 ya da ±60 Hz`, Math.abs(F1 - f[0]) <= Math.max(60, f[0] * 0.15), F1 + " / " + f[0]);
    ok(`LPC erkek /${u}/: F2 ±%15`, Math.abs(F2 - f[1]) <= f[1] * 0.15, F2 + " / " + f[1]);
  }
}
