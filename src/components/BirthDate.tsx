import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MONTHS, MONTHS_N } from '../lib/dates';
import './BirthDate.css';

const pad = (n: number) => String(n).padStart(2, '0');
const THIS_YEAR = new Date().getUTCFullYear();

/** «14 марта 1958» from «1958-03-14» */
export const birthLabel = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '';
};

/**
 * Date of birth in three taps: the year, the month, the day — the day saves the date and closes
 * the window (no «Готово»). Opens at the 1950s–60s, the usual decades of our guests; a chosen date
 * opens around its year. The same picker as on the guests step.
 */
export function BirthDateField({
  id,
  value,
  onChange,
  who = '',
}: {
  id: string;
  /** «YYYY-MM-DD» or '' */
  value: string;
  onChange: (v: string) => void;
  /** «пассажир 1» — shown in the window's title */
  who?: string;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const label = birthLabel(value);
  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        className={'input bd-btn' + (label ? '' : ' empty')}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <svg
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
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        {label || 'Выберите дату'}
      </button>
      {open
        ? createPortal(
            <div className="page">
              <BirthDateWindow
                value={value}
                who={who}
                onPick={(v) => {
                  onChange(v);
                  setOpen(false);
                  btn.current?.focus();
                }}
                onClose={() => {
                  setOpen(false);
                  btn.current?.focus();
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function BirthDateWindow({
  value,
  who,
  onPick,
  onClose,
}: {
  value: string;
  who: string;
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const m0 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const [y, setY] = useState<number | null>(m0 ? Number(m0[1]) : null);
  const [m, setM] = useState<number | null>(m0 ? Number(m0[2]) - 1 : null);
  const [step, setStep] = useState<'year' | 'month' | 'day'>('year');
  const [from, setFrom] = useState(m0 ? Math.floor(Number(m0[1]) / 10) * 10 - 10 : 1950);
  const d0 = m0 ? Number(m0[3]) : null;
  const x = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    x.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
    };
  }, []);

  const years: number[] = [];
  for (let k = from; k < from + 20; k++) years.push(k);
  const days: (number | null)[] = [];
  if (y != null && m != null) {
    const lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
    const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    for (let k = 0; k < lead; k++) days.push(null);
    for (let k = 1; k <= n; k++) days.push(k);
  }
  const cls = (s: typeof step, done: boolean) => (step === s ? 'on' : done ? 'done' : '');
  return (
    <div className="dob-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="bdTitle" className="dob">
        <div className="dob-head">
          <h2 id="bdTitle">Дата рождения{who ? <span> · {who}</span> : null}</h2>
          <button type="button" className="dob-x" onClick={onClose} ref={x} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="dob-crumbs">
          <button type="button" className={'dob-crumb ' + cls('year', y != null)} onClick={() => setStep('year')}>
            {y ?? 'Год'}
          </button>
          <span aria-hidden="true">›</span>
          <button
            type="button"
            className={'dob-crumb ' + cls('month', m != null)}
            onClick={() => y != null && setStep('month')}
            disabled={y == null}
          >
            {m != null ? MONTHS_N[m].toLowerCase() : 'Месяц'}
          </button>
          <span aria-hidden="true">›</span>
          <span className={'dob-crumb ' + cls('day', false)}>День</span>
        </div>
        <p className="dob-hint">
          {step === 'year' ? 'Выберите год' : step === 'month' ? 'Теперь месяц' : 'И день — дата сохранится сама'}
        </p>
        {step === 'year' ? (
          <div>
            <div className="dob-nav">
              <button
                type="button"
                className="dob-arrow"
                onClick={() => setFrom(from - 20)}
                aria-label="Более ранние годы"
              >
                ‹
              </button>
              <strong>
                {from}–{from + 19}
              </strong>
              <button
                type="button"
                className="dob-arrow"
                onClick={() => from + 20 <= THIS_YEAR && setFrom(from + 20)}
                aria-label="Более поздние годы"
              >
                ›
              </button>
            </div>
            <div className="dob-grid dob-grid-y">
              {years.map((k) => (
                <button
                  type="button"
                  key={k}
                  className={'pick' + (k === y ? ' on' : '')}
                  disabled={k > THIS_YEAR}
                  onClick={() => {
                    setY(k);
                    setStep('month');
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {step === 'month' ? (
          <div className="dob-grid dob-grid-m">
            {MONTHS_N.map((t, i) => (
              <button
                type="button"
                key={t}
                className={'pick' + (i === m ? ' on' : '')}
                onClick={() => {
                  setM(i);
                  setStep('day');
                }}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
        {step === 'day' && y != null && m != null ? (
          <div>
            <strong className="dob-month">
              {MONTHS_N[m]} {y}
            </strong>
            <div className="dob-grid dob-grid-d">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => (
                <span className="dob-wd" key={w}>
                  {w}
                </span>
              ))}
              {days.map((k, i) =>
                k == null ? (
                  <span key={'e' + i} />
                ) : (
                  <button
                    type="button"
                    key={k}
                    className={'pick' + (k === d0 && value.startsWith(y + '-' + pad(m + 1)) ? ' on' : '')}
                    onClick={() => onPick(y + '-' + pad(m + 1) + '-' + pad(k))}
                  >
                    {k}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
