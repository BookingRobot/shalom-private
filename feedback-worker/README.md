# «Ваши пожелания» — kur keliauja pastabos

Raudonas mygtukas **«Ваши пожелания»** (virš «Свяжитесь со мной») leidžia bet kam svetainėje:
parodyti vietą puslapyje → automatiškai padaroma ekrano nuotrauka su pažymėta vieta →
pasirinkti tipą (Предложение / Ошибка / Другое), parašyti tekstą, vardą ir kontaktą.

Kiekviena pastaba tampa **GitHub issue** šiame repozitorijume su žymomis
`atsiliepimas` ir `laukia-peržiūros`. Issue tekstas prasideda „⏸ Nevykdyti — laukia peržiūros“:
niekas jo nevykdo, kol žyma `laukia-peržiūros` nenuimta.

## Kaip veikia dabar (be serverio)

Kol `VITE_FEEDBACK_URL` nenustatytas, paspaudus «Отправить» atsidaro užpildytas
GitHub „New issue“ langas, o ekrano nuotrauka nukopijuojama į iškarpinę — įklijuoti (Ctrl+V)
ir paspausti „Submit new issue“. Tinka komandai (žmonėms su prieiga prie repozitorijos).

## Kaip įjungti automatinį siuntimą (~10 min, nemokamai)

Mažas Cloudflare Worker (`worker.js`) priima pastabą ir pats sukuria issue. „Duomenų bazė“ —
pats GitHub: issue + šaka `feedback-files`, kurioje saugomi visų pastabų JSON ir nuotraukos.

1. GitHub → Settings → Developer settings → Fine-grained token: tik repozitorijus
   `BookingRobot-M/br-shalom`, teisės **Issues: Read and write**, **Contents: Read and write**.
2. Cloudflare paskyroje (nemokamas planas):
   ```
   cd feedback-worker
   npx wrangler login
   npx wrangler secret put GITHUB_TOKEN     # įklijuoti tokeną
   npx wrangler deploy                      # parodys adresą, pvz. https://br-shalom-feedback.<vardas>.workers.dev
   ```
3. GitHub → repozitorijus → Settings → Secrets and variables → Actions → **Variables**:
   `VITE_FEEDBACK_URL` = Workerio adresas. Deploy workflow jį perduoda į build'ą.
4. Paleisti „Deploy to GitHub Pages“ (arba bet koks push į `main`).

Šaka `feedback-files` jau sukurta; žymos `atsiliepimas` ir `laukia-peržiūros` — taip pat.
