import { MONTHS } from '../lib/dates';
/** Room types fully booked on some dates and how such rooms look. [ПРИМЕР ДАННЫХ — из данных о наличии] */

export const ROOM_BUSY = { 'egle-comfort:junior': ['2026-11-01', '2026-11-23'] };

export const busyRange = (key) => ROOM_BUSY[key] || null;

export const overlaps = (key, a, b) => {
  const r = busyRange(key);
  if (!r) return false;
  const s0 = new Date(r[0] + 'T00:00:00Z'),
    s1 = new Date(r[1] + 'T00:00:00Z');
  return a < s1 && b > s0;
};

export const roomDayBusy = (key, d) => {
  const r = busyRange(key);
  if (!r) return false;
  const t = d.toISOString().slice(0, 10);
  return t >= r[0] && t < r[1];
};

export const freeFrom = (key) => {
  const r = busyRange(key);
  if (!r) return '';
  const d = new Date(r[1] + 'T00:00:00Z');
  return 'с ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
};

export const BUSY_LOOK = {
  cardBorder: '1px solid #E3DED2',
  cardBg: '#F7F5F0',
  imgFilter: 'grayscale(1) opacity(.7)',
  pillBg: '#E8E6E1',
  pillColor: '#5E6862',
  nameColor: '#5E6862',
};

export const FREE_LOOK = {
  cardBorder: '1px solid #E3DED2',
  cardBg: '#fff',
  imgFilter: 'none',
  pillBg: '#EEF5F1',
  pillColor: '#1F5F4A',
  nameColor: '#1C2620',
};
