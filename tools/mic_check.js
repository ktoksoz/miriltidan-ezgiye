/* Mikrofon testleri: headless Chromium'a sahte ses girişi (WAV) verilir:
     --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>
   Sitenin gerçek yolu sınanır: getUserMedia → AudioWorklet (YIN) → Takipçi → perde eğrisi / ölçerler / arayüz.
   Test sesleri js/ses.js ile sentezlenir (tools/wav_uret.js): ünlüler, vibratolu ses, siren, sessiz harfli ezgi,
   perde eşleme için sabit nota.
   Kullanım: NODE_PATH=… node tools/mic_check.js [port] [geçici klasör] */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright-core");
const S = require("../js/ses.js");
const N = require("../js/notalar.js");
const { wav, DOSYALAR } = require("./wav_uret.js");
const EXE = process.env.CHROME || path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const port = process.argv[2] || "8857";
const tmp = process.argv[3] || "wav";
const BASE = process.env.BASE || `http://localhost:${port}/`;
fs.mkdirSync(tmp, { recursive: true });
process.chdir(tmp);
for (const [ad, f] of Object.entries(DOSYALAR)) if (!fs.existsSync(ad)) wav(ad, f());
// perde eşleme için: varsayılan aralıkta (Fa3–Do5) ilk hedef nota Do♯4 (61); 40 sn sabit ses
wav("sabit61.wav", S.ezgi(48000, [{ m: 61, d: 40, u: "a" }], { tip: "kadin" }).data);
wav("sabit61-pes30.wav", S.ezgi(48000, [{ f: N.mtof(61 - 0.3), d: 40, u: "a" }], { tip: "kadin" }).data);

let hata = 0;
const ok = (ad, kosul, ek = "") => { console.log(`${kosul ? "✓" : "✗"} ${ad}${ek ? "  (" + ek + ")" : ""}`); if (!kosul) hata++; };

async function sayfa(wavDosya, hash, fn, { prefs = {} } = {}) {
  const browser = await chromium.launch({ executablePath: EXE, args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
    "--use-file-for-fake-audio-capture=" + path.resolve(wavDosya), "--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ permissions: ["microphone"], viewport: { width: 1440, height: 860 } });
  const page = await ctx.newPage();
  const logs = [];
  page.on("pageerror", (e) => logs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") logs.push(m.text()); });
  await page.addInitScript((p) => {
    try { localStorage.setItem("san.rehber.kapali", "1"); Object.entries(p).forEach(([k, v]) => localStorage.setItem("san." + k, JSON.stringify(v))); } catch (e) {}
  }, prefs);
  await page.goto(BASE + "index.html#" + hash);
  await page.waitForTimeout(900);
  try { return await fn(page); } finally { if (logs.length) { console.log("   konsol:", logs.slice(0, 5).join(" | ")); hata++; } await browser.close(); }
}
// sayfada: mikrofonu aç, sn saniye kare topla
const topla = (page, sn) => page.evaluate(async (sn) => {
  Snd.unlock();
  const ok = await Mic.start();
  const ks = [];
  const off = Mic.onFrame((k) => ks.push({ t: k.t, sesli: k.sesli, midi: k.midi, ham: k.ham, ham0: k.ham0, db: k.db }));
  await new Promise((r) => setTimeout(r, sn * 1000));
  off();
  return { ok, yol: Mic.yol, ks };
}, sn);

(async () => {
  // 1) ünlüler: La3 (57) üstünde sekiz ünlü → bütün sesli kareler 57 ±10 sent
  await sayfa("unluler.wav", "perde-esleme", async (page) => {
    const r = await topla(page, 7);
    const s = r.ks.filter((k) => k.sesli);
    const kotu = s.filter((k) => Math.abs(k.midi - 57) > 0.1).length;
    ok("mikrofon açıldı (" + r.yol + ")", r.ok);
    ok("ünlüler: sesli karelerin %99'u La3 ±10 sent", s.length > 200 && kotu <= s.length * 0.01, `${s.length} sesli kare, ${kotu} sapan`);
    // sessizlik (ünlüler arası 0,3 sn) boşluk olarak kalmalı: sesliden sessize geçiş sayısı ~ ünlü sayısı
    let gecis = 0; for (let i = 1; i < r.ks.length; i++) if (r.ks[i - 1].sesli && !r.ks[i].sesli) gecis++;
    ok("ünlüler arası sessizlik boşluk (titreme yok)", gecis >= 4 && gecis <= 7, `${gecis} kesinti / 7 sn`);
  });
  // 2) vibrato: Sol3, 5,8 Hz ±55 sent
  await sayfa("vibrato.wav", "kapak", async (page) => {
    const r = await topla(page, 9);
    const v = await page.evaluate((ks) => Analiz.vibrato(ks), r.ks);
    ok("vibrato: merkez Sol3 ±10 sent", v && Math.abs(v.merkez - 55) <= 0.1, v && ((v.merkez - 55) * 100).toFixed(1) + " sent");
    ok("vibrato: hız 5,8 Hz ±0,3", v && Math.abs(v.hiz - 5.8) <= 0.3, v && v.hiz.toFixed(2) + " Hz");
    ok("vibrato: genişlik ±55 sent ±%20", v && Math.abs(v.genislik - 55) <= 11, v && v.genislik.toFixed(1) + " sent");
  });
  // 3) siren: Do3 → Sol4 → Do3, uçlarda 0,9 sn → aralık ölçer 48–67
  await sayfa("siren.wav", "kapak", async (page) => {
    const r = await topla(page, 8);
    const a = await page.evaluate((ks) => { const o = Analiz.AralikOlcer(); ks.forEach((k) => o.push(k)); return [o.lo, o.hi]; }, r.ks);
    ok("siren: aralık ölçer en pes Do3 (48)", a[0] === 48, String(a[0]));
    ok("siren: aralık ölçer en tiz Sol4 (67)", a[1] === 67, String(a[1]));
    const kr = await page.evaluate((ks) => Analiz.kirilmalar(ks).length, r.ks);
    ok("kırılmasız sirende kırılma yok", kr === 0, kr + " kırılma");
  });
  // 4) sessiz harfli ezgi: ünlülerde doğru nota, sessiz harf ve suslarda boşluk
  await sayfa("ezgi.wav", "kapak", async (page) => {
    const r = await topla(page, 7);
    const s = r.ks.filter((k) => k.sesli);
    const notalar = [62, 64, 65, 67, 69];
    const uzak = s.filter((k) => notalar.every((n) => Math.abs(k.midi - n) > 0.3)).length;
    ok("ezgi: sesli karelerin %95'i ezgi notalarına ±30 sent", uzak <= s.length * 0.05, `${uzak}/${s.length} uzak`);
    let gecis = 0; for (let i = 1; i < r.ks.length; i++) if (r.ks[i - 1].sesli && !r.ks[i].sesli) gecis++;
    ok("ezgi: sessiz harf ve suslarda boşluk var", gecis >= 4, gecis + " kesinti");
  });
  // 5) perde eşleme arayüzü: hedef Do♯4; sabit Do♯4 söyleyen ses → yüksek isabet; 30 sent pes → "pes" sapma
  for (const [dosya, beklenen] of [["sabit61.wav", "tam"], ["sabit61-pes30.wav", "pes"]]) {
    await sayfa(dosya, "perde-esleme", async (page) => {
      await page.evaluate(() => { Math.random = () => 0.5; });
      await page.click("#perde-esleme .stage .btn.primary");
      // 3 deneme × (2,2 dinle + 0,7 + 2,2 söyle + ~1,3) ≈ 20 sn
      await page.waitForFunction(() => document.querySelectorAll("#perde-esleme .olcum b")[0] && /3\. deneme/.test(document.querySelector("#perde-esleme .olcum small").textContent), null, { timeout: 40000 });
      const t = await page.$$eval("#perde-esleme .olcum b", (b) => b.map((x) => x.textContent));
      const yuzde = parseInt(t[0].replace("%", ""));
      if (beklenen === "tam") ok("perde eşleme: tam üstünde söyleyen ses → %80+", yuzde >= 80, t.join(" · "));
      else ok("perde eşleme (±50 sent seviyesinde) 30 sent pes → bantta ama sapma pes", /−/.test(t[1]) && Math.abs(parseInt(t[1].replace(/[^\d]/g, "")) - 30) <= 8, t.join(" · "));
    });
  }
  console.log(hata ? `\n${hata} sorun` : "\nBütün mikrofon testleri geçti");
  process.exitCode = hata ? 1 : 0;
})();
