import type { Booking } from '../data/booking';
import { client } from './index';
import type { Quote, QuoteRequest } from './types';
import { useApi } from './useApi';

/** The order fields a price depends on (nothing else goes to the server). */
export const quoteRequestOf = (b: Booking): QuoteRequest => ({
  hotelId: b.hotelId,
  roomId: b.roomId,
  programId: b.programId,
  checkin: b.checkin,
  checkout: b.checkout,
  adults: b.adults,
  children: b.children,
  flightPackage: b.flightPackage,
  transfer: b.transfer,
});

/**
 * The price of the order from the one source that also makes the invoice (POST /quotes).
 * The summary boxes may show the local estimate while it loads; the amount charged at
 * payment is always this quote's.
 */
export function useQuote(b: Booking) {
  const req = quoteRequestOf(b);
  const key = JSON.stringify(req);
  return useApi<Quote>(() => client.quote(req), [key], !!(b.hotelId && b.roomId && b.programId));
}
