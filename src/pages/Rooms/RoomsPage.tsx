import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ShareOffer } from '../../components/ShareOffer';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter, footerInfo } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { ICON_PATHS } from '../../data/iconPaths';
import { api } from '../../api';
import { guestsLabel, orderSummary, stayRange } from '../../lib/orderSummary';
import { partyLabel, placeLabel, placePrice, stayTotal } from '../../lib/pricing';
import { daysBetween, nightsWord, toD } from '../../lib/dates';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './RoomsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
  bottom: '96px',
};

class RoomsLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    this.state = { prog: props.booking.booking.programId, open: {} };
  }
  syncBooking(st) {
    return { programId: st.prog };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const { hotelId, roomId } = this.props.booking.booking;
    const { programs: ROOM_PROGRAMS, roomPrice: SELECTED_ROOM_PRICE } = api.getRoomPrograms(hotelId, roomId);

    const st = this.state;
    const booking = this.props.booking.booking;
    const NIGHTS = daysBetween(toD(booking.checkin), toD(booking.checkout)),
      G = { adults: booking.adults, children: booking.children };
    const eur = (n) => fmt(n) + ' €';
    const open = st.open || {};
    const sel = ROOM_PROGRAMS.find((p) => p.id === st.prog) || ROOM_PROGRAMS[0];
    const total = stayTotal(sel.price + SELECTED_ROOM_PRICE.add, G);
    const order = orderSummary({ ...booking, programId: sel.id });
    return {
      guestsLabel: guestsLabel(booking),
      includedName: ROOM_PROGRAMS[0].name,
      dateRange: stayRange(booking.checkin, booking.checkout) + ' ' + toD(booking.checkout).getUTCFullYear(),
      nightsLabel: NIGHTS + ' ' + nightsWord(NIGHTS),
      progs: ROOM_PROGRAMS.map((p, i) => {
        const on = p.id === sel.id,
          t = stayTotal(p.price + SELECTED_ROOM_PRICE.add, G),
          d =
            placePrice(p.price + SELECTED_ROOM_PRICE.add, G) -
            placePrice(ROOM_PROGRAMS[0].price + SELECTED_ROOM_PRICE.add, G),
          isO = !!open[p.id];
        return {
          ...p,
          value: p.value.map(([k, big, label, sub]) => ({ d: ICON_PATHS[k], big, label, sub })),
          detLines: p.details
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              t: l.replace(/^— ?/, '• '),
              fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
              pl: /^—/.test(l) ? '14px' : '0',
              mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
            })),
          included: i === 0,
          delta: i === 0 ? 'Включена' : '+' + eur(d) + ' с человека',
          total: eur(t),
          place: eur(placePrice(p.price + SELECTED_ROOM_PRICE.add, G)),
          border: on ? '#1F5F4A' : '#E3DED2',
          btnCls: on ? 'btn-primary' : 'btn-secondary',
          btnLabel: on ? '✓ Выбрана' : i === 0 ? 'Оставить эту' : 'Улучшить до этой',
          open: isO,
          chev: isO ? 'rotate(180deg)' : 'none',
          toggleLabel: isO ? 'Свернуть' : 'Что входит в программу подробно',
          toggle: () => this.setState({ open: { ...open, [p.id]: !isO } }),
          pick: () => this.setState({ prog: p.id }),
        };
      }),
      sumLine:
        SELECTED_ROOM_PRICE.name +
        ' · ' +
        sel.name +
        (sel.price > ROOM_PROGRAMS[0].price
          ? ' (+' + eur(placePrice(sel.price, G) - placePrice(ROOM_PROGRAMS[0].price, G)) + ' с человека)'
          : '') +
        ' · ' +
        NIGHTS +
        ' ' +
        nightsWord(NIGHTS) +
        ' · ' +
        guestsLabel(booking),
      sumTotal: eur(total),
      sumAdv: order.advanceLabel,
      sumDue: order.dueDate,
      sumFull: order.fullOnly,
      placeNote: placeLabel(G),
      party: partyLabel(G),
    };
  }
}

export default function RoomsPage() {
  usePageTitle('Шаг 1 из 5 — номер и программа');
  const [v, logic] = usePageLogic(RoomsLogic);
  return (
    <div className="page pg-rooms">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span style={{ fontSize: '16px', color: '#3E4B44' }}>Нужна помощь с заказом?</span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        {/* Steps */}
        <CheckoutSteps current={1} />
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '28px 24px 40px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Главная</Link> › <Link to="/results">Друскининкай</Link> ›{' '}
            <Link to="/hotel">Эгле Комфорт</Link> › Номер и программа
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ fontSize: '26px' }}>Номер и программа</h1>
            <p style={{ margin: '0', fontSize: '18px', color: '#3E4B44' }}>
              {v.includedName} уже включена. При желании выберите другую.
            </p>
          </div>
          {/* Chosen room */}
          <section className="card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
            <img
              src="/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg"
              alt="Двухместный номер"
              style={{
                width: '150px',
                height: '100px',
                objectFit: 'cover',
                display: 'block',
                margin: '12px 0 12px 12px',
                borderRadius: '2px',
                flex: 'none',
              }}
            />
            <div
              style={{
                flex: '1 1 300px',
                padding: '14px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#5E6862',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                Ваш номер
              </span>
              <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '22px' }}>Двухместный номер</strong>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                Санаторий Эгле Комфорт ★★★★ · 17–18 м² · 2 отдельные кровати · балкон
              </span>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                {v.dateRange} · {v.nightsLabel} · {v.guestsLabel}
              </span>
            </div>
            <div
              style={{
                flex: '0 0 220px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Link
                className="btn btn-secondary"
                to="/hotel"
                style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
              >
                Изменить номер
              </Link>
            </div>
          </section>
          {/* Programme upgrades */}
          {(v.progs || []).map((p: any, _i0: number) => (
            <Fragment key={_i0}>
              <article
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  border: `2px solid ${p.border ?? ''}`,
                }}
              >
                {/* compact: facts in one wrapping line, price and button side by side — 3–4 programmes fit a laptop screen */}
                <div className="pc-row">
                  <div className="pc-main">
                    <div className="pc-head">
                      <svg
                        width="20"
                        height="20"
                        viewBox="-1 -1 26 26"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none' }}
                      >
                        <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                      </svg>
                      <h2 className="pc-name">{p.name}</h2>
                      {p.included ? (
                        <span className="status-tag">✓ Включена в цену</span>
                      ) : (
                        <span className="pc-delta">Доплата {p.delta}</span>
                      )}
                    </div>
                    <ul className="pc-facts">
                      {(p.value || []).map((f: any, _i1: number) => (
                        <li key={_i1}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="-1 -1 26 26"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={f.d} />
                          </svg>
                          <strong>{f.big}</strong> {f.label}
                          {f.sub ? <span className="pc-sub"> · {f.sub}</span> : null}
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="pc-more" onClick={p.toggle} aria-expanded={!!p.open}>
                      {p.toggleLabel}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ transform: p.chev }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="pc-price">
                    <span className="pc-place">{p.place}</span>
                    <span className="pc-note">{v.placeNote}</span>
                    <span className="pc-total">
                      Итого {v.party}: <strong>{p.total}</strong>
                    </span>
                  </div>
                  <button type="button" className={`btn ${p.btnCls ?? ''} pc-btn`} onClick={p.pick}>
                    {p.btnLabel}
                  </button>
                </div>
                {p.open ? (
                  <>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        background: '#FAFBF9',
                        padding: '16px 22px 20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '18px 32px',
                      }}
                    >
                      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#5E6862',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                          }}
                        >
                          В программу входит
                        </div>
                        {(p.prog || []).map((it: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <div className="ico2" style={{ fontSize: '16px' }}>
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1F5F4A"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d={it.d} />
                              </svg>
                              {it.t}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div
                        style={{
                          flex: '2 1 420px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          background: '#FAF8F3',
                          borderRadius: '2px',
                          padding: '12px 16px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#5E6862',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                            marginBottom: '4px',
                          }}
                        >
                          Подробно о программе
                        </div>
                        {(p.detLines || []).map((l: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <div
                              style={{
                                fontSize: '15px',
                                lineHeight: '1.45',
                                fontWeight: l.fw,
                                paddingLeft: l.pl,
                                marginTop: l.mt,
                              }}
                            >
                              {l.t}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </article>
            </Fragment>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#3E4B44' }}>
            <svg
              width="20"
              height="20"
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
            Процедуры назначает врач после консультации. Улучшить программу можно и на месте — по наличию.
          </div>
          {/* Посоветоваться с семьёй: send the offer or get told about a price change */}
          <section
            className="card"
            style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <h2 style={{ fontSize: '20px' }}>Хотите посоветоваться?</h2>
            <ShareOffer />
          </section>
        </div>
        {/* Sticky summary */}
        <div
          style={{
            position: 'sticky',
            bottom: '0',
            background: '#fff',
            borderTop: '2px solid #1F5F4A',
            boxShadow: '0 -6px 18px rgba(0,0,0,.08)',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px 20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.sumLine}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '22px', whiteSpace: 'nowrap' }}>{v.sumTotal}</strong>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                  {v.sumFull ? (
                    'оплата сразу всей суммы'
                  ) : (
                    <>
                      цена фиксируется после депозита{' '}
                      <strong style={{ color: '#1C2620', whiteSpace: 'nowrap' }}>{v.sumAdv}</strong>, остальное — до{' '}
                      {v.sumDue}
                    </>
                  )}
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary" to="/hotel" style={{ minHeight: '46px', fontSize: '17px' }}>
                ← К номерам
              </Link>
              <Link
                className="btn btn-primary"
                to="/transfer"
                style={{ minHeight: '46px', fontSize: '17px', padding: '0 24px' }}
              >
                Далее: трансфер →
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter padding="24px 24px" pinned={false} info={footerInfo(false)} />
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
