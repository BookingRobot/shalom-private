import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GuestsPicker } from '../../components/GuestsPicker';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { MonthsCalendar, type CalendarCell } from '../../components/calendar/MonthsCalendar';
import { MONTHS, MONTHS_N, addD, daysBetween, iso, shortDate, toD } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { fmt } from '../../lib/format';
import { isSoldOutEverywhere } from '../../data/availability';
import { isFlightDay } from '../../data/flights';
import { ICON_PATHS } from '../../data/iconPaths';
import { awardsOf } from '../../data/awards';
import { BUILDING_ICON, CAR_ICON, FILTER_GROUPS } from '../../data/filters';
import { BUSY_LOOK, FREE_LOOK, freeFrom, overlaps, roomDayBusy } from '../../data/roomAvailability';
import { api } from '../../api';
import { RoomCard } from '../../components/RoomCard';
import { PriceBox } from '../../components/PriceBox';
import { ChooseWizard } from '../../components/ChooseWizard';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import { Compare, useCompareLimit } from '../../components/Compare';
import { FlightToggle } from '../../components/FlightToggle';
import { guestsLabel } from '../../lib/orderSummary';
import { eur, placePrice, quote } from '../../lib/pricing';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './ResultsPage.css';

const HELP_CTX: HelpContextInfo = { dest: 'druskininkai', in: '2026-11-09', out: '2026-11-18' };

class ResultsLogic extends PageLogic {
  /** 3 on a laptop, 2 on a phone — set by the page component */
  cmpLimit = 3;
  constructor(props: PageServices) {
    super(props);
    const b = props.booking.booking;
    this.state = {
      checkin: b.checkin,
      nights: daysBetween(toD(b.checkin), toD(b.checkout)),
      sort: 'pop',
      open: { 'egle-comfort': true },
      det: {},
      sec: {},
      f: { daily: true, doctor: true },
      pf: { daily: true, doctor: true },
      more: false,
      pr: {},
      wz: typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('wizard'),
    };
    // came from the name search on the home page: open that sanatorium's rooms
    const hq = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('h') : null;
    if (hq) this.state.open = { [hq]: true };
  }
  syncBooking(st) {
    return st.checkin ? { checkin: st.checkin, checkout: iso(addD(toD(st.checkin), st.nights || 9)) } : null;
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const GQ = { adults: this.props.booking.booking.adults, children: this.props.booking.booking.children };
    const { booking } = this.props.booking;
    const {
      sanatoriums: SANATORIUMS,
      roomSets: ROOM_SETS,
      extraPrograms: EXTRA_PROGRAMS,
    } = api.searchSanatoriums({
      dest: booking.dest,
      checkin: booking.checkin,
      nights: daysBetween(toD(booking.checkin), toD(booking.checkout)),
      adults: booking.adults,
    });

    // Знаки отличия — только конкретные, проверяемые факты [ПОДТВЕРДИТЬ ПО САНАТОРИЯМ]
    const st = this.state;
    const f = st.f || {};
    const sel = Object.keys(f).filter((k) => f[k]);
    const plural = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'санаторий'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'санатория'
          : 'санаториев';
    const labelOf = (k) => {
      if (k === 'pmin') return 'от ' + pr.min + '\u00a0€';
      if (k === 'pmax') return 'до ' + pr.max + '\u00a0€';
      for (const g of Object.values(FILTER_GROUPS)) {
        const hit = g.find((x) => x[0] === k);
        if (hit) return hit[1];
      }
      return k;
    };
    const has = (h, k) =>
      k === 's3'
        ? h.starsN === 3
        : k === 's4'
          ? h.starsN === 4
          : k === 's5'
            ? h.starsN === 5
            : k === 'shower'
              ? h.tags.includes('lift')
              : h.tags.includes(k);
    const NIGHTS = st.nights || 9,
      PERSONS = 2;
    const ppnOf = (h) => Math.round(h.price / 2); // per person, double room, for the stay
    // Applied filters (f, pr) drive the list; pending ones (pf, ppr) are edited in the panel and applied with the button
    const pr = st.pr || {};
    const pf = st.pf || f;
    const ppr = st.ppr || pr;
    const passWith = (F, P) => {
      const S = Object.keys(F).filter((k) => F[k]);
      const starS = S.filter((k) => k[0] === 's' && k.length === 2),
        otherS = S.filter((k) => !(k[0] === 's' && k.length === 2));
      return (h) =>
        (starS.length === 0 || starS.some((k) => has(h, k))) &&
        otherS.every((k) => has(h, k)) &&
        (!P.min || ppnOf(h) >= P.min) &&
        (!P.max || ppnOf(h) <= P.max);
    };
    const pass = passWith(f, pr);
    const passPending = passWith(pf, ppr);
    const pendingN = SANATORIUMS.filter(passPending).length;
    const pendingCount = Object.keys(pf).filter((k) => pf[k]).length + (ppr.min ? 1 : 0) + (ppr.max ? 1 : 0);
    const mk = (pairs) =>
      pairs.map(([k, t, d]) => ({
        k,
        t,
        d,
        on: !!pf[k],
        cls: pf[k] ? 'on' : '',
        n: SANATORIUMS.filter((h) => has(h, k) && passWith({ ...pf, [k]: false }, ppr)(h)).length,
        toggle: () => this.setState({ pf: { ...pf, [k]: !pf[k] } }),
      }));
    // one-of groups (meals, procedures per day): picking one clears the others; applied with the panel button
    const mkOne = (pairs) => {
      const keys = pairs.map((x) => x[0]);
      const cur = keys.find((k) => pf[k]) || '';
      const setOne = (k) => () => {
        const npf = { ...pf };
        keys.forEach((x) => (npf[x] = false));
        if (k && k !== cur) npf[k] = true;
        this.setState({ pf: npf });
      };
      return [{ k: '', t: 'Любое', on: !cur, pick: setOne('') }].concat(
        pairs.map(([k, t]) => ({ k, t, on: cur === k, pick: setOne(k) })),
      );
    };
    // room features: several at once
    const mkNow = (pairs) =>
      pairs.map(([k, t, d]) => ({
        k,
        t,
        d,
        on: !!pf[k],
        pick: () => this.setState({ pf: { ...pf, [k]: !pf[k] } }),
      }));

    const sort = st.sort || 'pop';
    const list = SANATORIUMS.filter(pass).sort((a, b) =>
      sort === 'cheap' ? a.price - b.price : sort === 'exp' ? b.price - a.price : a.pop - b.pop,
    );
    const open = st.open || {},
      det = st.det || {},
      sec = st.sec || {};
    const secT = (id, s) => () => this.setState({ sec: { ...sec, [id + s]: !sec[id + s] } });
    const ADV_RATE = 0.04; // минимальный аванс — 4 % от суммы бронирования
    const toNum = (s) => Number(String(s).replace(/\s/g, ''));
    const ppn = (total) => Math.round(toNum(total) / NIGHTS / PERSONS);
    // ---- Dates & price calendar ("Когда дешевле?") ----
    const range = (d) => {
      const e = addD(d, NIGHTS);
      return d.getUTCMonth() === e.getUTCMonth()
        ? d.getUTCDate() + '–' + e.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]
        : shortDate(d) + ' – ' + shortDate(e);
    };
    const BASE_IN = toD('2026-11-09');
    const checkin = toD(st.checkin || '2026-11-09');
    const dayIdx = (d) => daysBetween(BASE_IN, d);
    // Seasonal/weekday factor; normalised so the original price holds on the original dates
    const G = (h, d) => {
      const n = dayIdx(d),
        wd = d.getUTCDay();
      return (
        1 +
        0.11 * Math.sin(n * 0.55 + h.pop * 1.1) +
        (wd === 5 || wd === 6 ? 0.07 : 0) +
        (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
      );
    };
    const soldOut = (h, d) => (dayIdx(d) * 7 + h.pop * 3) % 23 === 0;
    const stayFactor = (h, d) => ((G(h, d) / G(h, BASE_IN)) * NIGHTS) / 9;
    const totalFor = (h, d, base) => Math.round(base * stayFactor(h, d));
    const ppnFor = (h, d, base) => Math.round(totalFor(h, d, base) / NIGHTS / PERSONS);
    const dateRange = range(checkin) + ' ' + checkin.getUTCFullYear();
    const checkinISO = iso(checkin),
      checkoutISO = iso(addD(checkin, NIGHTS));
    // ---- Room-first model: each room is sold with the cheapest programme; other programmes are upgrades ----
    const pf1 = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'процедура'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'процедуры'
          : 'процедур';
    const valueOf = (p, roomName, area) => {
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
                ? nProc * NIGHTS + ' ' + pf1(nProc * NIGHTS) + ' за весь заезд · по назначению врача'
                : 'по назначению врача',
            }
          : { d: ICON_PATHS.proc, big: '✓', label: 'процедуры каждый день', sub: 'по назначению врача' },
        /массаж/i.test(progT)
          ? { d: ICON_PATHS.massage, big: String(NIGHTS), label: 'массажей', sub: 'классический массаж каждый день' }
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
          ? {
              d: ICON_PATHS.pool,
              big: '∞',
              label: /много/i.test(progT) ? 'бассейны и бани' : 'бассейны и сауны',
              sub: 'каждый день, без ограничений',
            }
          : null,
        {
          d: ICON_PATHS.bed2,
          big: String(NIGHTS),
          label: 'ночей в номере',
          sub: roomName + (area ? ' · ' + area : ''),
        },
      ].filter(Boolean);
    };
    // Room sets per sanatorium [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]
    // Room types fully booked on some dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]: [from, to) per room
    const roomsOf = (h0, _h, sf) => {
      const scale = (x) => Math.round(toNum(x) * sf);
      let progs = h0.offers.map((o) => ({
        ...o,
        priceN: scale(o.price),
        meals: o.prog.some((x) => /питани/i.test(x.t)) ? 'питание 3 раза' : '',
      }));
      if (EXTRA_PROGRAMS[h0.id]) {
        const e = EXTRA_PROGRAMS[h0.id];
        progs.push({ ...e, priceN: scale(e.price), meals: 'полный пансион' });
      } else
        progs.push({
          ...progs[0],
          n: 9,
          title: 'Расширенная программа — +2 процедуры в день',
          priceN: Math.round(progs[0].priceN * 1.1),
          details:
            progs[0].details + '\n\nРасширенная программа: две дополнительные процедуры в день по назначению врача.',
        });
      progs.sort((a, b) => a.priceN - b.priceN);
      const base = h0.offers[0];
      const set = ROOM_SETS[h0.id] || [
        { id: 'std', room: base.room, add: 0, img: base.img },
        { id: 'plus', room: 'Улучшенный номер', add: Math.round(toNum(base.price) * 0.08), img: '' },
      ];
      return set.map((r, ri) => {
        const addN = Math.round(r.add * sf),
          cheapest = progs[0].priceN + addN;
        const adv = Math.ceil(cheapest * ADV_RATE);
        return {
          ...base,
          n: ri + 1,
          id: r.id,
          room: r.room,
          img: r.img || base.img || h0.img,
          amen: r.amen || base.amen,
          roomText: r.roomText || base.roomText,
          addN,
          progs,
          title: progs[0].title,
          prog: progs[0].prog,
          details: progs[0].details,
          price: fmt(cheapest),
          old: '',
          adv,
          rest: fmt(cheapest - adv),
        };
      });
    };
    const cmp: string[] = st.cmp || [];
    const cmpLimit = this.cmpLimit || 3;
    const hotels = list.map((h0) => {
      const sf = stayFactor(h0, checkin);
      const h = {
        ...h0,
        trNote: h0.trNote.replace('{nights}', String(st.nights || 9)),
        price: Math.round(h0.price * sf),
        offers: h0.offers.map((o) => ({
          ...o,
          price: fmt(Math.round(toNum(o.price) * sf)),
          old: o.old ? fmt(Math.round(toNum(o.old) * sf)) : '',
          adv: Math.ceil(Math.round(toNum(o.price) * sf) * ADV_RATE),
          rest: fmt(Math.round(toNum(o.price) * sf) - Math.ceil(Math.round(toNum(o.price) * sf) * ADV_RATE)),
        })),
      };
      const isOpen = !!open[h.id];
      const aw = awardsOf[h.id] || [];
      return {
        ...h,
        openCal: () =>
          this.setState({
            cal: { id: h.id, picked: iso(checkin), month: checkin.getUTCMonth(), year: checkin.getUTCFullYear() },
          }),
        stars: '★'.repeat(h.starsN),
        awards: aw,
        hasAwards: aw.length > 0,
        ppn: ppn(h.price),
        advMin: Math.min(...h.offers.map((o) => o.adv)),
        price: fmt(h.price),
        procT: h.inc[0],
        procSub: /в день|ежедневно/.test(h.inc[0])
          ? 'лечебные процедуры по назначению врача, каждый день'
          : 'лечебные процедуры по назначению врача',
        incRest: h.inc.slice(1).map((t) => ({
          t,
          d: /питани/i.test(t)
            ? ICON_PATHS.meals
            : /говорит/i.test(t)
              ? 'M4 4h16v12H7l-3 3zM8 9h8M8 12h5'
              : /врач/i.test(t)
                ? ICON_PATHS.doctor
                : /бассейн/i.test(t)
                  ? ICON_PATHS.pool
                  : /процедур/i.test(t)
                    ? ICON_PATHS.proc
                    : /процедур|лечени/i.test(t)
                      ? ICON_PATHS.proc
                      : /номер/i.test(t)
                        ? ICON_PATHS.bed2
                        : 'm5 12 5 5L20 7',
        })),
        open: isOpen,
        border: isOpen ? '#1F5F4A' : '#E3DED2',
        btnLabel: isOpen ? 'Скрыть варианты' : 'Номера и программы',
        chips: [
          h.tags.includes('doctor') ? { t: 'Врач включён', d: ICON_PATHS.doctor } : null,
          h.tags.includes('pool')
            ? {
                t: /много бассейнов|бани/i.test(h.inc.join(' ')) ? 'Бассейны и бани' : 'Бассейн и сауны',
                d: ICON_PATHS.pool,
              }
            : null,
          h.tags.includes('meals3') ? { t: 'Питание 3 раза', d: ICON_PATHS.meals } : null,
          h.tags.includes('samebld')
            ? { t: 'Всё в одном здании', d: BUILDING_ICON }
            : h.tags.includes('transfer')
              ? { t: 'Трансфер из аэропорта', d: CAR_ICON }
              : null,
        ].filter(Boolean),
        chev: isOpen ? 'rotate(180deg)' : 'none',
        btnCls: isOpen ? 'btn-secondary' : 'btn-primary',
        toggle: () => this.setState({ open: { ...open, [h.id]: !isOpen } }),
        cmpOn: cmp.includes(h.id),
        cmpOff: !cmp.includes(h.id) && cmp.length >= cmpLimit,
        cmpToggle: () =>
          this.setState({
            cmp: cmp.includes(h.id) ? cmp.filter((x) => x !== h.id) : cmp.concat(h.id).slice(-cmpLimit),
          }),
        specOpen: !!sec[h.id + 'spec'],
        toggleSpec: secT(h.id, 'spec'),
        timeOpen: !!sec[h.id + 'time'],
        toggleTime: secT(h.id, 'time'),
        trOpen: !!sec[h.id + 'tr'],
        toggleTr: secT(h.id, 'tr'),
        offers: roomsOf(h0, h, sf).map((r) => {
          const o = r;
          const key = h.id + '-' + o.n;
          const dOpen = !!det[key];
          const area = (o.amen.find((a) => /м²/.test(a.t)) || {}).t;
          const beds = o.amen.find((a) => /кроват/i.test(a.t));
          const extra = o.amen.find((a) => /Балкон|Кондиционер|Ванна/.test(a.t));
          const amenTop = [
            { d: ICON_PATHS.bed2, t: o.room + (area ? ' · ' + area : '') },
            beds
              ? {
                  d: beds.d,
                  t: beds.t.replace('2 односпальные кровати', '2 отдельные кровати') + (extra ? ' · ' + extra.t : ''),
                }
              : null,
          ].filter(Boolean);
          const parts = String(o.title).split(' — ');
          const short = parts[0];
          const progT = o.prog.map((p) => p.t).join(' ');
          const sub =
            'с программой ' +
            short.replace('Программа ', '') +
            (parts[1] ? ' · ' + parts[1] : '') +
            (/питани/i.test(progT) ? ' · питание 3 раза' : '');
          // programmes for this room, cheapest first; selection drives the details below
          const ps = st.ps || {};
          const selI = ps[key] ?? 0;
          const progs = r.progs;
          const sp = progs[selI] || progs[0];
          const progRows = progs.map((p, pi) => {
            const on = pi === selI,
              pp = p.title.split(' — ');
            return {
              name: pp[0],
              sub: (pp[1] || '') + (p.meals ? ' · ' + p.meals : ''),
              price: eur(quote(p.priceN + r.addN, GQ, this.props.booking.booking.flightPackage).perPerson) + ' / чел.',
              diff:
                pi === 0
                  ? 'самая доступная'
                  : '+' + eur(placePrice(p.priceN, GQ) - placePrice(progs[0].priceN, GQ)) + ' с человека',
              diffColor: pi === 0 ? '#1F5F4A' : '#3E4B44',
              border: on ? '#1F5F4A' : '#CFC9BB',
              bg: on ? '#EEF5F1' : '#fff',
              dot: on ? '#1F5F4A' : 'transparent',
              pick: () => this.setState({ ps: { ...ps, [key]: pi } }),
            };
          });
          const spVal = valueOf(sp, o.room, area);
          const spLines = String(sp.details)
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              t: l.replace(/^— ?/, '• '),
              fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
              pl: /^—/.test(l) ? '14px' : '0',
              mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
            }));
          const rkey = h.id + ':' + r.id,
            checkout = addD(checkin, NIGHTS);
          const busy = overlaps(rkey, checkin, checkout);
          const p0 = progs[0].title.split(' — ');
          return {
            ...o,
            short: o.room,
            sub,
            value: spVal,
            detLines: spLines,
            prog: sp.prog,
            amenTop,
            progRows,
            ...(busy ? BUSY_LOOK : FREE_LOOK),
            busy,
            avail: !busy,
            busyRange: range(checkin),
            nextFree: freeFrom(rkey),
            pill: busy
              ? 'Нет мест на ваши даты'
              : r.addN
                ? 'Номер +' + eur(placePrice(r.addN, GQ)) + ' с человека'
                : 'Включён в цену программы',
            roomLine: (o.amen || [])
              .slice(0, 3)
              .map((a) => a.t)
              .join(' · '),
            progLine:
              'с программой ' +
              p0[0].replace('Программа ', '') +
              (p0[1] ? ' · ' + p0[1] : '') +
              ' · ' +
              (progs[0].meals || 'питание 3 раза'),
            choose: () => this.props.booking.update({ hotelId: h.id, roomId: r.id }),
            // same calendar as the search band, with this room's busy nights closed
            openRoomCal: () =>
              this.setState({
                sOpen: true,
                sRoom: { key: rkey, name: r.room, hotel: h.name },
                ss: { in: null, out: null },
                sm: checkin.getUTCMonth(),
                sy: checkin.getUTCFullYear(),
              }),
            selName: sp.title.split(' — ')[0],
            selPrice: eur(quote(sp.priceN + r.addN, GQ, this.props.booking.booking.flightPackage).total),
            addLabel: r.addN ? 'номер +' + fmt(r.addN) + '\u00a0€ к базовому' : 'с самой доступной программой',
            detBtn: 'Программы и что входит (' + progs.length + ')',
            detChev: dOpen ? 'rotate(180deg)' : 'none',
            noImg: !o.img,
            ppn: ppn(o.price),
            oldPpn: o.old ? ppn(o.old) : '',
            detOpen: dOpen,
            detLabel: dOpen ? 'Всё понятно, можно убрать' : 'Подробнее. Что сюда входит?',
            toggleDet: () => this.setState({ det: { ...det, [key]: !dOpen } }),
          };
        }),
      };
    });
    // calendar modal values
    const calH = st.cal ? SANATORIUMS.find((h) => h.id === st.cal.id) : null;
    let cal: Record<string, any> = { cells: [] };
    if (calH) {
      const base = toNum(calH.offers[0].price);
      const picked = toD(st.cal.picked || iso(checkin));
      const m0 = st.cal.month ?? checkin.getUTCMonth(),
        y0 = st.cal.year ?? checkin.getUTCFullYear();
      const first = new Date(Date.UTC(y0, m0, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y0, m0 + 1, 0)).getUTCDate();
      const curP = ppnFor(calH, checkin, base);
      const cells: CalendarCell[] = [];
      for (let i = 0; i < lead; i++)
        cells.push({
          day: '',
          fly: false,
          text: '',
          sub: '',
          bg: '#fff',
          border: '#F0EDE6',
          color: '#1C2620',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y0, m0, d));
        const past = date < TODAY;
        const so =
          soldOut(calH, date) ||
          (st.cal.roomKey
            ? roomDayBusy(st.cal.roomKey, date) ||
              roomDayBusy(st.cal.roomKey, addD(date, NIGHTS - 1)) ||
              overlaps(st.cal.roomKey, date, addD(date, NIGHTS))
            : false);
        const p = ppnFor(calH, date, base);
        const isCur = iso(date) === iso(checkin),
          isPick = iso(date) === iso(picked);
        const r = p / curP;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.03 ? '#FFF6E3' : '#FCEDE9';
        if (so || past) bg = '#E8E6E1';
        cells.push({
          day: d,
          fly: isFlightDay(date) && !past,
          text: so || past ? (past ? '' : 'Нет мест') : p + '\u00a0€',
          sub: isPick ? '✓ Новый заезд' : isCur ? 'Ваш заезд' : '',
          bg,
          border: isPick ? '#1F5F4A' : isCur ? '#1C2620' : 'transparent',
          color: isPick ? '#1F5F4A' : '#1C2620',
          off: so || past,
          cursor: so || past ? 'not-allowed' : 'pointer',
          aria: d + ' ' + MONTHS[m0] + (so ? ', нет мест' : ', ' + p + '\u00a0€ за человека в сутки'),
          pick: () => this.setState({ cal: { ...st.cal, picked: iso(date) } }),
        });
      }
      const newTotal = totalFor(calH, picked, base),
        curTotal = totalFor(calH, checkin, base),
        diff = curTotal - newTotal;
      const off1 = calH.offers[0];
      cal = {
        hotelName: calH.name,
        room: st.cal.roomName || off1.room,
        prog: off1.title.replace(/ — .*$/, ''),
        curPpn: curP,
        monthTitle: MONTHS_N[m0] + ' ' + y0,
        cells,
        newIn: shortDate(picked),
        newOut: shortDate(addD(picked, NIGHTS)),
        newPpn: ppnFor(calH, picked, base),
        newTotal: fmt(newTotal),
        curTotal: fmt(curTotal),
        newRange: range(picked),
        diffText:
          diff > 0
            ? '↓ Экономия за поездку: ' + fmt(diff) + '\u00a0€'
            : diff < 0
              ? '↑ Дороже на ' + fmt(-diff) + '\u00a0€'
              : 'Та же цена, что и на ваши даты',
        diffBg: diff > 0 ? '#DFF0E4' : diff < 0 ? '#FBE3DE' : '#F4F1EA',
        diffColor: diff > 0 ? '#1F5F4A' : diff < 0 ? '#B3261E' : '#3E4B44',
      };
    }
    const calVals = {
      calOpen: !!calH,
      cal,
      curRange: range(checkin),
      dateRange,
      checkinISO,
      checkoutISO,
      calClose: () => this.setState({ cal: null }),
      calPrev: () => {
        const m = (st.cal.month ?? checkin.getUTCMonth()) - 1,
          y = st.cal.year ?? checkin.getUTCFullYear();
        this.setState({ cal: { ...st.cal, month: (m + 12) % 12, year: m < 0 ? y - 1 : y } });
      },
      calNext: () => {
        const m = (st.cal.month ?? checkin.getUTCMonth()) + 1,
          y = st.cal.year ?? checkin.getUTCFullYear();
        this.setState({ cal: { ...st.cal, month: m % 12, year: m > 11 ? y + 1 : y } });
      },
      calApply: () => this.setState({ checkin: st.cal.picked || iso(checkin), cal: null }),
    };
    // ---- Search picker: same two-month range calendar as on the home page ----
    const nW = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'ночь'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'ночи'
          : 'ночей';
    const checkout = addD(checkin, NIGHTS);
    const longD = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    const ss = st.ss || { in: iso(checkin), out: iso(checkout) };
    const sIn = ss.in ? toD(ss.in) : null,
      sOut = ss.out ? toD(ss.out) : null;
    const sm0 = st.sm ?? checkin.getUTCMonth(),
      sy0 = st.sy ?? checkin.getUTCFullYear();
    const AVG = 100;
    const avgPpn = (d) => {
      const n = daysBetween(TODAY, d),
        wd = d.getUTCDay(),
        m = d.getUTCMonth();
      return Math.round(
        AVG *
          (1 +
            0.12 * Math.sin(n * 0.42) +
            (wd === 5 || wd === 6 ? 0.06 : 0) +
            (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
            (m >= 5 && m <= 7 ? 0.15 : 0) +
            (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
      );
    };
    const sRoom = st.sOpen && st.sRoom ? st.sRoom : null;
    const sPick = (date) => () => {
      const k = iso(date);
      if (!ss.in || (ss.in && ss.out)) this.setState({ ss: { in: k, out: null } });
      else if (date > toD(ss.in) && !(sRoom && overlaps(sRoom.key, toD(ss.in), date)))
        this.setState({ ss: { in: ss.in, out: k } });
      else this.setState({ ss: { in: k, out: null } });
    };
    const sCells = (y, m) => {
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
        const full = !past && isSoldOutEverywhere(iso(date));
        const rBusy = !past && !full && !!sRoom && roomDayBusy(sRoom.key, date); // this room is taken that night
        /* [ПРИМЕР] нет мест ни в одном объекте */ const p = avgPpn(date),
          r = p / AVG;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9',
          color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut),
          between = sIn && sOut && date > sIn && date < sOut;
        if (past) {
          bg = '#E8E6E1';
          color = '#9AA39E';
          subColor = '#9AA39E';
        }
        if (full || rBusy) {
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
          sub: past ? '' : full ? 'нет мест' : rBusy ? 'занят' : isIn ? 'заезд' : isOut ? 'выезд' : p + '\u00a0€',
          bg,
          border,
          color,
          subColor,
          off: past || full || rBusy,
          cursor: past || full || rBusy ? 'not-allowed' : 'pointer',
          aria:
            d +
            ' ' +
            MONTHS[m] +
            (past ? ', недоступно' : rBusy ? ', номер занят' : ', около ' + p + ' € за человека в сутки'),
          pick: sPick(date),
        });
      }
      return cells;
    };
    const sN = sIn && sOut ? daysBetween(sIn, sOut) : 0;
    const sPreset = (n) => () => {
      const a = sIn || checkin;
      this.setState({ ss: { in: iso(a), out: iso(addD(a, n)) } });
    };
    const searchVals = {
      nightsLabel: NIGHTS + ' ' + nW(NIGHTS),
      sInLabel: longD(checkin),
      sOutLabel: longD(checkout),
      sCalOpen: !!st.sOpen,
      sOpenCal: () =>
        this.setState({
          sOpen: true,
          sRoom: null,
          ss: { in: iso(checkin), out: iso(checkout) },
          sm: checkin.getUTCMonth(),
          sy: checkin.getUTCFullYear(),
        }),
      sCloseCal: () => this.setState({ sOpen: false, sRoom: null }),
      sFlex: !!st.sFlex,
      setSFlex: (sFlex) => this.setState({ sFlex }),
      // a recommended option is the choice: apply the dates and show the list
      sFlexPick: (a, b) => {
        this.setState({ checkin: a, nights: daysBetween(toD(a), toD(b)), sOpen: false, sFlex: false, sRoom: null });
      },
      sCalTitle: sRoom ? 'Свободные даты номера' : 'Выберите даты поездки',
      sRoomLine: sRoom ? sRoom.name + ' · ' + sRoom.hotel + ' — занятые дни закрыты' : '',
      sCalPrev: () => {
        const m = sm0 - 1;
        this.setState({ sm: (m + 12) % 12, sy: m < 0 ? sy0 - 1 : sy0 });
      },
      sCalNext: () => {
        const m = sm0 + 1;
        this.setState({ sm: m % 12, sy: m > 11 ? sy0 + 1 : sy0 });
      },
      sMonths: [{ title: MONTHS_N[sm0] + ' ' + sy0, cells: sCells(sy0, sm0) }],
      sCalHint:
        st.sFlex && !sRoom
          ? 'Выберите месяц и сколько ночей — подберём лучшие даты с рейсами'
          : !sIn
            ? 'Нажмите день заезда'
            : !sOut
              ? 'Теперь нажмите день выезда'
              : 'Можно поменять: нажмите новый день заезда',
      sSelIn: sIn ? shortDate(sIn) : '—',
      sSelOut: sOut ? shortDate(sOut) : '—',
      sSelNights: sN ? sN + ' ' + nW(sN) : '—',
      sApplyOff: !sN,
      sApplyCal: () => {
        if (sN && sIn) this.setState({ checkin: iso(sIn), nights: sN, sOpen: false, sRoom: null });
      },
      sP7: sPreset(7),
      sP10: sPreset(10),
      sP14: sPreset(14),
      sP21: sPreset(21),
    };
    return {
      ...calVals,
      ...searchVals,
      // Not available on the chosen dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]
      soldHotels: [
        {
          name: 'Санаторий Упа',
          stars: '★★★',
          sub: 'Друскининкай · у парка Вийя',
          img: '/img/79c9318ba02a718e29de4346c9642a33.jpg',
          next: 'с 23 ноября',
        },
        {
          name: 'SPA Vilnius Друскининкай',
          stars: '★★★★',
          sub: 'Друскининкай · у реки Неман',
          img: '/img/30b3b315653c1dbc711827ceb6c48ebe.jpg',
          next: 'с 1 декабря',
        },
      ].map((u) => ({
        ...u,
        chips: [
          { t: 'Врач включён', d: ICON_PATHS.doctor },
          { t: 'Бассейн и сауны', d: ICON_PATHS.pool },
          { t: 'Питание 3 раза', d: ICON_PATHS.meals },
        ],
        notify: () => this.props.help.open(),
      })),
      soldCount: '2 санатория',
      wzOpen: !!st.wz,
      wzOpenFn: () => this.setState({ wz: true }),
      wzClose: () => this.setState({ wz: false }),
      wzShow: ({ filters, hotelId }) => {
        this.setState({
          f: { ...filters },
          pf: { ...filters },
          pr: {},
          ppr: {},
          open: { ...open, [hotelId]: true },
          wz: false,
        });
        setTimeout(
          () => document.getElementById('h-' + hotelId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          60,
        );
      },
      cmpLimit,
      cmpIds: cmp,
      cmpHotels: hotels,
      cmpRemove: (id) => this.setState({ cmp: cmp.filter((x) => x !== id) }),
      cmpClear: () => this.setState({ cmp: [] }),
      guestsLine: guestsLabel(booking) + (booking.flightPackage ? ' · с перелётом из Тель-Авива' : ''),
      hotels,
      none: hotels.length === 0,
      some: hotels.length > 0,
      foundLabel:
        hotels.length === SANATORIUMS.length
          ? 'Все ' + SANATORIUMS.length + ' ' + plural(SANATORIUMS.length)
          : 'Подходят ' + hotels.length + ' из ' + SANATORIUMS.length + ' ' + plural(SANATORIUMS.length),
      hasActive: sel.length > 0 || !!pr.min || !!pr.max,
      active: sel.concat(pr.min ? ['pmin'] : [], pr.max ? ['pmax'] : []).map((k) => ({
        t: labelOf(k),
        off: () => {
          if (k === 'pmin' || k === 'pmax') {
            const key = k === 'pmin' ? 'min' : 'max';
            const np = { ...pr, [key]: 0 };
            this.setState({ pr: np, ppr: { ...ppr, [key]: 0 } });
          } else this.setState({ f: { ...f, [k]: false }, pf: { ...pf, [k]: false } });
        },
      })),
      fTop: mk(FILTER_GROUPS.imp),
      fComfort: mk(FILTER_GROUPS.comfort),
      fStars: mk(FILTER_GROUPS.stars),
      fProfile: mk(FILTER_GROUPS.prof),
      fBeds: mk(FILTER_GROUPS.beds),
      fMeals: mkOne(FILTER_GROUPS.meals),
      fProcs: mkOne(FILTER_GROUPS.procs),
      fRoom: mkNow(FILTER_GROUPS.room),
      moreOpen: !!st.more,
      moreClosed: !st.more,
      toggleMore: () => this.setState({ more: !st.more }),
      // The whole filter block is collapsed by default so the list starts higher on a laptop
      fOpen: !!st.fo,
      fClosed: !st.fo,
      openF: () => this.setState({ fo: true, pf: { ...f }, ppr: { ...pr } }),
      closeF: () => this.setState({ fo: false, more: false, pf: { ...f }, ppr: { ...pr } }),
      appliedSummary:
        sel.length === 0 && !pr.min && !pr.max
          ? 'Условия не выбраны — показаны все санатории'
          : 'Выбрано: ' +
            sel
              .concat(pr.min ? ['pmin'] : [], pr.max ? ['pmax'] : [])
              .map(labelOf)
              .join(', '),
      pMin: ppr.min || '',
      pMax: ppr.max || '',
      setMin: (e) => this.setState({ ppr: { ...ppr, min: Number(e.target.value) || 0 } }),
      setMax: (e) => this.setState({ ppr: { ...ppr, max: Number(e.target.value) || 0 } }),
      pendCount:
        pendingCount === 0
          ? 'Условия не выбраны'
          : 'Выбрано ' +
            pendingCount +
            ' ' +
            (pendingCount === 1 ? 'условие' : pendingCount < 5 ? 'условия' : 'условий'),
      applyLabel: pendingN === 0 ? 'Ничего не подходит' : 'Показать ' + pendingN + ' ' + plural(pendingN),
      apply: () => this.setState({ f: { ...pf }, pr: { ...ppr }, more: false, fo: false }),
      clearPending: () => this.setState({ pf: {}, ppr: {} }),
      reset: () => this.setState({ f: {}, pf: {}, pr: {}, ppr: {} }),
      sort,
      setSort: (e) => this.setState({ sort: e.target.value }),
      popCls: sort === 'pop' ? 'on' : '',
      cheapCls: sort === 'cheap' ? 'on' : '',
      expCls: sort === 'exp' ? 'on' : '',
      sortPop: () => this.setState({ sort: 'pop' }),
      sortCheap: () => this.setState({ sort: 'cheap' }),
      sortExp: () => this.setState({ sort: 'exp' }),
    };
  }
}

export default function ResultsPage() {
  usePageTitle('Санатории Друскининкая');
  const [v, logic] = usePageLogic(ResultsLogic);
  logic.cmpLimit = useCompareLimit();
  useEffect(() => {
    const hq = new URLSearchParams(window.location.search).get('h');
    if (!hq) return;
    const t = setTimeout(() => {
      const el = document.getElementById('h-' + hq) || document.getElementById('sold');
      el?.scrollIntoView({ block: 'start' });
    }, 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="page pg-results">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <MainNav active="resorts" />
          <PhoneLink />
        </HeaderBar>
        {/* Search band: same picker as on the home page */}
        <section style={{ background: '#1F5F4A' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '16px 24px 18px' }}>
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
                boxShadow: '0 6px 18px rgba(0,0,0,.15)',
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
                    <select id="city" className="input sinput">
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
                    <button type="button" id="datein" className="input sinput datebtn" onClick={v.sOpenCal}>
                      {v.sInLabel}
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
                    <button type="button" id="dateout" className="input sinput datebtn" onClick={v.sOpenCal}>
                      {v.sOutLabel}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="guests">
                    Гости
                  </label>
                  <GuestsPicker inputClass="input sinput" />
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
                  Изменить поиск
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
                  {v.nightsLabel} · Цены — на человека за весь заезд, итог для всех гостей указан ниже.
                </span>
              </div>
            </form>
          </div>
        </section>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '22px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Главная</Link> › Друскининкай
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px 20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 style={{ fontSize: '32px' }}>Санатории Друскининкая</h1>
              <div style={{ fontSize: '17px', color: '#3E4B44' }}>
                {v.dateRange} · {v.nightsLabel} · {v.guestsLine}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={v.wzOpenFn}
              style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              Помогите выбрать санаторий
            </button>
          </div>
          {/* Filters above the list */}
          {v.fClosed ? (
            <>
              <section
                className="card"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
                    <circle cx="16" cy="7" r="2" />
                    <circle cx="10" cy="12" r="2" />
                    <circle cx="18" cy="17" r="2" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '22px' }}>Уточните выбор</h2>
                    <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.appliedSummary}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.openF}
                  style={{ minHeight: '50px', fontSize: '17px', padding: '0 22px' }}
                >
                  Раскрыть фильтры
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </section>
            </>
          ) : null}
          {v.fOpen ? (
            <>
              <section
                className="card"
                style={{
                  padding: '22px 24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderColor: '#1F5F4A',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h2 style={{ fontSize: '24px' }}>Уточните выбор</h2>
                    <span style={{ fontSize: '16px', color: '#3E4B44' }}>Отметьте, что для вас важно</span>
                  </div>
                  <button type="button" className="acc" onClick={v.closeF} style={{ minHeight: '40px' }}>
                    Свернуть
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {(v.fTop || []).map((f: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <label className={`tile ${f.cls ?? ''}`}>
                        <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
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
                          style={{ flex: 'none', opacity: '.85' }}
                        >
                          <path d={f.d} />
                        </svg>
                        <span>{f.t}</span>
                      </label>
                    </Fragment>
                  ))}
                </div>
                {/* Meals, procedures per day, room — what guests ask about most */}
                <div className="qf" aria-label="Питание, процедуры, номер">
                  <div className="qf-row">
                    <span className="qf-lbl">Питание</span>
                    <div className="qf-opts" role="group" aria-label="Питание">
                      {(v.fMeals || []).map((o: any) => (
                        <button
                          type="button"
                          key={o.k}
                          className={`qf-chip ${o.on ? 'on' : ''}`}
                          aria-pressed={o.on}
                          onClick={o.pick}
                        >
                          {o.t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="qf-row">
                    <span className="qf-lbl">Процедуры</span>
                    <div className="qf-opts" role="group" aria-label="Процедуры в день">
                      {(v.fProcs || []).map((o: any) => (
                        <button
                          type="button"
                          key={o.k}
                          className={`qf-chip ${o.on ? 'on' : ''}`}
                          aria-pressed={o.on}
                          onClick={o.pick}
                        >
                          {o.t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="qf-row">
                    <span className="qf-lbl">Номер</span>
                    <div className="qf-opts" role="group" aria-label="Номер">
                      {(v.fRoom || []).map((o: any) => (
                        <button
                          type="button"
                          key={o.k}
                          className={`qf-chip ${o.on ? 'on' : ''}`}
                          aria-pressed={o.on}
                          onClick={o.pick}
                        >
                          {o.on ? '✓ ' : ''}
                          {o.t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {v.moreOpen ? (
                  <>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        paddingTop: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <button
                        type="button"
                        className="acc"
                        onClick={v.toggleMore}
                        style={{ fontSize: '18px', fontFamily: 'Lora,Georgia,serif', color: '#1C2620', gap: '12px' }}
                      >
                        <span>Дополнительные фильтры</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                        <span style={{ fontSize: '16px', color: '#1F5F4A', fontFamily: 'Manrope,sans-serif' }}>
                          Свернуть
                        </span>
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 28px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            paddingRight: '20px',
                            borderRight: '1px solid #E3DED2',
                          }}
                        >
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Цена на человека за заезд
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }}>
                                <span className="lbl">От, €</span>
                                <input
                                  className="input"
                                  type="number"
                                  placeholder="Любая"
                                  value={v.pMin}
                                  onChange={v.setMin}
                                  style={{ minHeight: '48px' }}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }}>
                                <span className="lbl">До, €</span>
                                <input
                                  className="input"
                                  type="number"
                                  placeholder="Любая"
                                  value={v.pMax}
                                  onChange={v.setMax}
                                  style={{ minHeight: '48px' }}
                                />
                              </label>
                            </div>
                          </div>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Категория
                            </div>{' '}
                            {(v.fStars || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '0 20px',
                            borderRight: '1px solid #E3DED2',
                          }}
                        >
                          <div
                            className="ftitle"
                            style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                          >
                            Профиль лечения
                          </div>
                          {(v.fProfile || []).map((f: any, _i0: number) => (
                            <Fragment key={_i0}>
                              <label className="fchk">
                                <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
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
                                  style={{ flex: 'none', opacity: '.85' }}
                                >
                                  <path d={f.d} />
                                </svg>
                                {f.t}
                                <span className="n">{f.n}</span>
                              </label>
                            </Fragment>
                          ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '20px' }}>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Комфорт
                            </div>{' '}
                            {(v.fComfort || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
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
                                    style={{ flex: 'none', opacity: '.85' }}
                                  >
                                    <path d={f.d} />
                                  </svg>
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Кровати
                            </div>{' '}
                            {(v.fBeds || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
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
                                    style={{ flex: 'none', opacity: '.85' }}
                                  >
                                    <path d={f.d} />
                                  </svg>
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
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
                  {v.moreClosed ? (
                    <>
                      <button type="button" className="morebtn" onClick={v.toggleMore}>
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
                        >
                          <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
                          <circle cx="16" cy="7" r="2" />
                          <circle cx="10" cy="12" r="2" />
                          <circle cx="18" cy="17" r="2" />
                        </svg>
                        Ещё фильтры: цена, лечение, комфорт
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                  {v.moreOpen ? (
                    <>
                      <button type="button" className="linkbtn" onClick={v.clearPending} style={{ fontSize: '17px' }}>
                        Сбросить выбор
                      </button>
                      <span style={{ fontSize: '16px', color: '#3E4B44' }}>{v.pendCount}</span>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.apply}
                    style={{ minHeight: '48px', fontSize: '18px', padding: '0 22px' }}
                  >
                    {v.applyLabel}
                  </button>
                </div>
              </section>
            </>
          ) : null}
          {/* Applied filters */}
          {v.hasActive ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 18px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#3E4B44' }}>Выбрано:</span>
                {(v.active || []).map((a: any, _i0: number) => (
                  <Fragment key={_i0}>
                    <button
                      type="button"
                      onClick={a.off}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        minHeight: '44px',
                        padding: '0 16px',
                        border: '1px solid #C8DED3',
                        background: '#fff',
                        color: '#1C2620',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {a.t}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </Fragment>
                ))}
                <button
                  type="button"
                  className="linkbtn"
                  onClick={v.reset}
                  style={{ fontSize: '16px', marginLeft: '6px' }}
                >
                  Сбросить всё
                </button>
              </div>
            </>
          ) : null}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ fontSize: '24px' }}>{v.foundLabel}</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#3E4B44' }}>
              Сортировка:
              <select
                className="input"
                value={v.sort}
                onChange={v.setSort}
                style={{
                  minHeight: '48px',
                  width: 'auto',
                  paddingRight: '40px',
                  fontWeight: '700',
                  color: '#1C2620',
                  background:
                    "#fff url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231F5F4A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\") no-repeat right 12px center",
                }}
              >
                <option value="pop">Сначала популярные</option>
                <option value="cheap">Сначала дешевле</option>
                <option value="exp">Сначала дороже</option>
              </select>
            </label>
          </div>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {v.none ? (
              <>
                <div
                  className="card"
                  style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontWeight: '800', fontSize: '20px' }}>По этим условиям ничего не нашлось</div>
                  <p style={{ margin: '0', fontSize: '16px', color: '#3E4B44' }}>
                    Снимите одно из условий — или позвоните, подберём вручную.
                  </p>
                  <button type="button" className="btn btn-secondary" onClick={v.reset}>
                    Сбросить фильтры
                  </button>
                </div>
              </>
            ) : null}
            {(v.hotels || []).map((h: any, _i0: number) => (
              <Fragment key={_i0}>
                <article
                  className="card"
                  id={'h-' + h.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: `1px solid ${h.border ?? ''}`,
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                    <Link
                      to="/hotel"
                      style={{
                        flex: '0 0 400px',
                        maxWidth: 'calc(100% - 28px)',
                        minHeight: '240px',
                        position: 'relative',
                        display: 'block',
                        margin: '14px 0 14px 14px',
                        background: '#2B3A33',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      {' '}
                      <img
                        src={h.img}
                        alt={h.name}
                        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }}
                      />{' '}
                    </Link>
                    <div
                      style={{
                        flex: '1 1 360px',
                        minWidth: '0',
                        padding: '16px 18px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '23px' }}>
                          <Link to="/hotel" style={{ textDecoration: 'none', color: '#1C2620' }}>
                            {h.name}
                          </Link>
                        </h2>
                        <span
                          style={{ color: '#8A6500', fontSize: '18px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
                        >
                          {h.stars}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>{h.sub}</div>
                      <div
                        style={{
                          background: '#EEF5F1',
                          borderRadius: '2px',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '4px',
                        }}
                      >
                        <svg
                          width="38"
                          height="38"
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
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#1C2620', lineHeight: '1.15' }}>
                          {h.procT}
                        </span>
                      </div>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '2px 4px' }}
                      >
                        {(h.chips || []).map((c: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <span className="fact" style={{ fontSize: '15px', color: '#1C2620' }}>
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
                                <path d={c.d} />
                              </svg>
                              {c.t}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      {h.hasAwards ? (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: 'auto',
                              paddingTop: '4px',
                            }}
                          >
                            {(h.awards || []).map((w: any, _i1: number) => (
                              <Fragment key={_i1}>
                                <span className="badge">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d={w.d} />
                                  </svg>
                                  {w.t}
                                </span>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div
                      style={{
                        flex: '0 0 220px',
                        padding: '16px 18px',
                        borderLeft: '1px solid #E3DED2',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        justifyContent: 'center',
                        margin: '14px 0',
                      }}
                    >
                      <PriceBox forTwo={h.price} nightsLabel={v.nightsLabel} />
                      <button
                        type="button"
                        className={`btn ${h.btnCls ?? ''}`}
                        onClick={h.toggle}
                        aria-expanded={h.open}
                        style={{
                          minHeight: '48px',
                          fontSize: '16px',
                          padding: '0 16px',
                          marginTop: '10px',
                          justifyContent: 'space-between',
                        }}
                      >
                        {h.btnLabel}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ transform: h.chev }}
                        >
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={h.openCal}
                        style={{ minHeight: '46px', fontSize: '15px', padding: '0 14px', marginTop: '8px' }}
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
                        Когда дешевле?
                      </button>
                      <label className="cmp-check">
                        <input type="checkbox" checked={!!h.cmpOn} disabled={h.cmpOff} onChange={h.cmpToggle} />
                        {h.cmpOff ? 'Сравнить (не больше ' + v.cmpLimit + ')' : 'Сравнить'}
                      </label>
                    </div>
                  </div>
                  {h.open ? (
                    <>
                      <div
                        className="rooms-indent"
                        style={{
                          position: 'relative',
                          padding: '14px 14px 18px 96px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          background: '#F4F7F5',
                          borderTop: '1px solid #E3DED2',
                        }}
                      >
                        {/* rooms of this sanatorium: indented with a guide line so the next sanatorium is not mistaken for a room */}
                        <span
                          aria-hidden="true"
                          className="rooms-guide"
                          style={{
                            position: 'absolute',
                            left: '44px',
                            top: '0',
                            bottom: '18px',
                            width: '3px',
                            background: '#C8DED3',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1F5F4A',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M5 4v9a4 4 0 0 0 4 4h10M15 13l4 4-4 4" />
                          </svg>
                          Номера · {h.name}
                        </div>
                        {(h.offers || []).map((o: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <RoomCard o={o} nightsLabel={v.nightsLabel} />
                          </Fragment>
                        ))}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            color: '#3E4B44',
                            padding: '2px 2px',
                          }}
                        >
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
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </svg>
                          Процедуры подбирает врач после консультации. Специализации, время заезда и трансфер —
                          <Link to="/hotel">на странице санатория</Link>.
                        </div>
                      </div>
                    </>
                  ) : null}
                </article>
              </Fragment>
            ))}
          </div>
          {/* Sanatoriums with no availability on the chosen dates: viewable, not bookable */}
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '10px',
              paddingTop: '22px',
              borderTop: '2px dashed #CFC9BB',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 id="sold" style={{ fontSize: '24px', color: '#3E4B44', scrollMarginTop: '16px' }}>
                  Нет свободных мест на ваши даты · {v.soldCount}
                </h2>
                <span style={{ fontSize: '16px', color: '#5E6862' }}>
                  На {v.dateRange} эти санатории заняты. Описание можно посмотреть, а забронировать — на другие даты.
                </span>
              </div>
            </div>
            {(v.soldHotels || []).map((u: any, _i0: number) => (
              <Fragment key={_i0}>
                <article
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    background: '#F7F5F0',
                    border: '1px solid #E3DED2',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    to="/hotel"
                    style={{
                      flex: '0 0 240px',
                      minHeight: '150px',
                      position: 'relative',
                      display: 'block',
                      margin: '12px 0 12px 12px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      background: '#C9C4BA',
                    }}
                  >
                    {' '}
                    <img
                      src={u.img}
                      alt={u.name}
                      style={{
                        position: 'absolute',
                        inset: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(1)',
                        opacity: '.7',
                      }}
                    />{' '}
                    <span
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '8px',
                        background: '#5E6862',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '800',
                        padding: '5px 10px',
                        borderRadius: '2px',
                      }}
                    >
                      Нет мест
                    </span>{' '}
                  </Link>
                  <div
                    style={{
                      flex: '1 1 360px',
                      minWidth: '0',
                      padding: '14px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '20px', color: '#3E4B44' }}>
                        <Link to="/hotel" style={{ color: '#3E4B44', textDecoration: 'none' }}>
                          {u.name}
                        </Link>
                      </h3>
                      <span style={{ color: '#A39F96', fontSize: '16px', letterSpacing: '1px' }}>{u.stars}</span>
                    </div>
                    <span style={{ fontSize: '15px', color: '#5E6862' }}>{u.sub}</span>
                    <div style={{ display: 'flex', gap: '6px 16px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {(u.chips || []).map((c: any, _i1: number) => (
                        <Fragment key={_i1}>
                          <span className="fact" style={{ color: '#5E6862' }}>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#8A968F"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d={c.d} />
                            </svg>
                            {c.t}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                    <span style={{ fontSize: '15px', color: '#1C2620', marginTop: '4px' }}>
                      Ближайшие свободные даты: <strong>{u.next}</strong>
                    </span>
                  </div>
                  <div
                    style={{
                      flex: '0 0 240px',
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      justifyContent: 'center',
                      borderLeft: '1px solid #E3DED2',
                      margin: '12px 0',
                    }}
                  >
                    <Link
                      className="btn btn-secondary"
                      to="/hotel"
                      style={{
                        minHeight: '46px',
                        fontSize: '15px',
                        padding: '0 14px',
                        borderColor: '#8A968F',
                        color: '#3E4B44',
                      }}
                    >
                      Посмотреть санаторий
                    </Link>
                    <button
                      type="button"
                      className="linkbtn"
                      onClick={u.notify}
                      style={{ fontSize: '15px', justifyContent: 'center' }}
                    >
                      Сообщить, если появятся места
                    </button>
                  </div>
                </article>
              </Fragment>
            ))}
          </section>
          {/* Help band */}
          <section
            style={{
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
                <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '20px' }}>Поможем выбрать</strong>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                  Подскажем, какой санаторий подойдёт именно вам
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
                  Ежедневно с 9:00 до 20:00 по литовскому времени
                </span>
              </div>
            </div>
            <Link className="btn btn-secondary" to="/done" style={{ minHeight: '50px', fontSize: '16px' }}>
              Задать вопрос
            </Link>
          </section>
          <ChooseWizard open={!!v.wzOpen} onClose={v.wzClose} onShow={v.wzShow} />
          <Compare hotels={v.cmpHotels || []} ids={v.cmpIds || []} onRemove={v.cmpRemove} onClear={v.cmpClear} />
        </div>
        <SiteFooter />
      </div>{' '}
      {/* Price calendar pop-up: "Когда дешевле?" */}{' '}
      {v.calOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '70',
              background: 'rgba(20,28,24,.6)',
              overflow: 'auto',
              padding: '24px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="calTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                maxWidth: '1120px',
                width: '100%',
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 24px 70px rgba(0,0,0,.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 id="calTitle" style={{ fontSize: '32px' }}>
                    Выберите дату заезда
                  </h2>
                  <div style={{ fontSize: '22px', color: '#1C2620' }}>{v.cal?.hotelName}</div>
                </div>
                <button
                  type="button"
                  onClick={v.calClose}
                  aria-label="Закрыть"
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '26px',
                    lineHeight: '1',
                    color: '#1C2620',
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  background: '#F4F1EA',
                  borderRadius: '2px',
                  padding: '10px 16px',
                  fontSize: '17px',
                }}
              >
                2 взрослых · {v.nightsLabel} · {v.cal?.room} · {v.cal?.prog}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 16px',
                  fontSize: '18px',
                  color: '#1F5F4A',
                  fontWeight: '700',
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
                >
                  <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                </svg>
                Ваши даты: {v.curRange} · ≈ {v.cal?.curPpn}&nbsp;€ / чел. в сутки
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
                {/* Calendar */}
                <div
                  style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <div style={{ fontSize: '22px', fontWeight: '800' }}>Средняя цена за 1 человека в сутки</div>
                  <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-6px' }}>
                    При заезде в выбранный день на {v.nightsLabel}.
                  </div>
                  <div
                    style={{
                      border: '1px solid #E3DED2',
                      borderRadius: '2px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <button
                        type="button"
                        onClick={v.calPrev}
                        aria-label="Предыдущий месяц"
                        style={{
                          width: '46px',
                          height: '46px',
                          border: '2px solid #CFC9BB',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontSize: '20px',
                        }}
                      >
                        ‹
                      </button>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>{v.cal?.monthTitle}</div>
                      <button
                        type="button"
                        onClick={v.calNext}
                        aria-label="Следующий месяц"
                        style={{
                          width: '46px',
                          height: '46px',
                          border: '2px solid #CFC9BB',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontSize: '20px',
                        }}
                      >
                        ›
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#5E6862',
                        textAlign: 'center',
                      }}
                    >
                      <span>ПН</span>
                      <span>ВТ</span>
                      <span>СР</span>
                      <span>ЧТ</span>
                      <span>ПТ</span>
                      <span>СБ</span>
                      <span>ВС</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: '4px' }}>
                      {(v.cal?.cells || []).map((c: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <button
                            type="button"
                            onClick={c.pick}
                            disabled={!!c.off}
                            aria-label={c.aria}
                            style={{
                              position: 'relative',
                              minHeight: '76px',
                              padding: '6px 8px',
                              border: `2px solid ${c.border ?? ''}`,
                              background: c.bg,
                              borderRadius: '2px',
                              cursor: c.cursor,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: '2px',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ fontSize: '15px', color: '#3E4B44' }}>{c.day}</span>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: c.color }}>{c.text}</span>
                            <span style={{ fontSize: '14px', color: '#1F5F4A', fontWeight: '700' }}>{c.sub}</span>
                            {c.fly ? (
                              <>
                                <span
                                  style={{ position: 'absolute', top: '6px', right: '6px', lineHeight: '0' }}
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
                    <div
                      style={{
                        display: 'flex',
                        gap: '18px',
                        flexWrap: 'wrap',
                        fontSize: '14px',
                        color: '#3E4B44',
                        paddingTop: '6px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#E9F4EC', border: '1px solid #C8DED3' }}
                        />
                        Дешевле
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#FFF6E3', border: '1px solid #F0DDB8' }}
                        />
                        Средняя цена
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#FCEDE9', border: '1px solid #F0CFC6' }}
                        />
                        Дороже
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#E8E6E1', border: '1px solid #D2CFC7' }}
                        />
                        Нет мест
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#5E6862' }}>
                      Цены в календаре округлены. Итоговая стоимость указана справа.
                    </div>
                  </div>
                </div>
                {/* New dates panel */}
                <aside
                  style={{
                    flex: '1 1 300px',
                    maxWidth: '340px',
                    background: '#EEF5F1',
                    border: '1px solid #C8DED3',
                    borderRadius: '2px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '26px', fontWeight: '600', color: '#1F5F4A' }}
                  >
                    Новые даты
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '2px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#3E4B44' }}>Заезд</span>
                        <strong style={{ fontSize: '20px' }}>{v.cal?.newIn}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#3E4B44' }}>Выезд</span>
                        <strong style={{ fontSize: '20px' }}>{v.cal?.newOut}</strong>
                      </div>
                    </div>
                    <div style={{ fontSize: '16px' }}>2 взрослых · {v.nightsLabel}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1' }}>
                        {v.cal?.newPpn}&nbsp;€
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '700' }}>/ чел. в сутки</span>
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        paddingTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>За весь отдых</span>
                      <strong style={{ fontSize: '32px', lineHeight: '1.1' }}>{v.cal?.newTotal}&nbsp;€</strong>
                    </div>
                    <div style={{ background: '#F4F1EA', borderRadius: '2px', padding: '10px 12px', fontSize: '16px' }}>
                      На ваши даты — <strong>{v.cal?.curTotal}&nbsp;€</strong>
                    </div>
                    <div
                      style={{
                        background: v.cal?.diffBg,
                        borderRadius: '2px',
                        padding: '10px 12px',
                        fontSize: '17px',
                        fontWeight: '800',
                        color: v.cal?.diffColor,
                      }}
                    >
                      {v.cal?.diffText}
                    </div>
                    <div style={{ fontSize: '14px', color: '#3E4B44' }}>Тот же номер и программа.</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontSize: '14px',
                      color: '#3E4B44',
                      background: '#fff',
                      borderRadius: '2px',
                      padding: '10px 12px',
                    }}
                  >
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
                    <span>В календаре — средняя цена за сутки. Здесь — точная сумма за весь отдых.</span>
                  </div>
                </aside>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <button type="button" className="acc" onClick={v.calClose} style={{ fontSize: '17px' }}>
                  Оставить {v.curRange}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.calApply}
                    style={{ minHeight: '64px', fontSize: '20px', padding: '0 40px' }}
                  >
                    Применить {v.cal?.newRange}
                  </button>
                  <span style={{ fontSize: '14px', color: '#5E6862' }}>Даты изменятся после подтверждения.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      {/* Custom date-range calendar (two months, price colours) */}{' '}
      {v.sCalOpen ? (
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
              aria-labelledby="sCalTitle"
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
                  <h2 id="sCalTitle" style={{ fontSize: '24px' }}>
                    {v.sCalTitle}
                  </h2>
                  {v.sRoomLine ? <strong style={{ fontSize: '16px', color: '#1C2620' }}>{v.sRoomLine}</strong> : null}
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.sCalHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.sCloseCal}
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
              {v.sRoomLine ? null : <DateModeTabs flex={!!v.sFlex} onChange={v.setSFlex} />}
              {v.sFlex && !v.sRoomLine ? (
                <FlexDates onPick={v.sFlexPick} />
              ) : (
                <>
                  <div className="cal-body">
                    <MonthsCalendar
                      months={v.sMonths || []}
                      onPrev={v.sCalPrev}
                      onNext={v.sCalNext}
                      planeTitle="Рейс из Израиля"
                    />
                    <aside className="cal-side">
                      <span className="cal-side-h">Быстрый выбор</span>
                      <div className="cal-pgrid">
                        <button type="button" className="preset" onClick={v.sP7}>
                          7 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.sP10}>
                          10 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.sP14}>
                          14 ночей
                        </button>
                        <button type="button" className="preset" onClick={v.sP21}>
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
                  display: v.sFlex && !v.sRoomLine ? 'none' : 'flex', // a flexible-dates option goes straight to results
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Заезд</span>
                    <strong style={{ fontSize: '18px' }}>{v.sSelIn}</strong>
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
                    <strong style={{ fontSize: '18px' }}>{v.sSelOut}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Итого</span>
                    <strong style={{ fontSize: '18px', color: '#1F5F4A' }}>{v.sSelNights}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={v.sCloseCal}>
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.sApplyCal}
                    disabled={!!v.sApplyOff}
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
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
