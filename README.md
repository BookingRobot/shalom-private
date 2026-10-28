# br-shalom — Санатории Литвы

Sanatorijų Lietuvoje užsakymo kelias rusakalbiams svečiams iš Izraelio (55+).
Vite + React + TypeScript. Svetainė: **https://shalom.bookingrobot.eu**

## Paleidimas

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tipų patikra + gamybinė versija į dist/ (+ dist/404.html)
npm run preview   # peržiūrėti dist/ lokaliai (http://localhost:4173)
```

## Struktūra

| Kelias | Kas |
| --- | --- |
| `src/pages/<Ekranas>/` | po vieną kiekvienam ekranui: `/`, `/results`, `/hotel`, `/rooms`, `/transfer`, `/guests`, `/flights`, `/payment`, `/done`, `/rules` (+ `/screens` — visų ekranų sąrašas) |
| `src/components/` | bendri komponentai: `layout/` (header dalys, žingsnių juosta, footer), `calendar/MonthsCalendar`, `RoomCard`, `OrderSummary`, `HelpWidget` („Свяжитесь со мной“ mygtukas ir forma), `PhoneCodeSelect`, `icons` |
| `src/data/` | pavyzdiniai duomenys: sanatorijos, kambariai, programos, kainos, užimtumas, reisai, transferas |
| `src/api/` | duomenų sluoksnis — dabar grąžina `src/data`, vėliau keičiamas į BookingRobot API (puslapiai kreipiasi tik į `api`) |
| `src/context/` | `BookingContext` — bendra užsakymo būsena (datos, svečiai, sanatorija, kambarys, programa, transferas, reisai), saugoma `sessionStorage`; `HelpContext` — pagalbos forma |
| `src/i18n/` | kalbos: rusų pagrindinė; reisų žingsnis — RU / EN / HE (HE su `dir="rtl"`) |
| `src/lib/` | datos, formatavimas, užsakymo santrauka, `PageLogic` (ekrano logikos klasė) |
| `prototype/` | originalus statinis prototipas (palyginimui, nediegiamas) |

Kiekvienas ekranas: `XxxPage.tsx` (logikos klasė `XxxLogic` + JSX) ir `XxxPage.css` (stiliai, apriboti klase `.pg-xxx`).

## Diegimas

`main` šakos pakeitimai automatiškai diegiami į GitHub Pages (`.github/workflows/deploy.yml`).

Vienkartiniai nustatymai:

1. Repo **Settings → Pages → Source: „GitHub Actions“**.
2. **Custom domain:** `shalom.bookingrobot.eu`, įjungti **Enforce HTTPS**.
3. DNS: `CNAME` įrašas `shalom` → `bookingrobot-m.github.io`.

`public/CNAME` laiko domeną, o `dist/404.html` (kopija `index.html`) leidžia tiesiogiai atverti kelius, pvz. `/rooms`.

## Svarbu

- Nenaudoti litva.lt pavadinimų, nuotraukų ar telefonų. Telefonas — tik `+370 600 00000` (`src/data/contacts.ts`).
- Kainos, užimtumas ir reisai — pavyzdiniai (`[ПРИМЕР ДАННЫХ]`), „šiandien“ = 2026-10-27 (`src/data/demo.ts`).

## Design canvas = the live site

The Design canvas boards are snapshots of the built site, so comments there match what is online.
After changes: `npm run build`, `npx vite preview --port 4173`, then
`NODE_PATH=$(npm root -g) npm run canvas:snapshot` — it writes one `.dc.html` per page and per pop-up state
(calendar, guests, compare, wizard…) into `canvas-out/`, with images mapped to the canvas asset store and
links between pages mapped to artboards. Publish those files to the canvas artifact.
