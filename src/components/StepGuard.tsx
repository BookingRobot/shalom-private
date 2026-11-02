import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { stepBlocker } from '../lib/steps';
import './StepGuard.css';

/**
 * A booking step opens only when the one before it is done (lib/steps.ts). A link from an
 * old tab or an e-mail that skips ahead lands on the right earlier step with one line
 * saying why («Сначала выберите номер»). The sample order in demo mode passes every check.
 */
export function StepGuard({ children }: { children: ReactNode }) {
  const { booking } = useBooking();
  const loc = useLocation();
  const block = stepBlocker(loc.pathname, booking);
  if (block) return <Navigate to={block.to} replace state={{ notice: block.notice }} />;
  return <>{children}</>;
}

/** The one-line notice a redirected guest sees at the top of the earlier step. */
export function StepNotice() {
  const loc = useLocation();
  const notice = (loc.state as { notice?: string } | null)?.notice;
  if (!notice) return null;
  return (
    <p className="step-notice" role="status">
      {notice}
    </p>
  );
}
