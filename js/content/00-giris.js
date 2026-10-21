/* 0. Giriş: kapak */
L.slide(`
<section class="slide cover" data-chapter="0" data-demo="kapak" data-title="Kapak" id="kapak">
  <div class="stage"></div>
  <div class="cover-text">
    <h1><span>Mırıltıdan</span><span>ezgiye</span></h1>
    <p class="lead-c">"Sesim kötü", "detone oluyorum" diyorsanız ya da koroda, banyoda, karaokede söyleyip daha iyisini istiyorsanız: sesinizin nasıl çıktığını, nefesi, ısınmayı, doğru perdede söylemeyi ve sesinizin sınırlarını adım adım, dinleyerek ve söyleyerek öğrenin.</p>
    <p class="byline">Koray Toksöz</p>
    <div class="cover-actions">
      <button class="btn primary big" type="button" id="kapak-anlatim" onclick="Narrator.start()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Sesli anlatımla başla
      </button>
      <button class="btn big" type="button" onclick="Snd.unlock(); Deck.next()">Kendi hızımda gez</button>
    </div>
    <p class="hint">Mikrofonu açıp bir "aaa" deyin: sesiniz bu sayfaya kalemle çizilir. Mikrofon yalnızca düğmeye bastığınızda açılır, ses bu cihazdan çıkmaz. Kulaklık önerilir.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <a class="all-link" href="https://egitim.koraytoksoz.com/">← Bütün eğitimler</a>
      <a class="gh-link" href="https://github.com/ktoksoz/miriltidan-ezgiye" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg><span>Kaynak kodu GitHub'da</span></a>
      <a class="lic" href="https://creativecommons.org/licenses/by/4.0/deed.tr" target="_blank" rel="license noopener" title="İçerik: Creative Commons Atıf 4.0">
        <img src="img/cc-cc.svg" alt="Creative Commons" width="18" height="18"><img src="img/cc-by.svg" alt="Atıf" width="18" height="18">
        <span>İçerik CC BY 4.0 · Kod MIT</span>
      </a>
    </div>
    <div class="kapak-mic"></div>
  </div>
  <aside class="notes"><ul>
    <li>Kapakta mikrofon kapalıyken sentez bir ses kısa bir ezgi söylüyor ve perde eğrisini çiziyor. Mikrofonu açınca çizgi sizin sesiniz olur; başlığın harf genişliği sesinizin gürlüğüyle değişir.</li>
    <li>Yol haritası: sesin üretimi → nefes → ısınma ve sağlık → doğru perde → ses aralığı → bölgeler ve passaggio → rezonans → vibrato → diksiyon → tarzlar → günlük pratik.</li>
    <li>Kısayollar: ← → gezinme, Boşluk slayttaki alıştırma, N notlar, T metni gizle, O tüm slaytlar, F tam ekran, A anlatım.</li>
    <li>Topluluğa: herkes kendi telefonunda açacaksa kulaklık isteyin; aynı odada birçok hoparlör ve mikrofon birbirini duyar.</li>
    <li>Bu site bir şan eğitmeninin yerini tutmaz; sesinizi tanımak ve her gün çalışmak için bir araçtır.</li>
  </ul></aside>
</section>
`);
