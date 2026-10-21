/* 11. Pratik: günlük çalışma planı, kendini kaydet, ilerleme, kapanış */
L.slide(`
<section class="slide" data-chapter="11" data-demo="gunlukPlan" id="gunluk-plan" data-tool>
  <div class="text">
    <h2>Günlük çalışma</h2>
    <p class="lead">Ses bir kas işidir ama yalnızca kas işi değildir: kulak, nefes ve alışkanlık birlikte gelişir. Her gün kısa çalışmak, haftada bir uzun çalışmaktan daha çok işe yarar.</p>
    <p>Deneyde üç hazır plan var: 10, 20 ve 40 dakika. Hepsi aynı sırayı izler:</p>
    <ol>
      <li><b>Isınma</b>: dudak titretme, mırıldanma, sirenler; sesi hafifçe uyandırın (<a href="#isinma">ısınma rutini</a>).</li>
      <li><b>Nefes</b>: uzun "sss" ve destekli uzun ses (<a href="#sss">sss</a>, <a href="#uzun-ses">uzun ses</a>).</li>
      <li><b>Perde</b>: tek notalar, aralıklar, kulak oyunu (<a href="#perde-esleme">perde eşleme</a>).</li>
      <li><b>Şarkı</b>: bir ezgi ya da sevdiğiniz bir şarkı; kaydedip dinleyin (<a href="#ezgi">ezgi</a>, <a href="#kaydet">kendini kaydet</a>).</li>
      <li><b>Soğuma</b>: birkaç hafif, aşağı doğru mırıltı ve dudak titretme; sesi gün boyu konuşmaya hazır bırakın.</li>
    </ol>
    <p>Zamanlayıcı her adımı sayar; adımın yanındaki düğme sizi ilgili slayta götürür. Başka slayta geçseniz de zamanlayıcı saymaya devam eder, adım değişince kısa bir bildirim çıkar. Geri dönünce kaldığınız yeri görürsünüz.</p>
    <details class="more"><summary>Daha fazla: ne kadar, ne sıklıkla?</summary>
      <p>Yeni başlayanlar için günde 15–20 dakika iyi bir başlangıçtır; ses yoruluyorsa daha kısa tutun. Uzun bir günü (çok konuşma, bağırma) ardından ses dinlenmeye ihtiyaç duyar. Soğumanın etkisi üzerine güçlü bir bilimsel kanıt yok; çoğu öğretmen alışkanlık olarak önerir.</p>
      <p>Bir öğretmenle çalışıyorsanız onun verdiği alıştırmaları bu planın "şarkı" adımına koyun.</p>
    </details>
    <p class="health">Ağrı, yanma ya da ses kısıklığı olursa o günün çalışmasını bırakın. Ses kısıklığı 4 haftadan uzun sürerse (sesini meslek olarak kullananlar için daha erken) bir kulak burun boğaz uzmanına görünün.</p>
    <p class="try">Bir plan seçip "Başlat"a basın (Boşluk). Adımın yanındaki "Slayta git" sizi o alıştırmaya götürür; işiniz bitince bu slayta dönün ya da "Sonraki adım"a basın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Planlar bu site için yazıldı; süreler öneridir. Isınmanın etkisi için Titze 2006 (SOVT) ve 3. bölümdeki dürüst özet; soğuma için kanıt zayıf (docs/kontrol/11.md).</li>
    <li>KBB eşiği: AAO-HNS 2018 ses kısıklığı kılavuzu (Stachler ve ark. 2018): 4 hafta içinde düzelmeyen disfoni.</li>
    <li>Tamamlanan planlar bu tarayıcıda "pratik" kaydına yazılır ve İlerleme slaytında görünür.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="11" data-demo="kaydet" id="kaydet" data-tool>
  <div class="text">
    <h2>Kendini kaydet</h2>
    <p class="lead">Söylerken kendi sesinizi dışarıdan duyamazsınız: kafatasınızdan gelen titreşimler sesi olduğundan daha pes ve dolgun duyurur. Kayıt, sesinizi başkalarının duyduğu gibi duymanın en kolay yolu.</p>
    <p>Bir ezgi seçin, önce dinleyin, sonra kaydedin. Kayıt bitince sesinizi dinleyebilir, perde eğrinizi hedeflerin üstünde görebilirsiniz. Aynı ezgiyi bir hafta sonra yeniden kaydedin: eski eğri soluk grafit bir çizgi olarak yenisinin altına konur ve farkı görürsünüz.</p>
    <h3>Ne saklanır?</h3>
    <p><b>Ses kaydı yalnızca bu sekmede, cihazınızın belleğinde durur.</b> Hiçbir yere gönderilmez; sayfayı kapatınca silinir. İsterseniz "İndir" ile kendi cihazınıza kaydedebilirsiniz. Kalıcı olarak, yalnızca bu tarayıcıda, perde eğrisi ve ölçümler saklanır; ses saklanmaz.</p>
    <h3>Dinlerken neye dikkat edin?</h3>
    <ul>
      <li>Notaların başı: sese yukarıdan ya da aşağıdan mı "kayarak" giriyorsunuz?</li>
      <li>Uzun notalar: perde düz mü, sona doğru düşüyor mu?</li>
      <li>Sözler ve nefes yerleri: cümleler kopuyor mu?</li>
    </ul>
    <details class="more"><summary>Daha fazla: kendi sesimi neden sevmiyorum?</summary>
      <p>Kendi kaydını ilk duyan çoğu kişi şaşırır. Konuşurken sesinizi hem havadan hem kemik yoluyla duyarsınız; kemik yolu pes frekansları güçlendirir. Kayıtta yalnızca hava yolu kalır. Alışmak birkaç kayıt sürer; ölçüt "sevmek" değil, neyi değiştirmek istediğinizi duymaktır.</p>
    </details>
    <p class="try">Ezgiyi seçip "Dinle"ye basın. Sonra "Kaydet"e basın (Boşluk): başlangıç notasını duyup söyleyin. Kayıt bitince "Dinle", "Üst üste koy" ve "İndir" düğmeleri çıkar; önceki günlerin eğrileri "Önceki kayıtlar" altında.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Kayıt MediaRecorder ile yapılır; blob yalnızca bellekte (URL.createObjectURL), sekme kapanınca gider. localStorage'a ("san.kayitlar") yalnızca sıkıştırılmış perde dizisi, hedefler ve ölçümler yazılır.</li>
    <li>Ezgiler kamu malı (Neşeye Övgü, Frère Jacques, Ah vous dirai-je maman) ya da bu site için yazılmış egzersizler (docs/arastirma.md bölüm 13).</li>
    <li>Kulaklık takılıysa ezgi kayıt boyunca hafifçe çalar; takılı değilse yalnızca başlangıç notası çalar, kayıt sessiz bir eşlikle yapılır.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="11" data-demo="ilerleme" id="ilerleme">
  <div class="text">
    <h2>İlerleme</h2>
    <p class="lead">Ses yavaş değişir: bir gün kötü, ertesi gün iyi gelir. Tek bir ölçüme değil, haftalar boyunca çizilen eğilime bakın.</p>
    <p>Deneyde, bu tarayıcıda yaptığınız ölçümler tarihleriyle görünür: ses aralığınız, en uzun "sss" süreniz, uzun seste perde sapması, perde eşleme doğruluğu, vibratonuz, geçiş bölgesindeki kırılmalar, ısınma ve çalışma süreleri, kulak oyunu skorları ve kayıtlarınız. Henüz bir ölçüm yapmadıysanız her bölümün yanında o ölçümün yapıldığı slayta giden bir bağlantı var.</p>
    <h3>Nasıl okunur?</h3>
    <ul>
      <li>Noktalar tek tek ölçümler; çizgi günlük ortalama.</li>
      <li>Perde sapması gibi "küçük olsun" istenen ölçülerde aşağı inen çizgi iyidir.</li>
      <li>Ölçümler mikrofona, odaya ve o günkü sesinize bağlıdır; birkaç günlük dalgalanma olağan.</li>
    </ul>
    <h3>Verileriniz</h3>
    <p>Bütün bu veriler yalnızca bu tarayıcıda (localStorage) durur; hiçbir sunucuya gönderilmez. Başka bir cihazda ya da gizli pencerede görünmez. "Verilerimi sil" hepsini kalıcı olarak siler.</p>
    <details class="more"><summary>Daha fazla: neyi ölçmüyoruz?</summary>
      <p>Tını, duygu, söz ve müzikalite bu grafiklerde yok; bunlar kulakla, kayıtla ve bir öğretmenle değerlendirilir. Grafikler yalnızca sesin ölçülebilen birkaç yanını gösterir.</p>
    </details>
    <p class="try">Grafiklere göz atın; boş bölümlerdeki bağlantıyla ölçümü yapıp geri dönün. Verileri silmek isterseniz "Verilerimi sil"e basın; silmeden önce onay istenir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Okunan kayıtlar (L.store, "san." önekli): aralikGecmis, sss, uzunSes, dogruluk, vibrato, kirilma (az ve küçük kırılma iyi), kulakOyunu, isinma, kayitlar ve bu bölümün pratik kaydı.</li>
    <li>Silme: bu anahtarlar ve kayıtlı ses aralığı (aralik) silinir; tercihler (nota adları, referans sesi, kulaklık) korunur.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="11" data-demo="kapanis" id="kapanis">
  <div class="text">
    <h2>Kapanış</h2>
    <p class="lead">Mırıltıdan ezgiye geldiniz: sesin nasıl çıktığını, nefesi, ısınmayı, doğru perdede söylemeyi, sesinizin sınırlarını ve tarzlarını gördünüz. Gerisi her gün biraz söylemek.</p>
    <p>Deneyde sizin ses aralığınız ve bu tarayıcıdaki çalışmalarınızın özeti var. Buraya istediğiniz zaman dönebilirsiniz: <a href="#gunluk-plan">günlük çalışma</a>, <a href="#isinma">ısınma rutini</a> ve <a href="#perde-esleme">perde eşleme</a> her gün kullanmak için yapıldı.</p>
    <p><b>Bu site bir şan eğitmeninin yerini tutmaz.</b> Sesinizi tanımak ve her gün çalışmak için bir araçtır. Bir öğretmen sizi dinler, görür ve size özel alıştırmalar verir; ölçümlerin göremediğini duyar.</p>
    <h3>Diğer eğitimler</h3>
    <ul>
      <li><a href="https://egitim.koraytoksoz.com/muzik/" target="_blank" rel="noopener">Titreşimden Şarkıya</a>: ses, aralıklar, gamlar, akorlar ve Türk müziği kuramı.</li>
      <li><a href="https://egitim.koraytoksoz.com/klarnet/" target="_blank" rel="noopener">Nefesten Taksime</a>: klarnet, koma perdeleri, makamlar ve usuller.</li>
      <li><a href="https://egitim.koraytoksoz.com/gitar/" target="_blank" rel="noopener">Telden Şarkıya</a>: gitar.</li>
    </ul>
    <p class="license">Türkçe ünlülerin formant verileri: Malkoç 2009, <i>Dil Dergisi</i> 146. Yazı tipleri: Anybody, Atkinson Hyperlegible Next ve Atkinson Hyperlegible Mono (SIL Open Font License 1.1). Bütün kaynaklar sunucu notlarında ve slaytların notlarında.</p>
    <div class="cover-meta">
      <a class="all-link" href="https://egitim.koraytoksoz.com/">← Bütün eğitimler</a>
      <a class="gh-link" href="https://github.com/ktoksoz/miriltidan-ezgiye" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg><span>Kaynak kodu GitHub'da</span></a>
      <a class="lic" href="https://creativecommons.org/licenses/by/4.0/deed.tr" target="_blank" rel="license noopener" title="İçerik: Creative Commons Atıf 4.0">
        <img src="img/cc-cc.svg" alt="Creative Commons" width="18" height="18"><img src="img/cc-by.svg" alt="Atıf" width="18" height="18">
        <span>İçerik CC BY 4.0 · Kod MIT</span>
      </a>
    </div>
    <p class="license cover-meta">© 2026 Koray Toksöz</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Kapanış özeti bu tarayıcıdaki kayıtlardan hesaplanır (İlerleme slaytıyla aynı veriler).</li>
    <li>Topluluğa: bir hafta sonra aynı ezgiyi kaydedip karşılaştırmayı önerin; ilerlemeyi görmek çalışmayı sürdürmenin en iyi nedeni.</li>
    <li>Türkçe ünlü formantları: Malkoç, E. (2009), Dil Dergisi 146. Şarkıcı formantı: Sundberg 1974, 2001. Yazı tipleri SIL OFL 1.1.</li>
    <li>Bu site bir şan eğitmeninin yerini tutmaz; ses kısıklığı ya da ağrıda KBB uzmanına başvurun.</li>
  </ul></aside>
</section>
`);
