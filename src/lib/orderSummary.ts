import { api } from '../api';
import type { Booking } from '../data/booking';
import { TODAY } from '../data/demo';
import { MONTHS, daysBetween, nightsWord, plural, shortDate, toD } from './dates';
import { fmt } from './format';
import { transferBySanatorium } from '../data/transferPolicy';
import { transferLegs } from './transferCost';
import { flightPackage, partyLabel, paymentPlan, perPersonOf, placeLabel, placePrice, stayTotal } from './pricing';

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

/** Transfer price for the guest (see lib/transferCost: free / in the package / our tariff). */
export function transferPrice(b: Booking) {
  return transferLegs(b).total;
}

const place = (id: string) => api.getTransferOptions().places.find((p) => p.id === id);
const placeName = (id: string) => place(id)?.name ?? id;
const placeFrom = (id: string) => place(id)?.from ?? id;

/** Everything the order summary boxes show, computed from the shared booking. */
export function orderSummary(b: Booking) {
  const nights = daysBetween(toD(b.checkin), toD(b.checkout));
  const { programs, roomPrice } = api.getRoomPrograms(b.hotelId, b.roomId);
  const program = programs.find((p) => p.id === b.programId) || programs[0];
  const base2 = program.price + roomPrice.add; // tariff for two adults sharing
  const g = { adults: b.adults, children: b.children };
  const stay = stayTotal(base2, g);
  const place = placePrice(base2, g);
  const tr = transferLegs(b);
  // not answered yet or not needed
  const noTransfer = !b.transfer.mode || b.transfer.mode === 'none';
  const transfer = tr.total;
  const bySan = transferBySanatorium(b.hotelId);
  const flight = b.flightPackage ? flightPackage(g, !bySan) : 0;
  const total = stay + transfer + flight;
  const plan = paymentPlan(b.checkin, g, b.flightPackage, total, TODAY);
  const advance = plan.deposit;
  return {
    dates: stayRange(b.checkin, b.checkout) + ' · ' + nights + ' ' + nightsWord(nights),
    nights,
    program: program.short,
    /** "«Миди»" */
    programName: program.name.replace('Программа ', ''),
    /** "3 процедуры в день" */
    programPerDay: program.perDay,
    /** "Программа «Миди» · 3 процедуры в день" */
    programFull: program.name + ' · ' + program.perDay,
    guests: guestsLabel(b),
    roomName: b.adults === 1 ? 'Одноместное размещение' : 'Двухместный',
    stay,
    stayLabel: eur(stay),
    /** price of one adult place — the number agents quote */
    place,
    placeLabel: eur(place),
    /** "на человека в двухместном номере" / "за одного · одноместный номер" */
    placeNote: placeLabel(g),
    /** "1 069 € × 2" when everybody pays the same place price */
    stayCalc: b.children || b.adults === 1 ? '' : eur(place) + ' × ' + b.adults,
    /** single supplement included in a solo guest's price */
    singleExtra: b.adults === 1 ? place - perPersonOf(base2) : 0,
    party: partyLabel(g),
    flight,
    flightLabel: eur(flight),
    flightPackage: b.flightPackage,
    /** the sanatorium meets the guests itself, free of charge */
    sanTransfer: tr.allFree,
    flightName: bySan ? 'Перелёт Тель-Авив ⇄ Вильнюс' : 'Перелёт Тель-Авив ⇄ Вильнюс и трансфер',
    transfer,
    transferLabel: eur(transfer),
    transferKind: noTransfer
      ? 'Трансфер не нужен'
      : tr.allFree
        ? 'Трансфер санатория — уже оплачен'
        : tr.allPackage
          ? 'Групповой трансфер — в пакете с перелётом'
          : `Трансфер ${b.transfer.mode === 'group' ? 'групповой' : 'индивидуальный'}, ${b.transfer.back ? 'туда и обратно' : 'в одну сторону'}` +
            (b.flightPackage && !bySan ? ' (доплата к пакету)' : ''),
    /** short route for the guest details step */
    transferRoute: noTransfer
      ? 'не нужен'
      : (b.transfer.place === 'vilnius' ? 'из аэропорта Вильнюса' : placeFrom(b.transfer.place).toLowerCase()) +
        (b.transfer.back ? ', туда и обратно' : ', в одну сторону') +
        (tr.allFree ? ' — уже оплачен, организует санаторий' : ''),
    /** line on the confirmation page */
    transferLine: noTransfer
      ? 'Без трансфера'
      : `${b.transfer.mode === 'group' ? 'Групповой' : 'Индивидуальный'} трансфер: ` +
        (b.transfer.place === 'vilnius' ? 'аэропорт Вильнюса' : placeName(b.transfer.place)) +
        (b.transfer.back ? ' ⇄\u00a0' : ' →\u00a0') +
        'санаторий' +
        (tr.allFree ? ' — организует санаторий, уже оплачен' : ''),
    /** route for the payment step */
    transferPlaces: noTransfer
      ? 'не нужен'
      : (b.transfer.place === 'vilnius' ? 'Вильнюс, аэропорт' : placeName(b.transfer.place)) +
        (b.transfer.back ? ' ⇄\u00a0' : ' →\u00a0') +
        'санаторий' +
        (tr.allFree ? ' · уже оплачен' : ''),
    total,
    totalLabel: eur(total),
    /** deposit that fixes the price (35 € per person, +100 € per person with flights) */
    advance,
    advanceLabel: eur(advance),
    rest: plan.rest,
    restLabel: eur(plan.rest),
    /** the rest is due by this date; free cancellation until then */
    dueDate: shortDate(plan.due),
    fullOnly: plan.fullOnly,
  };
}
