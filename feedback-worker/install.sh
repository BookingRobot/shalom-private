#!/usr/bin/env bash
# «Ваши пожелания» → GitHub issues: installs the intake on your own server.
#   Ubuntu/Debian, nginx or Apache in front (HTTPS). Can be run again at any time.
#   sudo bash install.sh
set -euo pipefail

REPO=BookingRobot-M/br-shalom
APP=/opt/br-shalom-feedback
ENVF=/etc/br-shalom-feedback.env
SVC=br-shalom-feedback
PORT=${PORT:-8787}
DOMAIN=${DOMAIN:-coding.ateisiu.lt}
URLPATH=/br-shalom-feedback
ORIGINS=https://shalom.bookingrobot.eu,http://localhost:5173,http://localhost:4173

ok() { echo "  ✔ $*"; }
die() { echo "  ✘ $*" >&2; exit 1; }
step() { echo; echo "── $*"; }

[ "$(id -u)" = 0 ] || die "Paleiskite su sudo:  sudo bash install.sh"

step "1/6 GitHub tokenas"
if [ -z "${GITHUB_TOKEN:-}" ] && [ -f "$ENVF" ]; then
  GITHUB_TOKEN=$(sed -n 's/^GITHUB_TOKEN=//p' "$ENVF")
  [ -n "$GITHUB_TOKEN" ] && ok "naudoju jau įrašytą tokeną ($ENVF)"
fi
if [ -z "${GITHUB_TOKEN:-}" ]; then
  read -rsp "  Įklijuokite tokeną (github_pat_…) ir spauskite Enter: " GITHUB_TOKEN </dev/tty
  echo
fi
GITHUB_TOKEN=$(printf '%s' "$GITHUB_TOKEN" | tr -d '[:space:]')
[ -n "$GITHUB_TOKEN" ] || die "tokenas tuščias"

step "2/6 Node.js"
node_ok() { command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ]; }
if ! node_ok; then
  command -v apt-get >/dev/null 2>&1 || die "reikia Node.js 20 ar naujesnio — įdiekite ir paleiskite skriptą dar kartą"
  echo "  diegiu Node.js 22…"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y nodejs >/dev/null
fi
node_ok || die "Node.js per senas: $(node -v 2>/dev/null || echo nėra)"
NODE=$(command -v node)
ok "Node.js $(node -v)"

step "3/6 Programos failai iš GitHub"
mkdir -p "$APP"
for f in worker.js server.mjs; do
  curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github.raw" \
    "https://api.github.com/repos/$REPO/contents/feedback-worker/$f?ref=main" -o "$APP/$f.new" ||
    die "nepavyko parsisiųsti $f — tokenas turi matyti br-shalom (Contents: Read and write)"
  mv "$APP/$f.new" "$APP/$f"
done
echo '{ "type": "module", "private": true }' >"$APP/package.json"
ok "$APP"

step "4/6 Nustatymai ir patikra"
umask 077
cat >"$ENVF" <<EOF
GITHUB_TOKEN=$GITHUB_TOKEN
REPO=$REPO
FILES_BRANCH=feedback-files
ALLOWED_ORIGINS=$ORIGINS
PORT=$PORT
HOST=127.0.0.1
EOF
chmod 600 "$ENVF"
umask 022
ok "$ENVF (matomas tik root)"
(set -a && . "$ENVF" && "$NODE" "$APP/server.mjs" --check) || die "tokenui trūksta teisių — žr. aukščiau ✘"

step "5/6 Paslauga (paleidžiama ir po serverio perkrovimo)"
id -u brfeedback >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin brfeedback
cat >/etc/systemd/system/$SVC.service <<EOF
[Unit]
Description=br-shalom: «Ваши пожелания» → GitHub issues
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=$ENVF
ExecStart=$NODE $APP/server.mjs
User=brfeedback
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable "$SVC" >/dev/null 2>&1
systemctl restart "$SVC"
for _ in 1 2 3 4 5 6 7 8 9 10; do
  curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null 2>&1 || die "paslauga nepasileido:  journalctl -u $SVC -n 30"
ok "veikia: 127.0.0.1:$PORT"

step "6/6 Adresas https://$DOMAIN$URLPATH"
WEB=""
if command -v nginx >/dev/null 2>&1 && systemctl is-active --quiet nginx; then WEB=nginx; fi
if [ -z "$WEB" ] && command -v apache2ctl >/dev/null 2>&1 && systemctl is-active --quiet apache2; then WEB=apache; fi

if [ "$WEB" = nginx ]; then
  mkdir -p /etc/nginx/snippets
  cat >/etc/nginx/snippets/$SVC.conf <<EOF
# «Ваши пожелания» (shalom.bookingrobot.eu) → GitHub issues
location = $URLPATH {
    proxy_pass http://127.0.0.1:$PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    client_max_body_size 5m;
    proxy_read_timeout 60s;
}
EOF
  CONF=$(grep -RlE "server_name[^;]*\b${DOMAIN//./\\.}\b" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)
  [ -n "$CONF" ] || die "neradau nginx failo su server_name $DOMAIN — į jo server { } bloką įrašykite:  include snippets/$SVC.conf;  ir:  nginx -t && systemctl reload nginx"
  CONF=$(readlink -f "$CONF")
  if ! grep -q "snippets/$SVC.conf" "$CONF"; then
    cp "$CONF" "$CONF.bak-$SVC"
    sed -i -E "/server_name[^;]*\b${DOMAIN//./\\.}\b/a\    include snippets/$SVC.conf;" "$CONF"
  fi
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    ok "nginx: $CONF"
  else
    [ -f "$CONF.bak-$SVC" ] && cp "$CONF.bak-$SVC" "$CONF"
    die "nginx nepriėmė pakeitimo, grąžinau kaip buvo. Atsiųskite:  nginx -t"
  fi
elif [ "$WEB" = apache ]; then
  a2enmod proxy proxy_http >/dev/null
  cat >/etc/apache2/conf-available/$SVC.conf <<EOF
# «Ваши пожелания» (shalom.bookingrobot.eu) → GitHub issues
ProxyPass        "$URLPATH" "http://127.0.0.1:$PORT$URLPATH"
ProxyPassReverse "$URLPATH" "http://127.0.0.1:$PORT$URLPATH"
EOF
  a2enconf $SVC >/dev/null
  if apache2ctl configtest >/dev/null 2>&1; then
    systemctl reload apache2
    ok "apache: /etc/apache2/conf-enabled/$SVC.conf"
  else
    a2disconf $SVC >/dev/null
    die "apache nepriėmė pakeitimo, grąžinau kaip buvo. Atsiųskite:  apache2ctl configtest"
  fi
else
  die "neradau nginx ar apache. Nukreipkite https://$DOMAIN$URLPATH į http://127.0.0.1:$PORT (iki 5 MB) ir paleiskite skriptą dar kartą"
fi

echo
echo "── Bandymas per internetą (sukurs vieną bandomąjį issue — vėliau jį uždarykite)"
RES=$(curl -sS -m 40 -X POST "https://$DOMAIN$URLPATH" -H "Origin: https://shalom.bookingrobot.eu" \
  -F 'note={"type":"other","text":"Проверка: сервер coding.ateisiu.lt работает","name":"install.sh","title":"[Тест] сервер работает"}' || true)
echo "  atsakymas: $RES"
case "$RES" in
  *'"number"'*) echo; echo "  ✔ VISKAS VEIKIA. Bandomasis issue sukurtas — galite jį uždaryti." ;;
  *) die "per internetą neveikia. Atsiųskite šį tekstą ir:  journalctl -u $SVC -n 30" ;;
esac
