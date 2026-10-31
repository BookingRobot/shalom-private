import type { ChangeEvent } from 'react';
import type { CalendarCell, CalendarMonth } from '../../components/calendar/MonthsCalendar';
import type { CompareHotel } from '../../components/Compare';
import type { RoomOfferVM } from '../../components/RoomCard';
import type { StaffRole } from '../../data/team';

export type SortKey = 'pop' | 'cheap' | 'exp';
/** filter flags: key → on */
export type Flags = Record<string, boolean>;
export interface PriceRange {
  min?: number;
  max?: number;
}

/** the «Когда дешевле?» pop-up: which sanatorium (and room), the month shown, the picked day */
export interface PriceCalState {
  id: string;
  picked?: string;
  month?: number;
  year?: number;
  note?: string | null;
  roomKey?: string;
  roomName?: string;
}

/** UI state of the results page (PageLogic.state) */
export interface ResultsState {
  checkin: string;
  nights: number;
  sort: SortKey;
  /** sanatoriums whose rooms are open / folding away */
  open: Record<string, boolean>;
  closing: Record<string, boolean>;
  /** room card details open (hotel-n) */
  det: Record<string, boolean>;
  /** folded sections per sanatorium (id + 'spec' | 'time' | 'tr') */
  sec: Record<string, boolean>;
  /** applied / pending filter flags and price range */
  f: Flags;
  pf: Flags;
  pr: PriceRange;
  ppr: PriceRange;
  /** «Дополнительные фильтры» open; the whole panel open */
  more: boolean;
  fo?: boolean;
  /** the «Помогите выбрать» wizard */
  wz: boolean;
  /** sanatoriums ticked for comparison */
  cmp?: string[];
  /** the «посмотрите номера» / «выберите номер» bubbles were closed */
  rmTipX?: boolean;
  roomTipX?: boolean;
  lastOpen?: string;
  /** programme picked per room card (hotel-n → index) */
  ps?: Record<string, number>;
  cal?: PriceCalState | null;
  /** the search calendar (two months): open, a room's free dates, note, selection, month shown, flexible mode */
  sOpen?: boolean;
  sRoom?: { key: string; name: string; hotel: string } | null;
  sNote?: string | null;
  ss?: { in: string | null; out: string | null };
  sm?: number;
  sy?: number;
  sFlex?: boolean;
}

export interface Chip {
  t: string;
  d: string;
}
export interface FilterItem {
  k: string;
  t: string;
  d?: string;
  on: boolean;
  cls?: string;
  n?: number;
  toggle: () => void;
}
export interface OneOfItem {
  k: string;
  t: string;
  on: boolean;
  pick: () => void;
}
export interface ActiveChip {
  t: string;
  off: () => void;
}

/** one sanatorium on the list */
export interface HotelVM extends CompareHotel {
  sub: string;
  pop: number;
  stars: string;
  team: StaffRole[];
  ppn: number;
  advMin: number;
  price: string;
  procT: string;
  procSub: string;
  incRest: Chip[];
  open: boolean;
  closing: boolean;
  tipOn: boolean;
  border: string;
  btnLabel: string;
  chips: Chip[];
  chev: string;
  btnCls: string;
  toggle: () => void;
  openCal: () => void;
  cmpOn: boolean;
  cmpOff: boolean;
  cmpToggle: () => void;
  specOpen: boolean;
  toggleSpec: () => void;
  timeOpen: boolean;
  toggleTime: () => void;
  trOpen: boolean;
  toggleTr: () => void;
  offers: RoomOfferVM[];
  trNote: string;
}

/** a sanatorium with no places on the chosen dates */
export interface SoldHotelVM {
  id: string;
  name: string;
  stars: string;
  sub: string;
  img: string;
  next: string;
  chips: Chip[];
  notify: () => void;
}

/** the «Когда дешевле?» pop-up, built only while it is open */
export interface PriceCalVM {
  note?: string;
  applyOff?: boolean;
  hotelName?: string;
  room?: string;
  prog?: string;
  curPpn?: number;
  monthTitle?: string;
  cells: CalendarCell[];
  newIn?: string;
  newOut?: string;
  newPpn?: number;
  newTotal?: string;
  curTotal?: string;
  newRange?: string;
  diffText?: string;
  diffBg?: string;
  diffColor?: string;
}

export interface PriceCalVals {
  calOpen: boolean;
  cal: PriceCalVM;
  curRange: string;
  dateRange: string;
  checkinISO: string;
  checkoutISO: string;
  calClose: () => void;
  calPrev: () => void;
  calNext: () => void;
  calApply: () => void;
  calNoteClose: () => void;
  calNoteAsk: () => void;
}

export interface SearchCalVals {
  nightsLabel: string;
  sInLabel: string;
  sOutLabel: string;
  sCalOpen: boolean;
  sCalNote: string;
  sCalNoteClose: () => void;
  sCalNoteAsk: () => void;
  sOpenCal: () => void;
  sCloseCal: () => void;
  sFlex: boolean;
  setSFlex: (flex: boolean) => void;
  sFlexPick: (a: string, b: string) => void;
  sCalTitle: string;
  sRoomLine: string;
  sCalPrev: () => void;
  sCalNext: () => void;
  sMonths: CalendarMonth[];
  sCalHint: string;
  sSelIn: string;
  sSelOut: string;
  sSelNights: string;
  sApplyOff: boolean;
  sApplyCal: () => void;
}

export interface FilterVals {
  hasActive: boolean;
  active: ActiveChip[];
  fTop: FilterItem[];
  fComfort: FilterItem[];
  fStars: FilterItem[];
  fProfile: FilterItem[];
  fBeds: FilterItem[];
  fMeals: OneOfItem[];
  fProcs: OneOfItem[];
  fRoom: OneOfItem[];
  moreOpen: boolean;
  moreClosed: boolean;
  toggleMore: () => void;
  fOpen: boolean;
  fClosed: boolean;
  openF: () => void;
  closeF: () => void;
  fBadge: string;
  appliedSummary: string;
  pMin: number | '';
  pMax: number | '';
  setMin: (e: ChangeEvent<HTMLInputElement>) => void;
  setMax: (e: ChangeEvent<HTMLInputElement>) => void;
  pendCount: string;
  applyLabel: string;
  apply: () => void;
  clearPending: () => void;
  reset: () => void;
  sort: SortKey;
  setSort: (e: ChangeEvent<HTMLSelectElement>) => void;
}

/** everything the results page renders */
export interface ResultsVals extends PriceCalVals, SearchCalVals, FilterVals {
  soldHotels: SoldHotelVM[];
  soldCount: string;
  rmTipClose: () => void;
  wzOpen: boolean;
  wzOpenFn: () => void;
  wzClose: () => void;
  wzShow: (r: { filters: Flags; hotelId: string }) => void;
  cmpLimit: number;
  cmpIds: string[];
  cmpHotels: HotelVM[];
  cmpRemove: (id: string) => void;
  cmpClear: () => void;
  guestsLine: string;
  hotels: HotelVM[];
  none: boolean;
  foundLabel: string;
}
