import { api } from '../../api';
import { fmt } from '../../lib/format';
import { orderSummary } from '../../lib/orderSummary';
import { WEEKDAYS_SHORT, shortDate, toD } from '../../lib/dates';
import { PageLogic, type PageServices } from '../../lib/pageLogic';
import type { Missing } from '../../components/StepNext';
import { freeTransferPlaces, sanatoriumTransferName, transferBySanatorium } from '../../data/transferPolicy';
import { legOf, transferLegs } from '../../lib/transferCost';
import { FLIGHT_BACK, FLIGHT_THERE, flightLine } from '../../data/flights';
import type { Booking } from '../../data/booking';
import * as T from './transferTexts';

/** pick-up spot → the same spot on the way back: «Из аэропорта Вильнюса» → «В аэропорт Вильнюса» */
export const toBack = (t: string) =>
  t
    .replace(/^Из аэропорта/, 'В аэропорт')
    .replace(/^С ЖД вокзала/, 'На ЖД вокзал')
    .replace(/^С автовокзала/, 'На автовокзал')
    .replace(/^От отеля/, 'В отель');

type Tr = Booking['transfer'];
type How = 'group' | 'individual';
type InputEv = { target: { value: string } };

/** the page's own state: the guest's answers (nothing is chosen until they answer) */
export interface TransferState {
  need?: boolean | null;
  how?: How | null;
  city?: string;
  spot?: string;
  vehicle?: string;
  back?: boolean | null;
  backSame?: boolean | null;
  backCity?: string;
  backSpot?: string;
  /** the «are you sure?» window after «Нет, доберусь сам» */
  askNo?: boolean;
  /** «Подробнее о встрече и поездке» is open */
  more?: boolean;
  /** typed flight lines (arrival / departure) */
  flIn?: string;
  flBack?: string;
}

/** what is really chosen, after the flight package and the known places are taken into account */
export interface TransferEff {
  pkg: boolean;
  city: string;
  cur: PickupCity | undefined;
  spot: string;
  need: boolean | null;
  how: How | null;
  vehicle: string;
  back: boolean | null;
  backSame: boolean | null;
  backCity: string;
  backCur: PickupCity | undefined;
  backPlaces: string[];
  backSpot: string;
  mode: Tr['mode'];
}

type PickupCity = ReturnType<typeof api.getTransferOptions>['places'][number];
type Vehicle = ReturnType<typeof api.getTransferOptions>['vehicles'][number];

export interface CityChoice extends PickupCity {
  on: boolean;
  cls: string;
  paid: string;
  pick: () => void;
}
export interface BackCityChoice extends PickupCity {
  cls: string;
  paid: string;
  pick: () => void;
}
export interface VehicleChoice extends Vehicle {
  price: string;
  cls: string;
  pick: () => void;
}

/** everything the page's JSX needs: labels, flags, lists and handlers */
export interface TransferVals {
  ourFlight: boolean;
  flightIn: string;
  flightBack: string;
  setFlightIn: (ev: InputEv) => void;
  setFlightBack: (ev: InputEv) => void;
  // 1. is a transfer needed
  need: boolean;
  noNeed: boolean;
  yesCls: string;
  noCls: string;
  sayYes: () => void;
  sayNo: () => void;
  askNo: boolean;
  confirmNo: () => void;
  keepTransfer: () => void;
  paidBy: string;
  yesTitle: string;
  yesInfo: string;
  noSub: string;
  withNote: string;
  transferLead: string;
  // 2. from where
  inDay: string;
  fromNote: string;
  fromInfo: string;
  cities: CityChoice[];
  cityChosen: boolean;
  howChosen: boolean;
  howNote: string;
  cityName: string;
  places: { t: string }[];
  spot: string;
  fromHotel: boolean;
  pickSpot: (ev: InputEv) => void;
  // 3. how
  groupCls: string;
  indCls: string;
  pickGroupHow: () => void;
  pickIndHow: () => void;
  isGroup: boolean;
  isInd: boolean;
  seatPaid: string;
  seatPrice: string;
  seatNote: string;
  seatTotal: string;
  guestsLabel: string;
  indFrom: string;
  vehicles: VehicleChoice[];
  // 4. back
  outDay: string;
  outWeekday: string;
  hotelShort: string;
  backYesCls: string;
  backNoCls: string;
  pickBackYes: () => void;
  pickBackNo: () => void;
  backOn: boolean;
  backPaid: string;
  backSub: string;
  sameCls: string;
  otherCls: string;
  pickSame: () => void;
  pickOther: () => void;
  backSame: boolean;
  backOther: boolean;
  sameInfo: string;
  backCities: BackCityChoice[];
  backCityChosen: boolean;
  backPlaces: { t: string }[];
  backSpot: string;
  pickBackSpot: (ev: InputEv) => void;
  moreOpen: boolean;
  moreLabel: string;
  toggleMore: () => void;
  total: string;
}

/**
 * «Дорога» → «Трансфер до санатория». Nothing is chosen for the guest: every question starts
 * with empty choices and the green bubble at «Далее» says what is still to choose. Only what
 * our flight tells us is filled in (it lands at Vilnius airport and leaves from there).
 * What the sanatorium or the flight package already pays for is marked «Уже оплачено», but
 * the guest still says whether they need it.
 */
export class TransferLogic extends PageLogic<TransferState> {
  constructor(props: PageServices) {
    super(props);
    const tr: Partial<Tr> = props.booking.booking.transfer || {};
    // an order saved before the guest was asked (old shape): start with empty choices
    const asked = tr.need !== undefined;
    this.state = asked
      ? {
          need: tr.need ?? null,
          how: tr.how ?? null,
          city: tr.place || '',
          spot: tr.spot || '',
          vehicle: tr.vehicle || '',
          back: tr.back ?? null,
          backSame: tr.backSame ?? null,
          backCity: tr.backSame === false ? tr.backPlace || '' : '',
          backSpot: tr.backSame === false ? tr.backSpot || '' : '',
        }
      : {};
  }

  /** what is really chosen; with our flight the places are known from it */
  eff(st: TransferState = this.state): TransferEff {
    const b = this.props.booking.booking;
    const { places: P } = api.getTransferOptions();
    const pkg = !!b.flightPackage;
    const city = st.city || (pkg ? 'vilnius' : '');
    const cur = P.find((c) => c.id === city);
    const spot = !cur
      ? ''
      : cur.places.includes(st.spot || '')
        ? st.spot || ''
        : pkg && city === 'vilnius' && !st.spot
          ? cur.places[0]
          : '';
    const need = st.need ?? null;
    const how = st.how ?? null;
    const vehicle = st.vehicle || '';
    const back = st.back ?? null;
    const backSame = st.backSame ?? (pkg ? true : null);
    const backCity = backSame === true ? city : backSame === false ? st.backCity || '' : '';
    const backCur = P.find((c) => c.id === backCity);
    const backPlaces = backCur ? backCur.places.map(toBack) : [];
    const backSpot =
      backSame === true ? (spot ? toBack(spot) : '') : backPlaces.includes(st.backSpot || '') ? st.backSpot || '' : '';
    const mode: Tr['mode'] =
      need === false ? 'none' : need && city && (how === 'group' || (how === 'individual' && vehicle)) ? how : null;
    return { pkg, city, cur, spot, need, how, vehicle, back, backSame, backCity, backCur, backPlaces, backSpot, mode };
  }

  syncBooking(st: TransferState) {
    const e = this.eff(st);
    return {
      transfer: {
        mode: e.mode,
        need: e.need,
        how: e.how,
        back: e.back,
        place: e.city,
        spot: e.spot,
        backSame: e.backSame,
        backPlace: e.backCity,
        backSpot: e.backSpot,
        vehicle: e.vehicle,
      },
    } as const;
  }

  /** what the guest has not chosen yet, in the order of the page (the bubble shows the first) */
  gaps(): Missing[] {
    const e = this.eff();
    if (e.need === null) return [{ label: 'нужен ли трансфер', target: '#trNeed' }];
    if (!e.need) return [];
    // «как поедете» first: the rest of the questions open after it
    if (!e.how) return [{ label: 'как поедете', target: '#trHow' }];
    const g: Missing[] = [];
    const hotel = (document.getElementById('hotelname') as HTMLInputElement | null)?.value.trim();
    if (!e.city) g.push({ label: 'откуда вас забрать', target: '#trFrom' });
    else if (!e.spot) g.push({ label: 'где именно вас встретить', target: '#place' });
    else if (/^От отеля/.test(e.spot) && !hotel) g.push({ label: 'из какого отеля забрать', target: '#hotelname' });
    if (e.how === 'individual' && e.city && !e.vehicle) g.push({ label: 'какая машина нужна', target: '#trCars' });
    if (e.back === null) g.push({ label: 'нужен ли трансфер обратно', target: '#trBack' });
    else if (e.back) {
      if (e.backSame === null) g.push({ label: 'куда отвезти обратно', target: '#trBackWhere' });
      else if (e.backSame === false) {
        if (!e.backCity) g.push({ label: 'город на обратном пути', target: '#trBackCities' });
        else if (!e.backSpot) g.push({ label: 'куда именно отвезти', target: '#backplace' });
      }
    }
    return g;
  }

  renderVals(): TransferVals {
    const booking = this.props.booking.booking;
    const { places: PICKUP_PLACES, vehicles: VEHICLES } = api.getTransferOptions();
    const GUESTS = booking.adults + booking.children;
    const e = this.eff();
    const { city, cur, spot, need, how, vehicle, back, backSame, backCity } = e;
    const bySanH = transferBySanatorium(booking.hotelId);
    const freeCities = freeTransferPlaces(booking.hotelId);
    const pkg = e.pkg;
    const inPkg = pkg && !bySanH;
    const sanName = sanatoriumTransferName(booking.hotelId);
    const setting: T.TransferSetting = { bySanH, inPkg, sanName, freeCities };
    // prices as the order summary counts them: paid by the sanatorium / in the package / our tariff
    const tNow: Tr = {
      mode: (e.mode || 'group') as Tr['mode'],
      need,
      how,
      back: !!back,
      place: city || 'vilnius',
      spot,
      backSame,
      backPlace: backCity,
      backSpot: e.backSpot,
      vehicle: vehicle || 'car',
    };
    const tr = transferLegs(booking, { ...tNow, mode: e.mode });
    const seat = legOf(booking, city || 'vilnius', { ...tNow, mode: 'group' });
    const seatPP = Math.round(seat.price / GUESTS);
    const carLeg = (vid: string) => legOf(booking, city || 'vilnius', { ...tNow, mode: 'individual', vehicle: vid });
    // the stamp «Уже оплачено»: the sanatorium meets guests itself / the flight package
    const paidBy = bySanH ? 'Входит в цену' : inPkg ? 'Входит в пакет' : '';
    const ourFlight = pkg;
    const flVal = (typed: string | undefined, line: string) => typed ?? (ourFlight ? line : '');
    const cityFree = (id: string) => bySanH && freeCities.includes(id);
    const pick = (patch: TransferState) => () => this.setState({ ...patch, askNo: false });
    const order = orderSummary(booking);
    return {
      ourFlight,
      flightIn: flVal(this.state.flIn, flightLine(FLIGHT_THERE, toD(booking.checkin), true)),
      flightBack: flVal(this.state.flBack, flightLine(FLIGHT_BACK, toD(booking.checkout), false)),
      setFlightIn: (ev) => this.setState({ flIn: ev.target.value }),
      setFlightBack: (ev) => this.setState({ flBack: ev.target.value }),
      // 1. do you need a transfer at all — no answer until the guest gives one
      need: need === true,
      noNeed: need === false,
      yesCls: need === true ? 'on' : '',
      noCls: need === false ? 'on' : '',
      sayYes: pick({ need: true }),
      sayNo: () => this.setState({ askNo: true }),
      askNo: !!this.state.askNo,
      confirmNo: () => this.setState({ askNo: false, need: false }),
      keepTransfer: () => this.setState({ askNo: false, need: true }),
      paidBy,
      yesTitle: bySanH ? 'Да, нужен трансфер санатория' : 'Да, нужен трансфер',
      // what is already paid and from where — under «i» of «Да»
      yesInfo: T.yesInfo(setting),
      noSub: T.noSub(setting),
      withNote: T.withNote(setting),
      transferLead: T.transferLead(setting, booking.flights === 'help' && !pkg),
      // 2. from where — nothing chosen unless our flight tells us
      inDay: shortDate(toD(booking.checkin)),
      // with our flight say what we marked; otherwise the hint waits under «i»
      fromNote: pkg ? T.FROM_NOTE_PKG : '',
      fromInfo: T.FROM_INFO,
      cities: PICKUP_PLACES.map((c) => {
        const g = legOf(booking, c.id, { ...tNow, mode: 'group' });
        return {
          ...c,
          on: c.id === city,
          cls: c.id === city ? 'on' : '',
          // the sanatorium's own shuttle is a group one: a car of your own is paid as usual
          paid: how === 'individual' ? '' : cityFree(c.id) ? 'входит в цену' : g.kind === 'package' ? 'в пакете' : '',
          pick: pick({ city: c.id, spot: '' }),
        };
      }),
      cityChosen: !!city,
      howChosen: !!how,
      howNote: T.howNote(setting, cur ? cur.name : ''),
      cityName: cur ? cur.name : '',
      places: cur ? cur.places.map((t) => ({ t })) : [],
      spot,
      fromHotel: /^От отеля/.test(spot),
      pickSpot: (ev) => this.setState({ spot: ev.target.value }),
      // 3. how — together with other guests or a car of your own
      groupCls: how === 'group' ? 'on' : '',
      indCls: how === 'individual' ? 'on' : '',
      pickGroupHow: pick({ how: 'group' }),
      pickIndHow: pick({ how: 'individual' }),
      isGroup: how === 'group',
      isInd: how === 'individual',
      seatPaid: seat.kind === 'free' ? 'Входит в цену' : seat.kind === 'package' ? 'Входит в пакет' : '',
      seatPrice: (inPkg ? '+' : '') + fmt(seatPP) + '\u00a0€',
      seatNote: T.seatNote(setting, !!city, seat.kind),
      seatTotal: seat.kind === 'paid' ? fmt(seat.price) + '\u00a0€' : '',
      guestsLabel: GUESTS + ' гостей',
      indFrom: (inPkg ? '+' : '') + fmt(carLeg('car').price) + '\u00a0€',
      vehicles: VEHICLES.map((vh) => ({
        ...vh,
        price: (inPkg ? '+' : '') + fmt(carLeg(vh.id).price),
        cls: vh.id === vehicle ? 'on' : '',
        pick: pick({ vehicle: vh.id }),
      })),
      // 4. back — asked separately, nothing chosen
      outDay: shortDate(toD(booking.checkout)),
      outWeekday: WEEKDAYS_SHORT[toD(booking.checkout).getUTCDay()],
      hotelShort: sanName.replace(/^санаторий /, ''),
      backYesCls: back === true ? 'on' : '',
      backNoCls: back === false ? 'on' : '',
      pickBackYes: pick({ back: true }),
      pickBackNo: pick({ back: false }),
      backOn: back === true,
      backPaid: how === 'individual' ? '' : bySanH ? 'Входит в цену' : inPkg ? 'Входит в пакет' : '',
      backSub: T.backSub(setting, how === 'individual'),
      sameCls: backSame === true ? 'on' : '',
      otherCls: backSame === false ? 'on' : '',
      pickSame: pick({ backSame: true }),
      pickOther: pick({ backSame: false }),
      backSame: backSame === true,
      backOther: backSame === false,
      sameInfo: !cur
        ? 'Туда, где вас встретили'
        : !spot
          ? cur.name
          : toBack(spot) + (spot.includes(cur.name.slice(0, 5)) ? '' : ' · ' + cur.name),
      backCities: PICKUP_PLACES.map((c) => ({
        ...c,
        cls: c.id === backCity ? 'on' : '',
        paid: how !== 'individual' && cityFree(c.id) ? 'входит в цену' : '',
        pick: pick({ backCity: c.id, backSpot: '' }),
      })),
      backCityChosen: !!backCity && backSame === false,
      backPlaces: e.backPlaces.map((t) => ({ t })),
      backSpot: e.backSpot,
      pickBackSpot: (ev) => this.setState({ backSpot: ev.target.value }),
      moreOpen: !!this.state.more,
      moreLabel: this.state.more ? 'Свернуть' : 'Подробнее о встрече и поездке',
      toggleMore: () => this.setState({ more: !this.state.more }),
      total: fmt(order.stay + order.flight + tr.total) + '\u00a0€',
    };
  }
}
