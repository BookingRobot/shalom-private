import type { CalendarMonth } from '../../components/calendar/MonthsCalendar';
import type { Amenity } from '../../data/iconPaths';
import type { HotelInfo } from '../../data/hotelInfo';
import type { RoomPhoto } from '../../data/roomPhotos';
import type { HotelTab } from '../../components/hotel/HotelTabs';

/** A programme as the data layer gives it (price for two, list text). */
export interface HotelProgram {
  n: number;
  title: string;
  prog: Amenity[];
  price: string | number;
  details: string;
  top?: boolean;
}

/** A programme priced for the chosen dates. */
export interface PricedProgram extends HotelProgram {
  priceN: number;
  meals: string;
}

/** A room type as the data layer gives it. */
export interface HotelRoom {
  n: number;
  top?: boolean;
  name: string;
  line: string;
  add: number;
  img: string;
  amen?: Amenity[];
}

/** One "what you get" tile in the open room card. */
export interface ValueTile {
  d: string;
  big: string;
  label: string;
  sub: string;
}

/** A programme row inside the open room card. */
export interface ProgramRow {
  name: string;
  sub: string;
  price: string;
  diff: string;
  diffColor: string;
  border: string;
  bg: string;
  dot: string;
  pick: () => void;
}

export interface DetailLine {
  t: string;
  fw: number;
  pl: string;
  mt: string;
}

/** A room card on the sanatorium page (what RoomCard renders). */
export interface RoomOffer extends HotelRoom {
  photos: RoomPhoto[];
  room: string;
  short: string;
  roomLine: string;
  cardBorder: string;
  cardBg: string;
  imgFilter: string;
  pillBg: string;
  pillColor: string;
  nameColor: string;
  busy: boolean;
  avail: boolean;
  busyRange: string;
  nextFree: string;
  choose: () => void;
  openRoomCal: () => void;
  pill: string;
  progLine: string;
  price: string;
  adv: number;
  ppn: number;
  prog: Amenity[];
  value: ValueTile[];
  detLines: DetailLine[];
  progRows: ProgramRow[];
  roomText: string;
  selName: string;
  selPrice: string;
  detBtn: string;
  detChev: string;
  border: string;
  detOpen: boolean;
  toggleDet: () => void;
}

export interface RoomOfferTip extends RoomOffer {
  cheapest: boolean;
  tip: boolean;
  tipClose: () => void;
}

/** Check-in / check-out times and the notes under them. */
export interface StayTimes {
  checkin: string;
  checkinDate: string;
  checkout: string;
  checkoutDate: string;
  notes: { t: string; s: string; d: string }[];
}

export interface Specialization {
  t: string;
  s: string;
  d: string;
}

export interface NearDate {
  label: string;
  sub: string;
  pick: () => void;
}

export interface PhotoTile {
  src: string;
  label: string;
}

export interface NumberedPhoto {
  src: string;
  alt: string;
  n: number;
}

/** UI state of the sanatorium page. */
export interface HotelState {
  /** index of the main photo */
  i: number;
  /** open room cards, by room number */
  det: Record<number, boolean>;
  /** open fold-out rows: tr / time / spec / food */
  sec: Record<string, boolean>;
  /** chosen programme per room, by room number */
  ps?: Record<number, number>;
  in: string;
  out: string;
  hid: string;
  tab: HotelTab;
  /** the «Когда дешевле?» calendar */
  cal?: boolean;
  calRoom?: string | null;
  calRoomName?: string | null;
  note?: string | null;
  sel?: { in: string | null; out: string | null };
  month?: number;
  year?: number;
  flex?: boolean;
  /** full-screen gallery */
  lb?: boolean;
  /** «Следующий шаг» bubble on the cheapest room closed */
  roomTipX?: boolean;
}

/** Everything the calendar window needs. */
export interface HotelCalendarVals {
  calOpen: boolean;
  calNote: string;
  calNoteClose: () => void;
  calNoteAsk: () => void;
  flexMode: boolean;
  setFlex: (flex: boolean) => void;
  flexPick: (a: string, b: string) => void;
  selIn: string;
  selOut: string;
  selNights: string;
  openCal: () => void;
  closeCal: () => void;
  calPrev: () => void;
  calNext: () => void;
  months: CalendarMonth[];
  calHint: string;
  newTotal: string;
  diffText: string;
  diffColor: string;
  applyOff: boolean;
  applyCal: () => void;
  calRoomOn: boolean;
  calRoomName: string;
}

/** The view-model of the sanatorium page. */
export interface HotelVals extends HotelCalendarVals {
  dateRange: string;
  guestsWho: string;
  nightsLabel: string;
  freeTr: string;
  offers: RoomOfferTip[];
  noRooms: boolean;
  naOn: boolean;
  naTitle?: string;
  naText?: string;
  naDates: NearDate[];
  helpOpen: () => void;
  info: HotelInfo;
  tab: HotelTab;
  setTab: (k: HotelTab) => void;
  toRooms: () => void;
  openPhoto: (k: number) => void;
  strip: string[];
  tiles: PhotoTile[];
  trTitle: string;
  specs: Specialization[];
  times: StayTimes;
  specOpen: boolean;
  toggleSpec: () => void;
  timeOpen: boolean;
  toggleTime: () => void;
  trOpen: boolean;
  toggleTr: () => void;
  lightbox: boolean;
  closeLb: () => void;
  pickAll: () => void;
  photoCount: number;
  allPhotos: NumberedPhoto[];
  pick0: () => void;
  pick1: () => void;
  pick2: () => void;
}
