/* tools/narration-parts/*.json → tools/narration.json (slayt sırasıyla) ve karakter/süre raporu.
   Slayt sırası index.html'deki içerik dosyalarından okunur. Kullanım: node tools/narration_merge.js */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const order = [];
fs.readdirSync(path.join(ROOT, "js/content")).sort().forEach((f) => {
  const src = fs.readFileSync(path.join(ROOT, "js/content", f), "utf8");
  for (const m of src.matchAll(/<section[^>]*\sid="([^"]+)"/g)) order.push(m[1]);
});
const parts = {};
fs.readdirSync(path.join(__dirname, "narration-parts")).filter((f) => f.endsWith(".json")).forEach((f) => Object.assign(parts, JSON.parse(fs.readFileSync(path.join(__dirname, "narration-parts", f), "utf8"))));
const out = {}, missing = [];
let chars = 0;
order.forEach((id) => { if (parts[id]) { out[id] = parts[id]; chars += parts[id].length; } else missing.push(id); });
fs.writeFileSync(path.join(__dirname, "narration.json"), JSON.stringify(out, null, 2) + "\n");
const words = Object.values(out).reduce((a, t) => a + t.split(/\s+/).length, 0);
console.log(`${Object.keys(out).length}/${order.length} slayt, ${chars} karakter, ~${words} kelime (~${Math.round(words / 2.4 / 60)} dk)`);
Object.entries(out).forEach(([id, t]) => { const w = t.split(/\s+/).length; if (w < 45 || w > 105) console.log(`  uzunluk dışı: ${id} (${w} kelime)`); });
if (missing.length) console.log("eksik:", missing.join(", "));
