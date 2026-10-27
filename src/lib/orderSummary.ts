import { api } from '../api';
import type { Booking } from '../data/booking';
import { MONTHS, daysBetween, nightsWord, plural, shortDate, toD } from './dates';
import { fmt } from './format';

/** Advance paid online: 4 % of accommodation + programme, rounded up to a euro. */
export const ADVANCE_RATE = 0.04;

const eur = (n: number) => fmt(n) + ' €';

/** "9–18 ноября" or "28 ноября – 5 декабря" */
export function stayRange(checkin: string, checkout: string) {
  const a = toD(checkin),
    b = toD(checkout);
  return a.getUTCMonth() === b.getUTCMonth()
    ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()]
    : shortDate(a) + ' – ' + shortDate(b);
}

export function guestsLabel(b: Pick<Booking, 'adults' | 'children'>) {
  const adults = b.adults === 1 ? '1 взрослый' : `${b.adults} взрослых`;
  return b.children ? `${adults}, ${b.children} ${plural(b.children, ['ребёнок', 'ребёнка', 'детей'])}` : adults;
}

/** Transfer price: group = per seat, individual = per car; one or two legs. */
export function transferPrice(b: Booking) {
  const t = b.transfer;
  if (t.mode === 'none') return 0;
  const { prices } = api.getTransferOptions();
  const P = prices as Record<string, Record<string, number>>;
  const leg = (place: string) => {
    const p = P[place] || P.vilnius;
    return t.mode === 'individual' ? (p[t.vehicle] ?? p.car) : p.seat * (b.adults + b.children);
  };
  return leg(t.place) + (t.back ? leg(t.backPlace) : 0);
}

const place = (id: string) => api.getTransferOptions().places.find((p) => p.id === id);
const placeName = (id: string) => place(id)?.name ?? id;
const placeFrom = (id: string) => place(id)?.from ?? id;

/** Everything the order summary boxes show, computed from the shared booking. */
export function orderSummary(b: Booking) {
  const nights = daysBetween(toD(b.checkin), toD(b.checkout));
  const { programs, roomPrice } = api.getRoomPrograms(b.hotelId, b.roomId);
  const program = programs.find((p) => p.id === b.programId) || programs[0];
  const stay = program.price + roomPrice.add;
  const transfer = transferPrice(b);
  const total = stay + transfer;
  const advance = Math.ceil(stay * ADVANCE_RATE);
  return {
    dates: stayRange(b.checkin, b.checkout) + ' · ' + nights + ' ' + nightsWord(nights),
    nights,
    program: program.short,
    /** "Программа «Миди» · 3 процедуры в день" */
    programFull: program.name + ' · ' + program.perDay,
    guests: guestsLabel(b),
    stay,
    stayLabel: eur(stay),
    transfer,
    transferLabel: eur(transfer),
    transferKind:
      b.transfer.mode === 'none'
        ? 'Трансфер не нужен'
        : `Трансфер ${b.transfer.mode === 'group' ? 'групповой' : 'индивидуальный'}, ${b.transfer.back ? 'туда и обратно' : 'в одну сторону'}`,
    /** short route for the guest details step */
    transferRoute:
      b.transfer.mode === 'none'
        ? 'не нужен'
        : (b.transfer.place === 'vilnius' ? 'из аэропорта Вильнюса' : placeFrom(b.transfer.place).toLowerCase()) +
          (b.transfer.back ? ', туда и обратно' : ', в одну сторону'),
    /** line on the confirmation page */
    transferLine:
      b.transfer.mode === 'none'
        ? 'Без трансфера'
        : `${b.transfer.mode === 'group' ? 'Групповой' : 'Индивидуальный'} трансфер: ` +
          (b.transfer.place === 'vilnius' ? 'аэропорт Вильнюса' : placeName(b.transfer.place)) +
          (b.transfer.back ? ' ⇄ ' : ' → ') +
          'санаторий',
    /** route for the payment step */
    transferPlaces:
      b.transfer.mode === 'none'
        ? 'не нужен'
        : (b.transfer.place === 'vilnius' ? 'Вильнюс, аэропорт' : placeName(b.transfer.place)) +
          (b.transfer.back ? ' ⇄ ' : ' → ') +
          'санаторий',
    total,
    totalLabel: eur(total),
    advance,
    advanceLabel: eur(advance),
  };
}
