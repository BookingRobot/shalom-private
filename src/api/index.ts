/**
 * Data access layer.
 *
 * Today every function returns sample data from src/data (synchronously).
 * When the BookingRobot API is connected, replace the bodies here with real
 * requests — pages only talk to `api`, so they don't need to change.
 */
import { POPULAR_SANATORIUMS } from '../data/popular';
import { EXTRA_PROGRAMS, ROOM_SETS, SANATORIUMS } from '../data/sanatoriums';
import {
  EGLE_ABOUT,
  EGLE_ALL_PHOTOS,
  EGLE_PHOTOS,
  EGLE_PROGRAMS,
  EGLE_ROOMS,
  EGLE_SPECIALIZATIONS,
  TRANSFER_CARS,
} from '../data/egleComfort';
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

  /** Sanatorium page: description, photos, rooms, programmes, transfer cars. */
  getSanatorium(_id: string) {
    return {
      about: EGLE_ABOUT,
      photos: EGLE_PHOTOS,
      allPhotos: EGLE_ALL_PHOTOS,
      programs: EGLE_PROGRAMS,
      rooms: EGLE_ROOMS,
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
