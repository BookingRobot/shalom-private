/** Popular sanatoriums on the home page. [ПРИМЕР ДАННЫХ — из BookingRobot API] */

export const DOCTOR_ICON =
  'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4';

export const POOL_ICON =
  'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6';

export const MEALS_ICON = 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8';

export const POPULAR_SANATORIUMS = [
  {
    id: 'egle-comfort',
    name: 'Эгле Комфорт',
    stars: '★★★★',
    sub: 'Друскининкай · 26 отзывов',
    img: '/img/d82431114d102eee0f48639f84940aad.jpg',
    f1: 'Врач и лечебные программы',
    f1d: DOCTOR_ICON,
    f2: 'Бассейны и сауны',
    f2d: POOL_ICON,
    price: 106,
  },
  {
    id: 'grand-spa-lietuva',
    name: 'Гранд Спа Лиетува',
    stars: '★★★★',
    sub: 'Друскининкай · 20 отзывов',
    img: '/img/4257cc3ec678cab57b304e0ddfa95002.jpg',
    f1: 'Врач и лечебные программы',
    f1d: DOCTOR_ICON,
    f2: 'Бассейны и бани',
    f2d: POOL_ICON,
    price: 90,
  },
  {
    id: 'gradiali',
    name: 'Градиали',
    stars: '★★★★',
    sub: 'Паланга · 17 отзывов',
    img: '/img/983aebb39738d3905bb5383746fb9356.jpg',
    f1: 'Врач и лечебные программы',
    f1d: DOCTOR_ICON,
    f2: 'Бассейн и SPA',
    f2d: POOL_ICON,
    price: 106,
  },
  {
    id: 'belorus',
    name: 'Беларусь',
    stars: '★★★',
    sub: 'Друскининкай · 17 отзывов',
    img: '/img/7d7576cf2b949466e6e7fdd81b5d43ad.jpg',
    f1: 'Врач и лечебные программы',
    f1d: DOCTOR_ICON,
    f2: 'Питание включено',
    f2d: MEALS_ICON,
    price: 90,
  },
  {
    id: 'egle-birstonas',
    name: 'Эгле Комфорт Бирштонас',
    stars: '',
    sub: 'Бирштонас · 35 отзывов',
    img: '/img/5f53f4a87e8d933d8e5bedf76624ab4a.jpg',
    f1: 'Врач и лечебные программы',
    f1d: DOCTOR_ICON,
    f2: 'Бассейны и сауны',
    f2d: POOL_ICON,
    price: 119,
  },
  {
    id: 'draugyste',
    name: 'Минерал SPA Драугисте',
    stars: '',
    sub: 'Друскининкай · 5 отзывов',
    img: '/img/8c9ffb66b65bd2f85fa22df1c989c3b7.jpg',
    f1: 'Питание включено',
    f1d: MEALS_ICON,
    f2: 'Бассейн и бани',
    f2d: POOL_ICON,
    price: 107,
  },
];
