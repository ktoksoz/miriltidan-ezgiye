/* 9. Diksiyon ve sözle söylemek */
L.slide(`
<section class="slide" data-chapter="9" data-demo="turkceUnluler" id="turkce-unluler">
  <div class="text">
    <h2>Türkçe ünlüler şarkıda</h2>
    <p class="lead">Konuşurken heceler kısa ve eşittir; şarkıda ise ezgi ünlülerin üstünde taşınır. Sessiz harfler kısa kalır, ünlüler notanın süresi kadar uzar.</p>
    <p>Perde yalnızca ses telleri titreşirken vardır. Ünlülerde (a, e, ı, i, o, ö, u, ü) teller hep titreşir; "m, n, l, r, y" gibi sessizlerde de titreşim sürer. "s, ş, f, h, k, p, t, ç" gibi sessizlerde ise titreşim durur; "b, d, g" gibi patlamalılarda kısa bir an zayıflar. Perde eğrisinde bu anlar boşluk olarak kalır.</p>
    <p>Deneydeki zaman çizelgesi aynı cümlenin iki hâlini gösteriyor. Konuşmada ünlü ve sessiz parçalar birbirine yakın uzunlukta. Şarkıda sessizler hemen hemen aynı kalıyor, ünlüler ise notaya göre birkaç kat uzuyor.</p>
    <h3>Şarkıda Türkçe</h3>
    <ul>
      <li>Ünlüyü erken bulun ve notanın sonuna kadar aynı ünlüde kalın.</li>
      <li>Sessizi notanın sonuna, bir sonraki heceye bırakın: "Sa-bah-o-lur" değil, "Sa-ba-ho-lur" gibi.</li>
      <li>"ğ" Türkçede çoğu zaman önündeki ünlüyü uzatır; şarkıda o ünlüde kalmak yeter.</li>
      <li>Kelime sonundaki sessizleri yutmayın: kısa ama net söyleyin.</li>
    </ul>
    <details class="more"><summary>Daha fazla: çizelgedeki süreler</summary>
      <p>Konuşma satırındaki süreler bir örnektir, bir ölçüm değildir: sessizler 50–100 milisaniye, ünlüler 90–150 milisaniye civarında yazıldı. Şarkı satırı "Sabah olur" ezgisinin ilk cümlesinden, dakikada 80 vuruşla hesaplandı. Sizin ölçümünüz mikrofonun "ses var ve perdeli" dediği karelerden hesaplanır; perdeli sessizler (m, n, l, r) perdeli sayılır, bu yüzden oran yaklaşıktır.</p>
    </details>
    <p class="try">"Konuşur gibi" ve "Şarkı gibi" ile aynı cümleyi iki biçimde dinleyin. Sonra "Söyle ve ölç"e basıp cümleyi kendi sesinizle söyleyin: perdeli ve perdesiz sürelerinizin oranı çizelgenin altına eklenir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Cümle: "Sabah olur, gün doğar" (bu site için yazılmış "Sabah olur" ezgisinin ilk cümlesi, js/data/ezgiler.js).</li>
    <li>Konuşma süreleri örnek değerlerdir (doğrulanmış bir Türkçe ölçüm değil); docs/kontrol/09.md'de soruldu.</li>
    <li>Sesli / sessiz ayrımı: Pitch.Takipci'nin sesli karesi (RMS ve YIN berraklığı, histerezisle). Perdeli sessizler sesli sayılır.</li>
    <li>"Sessizi sonraki heceye bırak" önerisi yaygın bir diksiyon önerisidir; tek bir kaynağa dayanmıyor (kontrol listesinde).</li>
  </ul></aside>
</section>

<section class="slide" data-chapter="9" data-demo="legato" id="legato" data-tool>
  <div class="text">
    <h2>Sessiz harfler ve legato</h2>
    <p class="lead"><strong>Legato</strong> (İtalyanca "bağlı"): notaları aralarında boşluk bırakmadan, birbirine bağlayarak söylemek. Sözlü bir ezgide bunun anlamı, sessiz harfleri olabildiğince kısa tutup sesi ünlüden ünlüye taşımaktır.</p>
    <p>Perde eğrisinde her perdesiz sessiz harf küçük bir boşluk açar. Bu boşluklar kaçınılmazdır; legatoda amaç onları sessiz harfin kendisi kadar kısa tutmak ve boşluğun öbür yanında perdenin kaldığı yerden devam etmesidir.</p>
    <p>Deneyde "Su gibi" adlı kısa ezgi iki biçimde sentezleniyor. <strong>Kesik</strong> örnekte her heceden sonra küçük bir sus var; <strong>bağlı</strong> örnekte sesler sessiz harf dışında hiç kesilmiyor. Eğrinin altındaki şerit boşlukları ve uzunluklarını milisaniye olarak gösteriyor.</p>
    <h3>Bağlı söylemek için</h3>
    <ul>
      <li>Nefesi cümle boyunca akıtın; her hecede yeniden "itmeyin".</li>
      <li>Sessizleri dudak, dil ve damakla hızlı ve hafif yapın; nefes akışını durdurmayın.</li>
      <li>Önce cümleyi yalnızca ünlülerle söyleyin ("u-i-i-a-ı-e-i-a-a"), sonra sessizleri bu akışın içine ekleyin.</li>
    </ul>
    <details class="more"><summary>Daha fazla: ölçüm nasıl yapılıyor?</summary>
      <p>Söyleme bölümünde ilk ve son perdeli kare arasındaki her perdesiz parça bir boşluk sayılır (25 milisaniyeden kısa titremeler hariç). Boşluk sayısı, ortalaması, en uzunu ve cümlede sesin perdeli olduğu sürenin payı gösterilir. Perdeli sessizler (m, n, l, r, y) boşluk açmaz. Ölçüm yaklaşıktır.</p>
    </details>
    <p class="try">"Kesik" ve "Bağlı" örnekleri dinleyip şeritteki boşlukları karşılaştırın. Sonra "Başla" (ya da Boşluk tuşu): önce ezgiyi dinleyin, sonra söyleyin. Mikrofon kapalıysa sentez ses söyler.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ezgi: "Su gibi" (bu site için yazıldı, js/data/ezgiler.js). Sentezde sessiz harfler: s, k, p, ks, s, sl, m, nd ("g" ve "b" sentezde yakın patlamalı seslerle yapıldı).</li>
    <li>Kesik örnek: her notanın sonunda 0,16 sn sus. Bağlı örnek: sus yok, perde geçişleri yumuşak.</li>
    <li>Boşluk ölçümü: Egri noktalarından (perdesiz = NaN), söyleme bölümünün ilk ve son perdeli karesi arasında.</li>
    <li>"Önce yalnızca ünlülerle söyle" alıştırması yaygın bir şan alıştırmasıdır; kaynak gösterilmedi (kontrol listesinde).</li>
  </ul></aside>
</section>

<section class="slide" data-chapter="9" data-demo="nefesYerleri" id="nefes-yerleri">
  <div class="text">
    <h2>Nefes yerleri</h2>
    <p class="lead">Nefes, ezginin noktalama işaretidir. Doğru yerde alınan nefes cümleyi anlaşılır kılar; kelimenin ortasında alınan nefes anlamı böler.</p>
    <p>Şarkıda nefes için ayrı bir zaman yoktur: nefesin süresi bir önceki notadan çalınır. Bu yüzden nefes yerlerini söylemeden önce seçmek gerekir. İyi bir nefes yeri çoğu zaman sözün virgülü ya da noktası, ezginin de bir cümlesinin sonudur.</p>
    <h3>Nefes yeri seçerken</h3>
    <ul>
      <li>Önce sözü konuşur gibi okuyun: doğal olarak durduğunuz yerler adaydır.</li>
      <li>Kelimenin ortasında nefes almayın; mecbursanız kelimeler arasında, anlamı en az bölen yerde alın.</li>
      <li>Uzun bir notadan önce nefes alın, ortasında değil.</li>
      <li>Nefes ihtiyacı arttıkça kısa "ara nefesler" ekleyin; hepsini baştan büyük bir nefesle karşılamaya çalışmayın.</li>
    </ul>
    <p>Deneyde hecelerin arasındaki boşluklara dokunarak nefes işareti (’) koyun. Site her işareti değerlendirir: <span class="c-tam">anlam sınırında</span>, <span class="c-pes">kelimeler arasında</span> ya da <span class="c-tiz">kelimenin ortasında</span>. Sentez ses ezgiyi sizin işaretlerinizle söyler; nefes için bir önceki notadan kısa bir an çalınır.</p>
    <details class="more"><summary>Daha fazla: noktalama ve ezgi</summary>
      <p>Bu ezgide sözün virgülleri ile ezginin cümle sonları aynı yere düşüyor. Her şarkıda böyle olmayabilir; ezgi ile söz ayrıldığında öğretmenler çoğu zaman sözün anlamını öne alır. Emin değilseniz iki seçeneği de söyleyip kaydedin ve dinleyin.</p>
    </details>
    <p class="try">Nefes işaretlerinizi koyun ve "Dinle"ye basın. Sonra "Anlamlı" ve "Kötü örnek" düzenlerini dinleyip karşılaştırın; farkı en çok kelimenin ortasında kesilen hecelerde duyarsınız.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ezgi ve söz: "Sabah olur" (bu site için yazıldı, js/data/ezgiler.js), dakikada 96 vuruş.</li>
    <li>Nefes, işaretin önündeki notanın sonundan 0,3 sn alınır (en az 0,25 sn nota kalır); ritim kaymaz.</li>
    <li>Değerlendirme: noktalama sonrası = anlam sınırı; kelime sınırı = kelimeler arası; hece arası = kelime ortası. Bu basit bir kural; şarkıdaki gerçek seçim ezgi, tempo ve nefes kapasitesine de bağlıdır.</li>
  </ul></aside>
</section>
`);
