/* Ezgiler ve egzersizler. Notalar göreli: [yarım ses (0 = başlangıç notası), vuruş (dörtlük = 1), hece].
   Yalnızca kamu malı eserler ve bu site için yazılmış egzersizler (telif: docs/arastirma.md bölüm 13).
   Ezgiler.notalar(id, { bas, tempo }) → [{ m, d (sn), hece }]; bas verilmezse ziyaretçinin aralığına göre perdelenir. */
(function (root) {
  const q = (n, b, h) => [n, b, h];
  const EZGILER = [
    {
      id: "nese", ad: "Neşeye Övgü", kaynak: "Beethoven, 9. Senfoni (1824), finaldeki tema; kamu malı. Basitleştirilmiş, tek ses.",
      tempo: 96, hece: "solfej",
      notalar: [q(4, 1), q(4, 1), q(5, 1), q(7, 1), q(7, 1), q(5, 1), q(4, 1), q(2, 1), q(0, 1), q(0, 1), q(2, 1), q(4, 1), q(4, 1.5), q(2, 0.5), q(2, 2),
        q(4, 1), q(4, 1), q(5, 1), q(7, 1), q(7, 1), q(5, 1), q(4, 1), q(2, 1), q(0, 1), q(0, 1), q(2, 1), q(4, 1), q(2, 1.5), q(0, 0.5), q(0, 2)],
    },
    {
      id: "frere", ad: "Frère Jacques", kaynak: "Fransız halk ezgisi (18. yüzyıl; en eski el yazması 1780 dolayı); kamu malı.",
      tempo: 100, hece: "solfej",
      notalar: [q(0, 1), q(2, 1), q(4, 1), q(0, 1), q(0, 1), q(2, 1), q(4, 1), q(0, 1), q(4, 1), q(5, 1), q(7, 2), q(4, 1), q(5, 1), q(7, 2),
        q(7, 0.5), q(9, 0.5), q(7, 0.5), q(5, 0.5), q(4, 1), q(0, 1), q(7, 0.5), q(9, 0.5), q(7, 0.5), q(5, 0.5), q(4, 1), q(0, 1),
        q(0, 1), q(-5, 1), q(0, 2), q(0, 1), q(-5, 1), q(0, 2)],
    },
    {
      id: "yildiz", ad: "Ah! vous dirai-je, maman", kaynak: "Fransız ezgisi, ilk basım 1761; Mozart'ın çeşitlemeleriyle (KV 265) tanınır; kamu malı.",
      tempo: 100, hece: "solfej",
      notalar: [q(0, 1), q(0, 1), q(7, 1), q(7, 1), q(9, 1), q(9, 1), q(7, 2), q(5, 1), q(5, 1), q(4, 1), q(4, 1), q(2, 1), q(2, 1), q(0, 2),
        q(7, 1), q(7, 1), q(5, 1), q(5, 1), q(4, 1), q(4, 1), q(2, 2), q(7, 1), q(7, 1), q(5, 1), q(5, 1), q(4, 1), q(4, 1), q(2, 2),
        q(0, 1), q(0, 1), q(7, 1), q(7, 1), q(9, 1), q(9, 1), q(7, 2), q(5, 1), q(5, 1), q(4, 1), q(4, 1), q(2, 1), q(2, 1), q(0, 2)],
    },
    // --- bu site için yazılmış egzersizler ---
    { id: "besli-inis", ad: "Beşli inişi", kaynak: "Egzersiz (bu site için).", tempo: 88, hece: "solfej", notalar: [q(7, 1), q(5, 1), q(4, 1), q(2, 1), q(0, 2)] },
    { id: "uclu", ad: "Üçlü atlama", kaynak: "Egzersiz (bu site için).", tempo: 84, hece: "solfej", notalar: [q(0, 1), q(4, 1), q(7, 1), q(4, 1), q(0, 2)] },
    { id: "basamak", ad: "Basamaklar", kaynak: "Egzersiz (bu site için).", tempo: 96, hece: "solfej", notalar: [q(0, 1), q(2, 1), q(4, 1), q(5, 1), q(7, 1), q(5, 1), q(4, 1), q(2, 1), q(0, 2)] },
    { id: "oktav", ad: "Oktav kaydırma", kaynak: "Egzersiz (bu site için).", tempo: 76, hece: "u", notalar: [q(0, 1), q(12, 2), q(7, 1), q(4, 1), q(0, 2)] },
    {
      id: "sabah", ad: "Sabah olur", kaynak: "Bu site için yazıldı (söz ve ezgi: Koray Toksöz eğitimi için).",
      tempo: 80, hece: "soz",
      notalar: [q(0, 1, "Sa"), q(2, 1, "bah"), q(4, 1, "o"), q(5, 1, "lur,"), q(7, 2, "gün"), q(4, 2, "doğ"), q(5, 1, "ar,"), q(4, 1, "ses"), q(2, 1, "le"), q(4, 1, "ri"), q(2, 1, "miz"), q(0, 3, "yük"), q(2, 1, "se"), q(0, 2, "lir.")],
    },
    {
      id: "legato", ad: "Su gibi", kaynak: "Bu site için yazıldı.", tempo: 72, hece: "soz",
      notalar: [q(0, 1, "Su"), q(4, 1, "gi"), q(7, 2, "bi"), q(5, 1, "ak"), q(4, 1, "sın"), q(2, 2, "ses"), q(4, 1, "lim"), q(2, 1, "an"), q(0, 2, "dan.")],
    },
  ];
  const HECE = { 0: "do", 2: "re", 4: "mi", 5: "fa", 7: "sol", 9: "la", 11: "si", 12: "do", "-5": "sol", "-1": "si", "-3": "la", 14: "re" };
  const bul = (id) => EZGILER.find((e) => e.id === id);
  function notalar(id, { bas = null, tempo = null, hece = null } = {}) {
    const e = typeof id === "string" ? bul(id) : id;
    const b = bas != null ? bas : root.Aralik ? root.Aralik.perdele(e.notalar.map((n) => n[0])) : 60;
    const sn = 60 / (tempo || e.tempo);
    const tur = hece || e.hece;
    return e.notalar.map(([n, v, h]) => {
      const hc = h || (tur === "solfej" ? HECE[n] || "" : tur === "soz" ? "" : tur);
      return { m: b + n, d: v * sn, hece: hc, u: unluOf(hc) };
    });
  }
  // hecedeki ünlü (sentez ses için)
  function unluOf(h) {
    const m = /[aeıioöuü]/.exec((h || "a").toLocaleLowerCase("tr"));
    return m ? m[0] : "a";
  }
  const out = { EZGILER, bul, notalar, unluOf, HECE };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else root.Ezgiler = out;
})(typeof window !== "undefined" ? window : globalThis);
