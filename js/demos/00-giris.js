/* 0. Giriş: kapak.
   Mikrofon kapalıyken sentez bir ses kısa bir ezgi söyler (ses açılmadıysa sessizce çizer); perde eğrisi
   kapağın alt yarısına kalemle çizilir. Mikrofon açılınca çizgi ziyaretçinin sesi olur ve başlığın harf
   genişliği sesin gürlüğüyle değişir. */
(function () {
  const { h } = L;
  // kapak ezgisi: bu site için yazılmış kısa bir vokaliz (la), sonu hafif vibratolu
  const KAPAK = [[0, 0.5], [2, 0.5], [4, 0.5], [7, 1.1], [5, 0.45], [4, 0.45], [2, 0.5], [4, 0.6], [0, 1.6, true]];

  window.Demos.kapak = (stage, slide) => {
    const egri = Egri(stage, { mod: "akis", pencere: 9, okuma: false, gecis: false, zemin: false, etiket: false, sol: 0, aralik: [50, 74], tol: 30 });
    egri.el.classList.add("kapak-egri");
    egri.gorunum("porte");
    const h1 = slide.querySelector("h1");
    const micYer = slide.querySelector(".kapak-mic");
    const ms = Alistirma.MicSatiri({ kompakt: true, onAc: () => micModu() });
    micYer.append(ms.el);

    let dongu = null, cal = null, timer = 0, aktif = false, micOff = null, wd = 100;
    let onbellek = null;
    const saatSessiz = () => performance.now() / 1000;

    function hazirla() {
      if (onbellek) return onbellek;
      const sr = 32000;
      const bas = L.prefs.sesBolge === "pes" ? 50 : 62;
      const notalar = KAPAK.map(([n, d, vib]) => ({ m: bas + n, d, u: "a", vib: vib ? { hiz: 5.6, gen: 45, gecikme: 0.5 } : false }));
      const r = Ses.ezgi(sr, notalar, { tip: L.prefs.sesBolge === "pes" ? "erkek" : "kadin", gurluk: 0.7, jitter: 0.002 });
      onbellek = { r, kareler: Pitch.izle(r.data, sr), bas };
      egri.aralik(bas - 5, bas + 11);
      return onbellek;
    }
    // başlık gürlükle nefes alır: harf genişliği 72–132
    const nefes = (db) => {
      const g = Math.max(0, Math.min(1, (db + 50) / 34));
      wd += (72 + 60 * g - wd) * 0.25;
      h1.style.setProperty("--wdth", wd.toFixed(1));
    };
    function ornekTur() {
      if (!aktif || Mic.state === "on") return;
      const { r, kareler } = hazirla();
      let t;
      if (Snd.running() && !Snd.muted) {
        egri.saat(null);
        cal = Ses.calBuffer(r.data, { gain: 0.8 });
        t = cal ? cal.t0 : Snd.ctx.currentTime;
      } else {
        egri.saat(saatSessiz);
        t = saatSessiz() + 0.1;
      }
      egri.temizle();
      egri.basla(t - 2);
      // başlık için: kareleri sırayla izle
      const ks = kareler;
      let i = 0;
      egri.oynat(ks, t, { bitince: () => { timer = setTimeout(ornekTur, 2600); } });
      const izle = () => {
        if (!aktif || Mic.state === "on") return;
        const now = egri.simdi;
        while (i < ks.length && t + ks[i].t <= now) nefes(ks[i++].db);
        if (i < ks.length) requestAnimationFrame(izle); else { wd = 100; h1.style.setProperty("--wdth", 100); }
      };
      requestAnimationFrame(izle);
    }
    function micModu() {
      clearTimeout(timer);
      cal && cal.stop();
      egri.saat(null);
      egri.temizle();
      egri.aralik(null);
      egri.basla();
      micOff = egri.dinle((k) => nefes(k.sesli ? k.db : -80));
    }
    Mic.onState((st) => {
      if (st === "off" && aktif && micOff) { micOff(); micOff = null; h1.style.setProperty("--wdth", 100); egri.aralik(onbellek ? onbellek.bas - 5 : 50, onbellek ? onbellek.bas + 11 : 74); timer = setTimeout(ornekTur, 800); }
    });
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge") onbellek = null; });
    return {
      enter() { aktif = true; egri.baslat(); timer = setTimeout(ornekTur, 500); },
      leave() { aktif = false; clearTimeout(timer); cal && cal.stop(); egri.durdur(); micOff && micOff(); micOff = null; h1.style.setProperty("--wdth", 100); },
    };
  };
})();
