/** Date helpers. All dates are handled as UTC midnight to avoid time-zone shifts. */

export const DAY = 86400000;

/** Genitive month names: "9 ноября". */
export const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
/** Nominative month names for calendar titles: "Ноябрь 2026". */
export const MONTHS_N = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
/** Short weekday names, Sunday first (Date.getUTCDay order). */
export const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
export const WEEKDAYS_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

/** "2026-11-09" → Date (UTC midnight) */
export const toD = (s: string) => new Date(s + 'T00:00:00Z');
/** Date → "2026-11-09" */
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addD = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
/** whole days between two dates */
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);

/** "9 ноября 2026" */
export const longDate = (d: Date) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
/** "9 ноября" */
export const shortDate = (d: Date) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];

/** Russian plural: plural(5, ['ночь', 'ночи', 'ночей']) → 'ночей' */
export const plural = (n: number, [one, few, many]: [string, string, string]) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;
export const nightsWord = (n: number) => plural(n, ['ночь', 'ночи', 'ночей']);
