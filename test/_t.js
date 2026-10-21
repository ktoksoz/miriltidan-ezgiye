/* Küçük test yardımcısı: eq(ad, gerçek, beklenen, tolerans) */
let gecti = 0, kaldi = 0;
function eq(ad, got, exp, tol) {
  let ok;
  if (typeof exp === "number" && tol != null) ok = Math.abs(got - exp) <= tol;
  else ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) gecti++; else kaldi++;
  console.log(`${ok ? "✓" : "✗"} ${ad}${ok ? "" : `  →  bulunan ${JSON.stringify(got)}, beklenen ${JSON.stringify(exp)}${tol != null ? " ±" + tol : ""}`}`);
}
const ok = (ad, kosul, ek = "") => eq(ad + (ek && !kosul ? " (" + ek + ")" : ""), !!kosul, true);
process.on("exit", () => { console.log(`\n${gecti} geçti, ${kaldi} kaldı`); if (kaldi) process.exitCode = 1; });
module.exports = { eq, ok };
