import { EGLE_PIC } from './roomPhotos';
import { amenity } from './iconPaths';
/** Sanatorium page: Эгле Комфорт (Друскининкай) — photos, rooms, programmes, specialisations. [ПРИМЕР ДАННЫХ — из BookingRobot API] */

export const EGLE_TWIN_AMENITIES = [
  amenity('bed2', '2 односпальные кровати'),
  amenity('balcony', 'Балкон'),
  amenity('ac', 'Кондиционер'),
  amenity('wifi', 'Бесплатный Wi-Fi'),
  amenity('shower', 'Душ'),
  amenity('tv', 'Телевизор'),
  amenity('kettle', 'Чайник'),
  amenity('safe', 'Сейф'),
];

export const EGLE_DETAILS_TEXT =
  'Для взрослого в цену включено:\n— Консультация врача и по программе назначенные процедуры и исследования\n— Проживание\n— Трёхразовое питание «шведский стол» (завтрак, обед, ужин и 2 перекуса)\n— Ежедневное посещение бассейнов и саун — без ограничений по времени и количеству раз\n\nДень приезда и отъезда считаются как один лечебный день. Процедуры назначает врач, по одной из каждой группы:\n1. Лечебная ванна (минеральная жемчужная, углекислая) или грязевая аппликация\n2. Лечебный массаж 15 мин (каждый второй день), подводный или аппаратный массаж 20 мин\n3. Групповая кинезитерапия — в зале, в воде или в вертикальной ванне\n4. Аппаратная физиотерапия: электростимуляция, магнитотерапия, ингаляции, соляная комната';

export const EGLE_PROGRAMS = [
  {
    n: 1,
    top: true,
    room: 'Двухместный номер · 17–18 м²',
    img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg',
    title: 'Программа «Миди» — 3 процедуры в день',
    prog: [
      amenity('meals', 'Трёхразовое питание'),
      amenity('doctor', 'Консультация врача'),
      amenity('proc', '3 процедуры в день'),
      amenity('pool', 'Бассейны без ограничений'),
      amenity('sauna', 'Турецкая и финская бани'),
      amenity('gym', 'Тренажёрный зал'),
    ],
    price: '2\u00a0138',
    old: '2\u00a0250',
    adv: 86,
    rest: '2\u00a0052',
    details: EGLE_DETAILS_TEXT,
  },
  {
    n: 2,
    top: false,
    room: 'Двухместный номер · 17–18 м²',
    img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
    title: 'Программа «Макси» — 5 процедур в день',
    prog: [
      amenity('meals', 'Трёхразовое питание'),
      amenity('doctor', 'Консультация врача'),
      amenity('proc', '5 процедур в день'),
      amenity('pool', 'Бассейны без ограничений'),
      amenity('sauna', 'Турецкая и финская бани'),
      amenity('gym', 'Тренажёрный зал'),
    ],
    price: '2\u00a0275',
    old: '',
    adv: 91,
    rest: '2\u00a0184',
    details: EGLE_DETAILS_TEXT.replace(
      'по одной из каждой группы',
      'по одной из каждой группы, плюс одна дополнительная ванна и один дополнительный массаж в день',
    ),
  },
];

export const EGLE_ROOMS = [
  {
    n: 1,
    top: true,
    name: 'Двухместный номер',
    line: '17–18 м² · 2 отдельные кровати · Балкон',
    add: 0,
    img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg',
    amen: EGLE_TWIN_AMENITIES,
  },
  {
    n: 2,
    name: 'Улучшенный двухместный',
    line: '22 м² · двуспальная кровать · вид на парк',
    add: 162,
    img: '/img/b7bf541f72a32e5e2b9be1fa1ffd7676.jpg',
    amen: [
      amenity('bed1', 'Двуспальная кровать'),
      amenity('balcony', 'Балкон'),
      amenity('ac', 'Кондиционер'),
      amenity('shower', 'Душ без порога'),
      amenity('wifi', 'Бесплатный Wi-Fi'),
      amenity('tv', 'Телевизор'),
      amenity('kettle', 'Чайник'),
      amenity('safe', 'Сейф'),
    ],
  },
  {
    n: 3,
    name: 'Полулюкс',
    line: '30 м² · спальня и зона отдыха · ванна',
    add: 396,
    img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
    amen: [
      amenity('bed1', 'Двуспальная кровать'),
      amenity('bath', 'Ванна'),
      amenity('balcony', 'Большой балкон'),
      amenity('ac', 'Кондиционер'),
      amenity('fridge', 'Мини-холодильник'),
      amenity('wifi', 'Бесплатный Wi-Fi'),
      amenity('tv', 'Телевизор'),
      amenity('safe', 'Сейф'),
    ],
  },
  {
    n: 4,
    name: 'Апартаменты',
    line: '42 м² · 2 отдельные комнаты · ванна и душ',
    add: 684,
    img: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg',
    amen: [
      amenity('bed2', '2 отдельные комнаты'),
      amenity('bath', 'Ванна и душ'),
      amenity('balcony', 'Балкон'),
      amenity('ac', 'Кондиционер'),
      amenity('wifi', 'Бесплатный Wi-Fi'),
      amenity('tv', 'Телевизор'),
      amenity('kettle', 'Чайник'),
      amenity('safe', 'Сейф'),
    ],
  },
];

export const EGLE_ABOUT = [
  {
    h: 'Местность',
    items: [
      amenity('beach', 'Пляж на Немане'),
      amenity('ski', 'Горнолыжная SNOW arena'),
      amenity('pool', 'Много бассейнов и бань в городе'),
    ],
  },
  {
    h: 'Бассейны и бани',
    items: [
      amenity('pool', 'Закрытый бассейн'),
      amenity('sauna', 'Турецкая и финская бани'),
      amenity('water', 'Бювет с минеральной водой'),
    ],
  },
  {
    h: 'Лечебные процедуры',
    items: [
      amenity('proc', 'Минеральные и вертикальные ванны'),
      amenity('mud', 'Грязелечение'),
      amenity('salt', 'Соляная комната, ингаляции'),
    ],
  },
  {
    h: 'Досуг и спорт',
    items: [
      amenity('gym', 'Тренажёрный зал'),
      amenity('tennis', 'Теннис, сквош, бильярд'),
      amenity('bike', 'Аренда велосипедов'),
    ],
  },
  {
    h: 'Удобства',
    items: [
      amenity('lift', 'Лифт во всех корпусах'),
      amenity('parking', 'Бесплатная парковка'),
      amenity('library', 'Библиотека, 10 000 книг'),
    ],
  },
  {
    h: 'Питание',
    items: [
      amenity('meals', 'Шведский стол'),
      amenity('bar', 'Бар и кафе'),
      amenity('kettle', 'Диетическое меню по запросу'),
    ],
  },
];

/** Eglė's own photos (sanatorija.lt) first, then Druskininkai around */
export const EGLE_PHOTOS = [
  EGLE_PIC.aerial,
  EGLE_PIC.poolFall,
  EGLE_PIC.robe,
  EGLE_PIC.bathCure,
  EGLE_PIC.park,
  EGLE_PIC.pump,
  { src: '/img/d4cc2009f5e9b68736ab9f9a044668e5.jpg', alt: 'Озеро в сосновом лесу' },
  { src: '/img/ec03ab120412f998fd082eb7bc49afb6.jpg', alt: 'Тропа в лесу' },
];

/** the sanatorium's own photos (sanatorija.lt): guests at the pool, a Comfort Plus room */
export const EGLE_COMFORT_PIC = {
  couplePool: { src: '/img/d82431114d102eee0f48639f84940aad.jpg', alt: 'Отдых у бассейна в санатории «Эгле»' },
  comfortPlus: { src: '/img/9154c799d123fa18ba341825325c1358.jpg', alt: 'Номер «Комфорт плюс»' },
};

export const EGLE_ALL_PHOTOS = [EGLE_COMFORT_PIC.couplePool, EGLE_COMFORT_PIC.comfortPlus].concat(EGLE_PHOTOS, [
  EGLE_PIC.poolCure,
  EGLE_PIC.aquagym,
  EGLE_PIC.doctor,
  EGLE_PIC.buffet,
  EGLE_PIC.gallery,
  EGLE_PIC.library,
  EGLE_PIC.twin,
  EGLE_PIC.double,
  EGLE_PIC.suiteLiving,
  { src: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg', alt: 'Корпус в парке' },
  { src: '/img/4af10be0f78f80567a55b4bd959f92cf.jpg', alt: 'Сосны у санатория' },
  { src: '/img/94582b10c29a7431c8ced47b9345bb6d.jpg', alt: 'Лес у санатория' },
]);

export const EGLE_SPECIALIZATIONS = [
  {
    t: 'Опорно-двигательный аппарат',
    s: 'Суставы, артрозы, восстановление после травм и операций',
    d: 'M6.5 3.5a2.2 2.2 0 0 1 3.1 2.6l8.3 8.3a2.2 2.2 0 1 1 2.6 3.1 2.2 2.2 0 1 1-3.1-2.6L9.1 6.6a2.2 2.2 0 1 1-2.6-3.1z',
  },
  {
    t: 'Позвоночник',
    s: 'Остеохондроз, боли в спине и шее, грыжи дисков',
    d: 'M12 2v20M8.5 5h7M8.5 9.5h7M8.5 14h7M8.5 18.5h7',
  },
  {
    t: 'Нервная система',
    s: 'Стресс, бессонница, невралгии, усталость',
    d: 'M11 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 3h1V3zM13 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 3h-1V3z',
  },
  {
    t: 'Дыхательные пути',
    s: 'Бронхит, астма, восстановление после простуд',
    d: 'M12 3v9M12 8c-2 0-3 2-3 4v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5c0-3 2-6 6-5M12 8c2 0 3 2 3 4v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5c0-3-2-6-6-5',
  },
  {
    t: 'Пищеварительный тракт',
    s: 'Гастрит, печень, желчный пузырь, минеральная вода',
    d: 'M9 3v4a4 4 0 0 0 4 4h1a4.5 4.5 0 0 1 0 9h-2a4.5 4.5 0 0 1-4.5-4.5V14M15 3v4',
  },
  {
    t: 'Сердечно-сосудистая система',
    s: 'Гипертония, восстановление после инфаркта, варикоз',
    d: 'M20.8 8.6a5 5 0 0 0-8.8-3.2A5 5 0 0 0 3.2 8.6c0 5 8.8 11.4 8.8 11.4s8.8-6.4 8.8-11.4zM5 12h3l2-3 3 6 2-3h4',
  },
  {
    t: 'Диабет и эндокринология',
    s: 'Сахарный диабет, щитовидная железа, обмен веществ',
    d: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11zM9.5 11.5h.01M14.5 16.5h.01M9.5 16.5l5-5',
  },
  {
    t: 'Гинекология',
    s: 'Хронические воспаления, климакс, восстановление',
    d: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 13v8M9 18h6',
  },
  {
    t: 'Дерматология',
    s: 'Псориаз, экзема, уход за кожей',
    d: 'M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 13l-2-2a1.5 1.5 0 0 0-2 2l3 5a6 6 0 0 0 5 3h2a5 5 0 0 0 5-5v-3',
  },
];

export const TRANSFER_CARS = [
  {
    img: '/img/edfa76a71b436810e36bd398235820b7.png',
    name: 'Легковой автомобиль',
    info: 'до 3 человек, 3 чемодана',
    price: 'от 130\u00a0€ в одну сторону',
  },
  {
    img: '/img/165765111b3ce679a969db85fe7d023f.png',
    name: 'Микроавтобус',
    info: 'до 7 человек, 7 чемоданов',
    price: 'от 170\u00a0€ в одну сторону',
  },
  {
    img: '/img/3bd69c9fea391e27ab155af10bf6d27f.png',
    name: 'Премиум-класс',
    info: 'до 3 человек, вода, помощь с багажом',
    price: 'от 200\u00a0€ в одну сторону',
  },
];
