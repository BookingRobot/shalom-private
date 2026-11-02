import { useEffect, useRef, type ReactNode } from 'react';
import './CalendarDialog.css';

/**
 * The one window every date calendar opens in — the search, the sanatorium's «Когда дешевле?»,
 * «Даты под наш рейс» and the flight tickets: the same head (title, one line of help, «Закрыть»),
 * the same month grids (MonthsCalendar, passed as children), the same foot (what is chosen and
 * the buttons). A fix to tap sizes or layout is made here once. Escape and a tap outside close
 * it; the page under it does not scroll. (The date of birth has its own picker: BirthDate.)
 */
export function CalendarDialog({
  title,
  hint,
  note,
  tabs,
  children,
  selection,
  actions,
  onClose,
  className = '',
  canvas,
}: {
  title: ReactNode;
  /** one line under the title: what can be picked */
  hint?: ReactNode;
  /** a second line (e.g. the room the dates are for) */
  note?: ReactNode;
  /** a switch above the months (exact / flexible dates) */
  tabs?: ReactNode;
  /** the month grids and their legend */
  children: ReactNode;
  /** the foot's left side: what is chosen («Заезд → Выезд · Итого») */
  selection?: ReactNode;
  /** the foot's buttons */
  actions?: ReactNode;
  onClose: () => void;
  /** extra class on the window (pages and the canvas script find their calendar by it) */
  className?: string;
  /** data-canvas name for the canvas boards */
  canvas?: string;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
    };
  }, []);
  return (
    <div className="cd-overlay" data-canvas={canvas} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'cal-dlg cd ' + className} role="dialog" aria-modal="true" aria-labelledby="cdTitle">
        <div className="cd-head">
          <div className="cd-title">
            <h2 id="cdTitle">{title}</h2>
            {hint ? <span className="cd-hint">{hint}</span> : null}
            {note ? <span className="cd-note">{note}</span> : null}
          </div>
          <button
            type="button"
            className="btn btn-secondary cd-close"
            onClick={onClose}
            ref={closeBtn}
            aria-label="Закрыть"
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
            <span className="cd-close-t">Закрыть</span>
          </button>
        </div>
        {tabs}
        <div className="cd-body">{children}</div>
        {selection || actions ? (
          <div className="cd-foot">
            {selection ? <div className="cd-sel">{selection}</div> : null}
            {actions ? <div className="cd-btns">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** «Заезд 9 ноября → Выезд 18 ноября · Итого 9 ночей» — the same in every calendar's foot. */
export function RangeSummary({
  inLabel = 'Заезд',
  outLabel = 'Выезд',
  from,
  to,
  total,
  extra,
}: {
  inLabel?: string;
  outLabel?: string;
  from: ReactNode;
  to: ReactNode;
  total?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <>
      <div className="cd-col">
        <span className="lbl">{inLabel}</span>
        <strong>{from}</strong>
      </div>
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--green)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      <div className="cd-col">
        <span className="lbl">{outLabel}</span>
        <strong>{to}</strong>
      </div>
      {total ? (
        <div className="cd-col">
          <span className="lbl">Итого</span>
          <strong className="cd-green">{total}</strong>
        </div>
      ) : null}
      {extra}
    </>
  );
}
