import { DEMO } from './demo';

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
  /**
   * «Дорога» → трансфер. Nothing is chosen for the guest: null / '' = not answered yet
   * (the step asks every question with empty choices). `mode` is what the order counts.
   */
  transfer: {
    mode: 'group' | 'individual' | 'none' | null;
    /** «Нужен ли трансфер?» */
    need: boolean | null;
    /** together with other guests or a car of your own */
    how: 'group' | 'individual' | null;
    /** also back on check-out day */
    back: boolean | null;
    /** pick-up city id (see data/transfer PICKUP_PLACES) */
    place: string;
    /** where exactly in that city: airport, station, hotel */
    spot: string;
    /** back to the same place (true) or another one (false) */
    backSame: boolean | null;
    /** drop-off city id on the way back */
    backPlace: string;
    backSpot: string;
    /** vehicle for an individual transfer */
    vehicle: string;
  };
  /** "Дорога" step: our flight in the order / own tickets / asked a consultant to help */
  flights: 'yes' | 'no' | 'help' | null;
  /** package: flight Tel Aviv ⇄ Vilnius + group transfer, chosen in the search */
  flightPackage: boolean;
  /** the guest has answered the flight question on the "Дорога" step themselves (nothing is marked for them) */
  flightAsked: boolean;
  /**
   * What the guest has really chosen in the search card: '' (nothing yet), 'resort:<id>' or
   * 'san:<hotel id>'. The home page keeps the field empty until then and shows what to do next.
   */
  chosenPlace: string;
  /** the guest has picked the dates themselves (until then the home page shows empty date fields) */
  chosenDates: boolean;
  /**
   * The last step the guest finished with «Далее»: 0 — nothing yet, 1 — room and programme,
   * 2 — the road, 3 — guests, 4 — paid. A step opens only when the one before it is done
   * (StepGuard); the sample order in demo mode counts as finished.
   */
  progress: 0 | 1 | 2 | 3 | 4;
  /** step 3's form as the page keeps it (names, dates of birth, phone) */
  details?: GuestDetails;
  /** what the guest paid on step 4: the deposit or the whole sum (set on «Оплатить») */
  paid?: 'adv' | 'full';
}

/** Step 3's form: names as in the passport, dates of birth, the contact phone. */
export interface GuestDetails {
  dob: Record<string, { y: number; m: number; d: number }>;
  names: { g1fn: string; g1ln: string; g2fn: string; g2ln: string };
  phoneCode: string;
  phone: string;
}

/** The sample order the prototype shows in demo mode. [ПРИМЕР ДАННЫХ] */
export const SAMPLE_BOOKING: Booking = {
  dest: 'druskininkai',
  checkin: '2026-11-09',
  checkout: '2026-11-18',
  adults: 2,
  children: 0,
  hotelId: 'egle-comfort',
  roomId: 'double',
  programId: 'midi',
  transfer: {
    mode: null,
    need: null,
    how: null,
    back: null,
    place: '',
    spot: '',
    backSame: null,
    backPlace: '',
    backSpot: '',
    vehicle: '',
  },
  flights: null,
  flightPackage: false,
  flightAsked: false,
  chosenPlace: '',
  chosenDates: false,
  progress: 4,
};

/** Off demo the order starts empty: nothing chosen, no step done. */
export const EMPTY_BOOKING: Booking = {
  ...SAMPLE_BOOKING,
  hotelId: '',
  roomId: '',
  programId: '',
  progress: 0,
};

export const DEFAULT_BOOKING: Booking = DEMO ? SAMPLE_BOOKING : EMPTY_BOOKING;
