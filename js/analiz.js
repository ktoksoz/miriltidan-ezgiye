/* Ses çözümlemesi: perde dizisinden vibrato, sabitlik, ses aralığı, geçiş noktası (kırılma), tessitura;
   ses sinyalinden spektrum, LPC zarfı ve formant tahmini, şarkıcı formantı payı, parlaklık.
   Perde dizisi: Pitch.Takipci karelerinden [{t, sesli, midi, ham, rms, db}].
   Saf hesap: Node'da test edilir (test/analiz.test.js). Bütün ölçümler yaklaşıktır. */
(function (root) {
  const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const std = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((v) => (v - m) ** 2))); };

  // Bir dizinin sesli ve en uzun kesintisiz bölümü (sessiz harf boşluklarında bölünür)
  function bolumler(kareler, { minSure = 0.25, alan = "ham" } = {}) {
    const out = [];
    let cur = null;
    for (const k of kareler) {
      if (k.sesli && !isNaN(k[alan])) { if (!cur) cur = []; cur.push(k); }
      else if (cur) { out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
    return out.filter((b) => b.length > 1 && b[b.length - 1].t - b[0].t >= minSure);
  }

  /* Vibrato: uzun bir sesli bölümün perdesindeki düzenli dalgalanma.
     Yavaş kayma 0,4 sn'lik hareketli ortalamayla çıkarılır; hız özilinti tepesinden (3–9 Hz),
     genişlik artık sinyalin RMS'inden (sinüs için ±genlik = √2·RMS) bulunur.
     Dönüş: { hiz (Hz), genislik (± sent), merkez (MIDI), duzen (0..1), var (bool), sure } ya da null */
  function vibrato(kareler, { alan = "ham0" } = {}) {
    const bs = bolumler(kareler, { minSure: 0.8, alan });
    if (!bs.length) return null;
    const b = bs.reduce((a, c) => (c.length > a.length ? c : a));
    // eşit aralıklı yeniden örnekleme (100 Hz)
    const t0 = b[0].t, t1 = b[b.length - 1].t, fs = 100;
    const n = Math.floor((t1 - t0) * fs);
    if (n < 60) return null;
    const x = new Float64Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const t = t0 + i / fs;
      while (j < b.length - 2 && b[j + 1].t < t) j++;
      const a = b[j], c = b[j + 1];
      const k = (t - a.t) / (c.t - a.t || 1);
      x[i] = (a[alan] + (c[alan] - a[alan]) * Math.max(0, Math.min(1, k))) * 100;
    }
    const merkez = mean(Array.from(x)) / 100;
    // hareketli ortalamayla kaymayı çıkar: pencere tam bir vibrato periyodu olunca sinüs ortalamada sıfırlanır,
    // genlik kaybolmaz. Önce kaba (0,25 sn) pencereyle hız bulunur, sonra pencere o periyoda ayarlanır.
    const ma = (w) => {
      const r = new Float64Array(n), h = w / 2;
      for (let i = 0; i < n; i++) {
        // kesirli pencere: kenar örnekleri kısmi ağırlıkla
        let s = 0, c = 0;
        const lo = i - h, hi = i + h;
        for (let k = Math.max(0, Math.ceil(lo)); k <= Math.min(n - 1, Math.floor(hi)); k++) { s += x[k]; c++; }
        r[i] = x[i] - s / c;
      }
      const kes = Math.ceil(h);
      return r.slice(kes, n - kes);
    };
    const hizBul = (y) => {
      const m = y.length;
      let r0 = 0;
      for (let i = 0; i < m; i++) r0 += y[i] * y[i];
      if (r0 < 1e-6) return { hiz: 0, duzen: 0, r0, m };
      const lagMin = Math.floor(fs / 9), lagMax = Math.ceil(fs / 3);
      const ac = [];
      for (let L = 0; L <= lagMax + 1; L++) {
        let s = 0;
        for (let i = 0; i + L < m; i++) s += y[i] * y[i + L];
        ac.push(s / r0 * (m / (m - L)));
      }
      const tepe = [];
      for (let L = lagMin; L <= lagMax; L++) if (ac[L] > ac[L - 1] && ac[L] >= ac[L + 1]) tepe.push(L);
      if (!tepe.length) return { hiz: 0, duzen: 0, r0, m };
      // en yüksek tepenin %85'ine ulaşan İLK tepe (periyodun katları seçilmesin)
      const enY = Math.max(...tepe.map((L) => ac[L]));
      const best = tepe.find((L) => ac[L] >= enY * 0.85);
      const a = ac[best - 1], bb = ac[best], c = ac[best + 1];
      const den = a + c - 2 * bb;
      const L = best + (den < 0 ? (a - c) / (2 * den) : 0);
      return { hiz: fs / L, duzen: Math.max(0, Math.min(1, bb)), r0, m };
    };
    let y = ma(25);
    if (y.length < 40) return null;
    let h1 = hizBul(y);
    if (h1.hiz > 0) { y = ma(fs / h1.hiz); h1 = hizBul(y); }
    const rms = Math.sqrt(h1.r0 / h1.m);
    // ölçüm penceresi (~43 ms) hızlı dalgalanmayı biraz yumuşatır: sinc ile düzelt
    const duzelt = (f) => { const u = Math.PI * f * PENCERE; return u > 0 ? Math.min(1.6, u / Math.sin(u)) : 1; };
    const genislik = rms * Math.SQRT2 * (h1.hiz ? duzelt(h1.hiz) : 1);
    const hiz = h1.hiz, duzen = h1.duzen;
    return { hiz, genislik, merkez, duzen, var: duzen > 0.35 && genislik > 12 && hiz > 3.5 && hiz < 9, sure: t1 - t0 };
  }
  // perde ölçüm penceresinin etkin uzunluğu (sn), vibrato genişliği düzeltmesi için (test/analiz.test.js ile ayarlandı)
  const PENCERE = 0.03;

  /* Sabitlik: uzun bir seste ortalama sapma ve titreme.
     hedef (MIDI) verilirse sapmalar ona göre, yoksa ortalamaya göre.
     Dönüş: { merkez, ortSapma (sent), titreme (sent, kısa süreli std), kayma (sent/sn), gurlukStd (dB), sure, isabet (% ±25 sent) } */
  function sabitlik(kareler, { hedef = null, alan = "ham", tol = 25 } = {}) {
    const v = kareler.filter((k) => k.sesli && !isNaN(k[alan]));
    if (v.length < 10) return null;
    const ms = v.map((k) => k[alan]);
    const merkez = mean(ms);
    const ref = hedef != null ? hedef : merkez;
    const sap = ms.map((m) => (m - ref) * 100);
    const ortSapma = mean(sap.map(Math.abs));
    // titreme: komşu 5 kareye göre artık
    const art = sap.map((s, i) => s - mean(sap.slice(Math.max(0, i - 4), i + 5)));
    // doğrusal kayma
    const ts = v.map((k) => k.t), tm = mean(ts), sm = mean(sap);
    let num = 0, den = 0;
    ts.forEach((t, i) => { num += (t - tm) * (sap[i] - sm); den += (t - tm) ** 2; });
    const db = v.map((k) => k.db);
    return {
      merkez, ortSapma, titreme: std(art), kayma: den ? num / den : 0, gurlukStd: std(db), ortDb: mean(db),
      sure: v[v.length - 1].t - v[0].t, isabet: sap.filter((s) => Math.abs(s) <= tol).length / sap.length,
      ortalamaSapma: mean(sap),
    };
  }

  /* Ses aralığı ölçer: en az minSure boyunca ±50 sent içinde kararlı tutulan notalar sayılır
     (sirende anlık geçilen uç notalar ya da zorlanmış çığlıklar sayılmasın diye). Artımlı. */
  function AralikOlcer({ minSure = 0.4 } = {}) {
    let tut = null; // { m0, t0, ms[] }
    let lo = Infinity, hi = -Infinity;
    const notalar = new Map(); // yarım ses → süre
    function push(k) {
      if (!k.sesli || isNaN(k.ham)) { tut = null; return null; }
      if (!tut || Math.abs(k.ham - tut.m0) > 0.5) { tut = { m0: k.ham, t0: k.t, ms: [k.ham] }; return null; }
      tut.ms.push(k.ham);
      if (k.t - tut.t0 >= minSure) {
        const m = Math.round(mean(tut.ms));
        const yeni = m < lo || m > hi;
        lo = Math.min(lo, m); hi = Math.max(hi, m);
        notalar.set(m, (notalar.get(m) || 0) + (k.t - tut.t0));
        tut = { m0: k.ham, t0: k.t, ms: [k.ham] };
        return { m, yeni };
      }
      return null;
    }
    return { push, get lo() { return isFinite(lo) ? lo : null; }, get hi() { return isFinite(hi) ? hi : null; }, notalar,
      reset() { lo = Infinity; hi = -Infinity; tut = null; notalar.clear(); } };
  }

  /* Kırılma (geçiş noktasında perde sıçraması): sirende kısa sürede büyük perde sıçraması
     ya da kısa bir kopukluğun iki yanında sıçrama.
     Dönüş: [{ t, once (MIDI), sonra (MIDI), sicrama (yarım ses), dbDusus }] */
  function kirilmalar(kareler, { esik = 2, pencere = 0.07, maxBosluk = 0.15, alan = "ham" } = {}) {
    // ölçüm penceresi (~43 ms) ani sıçramayı birkaç kareye yayar: 70 ms içindeki değişime bakılır.
    // Sürekli bir sirende bu sürede perde en çok ~1 yarım ses değişir; kırılma bunun çok üstündedir.
    const v = kareler.filter((k) => k.sesli && !isNaN(k[alan]));
    const aday = [];
    let j = 0;
    for (let i = 1; i < v.length; i++) {
      while (j < i && v[i].t - v[j].t > pencere) j++;
      // aradaki kopukluk çok uzunsa (ayrı ses) sayma
      if (v[i].t - v[i - 1].t > maxBosluk) { j = i; continue; }
      let a = j;
      for (let k = j; k < i; k++) if (v[k].t - v[k > 0 ? k - 1 : 0].t > maxBosluk) a = k;
      const d = v[i][alan] - v[a][alan];
      if (Math.abs(d) >= esik) aday.push({ i, a, d });
    }
    // art arda adayları tek kırılmada topla: en büyük değişim
    const out = [];
    for (const c of aday) {
      const son = out[out.length - 1];
      if (son && v[c.i].t - son._t < 0.12) {
        const once = son._once, sonra = v[c.i][alan];
        if (Math.abs(sonra - once) > Math.abs(son.sicrama)) { son.sicrama = sonra - once; son.sonra = sonra; }
        son._t = v[c.i].t;
      } else out.push({ t: v[c.i].t, once: v[c.a][alan], sonra: v[c.i][alan], sicrama: c.d, dbDusus: v[c.a].db - v[c.i].db, _once: v[c.a][alan], _t: v[c.i].t });
    }
    return out.map(({ _once, _t, ...o }) => o);
  }

  // Tessitura: her yarım seste geçirilen süre (sn)
  function histogram(kareler, { alan = "midi" } = {}) {
    const h = new Map();
    for (let i = 1; i < kareler.length; i++) {
      const k = kareler[i];
      if (!k.sesli || isNaN(k[alan])) continue;
      const m = Math.round(k[alan]);
      h.set(m, (h.get(m) || 0) + Math.min(0.05, k.t - kareler[i - 1].t));
    }
    return h;
  }
  // Histogramdan rahat bölge: sürenin %70'ini kapsayan en dar aralık
  function tessitura(h, pay = 0.7) {
    const ks = [...h.keys()].sort((a, b) => a - b);
    if (!ks.length) return null;
    const top = [...h.values()].reduce((a, b) => a + b, 0);
    let best = null;
    for (let i = 0; i < ks.length; i++) {
      let s = 0;
      for (let j = i; j < ks.length; j++) {
        s += h.get(ks[j]);
        if (s >= top * pay) { if (!best || ks[j] - ks[i] < best[1] - best[0]) best = [ks[i], ks[j]]; break; }
      }
    }
    return best ? { lo: best[0], hi: best[1] } : null;
  }

  /* "sss" ölçer: perdesiz ama gürültülü ses (sürtünmeli). Artımlı.
     Dönüş (her karede): { aktif, sure, duzen (0..1: gürlük dalgalanması az → 1) } */
  function SssOlcer({ esikDb = -48 } = {}) {
    let bas = null, dbs = [], son = null, taban = -70;
    function push(k) {
      taban = k.db < taban ? k.db : taban + (k.db - taban) * 0.003;
      const esik = Math.max(esikDb, taban + 12);
      const aktif = k.db > esik && !k.sesli;
      if (aktif) {
        if (bas == null) { bas = k.t; dbs = []; }
        dbs.push(k.db);
        son = k.t;
      } else if (bas != null && k.t - son > 0.35) {
        const r = sonuc(); bas = null; dbs = [];
        return Object.assign(r, { bitti: true });
      }
      return bas != null ? sonuc() : { aktif: false, sure: 0 };
    }
    function sonuc() {
      const sure = son - bas;
      // düzenlilik: gürlüğün standart sapması (dB) → 0 dB: 1, 6 dB ve üstü: 0
      const s = dbs.length > 5 ? std(dbs.slice(3, -3).length ? dbs.slice(3, -3) : dbs) : 0;
      return { aktif: true, sure, duzen: Math.max(0, Math.min(1, 1 - s / 6)), std: s, dbs };
    }
    return { push, reset() { bas = null; dbs = []; } };
  }

  /* ---- Sinyal: FFT, spektrum, LPC ---- */
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const u = i + k, v = u + len / 2;
          const tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr;
          re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }
  // Büyüklük spektrumu (dB), Hann pencereli
  function spektrum(x, sr) {
    let n = 1; while (n < x.length) n <<= 1;
    const re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < x.length; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (x.length - 1)));
    fft(re, im);
    const out = new Float32Array(n / 2);
    for (let k = 0; k < n / 2; k++) out[k] = 20 * Math.log10(Math.hypot(re[k], im[k]) / (n / 4) + 1e-9);
    return { db: out, binHz: sr / n };
  }

  // LPC (otokorelasyon + Levinson–Durbin)
  function lpc(x, p) {
    const n = x.length, r = new Float64Array(p + 1);
    for (let k = 0; k <= p; k++) { let s = 0; for (let i = 0; i + k < n; i++) s += x[i] * x[i + k]; r[k] = s; }
    if (r[0] <= 0) return null;
    r[0] *= 1.0001; // kararlılık
    const a = new Float64Array(p + 1); a[0] = 1;
    let e = r[0];
    for (let i = 1; i <= p; i++) {
      let acc = r[i];
      for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
      const k = -acc / e;
      const prev = a.slice();
      for (let j = 1; j < i; j++) a[j] = prev[j] + k * prev[i - j];
      a[i] = k;
      e *= 1 - k * k;
      if (e <= 0) return null;
    }
    return { a, e };
  }
  /* Formant tahmini: sinyali ~11 kHz'e indir, ön vurgula, LPC zarfının tepelerini bul.
     Dönüş: { formantlar: [F1, F2, F3…], zarf: [{f, db}] } ya da null. Yüksek perdede güvenilmezdir. */
  function formantTahmin(x, sr, { p = 12, fmax = 5000 } = {}) {
    const dec = Math.max(1, Math.floor(sr / 11000));
    const srd = sr / dec;
    const m = Math.floor(x.length / dec);
    const y = new Float64Array(m);
    for (let i = 0; i < m; i++) { let s = 0; for (let k = 0; k < dec; k++) s += x[i * dec + k]; y[i] = s / dec; }
    for (let i = m - 1; i > 0; i--) y[i] -= 0.94 * y[i - 1];
    for (let i = 0; i < m; i++) y[i] *= 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (m - 1));
    const L = lpc(y, p);
    if (!L) return null;
    const zarf = [];
    for (let f = 50; f <= Math.min(fmax, srd / 2 - 50); f += 10) {
      const w = 2 * Math.PI * f / srd;
      let re = 0, im = 0;
      for (let k = 0; k <= p; k++) { re += L.a[k] * Math.cos(w * k); im -= L.a[k] * Math.sin(w * k); }
      zarf.push({ f, db: -10 * Math.log10(re * re + im * im + 1e-12) });
    }
    const tepe = [];
    for (let i = 1; i < zarf.length - 1; i++) if (zarf[i].db > zarf[i - 1].db && zarf[i].db >= zarf[i + 1].db && zarf[i].f > 180) tepe.push(zarf[i].f);
    return { formantlar: tepe, zarf };
  }

  // Bant enerjisi oranı (dB): ör. şarkıcı formantı bandı (2–4 kHz) / 0–1 kHz
  function bantOrani(spec, [a1, b1], [a2, b2]) {
    const e = (a, b) => { let s = 0; for (let k = Math.floor(a / spec.binHz); k <= Math.ceil(b / spec.binHz) && k < spec.db.length; k++) s += Math.pow(10, spec.db[k] / 10); return s; };
    return 10 * Math.log10((e(a1, b1) + 1e-12) / (e(a2, b2) + 1e-12));
  }
  // Spektral ağırlık merkezi (Hz): parlaklık ölçüsü
  function agirlikMerkezi(spec, fmax = 8000) {
    let s = 0, w = 0;
    for (let k = 1; k < spec.db.length && k * spec.binHz < fmax; k++) { const p = Math.pow(10, spec.db[k] / 20); s += p * k * spec.binHz; w += p; }
    return w ? s / w : 0;
  }

  const api = { mean, std, bolumler, vibrato, sabitlik, AralikOlcer, kirilmalar, histogram, tessitura, SssOlcer, fft, spektrum, lpc, formantTahmin, bantOrani, agirlikMerkezi };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Analiz = api;
})(typeof window !== "undefined" ? window : globalThis);
