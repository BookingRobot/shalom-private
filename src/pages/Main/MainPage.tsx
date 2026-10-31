import { Fragment, useState, type ChangeEvent } from 'react';
import { IconPath } from '../../components/icons';
import { Link } from 'react-router-dom';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import { ChooseWizard } from '../../components/ChooseWizard';
import { ResortModal } from '../../components/ResortModal';
import { SearchCard } from '../../components/SearchCard';
import { ChooseCard } from '../../components/ChooseCard';
import { HeaderBar, Brand, MainNav, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CalLegend } from '../../components/calendar/CalLegend';
import { MonthsCalendar, type CalendarCell, type CalendarMonth } from '../../components/calendar/MonthsCalendar';
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
import { SiteFooter } from '../../components/layout/SiteFooter';
import { usePageTitle } from '../../lib/usePageTitle';
import { sanatoriumPath } from '../../lib/seo';
import { CalendarDialog, RangeSummary } from '../../components/calendar/CalendarDialog';
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

/** what the home page remembers: the dates and the state of the calendar window */
interface MainState {
  in: string;
  out: string;
  /** the dates being picked in the calendar (null while not yet tapped) */
  sel?: { in: string | null; out: string | null };
  calOpen?: boolean;
  flex?: boolean;
  month?: number;
  year?: number;
  /** a note over the calendar ("нет мест" …) */
  note?: string | null;
}

/** everything the home page markup needs */
interface MainVals {
  flexMode: boolean;
  setFlex: (flex: boolean) => void;
  flexPick: (a: string, b: string) => void;
  hotels: ReturnType<typeof api.getPopularSanatoriums>;
  dest: string;
  destOptions: typeof RESORTS;
  setDest: (e: ChangeEvent<HTMLSelectElement>) => void;
  inLabel: string;
  outLabel: string;
  calOpen: boolean;
  calNote: string;
  calNoteClose: () => void;
  calNoteAsk: () => void;
  openCal: () => void;
  closeCal: () => void;
  calPrev: () => void;
  calNext: () => void;
  months: CalendarMonth[];
  calHint: string;
  selIn: string;
  selOut: string;
  selNights: string;
  applyOff: boolean;
  applyCal: () => void;
}

class MainLogic extends PageLogic<MainState> {
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    this.state = { in: b.checkin, out: b.checkout };
  }
  syncBooking(st: MainState) {
    return st.in && st.out ? { checkin: st.in, checkout: st.out } : null;
  }
  renderVals(): MainVals {
    const POPULAR_SANATORIUMS = api.getPopularSanatoriums();

    // ---- Custom two-month range calendar with price colours ----
    const st = this.state;
    const inD = toD(st.in || '2026-11-09'),
      outD = toD(st.out || '2026-11-18');
    const sel = st.sel || { in: iso(inD), out: iso(outD) };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    // Average price per person per night across the resort — synthetic season curve [ЗАМЕНИТЬ НА РЕАЛЬНЫЕ ТАРИФЫ]
    const BASE = 100;
    const dayIdx = (d: Date) => daysBetween(TODAY, d);
    const priceOf = (d: Date) => {
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
    const pickDay = (date: Date) => () => {
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
    const monthCells = (y: number, m: number) => {
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
          color: 'var(--ink)',
          subColor: 'var(--ink-2)',
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
        let bg = r < 0.97 ? 'var(--green-soft)' : r <= 1.05 ? 'var(--warn-bg)' : 'var(--danger-bg)';
        let color = 'var(--ink)',
          subColor = 'var(--ink-2)',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut);
        const between = sIn && sOut && date > sIn && date < sOut;
        // the first "нет мест" day after check-in still works as the check-out day
        const canOut = full && !!sIn && !sOut && date > sIn && !blockedNights(sIn, date, blocked).length;
        if (past) {
          bg = 'var(--line)';
          color = 'var(--muted-2)';
          subColor = 'var(--muted-2)';
        }
        if (full) {
          bg = 'repeating-linear-gradient(135deg,var(--sand) 0 6px,var(--line-strong) 6px 12px)';
          color = 'var(--muted-2)';
          subColor = 'var(--warn-ink)';
        }
        if (between) border = 'var(--green)';
        if (isIn || isOut) {
          bg = 'var(--green)';
          color = 'var(--paper)';
          subColor = 'var(--green-line)';
          border = 'var(--green)';
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
      setFlex: (flex: boolean) => this.setState({ flex }),
      // a recommended option is the choice: set the dates and show sanatoriums right away
      // (with the resort not chosen yet the guest stays here: the bubble points at the resort)
      flexPick: (a: string, b: string) => {
        this.setState({ in: a, out: b, flex: false, calOpen: false });
        this.props.booking.update({ checkin: a, checkout: b, chosenDates: true });
        const place = booking.chosenPlace;
        if (place) this.props.navigate(place.startsWith('san:') ? '/results?h=' + place.slice(4) : '/results');
      },
      hotels: POPULAR_SANATORIUMS,
      dest: booking.dest,
      destOptions: RESORTS,
      setDest: (e: ChangeEvent<HTMLSelectElement>) => update({ dest: e.target.value }),
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
        {/* Header on a white bar: the agency logo and the menu stay easy to read */}
        <HeaderBar minHeight={84} maxWidth={1340}>
          <div className="hero-left">
            <Brand logo={36} />
            <MainNav gap={26} size={17} />
          </div>
          <HeaderAside gap={20} wrap={false}>
            <PhoneLink size={18} icon={20} gap={8} />
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
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </HeaderAside>
        </HeaderBar>
        {/* Hero: lakes and forests of Lithuania, the heading, and the search card lying over the photo's lower edge */}
        <section className="hero">
          <img className="hero-bg" src="/img/3ac36e1a1cd36ed63b52266ae332f936.jpg" alt="" />
          <div className="hero-shade" />
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
            {v.hotels.map((h, _i0) => (
              <Fragment key={_i0}>
                <article className="card hcard">
                  <img src={h.img} alt={h.name} />{' '}
                  <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline' }}
                    >
                      <h3 style={{ fontSize: '18px' }}>{h.name}</h3>
                      <span
                        style={{
                          color: 'var(--warn-ink)',
                          fontSize: '16px',
                          letterSpacing: '1px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.stars}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', color: 'var(--ink-2)', marginTop: '-4px' }}>{h.sub}</div>
                    <div className="feat">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--green)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <IconPath d={h.f1d} />
                      </svg>
                      {h.f1}
                    </div>
                    <div className="feat">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--green)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <IconPath d={h.f2d} />
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
                        <span style={{ fontSize: '16px', color: 'var(--muted)' }}>за человека в сутки</span>
                      </div>
                      <Link
                        className="btn btn-secondary"
                        to={sanatoriumPath(h.id)}
                        style={{ minHeight: '42px', fontSize: '16px', padding: '0 16px' }}
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
                stroke="var(--green)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h4" />
                <circle cx="17" cy="17" r="3" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '16px' }}>Выберите санаторий</strong>
                <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>Сравните программы и стоимость.</span>
              </div>
            </div>
            <div className="step">
              <span className="num">2</span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green)"
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
                <strong style={{ fontSize: '16px' }}>Укажите данные гостей</strong>
                <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>При необходимости добавьте трансфер.</span>
              </div>
            </div>
            <div className="step">
              <span className="num">3</span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 6h20v12H2zM2 10h20M6 15h4" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '16px' }}>Внесите депозит</strong>
                <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                  35 € с человека, остаток — за 3 месяца до заезда.
                </span>
              </div>
            </div>
          </div>
        </section>
        <SiteFooter maxWidth={1340} />
      </div>{' '}
      {/* Custom date-range calendar (two months, price colours) */}{' '}
      {v.calOpen ? (
        <CalendarDialog
          canvas="main-calendar"
          title="Выберите даты поездки"
          hint={v.calHint}
          tabs={<DateModeTabs flex={!!v.flexMode} onChange={v.setFlex} />}
          onClose={v.closeCal}
          // a flexible-dates option goes straight to results: no foot then
          selection={
            v.flexMode ? null : (
              <>
                {v.calNote ? <CalNotice text={v.calNote} onClose={v.calNoteClose} onAsk={v.calNoteAsk} /> : null}
                <RangeSummary from={v.selIn} to={v.selOut} total={v.selNights} />
              </>
            )
          }
          actions={
            v.flexMode ? null : (
              <>
                <button type="button" className="btn btn-secondary" onClick={v.closeCal}>
                  Отмена
                </button>
                <button type="button" className="btn btn-primary" onClick={v.applyCal} disabled={!!v.applyOff}>
                  Подтвердить даты
                </button>
              </>
            )
          }
        >
          {v.flexMode ? (
            <FlexDates onPick={v.flexPick} />
          ) : (
            <div className="cal-body">
              <MonthsCalendar
                months={v.months || []}
                onPrev={v.calPrev}
                onNext={v.calNext}
                planeTitle="Рейс из Израиля"
              />
              <CalLegend />
            </div>
          )}
        </CalendarDialog>
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
