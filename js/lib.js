/* Ortak yardımcılar: renk kodu, tercihler, tuval, döngüler, DOM, kontroller.
   Gitar eğitimindeki lib.js'ten uyarlandı. */
(function () {
  /* Renk kodu: bütün sitede aynı anlam. Değerler css/style.css'teki değişkenlerden okunur (karanlık tema için).
       tam   hedefin tam üstünde (±15 sent)      pes  biraz pes      tiz  biraz tiz
       fosfor hedef nota bandı                  kirmizi sağlık uyarısı, kırılma
       ink, grafit, porte: mürekkep, kurşun kalem ve baskılı porte çizgisi */
  const C = {};
  const VARS = {
    bg: "--bg", bg2: "--bg-2", kagit: "--kagit", kagit2: "--kagit-2", porte: "--porte", porte2: "--porte-2",
    ink: "--ink", ink2: "--ink-2", muted: "--muted", grafit: "--grafit", line: "--line", line2: "--line-2",
    fosfor: "--fosfor", fosforInk: "--fosfor-ink", kirmizi: "--kirmizi", tam: "--tam", pes: "--pes", tiz: "--tiz",
  };
  function readTokens() {
    const cs = getComputedStyle(document.documentElement);
    for (const [k, v] of Object.entries(VARS)) C[k] = cs.getPropertyValue(v).trim() || C[k] || "#888";
  }
  readTokens();
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  mq && mq.addEventListener && mq.addEventListener("change", () => { readTokens(); window.dispatchEvent(new Event("themechange")); });

  const FONT = {
    display: '"Anybody", system-ui, sans-serif',
    body: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
    mono: '"Atkinson Hyperlegible Mono", ui-monospace, monospace',
  };

  /* Tarayıcıda saklanan küçük veriler: gizli pencerede ya da kapalı depolamada sessizce vazgeçer.
     Anahtarlar "san." önekiyle (aynı alan adında başka eğitimler de var). */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("san." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("san." + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("san." + k); } catch (e) {} },
  };

  /* Tercihler: bütün sitede geçerli; değişince "prefchange" olayı */
  const prefs = {
    notaAdi: store.get("notaAdi", "solfej"), // "solfej" (Do Re Mi) ya da "harf" (C D E)
    referans: store.get("referans", "ses"),   // referans notası: "ses" (sentez ünlü), "piyano", "sinus"
    kulaklik: store.get("kulaklik", false),   // kulaklık takılı: dinle ve söyle aynı anda
    sesBolge: store.get("sesBolge", null),    // "pes" (çoğu erkek sesi) ya da "tiz" (çoğu kadın ve çocuk sesi)
    gorunum: store.get("gorunum", "rulo"),    // perde eğrisinin arka planı: "rulo" (piyano rulosu) ya da "porte"
  };
  function setPref(k, v) {
    prefs[k] = v; store.set(k, v);
    window.dispatchEvent(new CustomEvent("prefchange", { detail: { k, v } }));
  }
  const nn = (m, opts = {}) => N.ad(m, { style: prefs.notaAdi, ...opts });

  function hexToRgb(h) {
    if (h.startsWith("rgb")) return h.match(/[\d.]+/g).slice(0, 3).map(Number);
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function mix(h1, h2, t) {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  }
  /* Perde rengi: hedeften sapma (sent) → renk. ±15 sent tam; 15–50 arasında pes/tiz rengine geçer. */
  function perdeRenk(c) {
    const a = Math.abs(c);
    if (a <= 15) return C.tam;
    const t = Math.min(1, (a - 15) / 35);
    return mix(C.tam, c < 0 ? C.pes : C.tiz, t);
  }
  // Sapmayı cesaretlendirici dille söyle
  function sapmaSoz(c, tol = 15) {
    if (Math.abs(c) <= tol) return "tam üstünde";
    if (c < 0) return Math.abs(c) < 50 ? "biraz pes, biraz yukarı" : "pes, yukarı çık";
    return Math.abs(c) < 50 ? "biraz tiz, biraz aşağı" : "tiz, aşağı in";
  }

  /* Yüksek çözünürlüklü, kendini yeniden boyutlandıran tuval.
     İlk onResize geri çağrısı mikro göreve ertelenir: çağıran kod dönüş değerini değişkene atamış olsun. */
  function canvas(el, onResize, ctxOpts) {
    const ctx = el.getContext("2d", ctxOpts);
    const state = { ctx, w: 0, h: 0, dpr: 1 };
    function fit() {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = r.width; state.h = r.height; state.dpr = dpr;
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ready && onResize && onResize(state);
    }
    let ready = false;
    fit();
    ready = true;
    new ResizeObserver(fit).observe(el);
    queueMicrotask(() => { if (state.w && onResize) onResize(state); });
    state.fit = fit;
    return state;
  }

  /* requestAnimationFrame döngüsü: slayt görünürken çalışır */
  function loop(fn) {
    let id = 0, last = 0, running = false;
    function tick(t) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      fn(dt, t / 1000);
      id = requestAnimationFrame(tick);
    }
    return {
      start() { if (!running) { running = true; last = 0; id = requestAnimationFrame(tick); } },
      stop() { running = false; cancelAnimationFrame(id); },
      get running() { return running; },
    };
  }

  /* Küçük DOM yardımcısı: h("div.cls#id", {attrs}, ...children) */
  function h(spec, attrs, ...kids) {
    const m = spec.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement(m[1] || "div");
    (m[2].match(/[.#][\w-]+/g) || []).forEach((p) => {
      if (p[0] === ".") el.classList.add(p.slice(1)); else el.id = p.slice(1);
    });
    if (attrs && (typeof attrs !== "object" || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; }
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((k) => k != null && k !== false && el.append(k.nodeType ? k : document.createTextNode(k)));
    return el;
  }
  const SVGNS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "text") el.textContent = v;
      else if (k === "class") el.setAttribute("class", v);
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    kids.flat().forEach((k) => k && el.append(k));
    return el;
  }

  function slider({ label, min, max, step = 0.01, value, fmt = (v) => v.toFixed(2), oninput, width, cls }) {
    const val = h("span.val", fmt(value));
    const input = h("input", { type: "range", min, max, step, value, "aria-label": label });
    if (cls) input.classList.add(cls);
    if (width) input.style.width = width;
    input.addEventListener("input", () => { val.textContent = fmt(+input.value); oninput(+input.value); });
    const wrap = h("label.sl", h("span.sl-lab", label), input, val);
    wrap.set = (v) => { input.value = v; val.textContent = fmt(+input.value); };
    wrap.input = input;
    return wrap;
  }

  function seg(options, value, onchange, label) {
    const wrap = h("div.seg", { role: "group", "aria-label": label || null });
    const btns = options.map(([k, lab, title]) => {
      const b = h("button", { type: "button", title: title || null }, lab);
      b.addEventListener("click", () => { set(k); onchange(k); });
      wrap.append(b); return [k, b];
    });
    function set(k) { btns.forEach(([kk, b]) => { b.classList.toggle("on", kk === k); b.setAttribute("aria-pressed", kk === k); }); }
    set(value);
    wrap.set = set;
    wrap.buttons = btns;
    return wrap;
  }
  const btn = (label, onclick, cls = "") => h("button.btn" + (cls ? "." + cls.split(" ").join(".") : ""), { type: "button", onclick }, label);
  // simgeler (satır içi SVG)
  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    rec: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>',
    ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5 2"/><path d="M10 9.5a2 2 0 0 1 4 0"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>',
  };
  const ibtn = (icon, label, onclick, cls = "") => {
    const b = h("button.btn" + (cls ? "." + cls.split(" ").join(".") : ""), { type: "button", onclick });
    b.innerHTML = ICON[icon] + "<span></span>";
    b.lastChild.textContent = label;
    b.setLabel = (t) => { b.lastChild.textContent = t; };
    b.setIcon = (i) => { b.firstChild.outerHTML = ICON[i]; };
    return b;
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // sayıları Türkçe biçimde yaz: 1.234,5
  // 10.000'in altında binlik ayırıcı yok: "1338 Hz" ile "5,9 ms" karışmasın
  const fmtNum = (v, d = 0) => v.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: Math.abs(v) >= 10000 });
  const fmtHz = (f) => (f >= 1000 ? fmtNum(f / 1000, 2) + " kHz" : fmtNum(f, f < 100 ? 1 : 0) + " Hz");
  const fmtCents = (c, d = 0) => (Math.round(c) > 0 ? "+" : Math.round(c) < 0 ? "−" : "±") + fmtNum(Math.abs(c), d) + " sent";
  const fmtSure = (s) => (s < 60 ? fmtNum(s, 1) + " sn" : `${Math.floor(s / 60)} dk ${Math.round(s % 60)} sn`);

  function text(ctx, str, x, y, { size = 13, color = C.ink2, align = "left", base = "alphabetic", weight = 500, font = FONT.body } = {}) {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillText(str, x, y);
  }
  function trace(ctx, data, x, y, w, hh, color, lw = 2) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const px = x + (i / (data.length - 1)) * w, py = y + hh / 2 - data[i] * hh / 2;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* Piyano klavyesi çizimi (tuval). lo..hi MIDI; serit: [lo, hi] fosforlu aralık şeridi;
     isaret: [{m, renk, etiket}], basili: Set(m). Dönüş: m → {x, w} eşlemesi (tıklama için). */
  function piyano(ctx, x, y, w, hh, { lo = 36, hi = 84, serit = null, seritRenk = null, isaret = [], basili = null, etiket = true, bolgeler = [] } = {}) {
    const beyazlar = [];
    for (let m = lo; m <= hi; m++) if (!N.isBlack(m)) beyazlar.push(m);
    const bw = w / beyazlar.length;
    const pos = new Map();
    beyazlar.forEach((m, i) => pos.set(m, { x: x + i * bw, w: bw, siyah: false }));
    for (let m = lo; m <= hi; m++) if (N.isBlack(m)) {
      const sol = pos.get(m - 1);
      if (sol) pos.set(m, { x: sol.x + bw * 0.68, w: bw * 0.64, siyah: true });
    }
    // bölgeler (ör. ses türlerinin tipik aralıkları): klavyenin üstünde ince şeritler
    // beyaz tuşlar
    ctx.save();
    beyazlar.forEach((m) => {
      const p = pos.get(m);
      ctx.fillStyle = basili && basili.has(m) ? mix(C.kagit2, C.ink, 0.25) : C.kagit2;
      ctx.fillRect(p.x + 0.5, y, p.w - 1, hh);
      ctx.strokeStyle = C.line2; ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 0.5, y + 0.5, p.w - 1, hh - 1);
    });
    // aralık şeridi: fosforlu kalem, tuşların alt yarısında
    if (serit && serit[0] != null) {
      const a = pos.get(serit[0]) || pos.get(serit[0] + 1), b = pos.get(serit[1]) || pos.get(serit[1] - 1);
      if (a && b) {
        ctx.fillStyle = rgba(seritRenk || C.fosfor, 0.75);
        const yy = y + hh * 0.62, sh = hh * 0.3;
        ctx.beginPath();
        ctx.moveTo(a.x + 2, yy + 3); ctx.lineTo(b.x + b.w - 2, yy); ctx.lineTo(b.x + b.w - 4, yy + sh); ctx.lineTo(a.x + 3, yy + sh - 2); ctx.closePath();
        ctx.fill();
      }
    }
    bolgeler.forEach((bg, i) => {
      const a = pos.get(bg.lo) || pos.get(bg.lo + 1), b = pos.get(bg.hi) || pos.get(bg.hi - 1);
      if (!a || !b) return;
      ctx.fillStyle = rgba(bg.renk || C.porte, bg.alfa || 0.35);
      ctx.fillRect(a.x, y + 2 + i * 6, b.x + b.w - a.x, 5);
    });
    // siyah tuşlar
    for (let m = lo; m <= hi; m++) {
      const p = pos.get(m);
      if (!p || !p.siyah) continue;
      ctx.fillStyle = basili && basili.has(m) ? C.ink2 : C.ink;
      ctx.fillRect(p.x, y, p.w, hh * 0.6);
    }
    // Do etiketleri
    if (etiket) beyazlar.forEach((m) => {
      if (N.pc(m) !== 0) return;
      const p = pos.get(m);
      // fosforlu şeridin üstünde koyu mürekkep (karanlık temada da okunsun)
      const seritte = serit && serit[0] != null && m >= serit[0] && m <= serit[1];
      text(ctx, nn(m), p.x + p.w / 2, y + hh - 6, { size: Math.min(11, bw * 0.55), color: seritte ? "#1c2340" : C.muted, align: "center", weight: 700, font: FONT.mono });
    });
    isaret.forEach((s) => {
      const p = pos.get(s.m);
      if (!p) return;
      const cy = p.siyah ? y + hh * 0.42 : y + hh * 0.42;
      ctx.fillStyle = s.renk || C.ink;
      ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, cy, Math.min(7, p.w * 0.36), Math.min(5.4, p.w * 0.28), -0.38, 0, Math.PI * 2); ctx.fill();
      if (s.etiket) text(ctx, s.etiket, p.x + p.w / 2, y - 6, { size: 11, color: s.renk || C.ink, align: "center", weight: 700 });
    });
    ctx.restore();
    return pos;
  }

  const narrow = () => window.matchMedia("(max-width: 860px)").matches;
  const slide = (html) => document.getElementById("deck").insertAdjacentHTML("beforeend", html);

  // Kısa bildirim
  let toastEl = null, toastT = 0;
  function toast(msg, ms = 2600) {
    if (!toastEl) { toastEl = h("div.toast", { role: "status" }); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), ms);
  }

  window.L = { slide, C, readTokens, FONT, store, prefs, setPref, nn, rgba, mix, perdeRenk, sapmaSoz, canvas, loop, h, s, slider, seg, btn, ibtn, ICON,
    clamp, lerp, ease, fmtNum, fmtHz, fmtCents, fmtSure, text, trace, piyano, narrow, toast };
  window.Demos = window.Demos || {};
  window.GuideScenarios = window.GuideScenarios || {};
  window.GuideTargets = window.GuideTargets || {};
})();
