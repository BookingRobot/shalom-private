import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { PHONE_DISPLAY } from '../../data/contacts';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { FLIGHTS_TEXTS } from '../../i18n/flights';
import type { Lang } from '../../i18n/LanguageContext';
import { addD, daysBetween, iso, toD } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { isFlightDay } from '../../data/flights';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './FlightsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class FlightsLogic extends PageLogic {
  static languages = ['ru', 'en', 'he'] as const;
  constructor(props: PageServices) {
    super(props);
    const bk = props.booking.booking;
    this.state = { b: 'idle', ch: 'wa', tm: 'day', in: bk.checkin, out: bk.checkout, cal: false, tk: bk.flights };
  }
  syncBooking(st) {
    return { checkin: st.in, checkout: st.out, flights: st.tk ?? null };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const T = FLIGHTS_TEXTS;
    const st = this.state;
    const L: Lang = this.props.lang.lang;
    const t = T[L];
    const fly = isFlightDay;
    const fmtD = (d) => d.getUTCDate() + ' ' + t.months[d.getUTCMonth()] + ' (' + t.wdShort[d.getUTCDay()] + ')';
    const inD = toD(st.in),
      outD = toD(st.out);
    const nights = daysBetween(inD, outD);
    const range =
      inD.getUTCDate() +
      ' ' +
      t.months[inD.getUTCMonth()] +
      ' – ' +
      outD.getUTCDate() +
      ' ' +
      t.months[outD.getUTCMonth()] +
      ' · ' +
      nights +
      ' ' +
      t.nights;
    const nearest = (d) => {
      const r: Date[] = [];
      for (let k = 1; k <= 3 && r.length < 2; k++) {
        [addD(d, -k), addD(d, k)].forEach((x) => {
          if (fly(x) && r.length < 2 && x >= TODAY) r.push(x);
        });
      }
      return r
        .sort((a, b) => a.getTime() - b.getTime())
        .map(fmtD)
        .join(', ');
    };
    const chip = (label, d) => {
      const ok = fly(d);
      return {
        label,
        date: fmtD(d),
        state: ok ? '✈ ' + t.hasFlight : t.noFlight,
        color: ok ? '#1F5F4A' : '#8A5A00',
        bg: ok ? '#EEF5F1' : '#FFF6E3',
        bd: ok ? '#C8DED3' : '#F0DDB8',
      };
    };
    const allOk = fly(inD) && fly(outD);
    const changed = false; // matching dates now lead to the flight offer view
    const GUESTS = 2,
      PPP = 389,
      BASE_TOTAL = 2258; // [ПРИМЕР] ticket price per person round trip
    const fmtN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0€';
    const dd = (d) =>
      String(d.getUTCDate()).padStart(2, '0') +
      '.' +
      String(d.getUTCMonth() + 1).padStart(2, '0') +
      '.' +
      d.getUTCFullYear() +
      ' (' +
      t.wdShort[d.getUTCDay()] +
      ')';
    const tk = st.tk || null;
    const ordTotal = BASE_TOTAL + (tk === 'yes' ? PPP * GUESTS : 0);
    const b = st.b || 'idle';
    const CH = [
        ['wa', t.chWa],
        ['call', t.chCall],
        ['mail', t.chMail],
      ],
      TM = [
        ['morning', t.tmMorning],
        ['day', t.tmDay],
        ['evening', t.tmEvening],
      ];
    // ---- calendar ----
    const sel = st.sel || { in: st.in, out: st.out };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    const m0 = st.m ?? inD.getUTCMonth(),
      y0 = st.y ?? inD.getUTCFullYear();
    const pick = (date) => () => {
      const k = iso(date);
      if (!sel.in || sel.out) this.setState({ sel: { in: k, out: null } });
      else if (date > toD(sel.in)) this.setState({ sel: { in: sel.in, out: k } });
      else this.setState({ sel: { in: k, out: null } });
    };
    const cells = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1)),
        lead = (first.getUTCDay() + 6) % 7,
        days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(),
        out: CalendarCell[] = [];
      for (let i = 0; i < lead; i++)
        out.push({
          day: '',
          sub: '',
          fly: false,
          bg: 'transparent',
          border: 'transparent',
          color: '#1C2620',
          subColor: '#3E4B44',
          planeColor: '#1F5F4A',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y, m, d)),
          past = date < TODAY,
          f = fly(date) && !past;
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut),
          between = sIn && sOut && date > sIn && date < sOut;
        let bg = past ? '#E8E6E1' : f ? '#E9F4EC' : '#fff',
          border = f ? '#9CC9B5' : '#E3DED2',
          color = past ? '#9AA39E' : '#1C2620',
          subColor = '#1F5F4A',
          planeColor = '#1F5F4A';
        if (between) {
          bg = past ? bg : '#F4F8F5';
        }
        if (isIn || isOut) {
          bg = '#1F5F4A';
          border = '#1F5F4A';
          color = '#fff';
          subColor = '#D9E2DC';
          planeColor = '#fff';
        }
        out.push({
          day: d,
          sub: isIn ? t.arrive : isOut ? t.depart : f ? '✈' : '',
          fly: f,
          bg,
          border,
          color,
          subColor,
          planeColor,
          off: past,
          cursor: past ? 'not-allowed' : 'pointer',
          aria: d + ' ' + t.months[m] + (f ? ', ' + t.lgFly : ''),
          pick: pick(date),
        });
      }
      return out;
    };
    const m1 = (m0 + 1) % 12,
      y1 = m0 === 11 ? y0 + 1 : y0;
    const selN = sIn && sOut ? daysBetween(sIn, sOut) : 0;
    return {
      t,
      dir: L === 'he' ? 'rtl' : 'ltr',
      langs: [
        ['ru', 'RU'],
        ['en', 'EN'],
        ['he', 'HE'],
      ].map(([k, l]) => ({ t: l, cls: k === L ? 'on' : '', pick: () => this.props.lang.setLang(k as Lang) })),
      showNotice: !allOk,
      showOffer: allOk,
      demo: [
        ['no', t.demoNo, '2026-11-09', '2026-11-18'],
        ['yes', t.demoYes, '2026-11-10', '2026-11-19'],
      ].map(([k, l, a, b2]) => ({
        t: l,
        cls: (k === 'yes') === allOk ? 'on' : '',
        pick: () => this.setState({ in: a, out: b2, tk: null }),
      })),
      fPpp: fmtN(PPP),
      fTotal: fmtN(PPP * GUESTS),
      legs: [
        {
          dir: t.there,
          icon: 'M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z',
          iconBg: '#EEF5F1',
          from: 'TLV',
          fromCity: L === 'he' ? 'תל אביב' : L === 'en' ? 'Tel Aviv' : 'Тель-Авив',
          to: 'VNO',
          toCity: L === 'he' ? 'וילנה' : L === 'en' ? 'Vilnius' : 'Вильнюс',
          dep: '13:05',
          arr: '17:20',
          date: dd(inD),
          dur: L === 'ru' ? '4 ч 15 мин' : '4h 15m',
          no: 'IZ 2549',
          seats: t.seats.replace('{n}', '9'),
          plane: 'Airbus A320',
        },
        {
          dir: t.back,
          icon: 'M2 20h20M3 10l1.5-.5 2.5 2.5 3.5-.9L7.6 6l2-.5 5 5.5 4.7 1.2a2 2 0 0 1-1 3.9L3 12z',
          iconBg: '#E8EEF8',
          from: 'VNO',
          fromCity: L === 'he' ? 'וילנה' : L === 'en' ? 'Vilnius' : 'Вильнюс',
          to: 'TLV',
          toCity: L === 'he' ? 'תל אביב' : L === 'en' ? 'Tel Aviv' : 'Тель-Авив',
          dep: '18:40',
          arr: '22:40',
          date: dd(outD),
          dur: L === 'ru' ? '4 ч 00 мин' : '4h 00m',
          no: 'IZ 2550',
          seats: t.seats.replace('{n}', '9'),
          plane: 'Airbus A320',
        },
      ],
      yText: t.yText.replace('{a}', 'IZ 2549').replace('{b}', 'IZ 2550').replace('{g}', String(GUESTS)),
      yesCls: tk === 'yes' ? 'on' : '',
      noCls: tk === 'no' ? 'on' : '',
      yesBtn: tk === 'yes' ? 'btn-primary' : 'btn-secondary',
      noBtn: tk === 'no' ? 'btn-primary' : 'btn-secondary',
      yesLabel: tk === 'yes' ? t.yBtnOn : t.yBtn,
      noLabel: tk === 'no' ? t.nBtnOn : t.nBtn,
      pickYes: () => this.setState({ tk: 'yes' }),
      pickNo: () => this.setState({ tk: 'no' }),
      decided: !!tk,
      decisionLine:
        tk === 'yes'
          ? t.decYes.replace('{p}', fmtN(PPP * GUESTS)).replace('{t}', fmtN(ordTotal))
          : t.decNo.replace('{t}', fmtN(ordTotal)),
      orderTotal: fmtN(ordTotal),
      datesOkOld: false,
      dateChips: [chip(t.arrive, inD), chip(t.depart, outD)],
      flightDaysLine:
        t.flightDays + [!fly(inD) ? nearest(inD) : null, !fly(outD) ? nearest(outD) : null].filter(Boolean).join(' · '),
      rangeLabel: range,
      bIdle: b === 'idle',
      bForm: b === 'form' && !changed,
      bSent: b === 'sent' && !changed,
      bCls: b === 'form' ? 'on' : '',
      openB: () => this.setState({ b: 'form' }),
      closeB: () => this.setState({ b: 'idle' }),
      sendB: () => this.setState({ b: 'sent' }),
      channels: CH.map(([k, l]) => ({ t: l, cls: k === st.ch ? 'on' : '', pick: () => this.setState({ ch: k }) })),
      times: TM.map(([k, l]) => ({ t: l, cls: k === st.tm ? 'on' : '', pick: () => this.setState({ tm: k }) })),
      okText: t.okText
        .replace('{ch}', (CH.find((c) => c[0] === st.ch) || CH[0])[1])
        .replace('{tm}', (TM.find((c) => c[0] === st.tm) || TM[1])[1].toLowerCase()),
      datesOk: changed,
      goodText: t.goodText.replace('{range}', range),
      calOpen: !!st.cal,
      openCal: () =>
        this.setState({ cal: true, sel: { in: st.in, out: st.out }, m: inD.getUTCMonth(), y: inD.getUTCFullYear() }),
      closeCal: () => this.setState({ cal: false }),
      calPrev: () => {
        const m = m0 - 1;
        this.setState({ m: (m + 12) % 12, y: m < 0 ? y0 - 1 : y0 });
      },
      calNext: () => {
        const m = m0 + 1;
        this.setState({ m: m % 12, y: m > 11 ? y0 + 1 : y0 });
      },
      wds: t.wd.map((x) => ({ t: x })),
      months: [
        { title: t.monthsN[m0] + ' ' + y0, cells: cells(y0, m0) },
        { title: t.monthsN[m1] + ' ' + y1, cells: cells(y1, m1) },
      ],
      calHint: !sIn ? t.calHintIn : !sOut ? t.calHintOut : t.calHintDone,
      selLine: sIn ? fmtD(sIn) + (sOut ? ' → ' + fmtD(sOut) + ' · ' + selN + ' ' + t.nights : ' → …') : '—',
      applyOff: !selN,
      applyCal: () => {
        if (selN && sIn && sOut) this.setState({ in: iso(sIn), out: iso(sOut), cal: false, tk: null });
      },
    };
  }
}

export default function FlightsPage() {
  usePageTitle('Шаг 4 из 5 — рейсы');
  const [v, logic] = usePageLogic(FlightsLogic);
  return (
    <div className="page pg-flights">
      <div dir={v.dir} style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar minHeight={84}>
          <Brand logo={40} size={24} name={v.t?.brand} />
          <HeaderAside>
            <span style={{ display: 'flex', gap: '4px' }} aria-label="Язык / Language">
              {(v.langs || []).map((l: any) => (
                <button
                  key={l.t}
                  type="button"
                  className={'lang ' + l.cls}
                  onClick={l.pick}
                  aria-pressed={l.cls === 'on'}
                >
                  {l.t}
                </button>
              ))}
            </span>
            <PhoneLink icon={24} />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps
          current={4}
          labels={[v.t?.sRoom, v.t?.sTransfer, v.t?.sGuests, v.t?.sFlights, v.t?.sPay, v.t?.sDone]}
        />
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '32px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* Prototype-only switch between the two cases */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: '#6B776F',
            }}
          >
            <span style={{ fontWeight: '700' }}>[Прототип] Показать вариант:</span>
            {(v.demo || []).map((d: any, _i0: number) => (
              <Fragment key={_i0}>
                <button type="button" className={`lang ${d.cls ?? ''}`} onClick={d.pick} style={{ fontSize: '13px' }}>
                  {d.t}
                </button>
              </Fragment>
            ))}
          </div>
          {/* Dates match the partner airline: offer the flights */}
          {v.showOffer ? (
            <>
              <section style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: '#1F5F4A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                  </svg>
                </div>
                <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h1 style={{ fontSize: '34px' }}>{v.t?.offTitle}</h1>
                  <p style={{ margin: '0', fontSize: '19px' }}>{v.t?.offLead}</p>
                </div>
              </section>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h2 style={{ fontSize: '30px' }}>{v.t?.qTitle}</h2>
                <p style={{ margin: '0', fontSize: '17px', color: '#3E4B44' }}>{v.t?.qLead}</p>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  <div
                    className={`opt ${v.yesCls ?? ''}`}
                    style={{
                      flex: '3 1 440px',
                      background: '#1F5F4A',
                      borderColor: '#1F5F4A',
                      color: '#fff',
                      boxShadow: '0 10px 26px rgba(31,95,74,.28)',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '22px',
                        background: '#C9893A',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '800',
                        padding: '5px 12px',
                        borderRadius: '2px',
                        letterSpacing: '.02em',
                      }}
                    >
                      {v.t?.recBadge}
                    </span>{' '}
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                        </svg>
                      </div>
                      <span
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.15' }}
                      >
                        <strong style={{ fontSize: '30px', whiteSpace: 'nowrap' }}>+{v.fTotal}</strong>
                        <span style={{ fontSize: '14px', color: '#D9E2DC' }}>{v.t?.forTwo}</span>
                      </span>
                    </div>
                    <h3 style={{ fontSize: '28px', color: '#fff' }}>{v.t?.yTitle}</h3>
                    <p style={{ margin: '0', fontSize: '17px', color: '#E6F0EA', flex: '1' }}>{v.yText}</p>{' '}
                    <button
                      type="button"
                      onClick={v.pickYes}
                      style={{
                        minHeight: '64px',
                        font: '800 20px Manrope,sans-serif',
                        width: '100%',
                        border: 'none',
                        borderRadius: '2px',
                        background: '#fff',
                        color: '#1F5F4A',
                        cursor: 'pointer',
                      }}
                    >
                      {v.yesLabel}
                    </button>
                  </div>
                  <div className={`opt ${v.noCls ?? ''}`} style={{ flex: '2 1 300px', padding: '20px 22px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#EEF5F1',
                        border: '2px solid #1F5F4A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 7h18v10H3zM15 7v10M7 11h4M7 14h3" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '21px' }}>{v.t?.nTitle}</h3>
                    <p style={{ margin: '0', fontSize: '16px', color: '#3E4B44', flex: '1' }}>{v.t?.nText}</p>{' '}
                    <button
                      type="button"
                      className={`btn ${v.noBtn ?? ''}`}
                      onClick={v.pickNo}
                      style={{ minHeight: '54px', fontSize: '17px', width: '100%' }}
                    >
                      {v.noLabel}
                    </button>
                  </div>
                </div>
                {v.decided ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                        background: '#EEF5F1',
                        border: '2px solid #1F5F4A',
                        borderRadius: '2px',
                        padding: '16px 20px',
                      }}
                    >
                      <span style={{ fontSize: '17px' }}>{v.decisionLine}</span>
                      <Link className="btn btn-primary" to="/payment" style={{ minHeight: '58px', fontSize: '19px' }}>
                        {v.t?.toPay} →
                      </Link>
                    </div>
                  </>
                ) : null}
                <span style={{ fontSize: '14px', color: '#6B776F' }}>{v.t?.offNote}</span>
              </section>
              <section className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 22px 0',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#6B776F',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  {v.t?.detailsHead}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    padding: '16px 22px',
                    background: '#F7F5F0',
                    borderBottom: '1px solid #E3DED2',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: '800',
                      fontSize: '18px',
                      color: '#1F5F4A',
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m8 12 3 3 5-6" />
                    </svg>
                    {v.t?.offFlights}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <strong style={{ fontSize: '30px', color: '#1C2620', whiteSpace: 'nowrap' }}>{v.fPpp}</strong>
                    <span style={{ fontSize: '14px', color: '#3E4B44' }}>{v.t?.offPpp}</span>
                  </span>
                </div>{' '}
                {(v.legs || []).map((g: any, _i0: number) => (
                  <Fragment key={_i0}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap',
                        padding: '20px 22px',
                        borderBottom: '1px dashed #E3DED2',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          width: '84px',
                          flex: 'none',
                        }}
                      >
                        <span
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: g.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={g.icon} />
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: '#3E4B44',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                          }}
                        >
                          {g.dir}
                        </span>
                      </div>
                      <div style={{ flex: '1 1 520px', display: 'flex', alignItems: 'center', gap: '14px' }} dir="ltr">
                        <div
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '110px' }}
                        >
                          <strong style={{ fontSize: '30px', lineHeight: '1' }}>{g.from}</strong>
                          <span style={{ fontSize: '22px', fontWeight: '800', color: '#1F5F4A' }}>{g.dep}</span>
                          <span style={{ fontSize: '15px', color: '#3E4B44' }}>{g.date}</span>
                          <span style={{ fontSize: '13px', color: '#6B776F' }}>{g.fromCity}</span>
                        </div>
                        <div
                          style={{
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            minWidth: '120px',
                          }}
                        >
                          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CFC9BB' }} />
                            <span style={{ flex: '1', height: '2px', background: '#E3DED2' }} />
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1F5F4A" aria-hidden="true">
                              <path
                                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
                                transform="rotate(90 12 12)"
                              />
                            </svg>
                            <span style={{ flex: '1', height: '2px', background: '#E3DED2' }} />
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CFC9BB' }} />
                          </div>
                          <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                            {g.dur} · {v.t?.offDirect}
                          </span>
                        </div>
                        <div
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '110px' }}
                        >
                          <strong style={{ fontSize: '30px', lineHeight: '1' }}>{g.to}</strong>
                          <span style={{ fontSize: '22px', fontWeight: '800', color: '#1F5F4A' }}>{g.arr}</span>
                          <span style={{ fontSize: '15px', color: '#3E4B44' }}>{g.date}</span>
                          <span style={{ fontSize: '13px', color: '#6B776F' }}>{g.toCity}</span>
                        </div>
                      </div>
                      <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '800',
                            fontSize: '17px',
                            color: '#1F5F4A',
                          }}
                          dir="ltr"
                        >
                          ✈ {g.no}
                        </span>
                        <span style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              background: '#FFF6E3',
                              color: '#8A5A00',
                              fontWeight: '800',
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '2px',
                            }}
                          >
                            {v.t?.offCharter}
                          </span>
                          <span
                            style={{
                              background: '#EEF5F1',
                              color: '#1F5F4A',
                              fontWeight: '800',
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '2px',
                            }}
                          >
                            {g.seats}
                          </span>
                        </span>
                        <span style={{ fontSize: '14px', color: '#3E4B44' }}>{g.plane}</span>
                      </div>
                    </div>
                  </Fragment>
                ))}{' '}
                <div
                  style={{
                    display: 'flex',
                    gap: '22px',
                    flexWrap: 'wrap',
                    padding: '14px 22px',
                    fontSize: '15px',
                    color: '#3E4B44',
                    background: '#FAFBF9',
                  }}
                >
                  <span>🧳 {v.t?.offHand}</span>
                  <span>🛄 {v.t?.offBag}</span>
                  <span>🍽 {v.t?.offMeal}</span>
                  <span>✈ {v.t?.offAirline}</span>
                </div>
              </section>
            </>
          ) : null}
          {/* Main notice: friendly, not an error */}
          {v.showNotice ? (
            <>
              {/* dates mismatch */}
              <section
                style={{
                  background: '#fff',
                  border: '1px solid #E3DED2',
                  borderRadius: '2px',
                  padding: '28px 30px',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: '#EEF5F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <svg
                    width="46"
                    height="46"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                  </svg>
                </div>
                <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h1 style={{ fontSize: '34px' }}>{v.t?.title}</h1>
                  <p style={{ margin: '0', fontSize: '19px', color: '#1C2620' }}>{v.t?.lead}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                    {(v.dateChips || []).map((d: any, _i0: number) => (
                      <Fragment key={_i0}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: d.bg,
                            border: `1px solid ${d.bd ?? ''}`,
                            borderRadius: '2px',
                            padding: '8px 12px',
                            fontSize: '16px',
                          }}
                        >
                          <strong>{d.label}</strong>
                          {d.date} ·<span style={{ color: d.color, fontWeight: '700' }}>{d.state}</span>
                        </span>
                      </Fragment>
                    ))}
                  </div>
                  <div style={{ fontSize: '15px', color: '#3E4B44' }}>{v.flightDaysLine}</div>
                </div>
              </section>
              {/* Two big equal options */}
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                <div className="opt">
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#1F5F4A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: '26px' }}>{v.t?.aTitle}</h2>
                  <p style={{ margin: '0', fontSize: '17px', color: '#3E4B44', flex: '1' }}>{v.t?.aText}</p>{' '}
                  <Link
                    className="btn btn-primary"
                    to="/payment"
                    style={{ minHeight: '60px', fontSize: '19px', marginTop: '6px' }}
                  >
                    {v.t?.aBtn} →
                  </Link>
                </div>
                <div className={`opt ${v.bCls ?? ''}`}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#EEF5F1',
                      border: '2px solid #1F5F4A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
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
                  </div>
                  <h2 style={{ fontSize: '26px' }}>{v.t?.bTitle}</h2>
                  <p style={{ margin: '0', fontSize: '17px', color: '#3E4B44', flex: '1' }}>{v.t?.bText}</p>{' '}
                  {v.bIdle ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={v.openB}
                        style={{ minHeight: '60px', fontSize: '19px', marginTop: '6px', width: '100%' }}
                      >
                        {v.t?.bBtn}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {/* B: contact request form (inline, keeps the booking) */}
          {v.bForm ? (
            <>
              <section
                className="card"
                style={{
                  padding: '24px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  border: '2px solid #1F5F4A',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <h2 style={{ fontSize: '26px' }}>{v.t?.fTitle}</h2>
                  <button
                    type="button"
                    onClick={v.closeB}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1F5F4A',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: 'pointer',
                      minHeight: '40px',
                    }}
                  >
                    {v.t?.fCancel}
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                    gap: '16px',
                  }}
                >
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="lbl">{v.t?.fName}</span>
                    <input className="input" type="text" defaultValue="Mikhail Levin" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="lbl">{v.t?.fPhone}</span>
                    <input className="input" type="tel" defaultValue="+972 50 123 4567" dir="ltr" />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="lbl">{v.t?.fHow}</span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(v.channels || []).map((c: any, _i0: number) => (
                      <Fragment key={_i0}>
                        <button type="button" className={`seg ${c.cls ?? ''}`} onClick={c.pick}>
                          {c.t}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="lbl">{v.t?.fWhen}</span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(v.times || []).map((c: any, _i0: number) => (
                      <Fragment key={_i0}>
                        <button type="button" className={`seg ${c.cls ?? ''}`} onClick={c.pick}>
                          {c.t}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="lbl">{v.t?.fNote}</span>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder={v.t?.fNotePh}
                    style={{ padding: '12px 16px', minHeight: '80px', resize: 'vertical' }}
                  />
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: '#EEF5F1',
                    borderRadius: '2px',
                    padding: '12px 16px',
                    fontSize: '16px',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <rect x="4" y="11" width="16" height="10" rx="1" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  {v.t?.fKeep}
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.sendB}
                    style={{ minHeight: '60px', fontSize: '19px' }}
                  >
                    {v.t?.fSend}
                  </button>
                </div>
              </section>
            </>
          ) : null}
          {/* B: sent */}
          {v.bSent ? (
            <>
              <section
                style={{
                  background: '#EEF5F1',
                  border: '2px solid #1F5F4A',
                  borderRadius: '2px',
                  padding: '24px 26px',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#1F5F4A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </div>
                <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h2 style={{ fontSize: '26px' }}>{v.t?.okTitle}</h2>
                  <p style={{ margin: '0', fontSize: '17px' }}>{v.okText}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <Link className="btn btn-primary" to="/payment">
                      {v.t?.okPay}
                    </Link>
                    <Link className="btn btn-secondary" to="/">
                      {v.t?.okWait}
                    </Link>
                  </div>
                </div>
              </section>
            </>
          ) : null}
          {/* C: dates changed and now fit the flights */}
          {v.datesOkOld ? (
            <>
              <section
                style={{
                  background: '#EEF5F1',
                  border: '2px solid #1F5F4A',
                  borderRadius: '2px',
                  padding: '24px 26px',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                </svg>
                <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 style={{ fontSize: '26px' }}>{v.t?.goodTitle}</h2>
                  <span style={{ fontSize: '17px' }}>{v.goodText}</span>
                </div>
                <Link className="btn btn-primary" to="/payment" style={{ minHeight: '60px', fontSize: '19px' }}>
                  {v.t?.goodBtn} →
                </Link>
              </section>
            </>
          ) : null}
          {/* C: secondary action */}
          {v.showNotice ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  padding: '6px 0',
                }}
              >
                <button
                  type="button"
                  onClick={v.openCal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#1F5F4A',
                    fontWeight: '700',
                    fontSize: '18px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    minHeight: '48px',
                  }}
                >
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
                    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                  </svg>
                  {v.t?.cLink}
                </button>
              </div>
            </>
          ) : null}
          {/* Booking kept */}
          <section
            className="card"
            style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}
          >
            <img
              src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
              alt=""
              style={{ width: '120px', height: '84px', objectFit: 'cover', borderRadius: '2px', flex: 'none' }}
            />
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#6B776F',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                {v.t?.kept}
              </span>
              <strong style={{ fontSize: '19px' }}>Эгле Комфорт ★★★★ · {v.rangeLabel}</strong>
              <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.t?.keptLine}</span>
            </div>
            <strong style={{ fontSize: '24px', whiteSpace: 'nowrap' }}>{v.orderTotal}</strong>
          </section>
        </div>
        <SiteFooter
          padding="24px"
          info={
            <>
              {v.t?.brand} · WhatsApp <span dir="ltr">{PHONE_DISPLAY}</span>
            </>
          }
          right={
            <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
              {v.t?.rules}
            </Link>
          }
        />
      </div>{' '}
      {/* Date picker with flight days */}{' '}
      {v.calOpen ? (
        <>
          <div
            dir={v.dir}
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
              aria-labelledby="fcTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                width: 'min(820px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '26px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="fcTitle" style={{ fontSize: '30px' }}>
                    {v.t?.calTitle}
                  </h2>
                  <span style={{ fontSize: '17px', color: '#3E4B44' }}>{v.calHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.closeCal}
                  style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
                >
                  {v.t?.close}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span className="lg">
                  <i style={{ background: '#1F5F4A' }} />
                  {v.t?.lgPicked}
                </span>
                <span className="lg">
                  <i style={{ background: '#E9F4EC', border: '2px solid #1F5F4A' }} />✈ {v.t?.lgFly}
                </span>
                <span className="lg">
                  <i style={{ background: '#fff', border: '1px solid #CFC9BB' }} />
                  {v.t?.lgNoFly}
                </span>
                <span className="lg">
                  <i style={{ background: '#E8E6E1' }} />
                  {v.t?.lgPast}
                </span>
              </div>
              <MonthsCalendar
                months={v.months || []}
                onPrev={v.calPrev}
                onNext={v.calNext}
                gap={14}
                weekdays={(v.wds || []).map((w: any) => w.t)}
                prevLabel="‹"
                nextLabel="›"
              />
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
                <strong style={{ fontSize: '19px' }}>{v.selLine}</strong>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={v.applyCal}
                  disabled={!!v.applyOff}
                  style={{ minHeight: '56px', fontSize: '18px' }}
                >
                  {v.t?.apply}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
