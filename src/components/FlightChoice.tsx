import { useEffect, useRef, useState } from 'react';
import { InfoTitle } from './InfoTip';
import { CheckIcon } from './icons';
import { useBooking } from '../context/BookingContext';
import { useHelp } from '../context/HelpContext';
import { TODAY } from '../data/demo';
import { FLIGHT_BACK, FLIGHT_THERE, isFlightDay } from '../data/flights';
import { WEEKDAYS_SHORT, addD, daysBetween, iso, nightsWord, shortDate, toD } from '../lib/dates';
import { fmt } from '../lib/format';
import { FLIGHT_PP, PACKAGE_TRANSFER_PP, persons } from '../lib/pricing';
import { transferBySanatorium } from '../data/transferPolicy';

const LEG_THERE = FLIGHT_THERE;
const LEG_BACK = FLIGHT_BACK;
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
 * after typing in passport names. Two answers like the transfer's «Да / Нет»; «Да»
 * slowly opens the flights and the price (or, when our flight does not fly on these
 * dates, the nearest dates with it), «Нет» opens nothing.
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
  // «Да» is chosen even when our flight does not fly on these dates (then: flights 'yes', no package yet)
  // nothing is marked until the guest answers here (a «с перелётом» tick in the search does not answer it)
  const sel = !booking.flightAsked
    ? ''
    : booking.flightPackage || booking.flights === 'yes'
      ? 'with'
      : booking.flights === 'no'
        ? 'own'
        : '';
  const askedHelp = booking.flightAsked && booking.flights === 'help';
  const pairs = both ? [] : flightPairs(inD, nights);

  // «Нет» after «Да»: the flights fold back up before they disappear
  const [folding, setFolding] = useState(false);
  const wasWith = useRef(sel === 'with');
  useEffect(() => {
    if (wasWith.current && sel !== 'with') {
      setFolding(true);
      const t = window.setTimeout(() => setFolding(false), 800);
      wasWith.current = false;
      return () => window.clearTimeout(t);
    }
    wasWith.current = sel === 'with';
  }, [sel]);

  // dates moved onto our flight days after «Да» (e.g. in the search): the flight joins the order
  useEffect(() => {
    if (both && booking.flights === 'yes' && !booking.flightPackage) update({ flightPackage: true });
  }, [both, booking.flights, booking.flightPackage, update]);

  const pickWith = (dates?: { checkin: string; checkout: string }) =>
    update(
      dates || both
        ? { ...(dates ? { ...dates, chosenDates: true } : {}), flightPackage: true, flights: 'yes', flightAsked: true }
        : { flightPackage: false, flights: 'yes', flightAsked: true },
    );
  const pickOwn = () => update({ flightPackage: false, flights: 'no', flightAsked: true });
  const pickHelp = () => {
    update({ flightPackage: false, flights: 'help', flightAsked: true });
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
  const withOn = sel === 'with',
    ownOn = sel === 'own';

  return (
    <section className="road-sec" aria-labelledby="flyTitle">
      <div className="road-h">
        <span className="road-num">1</span>
        <div>
          <h2 id="flyTitle">Перелёт Тель-Авив ⇄ Вильнюс</h2>
          <span>Сначала решим с рейсом — трансфер подстроим под него.</span>
        </div>
      </div>
      <div id="flyChoice" className="tr-q" role="radiogroup" aria-labelledby="flyTitle">
        <button
          type="button"
          role="radio"
          aria-checked={withOn}
          className={'choice fly-yes ' + (withOn ? 'on' : '')}
          onClick={() => pickWith()}
        >
          <span className={'radio ' + (withOn ? 'on' : '')}>
            <i />
          </span>
          <span className="fly-yes-t">
            <InfoTitle
              title="Да, добавить наш перелёт в заказ"
              info={
                (bySan
                  ? 'Прямой рейс Israir, багаж 20 кг. Трансфер из аэропорта организует санаторий.'
                  : 'Прямой рейс Israir, багаж 20 кг, трансфер у самолёта — всё в одной цене.') +
                ' Летает по вторникам, четвергам и воскресеньям.'
              }
              extra={both ? <span className="fly-pp">+{fmt(pp)} € / чел.</span> : undefined}
            />
            {!both ? (
              <span className="fly-yes-warn">В ваши даты нашего рейса нет — покажем ближайшие даты с ним</span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={ownOn}
          className={'choice ' + (ownOn ? 'on' : '')}
          onClick={pickOwn}
        >
          <span className={'radio ' + (ownOn ? 'on' : '')}>
            <i />
          </span>
          <InfoTitle
            title="Нет, билеты уже есть"
            info={
              bySan
                ? 'Или приеду сам: другой рейс, другой аэропорт, на машине. Номер рейса передадим санаторию — его трансфер встретит вас.'
                : 'Или приеду сам: другой рейс, другой аэропорт, на машине. Номер рейса можно указать ниже — трансфер встретит по нему.'
            }
          />
        </button>
      </div>
      <button type="button" className={'fly-help ' + (askedHelp ? 'on' : '')} onClick={pickHelp}>
        {askedHelp ? (
          <>
            <CheckIcon size={16} color="#1F5F4A" strokeWidth={2.6} />
            Консультант подберёт рейс и перезвонит — заказ сохранится, можно продолжать
          </>
        ) : (
          'Не знаю, как лучше добраться?'
        )}
      </button>
      {withOn || folding ? (
        <div className={'fly-reveal' + (withOn ? '' : ' closing')}>
          <div className="fly-reveal-in">
            {both ? (
              <div className="fly-panel">
                <div className="fly-sum">
                  <strong>
                    {fmt(pp)} € с человека
                    {n > 1 ? (
                      <span>
                        {' '}
                        · за {n === 2 ? 'двоих' : n + ' гостей'} {fmt(pp * n)} €
                      </span>
                    ) : null}
                  </strong>
                  <span>
                    {bySan
                      ? 'Прямой рейс туда и обратно, багаж 20 кг. Из аэропорта вас заберёт санаторий.'
                      : 'Прямой рейс туда и обратно, багаж 20 кг, трансфер у самолёта.'}
                  </span>
                </div>
                <div className="ios-sec">
                  <span className="ios-cap">Ваши рейсы · Israir, прямые</span>
                  <div className="ios-list">
                    <Leg dir="Туда" leg={LEG_THERE} date={inD} />
                    <Leg dir="Обратно" leg={LEG_BACK} date={outD} />
                  </div>
                  <span className="ios-foot">
                    Билеты выпишем на имена гостей со следующего шага и пришлём на почту и в WhatsApp. Цена билетов
                    фиксируется депозитом. [ПРИМЕР ДАННЫХ]
                  </span>
                </div>
              </div>
            ) : (
              <div className="fly-panel">
                <p className="ios-note" role="status">
                  <span className="ios-note-i" aria-hidden="true">
                    !
                  </span>
                  <span>
                    Наш прямой рейс Israir летает по вторникам, четвергам и воскресеньям — в ваши даты его нет.
                    {pairs.length ? ' Выберите ближайшие даты с рейсом:' : ' Консультант подберёт другой рейс.'}
                  </span>
                </p>
                <div className="ios-list">
                  {dayRow('Туда', inD, inOk, LEG_THERE)}
                  {dayRow('Обратно', outD, outOk, LEG_BACK, true)}
                </div>
                {pairs.length ? (
                  <div className="ios-sec" id="flyAlt">
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
                            {/* nights and flight numbers wait under «i» */}
                            <InfoTitle
                              title={
                                <strong>
                                  {dayLabel(p.a)} → {dayLabel(p.b)}
                                </strong>
                              }
                              info={
                                p.n +
                                ' ' +
                                nightsWord(p.n) +
                                ' · рейсы ' +
                                LEG_THERE.no +
                                ' и ' +
                                LEG_BACK.no +
                                ' (Israir, прямые)'
                              }
                            />
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
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
