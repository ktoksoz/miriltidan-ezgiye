/* 10. Tarzlar: bel canto, pop ve müzikal, Türk sanat müziği perdeleri, usul, türkü ve uzun hava */
L.slide(`
<section class="slide" data-chapter="10" data-demo="belCanto" id="bel-canto">
  <div class="text">
    <h2>Klasik şan (bel canto)</h2>
    <p class="lead">Bel canto İtalyancada "güzel şarkı söyleme" demek. 18. ve 19. yüzyıl İtalyan operasında gelişen bu okul, bugün klasik şan eğitiminin temelidir: mikrofonsuz, orkestranın üstünden, büyük bir salonu dolduran ama zorlanmayan bir ses.</p>
    <h3>Dört ilke</h3>
    <ul>
      <li><b>Legato</b> (İtalyanca "bağlı"): notalar arasında boşluk yok; ses bir notadan ötekine kopmadan akar. Sessiz harfler kısa tutulur, ünlüler uzun.</li>
      <li><b>Eşit ses</b>: pesten tize tek bir ses gibi duyulmak; göğüs ve kafa sesi arasındaki geçiş (<a href="#passaggio">passaggio</a>) fark edilmez.</li>
      <li><b>Şarkıcı formantı</b>: klasik seslerde 3 kHz dolayında beliren enerji tepesi. Orkestranın en zayıf olduğu bölgede olduğu için ses orkestranın üstünden duyulur (<a href="#sarkici-formanti">şarkıcı formantı</a>).</li>
      <li><b>Vibrato</b>: saniyede yaklaşık 5–7 kez, düzenli ve sürekli bir dalgalanma (<a href="#vibrato">vibrato ölçer</a>).</li>
    </ul>
    <h3>Opera ve lied</h3>
    <p>Opera sahnede, orkestrayla ve büyük salonda söylenir; ses taşıma gücü ön plandadır. <i>Lied</i> (Almanca "şarkı") ise piyanoyla, daha küçük salonlarda söylenen sanat şarkısıdır: sözün anlamı, renk ve nüans öne çıkar, ses daha az "büyütülür". İkisi de aynı tekniğe dayanır.</p>
    <details class="more"><summary>Daha fazla: kamu malı çalışma kitapları</summary>
      <p>Klasik şan öğrencilerinin yaklaşık iki yüzyıldır kullandığı iki kitap kamu malıdır ve IMSLP gibi arşivlerde ücretsiz bulunur: Nicola Vaccai'nin <i>Metodo pratico di canto italiano per camera</i> (1832; ilk ders "Manca sollecita più dell'usato") ve Giuseppe Concone'nin <i>50 Lezioni</i> (Op. 9; Concone 1801–1861). Bu sitedeki vokaliz ikisinden de alınmadı; bu slayt için yazıldı.</p>
      <p>Modern baskıların dizgisi, eşlikleri ve kayıtları ayrıca korunuyor olabilir; notayı kullanırken baskının lisansına bakın.</p>
    </details>
    <p class="health">Büyük ses zorlamakla gelmez. Boğazınız sıkışıyor ya da sesiniz kısılıyorsa durun; bel canto eğitimi yıllar süren, öğretmenle yapılan bir çalışmadır.</p>
    <p class="try">"Bel canto" ve "Düz ses" düğmeleriyle aynı vokalizi iki biçimde dinleyin: biri şarkıcı formantı ve vibratoyla, öteki ikisi de olmadan. Sonra "Başla"ya basıp (Boşluk) vokalizi "a" ile siz söyleyin; ölçüm, notaların ne kadar bağlı aktığını da gösterir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Vokaliz bu site için yazıldı; Vaccai (1832) ve Concone (Op. 9) kamu malı çalışma kitabı olarak önerildi, ezgileri aktarılmadı (docs/arastirma.md bölüm 13).</li>
    <li>Şarkıcı formantı: Sundberg 2001, J Voice 15(2), 176–186: "3 kHz civarında belirgin zarf tepesi", F3–F5 kümelenmesi. Sentezde sf = 1 bu kümelenmeyi taklit eder.</li>
    <li>Vibrato hızı 5–7 Hz: Lester-Smith ve ark. 2024 (Prame 1994'e atıfla). Sentezde 5,6 Hz, ±50 sent.</li>
    <li>"Bağlılık" ölçümü: notalar arasındaki sessiz (perdesiz) karelerin toplam süresi. Yaklaşıktır; mikrofon ve odaya bağlıdır.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="10" data-demo="popTeknik" id="pop">
  <div class="text">
    <h2>Pop ve müzikal</h2>
    <p class="lead">Pop şarkıcısı salonu kendi sesiyle doldurmak zorunda değildir: mikrofon ve hoparlör bunu yapar. Bu yüzden pop sesi daha konuşmaya yakın, daha yakın ve daha çeşitli renklidir. Mikrofonu kullanmak da tekniğin bir parçasıdır.</p>
    <h3>Mikrofon tekniği</h3>
    <p>Çoğu sahne mikrofonu yönlüdür. Yönlü mikrofonlarda kaynak yaklaştıkça pes frekanslar güçlenir; buna <b>yakınlık etkisi</b> denir. Shure SM57'nin kılavuzu yaklaşık 6 mm'de 100 Hz'in altında 6–10 dB artış verir. Şarkıcılar bunu bilerek kullanır: yumuşak, içten bir yerde mikrofona yaklaşır, gür ve tiz bir yerde biraz uzaklaşır. Böylece hem tını hem gürlük dengelenir.</p>
    <h3>Pop'un renkleri</h3>
    <ul>
      <li><b>Nefesli ses</b>: ses telleri tam kapanmaz, sese hava karışır; mikrofonla yakın ve samimi duyulur.</li>
      <li><b>Mix</b> (karışık ses): göğüs sesinin rengini kafa sesinin kolaylığıyla birleştirmek (<a href="#ses-bolgeleri">ses bölgeleri</a>).</li>
      <li><b>Geç vibrato</b>: nota önce düz tutulur, vibrato sona doğru açılır (<a href="#duz-ses">düz ses ve vibrato</a>).</li>
      <li><b>Belting</b>: göğüs sesine yakın, parlak ve güçlü tiz sesler; müzikallerin imzası (<a href="#belting">belting</a>).</li>
    </ul>
    <details class="more"><summary>Daha fazla: müzikal tiyatro sesi</summary>
      <p>Müzikal şarkıcılarında klasik şarkıcıların şarkıcı formantı görülmez (Sundberg ve Romedahl 2009). Aynı çalışmada sözün anlaşılırlığı müzikal şarkıcılarında biraz daha yüksek çıkmış: müzikalde hikâye sözle anlatılır.</p>
      <p>Pop ve erken müzikte düz ses ya da geç başlayan vibrato yaygındır; bunu ölçen güvenilir bir sayı bulamadık, o yüzden burada bir tarz farkı olarak anlatıyoruz.</p>
    </details>
    <p class="health">Belting doğası gereği zararlı değildir, ama yüksek basınç ve sıkı kapanma sese yük bindirir; süreyi kısa tutun, zorlanınca durun.</p>
    <p class="try">"Mesafe" kaydırıcısını oynatın: mikrofon yaklaştıkça eğride pes frekansların ve gürlüğün arttığını görün, "Dinle" ile duyun. Tarz düğmeleriyle aynı cümleyi nefesli, mix, geç vibratolu ya da belting olarak dinleyin. Mikrofonu açarsanız kendi sesinizin gürlüğü de görünür.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Yakınlık etkisi: Shure SM57 kullanım kılavuzu (yaklaşık 6 mm'de 100 Hz altında 6–10 dB artış); Shure, "Microphone Techniques for Live Sound Reinforcement"; Eargle, <i>The Microphone Book</i> (2004), s. 50–65. Omni mikrofonlarda etki yoktur.</li>
    <li>Grafik bir modeldir: kardioid basınç gradyanı mikrofonun kuramsal yakın alan artışı, 6 mm'de 100 Hz için +8 dB olacak biçimde ölçeklendi. Gürlük 10 cm'ye göre ters uzaklık yasasıyla hesaplanır; duyulan ses yüksek seviyeleri korumak için sınırlanır.</li>
    <li>Sundberg ve Romedahl 2009, J Voice 23(5), 539–545. Belting: Sundberg, Gramming ve LoVetri 1993; Bourne ve Garnier 2012.</li>
    <li>Sentezdeki tarzlar yaklaşık birer karikatürdür: nefesli (açık faz oranı yüksek, nefes gürültüsü), mix (orta kapalı faz), belting (düşük açık faz, yüksek gürlük, açık ağız ve parlak tını).</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="10" data-demo="makamPerdeleri" id="makam-perdeleri" data-tool>
  <div class="text">
    <h2>Türk sanat müziği: koma perdeleri</h2>
    <p class="lead">Türk müziğinde perdeler piyanonun on iki yarım sesine sığmaz. Arel–Ezgi–Uzdilek kuramında oktav 53 komaya bölünür; bir koma yaklaşık 22,6 sent. Segâh perdesi, örneğin, piyanodaki Si ile Si♭'nin arasına düşer.</p>
    <p>Sesin perdeleri telli bir saz gibi sabit değildir: kulağınız hangi perdeyi duyarsa sesiniz oraya gider. Bu yüzden ses, koma perdelerini söylemek için çok uygun bir çalgıdır. Zorluk, kulağı piyano perdelerine alışmış birinin o "aradaki" sesleri tanımasıdır.</p>
    <h3>Akort aleti</h3>
    <p>Deneyde söylediğiniz ses en yakın perdenin adıyla ve ondan kaç koma (ve sent) saptığıyla gösterilir. 53 komalık halka bir oktavı gösterir; seçili makamın perdeleri fosforlu. "Rast perdesi" sizin sesinize göre seçilir: sazlarda ahenk denen bu seçim, sesler için perdeyi rahat bölgenize taşır.</p>
    <h3>Makam dizileri</h3>
    <p>Rast, Uşşak ve Hicaz dizilerinin perdelerini sırayla söyleyin. Uşşak'ın segâhı ve Hicaz'ın dik kürdî ile nîm hicaz arasındaki geniş aralığı (artık ikili) kulağa en yeni gelen yerlerdir. Ardından her makamın kısa seyir cümlesini deneyin: durakta biten, güçlüde dinlenen küçük bir ezgi.</p>
    <details class="more"><summary>Daha fazla: kuram ve icra</summary>
      <p><span class="tartismali">tartışmalı</span> AEU kuramı yazım ve öğretim için bir çerçevedir; icrada perdeler makama ve ezgiye göre biraz oynar. Uşşak'taki segâh, örneğin, çoğu icrada kuramdaki 17 komadan daha pes söylenir. Ölçümü bir pusula olarak kullanın, kulağınız asıl öğretmendir.</p>
      <p>Daha fazlası için: klarnet eğitiminde <a href="https://egitim.koraytoksoz.com/klarnet/#koma" target="_blank" rel="noopener">koma</a>, <a href="https://egitim.koraytoksoz.com/klarnet/#perdeler" target="_blank" rel="noopener">perdeler</a> ve <a href="https://egitim.koraytoksoz.com/klarnet/#makamlar" target="_blank" rel="noopener">makamlar</a>; müzik eğitiminde <a href="https://egitim.koraytoksoz.com/muzik/#turk-muzigi" target="_blank" rel="noopener">Türk müziği</a>.</p>
    </details>
    <p class="try">Mikrofonu açıp rahat bir ses söyleyin: halkada perdenin adı ve sapması görünür. Mikrofon yoksa "Deneme sesi" Segâh çevresinde gezinir. "Dizi" ya da "Seyir" seçip "Başla"ya basın (Boşluk): önce dinleyin, sonra söyleyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Perde hesapları klarnet eğitimindeki js/klarnet.js'in aynısı (js/koma.js; test/koma.test.js): AEU, Rast = 0 koma, 1 koma = 1200/53 sent. Hedef perdeler eğriye ondalıklı MIDI olarak çizilir: Rast'ın MIDI'si + koma × 12/53.</li>
    <li>Makam verisi (durak, güçlü, yeden, dizi): TDV İslâm Ansiklopedisi makam maddeleri ve AEU aralıkları. Seyir cümleleri klarnet eğitimi için aynı yazar tarafından yazıldı; geleneksel bir eserden alınmadı.</li>
    <li>Rast perdesi: ziyaretçinin ses aralığına göre önerilir (dizinin aralığın alt-orta bölgesine oturması); istenirse elle seçilir. Ahenk adları yalnızca perde sınıfı eşleşince gösterilir (bolahenkte Rast = Re).</li>
    <li>Topluluğa: önce dizinin yalnızca ilk dört perdesini (dörtlü) söyletin. Uşşak segâhı için "Si ile Si♭'nin arası, biraz daha Si♭'ye yakın" demek iş görür.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="10" data-demo="usulSoyle" id="usul">
  <div class="text">
    <h2>Usulle söylemek</h2>
    <p class="lead">Türk müziğinde ritim kalıplarına usul denir. Bir usul, pes ve dolgun "düm" ile tiz ve kuru "tek" vuruşlarının belirli bir sırasıdır; ezgi bu iskeletin üstünde akar.</p>
    <p>Usulün vuruşları eşit değildir: güçlü zamanlar düm ile, zayıflar tek ile çalınır. Şarkı söylerken usulü duymak, nefesinizi ve sözlerinizi doğru yere yerleştirmenize yardım eder. Uzun bir nota bile usulün içinde bir yerde başlar ve bir yerde biter.</p>
    <h3>Bu deneydeki usuller</h3>
    <ul>
      <li><b>Sofyan</b> (4/4): şarkı formunda en çok kullanılan usullerden; düm, te, ke.</li>
      <li><b>Aksak</b> (9/8): 2+2+2+3 gruplanır; son grup bir sekizlik uzun olduğu için "aksar".</li>
      <li><b>Devr-i hindî</b> (7/8): 3+2+2.</li>
      <li><b>Aksak semâî</b> (10/8): 3+2+2+3.</li>
    </ul>
    <p>Düyek ve curcuna gibi başka usuller de çok kullanılır; burada yalnızca düm-tek dizilimini kaynakla doğrulayabildiklerimiz var.</p>
    <h3>Egzersiz</h3>
    <p>Her usul için kısa bir makam egzersizi yazdık: sofyanda Uşşak, aksakta Hicaz, devr-i hindîde Rast, aksak semâîde Uşşak. Önce bir usul dönüşü yalnızca vuruşları dinlersiniz, sonra sentez ses egzersizi söyler, ardından sıra sizde. Düm ve tek vuruşları perde eğrisinin hemen altında, aynı zaman çizgisinde görünür.</p>
    <details class="more"><summary>Daha fazla: usul ve ölçü</summary>
      <p>Batı müziğindeki ölçü yalnızca vuruş sayısını söyler; usul ise vuruşların hangi sesle (düm ya da tek) ve hangi gruplarla çalınacağını da söyler. Aynı 9/8 ölçüsü farklı usullerle çalınabilir. Ayrıntı ve usul metronomu için klarnet eğitiminde <a href="https://egitim.koraytoksoz.com/klarnet/#usul-nedir" target="_blank" rel="noopener">usul nedir</a> ve <a href="https://egitim.koraytoksoz.com/klarnet/#metronom" target="_blank" rel="noopener">metronom</a>; müzik eğitiminde <a href="https://egitim.koraytoksoz.com/muzik/#aksak" target="_blank" rel="noopener">aksak ritimler</a>.</p>
    </details>
    <p class="try">Bir usul seçip "Usulü çal" ile yalnızca vuruşları dinleyin, hızı kaydırıcıyla ayarlayın. Sonra "Başla"ya basın (Boşluk): bir dönüş vuruş, sentez sesin örneği, ardından sizin söyleyişiniz.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Usul verisi klarnet eğitimiyle ortak (js/data/usuller.js): sofyan ve aksak TDV ve neyzenim.com; devr-i hindî neyzenim.com; aksak semâî TDV ve neyzenim.com (Aykent 2020 grupları 2+3+2+3 veriyor; kaynaklar ayrışıyor).</li>
    <li>Egzersizler bu site için yazıldı; perdeler AEU komalarıyla, ziyaretçinin aralığına göre seçilen Rast perdesinden hesaplanır.</li>
    <li>Kulaklık takılı değilse sentez ses söylerken ve sizin bölümünüzde vuruşlar hoparlörden gelir; mikrofon vuruşları duyabilir. En temiz ölçüm kulaklıkla olur.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="10" data-demo="uzunHava" id="turku">
  <div class="text">
    <h2>Türkü ve uzun hava</h2>
    <p class="lead">Halk müziğimizde ezgiler iki büyük gruba ayrılır: belirli bir usulle söylenen <b>kırık havalar</b> ve usulsüz, serbest ritimli <b>uzun havalar</b>. Uzun havada zamanı sözün ve nefesin akışı belirler; ses uzar, dalgalanır, süslenir.</p>
    <p>Uzun havaların yöreden yöreye değişen adları ve üslupları vardır: Orta Anadolu'nun bozlakları, Doğu ve Güneydoğu'nun hoyratları, gurbet havaları gibi. Ortak noktaları geniş bir ses aralığı, uzun tutulan sesler ve yoğun süslemelerdir.</p>
    <h3>Süslemeler</h3>
    <ul>
      <li><b>Çarpma</b>: asıl perdeye komşu bir perdeden kısa bir dokunuşla gelmek.</li>
      <li><b>Gırtlak</b>: sesi hızlı, küçük kırılmalarla dalgalandırmak; uzun havaların imzası.</li>
      <li><b>Kaydırma</b>: bir perdeden ötekine kopmadan, kayarak geçmek.</li>
    </ul>
    <p>Bu deneydeki kısa ezgi bu slayt için yazıldı: Hüseynî makamında, güçlüden başlayıp süslemelerle durağa inen serbest bir cümle. Perde eğrisinde fosforlu bantlar asıl perdeler; aradaki dalgalar süslemeler.</p>
    <details class="more"><summary>Daha fazla: türküler ve telif</summary>
      <p>Anonim türkülerin ezgi ve sözleri serbesttir; ama TRT repertuvarındaki belirli bir notalama, düzenleme ya da kayıt ayrıca korunabilir. Bu yüzden sitede türkü ezgisi yok. Dinleyip söylemeniz için anonim olduğu TRT repertuvar kayıtlarından bilinen birkaç türkü: "Üsküdar'a Gider İken" (İstanbul), "Çanakkale İçinde" (Kastamonu). Önce kayıtlardan dinleyin, sonra perde eğrisinde serbestçe söyleyin.</p>
      <p>Süslemelerin ayrıntısı için <a href="#susleme">süslemeler</a> slaytı ve klarnet eğitiminde <a href="https://egitim.koraytoksoz.com/klarnet/#susleme" target="_blank" rel="noopener">süsleme</a>.</p>
    </details>
    <p class="health">Uzun havalar çoğu zaman tiz ve gür söylenir. Rahat aralığınızın dışına çıkmayın; gırtlak süslemesini boğazı sıkarak değil, hafif ve gevşek deneyin.</p>
    <p class="try">"Dinle" ile ezgiyi sentez sesten dinleyin, süslemeleri eğride izleyin. "Siz deneyin"e basıp (Boşluk) aynı cümleyi kendi zamanınızla söyleyin: ritim serbest, ölçüm sesinizin ne kadarının dizinin perdelerinde geçtiğini gösterir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ezgi bu site için yazıldı (Hüseynî: durak Dügâh, güçlü Hüseynî, inişte Acem). Geleneksel bir uzun havadan alınmadı.</li>
    <li>Telif: FSEK md. 6/4 aranjmanları işlenme eser sayar; anonim ezgi serbest ama TRT notası ve düzenlemesi korunabilir (docs/arastirma.md bölüm 14). Hukuki görüş değildir.</li>
    <li>Üsküdar'a Gider İken: TRT Rep. No 1140, derleyen Muzaffer Sarısözen (1945). Çanakkale İçinde: TRT Rep. No 461, Kastamonu, kaynak kişi İhsan Ozanoğlu. Kaynak: turkudostlari.net (ikincil).</li>
    <li>Ölçüm: sesli karelerin, Hüseynî dizisinin perdelerinden birine ±35 sent yakın olanlarının oranı (zamandan bağımsız, çünkü ritim serbest).</li>
  </ul></aside>
</section>
`);
