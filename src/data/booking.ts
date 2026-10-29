/** Shape of the guest's order as it moves through the booking steps. */
export interface Booking {
  /** resort key, e.g. "druskininkai" */
  dest: string;
  /** ISO dates, check-in / check-out */
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  hotelId: string;
  /** room type id within the hotel */
  roomId: string;
  /** treatment programme id: "midi" | "maxi" | "premium" */
  programId: string;
  transfer: {
    mode: 'group' | 'individual' | 'none';
    /** also back to the airport / station on check-out day */
    back: boolean;
    /** pick-up place id (see data/transfer PICKUP_PLACES) */
    place: string;
    /** drop-off place on the way back */
    backPlace: string;
    /** vehicle for an individual transfer */
    vehicle: string;
  };
  /** "Дорога" step: our flight in the order / own tickets / asked a consultant to help */
  flights: 'yes' | 'no' | 'help' | null;
  /** package: flight Tel Aviv ⇄ Vilnius + group transfer, chosen in the search */
  flightPackage: boolean;
  /**
   * What the guest has really chosen in the search card: '' (nothing yet), 'resort:<id>' or
   * 'san:<hotel id>'. The home page keeps the field empty until then and shows what to do next.
   */
  chosenPlace: string;
  /** the guest has picked the dates themselves (until then the home page shows empty date fields) */
  chosenDates: boolean;
}

/** Defaults = the example order used throughout the prototype. [ПРИМЕР ДАННЫХ] */
export const DEFAULT_BOOKING: Booking = {
  dest: 'druskininkai',
  checkin: '2026-11-09',
  checkout: '2026-11-18',
  adults: 2,
  children: 0,
  hotelId: 'egle-comfort',
  roomId: 'double',
  programId: 'midi',
  transfer: { mode: 'group', back: true, place: 'vilnius', backPlace: 'vilnius', vehicle: 'car' },
  flights: null,
  flightPackage: false,
  chosenPlace: '',
  chosenDates: false,
};
