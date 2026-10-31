import { MONTHS, addD, daysBetween, nightsWord, shortDate, toD } from '../../lib/dates';
import { toNum } from '../../lib/format';
import { ICON_PATHS } from '../../data/iconPaths';
import type { HotelProgram, PricedProgram, ValueTile } from './hotelTypes';

/*
 * Dates & price model of the sanatorium page: a synthetic season curve, calibrated so that
 * 9–18 Nov equals the list price. [ЗАМЕНИТЬ НА ТАРИФЫ — prices will come from BookingRobot]
 */
const BASE_IN = toD('2026-11-09');
/** list price of «Миди» for two, 9 nights — the curve's anchor */
const ANCHOR_PRICE = 2138;
const ANCHOR_NIGHTS = 9;
/** share of the stay paid now as a deposit */
export const ADV_RATE = 0.04;

/** season factor of one night */
export const seasonFactor = (d: Date) => {
  const n = daysBetween(BASE_IN, d),
    wd = d.getUTCDay();
  return (
    1 +
    0.11 * Math.sin(n * 0.55 + 1.1) +
    (wd === 5 || wd === 6 ? 0.07 : 0) +
    (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
  );
};

const sumFactor = (a: Date, n: number) => {
  let t = 0;
  for (let i = 0; i < n; i++) t += seasonFactor(addD(a, i));
  return t;
};

/** € per person-night at factor 1 for «Миди» */
const K = ANCHOR_PRICE / (2 * sumFactor(BASE_IN, ANCHOR_NIGHTS));

/** price for two of a programme (list price) on the given dates */
export const totalFor = (a: Date, n: number, listPrice: number) =>
  Math.round((listPrice / ANCHOR_PRICE) * 2 * K * sumFactor(a, n));

/** price per person per night on a given day («Миди») */
export const ppnDay = (d: Date) => Math.round(K * seasonFactor(d));

/** price per person-night for the anchor programme on the chosen dates */
export const anchorPpn = (checkin: Date, nights: number) =>
  Math.round(totalFor(checkin, nights, ANCHOR_PRICE) / nights / 2);

export const anchorTotal = (checkin: Date, nights: number) => totalFor(checkin, nights, ANCHOR_PRICE);

/** «9–18 ноября» or «28 ноября – 3 декабря» */
export const rangeLabel = (a: Date, b: Date) =>
  a.getUTCMonth() === b.getUTCMonth()
    ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()]
    : shortDate(a) + ' – ' + shortDate(b);

/** programmes priced for the dates, cheapest first */
export function priceProgramsFor(programs: HotelProgram[], checkin: Date, nights: number): PricedProgram[] {
  return programs
    .map((p) => ({
      ...p,
      priceN: totalFor(checkin, nights, toNum(p.price)),
      meals: p.prog.some((x) => /пансион/i.test(x.t)) ? 'полный пансион' : 'питание 3 раза',
    }))
    .sort((a, b) => a.priceN - b.priceN);
}

const procWord = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? 'процедура'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? 'процедуры'
      : 'процедур';

/** the "what you get" tiles of a programme in a room */
export function valueTiles(p: HotelProgram, nights: number, roomName: string): ValueTile[] {
  const pm = String(p.title).match(/(\d+) процедур/);
  const nProc = pm ? Number(pm[1]) : 0;
  const perDay = /в день/.test(p.title);
  const progT = p.prog.map((x) => x.t).join(' ');
  const tiles: (ValueTile | null)[] = [
    nProc
      ? {
          d: ICON_PATHS.proc,
          big: String(nProc),
          label: perDay ? procWord(nProc) + ' в день' : procWord(nProc) + ' за заезд',
          sub: perDay
            ? nProc * nights + ' ' + procWord(nProc * nights) + ' за весь заезд · по назначению врача'
            : 'по назначению врача',
        }
      : null,
    /массаж/i.test(progT)
      ? { d: ICON_PATHS.massage, big: String(nights), label: 'массажей', sub: 'классический массаж каждый день' }
      : null,
    /питани|пансион/i.test(progT)
      ? {
          d: ICON_PATHS.meals,
          big: /пансион/i.test(progT) ? '4' : '3',
          label: 'приёма пищи в день',
          sub: /пансион/i.test(progT) ? 'полный пансион, диетическое меню' : 'завтрак, обед, ужин · шведский стол',
        }
      : null,
    /врач/i.test(progT)
      ? { d: ICON_PATHS.doctor, big: '1', label: 'консультация врача', sub: 'при заезде · говорит по-русски' }
      : null,
    /бассейн|бан/i.test(progT)
      ? { d: ICON_PATHS.pool, big: '∞', label: 'бассейны и сауны', sub: 'каждый день, без ограничений' }
      : null,
    { d: ICON_PATHS.bed2, big: String(nights), label: nightsWord(nights) + ' в номере', sub: roomName },
  ];
  return tiles.filter((t): t is ValueTile => t !== null);
}
