/* Mikrofon testleri için WAV dosyaları: sentezlenmiş ünlüler, vibratolu ses, siren, sessiz harfli ezgi.
   Kullanım: node tools/wav_uret.js <klasör> */
const fs = require("fs"), path = require("path");
const S = require("../js/ses.js"), N = require("../js/notalar.js");
const out = require.main === module ? process.argv[2] || "wav" : ".";
if (require.main === module) fs.mkdirSync(out, { recursive: true });
const SR = 48000;
function wav(file, data) {
  const b = Buffer.alloc(44 + data.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data.length * 2, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(data.length * 2, 40);
  let mx = 0; for (const v of data) mx = Math.max(mx, Math.abs(v));
  const k = 0.7 / (mx || 1);
  for (let i = 0; i < data.length; i++) b.writeInt16LE(Math.round(data[i] * k * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(out, file), b);
}
const DOSYALAR = {
  // 1) ünlüler: kadın La3 (57) üstünde a e ı i o ö u ü, her biri 1 sn, arada 0,3 sn sus
  "unluler.wav": () => S.ezgi(SR, S.Formant.UNLULER.flatMap((u) => [{ m: 57, d: 1, u }, { r: 0.3 }]), { tip: "kadin" }).data,
  // 2) vibratolu uzun ses: Sol3 (55), 6 sn, 5,8 Hz ±55 sent
  "vibrato.wav": () => S.ezgi(SR, [{ m: 55, d: 6, u: "a", vib: { hiz: 5.8, gen: 55 } }, { r: 0.6 }], { tip: "erkek" }).data,
  // 3) siren: Do3'ten Sol4'e çıkıp inen sürekli kayma (aralık ölçer için uçlarda 0,8 sn bekler)
  "siren.wav": () => {
    const n = [{ m: 48, d: 0.9, u: "u" }];
    for (let i = 1; i <= 38; i++) n.push({ f: N.mtof(48 + (19 * i) / 38), d: 0.07, u: "u", glide: 0.05 });
    n.push({ m: 67, d: 0.9, u: "u" });
    for (let i = 37; i >= 0; i--) n.push({ f: N.mtof(48 + (19 * i) / 38), d: 0.07, u: "u", glide: 0.05 });
    n.push({ r: 0.6 });
    return S.ezgi(SR, n, { tip: "erkek" }).data;
  },
  // 4) sessiz harfli ezgi: "sa-bah o-lur, gün do-ğar" (Re4 Mi4 Fa4 Sol4 …), sessiz harfler ve suslar
  "ezgi.wav": () => S.ezgi(SR, [
    { m: 62, d: 0.5, u: "a", c: "s" }, { m: 64, d: 0.5, u: "a", c: "b" }, { r: 0.25 }, { m: 65, d: 0.5, u: "o" }, { m: 67, d: 0.7, u: "u", c: "l" },
    { r: 0.35 }, { m: 69, d: 0.6, u: "ü", c: "g" }, { m: 67, d: 0.5, u: "o", c: "d" }, { m: 65, d: 0.8, u: "a", c: "ğ" }, { r: 0.6 }], { tip: "kadin" }).data,
  // 5) sabit nota (perde eşleme): Fa3–Do5 aralığının … verilen notada 30 sn
};
module.exports = { wav, DOSYALAR };
if (require.main === module) for (const [ad, f] of Object.entries(DOSYALAR)) { wav(ad, f()); console.log("yazıldı:", path.join(out, ad)); }
