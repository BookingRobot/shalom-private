import { VanIcon } from '../../components/icons';
import { Fragment } from 'react';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { api } from '../../api';
import { AdvanceNote, OrderSummary, orderPriceRows } from '../../components/OrderSummary';
import { StepNext, type Missing } from '../../components/StepNext';
import { InfoTitle } from '../../components/InfoTip';
import { orderSummary } from '../../lib/orderSummary';
import { WEEKDAYS_SHORT, shortDate, toD } from '../../lib/dates';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { FlightChoice } from '../../components/FlightChoice';
import { freeTransferPlaces, sanatoriumTransferName, transferBySanatorium } from '../../data/transferPolicy';
import { legOf, transferLegs } from '../../lib/transferCost';
import { FLIGHT_BACK, FLIGHT_THERE, flightLine, isFlightDay } from '../../data/flights';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Booking } from '../../data/booking';
import './TransferPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

/** pick-up spot → the same spot on the way back: «Из аэропорта Вильнюса» → «В аэропорт Вильнюса» */
const toBack = (t: string) =>
  t
    .replace(/^Из аэропорта/, 'В аэропорт')
    .replace(/^С ЖД вокзала/, 'На ЖД вокзал')
    .replace(/^С автовокзала/, 'На автовокзал')
    .replace(/^От отеля/, 'В отель');

type Tr = Booking['transfer'];

/**
 * «Дорога» → «Трансфер до санатория». Nothing is chosen for the guest: every question starts
 * with empty choices and the green bubble at «Далее» says what is still to choose. Only what
 * our flight tells us is filled in (it lands at Vilnius airport and leaves from there).
 * What the sanatorium or the flight package already pays for is marked «Уже оплачено», but
 * the guest still says whether they need it.
 */
class TransferLogic extends PageLogic {
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
  eff(st: Record<string, any> = this.state) {
    const b = this.props.booking.booking;
    const { places: P } = api.getTransferOptions();
    const pkg = !!b.flightPackage;
    const city: string = st.city || (pkg ? 'vilnius' : '');
    const cur = P.find((c) => c.id === city);
    const spot: string = !cur
      ? ''
      : cur.places.includes(st.spot)
        ? st.spot
        : pkg && city === 'vilnius' && !st.spot
          ? cur.places[0]
          : '';
    const need: boolean | null = st.need ?? null;
    const how: 'group' | 'individual' | null = st.how ?? null;
    const vehicle: string = st.vehicle || '';
    const back: boolean | null = st.back ?? null;
    const backSame: boolean | null = st.backSame ?? (pkg ? true : null);
    const backCity = backSame === true ? city : backSame === false ? st.backCity || '' : '';
    const backCur = P.find((c) => c.id === backCity);
    const backPlaces = backCur ? backCur.places.map(toBack) : [];
    const backSpot: string =
      backSame === true ? (spot ? toBack(spot) : '') : backPlaces.includes(st.backSpot) ? st.backSpot : '';
    const mode: Tr['mode'] =
      need === false ? 'none' : need && city && (how === 'group' || (how === 'individual' && vehicle)) ? how : null;
    return { pkg, city, cur, spot, need, how, vehicle, back, backSame, backCity, backCur, backPlaces, backSpot, mode };
  }
  syncBooking(st: Record<string, any>) {
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
  renderVals() {
    return this._rv();
  }
  _rv() {
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
    const paidBy = bySanH ? 'Уже оплачено' : inPkg ? 'Оплачено в пакете' : '';
    const ourFlight = pkg;
    const flVal = (typed: string | undefined, line: string) => typed ?? (ourFlight ? line : '');
    const cityFree = (id: string) => bySanH && freeCities.includes(id);
    const pick = (patch: Record<string, any>) => () => this.setState({ ...patch, askNo: false });
    return {
      ourFlight,
      flightIn: flVal(this.state.flIn, flightLine(FLIGHT_THERE, toD(booking.checkin), true)),
      flightBack: flVal(this.state.flBack, flightLine(FLIGHT_BACK, toD(booking.checkout), false)),
      setFlightIn: (ev: { target: { value: string } }) => this.setState({ flIn: ev.target.value }),
      setFlightBack: (ev: { target: { value: string } }) => this.setState({ flBack: ev.target.value }),
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
      yesInfo: bySanH
        ? sanName.replace(/^с/, 'С') +
          ' сам встречает гостей в ' +
          freeCities.map((id) => (id === 'vilnius' ? 'Вильнюсе' : id === 'kaunas' ? 'Каунасе' : id)).join(' и ') +
          ' — в аэропорту, на вокзале или у отеля. Это уже входит в оплату. Из других мест или отдельной машиной — по нашему тарифу.'
        : inPkg
          ? 'Групповой трансфер из аэропорта Вильнюса уже в пакете с перелётом. Другой город или отдельная машина — с доплатой.'
          : 'Встретим с табличкой в аэропорту, на вокзале или у отеля, поможем с багажом и довезём до стойки регистрации. Групповой — от 30\u00a0€ с человека, отдельная машина — от 130\u00a0€.',
      noSub: bySanH
        ? 'Цена не изменится — трансфер санатория просто не понадобится'
        : inPkg
          ? 'Цена пакета с перелётом не изменится'
          : 'На машине или общественным транспортом',
      withNote: bySanH
        ? 'Из Вильнюса и Каунаса санаторий привезёт вас бесплатно — это уже оплачено.'
        : inPkg
          ? 'Групповой трансфер из аэропорта Вильнюса уже оплачен в пакете с перелётом.'
          : 'Групповой трансфер — всего 30 € с человека, индивидуальный — от 130 € за машину.',
      transferLead:
        booking.flights === 'help' && !pkg
          ? 'Консультант уточнит время, когда подберёт рейс. Отметьте, нужен ли трансфер.'
          : bySanH
            ? 'Санаторий сам встречает гостей — это уже оплачено. Отметьте, нужен ли он вам.'
            : inPkg
              ? 'Трансфер из аэропорта Вильнюса уже в пакете с перелётом. Отметьте, нужен ли он вам.'
              : 'Встретим с табличкой, поможем с багажом, довезём до стойки регистрации. Отметьте, нужен ли трансфер.',
      // 2. from where — nothing chosen unless our flight tells us
      inDay: shortDate(toD(booking.checkin)),
      // with our flight say what we marked; otherwise the hint waits under «i»
      fromNote: pkg ? 'Ваш рейс прилетает в аэропорт Вильнюса — его мы и отметили. Можно выбрать другое место.' : '',
      fromInfo:
        'Большинство гостей прилетают в Вильнюс — до санатория около 2 часов. Из Каунаса столько же, из Варшавы около 5 часов.',
      cities: PICKUP_PLACES.map((c) => {
        const g = legOf(booking, c.id, { ...tNow, mode: 'group' });
        return {
          ...c,
          on: c.id === city,
          cls: c.id === city ? 'on' : '',
          // the sanatorium's own shuttle is a group one: a car of your own is paid as usual
          paid: how === 'individual' ? '' : cityFree(c.id) ? 'уже оплачено' : g.kind === 'package' ? 'в пакете' : '',
          pick: pick({ city: c.id, spot: '' }),
        };
      }),
      cityChosen: !!city,
      howChosen: !!how,
      howNote: city
        ? 'Цены: ' + (cur ? cur.name : '') + ' → санаторий, в одну сторону.'
        : bySanH
          ? 'Трансфер санатория — из Вильнюса и Каунаса. Город выберете дальше.'
          : 'Цены — от Вильнюса, в одну сторону. Город выберете дальше.',
      cityName: cur ? cur.name : '',
      places: cur ? cur.places.map((t) => ({ t })) : [],
      spot,
      fromHotel: /^От отеля/.test(spot),
      pickSpot: (ev: { target: { value: string } }) => this.setState({ spot: ev.target.value }),
      // 3. how — together with other guests or a car of your own
      groupCls: how === 'group' ? 'on' : '',
      indCls: how === 'individual' ? 'on' : '',
      pickGroupHow: pick({ how: 'group' }),
      pickIndHow: pick({ how: 'individual' }),
      isGroup: how === 'group',
      isInd: how === 'individual',
      seatPaid: seat.kind === 'free' ? 'Уже оплачено' : seat.kind === 'package' ? 'Оплачено в пакете' : '',
      seatPrice: (inPkg ? '+' : '') + fmt(seatPP) + ' €',
      seatNote: !city
        ? bySanH
          ? 'из Вильнюса и Каунаса'
          : inPkg
            ? 'входит в пакет с перелётом'
            : 'с человека, в одну сторону'
        : seat.kind === 'free'
          ? 'организует ' + sanName
          : seat.kind === 'package'
            ? 'входит в пакет с перелётом'
            : inPkg
              ? 'доплата с человека, в одну сторону'
              : 'с человека, в одну сторону',
      seatTotal: seat.kind === 'paid' ? fmt(seat.price) + ' €' : '',
      guestsLabel: GUESTS + ' гостей',
      indFrom: (inPkg ? '+' : '') + fmt(carLeg('car').price) + ' €',
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
      backPaid: how === 'individual' ? '' : bySanH ? 'Уже оплачено' : inPkg ? 'Оплачено в пакете' : '',
      backSub:
        how === 'individual'
          ? 'Отдельной машиной, как и туда'
          : bySanH
            ? 'В Вильнюс и Каунас — уже оплачено санаторием'
            : inPkg
              ? 'В аэропорт Вильнюса — в пакете с перелётом'
              : 'В аэропорт, на вокзал или в отель',
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
        paid: how !== 'individual' && cityFree(c.id) ? 'уже оплачено' : '',
        pick: pick({ backCity: c.id, backSpot: '' }),
      })),
      backCityChosen: !!backCity && backSame === false,
      backPlaces: e.backPlaces.map((t) => ({ t })),
      backSpot: e.backSpot,
      pickBackSpot: (ev: { target: { value: string } }) => this.setState({ backSpot: ev.target.value }),
      moreOpen: !!this.state.more,
      moreLabel: this.state.more ? 'Свернуть' : 'Подробнее о встрече и поездке',
      toggleMore: () => this.setState({ more: !this.state.more }),
      total:
        fmt(
          orderSummary(this.props.booking.booking).stay + orderSummary(this.props.booking.booking).flight + tr.total,
        ) + ' €',
    };
  }
}

/** «Уже оплачено»: what the sanatorium or the flight package pays — a stamp, not a choice */
function PaidStamp({ children }: { children: string }) {
  return (
    <span className="paid-stamp">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 5 5L20 7" />
      </svg>
      {children}
    </span>
  );
}

const Chevron = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1F5F4A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ position: 'absolute', right: '14px', top: '17px', pointerEvents: 'none' }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function BackFlight({ v, id }: { v: any; id: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="lbl" htmlFor={id} style={{ fontSize: '15px' }}>
        {v.ourFlight ? 'Ваш рейс и время отправления' : 'Уже есть билеты? Рейс и время отправления'}
        <span style={{ fontWeight: '400', color: '#5E6862' }}>
          {' '}
          · {v.ourFlight ? 'заполнили по вашему перелёту' : 'необязательно'}
        </span>
      </label>
      <input
        id={id}
        className="input"
        type="text"
        placeholder="Например: LO 772, 16:10"
        value={v.flightBack}
        onChange={v.setFlightBack}
        style={{ minHeight: '44px', fontSize: '16px' }}
      />
    </div>
  );
}

export default function TransferPage() {
  usePageTitle('Шаг 2 из 4 — дорога');
  const [v, logic] = usePageLogic(TransferLogic);
  const order = orderSummary(logic.props.booking.booking);
  return (
    <div className="page pg-transfer">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span className="hd-note">Нужна помощь с заказом?</span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        {/* Steps */}
        <CheckoutSteps current={2} />
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '32px 24px 56px',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Main column */}
          <div style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h1 style={{ fontSize: '32px' }}>Дорога до санатория</h1>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '18px' }}>
                Сначала перелёт, затем трансфер — от аэропорта до стойки регистрации санатория.
              </p>
            </div>
            <FlightChoice />
            <div className="road-h road-h-out">
              <span className="road-num">2</span>
              <div>
                <h2>Трансфер до санатория</h2>
                <span>{v.transferLead}</span>
              </div>
            </div>
            {/* 1. Нужен ли трансфер — nothing is chosen for the guest */}
            <div id="trNeed" className="tr-q" role="radiogroup" aria-label="Нужен ли трансфер">
              <button
                type="button"
                role="radio"
                aria-checked={v.need}
                className={`choice ${v.yesCls}`}
                onClick={v.sayYes}
              >
                <span className={`radio ${v.yesCls}`}>
                  <i />
                </span>
                <InfoTitle
                  title={v.yesTitle}
                  info={v.yesInfo}
                  extra={v.paidBy ? <PaidStamp>{v.paidBy}</PaidStamp> : <span className="tr-reco">Рекомендуем</span>}
                />
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={v.noNeed}
                className={`choice tr-no ${v.noCls}`}
                onClick={v.sayNo}
              >
                <span className={`radio ${v.noCls}`}>
                  <i />
                </span>
                <InfoTitle title="Нет, доберусь сам" info={v.noSub} />
              </button>
            </div>
            {/* Confirmation pop-up when the guest declines the transfer */}
            {v.askNo ? (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: '0',
                    zIndex: '60',
                    background: 'rgba(20,28,24,.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                  }}
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="noTitle"
                    className="card"
                    style={{
                      maxWidth: '560px',
                      width: '100%',
                      padding: '28px 30px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      boxShadow: '0 20px 60px rgba(0,0,0,.35)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C9893A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none' }}
                      >
                        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                      </svg>
                      <h2 id="noTitle" style={{ fontSize: '23px' }}>
                        Вы уверены, что доберётесь сами?
                      </h2>
                    </div>
                    <p style={{ margin: '0', fontSize: '17px', color: '#1C2620' }}>
                      От аэропорта Вильнюса до санатория — 130 км. Прямого автобуса из аэропорта нет: нужно доехать до
                      автовокзала, купить билет, затем 2 часа в пути и такси до санатория — с чемоданами.
                    </p>
                    <div
                      style={{
                        padding: '14px 16px',
                        background: '#EEF5F1',
                        borderRadius: 'var(--r)',
                        fontSize: '16px',
                      }}
                    >
                      <strong>С трансфером:</strong> водитель встречает с табличкой, помогает с багажом и довозит до
                      стойки санатория. {v.withNote}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        paddingTop: '4px',
                      }}
                    >
                      <button type="button" className="btn btn-secondary" onClick={v.confirmNo}>
                        Да, доберусь сам
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={v.keepTransfer}
                        style={{ minHeight: '52px', fontSize: '18px' }}
                      >
                        Нет, добавить трансфер
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {v.need ? (
              <div
                className="card ios-in"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}
              >
                {/* 1. Как поедете — right after «Да», nothing chosen */}
                <div id="trHow" className="tr-block">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 style={{ fontSize: '23px' }}>Как поедете?</h2>
                    <p style={{ margin: '0', color: '#3E4B44', fontSize: '17px' }}>{v.howNote}</p>
                  </div>
                  <div className="tr-how" role="radiogroup" aria-label="Как поедете">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={v.isGroup}
                      className={`choice tr-how-opt ${v.groupCls}`}
                      onClick={v.pickGroupHow}
                    >
                      <span className={`radio ${v.groupCls}`}>
                        <i />
                      </span>
                      <span className="tr-how-pic">
                        <img src="/img/165765111b3ce679a969db85fe7d023f.png" alt="" />
                      </span>
                      <span className="tr-how-txt">
                        <InfoTitle
                          title="Групповой трансфер"
                          extra={<span className="tr-best">Самый выгодный</span>}
                          info="Микроавтобус Mercedes Sprinter или Vito вместе с другими гостями санаториев. Встретим с табличкой и поможем с багажом."
                        />
                      </span>
                      <span className="tr-how-price">
                        {v.seatPaid ? (
                          <PaidStamp>{v.seatPaid}</PaidStamp>
                        ) : (
                          <strong style={{ fontSize: '22px' }}>{v.seatPrice}</strong>
                        )}
                        <span>{v.seatNote}</span>
                        {v.seatTotal ? (
                          <span>
                            за {v.guestsLabel}: <strong style={{ color: '#1C2620' }}>{v.seatTotal}</strong>
                          </span>
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={v.isInd}
                      className={`choice tr-how-opt ${v.indCls}`}
                      onClick={v.pickIndHow}
                    >
                      <span className={`radio ${v.indCls}`}>
                        <i />
                      </span>
                      <span className="tr-how-pic">
                        <VanIcon height={40} />
                      </span>
                      <span className="tr-how-txt">
                        <InfoTitle
                          title="Отдельная машина — только вы"
                          info="Без ожидания других рейсов и попутчиков: водитель встречает вас и едет сразу в санаторий. Машину выберете ниже."
                        />
                      </span>
                      <span className="tr-how-price">
                        <strong style={{ fontSize: '22px' }}>от {v.indFrom}</strong>
                        <span>за машину</span>
                      </span>
                    </button>
                  </div>
                  {v.isGroup ? (
                    <div className="tr-warn ios-in">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8A5A00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none', marginTop: '1px' }}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                      <InfoTitle
                        title={<span>Возможно ожидание других рейсов до 1 часа</span>}
                        info="Вы едете вместе с другими гостями: по дороге — остановки у других санаториев, дорога длиннее на 30–40 минут. Точное время встречи сообщим за день до приезда."
                      />
                    </div>
                  ) : null}
                </div>
                {/* the rest opens once the guest has said how they go: less on the screen at first */}
                {v.howChosen ? (
                  <>
                    {/* Four-step illustrated strip: how the transfer works */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '14px 18px 12px',
                        background: '#EDF4EF',
                        border: '1px solid #C8DED3',
                        borderRadius: 'var(--r)',
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '17px' }}>От встречи до санатория</div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '4px',
                          flexWrap: 'nowrap',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/39ad8fe2bfcea92423d717bc9dac8f37.png"
                            alt="Водитель встречает с табличкой"
                            style={{ height: '64px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              maxWidth: '120px',
                            }}
                          >
                            Встретим с табличкой
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/838118fe86e78736560c2ece8886b813.png"
                            alt="Водитель укладывает чемодан в багажник"
                            style={{ height: '64px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              maxWidth: '120px',
                            }}
                          >
                            Поможем с багажом
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/565b4c9fbca5b96b414361547b3a452f.png"
                            alt="Микроавтобус едет к санаторию"
                            style={{ height: '64px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              maxWidth: '120px',
                            }}
                          >
                            Довезём до санатория
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/05b41fccbf0a437d88db58e3ce3a1a91.png"
                            alt="Гость у стойки регистрации санатория"
                            style={{ height: '64px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              maxWidth: '120px',
                            }}
                          >
                            Проводим до стойки
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="acc"
                        onClick={v.toggleMore}
                        style={{ alignSelf: 'flex-start', fontSize: '15px', minHeight: '36px' }}
                      >
                        {v.moreLabel}
                      </button>
                      {v.moreOpen ? (
                        <>
                          <div
                            style={{
                              fontSize: '15px',
                              color: '#3E4B44',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              paddingBottom: '4px',
                            }}
                          >
                            <span>
                              • <strong>Если рейс задерживается</strong> — следим за ним по номеру и ждём без доплаты.
                            </span>
                            <span>
                              • <strong>Остановки по пути</strong> — по вашей просьбе: туалет, кафе, аптека.
                            </span>
                            <span>
                              • <strong>Обратно</strong> — так же: заберём из санатория за 3 часа до вылета, время
                              подтвердим за день.
                            </span>
                            <span>
                              • <strong>Время в пути</strong> зависит от маршрута — указано рядом с городом ниже.
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    {/* 2. Откуда забрать — empty until chosen (our flight: Vilnius airport) */}
                    <div id="trFrom" className="tr-block ios-in">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <InfoTitle
                          title={<h2 style={{ fontSize: '23px' }}>Откуда вас забрать {v.inDay}?</h2>}
                          info={v.fromInfo}
                        />
                        {v.fromNote ? (
                          <p style={{ margin: '0', color: '#3E4B44', fontSize: '17px' }}>{v.fromNote}</p>
                        ) : null}
                      </div>
                      <div className="rowlist" role="radiogroup" aria-label="Откуда забрать">
                        {v.cities.map((c: any) => (
                          <Fragment key={c.id}>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={c.on}
                              className={`rowpick ${c.cls}`}
                              onClick={c.pick}
                            >
                              <span className={`radio ${c.cls}`}>
                                <i />
                              </span>
                              <span className="rowpick-name">
                                {c.from}
                                {c.paid ? <span className="rowpick-badge">{c.paid}</span> : null}
                              </span>
                            </button>
                            {c.on ? (
                              <div className="rowpick-detail">
                                <span className="rowpick-info rowpick-info-in">{c.info}</span>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
                                    gap: '14px',
                                    alignItems: 'end',
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="lbl" htmlFor="place">
                                      Где именно вас встретить?
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                      <select
                                        id="place"
                                        className={'input' + (v.spot ? '' : ' input-empty')}
                                        style={{ paddingRight: '44px' }}
                                        value={v.spot}
                                        onChange={v.pickSpot}
                                      >
                                        <option value="" disabled>
                                          Выберите: аэропорт, вокзал или отель
                                        </option>
                                        {v.places.map((p: any) => (
                                          <option key={p.t} value={p.t}>
                                            {p.t}
                                          </option>
                                        ))}
                                      </select>
                                      <Chevron />
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="lbl" htmlFor="flight" style={{ fontSize: '15px' }}>
                                      {v.ourFlight
                                        ? 'Ваш рейс и время прибытия'
                                        : 'Уже есть билеты? Рейс и время прибытия'}
                                      <span style={{ fontWeight: '400', color: '#5E6862' }}>
                                        {' '}
                                        · {v.ourFlight ? 'заполнили по вашему перелёту' : 'необязательно'}
                                      </span>
                                    </label>
                                    <input
                                      id="flight"
                                      className="input"
                                      type="text"
                                      placeholder="Например: LO 771, 14:35"
                                      value={v.flightIn}
                                      onChange={v.setFlightIn}
                                      style={{ minHeight: '44px', fontSize: '16px' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </Fragment>
                        ))}
                      </div>
                      {v.fromHotel ? (
                        <div className="tr-sub ios-in">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="lbl" htmlFor="hotelname">
                              Из какого отеля вас забрать? <span style={{ color: '#B3261E' }}>*</span>
                            </label>
                            <input
                              id="hotelname"
                              className="input"
                              type="text"
                              placeholder="Название отеля и адрес, например: Artis Centrum Hotels, Liejyklos g. 3"
                            />
                            <span style={{ fontSize: '15px', color: '#5E6862' }}>
                              Водитель будет ждать у главного входа. Если выезжаете из квартиры — укажите адрес и
                              подъезд.
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="lbl" htmlFor="maplink">
                              Ссылка на Google Maps{' '}
                              <span style={{ fontWeight: '600', color: '#5E6862' }}>(не обязательно)</span>
                            </label>
                            <input id="maplink" className="input" type="url" placeholder="https://maps.app.goo.gl/…" />
                            <span style={{ fontSize: '15px', color: '#5E6862' }}>
                              Откройте отель в Google Maps → «Поделиться» → скопируйте ссылку. Так водитель точно не
                              ошибётся.
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {v.isInd && v.cityChosen ? (
                      <div id="trCars" className="tr-block ios-in" role="radiogroup" aria-label="Какая машина">
                        <h2 style={{ fontSize: '23px' }}>Какая машина нужна?</h2>
                        {v.vehicles.map((k: any) => (
                          <button
                            key={k.id}
                            type="button"
                            role="radio"
                            aria-checked={k.cls === 'on'}
                            className={`choice ${k.cls}`}
                            onClick={k.pick}
                            style={{ justifyContent: 'space-between', minHeight: '88px' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span className={`radio ${k.cls}`}>
                                <i />
                              </span>
                              <span className="tr-car-pic">
                                <img src={k.img} alt="" />
                              </span>
                              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '18px' }}>{k.name}</strong>
                                <span style={{ color: '#3E4B44', fontSize: '15px' }}>{k.info}</span>
                              </span>
                            </span>
                            <strong style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>{k.price}&nbsp;€</strong>
                          </button>
                        ))}
                        <span style={{ fontSize: '15px', color: '#5E6862' }}>
                          Цена за автомобиль, сколько бы вас ни было в пределах мест. Ночная подача (23:00–06:00)
                          +20&nbsp;%.
                        </span>
                      </div>
                    ) : null}
                    {/* 4. Обратно — its own question, nothing chosen */}
                    <div className="tr-block ios-in">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <InfoTitle
                          title={
                            <h2 style={{ fontSize: '23px' }}>
                              Обратно {v.outDay}, {v.outWeekday}: нужен трансфер?
                            </h2>
                          }
                          info={
                            'Заберём из санатория ' +
                            v.hotelShort +
                            ' и отвезём к самолёту, поезду или в отель. К самолёту выезжаем за 3 часа до вылета, время подтвердим за день.'
                          }
                        />
                      </div>
                      <div id="trBack" className="tr-q" role="radiogroup" aria-label="Нужен ли трансфер обратно">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={v.backOn}
                          className={`choice ${v.backYesCls}`}
                          onClick={v.pickBackYes}
                        >
                          <span className={`radio ${v.backYesCls}`}>
                            <i />
                          </span>
                          <InfoTitle
                            title="Да, отвезите обратно"
                            info={v.backSub}
                            extra={v.backPaid ? <PaidStamp>{v.backPaid}</PaidStamp> : null}
                          />
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={v.backNoCls === 'on'}
                          className={`choice tr-no ${v.backNoCls}`}
                          onClick={v.pickBackNo}
                        >
                          <span className={`radio ${v.backNoCls}`}>
                            <i />
                          </span>
                          <strong>Нет, обратно сам</strong>
                        </button>
                      </div>
                      {v.backOn ? (
                        <div id="trBackWhere" className="tr-sub ios-in">
                          <div className="lbl" style={{ fontSize: '17px', color: '#1C2620' }}>
                            Куда отвезти {v.outDay}?
                          </div>
                          <div className="tr-q" role="radiogroup" aria-label="Куда отвезти">
                            <button
                              type="button"
                              role="radio"
                              aria-checked={v.backSame}
                              className={`choice ${v.sameCls}`}
                              onClick={v.pickSame}
                            >
                              <span className={`radio ${v.sameCls}`}>
                                <i />
                              </span>
                              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '18px' }}>Туда же, откуда забрали</strong>
                                <span style={{ color: '#3E4B44', fontSize: '15px' }}>{v.sameInfo}</span>
                              </span>
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={v.backOther}
                              className={`choice ${v.otherCls}`}
                              onClick={v.pickOther}
                            >
                              <span className={`radio ${v.otherCls}`}>
                                <i />
                              </span>
                              <InfoTitle
                                title="В другое место"
                                info="Другой город, аэропорт, вокзал или отель — выберете ниже."
                              />
                            </button>
                          </div>
                          {v.backOther ? (
                            <div className="ios-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div id="trBackCities" className="rowlist" role="radiogroup" aria-label="Куда отвезти">
                                {v.backCities.map((c: any) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={c.cls === 'on'}
                                    className={`rowpick ${c.cls}`}
                                    onClick={c.pick}
                                  >
                                    <span className={`radio ${c.cls}`}>
                                      <i />
                                    </span>
                                    <span className="rowpick-name">
                                      {c.to}
                                      {c.paid ? <span className="rowpick-badge">{c.paid}</span> : null}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              {v.backCityChosen ? (
                                <div
                                  className="ios-in"
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                                    gap: '16px',
                                    alignItems: 'end',
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="lbl" htmlFor="backplace">
                                      Куда именно отвезти?
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                      <select
                                        id="backplace"
                                        className={'input' + (v.backSpot ? '' : ' input-empty')}
                                        style={{ paddingRight: '44px' }}
                                        value={v.backSpot}
                                        onChange={v.pickBackSpot}
                                      >
                                        <option value="" disabled>
                                          Выберите: аэропорт, вокзал или отель
                                        </option>
                                        {v.backPlaces.map((p: any) => (
                                          <option key={p.t} value={p.t}>
                                            {p.t}
                                          </option>
                                        ))}
                                      </select>
                                      <Chevron />
                                    </div>
                                  </div>
                                  <BackFlight v={v} id="backflight" />
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          {v.backSame ? (
                            <div className="ios-in" style={{ maxWidth: '420px' }}>
                              <BackFlight v={v} id="backflight2" />
                              <span style={{ display: 'block', marginTop: '8px', fontSize: '15px', color: '#5E6862' }}>
                                Заберём из санатория за 3 часа до вылета. Точное время подтвердим за день до отъезда.
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {v.noNeed ? (
              <div
                className="card ios-in"
                style={{
                  padding: '22px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: '#EEF5F1',
                  borderColor: '#C8DED3',
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '18px' }}>Хорошо, трансфер не добавляем</div>
                <p style={{ margin: '0', fontSize: '17px', color: '#1C2620' }}>
                  Адрес санатория и как доехать на машине или автобусе пришлём в подтверждении. Трансфер можно добавить
                  позже — просто позвоните.
                </p>
              </div>
            ) : null}
            <StepNext
              back={{ to: '/rooms', label: '← Назад к номеру' }}
              next={{ to: '/guests', label: 'Далее: данные гостей →' }}
              info={
                <>
                  Итого: <strong>{v.total}</strong>
                </>
              }
              missing={() => {
                const b = logic.props.booking.booking;
                const flyDays = isFlightDay(toD(b.checkin)) && isFlightDay(toD(b.checkout));
                const fly: Missing[] = !b.flightAsked
                  ? [{ label: 'как вы доберётесь до Литвы', target: '#flyChoice' }]
                  : b.flights === 'no' || b.flights === 'help' || (b.flightPackage && flyDays)
                    ? []
                    : b.flights === 'yes' || b.flightPackage
                      ? [
                          {
                            label: 'даты с нашим рейсом',
                            target: document.getElementById('flyAlt') ? '#flyAlt' : '#flyChoice',
                          },
                        ]
                      : [{ label: 'как вы доберётесь до Литвы', target: '#flyChoice' }];
                return [...fly, ...logic.gaps()];
              }}
            />
          </div>
          {/* Summary */}
          <OrderSummary
            details={[
              ['Даты', order.dates],
              ['Номер', order.roomName],
              ['Программа', order.programName, order.programPerDay],
              ['Гости', order.guests],
            ]}
            prices={orderPriceRows(order)}
            total={v.total}
            footer={<AdvanceNote order={order} />}
          />
        </div>
        <SiteFooter />
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
