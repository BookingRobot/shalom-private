/**
 * Funnel analytics (docs/analytics.md): which step guests reach and where they leave.
 * Plausible — no cookies and no personal data, so no cookie banner is needed. Switched on by
 * VITE_PLAUSIBLE_DOMAIN at build time; without it events only go to the console in dev.
 * Never send names, phones, e-mails or card data — only the step and plain choices.
 */

export type FunnelEvent =
  | 'Search'
  | 'Rooms opened'
  | 'Room chosen'
  | 'Programme chosen'
  | 'Step done'
  | 'Deposit paid'
  | 'Contact me'
  | 'Share offer'
  | 'Help opened'
  | 'Tickets searched'
  | 'Tickets paid';

type Props = Record<string, string | number | boolean>;
type PlausibleFn = ((event: string, opts?: { props?: Props; u?: string }) => void) & { q?: unknown[] };

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
let started = false;

/** Loads the counter once (manual pageviews: the site is one page that changes its address). */
export function startAnalytics() {
  if (started || !DOMAIN || typeof document === 'undefined' || navigator.webdriver) return;
  started = true;
  // events sent before the script arrives wait in this queue
  window.plausible =
    window.plausible ||
    (function (this: unknown, ...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    } as PlausibleFn);
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = DOMAIN;
  s.src = 'https://plausible.io/js/script.manual.js';
  document.head.appendChild(s);
}

/** One page view (called on every route change). Query strings are dropped: they may hold an order. */
export function trackPage(path: string) {
  if (!DOMAIN || !window.plausible) return;
  // an order's code is the guest's own: count all orders as one page
  const clean = path.replace(/^\/order\/[^/]+/, '/order/:code');
  window.plausible('pageview', { u: window.location.origin + clean });
}

/** A step of the funnel. */
export function track(event: FunnelEvent, props?: Props) {
  if (DOMAIN && window.plausible) window.plausible(event, props ? { props } : undefined);
  else if (import.meta.env.DEV) console.debug('[analytics]', event, props ?? '');
}
