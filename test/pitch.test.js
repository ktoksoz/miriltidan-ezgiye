/* Perde algılama testleri: YIN (sinüs, kaynak–filtre sentezli ünlüler), oktav hatası, sessizlik ve gürültü. */
const { eq, ok } = require("./_t.js");
const P = require("../js/pitch.js");
const S = require("../js/ses.js");
const N = require("../js/notalar.js");
const SR = 48000, WIN = 2048;

function sinus(f, dur, amp = 0.5, sr = SR) {
  const x = new Float32Array(Math.round(sr * dur));
  for (let i = 0; i < x.length; i++) x[i] = amp * Math.sin(2 * Math.PI * f * i / sr);
  return x;
}
// bir sinyalin ortasındaki pencerelerin ölçtüğü frekansların medyanı (sent)
function olc(x, f, sr = SR) {
  const errs = [];
  for (let s = Math.round(sr * 0.2); s + WIN < x.length - sr * 0.1; s += 1500) {
    const r = P.yinSes(x.subarray(s, s + WIN), sr);
    errs.push(r.freq ? N.cents(f, r.freq) : 9999);
  }
  errs.sort((a, b) => a - b);
  return { med: errs[errs.length >> 1], max: Math.max(...errs.map(Math.abs)), n: errs.length };
}

// 1) sinüs
for (const f of [72, 98, 130.81, 220, 261.63, 440, 659.25, 880, 1046.5]) {
  const r = olc(sinus(f, 0.8), f);
  ok(`sinüs ${f} Hz ±3 sent`, r.max <= 3, `en büyük sapma ${r.max.toFixed(2)}`);
}
// 44,1 kHz'de de
{ const r = olc(sinus(196, 0.8, 0.5, 44100), 196, 44100); ok("sinüs 196 Hz @44,1 kHz ±3 sent", r.max <= 3, r.max.toFixed(2)); }

// 2) sentezli ünlüler: erkek, kadın, çocuk perdelerinde, sekiz ünlü
const PERDELER = { erkek: ["E2", "A2", "D3", "G3", "C4", "F4"], kadin: ["G3", "C4", "A4", "E5", "A5"], cocuk: ["C4", "G4", "D5", "A5", "C6"] };
for (const [tip, ns] of Object.entries(PERDELER)) {
  for (const n of ns) {
    const f = N.mtof(N.parse(n));
    let enKotu = 0;
    for (const u of S.Formant.UNLULER) {
      const x = S.uret(SR, 0.7, { f0: f, tip, unlu: u, gurluk: 0.7, nefes: 0.03 });
      const r = olc(x, f);
      enKotu = Math.max(enKotu, r.max);
      if (r.max > 3) console.log(`   ${tip} ${n} /${u}/: en büyük sapma ${r.max.toFixed(2)} sent`);
    }
    ok(`${tip} ${n} (${f.toFixed(1)} Hz), sekiz ünlü ±3 sent`, enKotu <= 3, enKotu.toFixed(2));
  }
}

// 3) oktav hatası: güçlü ikinci harmonik, zayıf temel
{
  const f = 150, x = new Float32Array(SR);
  for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = 0.12 * Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * 2 * f * t + 0.4) + 0.3 * Math.sin(2 * Math.PI * 3 * f * t); }
  const r = olc(x, f);
  ok("zayıf temelli ses (2. harmonik baskın): oktav hatası yok", Math.abs(r.med) < 50, r.med.toFixed(1));
}
{
  // /u/ ünlüsünde düşük perde (F1 temel üzerinde): erkek E2–G2
  for (const n of ["E2", "G2"]) {
    const f = N.mtof(N.parse(n));
    const x = S.uret(SR, 0.8, { f0: f, tip: "erkek", unlu: "i", gurluk: 1 });
    const r = olc(x, f);
    ok(`erkek ${n} /i/ oktav hatası yok`, Math.abs(r.med) < 50 && r.max < 50, r.max.toFixed(1));
  }
  // izle() ile bütün bir sesli bölümde hiçbir kare oktav kaymasın
  const f = N.mtof(N.parse("A2"));
  const x = S.uret(SR, 1.5, { f0: f, tip: "erkek", unlu: "u", gurluk: 0.5, nefes: 0.08 });
  const kar = P.izle(x, SR).filter((k) => k.sesli);
  const kotu = kar.filter((k) => Math.abs(k.midi - N.ftom(f)) > 0.5).length;
  ok("izle(): A2 /u/ boyunca oktav sıçraması yok", kotu === 0 && kar.length > 100, `${kotu}/${kar.length}`);
}

// 4) sessizlik ve gürültü: perde vermemeli
{
  const sessiz = new Float32Array(SR);
  ok("sessizlikte perde yok", P.izle(sessiz, SR).every((k) => !k.sesli));
  const rand = S.rng(5);
  const gur = new Float32Array(SR * 2).map(() => rand() * 0.3);
  const kg = P.izle(gur, SR);
  ok("beyaz gürültüde perde yok", kg.filter((k) => k.sesli).length === 0, kg.filter((k) => k.sesli).length + " sesli kare");
  // "sss": bant geçiren gürültü
  const sss = S.ezgi(SR, [{ m: 60, d: 1, c: "sss" }]).data.slice(Math.round(SR * 0.05), Math.round(SR * 0.36));
  ok("'sss' sesinde perde yok", P.izle(sss, SR).filter((k) => k.sesli).length === 0);
  // hafif gürültü üstünde ünlü: ölçülür
  const x = S.uret(SR, 1, { f0: 220, tip: "kadin", unlu: "a" });
  for (let i = 0; i < x.length; i++) x[i] += rand() * 0.01;
  const r = olc(x, 220);
  ok("hafif gürültü üstünde ünlü yine ±3 sent", r.max <= 3, r.max.toFixed(2));
}

// 5) sessiz harfli ezgi: sessiz harfte boşluk, ünlüde doğru perde, boşlukta titreme yok
{
  const notalar = [{ m: 62, d: 0.5, u: "a" }, { m: 64, d: 0.5, u: "e", c: "s" }, { m: 65, d: 0.5, u: "i", c: "t" }, { r: 0.3 }, { m: 67, d: 0.6, u: "o", c: "ş" }];
  const r = S.ezgi(SR, notalar, { tip: "kadin" });
  const kar = P.izle(r.data, SR);
  let hata = 0, bosluk = 0, titreme = 0;
  r.olaylar.forEach((o) => {
    const ic = kar.filter((k) => k.t > o.t0 + 0.08 && k.t < o.t1 - 0.06);
    if (o.u) ic.forEach((k) => { if (!k.sesli || Math.abs(k.midi - o.m) > 0.25) hata++; });
    if ((o.sessiz && "stşkç".includes(o.sessiz)) || o.sus) {
      const tam = kar.filter((k) => k.t > o.t0 + 0.035 && k.t < o.t1 - 0.035);
      bosluk += tam.length; titreme += tam.filter((k) => k.sesli).length;
    }
  });
  ok("ezgide ünlüler doğru perdede", hata === 0, hata + " hatalı kare");
  ok("sessiz harf ve suslarda perde yok (boşluk)", titreme === 0 && bosluk > 5, `${titreme}/${bosluk}`);
}
