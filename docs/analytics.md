# Analytics — the booking funnel

Plausible (plausible.io): no cookies, no personal data, so the site needs no cookie banner.
Code: `src/lib/analytics.ts`. Turned on by the build variable `VITE_PLAUSIBLE_DOMAIN`
(e.g. `shalom.bookingrobot.eu`, set in GitHub → Settings → Variables). Without it nothing is sent.

## What is counted

| Event | When | Properties |
| --- | --- | --- |
| page view | every new page (order codes are counted as `/order/:code`) | — |
| `Search` | «Найти санаторий» in the search card | `resort` |
| `Programme chosen` | step 1 «Далее» | `programme` |
| `Step done` | «Далее» on steps 1–3 that passes the checks | `step` (1–3) |
| `Deposit paid` | step 4 payment sent | `plan` (adv / full) |
| `Help opened` | «Свяжитесь со мной» / «Поможем выбрать» opened | — |
| `Contact me` | the contact form sent | — |
| `Share offer` | «Посоветоваться с семьёй» opened | — |
| `Tickets searched` / `Tickets paid` | the flights page | `passengers` |

Never sent: names, phones, e-mails, dates of birth, card data, order codes.

## The funnel report for the agency

In Plausible → Goals add the events above as custom-event goals, then Funnels:

1. page view `/results`
2. `Programme chosen`
3. `Step done` step = 2 (the road answered)
4. `Step done` step = 3 (guests filled)
5. `Deposit paid`

Side by side: `Help opened` and `Contact me` per page — where 60+ guests prefer to call.
After a month the drop between two neighbouring steps shows which step to simplify first.
