import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './TransferPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class TransferLogic extends PageLogic {
  constructor(props?: any) {
    super(props);
    this.state = {
      need: true,
      city: 'vilnius',
      vehicle: 'car',
      place: '',
      indiv: false,
      back: true,
      backSame: true,
      backCity: 'vilnius',
    };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const need = this.state.need ?? true;
    const city = this.state.city ?? 'vilnius';
    const cityDefs = [
      {
        id: 'vilnius',
        name: 'Вильнюс',
        from: 'Из Вильнюса',
        to: 'В Вильнюс',
        info: 'аэропорт, вокзалы · 130 км · ≈ 2 ч',
        places: ['Из аэропорта Вильнюса', 'С ЖД вокзала', 'С автовокзала', 'От отеля в Вильнюсе'],
      },
      {
        id: 'kaunas',
        name: 'Каунас',
        from: 'Из Каунаса',
        to: 'В Каунас',
        info: 'аэропорт, вокзалы · 130 км · ≈ 2 ч',
        places: ['Из аэропорта Каунаса', 'С ЖД вокзала', 'С автовокзала', 'От отеля в Каунасе'],
      },
      {
        id: 'warsaw',
        name: 'Варшава',
        from: 'Из Варшавы',
        to: 'В Варшаву',
        info: 'аэропорт Шопена · 330 км · ≈ 5 ч',
        places: [
          'Из аэропорта Шопена',
          'Из аэропорта Модлин',
          'С ЖД вокзала Варшава-Центральная',
          'От отеля в Варшаве',
        ],
      },
      {
        id: 'marijampole',
        name: 'Мариямполе',
        from: 'Из Мариямполе',
        to: 'В Мариямполе',
        info: 'автовокзал · 75 км · ≈ 1 ч 15 мин',
        places: ['С автовокзала', 'С ЖД вокзала', 'От отеля'],
      },
      {
        id: 'druskininkai',
        name: 'Друскининкай',
        from: 'Из Друскининкай',
        to: 'В Друскининкай',
        info: 'автовокзал или отель в городе · 10 мин',
        places: ['С автовокзала Друскининкай', 'От отеля в Друскининкай'],
      },
    ];
    const cur = cityDefs.find((c) => c.id === city) || cityDefs[0];
    const place = cur.places.includes(this.state.place) ? this.state.place : cur.places[0];
    const back = this.state.back ?? true,
      backSame = this.state.backSame ?? true,
      backCity = this.state.backCity ?? 'vilnius';
    const backCur = cityDefs.find((c) => c.id === backCity) || cityDefs[0];
    // Рыночные цены (Vilnius Airport → Druskininkai: частные перевозчики 130–190\u00a0€ за машину) — [ПРОВЕРИТЬ ПО ТАРИФУ ПЕРЕВОЗЧИКА]
    const PRICES = {
      vilnius: { seat: 30, car: 130, van: 170, premium: 200 },
      kaunas: { seat: 30, car: 130, van: 170, premium: 200 },
      warsaw: { seat: 70, car: 320, van: 420, premium: 480 },
      marijampole: { seat: 25, car: 85, van: 110, premium: 140 },
      druskininkai: { seat: 10, car: 15, van: 25, premium: 35 },
    };
    const GUESTS = 2;
    const vehicle = this.state.vehicle ?? 'car';
    const VEH = [
      {
        id: 'car',
        img: '/img/edfa76a71b436810e36bd398235820b7.png',
        name: 'Легковой автомобиль',
        info: 'до 3 человек, 3 чемодана · Škoda Octavia, Toyota Camry или аналог',
        d: 'M5 15h14M4 15l1.5-3.5h13L20 15M4 15v2.5h16V15M7 17.5a1.2 1.2 0 1 0 0 .01M17 17.5a1.2 1.2 0 1 0 0 .01M8.5 11.5l1-2h5l1 2',
        sz: 26,
      },
      {
        id: 'van',
        img: '/img/165765111b3ce679a969db85fe7d023f.png',
        name: 'Микроавтобус',
        info: 'до 7 человек, 7 чемоданов · Mercedes Vito / V-Class',
        d: 'M3 6h12l6 5v7H3zM3 12h18M7 18a1.5 1.5 0 1 0 0 .01M17 18a1.5 1.5 0 1 0 0 .01M7 6v6M11 6v6M15 6v5',
        sz: 38,
      },
      {
        id: 'premium',
        img: '/img/3bd69c9fea391e27ab155af10bf6d27f.png',
        name: 'Премиум-класс',
        info: 'до 3 человек · Mercedes E-Class, вода, помощь с багажом',
        d: 'M3 15h18M2 15l2-4h16l2 4M2 15v3h20v-3M6 18a1.3 1.3 0 1 0 0 .01M18 18a1.3 1.3 0 1 0 0 .01M7 11l1.5-2.5h7L17 11M12 3.5l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8L9.4 5.4l1.8-.3z',
        sz: 32,
      },
    ];
    const indiv = !!this.state.indiv;
    // Group transfer (default, per person) vs individual car (per vehicle)
    const legPrice = (cityId) => {
      const P = PRICES[cityId] || PRICES.vilnius;
      return indiv ? P[vehicle] : P.seat * GUESTS;
    };
    const leg1 = need ? legPrice(city) : 0;
    const leg2 = need && back ? legPrice(backSame ? city : backCity) : 0;
    const legs = (need ? 1 : 0) + (need && back ? 1 : 0);
    const transferTotal = leg1 + leg2;
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    const vName = (VEH.find((v) => v.id === vehicle) || VEH[0]).name.toLowerCase();
    const transferSum = need
      ? fmt(transferTotal) +
        '\u00a0€ · ' +
        (indiv ? 'индивидуальный, ' + vName : 'групповой') +
        (legs === 2 ? ', туда и обратно' : ', в одну сторону')
      : '0\u00a0€';
    const curP = PRICES[city] || PRICES.vilnius;
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
      cities: cityDefs.map((c) => ({
        ...c,
        cls: c.id === city ? 'on' : '',
        pick: () => this.setState({ city: c.id }),
      })),
      places: cur.places.map((t) => ({ t })),
      place,
      fromHotel: /^От отеля/.test(place),
      pickPlace: (e) => this.setState({ place: e.target.value }),
      indiv,
      toggleIndiv: () => this.setState({ indiv: !indiv }),
      grpBorder: indiv ? '#E3DED2' : '#1F5F4A',
      grpBg: indiv ? '#fff' : '#EEF5F1',
      indBorder: indiv ? '#1F5F4A' : '#CFC9BB',
      seatPrice: fmt(curP.seat) + '\u00a0€',
      seatTotal: fmt(curP.seat * GUESTS) + '\u00a0€',
      guestsLabel: GUESTS + ' гостей',
      indFrom: fmt(curP.car) + '\u00a0€',
      vehicles: VEH.map((v) => ({
        ...v,
        price: curP[v.id],
        cls: v.id === vehicle ? 'on' : '',
        pick: () => this.setState({ vehicle: v.id }),
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
      backCities: cityDefs.map((c) => ({
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
      total: fmt(2138 + transferTotal) + '\u00a0€',
    };
  }
}

export default function TransferPage() {
  usePageTitle('Шаг 1 из 3 — трансфер');
  const [v, logic] = usePageLogic(TransferLogic);
  return (
    <div className="page pg-transfer">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '0 24px',
              minHeight: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#1C2620' }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
              </svg>
              <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '24px', fontWeight: '700' }}>
                Санатории Литвы
              </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>Нужна помощь с заказом?</span>
              <a
                href="tel:+37060000000"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: '#1C2620',
                  fontWeight: '800',
                  fontSize: '20px',
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
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
                </svg>
                +370&nbsp;600 00000
              </a>
            </div>
          </div>
        </header>
        {/* Steps */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              flexWrap: 'wrap',
            }}
          >
            <div className="step done">
              <span className="num">✓</span>Номер
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step on">
              <span className="num">2</span>Трансфер
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step">
              <span className="num">3</span>Гости
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step">
              <span className="num">4</span>Рейсы
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step">
              <span className="num">5</span>Оплата
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step" style={{ gap: '8px' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A968F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
              </svg>
              Готово
            </div>
          </div>
        </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '36px' }}>Нужен ли вам трансфер до санатория?</h1>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '18px' }}>
                Встретим с табличкой, поможем с багажом и довезём прямо до стойки регистрации санатория «Эгле Комфорт» в
                Друскининкай.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                gap: '16px',
              }}
            >
              <button type="button" className={`choice ${v.yesCls ?? ''}`} onClick={v.sayYes}>
                {' '}
                <span className={`radio ${v.yesCls ?? ''}`}>
                  <i />
                </span>{' '}
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '20px' }}>Да, нужен трансфер</strong>
                  <span style={{ color: '#3E4B44', fontSize: '16px' }}>
                    Заберём из аэропорта, с вокзала или от отеля
                  </span>
                </span>{' '}
              </button>
              <button type="button" className={`choice ${v.noCls ?? ''}`} onClick={v.sayNo}>
                {' '}
                <span className={`radio ${v.noCls ?? ''}`}>
                  <i />
                </span>{' '}
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '20px' }}>Нет, доберусь сам</strong>
                  <span style={{ color: '#3E4B44', fontSize: '16px' }}>На машине или общественным транспортом</span>
                </span>{' '}
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
                      <h2 id="noTitle" style={{ fontSize: '26px' }}>
                        Вы уверены, что доберётесь сами?
                      </h2>
                    </div>
                    <p style={{ margin: '0', fontSize: '17px', color: '#1C2620' }}>
                      От аэропорта Вильнюса до санатория — 130 км. Прямого автобуса из аэропорта нет: нужно доехать до
                      автовокзала, купить билет, затем 2 часа в пути и такси до санатория — с чемоданами.
                    </p>
                    <div style={{ padding: '14px 16px', background: '#EEF5F1', borderRadius: '2px', fontSize: '16px' }}>
                      <strong>С трансфером:</strong> водитель встречает с табличкой, помогает с багажом и довозит до
                      стойки санатория. Групповой трансфер — всего 30&nbsp;€ с человека, индивидуальный — от 130&nbsp;€
                      за машину.
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
                        style={{ minHeight: '60px', fontSize: '19px' }}
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
                      borderRadius: '2px',
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
                    <h2 style={{ fontSize: '26px' }}>Откуда вас забрать 9 ноября?</h2>
                    <p style={{ margin: '0', color: '#3E4B44', fontSize: '17px' }}>
                      Большинство гостей Друскининкай прилетают в Вильнюс — дорога до санатория занимает около 2 часов.
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
                      gap: '12px',
                    }}
                  >
                    {(v.cities || []).map((c: any, _i0: number) => (
                      <Fragment key={_i0}>
                        <button
                          type="button"
                          className={`choice ${c.cls ?? ''}`}
                          onClick={c.pick}
                          style={{ minHeight: '80px' }}
                        >
                          {' '}
                          <span className={`radio ${c.cls ?? ''}`}>
                            <i />
                          </span>{' '}
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '19px' }}>{c.from}</strong>
                            <span style={{ color: '#3E4B44', fontSize: '15px' }}>{c.info}</span>
                          </span>{' '}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                      gap: '16px',
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
                          style={{ position: 'absolute', right: '14px', top: '17px', pointerEvents: 'none' }}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label className="lbl" htmlFor="flight">
                        Номер рейса или поезда и время прибытия
                      </label>
                      <input id="flight" className="input" type="text" placeholder="Например: LO 771, 14:35" />
                    </div>
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
                          borderRadius: '2px',
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
                          <span style={{ fontSize: '15px', color: '#6B776F' }}>
                            Водитель будет ждать у главного входа. Если выезжаете из квартиры — укажите адрес и подъезд.
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1/-1' }}>
                          <label className="lbl" htmlFor="maplink">
                            Ссылка на Google Maps{' '}
                            <span style={{ fontWeight: '600', color: '#6B776F' }}>(не обязательно)</span>
                          </label>
                          <input id="maplink" className="input" type="url" placeholder="https://maps.app.goo.gl/…" />
                          <span style={{ fontSize: '15px', color: '#6B776F' }}>
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap',
                        padding: '18px 20px',
                        border: `2px solid ${v.grpBorder ?? ''}`,
                        background: v.grpBg,
                        borderRadius: '2px',
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
                          borderRadius: '2px',
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
                          <strong style={{ fontSize: '21px' }}>Групповой трансфер</strong>
                          <span
                            style={{
                              background: '#1F5F4A',
                              color: '#fff',
                              fontSize: '13px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '2px',
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
                        <strong style={{ fontSize: '28px', whiteSpace: 'nowrap' }}>{v.seatPrice}</strong>
                        <span style={{ fontSize: '14px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                          с человека, в одну сторону
                        </span>
                        <span style={{ fontSize: '14px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                          за {v.guestsLabel}: <strong style={{ color: '#1C2620' }}>{v.seatTotal}</strong>
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        background: '#FFF1D6',
                        borderRadius: '2px',
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
                        <strong>Это не индивидуальная поездка.</strong> Вы едете вместе с другими гостями: возможно
                        ожидание других рейсов до 1 часа, по дороге — остановки у других санаториев (дорога длиннее на
                        30–40 минут). Точное время встречи сообщим за день до приезда.
                      </span>
                    </div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        minHeight: '60px',
                        padding: '12px 16px',
                        border: `2px solid ${v.indBorder ?? ''}`,
                        background: '#fff',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '17px',
                        maxWidth: '900px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!v.indiv}
                        onChange={v.toggleIndiv}
                        style={{ width: '26px', height: '26px', accentColor: '#1F5F4A', margin: '0', flex: 'none' }}
                      />
                      <span>
                        <strong>Хочу индивидуальный трансфер</strong> — только для нас, без ожидания и попутчиков
                        <br />
                        <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                          от {v.indFrom} за автомобиль в одну сторону
                        </span>
                      </span>
                    </label>
                    {v.indiv ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            paddingLeft: '18px',
                            borderLeft: '3px solid #C8DED3',
                          }}
                        >
                          <span style={{ fontSize: '15px', color: '#6B776F' }}>
                            Цены за автомобиль {v.cityName} → санаторий, в одну сторону. Обратно — столько же.
                          </span>
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
                                      borderRadius: '2px',
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
                                    <strong style={{ fontSize: '19px' }}>{k.name}</strong>
                                    <span style={{ color: '#3E4B44', fontSize: '15px' }}>{k.info}</span>
                                  </span>
                                </span>{' '}
                                <strong style={{ fontSize: '22px', whiteSpace: 'nowrap' }}>
                                  {k.price}&nbsp;€
                                </strong>{' '}
                              </button>
                            </Fragment>
                          ))}
                          <span style={{ fontSize: '15px', color: '#6B776F' }}>
                            Цена за автомобиль, сколько бы вас ни было в пределах мест. Ночная подача (23:00–06:00)
                            +20&nbsp;%.
                          </span>
                        </div>
                      </>
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
                      borderRadius: '2px',
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
                        <strong style={{ fontSize: '20px' }}>Обратный трансфер 18 ноября, Ср</strong>
                        <br />
                        <span style={{ color: '#3E4B44', fontSize: '16px' }}>
                          Из санатория «Эгле Комфорт» — куда вас отвезти?
                        </span>
                      </span>
                    </label>
                    {v.back ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                              gap: '12px',
                            }}
                          >
                            <button type="button" className={`choice ${v.sameCls ?? ''}`} onClick={v.pickSame}>
                              {' '}
                              <span className={`radio ${v.sameCls ?? ''}`}>
                                <i />
                              </span>{' '}
                              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '18px' }}>Туда же, откуда забрали</strong>
                                <span style={{ color: '#3E4B44', fontSize: '15px' }}>{v.sameInfo}</span>
                              </span>{' '}
                            </button>
                            <button type="button" className={`choice ${v.otherCls ?? ''}`} onClick={v.pickOther}>
                              {' '}
                              <span className={`radio ${v.otherCls ?? ''}`}>
                                <i />
                              </span>{' '}
                              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '18px' }}>В другое место</strong>
                                <span style={{ color: '#3E4B44', fontSize: '15px' }}>
                                  Другой город, вокзал или отель
                                </span>
                              </span>{' '}
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
                                  borderRadius: '2px',
                                }}
                              >
                                <div className="lbl">Куда отвезти 18 ноября?</div>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))',
                                    gap: '10px',
                                  }}
                                >
                                  {(v.backCities || []).map((c: any, _i0: number) => (
                                    <Fragment key={_i0}>
                                      <button
                                        type="button"
                                        className={`choice ${c.cls ?? ''}`}
                                        onClick={c.pick}
                                        style={{ minHeight: '56px', padding: '12px 16px' }}
                                      >
                                        {' '}
                                        <span className={`radio ${c.cls ?? ''}`}>
                                          <i />
                                        </span>{' '}
                                        <strong style={{ fontSize: '17px' }}>{c.to}</strong>{' '}
                                      </button>
                                    </Fragment>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                                    gap: '16px',
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
                                    <label className="lbl" htmlFor="backflight">
                                      Рейс или поезд и время отправления
                                    </label>
                                    <input
                                      id="backflight"
                                      className="input"
                                      type="text"
                                      placeholder="Например: LO 772, 16:10"
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : null}
                          {v.backSame ? (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '420px' }}>
                                <label className="lbl" htmlFor="backflight2">
                                  Рейс или поезд и время отправления 18 ноября
                                </label>
                                <input
                                  id="backflight2"
                                  className="input"
                                  type="text"
                                  placeholder="Например: LO 772, 16:10"
                                />
                                <span style={{ fontSize: '15px', color: '#6B776F' }}>
                                  Заберём из санатория за 3 часа до вылета. Точное время подтвердим за день до отъезда.
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
                      borderRadius: '2px',
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
                      <strong>бесплатно</strong>. Ваш заезд — 9 ночей; если продлите на сутки, трансфер будет
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
                  <div style={{ fontWeight: '800', fontSize: '19px' }}>Хорошо, трансфер не добавляем</div>
                  <p style={{ margin: '0', fontSize: '17px', color: '#1C2620' }}>
                    Адрес санатория и как доехать на машине или автобусе пришлём в подтверждении. Трансфер можно
                    добавить позже — просто позвоните.
                  </p>
                </div>
              </>
            ) : null}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                paddingTop: '8px',
              }}
            >
              <Link className="btn btn-secondary" to="/rooms">
                ← Назад к номеру
              </Link>
              <Link
                className="btn btn-primary"
                to="/guests"
                style={{ minHeight: '64px', fontSize: '21px', padding: '0 40px' }}
              >
                Далее: данные гостей →
              </Link>
            </div>
          </div>
          {/* Summary */}
          <aside
            className="card"
            style={{
              flex: '1 1 300px',
              maxWidth: '360px',
              padding: '0',
              overflow: 'hidden',
              position: 'sticky',
              top: '16px',
            }}
          >
            <img
              src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
              alt=""
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />{' '}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: '800', fontSize: '20px' }}>Санаторий Эгле Комфорт</div>
                <div style={{ fontSize: '16px', color: '#3E4B44' }}>Друскининкай · ★★★★</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '16px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Даты</span>
                  <strong>9–18 ноября · 9 ночей</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Номер</span>
                  <strong>Двухместный</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Программа</span>
                  <strong>«Миди», 3 процедуры</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Гости</span>
                  <strong>2 взрослых</strong>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '16px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Проживание и лечение</span>
                  <strong>2&nbsp;138&nbsp;€</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Трансфер</span>
                  <strong>{v.transferSum}</strong>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  borderTop: '2px solid #1C2620',
                  paddingTop: '12px',
                }}
              >
                <span style={{ fontWeight: '800', fontSize: '18px' }}>Итого</span>
                <span style={{ fontWeight: '800', fontSize: '28px' }}>{v.total}</span>
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#3E4B44',
                  background: '#F4F1EA',
                  borderRadius: '2px',
                  padding: '10px 12px',
                }}
              >
                Сейчас к оплате только аванс 4 % — <strong>86&nbsp;€</strong>. Остальное — в санатории при заезде.
              </div>
            </div>
          </aside>
        </div>
        <footer style={{ background: '#1C2620', color: '#D9E2DC', marginTop: 'auto' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '28px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '16px',
            }}
          >
            <div>Санатории Литвы · консультация на русском 24/7 · WhatsApp +370&nbsp;600 00000</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Как оплатить
              </Link>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Условия отмены
              </Link>
            </div>
          </div>
        </footer>
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
