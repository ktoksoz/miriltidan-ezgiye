/* Alt çubuktaki paneller: mikrofon, kulaklık anahtarı ve ayarlar (referans sesi, nota adları, ses bölgesi,
   ses aralığı şeridi). */
(function () {
  const { h, prefs, setPref, seg, ICON } = L;
  const panels = [];
  function panel(id, title, btnId) {
    const body = h("div");
    const el = h("div.panel#" + id, { role: "dialog", "aria-label": title },
      h("h4", title, h("span.spacer"), h("button.close", { type: "button", "aria-label": "Kapat", onclick: () => toggle(false) }, "×")), body);
    document.body.append(el);
    const btn = document.getElementById(btnId);
    function toggle(force) {
      const open = force ?? !el.classList.contains("open");
      if (open) panels.forEach((p) => p !== api && p.toggle(false));
      el.classList.toggle("open", open);
      btn && btn.classList.toggle("on", open);
      api.onToggle && api.onToggle(open);
    }
    btn && btn.addEventListener("click", () => toggle());
    const api = { el, body, toggle, get open() { return el.classList.contains("open"); } };
    panels.push(api);
    return api;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") panels.forEach((p) => p.toggle(false)); });
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".panel, #bar")) panels.forEach((p) => p.toggle(false));
  });

  /* Mikrofon paneli */
  const mp = panel("mic-panel", "Mikrofon", "btn-mic");
  const ms = Alistirma.MicSatiri();
  mp.body.append(
    h("p", "Mikrofon yalnızca bir düğmeye bastığınızda açılır. Ses bu tarayıcıda işlenir; hiçbir yere gönderilmez, kaydetmek istemedikçe saklanmaz. Slayttan çıkınca ya da sekmeyi değiştirince mikrofon kapanır."),
    ms.el,
    h("p", { style: { marginTop: "12px" } }, "Ölçümler yaklaşıktır: mikrofona, odaya ve sesin gürlüğüne bağlıdır. En iyi sonuç için sessiz bir oda, mikrofondan bir karış uzaklık ve kulaklık."));
  const micBtn = document.getElementById("btn-mic");
  Mic.onState((st) => {
    micBtn.setAttribute("aria-label", st === "on" ? "Mikrofon açık: panel" : "Mikrofon");
    micBtn.title = st === "on" ? "Mikrofon açık" : "Mikrofon";
  });

  /* Kulaklık anahtarı */
  const ph = document.getElementById("btn-phones");
  function phRender() {
    ph.classList.toggle("on", !!prefs.kulaklik);
    ph.setAttribute("aria-pressed", !!prefs.kulaklik);
    ph.title = prefs.kulaklik ? "Kulaklık takılı: referans sesle birlikte söyleyin" : "Kulaklık yok: önce dinleyin, sonra söyleyin";
  }
  ph.addEventListener("click", () => {
    setPref("kulaklik", !prefs.kulaklik);
    L.toast(prefs.kulaklik ? "Kulaklık modu: referans sesle aynı anda söyleyebilirsiniz" : "Hoparlör modu: önce dinleyin, sonra söyleyin");
  });
  window.addEventListener("prefchange", phRender);
  phRender();

  /* Ayarlar paneli */
  const sp = panel("settings-panel", "Ayarlar", "btn-settings");
  const serit = Aralik.Serit({ lo: 36, hi: 84, duzenle: true, yukseklik: 74 });
  sp.body.append(
    h("div.row", h("span", "Referans sesi"), seg([["ses", "Sentez ses"], ["piyano", "Piyano"], ["sinus", "Sinüs"]], prefs.referans, (k) => { setPref("referans", k); Snd.unlock(); Snd.referans(Aralik.perdele([0]), { dur: 0.8, olcmeyiSurdur: true }); }, "Referans sesi")),
    h("div.row", h("span", "Nota adları"), seg([["solfej", "Do Re Mi"], ["harf", "C D E"]], prefs.notaAdi, (k) => setPref("notaAdi", k), "Nota adları")),
    h("div.row", h("span", "Sesiniz"), seg([["pes", "Daha pes (çoğu erkek sesi)"], ["tiz", "Daha tiz (çoğu kadın ve çocuk sesi)"]], prefs.sesBolge, (k) => setPref("sesBolge", k), "Ses bölgesi")),
    h("p", "Ses aralığınız: alıştırmalar bu şeride göre perdelenir. 5. bölümdeki ölçerle ölçebilir ya da klavyeye dokunarak en pes ve en tiz rahat notanızı işaretleyebilirsiniz."),
    serit.el,
    h("div.row", { style: { marginTop: "10px" } }, L.btn("Aralığı ölçmeye git", () => { sp.toggle(false); Deck.goId("ses-araligi"); }, "sm"), L.btn("Sıfırla", () => Aralik.sifirla(), "sm ghost")));
  sp.onToggle = (open) => open && serit.ciz();
})();
