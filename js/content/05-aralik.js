/* 5. Ses aralığı ve ses türleri */
L.slide(`
<section class="slide" data-chapter="5" data-demo="sesAraligi" id="ses-araligi" data-tool>
  <div class="text">
    <h2>Ses aralığı ölçer</h2>
    <p class="lead">Ses aralığınız, rahatça söyleyebildiğiniz en pes ve en tiz nota arasındaki bölgedir. Bu ölçüm bütün sitede kullanılır: alıştırmalar aralığınızın rahat bölgesine yerleştirilir.</p>
    <p>İki yol var. <strong>Siren:</strong> "u" ile rahat bir notadan başlayıp yavaşça yukarı kayın, rahat olduğunuz en tiz yerde bir an durun; sonra aşağı inin ve en pes rahat yerde yine durun. <strong>Gam:</strong> site bir nota çalar, siz aynısını söylersiniz; "Bir üst nota" ve "Bir alt nota" ile tam ses tam ses ilerlersiniz.</p>
    <p>Ölçer yalnızca yaklaşık 0,4 saniye kararlı tuttuğunuz notaları sayar: sirende hızla geçilen ya da bir anlık zorlanmayla çıkan sesler sayılmaz. Bulunan en pes nota perde eğrisinde <span class="c-pes">çivit</span>, en tiz nota <span class="c-tiz">turuncu</span> bir çizgiyle işaretlenir; klavyede de görünür. "Kaydet" ile bütün sitede hatırlanır.</p>
    <p class="health">Zorlamayın. Aradığımız, sesinizin sınırı değil rahat aralığı. Boğazınızda sıkışma, gıcık ya da ağrı hissederseniz o yönde daha fazla gitmeyin. Sesiniz kısık ya da yorgunsa ölçümü başka bir güne bırakın.</p>
    <details class="more"><summary>Daha fazla: aralık değişir; mikrofonsuz ölçüm</summary>
      <p>Aralık günden güne değişir: ısınmış bir ses genellikle daha rahat açılır, yorgun bir ses daralır. Düzenli çalışmayla rahat aralık çoğu zaman genişler. Birkaç gün ölçüp <a href="#ilerleme">İlerleme</a> slaytında karşılaştırabilirsiniz.</p>
      <p>Mikrofon yoksa aralığınızı klavyede işaretleyin: tıkladığınız nota, şeridin ona yakın ucuna taşınır ve çalar. Notayı rahatça söyleyebiliyorsanız orada bırakın. Hiç fikriniz yoksa "Sesim daha pes" ya da "Sesim daha tiz" seçin; site buna göre tahmini bir aralık kullanır.</p>
    </details>
    <p class="try">"Ölçmeye başla"ya basın ve sireni ya da gamı izleyin; bulunan uçlar eğride ve klavyede işaretlenince "Kaydet". Önce bir örnek görmek için "Örnek siren". Mikrofon yoksa klavyede tıklayarak işaretleyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ölçer: Analiz.AralikOlcer, ±50 sent içinde en az 0,4 sn kararlı tutulan notalar. Sirende uçlarda kısa bir duraklama gerekir; sürekli kayan bir sirenin uçları sayılmaz (bilerek).</li>
    <li>Kaydedilen aralık localStorage "san.aralik"ta tutulur; her ölçüm "san.aralikGecmis"e eklenir (İlerleme slaytı).</li>
    <li>Gam modu tam ses adımlarla ilerler; başlangıç notası kayıtlı ya da tahmini aralığın ortasıdır.</li>
    <li>Topluluğa: herkes aynı anda ölçmesin; aralığı gönüllü biriyle gösterin, diğerleri klavyede işaretlesin.</li>
    <li>Sağlık eşiği: ses kısıklığı 4 hafta içinde geçmezse (sesini meslek olarak kullananlarda daha erken) KBB'ye (arastirma.md bölüm 10).</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="5" data-demo="sesTurleri" id="ses-turleri">
  <div class="text">
    <h2>Ses türleri</h2>
    <p class="lead">Klasik müzikte sesler türlere ayrılır: kadın seslerinde soprano, mezzosoprano ve alto; erkek seslerinde tenor, bariton ve bas; kafa sesini (falsetto) işleyerek tiz bölgede söyleyen erkeklerde kontrtenor.</p>
    <p>Deneyde klavyenin üstünde yedi türün tipik aralığı ve sizin aralık şeridiniz var. Bir türe dokunursanız sentez ses o türün bölgesinde kısa bir ezgi söyler. Sizin aralığınıza düşen kısım fosforlu kalemle işaretlidir.</p>
    <p>Ses türü yalnızca aralıkla belirlenmez. Sesin rengi (tınısı), en rahat söylediğiniz bölge (tessitura) ve sesin bir bölgeden ötekine geçtiği yerler (passaggio) en az aralık kadar önemlidir. Aynı aralıktaki iki ses farklı türlerde olabilir; aralık da çalıştıkça değişir. Bu yüzden deney "siz şusunuz" demez, aralığınızın hangi türlerin tipik aralığıyla örtüştüğünü söyler.</p>
    <details class="more"><summary>Daha fazla: aralıklar nereden geliyor?</summary>
      <p>Tipik aralıklar yaklaşıktır: soprano Do4–Do6, mezzosoprano La3–La5, alto Fa3–Fa5, tenor Do3–Do5, bariton La2–La4, bas Mi2–Mi4. Kaynak: ses türleri üzerine genel derlemeler (ör. Wikipedia "Voice type"; uç değerler için McKinney 1994 ve Boldrey 1994). Kontrtenor aralığı kaynaklarda çelişkilidir <span class="tartismali">tartışmalı</span>; burada Sol3–Mi5 kullanıldı.</p>
      <p>Bu sınıflandırma klasik müziğe (opera ve koro) aittir. Pop, türkü ya da sanat müziğinde söyleyenler çoğu zaman tür adı yerine aralık ve ses rengiyle anlatılır. Koroda "birinci soprano, ikinci tenor" gibi bölümler de aralığın yanında okuma ve ses rengine göre belirlenir.</p>
    </details>
    <p class="try">Türlerin adlarına dokunup örnek sesleri dinleyin. Aralığınızı henüz ölçmediyseniz önce <a href="#ses-araligi">ses aralığı ölçer</a>de ölçün; şerit ve örtüşme metni kendiliğinden güncellenir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Tipik aralıklar: docs/arastirma.md bölüm 7 [İKİNCİL]: Wikipedia "Voice type"; McKinney, J. C. (1994). The Diagnosis and Correction of Vocal Faults. Genovex. Boldrey, R. (1994). Guide to Operatic Roles and Arias. Caldwell. Kontrtenor çelişkili (E3–E5 / C4–C6); burada G3–E5.</li>
    <li>Örtüşme oranı: türün tipik aralığının ne kadarının ziyaretçinin aralığında kaldığı (Aralik.ortusme).</li>
    <li>Örnek sesler kaynak–filtre sentezidir (gerçek şarkıcı değil): kadın türlerinde kadın, erkek türlerinde erkek ünlü formantları; kontrtenorda erkek formantları ve yüksek açık faz oranı (hafif, falsetto benzeri ses).</li>
    <li>Topluluğa: "Hangi türdesin?" sorusunu bir yarışa çevirmeyin; aralık ve ses rengi ayrı şeylerdir.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="5" data-demo="tessitura" id="tessitura">
  <div class="text">
    <h2>Tessitura: rahat bölge</h2>
    <p class="lead">Aralık sesinizin sınırlarını söyler; tessitura (İtalyanca "doku") ise sesinizin en rahat ve en güzel çalıştığı bölgeyi. Bir şarkının zorluğu çoğu zaman en tiz notasından çok, notalarının nerede yoğunlaştığına bağlıdır.</p>
    <p>Deneyde yaklaşık 25 saniye serbestçe söyleyin: bildiğiniz bir şarkı, bir ezgi, bir mırıldanma. Ölçer her notada ne kadar vakit geçirdiğinizi sayar ve klavyenin üstünde bir histogram (sütun grafiği) çizer. Zamanın %70'ini geçirdiğiniz en dar bölge fosforlu kalemle işaretlenir: rahat bölge tahmininiz.</p>
    <p>Rahat bölge çoğu zaman aralığın ortasında ya da biraz altındadır. Uçlardaki notalara kısa süre dokunmak sorun değildir; ama bir şarkı uzun süre aralığınızın tepesinde kalıyorsa tonunu birkaç yarım ses indirmek söylemeyi kolaylaştırır.</p>
    <details class="more"><summary>Daha fazla: mikrofonsuz örnek</summary>
      <p>Mikrofon yoksa "Örnek ezgi"yi seçin: bir ezginin notalarının histogramı, sizin aralığınızın üstüne çizilir. "Aralığınıza göre" seçeneği ezgiyi rahat bölgenize yerleştirir; "Do4'ten" seçeneği ise ezgiyi sık yazıldığı tonda gösterir. Aynı ezgi bir seste rahat ortaya, başka bir seste aralığın kenarına düşer: ton seçmenin nedeni budur.</p>
      <p>Histogram yalnızca perdesi ölçülebilen sesleri sayar; sessiz harfler ve nefes araları sayılmaz.</p>
    </details>
    <p class="try">"Söylemeye başla"ya basın ve yaklaşık 25 saniye rahatça söyleyin. Mikrofon yoksa "Örnek ezgi"yi seçin, ezgiler arasında gezinip "Örneği dinle"ye basın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Histogram: Analiz.histogram (her yarım seste geçirilen süre); rahat bölge: Analiz.tessitura, sürenin %70'ini kapsayan en dar aralık. Bu oran bir mühendislik tercihi; pedagojik bir tanım değil.</li>
    <li>Tessitura iki anlamda kullanılır: bir sesin en rahat bölgesi ve bir eserin notalarının yoğunlaştığı bölge. Deney ikisini karşılaştırır.</li>
    <li>Örnek ezgiler kamu malı (docs/arastirma.md bölüm 13).</li>
    <li>Topluluğa: herkes aynı şarkıyı farklı tonlarda mırıldansın; hangi tonun kime rahat geldiğini konuşun.</li>
  </ul></aside>
</section>
`);
