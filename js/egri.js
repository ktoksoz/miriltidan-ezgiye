/* Perde eğrisi: sitenin tek perde eğrisi bileşeni.
   - Zaman soldan sağa akar ("akis": şimdi sağ kenara yakın) ya da sabit bir zaman çizelgesi üstünde
     imleç ilerler ("sabit": alıştırmalar ve kayıtlar).
   - Dikey eksen perde: arka planda piyano rulosu ya da porte (ziyaretçi geçebilir, tercih hatırlanır).
   - Hedef notalar fosforlu kalem bantları; ziyaretçinin sesi uçlu kalem çizgisi:
     renk = hedefe yakınlık (tam / biraz pes / biraz tiz), kalınlık = gürlük, sessiz harf ve sessizlik = boşluk.
   - Kaydedilmiş söyleyişler grafit renkli katmanlar olarak üst üste konup karşılaştırılır.
   Kullanım: const e = Egri(kap, { mod: "akis" }); e.dinle(); … e.durdur()
   Kareler: { t (ses bağlamı saati, sn), sesli, midi, db } (Pitch.Takipci / Mic.onFrame biçimi). */
(function () {
  const { h, C, FONT, prefs, nn, rgba, perdeRenk, sapmaSoz, clamp } = L;
  const DOGAL = [0, 2, 4, 5, 7, 9, 11];
  // porte için: MIDI (ondalıklı) → dizi basamağı (Do4 = 28)
  function basamak(m) {
    const o = Math.floor(m / 12), r = m - o * 12;
    for (let i = 0; i < 7; i++) {
      const a = DOGAL[i], b = i < 6 ? DOGAL[i + 1] : 12;
      if (r >= a && r < b) return o * 7 + i + (r - a) / (b - a);
    }
    return o * 7 + 7;
  }
  const SOL_ANAHTARI = [64, 67, 71, 74, 77]; // Mi4 Sol4 Si4 Re5 Fa5
  const FA_ANAHTARI = [43, 47, 50, 53, 57];  // Sol2 Si2 Re3 Fa3 La3
  const g = (db) => clamp((db + 52) / 38, 0, 1);

  function Egri(parent, opts = {}) {
    const o = Object.assign({ mod: "akis", pencere: 7, sure: 8, aralik: null, tol: 25, okuma: true, gecis: true, renkNota: false,
      pay: 2, minYari: 4.5, sol: 40, zemin: true, etiket: true, saat: null }, opts);
    const el = h("div.egri");
    const cv = h("canvas", { "aria-hidden": "true" });
    const nota = h("div.egri-nota", { "aria-live": "off" });
    const ust = h("div.egri-ust");
    const durumEl = h("div.egri-durum", { role: "status" });
    el.append(cv, ust, durumEl);
    if (o.okuma) ust.append(nota);
    ust.append(h("span.spacer"));
    let gorunum = prefs.gorunum;
    const gor = h("div.egri-gor", { role: "group", "aria-label": "Arka plan" });
    const gbtn = [["rulo", "Piyano rulosu"], ["porte", "Porte"]].map(([k, lab]) => {
      const b = h("button", { type: "button", onclick: () => { L.setPref("gorunum", k); } }, lab);
      gor.append(b); return [k, b];
    });
    const gorSet = () => gbtn.forEach(([k, b]) => { b.classList.toggle("on", k === gorunum); b.setAttribute("aria-pressed", k === gorunum); });
    gorSet();
    if (o.gecis) ust.append(gor);
    window.addEventListener("prefchange", (e) => { if (e.detail.k === "gorunum") { gorunum = e.detail.v; gorSet(); } });
    (parent.append ? parent : parent.el).append(el);

    let W = 0, H = 0;
    const S = L.canvas(cv, (s) => { W = s.w; H = s.h; });
    const ctx = S.ctx;

    let t0 = 0;               // zaman başlangıcı (ses bağlamı saati)
    let nokta = [];           // canlı noktalar: {t (göreli), m, g}
    let hedef = [];           // [{t0, t1, m, hece, ad}]
    let katman = [];          // [{noktalar, renk, ad}]
    let imlecT = null;
    let lo = 55, hi = 72, loH = lo, hiH = hi; // görünen aralık (yumuşak geçişli)
    let kaynak = null, oynatici = null;
    let sonOkuma = 0;
    // saat: varsayılan ses bağlamının saati (kareler bu saate göre zamanlanır); kapak gibi sessiz
    // gösterimlerde başka bir saat verilebilir
    const simdi = () => (o.saat ? o.saat() : Snd.running() ? Snd.ctx.currentTime : performance.now() / 1000);

    function aralikHesapla() {
      let a, b;
      if (o.aralik) [a, b] = o.aralik;
      else {
        const ar = window.Aralik ? Aralik.get() : { lo: 55, hi: 72 };
        a = ar.lo - o.pay; b = ar.hi + o.pay;
      }
      hedef.forEach((x) => { a = Math.min(a, x.m - 2); b = Math.max(b, x.m + 2); });
      if (b - a < o.minYari * 2) { const c = (a + b) / 2; a = c - o.minYari; b = c + o.minYari; }
      loH = a; hiH = b;
    }
    aralikHesapla();
    lo = loH; hi = hiH;

    // perde → y
    function y(m) {
      if (gorunum === "porte") {
        const s0 = basamak(lo), s1 = basamak(hi);
        return 10 + (1 - (basamak(m) - s0) / (s1 - s0 || 1)) * (H - 20);
      }
      return 10 + (1 - (m - lo) / (hi - lo || 1)) * (H - 20);
    }
    const sol = o.sol;
    function x(t) {
      const w = W - sol - 10;
      if (o.mod === "sabit") return sol + (t / o.sure) * w;
      const now = simdi() - t0;
      return sol + w * 0.94 - ((now - t) / o.pencere) * w * 0.94;
    }

    function arkaPlan() {
      if (o.zemin) { ctx.fillStyle = C.kagit; ctx.fillRect(0, 0, W, H); } else ctx.clearRect(0, 0, W, H);
      const a = Math.ceil(lo - 0.5), b = Math.floor(hi + 0.5);
      if (gorunum === "porte") {
        // porte çizgileri (sol ve fa anahtarı), ek çizgiler soluk
        const cizgi = (m, guclu) => {
          const yy = Math.round(y(m)) + 0.5;
          ctx.strokeStyle = guclu ? C.porte : rgba(C.porte, 0.35); ctx.lineWidth = guclu ? 1.2 : 1;
          ctx.setLineDash(guclu ? [] : [4, 5]);
          ctx.beginPath(); ctx.moveTo(sol, yy); ctx.lineTo(W - 6, yy); ctx.stroke();
          ctx.setLineDash([]);
        };
        for (let m = a; m <= b; m++) {
          if (N.isBlack(m)) continue;
          const anahtar = SOL_ANAHTARI.includes(m) || FA_ANAHTARI.includes(m);
          // ek çizgiler: porte dışındaki "çizgi" notaları (Do4, La5…)
          const st = Math.round(basamak(m));
          const cizgiNota = st % 2 === 0;
          if (anahtar) cizgi(m, true);
          else if (cizgiNota) cizgi(m, false);
        }
        for (let m = a; m <= b; m++) if (N.pc(m) === 0 || SOL_ANAHTARI[0] === m || FA_ANAHTARI[4] === m) {
          if (N.pc(m) !== 0) continue;
          if (o.etiket) L.text(ctx, nn(m), sol - 6, y(m) + 4, { size: 11, color: C.muted, align: "right", weight: 700, font: FONT.mono });
        }
      } else {
        const sh = (H - 20) / (hi - lo);
        for (let m = a; m <= b; m++) {
          const yy = y(m);
          if (N.isBlack(m)) { ctx.fillStyle = rgba(C.porte, 0.16); ctx.fillRect(sol, yy - sh / 2, W - sol, sh); }
          if (N.pc(m) === 0) {
            ctx.strokeStyle = rgba(C.porte, 0.9); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sol, Math.round(yy + sh / 2) + 0.5); ctx.lineTo(W, Math.round(yy + sh / 2) + 0.5); ctx.stroke();
          }
          if (o.etiket && (sh >= 13 || N.pc(m) === 0)) {
            const lbl = sh >= 13 ? nn(m) : nn(m);
            if (!N.isBlack(m) || sh >= 17) L.text(ctx, lbl, sol - 6, yy + 4, { size: Math.min(11, sh * 0.8), color: N.pc(m) === 0 ? C.ink2 : C.muted, align: "right", weight: N.pc(m) === 0 ? 700 : 500, font: FONT.mono });
          }
        }
      }
      // kenar boşluğu çizgisi (defter)
      if (o.etiket) { ctx.fillStyle = rgba(C.porte, 0.8); ctx.fillRect(sol - 0.5, 0, 1.5, H); }
    }

    function hedefCiz() {
      for (const hd of hedef) {
        const x0 = x(hd.t0), x1 = x(hd.t1);
        if (x1 < sol || x0 > W) continue;
        const yy = y(hd.m);
        const yari = Math.max(6, Math.abs(y(hd.m + o.tol / 100) - yy));
        // fosforlu kalem: hafif eğik uçlar, kâğıda emilmiş saydamlık
        ctx.fillStyle = rgba(C.fosfor, hd.aktif === false ? 0.28 : 0.62);
        ctx.beginPath();
        const a = Math.max(sol, x0), b = Math.min(W, x1);
        ctx.moveTo(a + 2, yy - yari); ctx.lineTo(b, yy - yari + 1.5); ctx.lineTo(b - 3, yy + yari); ctx.lineTo(a, yy + yari - 1); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(C.fosforInk, 0.35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a, yy); ctx.lineTo(b, yy); ctx.stroke();
        const lbl = hd.hece || hd.ad;
        if (lbl && b - a > 14) L.text(ctx, lbl, a + 4, yy - yari - 4, { size: 12, color: C.fosforInk === "#f2e15a" ? C.ink2 : C.fosforInk, weight: 700 });
      }
    }

    function hedefAt(t) {
      for (const hd of hedef) if (t >= hd.t0 && t <= hd.t1) return hd;
      return null;
    }
    // perde çizgisi: noktalar arasında kalınlığı ve rengi değişen kalem
    function cizgi(ps, { renk = null, alfa = 1, kal = 1 } = {}) {
      ctx.lineCap = "round";
      for (let i = 1; i < ps.length; i++) {
        const a = ps[i - 1], b = ps[i];
        if (isNaN(a.m) || isNaN(b.m) || b.t - a.t > 0.09) continue;
        const xa = x(a.t), xb = x(b.t);
        if (xb < sol || xa > W) continue;
        let r = renk;
        if (!r) {
          const hd = hedefAt(b.t);
          if (hd) r = perdeRenk((b.m - hd.m) * 100);
          else if (o.renkNota) r = perdeRenk((b.m - Math.round(b.m)) * 100);
          else r = C.ink;
        }
        ctx.strokeStyle = alfa < 1 ? rgba(r.startsWith("#") ? r : "#5d6678", alfa) : r;
        ctx.lineWidth = (1.4 + 5.2 * ((a.g + b.g) / 2)) * kal;
        ctx.beginPath(); ctx.moveTo(Math.max(sol, xa), y(a.m)); ctx.lineTo(xb, y(b.m)); ctx.stroke();
      }
    }

    function okumaYaz(now) {
      if (!o.okuma) return;
      const son = nokta[nokta.length - 1];
      if (!son || isNaN(son.m) || now - son.t > 0.25) {
        if (now - sonOkuma > 0.6) { nota.innerHTML = ""; nota.className = "egri-nota"; }
        return;
      }
      sonOkuma = now;
      const hd = hedefAt(son.t);
      const ref = hd ? hd.m : Math.round(son.m);
      const c = (son.m - ref) * 100;
      const cls = Math.abs(c) <= 15 ? "tam" : c < 0 ? "pes" : "tiz";
      nota.className = "egri-nota " + cls;
      const ok = cls === "tam" ? "" : c < 0 ? " ↑" : " ↓";
      nota.innerHTML = "";
      // nota değişiminin ilk anlarındaki geçici büyük sapmaları yazma
      const yaz = Math.abs(c) <= 150 ? L.fmtCents(c) + " · " + sapmaSoz(c) + ok : "…";
      nota.append(nn(Math.round(son.m)), h("small", (hd ? "hedef " + nn(hd.m) + ": " : "") + yaz));
    }

    function ciz() {
      if (!W) return;
      // aralık yumuşakça hedefe kayar
      lo += (loH - lo) * 0.15; hi += (hiH - hi) * 0.15;
      arkaPlan();
      hedefCiz();
      katman.forEach((k) => cizgi(k.noktalar, { renk: k.renk || C.grafit, alfa: 0.55, kal: 0.75 }));
      cizgi(nokta);
      const now = simdi() - t0;
      if (o.mod === "sabit" && imlecT != null) {
        const xi = Math.round(x(imlecT)) + 0.5;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xi, 4); ctx.lineTo(xi, H - 4); ctx.stroke();
      } else if (o.mod === "akis") {
        // "şimdi" çizgisi: kalemin ucu
        const xn = Math.round(x(now)) + 0.5;
        ctx.strokeStyle = rgba(C.ink, 0.18); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xn, 0); ctx.lineTo(xn, H); ctx.stroke();
      }
      okumaYaz(now);
      // akışta eski noktaları at
      if (o.mod === "akis" && nokta.length > 50 && nokta[0].t < now - o.pencere * 1.2) {
        const kes = nokta.findIndex((p) => p.t >= now - o.pencere * 1.1);
        if (kes > 0) nokta = nokta.slice(kes);
      }
    }

    const dongu = L.loop(() => {
      if (oynatici) oynatici.adim();
      ciz();
    });

    function push(k) {
      const t = k.t - t0;
      const m = k.sesli ? k.midi : NaN;
      nokta.push({ t, m, g: g(k.db != null ? k.db : -30), ham: k.ham });
      // ses aralık dışına çıkarsa görünen aralığı genişlet
      if (!isNaN(m) && !o.aralik) { if (m < loH + 0.5) loH = m - 1.5; if (m > hiH - 0.5) hiH = m + 1.5; }
      return t;
    }

    // Mikrofona bağlan: kareler eğriye akar. Dönüş: bağlantıyı kesen fonksiyon.
    function dinle(fn) {
      if (kaynak) kaynak();
      const off = Mic.onFrame((k) => {
        if (k.bekle) durum(k.bekle === "anlatim" ? "Anlatım çalıyor: ölçüm bekliyor" : "Dinle…", { kendi: true });
        else if (durumEl.dataset.kendi) durum(null);
        push(k);
        fn && fn(k, k.t - t0);
      });
      kaynak = () => { off(); kaynak = null; };
      dongu.start();
      return kaynak;
    }
    function durum(metin, { buyuk = false, kendi = false } = {}) {
      if (!metin) { durumEl.classList.remove("on"); delete durumEl.dataset.kendi; return; }
      durumEl.textContent = metin;
      durumEl.classList.toggle("buyuk", buyuk);
      if (kendi) durumEl.dataset.kendi = "1"; else delete durumEl.dataset.kendi;
      durumEl.classList.add("on");
    }

    /* Önceden hesaplanmış kareleri ses bağlamı saatine göre eğriye akıt (sentez ses ya da kayıt oynatma).
       kareler: t'leri verinin başına göre (sn); baslangic: verinin çalmaya başladığı bağlam zamanı. */
    function oynat(kareler, baslangic, { bitince } = {}) {
      let i = 0;
      oynatici = {
        adim() {
          const now = simdi();
          while (i < kareler.length && baslangic + kareler[i].t <= now) {
            const k = kareler[i++];
            push(Object.assign({}, k, { t: baslangic + k.t }));
          }
          if (o.mod === "sabit") imlecT = now - t0;
          if (i >= kareler.length) { oynatici = null; bitince && bitince(); }
        },
        stop() { oynatici = null; },
      };
      dongu.start();
      return oynatici;
    }

    const api = {
      el,
      get t0() { return t0; },
      basla(t = simdi()) { t0 = t; nokta = []; imlecT = o.mod === "sabit" ? 0 : null; dongu.start(); return t0; },
      push,
      dinle,
      oynat,
      hedefler(list) { hedef = list || []; aralikHesapla(); },
      get hedefListe() { return hedef; },
      aralik(a, b) { o.aralik = a == null ? null : [a, b]; aralikHesapla(); },
      sure(s) { o.sure = s; },
      tolerans(c) { o.tol = c; },
      mod(m) { o.mod = m; },
      imlec(t) { imlecT = t; },
      temizle() { nokta = []; imlecT = o.mod === "sabit" ? 0 : null; sonOkuma = 0; },
      katmanEkle(noktalar, ozellik = {}) { katman.push(Object.assign({ noktalar }, ozellik)); if (katman.length > 3) katman.shift(); },
      katmanSil() { katman = []; },
      get katmanlar() { return katman; },
      get noktalar() { return nokta; },
      durum,
      ciz,
      baslat() { dongu.start(); },
      durdur() { dongu.stop(); if (kaynak) kaynak(); if (oynatici) oynatici.stop(); durum(null); },
      get calisiyor() { return dongu.running; },
      setSol(v) { o.sol = v; },
      saat(fn) { o.saat = fn; },
      gorunum(k) { gorunum = k; gorSet(); },
      get simdi() { return simdi(); },
    };
    window.addEventListener("themechange", () => ciz());
    return api;
  }

  // Renk anahtarı (lejant)
  Egri.anahtar = () => h("div.egri-anahtar",
    h("span", { style: { "--kc": "var(--tam)" } }, "tam üstünde"),
    h("span", { style: { "--kc": "var(--pes)" } }, "biraz pes"),
    h("span", { style: { "--kc": "var(--tiz)" } }, "biraz tiz"),
    h("span", { style: { "--kc": "color-mix(in srgb, var(--fosfor) 70%, transparent)" } }, "hedef"));
  Egri.basamak = basamak;
  window.Egri = Egri;
})();
