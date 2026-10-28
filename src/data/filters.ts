import { ICON_PATHS } from './iconPaths';
/** Search filters: groups, options and their icons. */

export const FILTER_ICONS = {
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  lift: 'M4 3h16v18H4zM12 3v18M8 10V7M16 10V7M8 14v3M16 14v3',
  oda: 'M13 4a1.5 1.5 0 1 0 0 .01M9 21l2-6 2 2v4M15 21l-2-6-2-2 1-5 3 1 2 3M11 8l-3 2-1 3',
  spine: 'M12 3v18M9 6h6M9 10h6M9 14h6M9 18h6',
  nerv: 'M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3 3 3 0 0 0 3 3h3V4zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3 3 3 0 0 1-3 3h-3',
  heart: 'M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11zM7 12h3l1-2 2 4 1-2h3',
  resp: 'M12 4v8M12 12c-2 0-3 2-3 4v3H6c-2 0-3-1-3-3v-3c0-3 2-5 5-5h1M12 12c2 0 3 2 3 4v3h3c2 0 3-1 3-3v-3c0-3-2-5-5-5h-1',
  digest: 'M9 3v4a3 3 0 0 0 3 3h1a5 5 0 0 1 0 10h-1a4 4 0 0 1-4-4v-2M15 3v3',
  diab: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11zM10 12h.01M14 16h.01M10 16l4-4',
};

export const BUILDING_ICON =
  'M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9h3a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M11 8h1M11 12h1';

export const CAR_ICON = 'M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01';

export const FILTER_GROUPS = {
  // Top tiles — the choices that actually narrow this list
  imp: [
    ['daily', 'Процедуры каждый день', ICON_PATHS.proc],
    ['doctor', 'Консультация врача включена', ICON_PATHS.doctor],
    ['samebld', 'Всё в одном здании', BUILDING_ICON],
    ['pool', 'Бассейн', ICON_PATHS.pool],
    ['transfer', 'Трансфер из аэропорта', CAR_ICON],
    ['ru', 'Врач говорит по-русски', 'M4 4h16v12H7l-3 3zM8 9h8M8 12h5'],
  ],
  comfort: [
    ['lift', 'Лифт', FILTER_ICONS.lift],
    ['shower', 'Душ без высокого порога', ICON_PATHS.shower],
  ],
  stars: [
    ['s3', '3 звезды', FILTER_ICONS.star],
    ['s4', '4 звезды', FILTER_ICONS.star],
    ['s5', '5 звёзд', FILTER_ICONS.star],
  ],
  prof: [
    ['p-oda', 'Спина и суставы', FILTER_ICONS.oda],
    ['p-nerv', 'Нервная система', FILTER_ICONS.nerv],
    ['p-heart', 'Сердце и сосуды', FILTER_ICONS.heart],
    ['p-resp', 'Дыхательные пути', FILTER_ICONS.resp],
    ['p-digest', 'Пищеварение', FILTER_ICONS.digest],
    ['p-diab', 'Диабет', FILTER_ICONS.diab],
  ],
  // What guests ask about most: meals and procedures per day (pick one), room features (any)
  meals: [
    ['meals2', '2 раза (полупансион)'],
    ['meals3', '3 раза'],
    ['mfull', 'Полный пансион'],
  ],
  procs: [
    ['proc3', '3 в день'],
    ['proc5', '5 в день'],
  ],
  room: [
    ['ac', 'Кондиционер', ICON_PATHS.ac],
    ['balcony', 'Балкон', ICON_PATHS.balcony],
    ['newbld', 'Новый корпус', BUILDING_ICON],
  ],
  beds: [
    ['double', 'Двуспальная', ICON_PATHS.bed1],
    ['twin', 'Две отдельные', ICON_PATHS.bed2],
  ],
};
