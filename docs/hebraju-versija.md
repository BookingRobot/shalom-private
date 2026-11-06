# Hebrajiška versija (/he/)

- Ta pati svetainė, du surinkimai: rusiška — `https://shalom.bookingrobot.eu/`, hebrajiška — `https://shalom.bookingrobot.eu/he/` (iš dešinės į kairę).
- `npm run build` surenka abi: `vite build` (rusiška → `dist/`) ir `vite build --mode he` (hebrajiška → `dist/he/`).
- Vertimai: `src/i18n/he.texts.json` — `{ "rusiškas tekstas": "hebrajiškas tekstas" }`. Surinkimo metu `scripts/translate.mjs` kiekvieną rusišką tekstą kode pakeičia vertimu; logika nesikeičia.
- Išdėstymas iš dešinės į kairę: `<html dir="rtl">` ir `rtlcss` (CSS kairė ↔ dešinė), šriftas Rubik.
- Kalbos jungiklis: kompiuteryje viršutinėje juostoje („עברית“ / „Русский“), telefone — meniu apačioje. Atidaro tą patį puslapį kitu kalba.
- **Pakeitus ar pridėjus rusišką tekstą:** paleiskite `npx vite build --mode he` — neišversti tekstai surašomi į `node_modules/.cache/he-missing-texts.json` (jie lieka rusiški). Išverskite juos ir įrašykite į `src/i18n/he.texts.json`.
- Svarbu: CSS selektoriuose nenaudokite rusiško teksto (pvz. `[aria-label='…']`) — hebrajiškoje versijoje jis išverstas.
