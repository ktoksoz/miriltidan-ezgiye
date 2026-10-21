/* 3. Isınma ve ses sağlığı: deneyler
   - nedenIsinma: pipet deneyi (çap, uzunluk → ağız içi geri basınç, ses tellerine düşen basınç farkı)
   - isinma:      5 / 10 / 15 dakikalık ısınma rutini (dinle → söyle, ziyaretçinin aralığına göre perdelenir)
   - sesSagligi:  "Doğru mu?" iddiaları + fısıltı ile normal sesin sentezli karşılaştırması */
(function () {
  const { h, C, FONT, seg, ibtn, btn, nn, clamp, rgba } = L;
  const TAU = Math.PI * 2;

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

  /* ================= Neden ısınılır: pipet ================= */
  // Basitleştirilmiş model: sabit akış U için pipetteki basınç kaybı = Poiseuille sürtünmesi + Bernoulli (çıkış) kaybı
  const HAVA = { rho: 1.14, mu: 1.85e-5 };
  const AKIS = 0.15e-3;  // m³/sn (0,15 L/sn)
  const PS = 8;          // örnek akciğer (ses tellerinin altı) basıncı, cmH2O
  const PA_CM = 98.07;
  function pipetBasinci(dMm, lCm) {
    const r = dMm / 2000, L2 = lCm / 100, A = Math.PI * r * r;
    const poi = (8 * HAVA.mu * L2 * AKIS) / (Math.PI * r ** 4);
    const ber = 0.5 * HAVA.rho * (AKIS / A) ** 2;
    return (poi + ber) / PA_CM;
  }

  window.Demos.nedenIsinma = (stage) => {
    let pipet = true, d = 5, l = 15;
    const modSeg = seg([["yok", "Pipetsiz"], ["pipet", "Pipetle"]], "pipet", (k) => { pipet = k === "pipet"; guncelle(); }, "Pipet");
    const dSl = L.slider({ label: "Pipet çapı", min: 2.5, max: 8, step: 0.5, value: d, fmt: (v) => L.fmtNum(v, 1) + " mm", oninput: (v) => { d = v; pipetAc(); } });
    const lSl = L.slider({ label: "Pipet uzunluğu", min: 5, max: 30, step: 1, value: l, fmt: (v) => v + " cm", oninput: (v) => { l = v; pipetAc(); } });
    function pipetAc() { if (!pipet) { pipet = true; modSeg.set("pipet"); } guncelle(); }
    const cv = h("canvas", { "aria-hidden": "true" });
    const sayfa = h("div.sheet.pipet-sayfa", cv);
    const olc = h("div.olcumler");
    const not = h("p.note-msg");
    stage.append(h("div.controls", modSeg, dSl, lSl), sayfa, olc, not);
    let W = 0, H = 0;
    const S = L.canvas(cv, (st) => { W = st.w; H = st.h; ciz(); });

    function degerler() {
      const po = pipet ? Math.min(pipetBasinci(d, l), PS * 0.95) : 0.05;
      const ham = pipet ? pipetBasinci(d, l) : 0.05;
      return { po, ham, fark: PS - po };
    }
    function guncelle() {
      const v = degerler();
      olc.innerHTML = "";
      olc.append(
        h("div.olcum", h("b", L.fmtNum(PS, 0) + " cmH₂O"), h("small", "akciğer basıncı (örnek)")),
        h("div.olcum.pes", h("b", L.fmtNum(v.po, 1) + " cmH₂O"), h("small", "ağız içi geri basınç")),
        h("div.olcum.tam", h("b", L.fmtNum(v.fark, 1) + " cmH₂O"), h("small", "ses tellerine düşen fark")));
      not.classList.toggle("warn", v.ham > PS * 0.8);
      not.textContent = !pipet
        ? "Ağız açıkken ağız içi basınç neredeyse sıfır: akciğer basıncının hepsi ses tellerinin üzerinde düşer."
        : v.ham > PS * 0.8
          ? "Bu pipet çok dar: geri basınç neredeyse akciğer basıncına eşit, ses tellerine düşen fark çok azalır. Ses zor başlar ya da kesilir; biraz daha kalın bir pipet deneyin."
          : v.po < 0.6
            ? "Kalın ve kısa bir pipet havayı az frenler: etkisi açık ağza yakın."
            : `Pipet havayı frenliyor: ağız içinde ${L.fmtNum(v.po, 1)} cmH₂O geri basınç oluşuyor, ses tellerine düşen fark ${L.fmtNum(v.fark, 1)} cmH₂O'ya iniyor. Çapı küçültmek basıncı uzunluktan çok daha hızlı artırır.`;
      ciz();
    }

    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const v = degerler();
      const sol = 58, sag = W - 14;
      const gy0 = 22, gy1 = H * 0.56;         // basınç grafiği
      const ty = H * 0.8;                      // tüp ekseni
      const X = (f) => sol + f * (sag - sol);
      const pY = (p) => gy1 - (p / 10) * (gy1 - gy0);
      // konumlar
      const xAk0 = X(0), xAk1 = X(0.17), xTel = X(0.33), xDud = X(0.58);
      const pipetUz = pipet ? (0.06 + 0.32 * (l - 5) / 25) : 0;
      const xPip = X(Math.min(0.98, 0.58 + pipetUz));
      // ızgara
      for (let p = 0; p <= 10; p += 2) {
        ctx.strokeStyle = rgba(C.porte, p === 0 ? 0.9 : 0.45); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sol, Math.round(pY(p)) + 0.5); ctx.lineTo(sag, Math.round(pY(p)) + 0.5); ctx.stroke();
        L.text(ctx, String(p), sol - 8, pY(p) + 4, { size: 11, color: C.muted, align: "right", font: FONT.mono });
      }
      L.text(ctx, "basınç (cmH₂O)", sol, 13, { size: 11, color: C.muted, weight: 600 });
      // basınç profili
      const prof = [[xAk0, PS], [xTel - 6, PS], [xTel + 6, v.po], [xDud, v.po], [pipet ? xPip : xDud + 8, 0], [sag, 0]];
      ctx.beginPath();
      ctx.moveTo(prof[0][0], pY(0));
      prof.forEach(([x, p]) => ctx.lineTo(x, pY(p)));
      ctx.lineTo(sag, pY(0)); ctx.closePath();
      ctx.fillStyle = rgba(C.fosfor, 0.35); ctx.fill();
      ctx.beginPath();
      prof.forEach(([x, p], i) => (i ? ctx.lineTo(x, pY(p)) : ctx.moveTo(x, pY(p))));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.lineJoin = "round"; ctx.stroke();
      // ses tellerindeki fark: köşeli ayraç
      const bx = xTel + 16;
      ctx.strokeStyle = C.tam; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 5, pY(PS)); ctx.lineTo(bx, pY(PS)); ctx.lineTo(bx, pY(v.po)); ctx.lineTo(bx - 5, pY(v.po)); ctx.stroke();
      L.text(ctx, "ses tellerine düşen fark", bx + 8, (pY(PS) + pY(v.po)) / 2 + 4, { size: 12, color: C.tam, weight: 700 });
      if (v.po > 0.3) {
        L.text(ctx, "ağız içi geri basınç", bx + 8, pY(v.po) + 16, { size: 12, color: C.pes, weight: 700 });
      }
      // dikey kılavuzlar
      ctx.setLineDash([3, 4]); ctx.strokeStyle = rgba(C.grafit, 0.5); ctx.lineWidth = 1;
      [xTel, xDud].concat(pipet ? [xPip] : []).forEach((x) => { ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, ty + 30); ctx.stroke(); });
      ctx.setLineDash([]);
      // tüp şeması
      const ink = C.ink;
      ctx.strokeStyle = ink; ctx.lineWidth = 2;
      // akciğer
      ctx.beginPath(); ctx.ellipse((xAk0 + xAk1) / 2, ty, (xAk1 - xAk0) / 2, 30, 0, 0, TAU);
      ctx.fillStyle = rgba(C.fosfor, 0.4); ctx.fill(); ctx.stroke();
      // nefes borusu
      const tb = 7, yb = 19;
      ctx.beginPath(); ctx.moveTo(xAk1 - 2, ty - tb); ctx.lineTo(xTel, ty - tb); ctx.moveTo(xAk1 - 2, ty + tb); ctx.lineTo(xTel, ty + tb); ctx.stroke();
      // ses telleri: iki üçgen
      ctx.fillStyle = ink;
      ctx.beginPath(); ctx.moveTo(xTel - 3, ty - yb); ctx.lineTo(xTel + 3, ty - yb); ctx.lineTo(xTel, ty - 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(xTel - 3, ty + yb); ctx.lineTo(xTel + 3, ty + yb); ctx.lineTo(xTel, ty + 2); ctx.closePath(); ctx.fill();
      // gırtlaktan dudağa ses yolu (genişleyen)
      ctx.beginPath();
      ctx.moveTo(xTel, ty - tb); ctx.bezierCurveTo(xTel + 30, ty - yb, xDud - 40, ty - 22, xDud, ty - 16);
      ctx.moveTo(xTel, ty + tb); ctx.bezierCurveTo(xTel + 30, ty + yb, xDud - 40, ty + 22, xDud, ty + 16);
      ctx.stroke();
      // dudaklar
      const dud = pipet ? Math.max(2.5, d * 0.9) : 9;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(xDud, ty - 18); ctx.lineTo(xDud, ty - dud); ctx.moveTo(xDud, ty + 18); ctx.lineTo(xDud, ty + dud); ctx.stroke();
      ctx.lineWidth = 2;
      if (pipet) {
        const r = d * 0.9;
        ctx.fillStyle = rgba(C.pes, 0.12);
        ctx.fillRect(xDud, ty - r, xPip - xDud, 2 * r);
        ctx.strokeStyle = C.pes;
        ctx.beginPath(); ctx.moveTo(xDud, ty - r); ctx.lineTo(xPip, ty - r); ctx.moveTo(xDud, ty + r); ctx.lineTo(xPip, ty + r); ctx.stroke();
      }
      // hava akışı okları
      ctx.fillStyle = rgba(C.grafit, 0.7);
      [(xAk1 + xTel) / 2, (xTel + xDud) / 2].forEach((x) => { ctx.beginPath(); ctx.moveTo(x - 5, ty - 4); ctx.lineTo(x + 5, ty); ctx.lineTo(x - 5, ty + 4); ctx.fill(); });
      // etiketler
      const et = (s2, x, renk = C.muted) => L.text(ctx, s2, x, ty + 50, { size: 12, color: renk, align: "center", weight: 700 });
      et("akciğer", (xAk0 + xAk1) / 2);
      et("ses telleri", xTel, C.ink);
      et("ağız", (xTel + xDud) / 2 + 20);
      if (pipet) et("pipet", (xDud + xPip) / 2, C.pes); else et("açık ağız", xDud + 30);
    }
    window.addEventListener("themechange", ciz);
    guncelle();
    return { enter() { S.fit(); guncelle(); } };
  };
  window.GuideScenarios["neden-isinma"] = [{ slide: "label:Pipet çapı", to: 3 }, { wait: 600 }, { slide: "label:Pipet uzunluğu", to: 28 }, { wait: 600 }, { click: "=Pipetsiz" }];

  /* ================= Isınma rutini ================= */
  // Kalıp: [{n (yarım ses), d (sn), kay (sn: önceki notadan kayarak gelme süresi)}]; hepsi bu site için yazıldı
  const ADIM = {
    dudak: { ad: "Dudak titretme", hece: "brrr", nasil: "Dudaklar gevşek, \"brrr\" diye titreterek kayın. Dudaklar durursa işaret parmaklarınızla yanaklarınızı hafifçe destekleyin.",
      kalip: [{ n: 0, d: 0.5 }, { n: 4, d: 0.5, kay: 0.2 }, { n: 7, d: 0.7, kay: 0.22 }, { n: 4, d: 0.5, kay: 0.2 }, { n: 0, d: 0.9, kay: 0.2 }], ses: { unlu: "u", nefes: 0.3, gurluk: 0.45 } },
    mirilti: { ad: "Mırıldanma", hece: "mmm", nasil: "Dudaklar kapalı, dişler ayrık, dil rahat: \"mmm\". Titreşimi dudaklarda ve burnun çevresinde hissedin; gür değil, hafif.",
      kalip: [0, 2, 4, 5, 7, 5, 4, 2, 0].map((n, i, a) => ({ n, d: i === a.length - 1 ? 0.9 : 0.34, kay: i ? 0.05 : 0 })), ses: { unlu: "u", nazal: 0.85, gurluk: 0.4 } },
    pipet: { ad: "Pipetle söyleme", hece: "uuu", nasil: "Pipeti dudaklarla hafifçe sarın, pipete \"uuu\" deyin ve kaydırın. Yanaklar şişmesin; hava yalnızca pipetten çıksın.",
      kalip: [{ n: 0, d: 0.5 }, { n: 7, d: 1.0, kay: 0.8 }, { n: 0, d: 1.2, kay: 0.8 }], ses: { unlu: "u", gurluk: 0.35, karanlik: 0.6 } },
    siren: { ad: "Siren", hece: "uuu", nasil: "\"uuu\" ya da \"ng\" ile pesten tize, sonra geri: kesmeden, ambulans sireni gibi kayın. Tepede zorlamayın; ses incelirse inceltin.",
      kalip: [{ n: 0, d: 0.4 }, { n: 12, d: 1.8, kay: 1.6 }, { n: 0, d: 2.0, kay: 1.7 }], ses: { unlu: "u", gurluk: 0.45 } },
    besli: { ad: "Beşli kaydırma", hece: "a", nasil: "\"a\" ile alt notadan beşliye kayarak çıkın, kısa tutun, kayarak inin. Çene ve dil rahat.",
      kalip: [{ n: 0, d: 0.6 }, { n: 7, d: 0.9, kay: 0.35 }, { n: 0, d: 1.0, kay: 0.35 }], ses: { unlu: "a", gurluk: 0.55 } },
    oktav: { ad: "Oktav kaydırma", hece: "a", nasil: "\"a\" ile bir oktav kayarak çıkıp inin. Tepede sesi hafifletin; kırılırsa sorun değil, yumuşakça devam edin.",
      kalip: [{ n: 0, d: 0.6 }, { n: 12, d: 1.0, kay: 0.45 }, { n: 0, d: 1.1, kay: 0.45 }], ses: { unlu: "a", gurluk: 0.5 } },
    soguma: { ad: "Sakin mırıldanma", hece: "mmm", nasil: "Soğuma: yukarıdan aşağı, çok hafif \"mmm\". Sesi bırakın, dinlendirin.",
      kalip: [7, 5, 4, 2, 0].map((n, i, a) => ({ n, d: i === a.length - 1 ? 1.1 : 0.45, kay: i ? 0.05 : 0 })), ses: { unlu: "u", nazal: 0.85, gurluk: 0.32 } },
  };
  const RUTIN = {
    5: [["dudak", 60], ["mirilti", 60], ["pipet", 60], ["siren", 60], ["besli", 60]],
    10: [["dudak", 90], ["mirilti", 90], ["pipet", 120], ["siren", 90], ["besli", 120], ["oktav", 90]],
    15: [["dudak", 120], ["mirilti", 120], ["pipet", 150], ["siren", 150], ["besli", 150], ["oktav", 150], ["soguma", 60]],
  };
  const sureYaz = (sn) => { sn = Math.max(0, Math.ceil(sn)); return Math.floor(sn / 60) + ":" + String(sn % 60).padStart(2, "0"); };
  const aralikGen = (def) => Math.max(...def.kalip.map((k) => k.n)) - Math.min(...def.kalip.map((k) => k.n));
  // Kalıbı başlangıç notasına göre sentez notalarına ve hedef bantlarına çevir (kaymalar 50 ms'lik basamaklarla)
  function kalipNotalar(def, bas) {
    const out = [];
    let once = null;
    for (const k of def.kalip) {
      const m = bas + k.n;
      if (k.kay && once != null) {
        const adet = Math.max(2, Math.round(k.kay / 0.05));
        for (let i = 1; i <= adet; i++) out.push({ m: once + (m - once) * (i / adet), d: k.kay / adet, u: def.ses.unlu, glide: 0.06, kay: true });
        out.push({ m, d: Math.max(0.1, k.d - k.kay), u: def.ses.unlu, glide: 0.05 });
      } else out.push({ m, d: k.d, u: def.ses.unlu, glide: 0.04 });
      once = m;
    }
    return out;
  }
  function hedefBantlar(notalar, t0, aktif, hece) {
    const out = [];
    let t = t0, ilk = true;
    for (const n of notalar) {
      out.push({ t0: t, t1: t + n.d, m: n.m, hece: !n.kay && ilk ? hece : undefined, aktif });
      if (!n.kay) ilk = false;
      t += n.d;
    }
    return out;
  }
  // Başlangıç notaları: aralığın alt bölgesinden üst bölgesine yarım ses yarım ses, sonra geri
  function dizi(def) {
    const a = Aralik.get(), sp = aralikGen(def), mn = Math.min(...def.kalip.map((k) => k.n));
    const lo = a.lo + 2 - mn, hi = a.hi - 2 - sp - mn;
    if (hi <= lo) return [Math.round((a.lo + a.hi) / 2 - sp / 2 - mn)];
    const s0 = lo + Math.round((hi - lo) * 0.1), s1 = lo + Math.round((hi - lo) * 0.85);
    const out = [];
    for (let m = s0; m <= s1; m++) out.push(m);
    for (let m = s1 - 1; m > s0; m--) out.push(m);
    return out;
  }

  window.Demos.isinma = (stage) => {
    let rutin = L.store.get("isinmaSure", 10);
    if (!RUTIN[rutin]) rutin = 10;
    let oranlar = [], adimlar = [], ai = 0, calisiyor = false, timers = [], iptal = null, raf = 0, sonT = 0, gecen = 0, kaydedildi = false, micOff = null;
    function kur() {
      adimlar = RUTIN[rutin].map(([id, sn]) => ({ id, sure: sn, kalan: sn, tekrar: 0, bitti: false }));
      ai = 0; gecen = 0; kaydedildi = false;
    }
    kur();
    const tip = () => (L.prefs.sesBolge === "pes" ? "erkek" : "kadin");

    const basBtn = ibtn("play", "Başla", () => toggle(), "primary");
    const sureSeg = seg([[5, "5 dk"], [10, "10 dk"], [15, "15 dk"]], rutin, (k) => {
      dur(); kisminKaydet(); rutin = k; L.store.set("isinmaSure", k); kur(); listeYaz(); onizle(); bilgiYaz(); etiket();
    }, "Rutin süresi");
    const atlaBtn = btn("Sonraki adım", () => sonraki());
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri();
    const liste = h("ol.isinma-liste", { "aria-label": "Rutin adımları" });
    const baslik = h("div.isinma-baslik");
    const sayfa = h("div.sheet.egri-kap");
    const nasil = h("p.note-msg.isinma-nasil");
    stage.append(h("div.controls", basBtn, sureSeg, atlaBtn, h("span.spacer"), durumEl), ms.el,
      h("div.isinma-govde", h("div.isinma-yan", baslik, liste), sayfa), nasil, Egri.anahtar());
    const egri = Egri(sayfa, { mod: "sabit", sure: 8, tol: 35 });

    function listeYaz() {
      liste.innerHTML = "";
      adimlar.forEach((a, i) => {
        const def = ADIM[a.id];
        const b = h("button.isinma-adim" + (i === ai && !tamam() ? ".simdi" : "") + (a.bitti ? ".bitti" : ""), { type: "button", onclick: () => git(i) },
          h("span.ia-no", String(i + 1)), h("span.ia-ad", def.ad), h("span.ia-sure", a.bitti ? "✓" : i === ai && a.kalan < a.sure ? sureYaz(a.kalan) : sureYaz(a.sure)));
        liste.append(h("li", b));
      });
    }
    const tamam = () => ai >= adimlar.length;
    function bilgiYaz() {
      baslik.innerHTML = "";
      if (tamam()) {
        baslik.append(h("b", "Isınma tamam"), h("small", haftaSoz()));
        nasil.textContent = "Tebrikler. Sesiniz hazır; şimdi bir perde alıştırmasına ya da şarkıya geçebilirsiniz.";
        return;
      }
      const a = adimlar[ai], def = ADIM[a.id];
      const kalanTop = adimlar.slice(ai).reduce((s, x) => s + x.kalan, 0);
      baslik.append(h("b", sureYaz(a.kalan)), h("small", `${ai + 1}/${adimlar.length} · ${def.ad} · toplam kalan ${sureYaz(kalanTop)}`));
      nasil.textContent = def.nasil;
    }
    function haftaSoz() {
      const g = L.store.get("isinma", []);
      const hafta = g.filter((x) => Date.now() - x.tarih < 7 * 864e5);
      return hafta.length ? `Son 7 günde ${hafta.length} ısınma, toplam ${Math.round(hafta.reduce((s, x) => s + (x.dakika || 0), 0))} dakika.` : "Bu tarayıcıda henüz kayıtlı ısınma yok.";
    }
    function kaydet(dakika) {
      if (kaydedildi || dakika < 1) return;
      const g = L.store.get("isinma", []);
      g.push({ tarih: Date.now(), dakika });
      L.store.set("isinma", g.slice(-200));
      kaydedildi = true;
    }
    // yarıda bırakılan rutin: en az 2 dakika çalışıldıysa yapılan kadarı kaydedilir
    function kisminKaydet() { if (!kaydedildi && gecen >= 120) kaydet(Math.round(gecen / 60)); dogrulukYaz(); }

    function onizle() {
      if (calisiyor) return;
      const a = adimlar[Math.min(ai, adimlar.length - 1)], def = ADIM[a.id];
      const dz = dizi(def), bas = dz[Math.min(a.tekrar, dz.length - 1) % dz.length];
      const ns = kalipNotalar(def, bas);
      const top = ns.reduce((s2, n) => s2 + n.d, 0);
      egri.mod("sabit"); egri.sure(top + 0.4); egri.temizle(); egri.katmanSil();
      egri.aralik(bas + Math.min(...def.kalip.map((k) => k.n)) - 3, bas + Math.max(...def.kalip.map((k) => k.n)) + 3);
      egri.hedefler(hedefBantlar(ns, 0, true, def.hece));
      egri.imlec(null); egri.ciz();
      durumEl.textContent = tamam() ? "" : "Örnek: " + nn(bas) + " başlangıç";
    }

    const bekle = (ms2) => new Promise((res, rej) => { const id = setTimeout(res, ms2); timers.push(id); iptal = () => { clearTimeout(id); rej("iptal"); }; });

    // bir tekrar: dinle (kulaklık yoksa) → söyle
    async function tekrar(def, bas) {
      const c = Snd.ctx;
      const ns = kalipNotalar(def, bas);
      const top = ns.reduce((s2, n) => s2 + n.d, 0);
      const birlikte = L.prefs.kulaklik;
      const tDinle = birlikte ? 0 : top + 0.5;
      const T = tDinle + top;
      const t0 = c.currentTime + 0.2;
      egri.mod("sabit"); egri.sure(T + 0.3); egri.temizle(); egri.basla(t0);
      egri.hedefler(birlikte ? hedefBantlar(ns, 0, true, def.hece) : hedefBantlar(ns, 0, false, def.hece).concat(hedefBantlar(ns, tDinle, true, def.hece)));
      cancelAnimationFrame(raf);
      const imlec = () => { egri.imlec(c.currentTime - t0); raf = requestAnimationFrame(imlec); };
      imlec();
      const mic = Mic.state === "on";
      if (mic && !micOff) micOff = egri.dinle();
      const ses = Object.assign({ tip: tip(), when: t0 - Ses.BAS, vibGen: 0, jitter: 0.002, gain: 0.95 }, def.ses);
      const cal = Ses.soyle(ns.map((n) => ({ m: n.m, d: n.d, u: n.u, glide: n.glide })), ses);
      if (cal) Snd.own(cal);
      if (mic && !birlikte) {
        Mic.bekle("referans", true);
        timers.push(setTimeout(() => Mic.bekle("referans", false), (t0 + top - c.currentTime + 0.25) * 1000));
      }
      durumEl.textContent = birlikte ? "Birlikte söyleyin" : "Dinleyin…";
      if (!birlikte) {
        await bekle((t0 + tDinle - 0.3 - c.currentTime) * 1000);
        durumEl.textContent = "Şimdi siz: " + def.hece;
        egri.durum("Şimdi siz", { buyuk: true });
        timers.push(setTimeout(() => egri.durum(null), 800));
      }
      await bekle((t0 + T - c.currentTime + 0.5) * 1000);
      cancelAnimationFrame(raf);
      // mikrofon açıksa: tutulan notalarda (kaymalar sayılmaz) hedef bandın içinde kalma oranı
      if (mic) {
        const kareler = egri.noktalar.map((p) => ({ t: p.t, sesli: !isNaN(p.m), midi: p.m }));
        const hs = hedefBantlar(ns, tDinle, true, def.hece).filter((x, i) => !ns[i].kay && x.t1 - x.t0 >= 0.25);
        const sn = Alistirma.puanla(kareler, hs, 35);
        if (sn.soylendi) { oranlar.push(sn.genel); durumEl.textContent = `Bantta: %${Math.round(sn.genel * 100)}`; }
      }
    }
    // oturumun perde doğruluğu (ilerleme slaytı için): en az iki ölçülmüş tekrar varsa ortalaması
    function dogrulukYaz() {
      if (oranlar.length >= 2) Alistirma.dogrulukKaydet("isinma", oranlar.reduce((a, b) => a + b, 0) / oranlar.length);
      oranlar = [];
    }

    async function calistir() {
      if (calisiyor) return;
      Snd.unlock();
      if (!Snd.ready()) return;
      if (tamam()) kur();
      calisiyor = true;
      basBtn.setLabel("Durdur"); basBtn.setIcon("stop");
      sonT = performance.now();
      const say = () => {
        const now = performance.now(), dt = (now - sonT) / 1000; sonT = now;
        if (calisiyor && !tamam()) { adimlar[ai].kalan = Math.max(0, adimlar[ai].kalan - dt); gecen += dt; bilgiYaz(); const el = liste.querySelector(".simdi .ia-sure"); if (el) el.textContent = sureYaz(adimlar[ai].kalan); }
        if (calisiyor) timers.push(setTimeout(say, 250));
      };
      say();
      listeYaz();
      try {
        while (calisiyor && !tamam()) {
          const a = adimlar[ai], def = ADIM[a.id], dz = dizi(def);
          egri.aralik(Math.min(...dz) + Math.min(...def.kalip.map((k) => k.n)) - 3, Math.max(...dz) + Math.max(...def.kalip.map((k) => k.n)) + 3);
          nasil.textContent = def.nasil;
          while (calisiyor && a.kalan > 0) {
            await tekrar(def, dz[a.tekrar % dz.length]);
            a.tekrar++;
            await bekle(400);
          }
          if (!calisiyor) break;
          a.bitti = true; a.kalan = 0; ai++;
          listeYaz(); bilgiYaz();
        }
        if (calisiyor && tamam()) {
          kaydet(rutin);
          dogrulukYaz();
          durumEl.textContent = "";
          egri.durum("Isınma tamam", { buyuk: true });
          timers.push(setTimeout(() => egri.durum(null), 2500));
          L.toast(`Isınma tamam: ${rutin} dakika. ${haftaSoz()}`);
        }
      } catch (e) { if (e !== "iptal") console.error(e); }
      calisiyor = false;
      micOff && micOff(); micOff = null;
      etiket(); listeYaz(); bilgiYaz();
    }
    function dur() {
      if (!calisiyor) return;
      calisiyor = false;
      timers.forEach(clearTimeout); timers = [];
      iptal && iptal();
      cancelAnimationFrame(raf);
      micOff && micOff(); micOff = null;
      Snd.stopAll();
      Mic.bekle("referans", false);
      egri.durum(null);
      durumEl.textContent = "";
    }
    function git(i) {
      const vardi = calisiyor;
      dur();
      for (let k = 0; k < i; k++) if (!adimlar[k].bitti && k >= ai) adimlar[k].bitti = true;
      ai = Math.max(0, Math.min(i, adimlar.length - 1));
      adimlar[ai].bitti = false; if (adimlar[ai].kalan <= 0) adimlar[ai].kalan = adimlar[ai].sure;
      listeYaz(); bilgiYaz();
      if (vardi) setTimeout(calistir, 50); else { etiket(); onizle(); }
    }
    function sonraki() {
      if (tamam()) return;
      if (ai + 1 >= adimlar.length) {
        const vardi = calisiyor; dur();
        adimlar[ai].bitti = true; adimlar[ai].kalan = 0; ai++;
        if (vardi || gecen > 0) { kaydet(Math.round(gecen / 60)); dogrulukYaz(); }
        listeYaz(); bilgiYaz(); etiket();
        return;
      }
      git(ai + 1);
    }
    function toggle() { if (calisiyor) { dur(); etiket(); } else calistir(); }
    function etiket() {
      const yarim = adimlar.some((a) => a.kalan < a.sure);
      basBtn.setLabel(calisiyor ? "Durdur" : tamam() ? "Yeniden başla" : yarim ? "Devam et" : "Başla");
      basBtn.setIcon(calisiyor ? "stop" : "play");
    }
    window.addEventListener("aralikchange", () => { if (!calisiyor) onizle(); });
    listeYaz(); bilgiYaz();
    return {
      enter() { egri.baslat(); listeYaz(); bilgiYaz(); onizle(); },
      leave() { dur(); kisminKaydet(); egri.durdur(); },
      toggle,
    };
  };
  window.GuideScenarios["isinma"] = [{ click: "=5 dk" }, { wait: 700 }, { click: "=15 dk" }, { wait: 700 }, { click: "=10 dk" }];

  /* ================= Ses sağlığı ================= */
  const KARTLAR = [
    { iddia: "Bal-limon sesi iyileştirir.", dogru: false, hukum: "Kanıt yok",
      yanit: "Ilık bir içecek boğazı rahatlatabilir; ama yutulan hiçbir şey ses tellerine değmez, yemek borusuna gider. Ses tellerini nemli tutan asıl şey vücudun genel sıvı dengesidir. Bal-limonun sesi iyileştirdiğini gösteren kontrollü bir çalışma bilmiyoruz.",
      kaynak: "Anatomi ders kitabı bilgisi; sıvı dengesi: Alves ve ark. 2019" },
    { iddia: "Sık sık boğaz temizlemek zararsızdır.", dogru: false, hukum: "Uzman görüşü: kaçının",
      yanit: "Ses hijyeni programları sık boğaz temizlemekten kaçınmayı önerir; bu sırada ses tellerinin birbirine sertçe çarptığı düşünülür. Yerine bir yudum su içmek ya da yutkunmak önerilir. Bu konuda doğrudan kontrollü bir çalışma bulamadık: öneri uzman görüşüdür.",
      kaynak: "Ses hijyeni önerileri (uzman görüşü)" },
    { iddia: "Ses kısılınca fısıldamak sesi korur.", dogru: false, hukum: "Herkes için değil",
      yanit: "100 hastalık bir incelemede fısıltı sırasında hastaların %69'unda gırtlaktaki sıkışma arttı, %18'inde değişmedi, %13'ünde azaldı. Yani fısıltı çoğu kişide daha fazla zorlanma demek. Sesinizi nasıl dinlendireceğinizi bir KBB uzmanına ya da dil ve konuşma terapistine sorun.",
      kaynak: "Rubin ve ark. 2006" },
    { iddia: "Yeterince su içmek sese iyi gelir.", dogru: true, hukum: "Doğru",
      yanit: "Vücudun susuz kalması (oruç, az sıvı) ses ölçümlerini kötüleştiriyor. Ağızdan solurken ses tellerinin yüzeyi kuruyunca sesi başlatmak zorlaşıyor; buhar solumak bazı ölçümleri iyileştiriyor.",
      kaynak: "Alves ve ark. 2019 (sistematik derleme)" },
    { iddia: "Kahve ve çay sesi kurutur, hiç içmemeli.", dogru: false, hukum: "Kanıt desteklemiyor",
      yanit: "Aynı derlemeye göre kafein alımı ses üretimini olumsuz etkilemiyor gibi görünüyor. Yine de gün boyu yeterince su içmek önemlidir.",
      kaynak: "Alves ve ark. 2019" },
    { iddia: "Bağırmak sesi güçlendirir; ses telleri alışır.", dogru: false, hukum: "Yanlış",
      yanit: "Gür seste ses telleri birbirine daha sert çarpar. Sık ve uzun bağırmak ses yorgunluğuna ve kısıklığa yol açabilir. Gürlük zorlanmadan, nefesle desteklenerek ve yavaş yavaş çalışılır.",
      kaynak: "Ders kitabı bilgisi (Titze 1994)" },
    { iddia: "Sigara sesi etkilemez.", dogru: false, hukum: "Yanlış",
      yanit: "Solunan duman, yutulan yiyeceklerin aksine, doğrudan ses tellerinin üzerinden geçer. Amerikan KBB kılavuzu sigara öyküsünü, ses kısıklığında beklemeden muayene gerektiren risk etkenleri arasında sayar.",
      kaynak: "Stachler ve ark. 2018 (AAO-HNS kılavuzu)" },
    { iddia: "Ses kısıklığı 4 haftada geçmezse KBB'ye görünmek gerekir.", dogru: true, hukum: "Doğru",
      yanit: "Kılavuz, 4 hafta içinde düzelmeyen ses kısıklığında gırtlağın muayene edilmesini önerir. Şarkıcılar ve sesini meslek olarak kullananlar için daha erken başvurmak makuldür.",
      kaynak: "Stachler ve ark. 2018 (AAO-HNS kılavuzu)" },
  ];

  // Fısıltı: beyaz gürültü + ünlünün formant süzgeçleri (titreşim yok). Normal: kaynak–süzgeç sentezi.
  const SG_SR = 22050, UNLU = ["a", "e", "i", "o", "u"], UD = 0.42, UB = 0.1;
  const sgOnbellek = {};
  function fisilti(tip) {
    const k = "f" + tip; if (sgOnbellek[k]) return sgOnbellek[k];
    const sr = SG_SR, top = Ses.BAS + UNLU.length * (UD + UB) + 0.2, n = Math.round(top * sr);
    const out = new Float32Array(n), rnd = Ses.rng(31);
    UNLU.forEach((u, j) => {
      const fs = Ses.hedefFormant({ tip, unlu: u });
      const co = fs.map(([f, b]) => Ses.resCoef(Math.min(f, sr * 0.45), b * 1.6, sr));
      const st = fs.map(() => [0, 0]);
      const i0 = Math.round((Ses.BAS + j * (UD + UB)) * sr), i1 = i0 + Math.round(UD * sr);
      let onceki = 0;
      for (let i = i0; i < i1 && i < n; i++) {
        const t = (i - i0) / sr, env = Math.min(1, t / 0.04, (UD - t) / 0.06);
        let x = rnd();
        const y0 = x - 0.7 * onceki; onceki = x; x = y0; // hafif ön vurgu
        for (let q = 0; q < co.length; q++) { const [A, B, Cc] = co[q], s2 = st[q]; const y = A * x + B * s2[0] + Cc * s2[1]; s2[1] = s2[0]; s2[0] = y; x = y; }
        out[i] = x * env;
      }
    });
    normalle(out, 0.08);
    return (sgOnbellek[k] = out);
  }
  function normal(tip) {
    const k = "n" + tip; if (sgOnbellek[k]) return sgOnbellek[k];
    const bas = tip === "erkek" ? 48 : 57;
    const ns = [];
    UNLU.forEach((u, j) => { ns.push({ m: bas + [0, 1, 2, 1, -1][j], d: UD, u }); ns.push({ r: UB }); });
    const r = Ses.ezgi(SG_SR, ns, { tip, gurluk: 0.55, vibGen: 0, jitter: 0.003 });
    const out = r.data;
    normalle(out, 0.08);
    return (sgOnbellek[k] = out);
  }
  function normalle(x, hedef) {
    let e = 0, c = 0;
    for (let i = 0; i < x.length; i++) if (x[i] !== 0) { e += x[i] * x[i]; c++; }
    const rms = Math.sqrt(e / (c || 1)) || 1, k = hedef / rms;
    for (let i = 0; i < x.length; i++) x[i] *= k;
  }

  window.Demos.sesSagligi = (stage) => {
    const cevap = new Array(KARTLAR.length).fill(null);
    let calan = null, calanTur = null;
    const nBtn = ibtn("play", "Normal ses", () => cal("normal"));
    const fBtn = ibtn("play", "Fısıltı", () => cal("fisilti"));
    const skor = h("span.readout");
    const hepsiBtn = btn("Hepsini göster", () => { KARTLAR.forEach((k, i) => { if (cevap[i] == null) cevap[i] = "goster"; }); yaz(); }, "sm ghost");
    const dalgaCv = h("canvas", { "aria-hidden": "true" });
    const dalga = h("div.sheet.sg-dalga", dalgaCv);
    const liste = h("div.sheet.sg-liste");
    stage.append(h("div.controls", nBtn, fBtn, h("span.spacer"), skor, hepsiBtn), dalga, liste);

    function yaz() {
      liste.innerHTML = "";
      let acik = 0, isabet = 0;
      KARTLAR.forEach((k, i) => {
        const c = cevap[i];
        const satir = h("div.sg-satir" + (c != null ? ".acik" : ""));
        satir.append(h("p.sg-iddia", h("span.sg-no", String(i + 1)), k.iddia));
        if (c == null) {
          satir.append(h("div.sg-btn",
            btn("Doğru", () => { cevap[i] = true; yaz(); }, "sm"),
            btn("Yanlış", () => { cevap[i] = false; yaz(); }, "sm")));
        } else {
          acik++;
          const tahmin = c === "goster" ? null : c;
          const tuttu = tahmin != null && tahmin === k.dogru;
          if (tuttu) isabet++;
          const isaret = tahmin == null ? "" : tuttu ? "Tahmininiz tuttu · " : "Tahmininiz: " + (tahmin ? "doğru" : "yanlış") + " · ";
          satir.append(h("div.sg-yanit",
            h("p.sg-hukum" + (k.dogru ? ".dogru" : ".yanlis"), h("small", isaret), k.hukum),
            h("p", k.yanit),
            h("p.kaynak", "Kaynak: " + k.kaynak)));
        }
        liste.append(satir);
      });
      skor.textContent = acik ? `${acik}/${KARTLAR.length} açık · ${isabet} tahmin tuttu` : `${KARTLAR.length} iddia`;
      hepsiBtn.hidden = acik === KARTLAR.length;
    }

    let W = 0, H = 0;
    const S = L.canvas(dalgaCv, (st) => { W = st.w; H = st.h; dalgaCiz(); });
    function dalgaCiz() {
      if (!W) return;
      const ctx = S.ctx, tip = L.prefs.sesBolge === "pes" ? "erkek" : "kadin";
      ctx.clearRect(0, 0, W, H);
      const parca = (veri, x0, w, etiket, aktif) => {
        const i0 = Math.round((Ses.BAS + 0.18) * SG_SR), n = Math.round(0.03 * SG_SR);
        let mx = 0; for (let i = i0; i < i0 + n; i++) mx = Math.max(mx, Math.abs(veri[i]));
        const data = Array.from(veri.subarray(i0, i0 + n), (v) => v / (mx || 1));
        L.trace(ctx, data, x0 + 8, 24, w - 16, H - 34, aktif ? C.ink : rgba(C.grafit, 0.75), aktif ? 2 : 1.4);
        L.text(ctx, etiket, x0 + 8, 15, { size: 12, color: aktif ? C.ink : C.muted, weight: 700 });
      };
      const yarim = W / 2;
      const dar = W < 640;
      parca(normal(tip), 0, yarim, dar ? "normal: düzenli dalga" : "normal ses: düzenli dalga (teller titreşiyor)", calanTur === "normal");
      parca(fisilti(tip), yarim, yarim, dar ? "fısıltı: gürültü" : "fısıltı: düzensiz gürültü (titreşim yok)", calanTur === "fisilti");
      ctx.fillStyle = rgba(C.porte, 0.8); ctx.fillRect(Math.round(yarim) - 0.5, 8, 1.5, H - 16);
    }
    function cal(tur) {
      Snd.unlock();
      calan && calan.stop();
      const tip = L.prefs.sesBolge === "pes" ? "erkek" : "kadin";
      calan = calSr(tur === "normal" ? normal(tip) : fisilti(tip), SG_SR, { gain: 0.95 });
      calanTur = tur; dalgaCiz();
      const ctl = calan;
      if (ctl) setTimeout(() => { if (calan === ctl) { calanTur = null; dalgaCiz(); } }, ctl.sure * 1000 + 200);
    }
    window.addEventListener("themechange", dalgaCiz);
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") dalgaCiz(); });
    yaz();
    return { enter() { dalgaCiz(); }, leave() { calan && calan.stop(); calan = null; calanTur = null; } };
  };
  window.GuideScenarios["ses-sagligi"] = [{ click: "=Fısıltı" }, { wait: 2800 }, { click: "=Normal ses" }, { wait: 2800 }, { click: "=Yanlış" }];
})();
