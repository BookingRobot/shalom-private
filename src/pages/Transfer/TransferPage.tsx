import { VanIcon } from '../../components/icons';
import { Fragment } from 'react';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { api } from '../../api';
import { AdvanceNote, OrderSummary, orderPriceRows } from '../../components/OrderSummary';
import { StepNext } from '../../components/StepNext';
import { orderSummary } from '../../lib/orderSummary';
import { WEEKDAYS_SHORT, daysBetween, nightsWord, shortDate, toD } from '../../lib/dates';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { FlightChoice } from '../../components/FlightChoice';
import { freeTransferPlaces, sanatoriumTransferName, transferBySanatorium } from '../../data/transferPolicy';
import { legOf, transferLegs } from '../../lib/transferCost';
import { usePageTitle } from '../../lib/usePageTitle';
import './TransferPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class TransferLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    const tr = props.booking.booking.transfer;
    this.state = {
      need: tr.mode !== 'none',
      city: tr.place,
      vehicle: tr.vehicle,
      place: '',
      indiv: tr.mode === 'individual',
      cmp: tr.mode === 'individual',
      back: tr.back,
      backSame: tr.backPlace === tr.place,
      backCity: tr.backPlace,
    };
  }
  syncBooking(st) {
    return {
      transfer: {
        mode: !st.need ? 'none' : st.indiv ? 'individual' : 'group',
        back: st.back,
        place: st.city,
        backPlace: st.backSame ? st.city : st.backCity,
        vehicle: st.vehicle,
      },
    } as const;
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const booking = this.props.booking.booking;
    const { places: PICKUP_PLACES, vehicles: VEHICLES } = api.getTransferOptions();
    const TRANSFER_GUESTS = this.props.booking.booking.adults + this.props.booking.booking.children;
    const need = this.state.need ?? true;
    const city = this.state.city ?? 'vilnius';

    const cur = PICKUP_PLACES.find((c) => c.id === city) || PICKUP_PLACES[0];
    const place = cur.places.includes(this.state.place) ? this.state.place : cur.places[0];
    const back = this.state.back ?? true,
      backSame = this.state.backSame ?? true,
      backCity = this.state.backCity ?? 'vilnius';
    const backCur = PICKUP_PLACES.find((c) => c.id === backCity) || PICKUP_PLACES[0];
    // Рыночные цены (Vilnius Airport → Druskininkai: частные перевозчики 130–190\u00a0€ за машину) — [ПРОВЕРИТЬ ПО ТАРИФУ ПЕРЕВОЗЧИКА]
    const vehicle = this.state.vehicle ?? 'car';

    const indiv = !!this.state.indiv;
    // the same rule as the order summary: free (sanatorium) / in the flight package / our tariff
    const tNow = {
      mode: (!need ? 'none' : indiv ? 'individual' : 'group') as 'none' | 'individual' | 'group',
      back,
      place: city,
      backPlace: backSame ? city : backCity,
      vehicle,
    };
    const tr = transferLegs(booking, tNow);
    const legs = tr.legs.length;
    const transferTotal = tr.total;
    const vName = (VEHICLES.find((v) => v.id === vehicle) || VEHICLES[0]).name.toLowerCase();
    const transferSum = need
      ? (transferTotal ? fmt(transferTotal) + '\u00a0€' : 'бесплатно') +
        ' · ' +
        (indiv ? 'индивидуальный, ' + vName : 'групповой') +
        (legs === 2 ? ', туда и обратно' : ', в одну сторону')
      : '0\u00a0€';
    const bySanH = transferBySanatorium(booking.hotelId);
    const freeCities = freeTransferPlaces(booking.hotelId);
    const inPkg = !!booking.flightPackage && !bySanH;
    // a group seat from the chosen city: free / in the package / extra / tariff
    const seat = legOf(booking, city, { ...tNow, mode: 'group' });
    const seatPP = Math.round(seat.price / TRANSFER_GUESTS);
    const carLeg = (vid: string) => legOf(booking, city, { ...tNow, mode: 'individual', vehicle: vid });
    return {
      need,
      noNeed: !need,
      yesCls: need ? 'on' : '',
      noCls: need ? '' : 'on',
      sayYes: () => this.setState({ need: true }),
      sayNo: () => this.setState({ askNo: true }),
      askNo: !!this.state.askNo,
      confirmNo: () => this.setState({ askNo: false, need: false }),
      keepTransfer: () => this.setState({ askNo: false, need: true }),
      cityName: cur.name,
      cities: PICKUP_PLACES.map((c) => {
        const g = legOf(booking, c.id, { ...tNow, mode: 'group' });
        return {
          ...c,
          on: c.id === city,
          cls: c.id === city ? 'on' : '',
          badge: g.kind === 'free' ? 'бесплатно' : g.kind === 'package' ? 'в пакете' : '',
          pick: () => this.setState({ city: c.id }),
        };
      }),
      places: cur.places.map((t) => ({ t })),
      place,
      fromHotel: /^От отеля/.test(place),
      pickPlace: (e) => this.setState({ place: e.target.value }),
      indiv,
      cmp: !!this.state.cmp,
      toggleCmp: () => this.setState(this.state.cmp ? { cmp: false, indiv: false } : { cmp: true }),
      grpCls: indiv ? '' : 'on',
      pickGroup: () => this.setState({ indiv: false }),
      grpBorder: indiv ? '#E3DED2' : '#1F5F4A',
      grpBg: indiv ? '#fff' : '#EEF5F1',
      indBorder: this.state.cmp ? '#1F5F4A' : '#CFC9BB',
      seatPrice:
        seat.kind === 'free'
          ? 'Бесплатно'
          : seat.kind === 'package'
            ? 'В пакете'
            : (inPkg ? '+' : '') + fmt(seatPP) + '\u00a0€',
      seatNote:
        seat.kind === 'free'
          ? 'организует ' + sanatoriumTransferName(booking.hotelId)
          : seat.kind === 'package'
            ? 'входит в пакет с перелётом'
            : inPkg
              ? 'доплата с человека, в одну сторону'
              : 'с человека, в одну сторону',
      seatTotal: fmt(seat.price) + '\u00a0€',
      guestsLabel: TRANSFER_GUESTS + ' гостей',
      indFrom: (inPkg ? '+' : '') + fmt(carLeg('car').price) + '\u00a0€',
      vehicles: VEHICLES.map((v) => ({
        ...v,
        price: (inPkg ? '+' : '') + fmt(carLeg(v.id).price),
        cls: indiv && v.id === vehicle ? 'on' : '',
        pick: () => this.setState({ vehicle: v.id, indiv: true }),
      })),
      back,
      backSame,
      backOther: back && !backSame,
      sameCls: backSame ? 'on' : '',
      otherCls: backSame ? '' : 'on',
      sameInfo: cur.name + ', ' + place.toLowerCase().replace(/^(из|с|от)\s/, ''),
      toggleBack: () => this.setState({ back: !back }),
      pickSame: () => this.setState({ backSame: true }),
      pickOther: () => this.setState({ backSame: false }),
      backCityName: backCur.name,
      backCities: PICKUP_PLACES.map((c) => ({
        ...c,
        cls: c.id === backCity ? 'on' : '',
        pick: () => this.setState({ backCity: c.id }),
      })),
      backPlaces: backCur.places.map((t) => ({
        t: t
          .replace(/^Из аэропорта/, 'В аэропорт')
          .replace(/^С ЖД вокзала/, 'На ЖД вокзал')
          .replace(/^С автовокзала/, 'На автовокзал')
          .replace(/^Из аэропорта (\S+)/, 'В аэропорт $1')
          .replace(/^От отеля/, 'В отель')
          .replace(/^С ЖД вокзала (.+)/, 'На ЖД вокзал $1'),
      })),
      moreOpen: !!this.state.more,
      moreLabel: this.state.more ? 'Свернуть' : 'Подробнее о встрече и поездке',
      toggleMore: () => this.setState({ more: !this.state.more }),
      transferSum,
      inDay: shortDate(toD(booking.checkin)),
      outDay: shortDate(toD(booking.checkout)),
      outWeekday: WEEKDAYS_SHORT[toD(booking.checkout).getUTCDay()],
      stayNights:
        daysBetween(toD(booking.checkin), toD(booking.checkout)) +
        ' ' +
        nightsWord(daysBetween(toD(booking.checkin), toD(booking.checkout))),
      bySan: bySanH,
      sanName: sanatoriumTransferName(booking.hotelId),
      flightOurs: !!booking.flightPackage,
      inPkg,
      // what is already covered, said before the choice
      freeNote: bySanH
        ? sanatoriumTransferName(booking.hotelId).replace(/^с/, 'С') +
          ' бесплатно встречает гостей в ' +
          freeCities.map((id) => (id === 'vilnius' ? 'Вильнюсе' : id === 'kaunas' ? 'Каунасе' : id)).join(' и ') +
          ' — в аэропорту, на вокзале или у отеля. Из других мест — по нашему тарифу.'
        : inPkg
          ? 'Групповой трансфер из аэропорта Вильнюса уже в пакете с перелётом. Другой город или отдельная машина — с доплатой.'
          : '',
      yesSub: bySanH
        ? 'Из Вильнюса и Каунаса — бесплатно, из других мест — по тарифу'
        : inPkg
          ? 'Групповой из аэропорта Вильнюса — уже в пакете с перелётом'
          : 'Заберём из аэропорта, с вокзала или от отеля · групповой от 30\u00a0€ с человека',
      withNote: bySanH
        ? 'Из Вильнюса и Каунаса санаторий привезёт вас бесплатно.'
        : inPkg
          ? 'Групповой трансфер из аэропорта Вильнюса уже оплачен в пакете с перелётом.'
          : 'Групповой трансфер — всего 30\u00a0€ с человека, индивидуальный — от 130\u00a0€ за машину.',
      noSub: inPkg ? 'Цена пакета с перелётом не изменится' : 'На машине или общественным транспортом',
      transferLead:
        booking.flights === 'help' && !booking.flightPackage
          ? 'Нужен ли трансфер? Консультант уточнит время, когда подберёт рейс.'
          : bySanH
            ? 'Выберите, откуда вас забрать — и нужна ли дорога обратно.'
            : booking.flightPackage
              ? 'Встретим у самолёта в Вильнюсе — или выберите другое место.'
              : 'Нужен ли вам трансфер? Встретим с табличкой, поможем с багажом, довезём до стойки регистрации.',
      total:
        fmt(
          orderSummary(this.props.booking.booking).stay +
            orderSummary(this.props.booking.booking).flight +
            transferTotal,
        ) + '\u00a0€',
    };
  }
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
            <span style={{ fontSize: '16px', color: '#3E4B44' }}>Нужна помощь с заказом?</span>
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
            {v.freeNote ? (
              <div className="tr-free ios-in" role="note">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                <span>{v.freeNote}</span>
              </div>
            ) : null}
            {
              <>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  <button
                    type="button"
                    className={`choice ${v.yesCls ?? ''}`}
                    onClick={v.sayYes}
                    style={{ flex: '2 1 360px' }}
                  >
                    <span className={`radio ${v.yesCls ?? ''}`}>
                      <i />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '18px' }}>Да, нужен трансфер</strong>
                        <span
                          style={{
                            background: '#FFF1D6',
                            color: '#8A5A00',
                            fontSize: '14px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: 'var(--r)',
                          }}
                        >
                          Рекомендуем
                        </span>
                      </span>
                      <span style={{ color: '#3E4B44', fontSize: '16px' }}>{v.yesSub}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`choice ${v.noCls ?? ''}`}
                    onClick={v.sayNo}
                    style={{
                      flex: '1 1 220px',
                      padding: '12px 16px',
                      minHeight: '56px',
                      borderWidth: '1px',
                      gap: '12px',
                    }}
                  >
                    <span className={`radio ${v.noCls ?? ''}`} style={{ width: '22px', height: '22px' }}>
                      <i />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#3E4B44' }}>Нет, доберусь сам</span>
                      <span style={{ color: '#5E6862', fontSize: '15px' }}>{v.noSub}</span>
                    </span>
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
                          От аэропорта Вильнюса до санатория — 130 км. Прямого автобуса из аэропорта нет: нужно доехать
                          до автовокзала, купить билет, затем 2 часа в пути и такси до санатория — с чемоданами.
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
                  <>
                    <div
                      className="card"
                      style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                    >
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <h2 style={{ fontSize: '23px' }}>Откуда вас забрать {v.inDay}?</h2>
                        <p style={{ margin: '0', color: '#3E4B44', fontSize: '17px' }}>
                          Большинство гостей Друскининкай прилетают в Вильнюс — дорога до санатория занимает около 2
                          часов.
                        </p>
                      </div>
                      <div className="rowlist" role="radiogroup" aria-label="Откуда забрать">
                        {(v.cities || []).map((c: any, i: number) => (
                          <Fragment key={i}>
                            <button type="button" className={`rowpick ${c.cls ?? ''}`} onClick={c.pick}>
                              <span className={`radio ${c.cls ?? ''}`}>
                                <i />
                              </span>
                              <span className="rowpick-name">
                                {c.from}
                                {c.badge ? <span className="rowpick-badge">{c.badge}</span> : null}
                              </span>
                              <span className="rowpick-info">{c.info}</span>
                            </button>
                            {c.on ? (
                              <div className="rowpick-detail">
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
                                      Откуда именно вас забрать?
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                      <select
                                        id="place"
                                        className="input"
                                        style={{ paddingRight: '44px' }}
                                        value={v.place}
                                        onChange={v.pickPlace}
                                      >
                                        {(v.places || []).map((p: any, _i0: number) => (
                                          <Fragment key={_i0}>
                                            <option value={p.t}>{p.t}</option>
                                          </Fragment>
                                        ))}
                                      </select>{' '}
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
                                        style={{
                                          position: 'absolute',
                                          right: '14px',
                                          top: '17px',
                                          pointerEvents: 'none',
                                        }}
                                      >
                                        <path d="m6 9 6 6 6-6" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="lbl" htmlFor="flight" style={{ fontSize: '15px' }}>
                                      Уже есть билеты? Рейс и время прибытия
                                      <span style={{ fontWeight: '400', color: '#5E6862' }}>
                                        {' '}
                                        · необязательно, можно сообщить позже
                                      </span>
                                    </label>
                                    <input
                                      id="flight"
                                      className="input"
                                      type="text"
                                      placeholder="Например: LO 771, 14:35"
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
                        <>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                              gap: '16px',
                              padding: '18px 20px',
                              border: '1px solid #E3DED2',
                              borderRadius: 'var(--r)',
                              background: '#FAF8F3',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1/-1' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1/-1' }}>
                              <label className="lbl" htmlFor="maplink">
                                Ссылка на Google Maps{' '}
                                <span style={{ fontWeight: '600', color: '#5E6862' }}>(не обязательно)</span>
                              </label>
                              <input
                                id="maplink"
                                className="input"
                                type="url"
                                placeholder="https://maps.app.goo.gl/…"
                              />
                              <span style={{ fontSize: '15px', color: '#5E6862' }}>
                                Откройте отель в Google Maps → «Поделиться» → скопируйте ссылку. Так водитель точно не
                                ошибётся.
                              </span>
                            </div>
                          </div>
                        </>
                      ) : null}
                      {/* Transfer type: group (cheapest) by default, individual on request */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="lbl" style={{ fontSize: '18px', color: '#1C2620' }}>
                          Как поедем
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '20px',
                              flexWrap: 'wrap',
                              padding: '18px 20px',
                              border: `2px solid ${v.grpBorder ?? ''}`,
                              background: v.grpBg,
                              borderRadius: 'var(--r) var(--r) 0 0',
                            }}
                          >
                            <span
                              style={{
                                width: '170px',
                                height: '84px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 'none',
                                background: '#fff',
                                borderRadius: 'var(--r)',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src="/img/165765111b3ce679a969db85fe7d023f.png"
                                alt="Микроавтобус"
                                style={{ width: '170px', height: 'auto', display: 'block' }}
                              />
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 300px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '20px' }}>Групповой трансфер</strong>
                                <span
                                  style={{
                                    background: '#1F5F4A',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--r)',
                                  }}
                                >
                                  Самый выгодный
                                </span>
                              </span>
                              <span style={{ fontSize: '16px', color: '#1C2620' }}>
                                Обычно микроавтобус Mercedes Sprinter / Vito вместе с другими гостями санаториев.
                              </span>
                              <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                                {v.cityName} → санаторий · встреча с табличкой · помощь с багажом
                              </span>
                            </span>
                            <span
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: '2px',
                                flex: '0 0 auto',
                              }}
                            >
                              <strong style={{ fontSize: '24px', whiteSpace: 'nowrap' }}>{v.seatPrice}</strong>
                              <span style={{ fontSize: '14px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                                {v.seatNote}
                              </span>
                              <span style={{ fontSize: '14px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                                за {v.guestsLabel}: <strong style={{ color: '#1C2620' }}>{v.seatTotal}</strong>
                              </span>
                            </span>
                          </div>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              width: '100%',
                              minHeight: '52px',
                              padding: '10px 20px',
                              marginTop: '-2px',
                              border: `2px solid ${v.indBorder ?? ''}`,
                              borderTop: '1px dashed #C8DED3',
                              borderRadius: '0 0 var(--r) var(--r)',
                              background: '#FAFBF9',
                              cursor: 'pointer',
                              color: '#1C2620',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!v.cmp}
                              onChange={v.toggleCmp}
                              style={{
                                width: '24px',
                                height: '24px',
                                accentColor: '#1F5F4A',
                                margin: '0',
                                flex: 'none',
                              }}
                            />
                            <span style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
                              <strong style={{ fontSize: '17px', color: '#1F5F4A' }}>
                                Хочу ехать с комфортом — отдельной машиной
                              </strong>
                              <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                                Только вы, без ожидания и попутчиков · от {v.indFrom} за машину
                              </span>
                            </span>
                            <VanIcon height={26} />
                          </label>
                          {v.cmp ? (
                            <>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                  padding: '4px 16px 16px',
                                  background: '#FAFBF9',
                                }}
                              >
                                <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                                  Выберите, как поедете. Цены {v.cityName} → санаторий, в одну сторону; обратно —
                                  столько же.
                                </span>
                                <button
                                  type="button"
                                  className={`choice ${v.grpCls ?? ''}`}
                                  onClick={v.pickGroup}
                                  style={{ justifyContent: 'space-between', minHeight: '64px' }}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span className={`radio ${v.grpCls ?? ''}`}>
                                      <i />
                                    </span>
                                    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <strong style={{ fontSize: '18px' }}>Групповой трансфер</strong>
                                      <span style={{ color: '#3E4B44', fontSize: '15px' }}>
                                        Вместе с другими гостями, возможно ожидание до 1 часа
                                      </span>
                                    </span>
                                  </span>
                                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <strong style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>{v.seatPrice}</strong>
                                    <span style={{ fontSize: '14px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                                      {v.seatNote}
                                    </span>
                                  </span>
                                </button>
                                {(v.vehicles || []).map((k: any, _i0: number) => (
                                  <Fragment key={_i0}>
                                    <button
                                      type="button"
                                      className={`choice ${k.cls ?? ''}`}
                                      onClick={k.pick}
                                      style={{ justifyContent: 'space-between', minHeight: '96px' }}
                                    >
                                      {' '}
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span className={`radio ${k.cls ?? ''}`}>
                                          <i />
                                        </span>
                                        <span
                                          style={{
                                            width: '150px',
                                            height: '72px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: 'none',
                                            background: '#fff',
                                            borderRadius: 'var(--r)',
                                            overflow: 'hidden',
                                          }}
                                        >
                                          <img
                                            src={k.img}
                                            alt=""
                                            style={{ width: '150px', height: 'auto', display: 'block' }}
                                          />
                                        </span>
                                        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                          <strong style={{ fontSize: '18px' }}>{k.name}</strong>
                                          <span style={{ color: '#3E4B44', fontSize: '15px' }}>{k.info}</span>
                                        </span>
                                      </span>{' '}
                                      <strong style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>
                                        {k.price}&nbsp;€
                                      </strong>{' '}
                                    </button>
                                  </Fragment>
                                ))}
                                <span style={{ fontSize: '15px', color: '#5E6862' }}>
                                  Цена за автомобиль, сколько бы вас ни было в пределах мест. Ночная подача
                                  (23:00–06:00) +20&nbsp;%.
                                </span>
                              </div>
                            </>
                          ) : null}
                        </div>
                        {!v.indiv ? (
                          <div
                            style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              background: '#FFF1D6',
                              borderRadius: 'var(--r)',
                              padding: '12px 16px',
                              fontSize: '15px',
                              color: '#1C2620',
                              maxWidth: '900px',
                            }}
                          >
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
                            <span>
                              <strong>Это не индивидуальная поездка.</strong> Вы едете вместе с другими гостями:
                              возможно ожидание других рейсов до 1 часа, по дороге — остановки у других санаториев
                              (дорога длиннее на 30–40 минут). Точное время встречи сообщим за день до приезда.
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {/* Return transfer */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '20px',
                          border: '2px solid #1F5F4A',
                          borderRadius: 'var(--r)',
                          background: '#fff',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            cursor: 'pointer',
                            fontSize: '18px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!v.back}
                            onChange={v.toggleBack}
                            style={{ width: '26px', height: '26px', accentColor: '#1F5F4A', margin: '0', flex: 'none' }}
                          />
                          <span>
                            <strong style={{ fontSize: '18px' }}>
                              Обратный трансфер {v.outDay}, {v.outWeekday}
                            </strong>
                            <br />
                            <span style={{ color: '#3E4B44', fontSize: '16px' }}>
                              Из санатория «Эгле Комфорт» — куда вас отвезти?
                            </span>
                          </span>
                        </label>
                        {v.back ? (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                                <button
                                  type="button"
                                  className={`choice ${v.sameCls ?? ''}`}
                                  onClick={v.pickSame}
                                  style={{ flex: '2 1 320px' }}
                                >
                                  {' '}
                                  <span className={`radio ${v.sameCls ?? ''}`}>
                                    <i />
                                  </span>{' '}
                                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <strong style={{ fontSize: '18px' }}>Туда же, откуда забрали</strong>
                                    <span style={{ color: '#3E4B44', fontSize: '15px' }}>{v.sameInfo}</span>
                                  </span>{' '}
                                </button>
                                <button
                                  type="button"
                                  className={`choice ${v.otherCls ?? ''}`}
                                  onClick={v.pickOther}
                                  style={{
                                    flex: '1 1 200px',
                                    padding: '12px 16px',
                                    minHeight: '56px',
                                    borderWidth: '1px',
                                    gap: '12px',
                                  }}
                                >
                                  <span
                                    className={`radio ${v.otherCls ?? ''}`}
                                    style={{ width: '22px', height: '22px' }}
                                  >
                                    <i />
                                  </span>
                                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#3E4B44' }}>
                                      В другое место
                                    </span>
                                    <span style={{ color: '#5E6862', fontSize: '15px' }}>
                                      Другой город, вокзал или отель
                                    </span>
                                  </span>
                                </button>
                              </div>
                              {v.backOther ? (
                                <>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '14px',
                                      padding: '16px',
                                      background: '#FAF8F3',
                                      border: '1px solid #E3DED2',
                                      borderRadius: 'var(--r)',
                                    }}
                                  >
                                    <div className="lbl">Куда отвезти {v.outDay}?</div>
                                    <div className="rowlist" role="radiogroup" aria-label="Куда отвезти">
                                      {(v.backCities || []).map((c: any, i: number) => (
                                        <button
                                          key={i}
                                          type="button"
                                          className={`rowpick ${c.cls ?? ''}`}
                                          onClick={c.pick}
                                        >
                                          <span className={`radio ${c.cls ?? ''}`}>
                                            <i />
                                          </span>
                                          <span className="rowpick-name">{c.to}</span>
                                        </button>
                                      ))}
                                    </div>
                                    <div
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
                                          <select id="backplace" className="input" style={{ paddingRight: '44px' }}>
                                            {(v.backPlaces || []).map((p: any, _i0: number) => (
                                              <Fragment key={_i0}>
                                                <option>{p.t}</option>
                                              </Fragment>
                                            ))}
                                          </select>{' '}
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
                                            style={{
                                              position: 'absolute',
                                              right: '14px',
                                              top: '17px',
                                              pointerEvents: 'none',
                                            }}
                                          >
                                            <path d="m6 9 6 6 6-6" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label className="lbl" htmlFor="backflight" style={{ fontSize: '15px' }}>
                                          Уже есть билеты? Рейс и время отправления
                                          <span style={{ fontWeight: '400', color: '#5E6862' }}>
                                            {' '}
                                            · необязательно, можно сообщить позже
                                          </span>
                                        </label>
                                        <input
                                          id="backflight"
                                          className="input"
                                          type="text"
                                          placeholder="Например: LO 772, 16:10"
                                          style={{ minHeight: '44px', fontSize: '16px' }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : null}
                              {v.backSame ? (
                                <>
                                  <div
                                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '420px' }}
                                  >
                                    <label className="lbl" htmlFor="backflight2" style={{ fontSize: '15px' }}>
                                      Уже есть билеты? Рейс и время отправления
                                      <span style={{ fontWeight: '400', color: '#5E6862' }}>
                                        {' '}
                                        · необязательно, можно сообщить позже
                                      </span>
                                    </label>
                                    <input
                                      id="backflight2"
                                      className="input"
                                      type="text"
                                      placeholder="Например: LO 772, 16:10"
                                      style={{ minHeight: '44px', fontSize: '16px' }}
                                    />
                                    <span style={{ fontSize: '15px', color: '#5E6862' }}>
                                      Заберём из санатория за 3 часа до вылета. Точное время подтвердим за день до
                                      отъезда.
                                    </span>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'start',
                          padding: '14px 16px',
                          borderRadius: 'var(--r)',
                          border: '1px solid #E3DED2',
                          fontSize: '16px',
                          color: '#3E4B44',
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>
                          При проживании от 10 суток санаторий «Эгле» предоставляет трансфер из аэропорта Вильнюса{' '}
                          <strong>бесплатно</strong>. Ваш заезд — {v.stayNights}; если продлите на сутки, трансфер будет
                          бесплатным.
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.noNeed ? (
                  <>
                    <div
                      className="card"
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
                        Адрес санатория и как доехать на машине или автобусе пришлём в подтверждении. Трансфер можно
                        добавить позже — просто позвоните.
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            }
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
                return b.flightPackage || b.flights === 'no' || b.flights === 'help'
                  ? []
                  : [{ label: 'как вы доберётесь до Литвы', target: '#flyChoice' }];
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
