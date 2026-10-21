/* 1. Ses nasıl çıkar? */
L.slide(`
<section class="slide" data-chapter="1" data-demo="sesAygiti" id="ses-aygiti">
  <div class="text">
    <h2>Ses aygıtı</h2>
    <p class="lead">Sesiniz üç parçalı bir çalgıdır: akciğerler havayı verir, gırtlaktaki ses telleri bu havayı titreşime çevirir, boğaz, ağız ve burun boşlukları da bu titreşimi biçimlendirip güçlendirir.</p>
    <p>Ses bilimciler ses aygıtını çoğu zaman üç göreve ayırır: <strong>güç kaynağı</strong>, <strong>titreşen</strong> ve <strong>rezonatör</strong>. Nefesli bir çalgıda da aynı üçlü vardır: klarnetçinin nefesi güç kaynağı, kamış titreşen, gövde rezonatördür.</p>
    <h3>Üç görev</h3>
    <ul>
      <li><strong>Güç kaynağı:</strong> akciğerler ve solunum kasları. Nefes verirken karın ve göğüs kafesi kasları havaya hafif, dengeli bir basınç verir; bu basınç ses tellerinin altında birikir.</li>
      <li><strong>Titreşen:</strong> gırtlak (larinks). Soluk borusunun üst ucundaki bu kıkırdak kutunun içinde iki ses teli vardır. Nefes alırken açılırlar; söylerken birbirine yaklaşırlar ve aradan geçen hava onları saniyede yüzlerce kez açıp kapatır. Çıkan ses henüz bir "vızıltı"dır.</li>
      <li><strong>Rezonatör:</strong> yutak (gırtlağın üstündeki boğaz borusu), ağız ve gerektiğinde burun. Bu boşluklar vızıltının bazı frekanslarını güçlendirir, bazılarını zayıflatır; "a" ile "i" arasındaki farkı yaratan budur. Dil, dudaklar, çene ve yumuşak damak boşlukların biçimini değiştirir.</li>
    </ul>
    <p>Şan çalışmasının büyük kısmı bu üç parçanın birlikte çalışmasıyla ilgilidir: nefesi dengeli vermek (2. bölüm), ses tellerini zorlamadan titreştirmek (6. bölüm) ve rezonatörü biçimlendirmek (7. bölüm).</p>
    <p>Elinizi boynunuzun önüne, gırtlağınızın üstüne koyup "mmm" deyin: titreşimi parmaklarınızda hissedersiniz. Şimdi aynı nefesle fısıldayın: titreşim kaybolur, çünkü fısıltıda ses telleri titreşmez.</p>
    <details class="more"><summary>Daha fazla: ses yolu ne kadar uzun?</summary>
      <p>Ses tellerinden dudaklara kadar uzanan boruya ses yolu denir. Yetişkin bir erkekte yaklaşık 17 cm, kadınlarda biraz daha kısa, çocuklarda daha da kısadır. Boru kısaldıkça rezonans frekansları yükselir; çocuk seslerinin daha ince tınlamasının bir nedeni budur.</p>
      <p>Şarkı söylerken gırtlağın inip kalkması ve dudakların yuvarlanması borunun boyunu biraz değiştirir; tınıdaki "koyu" ve "parlak" farkının bir kısmı buradan gelir.</p>
      <p>Sessizce nefes alıp verirken ses telleri açıktır, hava ses çıkarmadan geçer. Fısıltıda teller tam kapanmaz ve titreşmez; duyduğunuz, daralan yerlerden geçen havanın hışırtısıdır.</p>
    </details>
    <p class="try">Çizimde bir parçaya ya da adına dokunun: adı ve görevi yazılır. "Örnek ses" havanın yolunu ve titreşen ses tellerini gösterir; "Yalnız nefes" tellerin açıkken havayı sessizce geçirdiğini. Mikrofonu açıp bir "aaa" deyin: ne kadar gür söylerseniz akış o kadar canlanır.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Güç kaynağı – titreşen – rezonatör ayrımı: Sundberg, J. (1987). <em>The Science of the Singing Voice</em>. Northern Illinois University Press; Titze, I. R. (1994). <em>Principles of Voice Production</em>. Prentice Hall.</li>
    <li>Çizim bilerek stilize: baş ve boyun yandan, akciğerler önden görünür; ölçek gerçek değil. Ses telleri iki kama olarak, karşıdan bakılmış gibi çizildi.</li>
    <li>Ses yolu uzunluğu (yetişkin erkekte ~17 cm) ders kitabı değeridir; docs/kontrol/01.md'de doğrulanacaklar arasında.</li>
    <li>Topluluğa: herkes elini gırtlağına koyup önce "mmm", sonra fısıltıyla "fff" desin; titreşimin olup olmamasını karşılaştırın.</li>
    <li>Mikrofon modunda gürlük (dB) akışın hızını ve ses tellerinin titreşimini sürer; sesli algılanmayan gürültü (fısıltı) yalnızca hava akışı olarak görünür.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="sesTelleri" id="ses-telleri">
  <div class="text">
    <h2>Ses telleri</h2>
    <p class="lead">Ses telleri gırtlağın içinde önden arkaya uzanan iki küçük kıvrımdır. Altlarında biriken hava onları iter ve açar; esneklikleri onları geri kapatır. Bu açılıp kapanma saniyede yüzlerce kez yinelenir.</p>
    <p>Adı "tel" olsa da gitar teli gibi ince ve gergin değil, kat kat dokudan oluşan yumuşak kıvrımlardır; bilimsel adları ses kıvrımlarıdır. Yetişkin bir erkekte boyları 2 santim dolayında, kadınlarda biraz daha kısadır. İki telin arasındaki boşluğa <strong>glotis</strong> denir.</p>
    <h3>Bir titreşim döngüsü</h3>
    <ol>
      <li>Teller birbirine yaklaşır, glotis kapanır. Altlarında akciğerden gelen havanın basıncı yükselir.</li>
      <li>Basınç telleri önce alt kenarlarından, sonra üst kenarlarından iterek açar; bir hava "puf"u geçer.</li>
      <li>Tellerin esnekliği ve aralarından hızla akan havanın basıncının düşmesi onları yeniden kapatır. Döngü baştan başlar.</li>
    </ol>
    <p>Her puf havada küçük bir basınç darbesi yaratır: saniyede 200 puf, 200 Hz'lik bir ses demektir. Türkçe okuma kayıtlarında ortalama konuşma perdesi erkeklerde yaklaşık <span class="num">130 Hz</span>, kadınlarda yaklaşık <span class="num">235 Hz</span> ölçülmüş (Malkoç 2009).</p>
    <h3>Perde ve gürlük</h3>
    <p><strong>Perdeyi</strong> esas olarak tellerin gerginliği ve boyu belirler: gırtlaktaki küçük kaslar telleri uzatıp gerdikçe teller daha hızlı titreşir. <strong>Gürlük</strong> daha çok tellerin altındaki hava basıncından gelir: basınç artınca teller daha geniş açılır ve daha sert kapanır. Sert kapanış üst harmonikleri de güçlendirir; gür ses bu yüzden daha parlak tınlar.</p>
    <details class="more"><summary>Daha fazla: deneydeki dalga nedir?</summary>
      <p>Grafik, glotisten geçen hava akımını gösterir: teller açılırken akım yavaşça artar, kapanırken hızla düşer, kapalıyken sıfırdır (Rosenberg 1971 modeli). Bir döngüde tellerin açık kaldığı paya <em>açık faz oranı</em> denir; göğüs sesine yakın söyleyişte ölçümler aşağı yukarı 0,3 ile 0,8 arasında değişir (Henrich ve ark. 2005). Deneyde hava basıncı arttıkça kapalı faz biraz uzar.</p>
      <p>Deneydeki ses de bu akımdan sentezlenir: aynı darbeler bir "a" ünlüsünün rezonanslarından geçirilir (sonraki slayt).</p>
      <p>Bu titreşimi gözle görmek mümkün değildir. Hekimler ses tellerini laringoskopla ve yanıp sönen (stroboskopik) ışıkla inceler; ışık titreşimle neredeyse aynı hızda yanıp söndüğü için hareket ağır çekim gibi görünür. Bu çizim de öyle: döngü yüzlerce kat yavaşlatıldı.</p>
    </details>
    <p class="health">Ses kısıklığı ya da söylerken ağrı, ses tellerinin yorulduğunu gösterebilir; zorlanınca durun. Kısıklık 4 hafta içinde geçmezse (sesinizi meslek olarak kullanıyorsanız daha erken) bir KBB uzmanına görünün.</p>
    <p class="try">"Gerginlik" kaydırıcısıyla perdeyi, "Hava basıncı" ile gürlüğü değiştirin; "Dinle"ye basıp aynı titreşimi duyun. "Nefes alırken"i seçince tellerin nasıl açıldığını görürsünüz.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Kaynak modeli: Rosenberg, A. E. (1971). Effect of glottal pulse shape on the quality of natural vowels. <em>JASA</em> 49(2B): 583–590. Deneydeki eğri <code>Ses.rosenberg</code> ile çizilir; ses aynı modelden sentezlenir.</li>
    <li>Açık faz oranı (OQ): Henrich, d'Alessandro, Doval ve Castellengo (2005), <em>JASA</em> 117(3): 1417–1430. M1'de 0,3–0,8; M1'de OQ ses şiddetiyle güçlü biçimde ilişkili. Deneyde OQ = 0,72 − 0,22 × basınç.</li>
    <li>Konuşma perdeleri: Malkoç (2009), <em>Dil Dergisi</em> 146: 71–85, Tablo 1'deki F0 ortalamaları (erkek 124–141 Hz, kadın 212–247 Hz).</li>
    <li>Ses teli boyu ve "Bernoulli" etkisinin kapanmadaki payı kontrol listesinde (docs/kontrol/01.md).</li>
    <li>Ağır çekim katsayısı ekranda yazılı: gerçek perde (Hz) ÷ çizimdeki döngü hızı.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="kaynakFiltre" id="kaynak-filtre">
  <div class="text">
    <h2>Kaynak ve filtre</h2>
    <p class="lead">Ses tellerinin ürettiği vızıltı, ağızdan çıkan sese hiç benzemez. Aradaki farkı ses yolu yapar: vızıltıdaki bazı frekansları güçlendirip bazılarını zayıflatan bir filtre gibi çalışır. Buna kaynak–filtre kuramı denir.</p>
    <p><strong>Kaynak:</strong> ses telleri her titreşimde bir hava darbesi verir. Düzenli darbeler tek bir frekans değil, bir harmonik dizisi üretir: temel frekans (duyduğumuz perde) ve onun 2, 3, 4… katları. Harmonikler tize doğru gittikçe zayıflar. Bu kaynak bütün ünlüler için hemen hemen aynıdır.</p>
    <p><strong>Filtre:</strong> yutak, ağız ve burundan oluşan ses yolunun rezonansları. Dilin, çenenin ve dudakların konumu bu rezonansların yerini belirler. Rezonans tepelerine <strong>formant</strong> denir ve sırayla F1, F2, F3… diye adlandırılır.</p>
    <p><strong>Çıkan ses:</strong> kaynaktaki her harmonik, filtrenin o frekanstaki kazancıyla çarpılır. Formantlara yakın harmonikler güçlenir, aradakiler zayıflar. Kulağımız ünlüyü bu tepelerin yerinden tanır.</p>
    <h3>İki ayrı ayar</h3>
    <p>Kaynak ile filtre büyük ölçüde birbirinden bağımsızdır. Aynı perdede "a" da "i" de söyleyebilirsiniz (kaynak aynı, filtre farklı); aynı "a"yı farklı perdelerde söyleyebilirsiniz (filtre aynı, kaynak farklı). Deneyde perdeyi değiştirince harmonikler sıklaşır ya da seyrekleşir; formant tepeleri ise yerinde kalır.</p>
    <details class="more"><summary>Daha fazla: harmonikler, tını ve sınırlar</summary>
      <p>Harmonik dizisini ve tınının harmoniklerin dağılımından nasıl doğduğunu müzik eğitiminde ayrıntılı bulabilirsiniz: <a href="https://egitim.koraytoksoz.com/muzik/#harmonik-dizisi" target="_blank" rel="noopener">harmonik dizisi</a> ve <a href="https://egitim.koraytoksoz.com/muzik/#tini" target="_blank" rel="noopener">tını</a>.</p>
      <p>Kaynak ile filtre tamamen bağımsız da değildir: özellikle tiz notalarda perde bir formantın yanına geldiğinde birbirlerini etkilerler. Şarkıcıların bunu nasıl kullandığını <a href="#unlu-duzeltme">ünlü düzeltme</a> slaytında göreceğiz.</p>
      <p>Grafiklerdeki kaynak, deneydeki sesi üreten modelin kendisidir: Rosenberg darbesinin (ağızdan yayılma etkisiyle birlikte) harmonikleri. Filtre, beş formantın art arda bağlandığı bir model; değerler Türkçe ünlü ölçümlerinden (Malkoç 2009).</p>
    </details>
    <p class="try">Bir ünlü ve ses türü seçin. "Kaynak (filtresiz)" düğmesi çıplak vızıltıyı, "Ünlü" düğmesi aynı vızıltının ses yolundan geçmiş hâlini çalar. Çalarken ünlüyü ya da perdeyi değiştirin ve üç grafiğin nasıl değiştiğine bakın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Kaynak–filtre kuramı: Fant, G. (1960). <em>Acoustic Theory of Speech Production</em>. Mouton. Şarkı için: Sundberg (1987), Titze (1994).</li>
    <li>Kaynak spektrumu: <code>Ses.kaynakSpektrum(0,6)</code>, akım türevinin Fourier katsayıları; filtre: <code>Ses.filtreYaniti(Ses.hedefFormant(...))</code>. Çıkan ses grafiği bu ikisinin dB toplamıdır, en güçlü harmonik 0 dB.</li>
    <li>"Kaynak (filtresiz)" sesi aynı harmonik genliklerinden kurulan bir dalga (PeriodicWave): filtre hiç uygulanmaz.</li>
    <li>Formant değerleri: Malkoç (2009) erkek ve kadın ortalamaları; çocuk değerleri tahmindir (bkz. sonraki slayt).</li>
    <li>Topluluğa: "Kaynak" ile "Ünlü"yü arka arkaya dinletin, sonra ünlüyü çalarken "a"dan "i"ye geçin: perde aynı kalırken ünlünün değiştiğini herkes duyar.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="formantlar" id="formantlar">
  <div class="text">
    <h2>Formantlar ve ünlüler</h2>
    <p class="lead">Bir ünlüyü tanımak için kulağımız en çok ilk iki formanta bakar. F1 ile F2'yi bir haritaya koyunca Türkçenin sekiz ünlüsü bir dörtgenin köşelerine ve kenarlarına yerleşir.</p>
    <p><strong>F1</strong> (birinci formant) ağız ne kadar açıksa o kadar yüksektir: "a"da yüksek, "i" ile "u"da düşüktür. <strong>F2</strong> (ikinci formant) dilin ne kadar önde olduğunu gösterir: "i" ve "e" gibi ince (ön) ünlülerde yüksek, "u" ve "o" gibi kalın (art) ünlülerde düşüktür. Dudakları yuvarlamak da F2'yi düşürür: "i" ile "ü" arasındaki fark budur.</p>
    <p>Haritada F1 değerleri aşağı doğru büyür, F2 değerleri ise alışılmışın tersine büyükten küçüğe dizilir. Dilbilimcilerin geleneksel çizimi budur, çünkü harita böylece kabaca ağızdaki dilin konumuna benzer: kapalı ünlüler (i, ü, ı, u) haritanın tepesinde, açık ünlüler (e, a) dibinde; ön ünlüler bir kenarda, art ünlüler öbür kenarda toplanır.</p>
    <h3>Değerler nereden?</h3>
    <p>Erkek ve kadın değerleri Malkoç'un (2009) ölçümleri: 10 erkek ve 10 kadın Türkçe konuşucunun okuma sırasındaki ortalamaları. Türkçe çocuk ölçümlerine ulaşamadık; çocuk değerleri, kadın değerlerinin İngilizce verilerdeki çocuk/kadın oranlarıyla (Hillenbrand ve ark. 1995) ölçeklenmiş bir <strong>tahmindir</strong>. Herkesin ses yolu farklıdır; sizin noktalarınız bu ortalamalardan epeyce sapabilir.</p>
    <details class="more"><summary>Daha fazla: tiz seslerde ünlüler ve ölçüm</summary>
      <p>Bir soprano tiz bir notada söylerken temel frekans F1'in bile üstüne çıkabilir: La5 yaklaşık 880 Hz'dir, "i"nin F1'i ise 430 Hz dolayındadır. Harmonikler o kadar seyrektir ki formantları "gösterecek" harmonik kalmaz. Sopranolar bu yüzden F1'i perdeye göre ayarlar ve ünlüler birbirine yaklaşır (Joliveau ve ark. 2004). Tiz notalarda sözlerin zor anlaşılmasının bir nedeni budur; <a href="#unlu-duzeltme">ünlü düzeltme</a> slaytında deneyeceğiz.</p>
      <p>Mikrofon ölçümü LPC (doğrusal öngörü) denen bir yöntemle sesin zarfındaki tepeleri arar. Konuşma perdelerinde iyi çalışır; perde yükseldikçe tepeler tek tek harmoniklere takılır ve tahmin güvenilmez olur.</p>
    </details>
    <p class="try">Haritada bir ünlüye dokunup dinleyin. Basılı tutup haritada gezdirin: ara ünlüleri duyarsınız ("i"den "u"ya giderken "ü" ve "ı"ya yakın yerlerden geçersiniz). Mikrofonu açıp rahat bir perdede uzun "a", "i", "u" söyleyin: sesiniz haritada bir nokta olarak gezinir. Mikrofon yoksa "Örnek: a, i, u" aynı ölçümü sentez sesle yapar.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Malkoç, E. (2009). Türkçe ünlü formant frekans değerleri ve bu değerlere dayalı ünlü dörtgeni. <em>Dil Dergisi</em> 146: 71–85, Tablo 1.</li>
    <li>Çocuk değerleri tahmin: kadın değerleri × (F1 1,07; F2 1,11; F3 1,09), oranlar Hillenbrand, Getty, Clark ve Wheeler (1995), <em>JASA</em> 97(5): 3099–3111'den.</li>
    <li>Joliveau, Smith ve Wolfe (2004), <em>Nature</em> 427: 116 ve <em>JASA</em> 116(4): 2434–2439: sopranolarda R1 ≈ f0 ayarı.</li>
    <li>Mikrofon: her ~100 ms'de 4096 örneklik pencerede LPC (12. derece, ~12 kHz'e indirilmiş), 180 Hz üstündeki ilk iki zarf tepesi; son üç ölçümün ortancası. Yaklaşık; perde 350 Hz'i geçince uyarı çıkar.</li>
    <li>Topluluğa: önce herkes "i"den "u"ya yavaşça geçsin (dudakları yuvarlayıp dili geri çekerek); haritada noktanın yolunu gösterin.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="sarkiciFormanti" id="sarkici-formanti">
  <div class="text">
    <h2>Şarkıcı formantı</h2>
    <p class="lead">Bir opera şarkıcısı mikrofonsuz, koca bir orkestranın üstünden nasıl duyulur? Sırrın bir bölümü sesinin 3 kHz dolayındaki bir enerji tepesinde: <strong>şarkıcı formantı</strong>.</p>
    <p>Orkestranın enerjisinin çoğu 1 kHz'in altındadır ve tize doğru hızla azalır. Klasik eğitimli şarkıcıların sesinde ise yaklaşık 2,5 ile 3,5 kHz arasında belirgin bir tepe görülür. Bu bantta şarkıcı orkestradan güçlü olabilir; kulağımız da bu bölgeye oldukça duyarlıdır. Sonuçta ses orkestranın içinde kaybolmaz, salonda "taşır".</p>
    <p>Şarkıcı formantı ayrı bir rezonans değildir: üçüncü, dördüncü ve beşinci formantların birbirine yaklaşıp tek bir güçlü tepe gibi davranmasıdır (Sundberg 1974, 2001). Bunun için ses tellerinin hemen üstündeki dar boşluğun (gırtlak tüpü) çıkışı, üstündeki yutağa göre yeterince dar olmalıdır; gırtlağın biraz alçak tutulması da yardım eder.</p>
    <h3>Kimde var?</h3>
    <ul>
      <li><strong>Klasik şarkıcılar</strong>, özellikle erkek sesleri: tepe belirgindir.</li>
      <li><strong>Sopranolar:</strong> tiz notalarda harmonikler çok seyrek olduğundan tepe daha az belirgindir; onlar daha çok formantları perdeye göre ayarlar.</li>
      <li><strong>Müzikal ve pop şarkıcıları:</strong> mikrofonla söyledikleri için buna gerek duymazlar; müzikal şarkıcılarıyla yapılan ölçümlerde şarkıcı formantı bulunmamıştır (Sundberg ve Romedahl 2009).</li>
    </ul>
    <p>Şarkıcı formantı bir başlangıç hedefi değil, uzun klasik eğitimin bir sonucudur. Onu boğazı sıkarak yaratmaya çalışmayın; tını ve rezonans 7. bölümde.</p>
    <details class="more"><summary>Daha fazla: deneydeki orkestra ve şarkıcı</summary>
      <p>Deneydeki orkestra gerçek bir kayıt değil: 500 Hz'in üstünde her oktavda yaklaşık 12 dB zayıflayan akorlardan kurulmuş basit bir sentez. Gerçek orkestraların uzun süreli ortalama spektrumu da benzer biçimde 0,5 kHz dolayında en güçlüdür ve tize doğru düşer (Sundberg 1987).</p>
      <p>Şarkıcı da sentez: aynı ezgi, aynı gürlükte, şarkıcı formantı açık ve kapalı. Açıkken F3, F4 ve F5 yaklaşık 2,5–3,1 kHz arasına toplanır. Alttaki grafik her sesin bütün ezgi boyunca ortalama spektrumudur.</p>
    </details>
    <p class="try">"Dinle"ye basın, sonra şarkıcı formantını "Var" ve "Yok" arasında değiştirin. Spektrogramda fosforlu bantta şarkıcının izlerinin koyulaştığına, ortalama spektrumda şarkıcı çizgisinin bu bantta orkestrayı geçtiğine bakın. Mikrofonu açıp söyleyin: kendi spektrogramınız akar.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Sundberg, J. (1974). Articulatory interpretation of the "singing formant". <em>JASA</em> 55(4): 838–844. Sundberg, J. (2001). Level and center frequency of the singer's formant. <em>J Voice</em> 15(2): 176–186 ("yaklaşık 3 kHz", F3–F5 kümelenmesi).</li>
    <li>Sundberg ve Romedahl (2009), <em>J Voice</em> 23(5): 539–545: müzikal tiyatro şarkıcılarında şarkıcı formantı yok.</li>
    <li>Kitap: Sundberg (1987), <em>The Science of the Singing Voice</em>: orkestra ve şarkıcının uzun süreli ortalama spektrumu karşılaştırması. Sayfa numarası kontrol listesinde.</li>
    <li>Deneydeki sayılar sentezden ölçülür: 2,5–3,5 kHz bandında şarkıcı ile orkestranın enerji farkı (dB). Orkestra şarkıcıdan toplamda yaklaşık 4 dB güçlü ayarlandı.</li>
    <li>Mikrofon modunda 2,5–3,5 kHz bandının 0,1–1 kHz bandına oranı yazılır; konuşma sesinde ve eğitimsiz seste bu oran düşüktür, bu bir not değildir.</li>
  </ul></aside>
</section>
`);
