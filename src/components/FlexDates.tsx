import { useEffect, useState } from 'react';
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
/** Start days in a month for `nights` nights, with the resort-average sum per person. */
function optionsFor(m: Date, nights: number) {
  const days = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
  const out: { d: Date; sum: number }[] = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), i));
    if (d <= TODAY) continue;
    // recommended options come with flights both ways (Tel Aviv ⇄ Vilnius flies Tue/Thu/Sun)
    if (!isFlightDay(d) || !isFlightDay(addD(d, nights))) continue;
    let sum = 0,
      ok = true;
    for (let k = 0; k < nights; k++) {
      const x = addD(d, k);
      if (isSoldOutEverywhere(iso(x))) ok = false;
      sum += seasonPpn(x);
    }
    if (ok) out.push({ d, sum });
  }
  return out;
}

const r10 = (n: number) => Math.round(n / 10) * 10;
/** 24 months ahead in the carousel; 6 tiles at a time on a laptop, 3 on a phone */
const MONTHS_AHEAD = 24;

export function FlexDates({ onPick }: { onPick: (checkin: string, checkout: string) => void }) {
  const start = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1));
  const months = Array.from(
    { length: MONTHS_AHEAD },
    (_, i) => new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)),
  );
  // most asked-about: next summer — open on it (June selected, March–August in view)
  const june = months.findIndex((x) => x.getUTCMonth() === 5);
  const [mi, setMi] = useState(june);
  const [nights, setNights] = useState(14);
  const [off, setOff] = useState(Math.max(0, june - 3));
  const per = useVisibleTiles();
  const first = Math.min(off, MONTHS_AHEAD - per);
  const m = months[mi];
  const best = optionsFor(m, nights)
    .sort((a, b) => a.sum - b.sum)
    .slice(0, 5)
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const min = best.length ? Math.min(...best.map((b) => r10(b.sum))) : 0;
  return (
    <div className="flex-dates">
      <div className="fd-row">
        <span className="fd-lbl">Месяц</span>
        <div className="fd-car">
          <button
            type="button"
            className="navbtn"
            aria-label="Раньше"
            disabled={first === 0}
            onClick={() => setOff(Math.max(0, first - per))}
          >
            ‹
          </button>
          <div className="fd-tiles" role="group" aria-label="Месяц" style={{ ['--per' as string]: per }}>
            {months.slice(first, first + per).map((x, j) => {
              const i = first + j;
              const opts = optionsFor(x, nights);
              const from = opts.length ? Math.min(...opts.map((o) => r10(o.sum))) : 0;
              return (
                <button
                  type="button"
                  key={i}
                  className={`fd-tile ${i === mi ? 'on' : ''}`}
                  aria-pressed={i === mi}
                  onClick={() => setMi(i)}
                >
                  <strong>{MONTHS_N[x.getUTCMonth()]}</strong>
                  <span>{x.getUTCFullYear()}</span>
                  <small>{from ? 'от ' + fmt(from) + '\u00a0€' : 'нет мест'}</small>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="navbtn"
            aria-label="Позже"
            disabled={first >= MONTHS_AHEAD - per}
            onClick={() => setOff(Math.min(MONTHS_AHEAD - per, first + per))}
          >
            ›
          </button>
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
          Лучшие даты в {MONTHS[m.getUTCMonth()].replace(/я$/, 'е').replace(/а$/, 'е')} — с рейсами туда и обратно
        </span>
        {best.length === 0 ? (
          <span className="fd-empty">В этом месяце свободных дат нет — выберите другой.</span>
        ) : null}
        {best.map(({ d, sum }) => {
          const out = addD(d, nights);
          return (
            <button type="button" key={iso(d)} className="fd-opt" onClick={() => onPick(iso(d), iso(out))}>
              <span className="fd-when">
                {WEEKDAYS_SHORT[d.getUTCDay()]}, {shortDate(d)} → {WEEKDAYS_SHORT[out.getUTCDay()]}, {shortDate(out)}
                <span className="fd-fly">
                  <PlaneIcon /> рейс туда · <PlaneIcon back /> обратно
                </span>
              </span>
              <span className="fd-sum">
                ≈ {fmt(r10(sum))}&nbsp;€ на человека
                {r10(sum) === min ? <span className="fd-best">дешевле всего</span> : null}
              </span>
              <span className="fd-go" aria-hidden="true">
                →
              </span>
            </button>
          );
        })}
        <span className="fd-note">
          Средняя цена по курорту за проживание и лечение. Выберите вариант — сразу покажем санатории на эти даты.
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

/** 6 month tiles on a laptop, 3 on a phone. */
function useVisibleTiles() {
  const [n, setN] = useState(6);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const set = () => setN(mq.matches ? 3 : 6);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  return n;
}

function PlaneIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1F5F4A"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ verticalAlign: '-3px', transform: back ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
    </svg>
  );
}
