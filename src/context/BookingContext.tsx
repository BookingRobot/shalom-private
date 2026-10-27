import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_BOOKING, type Booking } from '../data/booking';
import { bookingFromUrl } from '../lib/share';

interface BookingApi {
  booking: Booking;
  update: (patch: Partial<Booking>) => void;
  reset: () => void;
}

const BookingCtx = createContext<BookingApi | null>(null);
const KEY = 'br-shalom:booking';

function load(): Booking {
  let b = DEFAULT_BOOKING;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) b = { ...DEFAULT_BOOKING, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupted */
  }
  // a shared offer link (see lib/share) overrides what this browser had
  const shared = typeof window !== 'undefined' ? bookingFromUrl(window.location.search) : null;
  if (shared) {
    b = { ...b, ...shared };
    save(b);
  }
  return b;
}

function save(b: Booking) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
}

/**
 * The guest's order, shared by all booking steps: dates, guests, sanatorium, room,
 * programme, transfer, flights. Kept in sessionStorage so a page reload loses nothing.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking>(load);
  const update = useCallback((patch: Partial<Booking>) => {
    setBooking((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    save(DEFAULT_BOOKING);
    setBooking(DEFAULT_BOOKING);
  }, []);
  const api = useMemo(() => ({ booking, update, reset }), [booking, update, reset]);
  return <BookingCtx.Provider value={api}>{children}</BookingCtx.Provider>;
}

export function useBooking(): BookingApi {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}
