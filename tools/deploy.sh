#!/bin/sh
# DreamHost'a yükle. Kullanım: tools/deploy.sh [KULLANICI@SUNUCU]   (varsayılan: koray@koraytoksoz.com)
# CSS/JS sürüm etiketini (?v=...) tarih-saatle yeniler, sonra yalnızca değişen dosyaları gönderir.
# Geliştirme dosyaları (tools/, test/, belgeler) gönderilmez; --delete kullanılmaz.
set -e
HOST=${1:-koray@koraytoksoz.com}
DEST="egitim.koraytoksoz.com/san"
cd "$(dirname "$0")/.."
# ana klasör yoksa dur: onu biz oluşturmayız
ssh "$HOST" "test -d ~/egitim.koraytoksoz.com" || { echo "Sunucuda ~/egitim.koraytoksoz.com yok; durdum." >&2; exit 1; }
ssh "$HOST" "mkdir -p ~/$DEST"
V=$(date +%Y%m%d%H%M)
sed -i '' -E "s/\?v=[0-9]+\"/?v=$V\"/g" index.html
echo "Sürüm etiketi: $V"
rsync -avz \
  --exclude tools --exclude test --exclude README.md --exclude PLAN.md --exclude DEV.md --exclude docs \
  --exclude .DS_Store --exclude .git --exclude .gitignore --exclude node_modules --exclude .claude \
  ./ "$HOST:~/$DEST/"
echo "Yüklendi: https://egitim.koraytoksoz.com/san/"
