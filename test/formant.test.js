/* Formant tablosu: kaynakla (Malkoç 2009) tutarlılık, sentezin bu değerleri kullanması, LPC ile geri ölçüm */
const { eq, ok } = require("./_t.js");
const F = require("../js/data/formantlar.js");
const S = require("../js/ses.js");
const A = require("../js/analiz.js");
// Malkoç (2009) Dil Dergisi 146, Tablo 1: kaynaktan bağımsız olarak buraya yeniden yazıldı
const MALKOC = {
  erkek: { a: [642, 1128], e: [470, 1866], ı: [396, 1500], i: [306, 2111], o: [483, 860], ö: [469, 1510], u: [379, 980], ü: [333, 1769] },
  kadin: { a: [771, 1338], e: [578, 2205], ı: [492, 1629], i: [430, 2591], o: [564, 959], ö: [543, 1636], u: [452, 961], ü: [424, 1938] },
};
for (const tip of ["erkek", "kadin"]) for (const u of F.UNLULER)
  eq(`${tip} /${u}/ F1–F2 kaynakla aynı`, F.KAYNAK[tip][u].slice(0, 2), MALKOC[tip][u]);
// sentez tablosu kaynağın F1–F3'ünü kullanıyor
let fark = 0;
for (const tip of ["erkek", "kadin", "cocuk"]) for (const u of F.UNLULER) {
  const s = F.sentez(tip, u);
  for (let i = 0; i < 3; i++) fark = Math.max(fark, Math.abs(s[i][0] - F.KAYNAK[tip][u][i]));
}
eq("sentez F1–F3 = kaynak", fark, 0);
// dil bilgisi: ince ünlülerin F2'si kalın eşinden yüksek, geniş ünlülerin F1'i dar eşinden yüksek
for (const tip of ["erkek", "kadin", "cocuk"]) {
  const K = F.KAYNAK[tip];
  ok(`${tip}: ince ünlülerde F2 yüksek (e>a, i>ı, ö>o, ü>u)`, K.e[1] > K.a[1] && K.i[1] > K.ı[1] && K.ö[1] > K.o[1] && K.ü[1] > K.u[1]);
  ok(`${tip}: geniş ünlülerde F1 yüksek (a>ı, e>i, o>u, ö>ü)`, K.a[0] > K.ı[0] && K.e[0] > K.i[0] && K.o[0] > K.u[0] && K.ö[0] > K.ü[0]);
}
// sentezlenen ünlünün spektrum zarfında F1 ve F2 tabloya yakın (LPC; düşük perdede)
for (const u of ["a", "e", "o", "i"]) {
  const f = F.KAYNAK.erkek[u];
  const x = S.uret(48000, 0.5, { f0: 100, tip: "erkek", unlu: u, nefes: 0.02 });
  const ft = A.formantTahmin(x.subarray(8000, 10048), 48000);
  ok(`sentez erkek /${u}/: LPC F1 ±%15 ya da ±60 Hz`, Math.abs(ft.formantlar[0] - f[0]) <= Math.max(60, f[0] * 0.15), ft.formantlar[0] + " / " + f[0]);
  ok(`sentez erkek /${u}/: LPC F2 ±%15`, Math.abs(ft.formantlar[1] - f[1]) <= f[1] * 0.15, ft.formantlar[1] + " / " + f[1]);
}
