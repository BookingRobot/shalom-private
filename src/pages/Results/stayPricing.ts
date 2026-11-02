import { api } from '../../api';
import { MONTHS, addD, daysBetween, shortDate, toD } from '../../lib/dates';

export type SearchData = ReturnType<typeof api.searchSanatoriums>;
export type Sanatorium = SearchData['sanatoriums'][number];
export type RoomSet = { id: string; room: string; add: number; img: string; amen?: any[]; roomText?: string };

export const PERSONS = 2;
/** minimal deposit — 4 % of the booking */
export const ADV_RATE = 0.04;
/** the dates the sample prices were quoted for */
export const BASE_IN = toD('2026-11-09');

export const toNum = (s: string | number) => Number(String(s).replace(/\s/g, ''));

export const plural = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? 'санаторий'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? 'санатория'
      : 'санаториев';

export const nightsW = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? 'ночь'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? 'ночи'
      : 'ночей';

export const procW = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? 'процедура'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? 'процедуры'
      : 'процедур';

/** «9–18 ноября» or «28 ноября – 7 декабря» for a stay of `nights` from `d` */
export const rangeText = (d: Date, nights: number) => {
  const e = addD(d, nights);
  return d.getUTCMonth() === e.getUTCMonth()
    ? d.getUTCDate() + '–' + e.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]
    : shortDate(d) + ' – ' + shortDate(e);
};

/**
 * Sample seasonal pricing [ПРИМЕР]: a seasonal/weekday factor per sanatorium and day,
 * normalised so the quoted price holds on the quoted dates.
 */
export function stayPricing(nights: number) {
  const dayIdx = (d: Date) => daysBetween(BASE_IN, d);
  const G = (h: Sanatorium, d: Date) => {
    const n = dayIdx(d),
      wd = d.getUTCDay();
    return (
      1 +
      0.11 * Math.sin(n * 0.55 + h.pop * 1.1) +
      (wd === 5 || wd === 6 ? 0.07 : 0) +
      (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
    );
  };
  const soldOut = (h: Sanatorium, d: Date) => (dayIdx(d) * 7 + h.pop * 3) % 23 === 0;
  const stayFactor = (h: Sanatorium, d: Date) => ((G(h, d) / G(h, BASE_IN)) * nights) / 9;
  const totalFor = (h: Sanatorium, d: Date, base: number) => Math.round(base * stayFactor(h, d));
  const ppnFor = (h: Sanatorium, d: Date, base: number) => Math.round(totalFor(h, d, base) / nights / PERSONS);
  const ppn = (total: string | number) => Math.round(toNum(total) / nights / PERSONS);
  return { soldOut, stayFactor, totalFor, ppnFor, ppn };
}
