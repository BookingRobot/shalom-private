/**
 * Prices the way agents quote them: per person in a double room, plus the
 * single-room supplement, children and the optional flight package.
 * Base prices in data/ are for 2 adults sharing a room.
 * [ПРИМЕР ДАННЫХ — коэффициенты заменить тарифами санаториев и авиакомпании]
 */
import { fmt } from './format';

/** Single occupancy costs this much more per person than a place in a double room. */
export const SINGLE_SUPPLEMENT = 0.35;
/** A child (up to 17) with two adults: share of an adult place. */
export const CHILD_SHARE = 0.5;
/** Flight Tel Aviv ⇄ Vilnius, per person, return, with baggage. */
export const FLIGHT_PP = 320;
/** Group transfer airport ⇄ sanatorium, per person, both ways (in the package). */
export const PACKAGE_TRANSFER_PP = 60;

/** Deposit that fixes the price: per person for the sanatorium, plus per person for the flight. */
export const DEPOSIT_STAY_PP = 35;
export const DEPOSIT_FLIGHT_PP = 100;
/** The rest is due this many months before arrival; free cancellation until the same date. */
export const REST_DUE_MONTHS = 3;

export interface Guests {
  adults: number;
  children: number;
}

/** Price of one adult place in a double room, from a "for two" total. */
export const perPersonOf = (totalForTwo: number) => Math.round(totalForTwo / 2);

/** Price of one adult place for this party (single supplement when travelling alone). */
export function placePrice(totalForTwo: number, g: Guests) {
  const pp = perPersonOf(totalForTwo);
  return g.adults === 1 ? Math.round(pp * (1 + SINGLE_SUPPLEMENT)) : pp;
}

/** Stay + treatment for the whole party. */
export function stayTotal(totalForTwo: number, g: Guests) {
  const place = placePrice(totalForTwo, g);
  return place * g.adults + Math.round(perPersonOf(totalForTwo) * CHILD_SHARE) * g.children;
}

/**
 * Flight + group transfer for the whole party (package option). Without our transfer
 * when the sanatorium meets guests itself (see data/transferPolicy).
 */
export const flightPackage = (g: Guests, withTransfer = true) =>
  (FLIGHT_PP + (withTransfer ? PACKAGE_TRANSFER_PP : 0)) * (g.adults + g.children);

export const persons = (g: Guests) => g.adults + g.children;

/** Short label under a per-person price: "на человека в двухместном номере". */
export const placeLabel = (g: Guests) =>
  g.adults === 1 ? 'за одного · одноместное размещение' : 'на человека в двухместном номере';

/** "за двоих", "за 3 человек" … */
export function partyLabel(g: Guests) {
  const n = persons(g);
  if (n === 1) return 'за одного';
  if (n === 2) return 'за двоих';
  if (n === 3) return 'за троих';
  if (n === 4) return 'за четверых';
  return 'за ' + n + ' человек';
}

export const eur = (n: number) => fmt(n) + ' €';

/**
 * Payment plan agents use: a small deposit fixes the price now, the rest is paid
 * 3 months before arrival (free cancellation until then). Closer trips: the rest
 * is due 7 days before arrival; within 8 days of arrival — pay in full.
 */
export function paymentPlan(arrivalISO: string, g: Guests, withFlight: boolean, total: number, today: Date) {
  const arrival = new Date(arrivalISO + 'T00:00:00Z');
  const deposit = Math.min(total, (DEPOSIT_STAY_PP + (withFlight ? DEPOSIT_FLIGHT_PP : 0)) * persons(g));
  let due = new Date(Date.UTC(arrival.getUTCFullYear(), arrival.getUTCMonth() - REST_DUE_MONTHS, arrival.getUTCDate()));
  if (due.getTime() <= today.getTime() + 7 * 86400000) due = new Date(arrival.getTime() - 7 * 86400000);
  const fullOnly = due.getTime() <= today.getTime();
  return { deposit, rest: total - deposit, due, fullOnly };
}

/** Everything a price box shows for a "for two" tariff. */
export function quote(totalForTwo: number, g: Guests, withFlight: boolean, transferBySanatorium = false) {
  const place = placePrice(totalForTwo, g);
  const pkgPP = withFlight ? FLIGHT_PP + (transferBySanatorium ? 0 : PACKAGE_TRANSFER_PP) : 0;
  const stay = stayTotal(totalForTwo, g);
  const flight = withFlight ? flightPackage(g, !transferBySanatorium) : 0;
  return {
    /** per adult: stay (+ flight and transfer in the package) */
    perPerson: place + pkgPP,
    place,
    singleExtra: g.adults === 1 ? place - perPersonOf(totalForTwo) : 0,
    stay,
    flight,
    total: stay + flight,
    note: withFlight
      ? g.adults === 1
        ? 'за одного, всё включено · одноместное размещение'
        : 'на человека, всё включено · в двухместном номере'
      : placeLabel(g),
    party: partyLabel(g),
  };
}
