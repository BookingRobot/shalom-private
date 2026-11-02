# Launch checklist

The site runs in **demo mode** until this list is done: the sample order, sample marks
(«[ПРИМЕР ДАННЫХ]», «Фото для примера», «[ПОДТВЕРДИТЬ …]») and every step openable by its address.
Launch = build with `VITE_DEMO=0` (GitHub → Settings → Variables): the order starts empty, every
step needs the one before it, all marks disappear at once (`src/components/DemoMark.tsx`).

`grep -rn "\[ПРИМЕР\|\[ПОДТВЕРДИТЬ\|\[ЗАМЕНИТЬ\|\[ТЕСТОВЫЙ" src` lists every place still waiting.

## From the agency (Atlantis)

- [ ] Real photos of the team in each sanatorium (doctor, rehab, administrator) — `src/data/team.ts`, «Фото для примера» on step 1
- [ ] Programme prices and what each includes, per sanatorium — `src/data/programs.ts`, `src/data/sanatoriumRooms.ts`
- [ ] Deposit and cancellation terms confirmed («[ПОДТВЕРДИТЬ УСЛОВИЯ]») — payment step, `/rules`, `src/lib/pricing.ts`
- [ ] Consultants' working hours on the phone and WhatsApp — `src/components/layout/SiteFooter.tsx` (`HOURS`)
- [ ] Agency licence number and company details for the footer — `src/data/contacts.ts`
- [ ] Privacy policy text approved (GDPR + Israeli Privacy Protection Law) — `/privacy`
- [ ] Transfer prices and the sanatoriums' own transfer rules — `src/data/transfer.ts`, `src/data/transferPolicy.ts`

## From the airline / flight system

- [ ] Flight schedule Tel Aviv ⇄ Vilnius and flight numbers — `src/data/flights.ts`, `src/data/tickets.ts`
- [ ] Flight package price and seats — `src/lib/pricing.ts` (`FLIGHT_PP`), `src/components/FlightToggle.tsx`

## From the sanatoriums / BookingRobot

- [ ] Availability and prices from the BookingRobot API (`VITE_API_URL`, contract `docs/openapi.yaml`) — replaces `src/data/availability.ts`, `sanatoriums.ts`, `search.ts`, `popular.ts`, `egleComfort.ts`, `roomAvailability.ts`
- [ ] Real guest reviews with permission — `src/data/hotelReviews.ts` («[ПРИМЕР ОТЗЫВОВ]»)
- [ ] Order drafts stored on the server (`/drafts`) — today they live in one browser only (`src/api/mock.ts`)
- [ ] Quotes from the server (`POST /quotes`) — the payment step charges what it returns

## Technical

- [ ] Payment provider (Tranzila) connected, test mode off — `src/components/CardForm.tsx` («[ТЕСТОВЫЙ РЕЖИМ]»)
- [ ] Contact forms delivered («Свяжитесь со мной», «Ваши пожелания», price alerts) — item 23, later
- [ ] `VITE_PLAUSIBLE_DOMAIN` set — `docs/analytics.md`
- [ ] `VITE_DEMO=0` build checked with `npm run test:e2e`
