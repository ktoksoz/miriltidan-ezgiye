/* 8. Vibrato ve süsleme */
L.slide(`
<section class="slide" data-chapter="8" data-demo="vibrato" id="vibrato" data-tool>
  <div class="text">
    <h2>Vibrato ölçer</h2>
    <p class="lead"><strong>Vibrato</strong> (İtalyanca "titreyen"), uzun bir seste perdenin düzenli, dalga gibi inip çıkmasıdır. Kulak bunu çoğu zaman titreme olarak değil, sesin canlılığı ve sıcaklığı olarak duyar.</p>
    <p>Bir vibratoyu iki sayı anlatır. <span class="fosfor">Hız</span>: perde saniyede kaç kez inip çıkıyor (Hz). <span class="fosfor">Genişlik</span>: perde ortalamanın iki yanına ne kadar uzaklaşıyor (± sent; 100 sent bir yarım ses). Bir üçüncüsü de düzen: dalgalar birbirine ne kadar benziyor.</p>
    <p>Klasik eğitimli şarkıcılarda ölçülen vibrato hızı çoğunlukla saniyede 5 ile 7 arasındadır. Genişlik için kaynaklarda verilen sayılar daha dağınık; grafikteki genişlik bölgesi yalnızca kaba bir yön gösterir.</p>
    <h3>Vibrato zorla yapılmaz</h3>
    <ul>
      <li>Vibrato çoğu şarkıcıda rahat, destekli bir uzun seste kendiliğinden belirir. Gırtlağı ya da çeneyi sallayarak "üretmeye" çalışmayın.</li>
      <li>Çok yavaş ve geniş bir dalga ya da çok hızlı ve dar bir titreşim çoğu zaman gerginliğin ya da yorgunluğun işaretidir; ölçümü bir öğretmenle birlikte yorumlayın.</li>
      <li>Vibratosuz düz ses de bir beceridir; sonraki slaytta stillere bakıyoruz.</li>
    </ul>
    <details class="more"><summary>Daha fazla: bu ölçer nasıl çalışıyor?</summary>
      <p>Mikrofon her 10 milisaniyede bir perdenizi ölçer. Ölçer son üç saniyedeki en uzun kesintisiz sesi alır, yavaş kaymayı çıkarır ve kalan dalgalanmanın tekrar süresinden hızı, büyüklüğünden genişliği hesaplar. Düzen, dalgaların birbirine benzerliğidir (0–%100).</p>
      <p>Ölçümler yaklaşıktır: oda yankısı, mikrofon ve ses perdesi sonucu birkaç sent oynatabilir. Ses bittiğinde vibrato belirginse sonuç bu tarayıcıda saklanır; <a href="#ilerleme">İlerleme</a> slaytında tarih tarih görünür.</p>
    </details>
    <p class="health">Ses yorulunca vibrato çoğu zaman düzensizleşir. Zorlanınca, boğaz ağrıyınca ya da ses kısılınca durun.</p>
    <p class="try">Mikrofonu açın ve rahat bir notayı "aaa" diye 3–4 saniye tutun: perde eğrisinde dalgayı, düzlemde noktanızı görürsünüz. Mikrofonsuz: hız ve genişlik kaydırıcılarıyla sentez vibratoyu değiştirip "Örneği dinle"ye basın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Hız: Prame (1994), on ünlü şarkıcıda yaklaşık 5,5–6,7 Hz (ikincil aktarım; künye: JASA 96(4), 1979–1984). Lester-Smith, Derrick ve Larson (2024, J Voice 38(1)): klasik eğitimli şarkıcılarda F0 modülasyon hızı 5–7 Hz.</li>
    <li>Genişlik: grafikteki ±50–100 sent bölgesi yaklaşık bir mühendislik tercihidir; birincil kaynakta doğrulanmadı (Prame 1997 sayıları okunamadı). Ziyaretçiye kesin sınır diye sunmayın.</li>
    <li>Mitchell ve Kenny (2010): üniversite eğitimi boyunca vibrato genişliği arttı, hız beklenen sınırlarda kaldı.</li>
    <li>Ölçüm: medyan süzgeçsiz ham perde dizisi, 100 Hz'e yeniden örneklenir; özilintiyle hız, artık sinyalin RMS'iyle genişlik (Analiz.vibrato).</li>
  </ul>
  <p class="kaynak">Kaynaklar: Prame 1994; Lester-Smith ve ark. 2024 (doi:10.1016/j.jvoice.2021.08.004); Mitchell ve Kenny 2010 (doi:10.1016/j.jvoice.2008.12.003).</p></aside>
</section>

<section class="slide" data-chapter="8" data-demo="duzSes" id="duz-ses">
  <div class="text">
    <h2>Düz ses ve vibrato</h2>
    <p class="lead">Vibrato bir "var ya da yok" düğmesi değil, bir üslup seçimidir. Aynı ezgi düz bir sesle, sonradan açılan bir vibratoyla ya da baştan sona vibratolu söylenebilir.</p>
    <p>Deneyde aynı kısa cümle üç biçimde sentezleniyor:</p>
    <ul>
      <li><strong>Erken müzik</strong> (Rönesans ve Barok müziğin tarihsel icrası): sesler çoğunlukla düz (vibratosuz) tutulur; vibrato bir süs gibi seyrek kullanılır.</li>
      <li><strong>Pop ve müzikal</strong>: uzun sesin başı düz, vibrato sona doğru ve daha dar açılır.</li>
      <li><strong>Opera</strong>: vibrato sesin doğal bir parçası gibi baştan sona sürer.</li>
    </ul>
    <p>Düzlemde her stil bir okla gösteriliyor: okun başı uzun notanın ilk anları, ucu son anları. Düz ses düzlemin tabanında, "düz ses" şeridinde kalır.</p>
    <h3>Düz ses bir hata değil</h3>
    <p>Koro ve erken müzik şarkıcıları düz sesi bilerek seçer; pop şarkıcıları vibratoyu bir vurgu olarak saklar. Önemli olan seçebilmektir: düz başlayıp istediğiniz anda vibratoyu bırakabilmek, ya da düz tutabilmek.</p>
    <details class="more"><summary>Daha fazla: sayılar neden yok?</summary>
      <p>Klasik şarkıcıların vibrato hızı için ölçümler var; pop ve erken müzikte düz sesin ve geç vibratonun ne kadar yaygın olduğuna dair sayısal bir birincil kaynak doğrulayamadık. Bu yüzden stilleri sayıyla değil, biçimle anlatıyoruz. Sentezdeki ayarlar örnek içindir, ölçüm değildir.</p>
    </details>
    <p class="try">Bir stil seçip "Dinle"ye basın. Perde eğrisinde uzun notanın biçimine, düzlemde okun yönüne bakın. Sonra aynı notayı siz önce düz, sonra vibratoyu bırakarak söylemeyi deneyin (<a href="#vibrato">vibrato ölçerde</a> görebilirsiniz).</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Pop/CCM ve erken müzikte düz ses ve geç vibrato: yaygın gözlem, sayısal birincil kaynak doğrulanmadı (arastirma.md bölüm 3). Stil farkı olarak anlatın, sayı vermeyin.</li>
    <li>Sentez ayarları (örnek, ölçüm değil): erken müzik vibratosuz; pop uzun notada 1,1 sn sonra ±35 sent, 5,4 Hz; opera bütün notalarda ±70 sent, 5,8 Hz ve şarkıcı formantı açık.</li>
    <li>Oklar, ezginin son uzun notasının ilk ve son bölümünden ölçülen vibratodur (Analiz.vibrato).</li>
  </ul>
  <p class="kaynak">Kaynak: docs/arastirma.md bölüm 3 (vibrato), Prame 1994.</p></aside>
</section>

<section class="slide" data-chapter="8" data-demo="susleme" id="susleme">
  <div class="text">
    <h2>Süslemeler</h2>
    <p class="lead">Süsleme, ezginin iskeletine eklenen küçük perde hareketleridir. Çoğu notada yazılmaz; kulakla, ustaları dinleyerek öğrenilir.</p>
    <h3>Batı müziğinde</h3>
    <ul>
      <li><strong>Tril</strong>: bir nota ile komşusu arasında hızlı ve düzenli gidip gelme.</li>
      <li><strong>Apojiatura</strong> (appoggiatura, İtalyanca "yaslanma"): asıl notadan önce, ona komşu bir notanın vurguyla söylenip asıl notaya çözülmesi. Asıl notanın süresinden pay alır.</li>
    </ul>
    <h3>Türk müziğinde</h3>
    <ul>
      <li><strong>Çarpma</strong>: asıl notadan önce çok kısa söylenen yardımcı nota.</li>
      <li><strong>Gırtlak</strong>: sesin gırtlakta kısa, hızlı kırılmalarla dalgalandırılması; özellikle uzun havalarda duyulur. Anatomideki gırtlakla karıştırmayın.</li>
      <li><strong>Kaydırma</strong>: bir perdeden ötekine kesintisiz kayarak geçmek (glissando ya da portamento ile akraba).</li>
      <li><strong>Sürme</strong> <span class="tartismali">tanımı doğrulanmadı</span>: bu sayfada notaya alttan sürükleyerek girmek anlamında kullanıyoruz. Adın ve anlamın yöreye ve icracıya göre değiştiğini bilin.</li>
    </ul>
    <p>Deneyde fosforlu bantlar ezginin süslemesiz iskeleti, grafit çizgi süslemenin perde yolu. Sentezler kaba birer çizimdir; bir icracının söyleyişi değildir.</p>
    <details class="more"><summary>Daha fazla: süsleme ile perde</summary>
      <p>Süslemeler hızlıdır; perde ölçer çok kısa notaları biraz yuvarlar. Eğrinizi bir not olarak değil, biçim olarak okuyun: tril bir testere dişi, kaydırma bir yokuş, çarpma küçük bir çentik gibi görünür. Klarnet eğitiminde aynı süslemeleri çalgıda görebilirsiniz: <a href="https://egitim.koraytoksoz.com/klarnet/#susleme" target="_blank" rel="noopener">klarnette süslemeler</a>.</p>
    </details>
    <p class="try">Bir süsleme seçip "Dinle"ye, karşılaştırmak için "Süslemesiz"e basın. Mikrofonla denemek için "Siz deneyin": önce örneği dinlersiniz, sonra aynı süslemeyi söylersiniz; eğriniz örneğin üstüne çizilir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Çarpma, glissando, tril tanımları: Şahinoğlu (2022), Yegah Müzikoloji Dergisi 5(2), 296–316 (klarnet bağlamında). Çarpma, apojiatür, glissando ve portamento türkü icrası çalışmalarında da genel terminoloji olarak anılır (İTÜ, "Türkülerin dinamik yapısını oluşturan olguların öğretiminde…").</li>
    <li>Gırtlak (süsleme): sözlükteki tanım; hançere ile birlikte anılır. Kaynaklı ayrıntılı bir tanım bulamadık.</li>
    <li>Kaydırma ve sürme: kaynaklı tanım bulunamadı; docs/kontrol/08.md'de eğitmene soruldu. Topluluğa anlatırken "bu sayfadaki çalışma tanımı" deyin.</li>
    <li>Sentez: tril 0,075 sn'lik notalarla (saniyede yaklaşık 6–7 gidip gelme), kaydırma ve sürme perde geçiş süresi uzatılarak yapıldı.</li>
  </ul>
  <p class="kaynak">Kaynaklar: Şahinoğlu 2022; klarnet eğitimi #susleme.</p></aside>
</section>
`);
