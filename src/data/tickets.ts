import { TODAY } from './demo';
import { FLIGHT_BACK, FLIGHT_THERE, isFlightDay } from './flights';
import { addD, iso, toD } from '../lib/dates';

/**
 * «Прямые перелёты»: direct flights Tel Aviv ⇄ Vilnius (Israir, Sun / Tue / Thu) — schedule,
 * seats and prices for the flight search page. [ПРИМЕР ДАННЫХ — ИЗ СИСТЕМЫ БРОНИРОВАНИЯ РЕЙСОВ]
 */
export type Country = 'IL' | 'LT';

export const COUNTRIES: Record<Country, { name: string; city: string; code: string; flag: string }> = {
  IL: { name: 'Израиль', city: 'Тель-Авив', code: 'TLV', flag: '🇮🇱' },
  LT: { name: 'Литва', city: 'Вильнюс', code: 'VNO', flag: '🇱🇹' },
};

export interface FlightLeg {
  no: string;
  from: Country;
  to: Country;
  date: string;
  dep: string;
  arr: string;
  /** «4 ч 15 мин» */
  dur: string;
  /** seats left in this price */
  seats: number;
  /** price per person, this direction, € */
  pp: number;
}

/** what is included and what to know — shown under «i» */
export const FLIGHT_FACTS = {
  airline: 'Israir',
  plane: 'Airbus A320',
  hand: 'ручная кладь до 8 кг',
  bag: 'багаж до 20 кг',
  meals: 'питание на борту не подаётся',
  notes: [
    'Второй чемодан — за доплату, около 90 $ в одну сторону.',
    'Онлайн-регистрации на этот рейс нет — регистрация в аэропорту.',
    'Выбор места заранее — за доплату.',
    'Дополнительные услуги добавит наш консультант после заказа.',
  ],
};

/** the first and the last day of the schedule we show (today's flight too: it is sold by phone) */
export const FIRST_DAY = TODAY;
export const LAST_DAY = addD(TODAY, 365);

export const hasFlight = (d: Date) => d >= FIRST_DAY && d <= LAST_DAY && isFlightDay(d);

/** a steady pseudo-random number for a day (seats, price wiggle) */
const seed = (d: Date) => {
  const n = Math.round(d.getTime() / 86400000);
  return Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
};

/** one-way price per person: higher in summer and around the New Year */
export function legPrice(d: Date, from: Country) {
  const m = d.getUTCMonth(),
    day = d.getUTCDate();
  let f = 1 + 0.1 * Math.sin(Math.round(d.getTime() / 86400000) * 0.37);
  if (m >= 5 && m <= 7) f += 0.15;
  if ((m === 11 && day >= 20) || (m === 0 && day <= 8)) f += 0.2;
  if (from === 'LT') f += 0.03;
  return Math.round((160 * f) / 2) * 2;
}

export function legOn(dateIso: string, from: Country): FlightLeg | null {
  const d = toD(dateIso);
  if (!hasFlight(d)) return null;
  const f = from === 'IL' ? FLIGHT_THERE : FLIGHT_BACK;
  return {
    no: f.no,
    from,
    to: from === 'IL' ? 'LT' : 'IL',
    date: iso(d),
    dep: f.dep,
    arr: f.arr,
    dur: from === 'IL' ? '4 ч 15 мин' : '4 ч 00 мин',
    seats: 2 + Math.floor(seed(d) * 8),
    pp: legPrice(d, from),
  };
}

/** demo «now» for the 24-hour rule: today, 10:00 [ПРИМЕР ДАННЫХ — в системе текущее время] */
export const NOW = new Date(TODAY.getTime() + 10 * 3600 * 1000);
/** online the tickets are sold until 24 hours before the departure; later only by phone */
export const ONLINE_UNTIL_H = 24;

export function departsAt(leg: FlightLeg) {
  const [h, m] = leg.dep.split(':').map(Number);
  return new Date(toD(leg.date).getTime() + (h * 60 + m) * 60000);
}
export const canBuyOnline = (leg: FlightLeg) => departsAt(leg).getTime() - NOW.getTime() >= ONLINE_UNTIL_H * 3600000;

export interface Offer {
  there: FlightLeg;
  back: FlightLeg | null;
  /** price per person, both ways */
  pp: number;
  total: number;
}

export function offerFor(dep: string, ret: string | null, from: Country, people: number): Offer | null {
  const there = legOn(dep, from);
  if (!there) return null;
  const back = ret ? legOn(ret, from === 'IL' ? 'LT' : 'IL') : null;
  if (ret && !back) return null;
  const pp = there.pp + (back ? back.pp : 0);
  return { there, back, pp, total: pp * people };
}

/** «Сравнить цены»: every flight day with the same length of the trip */
export function compareOffers(length: number | null, from: Country, people: number) {
  const out: Offer[] = [];
  for (let d = FIRST_DAY; d <= LAST_DAY; d = addD(d, 1)) {
    if (!hasFlight(d)) continue;
    const r = length ? addD(d, length) : null;
    if (r && !hasFlight(r)) continue;
    const o = offerFor(iso(d), r ? iso(r) : null, from, people);
    if (o) out.push(o);
  }
  return out;
}
