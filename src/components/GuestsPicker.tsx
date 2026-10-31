import { useEffect, useId, useRef, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useHelp } from '../context/HelpContext';

const LIMITS = { adults: [1, 4], children: [0, 3] } as const;

const adultsWord = (n: number) => (n === 1 ? 'взрослый' : 'взрослых');
const childrenWord = (n: number) => (n === 1 ? 'ребёнок' : 'ребёнка');
const NB = ' ';

export const guestsLabel = (adults: number, children: number) =>
  `${adults} ${adultsWord(adults)}` + (children ? `, ${children} ${childrenWord(children)}` : '');

/**
 * Search-form guests field: a button showing "2 взрослых", opening a small pop-over
 * with +/− steppers — adults 1–4 (default 2), children 0–3 (default 0).
 * Reads and writes the shared booking, so every page sees the same guests.
 */
export function GuestsPicker({
  inputClass = 'input',
  inline = false,
}: {
  inputClass?: string;
  /** compact "ГОСТИ · 2 взрослых ▾" trigger for info bars (hotel page) instead of a form field */
  inline?: boolean;
}) {
  const { booking, update } = useBooking();
  const help = useHelp();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const popId = useId();
  const { adults, children } = booking;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const step = (key: 'adults' | 'children', d: number) => {
    const [min, max] = LIMITS[key];
    const next = booking[key] + d;
    if (next >= min && next <= max) update({ [key]: next });
  };

  const row = (key: 'adults' | 'children', title: string, sub: string, who: string) => {
    const [min, max] = LIMITS[key];
    const n = booking[key];
    return (
      <div className="gp-row">
        <span className="gp-name">
          <strong>{title}</strong>
          <span>{sub}</span>
        </span>
        <span className="gp-step">
          <button
            type="button"
            className="gp-btn"
            aria-label={`Меньше: ${who}`}
            disabled={n <= min}
            onClick={() => step(key, -1)}
          >
            −
          </button>
          <strong className="gp-num" aria-live="polite">
            {n}
          </strong>
          <button
            type="button"
            className="gp-btn"
            aria-label={`Больше: ${who}`}
            disabled={n >= max}
            onClick={() => step(key, 1)}
          >
            +
          </button>
        </span>
      </div>
    );
  };

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      {inline ? (
        <button
          type="button"
          id="guests"
          className="gp-inline"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popId}
          onClick={() => setOpen(!open)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span className="gp-inline-t">
            <span className="gp-inline-l">Гости</span>
            <strong>{guestsLabel(adults, children)}</strong>
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : (
        <>
          <svg
            className="fieldico"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <button
            type="button"
            id="guests"
            className={`${inputClass} datebtn`}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={popId}
            title={guestsLabel(adults, children)}
            onClick={() => setOpen(!open)}
            style={{ paddingRight: '34px', lineHeight: '1.15' }}
          >
            {/* children go on a small second line so the narrow field never wraps mid-phrase */}
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>
              {adults}
              {NB}
              {adultsWord(adults)}
            </span>
            {children ? (
              <span
                style={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                }}
              >
                + {children}
                {NB}
                {childrenWord(children)}
              </span>
            ) : null}
          </button>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '12px',
              top: '16px',
              pointerEvents: 'none',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </>
      )}
      {open ? (
        <div id={popId} role="dialog" aria-label="Гости" className="gp-pop" data-canvas="guests-pop">
          {row('adults', 'Взрослые', 'от 1 до 4', 'взрослые')}
          <div className="gp-sep" />
          {row('children', 'Дети', 'до 17 лет · до 3', 'дети')}
          <button
            type="button"
            className="gp-more"
            onClick={() => {
              setOpen(false);
              help.open();
            }}
          >
            Нужно 2 номера и больше? Подберёт консультант
          </button>
          <button type="button" className="btn btn-primary gp-done" onClick={() => setOpen(false)}>
            Готово
          </button>
        </div>
      ) : null}
    </div>
  );
}
