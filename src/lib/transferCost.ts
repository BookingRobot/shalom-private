import { api } from '../api';
import type { Booking } from '../data/booking';
import { freeTransferPlaces, transferBySanatorium } from '../data/transferPolicy';
import { PACKAGE_TRANSFER_PP } from './pricing';

/**
 * What a transfer costs the guest, leg by leg (there and, if asked, back):
 *  - free: the sanatorium's own group transfer from its cities (Eglė: Vilnius and Kaunas);
 *  - package: covered by the flight package (a group seat from Vilnius airport, both ways);
 *  - paid: our tariff — with the flight package only the difference above what it covers.
 * The full transfer choice is shown for every sanatorium; only the price changes.
 */
export type LegKind = 'free' | 'package' | 'paid';
export interface TransferLeg {
  place: string;
  /** what the guest pays for this leg */
  price: number;
  /** our tariff for this leg before anything is covered */
  full: number;
  kind: LegKind;
}

type T = Booking['transfer'];

export function legOf(b: Booking, place: string, t: T = b.transfer): TransferLeg {
  const { prices } = api.getTransferOptions();
  const P = prices as Record<string, Record<string, number>>;
  const p = P[place] || P.vilnius;
  const persons = b.adults + b.children;
  const full = t.mode === 'individual' ? (p[t.vehicle] ?? p.car) : p.seat * persons;
  if (t.mode === 'group' && freeTransferPlaces(b.hotelId).includes(place))
    return { place, price: 0, full, kind: 'free' };
  if (b.flightPackage && !transferBySanatorium(b.hotelId)) {
    // the package pays a group seat from Vilnius airport each way
    const covered = (PACKAGE_TRANSFER_PP / 2) * persons;
    const price = Math.max(0, full - covered);
    return { place, price, full, kind: price ? 'paid' : 'package' };
  }
  return { place, price: full, full, kind: 'paid' };
}

export function transferLegs(b: Booking, t: T = b.transfer) {
  // not answered yet (null) counts as no transfer
  const legs: TransferLeg[] =
    !t.mode || t.mode === 'none' || !t.place
      ? []
      : [legOf(b, t.place, t), ...(t.back && t.backPlace ? [legOf(b, t.backPlace, t)] : [])];
  const total = legs.reduce((n, l) => n + l.price, 0);
  return {
    legs,
    total,
    allFree: legs.length > 0 && legs.every((l) => l.kind === 'free'),
    allPackage: legs.length > 0 && legs.every((l) => l.kind === 'package'),
  };
}
