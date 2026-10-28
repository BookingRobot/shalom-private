import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { GuestsPicker } from '../../components/GuestsPicker';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import { FlightToggle } from '../../components/FlightToggle';
import { ChooseWizard } from '../../components/ChooseWizard';
import { ResortModal } from '../../components/ResortModal';
import { PlaceChips, PlaceSearch } from '../../components/PlaceSearch';
import { HeaderBar, Brand, MainNav, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { MONTHS, MONTHS_N, addD, daysBetween, iso, longDate, nightsWord, shortDate, toD } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { isSoldOutEverywhere } from '../../data/availability';
import { blockedNights, blockedNote } from '../../lib/stayCheck';
import { CalNotice } from '../../components/calendar/CalNotice';
import { isFlightDay } from '../../data/flights';
import { api } from '../../api';
import { RESORTS } from '../../data/search';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './MainPage.css';

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
        if (bad.length) return this.setState({ note: blockedNote(bad) });
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
    const months = [{ title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) }];
    const nights = sIn && sOut ? daysBetween(sIn, sOut) : 0;
    const preset = (n) => () => {
      const i = sIn || inD;
      const bad = blockedNights(i, addD(i, n), blocked);
      if (bad.length) return this.setState({ note: blockedNote(bad) });
      this.setState({ sel: { in: iso(i), out: iso(addD(i, n)) }, note: null });
    };
    const curNights = daysBetween(inD, outD);
    const { booking, update } = this.props.booking;
    return {
      flexMode: !!st.flex,
      setFlex: (flex) => this.setState({ flex }),
      // a recommended option is the choice: set the dates and show sanatoriums right away
      flexPick: (a, b) => {
        this.setState({ in: a, out: b, flex: false, calOpen: false });
        this.props.booking.update({ checkin: a, checkout: b });
        this.props.navigate('/results');
      },
      hotels: POPULAR_SANATORIUMS,
      dest: booking.dest,
      destOptions: RESORTS,
      setDest: (e) => update({ dest: e.target.value }),
      inLabel: longDate(inD),
      outLabel: longDate(outD),
      nightsLabel: curNights + ' ' + nightsWord(curNights),
      calOpen: !!st.calOpen,
      calNote: st.note || '',
      calNoteClose: () => this.setState({ note: null }),
      calNoteAsk: () => this.props.help.open(),
      openCal: () =>
        this.setState({
          note: null,
          calOpen: true,
          sel: { in: iso(inD), out: iso(outD) },
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
        if (sIn && sOut) this.setState({ in: iso(sIn), out: iso(sOut), calOpen: false });
      },
      p7: preset(7),
      p10: preset(10),
      p14: preset(14),
      p21: preset(21),
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
        {/* Hero with header on top */}
        <section
          style={{
            position: 'relative',
            minHeight: '420px',
            background: '#1E3A2F',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src="/img/94582b10c29a7431c8ced47b9345bb6d.jpg"
            alt=""
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(90deg,rgba(18,34,27,.72) 0%,rgba(18,34,27,.35) 55%,rgba(18,34,27,.15) 100%)',
            }}
          />
          <HeaderBar tone="dark" minHeight={64}>
            <Brand tone="dark" gap={10} />
            <MainNav tone="dark" gap={28} size={16} />
            <HeaderAside gap={16} wrap={false}>
              <PhoneLink tone="dark" gap={8} />
              <div style={{ position: 'relative' }}>
                <select
                  className="input"
                  aria-label="Язык"
                  style={{ padding: '0 30px 0 12px', minHeight: '40px', width: 'auto', fontSize: '14px' }}
                >
                  <option>RU</option>
                  <option>LT</option>
                  <option>EN</option>
                </select>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                  style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </HeaderAside>
          </HeaderBar>
          <div
            style={{
              position: 'relative',
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '16px 24px 32px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
              <h1 style={{ color: '#fff', fontSize: '40px', lineHeight: '1.1', textWrap: 'pretty' }}>
                Санаторное лечение и&nbsp;отдых в&nbsp;Литве
              </h1>
              <p style={{ margin: '0', color: '#E6F0EA', fontSize: '18px', lineHeight: '1.4' }}>
                Выберите санаторий, сравните программы и забронируйте на русском языке.
              </p>
              <p style={{ margin: '0', color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                Друскининкай · Бирштонас · Паланга · Аникщяй
              </p>
            </div>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                logic.props.navigate('/results');
              }}
              style={{
                padding: '16px 18px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,.18)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="city">
                    Курорт или санаторий
                  </label>
                  <PlaceSearch />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="datein">
                    Заезд
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                    </svg>
                    <button type="button" id="datein" className="input datebtn" onClick={v.openCal}>
                      {v.inLabel}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="dateout">
                    Выезд
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                    </svg>
                    <button type="button" id="dateout" className="input datebtn" onClick={v.openCal}>
                      {v.outLabel}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="guests">
                    Гости
                  </label>
                  <GuestsPicker inputClass="input" />
                </div>
                <Link className="btn btn-primary" to="/results" style={{ minHeight: '50px' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Найти санаторий
                </Link>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px 16px',
                  flexWrap: 'wrap',
                }}
              >
                <FlightToggle />
                <span style={{ fontSize: '14px', color: '#5E6862' }}>
                  {v.nightsLabel} · Покажем цену на человека и итог за всех гостей.
                </span>
              </div>
              <PlaceChips />
              <button type="button" className="wz-link" onClick={() => setWz(true)}>
                Не знаете, какой санаторий выбрать? Ответьте на 3 вопроса — подскажем →
              </button>
            </form>
          </div>
        </section>
        {/* Three facts */}
        <section style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '4px 24px', display: 'flex', flexWrap: 'wrap' }}>
            <div className="fact">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
              </svg>
              Помощь на русском
            </div>
            <div className="fact">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01" />
              </svg>
              Трансфер до санатория
            </div>
            <div className="fact">
              <svg
                width="30"
                height="30"
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
              Депозит 35 € — и цена зафиксирована
            </div>
          </div>
        </section>
        {/* Resorts */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '36px 24px 10px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '28px' }}>Выберите курорт</h2>
            <p style={{ margin: '0', color: '#3E4B44', fontSize: '16px' }}>
              Лечение, природа или отдых у моря — найдите свой вариант.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))',
              gap: '14px',
            }}
          >
            <button
              type="button"
              className="card resort"
              data-resort="druskininkai"
              onClick={() => setResort('druskininkai')}
            >
              <img src="/img/80cbf81cb33b38c12f41d140c9e34ba7.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '700' }}>
                    Друскининкай
                  </span>
                  <span style={{ color: '#1F5F4A', fontSize: '18px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Лечение и минеральные воды</span>
              </div>
            </button>
            <button
              type="button"
              className="card resort"
              data-resort="birstonas"
              onClick={() => setResort('birstonas')}
            >
              <img src="/img/ac9b1445a29a0df51e1bd45a8a203a39.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '700' }}>
                    Бирштонас
                  </span>
                  <span style={{ color: '#1F5F4A', fontSize: '18px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Спокойный отдых у Немана</span>
              </div>
            </button>
            <button type="button" className="card resort" data-resort="palanga" onClick={() => setResort('palanga')}>
              <img src="/img/c4c4cd4bcaad10e81718df6ded79f624.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '700' }}>Паланга</span>
                  <span style={{ color: '#1F5F4A', fontSize: '18px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Отдых у Балтийского моря</span>
              </div>
            </button>
            <button
              type="button"
              className="card resort"
              data-resort="anyksciai"
              onClick={() => setResort('anyksciai')}
            >
              <img src="/img/213618680529a455a08f4dc13b8abe7e.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '700' }}>Аникщяй</span>
                  <span style={{ color: '#1F5F4A', fontSize: '18px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Природа и тишина</span>
              </div>
            </button>
          </div>
        </section>
        {/* Popular */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '30px 24px 10px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{ fontSize: '28px' }}>Популярные санатории</h2>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '16px' }}>
                Ориентировочные цены. Точную стоимость покажем после поиска.
              </p>
            </div>
            <Link to="/results" style={{ fontWeight: '700', fontSize: '16px' }}>
              Все санатории →
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))',
              gap: '16px',
            }}
          >
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
                        to="/hotel"
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
        </section>
        {/* Help band */}
        <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 24px', width: '100%' }}>
          <div
            style={{
              background: '#EEF5F1',
              border: '1px solid #C8DED3',
              borderRadius: '2px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '700' }}>
                  Поможем выбрать санаторий
                </div>
                <div style={{ fontSize: '15px', color: '#3E4B44' }}>
                  Объясним программы, условия проживания и трансфера.
                </div>
              </div>
            </div>
            <a className="btn btn-secondary" href="tel:+37060000000" style={{ minHeight: '48px' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
        </section>
        {/* Three steps */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '28px 24px 36px',
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
              maxWidth: '1180px',
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
                borderRadius: '2px',
                width: 'min(1000px,100%)',
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
                    <aside className="cal-side">
                      <span className="cal-side-h">Быстрый выбор</span>
                      <div className="cal-pgrid">
                        <button type="button" className="preset" onClick={v.p7}>
                          7 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.p10}>
                          10 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.p14}>
                          14 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.p21}>
                          21 ночь
                        </button>
                      </div>
                      <div className="cal-legend">
                        <span className="lg">
                          <i style={{ background: '#E9F4EC', border: '1px solid #C8DED3' }} />
                          дешевле
                        </span>
                        <span className="lg">
                          <i style={{ background: '#FFF6E3', border: '1px solid #F0DDB8' }} />
                          обычная цена
                        </span>
                        <span className="lg">
                          <i style={{ background: '#FCEDE9', border: '1px solid #F0CFC6' }} />
                          дороже
                        </span>
                        <span className="lg">
                          <i style={{ background: '#E8E6E1' }} />
                          прошедшие дни
                        </span>
                        <span className="lg">
                          <i
                            style={{
                              background: 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)',
                              border: '1px solid #CFC9BB',
                            }}
                          />
                          нет свободных мест
                        </span>
                        <details className="cal-fly">
                          <summary
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              listStyle: 'none',
                            }}
                          >
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
                              <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                            </svg>
                            <span>
                              <strong style={{ color: '#1C2620' }}>Рейсы из Израиля</strong> — вт, чт, вс
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '1.5px solid #1F5F4A',
                                color: '#1F5F4A',
                                fontSize: '12px',
                                fontWeight: '800',
                              }}
                            >
                              i
                            </span>
                          </summary>
                          <div
                            style={{
                              marginTop: '8px',

                              background: '#F4F1EA',
                              borderRadius: '2px',
                              padding: '10px 12px',
                              fontSize: '14px',
                              lineHeight: '1.45',
                              color: '#1C2620',
                            }}
                          >
                            Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong>{' '}
                            (с осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер
                            встретит прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                          </div>
                        </details>
                      </div>
                    </aside>
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
      {/* "Не знаете, какой санаторий выбрать?" — the 3-question wizard opens right here */}
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
            logic.props.booking.update({ dest: id });
            setResort('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : null}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
