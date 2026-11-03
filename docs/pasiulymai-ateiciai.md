# Pasiūlymai ateičiai — po 2026-11-03 darbų „60+ ir telefonas“

Šiame faile — kas **nepadaryta** per 2026-11-03 darbų sesiją (iki 17:45) ir ką siūlome daryti toliau.
Kas padaryta, matyti dizaino drobėje (eilutė „Что улучшено 3 ноября“: prieš → po) ir PR aprašyme.

Šaltiniai: 4 recenzentų ginčas (A — 60+ svečio advokatas, B — telefono dizaineris, C — pasitikėjimas ir pinigai,
D — skeptikas, saugo kompiuterio versiją), teisėjo išvada, tekstų peržiūra ir 15 įgyvendinimo agentų ataskaitos.

---

## 1. Reikia jūsų sprendimo (be jo keisti negalime)

| #   | Klausimas                                                               | Kaip dabar                                                                                                                                                             | Kodėl svarbu                                                                                                                  |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Avanso taisyklė.**                                                    | Svetainė: 35 € žmogui (+100 € žmogui su skrydžiu). Jūsų anksčiau nurodyta taisyklė — 4 % užsakymo sumos.                                                               | Visi tekstai ir skaičiavimai turi rodyti vieną taisyklę.                                                                      |
| 2   | **Kur ir kada mokamas likutis kiekvienoje sanatorijoje.**               | Dabar visur suvienodinta pagal kode esančią taisyklę: Eglė (ji pati pasitinka svečius) — likutis sanatorijoje atvykus; kitos — mums iki termino (3 mėn. iki atvykimo). | Svečias neturi gauti skirtingų atsakymų. Patvirtinkite arba pataisykite taisyklę kiekvienai sanatorijai.                      |
| 3   | **Patvirtinimo terminas ir ką darome, jei sanatorija atsako „ne“.**     | Mokėjimo puslapis: „perduodame užsakymą sanatorijai“; patvirtinimas — iki kitos dienos.                                                                                | Recenzentas C siūlo pažadą „jei vietų nebus — grąžinsime avansą per N dienų“. Reikia jūsų žodžio.                             |
| 4   | **Tarpinės reikšmės taisyklėse.**                                       | `[N часов]`, `[N дней]`, `[первых суток]`, `[уточнить по санаториям]` (`src/pages/Rules/RulesPage.tsx`).                                                               | Su `VITE_DEMO=0` jos vis tiek matysis — reikia tikrų skaičių.                                                                 |
| 5   | **Darbo laikas.**                                                       | „Ежедневно с 9:00 до 20:00“.                                                                                                                                           | Ar tikrai dirbate ir šeštadienį (šabą)? Jei ne — parašyti tikslų grafiką.                                                     |
| 6   | **Nuotraukų bankų veidai kaip personalas.**                             | Tie patys 3 „gydytojai“ prie visų sanatorijų (rezultatai, palyginimas, 1 žingsnis).                                                                                    | Pastebėjęs netikrą veidą, 60+ svečias nustoja tikėti ir kitais dalykais (C). Reikia tikrų nuotraukų arba keisti į ženkliukus. |
| 7   | **YouTube nuoroda kurorto lange.**                                      | Yra.                                                                                                                                                                   | Jūsų taisyklė — be YouTube nuorodų. Palikti ar išimti?                                                                        |
| 8   | **„С медицинской справкой депозит возвращаем полностью в любой срок“.** | Taisyklėse ir mokėjimo puslapyje.                                                                                                                                      | Pažadas be sąlygų per stiprus; neaišku, kas nutinka su likusia suma. Patikrinti su sanatorijomis.                             |
| 9   | **Užsakymo numeris.**                                                   | Patvirtinime demonstracinis „12345“.                                                                                                                                   | Tikras numeris turi ateiti iš užsakymų sistemos (API).                                                                        |

---

## 2. Nespėta įgyvendinti — eilė pagal naudą 60+ svečiui

Skliaustuose — darbo apimtis ir kas siūlė (A, B, C, D — recenzentai).

1. **Viena kaina nuo 1 žingsnio iki mokėjimo mygtuko** — visa suma „за двоих, 9 ночей“ didelė, „с человека“ —
   antra eilutė; kaina per dieną — tik išsamiau. Dabar programos kortelėje trys skaičiai. (vidutinis; A, C, D)
2. **Telefone eilutė „Ваш заказ“** po žingsnių juosta vietoj krepšelio ženkliuko (atsidaro paspaudus). (vidutinis; A)
3. **„i“ ženkliukai:** raidė 16 px, atsidaro tik paspaudus (dabar ir užėjus Tab klavišu — `InfoTip.tsx`),
   pašalinti „i“ iš puslapio antraščių, kur jis kartoja matomą tekstą. (mažas; C, D)
4. **Tikri Apple Pay / Google Pay mygtukai** per Tranzila: rodyti tik tą, kurį palaiko telefonas, po to „или картой“.
   (vidutinis; A, B, D — reikia Tranzila nustatymų)
5. **Filtrai rezultatuose — langas iš apačios** su mygtuku „Показать N санаториев“ ir automatiniu nuslinkimu į sąrašą.
   Dabar mygtukas tik prilimpa prie ekrano apačios. (vidutinis; B)
6. **Rezultatų kainų kalendorius** (`src/pages/Results/PriceCalendar.tsx`) telefone vis dar rodo 10 px kainas; žyma
   „šiandien“ visuose kalendoriuose. (mažas; A, B)
7. **Datos pagrindiniame puslapyje telefone** — vienas laukas „Даты поездки“ vietoj dviejų (~90 px mažiau). (mažas; B)
8. **1 žingsnio programos** — trumpos 72–88 px eilutės vietoj didelių kortelių, kad visas būtų galima palyginti
   viename ekrane. (vidutinis; A — teisėjas pritarė)
9. **Skrydžio paketui** — po kiekvienu vardu eilutė „На это имя выпишем билет — проверьте каждую букву“. (mažas; C)
10. **Naujienlaiškis** — perkelti iš mokėjimo puslapio į patvirtinimo puslapį. (mažas; C)
11. **„Осталось вписать: номер карты“** rodyti tik po pirmo „Оплатить“ paspaudimo. (mažas; C)
12. **„CVV“** → „Код CVV“ su užuomina „3 цифры на обороте карты“. (mažas)
13. **Vienodi dydžiai visame tinklapyje:** vienas puslapio plotis, kompiuterio H1 38 px, teksto eilutė ne platesnė nei
    ~68 ženklai; pagrindinis tekstas 18 px visur (dabar dalyje vietų 16–17 px). (vidutinis; D, jūsų dydžių skalė)
14. **Žingsniuose — tik plona poraštė** (telefonas, sąlygos, privatumas), pilnas sąrašas — kituose puslapiuose. (mažas; D)
15. **Rezultatų kortelė paprastesnė**, kambariai — tik sanatorijos puslapyje. (vidutinis; D)
16. **Kelio žingsnyje** pašalinti žalius numeruotus kvadratėlius prieš „Перелёт“ ir „Трансфер“ (numeriai — tik žingsnių
    juostoje). Svečių žingsnyje jau pašalinta. (mažas; D)
17. **„ГОСТИ“ 13 px didžiosiomis** (`soft.css`, `.gp-inline-l`) dar liko kai kuriuose puslapiuose. (mažas)
18. **Svečių žingsnis turi savo gimimo datos lango kopiją** — sujungti su bendru `BirthDateField`. (mažas, techninė skola)
19. **Seni statiniai prototipai** (`guests.html`, `payment.html`, `transfer.html`, `rooms.html`, `hotel.html`,
    `results.html` projekto šaknyje) kūrimo serveryje užgožia tikrus puslapius — juos verta perkelti į `prototype/`.
    (mažas, techninė skola; svetainei įtakos neturi)
20. **Pagalbos lange** Tab neturi išeiti už lango ribų; siunčiant užklausą pridėti ir paieškos eilutę. (mažas)
21. **Patvirtinimo `.ics` failas** naudoja `TZID=Europe/Vilnius` be laiko zonos aprašo — patikrinti Outlook. (mažas)
22. **Svečių skaitiklis** pagrindiniame puslapyje iš pradžių rodo „2 взрослых“. Tai pradinė reikšmė, ne atsakymas,
    bet jei norite visiškai tuščio lauko — reikia jūsų sprendimo.
23. **„Далее“ su neužpildytais laukais** — iškart nuslinkti prie pirmo trūkstamo lauko ir jį fokusuoti (dabar tai
    daro mygtukas „Показать ↑“). Keičia žingsnių elgseną ir testus, todėl atskiras darbas. (vidutinis; A, B)
24. **„Далее“ pulsavimas** (4 kartus, kai viskas užpildyta) — teisėjas siūlo išjungti visai, nes jūsų taisyklė
    „jokio mirksėjimo“; užtenka eilutės „✓ Всё заполнено“. (mažas)
25. **Android:** uždarius klaviatūrą „atgal“ gestu, apatinė juosta grįžta tik palietus kitur — pridėti
    `visualViewport` patikrą. (mažas)
26. **Raudonas „Ваши пожелания“** — žingsniuose palikti poraštėje vietos, kad mygtukas neuždengtų nuorodų
    (išvaizda nekeičiama). (mažas; A)
27. **Patikrinti atidarytas būsenas automatiškai** (meniu, kalendoriai, filtrai) — naujas `tests/e2e/layout.spec.ts`
    dabar tikrina tik puslapius be atidarytų langų. (mažas)

### Kas jau matuojama

Ta pati patikra prieš ir po (visi puslapiai ir atidaryti langai, 320 / 390 / 1366 px pločiai):

| Rodiklis                         | Prieš | Po                                          |
| -------------------------------- | ----- | ------------------------------------------- |
| Puslapiai su šoniniu slinkimu    | 8     | 0                                           |
| Vieni prielinksniai eilutės gale | 485   | 41                                          |
| Nukirpti tekstai                 | 75    | 0                                           |
| Per vidurį perskelti žodžiai     | 24    | 19 (daugiausia atidarytuose languose)       |
| Paspaudimo vietos < 44 px        | 1037  | 370 (daugiausia kompiuterio pelės nuorodos) |
| Silpno kontrasto vietos          | 157   | 112                                         |

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

- **Greičiausia:** GitHub → _Actions_ → „Rollback — publish an earlier version“ → _Run workflow_ → laukelyje
  `ref` palikite `pries-60plus` → _Run_. Po ~3 min svetainė vėl bus tokia, kokia buvo prieš šiuos darbus.
  Kitas pakeitimas į `main` vėl publikuos naujausią versiją.
- **Visam laikui:** GitHub → _Pull requests_ → šio darbo PR → _Revert_ → sujungti naują PR.
- Atsarginė šaka `pries-60plus` = būsena prieš darbus (commit `72f2c24`).
