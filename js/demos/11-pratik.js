/* 11. Pratik: deneyler
   - gunlukPlan: 10/20/40 dakikalık planlar, adım adım zamanlayıcı (slayttan çıkınca da sayar), slayt bağlantıları.
   - kaydet: ezgi seç, dinle, kaydet (ses yalnızca bellekte), eski perde eğrileriyle üst üste karşılaştır.
   - ilerleme: L.store kayıtlarından tarihli grafikler; boşsa ilgili slayta davet; "verilerimi sil" (satır içi onay).
   - kapanis: aralık şeridi ve çalışma özeti. */
(function () {
  const { h, C, FONT, seg, ibtn, btn, nn, rgba, fmtNum, fmtCents, clamp, text, store, prefs } = L;
  const G = window.GuideScenarios;
  const olcum = (deger, etiket, cls = "") => h("div.olcum" + (cls ? "." + cls : ""), h("b", deger), h("small", etiket));
  const git = (id) => (e) => { e && e.preventDefault(); Deck.goId(id); };
  const liste = (k) => { const v = store.get(k, []); return Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []; };
  const tarihFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
  const saatFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const gunAnahtar = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  /* ================= Günlük çalışma ================= */
  const PLANLAR = {
    10: [
      { ad: "Isınma", dk: 4, id: "isinma", ne: "Dudak titretme, mırıldanma ve hafif sirenler." },
      { ad: "Nefes", dk: 1, id: "sss", ne: "Bir iki uzun \"sss\"." },
      { ad: "Perde eşleme", dk: 3, id: "perde-esleme", ne: "Tek nota, sonra iki nota." },
      { ad: "Soğuma", dk: 2, id: "isinma", ne: "Aşağı doğru hafif mırıltılar ve dudak titretme." },
    ],
    20: [
      { ad: "Isınma", dk: 6, id: "isinma", ne: "Dudak titretme, pipet, sirenler, beşli kaydırmaları." },
      { ad: "Nefes", dk: 2, id: "uzun-ses", ne: "\"sss\" ve rahat bir notada destekli uzun ses." },
      { ad: "Perde eşleme", dk: 4, id: "perde-esleme", ne: "Dar tolerans ve kısa diziler." },
      { ad: "Aralıklar", dk: 3, id: "araliklar", ne: "Aralık çal, söyle; majör gam." },
      { ad: "Ezgi", dk: 4, id: "ezgi", ne: "Bir ezgi ya da sevdiğiniz bir şarkı." },
      { ad: "Soğuma", dk: 1, id: "isinma", ne: "Aşağı doğru hafif mırıltılar." },
    ],
    40: [
      { ad: "Isınma", dk: 10, id: "isinma", ne: "Tam ısınma rutini." },
      { ad: "Nefes", dk: 4, id: "sss", ne: "\"sss\" ve destekli uzun ses." },
      { ad: "Perde eşleme", dk: 5, id: "perde-esleme", ne: "Bütün seviyeler." },
      { ad: "Kulak", dk: 5, id: "kulak-oyunu", ne: "Aralığı bul ve duyduğunu söyle." },
      { ad: "Geçiş bölgesi", dk: 5, id: "kirilma", ne: "Kırılmayı yumuşatma alıştırmaları." },
      { ad: "Şarkı", dk: 8, id: "ezgi", ne: "Bir ezgi ya da şarkı; tarzlardan birini deneyin." },
      { ad: "Kaydet", dk: 2, id: "kaydet", ne: "Bugünün ezgisini kaydedip dinleyin." },
      { ad: "Soğuma", dk: 1, id: "isinma", ne: "Aşağı doğru hafif mırıltılar." },
    ],
  };
  // zamanlayıcı durumu modül düzeyinde: slayttan çıkınca da sayar (zamana göre hesaplanır)
  const Z = { plan: 20, calisiyor: false, basT: 0, birikim: 0, adimBas: 0, adim: 0, bitti: false, saat: 0, gozlemci: null };
  const adimlar = () => PLANLAR[Z.plan];
  const gecen = () => Z.birikim + (Z.calisiyor ? (Date.now() - Z.basT) / 1000 : 0);
  // adım sınırları: elle "sonraki adım" denince adımın başı kayar (adimBas = o adımın başladığı geçen süre)
  function adimSure(i) { return adimlar()[i].dk * 60; }
  function guncelleAdim() {
    if (Z.bitti) return;
    const g = gecen();
    while (Z.adim < adimlar().length && g - Z.adimBas >= adimSure(Z.adim)) {
      Z.adimBas += adimSure(Z.adim);
      Z.adim++;
      if (Z.adim < adimlar().length) adimBildir();
    }
    if (Z.adim >= adimlar().length) bitir();
  }
  function adimBildir() {
    const a = adimlar()[Z.adim];
    const burada = Deck.id === "gunluk-plan";
    L.toast(`Sıradaki adım: ${a.ad} (${a.dk} dk)`, 4000);
    if (burada && Snd.running()) Snd.note(880, { type: "sine", dur: 0.25, gain: 0.12 });
    Z.gozlemci && Z.gozlemci();
  }
  function bitir() {
    if (Z.bitti) return;
    Z.bitti = true;
    Z.birikim = gecen(); Z.calisiyor = false; clearInterval(Z.saat);
    const g = liste("pratik");
    g.push({ tarih: Date.now(), dakika: Math.round(Z.birikim / 60), plan: Z.plan });
    store.set("pratik", g.slice(-200));
    L.toast("Günlük çalışma tamam. Eline sağlık!", 4000);
    Z.gozlemci && Z.gozlemci();
  }
  function zBaslat() {
    if (Z.bitti) zSifirla();
    Z.calisiyor = true; Z.basT = Date.now();
    clearInterval(Z.saat);
    Z.saat = setInterval(guncelleAdim, 1000);
  }
  function zDuraklat() { Z.birikim = gecen(); Z.calisiyor = false; clearInterval(Z.saat); }
  function zSifirla() { zDuraklat(); Z.birikim = 0; Z.adim = 0; Z.adimBas = 0; Z.bitti = false; }
  function zSonraki() {
    if (Z.bitti) return;
    if (Z.adim >= adimlar().length - 1) { bitir(); return; }
    Z.adimBas = gecen();
    Z.adim++;
    Z.gozlemci && Z.gozlemci();
  }

  window.Demos.gunlukPlan = (stage) => {
    const planSeg = seg(Object.keys(PLANLAR).map((k) => [+k, k + " dk"]), Z.plan, (k) => { zSifirla(); Z.plan = k; ciz(); }, "Plan");
    const basBtn = ibtn("play", "Başlat", () => toggle(), "primary");
    const sonBtn = btn("Sonraki adım", () => { zSonraki(); ciz(); }, "ghost");
    const sifBtn = btn("Sıfırla", () => { zSifirla(); ciz(); }, "ghost sm");
    const sayfa = h("div.sheet.gp-sayfa");
    const ust = h("div.gp-ust");
    const ol = h("ol.gp-liste");
    sayfa.append(ust, ol);
    stage.append(h("div.controls", planSeg, basBtn, sonBtn, sifBtn), sayfa);
    const satirlar = [];

    function ciz() {
      planSeg.set(Z.plan);
      const as = adimlar(), g = gecen(), toplam = as.reduce((a, x) => a + x.dk * 60, 0);
      const adimGecen = Z.bitti ? 0 : g - Z.adimBas;
      const kalan = Z.bitti ? 0 : Math.max(0, adimSure(Z.adim) - adimGecen);
      basBtn.setLabel(Z.calisiyor ? "Duraklat" : Z.bitti ? "Yeniden başlat" : g > 0 ? "Sürdür" : "Başlat");
      basBtn.setIcon(Z.calisiyor ? "stop" : "play");
      sonBtn.disabled = Z.bitti || (!Z.calisiyor && g === 0);
      ust.innerHTML = "";
      ust.append(h("div.olcumler",
        olcum(Z.bitti ? "Tamam" : mmss(kalan), Z.bitti ? "bugünün çalışması bitti" : `${as[Z.adim].ad}: kalan`, Z.bitti ? "tam" : ""),
        olcum(mmss(Math.min(g, toplam)) + " / " + mmss(toplam), "toplam"),
        olcum(Z.bitti ? as.length + "/" + as.length : `${Z.adim + 1}/${as.length}`, "adım")));
      if (ol.dataset.plan !== String(Z.plan)) {
        ol.dataset.plan = Z.plan;
        ol.innerHTML = ""; satirlar.length = 0;
        as.forEach((a, i) => {
          const bar = h("span.gp-bar");
          const li = h("li.gp-adim",
            h("span.gp-no", String(i + 1)),
            h("div.gp-govde", h("b", a.ad), h("span.gp-ne", a.ne)),
            h("span.gp-dk.mono", a.dk + " dk"),
            h("a.btn.sm.ghost.gp-git", { href: "#" + a.id, onclick: git(a.id) }, "Slayta git →"),
            bar);
          ol.append(li); satirlar.push({ li, bar });
        });
      }
      satirlar.forEach(({ li, bar }, i) => {
        const durum = Z.bitti || i < Z.adim ? "bitti" : i === Z.adim && g > 0 ? "simdi" : "";
        li.classList.toggle("bitti", durum === "bitti");
        li.classList.toggle("simdi", durum === "simdi");
        bar.style.width = (durum === "bitti" ? 100 : durum === "simdi" ? clamp(adimGecen / adimSure(i), 0, 1) * 100 : 0) + "%";
      });
    }
    function toggle() {
      Snd.unlock();
      if (Z.calisiyor) zDuraklat(); else zBaslat();
      ciz();
    }
    const dongu = L.loop((dt, t) => { if (!dongu.son || t - dongu.son > 0.25) { dongu.son = t; ciz(); } });
    Z.gozlemci = () => { if (Deck.id === "gunluk-plan") ciz(); };
    ciz();
    return { enter() { guncelleAdim(); ciz(); dongu.start(); }, leave() { dongu.stop(); }, toggle };
  };
  G["gunluk-plan"] = [{ click: "=10 dk" }, { wait: 700 }, { click: "=40 dk" }, { wait: 700 }, { click: "=20 dk" }];

  /* ================= Kendini kaydet ================= */
  window.Demos.kaydet = (stage) => {
    let ezgiId = store.get("kaydet.ezgi", "nese");
    if (!Ezgiler.bul(ezgiId)) ezgiId = "nese";
    let kayit = null, calisiyor = false, timers = [], raf = 0, offMic = null, calan = null;
    const sec = h("select.kd-sec", { "aria-label": "Ezgi", onchange: (e) => { durdur(); egri.katmanSil(); ezgiId = e.target.value; store.set("kaydet.ezgi", ezgiId); onizle(); listeYaz(); } },
      Ezgiler.EZGILER.map((e) => h("option", { value: e.id, selected: e.id === ezgiId ? "" : null }, e.ad)));
    const dinleBtn = ibtn("play", "Dinle", () => dinle(), "ghost");
    const kayBtn = ibtn("rec", "Kaydet", () => toggle(), "primary rec");
    const durumEl = h("span.readout");
    const ms = Alistirma.MicSatiri({ kompakt: true });
    const gizli = h("p.kd-gizlilik", { html: L.ICON.lock + "<span></span>" });
    gizli.lastChild.textContent = Kayit.GIZLILIK;
    const sayfa = h("div.sheet.egri-kap");
    stage.append(h("div.controls", h("label", h("span.ctl-lab", "Ezgi"), sec), dinleBtn, kayBtn, h("span.spacer"), durumEl), ms.el, gizli, sayfa);
    const egri = Egri(sayfa, { mod: "sabit", sure: 10, tol: 35 });
    const sonuc = h("div.sonuc");
    const oturum = Kayit.Liste({ egri, filtre: (k) => k.ezgi === ezgiId });
    const eski = h("div.kd-eski");
    const alt = h("div.kd-alt", h("div", h("h4.kd-bas", "Bu oturum"), oturum.el), h("div", h("h4.kd-bas", "Önceki kayıtlar"), eski));
    stage.append(sonuc, alt);

    const ezgi = () => Ezgiler.bul(ezgiId);
    const notalar = () => Ezgiler.notalar(ezgiId);
    function hedefler(ns, bas = 0) { let t = bas; return ns.map((n) => { const x = { t0: t, t1: t + n.d, m: n.m, hece: n.hece }; t += n.d; return x; }); }
    // yalnızca hedef bantları (Alistirma.onizleme katman istenmese de sentezler; uzun ezgide ~1 sn sürer)
    function hedefOnizle(ns) {
      const hd = hedefler(ns);
      egri.mod("sabit"); egri.sure(hd[hd.length - 1].t1 + 0.4); egri.temizle(); egri.hedefler(hd); egri.imlec(null); egri.ciz();
    }
    function onizle() { if (!calisiyor) { const kat = egri.katmanlar.slice(); hedefOnizle(notalar()); egri.katmanSil(); kat.forEach((k) => egri.katmanEkle(k.noktalar, k)); } }
    function listeYaz() {
      oturum.yenile();
      eski.innerHTML = "";
      const ks = Kayit.kalicilar("ezgi:" + ezgiId).slice(-5).reverse();
      if (!ks.length) { eski.append(h("p.note-msg", "Bu ezgi için kayıtlı eğri yok. Kaydettiğinizde perde eğrisi burada saklanır; bir hafta sonra yeniden kaydedip karşılaştırın.")); return; }
      ks.forEach((x) => {
        const katmanda = egri.katmanlar.some((k) => k.id === x.id);
        const isabet = x.olcum && x.olcum.isabet != null ? "%" + Math.round(x.olcum.isabet * 100) + " bantta" : "";
        eski.append(h("div.kayit-satir", h("b", saatFmt.format(new Date(x.tarih))), h("span.kaynak", isabet),
          btn(katmanda ? "Katmanı kaldır" : "Üst üste koy", () => {
            if (katmanda) { const kalan = egri.katmanlar.filter((k) => k.id !== x.id); egri.katmanSil(); kalan.forEach((k) => egri.katmanEkle(k.noktalar, k)); }
            else { if (!calisiyor && !egri.hedefListe.length) onizle(); egri.katmanEkle(Kayit.noktalar(x), { id: x.id, ad: tarihFmt.format(new Date(x.tarih)) }); }
            egri.ciz(); listeYaz();
          }, "sm ghost")));
      });
    }
    function dinle() {
      Snd.unlock();
      durdur();
      calan && calan.stop();
      const ns = notalar();
      hedefOnizle(ns);
      calan = Alistirma.ornekSoyle(egri, ns, { sapma: 0 });
    }
    const bekle = (ms_) => new Promise((res) => { const id = setTimeout(res, ms_); timers.push(id); });
    async function kaydet() {
      if (calisiyor) return;
      Snd.unlock();
      calan && calan.stop(); calan = null;
      let mic = Mic.state === "on";
      if (!mic) mic = await Mic.start();
      if (!mic) { durumEl.textContent = "Kaydetmek için mikrofon gerekli."; return; }
      calisiyor = true;
      kayBtn.setLabel("Kaydı durdur"); kayBtn.setIcon("stop"); kayBtn.classList.add("on");
      sonuc.innerHTML = "";
      const c = Snd.ctx, ns = notalar(), T = ns.reduce((a, n) => a + n.d, 0);
      let tBas;
      if (prefs.kulaklik) {
        tBas = c.currentTime + 0.5;
        Snd.referans(ns, { when: tBas, gain: 0.5 });
      } else {
        durumEl.textContent = "Başlangıç notası…";
        const r = Snd.referans([{ m: ns[0].m, d: 1 }]);
        tBas = (r ? r.t0 + r.sure : c.currentTime) + 0.6;
      }
      const hd = hedefler(ns);
      egri.mod("sabit"); egri.sure(T + 0.6); egri.temizle(); egri.hedefler(hd); egri.basla(tBas);
      kayit = Kayit.baslat({ ad: ezgi().ad + " · " + saatFmt.format(new Date()), hedefler: hd, t0: tBas });
      offMic = egri.dinle();
      const imlec = () => { egri.imlec(c.currentTime - tBas); raf = requestAnimationFrame(imlec); };
      imlec();
      await bekle((tBas - c.currentTime) * 1000);
      if (!calisiyor) return;
      durumEl.textContent = "Kayıt: söyleyin";
      egri.durum("Şimdi siz", { buyuk: true });
      timers.push(setTimeout(() => egri.durum(null), 900));
      await bekle((tBas + T + 0.5 - c.currentTime) * 1000);
      if (calisiyor) await bitir();
    }
    async function bitir() {
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(raf);
      if (offMic) { offMic(); offMic = null; }
      calisiyor = false;
      kayBtn.setLabel("Kaydet"); kayBtn.setIcon("rec"); kayBtn.classList.remove("on");
      durumEl.textContent = "";
      egri.durum(null);
      if (!kayit) return;
      const r = kayit; kayit = null;
      const k = await r.durdur();
      k.ezgi = ezgiId;
      const s = Alistirma.puanla(k.kareler, k.hedefler || [], 35);
      s.mikrofon = true;
      const ort = s.notalar.filter((n) => n.ort != null);
      const o = ort.length ? ort.reduce((a, n) => a + n.ort, 0) / ort.length : null;
      if (s.soylendi) {
        Kayit.kaliciKaydet(k, { etiket: "ezgi:" + ezgiId, olcum: { isabet: Math.round(s.genel * 1000) / 1000, ortSapma: o == null ? null : Math.round(o) } });
        Alistirma.dogrulukKaydet("ezgi", s.genel);
      }
      Kayit.bildir();
      listeYaz();
      const y = Math.round(s.genel * 100);
      sonuc.innerHTML = "";
      sonuc.append(h("div.olcumler",
        olcum("%" + y, "bantta", y >= 70 ? "tam" : ""),
        olcum(o == null ? "–" : fmtCents(o), "ortalama sapma", o == null ? "" : Math.abs(o) <= 15 ? "tam" : o < 0 ? "pes" : "tiz"),
        olcum(L.fmtSure(k.sure), "kayıt")),
        h("p.note-msg", Alistirma.sonucSozu(s, 35) + (s.soylendi ? " Perde eğrisi saklandı; ses yalnızca bu sekmede." : "")));
    }
    function durdur() {
      if (calisiyor) { // kayıt yarıda kesilirse kayıt yine saklanır
        bitir();
        Snd.stopAll(); Mic.bekle("referans", false);
      }
    }
    function toggle() { calisiyor ? durdur() : kaydet(); }
    window.addEventListener("aralikchange", onizle);
    listeYaz();
    return {
      enter() { egri.baslat(); onizle(); listeYaz(); },
      leave() { durdur(); calan && calan.stop(); calan = null; egri.durdur(); },
      toggle,
    };
  };
  G.kaydet = [{ click: "=Dinle" }];

  /* ================= İlerleme ================= */
  const SILINECEK = ["aralikGecmis", "sss", "uzunSes", "dogruluk", "vibrato", "kirilma", "kulakOyunu", "isinma", "kayitlar", "pratik"];
  // günlük ortalama
  function gunluk(ps) {
    const m = new Map();
    ps.forEach((p) => { const k = gunAnahtar(p.t); const a = m.get(k) || []; a.push(p.v); m.set(k, a); });
    return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([t, vs]) => ({ t: t + 12 * 3600e3, v: vs.reduce((a, b) => a + b, 0) / vs.length, n: vs.length }));
  }
  const sayi = (v) => typeof v === "number" && isFinite(v);
  /* Küçük zaman grafiği: noktalar [{t, v}] ya da aralık [{t, lo, hi}]; tip "nokta" | "cubuk" | "aralik" */
  function grafik(cv, { tip = "nokta", ps = [], yfmt = (v) => fmtNum(v), ymin = null, ymax = null, renk = null, cizgi = true }) {
    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    function ciz() {
      if (!W || !ps.length) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const sol = 44, sag = W - 8, ust = 8, alt = H - 18;
      let t0 = Math.min(...ps.map((p) => p.t)), t1 = Math.max(...ps.map((p) => p.t));
      if (t1 - t0 < 6 * 864e5) { const c = (t0 + t1) / 2; t0 = c - 3.5 * 864e5; t1 = c + 3.5 * 864e5; }
      const vs = tip === "aralik" ? ps.flatMap((p) => [p.lo, p.hi]) : ps.map((p) => p.v);
      let a = ymin != null ? ymin : Math.min(...vs), b = ymax != null ? ymax : Math.max(...vs);
      if (tip === "cubuk") a = 0;
      if (b - a < 1e-6) { a -= 1; b += 1; }
      const pad = (b - a) * 0.12; if (ymin == null && tip !== "cubuk") a -= pad; if (ymax == null) b += pad;
      const X = (t) => sol + ((t - t0) / (t1 - t0)) * (sag - sol), Y = (v) => ust + (1 - (v - a) / (b - a)) * (alt - ust);
      ctx.strokeStyle = rgba(C.porte, 0.75); ctx.lineWidth = 1;
      [a + (b - a) * 0.1, (a + b) / 2, b - (b - a) * 0.1].forEach((v, i) => {
        const y = Math.round(Y(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(sol, y); ctx.lineTo(sag, y); ctx.stroke();
        if (i !== 1) text(ctx, yfmt(v), sol - 5, y + 4, { size: 10, align: "right", color: C.muted, font: FONT.mono });
      });
      text(ctx, tarihFmt.format(new Date(t0)), sol, H - 4, { size: 10, color: C.muted });
      text(ctx, tarihFmt.format(new Date(t1)), sag, H - 4, { size: 10, color: C.muted, align: "right" });
      const r = renk || C.ink;
      if (tip === "aralik") {
        ps.forEach((p) => {
          const x = X(p.t);
          ctx.fillStyle = rgba(C.fosfor, 0.75);
          ctx.fillRect(x - 4, Y(p.hi), 8, Math.max(2, Y(p.lo) - Y(p.hi)));
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
          [p.lo, p.hi].forEach((v) => { ctx.beginPath(); ctx.moveTo(x - 5, Y(v)); ctx.lineTo(x + 5, Y(v)); ctx.stroke(); });
        });
        return;
      }
      if (tip === "cubuk") {
        const g = gunluk(ps.map((p) => ({ t: p.t, v: p.v }))).map((x) => ({ t: x.t, v: x.v * x.n }));
        const bw = Math.max(3, Math.min(14, ((sag - sol) / 30) * 0.7));
        g.forEach((p) => { ctx.fillStyle = rgba(r, 0.8); ctx.fillRect(X(p.t) - bw / 2, Y(p.v), bw, alt - Y(p.v)); });
        return;
      }
      ps.forEach((p) => { ctx.fillStyle = rgba(C.grafit, 0.5); ctx.beginPath(); ctx.arc(X(p.t), Y(p.v), 2.4, 0, Math.PI * 2); ctx.fill(); });
      if (cizgi) {
        const g = gunluk(ps);
        ctx.strokeStyle = r; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.beginPath(); g.forEach((p, i) => (i ? ctx.lineTo(X(p.t), Y(p.v)) : ctx.moveTo(X(p.t), Y(p.v)))); ctx.stroke();
        g.forEach((p) => { ctx.fillStyle = r; ctx.beginPath(); ctx.arc(X(p.t), Y(p.v), 3.2, 0, Math.PI * 2); ctx.fill(); });
      }
    }
    return { ciz };
  }

  // bölümlerin verileri (savunmacı okuma: başka bölümlerin biçimi biraz farklı olabilir)
  function veriler() {
    const zaman = (x) => x.tarih || x.t || x.zaman || 0;
    const ar = liste("aralikGecmis").filter((x) => sayi(x.lo) && sayi(x.hi)).map((x) => ({ t: zaman(x), lo: x.lo, hi: x.hi }));
    const sss = liste("sss").map((x) => ({ t: zaman(x), v: x.sure })).filter((p) => sayi(p.v));
    const uzun = liste("uzunSes").map((x) => ({ t: zaman(x), v: x.ortSapma })).filter((p) => sayi(p.v));
    const dog = liste("dogruluk").map((x) => ({ t: zaman(x), v: x.oran * 100, tur: x.tur })).filter((p) => sayi(p.v));
    const vib = liste("vibrato").map((x) => ({ t: zaman(x), v: x.hiz, g: x.genislik })).filter((p) => sayi(p.v));
    const kir = liste("kirilma").map((x) => ({ t: zaman(x), v: x.sayi, b: x.enBuyuk })).filter((p) => sayi(p.v));
    const isin = liste("isinma").map((x) => ({ t: zaman(x), v: x.dakika })).filter((p) => sayi(p.v));
    const pratik = liste("pratik").map((x) => ({ t: zaman(x), v: x.dakika })).filter((p) => sayi(p.v));
    const kulak = store.get("kulakOyunu", null);
    const kayit = liste("kayitlar");
    return { ar, sss, uzun, dog, vib, kir, isin, pratik, kulak, kayit };
  }

  window.Demos.ilerleme = (stage) => {
    const silBtn = btn("Verilerimi sil", () => onayGoster(true), "ghost");
    const onay = h("div.il-onay", { hidden: true, role: "group", "aria-label": "Silme onayı" },
      h("span", "Bu tarayıcıdaki bütün ilerleme verileri ve kayıtlı perde eğrileri silinsin mi? Ses aralığınız da sıfırlanır. Bu geri alınamaz."),
      btn("Evet, sil", () => sil(), "sm"), btn("Vazgeç", () => onayGoster(false), "sm ghost"));
    const ozet = h("span.readout");
    const sayfa = h("div.sheet.il-sayfa");
    stage.append(h("div.controls", ozet, h("span.spacer"), silBtn), onay, sayfa);

    function onayGoster(v) { onay.hidden = !v; silBtn.hidden = v; }
    function sil() {
      SILINECEK.forEach((k) => store.del(k));
      Aralik.sifirla();
      onayGoster(false);
      L.toast("Verileriniz silindi.");
      yaz();
    }
    function bolum(baslik, { bos, id, link, satir, cizim }) {
      const el = h("section.il-bolum", h("h4", baslik));
      if (bos) {
        el.classList.add("bos");
        el.append(h("p.il-bos", "Henüz ölçüm yok. ", h("a", { href: "#" + id, onclick: git(id) }, link + " →")));
        return el;
      }
      if (satir) el.append(h("p.il-satir", satir));
      if (cizim) { const cv = h("canvas", { role: "img", "aria-label": baslik + " grafiği" }); el.append(h("div.il-cv", cv)); el._ciz = () => grafik(cv, cizim); }
      return el;
    }
    let cizimler = [];
    window.addEventListener("themechange", () => cizimler.forEach((g) => g.ciz()));
    function yaz() {
      const v = veriler();
      sayfa.innerHTML = "";
      const son = (ps) => ps.slice().sort((a, b) => a.t - b.t).slice(-1)[0];
      const enIyi = (ps, f = Math.max) => f(...ps.map((p) => p.v));
      const yedi = (ps) => { const s = ps.filter((p) => p.t > Date.now() - 7 * 864e5); return s.length ? s.reduce((a, p) => a + p.v, 0) / s.length : null; };
      const bols = [
        bolum("Ses aralığı", { bos: !v.ar.length, id: "ses-araligi", link: "Ses aralığını ölçün",
          satir: v.ar.length ? `Son: ${nn(son(v.ar).lo)} – ${nn(son(v.ar).hi)} · ${son(v.ar).hi - son(v.ar).lo} yarım ses` : "",
          cizim: { tip: "aralik", ps: v.ar, yfmt: (m) => nn(Math.round(m)) } }),
        bolum("En uzun \"sss\"", { bos: !v.sss.length, id: "sss", link: "Uzun \"sss\" deneyin",
          satir: v.sss.length ? `En iyi: ${L.fmtSure(enIyi(v.sss))}` : "",
          cizim: { ps: v.sss, yfmt: (s) => fmtNum(s) + " sn" } }),
        bolum("Uzun seste perde sapması", { bos: !v.uzun.length, id: "uzun-ses", link: "Uzun ses tutun",
          satir: v.uzun.length ? `Son: ${fmtNum(son(v.uzun).v)} sent (az olan iyi)` : "",
          cizim: { ps: v.uzun, yfmt: (s) => fmtNum(s) + " sent", ymin: 0 } }),
        bolum("Perde doğruluğu", { bos: !v.dog.length, id: "perde-esleme", link: "Perde eşleme yapın",
          satir: v.dog.length ? `Son 7 gün: ${yedi(v.dog) == null ? "–" : "%" + Math.round(yedi(v.dog))} bantta · ${v.dog.length} alıştırma` : "",
          cizim: { ps: v.dog, yfmt: (s) => "%" + Math.round(s), ymin: 0, ymax: 100, renk: C.tam } }),
        bolum("Vibrato", { bos: !v.vib.length, id: "vibrato", link: "Vibratonuzu ölçün",
          satir: v.vib.length ? `Son: ${fmtNum(son(v.vib).v, 1)} Hz` + (sayi(son(v.vib).g) ? `, ±${fmtNum(son(v.vib).g)} sent` : "") : "",
          cizim: { ps: v.vib, yfmt: (s) => fmtNum(s, 1) + " Hz" } }),
        bolum("Geçiş bölgesinde kırılma", { bos: !v.kir.length, id: "kirilma", link: "Kırılmayı yumuşatın",
          satir: v.kir.length ? `Son: ${son(v.kir).v} kırılma` + (sayi(son(v.kir).b) ? `, en büyüğü ${fmtNum(son(v.kir).b, 1)} yarım ses` : "") + " (az olan iyi)" : "",
          cizim: { ps: v.kir, yfmt: (s) => fmtNum(s), ymin: 0 } }),
        bolum("Isınma ve çalışma", { bos: !v.isin.length && !v.pratik.length, id: "isinma", link: "Isınma rutinine başlayın",
          satir: `Isınma: ${v.isin.reduce((a, p) => a + p.v, 0)} dk · Günlük plan: ${v.pratik.reduce((a, p) => a + p.v, 0)} dk`,
          cizim: { tip: "cubuk", ps: v.isin.concat(v.pratik), yfmt: (s) => fmtNum(s) + " dk", renk: C.pes } }),
        bolum("Kulak oyunu", { bos: !(v.kulak && v.kulak.enIyi), id: "kulak-oyunu", link: "Kulak oyununu oynayın",
          satir: v.kulak && v.kulak.enIyi ? `En iyi: aralığı bul ${v.kulak.enIyi.aralik ?? "–"} · duyduğunu söyle ${v.kulak.enIyi.soyle ?? "–"}` : "" }),
        bolum("Kayıtlar", { bos: !v.kayit.length, id: "kaydet", link: "Kendinizi kaydedin",
          satir: v.kayit.length ? `${v.kayit.length} perde eğrisi saklı · son: ${tarihFmt.format(new Date(v.kayit[v.kayit.length - 1].tarih || Date.now()))}` : "" }),
      ];
      bols.forEach((b) => sayfa.append(b));
      requestAnimationFrame(() => { cizimler = bols.filter((b) => b._ciz).map((b) => b._ciz()); });
      const dolu = bols.filter((b) => !b.classList.contains("bos")).length;
      ozet.innerHTML = "";
      ozet.append(dolu ? h("span", h("b", String(dolu)), ` / ${bols.length} bölümde veri var · yalnızca bu tarayıcıda`) : "Henüz veri yok: ölçümler yaptıkça burada birikir.");
      silBtn.disabled = !dolu && store.get("aralik", null) == null;
    }
    window.addEventListener("aralikchange", () => Deck.id === "ilerleme" && yaz());
    return { enter() { onayGoster(false); yaz(); } };
  };
  G.ilerleme = [{ click: "=Verilerimi sil" }, { wait: 1400 }, { click: "css:.il-onay .btn.ghost" }];
  GuideTargets.ilerleme = "=Verilerimi sil";

  /* ================= Kapanış ================= */
  window.Demos.kapanis = (stage) => {
    const sayfa = h("div.sheet.kp-sayfa");
    const serit = Aralik.Serit({ lo: 36, hi: 84, yukseklik: 96 });
    const olc = h("div.olcumler");
    const not = h("p.note-msg");
    sayfa.append(h("h4.kp-bas", "Sizin ses aralığınız"), serit.el, olc, not,
      h("div.kp-git",
        btn("Günlük çalışma →", git("gunluk-plan"), "sm"),
        btn("Isınma →", git("isinma"), "sm ghost"),
        btn("İlerleme →", git("ilerleme"), "sm ghost"),
        btn("Baştan başla", git("kapak"), "sm ghost")));
    stage.append(sayfa);
    function yaz() {
      const v = veriler(), a = Aralik.get();
      const ort = Aralik.ortusme(a).slice(0, 2).filter((x) => x.oran > 0.5).map((x) => x.ad.toLocaleLowerCase("tr"));
      olc.innerHTML = "";
      const g = a.hi - a.lo;
      olc.append(
        olcum(`${g} yarım ses`, a.kaynak === "varsayilan" ? "tahmini aralık" : `${fmtNum(g / 12, 1)} oktav`),
        olcum(v.sss.length ? L.fmtSure(Math.max(...v.sss.map((p) => p.v))) : "–", "en uzun \"sss\""),
        olcum(v.dog.length ? "%" + Math.round(v.dog.slice(-10).reduce((x, p) => x + p.v, 0) / Math.min(10, v.dog.length)) : "–", "perde doğruluğu (son 10)"),
        olcum(String(v.isin.reduce((x, p) => x + p.v, 0) + v.pratik.reduce((x, p) => x + p.v, 0)) + " dk", "ısınma ve çalışma"),
        olcum(String(v.kayit.length), "kayıtlı eğri"));
      not.textContent = a.kaynak === "varsayilan"
        ? "Aralığınızı henüz ölçmediniz; şerit tahmini. Ses aralığı ölçerle kendi şeridinizi çizin."
        : "Aralığınız " + (ort.length ? ort.join(" ve ") + " türlerinin tipik aralığıyla örtüşüyor. " : "") + "Ses türü yalnızca aralıkla belirlenmez; renk ve rahat bölge de önemli.";
      serit.ciz();
    }
    window.addEventListener("aralikchange", () => Deck.id === "kapanis" && yaz());
    return { enter() { yaz(); } };
  };
  })();
