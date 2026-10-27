import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_BOOKING, type Booking } from '../data/booking';

interface BookingApi {
  booking: Booking;
  update: (patch: Partial<Booking>) => void;
  reset: () => void;
}

const BookingCtx = createContext<BookingApi | null>(null);
const KEY = 'br-shalom:booking';

function load(): Booking {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_BOOKING, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupted */
  }
  return DEFAULT_BOOKING;
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
