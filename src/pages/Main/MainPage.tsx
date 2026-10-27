import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './MainPage.css';

const HELP_CTX: HelpContextInfo = { dest: 'druskininkai', in: '2026-11-09', out: '2026-11-18' };

class MainLogic extends PageLogic {
  renderVals() {
    return this._rv();
  }
  _rv() {
    const DOC = 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4';
    const POOL =
      'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6';
    const MEAL = 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8';
    const hotels = [
      {
        name: 'Эгле Комфорт',
        stars: '★★★★',
        sub: 'Друскининкай · 26 отзывов',
        img: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg',
        f1: 'Врач и лечебные программы',
        f1d: DOC,
        f2: 'Бассейны и сауны',
        f2d: POOL,
        price: 106,
      },
      {
        name: 'Гранд Спа Лиетува',
        stars: '★★★★',
        sub: 'Друскининкай · 20 отзывов',
        img: '/img/a77ef961b37e1edf9b38716a5c54a79f.jpg',
        f1: 'Врач и лечебные программы',
        f1d: DOC,
        f2: 'Бассейны и бани',
        f2d: POOL,
        price: 90,
      },
      {
        name: 'Градиали',
        stars: '★★★★',
        sub: 'Паланга · 17 отзывов',
        img: '/img/983aebb39738d3905bb5383746fb9356.jpg',
        f1: 'Врач и лечебные программы',
        f1d: DOC,
        f2: 'Бассейн и SPA',
        f2d: POOL,
        price: 106,
      },
      {
        name: 'Беларусь',
        stars: '★★★',
        sub: 'Друскининкай · 17 отзывов',
        img: '/img/405a6bd8cba041318eac2ff89e9e9806.jpg',
        f1: 'Врач и лечебные программы',
        f1d: DOC,
        f2: 'Питание включено',
        f2d: MEAL,
        price: 90,
      },
      {
        name: 'Эгле Комфорт Бирштонас',
        stars: '',
        sub: 'Бирштонас · 35 отзывов',
        img: '/img/226796cc08c3c360c4ac718f6a4c433f.jpg',
        f1: 'Врач и лечебные программы',
        f1d: DOC,
        f2: 'Бассейны и сауны',
        f2d: POOL,
        price: 119,
      },
      {
        name: 'Минерал SPA Драугисте',
        stars: '',
        sub: 'Друскининкай · 5 отзывов',
        img: '/img/a3e6585f5dd9cb9a1b6daa1d5c50ff22.jpg',
        f1: 'Питание включено',
        f1d: MEAL,
        f2: 'Бассейн и бани',
        f2d: POOL,
        price: 107,
      },
    ];
    // ---- Custom two-month range calendar with price colours ----
    const st = this.state || {};
    const MONTHS = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const MONTHS_N = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ];
    const DAY = 86400000;
    const toD = (s) => new Date(s + 'T00:00:00Z');
    const iso = (d) => d.toISOString().slice(0, 10);
    const addD = (d, n) => new Date(d.getTime() + n * DAY);
    const TODAY = toD('2026-10-27');
    const long = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    const short = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
    const nightsWord = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'ночь'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'ночи'
          : 'ночей';
    const inD = toD(st.in || '2026-11-09'),
      outD = toD(st.out || '2026-11-18');
    const sel = st.sel || { in: iso(inD), out: iso(outD) };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    // Average price per person per night across the resort — synthetic season curve [ЗАМЕНИТЬ НА РЕАЛЬНЫЕ ТАРИФЫ]
    const BASE = 100;
    const dayIdx = (d) => Math.round((d - TODAY) / DAY);
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
    const pickDay = (date) => () => {
      const k = iso(date);
      if (!sel.in || (sel.in && sel.out)) this.setState({ sel: { in: k, out: null } });
      else if (date > toD(sel.in)) this.setState({ sel: { in: sel.in, out: k } });
      else this.setState({ sel: { in: k, out: null } });
    };
    const monthCells = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const cells = [];
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
        const full =
          !past &&
          [
            '2026-11-20',
            '2026-11-21',
            '2026-11-22',
            '2026-12-24',
            '2026-12-25',
            '2026-12-26',
            '2026-12-27',
            '2026-12-31',
            '2027-01-01',
          ].includes(iso(date)); /* [ПРИМЕР] нет мест ни в одном объекте */
        const p = priceOf(date),
          r = p / BASE;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9';
        let color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut);
        const between = sIn && sOut && date > sIn && date < sOut;
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
          fly: [0, 2, 4].includes(date.getUTCDay()) && !(typeof past !== 'undefined' && past),
          sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + '\u00a0€',
          bg,
          border,
          color,
          subColor,
          off: past || full,
          cursor: past || full ? 'not-allowed' : 'pointer',
          aria: d + ' ' + MONTHS[m] + (past ? ', недоступно' : ', около ' + p + '\u00a0€ за человека в сутки'),
          pick: pickDay(date),
        });
      }
      return cells;
    };
    const m1 = (m0 + 1) % 12,
      y1 = m0 === 11 ? y0 + 1 : y0;
    const months = [
      { title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) },
      { title: MONTHS_N[m1] + ' ' + y1, cells: monthCells(y1, m1) },
    ];
    const nights = sIn && sOut ? Math.round((sOut - sIn) / DAY) : 0;
    const preset = (n) => () => {
      const i = sIn || inD;
      this.setState({ sel: { in: iso(i), out: iso(addD(i, n)) } });
    };
    const curNights = Math.round((outD - inD) / DAY);
    return {
      hotels,
      inLabel: long(inD),
      outLabel: long(outD),
      nightsLabel: curNights + ' ' + nightsWord(curNights),
      calOpen: !!st.calOpen,
      openCal: () =>
        this.setState({
          calOpen: true,
          sel: { in: iso(inD), out: iso(outD) },
          month: inD.getUTCMonth(),
          year: inD.getUTCFullYear(),
        }),
      closeCal: () => this.setState({ calOpen: false }),
      calPrev: () => {
        const m = m0 - 1;
        this.setState({ month: (m + 12) % 12, year: m < 0 ? y0 - 1 : y0 });
      },
      calNext: () => {
        const m = m0 + 1;
        this.setState({ month: m % 12, year: m > 11 ? y0 + 1 : y0 });
      },
      months,
      calHint: !sIn
        ? 'Нажмите день заезда'
        : !sOut
          ? 'Теперь нажмите день выезда'
          : 'Можно поменять: нажмите новый день заезда',
      selIn: sIn ? short(sIn) : '—',
      selOut: sOut ? short(sOut) : '—',
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
  usePageTitle('Главная — поиск санатория');
  const [v, logic] = usePageLogic(MainLogic);
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
          <header style={{ position: 'relative' }}>
            <div
              style={{
                maxWidth: '1180px',
                margin: '0 auto',
                padding: '0 24px',
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}
              >
                <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
                  <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                  <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
                </svg>
                <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '22px', fontWeight: '700' }}>
                  Санатории Литвы
                </span>
              </Link>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                <Link className="navlink" to="/results" style={{ color: '#fff' }}>
                  Курорты
                </Link>
                <Link className="navlink" to="/rules" style={{ color: '#fff' }}>
                  Как оплатить
                </Link>
                <Link className="navlink" to="/rules" style={{ color: '#fff' }}>
                  Условия
                </Link>
                <Link className="navlink" to="/done" style={{ color: '#fff' }}>
                  Контакты
                </Link>
              </nav>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <a
                  href="tel:+37060000000"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '18px',
                  }}
                >
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
              </div>
            </div>
          </header>
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
              <h1 style={{ color: '#fff', fontSize: '46px', lineHeight: '1.1', textWrap: 'pretty' }}>
                Санаторное лечение и&nbsp;отдых в&nbsp;Литве
              </h1>
              <p style={{ margin: '0', color: '#E6F0EA', fontSize: '19px', lineHeight: '1.4' }}>
                Выберите санаторий, сравните программы и забронируйте на русском языке.
              </p>
              <p style={{ margin: '0', color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                Друскининкай · Бирштонас · Паланга · Аникщяй
              </p>
            </div>
            <form
              className="card"
              action="results.html"
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
                    Курорт
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
                      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <select id="city" className="input">
                      <option>Друскининкай</option>
                      <option>Бирштонас</option>
                      <option>Паланга</option>
                      <option>Аникщяй</option>
                    </select>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ position: 'absolute', right: '12px', top: '16px', pointerEvents: 'none' }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
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
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                    <select id="guests" className="input">
                      <option>2 взрослых</option>
                      <option>1 взрослый</option>
                      <option>2 взрослых, 1 ребёнок</option>
                      <option>2 взрослых, 2 ребёнка</option>
                      <option>3 взрослых</option>
                      <option>4 взрослых</option>
                    </select>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ position: 'absolute', right: '12px', top: '16px', pointerEvents: 'none' }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
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
              <div style={{ fontSize: '14px', color: '#6B776F' }}>
                {v.nightsLabel} · После поиска покажем полную стоимость за всех гостей.
              </div>
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
              Аванс 1–10 %, остальное при заезде
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
            <h2 style={{ fontSize: '32px' }}>Выберите курорт</h2>
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
            <Link className="card resort" to="/results">
              <img src="/img/80cbf81cb33b38c12f41d140c9e34ba7.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '700' }}>
                    Друскининкай
                  </span>
                  <span style={{ color: '#1F5F4A', fontSize: '20px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Лечение и минеральные воды</span>
              </div>
            </Link>
            <Link className="card resort" to="/results">
              <img src="/img/ac9b1445a29a0df51e1bd45a8a203a39.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '700' }}>
                    Бирштонас
                  </span>
                  <span style={{ color: '#1F5F4A', fontSize: '20px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Спокойный отдых у Немана</span>
              </div>
            </Link>
            <Link className="card resort" to="/results">
              <img src="/img/c4c4cd4bcaad10e81718df6ded79f624.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '700' }}>Паланга</span>
                  <span style={{ color: '#1F5F4A', fontSize: '20px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Отдых у Балтийского моря</span>
              </div>
            </Link>
            <Link className="card resort" to="/results">
              <img src="/img/213618680529a455a08f4dc13b8abe7e.jpg" alt="" />
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '700' }}>Аникщяй</span>
                  <span style={{ color: '#1F5F4A', fontSize: '20px' }}>→</span>
                </div>
                <span style={{ fontSize: '14px', color: '#3E4B44' }}>Природа и тишина</span>
              </div>
            </Link>
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
              <h2 style={{ fontSize: '32px' }}>Популярные санатории</h2>
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
                      <h3 style={{ fontSize: '19px' }}>{h.name}</h3>
                      <span style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
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
                        <span style={{ fontSize: '22px', fontWeight: '800' }}>от {h.price}&nbsp;€</span>
                        <span style={{ fontSize: '13px', color: '#6B776F' }}>за человека в сутки</span>
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
                <div style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '700' }}>
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
          <h2 style={{ fontSize: '24px' }}>Как забронировать — три шага</h2>
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
                <span style={{ fontSize: '13px', color: '#3E4B44' }}>Сравните программы и стоимость.</span>
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
                <span style={{ fontSize: '13px', color: '#3E4B44' }}>При необходимости добавьте трансфер.</span>
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
                <strong style={{ fontSize: '15px' }}>Оплатите аванс</strong>
                <span style={{ fontSize: '13px', color: '#3E4B44' }}>Остаток — при заезде в санаторий.</span>
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
              padding: '40px 16px',
              overflow: 'auto',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="calTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                width: 'min(820px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                padding: '26px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="calTitle" style={{ fontSize: '32px' }}>
                    Выберите даты поездки
                  </h2>
                  <span style={{ fontSize: '17px', color: '#3E4B44' }}>{v.calHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.closeCal}
                  style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>Быстрый выбор:</span>
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
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
                  <details style={{ display: 'inline-block', fontSize: '14px', color: '#3E4B44' }}>
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
                        maxWidth: '420px',
                        background: '#F4F1EA',
                        borderRadius: '2px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        lineHeight: '1.45',
                        color: '#1C2620',
                      }}
                    >
                      Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с
                      осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит
                      прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                    </div>
                  </details>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <button type="button" className="navbtn" onClick={v.calPrev} aria-label="Предыдущие месяцы">
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
                  >
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {(v.months || []).map((m: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            fontFamily: 'Lora,Georgia,serif',
                            fontSize: '22px',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          {m.title}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                          <div className="wd">Пн</div>
                          <div className="wd">Вт</div>
                          <div className="wd">Ср</div>
                          <div className="wd">Чт</div>
                          <div className="wd">Пт</div>
                          <div className="wd">Сб</div>
                          <div className="wd">Вс</div>
                          {(m.cells || []).map((c: any, _i1: number) => (
                            <Fragment key={_i1}>
                              <button
                                type="button"
                                className="cell"
                                onClick={c.pick}
                                disabled={!!c.off}
                                aria-label={c.aria}
                                style={{ background: c.bg, borderColor: c.border, color: c.color, cursor: c.cursor }}
                              >
                                <span>{c.day}</span>
                                <small style={{ color: c.subColor }}>{c.sub}</small>
                                {c.fly ? (
                                  <>
                                    <span
                                      style={{ position: 'absolute', top: '4px', right: '5px', lineHeight: '0' }}
                                      title="Рейс из Израиля"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
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
                                    </span>
                                  </>
                                ) : null}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <button type="button" className="navbtn" onClick={v.calNext} aria-label="Следующие месяцы">
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
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Заезд</span>
                    <strong style={{ fontSize: '20px' }}>{v.selIn}</strong>
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
                    <strong style={{ fontSize: '20px' }}>{v.selOut}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Итого</span>
                    <strong style={{ fontSize: '20px', color: '#1F5F4A' }}>{v.selNights}</strong>
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
                    style={{ minHeight: '56px', fontSize: '18px', padding: '0 32px' }}
                  >
                    Подтвердить даты
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
