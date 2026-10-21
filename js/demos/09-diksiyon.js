/* 9. Diksiyon ve sözle söylemek: deneyler */
(function () {
  const { h, C, FONT, rgba, ibtn, seg, clamp } = L;
  const SR = 24000;
  const sesTip = () => (L.prefs.sesBolge === "pes" ? "erkek" : "kadin");
  const ms = (s) => Math.round(s * 1000);
  const UNLU = /[aeıioöuü]/i;
  const PERDELI = /^[lrnmy]$/; // perde süren sessizler

  /* Perde noktalarındaki boşluklar: [{t, m (perdesizse NaN)}] → ilk ve son perdeli kare arasında perdesiz parçalar.
     Dönüş: { bosluklar: [{t0, t1, d}], sesli: [{t0, t1}], perdeliPay, ort, enUzun, sure } ya da null */
  function bosluklar(ps, { t0 = -Infinity, t1 = Infinity, min = 0.025 } = {}) {
    const v = ps.filter((p) => p.t >= t0 && p.t <= t1);
    const ilk = v.findIndex((p) => !isNaN(p.m));
    let son = -1;
    for (let i = v.length - 1; i >= 0; i--) if (!isNaN(v[i].m)) { son = i; break; }
    if (ilk < 0 || son <= ilk) return null;
    const out = [], sesli = [];
    let a = null, s = v[ilk].t;
    for (let i = ilk + 1; i <= son; i++) {
      const p = v[i], q = v[i - 1];
      const varP = !isNaN(p.m), varQ = !isNaN(q.m);
      // kareler arası 0,05 sn'den uzun aralık da boşluktur (eğri orada çizmez)
      if (varP && varQ && p.t - q.t > 0.05) { sesli.push({ t0: s, t1: q.t }); out.push({ t0: q.t, t1: p.t }); s = p.t; continue; }
      if (!varP && varQ) { a = q.t; sesli.push({ t0: s, t1: q.t }); }
      if (varP && !varQ && a != null) { out.push({ t0: a, t1: p.t }); s = p.t; a = null; }
    }
    sesli.push({ t0: s, t1: v[son].t });
    const bs = out.map((b) => Object.assign(b, { d: b.t1 - b.t0 })).filter((b) => b.d >= min);
    const sure = v[son].t - v[ilk].t;
    const top = bs.reduce((x, b) => x + b.d, 0);
    return { bosluklar: bs, sesli, sure, perdeliPay: sure > 0 ? 1 - top / sure : 0, ort: bs.length ? top / bs.length : 0, enUzun: bs.length ? Math.max(...bs.map((b) => b.d)) : 0, t0: v[ilk].t, t1: v[son].t };
  }
  window.__diksiyon = { bosluklar }; // sahte mikrofon testleri için
  const kareNokta = (ks) => ks.map((k) => ({ t: k.t - Ses.BAS, m: k.sesli ? k.midi : NaN, g: clamp((k.db + 52) / 38, 0, 1) }));
  function onhesap(notalar, ses = {}) {
    const r = Ses.ezgi(SR, notalar, Object.assign({ tip: sesTip(), gurluk: 0.65, jitter: 0.002, vibGen: 0 }, ses));
    return kareNokta(Pitch.izle(r.data, SR));
  }

  /* ---------- Türkçe ünlüler şarkıda: hece zaman çizelgesi ---------- */
  // "Sabah olur, gün doğar": konuşma süreleri örnek değerlerdir (ölçüm değil); şarkı süreleri ezgiden
  const CUMLE = [
    { y: "Sa", p: [["s", 0.1], ["a", 0.1]], c: "s" },
    { y: "bah", p: [["b", 0.07], ["a", 0.11], ["h", 0.07]], c: "p" },
    { y: "o", p: [["o", 0.1]], c: "h" },
    { y: "lur,", p: [["l", 0.06], ["u", 0.11], ["r", 0.06]], c: "l", sus: 0.22 },
    { y: "gün", p: [["g", 0.07], ["ü", 0.12], ["n", 0.07]], c: "rk" },
    { y: "doğ", p: [["d", 0.06], ["oğ", 0.15]], c: "nt" },
    { y: "ar.", p: [["a", 0.12], ["r", 0.07]], c: "" },
  ];
  const tur = (ph) => (UNLU.test(ph) ? "unlu" : PERDELI.test(ph) ? "perdeli" : "perdesiz");
  function konusmaSatiri() {
    const seg = [];
    let t = 0;
    CUMLE.forEach((hc, i) => {
      const a = t;
      hc.p.forEach(([ph, d]) => { seg.push({ t0: t, t1: t + d, tur: tur(ph), ph }); t += d; });
      seg.push({ hece: hc.y, t0: a, t1: t });
      if (hc.sus) { seg.push({ t0: t, t1: t + hc.sus, tur: "sus" }); t += hc.sus; }
    });
    return { seg, sure: t };
  }
  function sarkiSatiri(notalar) {
    const seg = [];
    let t = 0;
    CUMLE.forEach((hc, i) => {
      const d = notalar[i].d, a = t;
      const sessiz = hc.p.filter(([ph]) => !UNLU.test(ph)).reduce((x, [, s]) => x + s * 0.9, 0);
      const unluD = d - sessiz;
      hc.p.forEach(([ph, s]) => { const dd = UNLU.test(ph) ? unluD : s * 0.9; seg.push({ t0: t, t1: t + dd, tur: tur(ph), ph }); t += dd; });
      seg.push({ hece: hc.y, t0: a, t1: a + d });
      t = a + d;
    });
    return { seg, sure: t };
  }
  const unluPay = (r) => r.seg.filter((s) => s.tur === "unlu").reduce((x, s) => x + s.t1 - s.t0, 0) / r.sure;

  window.Demos.turkceUnluler = (stage) => {
    let cal = null, olc = null, siz = null, oynayan = null, raf = 0;
    const sarkiNotalar = () => Ezgiler.notalar("sabah", { tempo: 80 }).slice(0, CUMLE.length);
    const konBtn = ibtn("play", "Konuşur gibi", () => calis("konusma"));
    const sarBtn = ibtn("play", "Şarkı gibi", () => calis("sarki"), "primary");
    const olcBtn = ibtn("mic", "Söyle ve ölç", () => (olc ? olcDur() : olcBasla()));
    const msat = Alistirma.MicSatiri({ kompakt: false });
    const cv = h("canvas", { role: "img", "aria-label": "Hece zaman çizelgesi: konuşma ve şarkıda ünlü ve sessiz süreleri" });
    const sayfa = h("div.sheet.tu-sayfa", cv);
    const anahtar = h("div.legend",
      h("span.chip", h("i.tu-k.unlu"), "ünlü"), h("span.chip", h("i.tu-k.perdeli"), "perdeli sessiz (m n l r y)"),
      h("span.chip", h("i.tu-k.perdesiz"), "perdesiz ya da kapanmalı sessiz"), h("span.chip", h("i.tu-k.sus"), "durak"));
    const sonuc = h("div.sonuc", { "aria-live": "polite" });
    stage.append(h("div.controls", konBtn, sarBtn, olcBtn, h("span.spacer"), h("span.readout")), msat.el, sayfa, anahtar, sonuc);
    const durum = stage.querySelector(".readout");

    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    const renk = (t) => (t === "unlu" ? rgba(C.fosfor, 0.85) : t === "perdeli" ? rgba(C.pes, 0.35) : t === "perdesiz" ? C.grafit : "transparent");
    function satir(ctx, y, hh, baslik, r, { oynat = null } = {}) {
      const dar = W < 520;
      const l = dar ? 8 : 92, rr = 12;
      const X = (t) => l + (t / r.sure) * (W - l - rr);
      if (dar) { L.text(ctx, baslik, l, y - 28, { size: 12.5, color: C.ink, weight: 800 }); }
      else L.text(ctx, baslik, 8, y + hh / 2 + 5, { size: 13, color: C.ink, weight: 800 });
      ctx.strokeStyle = rgba(C.porte, 0.9); ctx.lineWidth = 1; ctx.strokeRect(l + 0.5, y + 0.5, W - l - rr, hh);
      for (const s of r.seg) {
        if (s.hece != null) continue;
        if (s.tur === "sus") {
          ctx.strokeStyle = rgba(C.grafit, 0.5); ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(X(s.t0), y + hh / 2); ctx.lineTo(X(s.t1), y + hh / 2); ctx.stroke(); ctx.setLineDash([]);
          continue;
        }
        ctx.fillStyle = renk(s.tur);
        ctx.fillRect(X(s.t0) + 0.5, y + 1, Math.max(1, X(s.t1) - X(s.t0) - 1), hh - 1);
      }
      // hece ayraçları ve adları
      for (const s of r.seg) {
        if (s.hece == null) continue;
        const x0 = X(s.t0), x1 = X(s.t1);
        ctx.fillStyle = C.ink; ctx.fillRect(Math.round(x0), y - 4, 1.5, hh + 8);
        const w = x1 - x0;
        if (w > 16) L.text(ctx, s.hece, x0 + w / 2, y - 7, { size: w > 34 ? 12.5 : 10.5, color: C.ink2, align: "center", weight: 700 });
      }
      L.text(ctx, r.alt, W - rr, y + hh + 16, { size: 12, color: C.muted, align: "right", weight: 600, font: FONT.mono });
      if (oynat != null) { const x = X(oynat); ctx.fillStyle = C.ink; ctx.fillRect(Math.round(x) - 1, y - 6, 2, hh + 12); }
    }
    const kon = konusmaSatiri();
    let sar = null;
    function ciz(oynat) {
      if (!W) return;
      const ctx = S.ctx;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      sar = sarkiSatiri(sarkiNotalar());
      kon.alt = `${L.fmtSure(kon.sure)} · ünlü %${Math.round(unluPay(kon) * 100)}`;
      sar.alt = `${L.fmtSure(sar.sure)} · ünlü %${Math.round(unluPay(sar) * 100)}`;
      const satirlar = [["Konuşma", kon], ["Şarkı", sar]];
      if (siz) satirlar.push(["Siz", siz]);
      const n = satirlar.length, dar = W < 520;
      const hh = Math.min(46, (H - 20) / n - (dar ? 58 : 46));
      const adim = (H - 10) / n;
      satirlar.forEach(([b, r], i) => satir(ctx, 10 + i * adim + (adim - hh) / 2 - 4 + (dar ? 8 : 0), hh, b, r, { oynat: oynayan && oynayan.r === r ? oynat : null }));
    }
    function calis(tur) {
      durdur();
      Snd.unlock();
      const bas = Aralik.perdele([0, 7], { pay: 2 });
      let ns;
      if (tur === "sarki") ns = sarkiNotalar().map((n, i) => ({ m: n.m, d: n.d, u: n.u, c: CUMLE[i].c }));
      else {
        // konuşma: kısa heceler, hafifçe inen konuşma perdesi
        const egim = [2, 2, 1, 1.5, 1, 0.5, -1];
        ns = [];
        CUMLE.forEach((hc, i) => {
          ns.push({ m: bas + egim[i], d: hc.p.reduce((x, [, d]) => x + d, 0), u: Ezgiler.unluOf(hc.y), c: hc.c, glide: 0.05 });
          if (hc.sus) ns.push({ r: hc.sus });
        });
      }
      cal = Ses.soyle(ns, { tip: sesTip(), vibGen: 0, gurluk: tur === "sarki" ? 0.65 : 0.5 });
      if (!cal) return;
      oynayan = { r: tur === "sarki" ? sar : kon, t0: cal.t0 + Ses.BAS };
      const adim = () => {
        const t = Snd.ctx.currentTime - oynayan.t0;
        ciz(clamp(t, 0, oynayan.r.sure));
        if (t < oynayan.r.sure + 0.1) raf = requestAnimationFrame(adim); else durdur();
      };
      adim();
    }
    function durdur() { cancelAnimationFrame(raf); if (cal) { cal.stop(); cal = null; } oynayan = null; ciz(); }

    // mikrofon: cümleyi söyle, perdeli ve perdesiz süre
    async function olcBasla() {
      durdur();
      Snd.unlock();
      const ok = Mic.state === "on" || (await Mic.start());
      if (!ok) return;
      const kareler = [];
      let bas = null, sonSes = null;
      olc = { off: null, timer: 0 };
      olcBtn.setLabel("Durdur"); olcBtn.setIcon("stop");
      durum.textContent = "Dinliyorum: \"Sabah olur, gün doğar\" diye söyleyin";
      olc.off = Mic.onFrame((k) => {
        if (k.bekle) return;
        if (bas == null) bas = k.t;
        kareler.push({ t: k.t - bas, m: k.sesli ? k.midi : NaN });
        if (k.sesli) sonSes = k.t;
        const ses = kareler.some((x) => !isNaN(x.m));
        if ((ses && k.t - sonSes > 1.2) || k.t - bas > 10) olcBitir(kareler);
        else if (kareler.length % 8 === 0) { siz = sizSatiri(kareler, true); ciz(); }
      });
    }
    function sizSatiri(kareler, canli) {
      const b = bosluklar(kareler, { min: 0.02 });
      if (!b) return canli ? { seg: [], sure: 1, alt: "…" } : null;
      const seg = [];
      b.sesli.forEach((s) => seg.push({ t0: s.t0 - b.t0, t1: s.t1 - b.t0, tur: "unlu" }));
      b.bosluklar.forEach((s) => seg.push({ t0: s.t0 - b.t0, t1: s.t1 - b.t0, tur: "perdesiz" }));
      return { seg, sure: Math.max(0.2, b.sure), b, alt: `${L.fmtSure(b.sure)} · perdeli %${Math.round(b.perdeliPay * 100)}` };
    }
    function olcBitir(kareler) {
      const r = sizSatiri(kareler, false);
      olcDur();
      sonuc.innerHTML = "";
      if (!r) { siz = null; ciz(); sonuc.append(h("p.note-msg", "Sesinizi duyamadım. Mikrofona biraz yaklaşıp yeniden deneyin.")); return; }
      siz = r; ciz();
      const p = r.b.perdeliPay;
      sonuc.append(h("div.olcumler",
        h("div.olcum.tam", h("b", "%" + Math.round(p * 100)), h("small", "perdeli (ünlü ve m n l r y)")),
        h("div.olcum", h("b", "%" + Math.round((1 - p) * 100)), h("small", "perdesiz")),
        h("div.olcum", h("b", L.fmtSure(r.b.sure)), h("small", "cümle süresi"))),
        h("p.note-msg", p > 0.8 ? "Sesinizin büyük kısmı perdeli: ünlüleri uzatıp sessizleri kısa tutuyorsunuz." : "Perdesiz pay konuşmaya yakın. Ünlüleri notanın sonuna kadar uzatmayı, sessizleri kısa tutmayı deneyin. Ölçüm yaklaşıktır."));
    }
    function olcDur() {
      if (!olc) return;
      olc.off && olc.off(); olc = null;
      olcBtn.setLabel("Söyle ve ölç"); olcBtn.setIcon("mic"); durum.textContent = "";
    }
    window.addEventListener("themechange", () => ciz());
    return { enter() { ciz(); }, leave() { durdur(); olcDur(); }, toggle() { olc ? olcDur() : olcBasla(); } };
  };
  window.GuideScenarios["turkce-unluler"] = [{ click: "=Konuşur gibi" }, { wait: 1800 }, { click: "=Şarkı gibi" }];

  /* ---------- Sessiz harfler ve legato ---------- */
  const LEG_C = ["s", "k", "p", "", "ks", "s", "sl", "m", "nd"]; // "Su gi bi ak sın ses lim an dan" (g→k, b→p yaklaşık)
  const legNotalar = () => Ezgiler.notalar("legato").map((n, i) => Object.assign({}, n, { c: LEG_C[i] }));
  const ORNEK = {
    kesik: { ad: "Kesik örnek", yap: (ns) => ns.flatMap((n, i) => (i < ns.length - 1 ? [Object.assign({}, n, { d: n.d - 0.16, vib: false, glide: 0.02 }), { r: 0.16 }] : [Object.assign({}, n, { vib: false })])) },
    bagli: { ad: "Bağlı örnek", yap: (ns) => ns.map((n) => Object.assign({}, n, { vib: false, glide: 0.06 })) },
  };
  window.Demos.legato = (stage) => {
    let ornek = "kesik", cal = null, seritVeri = null, seritSure = 5;
    const onbellek = {};
    function hesapla(k) {
      const ns = legNotalar(), key = k + ns[0].m;
      if (onbellek[key]) return onbellek[key];
      const nokta = onhesap(ORNEK[k].yap(ns));
      const sure = ns.reduce((a, n) => a + n.d, 0);
      return (onbellek[key] = { ns, nokta, sure, b: bosluklar(nokta, { t0: 0, t1: sure }) });
    }
    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const dinBtn = ibtn("play", "Örneği dinle", () => dinle());
    const ornSeg = seg(Object.entries(ORNEK).map(([k, v]) => [k, v.ad]), ornek, (k) => { ornek = k; durdur(); al.durdur(); onizle(); }, "Örnek");
    const msat = Alistirma.MicSatiri();
    const egriYer = h("div.leg-egri");
    const scv = h("canvas", { role: "img", "aria-label": "Perde boşlukları şeridi" });
    const sayfa = h("div.sheet.leg-kap", egriYer, h("div.leg-serit", scv));
    const durumEl = h("span.readout");
    const sonuc = h("div.sonuc", { "aria-live": "polite" });
    stage.append(h("div.controls", basBtn, ornSeg, dinBtn, h("span.spacer"), durumEl), msat.el, sayfa, sonuc, Egri.anahtar());
    const egri = Egri(egriYer, { mod: "sabit", sure: 5, okuma: false, tol: 40 });

    let W = 0, H = 0;
    const S = L.canvas(scv, (s) => { W = s.w; H = s.h; serit(); });
    function serit() {
      if (!W) return;
      const ctx = S.ctx, sol = 40;
      ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba(C.porte, 0.8); ctx.fillRect(sol - 0.5, 0, 1.5, H);
      L.text(ctx, "boşluk", sol - 4, H / 2 + 4, { size: 10, color: C.muted, align: "right", weight: 700 });
      if (!seritVeri) return;
      const X = (t) => sol + (t / seritSure) * (W - sol - 10);
      const y = H * 0.62;
      let sonEtiket = -99;
      seritVeri.bosluklar.forEach((b) => {
        const uzun = b.d >= 0.15, x0 = X(b.t0), x1 = X(b.t1);
        ctx.fillStyle = uzun ? rgba(C.tiz, 0.35) : rgba(C.grafit, 0.25);
        ctx.fillRect(x0, y - 9, Math.max(2, x1 - x0), 18);
        const xe = (x0 + x1) / 2;
        if (xe - sonEtiket > 26) { sonEtiket = xe; } else return;
        L.text(ctx, String(ms(b.d)), xe, y - 13, { size: 10, color: uzun ? C.tiz : C.muted, align: "center", weight: 700, font: FONT.mono });
      });
      seritVeri.sesli.forEach((s) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = "butt"; ctx.beginPath(); ctx.moveTo(X(s.t0), y); ctx.lineTo(Math.max(X(s.t0) + 1, X(s.t1)), y); ctx.stroke(); });
    }
    function olcumYaz(b, { baslik, mikrofon = true }) {
      const ort = b ? ms(b.ort) : null, en = b ? ms(b.enUzun) : null;
      return h("div.olcumler",
        h("div.olcum", h("b", b ? String(b.bosluklar.length) : "–"), h("small", baslik + ": boşluk")),
        h("div.olcum" + (b && b.ort < 0.13 ? ".tam" : ""), h("b", b ? ort + " ms" : "–"), h("small", "ortalama boşluk")),
        h("div.olcum" + (b && b.enUzun >= 0.25 ? ".tiz" : ""), h("b", b ? en + " ms" : "–"), h("small", "en uzun")),
        h("div.olcum", h("b", b && mikrofon ? "%" + Math.round(b.perdeliPay * 100) : "–"), h("small", "perdeli süre")));
    }
    function onizle() {
      const v = hesapla(ornek);
      let t = 0;
      const hd = v.ns.map((n) => { const o = { t0: t, t1: t + n.d, m: n.m, hece: n.hece }; t += n.d; return o; });
      const mm = v.ns.map((n) => n.m);
      egri.aralik(Math.min(...mm) - 2.5, Math.max(...mm) + 2.5);
      egri.mod("sabit"); egri.sure(t + 0.4); egri.temizle(); egri.katmanSil();
      egri.hedefler(hd); egri.katmanEkle(v.nokta, { ad: ORNEK[ornek].ad }); egri.imlec(null); egri.ciz();
      seritVeri = v.b; seritSure = t + 0.4; serit();
      sonuc.innerHTML = "";
      sonuc.append(olcumYaz(v.b, { baslik: ORNEK[ornek].ad }));
    }
    function durdur() { if (cal) { cal.stop(); cal = null; } dinBtn.setLabel("Örneği dinle"); dinBtn.setIcon("play"); }
    function dinle() {
      if (cal) return durdur();
      al.durdur();
      Snd.unlock();
      const v = hesapla(ornek);
      onizle();
      cal = Alistirma.ornekSoyle(egri, ORNEK[ornek].yap(v.ns), { bitince: () => durdur() });
      if (cal) { dinBtn.setLabel("Durdur"); dinBtn.setIcon("stop"); }
    }
    const al = Alistirma({
      egri, tur: "legato", tol: 40,
      cumleler: () => [legNotalar()],
      onBasla() { durdur(); basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); egri.aralik(null); seritVeri = null; serit(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durumEl.textContent = ""; },
      onDurum(t) { durumEl.textContent = t; },
      onSonuc(s) {
        const hs = egri.hedefListe.filter((x) => x.aktif !== false);
        const a = hs[0].t0, z = hs[hs.length - 1].t1;
        const b = bosluklar(egri.noktalar, { t0: a - 0.1, t1: z + 0.3 });
        seritVeri = b; seritSure = z + 0.4; serit();
        sonuc.innerHTML = "";
        let soz = "Sesinizi duyamadım. Mikrofona biraz yaklaşıp biraz daha gür söyleyin.";
        if (b) soz = b.enUzun < 0.25 && b.ort < 0.13 ? "Boşluklar sessiz harf kadar kısa: sesi heceden heceye taşıyorsunuz." : "Bazı boşluklar uzun (turuncu). O hecelerde sesi bırakmadan sessiz harfe geçmeyi deneyin; önce yalnızca ünlülerle söylemek yardımcı olur.";
        if (!s.mikrofon) soz = "Mikrofon kapalıyken ezgiyi sentez ses söyledi. Kendi boşluklarınızı görmek için mikrofonu açın.";
        sonuc.append(olcumYaz(b, { baslik: s.mikrofon ? "Siz" : "Örnek", mikrofon: true }), h("p.note-msg", soz + " " + (s.mikrofon ? Alistirma.sonucSozu(s, 40) : "")));
      },
    });
    window.addEventListener("aralikchange", () => !al.calisiyor && onizle());
    window.addEventListener("themechange", () => serit());
    return { enter() { egri.baslat(); if (!al.calisiyor) onizle(); }, leave() { durdur(); al.durdur(); egri.durdur(); }, toggle: () => al.toggle() };
  };
  window.GuideScenarios["legato"] = [{ click: "=Bağlı örnek" }, { wait: 1000 }, { click: "=Kesik örnek" }];

  /* ---------- Nefes yerleri ---------- */
  const SABAH_C = ["s", "p", "h", "l", "rk", "nt", "", "rs", "sl", "r", "m", "sy", "ks", "l"];
  const KELIME = [0, 0, 1, 1, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5];
  const NEFES = 0.3;
  const DUZEN = { anlam: [3, 6], kotu: [0, 5, 9] };
  window.Demos.nefesYerleri = (stage) => {
    const temel = () => Ezgiler.notalar("sabah", { tempo: 96 });
    const heceler = Ezgiler.bul("sabah").notalar.map((n) => n[2]);
    let benim = new Set(), duzen = "anlam", cal = null;
    const isaretler = () => (duzen === "benim" ? benim : new Set(DUZEN[duzen]));
    const turOf = (i) => (/[,.]$/.test(heceler[i]) ? "anlam" : KELIME[i] !== KELIME[i + 1] ? "kelime" : "orta");
    const TUR = { anlam: ["tam", "anlam sınırında"], kelime: ["pes", "kelimeler arasında"], orta: ["tiz", "kelimenin ortasında"] };

    const duzSeg = seg([["benim", "Benim işaretlerim"], ["anlam", "Anlamlı"], ["kotu", "Kötü örnek"]], duzen, (k) => { duzen = k; durdur(); guncelle(); }, "Nefes düzeni");
    const dinBtn = ibtn("play", "Dinle", () => (cal ? durdur() : dinle()), "primary");
    const temBtn = L.btn("Temizle", () => { benim = new Set(); duzen = "benim"; duzSeg.set("benim"); durdur(); guncelle(); }, "ghost sm");
    const soz = h("div.ny-soz", { role: "group", "aria-label": "Söz: heceler ve nefes yerleri" });
    const araBtn = [];
    heceler.forEach((hc, i) => {
      const ayni = i < heceler.length - 1 && KELIME[i] === KELIME[i + 1];
      // hece ve ardındaki nefes yeri aynı satırda kalsın
      const par = h("span.ny-par", h("span.ny-hece", hc + (ayni ? "-" : "")));
      soz.append(par);
      if (i < heceler.length - 1) {
        const b = h("button.ny-ara", { type: "button", "aria-label": `Nefes: ${hc} ile ${heceler[i + 1]} arası`, onclick: () => {
          if (duzen !== "benim") { benim = new Set(isaretler()); duzen = "benim"; duzSeg.set("benim"); }
          benim.has(i) ? benim.delete(i) : benim.add(i);
          durdur(); guncelle();
        } });
        araBtn.push(b); par.append(b);
      }
    });
    const liste = h("div.ny-liste", { "aria-live": "polite" });
    const egriKap = h("div.sheet.egri-kap");
    stage.append(h("div.controls", duzSeg, dinBtn, temBtn), h("div.sheet.ny-kagit", soz), liste, egriKap);
    const egri = Egri(egriKap, { mod: "sabit", sure: 12, okuma: false, tol: 30 });

    function notalar() {
      const set = isaretler(), out = [];
      temel().forEach((n, i) => {
        const nn = Object.assign({}, n, { c: SABAH_C[i], vib: false });
        if (set.has(i)) { const al = Math.min(NEFES, n.d - 0.25); out.push(Object.assign(nn, { d: n.d - al }), { r: al }); }
        else out.push(nn);
      });
      return out;
    }
    function guncelle() {
      const set = isaretler();
      araBtn.forEach((b, i) => {
        const on = set.has(i);
        b.className = "ny-ara" + (on ? " on " + TUR[turOf(i)][0] : "");
        b.textContent = on ? "’" : "";
        b.setAttribute("aria-pressed", on);
      });
      // değerlendirme
      liste.innerHTML = "";
      const sirali = [...set].sort((a, b) => a - b);
      if (!sirali.length) liste.append(h("p.note-msg", "Henüz nefes işareti yok. Hecelerin arasındaki boşluklara dokunun. Bütün cümleyi tek nefeste söylemek uzun bir nefes ister."));
      else {
        const say = { anlam: 0, kelime: 0, orta: 0 };
        sirali.forEach((i) => say[turOf(i)]++);
        liste.append(h("div.ny-ozet",
          ...sirali.map((i) => { const [c, ad] = TUR[turOf(i)]; return h("span.chip.ny-chip." + c, `${heceler[i]} ’ ${heceler[i + 1]}: ${ad}`); })));
        const msg = say.orta ? "Kelimenin ortasındaki nefes anlamı böler; dinlerken o hecenin kesildiğini duyarsınız. Nefesi bir sonraki kelime sınırına kaydırmayı deneyin."
          : say.kelime ? "Nefesler kelime sınırında: anlaşılır. Virgüllere denk gelenler cümleyi en az böler."
          : "Bütün nefesler anlam sınırında: sözün virgülleriyle ezginin cümleleri aynı yerde.";
        liste.append(h("p.note-msg" + (say.orta ? ".warn" : ""), msg));
      }
      // eğri: hedefler (nefes boşluklarıyla)
      const ns = notalar();
      let t = 0;
      const hd = [];
      ns.forEach((n) => { if (!n.r) hd.push({ t0: t, t1: t + n.d, m: n.m, hece: n.hece.replace(/[,.]$/, "") }); t += n.r || n.d; });
      const mm = hd.map((x) => x.m);
      egri.aralik(Math.min(...mm) - 2.5, Math.max(...mm) + 2.5);
      egri.mod("sabit"); egri.sure(t + 0.3); egri.temizle(); egri.katmanSil(); egri.hedefler(hd); egri.imlec(null); egri.ciz();
    }
    function durdur() { if (cal) { cal.stop(); cal = null; } dinBtn.setLabel("Dinle"); dinBtn.setIcon("play"); }
    function dinle() {
      Snd.unlock();
      guncelle();
      cal = Alistirma.ornekSoyle(egri, notalar(), { bitince: () => durdur() });
      if (cal) { dinBtn.setLabel("Durdur"); dinBtn.setIcon("stop"); }
    }
    window.addEventListener("aralikchange", () => guncelle());
    return { enter() { egri.baslat(); guncelle(); }, leave() { durdur(); egri.durdur(); }, toggle() { cal ? durdur() : dinle(); } };
  };
  window.GuideScenarios["nefes-yerleri"] = [{ click: "=Kötü örnek" }, { wait: 1200 }, { click: "=Anlamlı" }, { wait: 800 }, { click: "aria:Nefes: miz ile yük arası" }];
})();
