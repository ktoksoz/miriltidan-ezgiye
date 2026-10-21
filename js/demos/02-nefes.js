/* 2. Nefes ve destek: deneyler
   - nefes:   stilize gövde (diyafram, kaburgalar, akciğerler, karın kasları) + akciğer hacmi grafiği
   - sss:     uzun "sss" ölçer (süre, düzenlilik), gürlük şeridi, günlük en iyi grafiği; kronometre
   - uzunSes: rahat bir notayı 8–12 sn tutma; perde sapması, titreme, gürlük dalgalanması; iki sentez örnek
   - durus:   yandan görünen stilize figür; alışkanlıklar dokunarak düzeltilir */
(function () {
  const { h, s, C, FONT, seg, ibtn, btn, nn, clamp, rgba } = L;
  const TAU = Math.PI * 2;
  const azHareket = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Düşük örnekleme hızında hazırlanmış bir diziyi çal (Web Audio yeniden örnekler). Dönüş: { t0, sure, stop }
  function calSr(data, sr, { when = 0, gain = 1 } = {}) {
    const c = Snd.ready(); if (!c) return null;
    const buf = c.createBuffer(1, data.length, sr);
    buf.getChannelData(0).set(data);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(Snd.bus);
    const t0 = Math.max(c.currentTime + 0.05, when || 0);
    src.start(t0);
    const ctl = { t0, sure: data.length / sr, stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.02); src.stop(c.currentTime + 0.1); } catch (e) {} } };
    Snd.own(ctl);
    return ctl;
  }
  const gunAnahtar = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const gunEtiket = (t) => { const d = new Date(t); return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`; };

  /* ================= Nefes: stilize gövde ================= */
  // Yol yardımcıları: sol yarı çizilir, sağ yarı aynalanır (x → 400 − x)
  const P = (pts) => pts.map((p) => (typeof p === "string" ? p : p[0].toFixed(1) + "," + p[1].toFixed(1))).join(" ");
  const ayna = (pts) => pts.map((p) => (typeof p === "string" ? p : [400 - p[0], p[1]]));
  const RIB_W = [50, 66, 78, 86, 90, 90, 86];

  window.Demos.nefes = (stage) => {
    let mod = azHareket() ? "elle" : "sarki";
    let v = 0.42, vOnce = 0.42, hedef = 0.42, tau = 0, gerekli = 0;
    let dia = 0, abd = 0, dis = 0, faz = "bekle";
    let sarkiFaz = { ad: "al", t: 0, v0: 0.42 };
    const gecmis = []; // {t, v, dia, abd}
    let saat = 0;

    const modSeg = seg([["sakin", "Sakin soluk"], ["sarki", "Şarkı cümlesi"], ["elle", "Elle"]], mod, (k) => { modSec(k); }, "Nefes biçimi");
    const alBtn = ibtn("play", "Nefes al", () => { modSec("elle"); hedef = 0.9; });
    const verBtn = btn("Nefes ver", () => { modSec("elle"); hedef = 0.2; });
    const hacimSl = L.slider({ label: "Akciğer hacmi", min: 0, max: 1, step: 0.01, value: v, fmt: (x) => "%" + Math.round(x * 100), oninput: (x) => { modSec("elle", true); hedef = x; } });
    function modSec(k, sessiz) {
      if (k !== mod) {
        mod = k;
        if (k === "sarki") sarkiFaz = { ad: "al", t: 0, v0: v };
        if (k === "sakin") tau = 0;
        if (k === "elle") hedef = v;
      }
      modSeg.set(k);
      if (!sessiz && k !== "elle") hacimSl.set(v);
    }

    // --- SVG gövde ---
    const svg = s("svg", { viewBox: "-50 -6 500 412", class: "nefes-svg", role: "img", "aria-label": "Stilize gövde: akciğerler, kaburgalar, diyafram ve karın kasları" });
    const g = (attrs) => s("path", Object.assign({ fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, attrs));
    const govde = [g({}), g({})];
    const akc = [g({}), g({})];
    const kaburga = RIB_W.map(() => [g({}), g({})]);
    const arasi = [];
    for (let i = 0; i < 6; i++) arasi.push([g({}), g({})]);
    const diyafram = g({});
    const karin = [g({}), g({}), g({})];
    const nefesYolu = g({});
    const ok = s("path", {});
    const etiket = (x, y, metin, anchor = "end") => {
      const t = s("text", { x, y, "text-anchor": anchor, class: "nefes-etiket", text: metin });
      const cz = g({ "stroke-width": 1, "stroke-dasharray": "2 3" });
      return { t, cz };
    };
    const et = {
      akc: etiket(-44, 128, "akciğer", "start"),
      kab: etiket(444, 96, "kaburgalar"),
      dia: etiket(444, 0, "diyafram"),
      dia2: etiket(444, 0, ""),
      kar: etiket(-44, 318, "karın kasları", "start"),
      ara: etiket(-44, 214, "kaburgalar arası", "start"),
      ara2: etiket(-44, 0, "", "start"),
    };
    svg.append(...govde, ...akc, nefesYolu, ok, ...kaburga.flat(), ...arasi.flat(), diyafram, ...karin);
    Object.values(et).forEach((e) => svg.append(e.cz, e.t));

    function ciz() {
      const ink = C.ink, mut = C.muted;
      const e = v; // genişleme
      // gövde dış çizgisi
      const sol = [[180, -6], "L", [181, 34], "C", [160, 42], [112, 44], [88, 62], "C", [74, 76], [84, 100], [98 - 6 * e, 126],
        "C", [93 - 10 * e, 165], [95 - 11 * e, 205], [106 - 7 * e, 246], "C", [115 - 4 * e, 282], [111 - 5 * e, 320], [103, 372], "L", [101, 406]];
      govde[0].setAttribute("d", "M" + P(sol));
      govde[1].setAttribute("d", "M" + P(ayna(sol)));
      govde.forEach((p) => { p.setAttribute("stroke", ink); p.setAttribute("stroke-width", 2); });
      // diyafram: iki kubbe; nefes alınca iner ve düzleşir
      const yP = 184 + 40 * e, yC = yP + 14 - 6 * e, xE = 112 - 9 * e, yE = 238 + 8 * e;
      const dYol = [[xE, yE], "C", [xE + 4, yP - 4], [128, yP], [150, yP], "C", [172, yP], [186, yC], [200, yC],
        "C", [214, yC], [228, yP], [250, yP], "C", [272, yP], [396 - xE, yP - 4], [400 - xE, yE]];
      diyafram.setAttribute("d", "M" + P(dYol));
      const diaRenk = dia > 0.05 ? L.mix(ink, C.pes, clamp(dia * 1.4, 0, 1)) : ink;
      diyafram.setAttribute("stroke", diaRenk);
      diyafram.setAttribute("stroke-width", 2 + 3.2 * dia);
      diyafram.setAttribute("stroke-dasharray", faz === "fren" ? "9 5" : "");
      // akciğerler: tabanı diyaframı izler
      for (let k = 0; k < 2; k++) {
        const lat = 118 - 8 * e;
        const pts = [[186, 82], "C", [162, 62], [130, 84], [124 - 6 * e, 128], "C", [117 - 8 * e, 168], [lat, 198], [lat + 2, yE - 6],
          "C", [lat + 8, yP - 2], [134, yP - 4], [152, yP - 4], "C", [168, yP - 4], [178, yC - 6], [184, yC - 10], "L", [186, 150], "C", [178, 128], [194, 98], [186, 82]];
        const q = k ? ayna(pts) : pts;
        akc[k].setAttribute("d", "M" + P(q) + " Z");
        akc[k].setAttribute("fill", rgba(C.fosfor, 0.16 + 0.42 * v));
        akc[k].setAttribute("stroke", ink);
        akc[k].setAttribute("stroke-width", 1.6);
      }
      // nefes borusu ve hava oku
      nefesYolu.setAttribute("d", "M200,-6 L200,74 M200,74 L184,90 M200,74 L216,90");
      nefesYolu.setAttribute("stroke", ink); nefesYolu.setAttribute("stroke-width", 2);
      const akis = (v - vOnce) / Math.max(1e-3, 1 / 60);
      const yon = akis > 0.004 ? 1 : akis < -0.004 ? -1 : 0;
      ok.setAttribute("d", yon >= 0 ? "M191,24 L209,24 L200,42 Z" : "M191,42 L209,42 L200,24 Z");
      ok.setAttribute("fill", yon > 0 ? C.pes : C.tiz);
      ok.setAttribute("opacity", yon ? clamp(Math.abs(akis) * 4 + 0.35, 0, 1) : 0);
      // kaburgalar: nefes alınca yukarı ve dışa
      RIB_W.forEach((w0, i) => {
        const w = w0 * (1 + 0.08 * e), y = 96 + i * 20 - 7 * e * (1 - i / 9);
        const pts = [[193, y], "Q", [200 - w, y - 16], [204 - w, y + 22 + i * 1.5]];
        kaburga[i][0].setAttribute("d", "M" + P(pts));
        kaburga[i][1].setAttribute("d", "M" + P(ayna(pts)));
        kaburga[i].forEach((p) => { p.setAttribute("stroke", mut); p.setAttribute("stroke-width", 1.4); });
      });
      // kaburgalar arası kaslar: kısa eğik çizgiler (alırken dış: çivit, verirken iç: turuncu)
      const araRenk = dis > 0.05 ? C.pes : abd > 0.05 ? C.tiz : null;
      const araG = Math.max(dis, abd);
      for (let i = 0; i < 6; i++) {
        const w = RIB_W[i] * (1 + 0.08 * e), y = 96 + i * 20 - 7 * e * (1 - i / 9);
        const x = 200 - w + 12, yy = y + 6;
        const pts = dis >= abd ? [[x, yy], "L", [x + 8, yy + 12]] : [[x + 8, yy], "L", [x, yy + 12]];
        arasi[i][0].setAttribute("d", "M" + P(pts));
        arasi[i][1].setAttribute("d", "M" + P(ayna(pts)));
        arasi[i].forEach((p) => { p.setAttribute("stroke", araRenk || mut); p.setAttribute("stroke-width", araRenk ? 1.4 + 2 * araG : 1); p.setAttribute("opacity", araRenk ? 0.4 + 0.6 * araG : 0.35); });
      }
      // karın kasları: iki dikey şerit ve ara çizgiler
      const kx = 3 * e; // karın hafifçe öne (yanlara) açılır
      const krn = abd > 0.05 ? L.mix(mut, C.tiz, clamp(abd * 1.3, 0, 1)) : mut;
      karin[0].setAttribute("d", `M${183 - kx},${yE + 14} C${178 - kx},${300} ${180 - kx},${340} ${186},${386}`);
      karin[1].setAttribute("d", `M${217 + kx},${yE + 14} C${222 + kx},${300} ${220 + kx},${340} ${214},${386}`);
      karin[2].setAttribute("d", `M200,${yE + 10} L200,388 M${181 - kx},${yE + 46} L${219 + kx},${yE + 46} M${180 - kx},${yE + 84} L${220 + kx},${yE + 84} M${182 - kx * 0.6},${yE + 120} L${218 + kx * 0.6},${yE + 120}`);
      karin.forEach((p) => { p.setAttribute("stroke", krn); p.setAttribute("stroke-width", 1.4 + 2.4 * abd); });
      // etiketler
      // etiket + kesikli gösterge çizgisi; çizgi yazının bittiği yerden başlar
      const set = (e2, yan, y1, x2, y2, renk, metin) => {
        e2.t.setAttribute("y", y1 + 4); if (metin != null) e2.t.textContent = metin;
        e2.t.setAttribute("fill", renk);
        const uz = e2.t.textContent.length * 7.9 + 6;
        const x1 = yan === "sol" ? -44 + uz : 444 - uz;
        e2.cz.setAttribute("d", `M${x1},${y1} L${x2},${y2}`);
        e2.cz.setAttribute("stroke", rgba(mut, 0.7));
      };
      set(et.akc, "sol", 124, 128, 150, mut);
      set(et.kab, "sag", 92, 280, 116 - 6 * e, mut);
      const diaDurum = faz === "al" ? "kasılıyor, iniyor" : faz === "fren" ? "fren yapıyor" : "gevşek";
      set(et.dia, "sag", yP - 18, 252, yP, dia > 0.05 ? C.pes : mut, "diyafram");
      et.dia.t.setAttribute("x", 444);
      et.dia2.t.setAttribute("x", 444); et.dia2.t.setAttribute("y", yP + 2); et.dia2.t.textContent = diaDurum;
      et.dia2.t.setAttribute("fill", dia > 0.05 ? C.pes : mut); et.dia2.t.setAttribute("class", "nefes-etiket kucuk");
      et.dia2.cz.setAttribute("d", "");
      set(et.kar, "sol", 314, 178, 330, abd > 0.05 ? C.tiz : mut, "karın kasları");
      set(et.ara, "sol", 210, 200 - RIB_W[4] + 14, 186, araRenk || mut, "kaburgalar arası");
      et.ara2.t.setAttribute("x", -44); et.ara2.t.setAttribute("y", 230);
      et.ara2.t.textContent = dis > 0.05 ? "dış kaslar çalışıyor" : abd > 0.05 ? "iç kaslar çalışıyor" : "gevşek";
      et.ara2.t.setAttribute("fill", araRenk || mut); et.ara2.t.setAttribute("class", "nefes-etiket kucuk");
    }

    // --- akciğer hacmi grafiği ---
    const grafCv = h("canvas", { "aria-hidden": "true" });
    const grafKap = h("div.nefes-graf", grafCv);
    let GW = 0, GH = 0;
    const G = L.canvas(grafCv, (st) => { GW = st.w; GH = st.h; grafCiz(); });
    const PEN = 12;
    function grafCiz() {
      if (!GW) return;
      const ctx = G.ctx, sol = 92, sag = GW - 10, ust = 10, alt = GH - 44;
      ctx.clearRect(0, 0, GW, GH);
      const y = (x) => alt - x * (alt - ust);
      // ızgara
      ctx.strokeStyle = rgba(C.porte, 0.6); ctx.lineWidth = 1;
      [0, 0.5, 1].forEach((q) => { ctx.beginPath(); ctx.moveTo(sol, Math.round(y(q)) + 0.5); ctx.lineTo(sag, Math.round(y(q)) + 0.5); ctx.stroke(); });
      L.text(ctx, "%100", sol - 8, y(1) + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono });
      L.text(ctx, "%0", sol - 8, y(0) + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono });
      L.text(ctx, "akciğer hacmi", sol - 8, y(0.5) + 4, { size: 11, color: C.muted, align: "right", weight: 600 });
      // dinlenme düzeyi
      ctx.setLineDash([5, 5]); ctx.strokeStyle = C.grafit;
      ctx.beginPath(); ctx.moveTo(sol, y(0.4)); ctx.lineTo(sag, y(0.4)); ctx.stroke(); ctx.setLineDash([]);
      L.text(ctx, "dinlenme düzeyi", sol + 6, y(0.4) - 5, { size: 11, color: C.muted });
      const x = (t) => sag - ((saat - t) / PEN) * (sag - sol);
      // kas etkinliği şeritleri
      const satir = (yy, ad, alan, renk) => {
        L.text(ctx, ad, sol - 8, yy + 10, { size: 11, color: C.muted, align: "right", weight: 600 });
        ctx.fillStyle = rgba(C.porte, 0.18); ctx.fillRect(sol, yy, sag - sol, 13);
        for (let i = 1; i < gecmis.length; i++) {
          const a = gecmis[i - 1], b = gecmis[i];
          if (b[alan] < 0.04) continue;
          ctx.fillStyle = rgba(renk, clamp(b[alan], 0, 1) * 0.85);
          ctx.fillRect(Math.max(sol, x(a.t)), yy, x(b.t) - Math.max(sol, x(a.t)) + 0.6, 13);
        }
      };
      satir(GH - 36, "diyafram", "dia", C.pes);
      satir(GH - 19, "karın, iç kab.", "abd", C.tiz);
      // hacim çizgisi
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
      ctx.beginPath();
      let ilk = true;
      for (const p of gecmis) { const xx = x(p.t); if (xx < sol) continue; if (ilk) { ctx.moveTo(xx, y(p.v)); ilk = false; } else ctx.lineTo(xx, y(p.v)); }
      ctx.stroke();
      const son = gecmis[gecmis.length - 1];
      if (son) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x(son.t), y(son.v), 3.5, 0, TAU); ctx.fill(); }
    }

    const durum = h("p.note-msg.nefes-durum", { "aria-live": "polite" });
    const sayfa = h("div.sheet.nefes-sayfa", h("div.nefes-svg-kap", svg), grafKap);
    stage.append(h("div.controls", modSeg, alBtn, verBtn, hacimSl), sayfa, durum);

    // --- benzetim ---
    const ease = L.ease;
    function adim(dt) {
      vOnce = v;
      if (mod === "sakin") {
        tau += dt;
        const p = tau % 4.6;
        v = p < 1.8 ? 0.4 + 0.12 * ease(p / 1.8) : 0.52 - 0.12 * ease((p - 1.8) / 2.8);
        gerekli = 0;
      } else if (mod === "sarki") {
        sarkiFaz.t += dt;
        const f = sarkiFaz;
        if (f.ad === "al") {
          const k = Math.min(1, f.t / 1.1);
          v = f.v0 + (0.88 - f.v0) * ease(k);
          if (k >= 1) Object.assign(f, { ad: "ver", t: 0 });
        } else if (f.ad === "ver") {
          v = 0.88 - 0.63 * Math.min(1, f.t / 9);
          if (f.t >= 9) Object.assign(f, { ad: "dur", t: 0 });
        } else if (f.t >= 0.6) Object.assign(f, { ad: "al", t: 0, v0: v });
        gerekli = 0.22;
      } else {
        const d = hedef - v;
        const hiz = d > 0 ? 0.45 : 0.09;
        v += Math.sign(d) * Math.min(Math.abs(d), hiz * dt);
        gerekli = 0.22;
      }
      // kas etkinliği (basit model): alırken diyafram ve dış kaburga kasları; verirken geri yaylanma basıncı
      // gerekenden fazlaysa soluk alma kasları fren yapar, azsa karın ve iç kaburga kasları çalışır
      const dv = (v - vOnce) / Math.max(dt, 1e-3);
      let hDia = 0, hAbd = 0, hDis = 0;
      if (dv > 0.01) { faz = "al"; hDia = clamp(dv / 0.35, 0.3, 1); hDis = hDia; }
      else if (dv < -0.005) {
        const geri = (v - 0.4) * 0.9, fark = geri - gerekli;
        if (gerekli === 0) faz = "pasif";
        else if (fark > 0.03) { faz = "fren"; hDia = clamp(fark / 0.25, 0, 1) * 0.8; hDis = hDia * 0.8; }
        else if (fark < -0.03) { faz = "itme"; hAbd = clamp(-fark / 0.2, 0, 1); }
        else faz = "denge";
      } else faz = mod === "sarki" && sarkiFaz.ad === "dur" ? "tut" : "bekle";
      const k = 1 - Math.exp(-dt * 7);
      dia += (hDia - dia) * k; abd += (hAbd - abd) * k; dis += (hDis - dis) * k;
      saat += dt;
      gecmis.push({ t: saat, v, dia, abd });
      while (gecmis.length && gecmis[0].t < saat - PEN - 0.5) gecmis.shift();
    }
    const SOZ = {
      al: "Nefes alınıyor: diyafram kasılıp iniyor, dış kaburgalar arası kaslar kaburgaları açıyor.",
      fren: "Cümle başı: akciğerler dolu, geri yaylanma gerekenden fazla basınç yapıyor. Diyafram ve dış kaburga kasları fren tutuyor.",
      denge: "Geri yaylanma ile gereken basınç kabaca dengede: kaslar az çalışıyor.",
      itme: "Geri yaylanma azaldı: karın kasları ve iç kaburgalar arası kaslar havayı vermeyi sürdürüyor.",
      pasif: "Sakin veriş: kaslar gevşek, akciğerler ve göğüs kafesi kendiliğinden eski hâline dönüyor.",
      tut: "Kısa bir an: cümle bitti, yeni nefes geliyor.",
      bekle: "Kaydırıcıyla ya da düğmelerle nefes alıp verin.",
    };
    let sonSoz = "";
    const dongu = L.loop((dt) => {
      adim(dt);
      ciz();
      grafCiz();
      if (mod !== "elle") hacimSl.set(v);
      else hacimSl.querySelector(".val").textContent = "%" + Math.round(v * 100);
      if (SOZ[faz] !== sonSoz) { sonSoz = SOZ[faz]; durum.textContent = sonSoz; }
    });
    window.addEventListener("themechange", () => { ciz(); grafCiz(); });
    ciz();
    return {
      enter() { dongu.start(); },
      leave() { dongu.stop(); },
    };
  };
  window.GuideScenarios["nefes"] = [{ click: "=Şarkı cümlesi" }, { wait: 2500 }, { click: "=Nefes al" }, { wait: 1500 }, { click: "=Nefes ver" }];

  /* ================= Uzun "sss" ================= */
  // Sentez "sss": bant geçiren süzgeçten geçmiş gürültü. "duzenli": sabit gürlük; "dalgali": sallanan, sonda azalan.
  const SSS_SR = 22050;
  const sssOnbellek = {};
  function sssSentez(tur) {
    if (sssOnbellek[tur]) return sssOnbellek[tur];
    const sr = SSS_SR, T = 5.6, n = Math.round(sr * T);
    const rnd = Ses.rng(tur === "duzenli" ? 5 : 17);
    const out = new Float32Array(n);
    // RBJ bant geçiren (6,2 kHz)
    const w = TAU * 6200 / sr, al = Math.sin(w) / (2 * 0.5), a0 = 1 + al;
    const b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const bas = 0.3, son = T - 0.55;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const x = rnd();
      const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      let env = t < bas ? 0 : t < bas + 0.03 ? (t - bas) / 0.03 : t > son ? Math.max(0, 1 - (t - son) / 0.04) : 1;
      let a;
      if (tur === "duzenli") a = 1 + 0.03 * Math.sin(TAU * 1.3 * t);
      else {
        const k = (t - bas) / (son - bas);
        a = (1 + 0.42 * Math.sin(TAU * 0.8 * t + 0.5) + 0.22 * Math.sin(TAU * 2.1 * t) + 0.12 * Math.sin(TAU * 3.7 * t + 2)) * (1 - 0.5 * k);
        if (t > 2.2 && t < 2.5) a *= 1.6; // nefes "kaçağı"
      }
      out[i] = y * env * a * 0.9;
    }
    // kareler: ~43 ms pencere, ~10,7 ms adım (mikrofon ölçümüne benzer)
    const win = Math.round(sr * 0.0427), hop = Math.round(sr * 0.0107);
    const kareler = [];
    for (let i = 0; i + win <= n; i += hop) {
      let e = 0;
      for (let j = i; j < i + win; j++) e += out[j] * out[j];
      const rms = Math.sqrt(e / win);
      kareler.push({ t: (i + win / 2) / sr, db: 20 * Math.log10(rms + 1e-9), sesli: false });
    }
    return (sssOnbellek[tur] = { data: out, kareler });
  }

  window.Demos.sss = (stage) => {
    const PEN = 16, DB0 = -72, DB1 = -8;
    let pts = [];                 // {t (performance sn), db, aktif}
    let canli = null;             // süren denemenin anlık sonucu
    let son = null;               // son biten deneme {sure, duzen, kaynak}
    let krono = null;             // {bas}
    let ornek = null;             // {ctl, kareler, i, olcer, tur}
    let micOff = null;
    const olcer = Analiz.SssOlcer();
    const simdi = () => performance.now() / 1000;

    const ms = Alistirma.MicSatiri({ onAc: () => { olcer.reset(); durumYaz("Mikrofon açık: uzun bir \"sss\" verin."); } });
    const dBtn = ibtn("play", "Düzenli örnek", () => ornekCal("duzenli"));
    const gBtn = ibtn("play", "Dalgalı örnek", () => ornekCal("dalgali"));
    const kBtn = ibtn("play", "Kronometre", () => kronoToggle(), "primary");
    const durumEl = h("span.readout");
    const cv = h("canvas", { "aria-hidden": "true" });
    const buyuk = h("div.sss-buyuk", { "aria-live": "off" });
    const sayfa = h("div.sheet.sss-serit", cv, buyuk);
    const olcEl = h("div.sonuc");
    const gecCv = h("canvas", { "aria-hidden": "true" });
    const gecBos = h("p.sss-bos");
    const gecKap = h("div.sheet.sss-gecmis", h("div.sss-gecmis-bas", h("b", "Günün en iyisi"), h("span", "süre (çubuk) ve düzenlilik")), h("div.sss-gecmis-cv", gecCv, gecBos));
    stage.append(h("div.controls", kBtn, dBtn, gBtn, h("span.spacer"), durumEl), ms.el, sayfa, olcEl, gecKap);

    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; ciz(); });
    function durumYaz(t) { durumEl.textContent = t; }

    function ciz() {
      if (!W) return;
      const ctx = S.ctx, sol = 44, sag = W - 10, ust = 12, alt = H - 22;
      ctx.clearRect(0, 0, W, H);
      const now = simdi();
      const x = (t) => sag - ((now - t) / PEN) * (sag - sol);
      const y = (db) => alt - clamp((db - DB0) / (DB1 - DB0), 0, 1) * (alt - ust);
      // ızgara: dB çizgileri
      ctx.lineWidth = 1;
      [-60, -40, -20].forEach((d) => {
        ctx.strokeStyle = rgba(C.porte, 0.55);
        ctx.beginPath(); ctx.moveTo(sol, Math.round(y(d)) + 0.5); ctx.lineTo(sag, Math.round(y(d)) + 0.5); ctx.stroke();
        L.text(ctx, d + " dB", sol - 6, y(d) + 4, { size: 10, color: C.muted, align: "right", font: FONT.mono });
      });
      ctx.fillStyle = rgba(C.porte, 0.8); ctx.fillRect(sol - 0.5, 0, 1.5, H);
      // zaman çizgileri (her 2 sn)
      for (let k = Math.ceil((now - PEN) / 2) * 2; k <= now; k += 2) {
        const xx = x(k);
        ctx.strokeStyle = rgba(C.porte, 0.25); ctx.beginPath(); ctx.moveTo(xx, ust); ctx.lineTo(xx, alt); ctx.stroke();
      }
      L.text(ctx, "gürlük", sol + 6, H - 6, { size: 11, color: C.muted, weight: 600 });
      L.text(ctx, "← " + PEN + " sn", sag, H - 6, { size: 11, color: C.muted, align: "right" });
      // etkin bölümler: fosforlu
      let a0 = null;
      for (let i = 0; i <= pts.length; i++) {
        const p = pts[i];
        if (p && p.aktif) { if (a0 == null) a0 = p.t; }
        else if (a0 != null) {
          const x0 = Math.max(sol, x(a0)), x1 = x(pts[i - 1].t);
          if (x1 > sol) { ctx.fillStyle = rgba(C.fosfor, 0.45); ctx.fillRect(x0, ust, x1 - x0, alt - ust); }
          a0 = null;
        }
      }
      // gürlük: kalem çizgisi (kalınlık gürlükle)
      ctx.lineCap = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (b.t - a.t > 0.2 || x(b.t) < sol) continue;
        const g = clamp((b.db - DB0) / (DB1 - DB0), 0, 1);
        ctx.strokeStyle = b.aktif ? C.ink : rgba(C.grafit, 0.6);
        ctx.lineWidth = 1 + 3.5 * g * (b.aktif ? 1 : 0.4);
        ctx.beginPath(); ctx.moveTo(Math.max(sol, x(a.t)), y(a.db)); ctx.lineTo(x(b.t), y(b.db)); ctx.stroke();
      }
    }
    function buyukYaz() {
      buyuk.innerHTML = "";
      if (krono) { buyuk.append(h("b", L.fmtNum(simdi() - krono.bas, 1) + " sn"), h("small", "kronometre: içinizden sayın, bitince durdurun")); return; }
      if (canli && canli.aktif) { buyuk.append(h("b", L.fmtNum(canli.sure, 1) + " sn"), h("small", ornek ? "örnek çalıyor" : "\"sss\" sürüyor")); return; }
      if (son) buyuk.append(h("b", L.fmtNum(son.sure, 1) + " sn"), h("small", son.kaynak === "ornek" ? "örneğin süresi" : "son deneme"));
      else buyuk.append(h("small", Mic.state === "on" ? "uzun bir \"sss\" verin" : "mikrofonu açın ya da kronometreyi başlatın"));
    }
    function sonucYaz(r, kaynak, tur) {
      son = { sure: r.sure, duzen: r.duzen, kaynak };
      olcEl.innerHTML = "";
      const dz = r.duzen == null ? null : Math.round(r.duzen * 100);
      const enIyi = bugunEnIyi();
      olcEl.append(h("div.olcumler",
        h("div.olcum", h("b", L.fmtNum(r.sure, 1) + " sn"), h("small", kaynak === "ornek" ? (tur === "duzenli" ? "düzenli örnek: süre" : "dalgalı örnek: süre") : "süre")),
        h("div.olcum" + (dz == null ? "" : dz >= 75 ? ".tam" : ""), h("b", dz == null ? "–" : "%" + dz), h("small", "düzenlilik")),
        h("div.olcum", h("b", enIyi ? L.fmtNum(enIyi.sure, 1) + " sn" : "–"), h("small", "bugünün en iyisi"))));
      let soz;
      if (kaynak === "ornek") soz = tur === "duzenli" ? "Düzenli örnekte gürlük şeridi neredeyse düz: hava eşit akıyor." : "Dalgalı örnekte gürlük iniş çıkış yapıyor ve sonda azalıyor: nefes eşit verilmiyor. Ortadaki tümsek, bir anda kaçan havadır.";
      else if (kaynak === "krono") soz = "Kronometreyle ölçüldü: düzenlilik için mikrofonu açın.";
      else if (r.sure < 1.5) soz = "Çok kısa bir \"sss\" duydum. Rahat bir nefes alıp yeniden deneyin.";
      else soz = dz >= 80 ? "Çok düzgün: gürlük neredeyse hiç dalgalanmadı." : dz >= 55 ? "İyi: gürlük biraz dalgalandı. Sonraki denemede gürlüğü sabit tutmaya odaklanın." : "Gürlük epey dalgalandı. Daha hafif başlayıp aynı gürlükte tutmayı deneyin; süre ikinci planda.";
      olcEl.append(h("p.note-msg", soz));
    }
    // kayıt: [{tarih, sure, duzen}]; mikrofonsuz kronometre sonuçlarında duzen = null
    function kaydet(sure, duzen) {
      if (sure < 1.5) return;
      const g = L.store.get("sss", []);
      g.push({ tarih: Date.now(), sure: Math.round(sure * 10) / 10, duzen: duzen == null ? null : Math.round(duzen * 100) / 100 });
      L.store.set("sss", g.slice(-200));
      gecmisCiz();
    }
    function gunluk() {
      const g = L.store.get("sss", []);
      const m = new Map();
      g.forEach((x) => {
        const k = gunAnahtar(x.tarih);
        const o = m.get(k) || { tarih: x.tarih, sure: 0, duzen: null };
        o.sure = Math.max(o.sure, x.sure || 0);
        if (x.duzen != null) o.duzen = Math.max(o.duzen || 0, x.duzen);
        m.set(k, o);
      });
      return [...m.values()].sort((a, b) => a.tarih - b.tarih).slice(-10);
    }
    function bugunEnIyi() { const b = gunluk().find((x) => gunAnahtar(x.tarih) === gunAnahtar(Date.now())); return b || null; }

    let GW = 0, GH = 0;
    const GS = L.canvas(gecCv, (st) => { GW = st.w; GH = st.h; gecmisCiz(); });
    function gecmisCiz() {
      const gun = gunluk();
      gecBos.textContent = gun.length ? "" : "Henüz kayıt yok. İlk \"sss\"niz burada görünecek.";
      gecBos.hidden = !!gun.length;
      if (!GW) return;
      const ctx = GS.ctx;
      ctx.clearRect(0, 0, GW, GH);
      if (!gun.length) return;
      const ust = 16, alt = GH - 32, sol = 8, sag = GW - 8;
      const mx = Math.max(10, ...gun.map((x) => x.sure));
      const bw = Math.min(46, (sag - sol) / 10 - 10);
      gun.forEach((d, i) => {
        const xc = sol + (i + 0.5) * ((sag - sol) / Math.max(gun.length, 6));
        const hh = (d.sure / mx) * (alt - ust);
        ctx.fillStyle = gunAnahtar(d.tarih) === gunAnahtar(Date.now()) ? C.ink : rgba(C.ink, 0.45);
        ctx.fillRect(xc - bw / 2, alt - hh, bw, hh);
        L.text(ctx, L.fmtNum(d.sure, 1), xc, alt - hh - 4, { size: 11, color: C.ink, align: "center", weight: 700, font: FONT.mono });
        L.text(ctx, gunEtiket(d.tarih), xc, alt + 13, { size: 10, color: C.muted, align: "center", font: FONT.mono });
        if (d.duzen != null) L.text(ctx, "%" + Math.round(d.duzen * 100), xc, alt + 26, { size: 10, color: d.duzen >= 0.75 ? C.tam : C.muted, align: "center", weight: 700, font: FONT.mono });
      });
      ctx.strokeStyle = C.line2; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sol, alt + 0.5); ctx.lineTo(sag, alt + 0.5); ctx.stroke();
    }

    // mikrofon kareleri
    function kare(k) {
      if (ornek) return;
      const t = simdi();
      if (k.bekle) { pts.push({ t, db: DB0, aktif: false }); return; }
      const r = olcer.push(k);
      pts.push({ t, db: k.db, aktif: !!r.aktif && !r.bitti });
      canli = r.aktif && !r.bitti ? r : null;
      if (r.bitti) {
        sonucYaz(r, "mic");
        if (r.sure >= 1.5) kaydet(r.sure, r.duzen);
      }
    }
    function kronoToggle() {
      Snd.unlock();
      if (krono) {
        const sure = simdi() - krono.bas;
        krono = null;
        kBtn.setLabel("Kronometre"); kBtn.setIcon("play");
        sonucYaz({ sure, duzen: null }, "krono");
        kaydet(sure, null);
      } else {
        ornekDur();
        krono = { bas: simdi() };
        kBtn.setLabel("Durdur"); kBtn.setIcon("stop");
      }
    }
    function ornekDur() { if (ornek) { ornek.ctl && ornek.ctl.stop(); ornek = null; canli = null; } }
    function ornekCal(tur) {
      Snd.unlock();
      ornekDur();
      if (krono) kronoToggle();
      const v = sssSentez(tur);
      const ctl = calSr(v.data, SSS_SR, { gain: 0.9 });
      if (!ctl) return;
      ornek = { ctl, kareler: v.kareler, i: 0, olcer: Analiz.SssOlcer(), tur, sonR: null };
      durumYaz(tur === "duzenli" ? "Düzenli örnek çalıyor" : "Dalgalı örnek çalıyor");
    }
    function ornekAdim() {
      if (!ornek) return;
      const el = Snd.ctx.currentTime - ornek.ctl.t0;
      while (ornek.i < ornek.kareler.length && ornek.kareler[ornek.i].t <= el) {
        const k = ornek.kareler[ornek.i++];
        const r = ornek.olcer.push(k);
        pts.push({ t: simdi(), db: k.db, aktif: !!r.aktif && !r.bitti });
        canli = r.aktif && !r.bitti ? r : null;
        if (r.aktif && !r.bitti) ornek.sonR = r;
        if (r.bitti) ornek.sonR = r;
      }
      if (ornek.i >= ornek.kareler.length) {
        const r = ornek.sonR, tur = ornek.tur;
        ornek = null; canli = null; durumYaz("");
        if (r) sonucYaz(r, "ornek", tur);
      }
    }

    const dongu = L.loop(() => {
      ornekAdim();
      const now = simdi();
      while (pts.length && pts[0].t < now - PEN - 1) pts.shift();
      ciz();
      buyukYaz();
    });
    window.addEventListener("themechange", () => { ciz(); gecmisCiz(); });
    return {
      enter() { micOff = Mic.onFrame(kare); olcer.reset(); dongu.start(); gecmisCiz(); buyukYaz(); },
      leave() { dongu.stop(); micOff && micOff(); micOff = null; ornekDur(); if (krono) { krono = null; kBtn.setLabel("Kronometre"); kBtn.setIcon("play"); } durumYaz(""); },
      toggle: () => kronoToggle(),
    };
  };
  window.GuideScenarios["sss"] = [{ click: "=Düzenli örnek" }, { wait: 6200 }, { click: "=Dalgalı örnek" }];

  /* ================= Destek ve uzun ses ================= */
  const US_SR = 16000;
  const usOnbellek = new Map();
  // Sentez uzun ses: "destekli" sabit; "dagilan" pesleşir, titrer, gürlüğü sallanır ve azalır
  function uzunOrnek(tur, m, sure, tip) {
    const key = [tur, m, sure, tip].join("|");
    if (usOnbellek.has(key)) return usOnbellek.get(key);
    const rnd = Ses.rng(tur === "destekli" ? 3 : 9);
    const ns = [], adimS = 0.1;
    let tr = 0, tr2 = 0;
    for (let t = 0; t < sure - 1e-6; t += adimS) {
      const k = t / sure;
      let c, gr;
      if (tur === "destekli") { c = 3 * Math.sin(TAU * 0.23 * t); gr = 0.62 + 0.015 * Math.sin(TAU * 0.4 * t); }
      else {
        tr = tr * 0.4 + rnd() * 26; tr2 = tr2 * 0.6 + rnd() * 0.09;
        c = -45 * Math.pow(k, 1.3) + 7 * Math.sin(TAU * 1.7 * t) + tr;
        gr = clamp(0.72 - 0.34 * k + 0.12 * Math.sin(TAU * 0.9 * t) + 0.06 * Math.sin(TAU * 2.3 * t + 0.7) + tr2, 0.12, 1);
      }
      ns.push({ f: N.mtof(m + c / 100), d: adimS, u: "a", g: gr, glide: tur === "destekli" ? 0.08 : 0.05 });
    }
    ns.push({ r: 0.3 });
    const r = Ses.ezgi(US_SR, ns, { tip, gurluk: 0.6, jitter: tur === "destekli" ? 0.002 : 0.009, nefes: tur === "destekli" ? 0.05 : 0.25, vibGen: 0, seed: tur === "destekli" ? 5 : 13 });
    // gürlük: sentezin kendi kazanç denetimi yavaş dalgalanmayı yumuşattığı için zarf sonradan uygulanır
    if (tur !== "destekli") {
      for (let i = 0; i < r.data.length; i++) {
        const t = i / US_SR - Ses.BAS, k = clamp(t / sure, 0, 1);
        r.data[i] *= (1 - 0.5 * k) * (1 + 0.28 * Math.sin(TAU * 0.9 * t) + 0.16 * Math.sin(TAU * 2.3 * t + 0.7));
      }
    }
    const kareler = Pitch.izle(r.data, US_SR);
    const v = { data: r.data, kareler };
    usOnbellek.set(key, v);
    if (usOnbellek.size > 8) usOnbellek.delete(usOnbellek.keys().next().value);
    return v;
  }
  // kayıtlı sonuç: sabitlik ölçümü (ilk 0,4 sn sayılmaz)
  function uzunOlc(kareler, m, bas, bit) {
    const ic = kareler.filter((k) => k.t >= bas + 0.4 && k.t <= bit);
    return Analiz.sabitlik(ic, { hedef: m });
  }

  window.Demos.uzunSes = (stage) => {
    let sure = 10, calisiyor = false, timers = [], raf = 0, micOff = null, oynayan = null;
    const sonuclar = new Map(); // ad → {ad, r}
    let onceki = null;          // önceki örneğin noktaları (grafit katman)
    const T_DINLE = 1.6, BOSLUK = 0.6;
    const tip = () => (L.prefs.sesBolge === "pes" ? "erkek" : "kadin");
    const hedefNota = () => Aralik.perdele([0], { pay: 4 });

    const basBtn = ibtn("play", "Başla", () => toggle(), "primary");
    const sureSeg = seg([[8, "8 sn"], [10, "10 sn"], [12, "12 sn"]], sure, (k) => { sure = k; dur(); onizle(); }, "Süre");
    const dBtn = btn("Destekli örnek", () => ornek("destekli"));
    const gBtn = btn("Dağılan örnek", () => ornek("dagilan"));
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", basBtn, sureSeg, dBtn, gBtn, h("span.spacer"), durumEl), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: sure + 0.4, tol: 20 });
    const sonucEl = h("div.sonuc");
    stage.append(sonucEl, Egri.anahtar());

    const bekle = (ms2) => new Promise((res, rej) => { const id = setTimeout(res, ms2); timers.push(id); dur.iptal = () => { clearTimeout(id); rej("iptal"); }; });

    function onizle() {
      if (calisiyor || oynayan) return;
      const m = hedefNota();
      egri.mod("sabit"); egri.sure(sure + 0.4); egri.temizle(); egri.katmanSil();
      egri.aralik(m - 4, m + 4);
      egri.hedefler([{ t0: 0, t1: sure, m, hece: nn(m) }]);
      // örnek çizgi: hafifçe oynayan, sabit bir ses (analitik; ses üretmeden)
      const ps = [];
      for (let t = 0.05; t < sure; t += 0.02) ps.push({ t, m: m + (3 * Math.sin(TAU * 0.23 * t) - 8 * Math.exp(-t * 6)) / 100, g: 0.62 });
      egri.katmanEkle(ps, { ad: "örnek" });
      egri.imlec(null);
      egri.ciz();
    }

    function satir(ad, r) {
      return h("tr", h("td", ad),
        h("td", r ? L.fmtCents(r.ortalamaSapma) : "–"),
        h("td", r ? L.fmtNum(r.titreme, 1) + " sent" : "–"),
        h("td", r ? L.fmtNum(r.gurlukStd, 1) + " dB" : "–"),
        h("td", r ? L.fmtSure(r.sure) : "–"));
    }
    function sonucYaz(enSon) {
      sonucEl.innerHTML = "";
      const r = enSon && enSon.r;
      if (enSon && enSon.ad === "Siz") {
        if (!r) { sonucEl.append(h("p.note-msg", "Sesinizi yeterince duyamadım. Mikrofona biraz yaklaşın ve notayı daha uzun tutun.")); }
        else {
          const sap = r.ortalamaSapma, cls = Math.abs(sap) <= 15 ? ".tam" : sap < 0 ? ".pes" : ".tiz";
          sonucEl.append(h("div.olcumler",
            h("div.olcum" + cls, h("b", L.fmtCents(sap)), h("small", "ortalama sapma")),
            h("div.olcum" + (r.titreme <= 6 ? ".tam" : ""), h("b", L.fmtNum(r.titreme, 1) + " sent"), h("small", "titreme")),
            h("div.olcum" + (r.gurlukStd <= 2 ? ".tam" : ""), h("b", L.fmtNum(r.gurlukStd, 1) + " dB"), h("small", "gürlük dalgalanması")),
            h("div.olcum", h("b", L.fmtSure(r.sure)), h("small", "süre"))));
          const dusus = r.kayma * r.sure;
          const parca = [];
          parca.push(Math.abs(sap) <= 15 ? "Ortalamada hedefin üstündesiniz." : sap < 0 ? "Ortalamada biraz pes kaldınız: bir sonrakinde notayı biraz yukarıda düşünün." : "Ortalamada biraz tiz kaldınız: bir sonrakinde biraz aşağı düşünün.");
          if (dusus < -15) parca.push(`Ses boyunca perde yaklaşık ${Math.round(-dusus)} sent düştü: sona doğru nefesi azaltmadan, aynı rahatlıkla tutmayı deneyin.`);
          if (r.gurlukStd > 3) parca.push("Gürlük epey değişti; daha hafif bir gürlükte başlayıp aynı tutmak daha kolaydır.");
          if (r.sure < sure - 2) parca.push("Ses hedef süreden önce bitti; zorlamayın, daha kısa süreyle başlayabilirsiniz.");
          sonucEl.append(h("p.note-msg", parca.join(" ")));
        }
      } else if (enSon && r) {
        const dusus = r.kayma * r.sure;
        sonucEl.append(h("p.note-msg", enSon.ad === "Destekli örnek"
          ? "Destekli örnek: perde bandın içinde kalıyor, gürlük neredeyse sabit."
          : `Dağılan örnek: perde yaklaşık ${Math.round(-dusus)} sent düşüyor, gürlük sallanıyor ve azalıyor.` + (onceki ? " Grafit çizgi önceki örnek." : "")));
      }
      if (sonuclar.size) {
        sonucEl.append(h("table.data.us-tablo", h("thead", h("tr", h("th", ""), h("th", "ort. sapma"), h("th", "titreme"), h("th", "gürlük"), h("th", "süre"))),
          h("tbody", [...sonuclar.values()].map((x) => satir(x.ad, x.r)))));
      }
    }

    function imlecBasla(t0) {
      const c = Snd.ctx;
      const f = () => { egri.imlec(c.currentTime - t0); raf = requestAnimationFrame(f); };
      cancelAnimationFrame(raf); f();
    }

    // mikrofonsuz karşılaştırma: iki sentez uzun ses aynı eğride
    function ornek(tur) {
      Snd.unlock();
      dur();
      if (oynayan) { oynayan.stop(); oynayan = null; }
      const m = hedefNota();
      const v = uzunOrnek(tur, m, sure, tip());
      const ctl = calSr(v.data, US_SR, { gain: 0.9 });
      if (!ctl) return;
      const ad = tur === "destekli" ? "Destekli örnek" : "Dağılan örnek";
      egri.mod("sabit"); egri.sure(sure + 0.4);
      egri.aralik(m - 4, m + 4);
      egri.hedefler([{ t0: 0, t1: sure, m, hece: nn(m) }]);
      egri.katmanSil();
      if (onceki && onceki.tur !== tur) egri.katmanEkle(onceki.noktalar, { ad: onceki.ad });
      egri.basla(ctl.t0 + Ses.BAS);
      const oyn = egri.oynat(v.kareler, ctl.t0, { bitince: () => {
        oynayan = null; durumEl.textContent = "";
        onceki = { tur, ad, noktalar: egri.noktalar.slice() };
        const r = uzunOlc(v.kareler.map((k) => Object.assign({}, k, { t: k.t - Ses.BAS })), m, 0, sure);
        sonuclar.set(ad, { ad, r });
        sonucYaz({ ad, r });
      } });
      oynayan = { stop() { ctl.stop(); oyn.stop(); } };
      durumEl.textContent = ad + " çalıyor";
    }

    async function baslat() {
      if (calisiyor) return;
      Snd.unlock();
      if (oynayan) { oynayan.stop(); oynayan = null; }
      const c = Snd.ready(); if (!c) return;
      calisiyor = true;
      basBtn.setLabel("Durdur"); basBtn.setIcon("stop");
      let mic = Mic.state === "on";
      if (!mic) mic = await Mic.start();
      if (!calisiyor) return;
      const m = hedefNota();
      const T = T_DINLE + BOSLUK + sure;
      const t0 = c.currentTime + 0.25;
      egri.mod("sabit"); egri.sure(T + 0.4); egri.temizle(); egri.katmanSil();
      egri.aralik(m - 5, m + 5);
      egri.basla(t0);
      egri.hedefler([{ t0: 0, t1: T_DINLE, m, hece: nn(m), aktif: false }, { t0: T_DINLE + BOSLUK, t1: T, m, hece: "tutun" }]);
      sonucEl.innerHTML = "";
      const kareler = [];
      if (mic) micOff = egri.dinle((k, t) => kareler.push({ t, sesli: k.sesli, ham: k.ham, midi: k.midi, db: k.db }));
      Snd.referans([{ m, d: T_DINLE }], { when: t0 });
      imlecBasla(t0);
      durumEl.textContent = "Dinleyin…";
      let ornekCtl = null;
      try {
        await bekle((t0 + T_DINLE + BOSLUK * 0.5 - c.currentTime) * 1000);
        egri.durum(mic ? "Şimdi siz" : "Örnek ses", { buyuk: true });
        timers.push(setTimeout(() => egri.durum(null), 900));
        if (!mic) {
          const v = uzunOrnek("destekli", m, sure, tip());
          ornekCtl = calSr(v.data, US_SR, { when: t0 + T_DINLE + BOSLUK - Ses.BAS, gain: 0.9 });
          if (ornekCtl) egri.oynat(v.kareler, ornekCtl.t0);
        }
        const bitis = t0 + T;
        while (c.currentTime < bitis - 0.05) {
          const kalan = Math.max(0, bitis - c.currentTime);
          durumEl.textContent = (mic ? "Tutun: " : "Örnek ses: ") + Math.ceil(kalan) + " sn";
          await bekle(Math.min(250, kalan * 1000 + 20));
        }
        await bekle(300);
      } catch (e) { if (e !== "iptal") console.error(e); calisiyor = false; ornekCtl && ornekCtl.stop(); return; }
      cancelAnimationFrame(raf);
      micOff && micOff(); micOff = null;
      calisiyor = false;
      basBtn.setLabel("Başla"); basBtn.setIcon("play");
      durumEl.textContent = "";
      if (mic) {
        const r = uzunOlc(kareler, m, T_DINLE + BOSLUK, T);
        sonuclar.set("Siz", { ad: "Siz", r });
        sonucYaz({ ad: "Siz", r });
        if (r && r.sure >= 3) {
          const g = L.store.get("uzunSes", []);
          g.push({ tarih: Date.now(), ortSapma: Math.round(r.ortSapma * 10) / 10, titreme: Math.round(r.titreme * 10) / 10, gurlukStd: Math.round(r.gurlukStd * 10) / 10, sure: Math.round(r.sure * 10) / 10 });
          L.store.set("uzunSes", g.slice(-200));
        }
      } else {
        sonucEl.innerHTML = "";
        sonucEl.append(h("p.note-msg", "Mikrofon kapalıyken eğriyi destekli örnek ses çizdi. Kendi sesinizi ölçmek için mikrofonu açın."));
      }
    }
    function dur() {
      if (!calisiyor) return;
      calisiyor = false;
      timers.forEach(clearTimeout); timers = [];
      dur.iptal && dur.iptal();
      cancelAnimationFrame(raf);
      micOff && micOff(); micOff = null;
      Snd.stopAll();
      Mic.bekle("referans", false);
      egri.durum(null);
      basBtn.setLabel("Başla"); basBtn.setIcon("play");
      durumEl.textContent = "";
    }
    function toggle() { calisiyor ? dur() : baslat(); }
    window.addEventListener("aralikchange", () => { if (!calisiyor && !oynayan) onizle(); });
    return {
      enter() { egri.baslat(); onizle(); },
      leave() { dur(); if (oynayan) { oynayan.stop(); oynayan = null; } egri.durdur(); durumEl.textContent = ""; },
      toggle,
    };
  };
  window.GuideScenarios["uzun-ses"] = [{ click: "=8 sn" }, { wait: 400 }, { click: "=Destekli örnek" }, { wait: 9000 }, { click: "=Dağılan örnek" }];

  /* ================= Duruş ================= */
  const ALISKANLIK = [
    { id: "cene", ad: "Çene ileri", baslik: "Çene öne uzanmış",
      neden: "Baş omuzların önüne uzandıkça boynun kasları onu taşımak için daha çok çalışır; gırtlağın çevresi gerilebilir. Başı omuzların üstüne geri getirin, çene yere aşağı yukarı paralel kalsın." },
    { id: "omuz", ad: "Omuzlar yukarıda", baslik: "Omuzlar kalkık",
      neden: "Nefes alırken omuzları kaldırmak üst göğüs ve boyun kaslarını çalıştırır; nefes sığ kalır, boyun gerilir. Omuzları bırakın; nefes alırken alt kaburgalar ve karın genişlesin." },
    { id: "gogus", ad: "Göğüs çökük", baslik: "Göğüs çökmüş, sırt kamburlaşmış",
      neden: "Göğüs kafesi çökünce kaburgaların açılacak yeri azalır, nefes almak zorlaşabilir. Göğüs kemiğini şişirmeden, rahatça yukarıda tutun; sırt kendiliğinden uzar." },
    { id: "boyun", ad: "Boyun gergin", baslik: "Boyun kasılmış",
      neden: "Boyun kasları sertleşince gırtlak serbest hareket edemeyebilir; tiz notalarda gırtlağı yukarı çekme eğilimi artabilir. Başınızı çok hafifçe evet-hayır sallayarak boynun serbest olduğunu yoklayın." },
    { id: "diz", ad: "Dizler kilitli", baslik: "Dizler geriye kilitlenmiş",
      neden: "Dizler geriye kilitlenince ağırlık eklemlere biner, leğen kemiği öne kayar ve bel çukuru artabilir; beden esnekliğini kaybeder. Dizleri hafifçe esnek tutun, ağırlık iki ayağa eşit dağılsın." },
  ];

  window.Demos.durus = (stage) => {
    const yanlis = {}, an = {}; // hedef (1 = alışkanlık) ve canlandırılan değer
    ALISKANLIK.forEach((a) => { yanlis[a.id] = 1; an[a.id] = 1; });
    let secili = null;

    const modSeg = seg([["yanlis", "Alışkanlık"], ["dogru", "Rahat duruş"]], "yanlis", (k) => {
      ALISKANLIK.forEach((a) => { yanlis[a.id] = k === "yanlis" ? 1 : 0; });
      secili = null; bilgiYaz(); listeYaz(); dongu.start();
    }, "Duruş");
    const svg = s("svg", { viewBox: "60 20 260 466", class: "durus-svg", role: "img", "aria-label": "Yandan görünen stilize bir figür; alışkanlık noktaları işaretli" });
    const kat = s("g"), isaretKat = s("g");
    svg.append(kat, isaretKat);
    const liste = h("div.durus-liste", { role: "group", "aria-label": "Alışkanlıklar" });
    const btnler = {};
    ALISKANLIK.forEach((a) => {
      const b = h("button.durus-madde", { type: "button", onclick: () => degistir(a.id) }, h("span.d-ad", a.ad), h("span.d-durum"));
      btnler[a.id] = b; liste.append(b);
    });
    const bilgi = h("div.durus-bilgi", { "aria-live": "polite" });
    const sayfa = h("div.sheet.durus-sayfa", h("div.durus-svg-kap", svg), h("div.durus-yan", liste, bilgi));
    stage.append(h("div.controls", modSeg), sayfa);

    function degistir(id) {
      yanlis[id] = yanlis[id] ? 0 : 1;
      secili = id;
      const hepsi = ALISKANLIK.every((a) => yanlis[a.id]), hic = ALISKANLIK.every((a) => !yanlis[a.id]);
      modSeg.set(hepsi ? "yanlis" : hic ? "dogru" : null);
      bilgiYaz(); listeYaz(); dongu.start();
    }
    function listeYaz() {
      ALISKANLIK.forEach((a) => {
        const b = btnler[a.id];
        b.classList.toggle("duzeldi", !yanlis[a.id]);
        b.classList.toggle("secili", secili === a.id);
        b.setAttribute("aria-pressed", !yanlis[a.id]);
        b.querySelector(".d-durum").textContent = yanlis[a.id] ? "düzelt" : "düzeldi";
      });
    }
    function bilgiYaz() {
      bilgi.innerHTML = "";
      if (!secili) {
        const kalan = ALISKANLIK.filter((a) => yanlis[a.id]).length;
        bilgi.append(h("p", kalan ? `Kırmızı halkalar ${kalan} alışkanlığı gösteriyor. Birine dokunun: figür düzelir, nedeni burada yazar.` : "Rahat duruş: kulak, omuz, kalça, diz ve ayak bileği aşağı yukarı aynı kesikli çizgide. Bir maddeye dokunup alışkanlığa geri dönebilirsiniz."));
        return;
      }
      const a = ALISKANLIK.find((x) => x.id === secili);
      bilgi.append(h("b", (yanlis[a.id] ? "Alışkanlık: " : "Düzeltildi: ") + a.baslik), h("p", a.neden));
    }

    // figür: her alışkanlık 0 (rahat) … 1 (alışkanlık) arasında
    function ciz() {
      const ink = C.ink, mut = C.muted;
      const { cene, omuz, gogus, boyun, diz } = an;
      kat.innerHTML = ""; isaretKat.innerHTML = "";
      const yol = (d, o = {}) => kat.append(s("path", Object.assign({ d, fill: "none", stroke: ink, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, o)));
      // eklemler (yandan, yüz sağa dönük); rahat duruşta kulak, omuz, kalça, diz, ayak bileği x ≈ 170 çizgisinde
      const A = [168, 456];
      const K = [174 - 12 * diz, 374];
      const Hp = [170 + 6 * gogus + 8 * diz, 282];
      const Sh = [170 + 14 * gogus + 3 * cene, 142 - 14 * omuz + 6 * gogus];
      const Hd = [174 + 30 * cene + 10 * gogus, 82 + 6 * cene + 5 * gogus - 4 * omuz];
      // zemin
      yol(`M86,472 L292,472`, { stroke: C.porte, "stroke-width": 1.5 });
      // uzuv: kalın mürekkep + içi kâğıt rengi = çift çizgili kol ve bacak
      const uzuv = (d, w) => { yol(d, { "stroke-width": w + 3.6 }); yol(d, { "stroke-width": w, stroke: C.kagit }); };
      // ayak ve bacak
      yol(`M${A[0] - 16},${470} L${A[0] + 46},${470} C${A[0] + 44},${461} ${A[0] + 26},${456} ${A[0] + 12},${446}`, { "stroke-width": 2.2 });
      uzuv(`M${K[0]},${K[1]} L${A[0]},${A[1]}`, 22);
      uzuv(`M${Hp[0] - 2},${Hp[1]} L${K[0]},${K[1]}`, 30);
      // gövde: sırt (göğüs çökünce kamburlaşır), kalça, karın, göğüs, boğaz
      const NB = [Hd[0] - 16, Hd[1] + 22], TH = [Hd[0] + 6, Hd[1] + 28];
      const NBB = [Sh[0] - 16 - 4 * gogus, Sh[1] - 8], NF = [Sh[0] + 18 - 2 * gogus, Sh[1] - 4];
      const UB = [Sh[0] - 30 - 12 * gogus, Sh[1] + 30 - 4 * gogus];
      const LB = [Hp[0] - 22 + 4 * gogus, Hp[1] - 46];
      const BT = [Hp[0] - 30, Hp[1] + 10];
      const GR = [Hp[0] + 20, Hp[1] + 18];
      const BE = [Hp[0] + 26 + 12 * gogus + 4 * diz, Hp[1] - 40];
      const CH = [Sh[0] + 40 - 16 * gogus, Sh[1] + 40 + 10 * gogus];
      const f = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
      const gv = `M${f(NB)} C${f([NB[0] - 1, NB[1] + 8])} ${f([NBB[0] + 2, NBB[1] - 8])} ${f(NBB)}`
        + ` C${f([NBB[0] - 6, NBB[1] + 6])} ${f([UB[0] + 2, UB[1] - 22])} ${f(UB)}`
        + ` C${f([UB[0] - 3, UB[1] + 36])} ${f([LB[0] - 6, LB[1] - 34])} ${f(LB)}`
        + ` C${f([LB[0] + 4, LB[1] + 20])} ${f([BT[0] - 4, BT[1] - 24])} ${f(BT)}`
        + ` C${f([BT[0] + 3, BT[1] + 18])} ${f([GR[0] - 20, GR[1] + 4])} ${f(GR)}`
        + ` C${f([GR[0] + 6, GR[1] - 16])} ${f([BE[0] + 2, BE[1] + 24])} ${f(BE)}`
        + ` C${f([BE[0] - 2, BE[1] - 26])} ${f([CH[0] + 2, CH[1] + 36])} ${f(CH)}`
        + ` C${f([CH[0] - 2, CH[1] - 24])} ${f([NF[0] + 12, NF[1] + 4])} ${f(NF)}`
        + ` C${f([NF[0] - 6, NF[1] - 4])} ${f([TH[0] + 2, TH[1] + 8])} ${f(TH)} Z`;
      yol(gv, { fill: C.kagit });
      // boyun gerginliği: boynun önünde kırmızı kalem çizgileri
      if (boyun > 0.02) for (let i = 0; i < 3; i++) {
        const t = 0.2 + i * 0.3, x = TH[0] + (NF[0] - TH[0]) * t - 10, y = TH[1] + (NF[1] - TH[1]) * t;
        kat.append(s("path", { d: `M${x - 6},${y} l4,-4 l4,5 l4,-5 l4,4`, stroke: C.kirmizi, "stroke-width": 1.6, fill: "none", opacity: boyun, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      }
      // kol
      const E = [Sh[0] + 2 + 6 * gogus, Sh[1] + 96], W = [Sh[0] + 12 + 10 * gogus, Sh[1] + 178];
      uzuv(`M${Sh[0]},${Sh[1] + 4} L${E[0]},${E[1]} L${W[0]},${W[1]}`, 17);
      kat.append(s("ellipse", { cx: W[0] + 2, cy: W[1] + 14, rx: 9, ry: 14, fill: C.kagit, stroke: ink, "stroke-width": 2 }));
      // omuz kalkıklığı: küçük ok
      if (omuz > 0.02) kat.append(s("path", { d: `M${Sh[0] - 22},${Sh[1] - 6} l0,-16 m-5,5 l5,-5 l5,5`, stroke: C.kirmizi, "stroke-width": 1.8, fill: "none", opacity: omuz, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      // baş (çene ileriyken hafifçe yukarı döner)
      const bas = s("g", { transform: `rotate(${-12 * cene} ${Hd[0]} ${Hd[1]})` });
      const by = (d, o = {}) => bas.append(s("path", Object.assign({ d, fill: "none", stroke: ink, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, o)));
      bas.append(s("circle", { cx: Hd[0], cy: Hd[1], r: 27, fill: C.kagit, stroke: ink, "stroke-width": 2 }));
      by(`M${Hd[0] + 25},${Hd[1] - 6} l8,10 l-7,3`);
      by(`M${Hd[0] + 22},${Hd[1] + 14} C${Hd[0] + 22},${Hd[1] + 28} ${Hd[0] + 10},${Hd[1] + 32} ${Hd[0] + 2},${Hd[1] + 27}`);
      bas.append(s("ellipse", { cx: Hd[0] - 4, cy: Hd[1] + 2, rx: 4.5, ry: 7.5, fill: "none", stroke: ink, "stroke-width": 1.6 }));
      bas.append(s("circle", { cx: Hd[0] + 14, cy: Hd[1] - 7, r: 2.2, fill: ink }));
      kat.append(bas);
      // denge çizgisi (figürün üstünde, soluk)
      kat.append(s("path", { d: `M170,40 L170,472`, stroke: C.porte, "stroke-width": 1.6, "stroke-dasharray": "6 6", fill: "none" }));
      kat.append(s("text", { x: 176, y: 44, class: "durus-not", fill: mut, text: "denge çizgisi" }));
      // işaret halkaları (dokunulabilir)
      const yerler = {
        cene: [Hd[0] + 20, Hd[1] + 24, 14], boyun: [NB[0] - 12, NB[1] + 8, 13],
        omuz: [Sh[0] - 8, Sh[1] + 18, 15], gogus: [CH[0] - 2, CH[1] + 8, 16], diz: [K[0], K[1], 17],
      };
      ALISKANLIK.forEach((a) => {
        const [x, y, r] = yerler[a.id];
        const yan = yanlis[a.id];
        const grp = s("g", { class: "durus-nokta" + (yan ? "" : " duzeldi"), role: "button", tabindex: 0, "aria-label": a.ad + (yan ? ": düzelt" : ": düzeldi") });
        grp.append(s("circle", { cx: x, cy: y, r: r + 6, fill: "transparent", stroke: "none" }));
        grp.append(s("path", { d: `M${x + r},${y} A${r},${r * 0.92} 0 1 1 ${x + r * 0.7},${y - r * 0.75}`, fill: "none", stroke: yan ? C.kirmizi : C.tam, "stroke-width": secili === a.id ? 2.8 : 2, "stroke-linecap": "round" }));
        if (!yan) grp.append(s("path", { d: `M${x - 5},${y} l4,4 l7,-8`, fill: "none", stroke: C.tam, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
        grp.addEventListener("click", () => degistir(a.id));
        grp.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); degistir(a.id); } });
        isaretKat.append(grp);
      });
    }
    const dongu = L.loop((dt) => {
      let hareket = false;
      const k = azHareket() ? 1 : 1 - Math.exp(-dt * 7);
      ALISKANLIK.forEach((a) => {
        const d = yanlis[a.id] - an[a.id];
        if (Math.abs(d) > 0.002) { an[a.id] += d * k; hareket = true; } else an[a.id] = yanlis[a.id];
      });
      ciz();
      if (!hareket) dongu.stop();
    });
    window.addEventListener("themechange", ciz);
    bilgiYaz(); listeYaz(); ciz();
    return { enter() { ciz(); }, leave() { dongu.stop(); } };
  };
  window.GuideScenarios["durus"] = [{ click: "Çene ileri" }, { wait: 1200 }, { click: "Omuzlar yukarıda" }, { wait: 1200 }, { click: "=Rahat duruş" }];
})();
