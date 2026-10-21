/* 7. Rezonans ve tını: deneyler */
(function () {
  const { h, s, C, FONT, seg, ibtn, nn, rgba, clamp, fmtNum, fmtHz } = L;
  const tipSec = () => (L.prefs.sesBolge === "pes" ? "erkek" : L.prefs.sesBolge === "tiz" ? "kadin" : Aralik.get().lo < 52 ? "erkek" : "kadin");
  const azHareket = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dB = (v) => 20 * Math.log10(v + 1e-12);

  // Canlı sentez sesi için "Dinle / Durdur" düğmesi. opts.dest: ses zinciri (varsa)
  function Calar(param, cls = "", { zincir } = {}) {
    let ctl = null, z = null;
    const btn = ibtn("play", "Dinle", () => (ctl ? dur() : bas()), cls);
    function bas() {
      Snd.unlock();
      const c = Snd.ready(); if (!c) return;
      z = zincir ? zincir(c) : null;
      ctl = Ses.canli(param(), z ? { dest: z.giris } : {});
      if (!ctl) return;
      btn.setLabel("Durdur"); btn.setIcon("stop");
      api.onBas && api.onBas(ctl);
    }
    function dur() {
      if (ctl) ctl.stop();
      const eski = z;
      if (eski) setTimeout(() => eski.kapat(), 400);
      ctl = null; z = null;
      btn.setLabel("Dinle"); btn.setIcon("play");
    }
    const api = { btn, bas, dur, set(p) { if (ctl && ctl.stopped) dur(); else if (ctl) ctl.set(p); }, get ctl() { return ctl; }, get zincir() { return z; } };
    return api;
  }

  /* ---------------- Ünlü düzeltme ---------------- */
  const UNLU5 = ["a", "e", "i", "o", "u"];
  const KS = Ses.kaynakSpektrum(0.6, 48); // sentezin varsayılan açık faz oranı
  window.Demos.unluDuzeltme = (stage) => {
    let tip = tipSec(), unlu = "a", ac = false;
    const sinir = () => (tip === "erkek" ? [43, 72] : [55, 84]); // Sol2–Do5 / Sol3–Do6
    let perde = tip === "erkek" ? 52 : 64;
    // ünlü açılınca: kadın sesinde F1 perdenin hemen üstüne (R1:f0), erkek sesinde 2×f0'ın üstüne (R1:2f0)
    function formantlar(m = perde, acik = ac) {
      const fs = Ses.hedefFormant({ tip, unlu });
      if (!acik) return fs;
      const hedef = (tip === "erkek" ? 2 : 1) * N.mtof(m) * 1.05;
      if (hedef > fs[0][0]) {
        fs[0][0] = hedef;
        if (fs[1][0] < hedef * 1.3) fs[1][0] = hedef * 1.3;
        for (let i = 2; i < fs.length; i++) if (fs[i][0] < fs[i - 1][0] + 300) fs[i][0] = fs[i - 1][0] + 300;
      }
      return fs;
    }
    function duzey(m, acik) {
      const f0 = N.mtof(m), fs = formantlar(m, acik);
      let t = 0;
      for (let k = 1; k <= KS.length && k * f0 < 5500; k++) { const a = KS[k - 1] * Ses.filtreYaniti(fs, k * f0); t += a * a; }
      return 10 * Math.log10(t);
    }
    let egriler = null;
    function egriHesapla() {
      const [lo, hi] = sinir(), kap = [], acik = [];
      for (let m = lo; m <= hi + 1e-9; m += 0.25) { kap.push([m, duzey(m, false)]); acik.push([m, duzey(m, true)]); }
      const mx = Math.max(...kap.map((x) => x[1]), ...acik.map((x) => x[1]));
      egriler = { kap, acik, mx, lo, hi };
    }
    const param = () => ({ f0: N.mtof(perde), tip, unlu, formantlar: formantlar(), gurluk: 0.7, vibGen: 0, jitter: 0.002 });
    const kazanc = () => clamp(Math.pow(10, (duzey(perde, ac) - egriler.mx) / 20), 0.04, 1);
    const cal = Calar(param, "primary");
    cal.onBas = (ctl) => ctl.out.gain.setValueAtTime(kazanc(), Snd.ctx.currentTime);
    const sesGuncelle = () => { cal.set(param()); if (cal.ctl) cal.ctl.out.gain.setTargetAtTime(kazanc(), Snd.ctx.currentTime, 0.05); };
    const acBtn = L.btn("Ünlüyü aç", () => { ac = !ac; acBtn.classList.toggle("on", ac); acBtn.setAttribute("aria-pressed", ac); sesGuncelle(); ciz(); });
    acBtn.setAttribute("aria-pressed", "false");
    const unluSeg = seg(UNLU5.map((u) => [u, "“" + u + "”"]), unlu, (u) => { unlu = u; egriHesapla(); sesGuncelle(); ciz(); }, "Ünlü");
    const tipSeg = seg([["kadin", "Kadın sesi"], ["erkek", "Erkek sesi"]], tip, (k) => { tip = k; aralikAyarla(true); egriHesapla(); sesGuncelle(); ciz(); }, "Ses");
    const perdeSl = L.slider({ label: "Perde", min: sinir()[0], max: sinir()[1], step: 0.5, value: perde, fmt: (v) => nn(Math.round(v)) + " · " + fmtHz(N.mtof(v)), width: "180px", oninput: (v) => { perde = v; sesGuncelle(); ciz(); } });
    const cv = h("canvas", { role: "img", "aria-label": "Harmonikler, formant eğrisi ve perdeye göre çıkan ses düzeyi" });
    const sayfa = h("div.sheet.ud-sayfa", cv);
    const olcum = h("div.olcumler");
    stage.append(h("div.controls", cal.btn, acBtn, unluSeg), h("div.controls", perdeSl, h("span.spacer"), tipSeg), sayfa, olcum);

    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; ciz(); });
    function ciz() {
      if (!W || !egriler) return;
      const ctx = S.ctx, f0 = N.mtof(perde), fs = formantlar(), fs0 = Ses.hedefFormant({ tip, unlu });
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      const FM = tip === "erkek" ? 2500 : 3200;
      const sol = 44, sag = W - 12;
      // 1) spektrum: formant eğrisi + harmonikler
      const u1 = 24, a1 = H * 0.58 - 22, DBUST = 45, DBALT = -25;
      const xf = (f) => sol + (f / FM) * (sag - sol);
      const yd = (d) => u1 + ((DBUST - clamp(d, DBALT, DBUST)) / (DBUST - DBALT)) * (a1 - u1);
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
      for (let d = 40; d >= DBALT; d -= 20) { const yy = Math.round(yd(d)) + 0.5; ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(sag, yy); ctx.stroke(); L.text(ctx, d + " dB", sol - 5, yy + 4, { size: 10, color: C.muted, align: "right", font: FONT.mono }); }
      for (let f = 0; f <= FM; f += 1000) L.text(ctx, f ? f / 1000 + " kHz" : "0", xf(f), a1 + 14, { size: 10, color: C.muted, align: "center", font: FONT.mono });
      // açılmadan önceki filtre (soluk) ve şimdiki
      const filtre = (fsx, renk, lw, kesik) => {
        ctx.strokeStyle = renk; ctx.lineWidth = lw; ctx.setLineDash(kesik ? [4, 4] : []); ctx.beginPath();
        for (let i = 0; i <= 300; i++) { const f = 30 + (i / 300) * (FM - 30), yy = yd(dB(Ses.filtreYaniti(fsx, f))); i ? ctx.lineTo(xf(f), yy) : ctx.moveTo(xf(f), yy); }
        ctx.stroke(); ctx.setLineDash([]);
      };
      if (ac) filtre(fs0, rgba(C.grafit, 0.6), 1.2, true);
      filtre(fs, C.pes, 1.8, false);
      ctx.lineCap = "round";
      for (let k = 1; k * f0 < FM; k++) {
        const d = dB(KS[k - 1] || 1e-6) + dB(Ses.filtreYaniti(fs, k * f0));
        ctx.strokeStyle = C.ink; ctx.lineWidth = k === 1 ? 3.2 : 2.4;
        ctx.beginPath(); ctx.moveTo(xf(k * f0), a1); ctx.lineTo(xf(k * f0), yd(d)); ctx.stroke();
      }
      ctx.strokeStyle = C.pes; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(xf(fs[0][0]), u1); ctx.lineTo(xf(fs[0][0]), a1); ctx.stroke(); ctx.setLineDash([]);
      L.text(ctx, "F1", xf(fs[0][0]) + 4, u1 + 10, { size: 12, color: C.pes, weight: 800 });
      L.text(ctx, "f0 " + fmtHz(f0), xf(f0) + 6, a1 - 8, { size: 11, color: C.ink, weight: 700 });
      L.text(ctx, "harmonikler (çizgiler) ve ağzın filtresi (eğri), \"" + unlu + "\"", sol, 14, { size: 12, color: C.muted, weight: 700 });
      // 2) perdeye göre çıkan ses düzeyi
      const u2 = H * 0.58 + 30, a2 = H - 22, DB2 = 30;
      const { kap, acik, mx, lo, hi } = egriler;
      const xm = (m) => sol + ((m - lo) / (hi - lo)) * (sag - sol);
      const y2 = (d) => u2 + (clamp(mx - d, 0, DB2) / DB2) * (a2 - u2);
      ctx.fillStyle = rgba(C.porte, 0.7); ctx.fillRect(sol - 0.5, u2 - 4, 1.5, a2 - u2 + 8);
      [0, -10, -20, -30].forEach((d) => L.text(ctx, d + " dB", sol - 5, y2(mx + d) + 4, { size: 10, color: C.muted, align: "right", font: FONT.mono }));
      for (let m = Math.ceil(lo / 12) * 12; m <= hi; m += 12) L.text(ctx, nn(m), xm(m), a2 + 14, { size: 10, color: C.muted, align: "center", font: FONT.mono, weight: 700 });
      // f0 (ya da 2·f0) F1'i nerede geçiyor
      const k = tip === "erkek" ? 2 : 1, mGec = N.ftom(fs0[0][0] / k);
      if (mGec > lo && mGec < hi) {
        ctx.strokeStyle = rgba(C.pes, 0.7); ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xm(mGec), u2 - 4); ctx.lineTo(xm(mGec), a2); ctx.stroke(); ctx.setLineDash([]);
        L.text(ctx, (k === 2 ? "2×f0" : "f0") + " = F1", xm(mGec) + 4, a2 - 4, { size: 11, color: C.pes, weight: 700 });
      }
      const cizgi = (ps, renk, lw) => { ctx.strokeStyle = renk; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.beginPath(); ps.forEach(([m, d], i) => (i ? ctx.lineTo(xm(m), y2(d)) : ctx.moveTo(xm(m), y2(d)))); ctx.stroke(); };
      cizgi(acik, ac ? C.tam : rgba(C.tam, 0.4), ac ? 2.4 : 1.4);
      cizgi(kap, ac ? rgba(C.ink, 0.35) : C.ink, ac ? 1.4 : 2.4);
      const dSimdi = duzey(perde, ac);
      ctx.fillStyle = ac ? C.tam : C.ink;
      ctx.beginPath(); ctx.arc(xm(perde), y2(dSimdi), 5, 0, Math.PI * 2); ctx.fill();
      L.text(ctx, "çıkan ses düzeyi, perdeye göre: ünlü olduğu gibi (mürekkep) · açılmış (yeşil)", sol, u2 - 6, { size: 12, color: C.muted, weight: 700 });
      olcumYaz(f0, fs, dSimdi - mx);
    }
    function olcumYaz(f0, fs, rel) {
      olcum.innerHTML = "";
      olcum.append(
        h("div.olcum", h("b", fmtHz(f0)), h("small", "temel frekans (f0)")),
        h("div.olcum" + (ac ? ".tam" : ""), h("b", fmtHz(fs[0][0])), h("small", ac ? "F1 (açılmış)" : "F1 (\"" + unlu + "\")")),
        h("div.olcum", h("b", (rel < -0.5 ? "−" : "") + fmtNum(Math.abs(rel), 0) + " dB"), h("small", "çıkan ses (en gür hâline göre)")));
    }
    function aralikAyarla(sifirla) {
      const [lo, hi] = sinir();
      perdeSl.input.min = lo; perdeSl.input.max = hi;
      if (sifirla || perde < lo || perde > hi) perde = tip === "erkek" ? 52 : 64;
      perdeSl.set(perde);
    }
    window.addEventListener("themechange", () => ciz());
    egriHesapla();
    return { enter() { ciz(); }, leave() { cal.dur(); } };
  };
  window.GuideScenarios["unlu-duzeltme"] = [{ slide: "label:Perde", to: 0.8 }, { wait: 700 }, { click: "=Ünlüyü aç" }, { wait: 700 }, { click: "=Ünlüyü aç" }];

  /* ---------------- Açık–kapalı, parlak–koyu ---------------- */
  const SR = 16000, SN = 4;
  const PLOG = [Math.log(300), Math.log(3000)];
  window.Demos.parlakKoyu = (stage) => {
    let tip = tipSec(), unlu = "a", karanlik = 0, acik = 0, sf = 0, aktif = false;
    const f0 = () => (tip === "erkek" ? 110 : 196);
    const param = () => ({ f0: f0(), tip, unlu, karanlik, acik, sf, gurluk: 0.7, vibGen: 0, nefes: 0.015, jitter: 0.002 });
    const cal = Calar(param, "primary");
    const degisti = () => { cal.set(param()); if (gen) gen.set(param()); izEkle(); planla(); };
    const unluSeg = seg(UNLU5.map((u) => [u, "“" + u + "”"]), unlu, (u) => { unlu = u; degisti(); }, "Ünlü");
    const yazi = (v, a, b) => (v < -0.3 ? a : v > 0.3 ? b : "orta");
    const gSl = L.slider({ label: "Gırtlak konumu", min: -1, max: 1, step: 0.05, value: 0, fmt: (v) => yazi(v, "yüksek", "alçak"), oninput: (v) => { karanlik = v; degisti(); } });
    const aSl = L.slider({ label: "Ağız açıklığı", min: -1, max: 1, step: 0.05, value: 0, fmt: (v) => yazi(v, "dar", "geniş"), oninput: (v) => { acik = v; degisti(); } });
    const sSl = L.slider({ label: "Şarkıcı formantı", min: 0, max: 1, step: 0.05, value: 0, fmt: (v) => "%" + Math.round(v * 100), oninput: (v) => { sf = v; degisti(); } });
    const ms = Alistirma.MicSatiri();
    const fl = [];
    const spKap = h("div.sheet.pk-sonagraf");
    const hcv = h("canvas", { role: "img", "aria-label": "Formant haritası: F1 ve F2" });
    const icv = h("canvas", { role: "img", "aria-label": "Parlaklık ibresi: daha koyu ile daha parlak arasında" });
    stage.append(h("div.controls", cal.btn, unluSeg), h("div.controls.pk-sl", gSl, aSl, sSl), spKap,
      h("div.pk-alt", h("div.sheet.pk-harita", hcv), h("div.pk-sag", h("div.sheet.pk-ibre", icv), ms.el)));
    const sp = Spektrogram(spKap, { fmax: 5000, bant: [2400, 3500], bantAd: "şarkıcı formantı bölgesi", formantlar: fl, taban: -66, tavan: -16 });

    // kayan sonagraf: son 4 saniyenin sentezi; ayar değişince yeni parça eklenir
    const buf = new Float32Array(SR * SN);
    let gen = null, sonEk = 0, zamanlayici = 0, sonCiz = 0, merkezSentez = 0, merkezMic = null;
    function ekle(sn) {
      const n = Math.round(SR * sn);
      const x = gen.render(n);
      buf.copyWithin(0, n); buf.set(x, buf.length - n);
    }
    function hazirla() {
      gen = Ses.Uretec(SR, param(), 3); gen.set({ ani: true });
      gen.render(SR); // otomatik kazanç otursun
      ekle(SN); sonEk = performance.now();
    }
    function sonagraf() {
      fl.length = 0;
      Ses.hedefFormant(param()).slice(0, 3).forEach((f) => fl.push(Math.round(f[0])));
      const x = buf.subarray(buf.length - 4096);
      merkezSentez = Analiz.agirlikMerkezi(Analiz.spektrum(x, SR), 5000);
      sp.ciz(buf, SR);
      sonCiz = performance.now();
      haritaCiz(); ibreCiz();
    }
    // değişiklikten ya da çalarken: en çok saniyede 4 kez yeniden çiz
    function planla() {
      if (zamanlayici) return;
      zamanlayici = setTimeout(() => {
        zamanlayici = 0;
        if (!gen) return;
        const sn = clamp((performance.now() - sonEk) / 1000, 0.15, 0.6);
        ekle(sn); sonEk = performance.now();
        sonagraf();
      }, Math.max(0, 250 - (performance.now() - sonCiz)));
    }
    const tik = setInterval(() => { if (aktif && cal.ctl) planla(); }, 250);

    // formant haritası
    let HW = 0, HH = 0, IW = 0, IH = 0;
    const iz = [];
    function izEkle() { const fs = Ses.hedefFormant(param()); iz.push([fs[0][0], fs[1][0]]); if (iz.length > 40) iz.shift(); }
    const HS = L.canvas(hcv, (st) => { HW = st.w; HH = st.h; haritaCiz(); });
    const IS = L.canvas(icv, (st) => { IW = st.w; IH = st.h; ibreCiz(); });
    function haritaCiz() {
      if (!HW) return;
      const ctx = HS.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, HW, HH);
      const sol = 34, sag = HW - 10, ust = 22, alt = HH - 20;
      const F2 = [3000, 600], F1 = [200, 1050];
      const x = (f) => sol + ((Math.log(F2[0]) - Math.log(f)) / (Math.log(F2[0]) - Math.log(F2[1]))) * (sag - sol);
      const y = (f) => ust + ((f - F1[0]) / (F1[1] - F1[0])) * (alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1; ctx.strokeRect(sol + 0.5, ust + 0.5, sag - sol, alt - ust);
      L.text(ctx, "← F2 (ön ünlüler)", sol, HH - 5, { size: 10, color: C.muted, font: FONT.body });
      L.text(ctx, "F1 ↓ (açık)", 4, ust + 12, { size: 10, color: C.muted });
      L.text(ctx, "Formant haritası", sag, 14, { size: 12, color: C.muted, align: "right", weight: 700 });
      Formant.UNLULER.forEach((u) => {
        const f = Formant.sentez(tip, u);
        L.text(ctx, u, x(f[0 + 1][0]), y(f[0][0]) + 5, { size: 15, color: u === unlu ? C.ink : C.grafit, align: "center", weight: u === unlu ? 800 : 500 });
      });
      ctx.strokeStyle = rgba(C.ink, 0.35); ctx.lineWidth = 1.5; ctx.beginPath();
      iz.forEach(([a, b], i) => (i ? ctx.lineTo(x(b), y(a)) : ctx.moveTo(x(b), y(a)))); ctx.stroke();
      const fs = Ses.hedefFormant(param());
      ctx.strokeStyle = C.tiz; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x(fs[1][0]), y(fs[0][0]), 10, 0, Math.PI * 2); ctx.stroke();
    }
    function ibreCiz() {
      if (!IW) return;
      const ctx = IS.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, IW, IH);
      const sol = 16, sag = IW - 16, yy = IH * 0.58;
      const x = (f) => sol + clamp((Math.log(f) - PLOG[0]) / (PLOG[1] - PLOG[0]), 0, 1) * (sag - sol);
      const g = ctx.createLinearGradient(sol, 0, sag, 0);
      g.addColorStop(0, rgba(C.pes, 0.35)); g.addColorStop(1, rgba(C.fosfor, 0.8));
      ctx.fillStyle = g; ctx.fillRect(sol, yy - 5, sag - sol, 10);
      [500, 1000, 2000].forEach((f) => { ctx.fillStyle = C.muted; ctx.fillRect(x(f) - 0.5, yy + 6, 1, 5); L.text(ctx, fmtHz(f), x(f), yy + 22, { size: 10, color: C.muted, align: "center", font: FONT.mono }); });
      L.text(ctx, "daha koyu", sol, 16, { size: 12, color: C.ink2, weight: 700 });
      L.text(ctx, "daha parlak", sag, 16, { size: 12, color: C.ink2, align: "right", weight: 700 });
      const isaret = (f, renk, ad, ustte) => {
        const xx = x(f);
        ctx.fillStyle = renk; ctx.beginPath();
        if (ustte) { ctx.moveTo(xx, yy - 6); ctx.lineTo(xx - 6, yy - 16); ctx.lineTo(xx + 6, yy - 16); }
        else { ctx.moveTo(xx, yy + 6); ctx.lineTo(xx - 6, yy + 16); ctx.lineTo(xx + 6, yy + 16); }
        ctx.closePath(); ctx.fill();
        L.text(ctx, ad + " " + fmtHz(f), clamp(xx, sol + 40, sag - 40), ustte ? yy - 20 : yy + 34, { size: 11, color: renk, align: "center", weight: 700 });
      };
      if (merkezSentez) isaret(merkezSentez, C.ink, "sentez", true);
      if (merkezMic) isaret(merkezMic, C.tam, "siz", false);
      else if (Mic.state === "on") L.text(ctx, "\"aaa\" deyin…", (sol + sag) / 2, IH - 4, { size: 11, color: C.muted, align: "center" });
    }
    // mikrofon: sesli karelerde spektral ağırlık merkezi (yumuşatılmış)
    let mbuf = null;
    const micDongu = L.loop(() => {
      const an = Mic.analyser, son = Mic.son;
      if (Mic.state !== "on" || !an) { if (merkezMic != null) { merkezMic = null; ibreCiz(); } return; }
      if (!son || !son.sesli || son.bekle) return;
      if (!mbuf || mbuf.length !== an.frequencyBinCount) mbuf = new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(mbuf);
      const m = Analiz.agirlikMerkezi({ db: mbuf, binHz: an.context.sampleRate / an.fftSize }, 5000);
      if (!isFinite(m) || m <= 0) return;
      merkezMic = merkezMic == null ? m : merkezMic + (m - merkezMic) * 0.12;
      ibreCiz();
    });
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { tip = tipSec(); cal.set(param()); if (aktif) { hazirla(); sonagraf(); } } });
    window.addEventListener("themechange", () => { haritaCiz(); ibreCiz(); });
    return {
      enter() { aktif = true; if (!gen) { hazirla(); izEkle(); } sonagraf(); micDongu.start(); },
      leave() { aktif = false; cal.dur(); micDongu.stop(); clearTimeout(zamanlayici); zamanlayici = 0; merkezMic = null; },
    };
  };
  window.GuideScenarios["parlak-koyu"] = [{ slide: "label:Gırtlak konumu", to: 0.95 }, { wait: 700 }, { slide: "label:Gırtlak konumu", to: 0.05 }, { wait: 700 }, { slide: "label:Şarkıcı formantı", to: 0.9 }];

  /* ---------------- Burun sesi ---------------- */
  // yumuşak damağın dönme açısı (derece): kapalı (kalkık, yutak duvarına değer) ↔ açık (sarkık)
  const VELUM = [-39, 39];
  window.Demos.nazalite = (stage) => {
    let tip = tipSec(), ses = "a", nazal = 0, tikali = false, gorAci = VELUM[0];
    const nz = () => (ses === "m" ? 0.9 : nazal);
    const param = () => (ses === "m"
      ? { f0: tip === "erkek" ? 130 : 220, tip, formantlar: Ses.SESSIZ.m.formant, nazal: 0.9, gurluk: 0.45, vibGen: 0 }
      : { f0: tip === "erkek" ? 130 : 220, tip, unlu: ses, formantlar: null, nazal, gurluk: 0.7, vibGen: 0, jitter: 0.002 });
    // ses zinciri: burun tıkalıyken burundan yayılan rezonans azalır (yaklaşık, tepe süzgeci); "m"de ses durur
    const zincir = (c) => {
      const bq = c.createBiquadFilter(); bq.type = "peaking"; bq.frequency.value = 270; bq.Q.value = 1.2; bq.gain.value = 0;
      const g = c.createGain(); g.gain.value = 1;
      bq.connect(g); g.connect(Snd.bus);
      return { giris: bq, bq, g, kapat() { try { bq.disconnect(); g.disconnect(); } catch (e) {} } };
    };
    const cal = Calar(param, "primary", { zincir });
    cal.onBas = () => tikaUygula();
    function tikaUygula() {
      const z = cal.zincir; if (!z) return;
      const t = Snd.ctx.currentTime;
      z.bq.gain.setTargetAtTime(tikali && ses !== "m" ? -16 * nz() : 0, t, 0.04);
      z.g.gain.setTargetAtTime(tikali && ses === "m" ? 0 : 1, t + (tikali ? 0.15 : 0), 0.05);
    }
    const sesSeg = seg([["a", "“a”"], ["i", "“i”"], ["m", "“m” (mırıltı)"]], ses, (k) => { ses = k; cal.set(param()); tikaUygula(); guncelle(); }, "Ses");
    const velSl = L.slider({ label: "Yumuşak damak", min: 0, max: 1, step: 0.02, value: 0, fmt: (v) => (v < 0.15 ? "kalkık (kapalı)" : v > 0.7 ? "inik (açık)" : "yarı açık"), width: "160px",
      oninput: (v) => { nazal = v; if (ses === "m") { ses = "a"; sesSeg.set("a"); } cal.set(param()); tikaUygula(); guncelle(); } });
    const tikaBtn = L.btn("Burnu tıka", () => { tikali = !tikali; tikaBtn.classList.toggle("on", tikali); tikaBtn.setAttribute("aria-pressed", tikali); tikaUygula(); guncelle(); });
    tikaBtn.setAttribute("aria-pressed", "false");

    // stilize yan kesit (yüz sola bakar)
    const ok = s("marker", { id: "nz-ok", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, s("path", { d: "M0 0 L10 5 L0 10 z", fill: "currentColor" }));
    const dil = s("path", { class: "nz-dil" });
    const velum = s("path", { class: "nz-velum", d: "M166 131 C176 133 186 137 196 141" });
    const velumG = s("g", null, velum, s("circle", { cx: 197, cy: 141.5, r: 4.2, class: "nz-kucukdil" }));
    const agizOk = s("path", { class: "nz-ok", d: "M192 280 L192 205 C190 178 160 168 120 160 L52 150", "marker-end": "url(#nz-ok)" });
    const burunOk = s("path", { class: "nz-ok", d: "M192 205 C196 160 194 132 180 118 C150 106 100 110 44 120", "marker-end": "url(#nz-ok)" });
    const agiz = s("ellipse", { cx: 68, cy: 148, rx: 4, ry: 5, class: "nz-agiz" });
    const parmak = s("g", { class: "nz-parmak" }, s("ellipse", { cx: 62, cy: 106, rx: 11, ry: 6.5, transform: "rotate(-30 62 106)" }), s("ellipse", { cx: 64, cy: 133, rx: 11, ry: 6, transform: "rotate(20 64 133)" }),
      s("path", { class: "nz-x", d: "M36 112 L48 126 M48 112 L36 126" }));
    const svg = s("svg", { viewBox: "0 0 300 300", class: "nz-svg", role: "img", "aria-label": "Baş ve boyun yan kesiti: burun yolu, ağız, yumuşak damak ve yutak" },
      s("defs", null, ok),
      s("path", { class: "nz-burun", d: "M72 126 C92 104 136 96 178 108 C186 112 188 120 186 128 C150 126 112 128 80 134 Z" }),
      s("path", { class: "nz-kafa", d: "M112 18 C160 6 236 22 250 92 C262 150 236 186 206 204 L210 292" }),
      s("path", { class: "nz-kafa", d: "M112 18 C88 28 78 52 82 78 C84 88 78 96 70 108 L58 122 C56 128 62 131 70 130 C66 136 66 140 70 142 C64 146 64 150 70 153 C64 158 66 166 72 170 C70 180 72 192 82 198 C96 206 112 208 122 212 C126 236 128 262 126 292" }),
      s("path", { class: "nz-damak", d: "M80 136 C110 130 140 129 166 131" }),
      s("path", { class: "nz-duvar", d: "M204 96 C206 140 204 220 200 292" }),
      dil, velumG, agiz,
      s("path", { class: "nz-girtlak", d: "M181 254 L189 256 M203 254 L195 256" }),
      agizOk, burunOk, parmak,
      s("text", { x: 100, y: 122, text: "burun yolu" }),
      s("text", { x: 112, y: 152, text: "ağız" }),
      s("path", { class: "nz-cizgi", d: "M190 90 L186 124" }),
      s("text", { x: 198, y: 86, text: "yumuşak damak", class: "nz-vurgu", "text-anchor": "end" }),
      s("text", { x: 210, y: 222, text: "yutak" }),
      s("text", { x: 130, y: 246, text: "ses telleri" }));
    const cv = h("canvas", { role: "img", "aria-label": "Burun yolunun etkisi: spektrum zarfı" });
    const sayfa = h("div.sheet.nz-sayfa", h("div.nz-cizim", svg), h("div.nz-grafik", cv));
    const soz = h("p.note-msg");
    stage.append(h("div.controls", cal.btn, sesSeg, h("span.spacer"), tikaBtn), h("div.controls", velSl), sayfa, soz);

    let W = 0, H = 0, raf = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; grafik(); });
    function cizim() {
      const n = nz();
      dil.setAttribute("d", ses === "i" ? "M84 166 C100 144 130 138 156 148 C176 158 184 196 180 236" : ses === "m" ? "M84 170 C102 152 134 146 158 154 C178 164 184 196 180 236" : "M84 178 C104 164 136 158 160 164 C178 172 184 198 180 236");
      agiz.style.opacity = ses === "m" ? 0 : 1;
      agizOk.style.opacity = ses === "m" ? 0 : (1 - 0.55 * n).toFixed(2);
      burunOk.style.opacity = (ses === "m" ? 1 : Math.max(0.06, n)).toFixed(2);
      parmak.style.display = tikali ? "" : "none";
      const hedef = VELUM[0] + (VELUM[1] - VELUM[0]) * n;
      cancelAnimationFrame(raf);
      const adim = () => {
        gorAci += (hedef - gorAci) * 0.25;
        if (Math.abs(hedef - gorAci) < 0.3 || azHareket()) gorAci = hedef;
        velumG.setAttribute("transform", `rotate(${gorAci.toFixed(1)} 166 131)`);
        if (gorAci !== hedef) raf = requestAnimationFrame(adim);
      };
      adim();
    }
    const temel = () => (ses === "m" ? Ses.SESSIZ.m.formant : Ses.hedefFormant({ tip, unlu: ses }));
    const nazalYanit = (f, n) => (n > 0.01 ? Ses.filtreYaniti([[270, 100]], f) / Ses.filtreYaniti([[270 + 330 * n, 100 + 80 * n]], f) : 1);
    function grafik() {
      if (!W) return;
      const ctx = S.ctx, n = nz(), fs = temel(), FM = 3000;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      const sol = 42, sag = W - 10, ust = 26, alt = H - 24, DBU = 40, DBA = -30;
      const xf = (f) => sol + (f / FM) * (sag - sol);
      const yd = (d) => ust + ((DBU - clamp(d, DBA, DBU)) / (DBU - DBA)) * (alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
      for (let d = 40; d >= DBA; d -= 20) { const yy = Math.round(yd(d)) + 0.5; ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(sag, yy); ctx.stroke(); L.text(ctx, d + " dB", sol - 5, yy + 4, { size: 10, color: C.muted, align: "right", font: FONT.mono }); }
      for (let f = 0; f <= FM; f += 1000) L.text(ctx, f ? f / 1000 + " kHz" : "0", xf(f), alt + 15, { size: 10, color: C.muted, align: f === FM ? "right" : "center", font: FONT.mono });
      const egri = (nn_, renk, lw, kesik) => {
        ctx.strokeStyle = renk; ctx.lineWidth = lw; ctx.setLineDash(kesik ? [4, 4] : []); ctx.beginPath();
        for (let i = 0; i <= 300; i++) { const f = 40 + (i / 300) * (FM - 40), d = dB(Ses.filtreYaniti(fs, f) * nazalYanit(f, nn_)); i ? ctx.lineTo(xf(f), yd(d)) : ctx.moveTo(xf(f), yd(d)); }
        ctx.stroke(); ctx.setLineDash([]);
      };
      if (ses !== "m") egri(0, rgba(C.grafit, 0.6), 1.2, true);
      egri(n, C.ink, 2, false);
      if (n > 0.15) {
        const fz = 270 + 330 * n;
        L.text(ctx, "burun rezonansı", xf(270), ust + 10, { size: 11, color: C.pes, weight: 700, align: "left" });
        ctx.fillStyle = C.pes; ctx.fillRect(xf(270) - 0.5, ust + 14, 1.5, 10);
        const yz = yd(dB(Ses.filtreYaniti(fs, fz) * nazalYanit(fz, n)));
        L.text(ctx, "çukur", xf(fz) + 6, Math.min(alt - 6, yz + 16), { size: 11, color: C.kirmizi, weight: 700 });
      }
      L.text(ctx, ses === "m" ? "\"m\": burundan çıkan ses" : "ağız + burun filtresi (kesikli: yumuşak damak kapalı)", sol, 14, { size: 12, color: C.muted, weight: 700 });
    }
    function sozYaz() {
      const n = nz();
      let t;
      if (tikali) t = ses === "m" ? "Burun tıkalı, \"m\": hava çıkacak yol bulamaz, ses durur." : n < 0.2 ? "Burun tıkalı ama yumuşak damak kapalı: ses değişmez. Ünlülerde istenen budur." : "Burun tıkalı ve yumuşak damak açık: ses belirgin değişir. Bu, sesin burundan da çıktığının (genizsiliğin) işareti. (Sentezdeki değişim yaklaşıktır.)";
      else t = ses === "m" ? "\"m\": ağız kapalı, yumuşak damak inik; hava ve ses yalnız burundan çıkar." : n < 0.2 ? "Yumuşak damak kalkık: burun yolu kapalı, ses yalnız ağızdan çıkar." : "Yumuşak damak inik: ses burundan da çıkıyor. Spektrumda pes bir burun rezonansı ve bir çukur beliriyor; ses donuklaşıyor.";
      soz.textContent = t;
    }
    function guncelle() { cizim(); grafik(); sozYaz(); }
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { tip = tipSec(); cal.set(param()); grafik(); } });
    window.addEventListener("themechange", () => grafik());
    guncelle();
    return { enter() { guncelle(); }, leave() { cal.dur(); cancelAnimationFrame(raf); } };
  };
  window.GuideScenarios.nazalite = [{ slide: "label:Yumuşak damak", to: 0.9 }, { wait: 800 }, { click: "=Burnu tıka" }, { wait: 800 }, { click: "=Burnu tıka" }];
})();
