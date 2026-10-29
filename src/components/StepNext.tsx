import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StepNext.css';

export interface Missing {
  /** what is not chosen yet, in words: «как вы доберётесь» */
  label: string;
  /** where it is on the page (CSS selector) — we scroll there and light it up */
  target: string;
}

/**
 * «Далее» of a checkout step: a row at the end of the page and, while that row is out of
 * sight, the same button in a bar fixed at the bottom of the screen. When something is not
 * chosen yet, either button says what and where, and «Показать» takes the guest there.
 */
export function StepNext({
  back,
  next,
  missing = () => [],
  info,
  big = true,
  verb = 'не выбрали',
}: {
  /** «не выбрали» / «не заполнили» / «не отметили» */
  verb?: string;
  back?: { to: string; label: string };
  next: { to: string; label: ReactNode; icon?: ReactNode };
  /** checked on click: what is still not chosen */
  missing?: () => Missing[];
  /** a short line for the bar (the total, the step) */
  info?: ReactNode;
  big?: boolean;
}) {
  const navigate = useNavigate();
  const row = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [rowSeen, setRowSeen] = useState(true);
  const [left, setLeft] = useState<Missing[]>([]);

  // the bar shows while the row at the end of the page is out of sight
  useEffect(() => {
    const el = row.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setRowSeen(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // floating help buttons step up above the bar, by its height (it grows with a hint)
  useEffect(() => {
    const on = !rowSeen;
    const root = document.documentElement;
    document.body.classList.toggle('has-stepbar', on);
    const el = bar.current;
    const set = () => root.style.setProperty('--stepbar-h', (el ? el.offsetHeight : 76) + 'px');
    set();
    const ro = on && el && 'ResizeObserver' in window ? new ResizeObserver(set) : null;
    if (ro && el) ro.observe(el);
    return () => {
      ro?.disconnect();
      document.body.classList.remove('has-stepbar');
    };
  }, [rowSeen]);

  const go = () => {
    const m = missing();
    setLeft(m);
    if (!m.length) navigate(next.to);
  };

  const show = () => {
    const first = left[0];
    const el = first && document.querySelector<HTMLElement>(first.target);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('step-flash');
    // restart the light-up
    void el.offsetWidth;
    el.classList.add('step-flash');
    window.setTimeout(() => el.classList.remove('step-flash'), 2400);
    setLeft([]);
  };

  const hint = left.length ? (
    <div className="step-hint ios-in" role="alert">
      <span className="step-hint-t">
        Вы ещё {verb}: <strong>{left.map((m) => m.label).join(', ')}</strong>. Поднимитесь выше и отметьте.
      </span>
      <span className="step-hint-b">
        <button type="button" className="step-hint-go" onClick={show}>
          Показать ↑
        </button>
        <button type="button" className="step-hint-x" aria-label="Скрыть подсказку" onClick={() => setLeft([])}>
          ✕
        </button>
      </span>
    </div>
  ) : null;

  const nextBtn = (cls: string) => (
    <button type="button" className={'btn btn-primary ' + cls} onClick={go} data-to={next.to}>
      {next.icon}
      {next.label}
    </button>
  );

  return (
    <>
      <div className="step-row" ref={row}>
        {rowSeen ? hint : null}
        <div className="step-row-btns">
          {back ? (
            <Link className="btn btn-secondary" to={back.to}>
              {back.label}
            </Link>
          ) : (
            <span />
          )}
          {nextBtn(big ? 'step-next-big' : '')}
        </div>
      </div>
      <div className={'step-bar' + (rowSeen ? '' : ' on')} aria-hidden={rowSeen} ref={bar}>
        <div className="step-bar-in">
          {!rowSeen ? hint : null}
          <div className="step-bar-row">
            <span className="step-bar-info">{info}</span>
            {nextBtn('step-next')}
          </div>
        </div>
      </div>
    </>
  );
}
