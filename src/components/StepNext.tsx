import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASKET_NEXT, openBasket } from '../lib/basket';
import { useBooking } from '../context/BookingContext';
import { stepDoneBefore } from '../lib/steps';
import { track } from '../lib/analytics';
import { NextTip } from './NextTip';
import './StepNext.css';

export interface Missing {
  /** what is not chosen yet, in words: «как вы доберётесь» */
  label: string;
  /** where it is on the page (CSS selector) — we scroll there and light it up */
  target: string;
  /** what to do with it, when it differs from the step's verb: «заполнить», «отметить» */
  todo?: string;
}

/**
 * ONE NOTIFICATION CHANNEL on a checkout step — the rule every floating thing follows:
 *
 *  1. Only one message lives next to «Далее» at a time, and it sits right above the button:
 *     the green bubble («Осталось выбрать…» / «Всё готово») — or, after a press with gaps,
 *     the yellow list in its place. Never both (see `tip` and `hint` below).
 *  2. Nothing else may stand on the bottom bar. The bar publishes its height as
 *     `--stepbar-h` and the body gets `has-stepbar` while the bar is shown; every fixed
 *     element at the bottom of the screen (the «Ваши пожелания» pill, the help button, the
 *     toasts) reads them and steps up by that height (StepNext.css). The «i» balloons are
 *     in the page flow, not floating, so they never reach the bar; `scroll-padding-bottom`
 *     keeps the spot «Показать ↑» scrolls to above the bar.
 *  3. A new floating element gets the same lift (add its class to the rule in StepNext.css)
 *     instead of its own position.
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

// focusing these opens no on-screen keyboard
const NO_KEYBOARD = /^(checkbox|radio|button|submit|reset|range|color|file|image|hidden)$/;
const opensKeyboard = (el: EventTarget | null) =>
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement ||
  (el instanceof HTMLInputElement && !NO_KEYBOARD.test(el.type));

/**
 * Phone: while the guest types, the on-screen keyboard is up and the bar would sit right on it
 * (or jump around with the scroll). The body gets `kb-open` while a text field has the focus;
 * StepNext.css slides the bar away for that time on phones only (never on a laptop). It comes
 * back 150 ms after the field loses the focus — moving on to the next field keeps it away.
 */
export function useKeyboardOpen() {
  useEffect(() => {
    const body = document.body;
    let t = 0;
    const on = (e: FocusEvent) => {
      if (!opensKeyboard(e.target)) return;
      window.clearTimeout(t);
      body.classList.add('kb-open');
    };
    const off = (e: FocusEvent) => {
      if (!opensKeyboard(e.target)) return;
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (!opensKeyboard(document.activeElement)) body.classList.remove('kb-open');
      }, 150);
    };
    document.addEventListener('focusin', on);
    document.addEventListener('focusout', off);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('focusin', on);
      document.removeEventListener('focusout', off);
      body.classList.remove('kb-open');
    };
  }, []);
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
  onAttempt,
}: {
  /** «не выбрали» / «не заполнили» / «не отметили» */
  verb?: string;
  back?: { to: string; label: string };
  /** «Далее» was pressed (not the hint's own check): forms may now show every field's error */
  onAttempt?: () => void;
  next: { to: string; label: ReactNode; icon?: ReactNode };
  /** what is still not chosen (checked on every change on the page) */
  missing?: () => Missing[];
  /** a short line for the bar (the total, the step) */
  info?: ReactNode;
  big?: boolean;
}) {
  const navigate = useNavigate();
  const { booking, update } = useBooking();
  const row = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [rowSeen, setRowSeen] = useState(true);
  const [left, setLeft] = useState<Missing[]>([]);
  // what is still missing right now (for the bubble); null until the page has rendered
  const [gaps, setGaps] = useState<Missing[] | null>(null);
  const [tipX, setTipX] = useState(false);
  const hadGaps = useRef(false);
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
  useKeyboardOpen();

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

  // all filled in after the bubble stepped aside: it comes back once with «Всё готово … «Далее»»
  useEffect(() => {
    if (!gaps) return;
    if (gaps.length) hadGaps.current = true;
    else if (hadGaps.current) {
      hadGaps.current = false;
      setTipX(false);
    }
  }, [gaps]);

  const go = () => {
    onAttempt?.();
    const m = missing();
    setLeft(m);
    setGaps(m);
    // «Далее» with something still missing: the hint comes back and shows what
    setTipX(false);
    if (!m.length) {
      // this step is done: the next one may open (StepGuard)
      const done = stepDoneBefore(next.to);
      if (done && done > booking.progress) update({ progress: done });
      if (done) track('Step done', { step: done });
      navigate(next.to);
    }
  };

  // phone: the order box sits behind a basket here; its «Продолжить» is the same as «Далее»
  const [hasBasket, setHasBasket] = useState(false);
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    setHasBasket(!!document.querySelector('.order-aside'));
    const n = () => goRef.current();
    window.addEventListener(BASKET_NEXT, n);
    return () => window.removeEventListener(BASKET_NEXT, n);
  }, []);
  const basket = (cls: string) =>
    hasBasket ? (
      <button type="button" className={'step-basket ' + cls} onClick={openBasket} aria-label="Ваш заказ">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8h14l-1.3 10.4a2 2 0 0 1-2 1.6H8.3a2 2 0 0 1-2-1.6zM9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        {info ? <span className="step-basket-t">{info}</span> : <span className="step-basket-t">Ваш заказ</span>}
      </button>
    ) : null;

  const show = (m: Missing | undefined) => {
    if (!m) return;
    showSpot(m.target);
    // took the guest there: the bubble steps aside and lets them fill it in quietly
    // (it is back at the next «Далее» if something is still missing)
    setLeft([]);
    setTipX(true);
  };

  const hint = left.length ? (
    <div className="step-hint ios-in" role="alert">
      <span className="step-hint-t">
        {left.some((m) => m.todo) ? (
          <>
            Осталось: <strong>{left.map((m) => (m.todo || TODO[verb] || 'выбрать') + ' ' + m.label).join(', ')}</strong>
            .
          </>
        ) : (
          <>
            Вы ещё {verb}: <strong>{left.map((m) => m.label).join(', ')}</strong>.
          </>
        )}{' '}
        Нажмите «Показать».
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

  // the bubble: one at a time, over the «Далее» the guest can see; never together with the
  // yellow list — the yellow one takes its place (rule 1 above)
  const ready = gaps !== null && gaps.length === 0;
  const tip =
    gaps === null || left.length || tipX ? null : (
      <NextTip float arrow="right" onClose={() => setTipX(true)}>
        {gaps.length ? (
          <>
            Осталось {gaps[0].todo || TODO[verb] || 'выбрать'}: <strong>{gaps[0].label}</strong>
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

  // phone (≤ 760 px, where the bubble is hidden): one quiet line inside the bar instead —
  // the first thing still missing and «Показать ↑». Never together with the yellow list
  // (rule 1 above); when all is in, nothing extra — «Далее» itself is the cue (StepNext.css
  // hides the line on a laptop, which keeps the bubble)
  const gap = gaps?.[0];
  const line =
    gap && !left.length ? (
      <div className="step-left" role="status">
        <span className="step-left-t">
          Осталось {gap.todo || TODO[verb] || 'выбрать'}: <strong>{gap.label}</strong>
        </span>
        <button type="button" className="step-left-go" onClick={() => show(gap)}>
          Показать ↑
        </button>
      </div>
    ) : null;

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
        {rowSeen ? line : null}
        {basket('step-basket-row')}
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
          {!rowSeen ? line : null}
          <div className="step-bar-row">
            <span className={'step-bar-info' + (hasBasket ? ' has-basket' : '')}>{info}</span>
            {basket('step-basket-bar')}
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
