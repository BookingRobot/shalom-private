# Kalbų versijos: rusų (/), anglų (/en/), hebrajų (/he/)

- Ta pati svetainė, trys surinkimai: rusiška — `https://shalom.bookingrobot.eu/`, angliška — `/en/`, hebrajiška — `/he/` (iš dešinės į kairę).
- `npm run build` surenka visas: `vite build` (rusiška → `dist/`), `vite build --mode he` (→ `dist/he/`), `vite build --mode en` (→ `dist/en/`).
- Vertimai: `src/i18n/he.texts.json` ir `src/i18n/en.texts.json` — `{ "rusiškas tekstas": "hebrajiškas tekstas" }`. Surinkimo metu `scripts/translate.mjs` kiekvieną rusišką tekstą kode pakeičia vertimu; logika nesikeičia.
- Išdėstymas iš dešinės į kairę: `<html dir="rtl">` ir `rtlcss` (CSS kairė ↔ dešinė), šriftas Rubik.
- Kalbos jungiklis: kompiuteryje viršutinėje juostoje (RU · EN · עב), telefone — meniu apačioje. Atidaro tą patį puslapį kita kalba.
- **Pakeitus ar pridėjus rusišką tekstą:** paleiskite `npx vite build --mode he` ir `--mode en` — neišversti tekstai surašomi į `node_modules/.cache/<kalba>-missing-texts.json` (jie lieka rusiški). Išverskite ir įrašykite į `src/i18n/<kalba>.texts.json`.
- Svarbu: CSS selektoriuose nenaudokite rusiško teksto (pvz. `[aria-label='…']`) — hebrajiškoje versijoje jis išverstas.
- Hebrajų kalba: kode nenaudokite fizinių `left`/`right` inline stiliuose — naudokite `insetInlineStart/End`, `paddingInlineStart/End` (rtlcss apverčia tik CSS failus).
- Pagalbos pažadai: hebrajiškoje versijoje — „בעברית וברוסית“, angliškoje — „in English and Russian“.
