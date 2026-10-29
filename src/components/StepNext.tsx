import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NextTip } from './NextTip';
import './StepNext.css';

export interface Missing {
  /** what is not chosen yet, in words: «как вы доберётесь» */
  label: string;
  /** where it is on the page (CSS selector) — we scroll there and light it up */
  target: string;
}

/**
 * A bar fixed at the bottom of the screen: the floating «Ваши пожелания» / «Свяжитесь со мной»
 * buttons step up above it (by its height, which grows with a hint) instead of covering «Далее».
 */
export function useLiftFabs(bar: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.toggle('has-stepbar', on);
    const el = bar.current;
    // the bar and the «what to do now» bubble floating above it
    const set = () => {
      if (!el) return root.style.setProperty('--stepbar-h', '76px');
      const tip = el.querySelector<HTMLElement>('.next-tip-float');
      const top = Math.min(el.getBoundingClientRect().top, tip ? tip.getBoundingClientRect().top - 6 : Infinity);
      const h = Math.max(el.offsetHeight, Math.round(el.getBoundingClientRect().bottom - top));
      root.style.setProperty('--stepbar-h', h + 'px');
    };
    set();
    if (!on || !el) return () => document.body.classList.remove('has-stepbar');
    const ro = 'ResizeObserver' in window ? new ResizeObserver(set) : null;
    ro?.observe(el);
    // the bubble comes and goes inside the bar
    const mo = new MutationObserver(() => requestAnimationFrame(set));
    mo.observe(el, { childList: true, subtree: true });
    window.addEventListener('resize', set);
    return () => {
      ro?.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', set);
      document.body.classList.remove('has-stepbar');
    };
  }, [bar, on]);
}

/** Scroll to a spot on the page and light it up for a moment. */
export function showSpot(target: string) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('step-flash');
  // restart the light-up
  void el.offsetWidth;
  el.classList.add('step-flash');
  window.setTimeout(() => el.classList.remove('step-flash'), 2400);
}

const TODO: Record<string, string> = {
  'не выбрали': 'выбрать',
  'не заполнили': 'заполнить',
  'не отметили': 'отметить',
};

/**
 * «Далее» of a checkout step: a row at the end of the page and, while that row is out of
 * sight, the same button in a bar fixed at the bottom of the screen.
 *
 * The green bubble over «Далее» says what to do now: while something is still missing —
 * what («Осталось выбрать: как вы доберётесь», «Показать ↑» takes the guest there); when
 * all is in — «Следующий шаг: нажмите «Далее»». A press with something missing opens the
 * yellow hint with the whole list.
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
  /** what is still not chosen (checked on every change on the page) */
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
  // what is still missing right now (for the bubble); null until the page has rendered
  const [gaps, setGaps] = useState<Missing[] | null>(null);
  const [tipX, setTipX] = useState(false);
  const check = useRef(missing);
  check.current = missing;

  // the bar shows while the row at the end of the page is out of sight
  useEffect(() => {
    const el = row.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setRowSeen(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLiftFabs(bar, !rowSeen);

  // forms on the steps are plain inputs: look again after every change, typing or click
  useEffect(() => {
    let t = 0;
    const again = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setGaps(check.current()), 60);
    };
    again();
    document.addEventListener('input', again, true);
    document.addEventListener('change', again, true);
    document.addEventListener('click', again, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('input', again, true);
      document.removeEventListener('change', again, true);
      document.removeEventListener('click', again, true);
    };
  }, []);

  const go = () => {
    const m = missing();
    setLeft(m);
    setGaps(m);
    if (!m.length) navigate(next.to);
  };

  const show = (m: Missing | undefined) => {
    if (!m) return;
    showSpot(m.target);
    setLeft([]);
  };

  const hint = left.length ? (
    <div className="step-hint ios-in" role="alert">
      <span className="step-hint-t">
        Вы ещё {verb}: <strong>{left.map((m) => m.label).join(', ')}</strong>. Поднимитесь выше и отметьте.
      </span>
      <span className="step-hint-b">
        <button type="button" className="step-hint-go" onClick={() => show(left[0])}>
          Показать ↑
        </button>
        <button type="button" className="step-hint-x" aria-label="Скрыть подсказку" onClick={() => setLeft([])}>
          ✕
        </button>
      </span>
    </div>
  ) : null;

  // the bubble: one at a time, over the «Далее» the guest can see; not with the yellow hint
  const ready = gaps !== null && gaps.length === 0;
  const tip =
    gaps === null || left.length || tipX ? null : (
      <NextTip float arrow="right" onClose={() => setTipX(true)}>
        {gaps.length ? (
          <>
            Осталось {TODO[verb] || 'выбрать'}: <strong>{gaps[0].label}</strong>
            <button type="button" className="next-tip-go" onClick={() => show(gaps[0])}>
              Показать ↑
            </button>
          </>
        ) : (
          <>
            Всё готово. Следующий шаг: <strong>нажмите «Далее»</strong>
          </>
        )}
      </NextTip>
    );

  const nextBtn = (cls: string) => (
    <button
      type="button"
      className={'btn btn-primary ' + cls + (ready && !tipX && !left.length ? ' next-pulse' : '')}
      onClick={go}
      data-to={next.to}
    >
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
          <span className="step-next-at">
            {rowSeen ? tip : null}
            {nextBtn(big ? 'step-next-big' : '')}
          </span>
        </div>
      </div>
      <div className={'step-bar' + (rowSeen ? '' : ' on')} aria-hidden={rowSeen} ref={bar}>
        <div className="step-bar-in">
          {!rowSeen ? hint : null}
          <div className="step-bar-row">
            <span className="step-bar-info">{info}</span>
            <span className="step-next-at">
              {!rowSeen ? tip : null}
              {nextBtn('step-next')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
