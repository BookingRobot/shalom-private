import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import { ChooseWizard } from '../../components/ChooseWizard';
import { ResortModal } from '../../components/ResortModal';
import { SearchCard } from '../../components/SearchCard';
import { ChooseCard } from '../../components/ChooseCard';
import { HeaderBar, Brand, MainNav, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CalLegend } from '../../components/calendar/CalLegend';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { MONTHS, MONTHS_N, daysBetween, iso, longDate, nightsWord, shortDate, toD } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { isSoldOutEverywhere } from '../../data/availability';
import { blockedNights, blockedNote, restartNote } from '../../lib/stayCheck';
import { CalNotice } from '../../components/calendar/CalNotice';
import { isFlightDay } from '../../data/flights';
import { api } from '../../api';
import { RESORTS } from '../../data/search';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './MainPage.css';

const RESORT_CARDS = [
  {
    id: 'druskininkai',
    name: 'Друскининкай',
    sub: 'Лечение и минеральные воды',
    img: '/img/80cbf81cb33b38c12f41d140c9e34ba7.jpg',
  },
  {
    id: 'birstonas',
    name: 'Бирштонас',
    sub: 'Спокойный отдых у Немана',
    img: '/img/ac9b1445a29a0df51e1bd45a8a203a39.jpg',
  },
  { id: 'palanga', name: 'Паланга', sub: 'Отдых у Балтийского моря', img: '/img/c4c4cd4bcaad10e81718df6ded79f624.jpg' },
  { id: 'anyksciai', name: 'Аникщяй', sub: 'Природа и тишина', img: '/img/213618680529a455a08f4dc13b8abe7e.jpg' },
];

const HELP_CTX: HelpContextInfo = { dest: 'druskininkai', in: '2026-11-09', out: '2026-11-18' };

class MainLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    this.state = { in: b.checkin, out: b.checkout };
  }
  syncBooking(st) {
    return st.in && st.out ? { checkin: st.in, checkout: st.out } : null;
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const POPULAR_SANATORIUMS = api.getPopularSanatoriums();

    // ---- Custom two-month range calendar with price colours ----
    const st = this.state || {};
    const inD = toD(st.in || '2026-11-09'),
      outD = toD(st.out || '2026-11-18');
    const sel = st.sel || { in: iso(inD), out: iso(outD) };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    // Average price per person per night across the resort — synthetic season curve [ЗАМЕНИТЬ НА РЕАЛЬНЫЕ ТАРИФЫ]
    const BASE = 100;
    const dayIdx = (d) => daysBetween(TODAY, d);
    const priceOf = (d) => {
      const n = dayIdx(d),
        wd = d.getUTCDay(),
        m = d.getUTCMonth();
      return Math.round(
        BASE *
          (1 +
            0.12 * Math.sin(n * 0.42) +
            (wd === 5 || wd === 6 ? 0.06 : 0) +
            (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
            (m >= 5 && m <= 7 ? 0.15 : 0) +
            (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
      );
    };
    const m0 = st.month ?? inD.getUTCMonth(),
      y0 = st.year ?? inD.getUTCFullYear();
    // a stay can't cross a "нет мест" night: say so in a pop-up instead of selecting
    const blocked = (d: Date) => isSoldOutEverywhere(iso(d));
    const pickDay = (date) => () => {
      const k = iso(date);
      if (sel.in && !sel.out && date > toD(sel.in)) {
        const bad = blockedNights(toD(sel.in), date, blocked);
        // the clicked day starts a new stay instead (unless it has no places itself)
        if (bad.length)
          return this.setState(
            blocked(date) ? { note: blockedNote(bad) } : { sel: { in: k, out: null }, note: restartNote(bad, date) },
          );
        return this.setState({ sel: { in: sel.in, out: k }, note: null });
      }
      if (blocked(date)) return this.setState({ note: blockedNote([date], true) });
      this.setState({ sel: { in: k, out: null }, note: null });
    };
    const monthCells = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const cells: CalendarCell[] = [];
      for (let i = 0; i < lead; i++)
        cells.push({
          day: '',
          fly: false,
          sub: '',
          bg: 'transparent',
          border: 'transparent',
          color: '#1C2620',
          subColor: '#3E4B44',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y, m, d));
        const past = date < TODAY;
        const full = !past && isSoldOutEverywhere(iso(date)); /* [ПРИМЕР] нет мест ни в одном объекте */
        const p = priceOf(date),
          r = p / BASE;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9';
        let color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut);
        const between = sIn && sOut && date > sIn && date < sOut;
        // the first "нет мест" day after check-in still works as the check-out day
        const canOut = full && !!sIn && !sOut && date > sIn && !blockedNights(sIn, date, blocked).length;
        if (past) {
          bg = '#E8E6E1';
          color = '#9AA39E';
          subColor = '#9AA39E';
        }
        if (full) {
          bg = 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)';
          color = '#8A968F';
          subColor = '#8A5A00';
        }
        if (between) border = '#1F5F4A';
        if (isIn || isOut) {
          bg = '#1F5F4A';
          color = '#fff';
          subColor = '#D9E2DC';
          border = '#1F5F4A';
        }
        cells.push({
          day: d,
          fly: isFlightDay(date) && !past,
          sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + '\u00a0€',
          bg,
          border,
          color,
          subColor,
          off: past,
          cursor: past || (full && !canOut) ? 'not-allowed' : 'pointer',
          aria:
            d +
            ' ' +
            MONTHS[m] +
            (past ? ', недоступно' : full ? ', нет мест' : ', около ' + p + '\u00a0€ за человека в сутки'),
          pick: pickDay(date),
        });
      }
      return cells;
    };
    // two months side by side: a stay across months is seen at once
    const m1 = (m0 + 1) % 12,
      y1 = m0 === 11 ? y0 + 1 : y0;
    const months = [
      { title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) },
      { title: MONTHS_N[m1] + ' ' + y1, cells: monthCells(y1, m1) },
    ];
    const nights = sIn && sOut ? daysBetween(sIn, sOut) : 0;
    const { booking, update } = this.props.booking;
    return {
      flexMode: !!st.flex,
      setFlex: (flex) => this.setState({ flex }),
      // a recommended option is the choice: set the dates and show sanatoriums right away
      // (with the resort not chosen yet the guest stays here: the bubble points at the resort)
      flexPick: (a, b) => {
        this.setState({ in: a, out: b, flex: false, calOpen: false });
        this.props.booking.update({ checkin: a, checkout: b, chosenDates: true });
        const place = booking.chosenPlace;
        if (place) this.props.navigate(place.startsWith('san:') ? '/results?h=' + place.slice(4) : '/results');
      },
      hotels: POPULAR_SANATORIUMS,
      dest: booking.dest,
      destOptions: RESORTS,
      setDest: (e) => update({ dest: e.target.value }),
      inLabel: longDate(inD),
      outLabel: longDate(outD),
      calOpen: !!st.calOpen,
      calNote: st.note || '',
      calNoteClose: () => this.setState({ note: null }),
      calNoteAsk: () => this.props.help.open(),
      openCal: () =>
        this.setState({
          note: null,
          calOpen: true,
          // dates not chosen yet: an empty calendar, the guest taps the check-in day first
          sel: booking.chosenDates ? { in: iso(inD), out: iso(outD) } : { in: null, out: null },
          month: inD.getUTCMonth(),
          year: inD.getUTCFullYear(),
        }),
      closeCal: () => this.setState({ calOpen: false, note: null }),
      calPrev: () => {
        const m = m0 - 1;
        this.setState({ month: (m + 12) % 12, year: m < 0 ? y0 - 1 : y0 });
      },
      calNext: () => {
        const m = m0 + 1;
        this.setState({ month: m % 12, year: m > 11 ? y0 + 1 : y0 });
      },
      months,
      calHint: st.flex
        ? 'Выберите месяц и сколько ночей — подберём лучшие даты с рейсами'
        : !sIn
          ? 'Нажмите день заезда'
          : !sOut
            ? 'Теперь нажмите день выезда'
            : 'Можно поменять: нажмите новый день заезда',
      selIn: sIn ? shortDate(sIn) : '—',
      selOut: sOut ? shortDate(sOut) : '—',
      selNights: nights ? nights + ' ' + nightsWord(nights) : '—',
      applyOff: !(sIn && sOut),
      applyCal: () => {
        if (!(sIn && sOut)) return;
        this.setState({ in: iso(sIn), out: iso(sOut), calOpen: false });
        update({ chosenDates: true });
      },
    };
  }
}

export default function MainPage() {
  usePageTitle('Санатории Литвы — лечение и отдых');
  const [v, logic] = usePageLogic(MainLogic);
  const [wz, setWz] = useState(false);
  const [resort, setResort] = useState('');
  return (
    <div className="page pg-main">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        {/* Hero: lake photo, header, heading and the search card */}
        <section className="hero">
          <img className="hero-bg" src="/img/ac698b6af7317a86330ea854eaeb2758.jpg" alt="" />
          <div className="hero-shade" />
          <HeaderBar tone="dark" minHeight={80} maxWidth={1340}>
            <div className="hero-left">
              <Brand tone="dark" logo={36} size={26} gap={14} round={5} />
              <MainNav tone="dark" gap={34} size={17} />
            </div>
            <HeaderAside gap={36} wrap={false}>
              <PhoneLink tone="dark" size={19} icon={22} gap={10} />
              <div className="lang">
                <select aria-label="Язык">
                  <option>RU</option>
                  <option>LT</option>
                  <option>EN</option>
                </select>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1C2620"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </HeaderAside>
          </HeaderBar>
          <div className="hero-in">
            <h1>
              Санаторное лечение
              <br />
              и&nbsp;отдых в&nbsp;Литве
            </h1>
            <p className="hero-sub">Выберите санаторий, сравните программы и забронируйте на русском языке.</p>
            <SearchCard guide className="hero-search" inLabel={v.inLabel} outLabel={v.outLabel} onOpenCal={v.openCal} />
          </div>
        </section>
        {/* Resorts */}
        <section className="sec sec-resorts">
          <div className="sec-head">
            <h2>Выберите курорт</h2>
            <p>Лечение, природа или отдых у моря — найдите свой вариант.</p>
          </div>
          <div className="resorts">
            {RESORT_CARDS.map((r) => (
              <button
                key={r.id}
                type="button"
                className="card resort"
                data-resort={r.id}
                onClick={() => setResort(r.id)}
              >
                <img src={r.img} alt="" />
                <span className="resort-txt">
                  <span className="resort-name">{r.name}</span>
                  <span className="resort-sub">{r.sub}</span>
                </span>
                <svg
                  className="resort-go"
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
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>
        </section>
        {/* Not sure which one: the 3-question wizard (keeps the search above as it is) */}
        <div className="sec sec-choose">
          <ChooseCard onOpen={() => setWz(true)} />
        </div>
        {/* Popular */}
        <section className="sec sec-popular">
          <div className="sec-head sec-head-row">
            <h2>Популярные санатории</h2>
            <Link className="see-all" to="/results">
              Смотреть все →
            </Link>
          </div>
          <div className="pop-grid">
            {(v.hotels || []).map((h: any, _i0: number) => (
              <Fragment key={_i0}>
                <article className="card hcard">
                  <img src={h.img} alt={h.name} />{' '}
                  <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline' }}
                    >
                      <h3 style={{ fontSize: '18px' }}>{h.name}</h3>
                      <span style={{ color: '#8A6500', fontSize: '14px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                        {h.stars}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#3E4B44', marginTop: '-4px' }}>{h.sub}</div>
                    <div className="feat">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={h.f1d} />
                      </svg>
                      {h.f1}
                    </div>
                    <div className="feat">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={h.f2d} />
                      </svg>
                      {h.f2}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'end',
                        gap: '12px',
                        marginTop: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.15' }}>
                        <span style={{ fontSize: '20px', fontWeight: '800' }}>от {h.price}&nbsp;€</span>
                        <span style={{ fontSize: '14px', color: '#5E6862' }}>за человека в сутки</span>
                      </div>
                      <Link
                        className="btn btn-secondary"
                        to={'/hotel?h=' + h.id}
                        style={{ minHeight: '42px', fontSize: '15px', padding: '0 16px' }}
                      >
                        Посмотреть →
                      </Link>
                    </div>
                  </div>
                </article>
              </Fragment>
            ))}
          </div>
          <p className="pop-note">Цены ориентировочные — точную стоимость покажем после поиска.</p>
        </section>
        {/* Three steps */}
        <section
          style={{
            maxWidth: '1340px',
            margin: '0 auto',
            padding: '36px 24px 36px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h2 style={{ fontSize: '22px' }}>Как забронировать — три шага</h2>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div className="step">
              <span className="num">1</span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h4" />
                <circle cx="17" cy="17" r="3" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '15px' }}>Выберите санаторий</strong>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Сравните программы и стоимость.</span>
              </div>
            </div>
            <div className="step">
              <span className="num">2</span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="8" r="3.5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3M15 21v-3a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v3" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '15px' }}>Укажите данные гостей</strong>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>При необходимости добавьте трансфер.</span>
              </div>
            </div>
            <div className="step">
              <span className="num">3</span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 6h20v12H2zM2 10h20M6 15h4" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '15px' }}>Внесите депозит</strong>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                  35 € с человека, остаток — за 3 месяца до заезда.
                </span>
              </div>
            </div>
          </div>
        </section>
        <footer style={{ background: '#1C2620', color: '#D9E2DC', marginTop: 'auto' }}>
          <div
            style={{
              maxWidth: '1340px',
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'Lora,Georgia,serif',
                fontSize: '16px',
                fontWeight: '700',
                color: '#fff',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
              </svg>
              Санатории Литвы
            </div>
            <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
              <Link to="/done" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Контакты
              </Link>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Условия оплаты
              </Link>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Отмена бронирования
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontWeight: '700', color: '#fff' }}>
              +370&nbsp;600 00000<span style={{ fontWeight: '600', color: '#D9E2DC' }}>RU ▾</span>
            </div>
          </div>
        </footer>
      </div>{' '}
      {/* Custom date-range calendar (two months, price colours) */}{' '}
      {v.calOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(18,34,27,.55)',
              zIndex: '50',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '16px',
              overflow: 'auto',
            }}
          >
            <div
              className="cal-dlg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="calTitle"
              style={{
                background: '#fff',
                borderRadius: 'var(--r)',
                width: 'min(1120px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '18px 24px 16px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="calTitle" style={{ fontSize: '24px' }}>
                    Выберите даты поездки
                  </h2>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.calHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.closeCal}
                  style={{ minHeight: '44px', fontSize: '16px', padding: '0 16px' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  Закрыть
                </button>
              </div>
              <DateModeTabs flex={!!v.flexMode} onChange={v.setFlex} />
              {v.flexMode ? (
                <FlexDates onPick={v.flexPick} />
              ) : (
                <>
                  <div className="cal-body">
                    <MonthsCalendar
                      months={v.months || []}
                      onPrev={v.calPrev}
                      onNext={v.calNext}
                      planeTitle="Рейс из Израиля"
                    />
                    <CalLegend />
                  </div>
                </>
              )}
              <div
                style={{
                  display: v.flexMode ? 'none' : 'flex', // a flexible-dates option goes straight to results
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                {v.calNote ? <CalNotice text={v.calNote} onClose={v.calNoteClose} onAsk={v.calNoteAsk} /> : null}
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Заезд</span>
                    <strong style={{ fontSize: '18px' }}>{v.selIn}</strong>
                  </div>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Выезд</span>
                    <strong style={{ fontSize: '18px' }}>{v.selOut}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Итого</span>
                    <strong style={{ fontSize: '18px', color: '#1F5F4A' }}>{v.selNights}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={v.closeCal}>
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.applyCal}
                    disabled={!!v.applyOff}
                    style={{ minHeight: '50px', fontSize: '18px', padding: '0 32px' }}
                  >
                    Подтвердить даты
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      {/* "Какой санаторий подойдёт вам?" — the 3-question wizard opens right here */}
      <ChooseWizard
        open={wz}
        onClose={() => setWz(false)}
        onShow={({ hotelId }) => logic.props.navigate('/results?h=' + hotelId)}
      />
      {resort ? (
        <ResortModal
          id={resort}
          onClose={() => setResort('')}
          onSwitch={setResort}
          onChoose={(id) => {
            logic.props.booking.update({ dest: id, chosenPlace: 'resort:' + id });
            setResort('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : null}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
