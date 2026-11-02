import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

/** «Загружаем…» shows only when the next page's code is still on its way for longer than this */
const SHOW_AFTER_MS = 200;
/** how often we look whether the new page has rendered */
const POLL_MS = 30;
/** give up waiting for the page's code after this (it renders anyway when it comes) */
const MAX_WAIT_MS = 4000;
const STEP_MS = 50;

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
 * Between pages: the new page's blocks come in one after another from the top. There is no
 * waiting on purpose — «Загружаем…» appears only when the next page's code really is not
 * here yet (a slow connection), and only after a moment, so it never flashes. Data a page
 * waits for shows its own state inside the page (AsyncBlock). A link may ask to glide down
 * to a part of the page afterwards (state.scrollTo = element id).
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
    const started = Date.now();
    // the old page is gone the moment the route changes; the new one renders when its code is here
    const pageRoot = () => document.querySelector<HTMLElement>('#root .page');
    later(() => {
      if (alive && !pageRoot()) setPhase('load');
    }, SHOW_AFTER_MS);
    const finish = () => {
      if (!alive) return;
      const root = pageRoot();
      if (!root && Date.now() - started < MAX_WAIT_MS) return later(finish, POLL_MS);
      setPhase((p) => (p === 'load' ? 'out' : ''));
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
    later(finish, 0);
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
