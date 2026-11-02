import type { Booking } from '../data/booking';
import { t } from '../i18n/t';

/** The four booking steps in order, by route. */
export const STEP_ROUTES = ['/rooms', '/transfer', '/guests', '/payment', '/done'] as const;
export type StepRoute = (typeof STEP_ROUTES)[number];

/** Step number of a route (1–4, /done = 5), or 0 when it is not a step. */
export const stepOf = (path: string) => STEP_ROUTES.indexOf(path as StepRoute) + 1;

/** Opening this route means the step before it is finished: that step's number, or null. */
export function stepDoneBefore(path: string): Booking['progress'] | null {
  const n = stepOf(path);
  return n >= 2 ? ((n - 1) as Booking['progress']) : null;
}

/**
 * What a step needs before it can open, and where to send the guest otherwise
 * (StepGuard). The sample order in demo mode has progress 4, so every step opens.
 */
export function stepBlocker(path: string, b: Booking): { to: string; notice: string } | null {
  const n = stepOf(path);
  if (n === 0) return null;
  const hasRoom = !!(b.hotelId && b.roomId && b.checkin && b.checkout);
  if (n === 1 && !hasRoom) return { to: '/results', notice: t('steps.needRoom') };
  if (n >= 2 && (!hasRoom || !b.programId)) return { to: '/rooms', notice: t('steps.needProgram') };
  if (n >= 3 && b.progress < 2) return { to: '/transfer', notice: t('steps.needRoad') };
  if (n >= 4 && b.progress < 3) return { to: '/guests', notice: t('steps.needGuests') };
  if (n >= 5 && b.progress < 4) return { to: '/payment', notice: t('steps.notPaid') };
  return null;
}
