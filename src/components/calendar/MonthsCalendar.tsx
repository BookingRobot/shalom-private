import { Fragment } from 'react';
import './MonthsCalendar.css';

export const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** One day button; colours are computed by the page (selected range, flight days, sold-out days). */
export interface CalendarCell {
  day: string | number;
  sub?: string;
  /** flight from Israel on this day: shows a plane icon */
  fly?: boolean;
  bg?: string;
  border?: string;
  color?: string;
  subColor?: string;
  planeColor?: string;
  off?: boolean;
  cursor?: string;
  aria?: string;
  pick?: () => void;
  /** price-calendar variant: main text instead of the day number */
  text?: string;
  /** a chosen day (check-in / check-out): gets a check mark; by default a full green fill means chosen */
  sel?: boolean;
}

export interface CalendarMonth {
  title: string;
  cells: CalendarCell[];
}

interface Props {
  months: CalendarMonth[];
  onPrev?: () => void;
  onNext?: () => void;
  weekdays?: string[];
  prevLabel?: string;
  nextLabel?: string;
  /** tooltip of the plane icon */
  planeTitle?: string;
  gap?: number;
}

/** Month grids with ‹ › buttons — two side by side on a laptop, one under another on a phone. */
export function MonthsCalendar({
  months,
  onPrev,
  onNext,
  weekdays = WEEKDAYS_RU,
  prevLabel = 'Предыдущий месяц',
  nextLabel = 'Следующий месяц',
  planeTitle,
  gap = 16,
}: Props) {
  return (
    <div className="months-calendar" style={{ display: 'flex', alignItems: 'flex-start', gap: `${gap}px` }}>
      <button type="button" className="navbtn" onClick={onPrev} aria-label={prevLabel}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      {/* two months side by side — a stay across months is seen at once (stacked on a phone) */}
      <div className="mc-months">
        {months.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                fontFamily: 'Montserrat,Manrope,sans-serif',
                fontSize: '20px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {m.title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
              {weekdays.map((w, j) => (
                <div className="wd" key={'w' + j}>
                  {w}
                </div>
              ))}
              {m.cells.map((c, j) => (
                <Fragment key={j}>
                  <button
                    type="button"
                    className={'cell' + ((c.sel ?? c.bg === 'var(--green)') ? ' on' : '')}
                    onClick={c.pick}
                    disabled={!!c.off}
                    aria-label={c.aria}
                    style={{ background: c.bg, borderColor: c.border, color: c.color, cursor: c.cursor }}
                  >
                    {(c.sel ?? c.bg === 'var(--green)') && (
                      <span className="mc-check" aria-hidden="true">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                    )}
                    <span>{c.day}</span>
                    <small style={{ color: c.subColor }}>
                      {/* the « €» hides on a phone so the price fits; the legend says the prices are in € */}
                      {typeof c.sub === 'string' && /\s€$/.test(c.sub) ? (
                        <>
                          {c.sub.slice(0, -2)}
                          <span className="mc-cur"> €</span>
                        </>
                      ) : (
                        c.sub
                      )}
                    </small>
                    {c.fly && (
                      <span
                        style={{ position: 'absolute', top: '4px', insetInlineEnd: '5px', lineHeight: '0' }}
                        title={planeTitle}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={c.planeColor || 'var(--green)'}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                        </svg>
                      </span>
                    )}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="navbtn" onClick={onNext} aria-label={nextLabel}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
