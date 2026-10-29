import { useBooking } from '../context/BookingContext';
import { useHelp } from '../context/HelpContext';
import { TODAY } from '../data/demo';
import { isFlightDay } from '../data/flights';
import { WEEKDAYS_SHORT, addD, daysBetween, iso, nightsWord, shortDate, toD } from '../lib/dates';
import { fmt } from '../lib/format';
import { FLIGHT_PP, PACKAGE_TRANSFER_PP, persons } from '../lib/pricing';
import { transferBySanatorium } from '../data/transferPolicy';

/** Partner flights Tel Aviv ⇄ Vilnius. [ПРИМЕР ДАННЫХ — ИЗ СИСТЕМЫ БРОНИРОВАНИЯ РЕЙСОВ] */
const LEG_THERE = { no: 'IZ 2549', from: 'Тель-Авив', to: 'Вильнюс', dep: '13:05', arr: '17:20' };
const LEG_BACK = { no: 'IZ 2550', from: 'Вильнюс', to: 'Тель-Авив', dep: '18:40', arr: '22:40' };
const PLANE = 'M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z';

const dayLabel = (d: Date) => WEEKDAYS_SHORT[d.getUTCDay()].toLowerCase() + ', ' + shortDate(d);

/**
 * Nearby date pairs where our flight goes both ways — same length of stay first,
 * then one or two nights shorter / longer.
 */
function flightPairs(checkin: Date, nights: number) {
  const out: { a: Date; b: Date; n: number; score: number }[] = [];
  for (let shift = -10; shift <= 14; shift++) {
    const a = addD(checkin, shift);
    if (a <= addD(TODAY, 3) || !isFlightDay(a)) continue;
    for (const dn of [0, -1, 1, -2, 2]) {
      const n = nights + dn;
      if (n < 5) continue;
      const b = addD(a, n);
      if (isFlightDay(b)) out.push({ a, b, n, score: Math.abs(shift) + Math.abs(dn) * 4 });
    }
  }
  return out.sort((x, y) => x.score - y.score).slice(0, 3);
}

function Leg({ dir, leg, date }: { dir: string; leg: typeof LEG_THERE; date: Date }) {
  return (
    <div className="ios-row">
      <span className="ios-main">
        <span className="ios-sub">
          {dir} · {dayLabel(date)}
        </span>
        <strong>
          {leg.from} {leg.dep} → {leg.to} {leg.arr}
        </strong>
      </span>
      <span className="ios-end">{leg.no}</span>
    </div>
  );
}

/**
 * Step "Дорога", part 1: how the guest gets to Lithuania. Asked before the transfer,
 * so the transfer can follow the flight and nobody learns about missing flights
 * after typing in passport names.
 */
export function FlightChoice() {
  const { booking, update } = useBooking();
  const help = useHelp();
  const inD = toD(booking.checkin),
    outD = toD(booking.checkout);
  const nights = daysBetween(inD, outD);
  const inOk = isFlightDay(inD),
    outOk = isFlightDay(outD);
  const both = inOk && outOk;
  const n = persons(booking);
  // the sanatorium may meet guests itself (Eglė): then the package is the flight only
  const bySan = transferBySanatorium(booking.hotelId);
  const pp = FLIGHT_PP + (bySan ? 0 : PACKAGE_TRANSFER_PP);
  const sel = booking.flightPackage
    ? 'with'
    : booking.flights === 'no'
      ? 'own'
      : booking.flights === 'help'
        ? 'help'
        : '';
  const pairs = both ? [] : flightPairs(inD, nights);

  const pickWith = (dates?: { checkin: string; checkout: string }) =>
    update({
      ...(dates ? { ...dates, chosenDates: true } : {}),
      flightPackage: true,
      flights: 'yes',
      transfer: { ...booking.transfer, mode: 'group', back: true, place: 'vilnius', backPlace: 'vilnius' },
    });
  const pickOwn = () => update({ flightPackage: false, flights: 'no' });
  const pickHelp = () => {
    update({ flightPackage: false, flights: 'help' });
    help.open();
  };

  const plane = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PLANE} />
    </svg>
  );
  const chevron = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
  const dayRow = (label: string, d: Date, ok: boolean, leg: typeof LEG_THERE, back = false) => (
    <div className="ios-row">
      <span className={'ios-ico ' + (ok ? '' : 'warn')} style={back ? { transform: 'scaleX(-1)' } : undefined}>
        {plane}
      </span>
      <span className="ios-main">
        <span className="ios-sub">{label}</span>
        <strong>{dayLabel(d)}</strong>
      </span>
      <span className={'ios-end ' + (ok ? 'ok' : 'warn')}>
        {ok ? leg.no + ' · ' + leg.dep + ' → ' + leg.arr : 'нашего рейса нет'}
      </span>
    </div>
  );
  const option = (key: string, title: string, sub: string, onPick: () => void, end?: string, off = false) => (
    <button
      type="button"
      role="radio"
      aria-checked={sel === key}
      className={'ios-row ' + (sel === key ? 'on' : '')}
      disabled={off}
      onClick={onPick}
    >
      <span className={'ios-radio ' + (sel === key ? 'on' : '')} aria-hidden="true" />
      <span className="ios-main">
        <strong>{title}</strong>
        <span className="ios-sub">{sub}</span>
      </span>
      {end ? <span className="ios-end ok">{end}</span> : null}
    </button>
  );

  return (
    <section className="road-sec" aria-labelledby="flyTitle">
      <div className="road-h">
        <span className="road-num">1</span>
        <div>
          <h2 id="flyTitle">Перелёт Тель-Авив ⇄ Вильнюс</h2>
          <span>Сначала решим с рейсом — трансфер подстроим под него.</span>
        </div>
      </div>
      <div className="ios-list">
        {dayRow('Туда', inD, inOk, LEG_THERE)}
        {dayRow('Обратно', outD, outOk, LEG_BACK, true)}
      </div>
      {!both ? (
        <p className="ios-note ios-in" role="status">
          <span className="ios-note-i" aria-hidden="true">
            !
          </span>
          <span>
            {sel === 'with'
              ? 'Вы выбрали перелёт, но в ваши даты наш рейс не летает. Он летает по вторникам, четвергам и воскресеньям — выберите даты ниже.'
              : 'Наш прямой рейс Israir летает по вторникам, четвергам и воскресеньям — в ваши даты его нет. Можно сдвинуть даты или поехать иначе.'}
          </span>
        </p>
      ) : null}
      {pairs.length ? (
        <div className="ios-sec ios-in">
          <span className="ios-cap">Даты с нашим рейсом туда и обратно</span>
          <div className="ios-list">
            {pairs.map((p) => (
              <button
                type="button"
                key={iso(p.a) + p.n}
                className="ios-row fly-alt-row"
                onClick={() => pickWith({ checkin: iso(p.a), checkout: iso(p.b) })}
              >
                <span className="ios-main">
                  <strong>
                    {dayLabel(p.a)} → {dayLabel(p.b)}
                  </strong>
                  <span className="ios-sub">
                    {p.n} {nightsWord(p.n)} · рейсы {LEG_THERE.no} и {LEG_BACK.no}
                  </span>
                </span>
                <span className="ios-end">
                  <span className="ios-link">Выбрать</span>
                  {chevron}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="ios-sec" id="flyChoice">
        <span className="ios-cap">Как вы доберётесь</span>
        <div className="ios-list" role="radiogroup" aria-labelledby="flyTitle">
          {option(
            'with',
            'Добавить наш перелёт в заказ',
            both
              ? (bySan
                  ? 'Прямой рейс Israir, багаж 20 кг. Трансфер из аэропорта организует санаторий. '
                  : 'Прямой рейс Israir, багаж 20 кг, трансфер у самолёта — всё в одной цене. ') +
                  `За ${n === 2 ? 'двоих' : n + ' гостей'}: ${fmt(pp * n)} €.`
              : 'В ваши даты недоступно — выберите даты с рейсом выше.',
            () => pickWith(),
            '+' + fmt(pp) + ' € / чел.',
            !both,
          )}
          {option(
            'own',
            'Билеты у меня уже есть или приеду сам',
            bySan
              ? 'Другой рейс, другой аэропорт, на машине. Номер рейса передадим санаторию — его трансфер встретит вас.'
              : 'Другой рейс, другой аэропорт, на машине. Номер рейса можно указать ниже — трансфер встретит по нему.',
            pickOwn,
          )}
          {option(
            'help',
            'Не знаю, как лучше добраться',
            'Консультант подберёт рейс и перезвонит. Заказ сохранится — можно продолжать.',
            pickHelp,
          )}
        </div>
      </div>
      {sel === 'with' && both ? (
        <div className="ios-sec ios-in">
          <span className="ios-cap">Ваши рейсы · Israir, прямые</span>
          <div className="ios-list">
            <Leg dir="Туда" leg={LEG_THERE} date={inD} />
            <Leg dir="Обратно" leg={LEG_BACK} date={outD} />
          </div>
          <span className="ios-foot">
            Билеты выпишем на имена гостей со следующего шага и пришлём на почту и в WhatsApp. Цена билетов фиксируется
            депозитом. [ПРИМЕР ДАННЫХ]
          </span>
        </div>
      ) : null}
    </section>
  );
}
