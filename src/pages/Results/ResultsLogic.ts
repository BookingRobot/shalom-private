import { api } from '../../api';
import { nearestStays } from '../../data/availability';
import { ICON_PATHS } from '../../data/iconPaths';
import { addD, daysBetween, iso, toD } from '../../lib/dates';
import { guestsLabel } from '../../lib/orderSummary';
import { PageLogic, type PageServices } from '../../lib/pageLogic';
import { buildFilters, foundLabel, passWith } from './filtersVals';
import { buildHotels, type LogicCtx } from './hotelsVals';
import { buildPriceCal } from './priceCalVals';
import type { ResultsState, ResultsVals, SoldHotelVM } from './resultsTypes';
import { buildSearchCal } from './searchCalVals';
import { rangeText } from './stayPricing';

// Sanatoriums with no availability on the chosen dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]
const SOLD = [
  {
    id: 'upa',
    name: 'Санаторий Упа',
    stars: '★★★',
    sub: 'Друскининкай · у парка Вийя',
    img: '/img/79c9318ba02a718e29de4346c9642a33.jpg',
  },
  {
    id: 'spa-vilnius',
    name: 'SPA Vilnius Друскининкай',
    stars: '★★★★',
    sub: 'Друскининкай · у реки Неман',
    img: '/img/30b3b315653c1dbc711827ceb6c48ebe.jpg',
  },
];

const qs = (k: string) => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(k) : null);

/** View-model of the results page: the list for the dates, filters, compare, the two calendars. */
export class ResultsLogic extends PageLogic<ResultsState> {
  /** 3 on a laptop, 2 on a phone — set by the page component */
  cmpLimit = 3;
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    this.state = {
      checkin: b.checkin,
      nights: daysBetween(toD(b.checkin), toD(b.checkout)),
      sort: 'pop',
      // all sanatoriums start folded: a bubble at the first one says to open the rooms
      open: {},
      closing: {},
      det: {},
      sec: {},
      // no filter is on until the guest picks one
      f: {},
      pf: {},
      pr: {},
      ppr: {},
      more: false,
      wz: qs('wizard') !== null,
    };
    // a link may carry the guest's filters (?f=daily,doctor): only then they are on
    const fq = qs('f');
    if (fq) {
      const on = Object.fromEntries(
        fq
          .split(',')
          .filter(Boolean)
          .map((k) => [k, true]),
      );
      this.state.f = on;
      this.state.pf = { ...on };
    }
    // came from the name search on the home page: open that sanatorium's rooms
    const hq = qs('h');
    if (hq) {
      this.state.open = { [hq]: true };
      this.state.lastOpen = hq;
    }
  }
  syncBooking(st: ResultsState) {
    return st.checkin ? { checkin: st.checkin, checkout: iso(addD(toD(st.checkin), st.nights || 9)) } : null;
  }
  renderVals(): ResultsVals {
    const { booking } = this.props.booking;
    const st = this.state;
    const nights = st.nights || 9;
    const checkin = toD(st.checkin || '2026-11-09');
    const data = api.searchSanatoriums({
      dest: booking.dest,
      checkin: booking.checkin,
      nights: daysBetween(toD(booking.checkin), toD(booking.checkout)),
      adults: booking.adults,
    });
    const ctx: LogicCtx = {
      st,
      live: () => this.state,
      set: (patch) => this.setState(patch),
      booking,
      update: (patch) => this.props.booking.update(patch),
      help: () => this.props.help.open(),
      data,
      nights,
      checkin,
      cmpLimit: this.cmpLimit || 3,
    };
    const all = data.sanatoriums;
    const sort = st.sort || 'pop';
    const list = all
      .filter(passWith(st.f || {}, st.pr || {}))
      .sort((a, b) => (sort === 'cheap' ? a.price - b.price : sort === 'exp' ? b.price - a.price : a.pop - b.pop));
    const hotels = buildHotels(list, ctx);
    const cmp = st.cmp || [];
    const open = st.open || {};
    const soldHotels: SoldHotelVM[] = SOLD.map((u) => ({
      ...u,
      // the nearest stay of the same length with places (data/availability)
      next: (() => {
        const a = nearestStays(u.id, iso(checkin), nights, { count: 1 })[0];
        return a ? rangeText(toD(a.checkin), nights) : 'уточнит консультант';
      })(),
      chips: [
        { t: 'Врач включён', d: ICON_PATHS.doctor },
        { t: 'Бассейн и сауны', d: ICON_PATHS.pool },
        { t: 'Питание 3 раза', d: ICON_PATHS.meals },
      ],
      notify: () => this.props.help.open(),
    }));
    return {
      ...buildPriceCal(ctx),
      ...buildSearchCal(ctx),
      ...buildFilters(st, ctx.set, all),
      soldHotels,
      soldCount: '2 санатория',
      rmTipClose: () => this.setState({ rmTipX: true }),
      wzOpen: !!st.wz,
      wzOpenFn: () => this.setState({ wz: true }),
      wzClose: () => this.setState({ wz: false }),
      wzShow: ({ filters, hotelId }) => {
        this.setState({
          lastOpen: hotelId,
          f: { ...filters },
          pf: { ...filters },
          pr: {},
          ppr: {},
          open: { ...open, [hotelId]: true },
          wz: false,
        });
        setTimeout(
          () => document.getElementById('h-' + hotelId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          60,
        );
      },
      cmpLimit: ctx.cmpLimit,
      cmpIds: cmp,
      cmpHotels: hotels,
      cmpRemove: (id) => this.setState({ cmp: cmp.filter((x) => x !== id) }),
      cmpClear: () => this.setState({ cmp: [] }),
      guestsLine: guestsLabel(booking) + (booking.flightPackage ? ' · с перелётом из Тель-Авива' : ''),
      hotels,
      none: hotels.length === 0,
      foundLabel: foundLabel(hotels.length, all.length),
    };
  }
}
