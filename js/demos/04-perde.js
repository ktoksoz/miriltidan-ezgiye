/* 4. Doğru perdede söylemek: deneyler */
(function () {
  const { h, seg, ibtn, nn } = L;

  /* Perde eşleme: seviyeler, dinle → söyle, sonuç */
  const SEVIYE = {
    tek: { ad: "Tek nota", tol: 50, kalip: () => [[0, 2.2]] },
    dar: { ad: "Dar (±20)", tol: 20, kalip: () => [[0, 2.4]] },
    iki: { ad: "İki nota", tol: 35, kalip: () => { const a = [2, 3, 4, 5, -2, -3][Math.floor(Math.random() * 6)]; return [[0, 1.4], [a, 1.6]]; } },
    dizi: { ad: "Kısa dizi", tol: 35, kalip: () => [[[0, 0.8], [2, 0.8], [4, 0.8], [2, 0.8], [0, 1.4]], [[0, 0.8], [4, 0.8], [7, 1], [4, 0.8], [0, 1.4]], [[7, 0.8], [5, 0.8], [4, 0.8], [2, 0.8], [0, 1.4]]][Math.floor(Math.random() * 3)] },
  };
  window.Demos.perdeEsleme = (stage) => {
    let seviye = "tek";
    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const seviyeSeg = seg(Object.entries(SEVIYE).map(([k, v]) => [k, v.ad]), seviye, (k) => { seviye = k; al.durdur(); }, "Seviye");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", basBtn, seviyeSeg, h("span.spacer"), durum), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 6 });
    const sonuc = h("div.sonuc");
    stage.append(sonuc, Egri.anahtar());
    const al = Alistirma({
      egri, tur: "perde-esleme",
      tol: () => SEVIYE[seviye].tol,
      cumleler: () => {
        const out = [];
        for (let i = 0; i < 3; i++) {
          const k = SEVIYE[seviye].kalip();
          const bas = Aralik.perdele(k.map((x) => x[0]), { pay: 2 }) + Math.round((Math.random() - 0.5) * 4);
          out.push(k.map(([n, d]) => ({ m: bas + n, d, hece: nn(bas + n) })));
        }
        return out;
      },
      onBasla() { basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durum.textContent = ""; },
      onDurum(t) { durum.textContent = t; },
      onSonuc(s, i) {
        const y = Math.round(s.genel * 100);
        const ort = s.notalar.filter((n) => n.ort != null);
        const o = ort.length ? ort.reduce((a, n) => a + n.ort, 0) / ort.length : null;
        sonuc.innerHTML = "";
        sonuc.append(h("div.olcumler",
          h("div.olcum" + (y >= 70 ? ".tam" : ""), h("b", s.mikrofon ? "%" + y : "–"), h("small", `${i + 1}. deneme: bantta`)),
          h("div.olcum" + (o == null ? "" : Math.abs(o) <= 15 ? ".tam" : o < 0 ? ".pes" : ".tiz"), h("b", o == null || !s.mikrofon ? "–" : L.fmtCents(o)), h("small", "ortalama sapma"))),
          h("p.note-msg", Alistirma.sonucSozu(s, SEVIYE[seviye].tol)));
      },
    });
    // başlamadan önce: seviyenin bir örneği (grafit çizgi: biraz pes başlayıp yerine oturan bir ses)
    const onizle = () => {
      const k = SEVIYE[seviye].kalip(), bas = Aralik.perdele(k.map((x) => x[0]), { pay: 2 });
      Alistirma.onizleme(egri, k.map(([n, d]) => ({ m: bas + n, d, hece: nn(bas + n) })));
    };
    seviyeSeg.buttons.forEach(([, b]) => b.addEventListener("click", () => setTimeout(onizle)));
    window.addEventListener("aralikchange", () => !al.calisiyor && onizle());
    return { enter() { egri.baslat(); if (!al.calisiyor) onizle(); }, leave() { al.durdur(); egri.durdur(); }, toggle: () => al.toggle() };
  };
  window.GuideScenarios["perde-esleme"] = [{ click: "=İki nota" }, { wait: 600 }, { click: "=Tek nota" }];
})();

/* 4. Doğru perdede söylemek: detone (kulak eşiği), aralıklar ve gam, ezgi söyleme, kulak oyunu */
(function () {
  const { h, seg, ibtn, btn, nn, C, store, prefs, slider } = L;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const sec = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];

  // Bir notayı seçilen ses rengiyle çal (cent hassasiyetinde frekans). Dönüş: kontrol ya da null
  function tekNota(f, when, tini, d = 0.75) {
    if (tini === "piyano") return Snd.pluck(f, { dur: d, when, gain: 0.34 });
    if (tini === "sinus") return Snd.note(f, { type: "sine", dur: d * 0.92, gain: 0.28, attack: 0.03, release: 0.12, when });
    const c = Snd.ctx;
    return Ses.soyle([{ f, d, u: "a" }], { tip: prefs.sesBolge === "pes" ? "erkek" : "kadin", gurluk: 0.6, vibGen: 0, when: Math.max(c.currentTime + 0.02, when - Ses.BAS) });
  }

  /* Uzun bir ezginin perde dizisi: Pitch.izle ile aynı hesap, ama ana iş parçacığını kilitlememek için parça parça.
     İlk ~2 sn hemen çıkarılır (çalma başlarken eğri boş kalmasın), kalanı çalmadan çok daha hızlı arka arkaya. */
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

  /* ---------- Detone: kulak eşiği (mikrofonsuz) ---------- */
  window.Demos.detone = (stage) => {
    let tini = "ses";
    let fark, seri, yonSon, donusler, gecmis, soru, bitti, basladi, kilit;
    const basBtn = ibtn("play", "Başla", () => basla(), "primary");
    const tekrarBtn = ibtn("play", "Tekrar dinle", () => cal(), "ghost");
    const tiniSeg = seg([["ses", "Sentez ses"], ["piyano", "Piyano"], ["sinus", "Sinüs"]], tini, (k) => { tini = k; }, "Ses rengi");
    const pesBtn = h("button.btn.big.yanit", { type: "button", onclick: () => yanit(-1) }, h("span.ok", "↓"), "Pes");
    const tizBtn = h("button.btn.big.yanit", { type: "button", onclick: () => yanit(1) }, h("span.ok", "↑"), "Tiz");
    const durum = h("span.readout");
    const sayfa = h("div.sheet.detone-sayfa");
    const cv = h("canvas", { role: "img", "aria-label": "Denemelere göre perde farkı (sent) grafiği" });
    sayfa.append(cv);
    const olc = h("div.olcumler");
    const mesaj = h("p.note-msg");
    stage.append(h("div.controls", basBtn, tekrarBtn, h("span.spacer"), h("span.ctl-lab", "Ses rengi"), tiniSeg),
      h("div.detone-yanit", pesBtn, h("span.detone-soru", durum), tizBtn), sayfa, olc, mesaj);
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });

    function sifirla() {
      fark = 50; seri = 0; yonSon = null; donusler = []; gecmis = []; soru = null; bitti = false; basladi = false; kilit = true;
    }
    sifirla();
    const esik = () => {
      const son = donusler.slice(-6);
      return son.length ? Math.exp(son.reduce((a, v) => a + Math.log(v), 0) / son.length) : null;
    };
    function yanitlarAc(on) { pesBtn.disabled = tizBtn.disabled = !on; }
    yanitlarAc(false);
    tekrarBtn.disabled = true;

    function basla() {
      Snd.unlock();
      sifirla();
      basladi = true;
      basBtn.setLabel("Yeniden başla");
      yeniSoru();
    }
    function yeniSoru() {
      const bas = Aralik.perdele([0], { pay: 3 }) + rnd(-3, 3);
      soru = { f1: N.mtof(bas), isaret: Math.random() < 0.5 ? -1 : 1, fark };
      soru.f2 = soru.f1 * Math.pow(2, (soru.isaret * soru.fark) / 1200);
      cal();
    }
    function cal() {
      if (!soru) return;
      Snd.unlock();
      const c = Snd.ready();
      if (!c) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      Snd.stopAll();
      const t = c.currentTime + 0.15;
      tekNota(soru.f1, t, tini);
      tekNota(soru.f2, t + 1.1, tini);
      durum.textContent = "Dinleyin…";
      kilit = true; yanitlarAc(false); tekrarBtn.disabled = true;
      clearTimeout(cal.t);
      cal.t = setTimeout(() => { kilit = false; yanitlarAc(!bitti); tekrarBtn.disabled = false; durum.textContent = "İkinci nota pes mi, tiz mi?"; }, 1400);
    }
    function yanit(y) {
      if (kilit || !soru || bitti) return;
      const dogru = y === soru.isaret;
      gecmis.push({ fark: soru.fark, dogru });
      [pesBtn, tizBtn].forEach((b) => b.classList.remove("dogru", "yanlis"));
      (y < 0 ? pesBtn : tizBtn).classList.add(dogru ? "dogru" : "yanlis");
      setTimeout(() => [pesBtn, tizBtn].forEach((b) => b.classList.remove("dogru", "yanlis")), 600);
      // merdiven: 2 doğru → küçült, 1 yanlış → büyüt; yön değişince dönüş
      let yon = null;
      const adim = donusler.length < 2 ? 1.6 : 1.3;
      if (dogru) { seri++; if (seri >= 2) { yon = "in"; seri = 0; } }
      else { seri = 0; yon = "cik"; }
      if (yon) {
        if (yonSon && yon !== yonSon) donusler.push(fark);
        yonSon = yon;
        fark = Math.max(2, Math.min(200, yon === "in" ? fark / adim : fark * adim));
      }
      soru = null;
      if (donusler.length >= 8 || gecmis.length >= 40) { bitir(); return; }
      yaz();
      ciz();
      yanitlarAc(false);
      setTimeout(yeniSoru, 650);
    }
    function bitir() {
      bitti = true; kilit = true; yanitlarAc(false); tekrarBtn.disabled = true;
      const e = esik();
      durum.textContent = "Test bitti";
      if (e) {
        const g = store.get("detone", []);
        g.push({ tarih: Date.now(), esik: Math.round(e * 10) / 10, tini });
        store.set("detone", g.slice(-50));
      }
      yaz(); ciz();
    }
    function yaz() {
      const e = bitti ? esik() : null;
      const dogruSay = gecmis.filter((g) => g.dogru).length;
      olc.innerHTML = "";
      olc.append(
        h("div.olcum", h("b", L.fmtNum(bitti ? fark : (soru ? soru.fark : fark), 0) + " sent"), h("small", bitti ? "son fark" : "şimdiki fark")),
        h("div.olcum", h("b", gecmis.length ? `${dogruSay}/${gecmis.length}` : "–"), h("small", "doğru yanıt")),
        h("div.olcum" + (e ? ".tam" : ""), h("b", e ? "≈" + L.fmtNum(e, e < 10 ? 1 : 0) + " sent" : "–"), h("small", "eşiğiniz")));
      if (!basladi) {
        const onceki = store.get("detone", []).slice(-1)[0];
        mesaj.textContent = "Fark 50 sentten (çeyrek ton) başlar." + (onceki ? ` Önceki eşiğiniz: yaklaşık ${L.fmtNum(onceki.esik, 0)} sent.` : "");
      } else if (!bitti) mesaj.textContent = `Dönüş: ${donusler.length}/8. Fark iki doğru yanıtta küçülür, bir yanlışta büyür.`;
      else if (e <= 20) mesaj.textContent = `Eşiğiniz yaklaşık ${L.fmtNum(e, 0)} sent: perde eşlemedeki dar toleransın (±20 sent) bile altında farkları duyuyorsunuz. Kulağınız hazır; şimdi sesi o hedefe götürmeyi çalışın.`;
      else if (e <= 50) mesaj.textContent = `Eşiğiniz yaklaşık ${L.fmtNum(e, 0)} sent: çeyrek tondan küçük farkları duyuyorsunuz. Bu, perde eşleme için yeterli bir kulak demek. Kulaklıkla ya da başka bir ses rengiyle tekrar deneyin.`;
      else mesaj.textContent = `Eşiğiniz yaklaşık ${L.fmtNum(e, 0)} sent çıktı. Bu bir tanı değildir: dikkat, yorgunluk, hoparlör ve ses rengi sonucu çok etkiler. Kulaklık takıp sessiz bir yerde, sentez sesle yeniden deneyin; çoğu insanda eşik ikinci denemede düşer.`;
    }
    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const sol = 70, sag = 16, ust = 18, alt = 26;
      const lo = Math.log(2), hi = Math.log(200);
      const y = (c) => ust + (1 - (Math.log(c) - lo) / (hi - lo)) * (H - ust - alt);
      const n = Math.max(20, gecmis.length + 2);
      const x = (i) => sol + (i / (n - 1)) * (W - sol - sag);
      // başvuru çizgileri
      [[100, "yarım ses"], [50, "±50: tek nota"], [20, "±20: dar"], [5, ""]].forEach(([c, ad]) => {
        const yy = Math.round(y(c)) + 0.5;
        ctx.strokeStyle = L.rgba(C.porte, c === 100 ? 0.9 : 0.6); ctx.lineWidth = 1; ctx.setLineDash(c === 100 ? [] : [4, 5]);
        ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(W - sag, yy); ctx.stroke(); ctx.setLineDash([]);
        L.text(ctx, c + " sent", sol - 6, yy + 4, { size: 11, color: C.muted, align: "right", weight: 700, font: L.FONT.mono });
        if (ad) L.text(ctx, ad, W - sag - 4, yy - 4, { size: 11, color: C.muted, align: "right" });
      });
      ctx.fillStyle = L.rgba(C.porte, 0.8); ctx.fillRect(sol - 0.5, 0, 1.5, H);
      L.text(ctx, "deneme →", W - sag, H - 8, { size: 11, color: C.muted, align: "right" });
      // eşik bandı
      const e = esik();
      if (e && bitti) {
        const yy = y(e);
        ctx.fillStyle = L.rgba(C.fosfor, 0.55);
        ctx.beginPath(); ctx.moveTo(sol + 2, yy - 6); ctx.lineTo(W - sag, yy - 5); ctx.lineTo(W - sag - 3, yy + 6); ctx.lineTo(sol, yy + 5); ctx.closePath(); ctx.fill();
        L.text(ctx, "eşiğiniz ≈ " + L.fmtNum(e, e < 10 ? 1 : 0) + " sent", sol + 8, yy - 9, { size: 12, color: C.ink, weight: 700 });
      }
      if (!gecmis.length) {
        L.text(ctx, "Yanıtlarınız burada nokta nokta çizilir", (sol + W) / 2, H / 2 + 30, { size: 13, color: C.muted, align: "center" });
      }
      // merdiven çizgisi
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.lineJoin = "round";
      ctx.beginPath();
      gecmis.forEach((g, i) => (i ? ctx.lineTo(x(i), y(g.fark)) : ctx.moveTo(x(i), y(g.fark))));
      if (!bitti && basladi) ctx.lineTo(x(gecmis.length), y(soru ? soru.fark : fark));
      ctx.stroke();
      gecmis.forEach((g, i) => {
        ctx.beginPath(); ctx.arc(x(i), y(g.fark), 5, 0, Math.PI * 2);
        if (g.dogru) { ctx.fillStyle = C.tam; ctx.fill(); }
        else { ctx.fillStyle = C.kagit; ctx.fill(); ctx.strokeStyle = C.tiz; ctx.lineWidth = 2; ctx.stroke(); }
      });
      if (!bitti && basladi) {
        const xx = x(gecmis.length), yy = y(soru ? soru.fark : fark);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xx, yy, 6, 0, Math.PI * 2); ctx.stroke();
      }
      // anahtar
      const ay = 12;
      ctx.fillStyle = C.tam; ctx.beginPath(); ctx.arc(sol + 12, ay, 4.5, 0, Math.PI * 2); ctx.fill();
      L.text(ctx, "doğru", sol + 21, ay + 4, { size: 11, color: C.muted, weight: 700 });
      ctx.strokeStyle = C.tiz; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sol + 76, ay, 4, 0, Math.PI * 2); ctx.stroke();
      L.text(ctx, "yanlış", sol + 85, ay + 4, { size: 11, color: C.muted, weight: 700 });
    }
    yaz();
    window.addEventListener("themechange", ciz);
    window.addEventListener("keydown", (e) => {
      if (!stage.closest(".slide").classList.contains("active") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowDown") { yanit(-1); e.preventDefault(); }
      else if (e.key === "ArrowUp") { yanit(1); e.preventDefault(); }
    });
    return {
      enter() { ciz(); },
      // yarıda çıkılırsa soru kalır; dönünce "Tekrar dinle" aynı soruyu yeniden çalar
      leave() { clearTimeout(cal.t); Snd.stopAll(); kilit = true; yanitlarAc(false); tekrarBtn.disabled = !(soru && !bitti); },
      toggle() { basladi && !bitti ? cal() : basla(); },
    };
  };
  window.GuideScenarios["detone"] = [{ click: "=Piyano" }, { wait: 600 }, { click: "=Sentez ses" }];

  /* ---------- Aralıklar ve gam ---------- */
  const ARALIKLAR = [[2, "büyük 2'li"], [3, "küçük 3'lü"], [4, "büyük 3'lü"], [5, "tam 4'lü"], [7, "tam 5'li"], [9, "büyük 6'lı"], [12, "oktav"]];
  const ARALIK_IPUCU = { 2: "do → re", 3: "do → mi♭ (minör gamın üçüncüsü)", 4: "do → mi", 5: "do → fa", 7: "do → sol", 9: "do → la", 12: "do → bir üst do" };
  window.Demos.araliklar = (stage) => {
    let mod = "aralik", ar = 7, yon = 1;
    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const modSeg = seg([["aralik", "Aralık"], ["gam", "Gam"]], mod, (k) => { mod = k; al.durdur(); goster(); onizle(); }, "Alıştırma");
    const arSeg = seg(ARALIKLAR.map(([n, ad]) => [n, ad]), ar, (k) => { ar = k; al.durdur(); goster(); onizle(); }, "Aralık");
    const yonSeg = seg([[1, "Çıkıcı"], [-1, "İnici"]], yon, (k) => { yon = k; al.durdur(); onizle(); }, "Yön");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const bilgi = h("p.aralik-bilgi");
    const sayfa = h("div.sheet.egri-kap");
    const arSatir = h("div.controls.aralik-sec", arSeg, yonSeg);
    stage.append(h("div.controls", basBtn, modSeg, h("span.spacer"), durum), arSatir, ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 4 });
    const sonuc = h("div.sonuc");
    stage.append(bilgi, sonuc, Egri.anahtar());
    function goster() {
      arSatir.hidden = mod !== "aralik";
      bilgi.innerHTML = "";
      if (mod === "aralik") bilgi.append(h("b", N.aralikAdi(ar)[0].toLocaleUpperCase("tr") + N.aralikAdi(ar).slice(1)), `: ${ar} yarım ses · majör gamda ${ARALIK_IPUCU[ar]}`);
      else bilgi.append(h("b", "Majör gam"), ": do re mi fa sol la si do · adımlar 2 2 1 2 2 2 1 yarım ses");
    }
    const kalip = () => {
      if (mod === "gam") return [N.MAJOR.map((n, i) => [n, i === 7 ? 1.1 : 0.62, N.HECE[i]]), N.MAJOR.slice().reverse().map((n, i) => [n, i === 7 ? 1.1 : 0.62, N.HECE[7 - i]])];
      return [[[0, 1.3], [yon * ar, 1.5]]];
    };
    function cumle(k, kay = 0) {
      const rel = k.map((x) => x[0]);
      const b0 = Aralik.perdele(rel, { pay: 1 });
      const bas = Aralik.perdele(rel, { pay: 1, tercih: b0 + kay });
      return k.map(([n, d, hc]) => ({ m: bas + n, d, hece: hc || nn(bas + n) }));
    }
    const al = Alistirma({
      egri, tur: "araliklar", tol: 35,
      cumleler: () => (mod === "gam" ? kalip().map((k) => cumle(k)) : [0, 1, 2].map(() => cumle(kalip()[0], rnd(-2, 2)))),
      onBasla() { basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durum.textContent = ""; },
      onDurum(t) { durum.textContent = t; },
      onSonuc(s, i) {
        const y = Math.round(s.genel * 100);
        sonuc.innerHTML = "";
        const ol = h("div.olcumler", h("div.olcum" + (y >= 70 ? ".tam" : ""), h("b", s.mikrofon ? "%" + y : "–"), h("small", (mod === "gam" ? (i ? "iniş" : "çıkış") : `${i + 1}. deneme`) + ": bantta")));
        const ns = s.notalar;
        if (mod === "aralik" && s.mikrofon && ns[0].ort != null && ns[1].ort != null) {
          const hedef = ns[1].m - ns[0].m;
          const soy = hedef + (ns[1].ort - ns[0].ort) / 100;
          const fark = (Math.abs(soy) - Math.abs(hedef)) * 100;
          ol.append(h("div.olcum" + (Math.abs(fark) <= 15 ? ".tam" : fark < 0 ? ".pes" : ".tiz"), h("b", L.fmtCents(fark)), h("small", "aralık: " + (Math.abs(fark) <= 15 ? "tam" : fark < 0 ? "dar" : "geniş"))));
        }
        sonuc.append(ol);
        if (mod === "gam") sonuc.append(h("div.nota-cipler", ns.map((n) => h("span.cip" + (!s.mikrofon || n.ort == null ? "" : Math.abs(n.ort) <= 15 ? ".tam" : n.ort < 0 ? ".pes" : ".tiz"),
          { title: n.ort == null ? "duyulmadı" : L.fmtCents(n.ort) }, n.hece))));
        sonuc.append(h("p.note-msg", Alistirma.sonucSozu(s, 35)));
      },
    });
    const onizle = () => {
      const k = kalip();
      Alistirma.onizleme(egri, mod === "gam" ? cumle(k[0]) : cumle(k[0]));
    };
    goster();
    window.addEventListener("aralikchange", () => !al.calisiyor && onizle());
    return { enter() { egri.baslat(); if (!al.calisiyor) onizle(); }, leave() { al.durdur(); egri.durdur(); }, toggle: () => al.toggle() };
  };
  window.GuideScenarios["araliklar"] = [{ click: "=büyük 3'lü" }, { wait: 700 }, { click: "=Gam" }, { wait: 900 }, { click: "=Aralık" }];

  /* ---------- Ezgi söyleme ---------- */
  const EZGI_SEC = [["nese", "Neşeye Övgü"], ["frere", "Frère Jacques"], ["yildiz", "Ah! vous dirai-je"], ["sabah", "Sabah olur"], ["legato", "Su gibi"], ["basamak", "Basamaklar"]];
  // ezgiyi cümlelere böl: en az 4 vuruşluk ve 2 vuruş ya da daha uzun bir notayla biten bölümler
  function bol(ns, vurus) {
    const out = [];
    let cur = [], v = 0;
    ns.forEach((n) => {
      cur.push(n); v += n.d / vurus;
      if (n.d / vurus >= 1.99 && v >= 3.9) { out.push(cur); cur = []; v = 0; }
    });
    if (cur.length) { if (cur.length < 3 && out.length) out[out.length - 1].push(...cur); else out.push(cur); }
    return out;
  }
  const hedefOf = (ns, bas = 0) => {
    const hd = []; let t = bas;
    for (const n of ns) { if (!n.r) hd.push({ t0: t, t1: t + n.d, m: n.m, hece: n.hece }); t += n.r || n.d; }
    return { hd, T: t - bas };
  };
  window.Demos.ezgi = (stage) => {
    let id = "nese", tempo = Ezgiler.bul(id).tempo, kaydir = 0;
    let kayit = null, ornek = null;
    const ez = () => Ezgiler.bul(id);
    const onerilen = () => Aralik.perdele(ez().notalar.map((n) => n[0]), { pay: 1 });
    const bas = () => onerilen() + kaydir;
    const notalar = () => Ezgiler.notalar(id, { bas: bas(), tempo });

    const basBtn = ibtn("play", "Başla", () => al.toggle(), "primary");
    const kayBtn = ibtn("rec", "Kaydet", () => (kayit ? kayitBitir(true) : kaydet()), "rec");
    const ornekBtn = ibtn("play", "Örneği dinle", () => ornekCal(), "ghost");
    const ezSeg = seg(EZGI_SEC, id, (k) => { id = k; tempo = ez().tempo; tempoSl.set(tempo); kaydir = 0; tonSl.set(0); durdurHepsi(); onizle(); liste.yenile(); kaliciYaz(); }, "Ezgi");
    const tempoSl = slider({ label: "Tempo", min: 50, max: 140, step: 2, value: tempo, fmt: (v) => v + " vuruş/dk", oninput: (v) => { tempo = v; durdurHepsi(); onizle(); } });
    const tonSl = slider({ label: "Ton", min: -6, max: 6, step: 1, value: 0, fmt: (v) => nn(onerilen() + v) + (v === 0 ? " (önerilen)" : (v > 0 ? " (+" : " (−") + Math.abs(v) + ")"), oninput: (v) => { kaydir = v; durdurHepsi(); onizle(); } });
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const sayfa = h("div.sheet.egri-kap");
    const bilgi = h("p.ezgi-bilgi.kaynak");
    stage.append(h("div.controls", ezSeg), h("div.controls", basBtn, kayBtn, ornekBtn, h("span.spacer"), durum),
      h("div.controls.ezgi-ayar", tempoSl, tonSl), ms.el, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 10 });
    const sonuc = h("div.sonuc");
    const liste = Kayit.Liste({ egri, filtre: (k) => k.ezgi === id });
    const kalici = h("div.ezgi-kalici");
    const gizli = h("p.kaynak.ezgi-gizlilik", Kayit.GIZLILIK);
    stage.append(bilgi, sonuc, h("details.ezgi-kayitlar", { open: true }, h("summary", "Kayıtlar"), liste.el, kalici, gizli));

    function bilgiYaz() {
      const e = ez(), ms2 = e.notalar.map((n) => n[0]);
      const lo = bas() + Math.min(...ms2), hi = bas() + Math.max(...ms2);
      const a = Aralik.get();
      bilgi.textContent = `${e.ad}: ${e.kaynak} Ezginin aralığı ${nn(lo)}–${nn(hi)}; sizin ${a.kaynak === "olcum" ? "ölçülen" : a.kaynak === "elle" ? "işaretlediğiniz" : "tahmini"} aralığınız ${nn(a.lo)}–${nn(a.hi)}.`;
    }
    const cumleler = () => bol(notalar(), 60 / tempo);
    const al = Alistirma({
      egri, tur: "ezgi", tol: 35, cumleler,
      onBasla() { ornek && ornek.stop(); kayit && kayitBitir(false); basBtn.setLabel("Durdur"); basBtn.setIcon("stop"); sonuc.innerHTML = ""; egri.katmanSil(); },
      onDur() { basBtn.setLabel("Başla"); basBtn.setIcon("play"); durum.textContent = ""; },
      onDurum(t) { durum.textContent = t; },
      onSonuc(s, i) {
        const y = Math.round(s.genel * 100), n = cumleler().length;
        sonuc.innerHTML = "";
        sonuc.append(h("div.olcumler", h("div.olcum" + (y >= 70 ? ".tam" : ""), h("b", s.mikrofon ? "%" + y : "–"), h("small", `${i + 1}/${n}. cümle: bantta`))),
          h("p.note-msg", Alistirma.sonucSozu(s, 35)));
      },
      onBitti(ss) {
        const m = ss.filter((s) => s.mikrofon && s.soylendi);
        if (!m.length) return;
        const y = Math.round((m.reduce((a, s) => a + s.genel, 0) / m.length) * 100);
        sonuc.prepend(h("div.olcumler", h("div.olcum" + (y >= 70 ? ".tam" : ""), h("b", "%" + y), h("small", "bütün ezgi: bantta"))));
      },
    });

    function durdurHepsi() { al.durdur(); ornek && ornek.stop(); if (kayit) kayitBitir(false); }
    // önizleme: bütün ezginin hedef bantları (sentezsiz; uzun ezgide perde çıkarmak sayfayı bekletirdi)
    function onizle() {
      bilgiYaz();
      if (al.calisiyor || kayit || ornek) return;
      const { hd, T } = hedefOf(notalar());
      egri.mod("sabit"); egri.sure(T + 0.4); egri.temizle(); egri.katmanSil(); egri.hedefler(hd); egri.imlec(null);
    }
    function ornekCal() {
      durdurHepsi();
      Snd.unlock();
      if (!Snd.ready()) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      const ns = notalar();
      const { hd, T } = hedefOf(ns);
      egri.mod("sabit"); egri.sure(T + 0.4); egri.katmanSil(); egri.hedefler(hd);
      sonuc.innerHTML = "";
      // örnek ses: biraz sapmalı söyler (Alistirma.ornekSoyle gibi), perde dizisi çalarken parça parça çıkarılır
      const c = Snd.ctx, sapma = [-14, 6, 18, -6, 0, 10, -20, 4];
      const ns2 = ns.map((n, i) => Object.assign({}, n, { f: N.mtof(n.m + sapma[i % 8] / 100), u: n.u || "a" }));
      const r = Ses.ezgi(c.sampleRate, ns2, { tip: prefs.sesBolge === "pes" ? "erkek" : "kadin", vibGen: 0, gurluk: 0.65, jitter: 0.002 });
      const kareler = [];
      const iz = izleParca(r.data, c.sampleRate, kareler);
      const t = c.currentTime + 0.15;
      const cal = Ses.calBuffer(r.data, { when: t });
      egri.basla(t + Ses.BAS);
      const oyn = egri.oynat(kareler, t, { bitince: () => { if (ornek === ctl) { ornek = null; durum.textContent = ""; } } });
      const ctl = { stop() { cal && cal.stop(); oyn.stop(); iz.stop(); if (ornek === ctl) ornek = null; durum.textContent = ""; } };
      Snd.own(ctl);
      ornek = ctl;
      durum.textContent = "Örnek ses söylüyor";
    }

    // Kaydet: sayım + baştan sona söyleme, ses ve perde eğrisi kaydedilir
    async function kaydet() {
      al.durdur(); ornek && ornek.stop();
      Snd.unlock();
      const ok = Mic.state === "on" || (await Mic.start());
      if (!ok || !Snd.ready()) { sonuc.innerHTML = ""; sonuc.append(h("p.note-msg.warn", "Kaydetmek için mikrofon gerekli. Mikrofon kapalıyken \"Örneği dinle\" ile sentez sesin söyleyişini görebilirsiniz.")); return; }
      const c = Snd.ctx, vurus = 60 / tempo, ns = notalar();
      const t0 = c.currentTime + 0.3 + 4 * vurus;
      const { hd, T } = hedefOf(ns);
      for (let i = 0; i < 4; i++) Snd.drum(i ? "click" : "accent", t0 - (4 - i) * vurus, 0.8);
      if (prefs.kulaklik) Snd.referans(ns, { when: t0, olcmeyiSurdur: true, gain: 0.7 });
      egri.mod("sabit"); egri.sure(T + 0.5); egri.katmanSil(); egri.temizle(); egri.basla(t0); egri.hedefler(hd);
      const off = egri.dinle();
      const rec = Kayit.baslat({ ad: ez().ad + " · " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }), hedefler: hd, t0 });
      kayit = { rec, off, hd, raf: 0 };
      kayBtn.classList.add("on"); kayBtn.setLabel("Kaydı durdur"); kayBtn.setIcon("stop");
      basBtn.disabled = ornekBtn.disabled = true;
      sonuc.innerHTML = "";
      const adim = () => {
        if (!kayit) return;
        const t = c.currentTime - t0;
        egri.imlec(Math.max(0, t));
        if (t < 0) { durum.textContent = "Sayım: " + Math.min(4, Math.ceil(-t / vurus)); egri.durum(String(Math.min(4, Math.ceil(-t / vurus))), { buyuk: true }); }
        else { egri.durum(null); durum.textContent = "Kayıtta: söyleyin"; }
        if (t > T + 0.45) { kayitBitir(true); return; }
        kayit.raf = requestAnimationFrame(adim);
      };
      adim();
    }
    async function kayitBitir(sakla) {
      if (!kayit) return;
      const { rec, off, hd, raf } = kayit;
      kayit = null;
      cancelAnimationFrame(raf); off(); egri.durum(null); Snd.stopAll();
      kayBtn.classList.remove("on"); kayBtn.setLabel("Kaydet"); kayBtn.setIcon("rec");
      basBtn.disabled = ornekBtn.disabled = false;
      durum.textContent = "";
      if (!rec) return;
      const k = await rec.durdur();
      k.ezgi = id;
      if (!sakla) { Kayit.oturum.splice(Kayit.oturum.indexOf(k), 1); return; }
      const s = Alistirma.puanla(k.kareler.map((q) => ({ t: q.t, sesli: q.sesli, midi: q.midi })), hd, 35);
      const y = Math.round(s.genel * 100);
      if (s.soylendi) {
        Kayit.kaliciKaydet(k, { olcum: { yuzde: y, tempo, bas: bas() }, etiket: "ezgi:" + id });
        Alistirma.dogrulukKaydet("ezgi", s.genel);
      }
      Kayit.bildir();
      kaliciYaz();
      sonuc.innerHTML = "";
      s.mikrofon = true;
      sonuc.append(h("div.olcumler", h("div.olcum" + (y >= 70 ? ".tam" : ""), h("b", "%" + y), h("small", "kayıt: bantta"))), h("p.note-msg", Alistirma.sonucSozu(s, 35) + (s.soylendi ? " Kaydı dinleyebilir ya da bir sonrakiyle üst üste koyabilirsiniz." : "")));
    }
    function kaliciYaz() {
      kalici.innerHTML = "";
      const ks = Kayit.kalicilar("ezgi:" + id).slice(-3).reverse();
      if (!ks.length) return;
      kalici.append(h("p.kaynak", "Önceki günlerden (yalnızca perde eğrisi):"));
      ks.forEach((x) => kalici.append(h("div.kayit-satir",
        h("b", new Date(x.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })),
        h("span.kaynak", x.olcum && x.olcum.yuzde != null ? "%" + x.olcum.yuzde + " bantta" : ""),
        btn("Üst üste koy", () => { egri.katmanEkle(Kayit.noktalar(x), { id: x.id, ad: x.ad }); if (x.hedefler) egri.hedefler(x.hedefler); }, "sm ghost"))));
    }
    kaliciYaz();
    window.addEventListener("aralikchange", () => { tonSl.set(kaydir); onizle(); });
    return {
      enter() { egri.baslat(); onizle(); liste.yenile(); kaliciYaz(); },
      leave() { durdurHepsi(); egri.durdur(); },
      toggle: () => al.toggle(),
    };
  };
  window.GuideScenarios["ezgi"] = [{ click: "=Frère Jacques" }, { wait: 700 }, { slide: "label:Tempo", to: 0.3 }, { wait: 500 }, { click: "=Neşeye Övgü" }];

  /* ---------- Kulak oyunu ---------- */
  const SEVIYELER = { kolay: { ad: "Kolay", ar: [4, 7, 12], inici: false }, orta: { ad: "Orta", ar: [2, 3, 4, 5, 7, 12], inici: true }, zor: { ad: "Zor", ar: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], inici: true } };
  const buyukHarf = (s) => s[0].toLocaleUpperCase("tr") + s.slice(1);
  window.Demos.kulakOyunu = (stage) => {
    let mod = "aralik", sev = "kolay";
    let soru = null, seri = 0, dogru = 0, toplam = 0, beklet = false, dinOff = null, timers = [];
    const kayitli = () => Object.assign({ aralik: 0, soyle: 0 }, (store.get("kulakOyunu", {}) || {}).enIyi);
    const basBtn = ibtn("play", "Başla", () => yeniSoru(), "primary");
    const tekrarBtn = ibtn("play", "Tekrar dinle", () => cal(), "ghost");
    const modSeg = seg([["aralik", "Aralığı bul"], ["soyle", "Duyduğunu söyle"]], mod, (k) => { mod = k; sifirla(); goster(); }, "Oyun");
    const sevSeg = seg(Object.entries(SEVIYELER).map(([k, v]) => [k, v.ad]), sev, (k) => { sev = k; sifirla(); secenekKur(); }, "Seviye");
    const durum = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const egriKap = h("div.sheet.egri-kap.kulak-egri");
    const pSayfa = h("div.sheet.kulak-piyano");
    const cv = h("canvas", { role: "img", "aria-label": "Mini klavye" });
    pSayfa.append(cv);
    const secenek = h("div.kulak-secenek");
    const olc = h("div.olcumler");
    const mesaj = h("p.note-msg");
    stage.append(h("div.controls", modSeg, h("span.spacer"), sevSeg), h("div.controls", basBtn, tekrarBtn, h("span.spacer"), durum), ms.el, egriKap, secenek, pSayfa, olc, mesaj);
    const egri = Egri(egriKap, { mod: "sabit", sure: 4.6, okuma: true });
    let W = 0, H = 0, pos = null, kLo = 48, kHi = 72, isaret = [], basili = null;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });

    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      pos = L.piyano(ctx, 0, 18, W, H - 18, { lo: kLo, hi: kHi, isaret, basili });
    }
    function klavyeAralik(m) {
      const a = Aralik.get();
      let lo = Math.min(a.lo, m - 7), hi = Math.max(lo + 19, Math.min(a.hi, m + 12));
      if (N.isBlack(lo)) lo--; if (N.isBlack(hi)) hi++;
      kLo = lo; kHi = hi;
    }
    cv.addEventListener("click", (e) => {
      if (!pos || mod !== "soyle") return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let m = null;
      for (const [k, p] of pos) if (p.siyah && x >= p.x && x < p.x + p.w && y < 18 + (H - 18) * 0.6) m = k;
      if (m == null) for (const [k, p] of pos) if (!p.siyah && x >= p.x && x < p.x + p.w) m = k;
      if (m == null) return;
      Snd.unlock(); Snd.referans(m, { dur: 0.7, olcmeyiSurdur: true });
      basili = new Set([m]); ciz(); setTimeout(() => { basili = null; ciz(); }, 350);
      if (soru && !soru.bitti && soru.tip === "soyle") {
        const iyi = N.pc(m) === N.pc(soru.m);
        sonuclandir(iyi, iyi ? (m === soru.m ? "Doğru: " + nn(soru.m) + "." : `Doğru nota adı; çalınan ${nn(soru.m)}, siz ${nn(m)} seçtiniz (oktav farkı).`) : `Çalınan nota ${nn(soru.m)}; siz ${nn(m)} seçtiniz.`);
        isaret = [{ m: soru.m, renk: C.tam, etiket: "çalınan" }].concat(iyi && m === soru.m ? [] : [{ m, renk: iyi ? C.tam : C.tiz }]);
        ciz();
      }
    });

    function secenekKur() {
      secenek.innerHTML = "";
      SEVIYELER[sev].ar.forEach((n) => secenek.append(h("button.btn.sm.ghost", { type: "button", "data-n": n, onclick: () => secildi(n) }, buyukHarf(N.aralikAdi(n)))));
      secenekAc(false);
    }
    const secenekAc = (on) => secenek.querySelectorAll("button").forEach((b) => { b.disabled = !on; });
    function goster() {
      const ar = mod === "aralik";
      secenek.hidden = !ar; sevSeg.hidden = !ar; ms.el.hidden = ar; egriKap.hidden = ar;
      pSayfa.classList.toggle("tikla", !ar);
      isaret = []; ciz();
      mesaj.textContent = ar ? "Başla'ya basın: iki nota çalınır, aralığın adını seçin." : "Başla'ya basın: bir nota çalınır. Mikrofon açıksa aynı notayı söyleyin, değilse klavyede bulun.";
      yaz();
    }
    function sifirla() { durdur(); soru = null; seri = 0; dogru = 0; toplam = 0; basBtn.setLabel("Başla"); tekrarBtn.disabled = true; yaz(); }
    function durdur() { timers.forEach(clearTimeout); timers = []; dinOff && dinOff(); dinOff = null; Snd.stopAll(); egri.durum(null); }
    const sonra = (ms2, f) => timers.push(setTimeout(f, ms2));
    function yaz() {
      const e = kayitli();
      olc.innerHTML = "";
      olc.append(h("div.olcum" + (seri >= 3 ? ".tam" : ""), h("b", String(seri)), h("small", "seri")),
        h("div.olcum", h("b", toplam ? `${dogru}/${toplam}` : "–"), h("small", "doğru")),
        h("div.olcum", h("b", String(e[mod])), h("small", "en iyi seri")));
    }
    function yeniSoru() {
      Snd.unlock();
      durdur();
      if (!Snd.ready()) { L.toast("Sesi açmak için bir kez daha dokunun"); return; }
      isaret = [];
      if (mod === "aralik") {
        const S2 = SEVIYELER[sev];
        const n = sec(S2.ar), y = S2.inici && Math.random() < 0.5 ? -1 : 1;
        const b0 = Aralik.perdele([0, y * n], { pay: 1 });
        const a = Aralik.perdele([0, y * n], { pay: 1, tercih: b0 + rnd(-3, 3) });
        soru = { tip: "aralik", n, a, b: a + y * n };
        klavyeAralik(Math.min(soru.a, soru.b)); kHi = Math.max(kHi, Math.max(soru.a, soru.b) + 3); if (N.isBlack(kHi)) kHi++;
        secenek.querySelectorAll("button").forEach((b) => b.classList.remove("dogru", "yanlis"));
      } else {
        const m = Math.max(Aralik.get().lo + 2, Math.min(Aralik.get().hi - 2, Aralik.perdele([0], { pay: 2 }) + rnd(-5, 5)));
        soru = { tip: "soyle", m };
        klavyeAralik(m);
      }
      ciz();
      basBtn.setLabel("Sonraki");
      cal();
    }
    function cal() {
      if (!soru) return;
      Snd.unlock();
      durdur();
      if (soru.tip === "aralik") {
        Snd.referans([{ m: soru.a, d: 0.8 }, { m: soru.b, d: 1 }], { olcmeyiSurdur: true });
        durum.textContent = soru.bitti ? "" : "Hangi aralık?";
        if (!soru.bitti) secenekAc(true);
        tekrarBtn.disabled = false;
        return;
      }
      // duyduğunu söyle
      const r = Snd.referans(soru.m, { dur: 1.2 });
      tekrarBtn.disabled = false;
      if (soru.bitti) return;
      if (Mic.state !== "on") { durum.textContent = "Klavyede bulun"; return; }
      const c = Snd.ctx, t0 = (r ? r.t0 : c.currentTime);
      egri.mod("sabit"); egri.sure(4.6); egri.temizle(); egri.hedefler([]); egri.aralik(soru.m - 7, soru.m + 7); egri.basla(t0);
      durum.textContent = "Dinleyin…";
      const bas = 1.45, bit = bas + 2.6;
      const kareler = [];
      dinOff = egri.dinle((k, t) => { if (t >= bas && t <= bit && k.sesli) kareler.push(k.midi); });
      let raf = 0;
      const imlec = () => { egri.imlec(c.currentTime - t0); if (c.currentTime - t0 < bit) raf = requestAnimationFrame(imlec); };
      imlec();
      sonra((bas - (c.currentTime - t0)) * 1000, () => { durum.textContent = "Şimdi siz söyleyin"; egri.durum("Şimdi siz", { buyuk: true }); sonra(800, () => egri.durum(null)); });
      sonra((bit - (c.currentTime - t0)) * 1000 + 120, () => {
        cancelAnimationFrame(raf);
        dinOff && dinOff(); dinOff = null;
        egri.hedefler([{ t0: 0, t1: 1.2, m: soru.m, hece: nn(soru.m), aktif: false }, { t0: bas, t1: bit, m: soru.m, hece: nn(soru.m) }]);
        if (kareler.length < 40) { durum.textContent = ""; mesaj.textContent = "Sesinizi duyamadım. Mikrofona biraz yaklaşıp \"Tekrar dinle\" ile yeniden deneyin ya da klavyede bulun."; return; }
        const s = kareler.slice().sort((a, b) => a - b), med = s[Math.floor(s.length / 2)];
        let sap = (med - soru.m) * 100;
        const okt = Math.round(sap / 1200);
        sap -= okt * 1200;
        const isabet = kareler.filter((m) => { const d = (m - soru.m) * 100 - okt * 1200; return Math.abs(d) <= 50; }).length / kareler.length;
        Alistirma.dogrulukKaydet("kulak-soyle", isabet);
        const iyi = Math.abs(sap) <= 50;
        sonuclandir(iyi, (iyi ? "Buldunuz: " : "Hedef " + nn(soru.m) + ": ") + L.fmtCents(sap) + " · " + L.sapmaSoz(sap) + (okt ? ` (bir oktav ${okt < 0 ? "pes" : "tiz"} söylediniz; doğru sayılır)` : "") + ".");
        isaret = [{ m: soru.m, renk: C.tam, etiket: "çalınan" }]; ciz();
      });
    }
    function secildi(n) {
      if (!soru || soru.tip !== "aralik" || soru.bitti) return;
      const iyi = n === soru.n;
      secenek.querySelectorAll("button").forEach((b) => { const k = +b.dataset.n; if (k === soru.n) b.classList.add("dogru"); else if (k === n) b.classList.add("yanlis"); });
      isaret = [{ m: soru.a, renk: C.ink, etiket: "1" }, { m: soru.b, renk: iyi ? C.tam : C.tiz, etiket: "2" }];
      ciz();
      sonuclandir(iyi, (iyi ? "Doğru: " : "Bu ") + N.aralikAdi(soru.n) + ` (${soru.n} yarım ses), ${nn(soru.a)} → ${nn(soru.b)}.` + (iyi ? "" : " İki notayı klavyede görün, \"Tekrar dinle\" ile yeniden duyun."));
      Snd.referans([{ m: soru.a, d: 0.5 }, { m: soru.b, d: 0.8 }], { olcmeyiSurdur: true, when: Snd.ctx.currentTime + 0.25 });
    }
    function sonuclandir(iyi, metin) {
      soru.bitti = true;
      secenekAc(false);
      toplam++;
      if (iyi) { dogru++; seri++; } else seri = 0;
      const e = kayitli();
      if (seri > e[mod]) { e[mod] = seri; store.set("kulakOyunu", { enIyi: e }); }
      durum.textContent = iyi ? "Doğru" : "Bir dahakine";
      mesaj.textContent = metin;
      yaz();
    }
    secenekKur();
    goster();
    tekrarBtn.disabled = true;
    window.addEventListener("aralikchange", () => { if (!soru) { klavyeAralik(Aralik.perdele([0], { pay: 2 })); ciz(); } });
    klavyeAralik(Aralik.perdele([0], { pay: 2 }));
    return {
      enter() { egri.baslat(); ciz(); },
      leave() { durdur(); egri.durdur(); if (soru && !soru.bitti) soru = null; },
      toggle: () => yeniSoru(),
    };
  };
  window.GuideScenarios["kulak-oyunu"] = [{ click: "=Duyduğunu söyle" }, { wait: 800 }, { click: "=Aralığı bul" }, { wait: 500 }, { click: "=Orta" }];
})();
