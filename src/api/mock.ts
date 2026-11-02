/**
 * The sample-data implementation of the API: the same answers the site has always shown,
 * now behind the asynchronous contract (a short delay so the loading states are real).
 * Drafts live in this browser's localStorage — one device only; the real server keeps
 * them for every device (docs/openapi.yaml).
 */
import { api } from './index';
import type { ApiClient } from './client';
import {
  ApiError,
  type Draft,
  type DraftStep,
  type FlightDay,
  type NightAvailability,
  type Quote,
  type QuoteLine,
  type QuoteRequest,
} from './types';
import { DEFAULT_BOOKING, type Booking } from '../data/booking';
import { nightFree } from '../data/availability';
import { FLIGHT_BACK, FLIGHT_THERE, isFlightDay } from '../data/flights';
import { addD, daysBetween, iso, toD } from '../lib/dates';
import { newOrderCode } from '../lib/orderCode';
import { orderSummary } from '../lib/orderSummary';
import { legOf } from '../lib/transferCost';
import { perPersonOf } from '../lib/pricing';

/** a short pause so pages show their loading state the way they will with the real server */
const DELAY_MS = typeof navigator !== 'undefined' && navigator.webdriver ? 0 : 120;
const later = <T>(value: T): Promise<T> => new Promise((ok) => setTimeout(() => ok(value), DELAY_MS));

const DRAFTS_KEY = 'br-shalom:drafts';

function readDrafts(): Record<string, Draft> {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeDrafts(all: Record<string, Draft>) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: the draft lives for this page only */
  }
}

/** Every price line of an order, from the same rules the summary boxes use. */
export function quoteOf(req: QuoteRequest): Quote {
  const b: Booking = { ...DEFAULT_BOOKING, ...req };
  const s = orderSummary(b);
  const lines: QuoteLine[] = [];
  const adultsLabel = b.adults === 1 ? '1 чел.' : b.adults + ' чел.';
  lines.push({
    key: 'stay',
    label: `Проживание и лечение, ${adultsLabel}`,
    qty: b.adults,
    unit: s.place,
    amount: s.place * b.adults,
  });
  if (b.children) {
    const { programs, roomPrice } = api.getRoomPrograms(b.hotelId, b.roomId);
    const program = programs.find((p) => p.id === b.programId) || programs[0];
    const childUnit = Math.round(perPersonOf(program.price + roomPrice.add) * 0.5);
    lines.push({
      key: 'child',
      label: b.children === 1 ? 'Ребёнок до 17 лет' : `Дети до 17 лет, ${b.children} чел.`,
      qty: b.children,
      unit: childUnit,
      amount: childUnit * b.children,
    });
  }
  if (b.flightPackage)
    lines.push({
      key: 'flight',
      label: s.flightName,
      qty: b.adults + b.children,
      unit: Math.round(s.flight / (b.adults + b.children)),
      amount: s.flight,
    });
  const t = b.transfer;
  if (t.mode && t.mode !== 'none' && t.place) {
    const there = legOf(b, t.place);
    lines.push({
      key: 'transfer-there',
      label: 'Трансфер в санаторий',
      qty: 1,
      unit: there.price,
      amount: there.price,
      note:
        there.kind === 'free' ? 'организует санаторий, уже оплачен' : there.kind === 'package' ? 'в пакете' : undefined,
    });
    if (t.back && t.backPlace) {
      const back = legOf(b, t.backPlace);
      lines.push({
        key: 'transfer-back',
        label: 'Трансфер обратно',
        qty: 1,
        unit: back.price,
        amount: back.price,
        note:
          back.kind === 'free' ? 'организует санаторий, уже оплачен' : back.kind === 'package' ? 'в пакете' : undefined,
      });
    }
  }
  return {
    currency: 'EUR',
    lines,
    total: s.total,
    perPerson: s.place,
    deposit: s.advance,
    rest: s.rest,
    dueDate: s.dueISO,
    fullOnly: s.fullOnly,
    tariffVersion: 'sample-2026-10',
  };
}

export const mockClient: ApiClient = {
  getPopularSanatoriums: () => later(api.getPopularSanatoriums()),
  searchSanatoriums: (q) => later(api.searchSanatoriums(q)),
  getSanatorium: (id) => {
    try {
      return later(api.getSanatorium(id));
    } catch {
      return Promise.reject(new ApiError('not-found', 'Санаторий не найден', 404));
    }
  },
  getRoomPrograms: (h, r) => later(api.getRoomPrograms(h, r)),
  getTransferOptions: () => later(api.getTransferOptions()),
  getAvailability: (hotelId, from, to) => {
    const a = toD(from);
    const n = Math.max(0, daysBetween(a, toD(to)));
    const out: NightAvailability[] = [];
    for (let i = 0; i < n; i++) {
      const d = iso(addD(a, i));
      out.push({ date: d, free: nightFree(hotelId, d) });
    }
    return later(out);
  },
  getFlightDays: (from, to) => {
    const a = toD(from);
    const n = Math.max(0, daysBetween(a, toD(to)));
    const out: FlightDay[] = [];
    for (let i = 0; i < n; i++) {
      const d = addD(a, i);
      if (isFlightDay(d)) out.push({ date: iso(d), there: FLIGHT_THERE.no, back: FLIGHT_BACK.no });
    }
    return later(out);
  },
  quote: (req) => later(quoteOf(req)),
  createDraft: (booking, step: DraftStep) => {
    const all = readDrafts();
    let code = newOrderCode();
    while (all[code]) code = newOrderCode();
    const now = new Date().toISOString();
    const d: Draft = { code, booking, step, createdAt: now, updatedAt: now };
    all[code] = d;
    writeDrafts(all);
    return later(d);
  },
  getDraft: (code) => {
    const d = readDrafts()[code];
    return d ? later(d) : Promise.reject(new ApiError('not-found', 'Заказ с таким кодом не найден', 404));
  },
  saveDraft: (code, patch) => {
    const all = readDrafts();
    const d = all[code];
    if (!d) return Promise.reject(new ApiError('not-found', 'Заказ с таким кодом не найден', 404));
    const next: Draft = { ...d, ...patch, updatedAt: new Date().toISOString() };
    all[code] = next;
    writeDrafts(all);
    return later(next);
  },
};
