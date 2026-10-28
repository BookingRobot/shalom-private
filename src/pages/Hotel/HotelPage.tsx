import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { MONTHS, MONTHS_N, WEEKDAYS_FULL, addD, daysBetween, iso, nightsWord, shortDate, toD } from '../../lib/dates';
import { fmt, toNum } from '../../lib/format';
import { TODAY } from '../../data/demo';
import { isSoldOutEverywhere } from '../../data/availability';
import { transferBySanatorium } from '../../data/transferPolicy';
import { blockedNights, blockedNote } from '../../lib/stayCheck';
import { CalNotice } from '../../components/calendar/CalNotice';
import { isFlightDay } from '../../data/flights';
import { ICON_PATHS, amenity } from '../../data/iconPaths';
import { BUSY_LOOK, FREE_LOOK, freeFrom, overlaps, roomDayBusy } from '../../data/roomAvailability';
import { api } from '../../api';
import { RoomCard } from '../../components/RoomCard';
import { eur, placePrice, quote } from '../../lib/pricing';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './HotelPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class HotelLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    this.state = { i: 0, det: {}, sec: {}, in: b.checkin, out: b.checkout };
  }
  syncBooking(st) {
    return { checkin: st.in, checkout: st.out };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const GQ = { adults: this.props.booking.booking.adults, children: this.props.booking.booking.children };
    const {
      about: EGLE_ABOUT,
      photos: EGLE_PHOTOS,
      allPhotos: EGLE_ALL_PHOTOS,
      programs: EGLE_PROGRAMS,
      rooms: EGLE_ROOMS,
      specializations: EGLE_SPECIALIZATIONS,
      transferCars: TRANSFER_CARS,
    } = api.getSanatorium(this.props.booking.booking.hotelId);

    const det = this.state.det || {},
      sec = this.state.sec || {};
    const secT = (k) => () => this.setState({ sec: { ...sec, [k]: !sec[k] } });
    // ---- Dates & price model (synthetic season curve, calibrated so 9–18 Nov = list price) [ЗАМЕНИТЬ НА ТАРИФЫ] ----
    const st = this.state;
    const BASE_IN = toD('2026-11-09');
    const range = (a, b) =>
      a.getUTCMonth() === b.getUTCMonth()
        ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()]
        : shortDate(a) + ' – ' + shortDate(b);
    const checkin = toD(st.in || '2026-11-09'),
      checkout = toD(st.out || '2026-11-18');
    const nights = Math.max(1, daysBetween(checkin, checkout));
    const G = (d) => {
      const n = daysBetween(BASE_IN, d),
        wd = d.getUTCDay();
      return (
        1 +
        0.11 * Math.sin(n * 0.55 + 1.1) +
        (wd === 5 || wd === 6 ? 0.07 : 0) +
        (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
      );
    };
    const sumG = (a, n) => {
      let t = 0;
      for (let i = 0; i < n; i++) t += G(addD(a, i));
      return t;
    };
    const K = 2138 / (2 * sumG(BASE_IN, 9)); // € per person-night at factor 1 for «Миди»
    const totalFor = (a, n, listPrice) => Math.round((listPrice / 2138) * 2 * K * sumG(a, n));
    const ppnDay = (d) => Math.round(K * G(d));
    const ADV_RATE = 0.04;
    const nightsLabel = nights + ' ' + nightsWord(nights);
    // ---- Room-first: each room priced with the cheapest programme; programmes are upgrades inside ----
    const PROGS = (EGLE_PROGRAMS as any[])
      .concat([
        {
          n: 3,
          title: 'Программа «Премиум» — 5 процедур в день + массаж',
          price: '2 550',
          prog: [
            amenity('meals', 'Полный пансион, диетическое меню'),
            amenity('doctor', 'Консультация врача'),
            amenity('proc', '5 процедур в день'),
            amenity('massage', 'Массаж каждый день'),
            amenity('pool', 'Бассейны без ограничений'),
          ],
          details:
            'Для взрослого в цену включено:\n— Всё, что в программе «Макси»\n— Ежедневный классический массаж 30 мин\n— Полный пансион: завтрак, обед, полдник, ужин, диетическое меню по назначению врача\n\nПроцедуры назначает врач после консультации.',
        },
      ])
      .map((p) => ({
        ...p,
        priceN: totalFor(checkin, nights, toNum(p.price)),
        meals: p.prog.some((x) => /пансион/i.test(x.t)) ? 'полный пансион' : 'питание 3 раза',
      }))
      .sort((a, b) => a.priceN - b.priceN);
    // [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]

    const pf1 = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'процедура'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'процедуры'
          : 'процедур';
    const valueOf = (p, roomName) => {
      const pm = String(p.title).match(/(\d+) процедур/);
      const nProc = pm ? Number(pm[1]) : 0;
      const perDay = /в день/.test(p.title);
      const progT = p.prog.map((x) => x.t).join(' ');
      return [
        nProc
          ? {
              d: ICON_PATHS.proc,
              big: String(nProc),
              label: perDay ? pf1(nProc) + ' в день' : pf1(nProc) + ' за заезд',
              sub: perDay
                ? nProc * nights + ' ' + pf1(nProc * nights) + ' за весь заезд · по назначению врача'
                : 'по назначению врача',
            }
          : null,
        /массаж/i.test(progT)
          ? { d: ICON_PATHS.massage, big: String(nights), label: 'массажей', sub: 'классический массаж каждый день' }
          : null,
        /питани|пансион/i.test(progT)
          ? {
              d: ICON_PATHS.meals,
              big: /пансион/i.test(progT) ? '4' : '3',
              label: 'приёма пищи в день',
              sub: /пансион/i.test(progT) ? 'полный пансион, диетическое меню' : 'завтрак, обед, ужин · шведский стол',
            }
          : null,
        /врач/i.test(progT)
          ? { d: ICON_PATHS.doctor, big: '1', label: 'консультация врача', sub: 'при заезде · говорит по-русски' }
          : null,
        /бассейн|бан/i.test(progT)
          ? { d: ICON_PATHS.pool, big: '∞', label: 'бассейны и сауны', sub: 'каждый день, без ограничений' }
          : null,
        { d: ICON_PATHS.bed2, big: String(nights), label: nightsWord(nights) + ' в номере', sub: roomName },
      ].filter(Boolean);
    };

    // Room types fully booked on some dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]: [from, to) per room
    const ROOM_KEY = { 3: 'egle-comfort:junior' };
    const ps = st.ps || {};
    const offers = EGLE_ROOMS.map((r) => {
      const dOpen = !!det[r.n];
      const addN = totalFor(checkin, nights, r.add);
      const cheapest = PROGS[0].priceN + addN;
      const adv = Math.ceil(cheapest * ADV_RATE);
      const selI = ps[r.n] ?? 0,
        sp = PROGS[selI] || PROGS[0];
      const progRows = PROGS.map((p, pi) => {
        const on = pi === selI,
          pp = p.title.split(' — ');
        return {
          name: pp[0],
          sub: (pp[1] || '') + ' · ' + p.meals,
          price: eur(quote(p.priceN + addN, GQ, this.props.booking.booking.flightPackage, true).perPerson) + ' / чел.',
          diff:
            pi === 0
              ? 'самая доступная'
              : '+' + eur(placePrice(p.priceN, GQ) - placePrice(PROGS[0].priceN, GQ)) + ' с человека',
          diffColor: pi === 0 ? '#1F5F4A' : '#3E4B44',
          border: on ? '#1F5F4A' : '#CFC9BB',
          bg: on ? '#EEF5F1' : '#fff',
          dot: on ? '#1F5F4A' : 'transparent',
          pick: () => this.setState({ ps: { ...ps, [r.n]: pi } }),
        };
      });
      const detLines = String(sp.details)
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => ({
          t: l.replace(/^— ?/, '• '),
          fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
          pl: /^—/.test(l) ? '14px' : '0',
          mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
        }));
      const p0 = PROGS[0].title.split(' — ');
      const rkey = ROOM_KEY[r.n] || '';
      const busy = overlaps(rkey, checkin, checkout);
      return {
        ...r,
        room: r.name,
        short: r.name,
        roomLine: r.line,
        ...(busy ? BUSY_LOOK : FREE_LOOK),
        busy,
        avail: !busy,
        busyRange: range(checkin, checkout),
        nextFree: freeFrom(rkey),
        choose: () => this.props.booking.update({ roomId: 'room-' + r.n }),
        openRoomCal: () =>
          this.setState({
            cal: true,
            calRoom: rkey,
            calRoomName: r.name,
            note: null,
            sel: { in: null, out: null },
            month: checkin.getUTCMonth(),
            year: checkin.getUTCFullYear(),
          }),
        pill: busy
          ? 'Нет мест на ваши даты'
          : r.add
            ? 'Номер +' + eur(placePrice(addN, GQ)) + ' с человека'
            : 'Включён в цену программы',
        progLine: 'с программой ' + p0[0].replace('Программа ', '') + ' · ' + (p0[1] || '') + ' · ' + PROGS[0].meals,
        price: fmt(cheapest),
        adv,
        ppn: Math.round(cheapest / nights / 2),
        prog: sp.prog,
        value: valueOf(sp, r.name + ' · ' + r.line.split(' · ')[0]),
        detLines,
        progRows,
        roomText: 'Что ещё есть в номере: телефон, спутниковое ТВ, гардероб, сейф, фен, халат, тапочки.',
        selName: sp.title.split(' — ')[0],
        selPrice: eur(quote(sp.priceN + addN, GQ, this.props.booking.booking.flightPackage, true).total),
        detBtn: 'Программы для этого номера (' + PROGS.length + ') и что входит',
        detChev: dOpen ? 'rotate(180deg)' : 'none',
        border: r.top ? '#1F5F4A' : '#E3DED2',
        detOpen: dOpen,
        toggleDet: () => this.setState({ det: { ...det, [r.n]: !dOpen } }),
      };
    });
    const n = EGLE_PHOTOS.length;
    const i = (((this.state.i ?? 0) % n) + n) % n;
    // Check-in / check-out: per-sanatorium parameters (come from the hotel record)
    const times = {
      checkin: '14:00',
      checkinDate: WEEKDAYS_FULL[checkin.getUTCDay()] + ', ' + shortDate(checkin),
      checkout: '12:00',
      checkoutDate: WEEKDAYS_FULL[checkout.getUTCDay()] + ', ' + shortDate(checkout),
      notes: [
        {
          t: 'Ранний приезд',
          s: 'багаж примут на хранение, можно сразу пойти на обед и к врачу',
          d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
        },
        {
          t: 'Поздний выезд',
          s: 'по запросу, если номер свободен; обед в день выезда входит',
          d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
        },
        {
          t: 'Регистрация',
          s: 'паспорт каждого гостя; остаток оплачивается на стойке',
          d: 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6',
        },
      ],
    };
    // ---- Calendar modal values ----
    const sel = st.sel || { in: iso(checkin), out: iso(checkout) };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    const m0 = st.month ?? checkin.getUTCMonth(),
      y0 = st.year ?? checkin.getUTCFullYear();
    const curPpn = Math.round(totalFor(checkin, nights, 2138) / nights / 2);
    // a stay can't cross a "нет мест" night (resort-wide or this room): pop-up instead of selecting
    const blocked = (d: Date) => isSoldOutEverywhere(iso(d)) || (st.calRoom ? roomDayBusy(st.calRoom, d) : false);
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
        const full = !past && (isSoldOutEverywhere(iso(date)) || (st.calRoom ? roomDayBusy(st.calRoom, date) : false));
        /* [ПРИМЕР] нет мест ни в одном объекте */ const p = ppnDay(date),
          r = p / curPpn;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.03 ? '#FFF6E3' : '#FCEDE9',
          color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut),
          between = sIn && sOut && date > sIn && date < sOut;
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
            (past ? ', недоступно' : full ? ', нет мест' : ', ' + p + '\u00a0€ за человека в сутки'),
          pick: pickDay(date),
        });
      }
      return cells;
    };
    const months = [{ title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) }];
    const selN = sIn && sOut ? daysBetween(sIn, sOut) : 0;
    const curTotal = totalFor(checkin, nights, 2138),
      newTotal = selN ? totalFor(sIn, selN, 2138) : 0,
      diff = curTotal - newTotal;
    const preset = (n) => () => {
      const a = sIn || checkin;
      const bad = blockedNights(a, addD(a, n), blocked);
      if (bad.length) return this.setState({ note: blockedNote(bad) });
      this.setState({ sel: { in: iso(a), out: iso(addD(a, n)) }, note: null });
    };
    const selBlocked = !!(sIn && sOut && blockedNights(sIn, sOut, blocked).length);
    const calVals = {
      calOpen: !!st.cal,
      calNote: st.note || '',
      calNoteClose: () => this.setState({ note: null }),
      calNoteAsk: () => this.props.help.open(),
      openCal: () =>
        this.setState({
          note: null,
          cal: true,
          calRoom: null,
          calRoomName: null,
          sel: { in: iso(checkin), out: iso(checkout) },
          month: checkin.getUTCMonth(),
          year: checkin.getUTCFullYear(),
        }),
      closeCal: () => this.setState({ cal: false, note: null }),
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
      curRange: range(checkin, checkout),
      curTotal: fmt(curTotal),
      newRange: selN
        ? range(sIn, sOut) + ' · ' + selN + ' ' + nightsWord(selN)
        : sIn
          ? 'с ' + shortDate(sIn) + ' — выберите выезд'
          : '—',
      newTotal: selN ? fmt(newTotal) + '\u00a0€' : '—',
      diffText: !selN
        ? ''
        : selN !== nights
          ? '(' + selN + ' ' + nightsWord(selN) + ' вместо ' + nights + ')'
          : diff > 0
            ? '↓ экономия ' + fmt(diff) + '\u00a0€'
            : diff < 0
              ? '↑ дороже на ' + fmt(-diff) + '\u00a0€'
              : 'та же цена',
      diffBg: !selN || selN !== nights ? '#EEF5F1' : diff > 0 ? '#DFF0E4' : diff < 0 ? '#FBE3DE' : '#F4F1EA',
      diffColor: diff > 0 ? '#1F5F4A' : diff < 0 ? '#B3261E' : '#3E4B44',
      applyOff: !(sIn && sOut) || selBlocked,
      applyCal: () => {
        if (sIn && sOut && !selBlocked) this.setState({ in: iso(sIn), out: iso(sOut), cal: false, note: null });
      },
      p7: preset(7),
      p10: preset(10),
      p14: preset(14),
      p21: preset(21),
    };
    return {
      ...calVals,
      calRoomOn: !!st.calRoom,
      calRoomName: st.calRoomName || '',
      dateRange: range(checkin, checkout) + ' ' + checkin.getUTCFullYear(),
      nightsLabel,
      // Eglė meets its guests itself (data/transferPolicy) — nothing to sell here
      freeTr: transferBySanatorium(this.props.booking.booking.hotelId || 'egle-comfort')
        ? 'Трансфер аэропорт Вильнюса ⇄ санаторий организует сам санаторий «Эгле» — он включён в стоимость, отдельно заказывать не нужно.'
        : nights >= 10
          ? 'У вас ' +
            nightsLabel +
            ' — трансфер из аэропорта Вильнюса для вас бесплатный. Остальные направления — по тарифу.'
          : 'При заезде от 10 ночей трансфер из аэропорта Вильнюса — бесплатно (у вас ' + nightsLabel + ').',
      offers,
      about: EGLE_ABOUT,
      specs: EGLE_SPECIALIZATIONS,
      trCars: TRANSFER_CARS,
      times,
      specOpen: !!sec.spec,
      toggleSpec: secT('spec'),
      timeOpen: !!sec.time,
      toggleTime: secT('time'),
      foodOpen: !!sec.food,
      toggleFood: secT('food'),
      trOpen: !!sec.tr,
      toggleTr: secT('tr'),
      lightbox: !!this.state.lb,
      closeLb: () => this.setState({ lb: false }),
      pickAll: () => this.setState({ lb: true }),
      photoCount: EGLE_ALL_PHOTOS.length,
      allPhotos: EGLE_ALL_PHOTOS.map((p, k) => ({ ...p, n: k + 1 })),
      pick0: () => this.setState({ lb: true, i: 0 }),
      pick1: () => this.setState({ lb: true, i: 1 }),
      pick2: () => this.setState({ lb: true, i: 2 }),
      mainImg: EGLE_PHOTOS[i].src,
      mainAlt: EGLE_PHOTOS[i].alt,
      counter: i + 1 + ' из ' + n,
      prev: () => this.setState({ i: i - 1 }),
      next: () => this.setState({ i: i + 1 }),
      thumbs: EGLE_PHOTOS.map((p, k) => ({ ...p, cls: k === i ? 'on' : '', pick: () => this.setState({ i: k }) })),
    };
  }
}

export default function HotelPage() {
  usePageTitle('Санаторий Эгле Комфорт');
  const [v, logic] = usePageLogic(HotelLogic);
  return (
    <div className="page pg-hotel">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <MainNav />
          <PhoneLink />
        </HeaderBar>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '18px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Санатории</Link> → <Link to="/results">Друскининкай</Link> → Эгле Комфорт
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '32px' }}>Санаторий Эгле Комфорт</h1>
                <span style={{ color: '#8A6500', fontSize: '20px', letterSpacing: '1px' }} aria-label="4 звезды">
                  ★★★★
                </span>
              </div>
              <div className="fact" style={{ fontSize: '16px' }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </svg>
                Друскининкай · Eglės g. 1 · <Link to="/hotel#reviews">26 отзывов</Link>
              </div>
            </div>
            <Link className="btn btn-secondary" to="/results" style={{ minHeight: '48px', fontSize: '16px' }}>
              ← К результатам
            </Link>
          </div>
          {/* Gallery: ONE row, sizes decreasing left to right; click opens the full gallery */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={v.pick0}
              aria-label="Территория санатория"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '4 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Территория
              </span>
            </button>
            <button
              type="button"
              onClick={v.pick2}
              aria-label="Номер"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '2.2 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Номер
              </span>
            </button>
            <button
              type="button"
              onClick={v.pick1}
              aria-label="Бассейн"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '1.5 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/99a77311bc746e38e051bd1146cc0517.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Бассейн
              </span>
            </button>
            <button
              type="button"
              onClick={v.pickAll}
              aria-label="Все фото"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '1 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/d4cc2009f5e9b68736ab9f9a044668e5.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'rgba(28,38,32,.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '8px',
                  lineHeight: '1.2',
                }}
              >
                Все {v.photoCount} фото →
              </span>
            </button>
          </div>
          {/* Full gallery overlay: all photos large, scrollable */}
          {v.lightbox ? (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: '0',
                  zIndex: '50',
                  background: 'rgba(20,28,24,.96)',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: '0',
                    background: 'rgba(20,28,24,.96)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 24px',
                    borderBottom: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  <div style={{ color: '#fff', fontFamily: 'Lora,Georgia,serif', fontSize: '18px', fontWeight: '600' }}>
                    Санаторий Эгле Комфорт — все фото ({v.photoCount})
                  </div>
                  <button
                    type="button"
                    onClick={v.closeLb}
                    style={{
                      minHeight: '44px',
                      padding: '0 16px',
                      border: 'none',
                      background: '#fff',
                      color: '#1C2620',
                      fontWeight: '800',
                      fontSize: '16px',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    Закрыть ✕
                  </button>
                </div>
                <div
                  style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '20px 24px 60px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  {(v.allPhotos || []).map((p: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <figure style={{ margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <img
                          src={p.src}
                          alt={p.alt}
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '680px',
                            objectFit: 'cover',
                            display: 'block',
                            borderRadius: '2px',
                          }}
                        />
                        <figcaption style={{ color: '#D9E2DC', fontSize: '15px' }}>
                          {p.n}. {p.alt}
                        </figcaption>
                      </figure>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {/* Key facts strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              background: '#EEF5F1',
              border: '1px solid #C8DED3',
              borderRadius: '2px',
            }}
          >
            <div className="strip">
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
                style={{ flex: 'none' }}
              >
                <path d="M4 3h16v18H4zM12 3v18M8 10V7M16 10V7M8 14v3M16 14v3" />
              </svg>
              Всё в одном здании
            </div>
            <div className="strip">
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
                style={{ flex: 'none' }}
              >
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4" />
              </svg>
              Врач говорит по-русски
            </div>
            <div className="strip">
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
                style={{ flex: 'none' }}
              >
                <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8" />
              </svg>
              Питание 3 раза в день
            </div>
            <div className="strip">
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
                style={{ flex: 'none' }}
              >
                <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6" />
              </svg>
              Бассейн и сауны
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #E3DED2', flexWrap: 'wrap' }}>
            <Link className="tab on" to="/hotel#rooms">
              Номера и программы
            </Link>
            <Link className="tab" to="/hotel#treat">
              Лечение
            </Link>
            <Link className="tab" to="/hotel#food">
              Питание
            </Link>
            <Link className="tab" to="/hotel#about">
              О санатории
            </Link>
            <Link className="tab" to="/hotel#reviews">
              Отзывы (26)
            </Link>
          </nav>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'start' }}>
            <div style={{ flex: '1 1 100%', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#EEF5F1',
                  border: '2px solid #1F5F4A',
                  borderRadius: '2px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                    style={{ flex: 'none' }}
                  >
                    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#3E4B44',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                      }}
                    >
                      Ваши даты
                    </span>
                    <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '22px', lineHeight: '1.15' }}>
                      {v.dateRange}
                    </strong>
                  </div>
                  <span
                    style={{ fontSize: '17px', color: '#1C2620', paddingLeft: '14px', borderLeft: '1px solid #C8DED3' }}
                  >
                    {v.nightsLabel} · 2 взрослых
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.openCal}
                  style={{ minHeight: '50px', fontSize: '16px', padding: '0 20px' }}
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
                    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                  </svg>
                  Изменить даты · когда дешевле?
                </button>
              </div>
              <div id="rooms" style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px' }}>
                <h2 style={{ fontSize: '28px' }}>Выберите номер</h2>
                <div style={{ fontSize: '16px', color: '#3E4B44' }}>
                  Цена за весь заезд для двух гостей — с самой доступной программой. Программу можно улучшить внутри
                  карточки номера.
                </div>
              </div>
              {(v.offers || []).map((o: any, _i0: number) => (
                <Fragment key={_i0}>
                  <RoomCard o={o} nightsLabel={v.nightsLabel} />
                </Fragment>
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  color: '#3E4B44',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '10px 16px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8" />
                </svg>
                Процедуры назначает врач после консультации.
              </div>
              <button type="button" className="accrow" onClick={v.toggleTr}>
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
                    <path d="M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01" />
                  </svg>
                  Как добраться — трансфер от санатория
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
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.trOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '16px' }}>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        Из аэропорта Вильнюса — <strong>130 км</strong>
                      </span>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        В пути <strong>около 2 часов</strong>
                      </span>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
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
                        Также из Каунаса, Варшавы, Мариямполе
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '14px 18px 14px',
                        background: '#EDF4EF',
                        border: '1px solid #C8DED3',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '17px' }}>{v.freeTr}</div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#3E4B44' }}>Как проходит трансфер</div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
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
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Встретим с табличкой
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Водитель ждёт в зале прилёта с вашей фамилией
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
                          style={{ flex: 'none', marginTop: '30px' }}
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
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Поможем с багажом
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Чемоданы — в багажник, вам ничего нести не нужно
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
                          style={{ flex: 'none', marginTop: '30px' }}
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
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Довезём до санатория
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Остановки по пути — по вашей просьбе
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
                          style={{ flex: 'none', marginTop: '30px' }}
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
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Проводим до стойки
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Передадим администратору, обратно — так же
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#3E4B44',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          paddingTop: '4px',
                          borderTop: '1px solid #C8DED3',
                        }}
                      >
                        <span>
                          • <strong>Если рейс задерживается</strong> — следим по номеру и ждём без доплаты.
                        </span>
                        <span>
                          • <strong>Обратно</strong> — заберём из санатория за 3 часа до вылета, время подтвердим за
                          день.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              <button type="button" className="accrow" onClick={v.toggleTime}>
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
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2" />
                  </svg>
                  Время заезда и выезда
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
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.timeOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          background: '#EEF5F1',
                          border: '1px solid #C8DED3',
                          borderRadius: '2px',
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            flex: 'none',
                            background: '#fff',
                            border: '1px solid #C8DED3',
                            borderRadius: '2px',
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
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-5h4v5M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#3E4B44',
                              textTransform: 'uppercase',
                              letterSpacing: '.04em',
                            }}
                          >
                            Заезд
                          </span>
                          <span
                            style={{
                              fontFamily: 'Lora,Georgia,serif',
                              fontSize: '26px',
                              fontWeight: '600',
                              lineHeight: '1',
                              color: '#1C2620',
                            }}
                          >
                            с {v.times?.checkin}
                          </span>
                          <span style={{ fontSize: '14px', color: '#3E4B44' }}>{v.times?.checkinDate}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          background: '#F7F5F0',
                          border: '1px solid #E3DED2',
                          borderRadius: '2px',
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            flex: 'none',
                            background: '#fff',
                            border: '1px solid #E3DED2',
                            borderRadius: '2px',
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
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M10 17l5-5-5-5M15 12H3M21 3v18" />
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#3E4B44',
                              textTransform: 'uppercase',
                              letterSpacing: '.04em',
                            }}
                          >
                            Выезд
                          </span>
                          <span
                            style={{
                              fontFamily: 'Lora,Georgia,serif',
                              fontSize: '26px',
                              fontWeight: '600',
                              lineHeight: '1',
                              color: '#1C2620',
                            }}
                          >
                            до {v.times?.checkout}
                          </span>
                          <span style={{ fontSize: '14px', color: '#3E4B44' }}>{v.times?.checkoutDate}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(v.times?.notes || []).map((n: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <div className="ico" style={{ fontSize: '15px', color: '#3E4B44', alignItems: 'flex-start' }}>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ marginTop: '2px' }}
                            >
                              <path d={n.d} />
                            </svg>
                            <span>
                              <strong style={{ color: '#1C2620' }}>{n.t}</strong> — {n.s}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <button type="button" className="accrow" onClick={v.toggleSpec}>
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
                    <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                  </svg>
                  Специализации санатория
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
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.specOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                      {(v.specs || []).map((s: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              background: '#F7F5F0',
                              border: '1px solid #E3DED2',
                              borderRadius: '2px',
                              padding: '12px 14px',
                            }}
                          >
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                flex: 'none',
                                background: '#EEF5F1',
                                border: '1px solid #C8DED3',
                                borderRadius: '2px',
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
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d={s.d} />
                              </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '0' }}>
                              <strong style={{ fontSize: '16px', lineHeight: '1.25', color: '#1C2620' }}>{s.t}</strong>
                              <span style={{ fontSize: '14px', lineHeight: '1.35', color: '#3E4B44' }}>{s.s}</span>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#3E4B44' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none' }}
                      >
                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01" />
                      </svg>
                      При заезде врач проводит осмотр и подбирает процедуры под ваш профиль. Если сомневаетесь, подходит
                      ли санаторий, — позвоните нам, подскажем.
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <section
              style={{
                width: '100%',
                background: '#EEF5F1',
                border: '1px solid #C8DED3',
                borderRadius: '2px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
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
                  style={{ flex: 'none' }}
                >
                  <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px' }}>
                    Поможем выбрать программу
                  </strong>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                    Объясним условия, ответим на вопросы — на русском языке
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: '1 1 260px',
                  paddingLeft: '24px',
                  borderLeft: '1px solid #C8DED3',
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
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <a href="tel:+37060000000" style={{ fontWeight: '800', fontSize: '18px', textDecoration: 'none' }}>
                    +370&nbsp;600 00000
                  </a>
                  <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                    Ежедневно с 9:00 до 20:00 · <Link to="/rules">Условия оплаты и отмены</Link>
                  </span>
                </div>
              </div>
              <Link className="btn btn-secondary" to="/done" style={{ minHeight: '50px', fontSize: '16px' }}>
                Задать вопрос
              </Link>
            </section>
          </div>
        </div>
        <SiteFooter />
      </div>{' '}
      {/* "Когда дешевле?" — two-month range calendar with this sanatorium's prices; applying re-renders the page */}{' '}
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
                width: 'min(1040px,100%)',
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
                    Когда дешевле? Выберите даты
                  </h2>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                    {v.calHint} · Цены — за человека в сутки, программа «Миди»
                  </span>
                  {v.calRoomOn ? (
                    <>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#FFF6E3',
                          border: '1px solid #F0DDB8',
                          borderRadius: '2px',
                          padding: '6px 12px',
                          fontSize: '16px',
                          marginTop: '4px',
                        }}
                      >
                        Даты для номера<strong>«{v.calRoomName}»</strong>— заштрихованные дни заняты
                      </span>
                    </>
                  ) : null}
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
                      как сейчас
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
                        Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с
                        осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит
                        прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                      </div>
                    </details>
                  </div>
                </aside>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                {v.calNote ? <CalNotice text={v.calNote} onClose={v.calNoteClose} onAsk={v.calNoteAsk} /> : null}
                <div className="cal-cmp">
                  <div
                    style={{
                      background: '#F4F1EA',
                      borderRadius: '2px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span
                      className="lbl"
                      style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.04em' }}
                    >
                      Сейчас
                    </span>
                    <strong style={{ fontSize: '16px' }}>
                      {v.curRange} · {v.nightsLabel}
                    </strong>
                    <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                      «Миди», 2 взрослых — <strong style={{ color: '#1C2620' }}>{v.curTotal}&nbsp;€</strong>
                    </span>
                  </div>
                  <div
                    style={{
                      background: v.diffBg,
                      borderRadius: '2px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span
                      className="lbl"
                      style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.04em' }}
                    >
                      Новые даты
                    </span>
                    <strong style={{ fontSize: '16px' }}>{v.newRange}</strong>
                    <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                      «Миди», 2 взрослых — <strong style={{ color: '#1C2620' }}>{v.newTotal}</strong>{' '}
                      <strong style={{ color: v.diffColor }}>{v.diffText}</strong>
                    </span>
                  </div>
                </div>
                <div className="cal-btns">
                  <button type="button" className="btn btn-secondary" onClick={v.closeCal}>
                    Оставить {v.curRange}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.applyCal}
                    disabled={!!v.applyOff}
                    style={{ minHeight: '50px', fontSize: '18px', padding: '0 32px' }}
                  >
                    Применить новые даты
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
