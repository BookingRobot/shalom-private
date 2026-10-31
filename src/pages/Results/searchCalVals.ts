import type { CalendarCell } from '../../components/calendar/MonthsCalendar';
import { isSoldOutEverywhere } from '../../data/availability';
import { TODAY } from '../../data/demo';
import { isFlightDay } from '../../data/flights';
import { roomDayBusy } from '../../data/roomAvailability';
import { MONTHS, MONTHS_N, addD, daysBetween, iso, shortDate, toD } from '../../lib/dates';
import { blockedNights, blockedNote, restartNote } from '../../lib/stayCheck';
import type { LogicCtx } from './hotelsVals';
import type { SearchCalVals } from './resultsTypes';
import { nightsW } from './stayPricing';

const AVG = 100;
/** sample average price per person per night for a day [ПРИМЕР] */
const avgPpn = (d: Date) => {
  const n = daysBetween(TODAY, d),
    wd = d.getUTCDay(),
    m = d.getUTCMonth();
  return Math.round(
    AVG *
      (1 +
        0.12 * Math.sin(n * 0.42) +
        (wd === 5 || wd === 6 ? 0.06 : 0) +
        (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
        (m >= 5 && m <= 7 ? 0.15 : 0) +
        (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
  );
};

const longD = (d: Date) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();

/** The search picker: the same two-month range calendar as on the home page, also a room's free dates. */
export function buildSearchCal(ctx: LogicCtx): SearchCalVals {
  const { st, set, nights, checkin } = ctx;
  const checkout = addD(checkin, nights);
  const ss = st.ss || { in: iso(checkin), out: iso(checkout) };
  const sIn = ss.in ? toD(ss.in) : null,
    sOut = ss.out ? toD(ss.out) : null;
  const sm0 = st.sm ?? checkin.getUTCMonth(),
    sy0 = st.sy ?? checkin.getUTCFullYear();
  const sRoom = st.sOpen && st.sRoom ? st.sRoom : null;
  // a stay can't cross a "нет мест" night (resort-wide or this room): pop-up instead of selecting
  const sBlocked = (d: Date) => isSoldOutEverywhere(iso(d)) || (!!sRoom && roomDayBusy(sRoom.key, d));
  const sPick = (date: Date) => () => {
    const k = iso(date);
    if (ss.in && !ss.out && date > toD(ss.in)) {
      const bad = blockedNights(toD(ss.in), date, sBlocked);
      // the clicked day starts a new stay instead (unless it has no places itself)
      if (bad.length)
        return set(
          sBlocked(date) ? { sNote: blockedNote(bad) } : { ss: { in: k, out: null }, sNote: restartNote(bad, date) },
        );
      return set({ ss: { in: ss.in, out: k }, sNote: null });
    }
    if (sBlocked(date)) return set({ sNote: blockedNote([date], true) });
    set({ ss: { in: k, out: null }, sNote: null });
  };
  const sCells = (y: number, m: number) => {
    const first = new Date(Date.UTC(y, m, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: CalendarCell[] = [];
    for (let i = 0; i < lead; i++)
      cells.push({ day: '', sub: '', bg: 'transparent', border: 'transparent', off: true, cursor: 'default' });
    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.UTC(y, m, d));
      const past = date < TODAY;
      const full = !past && isSoldOutEverywhere(iso(date));
      const rBusy = !past && !full && !!sRoom && roomDayBusy(sRoom.key, date); // this room is taken that night
      const p = avgPpn(date),
        r = p / AVG;
      let bg = r < 0.97 ? 'var(--green-soft)' : r <= 1.05 ? 'var(--warn-bg)' : 'var(--danger-bg)',
        color = 'var(--ink)',
        subColor = 'var(--ink-2)',
        border = 'transparent';
      const isIn = sIn && iso(date) === iso(sIn),
        isOut = sOut && iso(date) === iso(sOut),
        between = sIn && sOut && date > sIn && date < sOut;
      // the first "нет мест" day after check-in still works as the check-out day
      const canOut = (full || rBusy) && !!sIn && !sOut && date > sIn && !blockedNights(sIn, date, sBlocked).length;
      if (past) {
        bg = 'var(--line)';
        color = 'var(--muted-2)';
        subColor = 'var(--muted-2)';
      }
      if (full || rBusy) {
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
        sub: past ? '' : full ? 'нет мест' : rBusy ? 'занят' : isIn ? 'заезд' : isOut ? 'выезд' : p + ' €',
        bg,
        border,
        color,
        subColor,
        off: past,
        cursor: past || ((full || rBusy) && !canOut) ? 'not-allowed' : 'pointer',
        aria:
          d +
          ' ' +
          MONTHS[m] +
          (past ? ', недоступно' : rBusy ? ', номер занят' : ', около ' + p + ' € за человека в сутки'),
        pick: sPick(date),
      });
    }
    return cells;
  };
  const sN = sIn && sOut ? daysBetween(sIn, sOut) : 0;
  const sSelBad = !!(sIn && sOut && blockedNights(sIn, sOut, sBlocked).length);
  return {
    nightsLabel: nights + ' ' + nightsW(nights),
    sInLabel: longD(checkin),
    sOutLabel: longD(checkout),
    sCalOpen: !!st.sOpen,
    sCalNote: st.sNote || '',
    sCalNoteClose: () => set({ sNote: null }),
    sCalNoteAsk: () => ctx.help(),
    sOpenCal: () =>
      set({
        sNote: null,
        sOpen: true,
        sRoom: null,
        ss: { in: iso(checkin), out: iso(checkout) },
        sm: checkin.getUTCMonth(),
        sy: checkin.getUTCFullYear(),
      }),
    sCloseCal: () => set({ sOpen: false, sRoom: null, sNote: null }),
    sFlex: !!st.sFlex,
    setSFlex: (sFlex) => set({ sFlex }),
    // a recommended option is the choice: apply the dates and show the list
    sFlexPick: (a, b) => {
      set({ checkin: a, nights: daysBetween(toD(a), toD(b)), sOpen: false, sFlex: false, sRoom: null });
      ctx.update({ chosenDates: true });
    },
    sCalTitle: sRoom ? 'Свободные даты номера' : 'Выберите даты поездки',
    sRoomLine: sRoom ? sRoom.name + ' · ' + sRoom.hotel + ' — занятые дни закрыты' : '',
    sCalPrev: () => {
      const m = sm0 - 1;
      set({ sm: (m + 12) % 12, sy: m < 0 ? sy0 - 1 : sy0 });
    },
    sCalNext: () => {
      const m = sm0 + 1;
      set({ sm: m % 12, sy: m > 11 ? sy0 + 1 : sy0 });
    },
    // two months side by side: a stay across months is seen at once
    sMonths: [
      { title: MONTHS_N[sm0] + ' ' + sy0, cells: sCells(sy0, sm0) },
      {
        title: MONTHS_N[(sm0 + 1) % 12] + ' ' + (sm0 === 11 ? sy0 + 1 : sy0),
        cells: sCells(sm0 === 11 ? sy0 + 1 : sy0, (sm0 + 1) % 12),
      },
    ],
    sCalHint:
      st.sFlex && !sRoom
        ? 'Выберите месяц и сколько ночей — подберём лучшие даты с рейсами'
        : !sIn
          ? 'Нажмите день заезда'
          : !sOut
            ? 'Теперь нажмите день выезда'
            : 'Можно поменять: нажмите новый день заезда',
    sSelIn: sIn ? shortDate(sIn) : '—',
    sSelOut: sOut ? shortDate(sOut) : '—',
    sSelNights: sN ? sN + ' ' + nightsW(sN) : '—',
    sApplyOff: !sN || sSelBad,
    sApplyCal: () => {
      if (!(sN && sIn && !sSelBad)) return;
      set({ checkin: iso(sIn), nights: sN, sOpen: false, sRoom: null, sNote: null });
      ctx.update({ chosenDates: true });
    },
  };
}
