import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { HelpWidget } from '../../components/HelpWidget';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { InfoTitle } from '../../components/InfoTip';
import { useBooking } from '../../context/BookingContext';
import { useHelp } from '../../context/HelpContext';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../../data/contacts';
import {
  COUNTRIES,
  FIRST_DAY,
  FLIGHT_FACTS,
  LAST_DAY,
  canBuyOnline,
  compareOffers,
  hasFlight,
  legPrice,
  offerFor,
  type Country,
  type FlightLeg,
} from '../../data/tickets';
import { MONTHS, MONTHS_N, WEEKDAYS_SHORT, addD, daysBetween, iso, plural, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import { TicketOrder, type OrderStep } from './TicketOrder';
import './TicketsPage.css';

const PLANE = 'M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z';
const daysWord = (n: number) => plural(n, ['день', 'дня', 'дней']);
const peopleWord = (n: number) => n + ' ' + plural(n, ['человека', 'человек', 'человек']);
const dayLabel = (s: string) => {
  const d = toD(s);
  return WEEKDAYS_SHORT[d.getUTCDay()].toLowerCase() + ', ' + shortDate(d);
};
const dots = (s: string) => s.split('-').reverse().join('.');

/** calendar sign in the date fields */
const CalIcon = () => (
  <svg
    className="tk-cal-ic"
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
    <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />
  </svg>
);

function Plane({ size = 18, back = false }: { size?: number; back?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={back ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d={PLANE} />
    </svg>
  );
}

/** one direction of the found flight: times, airports, flight number, seats */
function LegRow({ label, leg }: { label: string; leg: FlightLeg }) {
  const a = COUNTRIES[leg.from],
    b = COUNTRIES[leg.to];
  return (
    <div className="tk-leg">
      <span className={'tk-leg-dir' + (leg.from === 'LT' ? ' back' : '')}>
        <span className="tk-leg-ico">
          <Plane back={leg.from === 'LT'} />
        </span>
        <span>
          <strong>{label}</strong>
          <span>{dayLabel(leg.date)}</span>
        </span>
      </span>
      <span className="tk-leg-way">
        <span className="tk-pt">
          <strong>{leg.dep}</strong>
          <span>
            {a.city} · {a.code}
          </span>
        </span>
        <span className="tk-line" aria-label={'в пути ' + leg.dur}>
          <i />
          <span>
            <Plane size={16} /> {leg.dur}
          </span>
          <i />
        </span>
        <span className="tk-pt tk-pt-end">
          <strong>{leg.arr}</strong>
          <span>
            {b.city} · {b.code}
          </span>
        </span>
      </span>
      <span className="tk-leg-meta">
        <strong>{leg.no}</strong>
        <span>
          {FLIGHT_FACTS.airline} · {FLIGHT_FACTS.plane}
        </span>
        <span className={'tk-seats' + (leg.seats <= 4 ? ' few' : '')}>
          {leg.seats <= 4 ? 'осталось ' : ''}
          {leg.seats} {plural(leg.seats, ['место', 'места', 'мест'])}
        </span>
      </span>
    </div>
  );
}

/**
 * «Прямые перелёты»: search the direct flights Tel Aviv ⇄ Vilnius — direction, round trip or one
 * way, dates on flight days only (a real calendar), passengers; the found flight with times,
 * seats, baggage and the price for everybody; order via WhatsApp or the «Свяжитесь со мной» form;
 * «Сравнить цены» lists every date with the same length of the trip. The search sits in the
 * address, so a found flight can be sent to someone.
 */
export default function TicketsPage() {
  usePageTitle('Прямые перелёты Тель-Авив ⇄ Вильнюс');
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const help = useHelp();
  const { update } = useBooking();

  const [from, setFrom] = useState<Country>(params.get('from') === 'LT' ? 'LT' : 'IL');
  const [rt, setRt] = useState(params.get('type') !== 'ow');
  const [dep, setDep] = useState<string>(params.get('dep') || '');
  const [ret, setRet] = useState<string>(params.get('ret') || '');
  const [n, setN] = useState(Math.min(5, Math.max(1, Number(params.get('n')) || 2)));
  const [cal, setCal] = useState<'' | 'dep' | 'ret'>('');
  const [month, setMonth] = useState<{ m: number; y: number } | null>(null);
  const [searched, setSearched] = useState(!!params.get('dep'));
  const [more, setMore] = useState(false);
  const [cmpOpen, setCmpOpen] = useState(false);
  const to: Country = from === 'IL' ? 'LT' : 'IL';
  const length = dep && ret ? daysBetween(toD(dep), toD(ret)) : 0;

  // the found flight follows the search that was run, not every change in the form
  const [q, setQ] = useState(() => ({ from, rt, dep, ret, n }));
  const offer = useMemo(() => (q.dep ? offerFor(q.dep, q.rt ? q.ret || null : null, q.from, q.n) : null), [q]);
  const qLength = q.dep && q.ret && q.rt ? daysBetween(toD(q.dep), toD(q.ret)) : 0;
  const compare = useMemo(() => (q.dep ? compareOffers(q.rt ? qLength : null, q.from, q.n) : []), [q, qLength]);
  const cheapest = compare.length ? Math.min(...compare.map((o) => o.total)) : 0;

  const search = (next = { from, rt, dep, ret, n }) => {
    if (!next.dep) return setCal('dep');
    if (next.rt && !next.ret) return setCal('ret');
    setQ(next);
    setSearched(true);
    setCmpOpen(false);
    const p: Record<string, string> = {
      from: next.from,
      dep: next.dep,
      n: String(next.n),
      type: next.rt ? 'rt' : 'ow',
    };
    if (next.rt && next.ret) p.ret = next.ret;
    setParams(p, { replace: true });
    window.setTimeout(
      () => document.getElementById('tkRes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      60,
    );
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setCal('');
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  // the calendar: only flight days can be chosen; the way back only after the way there
  const openCal = (which: 'dep' | 'ret') => {
    if (which === 'ret' && !dep) return setCal('dep');
    const base = which === 'ret' && ret ? toD(ret) : which === 'ret' ? addD(toD(dep), 14) : dep ? toD(dep) : FIRST_DAY;
    setMonth({ m: base.getUTCMonth(), y: base.getUTCFullYear() });
    setCal(which);
  };
  const m0 = month ? month.m : FIRST_DAY.getUTCMonth(),
    y0 = month ? month.y : FIRST_DAY.getUTCFullYear();
  const monthCells = (y: number, m: number): CalendarCell[] => {
    const first = new Date(Date.UTC(y, m, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: CalendarCell[] = [];
    for (let i = 0; i < lead; i++) cells.push({ day: '', off: true, bg: 'transparent', cursor: 'default' });
    const legFrom = cal === 'ret' ? to : from;
    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.UTC(y, m, d));
      const s = iso(date);
      const ok = hasFlight(date) && (cal !== 'ret' || (!!dep && date > toD(dep)));
      const isDep = s === dep,
        isRet = rt && s === ret;
      const between = rt && dep && ret && date > toD(dep) && date < toD(ret);
      cells.push({
        day: d,
        fly: ok,
        sub: isDep ? 'туда' : isRet ? 'обратно' : ok ? legPrice(date, legFrom) + ' €' : '',
        bg: isDep || isRet ? '#1F5F4A' : ok ? '#E9F4EC' : '#F4F2EE',
        border: between ? '#1F5F4A' : isDep || isRet ? '#1F5F4A' : 'transparent',
        color: isDep || isRet ? '#fff' : ok ? '#1C2620' : '#A3ABA6',
        subColor: isDep || isRet ? '#D9E2DC' : '#3E4B44',
        planeColor: isDep || isRet ? '#fff' : '#1F5F4A',
        off: !ok,
        cursor: ok ? 'pointer' : 'not-allowed',
        aria: d + ' ' + MONTHS[m] + (ok ? ', есть рейс, ' + legPrice(date, legFrom) + ' € с человека' : ', рейса нет'),
        pick: ok
          ? () => {
              if (cal === 'dep') {
                setDep(s);
                const keep = ret && toD(ret) > date && hasFlight(toD(ret));
                if (!keep) setRet('');
                if (rt && !keep) {
                  // straight on to the way back
                  const b = addD(date, 14);
                  setMonth({ m: b.getUTCMonth(), y: b.getUTCFullYear() });
                  setCal('ret');
                } else setCal('');
              } else {
                setRet(s);
                setCal('');
              }
            }
          : undefined,
      });
    }
    return cells;
  };
  const m1 = (m0 + 1) % 12,
    y1 = m0 === 11 ? y0 + 1 : y0;
  const months = cal
    ? [
        { title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) },
        { title: MONTHS_N[m1] + ' ' + y1, cells: monthCells(y1, m1) },
      ]
    : [];
  const canPrev =
    new Date(Date.UTC(y0, m0, 1)) > new Date(Date.UTC(FIRST_DAY.getUTCFullYear(), FIRST_DAY.getUTCMonth(), 1));
  const canNext =
    new Date(Date.UTC(y1, m1, 1)) < new Date(Date.UTC(LAST_DAY.getUTCFullYear(), LAST_DAY.getUTCMonth(), 1));

  const waText = offer
    ? 'Здравствуйте! Хочу заказать билеты: ' +
      COUNTRIES[offer.there.from].city +
      ' → ' +
      COUNTRIES[offer.there.to].city +
      ' ' +
      dots(offer.there.date) +
      ' (' +
      offer.there.no +
      ')' +
      (offer.back ? ', обратно ' + dots(offer.back.date) + ' (' + offer.back.no + ')' : '') +
      ', ' +
      peopleWord(q.n) +
      '.'
    : '';
  const withStay = !!offer && offer.there.from === 'IL' && !!offer.back;
  const pickStay = () => {
    if (!offer || !offer.back) return;
    update({
      checkin: offer.there.date,
      checkout: offer.back.date,
      chosenDates: true,
      flightPackage: true,
      flights: 'yes',
      adults: Math.min(q.n, 4),
    });
    navigate('/results', { state: { scrollTo: 'resList' } });
  };
  const rows = more ? compare : compare.slice(0, 12);

  // buying online: until 24 hours before the departure (later — by phone)
  const online = !!offer && canBuyOnline(offer.there);
  const stepP = params.get('step');
  const step: OrderStep | '' = stepP === 'pax' || stepP === 'pay' || stepP === 'done' ? stepP : '';
  const flow = !!offer && !!step && (online || step === 'done');
  const go = (s: OrderStep | '') => {
    const p = new URLSearchParams(params);
    if (s) p.set('step', s);
    else p.delete('step');
    setParams(p);
  };

  return (
    <div className="page pg-tickets">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <HeaderBar>
          <Brand />
          <MainNav gap={32} active="flights" />
          <PhoneLink />
        </HeaderBar>
        <section className={'tk-hero' + (flow ? ' tk-hero-flow' : '')}>
          <div className="tk-wrap">
            <h1>{flow ? 'Покупка билетов' : 'Прямые перелёты'}</h1>
            {flow ? null : (
              <>
                <p className="tk-lead">
                  Тель-Авив ⇄ Вильнюс без пересадок: {FLIGHT_FACTS.airline}, по вторникам, четвергам и воскресеньям,
                  багаж 20 кг включён.
                </p>
                {/* the search: everything the guest picks, nothing chosen for them except the direction */}
                <form
                  className="tk-search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    search();
                  }}
                >
                  <div className="tk-type" role="radiogroup" aria-label="Тип поездки">
                    {[
                      [true, 'Туда и обратно'],
                      [false, 'В одну сторону'],
                    ].map(([v, t]) => (
                      <button
                        key={String(v)}
                        type="button"
                        role="radio"
                        aria-checked={rt === v}
                        className={'tk-radio' + (rt === v ? ' on' : '')}
                        onClick={() => setRt(v as boolean)}
                      >
                        <span className="tk-radio-c" aria-hidden="true">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 5 5L20 7" />
                          </svg>
                        </span>
                        {t as string}
                        {v && rt && length ? <span className="tk-seg-n">{length + ' ' + daysWord(length)}</span> : null}
                      </button>
                    ))}
                  </div>
                  <div className="tk-fields">
                    <div className="tk-dir">
                      <label className="tk-f">
                        <span className="tk-f-l">Откуда</span>
                        <select value={from} onChange={(e) => setFrom(e.target.value as Country)}>
                          {(['IL', 'LT'] as Country[]).map((c) => (
                            <option key={c} value={c}>
                              {COUNTRIES[c].city} ({COUNTRIES[c].code})
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="tk-swap"
                        aria-label="Поменять направление"
                        onClick={() => {
                          setFrom(to);
                          setDep('');
                          setRet('');
                        }}
                      >
                        ⇄
                      </button>
                      <div className="tk-f tk-f-to">
                        <span className="tk-f-l">Куда</span>
                        <span className="tk-f-v">
                          {COUNTRIES[to].city} ({COUNTRIES[to].code})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={'tk-f tk-date' + (dep ? '' : ' empty')}
                      onClick={() => openCal('dep')}
                    >
                      <span className="tk-f-l">Туда</span>
                      <span className="tk-f-v">
                        <CalIcon />
                        {dep ? dayLabel(dep) : 'Выберите дату'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={'tk-f tk-date' + (rt && !ret ? ' empty' : '') + (rt ? '' : ' off')}
                      onClick={() => (rt ? openCal('ret') : setRt(true))}
                      aria-disabled={!rt}
                    >
                      <span className="tk-f-l">Обратно</span>
                      <span className="tk-f-v">
                        <CalIcon />
                        {!rt ? 'не нужно' : ret ? dayLabel(ret) : 'Выберите дату'}
                      </span>
                    </button>
                    <div className="tk-f tk-people">
                      <span className="tk-f-l">Пассажиры</span>
                      <span className="tk-step">
                        <button type="button" aria-label="Меньше" disabled={n <= 1} onClick={() => setN(n - 1)}>
                          −
                        </button>
                        <strong aria-live="polite">{n}</strong>
                        <button type="button" aria-label="Больше" disabled={n >= 5} onClick={() => setN(n + 1)}>
                          +
                        </button>
                      </span>
                    </div>
                    <button type="submit" className="btn btn-primary tk-go">
                      Найти рейсы
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>

        <main className="tk-wrap tk-main">
          {flow && offer ? (
            <TicketOrder
              offer={offer}
              n={q.n}
              step={step as OrderStep}
              go={go}
              onStay={withStay ? pickStay : undefined}
            />
          ) : !searched ? (
            <section className="tk-how">
              <h2>Как это работает</h2>
              <ol>
                <li>
                  <strong>Выберите даты</strong>
                  <span>В календаре отмечены дни с рейсом — вторник, четверг и воскресенье. Цена — с человека.</span>
                </li>
                <li>
                  <strong>Посмотрите рейс и цену</strong>
                  <span>Время вылета и прилёта, свободные места, что входит в билет — цена сразу на всех.</span>
                </li>
                <li>
                  <strong>Купите онлайн</strong>
                  <span>
                    Впишите имена как в паспорте и оплатите картой — билеты пришлём на почту и в WhatsApp. Меньше чем за
                    сутки до вылета — по телефону.
                  </span>
                </li>
              </ol>
            </section>
          ) : offer ? (
            <>
              <section id="tkRes" className="tk-res ios-in" aria-label="Найденный рейс">
                <header className="tk-res-h">
                  <span className="tk-ok">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                    Прямой рейс, без пересадок
                  </span>
                  <span className="tk-price">
                    <strong>{fmt(offer.total)}&nbsp;€</strong>
                    <span>
                      {offer.back ? 'туда и обратно' : 'в одну сторону'} на {peopleWord(q.n)} · {fmt(offer.pp)}&nbsp;€ с
                      человека
                    </span>
                  </span>
                </header>
                <LegRow label="Туда" leg={offer.there} />
                {offer.back ? <LegRow label="Обратно" leg={offer.back} /> : null}
                <div className="tk-incl">
                  <span>🧳 {FLIGHT_FACTS.hand}</span>
                  <span>🧳 {FLIGHT_FACTS.bag}</span>
                  <span>🍽 {FLIGHT_FACTS.meals}</span>
                  <InfoTitle
                    title={<span className="tk-incl-more">Что важно знать</span>}
                    info={
                      <ul className="tk-notes">
                        {FLIGHT_FACTS.notes.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    }
                  />
                </div>
                {online ? null : (
                  <p className="tk-late" role="status">
                    <span aria-hidden="true">!</span>
                    До вылета меньше суток — онлайн эти билеты уже не купить. Позвоните, оформим по телефону.
                  </p>
                )}
                <div className="tk-act">
                  {online ? (
                    <button type="button" className="btn btn-primary tk-buy" onClick={() => go('pax')}>
                      Купить онлайн · {fmt(offer.total)}&nbsp;€
                    </button>
                  ) : (
                    <a className="btn btn-primary tk-call" href={PHONE_TEL}>
                      Позвонить {PHONE_DISPLAY}
                    </a>
                  )}
                  <a
                    className="btn btn-secondary tk-wa"
                    href={WHATSAPP_URL + '?text=' + encodeURIComponent(waText)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Заказать в WhatsApp
                  </a>
                  <button type="button" className="linkbtn tk-help" onClick={() => help.open()}>
                    Свяжитесь со мной
                  </button>
                  {withStay ? (
                    <button type="button" className="tk-stay" onClick={pickStay}>
                      Подобрать санаторий на эти даты →
                    </button>
                  ) : null}
                </div>
              </section>
              {/* «Сравнить цены»: the same length of the trip on other flight days */}
              <section className={'tk-cmp' + (cmpOpen ? ' open' : '')}>
                <button type="button" className="tk-cmp-h" aria-expanded={cmpOpen} onClick={() => setCmpOpen(!cmpOpen)}>
                  <span>
                    <strong>Сравнить цены</strong>
                    <span>
                      {q.rt && qLength ? 'другие даты на ' + qLength + ' ' + daysWord(qLength) : 'другие даты вылета'} ·{' '}
                      на {peopleWord(q.n)}
                    </span>
                  </span>
                  <span className="tk-chev" aria-hidden="true">
                    ›
                  </span>
                </button>
                {cmpOpen ? (
                  <div className="tk-cmp-list ios-in" role="list">
                    <div className="tk-cmp-row tk-cmp-th" role="presentation">
                      <span>Туда</span>
                      <span>{q.rt ? 'Обратно' : ''}</span>
                      <span>Цена</span>
                    </div>
                    {rows.map((o) => {
                      const on = o.there.date === q.dep && (!o.back || o.back.date === q.ret);
                      return (
                        <button
                          type="button"
                          role="listitem"
                          key={o.there.date}
                          className={'tk-cmp-row' + (on ? ' on' : '')}
                          onClick={() => {
                            setDep(o.there.date);
                            setRet(o.back ? o.back.date : '');
                            search({
                              from: q.from,
                              rt: q.rt,
                              dep: o.there.date,
                              ret: o.back ? o.back.date : '',
                              n: q.n,
                            });
                          }}
                        >
                          <span>{dayLabel(o.there.date)}</span>
                          <span>{o.back ? dayLabel(o.back.date) : ''}</span>
                          <span className="tk-cmp-p">
                            {o.total === cheapest ? <span className="tk-best">дешевле всего</span> : null}
                            <strong>{fmt(o.total)}&nbsp;€</strong>
                          </span>
                        </button>
                      );
                    })}
                    {compare.length > rows.length ? (
                      <button type="button" className="tk-more" onClick={() => setMore(true)}>
                        Показать ещё {compare.length - rows.length}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </>
          ) : (
            <section id="tkRes" className="tk-res tk-none ios-in">
              <h2>В эти даты рейса нет</h2>
              <p>
                Рейсы летают по вторникам, четвергам и воскресеньям. Выберите другую дату — или напишите нам, поможем.
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => openCal('dep')}>
                Выбрать другую дату
              </button>
            </section>
          )}
        </main>
        <SiteFooter />
      </div>

      {/* the calendar: flight days only, two months side by side */}
      {cal ? (
        <div className="tk-overlay" onClick={(e) => e.target === e.currentTarget && setCal('')}>
          <div className="cal-dlg tk-cal" role="dialog" aria-modal="true" aria-labelledby="tkCalT">
            <div className="tk-cal-h">
              <span>
                <h2 id="tkCalT">{cal === 'dep' ? 'Когда летите туда?' : 'Когда обратно?'}</h2>
                <span>
                  {COUNTRIES[cal === 'dep' ? from : to].city} → {COUNTRIES[cal === 'dep' ? to : from].city} · отмечены
                  дни с рейсом, цена с человека
                </span>
              </span>
              <button type="button" className="btn btn-secondary" onClick={() => setCal('')}>
                ✕ Закрыть
              </button>
            </div>
            <MonthsCalendar
              months={months}
              onPrev={() => canPrev && setMonth({ m: (m0 + 11) % 12, y: m0 === 0 ? y0 - 1 : y0 })}
              onNext={() => canNext && setMonth({ m: m1, y: y1 })}
              planeTitle="Есть рейс"
            />
            <div className="tk-cal-f">
              <span className="lg">
                <i style={{ background: '#E9F4EC', border: '1px solid #C8DED3' }} />
                есть рейс
              </span>
              <span className="lg">
                <i style={{ background: '#F4F2EE' }} />
                рейса нет
              </span>
              {cal === 'ret' && dep ? <span className="tk-cal-dep">Туда: {dayLabel(dep)}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
      <HelpWidget ctx={{}} />
    </div>
  );
}
