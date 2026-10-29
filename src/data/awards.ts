import { ICON_PATHS } from './iconPaths';
/** Quality marks shown on sanatorium cards. [ПРИМЕР ДАННЫХ] */

export const AWARD_ICONS = {
  lift: 'M4 3h16v18H4zM12 3v18M8 10V7M16 10V7M8 14v3M16 14v3',
  pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  thumb: 'M7 11v10H3V11zM7 11l4-8a2 2 0 0 1 3 2v4h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7',
  family:
    'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2 21v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5M14 21v-4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v4',
  water: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11zM9 15a3 3 0 0 0 3 3',
  renov: 'M3 21l6-6M14 4l6 6-9 9H5v-6z',
};

export const awardsOf = {
  'egle-comfort': [
    { t: 'Лифт во всех корпусах', d: AWARD_ICONS.lift },
    { t: 'Бассейн и бани в здании', d: ICON_PATHS.pool },
    { t: 'Выбор гостей', d: AWARD_ICONS.thumb },
  ],
  'grand-spa-lietuva': [
    { t: 'Много бассейнов и бань в здании', d: ICON_PATHS.aqua },
    { t: 'Центр города, у бювета', d: AWARD_ICONS.pin },
  ],
  'grand-spa-druskininkai': [
    { t: 'Новый корпус', d: AWARD_ICONS.renov },
    { t: 'Много бассейнов и бань рядом', d: ICON_PATHS.aqua },
  ],
  belorus: [{ t: 'Номера после ремонта', d: AWARD_ICONS.renov }],
  draugyste: [{ t: 'Минеральный бассейн', d: AWARD_ICONS.water }],
};
