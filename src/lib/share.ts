import type { Booking } from '../data/booking';

/**
 * A shared offer is a plain link: the booking's key choices in the query string,
 * read back on load (BookingContext), so "посоветоваться с семьёй" opens the same
 * sanatorium, room, programme, dates and guests on any phone.
 */
export function offerLink(b: Booking, path = '/rooms') {
  const q = new URLSearchParams({
    offer: '1',
    h: b.hotelId,
    r: b.roomId,
    p: b.programId,
    in: b.checkin,
    out: b.checkout,
    a: String(b.adults),
    c: String(b.children),
    f: b.flightPackage ? '1' : '0',
  });
  return window.location.origin + path + '?' + q.toString();
}

/** Booking fields from an offer link, or null when the URL is not one. */
export function bookingFromUrl(search: string): Partial<Booking> | null {
  const q = new URLSearchParams(search);
  if (!q.has('offer')) return null;
  const isoOk = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined);
  const num = (s: string | null, min: number, max: number) => {
    const n = Number(s);
    return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
  };
  const out: Partial<Booking> = {
    hotelId: q.get('h') || undefined,
    roomId: q.get('r') || undefined,
    programId: q.get('p') || undefined,
    checkin: isoOk(q.get('in')),
    checkout: isoOk(q.get('out')),
    adults: num(q.get('a'), 1, 4),
    children: num(q.get('c'), 0, 3),
    flightPackage: q.get('f') === '1',
  };
  // an offer is a finished search: the home page shows its sanatorium and dates as chosen
  if (out.hotelId) out.chosenPlace = 'san:' + out.hotelId;
  if (out.checkin && out.checkout) out.chosenDates = true;
  Object.keys(out).forEach((k) => (out as any)[k] === undefined && delete (out as any)[k]);
  return out;
}
