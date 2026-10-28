# «Ваши пожелания» — kur keliauja pastabos

Raudonas mygtukas **«Ваши пожелания»** (virš «Свяжитесь со мной») leidžia bet kam svetainėje:
parodyti vietą puslapyje → automatiškai padaroma ekrano nuotrauka su pažymėta vieta →
pasirinkti tipą (Ошибка / Изменение / Идея / Вопрос) ir svarbą (Мешает / Неудобно / На будущее),
parašyti trumpai ir plačiau (klaidai — ką darė, ko tikėjosi, kas įvyko), pridėti dar iki 4
nuotraukų (tik paveikslėliai: dar vienas ekrano kadras, failas, Ctrl+V ar nutempimas), vardą ir kontaktą.

Kiekviena pastaba tampa **GitHub issue** šiame repozitorijume su žymomis
`atsiliepimas` ir `laukia-peržiūros`. Issue tekstas prasideda „⏸ Nevykdyti — laukia peržiūros“:
niekas jo nevykdo, kol žyma `laukia-peržiūros` nenuimta. „Duomenų bazė“ — pats GitHub:
issue + šaka `feedback-files`, kurioje saugomi visų pastabų JSON ir ekrano nuotraukos.

Svetainė siunčia pastabas į **https://coding.ateisiu.lt/br-shalom-feedback**. Ten veikia mažas
Node serveriukas (`server.mjs` + `worker.js`), kuris su GitHub tokenu sukuria issue.
Jei serveriukas neatsako, formoje atsiranda nuoroda „Для команды: создать задачу на GitHub
вручную“ — atsidaro užpildytas GitHub langas, nuotrauka nukopijuojama (Ctrl+V → Submit).

## Įdiegimas serveryje coding.ateisiu.lt (~5 min)

**1. Tokenas.** GitHub → (jūsų nuotrauka) Settings → Developer settings → Personal access tokens →
**Fine-grained tokens** → Generate new token:

- Resource owner: **BookingRobot-M**
- Repository access: **Only select repositories** → `br-shalom`
- Permissions → Repository: **Contents — Read and write**, **Issues — Read and write**
- Expiration: pvz. 1 metai (pasibaigus — paleisti diegimą iš naujo su nauju tokenu)

Nukopijuokite `github_pat_…`.

**2. Serveryje** (per SSH):

```bash
read -rs T            # įklijuokite tokeną ir spauskite Enter (ekrane nesimatys)
curl -fsSL -H "Authorization: Bearer $T" -H "Accept: application/vnd.github.raw" \
  "https://api.github.com/repos/BookingRobot-M/br-shalom/contents/feedback-worker/install.sh?ref=main" -o install.sh
sudo GITHUB_TOKEN="$T" bash install.sh
```

Skriptas: įdiegia Node.js 22 (jei reikia), parsisiunčia failus, patikrina tokeno teises,
paleidžia paslaugą `br-shalom-feedback` (127.0.0.1:8787, pasileidžia ir po perkrovimo),
nginx arba Apache prideda adresą `/br-shalom-feedback` (su atsargine kopija ir `nginx -t`)
ir pabaigoje per internetą sukuria vieną bandomąjį issue „[Тест] сервер работает“ — jį uždarykite.
Pabaigoje turi būti **✔ VISKAS VEIKIA**.

Atnaujinus `worker.js` ar `server.mjs` (pvz. po naujos formos versijos), serveryje paleiskite
`sudo bash install.sh` — jis parsisiųs naujausius failus iš `main` ir perkraus paslaugą.

## Formos kodas

Siųsti pastabą galima tik su **kodu** (laukas „Код доступа“). Kodą tikrina serveris: svetainės
kode ir repozitorijoje jo nėra, serveryje (`/etc/br-shalom-feedback.env`, matomas tik root)
saugoma tik jo maiša `PIN_HASH` (PBKDF2-SHA256, 100 000 kartų, atsitiktinė druska).
Po 5 neteisingų bandymų iš to paties adreso siuntimas užrakinamas valandai.
Kodas neįrašomas nei į issue, nei į archyvo JSON. Naršyklė jį prisimena tik pažymėjus
„Запомнить на этом устройстве“.

```bash
sudo FEEDBACK_PIN=naujas_kodas bash install.sh   # nustatyti / pakeisti kodą
sudo FEEDBACK_PIN=- bash install.sh              # išjungti kodą (siųsti galės bet kas)
```

Jei kodas dar nenustatytas, `install.sh` jo paklaus pats.

## Priežiūra

```bash
systemctl status br-shalom-feedback          # ar veikia
journalctl -u br-shalom-feedback -n 50       # paskutinės pastabos / klaidos (be teksto, tik issue numeriai)
sudo bash install.sh                         # atnaujinti iš main (tokenas paimamas iš /etc/br-shalom-feedback.env)
sudo GITHUB_TOKEN=naujas bash install.sh     # pakeisti tokeną
```

Apsauga: priimama tik iš `https://shalom.bookingrobot.eu` (ir localhost kūrimui), iki 20 pastabų
per valandą iš vieno adreso ir 300 per parą, nuotrauka iki 2 MB. Tokenas — tik
`/etc/br-shalom-feedback.env` (matomas tik root).

## Kitas adresas ar Cloudflare

Adresą galima pakeisti GitHub → Settings → Secrets and variables → Actions → Variables:
`VITE_FEEDBACK_URL` (reikšmė `github` — visada tik rankinis GitHub langas). Tas pats `worker.js`
veikia ir kaip Cloudflare Worker: `npx wrangler login`, `npx wrangler secret put GITHUB_TOKEN`,
`npx wrangler deploy` (`wrangler.toml` jau paruoštas).
