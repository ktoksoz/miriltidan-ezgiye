/* Bütün birim testleri: node test/hepsi.js */
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
let hata = 0;
for (const f of fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js"))) {
  console.log(`\n=== ${f}`);
  try { process.stdout.write(execFileSync("node", [path.join(__dirname, f)]).toString().split("\n").filter((l) => !l.startsWith("✓")).join("\n")); }
  catch (e) { hata++; process.stdout.write(e.stdout.toString()); }
}
console.log(hata ? `\n${hata} test dosyasında hata var` : "\nBütün testler geçti");
process.exitCode = hata ? 1 : 0;
