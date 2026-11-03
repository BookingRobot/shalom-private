import { api } from '../../api';
import { HOTEL_TABS, type HotelTab } from '../../components/hotel/HotelTabs';
import { guestsLabel } from '../../components/GuestsPicker';
import { tipCheapest } from '../../components/RoomCard';
import { nearestStays, stayFree } from '../../data/availability';
import { hotelInfo } from '../../data/hotelInfo';
import { specIcon } from '../../data/specIcons';
import { transferBySanatorium } from '../../data/transferPolicy';
import { WEEKDAYS_FULL, WEEKDAYS_SHORT, daysBetween, iso, nightsWord, shortDate, toD } from '../../lib/dates';
import { PageLogic, type PageServices } from '../../lib/pageLogic';
import { calendarVals, roomCalendarState } from './hotelCalendar';
import { buildOffers } from './hotelOffers';
import { priceProgramsFor, rangeLabel } from './hotelPricing';
import type { HotelProgram, HotelRoom, HotelState, HotelVals, NearDate, Specialization, StayTimes } from './hotelTypes';

/**
 * Check-in / check-out: per-sanatorium parameters (come from the hotel record). The rest of the
 * price is collected at the desk only where the sanatorium itself takes the guest from the
 * airport (transferBySanatorium); everywhere else it is paid before arrival.
 */
const stayTimes = (checkin: Date, checkout: Date, restAtDesk: boolean): StayTimes => ({
  checkin: '14:00',
  checkinDate: WEEKDAYS_FULL[checkin.getUTCDay()] + ', ' + shortDate(checkin),
  checkout: '12:00',
  checkoutDate: WEEKDAYS_FULL[checkout.getUTCDay()] + ', ' + shortDate(checkout),
  notes: [
    {
      t: 'Ранний приезд',
      s: 'багаж примут на хранение, можно сразу пойти на обед и к врачу',
      d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
    },
    {
      t: 'Поздний выезд',
      s: 'по запросу, если номер свободен; обед в день выезда входит',
      d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    },
    {
      t: 'Регистрация',
      s: restAtDesk ? 'паспорт каждого гостя; остаток оплачивается на стойке' : 'паспорт каждого гостя',
      d: 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6',
    },
  ],
});

/** The sanatorium page: which sanatorium, dates, open rooms and tabs; the view-model for the blocks. */
export class HotelLogic extends PageLogic<HotelState> {
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    // which sanatorium: ?h=<id> in the link, else the one in the order; #treat etc. opens a tab
    const loc = typeof window !== 'undefined' ? window.location : null;
    // /sanatoriy/<id> (the page search engines know) or ?h=<id> (older links)
    const fromPath = loc ? /^\/sanatoriy\/([^/]+)/.exec(loc.pathname)?.[1] : undefined;
    const q = fromPath || (loc ? new URLSearchParams(loc.search).get('h') : null);
    const hash = loc ? loc.hash.replace('#', '') : '';
    this.state = {
      i: 0,
      det: {},
      sec: {},
      in: b.checkin,
      out: b.checkout,
      hid: hotelInfo(q || b.hotelId).id,
      tab: HOTEL_TABS.some(([k]) => k === hash) ? (hash as HotelTab) : 'rooms',
    };
  }

  syncBooking(st: HotelState) {
    return { checkin: st.in, checkout: st.out };
  }

  renderVals(): HotelVals {
    const { booking } = this.props.booking;
    const guests = { adults: booking.adults, children: booking.children };
    const raw = api.getSanatorium(this.state.hid);
    const { info } = raw;
    // the data layer is untyped so far: one cast at the boundary
    const rooms = raw.rooms as HotelRoom[];
    const programs = raw.programs as HotelProgram[];
    const isEgle = info.id === 'egle-comfort';
    const st = this.state;
    const sec = st.sec;
    const secT = (k: string) => () => this.setState({ sec: { ...sec, [k]: !sec[k] } });
    const set = (patch: Partial<HotelState>) => this.setState(patch);

    const checkin = toD(st.in || '2026-11-09'),
      checkout = toD(st.out || '2026-11-18');
    const nights = Math.max(1, daysBetween(checkin, checkout));
    const nightsLabel = nights + ' ' + nightsWord(nights);
    const markChosen = () => this.props.booking.update({ chosenDates: true });

    const offers = buildOffers({
      hotelId: info.id,
      rooms,
      programs: priceProgramsFor(programs, checkin, nights),
      busyKeys: raw.busyKeys,
      checkin,
      checkout,
      nights,
      guests,
      withFlight: booking.flightPackage,
      det: st.det,
      ps: st.ps || {},
      pickProgram: (room, index) => set({ ps: { ...(st.ps || {}), [room]: index } }),
      toggleDetails: (room, open) => set({ det: { ...st.det, [room]: open } }),
      chooseRoom: (n) => this.props.booking.update({ hotelId: info.id, roomId: 'room-' + n }),
      openRoomCalendar: (key, name) => set(roomCalendarState(key, name, checkin)),
    });

    // no places on the chosen dates: the nearest dates with places + «Свяжитесь со мной»
    const free = stayFree(info.id, iso(checkin), nights);
    const fly = booking.flightPackage;
    const wd = (d: Date) => WEEKDAYS_SHORT[d.getUTCDay()].toLowerCase();
    const naDates: NearDate[] = free
      ? []
      : nearestStays(info.id, iso(checkin), nights, { flights: fly }).map((a) => {
          const A = toD(a.checkin),
            B = toD(a.checkout);
          return {
            label: rangeLabel(A, B),
            sub: wd(A) + ' → ' + wd(B) + ' · ' + nightsLabel,
            pick: () => {
              set({ in: a.checkin, out: a.checkout });
              markChosen();
              document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
          };
        });

    const goTab = (k: HotelTab) => {
      set({ tab: k });
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + k);
        document.getElementById('hotel-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const specs: Specialization[] = isEgle
      ? raw.specializations
      : info.text.treatment.profiles.map((p) => {
          // «Опорно-двигательный аппарат: суставы, позвоночник» → title and its line
          const [t, more] = p.split(/:\s*/);
          return { t, s: more ? more.charAt(0).toUpperCase() + more.slice(1) : '', d: specIcon(p) };
        });
    const photos = raw.photos;

    return {
      ...calendarVals({
        hotelId: info.id,
        st,
        checkin,
        checkout,
        nights,
        set,
        markChosen,
        askHelp: this.props.help.open,
      }),
      dateRange: rangeLabel(checkin, checkout) + ' ' + checkin.getUTCFullYear(),
      guestsWho: guestsLabel(booking.adults, booking.children),
      nightsLabel,
      // Eglė meets its guests itself (data/transferPolicy) — nothing to sell here
      freeTr: transferBySanatorium(info.id)
        ? 'Трансфер аэропорт Вильнюса ⇄ санаторий организует сам санаторий «Эгле» — он включён в стоимость, отдельно заказывать не нужно.'
        : 'Трансфер из аэропорта Вильнюса, Каунаса или Варшавы закажете на шаге «Дорога» — встретим с табличкой и довезём до стойки.',
      // the next step on a sanatorium: choose the cheapest free room (the bubble is on it)
      offers: tipCheapest(offers, !st.roomTipX && free, () => set({ roomTipX: true })),
      noRooms: offers.length === 0,
      naOn: !free,
      naTitle: free ? undefined : 'На ' + rangeLabel(checkin, checkout) + ' мест нет',
      naText: free
        ? undefined
        : 'В ' +
          info.short +
          ' все номера на эти даты заняты. Ближайшие даты на ' +
          nightsLabel +
          (fly ? ' с нашим рейсом туда и обратно' : '') +
          ', когда места есть:',
      naDates,
      helpOpen: this.props.help.open,
      info,
      tab: st.tab || 'rooms',
      setTab: goTab,
      toRooms: () => goTab('rooms'),
      openPhoto: (k: number) => set({ lb: true, i: k }),
      strip: isEgle
        ? ['Всё в одном здании', 'Врач говорит по-русски', 'Питание 3 раза в день', 'Бассейн и сауны']
        : info.text.about.amenities.slice(0, 4),
      tiles: [0, 1, 2, 3].map((k) => {
        const p = photos[k] || photos[0];
        return { src: p.src, label: p.alt.replace(/^[^:]+:\s*/, '') };
      }),
      trTitle: transferBySanatorium(info.id)
        ? 'Как добраться — трансфер от санатория'
        : 'Как добраться и заказать трансфер',
      specs,
      times: stayTimes(checkin, checkout, transferBySanatorium(info.id)),
      specOpen: !!sec.spec,
      toggleSpec: secT('spec'),
      timeOpen: !!sec.time,
      toggleTime: secT('time'),
      trOpen: !!sec.tr,
      toggleTr: secT('tr'),
      lightbox: !!st.lb,
      closeLb: () => set({ lb: false }),
      pickAll: () => set({ lb: true }),
      photoCount: raw.allPhotos.length,
      allPhotos: raw.allPhotos.map((p, k) => ({ ...p, n: k + 1 })),
      pick0: () => set({ lb: true, i: 0 }),
      pick1: () => set({ lb: true, i: 1 }),
      pick2: () => set({ lb: true, i: 2 }),
    };
  }
}
