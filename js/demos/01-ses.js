/* 1. Ses nasıl çıkar?: deneyler */
(function () {
  const { h, s, seg, ibtn, slider, C, FONT, rgba, clamp } = L;
  const azHareket = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const varsayilanTip = () => (L.prefs.sesBolge === "pes" ? "erkek" : "kadin");
  const TIPLER = [["erkek", "Erkek"], ["kadin", "Kadın"], ["cocuk", "Çocuk (tahmini)"]];
  const F0 = { erkek: 130, kadin: 220, cocuk: 270 };

  /* ===================== Ses aygıtı: stilize kesit ===================== */
  const ROL = {
    guc: { ad: "Güç kaynağı", d: "Akciğerler ve solunum kasları havayı verir ve ses tellerinin altında hafif bir basınç kurar." },
    titresen: { ad: "Titreşen", d: "Ses telleri bu havayı titreşime, yani sese çevirir." },
    rez: { ad: "Rezonatör", d: "Yutak, ağız ve burun titreşimi biçimlendirir: bazı frekansları güçlendirir, bazılarını zayıflatır." },
  };
  const PARCA = {
    akciger: { ad: "Akciğerler", rol: "guc", d: "Ses için gereken havayı depolar. Nefes verirken karın ve göğüs kafesi kasları havaya hafif, dengeli bir basınç verir. Bu basıncı ayarlayabilmek, şarkıda \"destek\" denen becerinin özüdür (2. bölüm)." },
    diyafram: { ad: "Diyafram", rol: "guc", d: "Göğüs boşluğunu karından ayıran kubbe biçimli kas. Nefes alırken kasılıp iner ve akciğerlere hava dolar. Nefes verirken çoğunlukla gevşer; havayı vermek asıl olarak karın ve kaburga kaslarının işidir, diyafram yalnızca soluğu frenlemek için etkin kalabilir." },
    soluk: { ad: "Soluk borusu", rol: "guc", d: "Akciğerlerden gelen havayı gırtlağa taşıyan boru. Kıkırdak halkalar onu hep açık tutar." },
    girtlak: { ad: "Gırtlak", tam: "Gırtlak ve ses telleri", rol: "titresen", d: "Soluk borusunun üst ucundaki kıkırdak kutu (larinks). İçindeki iki ses teli söylerken birbirine yaklaşır; geçen hava onları saniyede yüzlerce kez açıp kapatır. Boynunuzun önündeki \"âdemelması\" gırtlağın ön yüzüdür." },
    yutak: { ad: "Yutak", rol: "rez", d: "Gırtlağın üstünden burnun arkasına uzanan boğaz borusu. Ses yolunun ilk ve en uzun parçasıdır; genişliği ve gırtlağın yüksekliği tınıyı koyulaştırır ya da parlatır." },
    agiz: { ad: "Ağız", rol: "rez", d: "Dil, çene ve dudaklarla biçimi en çok değişen rezonatör. Ünlüleri (a, e, i, o…) birbirinden ayıran, ağzın ve dilin biçimidir." },
    burun: { ad: "Burun", tam: "Burun boşluğu", rol: "rez", d: "Yumuşak damak inince ses yoluna katılır: \"m\", \"n\" gibi genizden seslerde ses buradan da çıkar. Ünlülerde yumuşak damak çoğunlukla kalkıktır ve burun boşluğu büyük ölçüde kapanır." },
  };
  // çizim (viewBox 0 0 360 520): baş ve boyun yandan, akciğerler önden; birkaç kalem çizgisi
  const SEKIL = {
    burun: { dolgu: "M100,112 C122,96 176,94 214,106 C224,110 226,122 222,130 C190,126 140,126 104,128 C98,124 96,116 100,112 Z", cizgi: ["M106,131 C140,129 180,129 206,133"] },
    agiz: { dolgu: "M106,146 C130,138 180,136 206,139 C216,143 218,152 216,162 C200,174 170,180 140,176 C124,174 112,168 108,160 Z", cizgi: ["M113,166 C130,152 168,148 194,153 C208,157 213,170 212,186"] },
    yutak: { dolgu: "M222,110 C232,114 237,126 237,140 L238,236 L214,236 C214,214 213,196 213,186 C214,168 218,152 222,138 Z", cizgi: ["M206,133 C214,135 220,142 222,152", "M237,140 L238,236"] },
    girtlak: { dolgu: "M206,238 L242,238 L243,284 L207,284 L199,258 Z", cizgi: ["M206,238 L199,258 L207,284", "M214,236 C209,228 211,219 218,215"] },
    soluk: { dolgu: "M213,284 L237,284 L237,372 L213,372 Z", cizgi: ["M213,284 L213,372", "M237,284 L237,372", "M214,296 L236,296", "M214,308 L236,308", "M214,320 L236,320", "M214,332 L236,332", "M214,344 L236,344", "M214,356 L236,356"] },
    akciger: { dolgu: "M204,388 C182,378 150,392 138,424 C126,458 128,488 144,496 C162,502 192,494 206,486 C210,460 210,416 204,388 Z M244,388 C266,378 298,392 310,424 C322,458 320,488 304,496 C286,502 256,494 242,486 C238,460 238,416 244,388 Z",
      cizgi: ["M225,372 L225,382 M225,382 C215,388 206,394 192,408 M225,382 C235,388 244,394 258,408", "M192,408 L178,424 M192,408 L190,430 M258,408 L272,424 M258,408 L260,430"] },
    diyafram: { dolgu: "M120,512 C150,490 196,490 224,500 C252,490 298,490 328,512 L328,518 C298,498 252,498 224,508 C196,498 150,498 120,518 Z", cizgi: [] },
  };
  const ETIKET = [
    ["burun", "burun", 12, 104, 112, 112], ["agiz", "ağız", 12, 158, 128, 158], ["yutak", "yutak", 300, 182, 238, 182],
    ["girtlak", "gırtlak", 300, 262, 243, 262], ["soluk", "soluk borusu", 12, 330, 212, 330],
    ["akciger", "akciğerler", 12, 452, 132, 452], ["diyafram", "diyafram", 12, 506, 124, 510],
  ];
  // hava yolu: akciğerden ağza (titreşimden sonrası ses)
  const YOL = "M225,468 L225,384 L225,284 L225,238 L226,190 C226,164 220,154 200,153 L108,153 L58,153";

  window.Demos.sesAygiti = (stage) => {
    let secili = null, seciliRol = null;
    // canlandırma: düzey (0–1), sesli mi (ses telleri titreşiyor mu); MicSatiri onKapa'yı hemen çağırır
    let duzey = 0, hedefDuzey = 0, sesli = false, t = 0;
    let kaynak = null; // "ornek" | "nefes" | "mic"
    let canli = null, bitisT = 0, micOff = null;
    // --- kontroller
    const ornekBtn = ibtn("play", "Örnek ses", () => ornek(), "primary");
    const nefesBtn = ibtn("play", "Yalnız nefes", () => nefes());
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri({ onAc: micAc, onKapa: micKapa });
    // --- çizim
    const svg = s("svg", { class: "sa-cizim", viewBox: "0 0 360 520", role: "img", "aria-label": "Ses aygıtının stilize kesiti: akciğerler, soluk borusu, gırtlak, yutak, ağız ve burun" });
    svg.append(s("path", { class: "kontur ince", d: "M168,22 C130,22 104,44 100,78 C98,92 96,100 88,116 C84,124 90,128 98,129 C96,136 99,140 103,143 C99,147 100,152 104,153 C100,157 101,162 106,164 C104,176 104,186 112,192 C122,198 138,198 146,204 C152,224 160,262 170,300" }));
    svg.append(s("path", { class: "kontur ince", d: "M168,22 C230,18 282,52 286,108 C290,150 272,180 258,206 C252,232 254,270 262,300" }));
    svg.append(s("path", { class: "kontur ince", d: "M170,300 C150,322 112,330 98,352 L94,516 M262,300 C282,322 326,330 340,352 L344,516" }));
    const gruplar = {};
    Object.entries(SEKIL).forEach(([k, sk]) => {
      const g = s("g", { class: "parca", "data-k": k, tabindex: 0, role: "button", "aria-label": PARCA[k].tam || PARCA[k].ad });
      g.append(s("path", { class: "dolgu", d: sk.dolgu }));
      g.append(s("path", { class: "kontur", d: sk.dolgu }));
      sk.cizgi.forEach((d) => g.append(s("path", { class: "kontur ic", d })));
      g.addEventListener("click", () => sec(k));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sec(k); } });
      gruplar[k] = g;
      svg.append(g);
    });
    // ses telleri: iki kama (titreşir)
    const telSol = s("path", { class: "tel" }), telSag = s("path", { class: "tel" });
    gruplar.girtlak.append(telSol, telSag);
    const etiketler = {};
    ETIKET.forEach(([k, yazi, x, y, x2, y2]) => {
      const sag = x > 200;
      const t = s("text", { class: "etiket", x, y: y + 4, "text-anchor": sag ? "start" : "start", "data-k": k, text: yazi });
      const len = yazi.length * 6.6;
      const lx = sag ? x - 4 : x + len + 4;
      svg.append(s("path", { class: "kilavuz", d: `M${lx},${y} L${x2},${y2}` }), t);
      t.addEventListener("click", () => sec(k));
      etiketler[k] = t;
    });
    const yol = s("path", { d: YOL, fill: "none", stroke: "none" });
    svg.append(yol);
    // hava parçacıkları ve ağızdan çıkan ses dalgaları
    const NP = 16;
    const parcaciklar = [];
    for (let i = 0; i < NP; i++) { const c = s("circle", { class: "hava", r: 2.6, cx: -10, cy: -10 }); svg.append(c); parcaciklar.push({ el: c, u: i / NP }); }
    const dalgalar = [0, 1, 2].map(() => { const p = s("path", { class: "dalga", d: "M0,-14 A16,16 0 0 0 0,14" }); svg.append(p); return p; });
    let yolBoy = 0, girtlakU = 0.5;

    // --- bilgi paneli
    const bilgiAd = h("h3.sa-ad", "Bir parça seçin");
    const bilgiRol = h("span.sa-rol");
    const bilgiMetin = h("p.sa-metin", "Çizimde bir parçaya ya da aşağıdaki adlardan birine dokunun. Parçalar üç göreve ayrılır.");
    const rolListe = h("div.sa-roller");
    const parcaBtn = {};
    Object.entries(ROL).forEach(([r, v]) => {
      const satir = h("div.sa-rol-satir", { "data-rol": r });
      const rb = h("button.sa-rol-ad", { type: "button", onclick: () => secRol(r) }, v.ad);
      const kutu = h("div.sa-chips");
      Object.entries(PARCA).filter(([, p]) => p.rol === r).forEach(([k, p]) => {
        const b = h("button.btn.sm.sa-chip", { type: "button", onclick: () => sec(k) }, p.ad);
        parcaBtn[k] = b; kutu.append(b);
      });
      satir.append(rb, kutu);
      rolListe.append(satir);
    });
    const bilgi = h("div.sa-bilgi", h("div.sa-kart", bilgiAd, bilgiRol, bilgiMetin), rolListe);
    const sayfa = h("div.sheet.margin.sa-sayfa", h("div.sa-cizim-kap", svg), bilgi);
    stage.append(h("div.controls", ornekBtn, nefesBtn, h("span.spacer"), durum), ms.el, sayfa);

    function isaretle(ks) {
      Object.entries(gruplar).forEach(([k, g]) => g.classList.toggle("sec", ks.includes(k)));
      Object.entries(etiketler).forEach(([k, t]) => t.classList.toggle("sec", ks.includes(k)));
      Object.entries(parcaBtn).forEach(([k, b]) => b.classList.toggle("on", ks.length === 1 && ks[0] === k));
      rolListe.querySelectorAll(".sa-rol-satir").forEach((el) => el.classList.toggle("on", el.dataset.rol === seciliRol));
    }
    function sec(k) {
      secili = k; seciliRol = null;
      const p = PARCA[k];
      bilgiAd.textContent = p.tam || p.ad;
      bilgiRol.textContent = ROL[p.rol].ad;
      bilgiRol.dataset.rol = p.rol;
      bilgiMetin.textContent = p.d;
      isaretle([k]);
    }
    function secRol(r) {
      secili = null; seciliRol = r;
      bilgiAd.textContent = ROL[r].ad;
      bilgiRol.textContent = Object.values(PARCA).filter((p) => p.rol === r).map((p) => p.ad).join(", ");
      bilgiRol.dataset.rol = r;
      bilgiMetin.textContent = ROL[r].d;
      isaretle(Object.keys(PARCA).filter((k) => PARCA[k].rol === r));
    }

    // --- canlandırma (değişkenler en üstte tanımlı)
    const dongu = L.loop((dt) => {
      t += dt;
      if (kaynak === "ornek") {
        const k = clamp(t / 3.4, 0, 1);
        hedefDuzey = Math.pow(Math.sin(Math.PI * k), 0.6);
        canli && canli.set({ gurluk: 0.25 + 0.7 * hedefDuzey });
        if (k >= 1) bitir();
      } else if (kaynak === "nefes") {
        const k = clamp(t / 3, 0, 1);
        hedefDuzey = 0.75 * Math.pow(Math.sin(Math.PI * k), 0.5);
        if (k >= 1) bitir();
      }
      duzey += (hedefDuzey - duzey) * Math.min(1, dt * 10);
      ciz(dt);
    });
    function ciz(dt) {
      if (!yolBoy) {
        try { yolBoy = yol.getTotalLength(); } catch (e) { yolBoy = 0; }
        if (!yolBoy) return;
        // gırtlağın yol üstündeki yeri (y = 260)
        for (let u = 0; u < 1; u += 0.005) if (yol.getPointAtLength(u * yolBoy).y < 262) { girtlakU = u; break; }
      }
      const hiz = 0.05 + 0.32 * duzey;
      const gor = duzey > 0.03;
      parcaciklar.forEach((p) => {
        p.u = (p.u + dt * hiz) % 1;
        const q = yol.getPointAtLength(p.u * yolBoy);
        p.el.setAttribute("cx", q.x.toFixed(1));
        p.el.setAttribute("cy", q.y.toFixed(1));
        const sonra = p.u > girtlakU;
        p.el.setAttribute("class", sonra && sesli ? "hava ses" : "hava");
        const son = p.u > 0.93 ? (1 - p.u) / 0.07 : 1;
        p.el.style.opacity = gor ? (Math.min(1, duzey * 1.6) * son).toFixed(2) : 0;
      });
      // ses telleri: sesliyken hızlı titreşir, nefeste açık durur
      const titr = sesli && duzey > 0.05 && !azHareket() ? Math.abs(Math.sin(t * 2 * Math.PI * 9)) * (1 + 2.5 * duzey) : 0;
      const acik = sesli && duzey > 0.05 ? 0.6 + titr : 5.5;
      const ls = (224 - acik).toFixed(1), rs = (226 + acik).toFixed(1);
      telSol.setAttribute("d", `M207,256 C214,256 ${ls},258 ${ls},260 C${ls},262 214,264 207,264 Z`);
      telSag.setAttribute("d", `M242,256 C235,256 ${rs},258 ${rs},260 C${rs},262 235,264 242,264 Z`);
      dalgalar.forEach((d, i) => {
        const k = ((t * (0.7 + duzey) + i / 3) % 1);
        const on = sesli && duzey > 0.05;
        d.setAttribute("transform", `translate(${(92 - k * 46).toFixed(1)},153) scale(${(0.6 + k * 0.9).toFixed(2)})`);
        d.style.opacity = on ? ((1 - k) * Math.min(1, duzey * 1.5)).toFixed(2) : 0;
      });
    }
    function bitir() {
      if (canli) { canli.stop(); canli = null; }
      if (kaynak !== "mic") { kaynak = null; hedefDuzey = 0; sesli = false; durum.textContent = ""; }
      ornekBtn.setIcon("play"); nefesBtn.setIcon("play");
      clearTimeout(bitisT);
    }
    function ornek() {
      if (kaynak === "ornek") return bitir();
      if (Mic.state === "on") Mic.stop();
      bitir();
      Snd.unlock();
      canli = Ses.canli({ f0: F0[varsayilanTip()], tip: varsayilanTip(), unlu: "a", gurluk: 0.25, vibGen: 0 });
      kaynak = "ornek"; sesli = true; t = 0;
      ornekBtn.setIcon("stop");
      durum.textContent = "ses telleri titreşiyor";
      if (secili == null && seciliRol == null) sec("girtlak");
    }
    function nefes() {
      if (kaynak === "nefes") return bitir();
      if (Mic.state === "on") Mic.stop();
      bitir();
      kaynak = "nefes"; sesli = false; t = 0;
      nefesBtn.setIcon("stop");
      durum.textContent = "ses telleri açık: hava sessizce geçer";
    }
    function micAc() {
      bitir();
      kaynak = "mic";
      micOff && micOff();
      micOff = Mic.onFrame((k) => {
        if (k.bekle) { hedefDuzey = 0; sesli = false; durum.textContent = "anlatım çalıyor, ölçüm bekliyor"; return; }
        hedefDuzey = clamp((k.db + 58) / 36, 0, 1);
        sesli = !!k.sesli;
        durum.textContent = hedefDuzey < 0.05 ? "bir \"aaa\" deyin" : sesli ? "ses telleri titreşiyor" : "hava geçiyor, titreşim yok";
      });
    }
    function micKapa() {
      if (micOff) { micOff(); micOff = null; }
      if (kaynak === "mic") { kaynak = null; hedefDuzey = 0; sesli = false; durum.textContent = ""; }
    }
    return {
      enter() { dongu.start(); },
      leave() { bitir(); micKapa(); dongu.stop(); },
    };
  };
  window.GuideScenarios["ses-aygiti"] = [{ click: "=Gırtlak" }, { wait: 900 }, { click: "=Ağız" }, { wait: 700 }, { click: "=Güç kaynağı" }];

  /* ===================== Ses telleri: ağır çekim ===================== */
  window.Demos.sesTelleri = (stage) => {
    let gerg = 0.4, basinc = 0.6, mod = "ses", faz = 0, canli = null;
    const f0 = () => 90 * Math.pow(2, gerg * 2.3);
    const oq = () => 0.72 - 0.22 * basinc;
    const animHz = () => (azHareket() ? 0.35 : 0.5) + 1.2 * gerg;
    const titresiyor = () => mod === "ses" && basinc > 0.03;
    const dinleBtn = ibtn("play", "Dinle", () => dinle(), "primary");
    const modSeg = seg([["ses", "Söylerken"], ["nefes", "Nefes alırken"]], mod, (k) => { mod = k; guncelle(); }, "Ses tellerinin durumu");
    const gSl = slider({ label: "Gerginlik", min: 0, max: 1, step: 0.01, value: gerg, fmt: (v) => (v < 0.34 ? "gevşek" : v < 0.67 ? "orta" : "gergin"), oninput: (v) => { gerg = v; guncelle(); } });
    const bSl = slider({ label: "Hava basıncı", min: 0, max: 1, step: 0.01, value: basinc, fmt: (v) => (v < 0.05 ? "yok" : v < 0.4 ? "hafif" : v < 0.75 ? "orta" : "güçlü"), oninput: (v) => { basinc = v; guncelle(); } });
    const cv = h("canvas", { role: "img", "aria-label": "Ses telleri: yukarıdan görünüm, yandan kesit ve glotisten geçen hava akımı grafiği" });
    const sayfa = h("div.sheet.st-sayfa", h("div.fill", cv));
    const olc = h("div.olcumler.st-olcum");
    stage.append(h("div.controls", dinleBtn, modSeg), h("div.controls", gSl, bSl), sayfa, olc);
    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; ciz(); });
    const ctx = S.ctx;
    let puflar = [];

    function guncelle() {
      const f = f0();
      olc.innerHTML = "";
      if (mod === "nefes") {
        olc.append(h("div.olcum", h("b", "—"), h("small", "titreşim yok: teller açık")), h("div.olcum", h("b", "sessiz"), h("small", "hava serbestçe geçer")));
      } else {
        olc.append(
          h("div.olcum", h("b", L.fmtNum(f) + " Hz"), h("small", `perde · ${L.nn(N.ftom(f))} · saniyede ${L.fmtNum(f)} titreşim`)),
          h("div.olcum", h("b", L.fmtNum(f / animHz()) + " kat"), h("small", "ağır çekim: çizim bu kadar yavaş")),
          h("div.olcum", h("b", basinc < 0.03 ? "—" : "%" + L.fmtNum(oq() * 100)), h("small", "açık faz oranı")));
      }
      if (canli) {
        if (!titresiyor()) canli.set({ ses: 0 });
        else canli.set({ ses: 1, f0: f, gurluk: 0.15 + 0.85 * basinc, oq: oq() });
      }
      if (!dongu.running) ciz();
    }
    function dinle() {
      if (canli) { canli.stop(); canli = null; dinleBtn.setIcon("play"); dinleBtn.setLabel("Dinle"); return; }
      Snd.unlock();
      canli = Ses.canli({ f0: f0(), tip: varsayilanTip(), unlu: "a", gurluk: 0.15 + 0.85 * basinc, oq: oq(), vibGen: 0, ses: titresiyor() ? 1 : 0 });
      if (!canli) return;
      dinleBtn.setIcon("stop"); dinleBtn.setLabel("Durdur");
    }
    const acik = (ph) => (titresiyor() ? Ses.rosenberg(((ph % 1) + 1) % 1, oq()) : 0);

    function ustten(c, x0, y0, w, hh) {
      const cx = x0 + w / 2, cy = y0 + hh * 0.56;
      const rx = Math.min(w * 0.34, hh * 0.3), ry = rx * 1.15;
      L.text(c, "yukarıdan", cx, y0 + 18, { size: 13, color: C.muted, align: "center", weight: 700 });
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      c.fillStyle = rgba(C.porte, 0.2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 1.6; c.stroke();
      const Lf = ry * 1.5 * (0.86 + 0.18 * gerg);
      const yF = cy - Lf / 2, yB = cy + Lf / 2;
      const bw = rx * 0.38 * (1.2 - 0.5 * gerg);
      const a = acik(faz), G = rx * (0.05 + 0.16 * basinc);
      const g = (u) => (mod === "nefes" ? u * rx * 0.5 : G * Math.pow(Math.sin(Math.PI * u), 0.7) * a);
      const gen = (u) => bw * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.95)));
      const yy = (u) => yF + u * Lf;
      // glotis (iki telin arasındaki boşluk)
      c.beginPath();
      for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(cx - g(u), yy(u)); }
      for (let i = 20; i >= 0; i--) { const u = i / 20; c.lineTo(cx + g(u), yy(u)); }
      c.closePath(); c.fillStyle = rgba(C.ink, 0.82); c.fill();
      // teller: soluk iki bant
      for (const yon of [-1, 1]) {
        c.beginPath();
        for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(cx + yon * g(u), yy(u)); }
        for (let i = 20; i >= 0; i--) { const u = i / 20; c.lineTo(cx + yon * (g(u) + gen(u)), yy(u)); }
        c.closePath();
        c.fillStyle = C.kagit2; c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 1.5; c.stroke();
        // iç kenar: fosforlu vurgu
        c.beginPath();
        for (let i = 1; i <= 19; i++) { const u = i / 20; c.lineTo(cx + yon * (g(u) + 2.5), yy(u)); }
        c.strokeStyle = rgba(C.fosfor, 0.8); c.lineWidth = 3; c.stroke();
        // arka uçtaki kıkırdaklar
        c.beginPath(); c.arc(cx + yon * (g(1) + bw * 0.45), yB + bw * 0.3, bw * 0.42, 0, Math.PI * 2);
        c.fillStyle = rgba(C.porte, 0.45); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 1.3; c.stroke();
      }
      L.text(c, "ön", cx, cy - ry - 6, { size: 11, color: C.muted, align: "center", weight: 700 });
      L.text(c, "arka", cx, cy + ry + 15, { size: 11, color: C.muted, align: "center", weight: 700 });
      // etiketler (dar ekranda yer yok)
      if (w < 260) return;
      const ly = cy - Lf * 0.12;
      c.strokeStyle = rgba(C.grafit, 0.7); c.lineWidth = 1;
      c.beginPath(); c.moveTo(x0 + 8 + 50, ly - 4); c.lineTo(cx - g(0.38) - gen(0.38) * 0.5, yy(0.38)); c.stroke();
      L.text(c, "ses teli", x0 + 6, ly - 8, { size: 12, color: C.ink2, weight: 700 });
      c.beginPath(); c.moveTo(x0 + w - 50, cy + Lf * 0.22); c.lineTo(cx + 1, yy(0.52)); c.stroke();
      L.text(c, "glotis", x0 + w - 6, cy + Lf * 0.22 + 14, { size: 12, color: C.ink2, align: "right", weight: 700 });
    }

    function kesit(c, x0, y0, w, hh, dt) {
      const cx = x0 + w / 2, ym = y0 + hh * 0.56;
      const ww = Math.min(w * 0.26, hh * 0.24);
      L.text(c, "yandan kesit", cx, y0 + 18, { size: 13, color: C.muted, align: "center", weight: 700 });
      const Gs = ww * (0.12 + 0.5 * basinc);
      let gl, gu;
      if (mod === "nefes") { gl = gu = ww * 0.82; }
      else { gl = Gs * acik(faz); gu = Gs * acik(faz - 0.1); }
      const ust = y0 + 34, alt = y0 + hh - 6;
      for (const yon of [-1, 1]) {
        const X = (d) => cx + yon * d;
        // duvar
        c.beginPath();
        c.moveTo(X(ww), alt); c.lineTo(X(ww), ym + 22);
        c.moveTo(X(ww), ym - 24);
        c.bezierCurveTo(X(ww + 14), ym - 30, X(ww + 12), ym - 46, X(ww), ym - 52);
        c.lineTo(X(ww * 0.92), ust);
        c.strokeStyle = C.ink; c.lineWidth = 1.6; c.stroke();
        // tel (kesit): duvardan ortaya uzanan yumuşak kama
        c.beginPath();
        c.moveTo(X(ww), ym + 22);
        c.bezierCurveTo(X(ww * 0.7), ym + 18, X(gl + 6), ym + 12, X(gl), ym + 6);
        c.lineTo(X(gu), ym - 6);
        c.bezierCurveTo(X(gu + 8), ym - 14, X(ww * 0.7), ym - 20, X(ww), ym - 24);
        c.closePath();
        c.fillStyle = C.kagit2; c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 1.6; c.stroke();
        c.beginPath(); c.moveTo(X(gl + 2), ym + 6); c.lineTo(X(gu + 2), ym - 6);
        c.strokeStyle = rgba(C.fosfor, 0.85); c.lineWidth = 4; c.stroke();
      }
      // alttan gelen hava (basınç)
      const ab = mod === "nefes" ? 0.6 : 0.15 + 0.75 * basinc;
      c.strokeStyle = rgba(C.pes, ab); c.lineWidth = 1.8;
      for (const dx of [-0.5, 0, 0.5]) {
        const x = cx + dx * ww, y1 = alt - 8, y2 = ym + 32;
        c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y2); c.moveTo(x - 4, y2 + 6); c.lineTo(x, y2); c.lineTo(x + 4, y2 + 6); c.stroke();
      }
      if (w >= 260) {
        L.text(c, "hava basıncı", x0 + 6, alt - 4, { size: 11, color: C.pes, weight: 700 });
        L.text(c, "ses teli", x0 + 6, ym + 4, { size: 12, color: C.ink2, weight: 700 });
        c.strokeStyle = rgba(C.grafit, 0.7); c.lineWidth = 1;
        c.beginPath(); c.moveTo(x0 + 52, ym); c.lineTo(cx - ww * 0.75, ym); c.stroke();
      }
      // geçen hava pufları
      if (dt != null) {
        const acikUst = mod === "nefes" ? 1 : gu / (Gs || 1);
        if (acikUst > 0.15 && Math.random() < (mod === "nefes" ? 0.5 : 0.9)) puflar.push({ x: cx + (Math.random() - 0.5) * 2 * Math.max(2, gu), y: ym - 10, v: 30 + 60 * (mod === "nefes" ? 0.5 : basinc) });
        puflar.forEach((p) => { p.y -= p.v * dt; });
        puflar = puflar.filter((p) => p.y > ust).slice(-60);
      }
      puflar.forEach((p) => {
        const k = (ym - p.y) / (ym - ust);
        c.fillStyle = rgba(mod === "nefes" ? C.pes : C.ink, 0.5 * (1 - k));
        c.beginPath(); c.arc(p.x, p.y, 2.2, 0, Math.PI * 2); c.fill();
      });
    }

    function dalga(c, x0, y0, w, hh) {
      const sol = x0 + 46, sag = x0 + w - 14, ust = y0 + 30, alt = y0 + hh - 24;
      const gw = sag - sol, gh = alt - ust;
      L.text(c, "glotisten geçen hava (üç titreşim)", sol, y0 + 18, { size: 13, color: C.muted, weight: 700 });
      c.strokeStyle = rgba(C.porte, 0.8); c.lineWidth = 1;
      c.beginPath(); c.moveTo(sol, alt + 0.5); c.lineTo(sag, alt + 0.5); c.stroke();
      const T = 1000 / f0();
      for (let k = 0; k <= 3; k++) {
        const x = sol + (k / 3) * gw;
        c.beginPath(); c.moveTo(x + 0.5, alt); c.lineTo(x + 0.5, alt + 4); c.stroke();
        L.text(c, L.fmtNum(k * T, k * T < 10 ? 1 : 0) + " ms", x, alt + 16, { size: 11, color: C.muted, align: k === 0 ? "left" : k === 3 ? "right" : "center", font: FONT.mono, weight: 600 });
      }
      L.text(c, "akım", x0 + 6, ust + 10, { size: 11, color: C.muted, weight: 700 });
      if (mod === "nefes") {
        const y = alt - gh * 0.55;
        c.strokeStyle = C.pes; c.lineWidth = 2.4; c.beginPath(); c.moveTo(sol, y); c.lineTo(sag, y); c.stroke();
        L.text(c, "sürekli akım: dalga yok, ses yok", sol + gw / 2, y - 10, { size: 12, color: C.pes, align: "center", weight: 700 });
        return;
      }
      if (basinc < 0.03) { L.text(c, "hava basıncı yok: teller titreşmez", sol + gw / 2, alt - gh / 2, { size: 12, color: C.muted, align: "center", weight: 700 }); return; }
      const amp = 0.3 + 0.7 * basinc, q = oq();
      // kapalı faz: fosforlu
      for (let k = 0; k < 3; k++) {
        const xa = sol + ((k + q) / 3) * gw, xb = sol + ((k + 1) / 3) * gw;
        c.fillStyle = rgba(C.fosfor, 0.35); c.fillRect(xa, ust, xb - xa, gh);
        if (k === 0) L.text(c, "kapalı", (xa + xb) / 2, ust + 12, { size: 11, color: C.fosforInk, align: "center", weight: 700 });
      }
      c.beginPath();
      for (let i = 0; i <= 600; i++) {
        const ph = (i / 600) * 3, y = alt - Ses.rosenberg(ph % 1, q) * amp * gh * 0.95;
        const x = sol + (i / 600) * gw;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.strokeStyle = C.ink; c.lineWidth = 2.2; c.lineJoin = "round"; c.stroke();
      // imleç: ortadaki döngüde çizimin şu anki evresi
      const fr = ((faz % 1) + 1) % 1;
      const xc = sol + ((1 + fr) / 3) * gw, yc = alt - Ses.rosenberg(fr, q) * amp * gh * 0.95;
      c.strokeStyle = rgba(C.pes, 0.6); c.lineWidth = 1; c.beginPath(); c.moveTo(xc + 0.5, ust); c.lineTo(xc + 0.5, alt); c.stroke();
      c.fillStyle = C.pes; c.beginPath(); c.arc(xc, yc, 5, 0, Math.PI * 2); c.fill();
    }

    function ciz(dt) {
      if (!W) return;
      const c = ctx;
      c.clearRect(0, 0, W, H);
      const ust = Math.round(H * 0.6);
      ustten(c, 0, 0, W / 2, ust);
      kesit(c, W / 2, 0, W / 2, ust, dt);
      c.strokeStyle = rgba(C.porte, 0.7); c.lineWidth = 1;
      c.beginPath(); c.moveTo(W / 2 + 0.5, 12); c.lineTo(W / 2 + 0.5, ust - 8); c.moveTo(12, ust + 0.5); c.lineTo(W - 12, ust + 0.5); c.stroke();
      dalga(c, 0, ust, W, H - ust);
    }
    const dongu = L.loop((dt) => { if (titresiyor()) faz += dt * animHz(); ciz(dt); });
    window.addEventListener("themechange", () => ciz());
    guncelle();
    return {
      enter() { guncelle(); dongu.start(); },
      leave() { dongu.stop(); if (canli) { canli.stop(); canli = null; dinleBtn.setIcon("play"); dinleBtn.setLabel("Dinle"); } },
    };
  };
  window.GuideScenarios["ses-telleri"] = [{ slide: "label:Gerginlik", to: 0.85 }, { wait: 500 }, { slide: "label:Hava basıncı", to: 0.95 }, { wait: 500 }, { click: "=Nefes alırken" }, { wait: 1200 }, { click: "=Söylerken" }];

  /* ===================== Kaynak ve filtre ===================== */
  const FMAX = 5000;
  let kaynakOnbellek = null;
  const kaynakGenlik = () => kaynakOnbellek || (kaynakOnbellek = Ses.kaynakSpektrum(0.6, 120));
  const VARSAYILAN_M = { erkek: 48, kadin: 57, cocuk: 60 };

  window.Demos.kaynakFiltre = (stage) => {
    let tip = varsayilanTip(), unlu = "a", m = VARSAYILAN_M[tip];
    let vizilti = null, unluSes = null;
    const f0 = () => N.mtof(m);
    const unluSeg = seg(Ses.Formant.UNLULER.map((u) => [u, u]), unlu, (k) => { unlu = k; guncelle(); }, "Ünlü");
    const tipSeg = seg(TIPLER, tip, (k) => { tip = k; m = VARSAYILAN_M[k]; pSl.set(m); guncelle(); }, "Ses türü");
    const pSl = slider({ label: "Perde", min: 40, max: 74, step: 1, value: m, fmt: (v) => L.nn(v), oninput: (v) => { m = v; guncelle(); } });
    const kaynakBtn = ibtn("play", "Kaynak (filtresiz)", () => calKaynak());
    const unluBtn = ibtn("play", "Ünlü", () => calUnlu(), "primary");
    const cv = h("canvas", { role: "img", "aria-label": "Üç grafik: kaynak spektrumu, ses yolunun filtre eğrisi ve çıkan sesin spektrumu" });
    const sayfa = h("div.sheet.kf-sayfa", h("div.fill", cv));
    const olc = h("div.olcumler.kf-olcum");
    stage.append(h("div.controls", unluSeg, tipSeg), h("div.controls", pSl, h("span.spacer"), kaynakBtn, unluBtn), sayfa, olc);
    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; ciz(); });
    const ctx = S.ctx;

    function formantlar() { return Ses.hedefFormant({ tip, unlu }); }
    function guncelle() {
      const fs = formantlar();
      olc.innerHTML = "";
      olc.append(
        h("div.olcum", h("b", L.fmtNum(f0()) + " Hz"), h("small", `perde (${L.nn(m)}) · harmonikler arası ${L.fmtNum(f0())} Hz`)),
        h("div.olcum", h("b", L.fmtNum(fs[0][0]) + " Hz"), h("small", "F1")),
        h("div.olcum", h("b", L.fmtNum(fs[1][0]) + " Hz"), h("small", "F2")),
        h("div.olcum", h("b", L.fmtNum(fs[2][0]) + " Hz"), h("small", "F3")));
      if (tip === "cocuk") olc.append(h("p.note-msg", "Çocuk formantları tahmindir (kadın değerlerinden ölçeklendi)."));
      if (unluSes) unluSes.set({ f0: f0(), tip, unlu });
      if (vizilti) vizilti.setFreq(f0());
      ciz();
    }
    // filtresiz vızıltı: kaynak spektrumunun harmonik genliklerinden tek bir dalga
    function viziltiBaslat() {
      const c = Snd.ready(); if (!c) return null;
      const amps = kaynakGenlik().slice(0, 100);
      const o = c.createOscillator();
      o.setPeriodicWave(Snd.wave(amps));
      o.frequency.value = f0();
      const g = c.createGain();
      g.gain.value = 0;
      o.connect(g); g.connect(Snd.bus);
      o.start();
      g.gain.setTargetAtTime(0.32, c.currentTime, 0.03);
      const ctl = {
        setFreq(f) { o.frequency.setTargetAtTime(f, c.currentTime, 0.02); },
        stop() { g.gain.setTargetAtTime(0, c.currentTime, 0.03); try { o.stop(c.currentTime + 0.25); } catch (e) {} },
      };
      Snd.own(ctl);
      return ctl;
    }
    function durdur() {
      if (vizilti) { vizilti.stop(); vizilti = null; }
      if (unluSes) { unluSes.stop(); unluSes = null; }
      kaynakBtn.setIcon("play"); unluBtn.setIcon("play");
      kaynakBtn.classList.remove("on"); unluBtn.classList.remove("on");
    }
    function calKaynak() {
      const vardi = !!vizilti;
      durdur();
      if (vardi) return;
      Snd.unlock();
      vizilti = viziltiBaslat();
      if (vizilti) { kaynakBtn.setIcon("stop"); kaynakBtn.classList.add("on"); }
    }
    function calUnlu() {
      const vardi = !!unluSes;
      durdur();
      if (vardi) return;
      Snd.unlock();
      unluSes = Ses.canli({ f0: f0(), tip, unlu, gurluk: 0.85, oq: 0.6, vibGen: 0, nefes: 0.02 });
      if (unluSes) { unluBtn.setIcon("stop"); unluBtn.classList.add("on"); }
    }

    function ciz() {
      if (!W) return;
      const c = ctx;
      c.clearRect(0, 0, W, H);
      const dar = W < 560;
      const sol = dar ? 22 : 96, sag = 14, ust = 10, alt = 26, ara = 14;
      const ph = (H - ust - alt - 2 * ara) / 3;
      const fx = (f) => sol + (f / FMAX) * (W - sol - sag);
      const TABAN = 48;
      const dbY = (db, y0) => y0 + 8 + Math.min(1, Math.max(0, -db / TABAN)) * (ph - 10);
      const fs = formantlar();
      const fil = (f) => 20 * Math.log10(Ses.filtreYaniti(fs, f) + 1e-12);
      let filMax = -Infinity;
      for (let f = 50; f <= FMAX; f += 10) filMax = Math.max(filMax, fil(f));
      const amps = kaynakGenlik();
      const f = f0(), K = Math.min(amps.length, Math.floor(FMAX / f));
      const src = [], cik = [];
      for (let k = 1; k <= K; k++) src.push(20 * Math.log10(amps[k - 1] + 1e-9));
      for (let k = 1; k <= K; k++) cik.push(src[k - 1] + fil(k * f) - filMax);
      const cikMax = Math.max(...cik);
      const lw = K > 40 ? 1.3 : K > 20 ? 1.8 : 2.4;
      const panel = (i) => ust + i * (ph + ara);
      // ızgara ve başlıklar
      const BASLIK = ["kaynak", "filtre", "çıkan ses"];
      for (let i = 0; i < 3; i++) {
        const y0 = panel(i);
        c.strokeStyle = rgba(C.porte, 0.45); c.lineWidth = 1;
        for (let k = 1000; k < FMAX; k += 1000) { const x = Math.round(fx(k)) + 0.5; c.beginPath(); c.moveTo(x, y0 + 4); c.lineTo(x, y0 + ph); c.stroke(); }
        c.strokeStyle = rgba(C.porte, 0.9);
        c.beginPath(); c.moveTo(sol, y0 + ph + 0.5); c.lineTo(W - sag, y0 + ph + 0.5); c.stroke();
        if (dar) L.text(c, BASLIK[i], W - sag, y0 + 16, { size: 14, color: C.ink, align: "right", weight: 760, font: FONT.display });
        else L.text(c, BASLIK[i], sol - 12, y0 + ph / 2 + 2, { size: 16, color: C.ink, align: "right", weight: 760, font: FONT.display });
        if (!dar) L.text(c, i === 1 ? "ses yolu" : i === 0 ? "ses telleri" : "ağızdan", sol - 12, y0 + ph / 2 + 18, { size: 11, color: C.muted, align: "right", weight: 600 });
      }
      // × ve =
      L.text(c, "×", sol - (dar ? 4 : 12), panel(1) - ara / 2 + 7, { size: 20, color: C.grafit, align: "right", weight: 700 });
      L.text(c, "=", sol - (dar ? 4 : 12), panel(2) - ara / 2 + 7, { size: 20, color: C.grafit, align: "right", weight: 700 });
      // 1) kaynak
      const harmonikler = (y0, dbs, renk) => {
        c.strokeStyle = renk; c.fillStyle = renk; c.lineWidth = lw; c.lineCap = "round";
        dbs.forEach((db, i) => {
          if (db < -TABAN) return;
          const x = fx((i + 1) * f), y = dbY(db, y0);
          c.beginPath(); c.moveTo(x, y0 + ph); c.lineTo(x, y); c.stroke();
          c.beginPath(); c.arc(x, y, lw + 0.6, 0, Math.PI * 2); c.fill();
        });
        c.lineCap = "butt";
      };
      harmonikler(panel(0), src, C.ink);
      // 2) filtre eğrisi ve formantlar
      const y1 = panel(1);
      c.beginPath();
      for (let x = sol; x <= W - sag; x += 2) {
        const ff = ((x - sol) / (W - sol - sag)) * FMAX;
        const y = dbY(fil(Math.max(30, ff)) - filMax, y1);
        x === sol ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.strokeStyle = C.pes; c.lineWidth = 2.4; c.stroke();
      fs.slice(0, 4).forEach(([F], i) => {
        if (F > FMAX) return;
        const x = fx(F), y = dbY(fil(F) - filMax, y1);
        c.fillStyle = rgba(C.fosfor, 0.85); c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, 2.5, 0, Math.PI * 2); c.fill();
        L.text(c, "F" + (i + 1), x, y - 11, { size: 12, color: C.ink, align: "center", weight: 800 });
      });
      // 3) çıkan ses: zarf (kesikli) + harmonikler
      const y2 = panel(2);
      c.beginPath();
      for (let x = sol; x <= W - sag; x += 3) {
        const ff = ((x - sol) / (W - sol - sag)) * FMAX;
        const y = dbY(fil(Math.max(30, ff)) - filMax - 4, y2);
        x === sol ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.setLineDash([3, 4]); c.strokeStyle = rgba(C.pes, 0.55); c.lineWidth = 1.4; c.stroke(); c.setLineDash([]);
      harmonikler(y2, cik.map((v) => v - cikMax), C.ink);
      // frekans ekseni
      const ya = H - alt + 16;
      for (let k = 0; k <= FMAX; k += 1000) L.text(c, k ? k / 1000 + (dar && k < FMAX ? "" : " kHz") : "0", fx(k), ya, { size: 11, color: C.muted, align: k === 0 ? "left" : k === FMAX ? "right" : "center", font: FONT.mono, weight: 600 });
    }
    window.addEventListener("themechange", () => ciz());
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge" && !vizilti && !unluSes) { tip = varsayilanTip(); tipSeg.set(tip); m = VARSAYILAN_M[tip]; pSl.set(m); guncelle(); } });
    guncelle();
    return { enter() { ciz(); }, leave() { durdur(); } };
  };
  window.GuideScenarios["kaynak-filtre"] = [{ click: "=i" }, { wait: 900 }, { click: "=u" }, { wait: 800 }, { slide: "label:Perde", to: 64 }];

  /* ===================== Formantlar: F1–F2 haritası ===================== */
  const HARITA = { f1: [200, 1000], f2: [3000, 650] };
  // LPC tepelerinden F1 ve F2
  function f1f2(tepeler) {
    const F1 = tepeler.find((f) => f >= 200 && f <= 1100);
    if (F1 == null) return null;
    const F2 = tepeler.find((f) => f > F1 + 200 && f <= 3200);
    if (F2 == null) return null;
    return [F1, F2];
  }
  function enYakin(tip, F1, F2) {
    let en = null, d0 = Infinity;
    for (const u of Ses.Formant.UNLULER) {
      const [a, b] = Ses.Formant.KAYNAK[tip][u];
      const d = Math.hypot((a - F1) / 80, (b - F2) / 250);
      if (d < d0) { d0 = d; en = u; }
    }
    return en;
  }
  function formantKur(tip, F1, F2) {
    const fs = Ses.Formant.sentez(tip, enYakin(tip, F1, F2)).map((x) => x.slice());
    fs[0][0] = F1; fs[1][0] = Math.max(F2, F1 + 150);
    fs[2][0] = Math.max(fs[2][0], fs[1][0] + 250);
    fs[3][0] = Math.max(fs[3][0], fs[2][0] + 300);
    fs[4][0] = Math.max(fs[4][0], fs[3][0] + 350);
    return fs;
  }

  window.Demos.formantlar = (stage) => {
    let tip = varsayilanTip();
    const konum = {}; // ekrandaki (yumuşak geçişli) değerler
    Ses.Formant.UNLULER.forEach((u) => { const [a, b] = Ses.Formant.KAYNAK[tip][u]; konum[u] = [a, b]; });
    let imlec = null, surukle = null, canli = null, durTimer = 0;
    let iz = [], izEtiket = "", ornekCal = null, ornekKareler = null, micTimer = 0, sonUyari = "";
    const tipSeg = seg(TIPLER, tip, (k) => { tip = k; guncelle(); }, "Ses türü");
    const ornekBtn = ibtn("play", "Örnek: a, i, u", () => ornek());
    const ms = Alistirma.MicSatiri({ onAc: micAc, onKapa: micKapa });
    const cv = h("canvas.fh-harita", { role: "img", "aria-label": "F1–F2 ünlü haritası: Türkçenin sekiz ünlüsü. Dokunup dinleyin, sürükleyerek ara ünlüleri sentezleyin." });
    const sayfa = h("div.sheet.fh-sayfa", h("div.fill", cv));
    const olc = h("div.olcumler.fh-olcum");
    const not = h("p.note-msg.fh-not");
    stage.append(h("div.controls", tipSeg, h("span.spacer"), ornekBtn), ms.el, sayfa, olc, not);
    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; });
    const ctx = S.ctx;
    const M = () => ({ sol: W < 500 ? 44 : 58, sag: 16, ust: 40, alt: 26 });
    const px = (F2) => { const m = M(); return m.sol + ((HARITA.f2[0] - F2) / (HARITA.f2[0] - HARITA.f2[1])) * (W - m.sol - m.sag); };
    const py = (F1) => { const m = M(); return m.ust + ((F1 - HARITA.f1[0]) / (HARITA.f1[1] - HARITA.f1[0])) * (H - m.ust - m.alt); };
    const tersX = (x) => { const m = M(); return HARITA.f2[0] - ((x - m.sol) / (W - m.sol - m.sag)) * (HARITA.f2[0] - HARITA.f2[1]); };
    const tersY = (y) => { const m = M(); return HARITA.f1[0] + ((y - m.ust) / (H - m.ust - m.alt)) * (HARITA.f1[1] - HARITA.f1[0]); };

    function guncelle() {
      olc.innerHTML = "";
      const nokta = imlec || (iz.length ? iz[iz.length - 1] : null);
      if (nokta) {
        const [F1, F2] = nokta.f;
        olc.append(h("div.olcum", h("b", L.fmtNum(F1) + " Hz"), h("small", "F1")),
          h("div.olcum", h("b", L.fmtNum(F2) + " Hz"), h("small", "F2")),
          h("div.olcum", h("b", enYakin(tip, F1, F2)), h("small", imlec ? "en yakın ünlü" : izEtiket)));
      } else {
        olc.append(h("div.olcum", h("b", "—"), h("small", "F1")), h("div.olcum", h("b", "—"), h("small", "F2")),
          h("div.olcum", h("b", "—"), h("small", "en yakın ünlü")));
      }
      const notlar = [];
      if (tip === "cocuk") notlar.push("Çocuk değerleri tahmindir: Türkçe çocuk ölçümü bulunamadı.");
      if (Mic.state === "on" || ornekCal) notlar.push("Ses noktası yaklaşıktır (LPC); tiz seslerde güvenilmez." + (sonUyari ? " " + sonUyari : ""));
      not.textContent = notlar.join(" ");
      not.hidden = !notlar.length;
    }

    function ciz(dt) {
      if (!W) return;
      const c = ctx, m = M();
      c.clearRect(0, 0, W, H);
      // ızgara
      c.lineWidth = 1;
      for (let f = 3000; f >= 1000; f -= 500) {
        const x = Math.round(px(f)) + 0.5;
        c.strokeStyle = rgba(C.porte, 0.5); c.beginPath(); c.moveTo(x, m.ust); c.lineTo(x, H - m.alt); c.stroke();
        L.text(c, L.fmtNum(f), x, m.ust - 8, { size: 11, color: C.muted, align: "center", font: FONT.mono, weight: 600 });
      }
      for (let f = 300; f <= 900; f += 100) {
        const y = Math.round(py(f)) + 0.5;
        c.strokeStyle = rgba(C.porte, 0.5); c.beginPath(); c.moveTo(m.sol, y); c.lineTo(W - m.sag, y); c.stroke();
        L.text(c, L.fmtNum(f), m.sol - 6, y + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono, weight: 600 });
      }
      L.text(c, "F2 (Hz) · ön (ince) ünlüler", m.sol, 14, { size: 12, color: C.ink2, weight: 700 });
      L.text(c, "art (kalın)", W - m.sag, 14, { size: 12, color: C.ink2, align: "right", weight: 700 });
      L.text(c, "F1 (Hz) · açık ünlüler", 6, H - 8, { size: 12, color: C.ink2, weight: 700 });
      L.text(c, "kapalı ünlüler", m.sol + 6, py(240), { size: 12, color: C.ink2, weight: 700 });
      // hedefe doğru yumuşak geçiş (ses türü değişince)
      const k = dt == null ? 1 : Math.min(1, dt * 8);
      Ses.Formant.UNLULER.forEach((u) => {
        const [a, b] = Ses.Formant.KAYNAK[tip][u];
        konum[u][0] += (a - konum[u][0]) * k; konum[u][1] += (b - konum[u][1]) * k;
      });
      // ünlü dörtgeni
      c.strokeStyle = rgba(C.grafit, 0.45); c.lineWidth = 1.4; c.setLineDash([4, 4]);
      c.beginPath();
      ["i", "e", "a", "o", "u"].forEach((u, i) => { const x = px(konum[u][1]), y = py(konum[u][0]); i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.stroke(); c.setLineDash([]);
      // iz (ses noktası)
      const simdi = performance.now() / 1000;
      iz = iz.filter((p) => simdi - p.t < 2.5);
      if (iz.length) {
        for (let i = 1; i < iz.length; i++) {
          const a = iz[i - 1], b = iz[i], yas = simdi - b.t;
          c.strokeStyle = rgba(C.ink, Math.max(0, 0.6 * (1 - yas / 2.5))); c.lineWidth = 2.4; c.lineCap = "round";
          c.beginPath(); c.moveTo(px(a.f[1]), py(a.f[0])); c.lineTo(px(b.f[1]), py(b.f[0])); c.stroke();
        }
        const son = iz[iz.length - 1], yas = simdi - son.t;
        const x = px(son.f[1]), y = py(son.f[0]);
        c.globalAlpha = Math.max(0.15, 1 - yas / 2.5);
        c.fillStyle = rgba(C.fosfor, 0.75); c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
      }
      // ünlüler
      const r = W < 500 ? 15 : 18;
      Ses.Formant.UNLULER.forEach((u) => {
        const x = px(konum[u][1]), y = py(konum[u][0]);
        const sec = imlec && imlec.unlu === u;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = sec ? rgba(C.fosfor, 0.9) : C.kagit2; c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 1.6; c.stroke();
        L.text(c, u, x, y + 7, { size: r * 1.15, color: C.ink, align: "center", weight: 760, font: FONT.display });
      });
      // sürükleme imleci
      if (imlec && !imlec.unlu) {
        const x = px(imlec.f[1]), y = py(imlec.f[0]);
        c.strokeStyle = C.ink; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(x - 15, y); c.lineTo(x - 5, y); c.moveTo(x + 5, y); c.lineTo(x + 15, y); c.moveTo(x, y - 15); c.lineTo(x, y - 5); c.moveTo(x, y + 5); c.lineTo(x, y + 15); c.stroke();
      }
    }

    // --- dokun / sürükle
    function noktadan(e) {
      const rc = cv.getBoundingClientRect();
      const x = e.clientX - rc.left, y = e.clientY - rc.top;
      const r = W < 500 ? 15 : 18;
      for (const u of Ses.Formant.UNLULER) {
        if (Math.hypot(px(konum[u][1]) - x, py(konum[u][0]) - y) <= r + 4) return { f: Ses.Formant.KAYNAK[tip][u].slice(0, 2), unlu: u };
      }
      const F1 = clamp(tersY(y), 230, 980), F2 = clamp(tersX(x), 700, 2950);
      return { f: [F1, F2], unlu: null };
    }
    function sesKur(n) {
      return n.unlu ? Ses.Formant.sentez(tip, n.unlu) : formantKur(tip, n.f[0], n.f[1]);
    }
    function sesDurdur() { clearTimeout(durTimer); if (canli) { canli.stop(); canli = null; } }
    cv.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      Snd.unlock();
      sesDurdur();
      imlec = noktadan(e);
      surukle = { t: performance.now(), x: e.clientX, y: e.clientY, hareket: false };
      canli = Ses.canli({ f0: F0[tip], tip, formantlar: sesKur(imlec), gurluk: 0.7, vibGen: 0 });
      guncelle();
    });
    cv.addEventListener("pointermove", (e) => {
      if (!surukle) return;
      if (Math.hypot(e.clientX - surukle.x, e.clientY - surukle.y) > 5) surukle.hareket = true;
      if (!surukle.hareket) return;
      const n = noktadan(e);
      if (n.unlu && (!imlec || imlec.unlu !== n.unlu)) imlec = n;
      else if (!n.unlu) imlec = n;
      canli && canli.set({ formantlar: sesKur(imlec) });
      guncelle();
    });
    const birak = () => {
      if (!surukle) return;
      const kisa = !surukle.hareket && performance.now() - surukle.t < 300;
      surukle = null;
      if (kisa) durTimer = setTimeout(() => { sesDurdur(); imlec = null; guncelle(); }, 750);
      else { sesDurdur(); imlec = null; guncelle(); }
    };
    cv.addEventListener("pointerup", birak);
    cv.addEventListener("pointercancel", birak);

    // --- örnek: sentez ses "a i u a" ve aynı LPC ölçümü
    function cerceveOlc(x, sr) {
      const r = Analiz.formantTahmin(x, sr);
      return r ? f1f2(r.formantlar) : null;
    }
    const ortanca = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
    let son3 = [];
    function izEkle(f, etiket) {
      son3.push(f); son3 = son3.slice(-3);
      const F = [ortanca(son3.map((p) => p[0])), ortanca(son3.map((p) => p[1]))];
      iz.push({ f: F, t: performance.now() / 1000 });
      iz = iz.slice(-40);
      izEtiket = etiket;
      guncelle();
    }
    function ornekDurdur() { if (ornekCal) { ornekCal.stop(); ornekCal = null; } ornekBtn.setIcon("play"); }
    function ornek() {
      if (ornekCal) { ornekDurdur(); guncelle(); return; }
      if (Mic.state === "on") Mic.stop();
      Snd.unlock();
      const c = Snd.ready(); if (!c) return;
      const sr = c.sampleRate, mm = { erkek: 48, kadin: 57, cocuk: 60 }[tip];
      const r = Ses.ezgi(sr, ["a", "i", "u", "a"].map((u) => ({ m: mm, d: 0.9, u })), { tip, gurluk: 0.7, glide: 0.05 });
      const n = 4096, adim = Math.round(sr * 0.05);
      ornekKareler = [];
      for (let i = 0; i + n < r.data.length; i += adim) {
        const t = (i + n / 2) / sr;
        const ol = r.olaylar.find((o) => !o.sus && t >= o.t0 + 0.04 && t < o.t1 - 0.04);
        if (!ol) continue;
        const f = cerceveOlc(r.data.subarray(i, i + n), sr);
        if (f) ornekKareler.push({ t, f });
      }
      ornekCal = Ses.calBuffer(r.data);
      if (!ornekCal) return;
      son3 = [];
      ornekBtn.setIcon("stop");
      const t0 = ornekCal.t0, sure = ornekCal.sure;
      let i = 0;
      const ctl = ornekCal;
      const ad = () => {
        if (ornekCal !== ctl) return;
        const t = c.currentTime - t0;
        while (i < ornekKareler.length && ornekKareler[i].t <= t) izEkle(ornekKareler[i++].f, "örnek ses (sentez)");
        if (t < sure) requestAnimationFrame(ad); else { ornekDurdur(); guncelle(); }
      };
      requestAnimationFrame(ad);
    }

    // --- mikrofon: ~100 ms'de bir LPC
    function micAc() {
      ornekDurdur();
      clearInterval(micTimer);
      son3 = [];
      let buf = null;
      micTimer = setInterval(() => {
        const an = Mic.analyser, k = Mic.son;
        if (!an) return;
        if (!buf || buf.length !== an.fftSize) buf = new Float32Array(an.fftSize);
        if (!k || !k.sesli || k.bekle) { sonUyari = k && k.bekle ? "Anlatım çalıyor, ölçüm bekliyor." : ""; return; }
        an.getFloatTimeDomainData(buf);
        sonUyari = k.f0 > 350 ? "Perde yüksek: tahmin güvenilmez." : "";
        const f = cerceveOlc(buf, an.context.sampleRate);
        if (f) izEkle(f, "sesiniz (yaklaşık)");
      }, 100);
      guncelle();
    }
    function micKapa() { if (!micTimer) return; clearInterval(micTimer); micTimer = 0; sonUyari = ""; guncelle(); }

    const dongu = L.loop((dt) => ciz(dt));
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") { tip = varsayilanTip(); tipSeg.set(tip); guncelle(); } });
    guncelle();
    return {
      enter() { dongu.start(); },
      leave() { dongu.stop(); sesDurdur(); ornekDurdur(); micKapa(); imlec = null; iz = []; },
    };
  };
  window.GuideScenarios.formantlar = [{ click: "=Erkek" }, { wait: 500 }, { drag: "css:.fh-harita", path: [[0.3, 0.2], [0.55, 0.25], [0.85, 0.28]], speed: 3 }, { wait: 400 }, { click: "=Kadın" }];

  /* ===================== Şarkıcı formantı ===================== */
  const SR_SF = 24000;
  // basit orkestra: akorlar; harmonik zarfı 500 Hz'in üstünde oktavda ~12 dB düşer
  const AKORLAR = [[[45, 52, 57, 61, 64, 69], 1.5], [[50, 57, 62, 65, 69, 74], 1.5], [[43, 50, 55, 59, 62, 67], 1.6]];
  const EZGI_SF = [[57, 1.1, "a"], [61, 0.7, "a"], [64, 1.5, "o"], [62, 1.3, "a"]];
  function orkestra(sure) {
    const n = Math.round(sure * SR_SF), out = new Float32Array(n);
    const zarf = (f) => (f < 500 ? 1 : Math.pow(10, (-12 * Math.log2(f / 500)) / 20));
    const rnd = Ses.rng(5), TL = 4096;
    let t0 = 0.05;
    for (const [notalar, d] of AKORLAR) {
      const i0 = Math.round(t0 * SR_SF), i1 = Math.min(n, Math.round((t0 + d + 0.2) * SR_SF));
      for (const m of notalar) for (const det of [-6, 5]) {
        const f = N.mtof(m) * Math.pow(2, det / 1200);
        const K = Math.floor(6000 / f), tab = new Float32Array(TL + 1);
        for (let k = 1; k <= K; k++) {
          const a = zarf(k * f) / Math.sqrt(k), ph = rnd() * Math.PI;
          for (let j = 0; j <= TL; j++) tab[j] += a * Math.sin((2 * Math.PI * k * j) / TL + ph);
        }
        let p = Math.abs(rnd()) * TL;
        const vp = rnd() * 6;
        for (let i = i0; i < i1; i++) {
          const tt = (i - i0) / SR_SF, a = Math.min(1, tt / 0.12) * Math.min(1, (i1 - i) / SR_SF / 0.2);
          p += (f * (1 + 0.003 * Math.sin(2 * Math.PI * 5.2 * tt + vp)) * TL) / SR_SF;
          if (p >= TL) p -= TL;
          const j = p | 0;
          out[i] += (tab[j] + (tab[j + 1] - tab[j]) * (p - j)) * a;
        }
      }
      t0 += d;
    }
    return out;
  }
  // uzun süreli ortalama spektrum (güç)
  function ltas(x) {
    const n = 2048;
    let acc = null, say = 0, binHz = SR_SF / n;
    for (let i = 0; i + n < x.length; i += 1024) {
      const sp = Analiz.spektrum(x.subarray(i, i + n), SR_SF);
      if (!acc) acc = new Float64Array(sp.db.length);
      for (let k = 0; k < acc.length; k++) acc[k] += Math.pow(10, sp.db[k] / 10);
      say++;
    }
    return { p: acc.map((v) => v / say), binHz };
  }
  const bantDb = (L_, a, b) => { let s_ = 0; for (let k = Math.floor(a / L_.binHz); k <= b / L_.binHz; k++) s_ += L_.p[k]; return 10 * Math.log10(s_ + 1e-20); };
  const rmsOf = (x) => { let s_ = 0; for (let i = 0; i < x.length; i++) s_ += x[i] * x[i]; return Math.sqrt(s_ / x.length); };
  let sfVeri = null;
  function sfHazirla() {
    if (sfVeri) return sfVeri;
    const sarkici = (sf) => Ses.ezgi(SR_SF, EZGI_SF.map(([m, d, u]) => ({ m, d, u })), { tip: "erkek", sf, gurluk: 0.9, oq: 0.5, vibGen: 55, vibHiz: 5.6, seed: 3 }).data;
    const s1 = sarkici(1), s0 = sarkici(0);
    const o = orkestra(s1.length / SR_SF);
    const k = (rmsOf(s1) / rmsOf(o)) * Math.pow(10, 4 / 20); // orkestra toplamda ~4 dB güçlü
    for (let i = 0; i < o.length; i++) o[i] *= k;
    const n = Math.min(o.length, s1.length, s0.length);
    sfVeri = { s: { 1: s1.subarray(0, n), 0: s0.subarray(0, n) }, o: o.subarray(0, n), n };
    sfVeri.L = { o: ltas(sfVeri.o), 1: ltas(sfVeri.s[1]), 0: ltas(sfVeri.s[0]) };
    return sfVeri;
  }

  window.Demos.sarkiciFormanti = (stage) => {
    let sf = "1", kaynak = "birlikte", cal = null, playRaf = 0, micAcik = false, olcTimer = 0;
    const dinleBtn = ibtn("play", "Dinle", () => dinle(), "primary");
    const kSeg = seg([["birlikte", "Birlikte"], ["sarkici", "Şarkıcı"], ["orkestra", "Orkestra"]], kaynak, (k) => { kaynak = k; yenile(true); }, "Ne duyulsun");
    const sfSeg = seg([["0", "Yok"], ["1", "Var"]], sf, (k) => { sf = k; yenile(true); }, "Şarkıcı formantı");
    const ms = Alistirma.MicSatiri({ onAc: micAc, onKapa: micKapa });
    const sayfa = h("div.sheet.sf-sayfa");
    const spKap = h("div.sf-sp");
    const imlec = h("div.sf-imlec", { hidden: true });
    spKap.append(imlec);
    const ltasCv = h("canvas", { role: "img", "aria-label": "Uzun süreli ortalama spektrum: orkestra ve şarkıcı; 2,5–3,5 kHz bandı işaretli" });
    const ltasKap = h("div.sf-ltas", ltasCv);
    sayfa.append(spKap, ltasKap);
    const olc = h("div.olcumler.sf-olcum");
    stage.append(h("div.controls", dinleBtn, kSeg, h("span.ctl-lab", "Şarkıcı formantı"), sfSeg), ms.el, sayfa, olc);
    const sp = Spektrogram(spKap, { fmax: 5000, bant: [2500, 3500], bantAd: "2,5–3,5 kHz", taban: -66, tavan: -16 });
    let LW = 0, LH = 0;
    const LS = L.canvas(ltasCv, (st) => { LW = st.w; LH = st.h; ltasCiz(); });
    const lctx = LS.ctx;

    function karisim() {
      const v = sfHazirla();
      if (kaynak === "orkestra") return v.o;
      const s_ = v.s[sf];
      if (kaynak === "sarkici") return s_;
      const out = new Float32Array(v.n);
      for (let i = 0; i < v.n; i++) out[i] = s_[i] + v.o[i];
      return out;
    }
    function olcumYaz() {
      const v = sfHazirla();
      const fark = (a, b) => bantDb(v.L[sf], a, b) - bantDb(v.L.o, a, b);
      const ust = fark(2500, 3500), alt = fark(0, 1000);
      olc.innerHTML = "";
      const sz = (d) => (d >= 0 ? "+" : "−") + L.fmtNum(Math.abs(d)) + " dB";
      olc.append(
        h("div.olcum" + (ust > 0 ? ".tam" : ""), h("b", sz(ust)), h("small", "2,5–3,5 kHz: şarkıcı − orkestra")),
        h("div.olcum", h("b", sz(alt)), h("small", "0–1 kHz: şarkıcı − orkestra")),
        h("div.olcum", h("b", sf === "1" ? "var" : "yok"), h("small", "şarkıcı formantı")));
    }
    function yenile(sesDegisti) {
      if (micAcik) { ltasCiz(); olcumYaz(); return; }
      if (sesDegisti && cal) { const t = cal.ilerleme(); calDurdur(); baslat(t); }
      sp.ciz(karisim(), SR_SF);
      ltasCiz();
      olcumYaz();
    }

    function ltasCiz() {
      if (!LW || !sfVeri) return;
      const c = lctx, v = sfVeri;
      c.clearRect(0, 0, LW, LH);
      const sol = 46, sag = 10, ust = 22, alt = 20;
      const fx = (f) => sol + (f / 5000) * (LW - sol - sag);
      const ref = 10 * Math.log10(Math.max(...v.L.o.p.slice(1, 200)));
      const ARALIK = 60;
      const dy = (db) => ust + clamp((ref - db) / ARALIK, 0, 1) * (LH - ust - alt);
      // bant
      c.fillStyle = rgba(C.fosfor, 0.25); c.fillRect(fx(2500), ust, fx(3500) - fx(2500), LH - ust - alt);
      c.strokeStyle = rgba(C.porte, 0.8); c.lineWidth = 1;
      c.beginPath(); c.moveTo(sol, LH - alt + 0.5); c.lineTo(LW - sag, LH - alt + 0.5); c.stroke();
      for (let f = 0; f <= 5000; f += 1000) L.text(c, f ? f / 1000 + (LW < 500 && f < 5000 ? "" : " kHz") : "0", fx(f), LH - 5, { size: 11, color: C.muted, align: f === 0 ? "left" : f === 5000 ? "right" : "center", font: FONT.mono, weight: 600 });
      // yumuşatılmış eğri (~1/6 oktav)
      const egri = (Lx) => {
        const pts = [];
        for (let x = sol; x <= LW - sag; x += 3) {
          const f = Math.max(80, ((x - sol) / (LW - sol - sag)) * 5000), bw = f * 0.06;
          let s_ = 0, n = 0;
          for (let k = Math.max(1, Math.floor((f - bw) / Lx.binHz)); k <= (f + bw) / Lx.binHz; k++) { s_ += Lx.p[k]; n++; }
          pts.push([x, dy(10 * Math.log10(s_ / Math.max(1, n) + 1e-20))]);
        }
        return pts;
      };
      const po = egri(v.L.o);
      c.beginPath(); c.moveTo(po[0][0], LH - alt); po.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(po[po.length - 1][0], LH - alt); c.closePath();
      c.fillStyle = rgba(C.grafit, 0.28); c.fill();
      const ps = egri(v.L[sf]);
      c.beginPath(); ps.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.strokeStyle = C.ink; c.lineWidth = 2.4; c.lineJoin = "round"; c.stroke();
      L.text(c, "ortalama spektrum", sol, 14, { size: 12, color: C.muted, weight: 700 });
      L.text(c, "▇ orkestra", LW - sag - 92, 14, { size: 12, color: C.grafit, align: "right", weight: 700 });
      L.text(c, "— şarkıcı", LW - sag, 14, { size: 12, color: C.ink, align: "right", weight: 800 });
    }

    // çalma (24 kHz tampon)
    function baslat(bas = 0) {
      const c = Snd.ready(); if (!c) return;
      const x = karisim();
      const buf = c.createBuffer(1, x.length, SR_SF);
      const d = buf.getChannelData(0);
      for (let i = 0; i < x.length; i++) d[i] = x[i] * 0.55;
      const src = c.createBufferSource(); src.buffer = buf;
      const g = c.createGain(); g.gain.value = 1;
      src.connect(g); g.connect(Snd.bus);
      const t0 = c.currentTime + 0.03, sure = x.length / SR_SF;
      src.start(t0, Math.min(bas, sure - 0.05));
      const basla = t0 - bas;
      const ctl = {
        ilerleme: () => clamp(c.currentTime - basla, 0, sure),
        stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.02); src.stop(c.currentTime + 0.1); } catch (e) {} },
      };
      src.onended = () => { if (cal === ctl) calDurdur(); };
      cal = ctl;
      Snd.own(ctl);
      dinleBtn.setIcon("stop"); dinleBtn.setLabel("Durdur");
      imlec.hidden = false;
      const adim = () => {
        if (cal !== ctl) return;
        const sol = 46, w = spKap.clientWidth - sol;
        imlec.style.transform = `translateX(${(sol + (ctl.ilerleme() / sure) * w).toFixed(1)}px)`;
        playRaf = requestAnimationFrame(adim);
      };
      adim();
    }
    function calDurdur() {
      cancelAnimationFrame(playRaf);
      if (cal) { const x = cal; cal = null; x.stop(); }
      imlec.hidden = true;
      dinleBtn.setIcon("play"); dinleBtn.setLabel("Dinle");
    }
    function dinle() {
      if (cal) return calDurdur();
      if (Mic.state === "on") Mic.stop();
      Snd.unlock();
      baslat(0);
    }

    function micAc() {
      calDurdur();
      micAcik = true;
      // mikrofon çözümleyicisinin dB ölçeği sentez çiziminden farklı: bileşenin varsayılanları
      sp.set("taban", -95); sp.set("tavan", -25);
      sp.canli(Mic.analyser);
      const an = Mic.analyser;
      const buf = new Float32Array(an.frequencyBinCount);
      const binHz = an.context.sampleRate / an.fftSize;
      const v = sfHazirla();
      const ref = (Lx) => bantDb(Lx, 2500, 3500) - bantDb(Lx, 100, 1000);
      clearInterval(olcTimer);
      olcTimer = setInterval(() => {
        const k = Mic.son;
        olc.innerHTML = "";
        if (!k || !k.sesli || k.bekle) {
          olc.append(h("div.olcum", h("b", "—"), h("small", k && k.bekle ? "anlatım çalıyor, ölçüm bekliyor" : "2,5–3,5 kHz ÷ 0,1–1 kHz (söyleyin)")));
        } else {
          an.getFloatFrequencyData(buf);
          const oran = Analiz.bantOrani({ db: buf, binHz }, [2500, 3500], [100, 1000]);
          olc.append(h("div.olcum", h("b", (oran >= 0 ? "+" : "−") + L.fmtNum(Math.abs(oran)) + " dB"), h("small", "sesiniz: 2,5–3,5 kHz ÷ 0,1–1 kHz")));
        }
        olc.append(h("div.olcum", h("b", "−" + L.fmtNum(Math.abs(ref(v.L[1])))  + " / −" + L.fmtNum(Math.abs(ref(v.L[0]))) + " dB"), h("small", "sentez şarkıcı: formantlı / formantsız")));
      }, 250);
    }
    function micKapa() {
      if (!micAcik) return;
      micAcik = false;
      clearInterval(olcTimer);
      sp.durdur();
      sp.set("taban", -66); sp.set("tavan", -16);
      yenile(false);
    }
    window.addEventListener("themechange", () => ltasCiz());
    let hazir = false;
    return {
      enter() {
        if (!hazir) { hazir = true; setTimeout(() => yenile(false), 30); } else ltasCiz();
      },
      leave() { calDurdur(); micKapa(); },
    };
  };
  window.GuideScenarios["sarkici-formanti"] = [{ click: "=Yok" }, { wait: 1200 }, { click: "=Var" }, { wait: 800 }, { click: "=Şarkıcı" }, { wait: 800 }, { click: "=Birlikte" }];
})();
