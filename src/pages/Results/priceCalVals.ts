import type { CalendarCell } from '../../components/calendar/MonthsCalendar';
import { isSoldOutEverywhere } from '../../data/availability';
import { TODAY } from '../../data/demo';
import { isFlightDay } from '../../data/flights';
import { roomDayBusy } from '../../data/roomAvailability';
import { MONTHS, MONTHS_N, addD, iso, nightsWord, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { blockedNights, blockedNote, daysText } from '../../lib/stayCheck';
import type { LogicCtx } from './hotelsVals';
import type { PriceCalVM, PriceCalVals } from './resultsTypes';
import { rangeText, stayPricing, toNum } from './stayPricing';

/** «Когда дешевле?»: one month of per-person prices for a sanatorium, a day picked moves the stay */
export function buildPriceCal(ctx: LogicCtx): PriceCalVals {
  const { st, set, nights, checkin, data } = ctx;
  const { soldOut, totalFor, ppnFor } = stayPricing(nights);
  const calH = st.cal ? data.sanatoriums.find((h) => h.id === st.cal!.id) : null;
  let cal: PriceCalVM = { cells: [] };
  if (calH && st.cal) {
    const stc = st.cal;
    const base = toNum(calH.offers[0].price);
    const picked = toD(stc.picked || iso(checkin));
    const m0 = stc.month ?? checkin.getUTCMonth(),
      y0 = stc.year ?? checkin.getUTCFullYear();
    const first = new Date(Date.UTC(y0, m0, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y0, m0 + 1, 0)).getUTCDate();
    const curP = ppnFor(calH, checkin, base);
    // nights with no places: this sanatorium, the whole resort, or this room
    const dayFull = (d: Date) =>
      soldOut(calH, d) || isSoldOutEverywhere(iso(d)) || (stc.roomKey ? roomDayBusy(stc.roomKey, d) : false);
    const stayBad = (a: Date) => blockedNights(a, addD(a, nights), dayFull);
    const cells: CalendarCell[] = [];
    for (let i = 0; i < lead; i++)
      cells.push({
        day: '',
        text: '',
        sub: '',
        bg: 'transparent',
        border: 'transparent',
        off: true,
        cursor: 'default',
      });
    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.UTC(y0, m0, d));
      const past = date < TODAY;
      const so = !past && dayFull(date);
      const p = ppnFor(calH, date, base);
      const isCur = iso(date) === iso(checkin),
        isPick = iso(date) === iso(picked);
      const r = p / curP;
      let bg = r < 0.97 ? 'var(--green-soft)' : r <= 1.03 ? 'var(--warn-bg)' : 'var(--danger-bg)';
      if (so || past) bg = 'var(--line)';
      cells.push({
        day: d,
        fly: isFlightDay(date) && !past,
        text: so || past ? (past ? '' : 'Нет мест') : p + ' €',
        sub: isPick ? '✓ заезд' : isCur ? 'ваш заезд' : '',
        bg,
        border: isPick ? 'var(--green)' : isCur ? 'var(--ink)' : 'transparent',
        color: isPick ? 'var(--green)' : 'var(--ink)',
        off: past,
        cursor: so || past ? 'not-allowed' : 'pointer',
        aria: d + ' ' + MONTHS[m0] + (so ? ', нет мест' : ', ' + p + ' € за человека в сутки'),
        // the whole stay must fit between "нет мест" nights
        pick: () => {
          if (so) return set({ cal: { ...stc, note: blockedNote([date], true) } });
          const bad = stayBad(date);
          if (bad.length)
            return set({
              cal: {
                ...stc,
                note:
                  'С ' +
                  shortDate(date) +
                  ' на ' +
                  nights +
                  ' ' +
                  nightsWord(nights) +
                  ' не получится: ' +
                  daysText(bad) +
                  ' нет мест. Выберите другой день заезда — или отправьте запрос.',
              },
            });
          set({ cal: { ...stc, picked: iso(date), note: null } });
        },
      });
    }
    const newTotal = totalFor(calH, picked, base),
      curTotal = totalFor(calH, checkin, base),
      diff = curTotal - newTotal;
    const off1 = calH.offers[0];
    cal = {
      note: stc.note || '',
      applyOff: stayBad(picked).length > 0,
      hotelName: calH.name,
      room: stc.roomName || off1.room,
      prog: off1.title.replace(/ — .*$/, ''),
      curPpn: curP,
      monthTitle: MONTHS_N[m0] + ' ' + y0,
      cells,
      newIn: shortDate(picked),
      newOut: shortDate(addD(picked, nights)),
      newPpn: ppnFor(calH, picked, base),
      newTotal: fmt(newTotal),
      curTotal: fmt(curTotal),
      newRange: rangeText(picked, nights),
      diffText:
        diff > 0
          ? '↓ Экономия за поездку: ' + fmt(diff) + ' €'
          : diff < 0
            ? '↑ Дороже на ' + fmt(-diff) + ' €'
            : 'Та же цена, что и на ваши даты',
      diffBg: diff > 0 ? 'var(--green-soft)' : diff < 0 ? 'var(--danger-bg)' : 'var(--sand)',
      diffColor: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--danger)' : 'var(--ink-2)',
    };
  }
  const month = () => st.cal?.month ?? checkin.getUTCMonth();
  const year = () => st.cal?.year ?? checkin.getUTCFullYear();
  return {
    calOpen: !!calH,
    cal,
    curRange: rangeText(checkin, nights),
    dateRange: rangeText(checkin, nights) + ' ' + checkin.getUTCFullYear(),
    checkinISO: iso(checkin),
    checkoutISO: iso(addD(checkin, nights)),
    calClose: () => set({ cal: null }),
    calPrev: () => {
      const m = month() - 1;
      set({ cal: { ...st.cal!, month: (m + 12) % 12, year: m < 0 ? year() - 1 : year() } });
    },
    calNext: () => {
      const m = month() + 1;
      set({ cal: { ...st.cal!, month: m % 12, year: m > 11 ? year() + 1 : year() } });
    },
    calApply: () => {
      if (cal.applyOff) return;
      set({ checkin: st.cal?.picked || iso(checkin), cal: null });
      ctx.update({ chosenDates: true });
    },
    calNoteClose: () => set({ cal: { ...st.cal!, note: null } }),
    calNoteAsk: () => ctx.help(),
  };
}
