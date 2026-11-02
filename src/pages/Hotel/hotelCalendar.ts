import type { CalendarCell, CalendarMonth } from '../../components/calendar/MonthsCalendar';
import { nightFree } from '../../data/availability';
import { TODAY } from '../../data/demo';
import { isFlightDay } from '../../data/flights';
import { roomDayBusy } from '../../data/roomAvailability';
import { MONTHS, MONTHS_N, daysBetween, iso, nightsWord, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { blockedNights, blockedNote, restartNote } from '../../lib/stayCheck';
import { anchorPpn, anchorTotal, ppnDay, rangeLabel } from './hotelPricing';
import type { HotelCalendarVals, HotelState } from './hotelTypes';

export interface CalendarInput {
  hotelId: string;
  st: HotelState;
  checkin: Date;
  checkout: Date;
  nights: number;
  set: (patch: Partial<HotelState>) => void;
  /** the chosen dates are the guest's own choice now */
  markChosen: () => void;
  askHelp: () => void;
}

/**
 * «Когда дешевле?» — the two-month range calendar with this sanatorium's prices: which days
 * can be picked, what each one costs, and what the new stay would come to.
 */
export function calendarVals(x: CalendarInput): HotelCalendarVals {
  const { st, checkin, checkout, nights, set } = x;
  const sel = st.sel || { in: iso(checkin), out: iso(checkout) };
  const sIn = sel.in ? toD(sel.in) : null,
    sOut = sel.out ? toD(sel.out) : null;
  const m0 = st.month ?? checkin.getUTCMonth(),
    y0 = st.year ?? checkin.getUTCFullYear();
  const curPpn = anchorPpn(checkin, nights);
  // a stay can't cross a "нет мест" night (resort-wide or this room): pop-up instead of selecting
  const blocked = (d: Date) => !nightFree(x.hotelId, iso(d)) || (st.calRoom ? roomDayBusy(st.calRoom, d) : false);
  const pickDay = (date: Date) => () => {
    const k = iso(date);
    if (sel.in && !sel.out && date > toD(sel.in)) {
      const bad = blockedNights(toD(sel.in), date, blocked);
      // the clicked day starts a new stay instead (unless it has no places itself)
      if (bad.length)
        return set(
          blocked(date) ? { note: blockedNote(bad) } : { sel: { in: k, out: null }, note: restartNote(bad, date) },
        );
      return set({ sel: { in: sel.in, out: k }, note: null });
    }
    if (blocked(date)) return set({ note: blockedNote([date], true) });
    set({ sel: { in: k, out: null }, note: null });
  };
  const monthCells = (y: number, m: number): CalendarCell[] => {
    const first = new Date(Date.UTC(y, m, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: CalendarCell[] = [];
    for (let i = 0; i < lead; i++)
      cells.push({
        day: '',
        fly: false,
        sub: '',
        bg: 'transparent',
        border: 'transparent',
        color: 'var(--ink)',
        subColor: 'var(--ink-2)',
        off: true,
        cursor: 'default',
        aria: '',
        pick: () => {},
      });
    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.UTC(y, m, d));
      const past = date < TODAY;
      const full = !past && blocked(date);
      /* [ПРИМЕР] нет мест ни в одном объекте */
      const p = ppnDay(date),
        r = p / curPpn;
      let bg = r < 0.97 ? 'var(--green-soft)' : r <= 1.03 ? 'var(--warn-bg)' : 'var(--danger-bg)',
        color = 'var(--ink)',
        subColor = 'var(--ink-2)',
        border = 'transparent';
      const isIn = !!sIn && iso(date) === iso(sIn),
        isOut = !!sOut && iso(date) === iso(sOut),
        between = !!sIn && !!sOut && date > sIn && date < sOut;
      // the first "нет мест" day after check-in still works as the check-out day
      const canOut = full && !!sIn && !sOut && date > sIn && !blockedNights(sIn, date, blocked).length;
      if (past) {
        bg = 'var(--line)';
        color = 'var(--muted-2)';
        subColor = 'var(--muted-2)';
      }
      if (full) {
        bg = 'repeating-linear-gradient(135deg,var(--sand) 0 6px,var(--line-strong) 6px 12px)';
        color = 'var(--muted-2)';
        subColor = 'var(--warn-ink)';
      }
      if (between) border = 'var(--green)';
      if (isIn || isOut) {
        bg = 'var(--green)';
        color = 'var(--paper)';
        subColor = 'var(--green-line)';
        border = 'var(--green)';
      }
      cells.push({
        day: d,
        fly: isFlightDay(date) && !past,
        sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + ' €',
        bg,
        border,
        color,
        subColor,
        off: past,
        cursor: past || (full && !canOut) ? 'not-allowed' : 'pointer',
        aria: d + ' ' + MONTHS[m] + (past ? ', недоступно' : full ? ', нет мест' : ', ' + p + ' € за человека в сутки'),
        pick: pickDay(date),
      });
    }
    return cells;
  };
  // two months side by side: a stay across months is seen at once
  const m1 = (m0 + 1) % 12,
    y1 = m0 === 11 ? y0 + 1 : y0;
  const months: CalendarMonth[] = [
    { title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) },
    { title: MONTHS_N[m1] + ' ' + y1, cells: monthCells(y1, m1) },
  ];
  const selN = sIn && sOut ? daysBetween(sIn, sOut) : 0;
  const curTotal = anchorTotal(checkin, nights),
    newTotal = sIn && selN ? anchorTotal(sIn, selN) : 0,
    diff = curTotal - newTotal;
  const selBlocked = !!(sIn && sOut && blockedNights(sIn, sOut, blocked).length);
  const openAt = () => ({
    note: null,
    cal: true,
    month: checkin.getUTCMonth(),
    year: checkin.getUTCFullYear(),
  });
  return {
    calOpen: !!st.cal,
    calNote: st.note || '',
    calNoteClose: () => set({ note: null }),
    calNoteAsk: x.askHelp,
    flexMode: !!st.flex && !st.calRoom,
    setFlex: (flex: boolean) => set({ flex, note: null }),
    // a recommended option from «Не знаю точных дат» is the choice: the page shows those dates
    flexPick: (a: string, b: string) => {
      set({ in: a, out: b, cal: false, flex: false, note: null });
      x.markChosen();
    },
    selIn: sIn ? shortDate(sIn) : '—',
    selOut: sOut ? shortDate(sOut) : '—',
    selNights: selN ? selN + ' ' + nightsWord(selN) : '—',
    openCal: () =>
      set({
        ...openAt(),
        flex: false,
        calRoom: null,
        calRoomName: null,
        sel: { in: iso(checkin), out: iso(checkout) },
      }),
    closeCal: () => set({ cal: false, note: null }),
    calPrev: () => {
      const m = m0 - 1;
      set({ month: (m + 12) % 12, year: m < 0 ? y0 - 1 : y0 });
    },
    calNext: () => {
      const m = m0 + 1;
      set({ month: m % 12, year: m > 11 ? y0 + 1 : y0 });
    },
    months,
    calHint: !sIn
      ? 'Нажмите день заезда'
      : !sOut
        ? 'Теперь нажмите день выезда'
        : 'Можно поменять: нажмите новый день заезда',
    newTotal: selN ? fmt(newTotal) + ' €' : '—',
    diffText: !selN
      ? ''
      : selN !== nights
        ? '(' + selN + ' ' + nightsWord(selN) + ' вместо ' + nights + ')'
        : diff > 0
          ? '↓ экономия ' + fmt(diff) + ' €'
          : diff < 0
            ? '↑ дороже на ' + fmt(-diff) + ' €'
            : 'та же цена',
    diffColor: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--danger)' : 'var(--ink-2)',
    applyOff: !(sIn && sOut) || selBlocked,
    applyCal: () => {
      if (!(sIn && sOut && !selBlocked)) return;
      set({ in: iso(sIn), out: iso(sOut), cal: false, note: null });
      x.markChosen();
    },
    calRoomOn: !!st.calRoom,
    calRoomName: st.calRoomName || '',
  };
}

/** the calendar opened for one room: its busy days are hatched */
export const roomCalendarState = (key: string, name: string, checkin: Date): Partial<HotelState> => ({
  cal: true,
  calRoom: key,
  calRoomName: name,
  note: null,
  sel: { in: null, out: null },
  month: checkin.getUTCMonth(),
  year: checkin.getUTCFullYear(),
});

/** the current stay as the page labels it: «9–18 ноября» */
export { rangeLabel };
