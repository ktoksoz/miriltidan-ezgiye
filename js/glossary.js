/* Sözlük: metindeki ses ve şan terimlerinin üzerine gelince açılan tanım balonları.
   Her terim slayt başına yalnızca ilk geçtiği yerde işaretlenir. */
(function () {
  const trw = (q) => "https://tr.wikipedia.org/w/index.php?search=" + encodeURIComponent(q);
  const enw = (t) => "https://en.wikipedia.org/wiki/" + t;

  // k: aranacak kökler (küçük harf, Türkçe ekler otomatik kapsanır), t: başlık, d: tanım, u: bağlantı
  const TERMS = [
    { k: ["gırtlak", "larinks"], except: ["susleme", "turku", "makam-perdeleri", "usul"], t: "Gırtlak (larinks)", d: "Soluk borusunun üst ucunda, ses tellerini taşıyan kıkırdak yapı. Boğazda \"âdemelması\" olarak hissedilen çıkıntı onun önüdür. (Türk müziğindeki \"gırtlak\" süslemesiyle karıştırmayın.)", u: trw("Gırtlak") },
    { k: ["ses telleri", "ses tellerinin", "ses tellerini", "ses telleriyle"], t: "Ses telleri", d: "Gırtlağın içinde, önden arkaya uzanan iki kas ve zar katmanı. Nefes alırken açılır; konuşurken ve söylerken birbirine yaklaşır ve geçen hava onları titreştirir. Bilimsel adı ses kıvrımları (vocal folds).", u: trw("Ses telleri") },
    { k: ["gırtlak"], only: ["susleme", "turku", "makam-perdeleri", "usul"], t: "Gırtlak (süsleme)", d: "Türk müziğinde, özellikle uzun havalarda, sesin gırtlaktan kısa ve hızlı kırılmalarla dalgalandırılmasıyla yapılan süsleme. Anatomideki gırtlakla (larinks) karıştırmayın.", u: trw("Gırtlak (müzik)") },
    { k: ["glotis"], t: "Glotis", d: "İki ses telinin arasındaki boşluk. Ses üretilirken saniyede yüzlerce kez açılıp kapanır.", u: enw("Glottis") },
    { k: ["formant"], t: "Formant", d: "Ağız, yutak ve burun boşluklarının rezonans frekansları. Ses tellerinin ürettiği harmoniklerden formantlara yakın olanlar güçlenir; ünlüyü (a, i, u…) ayırt ettiren budur.", u: enw("Formant") },
    { k: ["şarkıcı formantı"], t: "Şarkıcı formantı", d: "Klasik şarkıcıların sesinde yaklaşık 2,5–3,5 kHz dolayında beliren güçlü enerji tepesi. Üst formantların birbirine yaklaşmasıyla oluşur; sesin mikrofonsuz olarak orkestranın üstünden duyulmasını kolaylaştırır (Sundberg 1974).", u: enw("Formant#Singer's_formant") },
    { k: ["rezonans"], t: "Rezonans", d: "Bir boşluğun ya da cismin belirli frekanslarda titreşimi güçlendirmesi. Seste rezonatörler yutak, ağız ve burun boşluklarıdır.", u: trw("Rezonans") },
    { k: ["passaggio"], t: "Passaggio (geçiş bölgesi)", d: "İtalyanca \"geçit\". Sesin bir bölgeden ötekine (ör. göğüs sesinden kafa sesine) geçtiği perde bölgesi; eğitimsiz seste çoğu zaman bir kırılma olarak duyulur.", u: enw("Passaggio") },
    { k: ["göğüs sesi"], t: "Göğüs sesi", d: "Konuşma sesine yakın, dolgun ve güçlü ses bölgesi. Ses telleri kalın ve tam temasla titreşir (bilimsel adı M1, \"modal\" ses).", u: enw("Chest_voice") },
    { k: ["kafa sesi"], t: "Kafa sesi", d: "Daha tiz, daha hafif ve parlak ses bölgesi. Ses telleri incelir ve daha çok kenarlarıyla titreşir (bilimsel adı M2).", u: enw("Head_voice") },
    { k: ["karışık ses", "mix"], exact: true, t: "Karışık ses (mix)", d: "Göğüs ve kafa sesinin özelliklerini birleştiren, geçiş bölgesini kırılmadan aşmaya yarayan söyleyiş. Tanımı öğretmenden öğretmene değişir; bilimsel karşılığı tartışmalıdır.", u: enw("Vocal_register#Mixed_voice") },
    { k: ["falseto", "falsetto"], t: "Falsetto", d: "Ses tellerinin yalnızca ince kenarlarıyla ve tam kapanmadan titreştiği, hafif ve nefesli tiz ses. Erkek seslerinde belirgin bir bölgedir.", u: trw("Falseto") },
    { k: ["belting"], t: "Belting", d: "Pop ve müzikallerde göğüs sesine yakın tınıyı yüksek perdelere taşıyan güçlü, parlak söyleyiş. Ses telleri uzun süre kapalı kalır; birinci formant ikinci harmoniğe ayarlanır.", u: enw("Belting_(music)") },
    { k: ["appoggio"], t: "Appoggio", d: "İtalyanca \"dayanak\". İtalyan okulunda nefes verirken göğüs kafesini açık tutup soluğu yavaş ve dengeli harcama tekniği (Miller 1986).", u: enw("Appoggio") },
    { k: ["vibrato"], t: "Vibrato", d: "Perdenin düzenli, dalga gibi titremesi. Klasik şarkıcılarda saniyede yaklaşık 5–7 kez, ortalama perdenin iki yanında yaklaşık yarım ses genişliğinde.", u: trw("Vibrato") },
    { k: ["entonasyon"], t: "Entonasyon", d: "Notaları doğru perdede söyleme ya da çalma. \"Entonasyonu iyi\" demek perdesi temiz demektir.", u: enw("Intonation_(music)") },
    { k: ["detone"], t: "Detone", d: "Notanın doğru perdeden pes ya da tiz söylenmesi. Herkesin perdesi zaman zaman kayar; önemli olan duyup düzeltebilmektir.", u: enw("Intonation_(music)") },
    { k: ["legato"], t: "Legato", d: "İtalyanca \"bağlı\". Notaları aralarında boşluk bırakmadan, birbirine bağlayarak söyleme.", u: trw("Legato") },
    { k: ["staccato"], t: "Staccato", d: "İtalyanca \"ayrılmış\". Notaları kısa ve birbirinden ayrık söyleme.", u: trw("Staccato") },
    { k: ["sovt"], exact: true, t: "SOVT (yarı kapalı ses yolu)", d: "Dudak titretme, mırıldanma ya da pipetle söyleme gibi ağzın kısmen kapalı olduğu alıştırmalar. Ağız içindeki geri basınç ses tellerinin titreşimini kolaylaştırır (Titze 2006).", u: enw("Semi-occluded_vocal_tract_exercises") },
    { k: ["ambitus", "ses aralığı"], t: "Ses aralığı (ambitus)", d: "Bir sesin üretebildiği en pes ve en tiz nota arasındaki aralık. Bu sitede \"rahat\" aralık, zorlamadan söylenebilen bölge olarak ölçülür.", u: enw("Vocal_range") },
    { k: ["tessitura", "tesitura"], t: "Tessitura", d: "İtalyanca \"doku\". Sesin en rahat ve en güzel çalıştığı perde bölgesi; ya da bir eserin notalarının çoğunun bulunduğu bölge.", u: enw("Tessitura") },
    { k: ["fach"], exact: true, t: "Fach", d: "Almanca \"bölme, uzmanlık\". Opera dünyasında şarkıcıları ses türü, ağırlığı ve rengine göre sınıflandıran sistem (lirik soprano, dramatik tenor…).", u: enw("Fach") },
    { k: ["harmonik"], t: "Harmonik", d: "Temel frekansın tam sayı katlarındaki titreşimler (2f, 3f, 4f…). Ses tellerinin ürettiği vızıltı yüzlerce harmonik içerir.", u: trw("Harmonik") },
    { k: ["frekans"], t: "Frekans", d: "Saniyedeki titreşim sayısı; birimi hertz (Hz). Kulak frekansı sesin inceliği (perdesi) olarak duyar.", u: trw("Frekans") },
    { k: ["sent"], exact: false, not: "(ez|r)", t: "Sent (cent)", d: "Yarım sesin yüzde biri. 100 sent bir yarım ses, 1200 sent bir oktav eder. Deneylerde sapmayı sentle gösteriyoruz.", u: trw("Sent (müzik)") },
    { k: ["oktav"], t: "Oktav", d: "Frekansın iki katına çıktığı aralık. Aralarında oktav olan iki ses aynı nota adını taşır.", u: trw("Oktav") },
    { k: ["spektrogram"], t: "Spektrogram", d: "Sesin hangi frekanslarda ne kadar enerji taşıdığını zaman içinde gösteren çizim. Eski adıyla sonagram; 1940'larda Bell Laboratuvarı'nda geliştirildi.", u: trw("Spektrogram") },
    { k: ["diyafram"], t: "Diyafram", d: "Göğüs boşluğunu karın boşluğundan ayıran kubbe biçimli kas. Nefes alırken kasılıp aşağı iner; nefes verirken gevşer.", u: trw("Diyafram (anatomi)") },
    { k: ["amüzi"], t: "Amüzi", d: "Perde farklarını algılayamama. Doğuştan amüzi nadirdir (nüfusun yaklaşık %1,5'i; Peretz ve Vuvan 2017). \"Detone\" söyleyenlerin çoğunda kulak değil, sesi perdeye yönlendirme becerisi gelişmemiştir.", u: enw("Amusia") },
    { k: ["makam"], t: "Makam", d: "Türk müziğinde bir ezginin hangi perdeleri kullandığını, nerede durduğunu ve nasıl gezindiğini (seyir) belirleyen kurallar bütünü.", u: trw("Makam") },
    { k: ["koma"], t: "Koma", d: "Türk müziği kuramında (Arel–Ezgi–Uzdilek) bir tam sesin dokuzda biri; oktav 53 komaya bölünür. 1 koma yaklaşık 22,6 sent.", u: trw("Koma (müzik)") },
    { k: ["usul"], t: "Usul", d: "Türk müziğinde ritim kalıbı: güçlü (düm) ve zayıf (tek) vuruşların belirli bir sırayla yinelenmesi.", u: trw("Usul (müzik)") },
    { k: ["uzun hava"], t: "Uzun hava", d: "Türk halk müziğinde belirli bir ölçüye bağlı olmadan, serbest ritimle söylenen türküler (bozlak, hoyrat, divan…).", u: trw("Uzun hava") },
    { k: ["bel canto"], t: "Bel canto", d: "İtalyanca \"güzel şarkı\". 18. ve 19. yüzyıl İtalyan operasında gelişen, legato, eşit tını ve çeviklik üzerine kurulu söyleme geleneği.", u: trw("Bel canto") },
    { k: ["yin"], exact: true, t: "YIN", d: "Alain de Cheveigné ve Hideki Kawahara'nın 2002'de yayımladığı perde algılama yöntemi: sinyali kendi gecikmiş kopyasıyla karşılaştırıp periyodu bulur.", u: enw("Pitch_detection_algorithm") },
    { k: ["kbb"], exact: true, t: "KBB", d: "Kulak burun boğaz hastalıkları uzmanı. Ses telleri muayenesi (laringoskopi) yapabilen hekim.", u: trw("Kulak burun boğaz") },
  ];

  // her kök için: kelime başında başlayan, ardından Türkçe ekler gelebilen düzenli ifade
  const L_ = "a-zçğıöşüâîûA-ZÇĞİÖŞÜÂÎÛ";
  // karşılaştırma için: Türkçe küçük harf + ı/i ayrımını kaldır (MYCIN → mycin, ama uzunluk değişmez)
  const lower = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  TERMS.forEach((term) => {
    // exact: ek almaz (ör. "yin" kelimesi "yine"nin içinde eşleşmesin)
    term.re = term.k.map((k) => new RegExp(`(^|[^${L_}])(${lower(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${term.exact ? `(?![${L_}])` : (term.not ? `(?!${term.not})` : "") + `[${L_}'’]*`})`));
  });
  const SKIP = "h1, h2, h3, .chapter-tag, .num, summary, a, .term, .try, button, .license, .cover-meta, .mono, .nota, kbd, .lead-c";

  function markSlide(root) {
    const sid = root.closest(".slide").id;
    // yalnızca belirli slaytlarda anlamlı olan terimleri (ör. "sıcaklık") diğerlerinde atla
    const done = new Set(TERMS.map((t, i) => ((t.only && !t.only.includes(sid)) || (t.except && t.except.includes(sid)) ? i : -1)).filter((i) => i >= 0));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let text = node.nodeValue;
      let parts = null;
      // düğümde geçen ilk uygun terimi bul, böl, tekrarla
      for (;;) {
        let best = null;
        const low = lower(text);
        TERMS.forEach((term, ti) => {
          if (done.has(ti)) return;
          term.re.forEach((re) => {
            const m = re.exec(low);
            if (m && (!best || m.index + m[1].length < best.i)) best = { i: m.index + m[1].length, len: m[2].length, ti };
          });
        });
        if (!best) break;
        done.add(best.ti);
        parts = parts || [];
        parts.push(text.slice(0, best.i));
        const span = document.createElement("span");
        span.className = "term"; span.tabIndex = 0; span.dataset.ti = best.ti;
        span.textContent = text.slice(best.i, best.i + best.len);
        parts.push(span);
        text = text.slice(best.i + best.len);
      }
      if (parts) { parts.push(text); node.replaceWith(...parts); }
    });
  }
  document.querySelectorAll(".slide .text, .slide .cover-text").forEach(markSlide);

  /* --- balon --- */
  const pop = document.createElement("div");
  pop.id = "gloss"; pop.setAttribute("role", "tooltip");
  document.body.append(pop);
  let cur = null, hideT = 0;
  function show(el) {
    clearTimeout(hideT);
    if (cur === el && pop.classList.contains("open")) return;
    cur = el;
    const t = TERMS[+el.dataset.ti];
    pop.innerHTML = "";
    const h4 = document.createElement("h4"); h4.textContent = t.t;
    const p = document.createElement("p"); p.textContent = t.d;
    const a = document.createElement("a");
    a.href = t.u; a.target = "_blank"; a.rel = "noopener";
    a.textContent = t.u.includes("tr.wikipedia") ? "Vikipedi'de oku ↗" : "Wikipedia'da oku (İngilizce) ↗";
    pop.append(h4, p, a);
    pop.classList.add("open");
    const r = el.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 12);
    let y = r.top - ph - 10;
    pop.classList.toggle("below", y < 8);
    if (y < 8) y = r.bottom + 10;
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  function hide(delay = 180) {
    clearTimeout(hideT);
    hideT = setTimeout(() => { pop.classList.remove("open"); cur = null; }, delay);
  }
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest && e.target.closest(".term");
    if (el) show(el);
    else if (e.target.closest && e.target.closest("#gloss")) clearTimeout(hideT);
    else if (cur) hide();
  });
  document.addEventListener("focusin", (e) => { if (e.target.classList && e.target.classList.contains("term")) show(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target.classList && e.target.classList.contains("term")) hide(250); });
  // dokunmatik: dokununca aç/kapa
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".term");
    if (el) { e.preventDefault(); cur === el && pop.classList.contains("open") ? hide(0) : show(el); }
    else if (!e.target.closest("#gloss")) hide(0);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(0); });
  document.getElementById("deck").addEventListener("scroll", () => hide(0), true);
})();
