import { useEffect, useRef, useState } from 'react';
import { MonthsCalendar, type CalendarCell, type CalendarMonth } from './calendar/MonthsCalendar';
import { TODAY } from '../data/demo';
import { isFlightDay } from '../data/flights';
import { nightFree, stayFree } from '../data/availability';
import { MONTHS_N, WEEKDAYS_SHORT, addD, daysBetween, iso, nightsWord, shortDate, toD } from '../lib/dates';
import './FlightDates.css';

const dayLabel = (d: Date) => WEEKDAYS_SHORT[d.getUTCDay()].toLowerCase() + ', ' + shortDate(d);

/**
 * «Выбрать даты под наш рейс»: a calendar over the step. Only the days our flight flies (✈) can be
 * taken — the arrival and the way home — and only nights with places in this sanatorium. The new
 * dates go into the order right here; the step shows the flights at once.
 */
export function FlightDates({
  hotelId,
  checkin,
  nights,
  onApply,
  onClose,
}: {
  hotelId: string;
  checkin: string;
  nights: number;
  onApply: (d: { checkin: string; checkout: string }) => void;
  onClose: () => void;
}) {
  const start = toD(checkin);
  const [ym, setYm] = useState({ y: start.getUTCFullYear(), m: start.getUTCMonth() });
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    closeBtn.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
    };
  }, []);

  const first = addD(TODAY, 3);
  const canIn = (d: Date) => d >= first && isFlightDay(d) && nightFree(hotelId, iso(d));
  const canOut = (d: Date) => !!a && d > toD(a) && isFlightDay(d) && stayFree(hotelId, a, daysBetween(toD(a), d));

  const month = (y: number, m: number): CalendarMonth => {
    const d1 = new Date(Date.UTC(y, m, 1));
    const lead = (d1.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: CalendarCell[] = [];
    for (let i = 0; i < lead; i++) cells.push({ day: '', off: true, cursor: 'default' });
    for (let n = 1; n <= days; n++) {
      const d = new Date(Date.UTC(y, m, n));
      const id = iso(d);
      const isA = id === a,
        isB = id === b;
      const inRange = !!a && !!b && id > a && id < b;
      const ok = a && !b ? canOut(d) || canIn(d) : canIn(d);
      const fly = isFlightDay(d) && d >= first;
      cells.push({
        day: n,
        fly,
        sub: isA ? 'туда' : isB ? 'обратно' : '',
        off: !ok && !isA && !isB,
        bg: isA || isB ? 'var(--green)' : inRange ? 'var(--green-soft)' : undefined,
        color: isA || isB ? 'var(--paper)' : ok ? 'var(--ink)' : 'var(--muted-2)',
        subColor: isA || isB ? 'var(--paper)' : undefined,
        planeColor: isA || isB ? 'var(--paper)' : undefined,
        cursor: ok ? 'pointer' : 'default',
        aria: dayLabel(d) + (fly ? ', есть наш рейс' : ', нашего рейса нет'),
        pick: () => {
          if (a && !b && canOut(d)) setB(id);
          else if (canIn(d)) {
            setA(id);
            setB('');
          }
        },
      });
    }
    return { title: MONTHS_N[m] + ' ' + y, cells };
  };
  const next = (k: number) => {
    const d = new Date(Date.UTC(ym.y, ym.m + k, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  };
  const m2 = next(1);
  const n = a && b ? daysBetween(toD(a), toD(b)) : 0;

  return (
    <div className="fd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fd" role="dialog" aria-modal="true" aria-labelledby="fdTitle">
        <div className="fd-head">
          <span>
            <h2 id="fdTitle">Даты под наш рейс</h2>
            <span className="fd-sub">
              Прямой рейс Israir летает по вторникам, четвергам и воскресеньям — дни с ✈ можно выбрать.
            </span>
          </span>
          <button type="button" className="fd-x" onClick={onClose} ref={closeBtn} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="fd-body">
          <p className="fd-step" role="status">
            {!a ? (
              <>
                <strong>1.</strong> Выберите день прилёта в Литву
              </>
            ) : !b ? (
              <>
                <strong>2.</strong> Теперь день вылета домой — после {dayLabel(toD(a))}
              </>
            ) : (
              <>
                <strong>{dayLabel(toD(a))}</strong> → <strong>{dayLabel(toD(b))}</strong> · {n} {nightsWord(n)}
                {n !== nights ? <span className="fd-was"> (было {nights})</span> : null}
              </>
            )}
          </p>
          <MonthsCalendar
            months={[month(ym.y, ym.m), month(m2.y, m2.m)]}
            onPrev={() => setYm(next(-1))}
            onNext={() => setYm(next(1))}
            planeTitle="Наш прямой рейс"
          />
        </div>
        <div className="fd-foot">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!a || !b}
            onClick={() => a && b && onApply({ checkin: a, checkout: b })}
          >
            {a && b ? 'Выбрать эти даты' : 'Выберите обе даты'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Оставить мои даты
          </button>
        </div>
      </div>
    </div>
  );
}
