import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { client } from '../api';
import type { Draft, DraftStep } from '../api/types';
import { DEFAULT_BOOKING, type Booking } from '../data/booking';
import { bookingFromUrl } from '../lib/share';

interface BookingApi {
  booking: Booking;
  update: (patch: Partial<Booking>) => void;
  reset: () => void;
  /** the order's short code once it has a draft on the server (/order/<code>) */
  draftCode: string | null;
  /** makes sure the order has a draft (and a code): the share link and the consultant need it */
  ensureDraft: () => Promise<string>;
  /** a draft opened by its code replaces what this browser had */
  loadDraft: (d: Draft) => void;
}

const BookingCtx = createContext<BookingApi | null>(null);
const KEY = 'br-shalom:booking';
const CODE_KEY = 'br-shalom:draft';
/** changes are sent to the server this long after the last one */
const SAVE_AFTER_MS = 800;

function load(): Booking {
  let b = DEFAULT_BOOKING;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      b = { ...DEFAULT_BOOKING, ...saved };
      // a transfer saved before the guest was asked every question: start with empty choices
      if (!saved.transfer || saved.transfer.need === undefined) b.transfer = DEFAULT_BOOKING.transfer;
    }
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

const loadCode = () => {
  try {
    return sessionStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
};
const saveCode = (code: string | null) => {
  try {
    if (code) sessionStorage.setItem(CODE_KEY, code);
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    /* ignore */
  }
};

/** where the guest is, for the draft: the step after the last finished one */
export const stepOfProgress = (p: Booking['progress']): DraftStep =>
  (['rooms', 'transfer', 'guests', 'payment', 'done'] as const)[p];

/**
 * The guest's order, shared by all booking steps: dates, guests, sanatorium, room,
 * programme, transfer, flights. Kept in sessionStorage so a page reload loses nothing,
 * and — once the order has a code — saved to the server after every change, so the same
 * order opens on any device and the consultant sees where the guest stopped.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking>(load);
  const [draftCode, setDraftCode] = useState<string | null>(loadCode);
  const codeRef = useRef(draftCode);
  codeRef.current = draftCode;
  const pending = useRef<number | null>(null);
  const latest = useRef(booking);
  latest.current = booking;

  // the server copy follows this browser's copy, a little later
  const pushLater = useCallback(() => {
    const code = codeRef.current;
    if (!code) return;
    if (pending.current) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      pending.current = null;
      const b = latest.current;
      client.saveDraft(code, { booking: b, step: stepOfProgress(b.progress) }).catch(() => {
        /* the next change tries again; the browser copy is never lost */
      });
    }, SAVE_AFTER_MS);
  }, []);
  useEffect(
    () => () => {
      if (pending.current) window.clearTimeout(pending.current);
    },
    [],
  );

  const ensureDraft = useCallback(async () => {
    if (codeRef.current) return codeRef.current;
    const b = latest.current;
    const d = await client.createDraft(b, stepOfProgress(b.progress));
    codeRef.current = d.code;
    saveCode(d.code);
    setDraftCode(d.code);
    return d.code;
  }, []);
  const update = useCallback(
    (patch: Partial<Booking>) => {
      setBooking((prev) => {
        const next = { ...prev, ...patch };
        save(next);
        latest.current = next;
        return next;
      });
      // a finished step starts the draft: from here on the order has a code
      if (patch.progress && !codeRef.current)
        ensureDraft()
          .then(pushLater)
          .catch(() => {
            /* no server: the order stays in this browser only */
          });
      else pushLater();
    },
    [pushLater, ensureDraft],
  );
  const reset = useCallback(() => {
    save(DEFAULT_BOOKING);
    setBooking(DEFAULT_BOOKING);
    saveCode(null);
    setDraftCode(null);
  }, []);
  const loadDraft = useCallback((d: Draft) => {
    const b = { ...DEFAULT_BOOKING, ...d.booking };
    save(b);
    setBooking(b);
    codeRef.current = d.code;
    saveCode(d.code);
    setDraftCode(d.code);
  }, []);

  const api = useMemo(
    () => ({ booking, update, reset, draftCode, ensureDraft, loadDraft }),
    [booking, update, reset, draftCode, ensureDraft, loadDraft],
  );
  return <BookingCtx.Provider value={api}>{children}</BookingCtx.Provider>;
}

export function useBooking(): BookingApi {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}
