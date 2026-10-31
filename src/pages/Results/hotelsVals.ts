import type { Booking } from '../../data/booking';
import { transferBySanatorium } from '../../data/transferPolicy';
import { ICON_PATHS } from '../../data/iconPaths';
import { CAR_ICON } from '../../data/filters';
import { teamOf } from '../../data/team';
import { roomPhotos } from '../../data/roomPhotos';
import { BUSY_LOOK, FREE_LOOK, freeFrom, overlaps } from '../../data/roomAvailability';
import { tipCheapest, type IconText, type ProgRow, type RoomOfferVM, type ValueTile } from '../../components/RoomCard';
import { addD, iso } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { eur, placePrice, quote, type Guests } from '../../lib/pricing';
import type { HotelVM, ResultsState } from './resultsTypes';
import { ADV_RATE, procW, rangeText, stayPricing, toNum, type Sanatorium, type SearchData } from './stayPricing';

/** what the view-model builders get from the page logic */
export interface LogicCtx {
  st: ResultsState;
  /** the state at the moment of a later call (timers) */
  live: () => ResultsState;
  set: (patch: Partial<ResultsState>) => void;
  booking: Booking;
  update: (patch: Partial<Booking>) => void;
  help: () => void;
  data: SearchData;
  nights: number;
  checkin: Date;
  cmpLimit: number;
}

type Offer = Sanatorium['offers'][number];
/** an extra programme of a sanatorium (data/sanatoriums EXTRA_PROGRAMS): no room of its own */
type ExtraProgram = Pick<Offer, 'n' | 'title' | 'price' | 'prog' | 'details'>;
type Prog = ExtraProgram & { priceN: number; meals: string };

/** «что вы получаете»: the big numbers of a programme in a room */
function valueOf(p: Prog, roomName: string, area: string | undefined, nights: number): ValueTile[] {
  const pm = String(p.title).match(/(\d+) процедур/);
  const nProc = pm ? Number(pm[1]) : 0;
  const perDay = /в день/.test(p.title);
  const progT = p.prog.map((x) => x.t).join(' ');
  const tiles: (ValueTile | null)[] = [
    nProc
      ? {
          d: ICON_PATHS.proc,
          big: String(nProc),
          label: perDay ? procW(nProc) + ' в день' : procW(nProc) + ' за заезд',
          sub: perDay
            ? nProc * nights + ' ' + procW(nProc * nights) + ' за весь заезд · по назначению врача'
            : 'по назначению врача',
        }
      : { d: ICON_PATHS.proc, big: '✓', label: 'процедуры каждый день', sub: 'по назначению врача' },
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
      ? {
          d: ICON_PATHS.pool,
          big: '∞',
          label: /много/i.test(progT) ? 'бассейны и бани' : 'бассейны и сауны',
          sub: 'каждый день, без ограничений',
        }
      : null,
    { d: ICON_PATHS.bed2, big: String(nights), label: 'ночей в номере', sub: roomName + (area ? ' · ' + area : '') },
  ];
  return tiles.filter(Boolean) as ValueTile[];
}

/** Room sets per sanatorium [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]: each room with its programmes */
function roomsOf(h0: Sanatorium, sf: number, ctx: LogicCtx) {
  const { roomSets, extraPrograms } = ctx.data;
  const scale = (x: string | number) => Math.round(toNum(x) * sf);
  const progs: Prog[] = h0.offers.map((o) => ({
    ...o,
    priceN: scale(o.price),
    meals: o.prog.some((x) => /питани/i.test(x.t)) ? 'питание 3 раза' : '',
  }));
  const extra = (extraPrograms as Record<string, ExtraProgram>)[h0.id];
  if (extra) progs.push({ ...extra, priceN: scale(extra.price), meals: 'полный пансион' });
  else
    progs.push({
      ...progs[0],
      n: 9,
      title: 'Расширенная программа — +2 процедуры в день',
      priceN: Math.round(progs[0].priceN * 1.1),
      details: progs[0].details + '\n\nРасширенная программа: две дополнительные процедуры в день по назначению врача.',
    });
  progs.sort((a, b) => a.priceN - b.priceN);
  const base = h0.offers[0];
  const set = (roomSets as Record<string, any[]>)[h0.id] || [
    { id: 'std', room: base.room, add: 0, img: base.img },
    { id: 'plus', room: 'Улучшенный номер', add: Math.round(toNum(base.price) * 0.08), img: '' },
  ];
  return set.map((r, ri) => {
    const addN = Math.round(r.add * sf),
      cheapest = progs[0].priceN + addN;
    const adv = Math.ceil(cheapest * ADV_RATE);
    const photos = roomPhotos(h0.id, r.room, r.img || base.img || h0.img);
    return {
      ...base,
      n: ri + 1,
      id: r.id as string,
      room: r.room as string,
      photos,
      img: photos[0]?.src || r.img || base.img || h0.img,
      amen: (r.amen || base.amen) as IconText[],
      roomText: (r.roomText || base.roomText) as string,
      addN,
      progs,
      title: progs[0].title,
      prog: progs[0].prog as IconText[],
      details: progs[0].details,
      price: fmt(cheapest),
      old: '',
      adv,
      rest: fmt(cheapest - adv),
    };
  });
}

/** the room cards of one sanatorium */
function offersOf(h0: Sanatorium, hId: string, hName: string, sf: number, ctx: LogicCtx, GQ: Guests): RoomOfferVM[] {
  const { st, set, nights, checkin } = ctx;
  const det = st.det || {},
    ps = st.ps || {};
  return roomsOf(h0, sf, ctx).map((r): RoomOfferVM => {
    const key = hId + '-' + r.n;
    const dOpen = !!det[key];
    const area = (r.amen.find((a) => /м²/.test(a.t)) || {}).t;
    const beds = r.amen.find((a) => /кроват/i.test(a.t));
    const extra = r.amen.find((a) => /Балкон|Кондиционер|Ванна/.test(a.t));
    const amenTop = [
      { d: ICON_PATHS.bed2, t: r.room + (area ? ' · ' + area : '') },
      beds
        ? {
            d: beds.d,
            t: beds.t.replace('2 односпальные кровати', '2 отдельные кровати') + (extra ? ' · ' + extra.t : ''),
          }
        : null,
    ].filter(Boolean) as IconText[];
    const parts = String(r.title).split(' — ');
    const progT = r.prog.map((p) => p.t).join(' ');
    const sub =
      'с программой ' +
      parts[0].replace('Программа ', '') +
      (parts[1] ? ' · ' + parts[1] : '') +
      (/питани/i.test(progT) ? ' · питание 3 раза' : '');
    // programmes for this room, cheapest first; selection drives the details below
    const selI = ps[key] ?? 0;
    const progs = r.progs;
    const sp = progs[selI] || progs[0];
    const bySan = transferBySanatorium(hId);
    const progRows: ProgRow[] = progs.map((p, pi) => {
      const on = pi === selI,
        pp = p.title.split(' — ');
      return {
        name: pp[0],
        sub: (pp[1] || '') + (p.meals ? ' · ' + p.meals : ''),
        price: eur(quote(p.priceN + r.addN, GQ, ctx.booking.flightPackage, bySan).perPerson) + ' / чел.',
        diff:
          pi === 0
            ? 'самая доступная'
            : '+' + eur(placePrice(p.priceN, GQ) - placePrice(progs[0].priceN, GQ)) + ' с человека',
        diffColor: pi === 0 ? 'var(--green)' : 'var(--ink-2)',
        border: on ? 'var(--green)' : 'var(--line-strong)',
        bg: on ? 'var(--green-soft)' : 'var(--paper)',
        dot: on ? 'var(--green)' : 'transparent',
        pick: () => set({ ps: { ...ps, [key]: pi } }),
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
    const rkey = hId + ':' + r.id,
      checkout = addD(checkin, nights);
    const busy = overlaps(rkey, checkin, checkout);
    const p0 = progs[0].title.split(' — ');
    return {
      ...r,
      short: r.room,
      sub,
      value: valueOf(sp, r.room, area, nights),
      detLines,
      prog: sp.prog as IconText[],
      amenTop,
      progRows,
      ...(busy ? BUSY_LOOK : FREE_LOOK),
      busy,
      avail: !busy,
      busyRange: rangeText(checkin, nights),
      nextFree: freeFrom(rkey),
      pill: busy
        ? 'Нет мест на ваши даты'
        : r.addN
          ? 'Номер +' + eur(placePrice(r.addN, GQ)) + ' с человека'
          : 'Включён в цену программы',
      roomLine: (r.amen || [])
        .slice(0, 3)
        .map((a) => a.t)
        .join(' · '),
      progLine:
        'с программой ' +
        p0[0].replace('Программа ', '') +
        (p0[1] ? ' · ' + p0[1] : '') +
        ' · ' +
        (progs[0].meals || 'питание 3 раза'),
      choose: () => ctx.update({ hotelId: hId, roomId: r.id }),
      // same calendar as the search band, with this room's busy nights closed
      openRoomCal: () =>
        set({
          sOpen: true,
          sRoom: { key: rkey, name: r.room, hotel: hName },
          sNote: null,
          ss: { in: null, out: null },
          sm: checkin.getUTCMonth(),
          sy: checkin.getUTCFullYear(),
        }),
      selName: sp.title.split(' — ')[0],
      selPrice: eur(quote(sp.priceN + r.addN, GQ, ctx.booking.flightPackage, bySan).total),
      addLabel: r.addN ? 'номер +' + fmt(r.addN) + ' € к базовому' : 'с самой доступной программой',
      detBtn: 'Программы и что входит (' + progs.length + ')',
      detChev: dOpen ? 'rotate(180deg)' : 'none',
      detOpen: dOpen,
      detLabel: dOpen ? 'Всё понятно, можно убрать' : 'Подробнее. Что сюда входит?',
      toggleDet: () => set({ det: { ...det, [key]: !dOpen } }),
    };
  });
}

const incIcon = (t: string) =>
  /питани/i.test(t)
    ? ICON_PATHS.meals
    : /говорит/i.test(t)
      ? 'M4 4h16v12H7l-3 3zM8 9h8M8 12h5'
      : /врач/i.test(t)
        ? ICON_PATHS.doctor
        : /бассейн/i.test(t)
          ? ICON_PATHS.pool
          : /процедур|лечени/i.test(t)
            ? ICON_PATHS.proc
            : /номер/i.test(t)
              ? ICON_PATHS.bed2
              : 'm5 12 5 5L20 7';

/** The sanatoriums of the list as the cards show them: price for the dates, state of the rooms, compare. */
export function buildHotels(list: Sanatorium[], ctx: LogicCtx): HotelVM[] {
  const { st, set, booking, nights, checkin, cmpLimit } = ctx;
  const GQ: Guests = { adults: booking.adults, children: booking.children };
  const { stayFactor, ppn } = stayPricing(nights);
  const open = st.open || {},
    sec = st.sec || {},
    closing = st.closing || {};
  const cmp = st.cmp || [];
  const secT = (id: string, s: string) => () => set({ sec: { ...sec, [id + s]: !sec[id + s] } });
  const anyOpen = Object.keys(open).some((k) => open[k]);
  const still = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // folding the rooms away takes a moment (CSS .rooms-reveal.closing), then they leave the page
  const fold = (id: string) => {
    if (still) return set({ open: { ...open, [id]: false } });
    set({ closing: { ...closing, [id]: true } });
    window.setTimeout(() => {
      const s2 = ctx.live();
      if ((s2.closing || {})[id]) set({ open: { ...s2.open, [id]: false }, closing: { ...s2.closing, [id]: false } });
    }, 820);
  };
  return list.map((h0, idx) => {
    const sf = stayFactor(h0, checkin);
    const priceN = Math.round(h0.price * sf);
    const offers0 = h0.offers.map((o) => {
      const p = Math.round(toNum(o.price) * sf);
      const adv = Math.ceil(p * ADV_RATE);
      return { ...o, price: fmt(p), old: o.old ? fmt(Math.round(toNum(o.old) * sf)) : '', adv, rest: fmt(p - adv) };
    });
    const shown = !!open[h0.id];
    const isOpen = shown && !closing[h0.id];
    // the next step after the search: open the rooms of the first (promoted) sanatorium;
    // once rooms are open: choose the cheapest free room of the sanatorium opened last
    const tipOn = idx === 0 && !anyOpen && !st.rmTipX;
    const roomTip = isOpen && st.lastOpen === h0.id && !st.roomTipX;
    return {
      ...h0,
      trNote: h0.trNote.replace('{nights}', String(nights)),
      openCal: () =>
        set({ cal: { id: h0.id, picked: iso(checkin), month: checkin.getUTCMonth(), year: checkin.getUTCFullYear() } }),
      stars: '★'.repeat(h0.starsN),
      // who meets the guest: the doctor, the rehabilitologist, the administrator (0–3 heads)
      team: teamOf(h0.id),
      ppn: ppn(priceN),
      advMin: Math.min(...offers0.map((o) => o.adv)),
      price: fmt(priceN),
      procT: h0.inc[0],
      procSub: /в день|ежедневно/.test(h0.inc[0])
        ? 'лечебные процедуры по назначению врача, каждый день'
        : 'лечебные процедуры по назначению врача',
      incRest: h0.inc.slice(1).map((t) => ({ t, d: incIcon(t) })),
      open: shown,
      closing: shown && !isOpen,
      tipOn,
      border: isOpen ? 'var(--green)' : 'var(--line)',
      btnLabel: isOpen ? 'Скрыть варианты' : 'Номера и программы',
      chips: [
        h0.tags.includes('doctor') ? { t: 'Врач включён', d: ICON_PATHS.doctor } : null,
        h0.tags.includes('pool')
          ? {
              t: /много бассейнов|бани/i.test(h0.inc.join(' ')) ? 'Бассейны и бани' : 'Бассейн и сауны',
              d: ICON_PATHS.pool,
            }
          : null,
        h0.tags.includes('meals3') ? { t: 'Питание 3 раза', d: ICON_PATHS.meals } : null,
        // the airport transfer only where it is already in the price (Eglė)
        h0.tags.includes('transfer') ? { t: 'Трансфер из аэропорта включён', d: CAR_ICON } : null,
      ].filter(Boolean) as { t: string; d: string }[],
      chev: isOpen ? 'rotate(180deg)' : 'none',
      btnCls: (isOpen ? 'btn-secondary' : 'btn-primary') + (tipOn ? ' next-pulse' : ''),
      toggle: () =>
        isOpen
          ? fold(h0.id)
          : // the guest found the rooms: the bubble does not come back
            set({
              open: { ...open, [h0.id]: true },
              closing: { ...closing, [h0.id]: false },
              rmTipX: true,
              lastOpen: h0.id,
            }),
      cmpOn: cmp.includes(h0.id),
      cmpOff: !cmp.includes(h0.id) && cmp.length >= cmpLimit,
      cmpToggle: () =>
        set({ cmp: cmp.includes(h0.id) ? cmp.filter((x) => x !== h0.id) : cmp.concat(h0.id).slice(-cmpLimit) }),
      specOpen: !!sec[h0.id + 'spec'],
      toggleSpec: secT(h0.id, 'spec'),
      timeOpen: !!sec[h0.id + 'time'],
      toggleTime: secT(h0.id, 'time'),
      trOpen: !!sec[h0.id + 'tr'],
      toggleTr: secT(h0.id, 'tr'),
      offers: tipCheapest(offersOf(h0, h0.id, h0.name, sf, ctx, GQ), roomTip, () => set({ roomTipX: true })),
    };
  });
}
