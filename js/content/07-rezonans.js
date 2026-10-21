/* 7. Rezonans ve tını */
L.slide(`
<section class="slide" data-chapter="7" data-demo="unluDuzeltme" id="unlu-duzeltme">
  <div class="text">
    <h2>Ünlü düzeltme</h2>
    <p class="lead">Tiz notalarda "i" ya da "u" söylemek neden zorlaşır, sopranolar tizde sözleri neden "a"ya benzetir? Cevap, perde ile ünlünün birinci formantı arasındaki yarışta.</p>
    <p>Her ünlünün bir birinci formantı (F1) vardır: ağız ve yutağın en pes rezonansı (bkz. <a href="#formantlar">formantlar</a>). Konuşma perdesinde temel frekans (f0) F1'in çok altındadır ve harmoniklerden biri F1'e yakın düşüp güçlenir. Perde yükseldikçe f0 F1'e yaklaşır, sonra onu geçer: artık hiçbir harmonik F1'in tepesinde değildir ve ses zayıflar, düzensizleşir.</p>
    <p>Sopranolar bu noktada ünlüyü "açar": ağzı daha çok açıp çeneyi indirerek F1'i yükseltir ve perdenin hemen üstünde tutarlar (Joliveau, Smith ve Wolfe 2004). Buna <strong>ünlü düzeltme</strong> ya da formant ayarı denir. Bedeli var: ünlüler birbirine benzer, sözler tizde daha az anlaşılır.</p>
    <p>Erkek sesleri ve altolar çoğu zaman başka bir ayar kullanır: F1'i ikinci harmoniğe (2×f0) yaklaştırmak (Henrich, Smith ve Wolfe 2011). Deneyde "Erkek sesi" seçilince bu ayar uygulanır.</p>
    <details class="more"><summary>Daha fazla: grafiği okumak</summary>
      <p>Dikey çizgiler harmoniklerdir (f0, 2×f0, 3×f0…); eğri ağzın filtresidir, tepeleri formantlardır. Bir harmonik bir tepeye düşerse güçlenir. "Çıkan ses" düzeyi harmoniklerin filtreden geçmiş toplamıdır.</p>
      <p>Bu düzey bir modelden hesaplanır ve yaklaşıktır: gerçek seste nefes basıncı, gırtlak ve ses yolunun etkileşimi de rol oynar. Sentez normalde gürlüğü kendiliğinden eşitler; deneyde hesaplanan fark sese ayrıca uygulanır.</p>
    </details>
    <p class="health">Ünlüyü açmak için çeneyi zorla indirmeyin, dili bastırmayın; ağız rahatça açılsın. Tizde boğazınız sıkışıyorsa daha pes bir notada deneyin.</p>
    <p class="try">Perde kaydırıcısını yavaşça yukarı çekin: f0 F1'i geçince çıkan sesin düştüğüne bakın. Sonra "Ünlüyü aç"a basın: F1 perdeyi izler, ses gürleşir. Kendiniz de "i" ile tize çıkarken ağzınızı biraz açıp "e"ye doğru kaydırmayı deneyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Joliveau, E., Smith, J., Wolfe, J. (2004). Tuning of vocal tract resonance by sopranos. Nature 427, 116; ve Vocal tract resonances in singing: the soprano voice. JASA 116(4), 2434–2439: f0 konuşmadaki R1'i aşınca R1 ≈ f0 ayarı.</li>
    <li>Henrich, N., Smith, J., Wolfe, J. (2011). Vocal tract resonances in singing: strategies used by sopranos, altos, tenors, and baritones. JASA 129(2), 1024–1035: sopranolar R1:f0 (+ R2:2f0), altolar R1:f0 ya da R1:2f0, tenor ve baritonlar R1:2f0 ve R1:3f0.</li>
    <li>Carlsson, G., Sundberg, J. (1992). Formant frequency tuning in singing. J Voice 6(3), 256–260.</li>
    <li>Formant değerleri: Malkoç (2009), Türkçe ünlüler. Çıkan ses düzeyi: Rosenberg kaynağının harmonikleri × formant filtresi, toplam güç (dB).</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="7" data-demo="parlakKoyu" id="parlak-koyu">
  <div class="text">
    <h2>Açık–kapalı, parlak–koyu</h2>
    <p class="lead">Aynı nota ve aynı ünlü parlak da duyulabilir, koyu ve yuvarlak da. Tınıyı ses yolunun biçimi belirler: gırtlağın yüksekliği, ağzın açıklığı, dudakların yuvarlaklığı.</p>
    <ul>
      <li><strong>Gırtlak alçalınca</strong> ses yolu uzar, bütün formantlar biraz pesleşir: ses koyu ve "kapalı" duyulur.</li>
      <li><strong>Gırtlak yükselince</strong> ya da dudaklar yayılınca formantlar tizleşir: ses parlak ve "açık" duyulur.</li>
      <li><strong>Ağzı açmak</strong> en çok birinci formantı (F1) yükseltir.</li>
    </ul>
    <p>Klasik şarkıcılar ayrıca 3 kHz dolayında bir enerji kümesi oluşturur: <a href="#sarkici-formanti">şarkıcı formantı</a>. Sese çınlama katar ve sesin orkestranın üstünden duyulmasına yardım eder (Sundberg 2001).</p>
    <h3>Parlaklığı ölçmek</h3>
    <p>Parlaklığın kaba bir ölçüsü spektrumun <strong>ağırlık merkezidir</strong>: sesteki enerjinin ortalama frekansı. Ne kadar yüksekse ses o kadar parlak duyulur. Mikrofon, oda ve ünlü bu değeri çok etkiler; ibreyi yalnızca aynı koşullarda kendinizle karşılaştırmak için kullanın.</p>
    <details class="more"><summary>Daha fazla: "açık" ve "kapalı" ses</summary>
      <p>Şan pedagojisinde "kapalı ses" (İtalyanca copertura, "örtme") tizde ünlüyü biraz koyulaştırıp yuvarlaklaştırmaktır; "açık ses" ise ünlünün konuşmadaki gibi yayvan kalmasıdır. Terimler eğitmenden eğitmene ve tarzdan tarza farklı kullanılır.</p>
      <p>Deneydeki sentez basitleştirilmiştir: "gırtlak konumu" bütün formantları en çok %8 kaydırır, "ağız açıklığı" F1'i en çok %20 değiştirir, "şarkıcı formantı" F3–F5'i 3 kHz dolayında toplar.</p>
    </details>
    <p class="health">Koyu bir ses için gırtlağı zorla bastırmayın, dil kökünü geriye itmeyin. Boğazda baskı hissederseniz bırakın: güzel tını rahat bir ses yolundan gelir.</p>
    <p class="try">Kaydırıcılarla oynayıp "Dinle"ye basın; sonagrafta formant izlerinin kaydığını, haritada noktanın gezdiğini izleyin. Mikrofonu açıp aynı ünlüyü önce koyu, sonra parlak söyleyin; ibre koyu ile parlak arasında gezinir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Sundberg, J. (2001). Level and center frequency of the singer's formant. J Voice 15(2), 176–186: klasik şarkıcılarda 3 kHz dolayında belirgin tepe (F3–F5 kümesi).</li>
    <li>Sundberg, J. (1974). Articulatory interpretation of the "singing formant". JASA 55(4), 838–844 (gırtlak tüpü ve gırtlağın alçalması).</li>
    <li>Parlaklık: spektral ağırlık merkezi (Analiz.agirlikMerkezi, 0–5 kHz), mikrofon çözümleyicisinden, yalnızca sesli karelerde; ölçek yaklaşık (logaritmik 400–2500 Hz).</li>
    <li>Formant haritası: Malkoç (2009) Türkçe ünlü ortalamaları.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="7" data-demo="nazalite" id="nazalite">
  <div class="text">
    <h2>Burun sesi (nazalite)</h2>
    <p class="lead">Yumuşak damak (damağın arka, yumuşak kısmı; küçük dil ucundadır) bir kapı gibidir: kalkınca burun yolunu kapatır, inince ses burundan da çıkar.</p>
    <p>"m", "n" ve "ng" (örneğin "renk" sözcüğündeki n) bu kapı açıkken söylenir: ağız kapalı ya da dille tıkalıdır, hava burundan çıkar. Ünlülerde kapı genellikle kapalıdır; açık kalırsa ses "genizden" gelir. Buna <strong>nazalite</strong> (genizsilik) denir.</p>
    <p>Akustikte burun yolu iki şey yapar: pes bölgede (yaklaşık 250 Hz) bir burun rezonansı ekler ve biraz daha tizde bir "çukur" (antiformant) açar; o bölgedeki enerji emilir. Ses donuklaşır, birinci formant zayıflar. Bu değerler ders kitabı düzeyinde ve yaklaşıktır; kişiden kişiye değişir.</p>
    <h3>Burnunu tıka testi</h3>
    <p>Bir "aaa" söylerken burnunuzu iki parmakla hafifçe sıkın. Ses hiç değişmiyorsa yumuşak damak kapalıdır. Belirgin değişiyorsa ses burundan da çıkıyordur. Aynısını "mmm" ile deneyin: ses durur, çünkü hava çıkacak yol bulamaz.</p>
    <h3>Ne zaman istenir?</h3>
    <p>"m", "n" ve "ng"de doğal olarak; ağzı kapalı mırıltıda (ısınmanın sevilen hareketi). Bazı tarzlarda hafif bir genizsilik tınının parçası sayılır. Klasik şanda ünlülerde genizsilik genellikle istenmez; yine de ölçümler, pek çok opera şarkıcısında bazı perdelerde yumuşak damağın hafif açık olduğunu ve dinleyicilerin bunu genizsi duymadığını gösteriyor (Birch ve ark. 2002).</p>
    <details class="more"><summary>Daha fazla: çukur neden olur?</summary>
      <p>Burun yolu ana ses yoluna yandan bağlanan ikinci bir tüp gibidir. Bazı frekanslarda bu yan tüp enerjiyi "yutar" ve spektrumda bir çukur açılır. Gerçek burunda sinüsler bu etkiyi büyük ölçüde sönümler (Sundberg ve ark. 2007); deneydeki sentez basit bir rezonans ve çukur çiftidir.</p>
    </details>
    <p class="health">Genizden gelen ses bir hastalık işareti değildir. Ama her zaman var olan, birden başlayan ya da yutkunurken burundan sıvı kaçmasıyla birlikte giden bir genizsilik varsa bir KBB uzmanına danışın.</p>
    <p class="try">"Yumuşak damak" kaydırıcısını oynatıp "Dinle"ye basın; damak indikçe spektrumdaki çukurun derinleştiğine bakın. "m" seçip mırıltıyı dinleyin. Sonra burnunu tıka testini kendiniz yapın; "Burnu tıka" düğmesi testin ne göstereceğini çizimde anlatır.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Birch, P. ve ark. (2002). Velum behavior in professional classic operatic singing. J Voice 16(1), 61–71: 17 opera şarkıcısı; birçoğunda bazı perdelerde velofaringeal açıklık; uzman paneli algılanan nazalite ile ilişki bulmamış.</li>
    <li>Sundberg, J. ve ark. (2007). Experimental findings on the nasal tract resonator in singing. J Voice 21(2), 127–137: idealize modelde antiformant; sinüsler etkiyi sönümler; /a/'da F1 zayıflar.</li>
    <li>Nazal formant ~250 Hz ve antiformant ~500–1000 Hz: ders kitabı bilgisi (ör. Kent ve Read), birincil kaynaktan doğrulanmadı. Sentez: kutup 270 Hz, çukur 270 → 600 Hz.</li>
    <li>Topluluğa: herkes aynı anda "aaa" söyleyip burnunu tıkasın, sonra "mmm" ile; fark anında duyulur.</li>
  </ul></aside>
</section>
`);
