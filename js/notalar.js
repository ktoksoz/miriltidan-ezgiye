/* Nota ↔ frekans ↔ sent dönüşümleri ve nota adları.
   Saf hesap modülü: DOM kullanmaz; tarayıcıda window.N, Node'da require("./notalar.js").
   MIDI numarası: La4 (A4) = 69 = 440 Hz; Do4 (orta Do) = 60. Oktav numarası bilimsel yazımdadır (C4 = orta Do). */
(function (root) {
  const A4 = 440;
  const mtof = (m, a4 = A4) => a4 * Math.pow(2, (m - 69) / 12);
  const ftom = (f, a4 = A4) => 69 + 12 * Math.log2(f / a4);
  // f1'den f2'ye kaç sent (f2 tizse artı)
  const cents = (f1, f2) => 1200 * Math.log2(f2 / f1);
  const centsToRatio = (c) => Math.pow(2, c / 1200);
  // frekans → en yakın nota ve o notadan sent sapması
  function nearest(f, a4 = A4) {
    const m = ftom(f, a4), r = Math.round(m);
    return { midi: r, cents: (m - r) * 100 };
  }

  const SOLFEJ = ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "Si♭", "Si"];
  const HARF = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
  const pc = (m) => ((Math.round(m) % 12) + 12) % 12;
  const oktav = (m) => Math.floor(Math.round(m) / 12) - 1;
  // style: "solfej" (Do4) ya da "harf" (C4); oct: false → oktavsız
  function ad(m, { style = "solfej", oct = true } = {}) {
    const n = (style === "harf" ? HARF : SOLFEJ)[pc(m)];
    return oct ? n + oktav(m) : n;
  }
  // "C4", "F#3", "Bb5", "Sol4", "Si♭3", "La#2" → MIDI
  function parse(s) {
    const lat = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const sol = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11 };
    let m = /^([A-G])([#♯b♭]?)(-?\d)$/.exec(s), base, acc, oct;
    if (m) { base = lat[m[1]]; acc = m[2]; oct = +m[3]; }
    else {
      m = /^(Do|Re|Mi|Fa|Sol|La|Si)([#♯b♭]?)(-?\d)$/.exec(s);
      if (!m) throw new Error("Nota adı anlaşılamadı: " + s);
      base = sol[m[1]]; acc = m[2]; oct = +m[3];
    }
    return (oct + 1) * 12 + base + (acc === "#" || acc === "♯" ? 1 : acc === "b" || acc === "♭" ? -1 : 0);
  }
  const isBlack = (m) => [1, 3, 6, 8, 10].includes(pc(m));

  // Aralık adları (yarım ses sayısına göre)
  const ARALIK = ["birli", "küçük ikili", "büyük ikili", "küçük üçlü", "büyük üçlü", "tam dörtlü", "artık dörtlü",
    "tam beşli", "küçük altılı", "büyük altılı", "küçük yedili", "büyük yedili", "oktav"];
  const aralikAdi = (n) => (Math.abs(n) <= 12 ? ARALIK[Math.abs(n)] : Math.abs(n) + " yarım ses");

  // Majör gam basamakları (do-re-mi) ve solfej heceleri
  const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12];
  const HECE = ["do", "re", "mi", "fa", "sol", "la", "si", "do"];

  const N = { A4, mtof, ftom, cents, centsToRatio, nearest, SOLFEJ, HARF, pc, oktav, ad, parse, isBlack, ARALIK, aralikAdi, MAJOR, HECE };
  if (typeof module !== "undefined" && module.exports) module.exports = N;
  else root.N = N;
})(typeof window !== "undefined" ? window : globalThis);
