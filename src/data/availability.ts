/** Days with no free places in any sanatorium. [ПРИМЕР ДАННЫХ — из системы бронирования] */
export const SOLD_OUT_DATES = [
  '2026-11-20',
  '2026-11-21',
  '2026-11-22',
  '2026-12-24',
  '2026-12-25',
  '2026-12-26',
  '2026-12-27',
  '2026-12-31',
  '2027-01-01',
];

export const isSoldOutEverywhere = (isoDate: string) => SOLD_OUT_DATES.includes(isoDate);
