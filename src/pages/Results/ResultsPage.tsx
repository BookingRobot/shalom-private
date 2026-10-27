import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './ResultsPage.css';

const HELP_CTX: HelpContextInfo = { dest: 'druskininkai', in: '2026-11-09', out: '2026-11-18' };

class ResultsLogic extends PageLogic {
  constructor(props?: any) {
    super(props);
    this.state = {
      sort: 'pop',
      open: { 'egle-comfort': true },
      det: {},
      sec: {},
      f: { daily: true, doctor: true },
      pf: { daily: true, doctor: true },
      more: false,
      pr: {},
    };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const I = {
      bed2: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M5 9V6h6v3M13 9V6h6v3',
      bed1: 'M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M6 10V7h12v3',
      balcony: 'M3 11h18M5 11v8M9 11v8M13 11v8M17 11v8M3 19h18M6 11V5h12v6',
      ac: 'M3 6h18v7H3zM7 16v3M12 16v4M17 16v3M6 10h12',
      wifi: 'M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01',
      shower: 'M4 20V7a4 4 0 0 1 8 0M8 11h8M9 14v1M12 14v1M15 14v1M9 18v1M12 18v1M15 18v1',
      bath: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19v2M17 19v2',
      area: 'M4 4h16v16H4zM4 9h5M4 14h3M9 4v5M14 4v3',
      tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
      kettle: 'M6 9h11a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6zM6 9V7h8v2M6 12H4M9 20h6',
      fridge: 'M6 3h12v18H6zM6 10h12M9 6v2M9 13v3',
      meals: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8',
      doctor: 'M8 4h8v3H8zM6 6h12v15H6zM9 14h2l1-3 2 6 1-3h2',
      proc: 'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0',
      massage: 'M12 20c-4 0-8-3-8-7 2 0 4 1 5 2-1-3 0-7 3-9 3 2 4 6 3 9 1-1 3-2 5-2 0 4-4 7-8 7z',
      gym: 'M2 12h3M19 12h3M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8',
      pool: 'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6',
      aqua: 'M3 20h18M4 16c6 0 8-10 14-10M12 11l3 3M16 9l3 3',
      sauna: 'M8 4c-1 2 1 3 0 5M12 4c-1 2 1 3 0 5M16 4c-1 2 1 3 0 5M4 12h16v8H4zM8 16h8',
    };
    const am = (k, t) => ({ d: I[k], t });
    const twinRoom = [
      am('bed2', '2 односпальные кровати'),
      am('balcony', 'Балкон'),
      am('ac', 'Кондиционер'),
      am('wifi', 'Бесплатный Wi-Fi'),
      am('shower', 'Душ'),
      am('tv', 'Телевизор'),
      am('kettle', 'Чайник'),
      am('area', '17–18 м²'),
    ];
    const stdRoom = [
      am('bed1', 'Двуспальная или 2 односпальные'),
      am('shower', 'Душ'),
      am('wifi', 'Бесплатный Wi-Fi'),
      am('tv', 'Телевизор'),
      am('area', '[ПЛОЩАДЬ] м²'),
    ];
    const egleDetails =
      'Для взрослого в цену включено:\n— Консультация врача и по программе назначенные процедуры и исследования\n— Проживание\n— Трёхразовое питание «шведский стол» (завтрак, обед, ужин)\n— Ежедневное посещение бассейнов и саун — без ограничений по времени и количеству раз\n\nДень приезда и отъезда считаются как один лечебный день. Процедуры назначает врач, по одной из каждой группы:\n1. Лечебная ванна (минеральная жемчужная, углекислая) или грязевая аппликация\n2. Лечебный массаж 15 мин (каждый второй день), подводный или аппаратный массаж 20 мин\n3. Групповая кинезитерапия — в зале, в воде или в вертикальной ванне\n4. Аппаратная физиотерапия: электростимуляция, магнитотерапия, ингаляции, соляная комната';
    const all = [
      {
        id: 'egle-comfort',
        name: 'Санаторий Эгле Комфорт',
        sub: 'Друскининкай · Egles g. 1 · 26 отзывов',
        starsN: 4,
        img: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg',
        photos: 10,
        price: 2138,
        pop: 1,
        inc: [
          '3 процедуры в день',
          'Консультация врача',
          'Трёхразовое питание',
          'Бассейны и сауны — без ограничений',
          'Врач говорит по-русски',
        ],
        note: 'При 10 ночах трансфер из аэропорта бесплатный — посмотреть вариант →',
        tags: [
          'daily',
          'doctor',
          'samebld',
          'ru',
          'transfer',
          'lech',
          'pool',
          'meals3',
          'balcony',
          'ac',
          'lift',
          'twin',
          'p-oda',
          'p-spine',
          'p-nerv',
          'p-resp',
          'p-digest',
          'p-diab',
          'p-heart',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник, нервная система, дыхательные пути, пищеварительный тракт, сердечно-сосудистая система, диабет и эндокринология, гинекология, дерматология.',
        time: 'Официальное время заезда — с 14:00. Выезд в последний день — до 12:00. Ранний приезд: багаж примут на хранение, можно сразу на обед.',
        trNote:
          'Бесплатный трансфер из аэропорта Вильнюса — только при заезде от 10 ночей. У вас 9 ночей: продлите на одну — и трансфер бесплатный. Откуда забрать — выберете на следующем шаге.',
        offers: [
          {
            n: 1,
            room: 'Двухместный номер',
            img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg',
            roomPhotos: 7,
            amen: twinRoom,
            roomText:
              'Что ещё есть в номере: телефон, спутниковое ТВ, гардероб, сейф, фен, халат, тапочки. Однокомнатный, 17–18 м².',
            title: 'Программа «Миди» — 3 процедуры в день',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('doctor', 'Консультация врача'),
              am('proc', '3 процедуры в день'),
              am('pool', 'Бассейны и сауны'),
              am('sauna', 'Турецкая и финская бани'),
            ],
            price: '2\u00a0138',
            old: '2\u00a0250',
            adv: 43,
            rest: '2\u00a0095',
            details: egleDetails,
          },
          {
            n: 2,
            room: 'Двухместный номер',
            img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
            roomPhotos: 7,
            amen: twinRoom,
            roomText: 'Тот же номер, расширенная лечебная программа.',
            title: 'Программа «Макси» — 5 процедур в день',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('doctor', 'Консультация врача'),
              am('proc', '5 процедур в день'),
              am('pool', 'Бассейны и сауны'),
              am('sauna', 'Турецкая и финская бани'),
            ],
            price: '2\u00a0275',
            old: '',
            adv: 46,
            rest: '2\u00a0229',
            details: egleDetails.replace(
              'по одной из каждой группы',
              'по одной из каждой группы, плюс одна дополнительная ванна и один дополнительный массаж в день',
            ),
          },
        ],
      },
      {
        id: 'grand-spa-lietuva',
        name: 'Санаторий Гранд Спа Лиетува',
        sub: 'Друскининкай · 20 отзывов',
        starsN: 4,
        img: '/img/a77ef961b37e1edf9b38716a5c54a79f.jpg',
        photos: 17,
        price: 925,
        pop: 2,
        inc: [
          '5 процедур за весь заезд',
          'Консультация врача',
          'Трёхразовое питание',
          'Бассейны и бани — вход включён',
          'Врач говорит по-русски',
        ],
        note: '',
        tags: [
          'doctor',
          'samebld',
          'ru',
          'lech',
          'pool',
          'meals3',
          'ac',
          'lift',
          'double',
          'p-oda',
          'p-spine',
          'p-nerv',
          'p-resp',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник, нервная система, дыхательные пути.',
        time: 'Заезд — с 15:00, выезд — до 12:00.',
        trNote: 'Трансфер из Вильнюса, Каунаса или Варшавы выберете на следующем шаге.',
        offers: [
          {
            n: 1,
            room: 'Двухместный стандарт',
            img: '',
            roomPhotos: 0,
            amen: stdRoom,
            roomText: 'Корпус «Друскининкай», рядом с комплексом бассейнов и бюветом.',
            title: 'Лечебная программа — 5 процедур',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('aqua', 'Много бассейнов и бань, без ограничений'),
              am('doctor', 'Консультация врача'),
              am('proc', '5 лечебных процедур'),
              am('pool', 'Бассейн и бани'),
            ],
            price: '925',
            old: '',
            adv: 19,
            rest: '906',
            details:
              'Для взрослого включено: проживание, трёхразовое питание «шведский стол», консультация врача, 5 лечебных процедур за заезд по назначению врача, ежедневный вход в комплекс бассейнов и бань.\n\nДень приезда и отъезда считаются как один лечебный день.',
          },
        ],
      },
      {
        id: 'egle-standart',
        name: 'Санаторий Эгле Стандарт',
        sub: 'Друскининкай · 13 отзывов',
        starsN: 3,
        img: '/img/c99246b157929f79cff6d7e3a80fe603.jpg',
        photos: 9,
        price: 1710,
        pop: 3,
        inc: [
          '5 процедур в день',
          'Консультация врача',
          'Трёхразовое питание',
          'Бассейны и сауны — без ограничений',
          'Врач говорит по-русски',
        ],
        note: '',
        tags: [
          'daily',
          'doctor',
          'ru',
          'transfer',
          'lech',
          'pool',
          'meals3',
          'lift',
          'twin',
          'p-oda',
          'p-spine',
          'p-nerv',
          'p-resp',
          'p-digest',
          'p-diab',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник, нервная система, дыхательные пути, пищеварительный тракт, эндокринология.',
        time: 'Заезд — с 14:00, выезд — до 12:00.',
        trNote:
          'Бесплатный трансфер из аэропорта Вильнюса — только при заезде от 10 ночей. У вас ' +
          (this.state.nights || 9) +
          ' ноч.',
        offers: [
          {
            n: 1,
            room: 'Двухместный стандарт',
            img: '',
            roomPhotos: 0,
            amen: [
              am('bed2', '2 односпальные кровати'),
              am('shower', 'Душ'),
              am('wifi', 'Бесплатный Wi-Fi'),
              am('tv', 'Телевизор'),
              am('fridge', 'Холодильник'),
            ],
            roomText: 'Корпус «Стандарт», без балкона и кондиционера.',
            title: 'Программа «Макси» — 5 процедур в день',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('doctor', 'Консультация врача'),
              am('proc', '5 процедур в день'),
              am('pool', 'Бассейны и сауны'),
            ],
            price: '1\u00a0710',
            old: '',
            adv: 34,
            rest: '1\u00a0676',
            details: egleDetails,
          },
        ],
      },
      {
        id: 'grand-spa-druskininkai',
        name: 'Санаторий Гранд Спа Друскининкай',
        sub: 'Друскининкай · 13 отзывов',
        starsN: 4,
        img: '/img/e1a95754062c0aa141d79e8971428c9c.jpg',
        photos: 13,
        price: 1105,
        pop: 4,
        inc: [
          '5 процедур за весь заезд',
          'Консультация врача',
          'Трёхразовое питание',
          'Бассейны и бани — вход включён',
          'Врач говорит по-русски',
        ],
        note: '',
        tags: [
          'doctor',
          'samebld',
          'ru',
          'lech',
          'pool',
          'meals3',
          'ac',
          'balcony',
          'lift',
          'double',
          'p-oda',
          'p-spine',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник.',
        time: 'Заезд — с 15:00, выезд — до 12:00.',
        trNote: 'Трансфер выберете на следующем шаге.',
        offers: [
          {
            n: 1,
            room: 'Двухместный с балконом',
            img: '',
            roomPhotos: 0,
            amen: [
              am('bed1', 'Двуспальная кровать'),
              am('balcony', 'Балкон'),
              am('ac', 'Кондиционер'),
              am('shower', 'Душ'),
              am('wifi', 'Бесплатный Wi-Fi'),
            ],
            roomText: 'Новый корпус с панорамными окнами.',
            title: 'Лечебная программа — 5 процедур',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('aqua', 'Много бассейнов и бань'),
              am('doctor', 'Консультация врача'),
              am('proc', '5 лечебных процедур'),
            ],
            price: '1\u00a0105',
            old: '',
            adv: 22,
            rest: '1\u00a0083',
            details:
              'Для взрослого включено: проживание, трёхразовое питание, консультация врача, 5 лечебных процедур, ежедневный вход в комплекс бассейнов и бань.',
          },
        ],
      },
      {
        id: 'belorus',
        name: 'Санаторий Беларусь',
        sub: 'Друскининкай · 17 отзывов',
        starsN: 3,
        img: '/img/405a6bd8cba041318eac2ff89e9e9806.jpg',
        photos: 12,
        price: 1410,
        pop: 5,
        inc: [
          '5 процедур в день',
          'Консультация врача',
          'Трёхразовое питание',
          'Бассейн и сауны — без ограничений',
          'Врач говорит по-русски',
        ],
        note: 'При 14 ночах 14-я ночь бесплатно — посмотреть вариант →',
        tags: [
          'daily',
          'doctor',
          'samebld',
          'ru',
          'lech',
          'pool',
          'meals3',
          'ac',
          'balcony',
          'lift',
          'twin',
          'double',
          'p-oda',
          'p-spine',
          'p-nerv',
          'p-heart',
          'p-digest',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник, нервная система, сердечно-сосудистая система, пищеварительный тракт.',
        time: 'Заезд — с 14:00, выезд — до 12:00.',
        trNote: 'Трансфер выберете на следующем шаге.',
        offers: [
          {
            n: 1,
            room: 'Двухместный улучшенный',
            img: '',
            roomPhotos: 0,
            amen: [
              am('bed2', '2 односпальные кровати'),
              am('ac', 'Кондиционер'),
              am('balcony', 'Балкон'),
              am('bath', 'Ванна'),
              am('wifi', 'Бесплатный Wi-Fi'),
              am('fridge', 'Холодильник'),
            ],
            roomText: 'После реновации, с видом на парк.',
            title: 'Лечебная программа — 5 процедур в день',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('doctor', 'Консультация врача'),
              am('proc', '5 процедур в день'),
              am('pool', 'Бассейн и сауны'),
            ],
            price: '1\u00a0410',
            old: '',
            adv: 28,
            rest: '1\u00a0382',
            details:
              'Для взрослого включено: проживание в улучшенном номере, трёхразовое питание, консультация врача, 5 процедур в день по назначению, бассейн и сауны ежедневно.\n\nАкция: при заезде от 14 ночей — 14-я ночь бесплатно.',
          },
        ],
      },
      {
        id: 'draugyste',
        name: 'Санаторий Минерал Спа Драугисте',
        sub: 'Друскининкай · 4 отзыва',
        starsN: 4,
        img: '/img/a3e6585f5dd9cb9a1b6daa1d5c50ff22.jpg',
        photos: 14,
        price: 1791,
        pop: 6,
        inc: [
          'Процедуры по назначению врача, ежедневно',
          'Консультация врача',
          'Трёхразовое питание',
          'Минеральный бассейн и бани — без ограничений',
          'Врач говорит по-русски',
        ],
        note: '',
        tags: [
          'daily',
          'doctor',
          'samebld',
          'ru',
          'lech',
          'pool',
          'meals3',
          'ac',
          'balcony',
          'lift',
          'double',
          'p-oda',
          'p-spine',
          'p-nerv',
          'p-resp',
        ],
        spec: 'Опорно-двигательный аппарат, позвоночник, нервная система, дыхательные пути.',
        time: 'Заезд — с 15:00, выезд — до 12:00.',
        trNote: 'Трансфер выберете на следующем шаге.',
        offers: [
          {
            n: 1,
            room: 'Улучшенный двухместный',
            img: '',
            roomPhotos: 0,
            amen: [
              am('bed1', 'Двуспальная кровать'),
              am('ac', 'Кондиционер'),
              am('balcony', 'Балкон'),
              am('shower', 'Душ'),
              am('wifi', 'Бесплатный Wi-Fi'),
              am('tv', 'Телевизор'),
            ],
            roomText: 'Корпус после реконструкции, минеральная вода в бассейне.',
            title: 'Программа санаторного лечения',
            prog: [
              am('meals', 'Трёхразовое питание'),
              am('doctor', 'Консультация врача'),
              am('proc', 'Процедуры по назначению'),
              am('pool', 'Минеральный бассейн и бани'),
              am('gym', 'Тренажёрный зал'),
            ],
            price: '1\u00a0791',
            old: '',
            adv: 36,
            rest: '1\u00a0755',
            details:
              'Для взрослого включено: проживание, трёхразовое питание, консультация врача, программа санаторного лечения по назначению врача, ежедневно минеральный бассейн, бани и тренажёрный зал.',
          },
        ],
      },
    ];

    // Знаки отличия — только конкретные, проверяемые факты [ПОДТВЕРДИТЬ ПО САНАТОРИЯМ]
    const IC = {
      lift: 'M4 3h16v18H4zM12 3v18M8 10V7M16 10V7M8 14v3M16 14v3',
      pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      thumb: 'M7 11v10H3V11zM7 11l4-8a2 2 0 0 1 3 2v4h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7',
      family:
        'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2 21v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5M14 21v-4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v4',
      water: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11zM9 15a3 3 0 0 0 3 3',
      renov: 'M3 21l6-6M14 4l6 6-9 9H5v-6z',
    };
    const awardsOf = {
      'egle-comfort': [
        { t: 'Лифт во всех корпусах', d: IC.lift },
        { t: 'Бассейн и бани в здании', d: I.pool },
        { t: 'Выбор гостей', d: IC.thumb },
      ],
      'grand-spa-lietuva': [
        { t: 'Много бассейнов и бань в здании', d: I.aqua },
        { t: 'Центр города, у бювета', d: IC.pin },
      ],
      'egle-standart': [{ t: 'До процедур [N] м по улице', d: I.proc }],
      'grand-spa-druskininkai': [
        { t: 'Новый корпус', d: IC.renov },
        { t: 'Много бассейнов и бань рядом', d: I.aqua },
      ],
      belorus: [
        { t: 'Номера после ремонта', d: IC.renov },
        { t: 'Подходит семьям', d: IC.family },
      ],
      draugyste: [{ t: 'Минеральный бассейн', d: IC.water }],
    };

    const st = this.state;
    const f = st.f || {};
    const sel = Object.keys(f).filter((k) => f[k]);
    const FI = {
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
    const BUILD =
      'M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9h3a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M11 8h1M11 12h1';
    const CAR = 'M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01';
    const groups = {
      // Top tiles — the choices that actually narrow this list
      imp: [
        ['daily', 'Процедуры каждый день', I.proc],
        ['doctor', 'Консультация врача включена', I.doctor],
        ['samebld', 'Всё в одном здании', BUILD],
        ['pool', 'Бассейн', I.pool],
        ['meals3', 'Трёхразовое питание', I.meals],
        ['transfer', 'Трансфер из аэропорта', CAR],
      ],
      comfort: [
        ['lift', 'Лифт', FI.lift],
        ['ac', 'Кондиционер', I.ac],
        ['balcony', 'Балкон', I.balcony],
        ['shower', 'Душ без высокого порога', I.shower],
        ['ru', 'Врач говорит по-русски', 'M4 4h16v12H7l-3 3zM8 9h8M8 12h5'],
      ],
      stars: [
        ['s3', '3 звезды', FI.star],
        ['s4', '4 звезды', FI.star],
        ['s5', '5 звёзд', FI.star],
      ],
      prof: [
        ['p-oda', 'Спина и суставы', FI.oda],
        ['p-nerv', 'Нервная система', FI.nerv],
        ['p-heart', 'Сердце и сосуды', FI.heart],
        ['p-resp', 'Дыхательные пути', FI.resp],
        ['p-digest', 'Пищеварение', FI.digest],
        ['p-diab', 'Диабет', FI.diab],
      ],
      beds: [
        ['double', 'Двуспальная', I.bed1],
        ['twin', 'Две отдельные', I.bed2],
      ],
    };
    const plural = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'санаторий'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'санатория'
          : 'санаториев';
    const labelOf = (k) => {
      if (k === 'pmin') return 'от ' + pr.min + '\u00a0€';
      if (k === 'pmax') return 'до ' + pr.max + '\u00a0€';
      for (const g of Object.values(groups)) {
        const hit = g.find((x) => x[0] === k);
        if (hit) return hit[1];
      }
      return k;
    };
    const has = (h, k) =>
      k === 's3'
        ? h.starsN === 3
        : k === 's4'
          ? h.starsN === 4
          : k === 's5'
            ? h.starsN === 5
            : k === 'shower'
              ? h.tags.includes('lift')
              : h.tags.includes(k);
    const NIGHTS = st.nights || 9,
      PERSONS = 2;
    const ppnOf = (h) => Math.round(h.price / 9 / PERSONS);
    // Applied filters (f, pr) drive the list; pending ones (pf, ppr) are edited in the panel and applied with the button
    const pr = st.pr || {};
    const pf = st.pf || f;
    const ppr = st.ppr || pr;
    const passWith = (F, P) => {
      const S = Object.keys(F).filter((k) => F[k]);
      const starS = S.filter((k) => k[0] === 's' && k.length === 2),
        otherS = S.filter((k) => !(k[0] === 's' && k.length === 2));
      return (h) =>
        (starS.length === 0 || starS.some((k) => has(h, k))) &&
        otherS.every((k) => has(h, k)) &&
        (!P.min || ppnOf(h) >= P.min) &&
        (!P.max || ppnOf(h) <= P.max);
    };
    const pass = passWith(f, pr);
    const passPending = passWith(pf, ppr);
    const pendingN = all.filter(passPending).length;
    const pendingCount = Object.keys(pf).filter((k) => pf[k]).length + (ppr.min ? 1 : 0) + (ppr.max ? 1 : 0);
    const mk = (pairs) =>
      pairs.map(([k, t, d]) => ({
        k,
        t,
        d,
        on: !!pf[k],
        cls: pf[k] ? 'on' : '',
        n: all.filter((h) => has(h, k) && passWith({ ...pf, [k]: false }, ppr)(h)).length,
        toggle: () => this.setState({ pf: { ...pf, [k]: !pf[k] } }),
      }));

    const sort = st.sort || 'pop';
    const list = all
      .filter(pass)
      .sort((a, b) => (sort === 'cheap' ? a.price - b.price : sort === 'exp' ? b.price - a.price : a.pop - b.pop));
    const open = st.open || {},
      det = st.det || {},
      sec = st.sec || {};
    const secT = (id, s) => () => this.setState({ sec: { ...sec, [id + s]: !sec[id + s] } });
    const ADV_RATE = 0.04; // минимальный аванс — 4 % от суммы бронирования
    const toNum = (s) => Number(String(s).replace(/\s/g, ''));
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    const ppn = (total) => Math.round(toNum(total) / NIGHTS / PERSONS);
    // ---- Dates & price calendar ("Когда дешевле?") ----
    const MONTHS = [
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
    const MONTHS_N = [
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
    const DAY = 86400000;
    const toD = (s) => new Date(s + 'T00:00:00Z');
    const iso = (d) => d.toISOString().slice(0, 10);
    const addD = (d, n) => new Date(d.getTime() + n * DAY);
    const short = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
    const range = (d) => {
      const e = addD(d, NIGHTS);
      return d.getUTCMonth() === e.getUTCMonth()
        ? d.getUTCDate() + '–' + e.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]
        : short(d) + ' – ' + short(e);
    };
    const BASE_IN = toD('2026-11-09');
    const checkin = toD(st.checkin || '2026-11-09');
    const dayIdx = (d) => Math.round((d - BASE_IN) / DAY);
    // Seasonal/weekday factor; normalised so the original price holds on the original dates
    const G = (h, d) => {
      const n = dayIdx(d),
        wd = d.getUTCDay();
      return (
        1 +
        0.11 * Math.sin(n * 0.55 + h.pop * 1.1) +
        (wd === 5 || wd === 6 ? 0.07 : 0) +
        (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
      );
    };
    const soldOut = (h, d) => (dayIdx(d) * 7 + h.pop * 3) % 23 === 0;
    const stayFactor = (h, d) => ((G(h, d) / G(h, BASE_IN)) * NIGHTS) / 9;
    const totalFor = (h, d, base) => Math.round(base * stayFactor(h, d));
    const ppnFor = (h, d, base) => Math.round(totalFor(h, d, base) / NIGHTS / PERSONS);
    const dateRange = range(checkin) + ' ' + checkin.getUTCFullYear();
    const checkinISO = iso(checkin),
      checkoutISO = iso(addD(checkin, NIGHTS));
    // ---- Room-first model: each room is sold with the cheapest programme; other programmes are upgrades ----
    const pf1 = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'процедура'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'процедуры'
          : 'процедур';
    const valueOf = (p, roomName, area) => {
      const pm = String(p.title).match(/(\d+) процедур/);
      const nProc = pm ? Number(pm[1]) : 0;
      const perDay = /в день/.test(p.title);
      const progT = p.prog.map((x) => x.t).join(' ');
      return [
        nProc
          ? {
              d: I.proc,
              big: String(nProc),
              label: perDay ? pf1(nProc) + ' в день' : pf1(nProc) + ' за заезд',
              sub: perDay
                ? nProc * NIGHTS + ' ' + pf1(nProc * NIGHTS) + ' за весь заезд · по назначению врача'
                : 'по назначению врача',
            }
          : { d: I.proc, big: '✓', label: 'процедуры каждый день', sub: 'по назначению врача' },
        /массаж/i.test(progT)
          ? { d: I.massage, big: String(NIGHTS), label: 'массажей', sub: 'классический массаж каждый день' }
          : null,
        /питани|пансион/i.test(progT)
          ? {
              d: I.meals,
              big: /пансион/i.test(progT) ? '4' : '3',
              label: 'приёма пищи в день',
              sub: /пансион/i.test(progT) ? 'полный пансион, диетическое меню' : 'завтрак, обед, ужин · шведский стол',
            }
          : null,
        /врач/i.test(progT)
          ? { d: I.doctor, big: '1', label: 'консультация врача', sub: 'при заезде · говорит по-русски' }
          : null,
        /бассейн|бан/i.test(progT)
          ? {
              d: I.pool,
              big: '∞',
              label: /много/i.test(progT) ? 'бассейны и бани' : 'бассейны и сауны',
              sub: 'каждый день, без ограничений',
            }
          : null,
        { d: I.bed2, big: String(NIGHTS), label: 'ночей в номере', sub: roomName + (area ? ' · ' + area : '') },
      ].filter(Boolean);
    };
    // Room sets per sanatorium [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]
    const ROOMSET = {
      'egle-comfort': [
        { id: 'std', room: 'Двухместный номер', add: 0, img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg' },
        {
          id: 'plus',
          room: 'Улучшенный двухместный',
          add: 162,
          img: '/img/b7bf541f72a32e5e2b9be1fa1ffd7676.jpg',
          amen: [
            am('bed1', 'Двуспальная кровать'),
            am('area', '22 м²'),
            am('balcony', 'Балкон'),
            am('ac', 'Кондиционер'),
            am('shower', 'Душ без порога'),
            am('wifi', 'Бесплатный Wi-Fi'),
          ],
          roomText: 'Окна на юг во внутренний парк, тихая сторона, обновлённая мебель.',
        },
        {
          id: 'junior',
          room: 'Полулюкс',
          add: 396,
          img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
          amen: [
            am('bed1', 'Двуспальная кровать'),
            am('area', '30 м²'),
            am('bath', 'Ванна'),
            am('balcony', 'Большой балкон'),
            am('ac', 'Кондиционер'),
            am('fridge', 'Мини-холодильник'),
          ],
          roomText: 'Спальня и зона отдыха с диваном, халаты и тапочки.',
        },
        {
          id: 'apt',
          room: 'Апартаменты',
          add: 684,
          img: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg',
          amen: [
            am('bed2', '2 отдельные комнаты'),
            am('area', '42 м²'),
            am('bath', 'Ванна и душ'),
            am('balcony', 'Балкон'),
            am('ac', 'Кондиционер'),
            am('wifi', 'Бесплатный Wi-Fi'),
          ],
          roomText: 'Две комнаты с дверью — каждый в своём режиме сна.',
        },
      ],
    };
    const EXTRA_PROG = {
      'egle-comfort': {
        n: 3,
        title: 'Программа «Премиум» — 5 процедур в день + массаж',
        price: '2 550',
        prog: [
          am('meals', 'Полный пансион, диетическое меню'),
          am('doctor', 'Консультация врача'),
          am('proc', '5 процедур в день'),
          am('massage', 'Массаж каждый день'),
          am('pool', 'Бассейны и сауны'),
        ],
        details:
          'Для взрослого в цену включено:\n— Всё, что в программе «Макси»\n— Ежедневный классический массаж 30 мин\n— Полный пансион: завтрак, обед, полдник, ужин, диетическое меню по назначению врача\n\nПроцедуры назначает врач после консультации.',
      },
    };

    // Room types fully booked on some dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]: [from, to) per room
    const ROOM_BUSY = { 'egle-comfort:junior': ['2026-11-01', '2026-11-23'] };
    const busyRange = (key) => ROOM_BUSY[key] || null;
    const overlaps = (key, a, b) => {
      const r = busyRange(key);
      if (!r) return false;
      const s0 = new Date(r[0] + 'T00:00:00Z'),
        s1 = new Date(r[1] + 'T00:00:00Z');
      return a < s1 && b > s0;
    };
    const roomDayBusy = (key, d) => {
      const r = busyRange(key);
      if (!r) return false;
      const t = d.toISOString().slice(0, 10);
      return t >= r[0] && t < r[1];
    };
    const RU_M = [
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
    const freeFrom = (key) => {
      const r = busyRange(key);
      if (!r) return '';
      const d = new Date(r[1] + 'T00:00:00Z');
      return 'с ' + d.getUTCDate() + ' ' + RU_M[d.getUTCMonth()];
    };
    const BUSY_LOOK = {
      cardBorder: '1px solid #E3DED2',
      cardBg: '#F7F5F0',
      imgFilter: 'grayscale(1) opacity(.7)',
      pillBg: '#E8E6E1',
      pillColor: '#5E6862',
      nameColor: '#5E6862',
    };
    const FREE_LOOK = {
      cardBorder: '1px solid #E3DED2',
      cardBg: '#fff',
      imgFilter: 'none',
      pillBg: '#EEF5F1',
      pillColor: '#1F5F4A',
      nameColor: '#1C2620',
    };
    const roomsOf = (h0, h, sf) => {
      const scale = (x) => Math.round(toNum(x) * sf);
      let progs = h0.offers.map((o) => ({
        ...o,
        priceN: scale(o.price),
        meals: o.prog.some((x) => /питани/i.test(x.t)) ? 'питание 3 раза' : '',
      }));
      if (EXTRA_PROG[h0.id]) {
        const e = EXTRA_PROG[h0.id];
        progs.push({ ...e, priceN: scale(e.price), meals: 'полный пансион' });
      } else
        progs.push({
          ...progs[0],
          n: 9,
          title: 'Расширенная программа — +2 процедуры в день',
          priceN: Math.round(progs[0].priceN * 1.1),
          details:
            progs[0].details + '\n\nРасширенная программа: две дополнительные процедуры в день по назначению врача.',
        });
      progs.sort((a, b) => a.priceN - b.priceN);
      const base = h0.offers[0];
      const set = ROOMSET[h0.id] || [
        { id: 'std', room: base.room, add: 0, img: base.img },
        { id: 'plus', room: 'Улучшенный номер', add: Math.round(toNum(base.price) * 0.08), img: '' },
      ];
      return set.map((r, ri) => {
        const addN = Math.round(r.add * sf),
          cheapest = progs[0].priceN + addN;
        const adv = Math.ceil(cheapest * ADV_RATE);
        return {
          ...base,
          n: ri + 1,
          id: r.id,
          room: r.room,
          img: r.img || base.img || h0.img,
          amen: r.amen || base.amen,
          roomText: r.roomText || base.roomText,
          addN,
          progs,
          title: progs[0].title,
          prog: progs[0].prog,
          details: progs[0].details,
          price: fmt(cheapest),
          old: '',
          adv,
          rest: fmt(cheapest - adv),
        };
      });
    };
    const hotels = list.map((h0) => {
      const sf = stayFactor(h0, checkin);
      const h = {
        ...h0,
        price: Math.round(h0.price * sf),
        offers: h0.offers.map((o) => ({
          ...o,
          price: fmt(Math.round(toNum(o.price) * sf)),
          old: o.old ? fmt(Math.round(toNum(o.old) * sf)) : '',
          adv: Math.ceil(Math.round(toNum(o.price) * sf) * ADV_RATE),
          rest: fmt(Math.round(toNum(o.price) * sf) - Math.ceil(Math.round(toNum(o.price) * sf) * ADV_RATE)),
        })),
      };
      const isOpen = !!open[h.id];
      const aw = awardsOf[h.id] || [];
      return {
        ...h,
        openCal: () =>
          this.setState({
            cal: { id: h.id, picked: iso(checkin), month: checkin.getUTCMonth(), year: checkin.getUTCFullYear() },
          }),
        stars: '★'.repeat(h.starsN),
        awards: aw,
        hasAwards: aw.length > 0,
        ppn: ppn(h.price),
        advMin: Math.min(...h.offers.map((o) => o.adv)),
        price: fmt(h.price),
        procT: h.inc[0],
        procSub: /в день|ежедневно/.test(h.inc[0])
          ? 'лечебные процедуры по назначению врача, каждый день'
          : 'лечебные процедуры по назначению врача',
        incRest: h.inc
          .slice(1)
          .map((t) => ({
            t,
            d: /питани/i.test(t)
              ? I.meals
              : /говорит/i.test(t)
                ? 'M4 4h16v12H7l-3 3zM8 9h8M8 12h5'
                : /врач/i.test(t)
                  ? I.doctor
                  : /бассейн/i.test(t)
                    ? I.pool
                    : /процедур/i.test(t)
                      ? I.proc
                      : /процедур|лечени/i.test(t)
                        ? I.proc
                        : /номер/i.test(t)
                          ? I.bed2
                          : 'm5 12 5 5L20 7',
          })),
        open: isOpen,
        border: isOpen ? '#1F5F4A' : '#E3DED2',
        btnLabel: isOpen ? 'Скрыть варианты' : 'Номера и программы',
        chips: [
          h.tags.includes('doctor') ? { t: 'Врач включён', d: I.doctor } : null,
          h.tags.includes('pool')
            ? { t: /много бассейнов|бани/i.test(h.inc.join(' ')) ? 'Бассейны и бани' : 'Бассейн и сауны', d: I.pool }
            : null,
          h.tags.includes('meals3') ? { t: 'Питание 3 раза', d: I.meals } : null,
          h.tags.includes('samebld')
            ? { t: 'Всё в одном здании', d: BUILD }
            : h.tags.includes('transfer')
              ? { t: 'Трансфер из аэропорта', d: CAR }
              : null,
        ].filter(Boolean),
        chev: isOpen ? 'rotate(180deg)' : 'none',
        btnCls: isOpen ? 'btn-secondary' : 'btn-primary',
        toggle: () => this.setState({ open: { ...open, [h.id]: !isOpen } }),
        specOpen: !!sec[h.id + 'spec'],
        toggleSpec: secT(h.id, 'spec'),
        timeOpen: !!sec[h.id + 'time'],
        toggleTime: secT(h.id, 'time'),
        trOpen: !!sec[h.id + 'tr'],
        toggleTr: secT(h.id, 'tr'),
        offers: roomsOf(h0, h, sf).map((r) => {
          const o = r;
          const key = h.id + '-' + o.n;
          const dOpen = !!det[key];
          const area = (o.amen.find((a) => /м²/.test(a.t)) || {}).t;
          const beds = o.amen.find((a) => /кроват/i.test(a.t));
          const extra = o.amen.find((a) => /Балкон|Кондиционер|Ванна/.test(a.t));
          const amenTop = [
            { d: I.bed2, t: o.room + (area ? ' · ' + area : '') },
            beds
              ? {
                  d: beds.d,
                  t: beds.t.replace('2 односпальные кровати', '2 отдельные кровати') + (extra ? ' · ' + extra.t : ''),
                }
              : null,
          ].filter(Boolean);
          const detLines = String(o.details)
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              t: l.replace(/^— ?/, '• '),
              fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
              pl: /^—/.test(l) ? '14px' : '0',
              mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
            }));
          const parts = String(o.title).split(' — ');
          const short = parts[0];
          // Value tiles: the big, fast-to-read numbers of what the programme gives
          const pm = String(o.title).match(/(\d+) процедур/);
          const nProc = pm ? Number(pm[1]) : 0;
          const perDay = /в день/.test(o.title);
          const progT = o.prog.map((p) => p.t).join(' ');
          const pf1 = (n) => (n === 1 ? 'процедура' : n < 5 ? 'процедуры' : 'процедур');
          const value = [
            nProc
              ? {
                  d: I.proc,
                  big: String(nProc),
                  label: perDay ? pf1(nProc) + ' в день' : pf1(nProc) + ' за заезд',
                  sub: perDay
                    ? nProc * NIGHTS + ' ' + pf1(nProc * NIGHTS) + ' за весь заезд · по назначению врача'
                    : 'по назначению врача, 4 группы на выбор',
                }
              : { d: I.proc, big: '✓', label: 'процедуры каждый день', sub: 'по назначению врача' },
            /питани/i.test(progT)
              ? { d: I.meals, big: '3', label: 'приёма пищи в день', sub: 'завтрак, обед, ужин · шведский стол' }
              : null,
            /врач/i.test(progT)
              ? { d: I.doctor, big: '1', label: 'консультация врача', sub: 'при заезде · говорит по-русски' }
              : null,
            /бассейн|бан/i.test(progT)
              ? {
                  d: I.pool,
                  big: '∞',
                  label: /много/i.test(progT) ? 'бассейны и бани' : 'бассейны и сауны',
                  sub: 'каждый день, без ограничений',
                }
              : null,
            { d: I.bed2, big: String(NIGHTS), label: 'ночей в номере', sub: o.room + (area ? ' · ' + area : '') },
          ].filter(Boolean);
          const sub =
            'с программой ' +
            short.replace('Программа ', '') +
            (parts[1] ? ' · ' + parts[1] : '') +
            (/питани/i.test(progT) ? ' · питание 3 раза' : '');
          // programmes for this room, cheapest first; selection drives the details below
          const ps = st.ps || {};
          const selI = ps[key] ?? 0;
          const progs = r.progs;
          const sp = progs[selI] || progs[0];
          const progRows = progs.map((p, pi) => {
            const on = pi === selI,
              pp = p.title.split(' — ');
            return {
              name: pp[0],
              sub: (pp[1] || '') + (p.meals ? ' · ' + p.meals : ''),
              price: fmt(p.priceN + r.addN) + '\u00a0€',
              diff: pi === 0 ? 'самая доступная' : '+' + fmt(p.priceN - progs[0].priceN) + '\u00a0€ к цене',
              diffColor: pi === 0 ? '#1F5F4A' : '#3E4B44',
              border: on ? '#1F5F4A' : '#CFC9BB',
              bg: on ? '#EEF5F1' : '#fff',
              dot: on ? '#1F5F4A' : 'transparent',
              pick: () => this.setState({ ps: { ...ps, [key]: pi } }),
            };
          });
          const spVal = valueOf(sp, o.room, area);
          const spLines = String(sp.details)
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              t: l.replace(/^— ?/, '• '),
              fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
              pl: /^—/.test(l) ? '14px' : '0',
              mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
            }));
          const rkey = h.id + ':' + r.id,
            checkout = addD(checkin, NIGHTS);
          const busy = overlaps(rkey, checkin, checkout);
          const p0 = progs[0].title.split(' — ');
          return {
            ...o,
            short: o.room,
            sub,
            value: spVal,
            detLines: spLines,
            prog: sp.prog,
            amenTop,
            progRows,
            ...(busy ? BUSY_LOOK : FREE_LOOK),
            busy,
            avail: !busy,
            busyRange: range(checkin),
            nextFree: freeFrom(rkey),
            pill: busy
              ? 'Нет мест на ваши даты'
              : r.addN
                ? 'Номер +' + fmt(r.addN) + '\u00a0€'
                : 'Включён в цену программы',
            roomLine: (o.amen || [])
              .slice(0, 3)
              .map((a) => a.t)
              .join(' · '),
            progLine:
              'с программой ' +
              p0[0].replace('Программа ', '') +
              (p0[1] ? ' · ' + p0[1] : '') +
              ' · ' +
              (progs[0].meals || 'питание 3 раза'),
            ppn: Math.round(toNum(o.price) / NIGHTS / PERSONS),
            openRoomCal: () =>
              this.setState({
                cal: {
                  id: h.id,
                  picked: busyRange(rkey) ? busyRange(rkey)[1] : iso(checkin),
                  month: checkin.getUTCMonth(),
                  year: checkin.getUTCFullYear(),
                  roomKey: rkey,
                  roomName: r.room,
                },
              }),
            selName: sp.title.split(' — ')[0],
            selPrice: fmt(sp.priceN + r.addN) + '\u00a0€',
            addLabel: r.addN ? 'номер +' + fmt(r.addN) + '\u00a0€ к базовому' : 'с самой доступной программой',
            detBtn: 'Программы и что входит (' + progs.length + ')',
            detChev: dOpen ? 'rotate(180deg)' : 'none',
            noImg: !o.img,
            ppn: ppn(o.price),
            oldPpn: o.old ? ppn(o.old) : '',
            detOpen: dOpen,
            detLabel: dOpen ? 'Всё понятно, можно убрать' : 'Подробнее. Что сюда входит?',
            toggleDet: () => this.setState({ det: { ...det, [key]: !dOpen } }),
          };
        }),
      };
    });
    // calendar modal values
    const calH = st.cal ? all.find((h) => h.id === st.cal.id) : null;
    let cal = { cells: [] };
    if (calH) {
      const base = toNum(calH.offers[0].price);
      const picked = toD(st.cal.picked || iso(checkin));
      const m0 = st.cal.month ?? checkin.getUTCMonth(),
        y0 = st.cal.year ?? checkin.getUTCFullYear();
      const first = new Date(Date.UTC(y0, m0, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y0, m0 + 1, 0)).getUTCDate();
      const curP = ppnFor(calH, checkin, base);
      const cells = [];
      for (let i = 0; i < lead; i++)
        cells.push({
          day: '',
          fly: false,
          text: '',
          sub: '',
          bg: '#fff',
          border: '#F0EDE6',
          color: '#1C2620',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y0, m0, d));
        const past = date < toD('2026-10-27');
        const so =
          soldOut(calH, date) ||
          (st.cal.roomKey
            ? roomDayBusy(st.cal.roomKey, date) ||
              roomDayBusy(st.cal.roomKey, addD(date, NIGHTS - 1)) ||
              overlaps(st.cal.roomKey, date, addD(date, NIGHTS))
            : false);
        const p = ppnFor(calH, date, base);
        const isCur = iso(date) === iso(checkin),
          isPick = iso(date) === iso(picked);
        const r = p / curP;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.03 ? '#FFF6E3' : '#FCEDE9';
        if (so || past) bg = '#E8E6E1';
        cells.push({
          day: d,
          fly: [0, 2, 4].includes(date.getUTCDay()) && !(typeof past !== 'undefined' && past),
          text: so || past ? (past ? '' : 'Нет мест') : p + '\u00a0€',
          sub: isPick ? '✓ Новый заезд' : isCur ? 'Ваш заезд' : '',
          bg,
          border: isPick ? '#1F5F4A' : isCur ? '#1C2620' : 'transparent',
          color: isPick ? '#1F5F4A' : '#1C2620',
          off: so || past,
          cursor: so || past ? 'not-allowed' : 'pointer',
          aria: d + ' ' + MONTHS[m0] + (so ? ', нет мест' : ', ' + p + '\u00a0€ за человека в сутки'),
          pick: () => this.setState({ cal: { ...st.cal, picked: iso(date) } }),
        });
      }
      const newTotal = totalFor(calH, picked, base),
        curTotal = totalFor(calH, checkin, base),
        diff = curTotal - newTotal;
      const off1 = calH.offers[0];
      cal = {
        hotelName: calH.name,
        room: st.cal.roomName || off1.room,
        prog: off1.title.replace(/ — .*$/, ''),
        curPpn: curP,
        monthTitle: MONTHS_N[m0] + ' ' + y0,
        cells,
        newIn: short(picked),
        newOut: short(addD(picked, NIGHTS)),
        newPpn: ppnFor(calH, picked, base),
        newTotal: fmt(newTotal),
        curTotal: fmt(curTotal),
        newRange: range(picked),
        diffText:
          diff > 0
            ? '↓ Экономия за поездку: ' + fmt(diff) + '\u00a0€'
            : diff < 0
              ? '↑ Дороже на ' + fmt(-diff) + '\u00a0€'
              : 'Та же цена, что и на ваши даты',
        diffBg: diff > 0 ? '#DFF0E4' : diff < 0 ? '#FBE3DE' : '#F4F1EA',
        diffColor: diff > 0 ? '#1F5F4A' : diff < 0 ? '#B3261E' : '#3E4B44',
      };
    }
    const calVals = {
      calOpen: !!calH,
      cal,
      curRange: range(checkin),
      dateRange,
      checkinISO,
      checkoutISO,
      calClose: () => this.setState({ cal: null }),
      calPrev: () => {
        const m = (st.cal.month ?? checkin.getUTCMonth()) - 1,
          y = st.cal.year ?? checkin.getUTCFullYear();
        this.setState({ cal: { ...st.cal, month: (m + 12) % 12, year: m < 0 ? y - 1 : y } });
      },
      calNext: () => {
        const m = (st.cal.month ?? checkin.getUTCMonth()) + 1,
          y = st.cal.year ?? checkin.getUTCFullYear();
        this.setState({ cal: { ...st.cal, month: m % 12, year: m > 11 ? y + 1 : y } });
      },
      calApply: () => this.setState({ checkin: st.cal.picked || iso(checkin), cal: null }),
    };
    // ---- Search picker: same two-month range calendar as on the home page ----
    const nW = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'ночь'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'ночи'
          : 'ночей';
    const TODAY = toD('2026-10-27');
    const checkout = addD(checkin, NIGHTS);
    const longD = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    const ss = st.ss || { in: iso(checkin), out: iso(checkout) };
    const sIn = ss.in ? toD(ss.in) : null,
      sOut = ss.out ? toD(ss.out) : null;
    const sm0 = st.sm ?? checkin.getUTCMonth(),
      sy0 = st.sy ?? checkin.getUTCFullYear();
    const sm1 = (sm0 + 1) % 12,
      sy1 = sm0 === 11 ? sy0 + 1 : sy0;
    const AVG = 100;
    const avgPpn = (d) => {
      const n = Math.round((d - TODAY) / DAY),
        wd = d.getUTCDay(),
        m = d.getUTCMonth();
      return Math.round(
        AVG *
          (1 +
            0.12 * Math.sin(n * 0.42) +
            (wd === 5 || wd === 6 ? 0.06 : 0) +
            (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
            (m >= 5 && m <= 7 ? 0.15 : 0) +
            (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
      );
    };
    const sPick = (date) => () => {
      const k = iso(date);
      if (!ss.in || (ss.in && ss.out)) this.setState({ ss: { in: k, out: null } });
      else if (date > toD(ss.in)) this.setState({ ss: { in: ss.in, out: k } });
      else this.setState({ ss: { in: k, out: null } });
    };
    const sCells = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const cells = [];
      for (let i = 0; i < lead; i++)
        cells.push({
          day: '',
          fly: false,
          sub: '',
          bg: 'transparent',
          border: 'transparent',
          color: '#1C2620',
          subColor: '#3E4B44',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y, m, d));
        const past = date < TODAY;
        const full =
          !past &&
          [
            '2026-11-20',
            '2026-11-21',
            '2026-11-22',
            '2026-12-24',
            '2026-12-25',
            '2026-12-26',
            '2026-12-27',
            '2026-12-31',
            '2027-01-01',
          ].includes(iso(date));
        /* [ПРИМЕР] нет мест ни в одном объекте */ const p = avgPpn(date),
          r = p / AVG;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9',
          color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut),
          between = sIn && sOut && date > sIn && date < sOut;
        if (past) {
          bg = '#E8E6E1';
          color = '#9AA39E';
          subColor = '#9AA39E';
        }
        if (full) {
          bg = 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)';
          color = '#8A968F';
          subColor = '#8A5A00';
        }
        if (between) border = '#1F5F4A';
        if (isIn || isOut) {
          bg = '#1F5F4A';
          color = '#fff';
          subColor = '#D9E2DC';
          border = '#1F5F4A';
        }
        cells.push({
          day: d,
          fly: [0, 2, 4].includes(date.getUTCDay()) && !(typeof past !== 'undefined' && past),
          sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + '\u00a0€',
          bg,
          border,
          color,
          subColor,
          off: past || full,
          cursor: past || full ? 'not-allowed' : 'pointer',
          aria: d + ' ' + MONTHS[m] + (past ? ', недоступно' : ', около ' + p + ' € за человека в сутки'),
          pick: sPick(date),
        });
      }
      return cells;
    };
    const sN = sIn && sOut ? Math.round((sOut - sIn) / DAY) : 0;
    const sPreset = (n) => () => {
      const a = sIn || checkin;
      this.setState({ ss: { in: iso(a), out: iso(addD(a, n)) } });
    };
    const searchVals = {
      nightsLabel: NIGHTS + ' ' + nW(NIGHTS),
      sInLabel: longD(checkin),
      sOutLabel: longD(checkout),
      sCalOpen: !!st.sOpen,
      sOpenCal: () =>
        this.setState({
          sOpen: true,
          ss: { in: iso(checkin), out: iso(checkout) },
          sm: checkin.getUTCMonth(),
          sy: checkin.getUTCFullYear(),
        }),
      sCloseCal: () => this.setState({ sOpen: false }),
      sCalPrev: () => {
        const m = sm0 - 1;
        this.setState({ sm: (m + 12) % 12, sy: m < 0 ? sy0 - 1 : sy0 });
      },
      sCalNext: () => {
        const m = sm0 + 1;
        this.setState({ sm: m % 12, sy: m > 11 ? sy0 + 1 : sy0 });
      },
      sMonths: [
        { title: MONTHS_N[sm0] + ' ' + sy0, cells: sCells(sy0, sm0) },
        { title: MONTHS_N[sm1] + ' ' + sy1, cells: sCells(sy1, sm1) },
      ],
      sCalHint: !sIn
        ? 'Нажмите день заезда'
        : !sOut
          ? 'Теперь нажмите день выезда'
          : 'Можно поменять: нажмите новый день заезда',
      sSelIn: sIn ? short(sIn) : '—',
      sSelOut: sOut ? short(sOut) : '—',
      sSelNights: sN ? sN + ' ' + nW(sN) : '—',
      sApplyOff: !sN,
      sApplyCal: () => {
        if (sN) this.setState({ checkin: iso(sIn), nights: sN, sOpen: false });
      },
      sP7: sPreset(7),
      sP10: sPreset(10),
      sP14: sPreset(14),
      sP21: sPreset(21),
    };
    return {
      ...calVals,
      ...searchVals,
      // Not available on the chosen dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]
      soldHotels: [
        {
          name: 'Санаторий Упа',
          stars: '★★★',
          sub: 'Друскининкай · у парка Вийя',
          img: '/img/79c9318ba02a718e29de4346c9642a33.jpg',
          next: 'с 23 ноября',
        },
        {
          name: 'SPA Vilnius Друскининкай',
          stars: '★★★★',
          sub: 'Друскининкай · у реки Неман',
          img: '/img/30b3b315653c1dbc711827ceb6c48ebe.jpg',
          next: 'с 1 декабря',
        },
      ].map((u) => ({
        ...u,
        chips: [
          { t: 'Врач включён', d: I.doctor },
          { t: 'Бассейн и сауны', d: I.pool },
          { t: 'Питание 3 раза', d: I.meals },
        ],
        notify: () => this.setState({ help: 'form' }),
      })),
      soldCount: '2 санатория',
      hotels,
      none: hotels.length === 0,
      some: hotels.length > 0,
      foundLabel:
        hotels.length === all.length
          ? 'Все ' + all.length + ' ' + plural(all.length)
          : 'Подходят ' + hotels.length + ' из ' + all.length + ' ' + plural(all.length),
      hasActive: sel.length > 0 || !!pr.min || !!pr.max,
      active: sel.concat(pr.min ? ['pmin'] : [], pr.max ? ['pmax'] : []).map((k) => ({
        t: labelOf(k),
        off: () => {
          if (k === 'pmin' || k === 'pmax') {
            const key = k === 'pmin' ? 'min' : 'max';
            const np = { ...pr, [key]: 0 };
            this.setState({ pr: np, ppr: { ...ppr, [key]: 0 } });
          } else this.setState({ f: { ...f, [k]: false }, pf: { ...pf, [k]: false } });
        },
      })),
      fTop: mk(groups.imp),
      fComfort: mk(groups.comfort),
      fStars: mk(groups.stars),
      fProfile: mk(groups.prof),
      fBeds: mk(groups.beds),
      moreOpen: !!st.more,
      moreClosed: !st.more,
      toggleMore: () => this.setState({ more: !st.more }),
      // The whole filter block is collapsed by default so the list starts higher on a laptop
      fOpen: !!st.fo,
      fClosed: !st.fo,
      openF: () => this.setState({ fo: true, pf: { ...f }, ppr: { ...pr } }),
      closeF: () => this.setState({ fo: false, more: false, pf: { ...f }, ppr: { ...pr } }),
      appliedSummary:
        sel.length === 0 && !pr.min && !pr.max
          ? 'Условия не выбраны — показаны все санатории'
          : 'Выбрано: ' +
            sel
              .concat(pr.min ? ['pmin'] : [], pr.max ? ['pmax'] : [])
              .map(labelOf)
              .join(', '),
      pMin: ppr.min || '',
      pMax: ppr.max || '',
      setMin: (e) => this.setState({ ppr: { ...ppr, min: Number(e.target.value) || 0 } }),
      setMax: (e) => this.setState({ ppr: { ...ppr, max: Number(e.target.value) || 0 } }),
      pendCount:
        pendingCount === 0
          ? 'Условия не выбраны'
          : 'Выбрано ' +
            pendingCount +
            ' ' +
            (pendingCount === 1 ? 'условие' : pendingCount < 5 ? 'условия' : 'условий'),
      applyLabel: pendingN === 0 ? 'Ничего не подходит' : 'Показать ' + pendingN + ' ' + plural(pendingN),
      apply: () => this.setState({ f: { ...pf }, pr: { ...ppr }, more: false, fo: false }),
      clearPending: () => this.setState({ pf: {}, ppr: {} }),
      reset: () => this.setState({ f: {}, pf: {}, pr: {}, ppr: {} }),
      sort,
      setSort: (e) => this.setState({ sort: e.target.value }),
      popCls: sort === 'pop' ? 'on' : '',
      cheapCls: sort === 'cheap' ? 'on' : '',
      expCls: sort === 'exp' ? 'on' : '',
      sortPop: () => this.setState({ sort: 'pop' }),
      sortCheap: () => this.setState({ sort: 'cheap' }),
      sortExp: () => this.setState({ sort: 'exp' }),
    };
  }
}

export default function ResultsPage() {
  usePageTitle('Санатории Друскининкая');
  const [v, logic] = usePageLogic(ResultsLogic);
  return (
    <div className="page pg-results">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <MainNav active="resorts" />
          <PhoneLink size={19} />
        </HeaderBar>
        {/* Search band: same picker as on the home page */}
        <section style={{ background: '#1F5F4A' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '16px 24px 18px' }}>
            <form
              className="card"
              action="results.html"
              style={{
                padding: '16px 18px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0,0,0,.15)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="city">
                    Курорт
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <select id="city" className="input sinput">
                      <option>Друскининкай</option>
                      <option>Бирштонас</option>
                      <option>Паланга</option>
                      <option>Аникщяй</option>
                    </select>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ position: 'absolute', right: '12px', top: '16px', pointerEvents: 'none' }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="datein">
                    Заезд
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                    </svg>
                    <button type="button" id="datein" className="input sinput datebtn" onClick={v.sOpenCal}>
                      {v.sInLabel}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="dateout">
                    Выезд
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                    </svg>
                    <button type="button" id="dateout" className="input sinput datebtn" onClick={v.sOpenCal}>
                      {v.sOutLabel}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="lbl" htmlFor="guests">
                    Гости
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg
                      className="fieldico"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                    <select id="guests" className="input sinput">
                      <option>2 взрослых</option>
                      <option>1 взрослый</option>
                      <option>2 взрослых, 1 ребёнок</option>
                      <option>2 взрослых, 2 ребёнка</option>
                      <option>3 взрослых</option>
                      <option>4 взрослых</option>
                    </select>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ position: 'absolute', right: '12px', top: '16px', pointerEvents: 'none' }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
                <Link className="btn btn-primary" to="/results" style={{ minHeight: '50px' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Изменить поиск
                </Link>
              </div>
              <div style={{ fontSize: '14px', color: '#6B776F' }}>
                {v.nightsLabel} · Цены ниже — за весь заезд для всех гостей.
              </div>
            </form>
          </div>
        </section>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '22px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Главная</Link> › Друскининкай
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 style={{ fontSize: '40px' }}>Санатории Друскининкая</h1>
            <div style={{ fontSize: '17px', color: '#3E4B44' }}>
              {v.dateRange} · {v.nightsLabel} · 2 взрослых
            </div>
          </div>
          {/* Filters above the list */}
          {v.fClosed ? (
            <>
              <section
                className="card"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
                    <circle cx="16" cy="7" r="2" />
                    <circle cx="10" cy="12" r="2" />
                    <circle cx="18" cy="17" r="2" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '24px' }}>Уточните выбор</h2>
                    <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.appliedSummary}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.openF}
                  style={{ minHeight: '50px', fontSize: '17px', padding: '0 22px' }}
                >
                  Раскрыть фильтры
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </section>
            </>
          ) : null}
          {v.fOpen ? (
            <>
              <section
                className="card"
                style={{
                  padding: '22px 24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderColor: '#1F5F4A',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h2 style={{ fontSize: '28px' }}>Уточните выбор</h2>
                    <span style={{ fontSize: '16px', color: '#3E4B44' }}>Отметьте, что для вас важно</span>
                  </div>
                  <button type="button" className="acc" onClick={v.closeF} style={{ minHeight: '40px' }}>
                    Свернуть
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {(v.fTop || []).map((f: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <label className={`tile ${f.cls ?? ''}`}>
                        <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none', opacity: '.85' }}
                        >
                          <path d={f.d} />
                        </svg>
                        <span>{f.t}</span>
                      </label>
                    </Fragment>
                  ))}
                </div>
                {v.moreOpen ? (
                  <>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        paddingTop: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <button
                        type="button"
                        className="acc"
                        onClick={v.toggleMore}
                        style={{ fontSize: '19px', fontFamily: 'Lora,Georgia,serif', color: '#1C2620', gap: '12px' }}
                      >
                        <span>Дополнительные фильтры</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                        <span style={{ fontSize: '16px', color: '#1F5F4A', fontFamily: 'Manrope,sans-serif' }}>
                          Свернуть
                        </span>
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 28px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            paddingRight: '20px',
                            borderRight: '1px solid #E3DED2',
                          }}
                        >
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Цена за человека в сутки
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }}>
                                <span className="lbl">От, €</span>
                                <input
                                  className="input"
                                  type="number"
                                  placeholder="Любая"
                                  value={v.pMin}
                                  onChange={v.setMin}
                                  style={{ minHeight: '48px' }}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }}>
                                <span className="lbl">До, €</span>
                                <input
                                  className="input"
                                  type="number"
                                  placeholder="Любая"
                                  value={v.pMax}
                                  onChange={v.setMax}
                                  style={{ minHeight: '48px' }}
                                />
                              </label>
                            </div>
                          </div>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Категория
                            </div>{' '}
                            {(v.fStars || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '0 20px',
                            borderRight: '1px solid #E3DED2',
                          }}
                        >
                          <div
                            className="ftitle"
                            style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                          >
                            Профиль лечения
                          </div>
                          {(v.fProfile || []).map((f: any, _i0: number) => (
                            <Fragment key={_i0}>
                              <label className="fchk">
                                <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#1F5F4A"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                  style={{ flex: 'none', opacity: '.85' }}
                                >
                                  <path d={f.d} />
                                </svg>
                                {f.t}
                                <span className="n">{f.n}</span>
                              </label>
                            </Fragment>
                          ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '20px' }}>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Комфорт
                            </div>{' '}
                            {(v.fComfort || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    style={{ flex: 'none', opacity: '.85' }}
                                  >
                                    <path d={f.d} />
                                  </svg>
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                          <div>
                            <div
                              className="ftitle"
                              style={{ fontFamily: 'Manrope,sans-serif', fontSize: '17px', fontWeight: '800' }}
                            >
                              Кровати
                            </div>{' '}
                            {(v.fBeds || []).map((f: any, _i0: number) => (
                              <Fragment key={_i0}>
                                <label className="fchk">
                                  <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    style={{ flex: 'none', opacity: '.85' }}
                                  >
                                    <path d={f.d} />
                                  </svg>
                                  {f.t}
                                  <span className="n">{f.n}</span>
                                </label>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    borderTop: '1px solid #E3DED2',
                    paddingTop: '16px',
                  }}
                >
                  {v.moreClosed ? (
                    <>
                      <button type="button" className="morebtn" onClick={v.toggleMore}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
                          <circle cx="16" cy="7" r="2" />
                          <circle cx="10" cy="12" r="2" />
                          <circle cx="18" cy="17" r="2" />
                        </svg>
                        Ещё фильтры: цена, лечение, комфорт
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                  {v.moreOpen ? (
                    <>
                      <button type="button" className="linkbtn" onClick={v.clearPending} style={{ fontSize: '17px' }}>
                        Сбросить выбор
                      </button>
                      <span style={{ fontSize: '16px', color: '#3E4B44' }}>{v.pendCount}</span>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.apply}
                    style={{ minHeight: '54px', fontSize: '18px', padding: '0 28px' }}
                  >
                    {v.applyLabel}
                  </button>
                </div>
              </section>
            </>
          ) : null}
          {/* Applied filters */}
          {v.hasActive ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 18px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#3E4B44' }}>Выбрано:</span>
                {(v.active || []).map((a: any, _i0: number) => (
                  <Fragment key={_i0}>
                    <button
                      type="button"
                      onClick={a.off}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        minHeight: '44px',
                        padding: '0 16px',
                        border: '1px solid #C8DED3',
                        background: '#fff',
                        color: '#1C2620',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {a.t}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </Fragment>
                ))}
                <button
                  type="button"
                  className="linkbtn"
                  onClick={v.reset}
                  style={{ fontSize: '16px', marginLeft: '6px' }}
                >
                  Сбросить всё
                </button>
              </div>
            </>
          ) : null}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ fontSize: '28px' }}>{v.foundLabel}</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#3E4B44' }}>
              Сортировка:
              <select
                className="input"
                value={v.sort}
                onChange={v.setSort}
                style={{
                  minHeight: '48px',
                  width: 'auto',
                  paddingRight: '40px',
                  fontWeight: '700',
                  color: '#1C2620',
                  background:
                    "#fff url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231F5F4A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\") no-repeat right 12px center",
                }}
              >
                <option value="pop">Сначала популярные</option>
                <option value="cheap">Сначала дешевле</option>
                <option value="exp">Сначала дороже</option>
              </select>
            </label>
          </div>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {v.none ? (
              <>
                <div
                  className="card"
                  style={{
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontWeight: '800', fontSize: '22px' }}>По этим условиям ничего не нашлось</div>
                  <p style={{ margin: '0', fontSize: '16px', color: '#3E4B44' }}>
                    Снимите одно из условий — или позвоните, подберём вручную.
                  </p>
                  <button type="button" className="btn btn-secondary" onClick={v.reset}>
                    Сбросить фильтры
                  </button>
                </div>
              </>
            ) : null}
            {(v.hotels || []).map((h: any, _i0: number) => (
              <Fragment key={_i0}>
                <article
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: `1px solid ${h.border ?? ''}`,
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                    <Link
                      to="/hotel"
                      style={{
                        flex: '0 0 310px',
                        minHeight: '230px',
                        position: 'relative',
                        display: 'block',
                        margin: '14px 0 14px 14px',
                        background: '#2B3A33',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      {' '}
                      <img
                        src={h.img}
                        alt={h.name}
                        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }}
                      />{' '}
                    </Link>
                    <div
                      style={{
                        flex: '1 1 360px',
                        minWidth: '0',
                        padding: '16px 18px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '26px' }}>
                          <Link to="/hotel" style={{ textDecoration: 'none', color: '#1C2620' }}>
                            {h.name}
                          </Link>
                        </h2>
                        <span
                          style={{ color: '#B8860B', fontSize: '18px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
                        >
                          {h.stars}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>{h.sub}</div>
                      <div
                        style={{
                          background: '#EEF5F1',
                          borderRadius: '2px',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '4px',
                        }}
                      >
                        <svg
                          width="38"
                          height="38"
                          viewBox="-1 -1 26 26"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                        </svg>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#1C2620', lineHeight: '1.15' }}>
                          {h.procT}
                        </span>
                      </div>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '2px 4px' }}
                      >
                        {(h.chips || []).map((c: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <span className="fact" style={{ fontSize: '15px', color: '#1C2620' }}>
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1F5F4A"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                style={{ flex: 'none' }}
                              >
                                <path d={c.d} />
                              </svg>
                              {c.t}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      {h.hasAwards ? (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: 'auto',
                              paddingTop: '4px',
                            }}
                          >
                            {(h.awards || []).map((w: any, _i1: number) => (
                              <Fragment key={_i1}>
                                <span className="badge">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d={w.d} />
                                  </svg>
                                  {w.t}
                                </span>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div
                      style={{
                        flex: '0 0 220px',
                        padding: '16px 18px',
                        borderLeft: '1px solid #E3DED2',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        justifyContent: 'center',
                        margin: '14px 0',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '32px',
                          fontWeight: '800',
                          color: '#1C2620',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.1',
                        }}
                      >
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>от</span> {h.price}&nbsp;€
                      </span>
                      <span style={{ fontSize: '14px', color: '#3E4B44' }}>за 2 взрослых · {v.nightsLabel}</span>
                      <span style={{ fontSize: '13px', color: '#6B776F' }}>≈ {h.ppn}&nbsp;€ / чел. в сутки</span>
                      <button
                        type="button"
                        className={`btn ${h.btnCls ?? ''}`}
                        onClick={h.toggle}
                        aria-expanded={h.open}
                        style={{
                          minHeight: '48px',
                          fontSize: '16px',
                          padding: '0 16px',
                          marginTop: '10px',
                          justifyContent: 'space-between',
                        }}
                      >
                        {h.btnLabel}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ transform: h.chev }}
                        >
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={h.openCal}
                        style={{ minHeight: '46px', fontSize: '15px', padding: '0 14px', marginTop: '8px' }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                        </svg>
                        Когда дешевле?
                      </button>
                    </div>
                  </div>
                  {h.open ? (
                    <>
                      <div
                        style={{
                          padding: '4px 14px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          background: '#FAFBF9',
                          borderTop: '1px solid #E3DED2',
                        }}
                      >
                        {(h.offers || []).map((o: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <article
                              className="card"
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                border: o.cardBorder,
                                background: o.cardBg,
                              }}
                            >
                              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                <div
                                  style={{
                                    position: 'relative',
                                    flex: '0 0 300px',
                                    minHeight: '210px',
                                    margin: '14px 0 14px 14px',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    background: '#2B3A33',
                                  }}
                                >
                                  <img
                                    src={o.img}
                                    alt={o.room}
                                    style={{
                                      position: 'absolute',
                                      inset: '0',
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      filter: o.imgFilter,
                                    }}
                                  />{' '}
                                  {o.busy ? (
                                    <>
                                      <span
                                        style={{
                                          position: 'absolute',
                                          left: '10px',
                                          top: '10px',
                                          background: '#5E6862',
                                          color: '#fff',
                                          fontSize: '13px',
                                          fontWeight: '800',
                                          padding: '5px 10px',
                                          borderRadius: '2px',
                                        }}
                                      >
                                        Занят на ваши даты
                                      </span>
                                    </>
                                  ) : null}{' '}
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: '10px',
                                      bottom: '10px',
                                      background: 'rgba(28,38,32,.8)',
                                      color: '#fff',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      padding: '5px 9px',
                                      borderRadius: '2px',
                                    }}
                                  >
                                    Фото номера
                                  </span>
                                </div>
                                <div
                                  style={{
                                    flex: '1 1 300px',
                                    minWidth: '0',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                  }}
                                >
                                  <span
                                    className="pill"
                                    style={{ alignSelf: 'flex-start', background: o.pillBg, color: o.pillColor }}
                                  >
                                    {o.pill}
                                  </span>
                                  <h3 style={{ fontSize: '24px', color: o.nameColor }}>{o.short}</h3>
                                  <div style={{ fontSize: '15px', color: '#3E4B44' }}>{o.roomLine}</div>
                                  <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>
                                    {o.progLine}
                                  </div>
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                                      gap: '10px 18px',
                                      marginTop: '8px',
                                    }}
                                  >
                                    <div className="ico2">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        style={{ flex: 'none' }}
                                      >
                                        <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4" />
                                      </svg>
                                      Консультация
                                      <br />
                                      врача
                                    </div>
                                    <div className="ico2">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        style={{ flex: 'none' }}
                                      >
                                        <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8" />
                                      </svg>
                                      Питание
                                      <br />3 раза в день
                                    </div>
                                    <div className="ico2">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        style={{ flex: 'none' }}
                                      >
                                        <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6" />
                                      </svg>
                                      Бассейн и сауны
                                    </div>
                                    <div className="ico2">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        style={{ flex: 'none' }}
                                      >
                                        <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                                      </svg>
                                      Процедуры
                                      <br />
                                      ежедневно
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    flex: '0 0 240px',
                                    padding: '18px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    borderLeft: '1px solid #E3DED2',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {o.avail ? (
                                    <>
                                      <span
                                        style={{
                                          fontSize: '32px',
                                          fontWeight: '800',
                                          lineHeight: '1.1',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        <span style={{ fontSize: '18px', fontWeight: '600' }}>от</span> {o.price}&nbsp;€
                                      </span>
                                      <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                                        за 2 взрослых · {v.nightsLabel}
                                      </span>
                                      <span style={{ fontSize: '13px', color: '#6B776F' }}>
                                        ≈ {o.ppn}&nbsp;€ / человек / сутки · сейчас {o.adv}&nbsp;€
                                      </span>
                                      <Link
                                        className="btn btn-primary"
                                        to="/rooms"
                                        style={{ minHeight: '48px', fontSize: '16px', marginTop: '12px' }}
                                      >
                                        Выбрать номер
                                      </Link>
                                    </>
                                  ) : null}
                                  {o.busy ? (
                                    <>
                                      <span
                                        style={{
                                          fontSize: '18px',
                                          fontWeight: '800',
                                          color: '#3E4B44',
                                          lineHeight: '1.25',
                                        }}
                                      >
                                        Занят на {o.busyRange}
                                      </span>
                                      <span style={{ fontSize: '15px', color: '#3E4B44', marginTop: '4px' }}>
                                        Свободен: <strong style={{ color: '#1C2620' }}>{o.nextFree}</strong>
                                      </span>
                                      <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={o.openRoomCal}
                                        style={{
                                          minHeight: '48px',
                                          fontSize: '16px',
                                          marginTop: '12px',
                                          padding: '0 14px',
                                        }}
                                      >
                                        <svg
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                        >
                                          <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                                        </svg>
                                        Выбрать другие даты
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={o.toggleDet}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  width: '100%',
                                  border: 'none',
                                  borderTop: '1px solid #E3DED2',
                                  background: '#FAFBF9',
                                  padding: '12px 18px',
                                  minHeight: '48px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '15px',
                                  textAlign: 'left',
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    style={{ flex: 'none' }}
                                  >
                                    <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
                                  </svg>
                                  {o.detBtn}
                                </span>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#1F5F4A"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                  style={{ transform: o.detChev }}
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>
                              {o.detOpen ? (
                                <>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '18px',
                                      padding: '18px 18px 18px',
                                      borderTop: '1px solid #E3DED2',
                                      background: '#FAFBF9',
                                    }}
                                  >
                                    {/* 0. Programmes available for this room (cheapest first) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: '700',
                                          color: '#6B776F',
                                          textTransform: 'uppercase',
                                          letterSpacing: '.04em',
                                        }}
                                      >
                                        Программы для этого номера
                                      </div>
                                      {(o.progRows || []).map((pr: any, _i2: number) => (
                                        <Fragment key={_i2}>
                                          <button
                                            type="button"
                                            onClick={pr.pick}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '14px',
                                              width: '100%',
                                              minHeight: '64px',
                                              padding: '10px 16px',
                                              border: `2px solid ${pr.border ?? ''}`,
                                              background: pr.bg,
                                              borderRadius: '2px',
                                              cursor: 'pointer',
                                              textAlign: 'left',
                                            }}
                                          >
                                            <span
                                              style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: `2px solid ${pr.border ?? ''}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flex: 'none',
                                                background: '#fff',
                                              }}
                                            >
                                              <span
                                                style={{
                                                  width: '12px',
                                                  height: '12px',
                                                  borderRadius: '50%',
                                                  background: pr.dot,
                                                }}
                                              />
                                            </span>
                                            <svg
                                              width="28"
                                              height="28"
                                              viewBox="-1 -1 26 26"
                                              fill="none"
                                              stroke="#1F5F4A"
                                              strokeWidth="1.8"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              aria-hidden="true"
                                              style={{ flex: 'none' }}
                                            >
                                              <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                                            </svg>
                                            <span
                                              style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flex: '1',
                                                minWidth: '0',
                                                lineHeight: '1.25',
                                              }}
                                            >
                                              <strong style={{ fontSize: '17px' }}>{pr.name}</strong>
                                              <span style={{ fontSize: '14px', color: '#3E4B44' }}>{pr.sub}</span>
                                            </span>
                                            <span
                                              style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                lineHeight: '1.2',
                                              }}
                                            >
                                              <strong style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>
                                                {pr.price}
                                              </strong>
                                              <span
                                                style={{ fontSize: '13px', color: pr.diffColor, whiteSpace: 'nowrap' }}
                                              >
                                                {pr.diff}
                                              </span>
                                            </span>
                                          </button>
                                        </Fragment>
                                      ))}
                                    </div>
                                    {/* 1. Value at a glance: big numbers + icons */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      <div
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: '700',
                                          color: '#6B776F',
                                          textTransform: 'uppercase',
                                          letterSpacing: '.04em',
                                        }}
                                      >
                                        {o.selName}: что вы получаете за {v.nightsLabel}
                                      </div>
                                      <div
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))',
                                          gap: '10px',
                                        }}
                                      >
                                        {(o.value || []).map((v: any, _i2: number) => (
                                          <Fragment key={_i2}>
                                            <div
                                              style={{
                                                background: '#EEF5F1',
                                                border: '1px solid #C8DED3',
                                                borderRadius: '2px',
                                                padding: '14px 16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                minHeight: '118px',
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <svg
                                                  width="34"
                                                  height="34"
                                                  viewBox="-1 -1 26 26"
                                                  fill="none"
                                                  stroke="#1F5F4A"
                                                  strokeWidth="1.8"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                  style={{ flex: 'none' }}
                                                >
                                                  <path d={v.d} />
                                                </svg>
                                                <span
                                                  style={{
                                                    fontFamily: 'Lora,Georgia,serif',
                                                    fontSize: '36px',
                                                    fontWeight: '700',
                                                    lineHeight: '1',
                                                    color: '#1F5F4A',
                                                  }}
                                                >
                                                  {v.big}
                                                </span>
                                              </div>
                                              <strong style={{ fontSize: '16px', lineHeight: '1.2', color: '#1C2620' }}>
                                                {v.label}
                                              </strong>
                                              <span style={{ fontSize: '13px', lineHeight: '1.3', color: '#3E4B44' }}>
                                                {v.sub}
                                              </span>
                                            </div>
                                          </Fragment>
                                        ))}
                                      </div>
                                    </div>
                                    {/* 2. Programme items + room amenities */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 28px' }}>
                                      <div
                                        style={{
                                          flex: '1 1 260px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#6B776F',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.04em',
                                          }}
                                        >
                                          В программу входит
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {(o.prog || []).map((p: any, _i2: number) => (
                                            <Fragment key={_i2}>
                                              <div className="fact" style={{ color: '#1C2620', fontSize: '16px' }}>
                                                <svg
                                                  width="24"
                                                  height="24"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="#1F5F4A"
                                                  strokeWidth="1.8"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                >
                                                  <path d={p.d} />
                                                </svg>
                                                {p.t}
                                              </div>
                                            </Fragment>
                                          ))}
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          flex: '1 1 260px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#6B776F',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.04em',
                                          }}
                                        >
                                          Номер
                                        </div>
                                        <div
                                          style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))',
                                            gap: '8px 12px',
                                          }}
                                        >
                                          {(o.amen || []).map((a: any, _i2: number) => (
                                            <Fragment key={_i2}>
                                              <div className="fact" style={{ color: '#1C2620' }}>
                                                <svg
                                                  width="22"
                                                  height="22"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="#3E4B44"
                                                  strokeWidth="1.8"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                >
                                                  <path d={a.d} />
                                                </svg>
                                                {a.t}
                                              </div>
                                            </Fragment>
                                          ))}
                                        </div>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#3E4B44' }}>{o.roomText}</p>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '3px',
                                        background: '#FAF8F3',
                                        borderRadius: '2px',
                                        padding: '12px 16px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: '700',
                                          color: '#6B776F',
                                          textTransform: 'uppercase',
                                          letterSpacing: '.04em',
                                          marginBottom: '4px',
                                        }}
                                      >
                                        Подробно о программе
                                      </div>
                                      {(o.detLines || []).map((l: any, _i2: number) => (
                                        <Fragment key={_i2}>
                                          <div
                                            style={{
                                              fontSize: '15px',
                                              lineHeight: '1.45',
                                              color: '#1C2620',
                                              fontWeight: l.fw,
                                              paddingLeft: l.pl,
                                              marginTop: l.mt,
                                            }}
                                          >
                                            {l.t}
                                          </div>
                                        </Fragment>
                                      ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <Link
                                        className="btn btn-primary"
                                        to="/rooms"
                                        style={{ minHeight: '52px', fontSize: '17px' }}
                                      >
                                        Выбрать: {o.selName} · {o.selPrice}
                                      </Link>
                                    </div>
                                  </div>
                                </>
                              ) : null}
                            </article>
                          </Fragment>
                        ))}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            color: '#3E4B44',
                            padding: '2px 2px',
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </svg>
                          Процедуры подбирает врач после консультации. Специализации, время заезда и трансфер —
                          <Link to="/hotel">на странице санатория</Link>.
                        </div>
                      </div>
                    </>
                  ) : null}
                </article>
              </Fragment>
            ))}
          </div>
          {/* Sanatoriums with no availability on the chosen dates: viewable, not bookable */}
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '10px',
              paddingTop: '22px',
              borderTop: '2px dashed #CFC9BB',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 style={{ fontSize: '28px', color: '#3E4B44' }}>Нет свободных мест на ваши даты · {v.soldCount}</h2>
                <span style={{ fontSize: '16px', color: '#6B776F' }}>
                  На {v.dateRange} эти санатории заняты. Описание можно посмотреть, а забронировать — на другие даты.
                </span>
              </div>
            </div>
            {(v.soldHotels || []).map((u: any, _i0: number) => (
              <Fragment key={_i0}>
                <article
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    background: '#F7F5F0',
                    border: '1px solid #E3DED2',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    to="/hotel"
                    style={{
                      flex: '0 0 240px',
                      minHeight: '150px',
                      position: 'relative',
                      display: 'block',
                      margin: '12px 0 12px 12px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      background: '#C9C4BA',
                    }}
                  >
                    {' '}
                    <img
                      src={u.img}
                      alt={u.name}
                      style={{
                        position: 'absolute',
                        inset: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(1)',
                        opacity: '.7',
                      }}
                    />{' '}
                    <span
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '8px',
                        background: '#5E6862',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '800',
                        padding: '5px 10px',
                        borderRadius: '2px',
                      }}
                    >
                      Нет мест
                    </span>{' '}
                  </Link>
                  <div
                    style={{
                      flex: '1 1 360px',
                      minWidth: '0',
                      padding: '14px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '23px', color: '#3E4B44' }}>
                        <Link to="/hotel" style={{ color: '#3E4B44', textDecoration: 'none' }}>
                          {u.name}
                        </Link>
                      </h3>
                      <span style={{ color: '#A39F96', fontSize: '16px', letterSpacing: '1px' }}>{u.stars}</span>
                    </div>
                    <span style={{ fontSize: '15px', color: '#6B776F' }}>{u.sub}</span>
                    <div style={{ display: 'flex', gap: '6px 16px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {(u.chips || []).map((c: any, _i1: number) => (
                        <Fragment key={_i1}>
                          <span className="fact" style={{ color: '#6B776F' }}>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#8A968F"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d={c.d} />
                            </svg>
                            {c.t}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                    <span style={{ fontSize: '15px', color: '#1C2620', marginTop: '4px' }}>
                      Ближайшие свободные даты: <strong>{u.next}</strong>
                    </span>
                  </div>
                  <div
                    style={{
                      flex: '0 0 240px',
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      justifyContent: 'center',
                      borderLeft: '1px solid #E3DED2',
                      margin: '12px 0',
                    }}
                  >
                    <Link
                      className="btn btn-secondary"
                      to="/hotel"
                      style={{
                        minHeight: '46px',
                        fontSize: '15px',
                        padding: '0 14px',
                        borderColor: '#8A968F',
                        color: '#3E4B44',
                      }}
                    >
                      Посмотреть санаторий
                    </Link>
                    <button
                      type="button"
                      className="linkbtn"
                      onClick={u.notify}
                      style={{ fontSize: '15px', justifyContent: 'center' }}
                    >
                      Сообщить, если появятся места
                    </button>
                  </div>
                </article>
              </Fragment>
            ))}
          </section>
          {/* Help band */}
          <section
            style={{
              background: '#EEF5F1',
              border: '1px solid #C8DED3',
              borderRadius: '2px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '21px' }}>Поможем выбрать</strong>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                  Подскажем, какой санаторий подойдёт именно вам
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: '1 1 260px',
                paddingLeft: '24px',
                borderLeft: '1px solid #C8DED3',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href="tel:+37060000000" style={{ fontWeight: '800', fontSize: '19px', textDecoration: 'none' }}>
                  +370&nbsp;600 00000
                </a>
                <span style={{ fontSize: '13px', color: '#3E4B44' }}>
                  Ежедневно с 9:00 до 20:00 по литовскому времени
                </span>
              </div>
            </div>
            <Link className="btn btn-secondary" to="/done" style={{ minHeight: '50px', fontSize: '16px' }}>
              Задать вопрос
            </Link>
          </section>
        </div>
        <SiteFooter />
      </div>{' '}
      {/* Price calendar pop-up: "Когда дешевле?" */}{' '}
      {v.calOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '70',
              background: 'rgba(20,28,24,.6)',
              overflow: 'auto',
              padding: '24px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="calTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                maxWidth: '1120px',
                width: '100%',
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 24px 70px rgba(0,0,0,.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 id="calTitle" style={{ fontSize: '38px' }}>
                    Выберите дату заезда
                  </h2>
                  <div style={{ fontSize: '24px', color: '#1C2620' }}>{v.cal?.hotelName}</div>
                </div>
                <button
                  type="button"
                  onClick={v.calClose}
                  aria-label="Закрыть"
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '30px',
                    lineHeight: '1',
                    color: '#1C2620',
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  background: '#F4F1EA',
                  borderRadius: '2px',
                  padding: '10px 16px',
                  fontSize: '17px',
                }}
              >
                2 взрослых · {v.nightsLabel} · {v.cal?.room} · {v.cal?.prog}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 16px',
                  fontSize: '19px',
                  color: '#1F5F4A',
                  fontWeight: '700',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                </svg>
                Ваши даты: {v.curRange} · ≈ {v.cal?.curPpn}&nbsp;€ / чел. в сутки
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
                {/* Calendar */}
                <div
                  style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '800' }}>Средняя цена за 1 человека в сутки</div>
                  <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-6px' }}>
                    При заезде в выбранный день на {v.nightsLabel}.
                  </div>
                  <div
                    style={{
                      border: '1px solid #E3DED2',
                      borderRadius: '2px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <button
                        type="button"
                        onClick={v.calPrev}
                        aria-label="Предыдущий месяц"
                        style={{
                          width: '46px',
                          height: '46px',
                          border: '2px solid #CFC9BB',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontSize: '22px',
                        }}
                      >
                        ‹
                      </button>
                      <div style={{ fontSize: '24px', fontWeight: '800' }}>{v.cal?.monthTitle}</div>
                      <button
                        type="button"
                        onClick={v.calNext}
                        aria-label="Следующий месяц"
                        style={{
                          width: '46px',
                          height: '46px',
                          border: '2px solid #CFC9BB',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontSize: '22px',
                        }}
                      >
                        ›
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#6B776F',
                        textAlign: 'center',
                      }}
                    >
                      <span>ПН</span>
                      <span>ВТ</span>
                      <span>СР</span>
                      <span>ЧТ</span>
                      <span>ПТ</span>
                      <span>СБ</span>
                      <span>ВС</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: '4px' }}>
                      {(v.cal?.cells || []).map((c: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <button
                            type="button"
                            onClick={c.pick}
                            disabled={!!c.off}
                            aria-label={c.aria}
                            style={{
                              position: 'relative',
                              minHeight: '76px',
                              padding: '6px 8px',
                              border: `2px solid ${c.border ?? ''}`,
                              background: c.bg,
                              borderRadius: '2px',
                              cursor: c.cursor,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: '2px',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ fontSize: '15px', color: '#3E4B44' }}>{c.day}</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: c.color }}>{c.text}</span>
                            <span style={{ fontSize: '12px', color: '#1F5F4A', fontWeight: '700' }}>{c.sub}</span>
                            {c.fly ? (
                              <>
                                <span
                                  style={{ position: 'absolute', top: '6px', right: '6px', lineHeight: '0' }}
                                  title="Рейс из Израиля"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                                  </svg>
                                </span>
                              </>
                            ) : null}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '18px',
                        flexWrap: 'wrap',
                        fontSize: '14px',
                        color: '#3E4B44',
                        paddingTop: '6px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#E9F4EC', border: '1px solid #C8DED3' }}
                        />
                        Дешевле
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#FFF6E3', border: '1px solid #F0DDB8' }}
                        />
                        Средняя цена
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#FCEDE9', border: '1px solid #F0CFC6' }}
                        />
                        Дороже
                      </span>
                      <details style={{ display: 'inline-block', fontSize: '14px', color: '#3E4B44' }}>
                        <summary
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            listStyle: 'none',
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                          </svg>
                          <span>
                            <strong style={{ color: '#1C2620' }}>Рейсы из Израиля</strong> — вт, чт, вс
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '1.5px solid #1F5F4A',
                              color: '#1F5F4A',
                              fontSize: '12px',
                              fontWeight: '800',
                            }}
                          >
                            i
                          </span>
                        </summary>
                        <div
                          style={{
                            marginTop: '8px',
                            maxWidth: '420px',
                            background: '#F4F1EA',
                            borderRadius: '2px',
                            padding: '10px 12px',
                            fontSize: '14px',
                            lineHeight: '1.45',
                            color: '#1C2620',
                          }}
                        >
                          Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с
                          осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит
                          прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                        </div>
                      </details>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{ width: '22px', height: '16px', background: '#E8E6E1', border: '1px solid #D2CFC7' }}
                        />
                        Нет мест
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B776F' }}>
                      Цены в календаре округлены. Итоговая стоимость указана справа.
                    </div>
                  </div>
                </div>
                {/* New dates panel */}
                <aside
                  style={{
                    flex: '1 1 300px',
                    maxWidth: '340px',
                    background: '#EEF5F1',
                    border: '1px solid #C8DED3',
                    borderRadius: '2px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '30px', fontWeight: '600', color: '#1F5F4A' }}
                  >
                    Новые даты
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '2px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#3E4B44' }}>Заезд</span>
                        <strong style={{ fontSize: '21px' }}>{v.cal?.newIn}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#3E4B44' }}>Выезд</span>
                        <strong style={{ fontSize: '21px' }}>{v.cal?.newOut}</strong>
                      </div>
                    </div>
                    <div style={{ fontSize: '16px' }}>2 взрослых · {v.nightsLabel}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '44px', fontWeight: '800', lineHeight: '1' }}>
                        {v.cal?.newPpn}&nbsp;€
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '700' }}>/ чел. в сутки</span>
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        paddingTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>За весь отдых</span>
                      <strong style={{ fontSize: '36px', lineHeight: '1.1' }}>{v.cal?.newTotal}&nbsp;€</strong>
                    </div>
                    <div style={{ background: '#F4F1EA', borderRadius: '2px', padding: '10px 12px', fontSize: '16px' }}>
                      На ваши даты — <strong>{v.cal?.curTotal}&nbsp;€</strong>
                    </div>
                    <div
                      style={{
                        background: v.cal?.diffBg,
                        borderRadius: '2px',
                        padding: '10px 12px',
                        fontSize: '17px',
                        fontWeight: '800',
                        color: v.cal?.diffColor,
                      }}
                    >
                      {v.cal?.diffText}
                    </div>
                    <div style={{ fontSize: '14px', color: '#3E4B44' }}>Тот же номер и программа.</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontSize: '14px',
                      color: '#3E4B44',
                      background: '#fff',
                      borderRadius: '2px',
                      padding: '10px 12px',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1F5F4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flex: 'none' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span>В календаре — средняя цена за сутки. Здесь — точная сумма за весь отдых.</span>
                  </div>
                </aside>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <button type="button" className="acc" onClick={v.calClose} style={{ fontSize: '17px' }}>
                  Оставить {v.curRange}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.calApply}
                    style={{ minHeight: '64px', fontSize: '22px', padding: '0 40px' }}
                  >
                    Применить {v.cal?.newRange}
                  </button>
                  <span style={{ fontSize: '13px', color: '#6B776F' }}>Даты изменятся после подтверждения.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      {/* Custom date-range calendar (two months, price colours) */}{' '}
      {v.sCalOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(18,34,27,.55)',
              zIndex: '50',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 16px',
              overflow: 'auto',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sCalTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                width: 'min(820px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                padding: '26px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="sCalTitle" style={{ fontSize: '32px' }}>
                    Выберите даты поездки
                  </h2>
                  <span style={{ fontSize: '17px', color: '#3E4B44' }}>{v.sCalHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.sCloseCal}
                  style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  Закрыть
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>Быстрый выбор:</span>
                <button type="button" className="preset" onClick={v.sP7}>
                  7 ночей
                </button>
                <button type="button" className="preset" onClick={v.sP10}>
                  10 ночей
                </button>
                <button type="button" className="preset" onClick={v.sP14}>
                  14 ночей
                </button>
                <button type="button" className="preset" onClick={v.sP21}>
                  21 ночь
                </button>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span className="lg">
                    <i style={{ background: '#E9F4EC', border: '1px solid #C8DED3' }} />
                    дешевле
                  </span>
                  <span className="lg">
                    <i style={{ background: '#FFF6E3', border: '1px solid #F0DDB8' }} />
                    обычная цена
                  </span>
                  <span className="lg">
                    <i style={{ background: '#FCEDE9', border: '1px solid #F0CFC6' }} />
                    дороже
                  </span>
                  <span className="lg">
                    <i style={{ background: '#E8E6E1' }} />
                    прошедшие дни
                  </span>
                  <span className="lg">
                    <i
                      style={{
                        background: 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)',
                        border: '1px solid #CFC9BB',
                      }}
                    />
                    нет свободных мест
                  </span>
                  <details style={{ display: 'inline-block', fontSize: '14px', color: '#3E4B44' }}>
                    <summary
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        listStyle: 'none',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                      </svg>
                      <span>
                        <strong style={{ color: '#1C2620' }}>Рейсы из Израиля</strong> — вт, чт, вс
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '1.5px solid #1F5F4A',
                          color: '#1F5F4A',
                          fontSize: '12px',
                          fontWeight: '800',
                        }}
                      >
                        i
                      </span>
                    </summary>
                    <div
                      style={{
                        marginTop: '8px',
                        maxWidth: '420px',
                        background: '#F4F1EA',
                        borderRadius: '2px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        lineHeight: '1.45',
                        color: '#1C2620',
                      }}
                    >
                      Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с
                      осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит
                      прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                    </div>
                  </details>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <button type="button" className="navbtn" onClick={v.sCalPrev} aria-label="Предыдущие месяцы">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {(v.sMonths || []).map((m: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            fontFamily: 'Lora,Georgia,serif',
                            fontSize: '22px',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          {m.title}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                          <div className="wd">Пн</div>
                          <div className="wd">Вт</div>
                          <div className="wd">Ср</div>
                          <div className="wd">Чт</div>
                          <div className="wd">Пт</div>
                          <div className="wd">Сб</div>
                          <div className="wd">Вс</div>
                          {(m.cells || []).map((c: any, _i1: number) => (
                            <Fragment key={_i1}>
                              <button
                                type="button"
                                className="cell"
                                onClick={c.pick}
                                disabled={!!c.off}
                                aria-label={c.aria}
                                style={{ background: c.bg, borderColor: c.border, color: c.color, cursor: c.cursor }}
                              >
                                <span>{c.day}</span>
                                <small style={{ color: c.subColor }}>{c.sub}</small>
                                {c.fly ? (
                                  <>
                                    <span
                                      style={{ position: 'absolute', top: '4px', right: '5px', lineHeight: '0' }}
                                      title="Рейс из Израиля"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                                      </svg>
                                    </span>
                                  </>
                                ) : null}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <button type="button" className="navbtn" onClick={v.sCalNext} aria-label="Следующие месяцы">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Заезд</span>
                    <strong style={{ fontSize: '20px' }}>{v.sSelIn}</strong>
                  </div>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Выезд</span>
                    <strong style={{ fontSize: '20px' }}>{v.sSelOut}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="lbl">Итого</span>
                    <strong style={{ fontSize: '20px', color: '#1F5F4A' }}>{v.sSelNights}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={v.sCloseCal}>
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.sApplyCal}
                    disabled={!!v.sApplyOff}
                    style={{ minHeight: '56px', fontSize: '18px', padding: '0 32px' }}
                  >
                    Подтвердить даты
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
