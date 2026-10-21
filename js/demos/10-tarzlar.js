/* 10. Tarzlar: deneyler
   - belCanto: bu site için yazılmış vokaliz; sentez ses şarkıcı formantı + vibratoyla ya da düz söyler; 🎤 Alistirma.
   - popTeknik: mikrofon mesafesi → yakınlık etkisi (bas artışı) ve gürlük; pop tarzları sentezle.
   - makamPerdeleri: 53 komalık akort aleti (halka) + Rast/Uşşak/Hicaz dizi ve seyir alıştırması, makam kartı.
   - usulSoyle: usul vuruşları perde eğrisinin altında; usulle söylenen kısa makam egzersizi.
   - uzunHava: serbest ritimli, süslemeli kısa bir Hüseynî cümlesi (bu site için yazıldı). */
(function () {
  const { h, C, FONT, seg, ibtn, btn, nn, rgba, fmtNum, fmtCents, clamp, text, slider, prefs, perdeRenk } = L;
  const G = window.GuideScenarios;
  const KM = (k) => (k * 12) / 53;                        // koma → yarım ses
  const tip = () => (prefs.sesBolge === "pes" ? "erkek" : "kadin");
  const olcum = (deger, etiket, cls = "") => h("div.olcum" + (cls ? "." + cls : ""), h("b", deger), h("small", etiket));
  const sapmaCls = (c) => (c == null ? "" : Math.abs(c) <= 15 ? "tam" : c < 0 ? "pes" : "tiz");
  const fmtKoma = (k, d = 1) => (Math.round(k * 10 ** d) > 0 ? "+" : Math.round(k * 10 ** d) < 0 ? "−" : "±") + fmtNum(Math.abs(k), d) + " koma";
  // Rast perdesi (MIDI): verilen koma aralığı ziyaretçinin rahat aralığının alt-orta bölgesine otursun
  const rastOner = (komalar) => Aralik.perdele(komalar.map(KM), { pay: 1 });
  const perdeAd = (k) => { const p = K.perdeKoma(k); return p ? p.ad : fmtNum(k) + " koma"; };

  // Notalar arasındaki bağlılık: hedeflerin kapsadığı sürede sesli geçen zamanın payı (legato ölçüsü)
  function baglilik(noktalar, t0, t1) {
    const ps = noktalar.filter((p) => p.t >= t0 && p.t <= t1);
    let ses = 0, top = 0;
    for (let i = 1; i < ps.length; i++) {
      const dt = ps[i].t - ps[i - 1].t;
      if (dt <= 0 || dt > 0.12) continue;
      top += dt;
      if (!isNaN(ps[i].m) && !isNaN(ps[i - 1].m)) ses += dt;
    }
    return top > 0.5 ? ses / top : null;
  }
  // Önceden hesaplanmış sentez perde dizisi (önizleme katmanı)
  const onbellek = new Map();
  function sessizIz(notalar, opts = {}) {
    const anahtar = JSON.stringify(notalar.map((n) => [n.m, n.d, n.r, n.glide])) + JSON.stringify(opts) + tip();
    if (onbellek.has(anahtar)) return onbellek.get(anahtar);
    const sr = 24000;
    const r = Ses.ezgi(sr, notalar.map((n) => (n.r ? n : Object.assign({ u: "a" }, n))), Object.assign({ tip: tip(), gurluk: 0.62 }, opts));
    const v = Pitch.izle(r.data, sr).map((k) => ({ t: k.t - Ses.BAS, m: k.sesli ? k.midi : NaN, g: clamp((k.db + 52) / 38, 0, 1) }));
    onbellek.set(anahtar, v);
    return v;
  }

  /* ================= Bel canto ================= */
  // bu slayt için yazılmış iki cümlelik vokaliz: [yarım ses, vuruş]
  const VOKALIZ = [
    [[0, 1], [2, 0.5], [4, 0.5], [5, 1], [4, 0.5], [2, 0.5], [4, 1], [7, 1.5], [5, 0.5], [4, 0.5], [2, 0.5], [0, 2]],
    [[4, 1], [5, 0.5], [7, 0.5], [9, 1.5], [7, 0.5], [5, 1], [4, 0.5], [2, 0.5], [0, 2]],
  ];
  const STIL = {
    belcanto: { sf: 1, vibGen: 50, vibHiz: 5.6, vibGecikme: 0.12, karanlik: 0.35, gurluk: 0.74, glide: 0.06, oq: 0.55 },
    duz: { sf: 0, vibGen: 0, karanlik: 0, gurluk: 0.6, glide: 0.03, oq: 0.6 },
  };
  function vokaliz(i) {
    const k = VOKALIZ[i];
    const bas = Aralik.perdele(VOKALIZ.flat().map((x) => x[0]), { pay: 2 });
    const sn = 60 / 72;
    return k.map(([n, v]) => ({ m: bas + n, d: v * sn, hece: nn(bas + n), u: "a" }));
  }

  // ağzın filtre yanıtı: şarkıcı formantı açık/kapalı (Ses.hedefFormant + filtreYaniti)
  function SpektrumSerit(kap) {
    const cv = h("canvas", { role: "img", "aria-label": "Ağzın filtre yanıtı: şarkıcı formantı açık ve kapalı" });
    const el = h("div.bc-spektrum", cv);
    kap.append(el);
    let secili = "belcanto", W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    const FMAX = 5000;
    function egri(sf) {
      const fs = Ses.hedefFormant({ tip: tip(), unlu: "a", sf, karanlik: sf ? STIL.belcanto.karanlik : 0 });
      const out = [];
      for (let i = 0; i <= 160; i++) { const f = 80 + (i / 160) * (FMAX - 80); out.push([f, 20 * Math.log10(Ses.filtreYaniti(fs, f) + 1e-9)]); }
      return out;
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const sol = 40, sag = W - 10, ust = 18, alt = H - 18;
      const a = egri(1), b = egri(0);
      const mx = Math.max(...a.map((p) => p[1]), ...b.map((p) => p[1]));
      const X = (f) => sol + (f / FMAX) * (sag - sol), Y = (db) => ust + (1 - clamp((db - (mx - 50)) / 50, 0, 1)) * (alt - ust);
      // şarkıcı formantı bandı (2,5–3,5 kHz)
      ctx.fillStyle = rgba(C.fosfor, 0.45);
      ctx.fillRect(X(2500), ust - 4, X(3500) - X(2500), alt - ust + 4);
      text(ctx, "şarkıcı formantı", X(3000), ust - 6, { size: 11, align: "center", color: C.ink2, weight: 700 });
      [[a, "belcanto"], [b, "duz"]].forEach(([ps, k]) => {
        ctx.strokeStyle = k === secili ? C.ink : rgba(C.grafit, 0.6);
        ctx.lineWidth = k === secili ? 2 : 1.2;
        ctx.setLineDash(k === "duz" ? [5, 4] : []);
        ctx.beginPath();
        ps.forEach(([f, db], i) => (i ? ctx.lineTo(X(f), Y(db)) : ctx.moveTo(X(f), Y(db))));
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.strokeStyle = C.porte; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sol, alt + 0.5); ctx.lineTo(sag, alt + 0.5); ctx.stroke();
      [1000, 2000, 3000, 4000].forEach((f) => text(ctx, fmtNum(f / 1000) + " kHz", X(f), H - 4, { size: 10, align: "center", color: C.muted, font: FONT.mono }));
      text(ctx, "ağzın filtresi", sol, 12, { size: 11, color: C.muted, weight: 700 });
      const lx = sag - 4;
      text(ctx, "— şarkıcı formantlı   - - düz", lx, 12, { size: 11, color: C.ink2, align: "right" });
    }
    window.addEventListener("themechange", ciz);
    window.addEventListener("prefchange", (e) => e.detail.k === "sesBolge" && ciz());
    return { el, sec(k) { secili = k; ciz(); } };
  }

  window.Demos.belCanto = (stage) => {
    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const belBtn = ibtn("play", "Bel canto", () => ornek("belcanto"), "ghost");
    const duzBtn = ibtn("play", "Düz ses", () => ornek("duz"), "ghost");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", basBtn, h("span.ctl-lab", "Dinleyin:"), belBtn, duzBtn, h("span.spacer"), durum), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 10, tol: 35 });
    const spek = SpektrumSerit(stage);
    const sonuc = h("div.sonuc");
    stage.append(sonuc, Egri.anahtar());
    let calan = null;

    function ornek(stil) {
      Snd.unlock();
      al.durdur();
      calan && calan.stop();
      const ns = vokaliz(0);
      Alistirma.onizleme(egri, ns, { katman: false });
      calan = Alistirma.ornekSoyle(egri, ns, { sapma: 0, ses: STIL[stil] });
      spek.sec(stil);
      sonuc.innerHTML = "";
      if (!calan) return;
      const v = Analiz.vibrato(calan.kareler);
      sonuc.append(h("div.olcumler",
        olcum(stil === "belcanto" ? "açık" : "kapalı", "şarkıcı formantı"),
        olcum(v && v.var ? fmtNum(v.hiz, 1) + " Hz" : "yok", "vibrato hızı (ölçülen)"),
        olcum(v && v.var ? "±" + fmtNum(v.genislik) + " sent" : "–", "vibrato genişliği")),
        h("p.note-msg", stil === "belcanto"
          ? "Şarkıcı formantı ve sürekli vibrato: ses daha parlak ve \"taşıyan\" duyulur. Eğride perde notanın iki yanında düzenli dalgalanır."
          : "Aynı vokaliz düz: vibrato yok, şarkıcı formantı yok. Perde çizgisi dümdüz; tını daha yakın ve sade."));
    }

    const al = Alistirma({
      egri, tur: "bel-canto", tol: 35,
      cumleler: () => [vokaliz(0), vokaliz(1)],
      onBasla() { calan && calan.stop(); basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durum.textContent = ""; },
      onDurum(t) { durum.textContent = t; },
      onSonuc(s, i) {
        const y = Math.round(s.genel * 100);
        const ort = s.notalar.filter((n) => n.ort != null);
        const o = ort.length ? ort.reduce((a, n) => a + n.ort, 0) / ort.length : null;
        const hs = egri.hedefListe.filter((x) => x.aktif !== false);
        const b = s.mikrofon && hs.length ? baglilik(egri.noktalar, hs[0].t0 + 0.1, hs[hs.length - 1].t1 - 0.1) : null;
        sonuc.innerHTML = "";
        sonuc.append(h("div.olcumler",
          olcum(s.mikrofon ? "%" + y : "–", `${i + 1}. cümle: bantta`, y >= 70 && s.mikrofon ? "tam" : ""),
          olcum(o == null || !s.mikrofon ? "–" : fmtCents(o), "ortalama sapma", s.mikrofon ? sapmaCls(o) : ""),
          olcum(b == null ? "–" : "%" + Math.round(b * 100), "bağlılık (legato)", b != null && b >= 0.85 ? "tam" : "")),
          h("p.note-msg", Alistirma.sonucSozu(s, 35) + (b == null ? "" : b >= 0.85 ? " Notalar birbirine bağlı aktı." : " Notaların arasında boşluklar var: sesi bir notadan ötekine taşımayı düşünün, nefesi cümle sonunda alın.")));
      },
    });
    const onizle = () => { if (!al.calisiyor) { Alistirma.onizleme(egri, vokaliz(0)); } };
    window.addEventListener("aralikchange", onizle);
    return {
      enter() { egri.baslat(); onizle(); },
      leave() { al.durdur(); calan && calan.stop(); calan = null; egri.durdur(); },
      toggle: () => al.toggle(),
    };
  };
  G["bel-canto"] = [{ click: "=Düz ses" }, { wait: 2600 }, { click: "=Bel canto" }];

  /* ================= Pop ve müzikal ================= */
  // Yakınlık etkisi modeli: kardioid (basınç gradyanı) mikrofonun yakın alan artışı,
  // Shure SM57 kılavuzundaki değere (≈6 mm'de 100 Hz altında 6–10 dB) göre ölçeklendi.
  const SES_HIZI = 343;
  const yakinB = (f, d) => 10 * Math.log10(1 + Math.pow(1 / (2 * ((2 * Math.PI * f) / SES_HIZI) * d), 2));
  const OLCEK = 8 / yakinB(100, 0.006);
  const yakinlik = (f, cm) => OLCEK * yakinB(f, cm / 100);
  const seviye = (cm) => 20 * Math.log10(10 / cm); // 10 cm'ye göre
  const POP = [[0, 0.36], [2, 0.36], [4, 0.72], [7, 1.5, true], [4, 0.36], [2, 0.36], [4, 1.7, true]];
  const TARZ = {
    duz: { ad: "Konuşur gibi", ses: { oq: 0.6, nefes: 0.05, gurluk: 0.6 }, soz: "Konuşmaya yakın, düz ve sade." },
    nefesli: { ad: "Nefesli", ses: { oq: 0.86, nefes: 0.4, gurluk: 0.42 }, soz: "Ses telleri tam kapanmıyor, sese hava karışıyor; mikrofona yakın söylenince samimi duyulur." },
    mix: { ad: "Mix", ses: { oq: 0.5, nefes: 0.04, gurluk: 0.72, karanlik: -0.15 }, soz: "Göğüs sesinin dolgunluğu, kafa sesinin kolaylığı: orta bir kapanma." },
    gec: { ad: "Geç vibrato", ses: { oq: 0.55, gurluk: 0.66 }, gecVib: true, soz: "Uzun notalar önce düz, sonra vibrato açılıyor: pop ve müzikalde sık." },
    belt: { ad: "Belting", ses: { oq: 0.38, gurluk: 0.96, acik: 0.6, karanlik: -0.5, nefes: 0.02 }, ust: true, soz: "Aralığın üst bölgesinde, göğüs sesine yakın parlak ve güçlü ses (kapalı faz uzun, ağız açık). Kısa tutun." },
  };
  function popNotalar(tarz) {
    const rel = POP.map((x) => x[0]);
    const a = Aralik.get();
    const bas = TARZ[tarz].ust ? Aralik.perdele(rel, { pay: 2, tercih: a.hi }) : Aralik.perdele(rel, { pay: 2 });
    return POP.map(([n, d, uzun]) => ({ m: bas + n, d, u: "a", c: "n", hece: "na",
      vib: TARZ[tarz].gecVib && uzun ? { hiz: 5.4, gen: 40, gecikme: 0.7 } : false }));
  }

  window.Demos.popTeknik = (stage) => {
    let cm = 10, tarz = "duz", zincir = null, calan = null, dinleOff = null, sonDb = null;
    const dinleBtn = ibtn("play", "Dinle", () => cal(), "primary");
    const mesafe = slider({ label: "Mesafe", min: 0.6, max: 40, step: 0.2, value: cm, fmt: (v) => fmtNum(v, v < 2 ? 1 : 0) + " cm", oninput: (v) => { cm = v; uygula(); ciz(); yaz(); } });
    const tarzSeg = seg(Object.entries(TARZ).map(([k, v]) => [k, v.ad]), tarz, (k) => { tarz = k; cal(); }, "Tarz");
    const ms = Alistirma.MicSatiri({ onAc: () => dinleModu() });
    const cv = h("canvas", { role: "img", "aria-label": "Mikrofon mesafesine göre frekans yanıtı: yakınlık etkisi" });
    const mikSayfa = h("div.sheet.pop-mik", cv);
    const sayfa = h("div.sheet.egri-kap");
    const olc = h("div.olcumler");
    const not = h("p.note-msg");
    stage.append(h("div.controls", dinleBtn, mesafe), h("div.controls", tarzSeg), ms.el, mikSayfa, sayfa, olc, not);
    const egri = Egri(sayfa, { mod: "sabit", sure: 6, tol: 40 });
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });

    function zincirKur() {
      const c = Snd.ready(); if (!c) return null;
      if (zincir) return zincir;
      const giris = c.createGain(), raf = c.createBiquadFilter(), sev = c.createGain();
      raf.type = "lowshelf"; raf.frequency.value = 160;
      giris.connect(raf); raf.connect(sev); sev.connect(Snd.bus);
      zincir = { giris, raf, sev };
      uygula();
      return zincir;
    }
    function uygula() {
      if (!zincir) return;
      const t = Snd.ctx.currentTime;
      zincir.raf.gain.setTargetAtTime(yakinlik(100, cm), t, 0.05);
      // duyulan gürlük kulağı korumak için sınırlı
      zincir.sev.gain.setTargetAtTime(Math.pow(10, clamp(seviye(cm), -14, 9) / 20) * 0.55, t, 0.05);
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const sol = 44, sag = W - 14, ust = 26, alt = H - 22;
      const fA = 40, fB = 8000, dbA = -2, dbB = 12;
      const X = (f) => sol + (Math.log(f / fA) / Math.log(fB / fA)) * (sag - sol);
      const Y = (db) => ust + (1 - (db - dbA) / (dbB - dbA)) * (alt - ust);
      // sesin temel frekans bölgesi (ziyaretçinin aralığı)
      const a = Aralik.get();
      ctx.fillStyle = rgba(C.fosfor, 0.4);
      ctx.fillRect(X(N.mtof(a.lo)), ust, X(N.mtof(a.hi)) - X(N.mtof(a.lo)), alt - ust);
      text(ctx, "sesinizin perde bölgesi", (X(N.mtof(a.lo)) + X(N.mtof(a.hi))) / 2, alt - 6, { size: 10, align: "center", color: C.ink2, weight: 700 });
      // ızgara
      ctx.strokeStyle = rgba(C.porte, 0.7); ctx.lineWidth = 1;
      [100, 1000].forEach((f) => { ctx.beginPath(); ctx.moveTo(X(f) + 0.5, ust); ctx.lineTo(X(f) + 0.5, alt); ctx.stroke(); });
      [0, 5, 10].forEach((db) => {
        ctx.beginPath(); ctx.moveTo(sol, Math.round(Y(db)) + 0.5); ctx.lineTo(sag, Math.round(Y(db)) + 0.5); ctx.stroke();
        text(ctx, (db > 0 ? "+" : "") + db + " dB", sol - 6, Y(db) + 4, { size: 10, align: "right", color: C.muted, font: FONT.mono });
      });
      [[50, "50 Hz"], [100, "100 Hz"], [300, "300 Hz"], [1000, "1 kHz"], [3000, "3 kHz"]].forEach(([f, s]) => text(ctx, s, X(f), H - 6, { size: 10, align: "center", color: C.muted, font: FONT.mono }));
      // uzak (düz) yanıt
      ctx.strokeStyle = rgba(C.grafit, 0.7); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(sol, Y(yakinlik(40, 40))); ctx.lineTo(sag, Y(yakinlik(8000, 40))); ctx.stroke(); ctx.setLineDash([]);
      // seçili mesafedeki yanıt: kalem çizgisi
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const f = fA * Math.pow(fB / fA, i / 120); const y = Y(Math.min(dbB, yakinlik(f, cm))); i ? ctx.lineTo(X(f), y) : ctx.moveTo(X(f), y); }
      ctx.stroke();
      text(ctx, "bas artışı (yakınlık etkisi)", sol + 4, 14, { size: 11, color: C.muted, weight: 700 });
      // ağız ve mikrofon: mesafe çizimi
      const mx = sag - 10, my = 14, uz = clamp(cm / 40, 0.02, 1) * Math.min(150, W * 0.28);
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(mx - uz - 12, my, 5, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(mx - uz - 6, my); ctx.lineTo(mx - 8, my); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(mx - 4, my, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(mx - 1, my - 1.5, 14, 3);
    }
    function yaz() {
      olc.innerHTML = "";
      const b = yakinlik(100, cm), s = seviye(cm);
      olc.append(
        olcum("+" + fmtNum(b, 1) + " dB", "100 Hz'de bas artışı"),
        olcum((s >= 0 ? "+" : "−") + fmtNum(Math.abs(s), 1) + " dB", "gürlük (10 cm'ye göre)"),
        olcum(sonDb == null ? "–" : fmtNum(sonDb) + " dB", "sizin gürlüğünüz (mikrofon)"));
      not.textContent = TARZ[tarz].ad + ": " + TARZ[tarz].soz + (cm < 3 ? " Mikrofon çok yakın: pesler kabarıyor, \"p\" ve \"b\" patlar." : cm > 25 ? " Mikrofon uzak: ses inceliyor ve odanın yankısı artıyor." : "");
    }
    function dinleModu() {
      if (dinleOff) dinleOff();
      calan && calan.stop(); calan = null;
      egri.katmanSil(); egri.hedefler([]); egri.mod("akis"); egri.temizle(); egri.basla();
      dinleOff = egri.dinle((k) => { if (k.sesli) { sonDb = k.db; } });
    }
    const yazDongu = L.loop(() => { if (dinleOff) { const t = performance.now(); if (t - (yazDongu.son || 0) > 250) { yazDongu.son = t; yaz(); } } });
    function cal() {
      Snd.unlock();
      if (!zincirKur()) return;
      if (dinleOff) { dinleOff(); dinleOff = null; }
      calan && calan.stop();
      const ns = popNotalar(tarz);
      Alistirma.onizleme(egri, ns, { katman: false });
      const c = Snd.ctx;
      const r = Ses.ezgi(c.sampleRate, ns, Object.assign({ tip: tip(), vibGen: 0, jitter: 0.002 }, TARZ[tarz].ses));
      const kareler = Pitch.izle(r.data, c.sampleRate);
      const t = c.currentTime + 0.08;
      const cb = Ses.calBuffer(r.data, { when: t, dest: zincir.giris });
      egri.basla(t + Ses.BAS);
      const oyn = egri.oynat(kareler, t, { bitince: () => { if (Mic.state === "on" && !dinleOff) setTimeout(() => Mic.state === "on" && dinleModu(), 600); } });
      calan = { stop() { cb && cb.stop(); oyn.stop(); } };
      Snd.own(calan);
      yaz();
    }
    window.addEventListener("themechange", ciz);
    window.addEventListener("aralikchange", ciz);
    yaz();
    return {
      enter() { egri.baslat(); Alistirma.onizleme(egri, popNotalar(tarz), { katman: true }); ciz(); yazDongu.start(); },
      leave() { calan && calan.stop(); calan = null; if (dinleOff) { dinleOff(); dinleOff = null; } egri.durdur(); yazDongu.stop(); },
    };
  };
  G.pop = [{ slide: "label:Mesafe", to: 0.02 }, { wait: 700 }, { click: "=Nefesli" }, { wait: 3500 }, { slide: "label:Mesafe", to: 0.6 }];

  /* ================= Makam perdeleri: akort aleti + dizi alıştırması ================= */
  const ANA = K.PERDELER.filter((p) => K.anaMi(p));
  // perde okuma: ondalıklı MIDI → Rast'tan koma, en yakın (ana) perde ve sapma
  function perdeOku(m, rast) {
    const k = ((m - rast) * 53) / 12;
    let best = null;
    for (const p of ANA) { const d = k - p.koma; if (!best || Math.abs(d) < Math.abs(best.d)) best = { p, d }; }
    if (!best || Math.abs(best.d) > 4.5) return { k, perde: null };
    return { k, perde: best.p, komaSapma: best.d, centSapma: best.d * K.KOMA_CENT };
  }
  function ahenkAdi(m) {
    for (const a of Object.values(K.AHENKLER)) {
      const fark = m - a.rast;
      if (fark % 12 !== 0) continue;
      const okt = fark / 12;
      return a.ad + (okt === 0 ? "" : `, ${Math.abs(okt) === 1 ? "bir" : Math.abs(okt)} oktav ${okt < 0 ? "pes" : "tiz"}`) + (a.dogrula ? ", doğrulanmalı" : "");
    }
    return null;
  }
  const ANA_MAKAM = ["rast", "ussak", "hicaz"];
  function makamKomalar(mk) {
    const yeden = K.perde(mk.yeden);
    return mk.dizi.concat(mk.cumle.map((x) => x[0]), yeden ? [yeden.koma] : []);
  }
  // dizi alıştırması: iki cümle (ilk beşli ve yedenle durağa dönüş; üst dörtlü)
  function diziCumleler(mk, rast, d = 0.85) {
    const z = mk.dizi, y = K.perde(mk.yeden);
    const not = (k, dd = d) => ({ m: rast + KM(k), d: dd, hece: perdeAd(k), u: "a" });
    const c1 = z.slice(0, 5).concat(z.slice(1, 4).reverse()).map((k) => not(k));
    if (y) c1.push(not(y.koma, d * 0.8));
    c1.push(not(z[0], d * 1.8));
    const c2 = z.slice(4).concat(z.slice(4, 7).reverse()).map((k, i, a) => not(k, i === a.length - 1 ? d * 1.6 : d));
    return [c1, c2];
  }
  const seyirCumle = (mk, rast) => mk.cumle.map(([k, v], i, a) => ({ m: rast + KM(k), d: v * 0.56 * (i === a.length - 1 ? 1.2 : 1), hece: perdeAd(k), u: "a" }));

  function Halka(kap) {
    const cv = h("canvas", { role: "img", "aria-label": "53 komalık halka: söylenen perde ve makamın perdeleri" });
    const el = h("div.mk-halka", cv);
    kap.append(el);
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; });
    function ciz({ makam: mk, okuma, iz }) {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W / 2 - 52, H / 2 - 26);
      const aci = (k) => -Math.PI / 2 + (2 * Math.PI * (((k % 53) + 53) % 53)) / 53;
      const P = (k, r) => [cx + Math.cos(aci(k)) * r, cy + Math.sin(aci(k)) * r];
      // 53 koma çentiği; doğallar uzun
      ctx.strokeStyle = C.porte; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const DOGAL = [0, 9, 18, 22, 31, 40, 44];
      for (let k = 0; k < 53; k++) {
        const uzun = DOGAL.includes(k);
        const [x1, y1] = P(k, R), [x2, y2] = P(k, R - (uzun ? 9 : 4));
        ctx.strokeStyle = uzun ? C.ink2 : rgba(C.grafit, 0.55); ctx.lineWidth = uzun ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      // makamın perdeleri: fosforlu noktalar ve adlar
      const durak = K.perde(mk.durak), guclu = K.perde(mk.guclu);
      const goruldu = new Set();
      mk.dizi.forEach((k) => {
        const kk = ((k % 53) + 53) % 53;
        if (goruldu.has(kk)) return;
        goruldu.add(kk);
        const [x, y] = P(k, R);
        const rol = durak && durak.koma % 53 === kk ? "durak" : guclu && guclu.koma % 53 === kk ? "guclu" : null;
        ctx.fillStyle = rgba(C.fosfor, 0.85);
        ctx.beginPath(); ctx.arc(x, y, rol ? 7 : 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = rol === "guclu" ? 2 : 1;
        ctx.stroke();
        if (rol === "durak") { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
        const [lx, ly] = P(k, R + 14);
        const cs = Math.cos(aci(k));
        text(ctx, perdeAd(k), lx, ly + 4, { size: 11, align: cs > 0.25 ? "left" : cs < -0.25 ? "right" : "center", color: rol ? C.ink : C.ink2, weight: rol ? 800 : 600 });
      });
      // son söylenenlerin izi
      if (iz && iz.length) iz.forEach((k, i) => {
        const [x, y] = P(k, R - 20);
        ctx.fillStyle = rgba(C.grafit, 0.12 + 0.5 * (i / iz.length));
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      });
      // okuma: ibre ve kalem ucu
      if (okuma && okuma.perde) {
        const renk = perdeRenk(okuma.centSapma);
        const [x, y] = P(okuma.k, R - 20);
        const [xa, ya] = P(okuma.k, R - 34);
        ctx.strokeStyle = rgba(C.ink, 0.45); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = renk; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fill();
        const buyuk = Math.max(15, Math.min(24, R * 0.22));
        text(ctx, okuma.perde.ad, cx, cy - 4, { size: okuma.perde.ad.length > 10 ? buyuk * 0.75 : buyuk, align: "center", color: C.ink, weight: 760, font: FONT.display });
        text(ctx, fmtKoma(okuma.komaSapma), cx, cy + 14, { size: 12, align: "center", color: renk, weight: 700, font: FONT.mono });
        text(ctx, fmtCents(okuma.centSapma), cx, cy + 28, { size: 11, align: "center", color: renk, weight: 700, font: FONT.mono });
        const bati = Math.round(okuma.m), bc = (okuma.m - bati) * 100;
        text(ctx, nn(bati) + " " + fmtCents(bc), cx, cy + 43, { size: 10, align: "center", color: C.muted, font: FONT.mono });
      } else {
        text(ctx, okuma && okuma.k != null ? "aralık dışı" : "söyleyin", cx, cy + 4, { size: 14, align: "center", color: C.muted, weight: 600 });
      }
    }
    return { el, ciz };
  }

  window.Demos.makamPerdeleri = (stage) => {
    let mod = "akort", mkId = "rast", rastSecim = L.store.get("makam.rast", null), deneme = null;
    let dinleOff = null;
    const mk = () => MAKAMLAR.find((m) => m.id === mkId);
    const rast = () => (rastSecim != null ? rastSecim : rastOner(makamKomalar(mk())));

    const modSeg = seg([["akort", "Akort aleti"], ["dizi", "Dizi"], ["seyir", "Seyir"]], mod, (k) => modDegis(k), "Mod");
    const mkSeg = seg(ANA_MAKAM.map((id) => [id, MAKAMLAR.find((m) => m.id === id).ad]), mkId, (k) => makamDegis(k), "Makam");
    const digerSel = h("select.mk-sec", { "aria-label": "Diğer makamlar", onchange: (e) => { if (e.target.value) makamDegis(e.target.value); } });
    const rastSel = h("select.mk-sec", { "aria-label": "Rast perdesi", onchange: (e) => { rastSecim = e.target.value === "oner" ? null : +e.target.value; L.store.set("makam.rast", rastSecim); yenile(); } });
    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const denemeBtn = ibtn("play", "Deneme sesi", () => denemeToggle(), "ghost");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri({ onAc: () => { if (mod === "akort") akortDinle(); } });
    const ustSayfa = h("div.sheet.mk-ust");
    const kart = h("div.mk-kart");
    const halka = Halka(ustSayfa);
    ustSayfa.append(kart);
    const sayfa = h("div.sheet.egri-kap");
    stage.append(
      h("div.controls", modSeg, mkSeg, digerSel),
      h("div.controls", basBtn, denemeBtn, h("label", h("span.ctl-lab", "Rast perdesi"), rastSel), h("span.spacer"), durum),
      ms.el, ustSayfa, sayfa);
    const egri = Egri(sayfa, { mod: "akis", pencere: 7, tol: 30 });
    const sonuc = h("div.sonuc");
    stage.append(sonuc);

    function seceneklerYaz() {
      digerSel.innerHTML = "";
      digerSel.append(h("option", { value: "" }, "Diğer makamlar…"));
      MAKAMLAR.filter((m) => !ANA_MAKAM.includes(m.id)).forEach((m) => digerSel.append(h("option", { value: m.id, selected: m.id === mkId ? "" : null }, m.ad)));
      const oner = rastOner(makamKomalar(mk()));
      rastSel.innerHTML = "";
      rastSel.append(h("option", { value: "oner", selected: rastSecim == null ? "" : null }, `Sesime göre: ${nn(oner)}`));
      for (let m = 43; m <= 69; m++) {
        const ah = ahenkAdi(m);
        rastSel.append(h("option", { value: m, selected: rastSecim === m ? "" : null }, nn(m) + (ah ? ` (${ah})` : "")));
      }
    }
    function kartYaz() {
      const m = mk(), r = rast();
      const dl = (a, b) => [h("dt", a), h("dd", b)];
      const ah = ahenkAdi(r);
      kart.innerHTML = "";
      kart.append(
        h("h4", m.ad, h("small", " makamı")),
        h("dl",
          dl("Durak", m.durak), dl("Güçlü", m.guclu), dl("Yeden", m.yeden), dl("Seyir", m.seyir),
          dl("Dizi", m.dizi.map(perdeAd).join(" – ")),
          dl("Aralıklar", h("span.mono", m.araliklar.join(" · ") + " koma")),
          dl("Cinsler", m.cinsler)),
        m.not ? h("p.mk-not", m.not) : null,
        h("p.mk-rast", "Rast perdeniz: ", h("b.mono", nn(r)), ah ? ` · ${ah} ahengi` : "", " · Durak ", h("b.mono", nn(Math.round(r + KM(K.perde(m.durak).koma))))));
    }
    // son okumalar (halka için): egrinin son noktalarından yumuşatılmış perde
    let iz = [];
    function okumaAl() {
      const ps = egri.noktalar;
      if (!ps.length) return null;
      const simdi = egri.simdi - egri.t0;
      const son = ps[ps.length - 1];
      if (simdi - son.t > 0.35) return null;
      const ms_ = [];
      for (let i = ps.length - 1; i >= 0 && ps[i].t > son.t - 0.12; i--) if (!isNaN(ps[i].m)) ms_.push(ps[i].m);
      if (ms_.length < 2) return null;
      ms_.sort((a, b) => a - b);
      const m = ms_[ms_.length >> 1];
      const o = perdeOku(m, rast());
      o.m = m;
      return o;
    }
    let sonOkuma = null, sonOkumaT = 0;
    const dongu = L.loop(() => {
      const o = okumaAl();
      const t = performance.now();
      if (o) { sonOkuma = o; sonOkumaT = t; if (o.perde) { iz.push(o.k); if (iz.length > 40) iz.shift(); } }
      else if (t - sonOkumaT > 900) { sonOkuma = null; if (iz.length) iz.shift(); }
      halka.ciz({ makam: mk(), okuma: sonOkuma, iz });
      // erişilebilirlik (ve sahte mikrofon testleri): okunan perde metin olarak
      const ok = sonOkuma && sonOkuma.perde ? `${sonOkuma.perde.ad} ${fmtKoma(sonOkuma.komaSapma, 2)} (${fmtCents(sonOkuma.centSapma, 1)})` : "";
      if (halka.el.dataset.okuma !== ok) { halka.el.dataset.okuma = ok; halka.el.firstChild.setAttribute("aria-label", "53 komalık halka" + (ok ? ": " + ok : "")); }
    });

    function akortDinle() {
      if (mod !== "akort" || Mic.state !== "on") return;
      denemeDur();
      if (dinleOff) dinleOff();
      egri.mod("akis"); egri.katmanSil(); egri.hedefler([]); egri.temizle(); egri.basla();
      dinleOff = egri.dinle();
    }
    // deneme sesi: Dügâh'tan Segâh, Bûselik, Kürdî ve geri; glide ile perdeler arasında gezinir
    const DENEME = [[9, 1.1], [17, 1.6], [18, 1.4], [13, 1.4], [17, 1.5], [9, 1.7]];
    function denemeToggle() {
      if (deneme) { denemeDur(); return; }
      Snd.unlock();
      if (dinleOff) { dinleOff(); dinleOff = null; }
      egri.mod("akis"); egri.katmanSil(); egri.hedefler([]);
      const r = rast();
      deneme = Alistirma.ornekSoyle(egri, DENEME.map(([k, d]) => ({ m: r + KM(k), d, u: "a", glide: 0.09 })), { sapma: 0, bitince: () => setTimeout(denemeDur, 300) });
      if (!deneme) return;
      denemeBtn.setLabel("Durdur"); denemeBtn.setIcon("stop");
    }
    function denemeDur() {
      if (deneme) { deneme.stop(); deneme = null; }
      denemeBtn.setLabel("Deneme sesi"); denemeBtn.setIcon("play");
    }

    const cumleler = () => (mod === "seyir" ? [seyirCumle(mk(), rast())] : diziCumleler(mk(), rast()));
    const al = Alistirma({
      egri, tur: "makam", tol: 30,
      cumleler,
      onBasla() { denemeDur(); if (dinleOff) { dinleOff(); dinleOff = null; } basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durum.textContent = ""; },
      onDurum(t) { durum.textContent = t; },
      onSonuc(s, i) {
        const y = Math.round(s.genel * 100);
        const ort = s.notalar.filter((n) => n.ort != null && n.kapsama > 0.2);
        const o = ort.length ? ort.reduce((a, n) => a + n.ort, 0) / ort.length : null;
        const en = ort.length ? ort.reduce((a, n) => (Math.abs(n.ort) > Math.abs(a.ort) ? n : a)) : null;
        sonuc.innerHTML = "";
        sonuc.append(h("div.olcumler",
          olcum(s.mikrofon ? "%" + y : "–", `${i + 1}. cümle: bantta`, y >= 70 && s.mikrofon ? "tam" : ""),
          olcum(o == null || !s.mikrofon ? "–" : fmtKoma(o / K.KOMA_CENT), "ortalama sapma", s.mikrofon ? sapmaCls(o) : ""),
          olcum(en && s.mikrofon ? en.hece : "–", en && s.mikrofon ? "en çok sapan: " + fmtCents(en.ort) : "en çok sapan perde", en && s.mikrofon ? sapmaCls(en.ort) : "")),
          h("p.note-msg", Alistirma.sonucSozu(s, 30)));
      },
    });

    function onizle() {
      if (mod === "akort" || al.calisiyor) return;
      Alistirma.onizleme(egri, cumleler()[0]);
    }
    function modDegis(k) {
      mod = k;
      al.durdur(); denemeDur();
      if (dinleOff) { dinleOff(); dinleOff = null; }
      sonuc.innerHTML = "";
      basBtn.hidden = mod === "akort";
      denemeBtn.hidden = mod !== "akort";
      if (mod === "akort") { egri.mod("akis"); egri.katmanSil(); egri.hedefler([]); egri.temizle(); egri.basla(); akortDinle(); }
      else onizle();
    }
    function makamDegis(id) {
      mkId = id;
      mkSeg.set(id);
      digerSel.value = ANA_MAKAM.includes(id) ? "" : id;
      al.durdur();
      yenile();
    }
    function yenile() { seceneklerYaz(); kartYaz(); onizle(); }
    window.addEventListener("aralikchange", () => { if (rastSecim == null) yenile(); });
    window.addEventListener("prefchange", (e) => e.detail.k === "notaAdi" && yenile());
    seceneklerYaz(); kartYaz();
    basBtn.hidden = true;
    return {
      enter() { egri.baslat(); dongu.start(); if (mod === "akort") { egri.temizle(); egri.basla(); akortDinle(); } else onizle(); },
      leave() { al.durdur(); denemeDur(); if (dinleOff) { dinleOff(); dinleOff = null; } egri.durdur(); dongu.stop(); },
      toggle() { if (mod === "akort") denemeToggle(); else al.toggle(); },
    };
  };
  G["makam-perdeleri"] = [{ click: "Deneme sesi" }, { wait: 4200 }, { click: "=Uşşak" }, { wait: 600 }, { click: "=Dizi" }, { wait: 900 }, { click: "=Hicaz" }];

  /* ================= Usulle söylemek ================= */
  // her usul için bu site için yazılmış kısa makam egzersizi: [koma, usul birimi]; toplam = usul döngüsünün katı
  const USUL_EGZ = {
    sofyan: { makam: "ussak", tempo: 72, notalar: [[9, 1], [17, 1], [22, 1], [31, 1], [22, 1], [17, 1], [9, 2]] },
    aksak: { makam: "hicaz", tempo: 200, notalar: [[9, 2], [14, 2], [26, 2], [31, 3], [26, 2], [14, 2], [9, 5]] },
    devrihindi: { makam: "rast", tempo: 190, notalar: [[0, 3], [9, 2], [17, 2], [22, 3], [17, 2], [9, 2], [0, 7]] },
    aksaksemai: { makam: "ussak", tempo: 200, notalar: [[31, 3], [22, 2], [17, 2], [22, 3], [17, 3], [9, 7]] },
  };
  const USUL_AD = { sofyan: "Sofyan 4/4", aksak: "Aksak 9/8", devrihindi: "Devr-i hindî 7/8", aksaksemai: "Aksak semâî 10/8" };

  window.Demos.usulSoyle = (stage) => {
    let uid = "sofyan", tempo = {}, metro = null, calisiyor = false, timers = [], raf = 0, offMic = null, ornek = null;
    Object.keys(USUL_EGZ).forEach((k) => (tempo[k] = USUL_EGZ[k].tempo));
    const u = () => usul(uid);
    const birim = () => 60 / tempo[uid];
    // strip (vuruş şeridi) durumu: eğriyle aynı zaman ekseni
    let vuruslar = [], seritSure = 6, seritImlec = null, tekDongu = false;

    const usulSeg = seg(Object.keys(USUL_EGZ).map((k) => [k, USUL_AD[k]]), uid, (k) => { dur(); metroDur(); uid = k; hizSl.set(tempo[uid]); hizAyar(); onizle(); }, "Usul");
    const hizSl = slider({ label: "Hız", min: 40, max: 320, step: 2, value: tempo[uid], fmt: (v) => `${u().payda === 4 ? "♩" : "♪"} = ${v}`, oninput: (v) => { tempo[uid] = v; if (metro && !calisiyor) metro.tempo = v; if (!calisiyor) onizle(); } });
    function hizAyar() { const dort = u().payda === 4; hizSl.input.min = dort ? 44 : 120; hizSl.input.max = dort ? 120 : 320; hizSl.set(tempo[uid]); }
    const basBtn = ibtn("play", "Başla", () => toggle(), "primary");
    const metroBtn = ibtn("play", "Usulü çal", () => (metro && !calisiyor ? metroDur() : metroCal()), "ghost us-metro");
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap.us-sayfa");
    stage.append(h("div.controls", usulSeg), h("div.controls", basBtn, metroBtn, hizSl, h("span.spacer"), durumEl), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 6, tol: 35 });
    const scv = h("canvas", { role: "img", "aria-label": "Usul vuruşları: düm ve tek, perde eğrisiyle aynı zaman çizgisinde" });
    const serit = h("div.us-serit", scv);
    sayfa.append(serit);
    const sonuc = h("div.sonuc");
    const bilgi = h("p.us-bilgi");
    stage.append(sonuc, bilgi, Egri.anahtar());
    let SW = 0, SH = 0;
    const SS = L.canvas(scv, (s) => { SW = s.w; SH = s.h; seritCiz(); });

    function egzNotalar() {
      const e = USUL_EGZ[uid], mk = MAKAMLAR.find((m) => m.id === e.makam);
      const r = rastOner(e.notalar.map((x) => x[0]));
      return { mk, notalar: e.notalar.map(([k, b]) => ({ m: r + KM(k), d: b * birim(), hece: perdeAd(k), u: "a" })) };
    }
    function vurusListesi(T, bas = 0) {
      const out = [], uu = u(), dongu = uu.uzunluk * birim();
      for (let n = 0; bas + n * dongu < T - 1e-6; n++) uu.olaylar.forEach(([p, ad]) => { const t = bas + n * dongu + p * birim(); if (t < T - 1e-6) out.push({ t, ad, dongu: p === 0 }); });
      return out;
    }
    function seritCiz() {
      if (!SW) return;
      const ctx = SS.ctx;
      ctx.clearRect(0, 0, SW, SH);
      const sol = 40, w = SW - sol - 10;
      const X = (t) => sol + (t / seritSure) * w;
      ctx.strokeStyle = rgba(C.porte, 0.8); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sol, SH / 2 + 0.5); ctx.lineTo(SW - 10, SH / 2 + 0.5); ctx.stroke();
      text(ctx, "usul", 4, 12, { size: 10, color: C.muted, weight: 700 });
      const genis = vuruslar.length > 1 ? (X(vuruslar[1].t) - X(vuruslar[0].t)) : 40;
      vuruslar.forEach((v) => {
        const x = X(v.t), dum = v.ad === "düm";
        const gecti = seritImlec != null && seritImlec >= v.t;
        const simdi = seritImlec != null && seritImlec >= v.t && seritImlec < v.t + 0.18;
        if (v.dongu) { ctx.strokeStyle = rgba(C.ink, 0.35); ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 3); ctx.lineTo(Math.round(x) + 0.5, SH - 3); ctx.stroke(); }
        const r = dum ? 7 : 4.5;
        ctx.beginPath(); ctx.arc(x, SH / 2, simdi ? r + 2.5 : r, 0, Math.PI * 2);
        if (dum) { ctx.fillStyle = gecti ? C.ink : rgba(C.ink, 0.55); ctx.fill(); }
        else { ctx.fillStyle = C.kagit; ctx.fill(); ctx.strokeStyle = gecti ? C.ink : rgba(C.ink, 0.55); ctx.lineWidth = 1.6; ctx.stroke(); }
        if (genis > 22 || v.dongu || dum) text(ctx, v.ad, x, dum ? SH - 3 : 12, { size: 10, align: "center", color: dum ? C.ink : C.ink2, weight: dum ? 800 : 600 });
      });
      if (seritImlec != null) {
        const xi = Math.round(X(seritImlec)) + 0.5;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xi, 2); ctx.lineTo(xi, SH - 2); ctx.stroke();
      }
    }
    function bilgiYaz() {
      const uu = u(), e = egzNotalar();
      bilgi.textContent = `${uu.ad} (${uu.olcu}): ${uu.gruplar.join("+")} gruplanır. Egzersiz: ${e.mk.ad} makamında, ${e.notalar.map((n) => n.hece).join(" – ")}.` + (uu.not ? " " + uu.not : "");
    }
    function onizle() {
      if (calisiyor) return;
      const e = egzNotalar();
      Alistirma.onizleme(egri, e.notalar);
      const P = e.notalar.reduce((a, n) => a + n.d, 0);
      seritSure = P + 0.4; vuruslar = vurusListesi(P); seritImlec = null; tekDongu = false;
      seritCiz(); bilgiYaz();
    }
    const dongu = L.loop(() => {
      if (calisiyor && Snd.running()) { seritImlec = Snd.ctx.currentTime - egri.t0; }
      else if (metro && metro.on) {
        const a = metro.adim();
        seritImlec = a < 0 ? null : a * birim() + 0.001;
      }
      seritCiz();
    });

    function metroCal() {
      if (calisiyor) return;
      Snd.unlock();
      metro = Usul.cal(u(), { tempo: tempo[uid] });
      if (!metro.start()) { metro = null; return; }
      const d = u().uzunluk * birim();
      seritSure = d; vuruslar = vurusListesi(d); tekDongu = true;
      metroBtn.setLabel("Durdur"); metroBtn.setIcon("stop");
    }
    function metroDur() {
      if (metro) { metro.stop(); metro = null; }
      metroBtn.setLabel("Usulü çal"); metroBtn.setIcon("play");
      if (tekDongu) onizle();
    }

    const bekle = (ms) => new Promise((res) => { const id = setTimeout(res, ms); timers.push(id); });
    async function baslat() {
      if (calisiyor) return;
      metroDur();
      Snd.unlock();
      calisiyor = true;
      basBtn.setLabel("Durdur"); basBtn.setIcon("stop");
      sonuc.innerHTML = "";
      let mic = Mic.state === "on";
      if (!mic) mic = await Mic.start();
      if (!calisiyor) return;
      const c = Snd.ready(); if (!c) { dur(); return; }
      const e = egzNotalar(), ns = e.notalar;
      const P = ns.reduce((a, n) => a + n.d, 0), dng = u().uzunluk * birim();
      const birlikte = prefs.kulaklik;
      const tDinle = dng, tSoyle = birlikte ? dng : dng + P, T = tSoyle + P;
      let t0 = null;
      metro = Usul.cal(u(), { tempo: tempo[uid], onAdim: (a, o, t) => { if (t0 == null) t0 = t; } });
      metro.start();
      if (t0 == null) t0 = c.currentTime + 0.06;
      egri.mod("sabit"); egri.sure(T + 0.3); egri.temizle(); egri.katmanSil(); egri.basla(t0);
      const hd = (bas, aktif) => { let t = bas; return ns.map((n) => { const x = { t0: t, t1: t + n.d, m: n.m, hece: n.hece, aktif }; t += n.d; return x; }); };
      const hs = hd(tSoyle, true);
      egri.hedefler(birlikte ? hs : hd(tDinle, false).concat(hs));
      seritSure = T + 0.3; vuruslar = vurusListesi(T + 0.01); tekDongu = false;
      const imlec = () => { egri.imlec(c.currentTime - t0); raf = requestAnimationFrame(imlec); };
      imlec();
      durumEl.textContent = "Bir dönüş usul…";
      Snd.referans(ns, { when: t0 + (birlikte ? tSoyle : tDinle), gain: birlikte ? 0.55 : 1 });
      await bekle((t0 + tDinle - c.currentTime) * 1000);
      if (!calisiyor) return;
      if (!birlikte) {
        durumEl.textContent = "Dinleyin…";
        await bekle((t0 + tSoyle - c.currentTime - 0.15) * 1000);
        if (!calisiyor) return;
        // kulaklık yoksa vuruşlar mikrofona daha az karışsın
        if (metro) metro.ses = 0.5;
      }
      durumEl.textContent = mic ? "Şimdi siz söyleyin" : "Mikrofon kapalı: örnek ses söylüyor";
      egri.durum(mic ? "Şimdi siz" : "Örnek ses", { buyuk: true });
      timers.push(setTimeout(() => egri.durum(null), 900));
      if (mic) offMic = egri.dinle();
      else ornek = Alistirma.ornekSoyle(egri, ns, { when: t0 + tSoyle - Ses.BAS, egriBasla: false, sapma: (n, i) => [-16, 8, 20, -6, 0, 12, -10][i % 7] });
      await bekle((t0 + T - c.currentTime + 0.3) * 1000);
      if (!calisiyor) return;
      const kareler = egri.noktalar.map((p) => ({ t: p.t, sesli: !isNaN(p.m), midi: p.m }));
      const s = Alistirma.puanla(kareler, hs, 35);
      s.mikrofon = mic;
      if (mic && s.soylendi) Alistirma.dogrulukKaydet("usul", s.genel);
      const y = Math.round(s.genel * 100);
      const ort = s.notalar.filter((n) => n.ort != null);
      const o = ort.length ? ort.reduce((a, n) => a + n.ort, 0) / ort.length : null;
      // zamanlama: her notanın ilk %40'ında ses var mı (geç girmek)
      const zamaninda = hs.filter((x) => kareler.some((k) => k.sesli && k.t >= x.t0 && k.t <= x.t0 + (x.t1 - x.t0) * 0.4)).length;
      sonuc.innerHTML = "";
      sonuc.append(h("div.olcumler",
        olcum(mic ? "%" + y : "–", "bantta", y >= 70 && mic ? "tam" : ""),
        olcum(o == null || !mic ? "–" : fmtCents(o), "ortalama sapma", mic ? sapmaCls(o) : ""),
        olcum(mic ? `${zamaninda}/${hs.length}` : "–", "zamanında giren nota", mic && zamaninda === hs.length ? "tam" : "")),
        h("p.note-msg", Alistirma.sonucSozu(s, 35)));
      dur();
    }
    function dur() {
      if (!calisiyor) return;
      calisiyor = false;
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(raf);
      if (offMic) { offMic(); offMic = null; }
      if (ornek) { ornek.stop(); ornek = null; }
      if (metro) { metro.stop(); metro = null; }
      Snd.stopAll();
      Mic.bekle("referans", false);
      egri.durum(null);
      durumEl.textContent = "";
      basBtn.setLabel("Başla"); basBtn.setIcon("play");
    }
    function toggle() { calisiyor ? dur() : baslat(); }
    window.addEventListener("aralikchange", onizle);
    window.addEventListener("themechange", seritCiz);
    hizAyar();
    return {
      enter() { egri.baslat(); dongu.start(); onizle(); },
      leave() { dur(); metroDur(); egri.durdur(); dongu.stop(); },
      toggle,
    };
  };
  G.usul = [{ click: "=Aksak 9/8" }, { wait: 500 }, { click: "Usulü çal" }, { wait: 3500 }, { click: "css:.us-metro" }];

  /* ================= Türkü ve uzun hava ================= */
  // Hüseynî'de serbest ritimli kısa bir cümle (bu site için yazıldı): [koma, sn, tür, ek]; "a" asıl perde, "s" süsleme
  const UZUN = [
    [31, 0.2, "s"], [40, 2.0, "a", { vib: { hiz: 5, gen: 35, gecikme: 0.9 } }],
    [44, 0.11, "s"], [40, 0.11, "s"], [44, 0.11, "s"], [40, 0.9, "a"],
    [31, 1.1, "a", { glide: 0.14 }],
    [22, 0.13, "s"], [31, 0.13, "s"], [22, 1.0, "a"],
    [17, 0.9, "a", { glide: 0.12 }],
    [22, 0.12, "s"], [17, 0.12, "s"], [22, 0.12, "s"], [17, 0.55, "a"],
    [0, 0.32, "a"], [9, 2.4, "a", { vib: { hiz: 4.8, gen: 30, gecikme: 1.0 } }],
  ];
  const HUSEYNI = [0, 9, 17, 22, 31, 40, 44, 48, 53, 62];
  function uzunHava() {
    const r = rastOner([0, 44]);
    const notalar = UZUN.map(([k, d, t, ek]) => Object.assign({ m: r + KM(k), d, u: "a", vib: false, glide: t === "s" ? 0.025 : 0.05 }, ek || {}));
    const ana = [];
    let t = 0;
    UZUN.forEach(([k, d, tur], i) => { if (tur === "a") ana.push({ t0: t, t1: t + d, m: notalar[i].m, hece: perdeAd(k) }); t += d; });
    return { r, notalar, ana, sure: t };
  }
  // serbest ritim ölçümü: sesli karelerin dizinin perdelerine (±35 sent) yakın olanlarının payı ve en çok kalınan perde
  function perdedeKalma(noktalar, r) {
    let ses = 0, yakin = 0;
    const say = new Map();
    for (const p of noktalar) {
      if (isNaN(p.m)) continue;
      ses++;
      const k = ((p.m - r) * 53) / 12;
      let best = null;
      for (const q of HUSEYNI) for (const o of [-53, 0, 53]) { const d = Math.abs(k - (q + o)); if (!best || d < best.d) best = { d, q: q + o }; }
      if (best.d * K.KOMA_CENT <= 35) { yakin++; say.set(best.q, (say.get(best.q) || 0) + 1); }
    }
    let en = null;
    say.forEach((v, q) => { if (!en || v > en.v) en = { q, v }; });
    return { oran: ses ? yakin / ses : 0, ses, en: en ? perdeAd(en.q) : null };
  }

  window.Demos.uzunHava = (stage) => {
    let calisiyor = false, timers = [], raf = 0, offMic = null, calan = null;
    const dinleBtn = ibtn("play", "Dinle", () => dinle(), "ghost");
    const deneBtn = ibtn("play", "Siz deneyin", () => toggle(), "primary");
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", dinleBtn, deneBtn, h("span.spacer"), durumEl), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 10, tol: 35 });
    const sonuc = h("div.sonuc");
    const not = h("p.note-msg");
    stage.append(sonuc, not, Egri.anahtar());

    function hazirla(katman = true, uzat = 1) {
      const u = uzunHava();
      egri.mod("sabit"); egri.sure(u.sure * uzat + 0.4); egri.temizle(); egri.katmanSil(); egri.hedefler(u.ana); egri.imlec(null);
      if (katman) egri.katmanEkle(sessizIz(u.notalar, { vibGen: 0 }), { ad: "örnek" });
      egri.ciz();
      not.textContent = `Hüseynî makamı: güçlü Hüseynî (${nn(Math.round(u.r + KM(40)))}) ile başlar, çarpma ve gırtlakla süslenir, Nevâ ve Çârgâh'tan kayarak Segâh'a, yeden Rast'tan durak Dügâh'a (${nn(Math.round(u.r + KM(9)))}) iner. Fosforlu bantlar asıl perdeler.`;
      return u;
    }
    function dinle() {
      Snd.unlock();
      dur();
      calan && calan.stop();
      const u = hazirla(false);
      calan = Alistirma.ornekSoyle(egri, u.notalar, { sapma: 0, ses: { vibGen: 0, gurluk: 0.72 } });
      sonuc.innerHTML = "";
    }
    const bekle = (ms) => new Promise((res) => { const id = setTimeout(res, ms); timers.push(id); });
    async function baslat() {
      if (calisiyor) return;
      Snd.unlock();
      calan && calan.stop(); calan = null;
      calisiyor = true;
      deneBtn.setLabel("Durdur"); deneBtn.setIcon("stop");
      sonuc.innerHTML = "";
      let mic = Mic.state === "on";
      if (!mic) mic = await Mic.start();
      if (!calisiyor) return;
      const c = Snd.ready(); if (!c) { dur(); return; }
      const u = hazirla(true, 1.25);
      // başlangıç perdesini duyurmak için güçlü perde (Hüseynî)
      durumEl.textContent = "Başlangıç perdesi…";
      const ref = Snd.referans([{ m: u.ana[0].m, d: 1.2 }]);
      await bekle(((ref ? ref.t0 + ref.sure : c.currentTime) - c.currentTime + 0.35) * 1000);
      if (!calisiyor) return;
      const T = u.sure * 1.25;
      const t0 = c.currentTime + 0.1;
      egri.temizle(); egri.basla(t0);
      const imlec = () => { egri.imlec(c.currentTime - t0); raf = requestAnimationFrame(imlec); };
      imlec();
      durumEl.textContent = mic ? "Şimdi siz: kendi zamanınızla" : "Mikrofon kapalı: örnek ses söylüyor";
      egri.durum(mic ? "Şimdi siz" : "Örnek ses", { buyuk: true });
      timers.push(setTimeout(() => egri.durum(null), 900));
      if (mic) offMic = egri.dinle();
      else calan = Alistirma.ornekSoyle(egri, u.notalar.map((n) => Object.assign({}, n, { d: n.d * 1.08 })), { when: t0 - Ses.BAS + 0.4, egriBasla: false, sapma: (n, i) => [-14, 9, 4, -22, 12][i % 5], ses: { vibGen: 0, gurluk: 0.72 } });
      await bekle((t0 + T - c.currentTime + 0.2) * 1000);
      if (!calisiyor) return;
      const o = perdedeKalma(egri.noktalar, u.r);
      sonuc.innerHTML = "";
      sonuc.append(h("div.olcumler",
        olcum(o.ses > 20 ? "%" + Math.round(o.oran * 100) : "–", "dizinin perdelerinde (±35 sent)", o.oran >= 0.6 && mic ? "tam" : ""),
        olcum(o.en || "–", "en çok kaldığınız perde"),
        olcum(o.ses > 20 ? L.fmtSure(o.ses * 0.0107) : "–", "sesli süre")),
        h("p.note-msg", !mic ? "Mikrofon kapalıyken eğriyi örnek ses çizdi. Kendi sesinizi görmek için mikrofonu açın."
          : o.ses <= 20 ? "Sesinizi duyamadım. Mikrofona biraz yaklaşıp biraz daha gür söyleyin."
          : o.oran >= 0.6 ? "Sesiniz çoğunlukla Hüseynî dizisinin perdelerinde kaldı. Süslemeler arada kısa sapmalar yapar; bu doğal."
          : "Sesinizin bir kısmı perdelerin arasında kaldı. Önce asıl perdeleri süslemesiz, yavaşça söyleyin; süslemeleri sonra ekleyin."));
      dur();
    }
    function dur() {
      if (!calisiyor) return;
      calisiyor = false;
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(raf);
      if (offMic) { offMic(); offMic = null; }
      calan && calan.stop(); calan = null;
      Snd.stopAll();
      Mic.bekle("referans", false);
      egri.durum(null);
      durumEl.textContent = "";
      deneBtn.setLabel("Siz deneyin"); deneBtn.setIcon("play");
    }
    function toggle() { calisiyor ? dur() : baslat(); }
    window.addEventListener("aralikchange", () => !calisiyor && hazirla());
    return {
      enter() { egri.baslat(); if (!calisiyor) hazirla(); },
      leave() { dur(); calan && calan.stop(); calan = null; egri.durdur(); },
      toggle,
    };
  };
  G.turku = [{ click: "=Dinle" }];
})();
