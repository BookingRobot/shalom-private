import { MONTHS, addD, iso, shortDate } from './dates';

/**
 * A stay can't cross a night with no free places. Nights are check-in … the day
 * before check-out: a "нет мест" day is fine as the check-out day.
 */
export function blockedNights(a: Date, b: Date, isBlocked: (d: Date) => boolean): Date[] {
  const out: Date[] = [];
  for (let d = a; d < b; d = addD(d, 1)) if (isBlocked(d)) out.push(d);
  return out;
}

/** "20 ноября", "20–22 ноября", "31 декабря – 1 января", "20–22 ноября и 25 декабря". */
export function daysText(days: Date[]): string {
  const runs: [Date, Date][] = [];
  for (const d of days) {
    const last = runs[runs.length - 1];
    if (last && iso(addD(last[1], 1)) === iso(d)) last[1] = d;
    else runs.push([d, d]);
  }
  const one = ([a, b]: [Date, Date]) =>
    iso(a) === iso(b)
      ? shortDate(a)
      : a.getUTCMonth() === b.getUTCMonth()
        ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()]
        : shortDate(a) + ' – ' + shortDate(b);
  const parts = runs.slice(0, 2).map(one);
  return parts.join(' и ') + (runs.length > 2 ? ' и другие дни' : '');
}

/**
 * The guest went across "нет мест" nights: the clicked day starts a new stay, so the
 * calendar never gets stuck — the note only explains what happened.
 */
export function restartNote(days: Date[], newIn: Date): string {
  return `${daysText(days)} нет мест, поэтому заезд теперь ${shortDate(newIn)} — выберите день выезда. Или отправьте запрос, поищем вручную.`;
}

/** Short message for the pop-up under the calendar. */
export function blockedNote(days: Date[], single = false): string {
  return single
    ? `${daysText(days)} нет свободных мест — выберите другой день.`
    : `В этот период нет мест: ${daysText(days)}. Выберите даты без дней «нет мест» — или отправьте запрос, поищем вручную.`;
}
