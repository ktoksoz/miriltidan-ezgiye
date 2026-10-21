/* 8. Vibrato ve süsleme: deneyler */
(function () {
  const { h, C, FONT, rgba, ibtn, seg, nn, clamp } = L;
  const SR = 24000; // sessiz önhesap (sentez + perde ölçümü) için örnekleme hızı
  const sesTip = () => (L.prefs.sesBolge === "pes" ? "erkek" : "kadin");
  const fmt1 = (v) => L.fmtNum(v, 1);

  /* Hız × genişlik düzlemi. noktalar: [{hz, gen, renk, dolu, ad}] (gen < DUZ: "düz ses" şeridi),
     oklar: [{a:{hz,gen}, b:{hz,gen}, renk, ad, kalin}], gecmis: [{hz, gen}] */
  const HZ0 = 3, HZ1 = 9, GMAX = 160, DUZ = 12;
  function duzlem(ctx, W, H, { noktalar = [], oklar = [], gecmis = [] } = {}) {
    const l = 46, r = 12, t = 12, b = 34;
    const X = (hz) => l + (clamp(hz, HZ0, HZ1) - HZ0) / (HZ1 - HZ0) * (W - l - r);
    const Y = (g) => H - b - clamp(g, 0, GMAX) / GMAX * (H - b - t);
    const yer = (p) => [p.gen < DUZ || !p.hz ? X(p.hz || 6) : X(p.hz), p.gen < DUZ ? Y(DUZ / 2) : Y(p.gen)];
    ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H);
    // düz ses şeridi
    ctx.fillStyle = rgba(C.porte, 0.28); ctx.fillRect(l, Y(DUZ), W - l - r, Y(0) - Y(DUZ));
    L.text(ctx, "düz ses (belirgin vibrato yok)", l + 6, Y(DUZ) + (Y(0) - Y(DUZ)) / 2 + 4, { size: 10.5, color: C.muted, weight: 600 });
    // ızgara
    ctx.lineWidth = 1;
    for (let hz = HZ0; hz <= HZ1; hz++) {
      ctx.strokeStyle = rgba(C.porte, 0.7); ctx.beginPath(); ctx.moveTo(Math.round(X(hz)) + 0.5, t); ctx.lineTo(Math.round(X(hz)) + 0.5, H - b); ctx.stroke();
      L.text(ctx, String(hz), X(hz), H - b + 14, { size: 11, color: C.muted, align: "center", font: FONT.mono });
    }
    for (let g = 0; g <= 150; g += 50) {
      ctx.strokeStyle = rgba(C.porte, 0.7); ctx.beginPath(); ctx.moveTo(l, Math.round(Y(g)) + 0.5); ctx.lineTo(W - r, Math.round(Y(g)) + 0.5); ctx.stroke();
      L.text(ctx, "±" + g, l - 6, Y(g) + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono });
    }
    L.text(ctx, "hız (Hz)", W - r, H - 4, { size: 11, color: C.ink2, align: "right", weight: 700 });
    ctx.save(); ctx.translate(11, t + (H - b - t) / 2); ctx.rotate(-Math.PI / 2);
    L.text(ctx, "genişlik (sent)", 0, 0, { size: 11, color: C.ink2, align: "center", weight: 700 }); ctx.restore();
    // tipik klasik bölge: hız 5–7 Hz kaynaklı, genişlik ±50–100 yaklaşık (kesikli kenar)
    const x0 = X(5), x1 = X(7), y0 = Y(100), y1 = Y(50);
    ctx.fillStyle = rgba(C.fosfor, 0.5); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = rgba(C.fosforInk, 0.6); ctx.setLineDash([5, 4]); ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0); ctx.setLineDash([]);
    const etiketY = y0 - 6 > t + 10 ? y0 - 6 : y1 + 14;
    L.text(ctx, "klasik şarkıcılarda tipik (yaklaşık)", (x0 + x1) / 2, etiketY, { size: 10.5, color: C.ink2, align: "center", weight: 700 });
    // geçmiş ölçümler
    gecmis.forEach((p) => { const [x, y] = yer(p); ctx.fillStyle = rgba(C.grafit, 0.35); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); });
    // oklar
    oklar.forEach((o) => {
      const [ax, ay] = yer(o.a), [bx, by] = yer(o.b);
      ctx.strokeStyle = o.renk; ctx.fillStyle = o.renk; ctx.lineWidth = o.kalin ? 2.6 : 1.6;
      ctx.beginPath(); ctx.arc(ax, ay, o.kalin ? 4 : 3, 0, 7); ctx.fill();
      const d = Math.hypot(bx - ax, by - ay);
      if (d > 8) {
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        const a = Math.atan2(by - ay, bx - ax), k = o.kalin ? 10 : 8;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - k * Math.cos(a - 0.4), by - k * Math.sin(a - 0.4)); ctx.lineTo(bx - k * Math.cos(a + 0.4), by - k * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
      }
      if (o.ad) L.text(ctx, o.ad, bx + 8, by - 6, { size: 11.5, color: o.renk, weight: 800 });
    });
    // noktalar
    noktalar.forEach((p) => {
      const [x, y] = yer(p);
      ctx.lineWidth = 2.2; ctx.strokeStyle = p.renk; ctx.fillStyle = p.renk;
      ctx.beginPath(); ctx.arc(x, y, p.dolu ? 6 : 8, 0, 7);
      p.dolu ? ctx.fill() : ctx.stroke();
      if (p.ad) L.text(ctx, p.ad, x + 11, y + (p.altAd ? 14 : -8), { size: 11.5, color: p.renk, weight: 800 });
    });
  }
  // önhesap: notalar → perde kareleri (sessiz)
  function kareler(notalar, ses = {}) {
    const r = Ses.ezgi(SR, notalar, Object.assign({ tip: sesTip(), gurluk: 0.65, jitter: 0.002 }, ses));
    return { kareler: Pitch.izle(r.data, SR), olaylar: r.olaylar, sure: r.sure };
  }
  const egriNokta = (ks) => ks.map((k) => ({ t: k.t - Ses.BAS, m: k.sesli ? k.midi : NaN, g: clamp((k.db + 52) / 38, 0, 1) }));

  /* ---------- Vibrato ölçer ---------- */
  window.Demos.vibrato = (stage) => {
    let hiz = 5.8, gen = 55, bas = Aralik.perdele([0], { pay: 3 });
    let mod = "sentez", ses = null, micOff = null;
    let tPush = 0, faz = 0, olcumSentez = null, canliSonuc = null, sonKayit = null, merkez = bas;
    let buf = [], kosu = null, sessizSay = 0, sonHesap = 0, hesapId = 0;

    const dinleBtn = ibtn("play", "Örneği dinle", () => (ses ? sesKapa() : sesAc()), "primary");
    const slH = L.slider({ label: "Hız", min: 3, max: 9, step: 0.1, value: hiz, fmt: (v) => fmt1(v) + " Hz", oninput: (v) => { hiz = v; ayarla(); } });
    const slG = L.slider({ label: "Genişlik", min: 0, max: 150, step: 5, value: gen, fmt: (v) => "±" + v + " sent", oninput: (v) => { gen = v; ayarla(); } });
    const ms = Alistirma.MicSatiri({ onAc: () => micAc(), onKapa: () => micKapa() });
    const egriKap = h("div.sheet.egri-kap");
    const cv = h("canvas", { "aria-label": "Vibrato hızı ve genişliği düzlemi", role: "img" });
    const duzKap = h("div.sheet.vib-duzlem", cv);
    const olc = h("div.vib-olcum", { "aria-live": "polite" });
    stage.append(h("div.controls", dinleBtn, slH, slG), ms.el, egriKap, h("div.vib-alt", duzKap, olc));
    const egri = Egri(egriKap, { mod: "akis", pencere: 3.2, aralik: [bas - 2, bas + 2], minYari: 1.5, okuma: false, tol: 50 });

    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    function ciz() {
      if (!W) return;
      const gecmis = L.store.get("vibrato", []).slice(-12).map((v) => ({ hz: v.hiz, gen: v.genislik }));
      const noktalar = [];
      if (mod === "sentez") {
        noktalar.push({ hz: hiz, gen, renk: C.grafit, dolu: false, ad: "ayar", altAd: true });
        if (olcumSentez) noktalar.push({ hz: olcumSentez.hiz, gen: olcumSentez.genislik, renk: C.ink, dolu: true, ad: "ölçüm" });
      } else {
        if (sonKayit) noktalar.push({ hz: sonKayit.hiz, gen: sonKayit.genislik, renk: C.grafit, dolu: true, ad: "son ses", altAd: true });
        if (canliSonuc) noktalar.push({ hz: canliSonuc.hiz, gen: canliSonuc.genislik, renk: C.tam, dolu: true, ad: "siz" });
      }
      duzlem(S.ctx, W, H, { noktalar, gecmis });
    }
    function yaz(r, { kaynak }) {
      olc.innerHTML = "";
      const v = r && r.var;
      olc.append(h("div.olcumler",
        h("div.olcum" + (v && r.hiz >= 5 && r.hiz <= 7 ? ".tam" : ""), h("b", r && r.hiz && r.genislik >= DUZ ? fmt1(r.hiz) + " Hz" : "–"), h("small", "hız")),
        h("div.olcum", h("b", r ? "±" + Math.round(r.genislik) : "–"), h("small", "genişlik (sent)")),
        h("div.olcum", h("b", r && r.genislik >= DUZ ? "%" + Math.round(r.duzen * 100) : "–"), h("small", "düzen"))),
        h("p.note-msg", soz(r, kaynak)));
    }
    function soz(r, kaynak) {
      if (kaynak === "sentez") return r ? "Sentez sesin perde ölçeriyle ölçülen değeri. Ayar ile ölçüm arasındaki küçük fark ölçümün yaklaşıklığıdır." : "Ölçülüyor…";
      if (!r) return "Rahat bir notayı \"aaa\" diye 3–4 saniye tutun.";
      if (r.genislik < DUZ) return "Düz bir ses: belirgin bir vibrato yok. Bu da bir seçim olabilir; rahat ve destekli tutmayı sürdürün.";
      if (!r.var) return "Perdede bir dalgalanma var ama henüz düzenli değil. Notayı biraz daha uzun ve rahat tutmayı deneyin.";
      const hz = r.hiz < 5 ? "Hız tipik bölgenin biraz altında." : r.hiz > 7 ? "Hız tipik bölgenin biraz üstünde." : "Hız, klasik şarkıcılarda ölçülen tipik bölgenin içinde.";
      return hz + " Genişliği yaklaşık bir yön olarak okuyun; kesin bir sınır yok.";
    }

    // sentez ses: ayar → sessiz ölçüm (gecikmeli)
    function ayarla() {
      if (ses) ses.set({ vibHiz: hiz, vibGen: gen });
      clearTimeout(hesapId);
      hesapId = setTimeout(() => {
        const k = kareler([{ m: bas, d: 2.8, u: "a", vib: { hiz, gen } }]).kareler;
        olcumSentez = Analiz.vibrato(k);
        if (mod === "sentez") { yaz(olcumSentez, { kaynak: "sentez" }); ciz(); }
      }, 180);
      ciz();
    }
    function sesAc() {
      Snd.unlock();
      if (mod === "mic") Mic.stop();
      ses = Ses.canli({ f0: N.mtof(bas), tip: sesTip(), unlu: "a", vibHiz: hiz, vibGen: gen, gurluk: 0.6, jitter: 0.002 });
      if (!ses) return;
      dinleBtn.setLabel("Durdur"); dinleBtn.setIcon("stop");
    }
    function sesKapa() {
      if (ses) { ses.stop(); ses = null; }
      dinleBtn.setLabel("Örneği dinle"); dinleBtn.setIcon("play");
    }
    // sentez modunda perde eğrisine ayarlardan çizilen dalga (ses çalsın çalmasın)
    const dongu = L.loop(() => {
      if (mod !== "sentez") return;
      const now = egri.simdi;
      // saat değişti (ses bağlamı açıldı): eğriyi yeniden başlat; uzun duraklama: aradan atla
      // pencere baştan dolu görünsün: geriye doğru doldur
      if (now < tPush - 0.5 || !tPush) { egri.basla(now); tPush = now - 3.2; }
      else if (now - tPush > 3.2) tPush = now - 3.2;
      while (tPush < now) {
        faz += hiz * 0.01;
        egri.push({ t: tPush, sesli: true, midi: bas + (gen / 100) * Math.sin(2 * Math.PI * faz), db: ses ? -16 : -28 });
        tPush += 0.01;
      }
    });

    // mikrofon
    function micAc() {
      if (mod === "mic") return;
      sesKapa();
      mod = "mic"; buf = []; kosu = null; canliSonuc = null;
      egri.basla();
      micOff = egri.dinle(kare);
      yaz(null, { kaynak: "mic" }); ciz();
    }
    function micKapa() {
      if (mod !== "mic") return;
      micOff && micOff(); micOff = null;
      mod = "sentez"; merkez = bas; egri.aralik(bas - 2, bas + 2);
      tPush = 0;
      yaz(olcumSentez, { kaynak: "sentez" }); ciz();
    }
    function kare(k) {
      if (k.bekle) return;
      buf.push(k);
      if (buf.length > 500) buf.splice(0, buf.length - 500);
      if (k.sesli) {
        if (!kosu) kosu = [];
        kosu.push(k); sessizSay = 0;
        // perde eğrisini notanın çevresine yakınlaştır
        const son = buf.slice(-30).filter((x) => x.sesli).map((x) => x.midi).sort((a, b) => a - b);
        const c = son[son.length >> 1];
        if (c != null && Math.abs(c - merkez) > 0.8) { merkez = Math.round(c * 2) / 2; egri.aralik(merkez - 2, merkez + 2); }
      } else if (kosu) {
        kosu.push(k);
        if (++sessizSay > 25) { kosuBitti(kosu); kosu = null; }
      }
      if (k.t - sonHesap > 0.3) {
        sonHesap = k.t;
        const r = Analiz.vibrato(buf.filter((x) => x.t > k.t - 3));
        if (r) { canliSonuc = r; yaz(r, { kaynak: "mic" }); ciz(); }
      }
    }
    function kosuBitti(ks) {
      const sesli = ks.filter((x) => x.sesli);
      if (sesli.length < 2 || sesli[sesli.length - 1].t - sesli[0].t < 1.5) return;
      const r = Analiz.vibrato(ks);
      if (!r) return;
      canliSonuc = r; yaz(r, { kaynak: "mic" });
      if (r.var) {
        sonKayit = r;
        const g = L.store.get("vibrato", []);
        g.push({ tarih: Date.now(), hiz: Math.round(r.hiz * 100) / 100, genislik: Math.round(r.genislik * 10) / 10, duzen: Math.round(r.duzen * 100) / 100 });
        L.store.set("vibrato", g.slice(-200));
      }
      ciz();
    }
    window.addEventListener("aralikchange", () => { bas = Aralik.perdele([0], { pay: 3 }); if (mod === "sentez") { merkez = bas; egri.aralik(bas - 2, bas + 2); if (ses) ses.set({ f0: N.mtof(bas) }); ayarla(); } });
    window.addEventListener("themechange", () => ciz());
    // ölçer testleri için (sahte mikrofon)
    window.__vibrato = { get sonuc() { return canliSonuc; }, get kayit() { return sonKayit; } };

    return {
      enter() {
        egri.baslat(); tPush = 0; dongu.start(); ayarla();
        if (Mic.state === "on") micAc(); else yaz(olcumSentez, { kaynak: "sentez" });
      },
      leave() { sesKapa(); micKapa(); dongu.stop(); egri.durdur(); clearTimeout(hesapId); },
      toggle() { ses ? sesKapa() : sesAc(); },
    };
  };
  window.GuideScenarios["vibrato"] = [{ slide: "label:Hız", to: 0.2 }, { wait: 900 }, { slide: "label:Genişlik", to: 0.85 }, { wait: 900 }, { slide: "label:Hız", to: 0.47 }];

  /* ---------- Düz ses ve vibrato: üç stil ---------- */
  const STILLER = {
    erken: { ad: "Erken müzik (düz)", kisa: "erken müzik", vib: () => false, ses: { gurluk: 0.55, oq: 0.55, nefes: 0.05 },
      soz: "Erken müzik: uzun not de düz tutuluyor. Perde eğrisi bir cetvel gibi; düzlemde ok \"düz ses\" şeridinde kalıyor." },
    pop: { ad: "Pop (geç vibrato)", kisa: "pop", vib: (uzun) => (uzun ? { hiz: 5.4, gen: 35, gecikme: 1.1 } : false), ses: { gurluk: 0.6, nefes: 0.1, oq: 0.62 },
      soz: "Pop: uzun notanın başı düz, vibrato sona doğru ve dar açılıyor. Düzlemde ok düz ses şeridinden yukarı çıkıyor." },
    opera: { ad: "Opera (sürekli)", kisa: "opera", vib: () => ({ hiz: 5.8, gen: 70 }), ses: { gurluk: 0.75, sf: 0.7, karanlik: 0.3, oq: 0.5 },
      soz: "Opera: vibrato bütün notalarda baştan sona sürüyor. Düzlemde okun başı ve ucu aynı yerde, tipik bölgenin içinde." },
  };
  const CUMLE = [[0, 0.45], [2, 0.45], [4, 0.45], [5, 0.45], [4, 2.8]];
  window.Demos.duzSes = (stage) => {
    let stil = "pop", cal = null;
    const onbellek = {};
    const notalar = (k, bas) => CUMLE.map(([n, d], i) => ({ m: bas + n, d, u: "a", hece: i === CUMLE.length - 1 ? "aaa" : "a", vib: STILLER[k].vib(i === CUMLE.length - 1) }));
    const basOf = () => Aralik.perdele(CUMLE.map((x) => x[0]), { pay: 2 });
    function hesapla(k) {
      const bas = basOf(), key = k + bas;
      if (onbellek[key]) return onbellek[key];
      const ns = notalar(k, bas);
      const r = kareler(ns, STILLER[k].ses);
      const u = r.olaylar.filter((o) => !o.sus && !o.sessiz).pop();
      const pencere = (a, b) => Analiz.vibrato(r.kareler.filter((x) => x.t >= a && x.t <= b));
      const vb = pencere(u.t0 + 0.12, u.t0 + 1.05), vs = pencere(u.t1 - 1.3, u.t1 - 0.05);
      // düz sesin hızı anlamsız: düz ses şeridinde stile göre ayrı yerlere konur
      const p = (v) => (v && v.genislik >= DUZ ? { hz: v.hiz, gen: v.genislik } : { hz: k === "erken" ? 4 : 6, gen: 0 });
      return (onbellek[key] = { bas, ns, nokta: egriNokta(r.kareler), a: p(vb), b: p(vs) });
    }
    const basBtn = ibtn("play", "Dinle", () => dinle(), "primary");
    const stilSeg = seg(Object.entries(STILLER).map(([k, v]) => [k, v.ad]), stil, (k) => { stil = k; durdur(); goster(); }, "Stil");
    const egriKap = h("div.sheet.egri-kap");
    const cv = h("canvas", { "aria-label": "Üç stilin vibrato düzlemi", role: "img" });
    const msg = h("p.note-msg");
    stage.append(h("div.controls", stilSeg, basBtn), egriKap, h("div.vib-alt", h("div.sheet.vib-duzlem", cv), h("div.vib-olcum", msg)));
    const egri = Egri(egriKap, { mod: "sabit", sure: 5, minYari: 2.5, okuma: false });
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; cizDuzlem(); });
    function cizDuzlem() {
      if (!W) return;
      const oklar = Object.keys(STILLER).map((k) => {
        const v = hesapla(k);
        return { a: v.a, b: v.b, renk: k === stil ? C.ink : rgba(C.grafit, 0.75), kalin: k === stil, ad: STILLER[k].kisa };
      });
      // seçili stil en üstte çizilsin
      oklar.sort((x, y) => x.kalin - y.kalin);
      duzlem(S.ctx, W, H, { oklar });
    }
    function goster() {
      const v = hesapla(stil);
      let t = 0;
      const hd = v.ns.map((n) => { const o = { t0: t, t1: t + n.d, m: n.m, hece: n.hece }; t += n.d; return o; });
      egri.mod("sabit"); egri.sure(t + 0.4); egri.temizle(); egri.katmanSil();
      egri.aralik(v.bas - 2.5, v.bas + 6.5);
      egri.hedefler(hd); egri.katmanEkle(v.nokta, { ad: STILLER[stil].kisa }); egri.imlec(null); egri.ciz();
      msg.textContent = STILLER[stil].soz;
      cizDuzlem();
    }
    function durdur() { if (cal) { cal.stop(); cal = null; } basBtn.setLabel("Dinle"); basBtn.setIcon("play"); }
    function dinle() {
      if (cal) return durdur();
      Snd.unlock();
      const v = hesapla(stil);
      cal = Alistirma.ornekSoyle(egri, v.ns, { ses: Object.assign({ vibGen: 0 }, STILLER[stil].ses), bitince: () => durdur() });
      if (cal) { basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); }
    }
    window.addEventListener("aralikchange", () => goster());
    window.addEventListener("themechange", () => cizDuzlem());
    return { enter() { egri.baslat(); goster(); }, leave() { durdur(); egri.durdur(); }, toggle: () => dinle() };
  };
  window.GuideScenarios["duz-ses"] = [{ click: "=Erken müzik (düz)" }, { wait: 900 }, { click: "=Opera (sürekli)" }, { wait: 900 }, { click: "=Pop (geç vibrato)" }];

  /* ---------- Süslemeler ---------- */
  // her süsleme: iskelet (süslemesiz ezgi) ve süslemeli sentez notaları; n: göreli yarım ses
  const tekrar = (a, b, k, d) => Array.from({ length: k }, (_, i) => ({ n: i % 2 ? b : a, d, glide: 0.012 }));
  const SUSLER = {
    tril: { ad: "Tril", iskelet: [[2, 0.6], [0, 1.6]],
      sus: [{ n: 2, d: 0.6 }, ...tekrar(0, 2, 12, 0.075), { n: 0, d: 0.7 }],
      soz: "Tril: asıl nota ile bir üst komşusu arasında hızlı gidip gelme; eğride bir testere dişi." },
    apojiatura: { ad: "Apojiatura", iskelet: [[4, 0.6], [0, 1.6]],
      sus: [{ n: 4, d: 0.6 }, { n: 2, d: 0.6, g: 0.85, glide: 0.04 }, { n: 0, d: 1.0, g: 0.55, glide: 0.06 }],
      soz: "Apojiatura: asıl notanın bir üst komşusu vurguyla söylenip asıl notaya \"yaslanarak\" çözülüyor; asıl notanın süresinden pay alıyor." },
    carpma: { ad: "Çarpma", iskelet: [[0, 0.7], [4, 1.5]],
      sus: [{ n: 0, d: 0.7 }, { n: 5, d: 0.07, glide: 0.01 }, { n: 4, d: 1.43, glide: 0.015 }],
      soz: "Çarpma: asıl nota çok kısa bir üst yardımcı notayla başlıyor; eğride küçük bir çentik." },
    girtlak: { ad: "Gırtlak", iskelet: [[0, 2.2]],
      sus: [{ n: 0, d: 0.5 }, { n: 1.4, d: 0.06, glide: 0.008, g: 0.8 }, { n: 0, d: 0.22, glide: 0.01 }, { n: 1.4, d: 0.06, glide: 0.008, g: 0.8 }, { n: 0, d: 0.22, glide: 0.01 },
        { n: 1.6, d: 0.06, glide: 0.008, g: 0.8 }, { n: 0, d: 0.3, glide: 0.01 }, { n: 1.4, d: 0.06, glide: 0.008, g: 0.8 }, { n: 0, d: 0.72, glide: 0.01 }],
      soz: "Gırtlak: uzun ses kısa, hızlı kırılmalarla dalgalandırılıyor. Bu sentez kaba bir çizimdir; gerçek gırtlak süslemesini usta icracılardan dinleyin." },
    kaydirma: { ad: "Kaydırma", iskelet: [[0, 0.8], [5, 1.4]],
      sus: [{ n: 0, d: 0.65 }, { n: 5, d: 1.55, glide: 0.16 }],
      soz: "Kaydırma: dörtlü aralık basamak basamak değil, kesintisiz kayarak geçiliyor; eğride bir yokuş." },
    surme: { ad: "Sürme", iskelet: [[0, 0.7], [4, 1.5]],
      sus: [{ n: 0, d: 0.7 }, { n: 2, d: 0.06, glide: 0.01 }, { n: 4, d: 1.44, glide: 0.13 }],
      soz: "Sürme (bu sayfadaki çalışma tanımı): asıl notaya alttan sürükleyerek giriliyor. Adın anlamı yöreye ve icracıya göre değişebilir." },
  };
  window.Demos.susleme = (stage) => {
    let sus = "tril", cal = null, deneme = null;
    const onbellek = {};
    const basOf = () => Aralik.perdele([0, 5], { pay: 2 });
    function hesapla(k) {
      const bas = basOf(), key = k + bas;
      if (onbellek[key]) return onbellek[key];
      const S = SUSLER[k];
      const ns = S.sus.map((x) => (x.r ? x : { m: bas + x.n, d: x.d, u: "a", g: x.g, glide: x.glide, vib: false }));
      const duz = S.iskelet.map(([n, d]) => ({ m: bas + n, d, u: "a", vib: false, hece: nn(bas + n) }));
      const r = kareler(ns, { glide: 0.03 });
      let t = 0;
      const hd = duz.map((n) => { const o = { t0: t, t1: t + n.d, m: n.m, hece: n.hece }; t += n.d; return o; });
      return (onbellek[key] = { bas, ns, duz, hd, sure: t, nokta: egriNokta(r.kareler) });
    }
    const dinleBtn = ibtn("play", "Dinle", () => cal ? durdur() : dinle(false), "primary");
    const duzBtn = L.btn("Süslemesiz", () => dinle(true));
    const deneBtn = ibtn("mic", "Siz deneyin", () => (deneme ? denemeDur() : dene()));
    const susSeg = seg(Object.entries(SUSLER).map(([k, v]) => [k, v.ad]), sus, (k) => { sus = k; durdur(); denemeDur(); goster(); }, "Süsleme");
    const ms = Alistirma.MicSatiri();
    const egriKap = h("div.sheet.egri-kap");
    const msg = h("p.note-msg");
    const sonuc = h("div.sonuc");
    stage.append(h("div.controls", susSeg), h("div.controls", dinleBtn, duzBtn, deneBtn), ms.el, egriKap, msg, sonuc);
    const egri = Egri(egriKap, { mod: "sabit", sure: 3, minYari: 3, okuma: false, tol: 30 });
    function goster() {
      const v = hesapla(sus);
      egri.mod("sabit"); egri.sure(v.sure + 0.4); egri.temizle(); egri.katmanSil();
      egri.aralik(v.bas - 2.5, v.bas + 6.5);
      egri.hedefler(v.hd); egri.katmanEkle(v.nokta, { ad: "örnek" }); egri.imlec(null); egri.ciz();
      msg.textContent = SUSLER[sus].soz;
    }
    function durdur() { if (cal) { cal.stop(); cal = null; } dinleBtn.setLabel("Dinle"); dinleBtn.setIcon("play"); }
    function dinle(duz, bitince) {
      durdur();
      Snd.unlock();
      const v = hesapla(sus);
      cal = Alistirma.ornekSoyle(egri, duz ? v.duz : v.ns, { ses: { glide: 0.03 }, bitince: () => { durdur(); bitince && bitince(); } });
      if (cal && !duz) { dinleBtn.setLabel("Durdur"); dinleBtn.setIcon("stop"); }
      return cal;
    }
    // dinle → söyle: örnek çalarken mikrofon bekler (kulaklık yoksa), sonra ziyaretçinin eğrisi örneğin üstüne çizilir
    async function dene() {
      Snd.unlock();
      sonuc.innerHTML = "";
      const mic = Mic.state === "on" || (await Mic.start());
      if (!mic) { dinle(false); return; }
      const v = hesapla(sus);
      deneme = { timers: [], raf: 0, off: null };
      deneBtn.setLabel("Durdur"); deneBtn.setIcon("stop");
      const dur = deneme;
      const sonra = (ms, fn) => dur.timers.push(setTimeout(fn, ms));
      if (!L.prefs.kulaklik) Mic.bekle("referans", true);
      egri.durum("Dinleyin…", { buyuk: true });
      dinle(false, () => {
        if (deneme !== dur) return;
        Mic.bekle("referans", false);
        const c = Snd.ctx, t0 = c.currentTime + 0.5;
        egri.durum("Şimdi siz", { buyuk: true });
        sonra(900, () => egri.durum(null));
        egri.temizle(); egri.basla(t0);
        dur.off = egri.dinle();
        const imlec = () => { egri.imlec(c.currentTime - t0); dur.raf = requestAnimationFrame(imlec); };
        imlec();
        sonra((v.sure + 0.9) * 1000, () => { denemeBitti(v); });
      });
    }
    function denemeBitti(v) {
      const ps = egri.noktalar.filter((p) => !isNaN(p.m) && p.t >= 0 && p.t <= v.sure + 0.4);
      denemeDur();
      sonuc.innerHTML = "";
      if (ps.length < 10) { sonuc.append(h("p.note-msg", "Sesinizi duyamadım. Mikrofona biraz yaklaşıp yeniden deneyin.")); return; }
      // perde hareketi: kapsanan aralık ve yön değişimi (saniyede)
      const ms = ps.map((p) => p.m);
      const genis = Math.max(...ms) - Math.min(...ms);
      let don = 0, yon = 0;
      for (let i = 3; i < ms.length; i += 3) { const d = ms[i] - ms[i - 3]; if (Math.abs(d) > 0.25) { const y = Math.sign(d); if (yon && y !== yon) don++; yon = y; } }
      const sure = ps[ps.length - 1].t - ps[0].t;
      sonuc.append(h("div.olcumler",
        h("div.olcum", h("b", L.fmtNum(genis, 1)), h("small", "perde hareketi (yarım ses)")),
        h("div.olcum", h("b", sure > 0 ? L.fmtNum(don / sure, 1) : "–"), h("small", "yön değişimi / sn"))),
        h("p.note-msg", "Eğrinizi grafit örnekle biçim olarak karşılaştırın. Süslemeler hızlıdır; ölçüm kısa notaları biraz yuvarlar."));
    }
    function denemeDur() {
      if (!deneme) return;
      deneme.timers.forEach(clearTimeout); cancelAnimationFrame(deneme.raf); deneme.off && deneme.off();
      deneme = null;
      Mic.bekle("referans", false); egri.durum(null); durdur();
      deneBtn.setLabel("Siz deneyin"); deneBtn.setIcon("mic");
    }
    window.addEventListener("aralikchange", () => goster());
    return { enter() { egri.baslat(); goster(); }, leave() { denemeDur(); durdur(); egri.durdur(); }, toggle() { deneme ? denemeDur() : dene(); } };
  };
  window.GuideScenarios["susleme"] = [{ click: "=Kaydırma" }, { wait: 900 }, { click: "=Çarpma" }, { wait: 900 }, { click: "=Tril" }];
})();
