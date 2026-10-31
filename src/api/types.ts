/**
 * The contract between the site and BookingRobot (docs/openapi.yaml is the same contract
 * written for the server side). Pages only see these shapes; where the data comes from
 * (the mock in src/data or the real API) is decided in src/api/index.ts.
 */
import type { Booking } from '../data/booking';

/** One line of a price quote, in whole euros, the way the invoice will show it. */
export interface QuoteLine {
  /** stable key: stay | child | single | flight | transfer-there | transfer-back */
  key: string;
  /** label in the guest's language, e.g. «Проживание и лечение, 2 чел.» */
  label: string;
  /** unit price × qty = amount; qty 1 when it is one thing */
  qty: number;
  unit: number;
  amount: number;
  /** a line the guest does not pay for (the sanatorium's own transfer, the package) */
  note?: string;
}

/** What the guest pays: all lines, the total, and the deposit that fixes the price. */
export interface Quote {
  currency: 'EUR';
  lines: QuoteLine[];
  total: number;
  /** one adult place — the number agents quote */
  perPerson: number;
  deposit: number;
  rest: number;
  /** ISO date the rest is due; free cancellation until then */
  dueDate: string;
  /** the trip is too close for a deposit: the whole sum is due now */
  fullOnly: boolean;
  /** the tariff the quote was made from; a changed tariff makes a new quote */
  tariffVersion: string;
}

/** The order fields a quote depends on. */
export type QuoteRequest = Pick<
  Booking,
  'hotelId' | 'roomId' | 'programId' | 'checkin' | 'checkout' | 'adults' | 'children' | 'flightPackage' | 'transfer'
>;

/** Where the guest is in the four steps. */
export type DraftStep = 'rooms' | 'transfer' | 'guests' | 'payment' | 'done';

/**
 * The order's draft on the server: the same for every device and for the consultant.
 * `code` is the short order code in the address (/order/K7F2M).
 */
export interface Draft {
  code: string;
  booking: Booking;
  step: DraftStep;
  /** step 3 form (names, dates of birth, phone) as the page keeps it */
  details?: Record<string, unknown>;
  /** ISO timestamps */
  createdAt: string;
  updatedAt: string;
}

/** One night's availability of a sanatorium. */
export interface NightAvailability {
  date: string;
  free: boolean;
}

export interface FlightDay {
  date: string;
  /** flight numbers there and back on that day */
  there?: string;
  back?: string;
}

/** Every API failure the pages show to the guest. */
export class ApiError extends Error {
  constructor(
    public readonly kind: 'network' | 'not-found' | 'server' | 'bad-request',
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
