/* Perde algılama ve mikrofon.
   - yin(): YIN algoritması (de Cheveigné ve Kawahara, 2002). Gitar eğitimindeki sürümden uyarlandı.
   - yinSes(): insan sesi için: 70–1100 Hz, yarı örnekleme hızında kaba arama + tam hızda ince ayar,
     oktav hatasına karşı denetim. Yaklaşık 43 ms'lik pencere.
   - Takipci: kare kare gelen ölçümlerden perde eğrisi: ses var/yok kararı (gürlük + periyodiklik, histerezisle),
     5 noktalı medyan (tek karelik oktav sıçramalarını atar) ve hafif yumuşatma (vibratoyu silmeyecek kadar).
   - Mic (tarayıcı): getUserMedia (yankı giderme, gürültü bastırma ve otomatik kazanç KAPALI), ölçüm
     AudioWorklet'te; yoksa AnalyserNode ile. Ses yalnızca bu tarayıcıda işlenir, hiçbir yere gönderilmez.
   Saf fonksiyonlar Node'da module.exports ile test edilir (test/pitch.test.js). */
(function (root) {
  const FMIN = 70, FMAX = 1100;

  /* YIN. buf: Float32Array, sr: örnekleme hızı. Dönüş: { freq, clarity (0..1), rms, tau, dn }; freq = 0: belirsiz. */
  function yin(buf, sr, { fmin = FMIN, fmax = FMAX, threshold = 0.15, n = buf.length } = {}) {
    let rms = 0;
    for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / n);
    const tauMin = Math.max(2, Math.floor(sr / fmax));
    const tauMax = Math.min(Math.floor(sr / fmin), Math.floor(n / 2));
    const W = n - tauMax;
    if (W < 16 || rms < 1e-4) return { freq: 0, clarity: 0, rms, tau: 0 };
    const d = new Float32Array(tauMax + 2);
    for (let tau = 1; tau <= tauMax + 1; tau++) {
      let s = 0;
      for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
      d[tau] = s;
    }
    const dn = new Float32Array(tauMax + 2);
    dn[0] = 1;
    let run = 0;
    for (let tau = 1; tau <= tauMax + 1; tau++) { run += d[tau]; dn[tau] = run ? (d[tau] * tau) / run : 1; }
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (dn[t] < threshold) {
        while (t + 1 <= tauMax && dn[t + 1] < dn[t]) t++;
        tau = t; break;
      }
    }
    if (tau < 0) {
      let best = tauMin;
      for (let t = tauMin; t <= tauMax; t++) if (dn[t] < dn[best]) best = t;
      if (dn[best] > 0.4) return { freq: 0, clarity: 1 - dn[best], rms, tau: 0, dn };
      tau = best;
    }
    let t = tau;
    if (tau > 1 && tau < tauMax) {
      const a = d[tau - 1], b = d[tau], c = d[tau + 1];
      const den = a + c - 2 * b;
      if (den > 0) t = tau + (a - c) / (2 * den);
    }
    return { freq: sr / t, clarity: Math.max(0, 1 - dn[tau]), rms, tau: t, dn };
  }

  /* İnsan sesi için YIN: 2'ye indirgenmiş örneklerde kaba arama, tam hızda ince ayar.
     buf uzunluğu ~43 ms olmalı (48 kHz'de 2048). */
  let dsBuf = null;
  function yinSes(buf, sr, opts = {}) {
    const n = buf.length;
    const dec = sr >= 32000 ? 2 : 1;
    let r;
    if (dec === 1) r = yin(buf, sr, opts);
    else {
      const m = n >> 1;
      if (!dsBuf || dsBuf.length !== m) dsBuf = new Float32Array(m);
      // 3 noktalı ortalama + seyreltme (kaba ama sesin perdesi için yeterli alçak geçiren)
      for (let i = 0; i < m; i++) {
        const j = 2 * i;
        dsBuf[i] = 0.25 * (buf[j > 0 ? j - 1 : 0]) + 0.5 * buf[j] + 0.25 * buf[j + 1 < n ? j + 1 : j];
      }
      r = yin(dsBuf, sr / 2, opts);
      if (r.freq) {
        // ince ayar: tam hızda, kaba periyodun çevresinde fark fonksiyonu
        let tc = r.tau * 2;
        if (altOktav(buf, sr, r.freq) && sr / (tc * 2) >= (opts.fmin || FMIN)) tc *= 2;
        const lo = Math.max(2, Math.floor(tc) - 3), hi = Math.ceil(tc) + 3;
        const W = n - hi - 1;
        if (W > 64) {
          const d = [];
          for (let tau = lo - 1; tau <= hi + 1; tau++) {
            let s = 0;
            for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
            d.push([tau, s]);
          }
          let bi = 1;
          for (let k = 1; k < d.length - 1; k++) if (d[k][1] < d[bi][1]) bi = k;
          const a = d[bi - 1][1], b = d[bi][1], c = d[bi + 1][1];
          const den = a + c - 2 * b;
          const t = d[bi][0] + (den > 0 ? (a - c) / (2 * den) : 0);
          r = { freq: sr / t, clarity: r.clarity, rms: r.rms, tau: t };
        } else r = { freq: sr / tc, clarity: r.clarity, rms: r.rms, tau: tc };
      }
    }
    return r;
    /* Oktav denetimi: YIN, ikinci harmoniği temelden güçlü seslerde (ör. erkek sesinde /a/, F1 ≈ 2·f0)
       yarım periyodu seçebilir. f/2 ve 3f/2'de belirgin enerji varsa asıl temel f/2'dir.
       Hann pencereli Goertzel ile dört frekansın enerjisi karşılaştırılır. */
    function altOktav(x, sr, f) {
      const n = x.length;
      const g = (fr) => {
        const w = 2 * Math.PI * fr / sr, c = 2 * Math.cos(w);
        let s1 = 0, s2 = 0;
        for (let i = 0; i < n; i++) { const s0 = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1))) + c * s1 - s2; s2 = s1; s1 = s0; }
        return s1 * s1 + s2 * s2 - c * s1 * s2;
      };
      const alt = g(f / 2) + g(1.5 * f), ust = g(f) + g(2 * f);
      return alt > ust * 0.005;
    }
  }

  const ftom = (f) => 69 + 12 * Math.log2(f / 440);

  /* Takipçi: ölçüm karelerinden kararlı perde. push({t, freq, clarity, rms}) → kare:
     { t, sesli, midi (yumuşatılmış ya da NaN), ham (medyanlı, yumuşatmasız), ham0 (medyansız: vibrato ölçümü için),
       f0, clarity, rms, db } */
  function Takipci(opts = {}) {
    const o = Object.assign({ acClar: 0.82, surClar: 0.62, minRms: 0.0025, acKare: 2, alfa: 0.65 }, opts);
    let sesli = false, aday = 0, taban = 0.002, son = [], yum = NaN, bosKare = 0;
    function push(fr) {
      const { t, freq, clarity, rms } = fr;
      // gürültü tabanı: yavaşça yükselir, hemen düşer
      taban = rms < taban ? rms : Math.min(0.01, taban + (rms - taban) * 0.0003);
      const esik = Math.max(o.minRms, taban * 2.5);
      const m = freq > 0 ? ftom(freq) : NaN;
      const iyi = freq > 0 && rms > esik;
      if (!sesli) {
        if (iyi && clarity >= o.acClar) { aday++; if (aday >= o.acKare) { sesli = true; son = []; yum = NaN; } }
        else aday = 0;
      } else if (!(iyi && clarity >= o.surClar)) {
        // tek karelik düşüşte hemen kapanma (sessiz harf değil, ölçüm gürültüsü olabilir)
        bosKare++;
        if (bosKare >= 2) { sesli = false; aday = 0; son = []; yum = NaN; }
      } else bosKare = 0;
      let ham = NaN, ham0 = NaN;
      if (sesli && iyi && clarity >= o.surClar) {
        ham0 = m;
        son.push(m);
        if (son.length > 5) son.shift();
        const s = son.slice().sort((a, b) => a - b);
        ham = s[s.length >> 1];
        // medyan pencerede oktav sıçraması varsa (ilk kareler) en yakın oktava çek
        if (!isNaN(yum) && Math.abs(ham - yum) > 9) ham -= 12 * Math.round((ham - yum) / 12);
        if (Math.abs(ham0 - ham) > 9) ham0 -= 12 * Math.round((ham0 - ham) / 12);
        yum = isNaN(yum) ? ham : yum + (ham - yum) * o.alfa;
      }
      const ses = sesli && !isNaN(ham);
      return { t, sesli: ses, midi: ses ? yum : NaN, ham, ham0: ses ? ham0 : NaN, f0: ses ? 440 * Math.pow(2, (yum - 69) / 12) : 0, clarity, rms,
        db: 20 * Math.log10(rms + 1e-9) };
    }
    return { push, reset() { sesli = false; aday = 0; son = []; yum = NaN; } };
  }

  // Bütün bir kayıttan perde dizisi (testler ve kayıt çözümlemesi için): hop örnek adım
  function izle(data, sr, { win = Math.round(sr * 0.0427), hop = Math.round(sr * 0.0107), takip = {} } = {}) {
    const tk = Takipci(takip);
    const out = [];
    const buf = new Float32Array(win);
    for (let i = 0; i + win <= data.length; i += hop) {
      buf.set(data.subarray(i, i + win));
      const r = yinSes(buf, sr);
      out.push(tk.push({ t: (i + win / 2) / sr, freq: r.freq, clarity: r.clarity, rms: r.rms }));
    }
    return out;
  }

  const api = { FMIN, FMAX, yin, yinSes, Takipci, izle, ftom };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ================= Tarayıcı: mikrofon ================= */
  const listeners = new Set(), stateListeners = new Set();
  let stream = null, source = null, analyser = null, worklet = null, timer = 0, state = "off", lastError = null, yol = "";
  let takip = Takipci(), timeBuf = null;
  const bekleme = new Set(); // ölçümü bekleten nedenler: "anlatim", "referans"
  let sonKare = null;

  const MESSAGES = {
    insecure: "Mikrofon yalnızca güvenli bağlantıda (https) ya da bilgisayarınızda yerel bir sunucuyla (localhost) çalışır. Sayfayı dosyaya çift tıklayarak açtıysanız mikrofon kullanılamaz; deneyler mikrofonsuz da çalışır.",
    unsupported: "Bu tarayıcı mikrofon erişimini desteklemiyor. Deneyler mikrofonsuz da çalışır.",
    denied: "Mikrofon izni verilmedi. İsterseniz adres çubuğundaki kilit simgesinden izni açıp yeniden deneyin; deneyler mikrofonsuz da çalışır.",
    nodevice: "Bir mikrofon bulunamadı. Mikrofon takılıysa başka bir uygulamanın kullanmadığından emin olun.",
    busy: "Mikrofon başka bir uygulama tarafından kullanılıyor olabilir. Onu kapatıp yeniden deneyin.",
    error: "Mikrofon açılamadı. Sayfayı yenileyip yeniden deneyin.",
  };
  function availability() {
    if (location.protocol === "file:" || !window.isSecureContext) return "insecure";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return "unsupported";
    return "ok";
  }

  // AudioWorklet kodu: yin ve yinSes'in kaynağı metin olarak gömülür (tek bir dosya, ayrı modül yüklemesi yok)
  function workletKodu() {
    return `const FMIN=${FMIN},FMAX=${FMAX};${yin.toString()}\nlet dsBuf=null;${yinSes.toString()}
class Olcer extends AudioWorkletProcessor{
  constructor(o){super();const p=o.processorOptions;this.win=p.win;this.hop=p.hop;this.ring=new Float32Array(this.win*2);this.w=0;this.n=0;this.buf=new Float32Array(this.win);}
  process(inputs){const x=inputs[0]&&inputs[0][0];if(!x)return true;
    for(let i=0;i<x.length;i++){this.ring[this.w]=x[i];this.w=(this.w+1)%this.ring.length;this.n++;
      if(this.n>=this.hop){this.n=0;const L=this.ring.length;let s=(this.w-this.win+L)%L;
        for(let k=0;k<this.win;k++)this.buf[k]=this.ring[(s+k)%L];
        const r=yinSes(this.buf,sampleRate);
        this.port.postMessage({t:currentTime+(i+1)/sampleRate-this.win/2/sampleRate,freq:r.freq,clarity:r.clarity,rms:r.rms});}}
    return true;}}
registerProcessor("san-olcer",Olcer);`;
  }

  async function start() {
    if (state === "on") return true;
    if (state === "asking") return false;
    const av = availability();
    if (av !== "ok") { lastError = av; emitState(); return false; }
    Snd.unlock();
    const ctx = Snd.ctx;
    state = "asking"; emitState();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
    } catch (e) {
      state = "off";
      const n = e && e.name;
      lastError = n === "NotAllowedError" || n === "SecurityError" ? "denied" : n === "NotFoundError" || n === "OverconstrainedError" ? "nodevice" : n === "NotReadableError" ? "busy" : "error";
      emitState();
      return false;
    }
    if (ctx.state !== "running") { try { await ctx.resume(); } catch (e) {} }
    source = ctx.createMediaStreamSource(stream);
    // spektrogram ve formant çözümlemesi için (hoparlöre bağlanmaz)
    analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);
    takip = Takipci();
    const sr = ctx.sampleRate;
    const win = sr >= 88000 ? 4096 : 2048, hop = Math.round(win / 4);
    yol = "";
    if (ctx.audioWorklet && window.AudioWorkletNode && !Mic.analyserZorla) {
      try {
        const url = URL.createObjectURL(new Blob([workletKodu()], { type: "application/javascript" }));
        await ctx.audioWorklet.addModule(url);
        worklet = new AudioWorkletNode(ctx, "san-olcer", { numberOfInputs: 1, numberOfOutputs: 0, processorOptions: { win, hop } });
        worklet.port.onmessage = (e) => kare(e.data);
        source.connect(worklet);
        yol = "worklet";
      } catch (e) { worklet = null; }
    }
    if (!worklet) {
      // yedek yol: çözümleyiciden ~10 ms'de bir pencere oku
      timeBuf = new Float32Array(win);
      const an2 = ctx.createAnalyser();
      an2.fftSize = win; an2.smoothingTimeConstant = 0;
      source.connect(an2);
      timer = setInterval(() => {
        an2.getFloatTimeDomainData(timeBuf);
        const r = yinSes(timeBuf, sr);
        kare({ t: ctx.currentTime - win / 2 / sr, freq: r.freq, clarity: r.clarity, rms: r.rms });
      }, 10);
      yol = "analyser";
    }
    state = "on"; lastError = null; emitState();
    return true;
  }
  function kare(raw) {
    const fr = takip.push(raw);
    fr.bekle = bekleme.size ? [...bekleme][0] : null;
    if (fr.bekle) { fr.sesli = false; fr.midi = NaN; fr.ham = NaN; fr.f0 = 0; }
    sonKare = fr;
    listeners.forEach((f) => { try { f(fr); } catch (e) { console.error(e); } });
  }
  function stop() {
    clearInterval(timer);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    try { source && source.disconnect(); } catch (e) {}
    try { worklet && worklet.disconnect(); worklet && (worklet.port.onmessage = null); } catch (e) {}
    stream = source = analyser = worklet = null;
    if (state !== "off") { state = "off"; emitState(); }
  }
  function emitState() { stateListeners.forEach((f) => f(state, lastError)); document.body && document.body.classList.toggle("mic-on", state === "on"); }

  // slayttan çıkınca ve sekme gizlenince mikrofon kapanır: "mikrofon açık" göstergesi boşuna yanmasın
  window.addEventListener("slidechange", () => { if (state === "on") stop(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && state === "on") stop(); });

  const Mic = {
    start, stop, availability, MESSAGES,
    get state() { return state; }, get error() { return lastError; }, get yol() { return yol; },
    get stream() { return stream; }, get analyser() { return analyser; }, get source() { return source; },
    get son() { return sonKare; },
    message(code) { return MESSAGES[code || lastError] || ""; },
    onFrame(f) { listeners.add(f); return () => listeners.delete(f); },
    onState(f) { stateListeners.add(f); f(state, lastError); return () => stateListeners.delete(f); },
    // ölçümü beklet: anlatım ya da referans ses çalarken mikrofon hoparlörü duymasın
    bekle(neden, on) { if (on) bekleme.add(neden); else bekleme.delete(neden); stateListeners.forEach((f) => f(state, lastError)); },
    get bekliyor() { return bekleme.size ? [...bekleme][0] : null; },
    analyserZorla: false,
  };
  root.Pitch = api;
  root.Mic = Mic;
})(typeof window !== "undefined" ? window : globalThis);
