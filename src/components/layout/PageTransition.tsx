import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

/** how long the short «loading» shows between pages (the real site will load data here) */
const LOAD_MS = 480;
const STEP_MS = 70;

/**
 * The visible blocks of the new page, top to bottom: big wrappers are opened up so their
 * parts (titles, questions, cards) come in one after another, not as one slab.
 */
function pickBlocks(root: HTMLElement) {
  const vh = window.innerHeight;
  const out: HTMLElement[] = [];
  const walk = (el: HTMLElement, depth: number) => {
    for (const c of Array.from(el.children) as HTMLElement[]) {
      const cs = getComputedStyle(c);
      if (cs.position === 'fixed' || cs.display === 'none' || cs.display === 'contents') continue;
      const r = c.getBoundingClientRect();
      if (r.height < 4 || r.top > vh * 1.1) continue;
      const parts = (Array.from(c.children) as HTMLElement[]).filter(
        (k) => k.getBoundingClientRect().height > 4 && getComputedStyle(k).position !== 'fixed',
      );
      if (depth < 4 && parts.length > 1 && r.height > vh * 0.4) walk(c, depth + 1);
      else out.push(c);
    }
  };
  walk(root, 0);
  const top = (e: HTMLElement) => e.getBoundingClientRect();
  return out.sort((a, b) => top(a).top - top(b).top || top(a).left - top(b).left);
}

function reveal(root: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blocks = pickBlocks(root);
  blocks.forEach((el, i) => {
    // a block holding fixed parts (the «Далее» bar, bubbles) only fades: a shift would move them too
    const fixedInside = !!el.querySelector('.step-bar, .next-tip, [style*="position: fixed"]');
    el.style.setProperty('--rv', String(Math.min(i, 12)));
    el.classList.add('rv-in');
    if (fixedInside) el.classList.add('rv-fade');
  });
  window.setTimeout(
    () =>
      blocks.forEach((el) => {
        el.classList.remove('rv-in', 'rv-fade');
        el.style.removeProperty('--rv');
      }),
    12 * STEP_MS + 700,
  );
}

/**
 * Between pages: a short soft «loading» with a spinner, then the new page's blocks come in
 * one after another from the top. A link may ask to glide down to a part of the page
 * afterwards (state.scrollTo = element id), e.g. the search → the list of sanatoriums.
 */
export function PageTransition() {
  const loc = useLocation();
  const [phase, setPhase] = useState<'' | 'load' | 'out'>('');
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let alive = true;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    setPhase('load');
    const started = Date.now();
    const finish = () => {
      if (!alive) return;
      const root = document.querySelector<HTMLElement>('#root .page');
      // the page's code may still be on its way: wait for it (at most a few seconds)
      if (!root && Date.now() - started < 4000) return later(finish, 50);
      setPhase('out');
      if (root) reveal(root);
      later(() => setPhase(''), 260);
      const to = (loc.state as { scrollTo?: string } | null)?.scrollTo;
      if (to)
        later(() => {
          const el = document.getElementById(to);
          if (!el) return;
          const y = el.getBoundingClientRect().top + window.scrollY - 16;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 520);
    };
    later(finish, LOAD_MS);
    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
    // a new page only (not every filter in the address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  if (!phase) return null;
  return (
    <div className={'pt-load' + (phase === 'out' ? ' out' : '')} role="status" aria-live="polite">
      <span className="pt-spin" aria-hidden="true" />
      <span className="pt-t">Загружаем…</span>
    </div>
  );
}
