/* Ses aralığı: ziyaretçinin ölçülen (ya da elle işaretlenen) en pes ve en tiz rahat notası.
   Bütün sitede hatırlanır (localStorage "san.aralik"); alıştırmalar bu aralığa göre perdelenir.
   Aralık değişince "aralikchange" olayı. */
(function () {
  const { h, store, prefs, C } = L;
  const VARSAYILAN = { pes: [45, 64], tiz: [57, 76], yok: [53, 72] }; // La2–Mi4, La3–Mi5, Fa3–Do5

  function get() {
    const s = store.get("aralik", null);
    if (s && s.lo != null && s.hi > s.lo) return s;
    const v = VARSAYILAN[prefs.sesBolge || "yok"] || VARSAYILAN.yok;
    return { lo: v[0], hi: v[1], kaynak: "varsayilan" };
  }
  function set(lo, hi, kaynak = "olcum") {
    if (hi - lo < 4) return;
    const v = { lo: Math.round(lo), hi: Math.round(hi), kaynak, tarih: Date.now() };
    store.set("aralik", v);
    if (kaynak === "olcum") {
      const g = store.get("aralikGecmis", []);
      g.push({ tarih: v.tarih, lo: v.lo, hi: v.hi });
      store.set("aralikGecmis", g.slice(-60));
    }
    window.dispatchEvent(new CustomEvent("aralikchange", { detail: v }));
  }
  function sifirla() { store.del("aralik"); window.dispatchEvent(new CustomEvent("aralikchange", { detail: get() })); }
  window.addEventListener("prefchange", (e) => { if (e.detail.k === "sesBolge" && get().kaynak === "varsayilan") window.dispatchEvent(new CustomEvent("aralikchange", { detail: get() })); });

  /* Göreli notaları (0 = başlangıç, yarım ses) aralığa sığdıran başlangıç notası.
     Dizi aralığın rahat ortasına oturtulur; uçlardan pay kadar uzak tutulur. */
  function perdele(goreli, { pay = 1, tercih = null } = {}) {
    const a = get();
    const mn = Math.min(...goreli), mx = Math.max(...goreli);
    const genis = mx - mn;
    const alt = a.lo + pay - mn, ust = a.hi - pay - mx;
    if (ust < alt) return Math.round((a.lo + a.hi) / 2 - (mn + mx) / 2); // sığmıyor: ortala
    if (tercih != null) return Math.max(alt, Math.min(ust, tercih));
    // aralığın alt-orta bölgesi (en rahat bölge çoğu zaman tam orta değil, biraz altıdır)
    return Math.round(alt + (ust - alt) * 0.4) + 0 * genis;
  }

  /* Klavyede aralık şeridi bileşeni. opts: { lo, hi (klavye sınırları), duzenle (tıklayarak aralığı ayarla),
     isaret (fonksiyon → [{m, renk, etiket}]), bolgeler: [{lo, hi, renk, ad}] } */
  function Serit(opts = {}) {
    const o = Object.assign({ lo: 36, hi: 84, duzenle: false, yukseklik: 86 }, opts);
    const el = h("div.piyano", { style: { height: o.yukseklik + "px" } });
    const cv = h("canvas", { role: o.duzenle ? "img" : "img", "aria-label": "Piyano klavyesinde ses aralığı şeridi" });
    el.append(cv);
    let pos = null, W = 0, H = 0, ek = [], basili = null;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; ciz(); });
    function ciz() {
      if (!W) return;
      const ctx = S.ctx;
      ctx.clearRect(0, 0, W, H);
      const a = get();
      const ust = 16;
      pos = L.piyano(ctx, 0, ust, W, H - ust, { lo: o.lo, hi: o.hi, serit: [a.lo, a.hi], basili,
        isaret: (o.isaret ? o.isaret() : []).concat(ek), bolgeler: o.bolgeler || [] });
      // şerit uçlarının adları
      const pa = pos.get(a.lo) || pos.get(a.lo + 1), pb = pos.get(a.hi) || pos.get(a.hi - 1);
      if (pa && pb) {
        const etiket = (a.kaynak === "varsayilan" ? "tahmini aralık: " : a.kaynak === "elle" ? "işaretlenen aralık: " : "ölçülen aralık: ") + L.nn(a.lo) + " – " + L.nn(a.hi);
        const xm = Math.min(Math.max((pa.x + pb.x + pb.w) / 2, 120), W - 120);
        L.text(S.ctx, etiket, xm, 12, { size: 12, color: C.ink2, align: "center", weight: 700 });
      }
    }
    if (o.duzenle) {
      // tıklama: yakın uca göre en pes ya da en tiz notayı taşı
      cv.style.cursor = "pointer";
      cv.addEventListener("click", (e) => {
        if (!pos) return;
        const r = cv.getBoundingClientRect(), x = e.clientX - r.left;
        let m = null;
        for (const [k, p] of pos) if (!p.siyah && x >= p.x && x < p.x + p.w) m = k;
        if (m == null) return;
        const a = get();
        if (Math.abs(m - a.lo) < Math.abs(m - a.hi)) set(Math.min(m, a.hi - 4), a.hi, "elle");
        else set(a.lo, Math.max(m, a.lo + 4), "elle");
        Snd.unlock(); Snd.referans(m, { dur: 0.6, olcmeyiSurdur: true });
      });
    }
    window.addEventListener("aralikchange", ciz);
    window.addEventListener("prefchange", ciz);
    window.addEventListener("themechange", ciz);
    return { el, ciz, isaretler(list) { ek = list || []; ciz(); }, basili(set) { basili = set; ciz(); } };
  }

  /* Ses türlerinin tipik aralıkları (yaklaşık; kaynak: docs/arastirma.md bölüm 7).
     Ses türü yalnızca aralıkla belirlenmez: renk, tessitura ve geçiş noktaları da önemlidir. */
  const TURLER = [
    { id: "soprano", ad: "Soprano", lo: N.parse("C4"), hi: N.parse("C6") },
    { id: "mezzo", ad: "Mezzosoprano", lo: N.parse("A3"), hi: N.parse("A5") },
    { id: "alto", ad: "Alto (kontralto)", lo: N.parse("F3"), hi: N.parse("F5") },
    { id: "kontrtenor", ad: "Kontrtenor", lo: N.parse("G3"), hi: N.parse("E5") },
    { id: "tenor", ad: "Tenor", lo: N.parse("C3"), hi: N.parse("C5") },
    { id: "bariton", ad: "Bariton", lo: N.parse("A2"), hi: N.parse("A4") },
    { id: "bas", ad: "Bas", lo: N.parse("E2"), hi: N.parse("E4") },
  ];
  // Aralığın türlerin tipik aralığıyla örtüşmesi (0..1: tür aralığının ne kadarı ziyaretçinin aralığında)
  function ortusme(a = get()) {
    return TURLER.map((t) => {
      const ort = Math.max(0, Math.min(a.hi, t.hi) - Math.max(a.lo, t.lo));
      return { ...t, oran: ort / (t.hi - t.lo) };
    }).sort((x, y) => y.oran - x.oran);
  }

  window.Aralik = { get, set, sifirla, perdele, Serit, TURLER, ortusme, VARSAYILAN, gecmis: () => store.get("aralikGecmis", []) };
})();
