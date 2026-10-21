/* Ses sentezi: kaynak–filtre modeli.
   Kaynak: Rosenberg (1971) glotis hava akımı darbesi; açık faz oranı (OQ) ayarlanabilir. Dudaktan yayılma
   etkisi için akımın türevi alınır. Filtre: beş formant rezonatörü art arda (Klatt 1980 kaskad yapısı).
   Ek olarak: vibrato, nefes gürültüsü, şarkıcı formantı (F3–F5'in kümelenmesi), açık/kapalı (gırtlak konumu),
   burun rezonansı (kutup–sıfır çifti) ve basit sessiz harfler.
   Saf hesap kısmı DOM ve Web Audio kullanmaz: Node'da testler ve WAV üretimi aynı kodu kullanır.
   Tarayıcıda Ses.canli() sesi küçük parçalar hâlinde üretip Web Audio saatine göre sıraya koyar
   (AudioWorklet gerekmez; sayfa dosyadan açıldığında da çalışır). */
(function (root) {
  const F = typeof module !== "undefined" && module.exports ? require("./data/formantlar.js") : root.Formant;
  const TAU = Math.PI * 2;

  // Tekrarlanabilir gürültü (testler aynı sonucu versin)
  function rng(seed = 1) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s / 4294967296) * 2 - 1; };
  }

  /* Rosenberg glotis akımı, faz φ ∈ [0,1). oq: açık faz oranı; açılma/kapanma oranı (hız oranı) ~1,6. */
  function rosenberg(phi, oq) {
    const tp = oq * 0.62, tn = oq * 0.38;
    if (phi < tp) return 0.5 * (1 - Math.cos(Math.PI * phi / tp));
    if (phi < tp + tn) return Math.cos(Math.PI * (phi - tp) / (2 * tn));
    return 0;
  }

  // İkinci dereceden rezonatör (Klatt): y = A x + B y1 + C y2
  function resCoef(f, bw, sr) {
    const C = -Math.exp(-TAU * bw / sr);
    const B = 2 * Math.exp(-Math.PI * bw / sr) * Math.cos(TAU * f / sr);
    return [1 - B - C, B, C];
  }
  // Rezonatör kaskadının f frekansındaki genliği (formant grafikleri için)
  function filtreYaniti(formantlar, f, sr = 48000) {
    let g = 1;
    const w = TAU * f / sr;
    const cr = Math.cos(w), ci = -Math.sin(w), c2r = Math.cos(2 * w), c2i = -Math.sin(2 * w);
    for (const [F0, B0] of formantlar) {
      const [A, B, C] = resCoef(F0, B0, sr);
      // H = A / (1 - B z^-1 - C z^-2)
      const re = 1 - B * cr - C * c2r, im = -B * ci - C * c2i;
      g *= Math.abs(A) / Math.hypot(re, im);
    }
    return g;
  }
  // Kaynağın harmonik genlikleri (akım türevinin Fourier katsayıları), 1. harmoniğe göre
  function kaynakSpektrum(oq = 0.6, n = 40) {
    const N = 2048, x = new Float64Array(N);
    let prev = rosenberg(0, oq);
    for (let i = 0; i < N; i++) { const v = rosenberg((i + 1) / N, oq); x[i] = v - prev; prev = v; }
    const out = [];
    for (let k = 1; k <= n; k++) {
      let re = 0, im = 0;
      for (let i = 0; i < N; i++) { re += x[i] * Math.cos(TAU * k * i / N); im -= x[i] * Math.sin(TAU * k * i / N); }
      out.push(Math.hypot(re, im));
    }
    const a0 = out[0] || 1;
    return out.map((v) => v / a0);
  }

  /* Hedef formantlar: ses türü, ünlü ve tını ayarlarından.
     karanlik: −1 (parlak, gırtlak yukarıda) … +1 (koyu/kapalı, gırtlak aşağıda): bütün formantlar ±%8 kayar.
     acik: ağız açıklığı (−1…1) F1'i ±%20 değiştirir. sf: şarkıcı formantı (0…1): F3–F5 2,4–3,2 kHz
     dolayında kümelenir ve bant genişlikleri daralır (Sundberg 1974). formantlar verilirse onlar kullanılır. */
  function hedefFormant(p) {
    let fs = p.formantlar ? p.formantlar.map((x) => x.slice()) : F.sentez(p.tip || "kadin", p.unlu || "a");
    const k = 1 - 0.08 * (p.karanlik || 0);
    fs = fs.map(([f, b]) => [f * k, b]);
    if (p.acik) fs[0][0] *= 1 + 0.2 * p.acik;
    if (p.f1) fs[0][0] = p.f1; // ünlü düzeltme deneyi için doğrudan F1
    const sf = p.sf || 0;
    if (sf > 0) {
      const merkez = p.tip === "erkek" ? 2800 : p.tip === "cocuk" ? 3400 : 3100;
      const hedef = [merkez - 330, merkez, merkez + 330];
      for (let i = 0; i < 3; i++) {
        fs[i + 2][0] = fs[i + 2][0] + (hedef[i] - fs[i + 2][0]) * sf;
        fs[i + 2][1] = fs[i + 2][1] * (1 - 0.45 * sf);
      }
    }
    return fs;
  }

  /* Durumlu ses üreteci. sr: örnekleme hızı. set(p) hedef parametreleri değiştirir; render(n) sonraki n örneği verir.
     Parametreler (hepsi isteğe bağlı):
       f0 (Hz), tip ("erkek" | "kadin" | "cocuk"), unlu ("a" "e" "ı" "i" "o" "ö" "u" "ü"), formantlar,
       gurluk 0…1, vibHiz (Hz), vibGen (± sent), nefes 0…1, oq (açık faz oranı 0,3…0,9),
       sf 0…1, karanlik −1…1, acik −1…1, nazal 0…1, jitter (oran), glide (sn, perde geçiş süresi),
       ses: 0/1 (titreşim açık mı; sessiz harflerde 0) */
  function Uretec(sr = 48000, p0 = {}, seed = 7) {
    const P = Object.assign({ f0: 220, tip: "kadin", unlu: "a", gurluk: 0.7, vibHiz: 5.5, vibGen: 0, nefes: 0.04, oq: 0.6,
      sf: 0, karanlik: 0, acik: 0, nazal: 0, jitter: 0, glide: 0.03, ses: 1 }, p0);
    const rand = rng(seed);
    let phase = 0, prevFlow = 0, vibPh = 0, t = 0;
    let f0 = P.f0, env = 0, gurluk = P.gurluk, nefes = P.nefes, oq = P.oq, nazal = P.nazal;
    let fs = hedefFormant(P), fsCur = fs.map((x) => x.slice());
    const st = fs.map(() => [0, 0]); // rezonatör durumları
    const nz = [0, 0], np = [0, 0];  // burun sıfırı ve kutbu
    let tilt = 0, agc = 1, rmsEst = 0.05;
    let coefs = [];
    function coefCalc() {
      coefs = fsCur.map(([f, b]) => resCoef(Math.min(f, sr * 0.45), b, sr));
    }
    coefCalc();
    function set(p) {
      Object.assign(P, p);
      if ("tip" in p || "unlu" in p || "formantlar" in p || "karanlik" in p || "acik" in p || "sf" in p || "f1" in p) fs = hedefFormant(P);
      if (p.ani) { // geçişsiz: hemen hedefe atla
        f0 = P.f0; fsCur = fs.map((x) => x.slice()); coefCalc(); gurluk = P.gurluk; oq = P.oq; nefes = P.nefes; nazal = P.nazal;
      }
    }
    // blok başına bir kez: yumuşak geçişler
    const BLOK = 32;
    function blok() {
      const dt = BLOK / sr;
      const kf = 1 - Math.exp(-dt / Math.max(0.002, P.glide));
      f0 += (P.f0 - f0) * kf;
      const kp = 1 - Math.exp(-dt / 0.02);
      gurluk += (P.gurluk - gurluk) * kp;
      oq += (P.oq - oq) * kp; nefes += (P.nefes - nefes) * kp; nazal += (P.nazal - nazal) * kp;
      let ch = false;
      for (let i = 0; i < fs.length; i++) for (let j = 0; j < 2; j++) {
        const d = fs[i][j] - fsCur[i][j];
        if (Math.abs(d) > 0.5) { fsCur[i][j] += d * (1 - Math.exp(-dt / 0.03)); ch = true; }
      }
      if (ch) coefCalc();
    }
    // burun kutbu 270 Hz; sıfır 270 Hz'den (etkisiz) 600 Hz'e kayar
    let nasalP = resCoef(270, 100, sr), nasalZ = resCoef(270, 100, sr), lastNz = -1;
    let bi = 0;
    function render(n, out = new Float32Array(n), offset = 0) {
      for (let i = 0; i < n; i++) {
        if (bi++ % BLOK === 0) {
          blok();
          if (Math.abs(nazal - lastNz) > 0.01) { lastNz = nazal; nasalZ = resCoef(270 + 330 * nazal, 100 + 80 * nazal, sr); }
        }
        // zarf: ses açık/kapalı (sessiz harf, nefes yeri)
        const hedefEnv = P.ses ? 1 : 0;
        env += (hedefEnv - env) * (hedefEnv > env ? 0.0016 : 0.0022) * (48000 / sr);
        // perde: vibrato + jitter
        vibPh += P.vibHiz / sr;
        if (vibPh >= 1) vibPh -= 1;
        const vib = P.vibGen ? P.vibGen * Math.sin(TAU * vibPh) : 0;
        const f = f0 * Math.pow(2, vib / 1200) * (P.jitter ? 1 + P.jitter * rand() : 1);
        phase += f / sr;
        if (phase >= 1) phase -= 1;
        const flow = rosenberg(phase, oq);
        let src = (flow - prevFlow) * (sr / f) * 0.25; // türev; perdeye göre ölçeklenir
        prevFlow = flow;
        // gürlük yükseldikçe üst harmonikler güçlenir: tek kutuplu alçak geçiren ile karışım
        const a = 0.55 - 0.45 * gurluk;
        tilt = (1 - a) * src + a * tilt;
        src = tilt;
        // nefes gürültüsü: akımla modüle
        src += nefes * (0.35 + flow) * rand() * 0.6;
        src *= env;
        // burun: kutup–sıfır çifti (nazal = 0'da birbirini götürür)
        let x = src;
        if (nazal > 0.01) {
          // sıfır (anti-rezonatör)
          const [A, B, C] = nasalZ;
          const y0 = (x - B * nz[0] - C * nz[1]) / A;
          nz[1] = nz[0]; nz[0] = x; x = y0;
          const [Ap, Bp, Cp] = nasalP;
          const y1 = Ap * x + Bp * np[0] + Cp * np[1];
          np[1] = np[0]; np[0] = y1; x = y1;
        }
        for (let k = 0; k < coefs.length; k++) {
          const [A, B, C] = coefs[k], s = st[k];
          const y = A * x + B * s[0] + C * s[1];
          s[1] = s[0]; s[0] = y; x = y;
        }
        // yavaş otomatik kazanç: ünlüler ve perdeler arasında ses düzeyi yakın kalsın
        if (env > 0.5) {
          rmsEst += (x * x / (env * env) - rmsEst) * 0.00015;
          agc = Math.min(40, Math.max(0.02, 0.18 / Math.sqrt(rmsEst + 1e-9)));
        }
        out[offset + i] = x * agc * (0.25 + 0.75 * gurluk) * 0.9;
        t += 1 / sr;
      }
      return out;
    }
    return { set, render, get P() { return P; }, get t() { return t; } };
  }

  // Sabit bir ses: dur saniye
  function uret(sr, dur, p, seed) {
    const g = Uretec(sr, Object.assign({}, p), seed);
    g.set({ ani: true });
    const n = Math.round(sr * dur);
    const out = g.render(n);
    yumusat(out, sr);
    return out;
  }
  // başı ve sonu tıklamasın
  function yumusat(out, sr, ms = 15) {
    const k = Math.min(out.length >> 1, Math.round(sr * ms / 1000));
    for (let i = 0; i < k; i++) { const g = i / k; out[i] *= g; out[out.length - 1 - i] *= g; }
    return out;
  }

  /* Sessiz harfler: perdesiz olanlar gürültüyle, perdeli olanlar formant ve zarfla.
     sure: saniye. "p t k ç" patlamalı (kapanış + patlama), "s ş f h" sürtünmeli; "m n l r y" perdeli. */
  const SESSIZ = {
    s: { tur: "surtunme", f: 6500, q: 1.4, g: 0.22, sure: 0.11 },
    ş: { tur: "surtunme", f: 3200, q: 1.1, g: 0.25, sure: 0.12 },
    f: { tur: "surtunme", f: 4000, q: 0.5, g: 0.08, sure: 0.09 },
    h: { tur: "surtunme", f: 1500, q: 0.4, g: 0.07, sure: 0.08 },
    p: { tur: "patlama", f: 1000, q: 0.6, g: 0.18, sure: 0.08 },
    t: { tur: "patlama", f: 4000, q: 0.8, g: 0.2, sure: 0.075 },
    k: { tur: "patlama", f: 2200, q: 1, g: 0.2, sure: 0.085 },
    ç: { tur: "patlama", f: 3200, q: 1.1, g: 0.22, sure: 0.11 },
    m: { tur: "genizden", formant: [[250, 60], [1100, 200], [2300, 250], [3300, 300], [3900, 300]], sure: 0.08 },
    n: { tur: "genizden", formant: [[250, 60], [1500, 200], [2500, 250], [3400, 300], [3950, 300]], sure: 0.07 },
    l: { tur: "akici", formant: [[360, 80], [1150, 120], [2600, 160], [3400, 200], [3950, 250]], sure: 0.06 },
    r: { tur: "akici", formant: [[450, 80], [1300, 120], [1800, 160], [3300, 200], [3900, 250]], sure: 0.05 },
    y: { tur: "akici", formant: [[300, 60], [2300, 100], [3000, 150], [3600, 200], [4100, 250]], sure: 0.06 },
  };

  // RBJ bant geçiren süzgeç (sürtünmeli sesler)
  function bp(f, q, sr) {
    const w = TAU * f / sr, al = Math.sin(w) / (2 * q), a0 = 1 + al;
    return { b0: al / a0, b2: -al / a0, a1: -2 * Math.cos(w) / a0, a2: (1 - al) / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  }
  function bpRun(s, x) {
    const y = s.b0 * x + s.b2 * s.x2 - s.a1 * s.y1 - s.a2 * s.y2;
    s.x2 = s.x1; s.x1 = x; s.y2 = s.y1; s.y1 = y;
    return y;
  }

  /* Ezgi: notalar [{ m (MIDI) | f (Hz), d (sn), u (ünlü), c (önündeki sessiz harf/ler, "ş" ya da "nd"),
                     g (gürlük), vib (bool | {hiz, gen, gecikme}), glide (sn) } | { r: sn (sus) }]
     opts: { tip, unlu, gurluk, vibHiz, vibGen, vibGecikme, nefes, sf, oq, karanlik, nazal, jitter, glide, a4 }
     Dönüş: { data: Float32Array, olaylar: [{t0, t1, m, f, sessiz, sus}] } */
  function ezgi(sr, notalar, opts = {}) {
    const a4 = opts.a4 || 440;
    const mtof = (m) => a4 * Math.pow(2, (m - 69) / 12);
    // önce zaman çizelgesi
    const olaylar = [];
    let t = BAS;
    notalar.forEach((n) => {
      if (n.r) { olaylar.push({ t0: t, t1: t + n.r, sus: true }); t += n.r; return; }
      const f = n.f || mtof(n.m);
      let cs = 0;
      if (n.c) for (const ch of n.c) cs += (SESSIZ[ch] || { sure: 0.06 }).sure;
      // sessiz harfin süresi notanın içinden alınır (ritim kaymasın)
      const csAl = Math.min(cs, n.d * 0.45);
      if (n.c) olaylar.push({ t0: t, t1: t + csAl, sessiz: n.c, f, m: n.m });
      olaylar.push({ t0: t + csAl, t1: t + n.d, f, m: n.m != null ? n.m : 69 + 12 * Math.log2(f / a4), u: n.u || opts.unlu || "a", g: n.g, vib: n.vib, glide: n.glide, nota: n });
      t += n.d;
    });
    const T = t + 0.25;
    const N = Math.round(T * sr);
    const out = new Float32Array(N);
    const base = Object.assign({ tip: "kadin", unlu: "a", gurluk: 0.7, vibHiz: 5.5, vibGen: 0, nefes: 0.04, sf: 0, oq: 0.6 }, opts);
    const g = Uretec(sr, Object.assign({}, base, { ses: 0, f0: olaylar.find((o) => o.f) ? olaylar.find((o) => o.f).f : 220 }), opts.seed || 11);
    g.set({ ani: true });
    const rand = rng(23);
    const BL = 64;
    let fil = null, filCh = null;
    for (let i0 = 0; i0 < N; i0 += BL) {
      const tt = i0 / sr;
      const o = olaylar.find((e) => tt >= e.t0 && tt < e.t1);
      let gur = null;
      if (!o || o.sus) g.set({ ses: 0 });
      else if (o.sessiz) {
        // harfin içindeki konum
        const ch = sessizHarfAt(o.sessiz, tt - o.t0, o.t1 - o.t0);
        const S = SESSIZ[ch.h] || SESSIZ.t;
        if (S.tur === "genizden" || S.tur === "akici") {
          g.set({ ses: 1, f0: o.f, formantlar: S.formant, nazal: S.tur === "genizden" ? 0.9 : 0, glide: 0.03 });
          gur = S.tur === "genizden" ? 0.35 : 0.5;
          fil = null; filCh = null;
        } else {
          g.set({ ses: 0, f0: o.f });
          if (filCh !== ch.h) { fil = bp(S.f, S.q, sr); filCh = ch.h; }
          // patlamalı: önce kapanış (sessizlik), son %25'te patlama
          const k = ch.k;
          const acik = S.tur === "surtunme" ? Math.sin(Math.PI * Math.min(1, k)) : (k > 0.72 ? Math.exp(-(k - 0.72) * 18) : 0);
          for (let j = 0; j < BL && i0 + j < N; j++) out[i0 + j] += bpRun(fil, rand()) * S.g * acik * 2.2;
        }
      } else {
        const v = o.vib === false ? 0 : o.vib && o.vib.gen != null ? o.vib.gen : base.vibGen;
        const hiz = o.vib && o.vib.hiz ? o.vib.hiz : base.vibHiz;
        const gecikme = o.vib && o.vib.gecikme != null ? o.vib.gecikme : base.vibGecikme || 0;
        const kVib = gecikme ? Math.min(1, Math.max(0, (tt - o.t0 - gecikme) / 0.25)) : 1;
        g.set({ ses: 1, f0: o.f, formantlar: null, unlu: o.u, nazal: base.nazal || 0, vibGen: v * kVib, vibHiz: hiz,
          glide: o.glide != null ? o.glide : base.glide != null ? base.glide : 0.035 });
        if (o.g != null) gur = o.g;
      }
      g.set({ gurluk: gur != null ? gur : base.gurluk });
      const n = Math.min(BL, N - i0);
      const blk = g.render(n);
      for (let j = 0; j < n; j++) out[i0 + j] += blk[j];
    }
    yumusat(out, sr, 8);
    return { data: out, olaylar, sure: T };
  }
  // ezgi verisinin başındaki boşluk (sn): olay zamanları buna göredir
  const BAS = 0.05;
  // "nd" gibi birden çok harfte: o andaki harf ve harf içindeki konum (0…1)
  function sessizHarfAt(c, dt, total) {
    const harfler = [...c];
    const sureler = harfler.map((h) => (SESSIZ[h] || { sure: 0.06 }).sure);
    const top = sureler.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let i = 0; i < harfler.length; i++) {
      const s = (sureler[i] / top) * total;
      if (dt < acc + s || i === harfler.length - 1) return { h: harfler[i], k: (dt - acc) / s };
      acc += s;
    }
    return { h: harfler[0], k: 0 };
  }

  const api = { BAS, rng, rosenberg, resCoef, filtreYaniti, kaynakSpektrum, hedefFormant, Uretec, uret, ezgi, SESSIZ, yumusat, Formant: F };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ================= Tarayıcı ================= */
  // Sürekli, canlı değiştirilebilir ses: küçük parçalar Web Audio saatine göre art arda çalınır.
  function canli(p = {}, { dest } = {}) {
    const c = Snd.ready(); if (!c) return null;
    const sr = c.sampleRate;
    const g = Uretec(sr, Object.assign({ ses: 1 }, p));
    g.set({ ani: true });
    const out = c.createGain();
    out.gain.value = 1;
    out.connect(dest || Snd.bus);
    const PARCA = 1024, ILERI = 0.16;
    let zaman = c.currentTime + 0.05, durdu = false;
    const sources = [];
    function doldur() {
      if (durdu) return;
      while (zaman < c.currentTime + ILERI) {
        const buf = c.createBuffer(1, PARCA, sr);
        g.render(PARCA, buf.getChannelData(0));
        const s = c.createBufferSource();
        s.buffer = buf; s.connect(out);
        if (zaman < c.currentTime) zaman = c.currentTime + 0.01;
        s.start(zaman);
        zaman += PARCA / sr;
        sources.push(s);
        s.onended = () => { const i = sources.indexOf(s); i >= 0 && sources.splice(i, 1); };
      }
    }
    doldur();
    const timer = setInterval(doldur, 25);
    const ctl = {
      set(q) { g.set(q); },
      get P() { return g.P; },
      out,
      stop() {
        if (durdu) return;
        durdu = true; clearInterval(timer);
        out.gain.setTargetAtTime(0, c.currentTime, 0.03);
        setTimeout(() => { sources.forEach((s) => { try { s.stop(); } catch (e) {} }); try { out.disconnect(); } catch (e) {} }, 300);
      },
      get stopped() { return durdu; },
    };
    Snd.own(ctl);
    return ctl;
  }

  // Hazır bir diziyi (Float32Array) çal; dönüş: { stop, t0 (ctx zamanı), sure }
  function calBuffer(data, { when = 0, dest, gain = 1 } = {}) {
    const c = Snd.ready(); if (!c) return null;
    const buf = c.createBuffer(1, data.length, c.sampleRate);
    buf.getChannelData(0).set(data);
    const s = c.createBufferSource(); s.buffer = buf;
    const g = c.createGain(); g.gain.value = gain;
    s.connect(g); g.connect(dest || Snd.bus);
    const t0 = Math.max(c.currentTime + 0.03, when || 0);
    s.start(t0);
    const ctl = { t0, sure: data.length / c.sampleRate, stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.02); s.stop(c.currentTime + 0.1); } catch (e) {} }, src: s };
    Snd.own(ctl);
    return ctl;
  }
  // Ezgiyi sentezle ve çal. Dönüş: { stop, t0, sure, olaylar }
  function soyle(notalar, opts = {}) {
    const c = Snd.ready(); if (!c) return null;
    const r = ezgi(c.sampleRate, notalar, opts);
    const ctl = calBuffer(r.data, opts);
    if (!ctl) return null;
    ctl.olaylar = r.olaylar;
    return ctl;
  }

  root.Ses = Object.assign(api, { canli, calBuffer, soyle });
})(typeof window !== "undefined" ? window : globalThis);
