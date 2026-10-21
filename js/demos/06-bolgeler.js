/* 6. Ses bölgeleri ve passaggio: deneyler */
(function () {
  const { h, C, FONT, seg, ibtn, nn, rgba, clamp, fmtNum } = L;
  const azHareket = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // sentez sesin türü: tercih ya da aralıktan tahmin
  const tipSec = () => (L.prefs.sesBolge === "pes" ? "erkek" : L.prefs.sesBolge === "tiz" ? "kadin" : Aralik.get().lo < 52 ? "erkek" : "kadin");
  const yarim = (v) => fmtNum(v, 1) + " yarım ses";

  // Canlı sentez sesi için "Dinle / Durdur" düğmesi
  function Calar(param, cls = "") {
    let ctl = null;
    const btn = ibtn("play", "Dinle", () => (ctl ? dur() : bas()), cls);
    function bas() {
      Snd.unlock();
      ctl = Ses.canli(param());
      if (!ctl) return;
      btn.setLabel("Durdur"); btn.setIcon("stop");
    }
    function dur() {
      if (ctl) ctl.stop();
      ctl = null;
      btn.setLabel("Dinle"); btn.setIcon("play");
    }
    return { btn, bas, dur, set(p) { if (ctl && !ctl.stopped) ctl.set(p); else if (ctl) dur(); }, get ctl() { return ctl; } };
  }

  /* ---------------- Ses bölgeleri ---------------- */
  // açık faz oranı (oq): Henrich ve ark. 2005 aralıkları içinde seçildi; kalin: tel kalınlığı (çizim), bosluk: tam kapanmama
  const BOLGE = {
    gogus: { ad: "Göğüs sesi", oq: 0.4, gurluk: 0.85, nefes: 0.02, kalin: 1, bosluk: 0, soz: "kalın teller, geniş temas, uzun kapalı faz", mek: "M1" },
    mix: { ad: "Karışık (mix)", oq: 0.52, gurluk: 0.68, nefes: 0.03, kalin: 0.68, bosluk: 0, soz: "inceltilmiş teller, orta kapalı faz", mek: "M1 ya da M2" },
    kafa: { ad: "Kafa sesi", oq: 0.65, gurluk: 0.52, nefes: 0.05, kalin: 0.42, bosluk: 0, soz: "ince teller, kenar titreşimi, kısa kapalı faz", mek: "M2" },
    falseto: { ad: "Falsetto", oq: 0.85, gurluk: 0.38, nefes: 0.16, kalin: 0.2, bosluk: 0.3, soz: "çok ince teller, tam kapanmıyor", mek: "M2" },
  };
  const KN = 20; // grafikteki harmonik sayısı
  // sentezdeki gürlük süzgecinin (tek kutuplu alçak geçiren) k·f0'daki etkisi
  function tiltDb(gurluk, f, sr = 48000) {
    const a = 0.55 - 0.45 * gurluk, w = 2 * Math.PI * f / sr;
    return 20 * Math.log10((1 - a) / Math.sqrt(1 - 2 * a * Math.cos(w) + a * a));
  }
  function harmonikler(b, f0) {
    const sp = Ses.kaynakSpektrum(b.oq, KN);
    const ref = tiltDb(b.gurluk, f0);
    return sp.map((v, i) => 20 * Math.log10(v + 1e-9) + tiltDb(b.gurluk, f0 * (i + 1)) - ref);
  }

  window.Demos.sesBolgeleri = (stage) => {
    let bolge = "gogus", tip = tipSec();
    const varsayilan = () => (tip === "erkek" ? 57 : 64);
    let perde = varsayilan();
    const param = () => { const b = BOLGE[bolge]; return { f0: N.mtof(perde), tip, unlu: "a", oq: b.oq, gurluk: b.gurluk, nefes: b.nefes, vibGen: 0, jitter: 0.002 }; };
    const cal = Calar(param, "primary");
    const bolgeSeg = seg(Object.entries(BOLGE).map(([k, v]) => [k, v.ad]), bolge, (k) => { bolge = k; cal.set(param()); olcumYaz(); ciz(); }, "Ses bölgesi");
    const perdeSl = L.slider({ label: "Perde", min: 45, max: 76, step: 1, value: perde, fmt: (v) => nn(v), oninput: (v) => { perde = v; cal.set(param()); olcumYaz(); ciz(); } });
    const cv = h("canvas", { role: "img", "aria-label": "Ses telleri yandan kesit, glotis hava akımı ve kaynak spektrumu" });
    const sayfa = h("div.sheet.sb-sayfa", cv);
    const olcum = h("div.olcumler");
    const soz = h("p.note-msg");
    stage.append(h("div.controls", cal.btn, bolgeSeg, h("span.spacer"), perdeSl), sayfa, h("div.sb-alt", olcum, soz));

    let W = 0, H = 0, faz = 0.3;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    const dongu = L.loop((dt) => { faz = (faz + dt * 0.9) % 1; ciz(); });

    function olcumYaz() {
      const b = BOLGE[bolge], hs = harmonikler(b, N.mtof(perde));
      olcum.innerHTML = "";
      olcum.append(
        h("div.olcum", h("b", "%" + Math.round((1 - b.oq) * 100)), h("small", "kapalı faz (bir titreşimde)")),
        h("div.olcum", h("b", fmtNum(b.oq, 2)), h("small", "açık faz oranı")),
        h("div.olcum", h("b", (hs[1] > 0 ? "−" : "+") + fmtNum(Math.abs(hs[1]), 0) + " dB"), h("small", "H1–H2 farkı")),
        h("div.olcum", h("b", b.mek), h("small", "laringeal mekanizma")));
      soz.textContent = b.ad + ": " + b.soz + "." + (bolge === "mix" ? " Mix'in tanımı eğitmenden eğitmene değişir; bu yalnızca ikisinin arası bir örnek." : "");
    }

    // ses telleri: yandan (koronal) kesit; alt kenar üstten biraz önce açılır (dikey faz farkı)
    function teller(ctx, x0, y0, w, hh) {
      const b = BOLGE[bolge];
      const cx = x0 + w / 2, cy = y0 + hh * 0.52;
      const sc = Math.min(w / 260, hh / 190);
      const duvar = 105 * sc, kal = (10 + 36 * b.kalin) * sc, acMax = 34 * sc;
      const oqx = b.oq;
      const akim = (p) => Ses.rosenberg(((p % 1) + 1) % 1, oqx);
      const gUst = Math.max(akim(faz) * acMax, b.bosluk * acMax * 0.35);
      const gAlt = Math.max(akim(faz + 0.06 * b.kalin) * acMax, b.bosluk * acMax * 0.35);
      // soluk nefes borusu duvarları
      ctx.strokeStyle = rgba(C.porte, 0.9); ctx.lineWidth = 1.5;
      [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(cx + s * duvar, y0 + 8); ctx.lineTo(cx + s * duvar, y0 + hh - 6); ctx.stroke(); });
      // hava akımı: aralıktan yukarı çıkan kısa kalem çizgileri
      const ac = (gUst + gAlt) / 2;
      if (ac > 1) {
        ctx.strokeStyle = rgba(C.pes, Math.min(0.7, ac / acMax)); ctx.lineWidth = 1.6; ctx.lineCap = "round";
        for (let i = -1; i <= 1; i++) {
          const xx = cx + i * Math.min(ac / 3, 6 * sc), yb = cy - kal / 2 - 8 * sc;
          ctx.beginPath(); ctx.moveTo(xx, yb); ctx.lineTo(xx, yb - 18 * sc); ctx.stroke();
        }
      }
      // teller: duvardan orta çizgiye uzanan iki kama
      [-1, 1].forEach((s) => {
        const ust = cy - kal / 2, alt = cy + kal / 2;
        const ic1 = cx + s * gUst / 2, ic2 = cx + s * gAlt / 2;
        ctx.beginPath();
        ctx.moveTo(cx + s * duvar, ust - 26 * sc);
        ctx.bezierCurveTo(cx + s * duvar * 0.55, ust - 22 * sc, ic1 + s * 14 * sc, ust - 6 * sc, ic1, ust);
        ctx.lineTo(ic2, alt);
        ctx.bezierCurveTo(ic2 + s * 18 * sc, alt + 18 * sc, cx + s * duvar * 0.6, alt + 48 * sc, cx + s * duvar, alt + 64 * sc);
        ctx.closePath();
        ctx.fillStyle = rgba(C.ink, 0.08); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
      });
      // temas: kapalıyken orta çizgi fosforlu
      if (gUst < 0.8 && gAlt < 0.8) {
        ctx.fillStyle = rgba(C.fosfor, 0.85);
        ctx.fillRect(cx - 3, cy - kal / 2, 6, kal);
      }
      L.text(ctx, "ses telleri, yandan kesit (ağır çekim)", x0 + 6, y0 + 16, { size: 12, color: C.muted, weight: 700 });
      L.text(ctx, b.kalin > 0.6 ? "kalın, geniş temas" : b.bosluk ? "ince kenar, aralık kalıyor" : "ince, kenarlar titreşiyor", cx, y0 + hh - 4, { size: 12, color: C.ink2, align: "center", weight: 700 });
    }

    // glotis hava akımı: üç titreşim, kapalı fazlar fosforlu
    function akimCiz(ctx, x0, y0, w, hh) {
      const b = BOLGE[bolge];
      const n = 3, ust = y0 + 20, alt = y0 + hh - 10;
      ctx.fillStyle = rgba(C.fosfor, 0.5);
      for (let i = 0; i < n; i++) ctx.fillRect(x0 + (i + b.oq) * w / n, ust, (1 - b.oq) * w / n, alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.9); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, alt + 0.5); ctx.lineTo(x0 + w, alt + 0.5); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const p = (i / 300) * n, v = Ses.rosenberg(p % 1, b.oq);
        const xx = x0 + (i / 300) * w, yy = alt - v * (alt - ust - 4);
        i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke();
      // şimdiki an
      const xi = x0 + ((faz % 1) * w) / n + w / n;
      ctx.strokeStyle = rgba(C.ink, 0.35); ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xi, ust); ctx.lineTo(xi, alt); ctx.stroke(); ctx.setLineDash([]);
      L.text(ctx, "teller arasından geçen hava", x0, y0 + 12, { size: 12, color: C.muted, weight: 700 });
      L.text(ctx, "kapalı faz", x0 + w, y0 + 12, { size: 12, color: C.fosforInk === "#f2e15a" ? C.ink2 : C.fosforInk, weight: 700, align: "right" });
    }

    // kaynak spektrumu: dört bölgenin harmonikleri; seçili bölge mürekkep, diğerleri soluk
    function spektrumCiz(ctx, x0, y0, w, hh) {
      const f0 = N.mtof(perde);
      const sol = x0 + 38, sag = x0 + w - 8, ust = y0 + 26, alt = y0 + hh - 24;
      const DB = 45;
      const xk = (k) => sol + ((k - 1) / (KN - 1)) * (sag - sol);
      const yd = (d) => ust + (clamp(6 - d, 0, DB + 6) / (DB + 6)) * (alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
      for (let d = 0; d >= -DB; d -= 15) {
        const yy = Math.round(yd(d)) + 0.5;
        ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(sag, yy); ctx.stroke();
        L.text(ctx, d + " dB", sol - 5, yy + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono });
      }
      Object.entries(BOLGE).forEach(([k, b]) => {
        if (k === bolge) return;
        const hs = harmonikler(b, f0);
        ctx.strokeStyle = rgba(C.grafit, 0.45); ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); hs.forEach((d, i) => (i ? ctx.lineTo(xk(i + 1), yd(d)) : ctx.moveTo(xk(i + 1), yd(d)))); ctx.stroke();
        ctx.setLineDash([]);
      });
      const hs = harmonikler(BOLGE[bolge], f0);
      ctx.lineCap = "round";
      hs.forEach((d, i) => {
        const xx = xk(i + 1);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(xx, alt); ctx.lineTo(xx, yd(d)); ctx.stroke();
      });
      [1, 2, 5, 10, 20].forEach((k) => L.text(ctx, "H" + k, xk(k), alt + 15, { size: 11, color: C.muted, align: "center", font: FONT.mono }));
      L.text(ctx, "kaynak spektrumu (ses yolundan önce), H1'e göre", x0 + 6, y0 + 14, { size: 12, color: C.muted, weight: 700 });
      L.text(ctx, "kesikli: öteki bölgeler", sag, y0 + 30, { size: 11, color: C.muted, align: "right" });
    }

    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      if (W >= 620) {
        const lw = W * 0.44;
        teller(ctx, 10, 6, lw - 10, H * 0.62);
        akimCiz(ctx, 22, H * 0.64, lw - 34, H * 0.34);
        ctx.fillStyle = rgba(C.porte, 0.7); ctx.fillRect(lw, 14, 1.5, H - 28);
        spektrumCiz(ctx, lw + 12, 6, W - lw - 16, H - 10);
      } else {
        teller(ctx, 6, 4, W - 12, H * 0.36);
        akimCiz(ctx, 16, H * 0.37, W - 32, H * 0.19);
        spektrumCiz(ctx, 4, H * 0.58, W - 8, H * 0.42);
      }
    }
    function aralikAyarla() {
      tip = tipSec();
      const lo = tip === "erkek" ? 45 : 55, hi = tip === "erkek" ? 67 : 79;
      perdeSl.input.min = lo; perdeSl.input.max = hi;
      perde = clamp(perde, lo, hi); perdeSl.set(perde);
    }
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { const eski = tip; aralikAyarla(); if (eski !== tip) { perde = varsayilan(); perdeSl.set(perde); } cal.set(param()); olcumYaz(); ciz(); } });
    window.addEventListener("themechange", () => ciz());
    aralikAyarla(); olcumYaz();
    return {
      enter() { if (!azHareket()) dongu.start(); else ciz(); },
      leave() { dongu.stop(); cal.dur(); },
    };
  };
  window.GuideScenarios["ses-bolgeleri"] = [{ click: "=Kafa sesi" }, { wait: 700 }, { click: "=Falsetto" }, { wait: 700 }, { click: "=Göğüs sesi" }];

  /* ---------------- Kırılma yardımcıları ---------------- */
  // Kırılma işaretleri: perde eğrisinin üstünde kırmızı kalem darbeleri (tek katman; aralar boşluk)
  function isaretNoktalari(list) {
    const ps = [];
    list.forEach((b) => {
      const a = Math.min(b.once, b.sonra) - 1.2, z = Math.max(b.once, b.sonra) + 1.2;
      ps.push({ t: b.t - 0.035, m: a, g: 1 }, { t: b.t - 0.034, m: z, g: 1 }, { t: b.t + 0.5, m: NaN, g: 0 });
    });
    return ps;
  }
  // Gürlük şeridi: perde eğrisinin altında, aynı zaman ekseniyle; kırılmalar kırmızı
  function GurlukSeridi(parent, egri, { sol = 40, pencere = 8 } = {}) {
    const cv = h("canvas", { "aria-hidden": "true" });
    const el = h("div.sheet.gurluk-serit", cv);
    parent.append(el);
    let W = 0, H = 0, sure = 8, mod = "sabit", kir = [];
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    function x(t) {
      const w = W - sol - 10;
      if (mod === "sabit") return sol + (t / sure) * w;
      const now = egri.simdi - egri.t0;
      return sol + w * 0.94 - ((now - t) / pencere) * w * 0.94;
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba(C.porte, 0.8); ctx.fillRect(sol - 0.5, 0, 1.5, H);
      L.text(ctx, "gürlük", sol - 6, H / 2 + 4, { size: 11, color: C.muted, align: "right", weight: 700 });
      const ps = egri.noktalar, alt = H - 6, ust = 6;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.lineJoin = "round";
      ctx.fillStyle = rgba(C.ink, 0.12);
      let acik = false, ilkX = 0, sonX = 0;
      const kapat = () => { if (!acik) return; ctx.stroke(); ctx.lineTo(sonX, alt); ctx.lineTo(ilkX, alt); ctx.closePath(); ctx.fill(); acik = false; };
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const xx = x(p.t);
        if (isNaN(p.m) || xx < sol || xx > W) { kapat(); continue; }
        const yy = alt - p.g * (alt - ust);
        if (!acik || p.t - ps[i - 1].t > 0.09) { kapat(); ctx.beginPath(); ctx.moveTo(xx, yy); ilkX = xx; acik = true; } else ctx.lineTo(xx, yy);
        sonX = xx;
      }
      kapat();
      kir.forEach((b) => {
        const xx = x(b.t);
        if (xx < sol || xx > W) return;
        ctx.strokeStyle = C.kirmizi; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(xx, ust); ctx.lineTo(xx, alt); ctx.stroke();
        if (b.dusus != null && Math.abs(b.dusus) >= 1) L.text(ctx, (b.dusus > 0 ? "−" : "+") + Math.round(Math.abs(b.dusus)) + " dB", xx + 4, ust + 10, { size: 11, color: C.kirmizi, weight: 700 });
      });
    }
    window.addEventListener("themechange", ciz);
    return { el, ciz, set(o) { if (o.sure != null) sure = o.sure; if (o.mod) mod = o.mod; if (o.kir) kir = o.kir; } };
  }
  // gürlük düşüşü: kırılmadan önceki ve sonraki 0,3 sn'nin ortalama düzeyi (dB) farkı
  function dususEkle(list, kareler) {
    const ort = (a, b) => { const v = kareler.filter((k) => k.sesli && k.t > a && k.t < b); return v.length >= 3 ? v.reduce((x, k) => x + k.db, 0) / v.length : null; };
    list.forEach((b) => { const o = ort(b.t - 0.4, b.t - 0.1), s = ort(b.t + 0.1, b.t + 0.4); b.dusus = o != null && s != null ? o - s : null; });
    return list;
  }
  function kirilmaOlcum(list, { mikrofon = true } = {}) {
    const n = list.length;
    const enB = n ? Math.max(...list.map((b) => Math.abs(b.sicrama))) : null;
    const dus = list.filter((b) => b.dusus > 0.5);
    const ortD = dus.length ? dus.reduce((a, b) => a + b.dusus, 0) / dus.length : null;
    return h("div.olcumler",
      h("div.olcum" + (n ? "" : ".tam"), h("b", String(n)), h("small", mikrofon ? "kırılma" : "kırılma (örnek ses)")),
      h("div.olcum", h("b", enB == null ? "–" : yarim(enB)), h("small", "en büyük sıçrama")),
      h("div.olcum", h("b", ortD == null ? "–" : "−" + fmtNum(ortD, 0) + " dB"), h("small", "gürlük düşüşü")),
      h("div.olcum", h("b", n ? nn(Math.round(list[0].once)) : "–"), h("small", "ilk kırılmanın yeri")));
  }

  /* ---------------- Geçiş noktası ---------------- */
  // Sentez siren: pesten tize ve geri, 0,25 yarım seslik adımlarla (saniyede 5 yarım ses).
  // kirikM verilirse çıkarken orada 3 yarım ses sıçrar ve gürlük düşer; inerken bir yarım ses aşağıda geri sıçrar.
  /* Ezgiyi sentezle ve notaların "kaz" (0..1) değerine göre gürlüğü yumuşakça ayarla.
     (Sentezin otomatik kazancı ani gürlük düşüşlerini kısa sürede eşitlediği için düşüş burada uygulanır.) */
  function sentezle(sr, notalar, opts) {
    const r = Ses.ezgi(sr, notalar, opts), x = r.data;
    const hedef = new Float32Array(x.length).fill(NaN);
    r.olaylar.forEach((e) => { if (e.nota && e.nota.kaz != null) hedef.fill(e.nota.kaz, Math.round(e.t0 * sr), Math.min(x.length, Math.round(e.t1 * sr))); });
    let g = 1, h0 = 1;
    const k = 1 - Math.exp(-1 / (0.02 * sr));
    for (let i = 0; i < x.length; i++) { if (!isNaN(hedef[i])) h0 = hedef[i]; g += (h0 - g) * k; x[i] *= g; }
    return r;
  }
  function siren(lo, hi, kirikM) {
    const n = [], ad = 0.25, d = 0.05, SIC = 3, g1 = 1, g2 = 0.45;
    const gYum = (m) => g1 + (0.7 - g1) * clamp((m - lo) / (hi - lo), 0, 1);
    let m = lo, ust = false;
    n.push({ m: lo, d: 0.5, u: "u", kaz: g1 });
    while (m < hi - 1e-6) {
      m = Math.min(hi, m + ad);
      let glide = 0.04;
      if (kirikM != null && !ust && m >= kirikM) { m = Math.min(hi, m + SIC); ust = true; glide = 0.004; }
      n.push({ f: N.mtof(m), d, u: "u", glide, kaz: kirikM != null ? (ust ? g2 : g1) : gYum(m) });
    }
    n.push({ m: hi, d: 0.4, u: "u", kaz: kirikM != null ? g2 : gYum(hi) });
    while (m > lo + 1e-6) {
      m = Math.max(lo, m - ad);
      let glide = 0.04;
      if (kirikM != null && ust && m <= kirikM - 1) { m = Math.max(lo, m - SIC); ust = false; glide = 0.004; }
      n.push({ f: N.mtof(m), d, u: "u", glide, kaz: kirikM != null ? (ust ? g2 : g1) : gYum(m) });
    }
    n.push({ m: lo, d: 0.5, u: "u", kaz: g1 }, { r: 0.3 });
    return n;
  }

  window.Demos.passaggio = (stage) => {
    let mod = "kirik", aktif = false, cal = null, oyn = null, micOff = null, hesap = 0, cerceve = [], kir = [], gosterilen = -1;
    const onbellek = new Map();
    function hazir(sr) {
      const a = Aralik.get(), tip = tipSec();
      let lo = a.lo + 2, hi = a.hi - 2;
      if (hi - lo < 10) { const c = (lo + hi) / 2; lo = Math.round(c - 5); hi = lo + 10; }
      const kirikM = mod === "kirik" ? clamp(tip === "erkek" ? 63 : 64, lo + 4, hi - 6) : null;
      const anahtar = [mod, tip, lo, hi, sr].join("|");
      if (!onbellek.has(anahtar)) {
        const r = sentezle(sr, siren(lo, hi, kirikM), { tip, gurluk: 0.7, jitter: 0.002 });
        const v = { data: r.data, sure: r.sure, lo, hi };
        if (sr === 24000) {
          v.kareler = Pitch.izle(r.data, sr);
          const ks = v.kareler.map((k) => Object.assign({}, k, { t: k.t - Ses.BAS }));
          v.kir = dususEkle(Analiz.kirilmalar(ks), ks);
        }
        onbellek.set(anahtar, v);
      }
      return onbellek.get(anahtar);
    }

    const ornekBtn = ibtn("play", "Örnek siren", () => (cal ? ornekDur() : ornekCal()), "primary");
    const modSeg = seg([["kirik", "Kırılmalı"], ["yumusak", "Yumuşak"]], mod, (k) => { mod = k; if (cal) ornekDur(); else if (!micOff) onizle(); }, "Örnek siren türü");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri({ onAc: () => micModu(), onKapa: () => { if (micOff) { micOff(); micOff = null; clearInterval(hesap); if (aktif) onizle(); } } });
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", ornekBtn, modSeg, h("span.spacer"), durum), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 8, pencere: 8 });
    const gs = GurlukSeridi(stage, egri, { pencere: 8 });
    const sonuc = h("div.sonuc");
    stage.append(sonuc, h("div.egri-anahtar.pg-anahtar", h("span", { style: { "--kc": "var(--ink)" } }, "perde (kalınlık = gürlük)"), h("span", { style: { "--kc": "var(--kirmizi)" } }, "kırılma")));

    function isaretle(list) {
      egri.katmanSil();
      if (list.length) egri.katmanEkle(isaretNoktalari(list), { ad: "kırılma", renk: C.kirmizi });
      gs.set({ kir: list });
    }
    function sonucYaz(list, mikrofon) {
      sonuc.innerHTML = "";
      let s;
      if (mikrofon) s = list.length ? `Son sirenlerde ${list.length} kırılma işaretlendi. Kırılma çoğu zaman çıkarken ve inerken farklı yerdedir; bir sonraki slaytta yumuşatmayı çalışın.` : "Henüz kırılma yok. Pes bir notadan tize ve geri, yavaş bir \"u\" sireni söyleyin.";
      else s = mod === "kirik" ? "Örnek seste perde çıkarken ve inerken üç yarım ses sıçrıyor, gürlük de düşüyor: tipik bir kırılma." : "Yumuşak sirende perde kesintisiz kayıyor; gürlük yavaşça azalıyor, sıçrama yok.";
      sonuc.append(kirilmaOlcum(list, { mikrofon }), h("p.note-msg", s));
    }
    function onizle() {
      const v = hazir(24000);
      egri.mod("sabit"); egri.sure(v.sure); egri.aralik(v.lo - 2, v.hi + 4);
      egri.hedefler([]); egri.basla(0); egri.imlec(null);
      v.kareler.forEach((k) => egri.push(Object.assign({}, k, { t: k.t - Ses.BAS })));
      gs.set({ mod: "sabit", sure: v.sure });
      isaretle(v.kir); sonucYaz(v.kir, false);
      durum.textContent = mod === "kirik" ? "Örnek: kırılmalı siren" : "Örnek: yumuşak siren";
    }
    function ornekCal() {
      Snd.unlock();
      const c = Snd.ready(); if (!c) return;
      if (Mic.state === "on") Mic.stop();
      const v = hazir(c.sampleRate), p = hazir(24000);
      cal = Ses.calBuffer(v.data);
      if (!cal) return;
      ornekBtn.setLabel("Durdur"); ornekBtn.setIcon("stop");
      egri.mod("sabit"); egri.sure(p.sure); egri.aralik(p.lo - 2, p.hi + 4); egri.katmanSil();
      egri.temizle(); egri.basla(cal.t0 + Ses.BAS);
      gs.set({ mod: "sabit", sure: p.sure, kir: [] });
      gosterilen = 0; kir = p.kir;
      sonuc.innerHTML = "";
      durum.textContent = "Örnek siren çalıyor…";
      oyn = egri.oynat(p.kareler, cal.t0, { bitince: () => { cal = null; oyn = null; ornekBtn.setLabel("Örnek siren"); ornekBtn.setIcon("play"); isaretle(kir); sonucYaz(kir, false); durum.textContent = ""; } });
    }
    function ornekDur() {
      if (cal) cal.stop();
      if (oyn) oyn.stop();
      cal = null; oyn = null;
      ornekBtn.setLabel("Örnek siren"); ornekBtn.setIcon("play");
      if (aktif && !micOff) onizle();
    }
    function micModu() {
      if (cal) { cal.stop(); oyn && oyn.stop(); cal = null; oyn = null; ornekBtn.setLabel("Örnek siren"); ornekBtn.setIcon("play"); }
      egri.mod("akis"); egri.aralik(null); egri.hedefler([]); egri.katmanSil(); egri.temizle(); egri.basla();
      gs.set({ mod: "akis", kir: [] });
      cerceve = []; kir = [];
      sonucYaz([], true);
      durum.textContent = "Siren söyleyin: pesten tize ve geri";
      micOff = egri.dinle((k, t) => {
        cerceve.push({ t, sesli: k.sesli, ham: k.ham, db: k.db });
        if (cerceve.length > 6000) cerceve.splice(0, 2000);
      });
      clearInterval(hesap);
      hesap = setInterval(() => {
        const now = egri.simdi - egri.t0;
        kir = dususEkle(Analiz.kirilmalar(cerceve).filter((b) => b.t > now - 30), cerceve);
        isaretle(kir);
        const son = kir.filter((b) => b.t > now - 12);
        sonucYaz(son, true);
        // ilk yukarı kırılma: bir sonraki slaytın alıştırmaları için kırılma bölgesi
        const yuk = son.find((b) => b.sicrama > 0);
        if (yuk) L.store.set("kirilmaYeri", { m: Math.round(yuk.once), kaynak: "olcum", tarih: Date.now() });
      }, 300);
    }
    const dongu = L.loop(() => {
      if (cal && kir.length) {
        const now = egri.simdi - egri.t0, gor = kir.filter((b) => b.t <= now);
        if (gor.length !== gosterilen) { gosterilen = gor.length; isaretle(gor); }
      }
      gs.ciz();
    });
    window.addEventListener("aralikchange", () => { if (aktif && !cal && !micOff) onizle(); });
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge" && aktif && !cal && !micOff) onizle(); });
    return {
      enter() { aktif = true; egri.baslat(); if (!micOff && !cal) onizle(); dongu.start(); },
      leave() { aktif = false; if (cal) { cal.stop(); oyn && oyn.stop(); cal = null; oyn = null; ornekBtn.setLabel("Örnek siren"); ornekBtn.setIcon("play"); } if (micOff) { micOff(); micOff = null; } clearInterval(hesap); egri.durdur(); dongu.stop(); },
    };
  };
  window.GuideScenarios.passaggio = [{ click: "=Yumuşak" }, { wait: 900 }, { click: "=Kırılmalı" }];

  /* ---------------- Kırılmayı yumuşatmak ---------------- */
  const EGZ = {
    brr: { ad: "Dudak titretme", u: "u", ses: { nefes: 0.1, gurluk: 0.5 }, sekil: "siren", esik: 2 },
    ng: { ad: "ng ile oktav", u: "u", ses: { nazal: 0.8, gurluk: 0.45 }, sekil: "oktav", esik: 2 },
    u: { ad: "u ile oktav", u: "u", ses: { gurluk: 0.5 }, sekil: "oktav", esik: 2 },
    besli: { ad: "Hafif beşli", u: "o", ses: { gurluk: 0.4 }, sekil: "besli", esik: 2.6 },
  };
  const ORNEK_SICRAMA = [3.2, 2.3, 0]; // mikrofonsuz örnek denemelerde kırılma küçülür
  // kırılma bölgesi: geçiş noktası slaytında ölçülen, elle ayarlanan ya da tahmini
  function kirilmaBolgesi() {
    const a = Aralik.get(), s = L.store.get("kirilmaYeri", null);
    let m, kaynak;
    if (s && s.m >= a.lo + 3 && s.m <= a.hi - 3) { m = s.m; kaynak = s.kaynak || "olcum"; }
    else { m = tipSec() === "erkek" ? 63 : 64; kaynak = "tahmin"; }
    m = a.hi - a.lo < 8 ? Math.round((a.lo + a.hi) / 2) : clamp(m, a.lo + 4, a.hi - 4);
    return { m, kaynak };
  }
  // alıştırmanın parçaları: tut (nota) ve kay (kayma)
  function parcalar(E, z) {
    const a = Aralik.get();
    if (E.sekil === "siren") {
      const s = clamp(z - 6, a.lo + 1, z - 2), e = clamp(z + 5, z + 2, a.hi - 1);
      return [{ tut: s, d: 0.5 }, { kay: [s, e], d: 2.2 }, { tut: e, d: 0.5 }, { kay: [e, s], d: 2.2 }, { tut: s, d: 0.6 }];
    }
    if (E.sekil === "oktav") {
      let s, e;
      if (a.hi - a.lo < 14) { s = a.lo + 1; e = a.hi - 1; } else { s = clamp(z - 6, a.lo + 1, a.hi - 13); e = s + 12; }
      return [{ tut: s, d: 0.5 }, { kay: [s, e], d: 1.6 }, { tut: e, d: 0.6 }, { kay: [e, s], d: 1.6 }, { tut: s, d: 0.7 }];
    }
    const s = clamp(z - 4, a.lo + 1, a.hi - 8);
    return [0, 2, 4, 5, 7, 5, 4, 2, 0].map((x, i, arr) => ({ tut: s + x, d: i === arr.length - 1 ? 0.9 : 0.45, hece: true }));
  }
  const toplamSure = (ps) => ps.reduce((a, p) => a + p.d, 0);
  // hedef bantları (tutulan notalar) ve kılavuz yol (kaymalar dahil), t0 kaydırmasıyla
  function bantlar(ps, t0, aktif) {
    const out = [];
    let t = t0;
    ps.forEach((p) => { if (p.tut != null) out.push({ t0: t, t1: t + p.d, m: p.tut, hece: p.hece ? nn(p.tut) : null, aktif }); t += p.d; });
    return out;
  }
  function yol(ps, t0) {
    const out = [];
    let t = t0;
    ps.forEach((p) => {
      if (p.tut != null) { out.push({ t, m: p.tut, g: 0.35 }, { t: t + p.d, m: p.tut, g: 0.35 }); }
      else { const k = Math.round(p.d / 0.05); for (let i = 0; i <= k; i++) out.push({ t: t + (p.d * i) / k, m: p.kay[0] + ((p.kay[1] - p.kay[0]) * i) / k, g: 0.35 }); }
      t += p.d;
    });
    return out;
  }
  // sentez notaları; kirik > 0 ise çıkarken z'de yukarı, inerken z−1'de aşağı sıçrar, sonra 0,6 sn içinde yola döner
  function seslendir(ps, z, kirik, E) {
    const n = [];
    let ofs = 0, yukari = false, asagi = false, onceki = null;
    ps.forEach((p) => {
      const k = p.kay ? Math.max(1, Math.round(p.d / 0.05)) : 1;
      for (let i = 1; i <= k; i++) {
        const m = p.kay ? p.kay[0] + ((p.kay[1] - p.kay[0]) * i) / k : p.tut;
        const d = p.d / k;
        let glide = p.kay ? 0.04 : 0.035;
        if (kirik && onceki != null) {
          if (!yukari && m > onceki && m >= z) { yukari = true; ofs = kirik; glide = 0.004; }
          else if (yukari && !asagi && m < onceki && m <= z - 1) { asagi = true; ofs = -kirik; glide = 0.004; }
        }
        n.push({ f: N.mtof(m + ofs), d, u: E.u, glide, kaz: kirik && yukari && !asagi ? 0.5 : 1 });
        ofs -= Math.sign(ofs) * Math.min(Math.abs(ofs), (kirik * d) / 0.6);
        onceki = m;
      }
    });
    n.push({ r: 0.2 });
    return n;
  }
  // z çizgisi (olası kırılma bölgesi): ince kırmızı
  function zCizgisi(z, sure) {
    const out = [];
    for (let t = 0; t <= sure; t += 0.05) out.push({ t, m: z, g: 0 });
    return out;
  }

  window.Demos.kirilma = (stage) => {
    let egz = "brr", calisiyor = false, timers = [], iptal = null, off = null, imlecRaf = 0, aktif = false;
    const oturum = []; // mikrofonsuz örnek denemeler (kaydedilmez)
    const basBtn = ibtn("play", "Başla", () => toggle(), "primary");
    const egzSeg = seg(Object.entries(EGZ).map(([k, v]) => [k, v.ad]), egz, (k) => { egz = k; durdur(); onizle(); trendCiz(); }, "Alıştırma");
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const a0 = Aralik.get();
    const bolgeSl = L.slider({ label: "Kırılma bölgesi", min: a0.lo + 4, max: a0.hi - 4, step: 1, value: kirilmaBolgesi().m, fmt: (v) => nn(v),
      oninput: (v) => { L.store.set("kirilmaYeri", { m: v, kaynak: "elle", tarih: Date.now() }); bolgeYaz(); if (!calisiyor) onizle(); } });
    const bolgeNot = h("span.kr-bolge-not");
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", basBtn, egzSeg, h("span.spacer"), durumEl), h("div.controls.kr-ikinci", bolgeSl, bolgeNot), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 8, tol: 40 });
    const sonuc = h("div.sonuc");
    const tcv = h("canvas", { role: "img", "aria-label": "Denemelere göre sıçrama sayısı ve en büyük sıçrama" });
    const trend = h("div.sheet.kr-trend", tcv);
    stage.append(sonuc, trend, h("div.egri-anahtar", h("span", { style: { "--kc": "var(--grafit)" } }, "hedef yol"),
      h("span", { style: { "--kc": "color-mix(in srgb, var(--fosfor) 70%, transparent)" } }, "tutulacak nota"),
      h("span", { style: { "--kc": "var(--kirmizi)" } }, "kırılma (ince çizgi: olası bölge)")));

    function bolgeYaz() {
      const b = kirilmaBolgesi();
      bolgeNot.textContent = b.kaynak === "olcum" ? "(geçiş noktası slaytında ölçüldü)" : b.kaynak === "elle" ? "(elle ayarlandı)" : "(tahmini; ölçmek için önceki slayt)";
    }
    function aralikGuncelle() {
      const a = Aralik.get();
      bolgeSl.input.min = a.lo + 4; bolgeSl.input.max = a.hi - 4;
      bolgeSl.set(kirilmaBolgesi().m);
      bolgeYaz();
    }
    function katmanlar(yolNok, z, sure, kir) {
      egri.katmanSil();
      egri.katmanEkle(yolNok, { ad: "hedef yol", renk: C.grafit });
      egri.katmanEkle(zCizgisi(z, sure), { ad: "bölge", renk: C.kirmizi });
      if (kir && kir.length) egri.katmanEkle(isaretNoktalari(kir), { ad: "kırılma", renk: C.kirmizi });
    }
    function onizle() {
      const E = EGZ[egz], z = kirilmaBolgesi().m, ps = parcalar(E, z), T = toplamSure(ps);
      egri.mod("sabit"); egri.sure(T + 0.3); egri.temizle(); egri.imlec(null);
      egri.hedefler(bantlar(ps, 0, true));
      katmanlar(yol(ps, 0), z, T + 0.3);
      egri.ciz();
    }

    // geçmiş: yalnızca mikrofonla yapılan denemeler kaydedilir
    const gecmis = () => L.store.get("kirilma", []);
    function kaydet(r) { const g = gecmis(); g.push(r); L.store.set("kirilma", g.slice(-200)); }
    let TW = 0, TH = 0;
    const TS = L.canvas(tcv, (s) => { TW = s.w; TH = s.h; trendCiz(); });
    function trendCiz() {
      if (!TW) return;
      const ctx = TS.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, TW, TH);
      const veri = gecmis().filter((r) => r.egz === egz).slice(-10).concat(oturum.filter((r) => r.egz === egz).slice(-3)).slice(-12);
      L.text(ctx, TW < 520 ? "Sıçrama sayısı (sütun), en büyüğü (kırmızı)" : "Denemeler: sıçrama sayısı (sütun) ve en büyük sıçrama (kırmızı)", 10, 16, { size: 12, color: C.muted, weight: 700 });
      if (!veri.length) { L.text(ctx, "Henüz deneme yok. \"Başla\"ya basın.", TW / 2, TH / 2 + 10, { size: 13, color: C.muted, align: "center" }); return; }
      const sol = 34, sag = TW - 12, ust = 28, alt = TH - 18;
      const maxS = Math.max(3, ...veri.map((r) => r.sayi)), maxB = 6;
      const bw = (sag - sol) / 12;
      ctx.strokeStyle = rgba(C.porte, 0.7); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sol, alt + 0.5); ctx.lineTo(sag, alt + 0.5); ctx.stroke();
      L.text(ctx, "0", sol - 6, alt + 4, { size: 10, color: C.muted, align: "right", font: FONT.mono });
      L.text(ctx, String(maxS), sol - 6, ust + 8, { size: 10, color: C.muted, align: "right", font: FONT.mono });
      const noktalar = [];
      veri.forEach((r, i) => {
        const x = sol + i * bw + bw * 0.2, w = bw * 0.6;
        const hh = (r.sayi / maxS) * (alt - ust);
        ctx.fillStyle = r.ornek ? rgba(C.grafit, 0.45) : C.ink;
        ctx.fillRect(x, alt - Math.max(2, hh), w, Math.max(2, hh));
        L.text(ctx, String(r.sayi), x + w / 2, alt - Math.max(2, hh) - 4, { size: 11, color: C.ink2, align: "center", font: FONT.mono, weight: 700 });
        if (r.enBuyuk != null) noktalar.push([x + w / 2, alt - (Math.min(maxB, r.enBuyuk) / maxB) * (alt - ust)]);
        L.text(ctx, r.ornek ? "örnek" : String(i + 1), x + w / 2, TH - 4, { size: 10, color: C.muted, align: "center" });
      });
      ctx.strokeStyle = C.kirmizi; ctx.fillStyle = C.kirmizi; ctx.lineWidth = 1.8;
      ctx.beginPath(); noktalar.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      noktalar.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); });
    }

    const bekle = (ms) => new Promise((res, rej) => { const id = setTimeout(res, Math.max(0, ms)); timers.push(id); iptal = () => { clearTimeout(id); rej("iptal"); }; });
    const izleOnbellek = new Map();
    function kareler(notalar, opts) {
      const k = JSON.stringify(notalar) + JSON.stringify(opts);
      if (!izleOnbellek.has(k)) { const r = sentezle(24000, notalar, opts); izleOnbellek.set(k, Pitch.izle(r.data, 24000)); }
      return izleOnbellek.get(k);
    }

    async function deneme(i, mic) {
      const E = EGZ[egz], z = kirilmaBolgesi().m, ps = parcalar(E, z), T = toplamSure(ps);
      // kulaklıkla ve mikrofonla: örnek ve ziyaretçi birlikte; mikrofonsuz hep önce örnek, sonra "deneme" sesi
      const c = Snd.ctx, birlikte = mic && L.prefs.kulaklik;
      const tD = birlikte ? 0 : T + 0.6;
      const sure = tD + T + 0.3;
      const tip = tipSec();
      const opts = Object.assign({ tip, jitter: 0.002 }, E.ses);
      egri.mod("sabit"); egri.sure(sure);
      const t0 = c.currentTime + 0.3;
      egri.temizle(); egri.basla(t0);
      egri.hedefler((birlikte ? [] : bantlar(ps, 0, false)).concat(bantlar(ps, tD, true)));
      const yolNok = birlikte ? yol(ps, 0) : yol(ps, 0).concat([{ t: T + 0.3, m: NaN, g: 0 }], yol(ps, tD));
      katmanlar(yolNok, z, sure);
      const imlec = () => { egri.imlec(c.currentTime - t0); imlecRaf = requestAnimationFrame(imlec); };
      imlec();
      // örnek: yumuşak geçişli yol
      const ornekNot = seslendir(ps, z, 0, E);
      Ses.calBuffer(sentezle(c.sampleRate, ornekNot, opts).data, { when: t0 - Ses.BAS, gain: 0.9 });
      let frames = [];
      const dinle = () => { off = egri.dinle((k, t) => { if (t >= tD - 0.05) frames.push({ t, sesli: k.sesli, ham: k.ham, db: k.db }); }); };
      if (!birlikte) {
        Mic.bekle("referans", true);
        egri.oynat(kareler(ornekNot, opts), t0 - Ses.BAS);
        durumEl.textContent = `${i + 1}. deneme: dinleyin…`;
        await bekle((t0 + T + 0.15 - c.currentTime) * 1000);
        Mic.bekle("referans", false);
        egri.durum(mic ? "Şimdi siz" : "Örnek ses", { buyuk: true });
        const id = setTimeout(() => egri.durum(null), 900); timers.push(id);
      }
      durumEl.textContent = `${i + 1}. deneme: ${mic ? (birlikte ? "birlikte söyleyin" : "şimdi siz söyleyin") : "örnek ses söylüyor"}`;
      if (mic) dinle();
      else {
        const sic = ORNEK_SICRAMA[i] || 0;
        const not2 = seslendir(ps, z, sic, E);
        const tu = t0 + tD;
        Ses.calBuffer(sentezle(c.sampleRate, not2, opts).data, { when: tu - Ses.BAS, gain: 0.9 });
        const kr = kareler(not2, opts);
        egri.oynat(kr, tu - Ses.BAS);
        frames = kr.map((k) => ({ t: k.t - Ses.BAS + tD, sesli: k.sesli, ham: k.ham, db: k.db }));
      }
      await bekle((t0 + tD + T + 0.3 - c.currentTime) * 1000);
      off && off(); off = null;
      cancelAnimationFrame(imlecRaf);
      const kul = frames.filter((f) => f.t >= tD - 0.05);
      const kir = dususEkle(Analiz.kirilmalar(kul, { esik: E.esik }), kul);
      katmanlar(yolNok, z, sure, kir);
      const sesli = kul.filter((f) => f.sesli).length * 0.0107;
      const r = { tarih: Date.now(), egz, sayi: kir.length, enBuyuk: kir.length ? Math.round(Math.max(...kir.map((b) => Math.abs(b.sicrama))) * 10) / 10 : 0 };
      sonuc.innerHTML = "";
      if (mic && sesli < 1) {
        sonuc.append(h("p.note-msg", "Sesinizi pek duyamadım. Mikrofona biraz yaklaşıp hedef yolu baştan sona söyleyin."));
      } else {
        if (mic) kaydet(r); else { r.ornek = true; oturum.push(r); }
        const enB = r.sayi ? yarim(r.enBuyuk) : "";
        const soz = !mic ? (r.sayi ? `Örnek seste ${r.sayi} sıçrama, en büyüğü ${enB}.` : "Örnek ses bu denemede geçişi sıçramadan yaptı.")
          : r.sayi === 0 ? "Sıçrama bulunmadı: geçiş yumuşak. Aynı hafiflikle tekrar edin."
          : r.enBuyuk < 3 ? `${r.sayi} küçük sıçrama (en büyüğü ${enB}). Geçişe yaklaşırken biraz daha hafifleyin.`
          : `${r.sayi} sıçrama, en büyüğü ${enB}. Daha yavaş ve daha hafif deneyin; zorlamayın.`;
        sonuc.append(kirilmaOlcum(kir, { mikrofon: mic }), h("p.note-msg", soz));
      }
      trendCiz();
    }
    async function baslat() {
      if (calisiyor) return;
      Snd.unlock();
      calisiyor = true;
      basBtn.setLabel("Durdur"); basBtn.setIcon("stop");
      let mic = Mic.state === "on";
      if (!mic) mic = await Mic.start();
      try {
        for (let i = 0; i < 3 && calisiyor; i++) {
          await deneme(i, mic && Mic.state === "on");
          if (i < 2) await bekle(1200);
        }
      } catch (e) { if (e !== "iptal") console.error(e); }
      bitir();
    }
    function bitir() {
      calisiyor = false;
      basBtn.setLabel("Başla"); basBtn.setIcon("play");
      durumEl.textContent = "";
    }
    function durdur() {
      if (!calisiyor) return;
      timers.forEach(clearTimeout); timers = [];
      iptal && iptal();
      cancelAnimationFrame(imlecRaf);
      off && off(); off = null;
      Snd.stopAll();
      Mic.bekle("referans", false);
      bitir();
    }
    const toggle = () => (calisiyor ? durdur() : baslat());
    window.addEventListener("aralikchange", () => { aralikGuncelle(); if (aktif && !calisiyor) onizle(); });
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { aralikGuncelle(); if (aktif && !calisiyor) onizle(); } });
    window.addEventListener("themechange", trendCiz);
    bolgeYaz();
    return {
      enter() { aktif = true; aralikGuncelle(); egri.baslat(); if (!calisiyor) onizle(); trendCiz(); },
      leave() { aktif = false; durdur(); egri.durdur(); },
      toggle,
    };
  };
  window.GuideScenarios.kirilma = [{ click: "=u ile oktav" }, { wait: 700 }, { slide: "label:Kırılma bölgesi", to: 0.6 }, { wait: 500 }, { click: "=Dudak titretme" }];

  /* ---------------- Belting ---------------- */
  const BELT = {
    klasik: { ad: "Klasik", p: (f0) => ({ oq: 0.55, gurluk: 0.6, sf: 0.8, karanlik: 0.5, vibGen: 40, vibHiz: 5.6, nefes: 0.03 }) },
    belt: { ad: "Belt", p: (f0) => ({ oq: 0.35, gurluk: 0.95, sf: 0, karanlik: -0.2, f1: 2 * f0 * 1.03, vibGen: 0, nefes: 0.02 }) },
  };
  window.Demos.belting = (stage) => {
    let tur = "klasik", tip = tipSec();
    const sinir = () => (tip === "erkek" ? [57, 69, 64] : [64, 74, 69]); // La3–La4 / Mi4–Re5; varsayılan Mi4 / La4
    let perde = sinir()[2];
    const param = (k = tur, spektrumIcin = false) => {
      const f0 = N.mtof(perde), p = Object.assign({ f0, tip, unlu: "a", jitter: 0.002 }, BELT[k].p(f0));
      if (spektrumIcin) p.vibGen = 0;
      return p;
    };
    const cal = Calar(() => param(), "primary");
    const turSeg = seg(Object.entries(BELT).map(([k, v]) => [k, v.ad]), tur, (k) => { tur = k; cal.set(param()); guncelle(); }, "Söyleyiş");
    const perdeSl = L.slider({ label: "Perde", min: sinir()[0], max: sinir()[1], step: 1, value: perde, fmt: (v) => nn(v), oninput: (v) => { perde = v; cal.set(param()); guncelle(); } });
    const cv = h("canvas", { role: "img", "aria-label": "Klasik ve belt seslerin spektrumu" });
    const sayfa = h("div.sheet.bt-sayfa", cv);
    const olcum = h("div.olcumler");
    stage.append(h("div.controls", cal.btn, turSeg, h("span.spacer"), perdeSl), sayfa, olcum,
      h("div.egri-anahtar", h("span", { style: { "--kc": "var(--ink)" } }, "seçili söyleyişin harmonikleri"), h("span", { style: { "--kc": "var(--grafit)" } }, "öteki (kesikli)"), h("span", { style: { "--kc": "var(--pes)" } }, "F1"), h("span", { style: { "--kc": "color-mix(in srgb, var(--fosfor) 70%, transparent)" } }, "1 kHz üstü")));

    let W = 0, H = 0, spek = {};
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    const SR = 16000, FMAX = 4000;
    function hesapla() {
      for (const k of Object.keys(BELT)) {
        const x = Ses.uret(SR, 0.7, param(k, true), 5);
        const sp = Analiz.spektrum(x.subarray(x.length - 8192), SR);
        const mx = Math.max(...sp.db.slice(1, Math.ceil(FMAX / sp.binHz)));
        spek[k] = { sp, mx, ust: Analiz.bantOrani(sp, [1000, 4000], [50, 1000]), f1: Ses.hedefFormant(param(k, true))[0][0] };
      }
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx, f0 = N.mtof(perde);
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      const sol = 44, sag = W - 10, ust = 26, alt = H - 26, DB = 60;
      const xf = (f) => sol + (f / FMAX) * (sag - sol);
      const yd = (d) => ust + (Math.min(DB, Math.max(0, -d)) / DB) * (alt - ust);
      ctx.fillStyle = rgba(C.fosfor, 0.18); ctx.fillRect(xf(1000), ust, sag - xf(1000), alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
      for (let d = 0; d >= -DB; d -= 20) { const yy = Math.round(yd(d)) + 0.5; ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(sag, yy); ctx.stroke(); L.text(ctx, d + " dB", sol - 5, yy + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono }); }
      for (let f = 0; f <= FMAX; f += 1000) L.text(ctx, f ? f / 1000 + " kHz" : "0", xf(f), alt + 16, { size: 11, color: C.muted, align: f === FMAX ? "right" : "center", font: FONT.mono });
      // harmoniklerin genliği (spektrumda k·f0 dolayındaki tepe), en güçlüsüne göre
      const harm = (k) => {
        const { sp, mx } = spek[k], out = [];
        for (let j = 1; j * f0 < FMAX; j++) {
          const c = (j * f0) / sp.binHz, w = Math.max(1, (f0 * 0.3) / sp.binHz);
          let m = -200;
          for (let i = Math.floor(c - w); i <= Math.ceil(c + w); i++) if (sp.db[i] > m) m = sp.db[i];
          out.push([j * f0, m - mx]);
        }
        return out;
      };
      const oteki = tur === "klasik" ? "belt" : "klasik";
      const ho = harm(oteki), hs = harm(tur);
      ctx.strokeStyle = rgba(C.grafit, 0.6); ctx.fillStyle = rgba(C.grafit, 0.6); ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ho.forEach(([f, d], i) => (i ? ctx.lineTo(xf(f), yd(d)) : ctx.moveTo(xf(f), yd(d)))); ctx.stroke(); ctx.setLineDash([]);
      ho.forEach(([f, d]) => { ctx.beginPath(); ctx.arc(xf(f), yd(d), 2.5, 0, Math.PI * 2); ctx.fill(); });
      ctx.lineCap = "round";
      hs.forEach(([f, d]) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xf(f), alt); ctx.lineTo(xf(f), yd(d)); ctx.stroke(); });
      ctx.strokeStyle = rgba(C.ink, 0.5); ctx.lineWidth = 1.2;
      ctx.beginPath(); hs.forEach(([f, d], i) => (i ? ctx.lineTo(xf(f), yd(d)) : ctx.moveTo(xf(f), yd(d)))); ctx.stroke();
      // F1 ve harmonik işaretleri
      const f1 = spek[tur].f1;
      ctx.strokeStyle = C.pes; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xf(f1), ust); ctx.lineTo(xf(f1), alt); ctx.stroke(); ctx.setLineDash([]);
      L.text(ctx, "F1 " + L.fmtHz(f1), xf(f1) + 5, ust + 12, { size: 12, color: C.pes, weight: 700 });
      for (let k = 1; k <= 4; k++) L.text(ctx, "H" + k, xf(k * f0) + 4, alt - 6, { size: 11, color: C.ink2, weight: 700, font: FONT.mono });
      L.text(ctx, "spektrum: " + BELT[tur].ad.toLowerCase() + " (" + nn(perde) + ", \"a\")", sol, 16, { size: 12, color: C.muted, weight: 700 });
      L.text(ctx, "1 kHz üstü", sag - 4, 16, { size: 11, color: C.muted, align: "right", weight: 700 });
    }
    function olcumYaz() {
      const f0 = N.mtof(perde), b = spek.belt, k = spek.klasik;
      olcum.innerHTML = "";
      olcum.append(
        h("div.olcum", h("b", L.fmtHz(spek[tur].f1)), h("small", "F1 (2×f0 = " + L.fmtHz(2 * f0) + ")")),
        h("div.olcum", h("b", "%" + Math.round((1 - param().oq) * 100)), h("small", "kapalı faz")),
        h("div.olcum", h("b", (b.ust - k.ust > 0 ? "+" : "−") + fmtNum(Math.abs(b.ust - k.ust), 0) + " dB"), h("small", "belt'te 1 kHz üstü (klasiğe göre)")));
    }
    function guncelle() { hesapla(); ciz(); olcumYaz(); }
    function aralikAyarla() {
      tip = tipSec();
      const [lo, hi, v] = sinir();
      perdeSl.input.min = lo; perdeSl.input.max = hi;
      if (perde < lo || perde > hi) perde = v;
      perdeSl.set(perde);
    }
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { aralikAyarla(); cal.set(param()); guncelle(); } });
    window.addEventListener("themechange", () => ciz());
    aralikAyarla(); hesapla(); olcumYaz();
    return { enter() { ciz(); }, leave() { cal.dur(); } };
  };
  window.GuideScenarios.belting = [{ click: "=Belt" }, { wait: 700 }, { slide: "label:Perde", to: 0.8 }, { wait: 600 }, { click: "=Klasik" }];
})();
