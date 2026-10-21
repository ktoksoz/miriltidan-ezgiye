/* Spektrogram: eski sonagraf çıktısı gibi kâğıt üstünde grafit izler (renkli ısı haritası değil).
   Canlı (mikrofon çözümleyicisinden, sağdan sola akar) ya da durağan (hazır bir sinyalden) çizer.
   Kullanım: const sp = Spektrogram(kap, { fmax: 5000, bant: [2500, 3500] });
             sp.canli(Mic.analyser) … sp.durdur();   ya da   sp.ciz(veri, sr) */
(function () {
  const { h, C, FONT, rgba } = L;
  function Spektrogram(parent, opts = {}) {
    const o = Object.assign({ fmax: 5000, bant: null, bantAd: "şarkıcı formantı", taban: -95, tavan: -25, sure: 6, eksen: true, formantlar: null }, opts);
    const el = h("div.spektrogram");
    const cv = h("canvas", { role: "img", "aria-label": "Spektrogram: yatay eksen zaman, dikey eksen frekans; koyu izler güçlü frekanslar" });
    el.append(cv);
    (parent.append ? parent : parent.el).append(el);
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; tampon = null; if (sonVeri) ciz(sonVeri.x, sonVeri.sr); else zemin(); }, { willReadFrequently: true });
    const ctx = S.ctx;
    const SOL = o.eksen ? 46 : 0;
    let tampon = null, tctx = null, an = null, buf = null, raf = 0, sonVeri = null;
    const y = (f) => H - 14 - (f / o.fmax) * (H - 22);
    function renk(db) {
      const t = Math.max(0, Math.min(1, (db - o.taban) / (o.tavan - o.taban)));
      // kâğıt → grafit: düşük enerji neredeyse görünmez
      const a = Math.pow(t, 1.6);
      return a;
    }
    function zemin() {
      if (!W) return;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      eksen();
    }
    function eksen() {
      if (!o.eksen) return;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, SOL, H);
      for (let f = 0; f <= o.fmax; f += 1000) {
        const yy = Math.round(y(f)) + 0.5;
        ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(SOL, yy); ctx.lineTo(W, yy); ctx.stroke();
        L.text(ctx, f ? f / 1000 + " kHz" : "0", SOL - 6, yy + 4, { size: 11, color: C.muted, align: "right", weight: 600, font: FONT.mono });
      }
      if (o.bant) {
        const y1 = y(o.bant[1]), y0 = y(o.bant[0]);
        ctx.fillStyle = rgba(C.fosfor, 0.22); ctx.fillRect(SOL, y1, W - SOL, y0 - y1);
        ctx.strokeStyle = rgba(C.fosforInk, 0.5); ctx.setLineDash([5, 4]);
        ctx.strokeRect(SOL + 0.5, Math.round(y1) + 0.5, W - SOL - 1, Math.round(y0 - y1));
        ctx.setLineDash([]);
        L.text(ctx, o.bantAd, W - 8, y1 - 5, { size: 12, color: C.ink2, align: "right", weight: 700 });
      }
      if (o.formantlar) o.formantlar.forEach((f, i) => {
        const yy = y(f);
        ctx.strokeStyle = rgba(C.pes, 0.7); ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(SOL, yy); ctx.lineTo(W, yy); ctx.stroke(); ctx.setLineDash([]);
        L.text(ctx, "F" + (i + 1), SOL + 4, yy - 4, { size: 11, color: C.pes, weight: 700 });
      });
    }
    // bir sütunu çiz (dB dizisi, bin genişliği)
    function sutun(c, x, w, db, binHz) {
      const kMax = Math.min(db.length - 1, Math.ceil(o.fmax / binHz));
      for (let k = 1; k <= kMax; k++) {
        const a = renk(db[k]);
        if (a < 0.03) continue;
        const y0 = y(k * binHz + binHz / 2), y1 = y(k * binHz - binHz / 2);
        c.fillStyle = rgba(C.ink, a * 0.92);
        c.fillRect(x, y0, w, Math.max(1, y1 - y0));
      }
    }
    /* Durağan: x sinyalinin tamamı (ör. sentezlenmiş ünlü) */
    function ciz(x, sr) {
      sonVeri = { x, sr };
      if (!W) return;
      zemin();
      const n = 2048, hop = Math.max(128, Math.floor((x.length - n) / Math.max(1, (W - SOL) / 2)));
      const cols = Math.floor((x.length - n) / hop);
      const cw = (W - SOL) / Math.max(1, cols);
      for (let i = 0; i < cols; i++) {
        const sp = Analiz.spektrum(x.subarray(i * hop, i * hop + n), sr);
        sutun(ctx, SOL + i * cw, cw + 0.6, sp.db, sp.binHz);
      }
      eksen();
    }
    /* Canlı: analyser (Mic.analyser) */
    function canli(analyser) {
      an = analyser;
      buf = new Float32Array(an.frequencyBinCount);
      sonVeri = null;
      zemin();
      cancelAnimationFrame(raf);
      const adim = () => {
        raf = requestAnimationFrame(adim);
        if (!an || !W) return;
        an.getFloatFrequencyData(buf);
        // sola kaydır
        const px = 2;
        const img = ctx.getImageData(Math.round((SOL + px) * S.dpr), 0, Math.round((W - SOL - px) * S.dpr), Math.round(H * S.dpr));
        ctx.putImageData(img, Math.round(SOL * S.dpr), 0);
        ctx.fillStyle = C.kagit; ctx.fillRect(W - px, 0, px, H);
        sutun(ctx, W - px, px, buf, an.context.sampleRate / an.fftSize);
        eksen();
      };
      adim();
    }
    function durdur() { cancelAnimationFrame(raf); an = null; }
    window.addEventListener("themechange", () => (sonVeri ? ciz(sonVeri.x, sonVeri.sr) : zemin()));
    return { el, ciz, canli, durdur, zemin, set(k, v) { o[k] = v; sonVeri ? ciz(sonVeri.x, sonVeri.sr) : zemin(); } };
  }
  window.Spektrogram = Spektrogram;
})();
