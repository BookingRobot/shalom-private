import { BUSY_LOOK, FREE_LOOK, freeFrom, overlaps } from '../../data/roomAvailability';
import { roomPhotos } from '../../data/roomPhotos';
import { fmt } from '../../lib/format';
import { eur, placePrice, quote, type Guests } from '../../lib/pricing';
import { ADV_RATE, rangeLabel, totalFor, valueTiles } from './hotelPricing';
import type { DetailLine, HotelRoom, PricedProgram, ProgramRow, RoomOffer } from './hotelTypes';

export interface OffersInput {
  hotelId: string;
  rooms: HotelRoom[];
  programs: PricedProgram[];
  /** room number → availability key of room types fully booked on some dates */
  busyKeys: Record<number, string>;
  checkin: Date;
  checkout: Date;
  nights: number;
  guests: Guests;
  withFlight: boolean;
  /** open room cards */
  det: Record<number, boolean>;
  /** chosen programme per room */
  ps: Record<number, number>;
  pickProgram: (room: number, index: number) => void;
  toggleDetails: (room: number, open: boolean) => void;
  chooseRoom: (roomN: number) => void;
  openRoomCalendar: (key: string, name: string) => void;
}

/** the programme's text as list lines, headings in bold */
const detailLines = (details: string): DetailLine[] =>
  String(details)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => ({
      t: l.replace(/^— ?/, '• '),
      fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
      pl: /^—/.test(l) ? '14px' : '0',
      mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
    }));

/**
 * Room-first: each room is priced with the cheapest programme; the programmes are upgrades
 * inside the card. [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]
 */
export function buildOffers(x: OffersInput): RoomOffer[] {
  const { programs: PROGS } = x;
  if (!PROGS.length) return [];
  return x.rooms.map((r) => {
    const dOpen = !!x.det[r.n];
    const addN = totalFor(x.checkin, x.nights, r.add);
    const cheapest = PROGS[0].priceN + addN;
    const adv = Math.ceil(cheapest * ADV_RATE);
    const selI = x.ps[r.n] ?? 0,
      sp = PROGS[selI] || PROGS[0];
    const progRows: ProgramRow[] = PROGS.map((p, pi) => {
      const on = pi === selI,
        pp = p.title.split(' — ');
      return {
        name: pp[0],
        sub: (pp[1] || '') + ' · ' + p.meals,
        price: eur(quote(p.priceN + addN, x.guests, x.withFlight, true).perPerson) + ' / чел.',
        diff:
          pi === 0
            ? 'самая доступная'
            : '+' + eur(placePrice(p.priceN, x.guests) - placePrice(PROGS[0].priceN, x.guests)) + ' с человека',
        diffColor: pi === 0 ? 'var(--green)' : 'var(--ink-2)',
        border: on ? 'var(--green)' : 'var(--line-strong)',
        bg: on ? 'var(--green-soft)' : 'var(--paper)',
        dot: on ? 'var(--green)' : 'transparent',
        pick: () => x.pickProgram(r.n, pi),
      };
    });
    const p0 = PROGS[0].title.split(' — ');
    const rkey = x.busyKeys[r.n] || '';
    const busy = overlaps(rkey, x.checkin, x.checkout);
    // the room's photos for the mini gallery (the first one is on the card)
    const pics = roomPhotos(x.hotelId, r.name, r.img);
    return {
      ...r,
      photos: pics,
      img: pics[0]?.src || r.img,
      room: r.name,
      short: r.name,
      roomLine: r.line,
      ...(busy ? BUSY_LOOK : FREE_LOOK),
      busy,
      avail: !busy,
      busyRange: rangeLabel(x.checkin, x.checkout),
      nextFree: freeFrom(rkey),
      choose: () => x.chooseRoom(r.n),
      openRoomCal: () => x.openRoomCalendar(rkey, r.name),
      pill: busy
        ? 'Нет мест на ваши даты'
        : r.add
          ? 'Номер +' + eur(placePrice(addN, x.guests)) + ' с человека'
          : 'Включён в цену программы',
      progLine: 'с программой ' + p0[0].replace('Программа ', '') + ' · ' + (p0[1] || '') + ' · ' + PROGS[0].meals,
      price: fmt(cheapest),
      adv,
      ppn: Math.round(cheapest / x.nights / 2),
      prog: sp.prog,
      value: valueTiles(sp, x.nights, r.name + ' · ' + r.line.split(' · ')[0]),
      detLines: detailLines(sp.details),
      progRows,
      roomText: 'Что ещё есть в номере: телефон, спутниковое ТВ, гардероб, сейф, фен, халат, тапочки.',
      selName: sp.title.split(' — ')[0],
      selPrice: eur(quote(sp.priceN + addN, x.guests, x.withFlight, true).total),
      detBtn: 'Программы для этого номера (' + PROGS.length + ') и что входит',
      detChev: dOpen ? 'rotate(180deg)' : 'none',
      border: r.top ? 'var(--green)' : 'var(--line)',
      detOpen: dOpen,
      toggleDet: () => x.toggleDetails(r.n, !dOpen),
    };
  });
}
