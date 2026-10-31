/**
 * The asynchronous API the pages talk to. Two implementations: `mock.ts` (sample data from
 * src/data, used until BookingRobot is connected) and `http.ts` (the real server, chosen by
 * VITE_API_URL). Every method may take time and may fail — pages render the three states
 * (loading / error / empty) through `useApi` and `<AsyncBlock>`.
 */
import type { api, SearchQuery } from './index';
import type { Draft, DraftStep, FlightDay, NightAvailability, Quote, QuoteRequest } from './types';
import type { Booking } from '../data/booking';

/** Shapes the sample data already has; the real API returns the same. */
export type SearchResult = ReturnType<typeof api.searchSanatoriums>;
export type SanatoriumDetails = ReturnType<typeof api.getSanatorium>;
export type RoomPrograms = ReturnType<typeof api.getRoomPrograms>;
export type TransferOptions = ReturnType<typeof api.getTransferOptions>;
export type PopularSanatorium = ReturnType<typeof api.getPopularSanatoriums>[number];

export interface ApiClient {
  /** Home page: popular sanatoriums with "from" prices. */
  getPopularSanatoriums(): Promise<PopularSanatorium[]>;
  /** Search results for a resort: sanatoriums, their room sets and extra programmes. */
  searchSanatoriums(query: SearchQuery): Promise<SearchResult>;
  /** Sanatorium page: description, photos, tabs, rooms, programmes, transfer cars. */
  getSanatorium(id: string): Promise<SanatoriumDetails>;
  /** Step 1: programmes available with the chosen room, and the room price. */
  getRoomPrograms(hotelId: string, roomId: string): Promise<RoomPrograms>;
  /** Step 2: where we can pick guests up, prices and vehicles. */
  getTransferOptions(): Promise<TransferOptions>;
  /** Nights with places in a sanatorium between two dates (inclusive start, exclusive end). */
  getAvailability(hotelId: string, from: string, to: string): Promise<NightAvailability[]>;
  /** Days our partner flight flies in a date range. */
  getFlightDays(from: string, to: string): Promise<FlightDay[]>;
  /** The price of an order: every line, the total and the deposit — computed by the server. */
  quote(req: QuoteRequest): Promise<Quote>;
  /** Order drafts: one short code opens the same order on any device. */
  createDraft(booking: Booking, step: DraftStep): Promise<Draft>;
  getDraft(code: string): Promise<Draft>;
  saveDraft(code: string, patch: Partial<Pick<Draft, 'booking' | 'step' | 'details'>>): Promise<Draft>;
}
