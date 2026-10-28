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
    <div className="fly-leg">
      <span className="fly-leg-dir">{dir}</span>
      <strong>
        {leg.from} {leg.dep} → {leg.to} {leg.arr}
      </strong>
      <span>
        {dayLabel(date)} · {leg.no} · Israir, прямой
      </span>
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
      ...(dates || {}),
      flightPackage: true,
      flights: 'yes',
      transfer: { ...booking.transfer, mode: 'group', back: true, place: 'vilnius', backPlace: 'vilnius' },
    });
  const pickOwn = () => update({ flightPackage: false, flights: 'no' });
  const pickHelp = () => {
    update({ flightPackage: false, flights: 'help' });
    help.open();
  };

  const dayChip = (label: string, d: Date, ok: boolean, leg: typeof LEG_THERE) => (
    <span className={'fly-day ' + (ok ? 'ok' : 'no')}>
      <span className="fly-day-l">{label}</span>
      <strong>{dayLabel(d)}</strong>
      <span className="fly-day-s">
        {ok ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d={PLANE} />
            </svg>
            рейс {leg.no}, {leg.dep}
          </>
        ) : (
          'нашего рейса нет'
        )}
      </span>
    </span>
  );

  return (
    <section className="card road-sec" aria-labelledby="flyTitle">
      <div className="road-h">
        <span className="road-num">1</span>
        <div>
          <h2 id="flyTitle">Перелёт Тель-Авив ⇄ Вильнюс</h2>
          <span>Сначала решим с рейсом — трансфер подстроим под него.</span>
        </div>
      </div>
      <div className="fly-days">
        {dayChip('Туда', inD, inOk, LEG_THERE)}
        {dayChip('Обратно', outD, outOk, LEG_BACK)}
      </div>
      {!both ? (
        <div className="fly-warn" role="status">
          {sel === 'with' ? (
            <p>
              <strong>Вы выбрали поездку с перелётом, но в ваши даты наш рейс не летает</strong> — прямые рейсы Israir
              бывают по вторникам, четвергам и воскресеньям. Выберите даты с рейсом ниже — или другой вариант дороги.
            </p>
          ) : (
            <p>
              <strong>В ваши даты наша авиакомпания-партнёр не летает</strong> — прямые рейсы Israir бывают по
              вторникам, четвергам и воскресеньям. Поехать всё равно можно: другой авиакомпанией, через другой аэропорт
              — или сдвинуть даты.
            </p>
          )}
          {pairs.length ? (
            <div className="fly-alt">
              <span>Даты с нашим рейсом туда и обратно:</span>
              {pairs.map((p) => (
                <button
                  type="button"
                  key={iso(p.a) + p.n}
                  className="fly-alt-btn"
                  onClick={() => pickWith({ checkin: iso(p.a), checkout: iso(p.b) })}
                >
                  {dayLabel(p.a)} → {dayLabel(p.b)} · {p.n} {nightsWord(p.n)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="fly-opts" role="radiogroup" aria-labelledby="flyTitle">
        <button
          type="button"
          role="radio"
          aria-checked={sel === 'with'}
          className={'choice ' + (sel === 'with' ? 'on' : '')}
          disabled={!both}
          onClick={() => pickWith()}
        >
          <span className={'radio ' + (sel === 'with' ? 'on' : '')}>
            <i />
          </span>
          <span className="fly-opt-t">
            <span className="fly-opt-h">
              <strong>Добавить наш перелёт в заказ</strong>
              <span className="fly-price">+{fmt(pp)}&nbsp;€ с человека</span>
            </span>
            <span>
              {both
                ? (bySan
                    ? 'Прямой рейс Israir, багаж 20 кг. Трансфер из аэропорта организует санаторий. '
                    : 'Прямой рейс Israir, багаж 20 кг, трансфер у самолёта — всё в одной цене. ') +
                  `За ${n === 2 ? 'двоих' : n + ' гостей'}: ${fmt(pp * n)} €.`
                : 'Недоступно в ваши даты — выберите даты с рейсом выше.'}
            </span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={sel === 'own'}
          className={'choice ' + (sel === 'own' ? 'on' : '')}
          onClick={pickOwn}
        >
          <span className={'radio ' + (sel === 'own' ? 'on' : '')}>
            <i />
          </span>
          <span className="fly-opt-t">
            <strong>Билеты у меня уже есть или приеду сам</strong>
            <span>
              {bySan
                ? 'Другой рейс, другой аэропорт, на машине. Номер рейса передадим санаторию — его трансфер встретит вас.'
                : 'Другой рейс, другой аэропорт, на машине. Номер рейса можно указать ниже — трансфер встретит по нему.'}
            </span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={sel === 'help'}
          className={'choice ' + (sel === 'help' ? 'on' : '')}
          onClick={pickHelp}
        >
          <span className={'radio ' + (sel === 'help' ? 'on' : '')}>
            <i />
          </span>
          <span className="fly-opt-t">
            <strong>Не знаю, как лучше добраться</strong>
            <span>Консультант подберёт рейс и перезвонит. Заказ сохранится — можно продолжать.</span>
          </span>
        </button>
      </div>
      {sel === 'with' && both ? (
        <div className="fly-legs">
          <Leg dir="Туда" leg={LEG_THERE} date={inD} />
          <Leg dir="Обратно" leg={LEG_BACK} date={outD} />
          <span className="fly-legs-note">
            Билеты выпишем на имена гостей со следующего шага и пришлём на почту и в WhatsApp. Цена билетов фиксируется
            депозитом. [ПРИМЕР ДАННЫХ]
          </span>
        </div>
      ) : null}
    </section>
  );
}
