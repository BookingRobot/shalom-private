import { TODAY } from './demo';
import { isFlightDay } from './flights';
import { addD, daysBetween, iso, toD } from '../lib/dates';

/** Days with no free places in any sanatorium. [ПРИМЕР ДАННЫХ — из системы бронирования] */
export const SOLD_OUT_DATES = [
  '2026-11-20',
  '2026-11-21',
  '2026-11-22',
  '2026-12-24',
  '2026-12-25',
  '2026-12-26',
  '2026-12-27',
  '2026-12-31',
  '2027-01-01',
];

export const isSoldOutEverywhere = (isoDate: string) => SOLD_OUT_DATES.includes(isoDate);

/**
 * Sanatoriums with no free places for a while: [first night, first free night).
 * [ПРИМЕР ДАННЫХ — из системы бронирования]
 */
export const CLOSED: Record<string, [string, string][]> = {
  upa: [['2026-10-01', '2026-11-23']],
  'spa-vilnius': [['2026-10-01', '2026-12-01']],
};

/** This sanatorium has places for the night of this date. */
export const nightFree = (hotelId: string, isoDate: string) =>
  !isSoldOutEverywhere(isoDate) && !(CLOSED[hotelId] || []).some(([a, b]) => isoDate >= a && isoDate < b);

/** Every night of the stay has places in this sanatorium. */
export function stayFree(hotelId: string, checkin: string, nights: number) {
  const a = toD(checkin);
  for (let i = 0; i < nights; i++) if (!nightFree(hotelId, iso(addD(a, i)))) return false;
  return true;
}

export interface Stay {
  checkin: string;
  checkout: string;
  nights: number;
}

/**
 * The nearest stays of the same length with places — before or after the wanted date, from
 * 3 days after today, a couple of days apart. With the flight package both days are flight days.
 */
export function nearestStays(
  hotelId: string,
  checkin: string,
  nights: number,
  { flights = false, count = 3 }: { flights?: boolean; count?: number } = {},
): Stay[] {
  const want = toD(checkin);
  const starts: Date[] = [];
  for (let s = -45; s <= 180; s++) {
    const a = addD(want, s);
    if (a > addD(TODAY, 2)) starts.push(a);
  }
  starts.sort((x, y) => Math.abs(daysBetween(want, x)) - Math.abs(daysBetween(want, y)) || x.getTime() - y.getTime());
  const found: Date[] = [];
  for (const a of starts) {
    if (found.length >= count) break;
    if (flights && !(isFlightDay(a) && isFlightDay(addD(a, nights)))) continue;
    if (found.some((f) => Math.abs(daysBetween(f, a)) < 2)) continue;
    if (stayFree(hotelId, iso(a), nights)) found.push(a);
  }
  return found
    .sort((x, y) => x.getTime() - y.getTime())
    .map((a) => ({ checkin: iso(a), checkout: iso(addD(a, nights)), nights }));
}
