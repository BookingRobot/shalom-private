# Pasiūlymai ateičiai — po 2026-11-03 darbų „60+ ir telefonas“

Šiame faile — kas **nepadaryta** per 2026-11-03 darbų sesiją (iki 17:45) ir ką siūlome daryti toliau.
Kas padaryta, matyti dizaino drobėje (eilutė „Что улучшено 3 ноября“: prieš → po) ir PR aprašyme.

Šaltiniai: 4 recenzentų ginčas (A — 60+ svečio advokatas, B — telefono dizaineris, C — pasitikėjimas ir pinigai,
D — skeptikas, saugo kompiuterio versiją), teisėjo išvada, tekstų peržiūra ir 15 įgyvendinimo agentų ataskaitos.

---

## 1. Reikia jūsų sprendimo (be jo keisti negalime)

| # | Klausimas | Kaip dabar | Kodėl svarbu |
|---|---|---|---|
| 1 | **Avanso taisyklė.** | Svetainė: 35 € žmogui (+100 € žmogui su skrydžiu). Jūsų anksčiau nurodyta taisyklė — 4 % užsakymo sumos. | Visi tekstai ir skaičiavimai turi rodyti vieną taisyklę. |
| 2 | **Kur ir kada mokamas likutis kiekvienoje sanatorijoje.** | Dabar visur suvienodinta pagal kode esančią taisyklę: Eglė (ji pati pasitinka svečius) — likutis sanatorijoje atvykus; kitos — mums iki termino (3 mėn. iki atvykimo). | Svečias neturi gauti skirtingų atsakymų. Patvirtinkite arba pataisykite taisyklę kiekvienai sanatorijai. |
| 3 | **Patvirtinimo terminas ir ką darome, jei sanatorija atsako „ne“.** | Mokėjimo puslapis: „perduodame užsakymą sanatorijai“; patvirtinimas — iki kitos dienos. | Recenzentas C siūlo pažadą „jei vietų nebus — grąžinsime avansą per N dienų“. Reikia jūsų žodžio. |
| 4 | **Tarpinės reikšmės taisyklėse.** | `[N часов]`, `[N дней]`, `[первых суток]`, `[уточнить по санаториям]` (`src/pages/Rules/RulesPage.tsx`). | Su `VITE_DEMO=0` jos vis tiek matysis — reikia tikrų skaičių. |
| 5 | **Darbo laikas.** | „Ежедневно с 9:00 до 20:00“. | Ar tikrai dirbate ir šeštadienį (šabą)? Jei ne — parašyti tikslų grafiką. |
| 6 | **Nuotraukų bankų veidai kaip personalas.** | Tie patys 3 „gydytojai“ prie visų sanatorijų (rezultatai, palyginimas, 1 žingsnis). | Pastebėjęs netikrą veidą, 60+ svečias nustoja tikėti ir kitais dalykais (C). Reikia tikrų nuotraukų arba keisti į ženkliukus. |
| 7 | **YouTube nuoroda kurorto lange.** | Yra. | Jūsų taisyklė — be YouTube nuorodų. Palikti ar išimti? |
| 8 | **„С медицинской справкой депозит возвращаем полностью в любой срок“.** | Taisyklėse ir mokėjimo puslapyje. | Pažadas be sąlygų per stiprus; neaišku, kas nutinka su likusia suma. Patikrinti su sanatorijomis. |
| 9 | **Užsakymo numeris.** | Patvirtinime demonstracinis „12345“. | Tikras numeris turi ateiti iš užsakymų sistemos (API). |

---

## 2. Nespėta įgyvendinti — eilė pagal naudą 60+ svečiui

_(papildoma po agentų ataskaitų — žr. žemiau)_

---

## 3. Tekstų suvienodinimas (iš tekstų peržiūros)

Didžiausia žala — ne žodžiai, o skirtingi faktai skirtinguose puslapiuose. Pinigų taisyklė ir mokėjimo sistema
(Tranzila) jau suvienodintos. Liko:

1. **„Депозит“ ir „предоплата“** maišomi. Izraeliečiams „депозит“ reiškia grąžinamą užstatą. Siūlymas: visur
   „предоплата“ ir „остаток“; „фиксирует цену“ → „после неё цена для вас не изменится (если не меняете даты)“.
2. **Žingsnių pavadinimai** vienodi visur: „Номер и программа · Дорога · Гости · Оплата“; mygtukai „← Назад:
   номер и программа“, „← Назад: дорога“, „← Назад: гости“.
3. **„Трансфер“ ir „Дорога“**, **„Отдельная машина“ ir „Индивидуальный“**, **„Групповой — от 30 €“ ir „всего 30 €“** —
   pasirinkti po vieną pavadinimą („Отдельная машина“, „Общий микроавтобус“).
4. **Kainos pagrindas** visada tais pačiais žodžiais: „X € с человека за всю поездку“; be santrumpos „чел.“.
5. **„Программа отдыха“ / „лечение“** → visur „программа лечения“; sumose — „Проживание, питание и лечение“.
6. **„Полный пансион“, „полупансион“** → „Питание 4 раза в день“, „Питание 2 раза в день“.
7. **„Латиницей“, „загранпаспорт“** → „английскими буквами — точно как в паспорте“ (Izraelyje pasas vienas).
8. **Biuro žodžiai:** „подача“, „тариф“, „незаезд“, „досрочный выезд“ → paprasti sakiniai.
9. **„Ожидаем подтверждение“** → „Ждём подтверждения от санатория“.
10. **„Минерал SPA“ ir „Минерал Спа“**, „не обязательно“ ir „необязательно“, „e-mail“ ir „электронная почта“ —
    po vieną rašybą.

---

## 4. Kaip grąžinti ankstesnę versiją

- **Greičiausia:** GitHub → *Actions* → „Rollback — publish an earlier version“ → *Run workflow* → laukelyje
  `ref` palikite `pries-60plus` → *Run*. Po ~3 min svetainė vėl bus tokia, kokia buvo prieš šiuos darbus.
  Kitas pakeitimas į `main` vėl publikuos naujausią versiją.
- **Visam laikui:** GitHub → *Pull requests* → šio darbo PR → *Revert* → sujungti naują PR.
- Atsarginė šaka `pries-60plus` = būsena prieš darbus (commit `72f2c24`).
