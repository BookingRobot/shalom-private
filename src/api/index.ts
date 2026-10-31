/**
 * Data access layer.
 *
 * `client` is what pages use: the asynchronous contract (client.ts, docs/openapi.yaml) —
 * the sample data (mock.ts) until VITE_API_URL points at BookingRobot (http.ts). Every page
 * renders loading / error / empty through `useApi` and `<AsyncBlock>`.
 *
 * `api` below is the synchronous sample data the mock is built from; pure helpers in
 * src/lib still read it directly. New page code goes through `client`.
 */
import { POPULAR_SANATORIUMS } from '../data/popular';
import type { ApiClient } from './client';
import { httpClient } from './http';
import { mockClient } from './mock';
import { EXTRA_PROGRAMS, ROOM_SETS, SANATORIUMS } from '../data/sanatoriums';
import { EGLE_ABOUT, EGLE_SPECIALIZATIONS, TRANSFER_CARS } from '../data/egleComfort';
import { hotelInfo } from '../data/hotelInfo';
import { roomsAndPrograms } from '../data/sanatoriumRooms';
import { ROOM_PROGRAMS, SELECTED_ROOM_PRICE } from '../data/programs';
import { PICKUP_PLACES, TRANSFER_PRICES, VEHICLES } from '../data/transfer';

export interface SearchQuery {
  dest: string;
  checkin: string;
  nights: number;
  adults: number;
}

export const api = {
  /** Home page: popular sanatoriums with "from" prices. */
  getPopularSanatoriums() {
    return POPULAR_SANATORIUMS;
  },

  /** Search results for a resort: sanatoriums, their room sets and extra programmes. */
  searchSanatoriums(_query: SearchQuery) {
    return { sanatoriums: SANATORIUMS, roomSets: ROOM_SETS, extraPrograms: EXTRA_PROGRAMS };
  },

  /** Sanatorium page: description, photos, tabs, rooms, programmes, transfer cars. */
  getSanatorium(id: string) {
    const info = hotelInfo(id);
    return {
      info,
      about: EGLE_ABOUT,
      photos: info.photos,
      allPhotos: info.photos,
      ...roomsAndPrograms(info.id),
      specializations: EGLE_SPECIALIZATIONS,
      transferCars: TRANSFER_CARS,
    };
  },

  /** Step 1: programmes available with the chosen room, and the room price. */
  getRoomPrograms(_hotelId: string, _roomId: string) {
    return { programs: ROOM_PROGRAMS, roomPrice: SELECTED_ROOM_PRICE };
  },

  /** Step 2: where we can pick guests up, prices and vehicles. */
  getTransferOptions() {
    return { places: PICKUP_PLACES, prices: TRANSFER_PRICES, vehicles: VEHICLES };
  },
};

export type { ApiClient, SearchResult, SanatoriumDetails, RoomPrograms, TransferOptions } from './client';
export type { Quote, QuoteLine, QuoteRequest, Draft, DraftStep, NightAvailability, FlightDay } from './types';
export { ApiError } from './types';

/** the API the pages talk to: BookingRobot when VITE_API_URL is set, else the sample data */
export const client: ApiClient = (() => {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  return url ? httpClient(url) : mockClient;
})();
