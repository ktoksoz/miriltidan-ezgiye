/* 4. Doğru perdede söylemek */
L.slide(`
<section class="slide" data-chapter="4" data-demo="perdeEsleme" id="perde-esleme" data-tool>
  <div class="text">
    <h2>Perde eşleme</h2>
    <p class="lead">Doğru perdede söylemenin ilk adımı tek bir notayı duyup aynısını söyleyebilmek. Kulağınız notayı tanır, sesiniz onu bulur; bu ikisi arasındaki bağ çalıştıkça güçlenir.</p>
    <p>Site bir nota çalar. Kulaklık takılı değilse önce dinlersiniz, sonra söylersiniz; bu sırada mikrofon referans sesi duyup onu sizin sesiniz sanmasın diye ölçüm bekler. Kulaklık takılıysa referansla birlikte söyleyebilirsiniz.</p>
    <p>Perde eğrisinde fosforlu bant hedef notadır. Sesiniz kalemle çizilir: bandın içindeyse <span class="c-tam">yeşil</span>, biraz pesse <span class="c-pes">çivit</span>, biraz tizse <span class="c-tiz">turuncu</span>. Çizginin kalınlığı sesinizin gürlüğüdür.</p>
    <h3>Notayı bulmanın yolları</h3>
    <ul>
      <li>Söylemeden önce notayı içinizden "duyun".</li>
      <li>Hafif ve rahat başlayın; gür ses perdeyi bulmayı kolaylaştırmaz.</li>
      <li>Çizgi bandın altındaysa yavaşça yukarı, üstündeyse aşağı kaydırın. Kaydırırken kulağınızla izleyin.</li>
    </ul>
    <details class="more"><summary>Daha fazla: tolerans ne demek?</summary>
      <p>Hiçbir şarkıcı notanın tam merkezinde durmaz: perde her an birkaç sent oynar. "Tek nota" seviyesinde ±50 sent (yarım sesin yarısı) içi doğru sayılır; "dar" seviyede ±20 sent. Usta şarkıcılarda da perde uzun seslerde birkaç sent oynar; amaç sıfır değil, hedefin çevresinde kalmak.</p>
      <p>Ölçümler yaklaşıktır: mikrofon, oda yankısı ve gürültü sonucu etkiler. Sonuçları bir not değil, bir pusula gibi okuyun.</p>
    </details>
    <p class="try">"Başla"ya basın (ya da Boşluk tuşu). Notayı dinleyin, "Şimdi siz" yazınca aynı notayı "aaa" diye söyleyin. Mikrofon kapalıysa bir örnek ses söyler ve eğriyi o çizer.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Notalar ziyaretçinin ses aralığının alt-orta bölgesinden seçilir (ayarlar → ses aralığı). Aralık ölçülmediyse "daha pes / daha tiz" seçimine göre tahmini aralık kullanılır.</li>
    <li>Topluluğa: önce gönüllü biriyle tek nota seviyesini gösterin. Herkes aynı anda mikrofonla denerse cihazlar birbirini duyar.</li>
    <li>Pfordresher ve Brown (2007): "kötü perde" ile söyleyenlerin çoğunun perde ayırt etme becerisi normaldir; sorun çoğu zaman duyduğunu sese çevirmededir ve alıştırmayla gelişir.</li>
    <li>Perde algılama: YIN (de Cheveigné ve Kawahara 2002), insan sesi için ayarlı; ölçüm yaklaşık 40–50 ms gecikmeyle çizilir.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="4" data-demo="detone" id="detone">
  <div class="text">
    <h2>"Detone" ne demek?</h2>
    <p class="lead">Detone, notayı doğru perdeden biraz pes ya da biraz tiz söylemek demek. Çoğu insan "kulağım yok" diye düşünür; oysa perde farkını gerçekten duyamayan insan çok azdır.</p>
    <p>Doğuştan perde algısı sorunu (konjenital amüzi) 20.000 kişilik bir çalışmada nüfusun yaklaşık <span class="num">%1,5</span>'inde bulundu (Peretz ve Vuvan 2017). Sık aktarılan <span class="num">%4</span> tahmini 1980'den kalma, tek bir teste dayanan eski bir tahmindir (Kalmus ve Fry 1980).</p>
    <p>Detone söyleyenlerin çoğunun kulağı iyi duyar. Pfordresher ve Brown (2007), perdeyi tutturamayan kişilerin iki notayı ayırt etmede iyi söyleyenler kadar başarılı olduğunu gördü: sorun çoğu zaman duymakta değil, duyduğunu sese çevirmekte. Bu bağ da alıştırmayla güçlenir.</p>
    <h3>Kulak testi</h3>
    <p>Deneyde bir ses iki nota çalar. İkincisi birincisinden biraz pes ya da biraz tiz. Siz yalnızca yönü seçersiniz. İki kez art arda doğru bildikçe fark küçülür, yanıldıkça büyür. Birkaç dönüşten sonra test durur ve ayırt edebildiğiniz en küçük fark, yani eşiğiniz, sent olarak çıkar. Grafikte her yanıtınız bir nokta olarak görünür.</p>
    <details class="more"><summary>Daha fazla: sent, eşik ve bu testin sınırları</summary>
      <p>Bir yarım ses 100 sent. Perde eşlemedeki "Tek nota" seviyesi ±50 sent, "Dar" seviyesi ±20 sent tolerans kullanır. Eşiğiniz bu sayıların altındaysa kulağınız hedefi bulmaya yetecek kadar keskin demektir; geriye sesi o hedefe götürmeyi çalışmak kalır.</p>
      <p>Yöntem psikoakustikte yaygın bir "merdiven"dir: iki doğru yanıtta fark küçülür, bir yanlışta büyür. Bu kural yaklaşık %71 doğru yanıt düzeyine oturur (Levitt 1971).</p>
      <p>Bu kısa test bir tanı değildir: amüzi tanısı için kapsamlı test bataryaları kullanılır. Kulaklık ve sessiz bir oda sonucu iyileştirir; yorgunluk ve dalgınlık kötüleştirir. Sonucu bir not gibi değil, bir merak noktası gibi okuyun.</p>
    </details>
    <p class="try">"Başla"ya basın, iki notayı dinleyin ve ikinci nota birinciye göre "Pes" mi "Tiz" mi, seçin. Emin değilseniz "Tekrar dinle". Ses rengini değiştirip (sentez ses, piyano, sinüs) eşiğinizin değişip değişmediğine bakın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Merdiven: 2 doğru → fark ÷1,6 (iki dönüşten sonra ÷1,3), 1 yanlış → fark ×1,6 (sonra ×1,3); başlangıç 50 sent, 2–200 sent arası. 8 dönüşte ya da 40 denemede durur; eşik son 6 dönüşün geometrik ortalaması. Levitt, H. (1971). Transformed up-down methods in psychoacoustics. JASA 49(2B), 467–477.</li>
    <li>Peretz, I., Vuvan, D. T. (2017). Prevalence of congenital amusia. Eur J Hum Genet 25(5), 625–630: yaygınlık ~%1,5. Kalmus, H., Fry, D. B. (1980). On tune deafness (dysmelodia). Ann Hum Genet 43(4), 369–382: eski %4 tahmini.</li>
    <li>Pfordresher, P. Q., Brown, S. (2007). Poor-pitch singing in the absence of "tone deafness". Music Perception 25(2), 95–115: katılımcıların %10–15'i kötü perde şarkıcısı; ayırt etme becerileri normal, sorun algı–ses eşlemesinde.</li>
    <li>Notalar ziyaretçinin aralığının ortasından seçilir; iki nota ayrı ayrı sentezlenir (aralarında kayma ipucu olmasın).</li>
    <li>Topluluğa: herkes kağıda "pes" ya da "tiz" yazsın, sonra el kaldırarak sayın. Fark 10 sentin altına inince çoğu kişi zorlanır; bu normaldir.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="4" data-demo="araliklar" id="araliklar" data-tool>
  <div class="text">
    <h2>Aralıklar ve gam</h2>
    <p class="lead">İki nota arasındaki perde uzaklığına aralık denir. Ezgiler aralıklardan yapılır: aralıkları doğru söyleyen, ezgiyi de doğru söyler.</p>
    <p>Aralıklar yarım sesle ölçülür: büyük ikili 2, büyük üçlü 4, tam beşli 7, oktav 12 yarım ses. Do-re-mi diye bildiğimiz majör gam, büyük ve küçük ikililerden yapılmış bir merdivendir: do–re ve re–mi büyük ikili, mi–fa küçük ikili.</p>
    <p>Deneyde site önce aralığı çalar, sonra siz söylersiniz. Perde eğrisinde iki fosforlu basamak görürsünüz; sesiniz basamaktan basamağa atlar. Sonuçta her notanın isabetinin yanında, aralığı ne kadar geniş ya da dar söylediğiniz de yazar.</p>
    <h3>İpuçları</h3>
    <ul>
      <li>İlk notayı iyice oturtun, ikinciye ondan atlayın.</li>
      <li>Büyük aralıklarda (beşli, altılı, oktav) ikinci notayı söylemeden önce içinizden duyun.</li>
      <li>Gamda notaları birbirine bağlayın; hece adı yeterli: "do, re, mi…". Mi–fa ve si–do arasındaki adımın küçük olduğunu hatırlayın.</li>
    </ul>
    <details class="more"><summary>Daha fazla: aralığı dar söylemek</summary>
      <p>Perdeyi tutturmakta zorlananlar çoğu zaman aralıkları sıkıştırır: büyük sıçramaları olduğundan küçük söyler (Pfordresher ve Brown 2007). Sonuçtaki "aralık" ölçümü bunu gösterir: eksi değer dar, artı değer geniş demek.</p>
      <p>Aralıkların adlarını, seslerini ve majör gamın yapısını müzik eğitiminde ayrıntılı bulabilirsiniz: <a href="https://egitim.koraytoksoz.com/muzik/#araliklar" target="_blank" rel="noopener">aralıklar</a> ve <a href="https://egitim.koraytoksoz.com/muzik/#major-gam" target="_blank" rel="noopener">majör gam</a>.</p>
    </details>
    <p class="try">Bir aralık seçip "Başla"ya basın (ya da Boşluk). Dinleyin, "Şimdi siz" yazınca söyleyin. "Gam"a geçince do'dan do'ya majör gamı çıkıp inersiniz. Mikrofon kapalıysa örnek bir ses söyler.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Aralık modu: her başlatmada 3 deneme; ilk nota 1,3 sn, ikinci nota 1,5 sn; tolerans ±35 sent. Başlangıç notası ziyaretçinin aralığına göre perdelenir (uçlardan en az bir yarım ses uzak) ve denemeden denemeye ±2 yarım ses kayar.</li>
    <li>"Aralık" ölçümü: iki notanın ortalama sapmalarının farkı (sent); artı = geniş, eksi = dar söylenmiş.</li>
    <li>Gam modu: çıkış ve iniş iki ayrı cümle, nota başına 0,62 sn.</li>
    <li>Pfordresher ve Brown (2007): kötü perde şarkıcılarında aralık sıkıştırması (compression) görüldü.</li>
    <li>Topluluğa: önce hep birlikte "do–sol" (tam beşli) söyleyin; sonra gönüllüler mikrofonla.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="4" data-demo="ezgi" id="ezgi" data-tool>
  <div class="text">
    <h2>Ezgi söyleme</h2>
    <p class="lead">Notalar ve aralıklar bir araya gelince ezgi olur. Bir ezgiyi cümle cümle dinleyip söylemek, sonra baştan sona kaydedip kendinizi dinlemek, doğru perdede söylemenin en doğal alıştırmasıdır.</p>
    <p>Ezgiler kamu malı: Neşeye Övgü (Beethoven, 1824), Frère Jacques (Fransız halk ezgisi) ve Ah! vous dirai-je, maman (1761'de basılmış Fransız ezgisi). Yanlarında bu site için yazılmış kısa egzersizler var.</p>
    <p>Ton, ses aralığınıza göre önerilir: ezgi aralığınızın rahat bölgesine yerleşir. Ton kaydırıcısıyla yarım ses yarım ses kaydırabilir, tempoyu yavaşlatabilirsiniz. Yavaş ve doğru söylemek, hızlı ve yaklaşık söylemekten iyidir.</p>
    <h3>İki yol</h3>
    <ul>
      <li><strong>Başla:</strong> ezgi cümlelere bölünür; her cümleyi önce dinler, sonra söylersiniz.</li>
      <li><strong>Kaydet:</strong> dört vuruşluk sayımdan sonra ezgiyi baştan sona söylersiniz; sesiniz ve perde eğriniz kaydedilir. İki denemeyi eğride üst üste koyup karşılaştırabilirsiniz.</li>
    </ul>
    <details class="more"><summary>Daha fazla: kayıt ve kulaklık</summary>
      <p>Kulaklık takılıysa kayıt sırasında referans ezgi de çalar. Kulaklıksız yalnız sayım çalar; ezgiyi fosforlu bantlardan ve imleçten izlersiniz. Böylece mikrofon hoparlörü duyup onu sizin sesiniz sanmaz.</p>
      <p>Kayıt yalnızca bu sekmede durur. Kalıcı olarak yalnızca perde eğrisi ve puan saklanır; bir hafta sonra aynı ezgiyi söyleyip eğrileri karşılaştırabilirsiniz (<a href="#kaydet">Kendini kaydet</a>).</p>
    </details>
    <p class="try">Bir ezgi seçin ve "Başla"ya basın (ya da Boşluk). Hazır olunca "Kaydet" ile baştan sona söyleyin. Mikrofon kapalıysa "Örneği dinle" ile sentez sesin söyleyişini eğride görün.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Cümleler: en az 4 vuruşluk bölümler, 2 vuruş ve daha uzun bir notayla biter. Tolerans ±35 sent.</li>
    <li>Ton önerisi: Aralik.perdele (aralığın alt-orta bölgesi, uçlardan en az bir yarım ses uzak). Ezginin genişliği aralıktan büyükse ortalanır.</li>
    <li>Kalıcı kayıtlar "ezgi:&lt;kimlik&gt;" etiketiyle yalnızca perde verisi ve puan olarak saklanır (ses saklanmaz).</li>
    <li>Kamu malı durumu: docs/arastirma.md bölüm 13. "Sabah olur", "Su gibi" ve "Basamaklar" bu site için yazıldı.</li>
    <li>Topluluğa: ezgiyi önce birlikte söyleyin, sonra bir gönüllünün kaydını herkesle dinleyin (izin alarak).</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="4" data-demo="kulakOyunu" id="kulak-oyunu" data-tool>
  <div class="text">
    <h2>Kulak oyunu</h2>
    <p class="lead">Kulak, çalıştıkça incelir. Bu oyun iki beceriyi çalıştırır: aralıkları tanımak ve duyduğunuz notayı bulup söylemek.</p>
    <p><strong>Aralığı bul:</strong> site iki nota çalar, siz aralığın adını seçersiniz. Mikrofon gerekmez. Yanıttan sonra iki nota klavyede işaretlenir: aralığın "boyunu" görürsünüz.</p>
    <p><strong>Duyduğunu söyle:</strong> site bir nota çalar, siz aynı notayı söylersiniz; mikrofon perdenizi ölçer, sonra hedef eğride görünür. Mikrofon kapalıysa notayı mini klavyede bulursunuz.</p>
    <p>Art arda doğru yanıtlar serinizi oluşturur. Her iki moddaki en iyi seriniz bu tarayıcıda saklanır.</p>
    <h3>Aralıkları tanımak için</h3>
    <ul>
      <li>Majör gamdan yararlanın: büyük üçlü do–mi, tam dörtlü do–fa, tam beşli do–sol, oktav do–do.</li>
      <li>Küçük üçlü daha "hüzünlü", büyük üçlü daha "parlak" duyulur; bu bir ipucudur, kural değil.</li>
      <li>Emin değilseniz notaları içinizden gam basamaklarıyla sayın.</li>
    </ul>
    <details class="more"><summary>Daha fazla: oktav farkı</summary>
      <p>Birçok erkek, kadın sesiyle çalınan bir notayı bir oktav pes söyler; bu doğaldır. "Duyduğunu söyle" bir oktav farkı da doğru sayar ve bunu ayrıca belirtir. Klavyede de aynı adlı nota (ör. herhangi bir Sol) doğru sayılır.</p>
    </details>
    <p class="try">"Aralığı bul"da "Başla"ya basın, dinleyin ve bir seçenek seçin. "Duyduğunu söyle"de mikrofonu açıp notayı "aaa" diye söyleyin ya da klavyede bulun.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Seviyeler (aralığı bul): Kolay = büyük üçlü, tam beşli, oktav (yalnız çıkıcı); Orta = büyük ikili, küçük ve büyük üçlü, tam dörtlü, tam beşli, oktav (çıkıcı ve inici); Zor = küçük ikiliden oktava bütün aralıklar.</li>
    <li>Duyduğunu söyle: nota 1,2 sn çalar, ardından 2,5 sn dinlenir; sesli karelerin ortancası hedeften ±50 sent içindeyse (oktav farkı katlanarak) doğru sayılır. Sonuç Alistirma.dogrulukKaydet("kulak-soyle", oran) ile ilerleme grafiğine yazılır.</li>
    <li>En iyi seriler localStorage "san.kulakOyunu" = {enIyi: {aralik, soyle}}.</li>
    <li>Topluluğa: "aralığı bul"u hep birlikte oynayın; herkes parmaklarıyla yarım ses sayısını göstersin.</li>
  </ul></aside>
</section>
`);
