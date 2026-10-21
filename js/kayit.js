/* Kendini kaydet ve dinle.
   - Ses MediaRecorder ile kaydedilir ve YALNIZCA bu sekmenin belleğinde durur; hiçbir yere gönderilmez,
     sayfa kapanınca silinir. İstenirse indirilebilir.
   - Kayıtla birlikte perde eğrisi (Mic kareleri) saklanır; kalıcı karşılaştırma için yalnızca perde verisi ve
     ölçümler localStorage'a yazılır ("san.kayitlar"), ses yazılmaz. */
(function () {
  const { h, store, ibtn, fmtSure } = L;
  const oturum = []; // bu sekmedeki kayıtlar (ses + eğri)
  let sayac = 0;

  function destek() { return !!(window.MediaRecorder && Mic.stream); }

  /* Kaydı başlat (mikrofon açık olmalı). opts: { ad, hedefler (göreli sn), t0 (eğrinin zaman başlangıcı) }
     Dönüş: { durdur(): Promise<kayit>, iptal() } ya da null */
  function baslat(opts = {}) {
    if (!Mic.stream) return null;
    const parca = [];
    let rec = null;
    if (window.MediaRecorder) {
      try { rec = new MediaRecorder(Mic.stream); } catch (e) { rec = null; }
    }
    const t0 = opts.t0 != null ? opts.t0 : Snd.ctx.currentTime;
    const kareler = [];
    const off = Mic.onFrame((k) => {
      kareler.push({ t: +(k.t - t0).toFixed(4), sesli: k.sesli, midi: k.sesli ? +k.midi.toFixed(3) : NaN, ham: k.sesli ? +k.ham.toFixed(3) : NaN, db: +k.db.toFixed(1) });
    });
    if (rec) { rec.ondataavailable = (e) => e.data && e.data.size && parca.push(e.data); rec.start(); }
    const basT = Date.now();
    return {
      durdur() {
        off();
        return new Promise((res) => {
          const bitir = () => {
            const blob = parca.length ? new Blob(parca, { type: (rec && rec.mimeType) || "audio/webm" }) : null;
            const k = { id: "k" + Date.now() + "-" + (++sayac), ad: opts.ad || "Kayıt " + (oturum.length + 1), tarih: basT,
              blob, url: blob ? URL.createObjectURL(blob) : null, kareler, sure: (Date.now() - basT) / 1000, hedefler: opts.hedefler || null, t0 };
            oturum.push(k);
            res(k);
          };
          if (rec && rec.state !== "inactive") { rec.onstop = bitir; rec.stop(); } else bitir();
        });
      },
      iptal() { off(); try { rec && rec.state !== "inactive" && rec.stop(); } catch (e) {} },
    };
  }

  // Kalıcı eğri: sıkıştırılmış perde verisi + ölçümler (ses değil)
  function kaliciKaydet(k, { olcum = null, etiket = "" } = {}) {
    const liste = store.get("kayitlar", []);
    const veri = k.kareler.filter((_, i) => i % 2 === 0).map((q) => [Math.round(q.t * 100) / 100, q.sesli ? Math.round(q.midi * 100) / 100 : null, Math.round(q.db)]);
    liste.push({ id: k.id, ad: k.ad, etiket, tarih: k.tarih, veri, hedefler: k.hedefler, olcum });
    while (JSON.stringify(liste).length > 400000 && liste.length > 1) liste.shift();
    store.set("kayitlar", liste.slice(-30));
  }
  function kalicilar(etiket) { return store.get("kayitlar", []).filter((x) => !etiket || x.etiket === etiket); }
  function kaliciSil(id) { store.set("kayitlar", store.get("kayitlar", []).filter((x) => x.id !== id)); }
  // kalıcı veriyi eğri noktalarına çevir
  const noktalar = (x) => x.veri ? x.veri.map(([t, m, db]) => ({ t, m: m == null ? NaN : m, g: Math.max(0, Math.min(1, (db + 52) / 38)) }))
    : x.kareler.map((q) => ({ t: q.t, m: q.sesli ? q.midi : NaN, g: Math.max(0, Math.min(1, (q.db + 52) / 38)) }));

  /* Kaydı çal ve eğrisini aynı anda eğriye çiz. Dönüş: { stop } */
  async function oynat(k, egri) {
    if (!k.url) return null;
    const c = Snd.ready(); if (!c) return null;
    const ab = await (await fetch(k.url)).arrayBuffer();
    let buf;
    try { buf = await c.decodeAudioData(ab); } catch (e) { L.toast("Bu tarayıcı kaydı çözemedi; indirip dinleyebilirsiniz."); return null; }
    const s = c.createBufferSource(); s.buffer = buf; s.connect(Snd.bus);
    const t = c.currentTime + 0.08;
    s.start(t);
    let oyn = null;
    if (egri) {
      egri.temizle();
      egri.basla(t);
      if (k.hedefler) egri.hedefler(k.hedefler);
      oyn = egri.oynat(k.kareler, t);
    }
    const ctl = { stop() { try { s.stop(); } catch (e) {} oyn && oyn.stop(); }, sure: buf.duration };
    Snd.own(ctl);
    return ctl;
  }
  function indir(k) {
    if (!k.blob) return;
    const uz = /ogg/.test(k.blob.type) ? "ogg" : /mp4|aac/.test(k.blob.type) ? "m4a" : "webm";
    const a = h("a", { href: k.url, download: `san-${new Date(k.tarih).toISOString().slice(0, 16).replace(/[:T]/g, "-")}.${uz}` });
    document.body.append(a); a.click(); a.remove();
  }

  const GIZLILIK = "Kayıt yalnızca bu sekmede, cihazınızın belleğinde durur; hiçbir yere gönderilmez ve sayfayı kapatınca silinir. Kalıcı olarak yalnızca perde eğrisi saklanır.";

  /* Kayıt listesi bileşeni: bu oturumun kayıtları; her biri için dinle, eğriye katman olarak koy, indir.
     opts: { egri, filtre(k) } */
  function Liste(opts = {}) {
    const el = h("div.kayit-liste");
    function yenile() {
      el.innerHTML = "";
      const ks = oturum.filter(opts.filtre || (() => true)).slice(-4).reverse();
      if (!ks.length) { el.append(h("p.note-msg", "Henüz kayıt yok. Kaydet düğmesine basıp söyleyin; sonra burada dinleyip eğrileri üst üste koyabilirsiniz.")); return; }
      ks.forEach((k) => {
        const katmanda = opts.egri && opts.egri.katmanlar.some((x) => x.id === k.id);
        el.append(h("div.kayit-satir",
          h("b", k.ad), h("span.kaynak", fmtSure(k.sure)),
          ibtn("play", "Dinle", () => oynat(k, opts.egri), "sm ghost"),
          opts.egri ? L.btn(katmanda ? "Katmanı kaldır" : "Üst üste koy", () => {
            if (katmanda) { const ks2 = opts.egri.katmanlar.filter((x) => x.id !== k.id); opts.egri.katmanSil(); ks2.forEach((x) => opts.egri.katmanEkle(x.noktalar, x)); }
            else opts.egri.katmanEkle(noktalar(k), { id: k.id, ad: k.ad });
            yenile();
          }, "sm ghost") : null,
          k.blob ? ibtn("down", "İndir", () => indir(k), "sm ghost") : null));
      });
    }
    yenile();
    window.addEventListener("kayitchange", yenile);
    return { el, yenile };
  }
  const bildir = () => window.dispatchEvent(new Event("kayitchange"));

  window.Kayit = { destek, baslat, oturum, kaliciKaydet, kalicilar, kaliciSil, noktalar, oynat, indir, Liste, GIZLILIK, bildir };
})();
