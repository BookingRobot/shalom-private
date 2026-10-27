import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter, footerInfo } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { ICON_PATHS } from '../../data/iconPaths';
import { api } from '../../api';
import { ADVANCE_RATE, guestsLabel, stayRange } from '../../lib/orderSummary';
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
      PERS = booking.adults + booking.children,
      ADV = ADVANCE_RATE;
    const eur = (n) => fmt(n) + ' €';
    const open = st.open || {};
    const sel = ROOM_PROGRAMS.find((p) => p.id === st.prog) || ROOM_PROGRAMS[0];
    const total = sel.price + SELECTED_ROOM_PRICE.add;
    return {
      guestsLabel: guestsLabel(booking),
      includedName: ROOM_PROGRAMS[0].name,
      dateRange: stayRange(booking.checkin, booking.checkout) + ' ' + toD(booking.checkout).getUTCFullYear(),
      nightsLabel: NIGHTS + ' ' + nightsWord(NIGHTS),
      progs: ROOM_PROGRAMS.map((p, i) => {
        const on = p.id === sel.id,
          t = p.price + SELECTED_ROOM_PRICE.add,
          d = p.price - ROOM_PROGRAMS[0].price,
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
          delta: i === 0 ? 'Включена' : '+' + eur(d),
          total: eur(t),
          ppn: eur(Math.round(t / NIGHTS / PERS)),
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
        (sel.price > ROOM_PROGRAMS[0].price ? ' (+' + eur(sel.price - ROOM_PROGRAMS[0].price) + ')' : '') +
        ' · ' +
        NIGHTS +
        ' ' +
        nightsWord(NIGHTS) +
        ' · ' +
        guestsLabel(booking),
      sumTotal: eur(total),
      sumAdv: eur(Math.ceil(total * ADV)),
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
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  <div
                    style={{
                      flex: '1 1 560px',
                      minWidth: '0',
                      padding: '18px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <svg
                        width="22"
                        height="22"
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
                      <h2 style={{ fontSize: '19px' }}>{p.name}</h2>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                        gap: '10px',
                      }}
                    >
                      {(p.value || []).map((v: any, _i1: number) => (
                        <Fragment key={_i1}>
                          <div
                            style={{
                              background: '#EEF5F1',
                              border: '1px solid #C8DED3',
                              borderRadius: '2px',
                              padding: '8px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg
                                width="18"
                                height="18"
                                viewBox="-1 -1 26 26"
                                fill="none"
                                stroke="#1F5F4A"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                style={{ flex: 'none' }}
                              >
                                <path d={v.d} />
                              </svg>
                              <span
                                style={{
                                  fontFamily: 'Lora,Georgia,serif',
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  lineHeight: '1',
                                  color: '#1F5F4A',
                                }}
                              >
                                {v.big}
                              </span>
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.25' }}>{v.label}</span>
                            <span style={{ fontSize: '15px', lineHeight: '1.3', color: '#3E4B44' }}>{v.sub}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: '0 0 260px',
                      padding: '18px 20px',
                      margin: '14px 0',
                      borderLeft: '1px solid #E3DED2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      justifyContent: 'center',
                    }}
                  >
                    {p.included ? (
                      <span className="status-tag">✓ Включена в цену</span>
                    ) : (
                      <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                        Доплата <strong style={{ color: '#1C2620', whiteSpace: 'nowrap' }}>{p.delta}</strong>
                      </span>
                    )}
                    <span style={{ fontSize: '16px', color: '#3E4B44', marginTop: '8px' }}>Итого за заезд</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.15', whiteSpace: 'nowrap' }}>
                      {p.total}
                    </span>
                    <span style={{ fontSize: '15px', color: '#5E6862' }}>≈ {p.ppn} / чел. в сутки</span>
                    <button
                      type="button"
                      className={`btn ${p.btnCls ?? ''}`}
                      onClick={p.pick}
                      style={{ minHeight: '44px', fontSize: '15px', marginTop: '8px', padding: '0 14px' }}
                    >
                      {p.btnLabel}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={p.toggle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    width: '100%',
                    border: 'none',
                    borderTop: '1px solid #E3DED2',
                    background: '#FAFBF9',
                    padding: '12px 20px',
                    minHeight: '52px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#1F5F4A',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flex: 'none' }}
                    >
                      <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
                    </svg>
                    {p.toggleLabel}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ transform: p.chev }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
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
                  сейчас только аванс <strong style={{ color: '#1C2620', whiteSpace: 'nowrap' }}>{v.sumAdv}</strong>,
                  остальное при заезде
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
