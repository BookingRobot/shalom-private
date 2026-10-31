import { useEffect, useRef, useState } from 'react';
import { IconPath } from '../../components/icons';
import { Link } from 'react-router-dom';
import { ShareOffer } from '../../components/ShareOffer';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { ICON_PATHS } from '../../data/iconPaths';
import { api } from '../../api';
import { DEFAULT_BOOKING } from '../../data/booking';
import { guestsLabel, orderSummary, stayRange } from '../../lib/orderSummary';
import { partyLabel, placePrice, stayTotal } from '../../lib/pricing';
import { daysBetween, nightsWord, toD } from '../../lib/dates';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import { NextTip } from '../../components/NextTip';
import { useLiftFabs } from '../../components/StepNext';
import { TeamHeads } from '../../components/TeamHeads';
import { STAFF, teamOf, type StaffRole } from '../../data/team';
import './RoomsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
  bottom: '96px',
};

type Program = ReturnType<typeof api.getRoomPrograms>['programs'][number];
const TIER_ORDER = { base: 0, recommended: 1, premium: 2 } as const;
/** «Макси» out of «Программа «Макси»» */
const shortName = (name: string) => (name.match(/«(.+)»/) || [])[1] || name;

/**
 * Step 1. At most three programmes side by side, the classic way: the cheapest on the left, the one
 * Atlantis recommends in the middle, the richest on the right. «Узнать больше о программе» opens the
 * full description over the page (the page stays); more programmes of the sanatorium wait under
 * «Ещё программы». Below: the people who will meet the guest.
 */
class RoomsLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    this.state = { prog: props.booking.booking.programId, more: '', all: false };
  }
  syncBooking(st) {
    return { programId: st.prog };
  }
  renderVals() {
    const booking = this.props.booking.booking;
    const { programs, roomPrice } = api.getRoomPrograms(booking.hotelId, booking.roomId);
    const st = this.state;
    const NIGHTS = daysBetween(toD(booking.checkin), toD(booking.checkout));
    const G = { adults: booking.adults, children: booking.children };
    const eur = (n: number) => fmt(n) + ' €';
    const tierOf = (p: Program) => ('tier' in p ? p.tier : undefined);
    const isExtra = (p: Program) => 'extra' in p && !!p.extra;

    // the three on show: by tier when the data says it, else the cheapest three by price
    const shown = programs.filter((p) => !isExtra(p));
    const main = (
      shown.some((p) => tierOf(p))
        ? shown.filter((p) => tierOf(p)).sort((a, b) => TIER_ORDER[tierOf(a)!] - TIER_ORDER[tierOf(b)!])
        : [...shown].sort((a, b) => a.price - b.price)
    ).slice(0, 3);
    const rest = programs.filter((p) => !main.includes(p)).sort((a, b) => a.price - b.price);
    const base = main[0];
    const sel = programs.find((p) => p.id === st.prog) || base;
    const place = (p: Program) => placePrice(p.price + roomPrice.add, G);
    const party = partyLabel(G);

    const card = (p: Program) => {
      const on = p.id === sel.id;
      const rec = tierOf(p) === 'recommended';
      const d = place(p) - place(base);
      const plus = 'plus' in p ? p.plus : '';
      return {
        id: p.id,
        name: p.name,
        rec,
        on,
        tag: p === base ? 'Минимальная цена' : plus ? `${plus} за +${eur(d)}` : `Доплата +${eur(d)} с человека`,
        tagCls: p === base ? 'base' : rec ? 'rec' : '',
        place: eur(place(p)),
        note: G.adults === 1 ? 'за одного, за весь заезд' : 'на человека за весь заезд',
        total: `Итого ${party}: `,
        totalSum: eur(stayTotal(p.price + roomPrice.add, G)),
        facts: p.value.map(([k, big, label, sub]) => ({ d: ICON_PATHS[k], big, label, sub })),
        btnLabel: on ? 'Выбрана' : 'Выбрать ' + shortName(p.name),
        btnCls: on || rec ? 'btn-primary' : 'btn-secondary',
        pick: () => this.setState({ prog: p.id }),
        openMore: () => this.setState({ more: p.id }),
      };
    };

    const mp = programs.find((p) => p.id === st.more);
    const order = orderSummary({ ...booking, programId: sel.id });
    return {
      guestsLabel: guestsLabel(booking),
      baseShort: '«' + shortName(base.name) + '»',
      roomName: roomPrice.name,
      dateRange: stayRange(booking.checkin, booking.checkout) + ' ' + toD(booking.checkout).getUTCFullYear(),
      nightsLabel: NIGHTS + ' ' + nightsWord(NIGHTS),
      main: main.map(card),
      cols: main.length,
      extras: st.all ? rest.map(card) : [],
      restCount: rest.length,
      all: !!st.all,
      toggleAll: () => this.setState({ all: !st.all }),
      more: mp
        ? {
            ...card(mp),
            prog: mp.prog,
            detLines: mp.details
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => ({
                t: l.replace(/^— ?/, ''),
                head: /:$/.test(l),
                dash: /^—/.test(l),
                num: /^\d+\./.test(l),
              })),
          }
        : null,
      closeMore: () => this.setState({ more: '' }),
      pickMore: () => this.setState({ prog: st.more, more: '' }),
      sumLine: `Выбрана «${shortName(sel.name)}» · ${guestsLabel(booking)} · ${NIGHTS} ${nightsWord(NIGHTS)}`,
      sumTotal: eur(stayTotal(sel.price + roomPrice.add, G)),
      sumParty: party.replace(/^за /, 'на '),
      sumAdv: order.advanceLabel,
      sumFull: order.fullOnly,
      // going on to step 2: the guest answers the road questions there themselves — nothing
      // answered earlier (another visit, another sanatorium) stays marked for them
      toRoad: () =>
        this.props.booking.update({ flights: null, flightAsked: false, transfer: { ...DEFAULT_BOOKING.transfer } }),
      // the people of this sanatorium (0–3)
      team: teamOf(booking.hotelId || 'egle-comfort'),
    };
  }
}

const Check = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

type Card = ReturnType<RoomsLogic['renderVals']>['main'][number];

/** one programme: name and what it costs more, the price, the button, what is in it, «Узнать больше» */
function ProgramCard({ p }: { p: Card }) {
  return (
    <article className={'pg-card' + (p.on ? ' on' : '') + (p.rec ? ' rec' : '')} aria-label={p.name}>
      {p.rec ? <span className="pg-badge">Рекомендуем Atlantis</span> : null}
      <h2 className="pg-name">{p.name}</h2>
      <span className={'pg-tag ' + p.tagCls}>{p.tag}</span>
      <div className="pg-price">
        <span className="pg-place">{p.place}</span>
        <span className="pg-note">{p.note}</span>
        <span className="pg-total">
          {p.total}
          <strong>{p.totalSum}</strong>
        </span>
      </div>
      <button type="button" className={'btn ' + p.btnCls + ' pg-btn'} onClick={p.pick} aria-pressed={p.on}>
        {p.on ? <Check /> : null}
        {p.btnLabel}
      </button>
      <ul className="pg-facts">
        {p.facts.map((f, i) => (
          <li key={i}>
            <svg
              width="22"
              height="22"
              viewBox="-1 -1 26 26"
              fill="none"
              stroke="var(--green)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <IconPath d={f.d} />
            </svg>
            <span>
              <strong>{f.big === '∞' ? '' : f.big + ' '}</strong>
              {f.big === '∞' ? f.label.charAt(0).toUpperCase() + f.label.slice(1) : f.label}
              {f.sub ? <span className="pg-sub"> · {f.sub}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="pg-more" onClick={p.openMore}>
        Узнать больше о программе
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </article>
  );
}

/** the full programme over the page: what is included, the day plan, choose or close */
function ProgramModal({
  m,
  team,
  onClose,
  onPick,
}: {
  m: NonNullable<ReturnType<RoomsLogic['renderVals']>['more']>;
  team: StaffRole[];
  onClose: () => void;
  onPick: () => void;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    // focus goes into the window; Esc closes it; the page under it does not scroll
    const back = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
      back?.focus?.();
    };
  }, []);
  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm" role="dialog" aria-modal="true" aria-labelledby="pmTitle">
        <div className="pm-head">
          <div className="pm-head-t">
            {m.rec ? <span className="pg-badge pm-badge">Рекомендуем Atlantis</span> : null}
            <h2 id="pmTitle">{m.name}</h2>
            <span className={'pg-tag ' + m.tagCls}>{m.tag}</span>
          </div>
          <button type="button" className="pm-close" onClick={onClose} ref={closeBtn} aria-label="Закрыть">
            ✕<span> Закрыть</span>
          </button>
        </div>
        <div className="pm-body">
          <div className="pm-price">
            <span className="pg-place">{m.place}</span>
            <span className="pg-note">{m.note}</span>
            <span className="pg-total">
              {m.total}
              <strong>{m.totalSum}</strong>
            </span>
          </div>
          <h3>В программу входит</h3>
          <ul className="pm-inc">
            {m.prog.map((it, i) => (
              <li key={i}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <IconPath d={it.d} />
                </svg>
                {it.t}
              </li>
            ))}
          </ul>
          {team.length ? (
            <>
              <h3>Кто вас встретит</h3>
              <TeamHeads roles={team} variant="list" size={56} />
            </>
          ) : null}
          <h3>Подробно о программе</h3>
          <div className="pm-det">
            {m.detLines.map((l, i) =>
              l.head ? (
                <p key={i} className="pm-det-h">
                  {l.t}
                </p>
              ) : (
                <p key={i} className={l.dash ? 'pm-det-dash' : l.num ? 'pm-det-num' : ''}>
                  {l.t}
                </p>
              ),
            )}
          </div>
          <p className="pm-note">Процедуры назначает врач после консультации, с учётом вашего здоровья.</p>
        </div>
        <div className="pm-foot">
          <button
            type="button"
            className={'btn ' + (m.on ? 'btn-secondary' : 'btn-primary')}
            onClick={m.on ? onClose : onPick}
          >
            {m.on ? (
              <>
                <Check /> Эта программа выбрана
              </>
            ) : (
              'Выбрать «' + shortName(m.name) + '»'
            )}
          </button>
          <button type="button" className="btn btn-secondary pm-close-b" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  usePageTitle('Шаг 1 из 4 — номер и программа');
  const [v, logic] = usePageLogic(RoomsLogic);
  // the summary bar stays at the bottom: the floating buttons step up above it
  const bar = useRef<HTMLDivElement>(null);
  useLiftFabs(bar, true);
  // room and programme are chosen: the next step is «Далее»
  const [tipX, setTipX] = useState(false);
  const toShare = () => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return (
    <div className="page pg-rooms">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span className="hd-note">Нужна помощь с заказом?</span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps current={1} />
        <div className="rm-wrap">
          <div className="rm-crumbs">
            <Link to="/">Главная</Link> › <Link to="/results">Друскининкай</Link> ›{' '}
            <Link to="/hotel">Эгле Комфорт</Link> › Номер и программа
          </div>
          <div className="rm-title">
            <h1>Выберите программу отдыха</h1>
            <p>{v.baseShort} уже включена в цену. Можно оставить её или выбрать больше процедур.</p>
          </div>
          {/* the chosen room */}
          <section className="card rm-room">
            <img src="/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg" alt="Двухместный номер" />
            <div className="rm-room-t">
              <span className="rm-room-k">Ваш номер</span>
              <span className="rm-room-n">
                <strong>{v.roomName}</strong> · Эгле Комфорт
              </span>
              <span className="rm-room-d">
                {v.dateRange} · {v.nightsLabel} · {v.guestsLabel}
              </span>
            </div>
            <Link className="btn btn-secondary rm-room-b" to="/hotel">
              Изменить номер
            </Link>
          </section>
          {/* the programmes: cheapest · recommended · premium */}
          <div className={'pg-grid cols-' + v.cols}>
            {v.main.map((p) => (
              <ProgramCard key={p.id} p={p} />
            ))}
          </div>
          {v.restCount ? (
            <>
              {v.all ? (
                <div className="pg-grid pg-grid-more cols-3">
                  {v.extras.map((p) => (
                    <ProgramCard key={p.id} p={p} />
                  ))}
                </div>
              ) : null}
              <button type="button" className="pg-all" onClick={v.toggleAll} aria-expanded={v.all}>
                {v.all ? (
                  'Свернуть другие программы'
                ) : (
                  <>
                    Ещё программы<span className="pg-all-x"> этого санатория</span> ({v.restCount})
                  </>
                )}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ transform: v.all ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </>
          ) : null}
          <p className="rm-info">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Процедуры назначает врач после консультации. Улучшить программу можно и на месте — по наличию.
          </p>
          {/* the people who meet the guest (this sanatorium's team) */}
          {v.team.length ? (
            <section className="rm-people" aria-labelledby="rmPeople">
              <div className="rm-people-t">
                <h2 id="rmPeople">В санатории вас встретят люди</h2>
                <p>Консультация врача — в каждой программе. Помощь с организацией — на русском.</p>
              </div>
              <ul>
                {v.team.map((r) => (
                  <li key={r}>
                    <img src={STAFF[r].img} alt="" width="72" height="72" />
                    <span>
                      <strong>{STAFF[r].role}</strong>
                      <span>{STAFF[r].d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <span className="rm-people-note">Фото для примера</span>
            </section>
          ) : null}
          {/* talk it over with the family: send the offer or get told about a price change */}
          <section id="share" className="card rm-share">
            <h2>Хотите посоветоваться с близкими?</h2>
            <ShareOffer />
          </section>
          {/* a quiet way back at the end of the step (not in the bar: the bar leads forward) */}
          <Link className="rm-back" to="/hotel">
            ← Назад: выбор номера
          </Link>
        </div>
        {/* the summary bar */}
        <div ref={bar} className="rooms-bar">
          <div className="rooms-bar-in">
            <div className="rooms-bar-t">
              <span className="rooms-bar-line">{v.sumLine}</span>
              <span className="rooms-bar-sum">
                <strong>{v.sumTotal}</strong>
                <span>{v.sumParty}</span>
                <span className="rooms-bar-dep">
                  {v.sumFull ? '· оплата сразу всей суммы' : <>· депозит {v.sumAdv} фиксирует цену</>}
                </span>
              </span>
            </div>
            <div className="rooms-bar-btns">
              <button type="button" className="rooms-bar-share" onClick={toShare}>
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
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                <span>Поделиться с близкими</span>
              </button>
              <span className="step-next-at">
                {tipX ? null : (
                  <NextTip float arrow="right" onClose={() => setTipX(true)}>
                    Программа выбрана. Следующий шаг: <strong>«Далее: дорога»</strong>
                  </NextTip>
                )}
                <Link
                  className={'btn btn-primary rooms-bar-next' + (tipX ? '' : ' next-pulse')}
                  to="/transfer"
                  onClick={v.toRoad}
                >
                  Далее: дорога →
                </Link>
              </span>
            </div>
          </div>
        </div>
        <SiteFooter padding="24px 24px" pinned={false} />
      </div>
      {v.more ? <ProgramModal m={v.more} team={v.team} onClose={v.closeMore} onPick={v.pickMore} /> : null}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
