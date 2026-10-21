/* 5. Ses aralığı ve ses türleri: deneyler */
(function () {
  const { h, seg, ibtn, btn, nn, C, prefs } = L;

  /* Uzun bir sesin perde dizisi: Pitch.izle ile aynı hesap, ama ana iş parçacığını kilitlememek için parça parça.
     İlk ~2,5 sn hemen çıkarılır; kalanı çalmadan çok daha hızlı arka arkaya. */
  function izleParca(data, sr, kareler, { ilk = 1.2 } = {}) {
    const win = Math.round(sr * 0.0427), hop = Math.round(sr * 0.0107), tk = Pitch.Takipci(), buf = new Float32Array(win);
    let i = 0, iptal = false;
    const adim = (son) => {
      for (; i + win <= data.length && i < son; i += hop) {
        buf.set(data.subarray(i, i + win));
        const r = Pitch.yinSes(buf, sr);
        kareler.push(tk.push({ t: (i + win / 2) / sr, freq: r.freq, clarity: r.clarity, rms: r.rms }));
      }
    };
    adim(ilk * sr);
    const dongu = () => { if (iptal || i + win > data.length) return; adim(i + sr * 1.5); setTimeout(dongu, 0); };
    setTimeout(dongu, 0);
    return { stop() { iptal = true; } };
  }
  const tipOf = () => (prefs.sesBolge === "pes" ? "erkek" : "kadin");
  const yarimSes = (n) => `${n} yarım ses` + (n >= 12 ? ` · ${Math.floor(n / 12)} oktav${n % 12 ? " + " + (n % 12) : ""}` : "");
  const ikiNota = (lo, hi) => (lo === hi ? nn(lo) : `${nn(lo)}–${nn(hi)}`);
  const kaynakAd = (a) => (a.kaynak === "olcum" ? "ölçülen" : a.kaynak === "elle" ? "işaretlediğiniz" : "tahmini");

  /* ---------- Ses aralığı ölçer ---------- */
  window.Demos.sesAraligi = (stage) => {
    let mod = "siren", olcuyor = false, off = null, ornek = null, ornekMi = false, gamNota = null, raf = 0, sonCiz = 0;
    const olcer = Analiz.AralikOlcer({ minSure: 0.4 });
    const basBtn = ibtn("mic", "Ölçmeye başla", () => (olcuyor ? durdur() : basla()), "primary");
    const ornekBtn = ibtn("play", "Örnek siren", () => ornekCal(), "ghost");
    const modSeg = seg([["siren", "Siren"], ["gam", "Gam"]], mod, (k) => { mod = k; ornekBtn.hidden = k !== "siren"; gamSatir.hidden = k !== "gam"; if (k === "gam" && olcuyor) gamAdim(0); yonerge(); }, "Yöntem");
    const gamOku = h("span.readout");
    const gamSatir = h("div.controls.gam-satir", btn("▼ Bir alt nota", () => gamAdim(-2), "sm"), btn("▲ Bir üst nota", () => gamAdim(2), "sm"), btn("Notayı tekrar çal", () => gamAdim(0), "sm ghost"), gamOku);
    gamSatir.hidden = true;
    const kaydetBtn = btn("Kaydet", () => kaydet(), "primary");
    const sifirBtn = btn("Sıfırla", () => sifirla(), "ghost");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri({ onAc: () => { if (!olcuyor) basla(); }, onKapa: () => { if (olcuyor) durdur(); } });
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", basBtn, modSeg, ornekBtn, h("span.spacer"), durum), gamSatir, ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "akis", pencere: 8 });
    const olc = h("div.olcumler");
    const serit = Aralik.Serit({ duzenle: true, isaret: () => isaretler() });
    const bolgeSeg = seg([["pes", "Sesim daha pes"], ["tiz", "Sesim daha tiz"]], prefs.sesBolge, (k) => L.setPref("sesBolge", k), "Ses bölgesi");
    const yon = h("p.note-msg.aralik-yonerge");
    stage.append(h("div.aralik-sonuc", olc, h("span.spacer"), sifirBtn, kaydetBtn), serit.el,
      h("div.controls.aralik-alt", h("span.ctl-lab", "Mikrofonsuz:"), bolgeSeg, h("span.kaynak", "ya da klavyede tıklayın")), yon);

    function isaretler() {
      const out = [];
      if (olcer.lo != null) out.push({ m: olcer.lo, renk: C.pes });
      if (olcer.hi != null && olcer.hi !== olcer.lo) out.push({ m: olcer.hi, renk: C.tiz });
      return out;
    }
    // bulunan uçlar perde eğrisinde yatay çizgi (akan zamanla birlikte yenilenen katman)
    function cizgiler() {
      const now = egri.simdi - egri.t0;
      egri.katmanSil();
      const yap = (m) => { const ps = []; for (let t = now - 9; t <= now + 0.6; t += 0.06) ps.push({ t, m, g: 0.12 }); return ps; };
      if (olcer.lo != null) egri.katmanEkle(yap(olcer.lo), { renk: C.pes, ad: "en pes" });
      if (olcer.hi != null && olcer.hi !== olcer.lo) egri.katmanEkle(yap(olcer.hi), { renk: C.tiz, ad: "en tiz" });
    }
    const dongu = () => {
      const t = performance.now();
      if (t - sonCiz > 120) { sonCiz = t; cizgiler(); }
      raf = requestAnimationFrame(dongu);
    };
    function guncelle() {
      const lo = olcer.lo, hi = olcer.hi, a = Aralik.get();
      olc.innerHTML = "";
      olc.append(
        h("div.olcum" + (lo != null ? ".pes" : ""), h("b", lo != null ? nn(lo) : "–"), h("small", "en pes" + (ornekMi ? " (örnek)" : ""))),
        h("div.olcum" + (hi != null ? ".tiz" : ""), h("b", hi != null ? nn(hi) : "–"), h("small", "en tiz" + (ornekMi ? " (örnek)" : ""))),
        h("div.olcum", h("b", lo != null && hi != null && hi > lo ? String(hi - lo) : "–"), h("small", lo != null && hi > lo ? yarimSes(hi - lo).replace(/^\d+ /, "") : "genişlik (yarım ses)")),
        h("div.olcum.kayitli", h("b", `${nn(a.lo)}–${nn(a.hi)}`), h("small", kaynakAd(a) + " aralığınız")));
      kaydetBtn.disabled = ornekMi || lo == null || hi == null || hi - lo < 4;
      sifirBtn.disabled = lo == null;
      serit.ciz();
    }
    function yonerge() {
      if (ornekMi && !olcuyor) { yon.textContent = "Örnek ses aralığın iki ucunda birer an duruyor; ölçer yalnızca bu duraklamaları sayar, kayarken geçilen notaları saymaz. Kendi aralığınız için \"Ölçmeye başla\"."; return; }
      if (mod === "siren") yon.textContent = olcuyor
        ? "\"u\" ile rahat bir notadan yavaşça yukarı kayın; en tiz rahat yerde yarım saniye durun. Sonra aşağı inip en pes rahat yerde durun. Zorlanmaya başladığınız yerde dönün."
        : "Siren: \"u\" ile yavaşça çıkıp inin, iki uçta birer an durun. Ölçer yalnızca kararlı tuttuğunuz notaları sayar.";
      else yon.textContent = olcuyor
        ? "Çalınan notayı \"aaa\" diye söyleyip bir an tutun. Rahatsa \"Bir üst nota\" ya da \"Bir alt nota\". Zorlanmaya başladığınız yerde o yönde durun."
        : "Gam: site bir nota çalar, aynısını söylersiniz; tam ses tam ses yukarı ve aşağı ilerlersiniz. Mikrofonsuz da notaları çalıp klavyede işaretleyebilirsiniz.";
    }
    async function basla() {
      Snd.unlock();
      ornek && ornek.stop();
      const ok = Mic.state === "on" || (await Mic.start());
      if (!ok) { yon.textContent = "Mikrofon açılamadı. Aralığınızı klavyede tıklayarak işaretleyebilir ya da \"Sesim daha pes / daha tiz\" seçebilirsiniz."; return; }
      if (ornekMi) { olcer.reset(); ornekMi = false; }
      olcuyor = true;
      egri.mod("akis"); egri.aralik(null); egri.hedefler([]); egri.basla();
      off = egri.dinle((k) => { const r = olcer.push(k); if (r && r.yeni) guncelle(); });
      basBtn.setLabel("Durdur"); basBtn.setIcon("stop");
      durum.textContent = "Ölçülüyor";
      if (mod === "gam") gamAdim(0);
      yonerge(); guncelle();
    }
    function durdur() {
      if (!olcuyor) return;
      olcuyor = false;
      off && off(); off = null;
      Snd.stopAll();
      egri.hedefler([]);
      basBtn.setLabel("Ölçmeye başla"); basBtn.setIcon("mic");
      durum.textContent = "";
      yonerge(); guncelle();
    }
    function gamAdim(d) {
      Snd.unlock();
      const a = Aralik.get();
      gamNota = gamNota == null ? Math.round((a.lo + a.hi) / 2) : Math.max(36, Math.min(86, gamNota + d));
      const r = Snd.referans(gamNota, { dur: 1.2 });
      gamOku.innerHTML = "";
      gamOku.append("Nota: ", h("b", nn(gamNota)));
      if (olcuyor && r) {
        const t0 = r.t0 - egri.t0;
        egri.hedefler([{ t0, t1: t0 + 1.2, m: gamNota, hece: nn(gamNota), aktif: false }, { t0: t0 + 1.3, t1: t0 + 4.5, m: gamNota, hece: "siz" }]);
      }
    }
    function ornekCal() {
      Snd.unlock();
      const c = Snd.ready();
      if (!c) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      durdur();
      ornek && ornek.stop();
      const a = Aralik.get(), lo = a.lo + 1, hi = a.hi - 1, adim = 0.5;
      const ns = [{ m: lo, d: 0.9, u: "u" }];
      for (let m = lo + adim; m < hi; m += adim) ns.push({ f: N.mtof(m), d: 0.07, u: "u", glide: 0.05 });
      ns.push({ m: hi, d: 0.9, u: "u" });
      for (let m = hi - adim; m > lo; m -= adim) ns.push({ f: N.mtof(m), d: 0.07, u: "u", glide: 0.05 });
      ns.push({ m: lo, d: 0.7, u: "u" }, { r: 0.3 });
      const r = Ses.ezgi(c.sampleRate, ns, { tip: tipOf(), gurluk: 0.6, vibGen: 0, jitter: 0.002 });
      const kareler = [];
      const iz = izleParca(r.data, c.sampleRate, kareler);
      olcer.reset(); ornekMi = true;
      egri.mod("akis"); egri.aralik(null); egri.hedefler([]);
      const t = c.currentTime + 0.15;
      const cal = Ses.calBuffer(r.data, { when: t });
      egri.basla(t);
      const oyn = egri.oynat(kareler, t);
      let i = 0, rf = 0;
      const besle = () => {
        while (i < kareler.length && t + kareler[i].t <= c.currentTime) { const q = olcer.push(kareler[i++]); if (q && q.yeni) guncelle(); }
        if (t + r.sure > c.currentTime) rf = requestAnimationFrame(besle);
        else { ornek = null; durum.textContent = ""; guncelle(); }
      };
      besle();
      ornek = { stop() { cal && cal.stop(); oyn.stop(); iz.stop(); cancelAnimationFrame(rf); ornek = null; durum.textContent = ""; } };
      Snd.own(ornek);
      durum.textContent = "Örnek ses";
      yonerge(); guncelle();
    }
    function kaydet() {
      if (olcer.lo == null || olcer.hi == null || olcer.hi - olcer.lo < 4) return;
      Aralik.set(olcer.lo, olcer.hi, "olcum");
      L.toast(`Aralığınız kaydedildi: ${nn(olcer.lo)}–${nn(olcer.hi)}`);
      yon.textContent = `Kaydedildi. Alıştırmalar artık ${nn(olcer.lo)}–${nn(olcer.hi)} aralığına göre perdelenecek. Başka bir gün yeniden ölçüp karşılaştırabilirsiniz.`;
      guncelle();
    }
    function sifirla() { olcer.reset(); ornekMi = false; egri.katmanSil(); guncelle(); yonerge(); }
    window.addEventListener("aralikchange", guncelle);
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") bolgeSeg.set(e.detail.v); });
    guncelle(); yonerge();
    return {
      enter() { egri.baslat(); cancelAnimationFrame(raf); raf = requestAnimationFrame(dongu); guncelle(); },
      leave() { durdur(); ornek && ornek.stop(); cancelAnimationFrame(raf); egri.durdur(); },
      toggle() { olcuyor ? durdur() : basla(); },
    };
  };
  window.GuideScenarios["ses-araligi"] = [{ click: "=Gam" }, { wait: 900 }, { click: "=Siren" }];

  /* ---------- Ses türleri ---------- */
  const KADIN = ["soprano", "mezzo", "alto"];
  const KARANLIK = { soprano: -0.2, mezzo: 0.1, alto: 0.3, kontrtenor: 0, tenor: -0.1, bariton: 0.2, bas: 0.45 };
  window.Demos.sesTurleri = (stage) => {
    const KLO = 36, KHI = 86;
    const sayfa = h("div.sheet.turler-sayfa");
    const cv = h("canvas", { role: "img", "aria-label": "Ses türlerinin tipik aralıkları ve sizin aralığınız, piyano klavyesi üzerinde" });
    sayfa.append(cv);
    const dugmeler = Aralik.TURLER.map((t) => [t.id, btn(t.ad, () => dinle(t), "sm ghost")]);
    const metin = h("div.ortusme");
    stage.append(h("div.tur-dugmeler", h("span.ctl-lab", "Dinle:"), dugmeler.map((x) => x[1])), sayfa, metin);
    let W = 0, H = 0, satir = [], calan = null, basili = null, raf = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });

    function ciz() {
      if (!W) return;
      const ctx = S.ctx, a = Aralik.get();
      ctx.clearRect(0, 0, W, H);
      const kbH = Math.min(84, Math.max(56, H * 0.26)), kbY = H - kbH, ust = 26;
      const rowH = Math.min(40, (kbY - ust - 6) / Aralik.TURLER.length);
      const pos = L.piyano(ctx, 0, kbY, W, kbH, { lo: KLO, hi: KHI, serit: [a.lo, a.hi], basili });
      const xa = (m) => { const p = pos.get(m) || pos.get(m + 1); return p ? p.x : 0; };
      const xb = (m) => { const p = pos.get(m) || pos.get(m - 1); return p ? p.x + p.w : W; };
      // ziyaretçinin aralığı: kesik çizgiler
      const sa = xa(a.lo), sb = xb(a.hi);
      ctx.fillStyle = L.rgba(C.fosfor, 0.12); ctx.fillRect(sa, ust - 4, sb - sa, kbY - ust + 4);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
      [sa, sb].forEach((x) => { ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, ust - 4); ctx.lineTo(Math.round(x) + 0.5, kbY); ctx.stroke(); });
      ctx.setLineDash([]);
      const et = `${kaynakAd(a)} aralığınız: ${nn(a.lo)}–${nn(a.hi)}`;
      L.text(ctx, et, Math.min(Math.max((sa + sb) / 2, 110), W - 110), 15, { size: 12, color: C.ink, align: "center", weight: 700 });
      satir = [];
      Aralik.TURLER.forEach((t, i) => {
        const y = ust + i * rowH, x0 = xa(t.lo), x1 = xb(t.hi);
        satir.push({ t, y0: y, y1: y + rowH });
        const ac = calan === t.id;
        ctx.fillStyle = L.rgba(C.porte, ac ? 0.85 : 0.45);
        ctx.fillRect(x0, y + 3, x1 - x0, rowH - 6);
        // örtüşen kısım: fosforlu kalem
        const o0 = Math.max(t.lo, a.lo), o1 = Math.min(t.hi, a.hi);
        if (o1 > o0) {
          const p0 = xa(o0), p1 = xb(o1);
          ctx.fillStyle = L.rgba(C.fosfor, 0.8);
          ctx.beginPath(); ctx.moveTo(p0 + 1, y + 5); ctx.lineTo(p1, y + 4); ctx.lineTo(p1 - 2, y + rowH - 5); ctx.lineTo(p0, y + rowH - 4); ctx.closePath(); ctx.fill();
        }
        if (ac) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, y + 3, x1 - x0 - 2, rowH - 6); }
        // fosforlu kısmın üstünde koyu mürekkep (iki temada da okunur), dışında temanın mürekkebi
        const fs = rowH < 22 ? 11 : 12, ortBas = o1 > o0 && t.lo >= a.lo, ortSon = o1 > o0 && t.hi <= a.hi;
        L.text(ctx, t.ad, x0 + 6, y + rowH / 2 + 4, { size: fs, color: ortBas ? "#1c2340" : C.ink, weight: 700 });
        if (x1 - x0 > 170) L.text(ctx, `${nn(t.lo)}–${nn(t.hi)}`, x1 - 6, y + rowH / 2 + 4, { size: 10.5, color: ortSon ? "#3a4262" : C.ink2, align: "right", weight: 700, font: L.FONT.mono });
      });
    }
    cv.addEventListener("click", (e) => {
      const r = cv.getBoundingClientRect(), y = e.clientY - r.top;
      const s = satir.find((x) => y >= x.y0 && y < x.y1);
      if (s) dinle(s.t);
    });
    cv.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect(), y = e.clientY - r.top;
      cv.style.cursor = satir.some((x) => y >= x.y0 && y < x.y1) ? "pointer" : "";
    });
    function dinle(t) {
      Snd.unlock();
      const c = Snd.ready();
      if (!c) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      Snd.stopAll(); cancelAnimationFrame(raf);
      const bas = Math.round((t.lo + t.hi) / 2) - 4;
      const rel = [0, 2, 4, 5, 7, 5, 4, 2, 0];
      const ns = rel.map((n, i) => ({ m: bas + n, d: i === rel.length - 1 ? 1.0 : 0.34, u: "a" }));
      const r = Ses.soyle(ns, { tip: KADIN.includes(t.id) ? "kadin" : "erkek", gurluk: 0.65, vibGen: 36, vibHiz: 5.6, vibGecikme: 0.12,
        sf: t.id === "kontrtenor" ? 0.3 : 0.55, oq: t.id === "kontrtenor" ? 0.78 : 0.55, karanlik: KARANLIK[t.id] || 0 });
      if (!r) return;
      calan = t.id;
      dugmeler.forEach(([id, b]) => b.classList.toggle("on", id === t.id));
      const izle = () => {
        const tt = Snd.ctx.currentTime - r.t0 - Ses.BAS;
        let acc = 0, cur = null;
        for (const n of ns) { if (tt >= acc && tt < acc + n.d) cur = n.m; acc += n.d; }
        basili = cur != null ? new Set([cur]) : null;
        ciz();
        if (tt < acc + 0.1) raf = requestAnimationFrame(izle);
        else { calan = null; basili = null; dugmeler.forEach(([, b]) => b.classList.remove("on")); ciz(); }
      };
      izle();
    }
    function metinYaz() {
      const a = Aralik.get(), o = Aralik.ortusme(a);
      const ust = o.filter((x) => x.oran >= 0.5).slice(0, 3);
      metin.innerHTML = "";
      const p1 = h("p");
      p1.append(`${kaynakAd(a)[0].toLocaleUpperCase("tr") + kaynakAd(a).slice(1)} aralığınız `, h("b.mono", `${nn(a.lo)}–${nn(a.hi)}`), `, ${yarimSes(a.hi - a.lo)}. `);
      if (ust.length) p1.append("Aralığınız en çok şu türlerin tipik aralığıyla örtüşüyor: ", ...ust.map((x, i) => [i ? ", " : "", h("b", x.ad), ` (%${Math.round(x.oran * 100)})`]).flat(), ".");
      else p1.append(`Aralığınız henüz hiçbir türün tipik aralığının yarısını kapsamıyor; bu normaldir, rahat aralık çalıştıkça genişler. En çok örtüşen: `, h("b", o[0].ad), ` (%${Math.round(o[0].oran * 100)}).`);
      metin.append(p1, h("p.kaynak", "Yüzde, türün tipik aralığının ne kadarının sizin aralığınıza düştüğünü gösterir. Bu bir sınıflandırma değildir: ses türü renk, tessitura ve geçiş noktalarıyla birlikte, en iyisi bir eğitmenle belirlenir."));
      if (a.kaynak === "varsayilan") metin.append(h("p.kaynak", h("a", { href: "#ses-araligi" }, "Aralığınızı ölçün →"), " (şimdilik \"daha pes / daha tiz\" seçiminize göre tahmini bir aralık kullanılıyor)"));
    }
    metinYaz();
    window.addEventListener("aralikchange", () => { metinYaz(); ciz(); });
    window.addEventListener("prefchange", () => { metinYaz(); ciz(); });
    window.addEventListener("themechange", ciz);
    return { enter() { metinYaz(); ciz(); }, leave() { cancelAnimationFrame(raf); Snd.stopAll(); calan = null; basili = null; dugmeler.forEach(([, b]) => b.classList.remove("on")); } };
  };
  window.GuideScenarios["ses-turleri"] = [{ click: "=Tenor" }, { wait: 2600 }, { click: "=Soprano" }];

  /* ---------- Tessitura ---------- */
  const TES_EZGI = [["nese", "Neşeye Övgü"], ["frere", "Frère Jacques"], ["yildiz", "Ah! vous dirai-je"], ["sabah", "Sabah olur"]];
  window.Demos.tessitura = (stage) => {
    const SURE = 25;
    let kaynak = "ses", ezgiId = "nese", ton = "sizin";
    let olcuyor = false, off = null, kareler = [], bitisT = 0, timer = 0, ornek = null, hist = new Map(), tes = null;
    const basBtn = ibtn("mic", "Söylemeye başla", () => (olcuyor ? bitir() : basla()), "primary");
    const kaynakSeg = seg([["ses", "Kendi sesim"], ["ornek", "Örnek ezgi"]], kaynak, (k) => { kaynak = k; durdurHepsi(); goster(); }, "Kaynak");
    const ezgiSeg = seg(TES_EZGI, ezgiId, (k) => { ezgiId = k; durdurHepsi(); ornekHesapla(); }, "Ezgi");
    const tonSeg = seg([["sizin", "Aralığınıza göre"], ["do4", "Do4'ten"]], ton, (k) => { ton = k; durdurHepsi(); ornekHesapla(); }, "Ton");
    const ornekBtn = ibtn("play", "Örneği dinle", () => ornekCal(), "ghost");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const ornekSatir = h("div.controls.tes-ornek", ezgiSeg, tonSeg, ornekBtn);
    const sayfa = h("div.sheet.egri-kap.tes-egri");
    const hSayfa = h("div.sheet.tes-hist");
    const cv = h("canvas", { role: "img", "aria-label": "Her notada geçirilen süre (histogram), rahat bölge ve ses aralığınız" });
    hSayfa.append(cv);
    const olc = h("div.olcumler");
    const mesaj = h("p.note-msg");
    stage.append(h("div.controls", kaynakSeg, basBtn, h("span.spacer"), durum), ornekSatir, ms.el, sayfa, hSayfa, olc, mesaj);
    const egri = Egri(sayfa, { mod: "akis", pencere: 8 });
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });

    const ornekNotalar = () => Ezgiler.notalar(ezgiId, ton === "do4" ? { bas: 60 } : {});
    function goster() {
      const o = kaynak === "ornek";
      ornekSatir.hidden = !o; ms.el.hidden = o; basBtn.hidden = o;
      if (o) ornekHesapla();
      else { hist = new Map(); tes = null; egri.mod("akis"); egri.hedefler([]); egri.temizle(); egri.katmanSil(); yaz(); ciz(); }
    }
    // örnek ezgi: notaların süresinden histogram (sentezsiz; eğride hedef bantlar)
    function ornekHesapla() {
      const ns = ornekNotalar();
      const pk = [];
      let t = 0;
      ns.forEach((n) => { for (let u = t + 0.02; u < t + n.d - 0.02; u += 0.01) pk.push({ t: u, sesli: true, midi: n.m }); t += n.d; });
      hist = Analiz.histogram(pk);
      tes = Analiz.tessitura(hist);
      const hd = []; let u = 0;
      ns.forEach((n) => { hd.push({ t0: u, t1: u + n.d, m: n.m, hece: n.hece }); u += n.d; });
      egri.mod("sabit"); egri.sure(u + 0.4); egri.temizle(); egri.katmanSil(); egri.hedefler(hd); egri.imlec(null);
      yaz(); ciz();
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx, a = Aralik.get();
      ctx.clearRect(0, 0, W, H);
      const ks = [...hist.keys()];
      let lo = Math.min(a.lo, ...(ks.length ? ks : [a.lo])) - 3, hi = Math.max(a.hi, ...(ks.length ? ks : [a.hi])) + 3;
      if (hi - lo < 26) { const m = (lo + hi) / 2; lo = Math.floor(m - 13); hi = Math.ceil(m + 13); }
      if (N.isBlack(lo)) lo--; if (N.isBlack(hi)) hi++;
      const kbH = Math.min(58, H * 0.34), kbY = H - kbH, ust = 22;
      const pos = L.piyano(ctx, 0, kbY, W, kbH, { lo, hi, serit: [a.lo, a.hi], seritRenk: C.porte });
      const xc = (m) => { const p = pos.get(m); return p ? p.x + p.w / 2 : null; };
      const xa = (m) => { const p = pos.get(m); return p ? p.x : 0; };
      const xb = (m) => { const p = pos.get(m); return p ? p.x + p.w : W; };
      // rahat bölge: fosforlu bant
      if (tes) {
        const x0 = xa(tes.lo), x1 = xb(tes.hi);
        ctx.fillStyle = L.rgba(C.fosfor, 0.5);
        ctx.beginPath(); ctx.moveTo(x0 + 2, ust); ctx.lineTo(x1, ust + 2); ctx.lineTo(x1 - 2, kbY - 2); ctx.lineTo(x0, kbY - 3); ctx.closePath(); ctx.fill();
        L.text(ctx, "rahat bölge " + ikiNota(tes.lo, tes.hi), Math.min(Math.max((x0 + x1) / 2, 90), W - 90), 14, { size: 12, color: C.ink, align: "center", weight: 700 });
      }
      // aralığın uçları
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
      [xa(a.lo), xb(a.hi)].forEach((x) => { ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, ust + 4); ctx.lineTo(Math.round(x) + 0.5, kbY); ctx.stroke(); });
      ctx.setLineDash([]);
      // uç etiketleri: çizginin dış yanında (sığmazsa iç yanında)
      const uc = (x, ad, dis) => {
        const w = ctx.measureText(ad).width + 8, sol = dis ? x - w >= 0 : x + w > W;
        L.text(ctx, ad, sol ? x - 4 : x + 4, ust + 14, { size: 11, color: C.ink2, align: sol ? "right" : "left", weight: 700 });
      };
      ctx.font = "700 11px " + L.FONT.body;
      uc(xa(a.lo), "en pes", true);
      uc(xb(a.hi), "en tiz", false);
      // sütunlar
      const mx = Math.max(0.001, ...hist.values());
      const bw = Math.max(3, Math.min(16, (pos.get(lo + (N.isBlack(lo + 1) ? 2 : 1)) || { w: 12 }).w * 0.55));
      for (const [m, s] of hist) {
        const x = xc(m); if (x == null) continue;
        const hh = (s / mx) * (kbY - ust - 26);
        const ic = tes && m >= tes.lo && m <= tes.hi;
        ctx.fillStyle = ic ? C.ink : L.rgba(C.grafit, 0.6);
        ctx.fillRect(x - bw / 2, kbY - 2 - hh, bw, hh);
      }
      if (!hist.size && kaynak === "ses") L.text(ctx, W < 520 ? "Söyledikçe her notadaki süreniz burada büyür" : "Söyledikçe her notada geçirdiğiniz süre burada sütun olarak büyür", W / 2, (ust + kbY) / 2, { size: W < 520 ? 12 : 13, color: C.muted, align: "center" });
      else L.text(ctx, "en uzun: " + L.fmtNum(mx, 1) + " sn", 8, 14, { size: 11, color: C.muted, weight: 700 });
    }
    function konumSoz(t, a) {
      if (t.hi > a.hi || t.lo < a.lo) return "aralığınızın dışına taşıyor";
      const r = ((t.lo + t.hi) / 2 - a.lo) / (a.hi - a.lo || 1);
      return r < 0.36 ? "aralığınızın alt kısmında" : r > 0.64 ? "aralığınızın üst kısmında" : "aralığınızın ortasında";
    }
    function yaz() {
      const a = Aralik.get();
      const top = [...hist.values()].reduce((x, y) => x + y, 0);
      olc.innerHTML = "";
      olc.append(h("div.olcum" + (tes ? ".tam" : ""), h("b", tes ? ikiNota(tes.lo, tes.hi) : "–"), h("small", "rahat bölge (sürenin %70'i)")),
        h("div.olcum", h("b", top ? L.fmtNum(top, 1) + " sn" : "–"), h("small", "perdeli ses")),
        h("div.olcum", h("b", `${nn(a.lo)}–${nn(a.hi)}`), h("small", kaynakAd(a) + " aralığınız")));
      if (kaynak === "ornek" && tes) {
        const e = Ezgiler.bul(ezgiId), ms2 = [...hist.keys()];
        const lo = Math.min(...ms2), hi = Math.max(...ms2);
        let s = `${e.ad}: notaların çoğu ${ikiNota(tes.lo, tes.hi)} bölgesinde; bu bölge ${konumSoz(tes, a)}.`;
        if (hi > a.hi) s += ` En tiz notası (${nn(hi)}) aralığınızın üstünde: bu tonda zorlanabilirsiniz.`;
        else if (lo < a.lo) s += ` En pes notası (${nn(lo)}) aralığınızın altında: bu tonda pes kalabilir.`;
        else if (ton === "do4") s += " Bu ton aralığınıza sığıyor.";
        mesaj.textContent = s;
      } else if (kaynak === "ornek") mesaj.textContent = "";
      else if (olcuyor) mesaj.textContent = "Rahatça söyleyin: bildiğiniz bir şarkı, bir ezgi ya da mırıldanma. Zorlamayın; amaç rahat bölgenizi bulmak.";
      else if (tes && top >= 5) mesaj.textContent = `Rahat bölgeniz yaklaşık ${ikiNota(tes.lo, tes.hi)}; ${konumSoz(tes, a)}.` + (a.kaynak === "varsayilan" ? " Karşılaştırma tahmini aralığa göre; aralığınızı ölçerseniz daha anlamlı olur." : " Şarkı seçerken notalarının çoğu bu bölgeye düşen tonları deneyin.");
      else if (hist.size) mesaj.textContent = "Yeterince uzun ses duyamadım (en az 5 saniye perdeli ses gerekir). Biraz daha uzun ve gür söyleyerek yeniden deneyin.";
      else mesaj.textContent = "\"Söylemeye başla\"ya basın ve yaklaşık 25 saniye serbestçe söyleyin. Mikrofon yoksa \"Örnek ezgi\"yi seçin.";
    }
    async function basla() {
      Snd.unlock();
      const ok = Mic.state === "on" || (await Mic.start());
      if (!ok) { mesaj.textContent = "Mikrofon açılamadı. \"Örnek ezgi\" ile bir ezginin histogramını aralığınızla karşılaştırabilirsiniz."; return; }
      olcuyor = true; kareler = []; hist = new Map(); tes = null;
      egri.mod("akis"); egri.aralik(null); egri.hedefler([]); egri.katmanSil(); egri.basla();
      off = egri.dinle((k) => kareler.push({ t: k.t, sesli: k.sesli, midi: k.midi }));
      bitisT = performance.now() + SURE * 1000;
      basBtn.setLabel("Bitir"); basBtn.setIcon("stop");
      const tik = () => {
        if (!olcuyor) return;
        hist = Analiz.histogram(kareler); tes = Analiz.tessitura(hist);
        const kalan = Math.ceil((bitisT - performance.now()) / 1000);
        durum.textContent = "Kalan: " + Math.max(0, kalan) + " sn";
        yaz(); ciz();
        if (kalan <= 0) bitir(); else timer = setTimeout(tik, 300);
      };
      tik();
    }
    function bitir() {
      if (!olcuyor) return;
      olcuyor = false; clearTimeout(timer);
      off && off(); off = null;
      hist = Analiz.histogram(kareler); tes = Analiz.tessitura(hist);
      const top = [...hist.values()].reduce((x, y) => x + y, 0);
      if (top < 5) tes = null;
      basBtn.setLabel("Söylemeye başla"); basBtn.setIcon("mic");
      durum.textContent = "";
      yaz(); ciz();
    }
    function ornekCal() {
      durdurHepsi();
      Snd.unlock();
      const c = Snd.ready();
      if (!c) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      ornekHesapla();
      const ns = ornekNotalar();
      const r = Ses.ezgi(c.sampleRate, ns.map((n) => Object.assign({}, n, { u: n.u || "a" })), { tip: tipOf(), vibGen: 0, gurluk: 0.65, jitter: 0.002 });
      const ks = [];
      const iz = izleParca(r.data, c.sampleRate, ks);
      const t = c.currentTime + 0.15;
      const cal = Ses.calBuffer(r.data, { when: t });
      egri.basla(t + Ses.BAS);
      const oyn = egri.oynat(ks, t, { bitince: () => { if (ornek === ctl) { ornek = null; durum.textContent = ""; } } });
      const ctl = { stop() { cal && cal.stop(); oyn.stop(); iz.stop(); if (ornek === ctl) ornek = null; durum.textContent = ""; } };
      Snd.own(ctl);
      ornek = ctl;
      durum.textContent = "Örnek ses söylüyor";
    }
    function durdurHepsi() { if (olcuyor) bitir(); ornek && ornek.stop(); }
    window.addEventListener("aralikchange", () => { if (kaynak === "ornek" && ton === "sizin") ornekHesapla(); else { yaz(); ciz(); } });
    window.addEventListener("themechange", ciz);
    goster();
    return {
      enter() { egri.baslat(); yaz(); ciz(); },
      leave() { durdurHepsi(); egri.durdur(); },
      toggle() { if (kaynak === "ses") (olcuyor ? bitir() : basla()); else (ornek ? ornek.stop() : ornekCal()); },
    };
  };
  window.GuideScenarios["tessitura"] = [{ click: "=Örnek ezgi" }, { wait: 1600 }, { click: "=Kendi sesim" }];
})();
