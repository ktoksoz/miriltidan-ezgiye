/* docs/kontrol/*.md → docs/kontrol-listesi.md (şan eğitmeninin gözden geçireceği tek liste).
   Kullanım: node tools/kontrol_birlestir.js */
const fs = require("fs"), path = require("path");
const dir = path.resolve(__dirname, "../docs/kontrol");
const parts = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
let out = `# Şan eğitmeni için kontrol listesi

Bu listede sitede anlatılan ama emin olamadığımız pedagojik bilgiler, alıştırmalar ve sayılar var. Her madde hangi slayta ait olduğunu söyler (\`#slayt-id\` → https://egitim.koraytoksoz.com/san/#slayt-id).
Lütfen her maddeye "doğru", "düzeltilmeli: …" ya da "çıkarılmalı" diye not düşün.

Genel:
- Ölçümler (perde, vibrato, aralık, "sss" süresi) mikrofon ve odaya bağlı, yaklaşıktır. Sonuç dili cesaretlendirici olacak biçimde yazıldı; ton uygun mu?
- Ses aralığı ölçer yalnızca 0,4 sn rahat tutulan notaları sayıyor ve ziyaretçiyi zorlamaması için uyarıyor. Bu yaklaşım yeterli mi?
- Alıştırmalar ziyaretçinin ölçülen aralığının alt-orta bölgesine perdeleniyor (uçlardan en az bir yarım ses uzak). Uygun mu?

`;
for (const f of parts) out += "\n" + fs.readFileSync(path.join(dir, f), "utf8").trim() + "\n";
fs.writeFileSync(path.resolve(__dirname, "../docs/kontrol-listesi.md"), out);
console.log("docs/kontrol-listesi.md yazıldı (" + parts.length + " bölüm)");
