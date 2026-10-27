import { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { isSoldOutEverywhere } from '../data/availability';
import { TODAY } from '../data/demo';
import { isFlightDay } from '../data/flights';
import { MONTHS, MONTHS_N, WEEKDAYS_SHORT, addD, iso, shortDate } from '../lib/dates';
import { fmt } from '../lib/format';

/** Resort-average price per person per night — the same season curve as the calendar colours. [ЗАМЕНИТЬ ТАРИФАМИ] */
export function seasonPpn(d: Date) {
  const n = Math.round((d.getTime() - TODAY.getTime()) / 86400000),
    wd = d.getUTCDay(),
    m = d.getUTCMonth();
  return Math.round(
    100 *
      (1 +
        0.12 * Math.sin(n * 0.42) +
        (wd === 5 || wd === 6 ? 0.06 : 0) +
        (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
        (m >= 5 && m <= 7 ? 0.15 : 0) +
        (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
  );
}

const NIGHTS = [7, 10, 14, 21];

/**
 * "Не знаю точных дат": pick a month and a length, get the cheapest start dates.
 * People write "середина мая, 2 недели" or "июнь–июль" far more often than exact dates.
 * With the flight package only flight days are offered as arrival days.
 */
export function FlexDates({ onPick }: { onPick: (checkin: string, checkout: string) => void }) {
  const { booking } = useBooking();
  const start = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1));
  const months = Array.from(
    { length: 9 },
    (_, i) => new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)),
  );
  const [mi, setMi] = useState(1);
  const [nights, setNights] = useState(14);
  const m = months[mi];
  const days = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
  const options: { d: Date; sum: number }[] = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), i));
    if (d <= TODAY) continue;
    if (booking.flightPackage && !isFlightDay(d)) continue;
    let sum = 0,
      ok = true;
    for (let k = 0; k < nights; k++) {
      const x = addD(d, k);
      if (isSoldOutEverywhere(iso(x))) ok = false;
      sum += seasonPpn(x);
    }
    if (ok) options.push({ d, sum });
  }
  const best = options
    .sort((a, b) => a.sum - b.sum)
    .slice(0, 5)
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const r10 = (n: number) => Math.round(n / 10) * 10;
  const min = best.length ? Math.min(...best.map((b) => r10(b.sum))) : 0;
  return (
    <div className="flex-dates">
      <div className="fd-row">
        <span className="fd-lbl">Месяц</span>
        <div className="fd-opts" role="group" aria-label="Месяц">
          {months.map((x, i) => (
            <button
              type="button"
              key={i}
              className={`qf-chip ${i === mi ? 'on' : ''}`}
              aria-pressed={i === mi}
              onClick={() => setMi(i)}
            >
              {MONTHS_N[x.getUTCMonth()]}
              {x.getUTCFullYear() !== TODAY.getUTCFullYear() ? ' ' + x.getUTCFullYear() : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="fd-row">
        <span className="fd-lbl">Сколько ночей</span>
        <div className="fd-opts" role="group" aria-label="Сколько ночей">
          {NIGHTS.map((n) => (
            <button
              type="button"
              key={n}
              className={`qf-chip ${n === nights ? 'on' : ''}`}
              aria-pressed={n === nights}
              onClick={() => setNights(n)}
            >
              {n === 7
                ? '7 ночей · неделя'
                : n === 14
                  ? '14 ночей · 2 недели'
                  : n === 21
                    ? '21 ночь · 3 недели'
                    : '10 ночей'}
            </button>
          ))}
        </div>
      </div>
      <div className="fd-list">
        <span className="fd-title">
          Самые выгодные даты заезда в {MONTHS[m.getUTCMonth()].replace(/я$/, 'е').replace(/а$/, 'е')}
          {booking.flightPackage ? ' — только дни с рейсом' : ''}
        </span>
        {best.length === 0 ? (
          <span className="fd-empty">В этом месяце свободных дат нет — выберите другой.</span>
        ) : null}
        {best.map(({ d, sum }) => {
          const out = addD(d, nights);
          return (
            <button type="button" key={iso(d)} className="fd-opt" onClick={() => onPick(iso(d), iso(out))}>
              <span className="fd-when">
                {WEEKDAYS_SHORT[d.getUTCDay()]}, {shortDate(d)} → {shortDate(out)}
                {isFlightDay(d) ? <span title="Рейс из Израиля"> ✈</span> : null}
              </span>
              <span className="fd-sum">
                ≈ {fmt(r10(sum))}&nbsp;€ на человека
                {r10(sum) === min ? <span className="fd-best">дешевле всего</span> : null}
              </span>
            </button>
          );
        })}
        <span className="fd-note">
          Средняя цена по курорту за проживание и лечение. Точную цену покажем в санаториях.
        </span>
      </div>
    </div>
  );
}

/** Two tabs above the calendar: exact dates / "не знаю точных дат". */
export function DateModeTabs({ flex, onChange }: { flex: boolean; onChange: (flex: boolean) => void }) {
  return (
    <div className="dm-tabs" role="tablist" aria-label="Как выбрать даты">
      <button
        type="button"
        role="tab"
        aria-selected={!flex}
        className={!flex ? 'on' : ''}
        onClick={() => onChange(false)}
      >
        Точные даты
      </button>
      <button type="button" role="tab" aria-selected={flex} className={flex ? 'on' : ''} onClick={() => onChange(true)}>
        Не знаю точных дат
      </button>
    </div>
  );
}
