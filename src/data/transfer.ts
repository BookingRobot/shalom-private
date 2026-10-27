/** Transfer: pick-up places, market prices and vehicles. [ПРИМЕР ДАННЫХ — цены по рынку Vilnius Airport] */

export const PICKUP_PLACES = [
  {
    id: 'vilnius',
    name: 'Вильнюс',
    from: 'Из Вильнюса',
    to: 'В Вильнюс',
    info: 'аэропорт, вокзалы · 130 км · ≈ 2 ч',
    places: ['Из аэропорта Вильнюса', 'С ЖД вокзала', 'С автовокзала', 'От отеля в Вильнюсе'],
  },
  {
    id: 'kaunas',
    name: 'Каунас',
    from: 'Из Каунаса',
    to: 'В Каунас',
    info: 'аэропорт, вокзалы · 130 км · ≈ 2 ч',
    places: ['Из аэропорта Каунаса', 'С ЖД вокзала', 'С автовокзала', 'От отеля в Каунасе'],
  },
  {
    id: 'warsaw',
    name: 'Варшава',
    from: 'Из Варшавы',
    to: 'В Варшаву',
    info: 'аэропорт Шопена · 330 км · ≈ 5 ч',
    places: ['Из аэропорта Шопена', 'Из аэропорта Модлин', 'С ЖД вокзала Варшава-Центральная', 'От отеля в Варшаве'],
  },
  {
    id: 'marijampole',
    name: 'Мариямполе',
    from: 'Из Мариямполе',
    to: 'В Мариямполе',
    info: 'автовокзал · 75 км · ≈ 1 ч 15 мин',
    places: ['С автовокзала', 'С ЖД вокзала', 'От отеля'],
  },
  {
    id: 'druskininkai',
    name: 'Друскининкай',
    from: 'Из Друскининкай',
    to: 'В Друскининкай',
    info: 'автовокзал или отель в городе · 10 мин',
    places: ['С автовокзала Друскининкай', 'От отеля в Друскининкай'],
  },
];

export const TRANSFER_PRICES = {
  vilnius: { seat: 30, car: 130, van: 170, premium: 200 },
  kaunas: { seat: 30, car: 130, van: 170, premium: 200 },
  warsaw: { seat: 70, car: 320, van: 420, premium: 480 },
  marijampole: { seat: 25, car: 85, van: 110, premium: 140 },
  druskininkai: { seat: 10, car: 15, van: 25, premium: 35 },
};

export const VEHICLES = [
  {
    id: 'car',
    img: '/img/edfa76a71b436810e36bd398235820b7.png',
    name: 'Легковой автомобиль',
    info: 'до 3 человек, 3 чемодана · Škoda Octavia, Toyota Camry или аналог',
    d: 'M5 15h14M4 15l1.5-3.5h13L20 15M4 15v2.5h16V15M7 17.5a1.2 1.2 0 1 0 0 .01M17 17.5a1.2 1.2 0 1 0 0 .01M8.5 11.5l1-2h5l1 2',
    sz: 26,
  },
  {
    id: 'van',
    img: '/img/165765111b3ce679a969db85fe7d023f.png',
    name: 'Микроавтобус',
    info: 'до 7 человек, 7 чемоданов · Mercedes Vito / V-Class',
    d: 'M3 6h12l6 5v7H3zM3 12h18M7 18a1.5 1.5 0 1 0 0 .01M17 18a1.5 1.5 0 1 0 0 .01M7 6v6M11 6v6M15 6v5',
    sz: 38,
  },
  {
    id: 'premium',
    img: '/img/3bd69c9fea391e27ab155af10bf6d27f.png',
    name: 'Премиум-класс',
    info: 'до 3 человек · Mercedes E-Class, вода, помощь с багажом',
    d: 'M3 15h18M2 15l2-4h16l2 4M2 15v3h20v-3M6 18a1.3 1.3 0 1 0 0 .01M18 18a1.3 1.3 0 1 0 0 .01M7 11l1.5-2.5h7L17 11M12 3.5l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8L9.4 5.4l1.8-.3z',
    sz: 32,
  },
];
