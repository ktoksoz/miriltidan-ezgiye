/* Alıştırma altyapısı:
   - MicSatiri(): mikrofon düğmesi, durum, gizlilik notu ve hata iletileri (her mikrofonlu slaytta aynı).
   - ornekSoyle(): mikrofon yokken sentez ses söyler, perde eğrisi aynı bileşende çizilir.
   - Alistirma(): "önce dinle, sonra söyle" akışı. Kulaklık takılıysa referans ve ziyaretçi aynı anda.
     Hedef notalar perde eğrisinde fosforlu bantlar; sonuç her nota için isabet ve ortalama sapma. */
(function () {
  const { h, ICON, prefs, store } = L;

  /* Mikrofon satırı. opts: { onAc(), onKapa(), kompakt } */
  function MicSatiri(opts = {}) {
    const b = L.ibtn("mic", "Mikrofonu aç", async () => {
      Snd.unlock();
      if (Mic.state === "on") { Mic.stop(); return; }
      const ok = await Mic.start();
      if (ok) opts.onAc && opts.onAc();
    }, "ghost");
    const gizli = h("span.gizlilik", { html: ICON.lock + "<span>Ses bu cihazdan çıkmaz, kaydedilmez. İzin yalnızca bu düğmeyle istenir.</span>" });
    const kulak = h("span.kulaklik-not");
    const hata = h("p.mic-hata", { hidden: true });
    const el = h("div.mic-satir", b, opts.kompakt ? null : gizli, kulak, hata);
    function kulakYaz() {
      kulak.textContent = prefs.kulaklik ? "Kulaklık modu: referans sesle birlikte söyleyebilirsiniz." : "Kulaklık takarsanız referansla birlikte söyleyebilirsiniz (alt çubuktaki kulaklık düğmesi).";
    }
    kulakYaz();
    window.addEventListener("prefchange", (e) => e.detail.k === "kulaklik" && kulakYaz());
    let ilk = true, onceki = Mic.state;
    const off = Mic.onState((st, err) => {
      b.classList.toggle("on", st === "on");
      b.setLabel(st === "on" ? "Mikrofonu kapat" : st === "asking" ? "İzin bekleniyor…" : "Mikrofonu aç");
      hata.hidden = !(st === "off" && err);
      hata.textContent = st === "off" && err ? Mic.message(err) : "";
      // onKapa yalnızca açık olan mikrofon kapanınca (ilk çağrıda değil)
      if (!ilk && st === "off" && onceki !== "off" && opts.onKapa) opts.onKapa();
      ilk = false; onceki = st;
    });
    return { el, btn: b, off };
  }

  /* Örnek ses: notalar sentezlenir, perde dizisi önceden çıkarılır ve çalma ile eş zamanlı eğriye akar.
     sapma: her notaya eklenecek sent (dizi ya da fonksiyon) → "biraz pes" gibi örnekler.
     Dönüş: { stop, t0 (ilk notanın bağlam zamanı), sure } */
  function ornekSoyle(egri, notalar, opts = {}) {
    const c = Snd.ready(); if (!c) return null;
    const sapma = opts.sapma || 0;
    const ns = notalar.map((n, i) => {
      if (n.r) return n;
      const s = typeof sapma === "function" ? sapma(n, i) : Array.isArray(sapma) ? sapma[i] || 0 : sapma;
      return Object.assign({}, n, { f: N.mtof(n.m + s / 100), u: n.u || opts.unlu || "a" });
    });
    const tip = opts.tip || (prefs.sesBolge === "pes" ? "erkek" : "kadin");
    const r = Ses.ezgi(c.sampleRate, ns, Object.assign({ tip, vibGen: 0, gurluk: 0.65, jitter: 0.002 }, opts.ses || {}));
    const kareler = Pitch.izle(r.data, c.sampleRate);
    const t = Math.max(c.currentTime + 0.1, opts.when || 0);
    const cal = Ses.calBuffer(r.data, { when: t });
    if (!cal) return null;
    if (opts.egriBasla !== false) { egri.basla(opts.egriT0 != null ? opts.egriT0 : t + Ses.BAS); }
    const oyn = egri.oynat(kareler, t, { bitince: opts.bitince });
    const ctl = { t0: t + Ses.BAS, sure: r.sure, kareler, stop() { cal.stop(); oyn.stop(); } };
    Snd.own(ctl);
    return ctl;
  }

  /* Önizleme: alıştırma başlamadan eğri boş kalmasın. Notalar sessizce sentezlenir, perde dizisi çıkarılır ve
     hedeflerle birlikte durağan olarak çizilir (grafit renkli "örnek" katmanı). Dönüş: hedefler. */
  const onbellek = new Map();
  function onizleme(egri, notalar, { sapma = [-20, 8, 0, 14, -6, 0], tip = null, katman = true } = {}) {
    const anahtar = JSON.stringify(notalar.map((n) => [n.m, n.d, n.r])) + sapma + tip;
    let veri = onbellek.get(anahtar);
    if (!veri) {
      const ns = notalar.map((n, i) => (n.r ? n : Object.assign({}, n, { f: N.mtof(n.m + (sapma[i % sapma.length] || 0) / 100), u: n.u || "a" })));
      const sr = 16000; // önizleme için yeterli; ana iş parçacığını kısa tutar
      const r = Ses.ezgi(sr, ns, { tip: tip || (prefs.sesBolge === "pes" ? "erkek" : "kadin"), gurluk: 0.6 });
      veri = Pitch.izle(r.data, sr).map((k) => ({ t: k.t - Ses.BAS, m: k.sesli ? k.midi : NaN, g: Math.max(0, Math.min(1, (k.db + 52) / 38)) }));
      onbellek.set(anahtar, veri);
    }
    const hd = [];
    let t = 0;
    for (const n of notalar) { if (!n.r) hd.push({ t0: t, t1: t + n.d, m: n.m, hece: n.hece }); t += n.r || n.d; }
    egri.mod("sabit");
    egri.sure(t + 0.4);
    egri.temizle();
    egri.katmanSil();
    egri.hedefler(hd);
    if (katman) egri.katmanEkle(veri, { ad: "örnek" });
    egri.imlec(null);
    egri.ciz();
    return hd;
  }

  /* Hedef notalardan sonuç: her nota için ses var olan karelerin ±tol içindeki payı ve ortalama sapma.
     kareler: {t (göreli), sesli, midi}; hedefler: {t0, t1, m} */
  function puanla(kareler, hedefler, tol = 25) {
    const notalar = hedefler.map((hd) => {
      const ic = kareler.filter((k) => k.sesli && !isNaN(k.midi) && k.t >= hd.t0 + 0.12 && k.t <= hd.t1);
      const sap = ic.map((k) => (k.midi - hd.m) * 100);
      const isabet = sap.length ? sap.filter((s) => Math.abs(s) <= tol).length / sap.length : 0;
      const ort = sap.length ? sap.reduce((a, b) => a + b, 0) / sap.length : null;
      const kapsama = Math.min(1, ic.length * 0.0107 / Math.max(0.1, hd.t1 - hd.t0 - 0.12));
      return { m: hd.m, isabet, ort, kapsama, hece: hd.hece };
    });
    const sesli = notalar.filter((n) => n.kapsama > 0.2);
    const genel = sesli.length ? sesli.reduce((a, n) => a + n.isabet, 0) / notalar.length : 0;
    return { notalar, genel, soylendi: sesli.length };
  }
  // ilerleme kaydı: perde eşleme doğruluğu (günlük)
  function dogrulukKaydet(tur, oran) {
    const g = store.get("dogruluk", []);
    g.push({ tarih: Date.now(), tur, oran: Math.round(oran * 1000) / 1000 });
    store.set("dogruluk", g.slice(-300));
  }

  /* Alıştırma: cümleler sırayla "dinle → söyle".
     opts: { egri, cumleler: () => [[{m, d, hece, u}]] (her başlatmada yeniden üretilir, aralığa göre perdelenir),
             tol (sent), bosluk (sn), onDurum(metin), onSonuc(sonuc, cumleIndex), onBitti(sonuclar), dinlet (false: dinleme yok),
             tekrar: aynı cümle tekrar sayısı } */
  function Alistirma(opts) {
    const o = Object.assign({ bosluk: 0.7, dinlet: true }, opts);
    // tol sabit sayı ya da fonksiyon olabilir (seviye değişince)
    const tol = () => (typeof opts.tol === "function" ? opts.tol() : opts.tol != null ? opts.tol : 25);
    const egri = o.egri;
    let calisiyor = false, iptal = null, timers = [];
    const sonuclar = [];
    const bekle = (ms) => new Promise((res, rej) => { const id = setTimeout(res, ms); timers.push(id); iptal = () => { clearTimeout(id); rej("iptal"); }; });

    async function baslat() {
      if (calisiyor) return;
      Snd.unlock();
      calisiyor = true;
      sonuclar.length = 0;
      o.onBasla && o.onBasla();
      // mikrofon: alıştırma düğmesine basmak izin isteği için yeterli bir kullanıcı hareketidir
      let mic = Mic.state === "on";
      if (!mic && o.mikrofon !== false) mic = await Mic.start();
      const cumleler = o.cumleler();
      try {
        for (let ci = 0; ci < cumleler.length && calisiyor; ci++) {
          const notalar = cumleler[ci];
          const c = Snd.ctx;
          const toplam = notalar.reduce((a, n) => a + (n.r || n.d), 0);
          const birlikte = prefs.kulaklik || !o.dinlet;
          const tDinle = birlikte ? 0 : toplam + o.bosluk;
          const T = tDinle + toplam;
          egri.mod("sabit");
          egri.sure(T + 0.4);
          const t0 = c.currentTime + 0.25;
          egri.temizle();
          egri.basla(t0);
          // hedefler: dinleme bölümünde soluk, söyleme bölümünde parlak
          const hd = [];
          let t = 0;
          for (const n of notalar) { if (!n.r) hd.push({ t0: t, t1: t + n.d, m: n.m, hece: n.hece, aktif: false }); t += n.r || n.d; }
          const hs = [];
          t = tDinle;
          for (const n of notalar) { if (!n.r) hs.push({ t0: t, t1: t + n.d, m: n.m, hece: n.hece }); t += n.r || n.d; }
          egri.hedefler(birlikte ? hs : hd.concat(hs));
          egri.tolerans && egri.tolerans(tol());
          // imleç
          let imlecRaf = 0;
          const imlec = () => { egri.imlec(c.currentTime - t0); imlecRaf = requestAnimationFrame(imlec); };
          imlec();
          let off = null;
          if (mic) off = egri.dinle();
          let ornek = null;
          if (o.dinlet) {
            o.onDurum && o.onDurum(birlikte ? "Birlikte söyleyin" : "Dinleyin…");
            Snd.referans(notalar, { when: t0, olcmeyiSurdur: prefs.kulaklik });
          }
          if (!birlikte) {
            await bekle((t0 - c.currentTime + toplam) * 1000);
            o.onDurum && o.onDurum(mic ? "Şimdi siz söyleyin" : "Mikrofon kapalı: örnek ses söylüyor");
            egri.durum(mic ? "Şimdi siz" : "Örnek ses", { buyuk: true });
            const id = setTimeout(() => egri.durum(null), 900); timers.push(id);
          }
          if (!mic) {
            // mikrofon yok: sentez ses söyleme bölümünde biraz sapmalı bir örnek söyler
            ornek = ornekSoyle(egri, notalar, { when: t0 + tDinle - Ses.BAS, egriBasla: false, sapma: (n, i) => [-18, 6, 22, -8, 0, 12][i % 6] });
          }
          await bekle((t0 + T - c.currentTime + 0.35) * 1000);
          cancelAnimationFrame(imlecRaf);
          off && off();
          const kareler = egri.noktalar.map((p) => ({ t: p.t, sesli: !isNaN(p.m), midi: p.m }));
          const sonuc = puanla(kareler, hs, tol());
          sonuc.mikrofon = mic;
          sonuclar.push(sonuc);
          if (mic && sonuc.soylendi) dogrulukKaydet(o.tur || "perde", sonuc.genel);
          o.onSonuc && o.onSonuc(sonuc, ci);
          if (ci < cumleler.length - 1) await bekle(900);
        }
        o.onBitti && o.onBitti(sonuclar);
      } catch (e) { if (e !== "iptal") console.error(e); }
      calisiyor = false;
      o.onDur && o.onDur();
    }
    function durdur() {
      if (!calisiyor) return;
      calisiyor = false;
      timers.forEach(clearTimeout); timers = [];
      iptal && iptal();
      Snd.stopAll();
      Mic.bekle("referans", false);
      o.onDurum && o.onDurum("");
    }
    return { baslat, durdur, toggle() { calisiyor ? durdur() : baslat(); }, get calisiyor() { return calisiyor; }, sonuclar };
  }

  // "%60'ı", "%100'ü", "%50'si": yüzdenin okunuşuna göre belirtme hâli eki
  function yuzdeI(n) {
    n = Math.round(n);
    const BIR = ["ı", "i", "si", "ü", "ü", "i", "sı", "si", "i", "u"]; // sıfır bir iki üç dört beş altı yedi sekiz dokuz
    const ON = ["", "u", "si", "u", "ı", "si", "ı", "i", "i", "ı"];   // on yirmi otuz kırk elli altmış yetmiş seksen doksan
    let ek;
    if (n === 0) ek = "ı";
    else if (n % 100 === 0) ek = "ü";
    else if (n % 10) ek = BIR[n % 10];
    else ek = ON[(n / 10) % 10];
    return `%${n}'${ek}`;
  }
  // Sonuç yazısı: cesaretlendirici dil
  function sonucSozu(s, tol = 25) {
    if (!s.mikrofon) return "Mikrofon kapalıyken eğriyi örnek ses çizdi. Kendi sesinizi görmek için mikrofonu açın.";
    if (!s.soylendi) return "Sesinizi duyamadım. Mikrofona biraz yaklaşıp biraz daha gür söyleyin.";
    const y = Math.round(s.genel * 100);
    const kayma = s.notalar.filter((n) => n.ort != null);
    const ort = kayma.length ? kayma.reduce((a, n) => a + n.ort, 0) / kayma.length : 0;
    const yon = Math.abs(ort) < 12 ? "" : ort < 0 ? " Genelde biraz pes kaldınız: bir sonrakinde biraz yukarı düşünün." : " Genelde biraz tiz kaldınız: bir sonrakinde biraz aşağı düşünün.";
    if (y >= 80) return `Çok iyi: seslerin ${yuzdeI(y)} hedef bandın içinde.` + yon;
    if (y >= 50) return `İyi gidiyor: seslerin ${yuzdeI(y)} hedef bandın içinde.` + yon;
    return `Seslerin ${yuzdeI(y)} hedef bandın içinde. Önce dinleyip notayı içinizden söyleyin, sonra yavaşça bulun.` + yon;
  }

  window.Alistirma = Object.assign(Alistirma, { yuzdeI, MicSatiri, ornekSoyle, onizleme, puanla, sonucSozu, dogrulukKaydet });
})();
