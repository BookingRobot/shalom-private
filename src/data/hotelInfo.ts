/**
 * Everything the sanatorium page shows besides rooms: header, photos and the
 * "Лечение / Питание / О санатории / Отзывы" tabs — for every sanatorium we sell.
 * Texts come from the sanatoriums' own sites (see sources in hotelTexts).
 */
import { EGLE_ALL_PHOTOS } from './egleComfort';
import { EGLE_PIC } from './roomPhotos';
import { HOTEL_TEXTS, type HotelText } from './hotelTexts';
import { RATINGS, REVIEWS, type Rating, type Review } from './hotelReviews';

export interface Photo {
  src: string;
  alt: string;
}

export interface HotelInfo {
  id: string;
  /** "Санаторий Эгле Комфорт" */
  name: string;
  /** "Эгле Комфорт" */
  short: string;
  resort: string;
  /** results page link for the breadcrumb */
  resortLink: string;
  address: string;
  starsN: number;
  reviewsN: number;
  photos: Photo[];
  text: HotelText;
  reviews: Review[];
  rating: Rating;
}

/** Photos of the resort itself — added after the sanatorium's own photos. */
const DRUSKININKAI: Photo[] = [
  { src: '/img/d4cc2009f5e9b68736ab9f9a044668e5.jpg', alt: 'Друскининкай: озеро в сосновом лесу' },
  { src: '/img/ec03ab120412f998fd082eb7bc49afb6.jpg', alt: 'Друскининкай: тропа в лесу' },
  { src: '/img/8b637dda5588aaa2a835e012e1b36612.jpg', alt: 'Друскининкай: сосновый бор' },
  { src: '/img/80cbf81cb33b38c12f41d140c9e34ba7.jpg', alt: 'Друскининкай: центр курорта' },
];
const PALANGA: Photo[] = [{ src: '/img/c4c4cd4bcaad10e81718df6ded79f624.jpg', alt: 'Паланга: Балтийское море' }];
const BIRSTONAS: Photo[] = [{ src: '/img/ac9b1445a29a0df51e1bd45a8a203a39.jpg', alt: 'Бирштонас: берег Немана' }];

type Base = Omit<HotelInfo, 'text' | 'reviews' | 'rating'>;

const BASE: Base[] = [
  {
    id: 'egle-comfort',
    name: 'Санаторий Эгле Комфорт',
    short: 'Эгле Комфорт',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Eglės g. 1',
    starsN: 4,
    reviewsN: 26,
    photos: EGLE_ALL_PHOTOS,
  },
  {
    id: 'egle-standart',
    name: 'Санаторий Эгле Стандарт',
    short: 'Эгле Стандарт',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Eglės g. 1',
    starsN: 3,
    reviewsN: 13,
    photos: [
      EGLE_PIC.aerial,
      EGLE_PIC.poolCure,
      { src: '/img/99a77311bc746e38e051bd1146cc0517.jpg', alt: 'Бассейн санатория Эгле' },
      EGLE_PIC.bathCure,
      EGLE_PIC.doctor,
      EGLE_PIC.buffet,
      EGLE_PIC.park,
      EGLE_PIC.pump,
      EGLE_PIC.gallery,
      ...DRUSKININKAI,
    ],
  },
  {
    id: 'grand-spa-lietuva',
    name: 'Санаторий Гранд Спа Лиетува',
    short: 'Гранд Спа Лиетува',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'V. Kudirkos g. 45',
    starsN: 4,
    reviewsN: 20,
    // the sanatorium's own photos (grandspa.lt): the complex from above, the «Lietuva» building, the water park
    photos: [
      {
        src: '/img/4257cc3ec678cab57b304e0ddfa95002.jpg',
        alt: 'Гранд Спа Лиетува с высоты: парк, ротонда и купол аквапарка',
      },
      { src: '/img/088d4dea4dcf2d1b8d361f6b691f859c.jpg', alt: 'Корпус «Лиетува» и парк с шахматами' },
      { src: '/img/30f261570df10d5af0ec1ad7c6af36f5.jpg', alt: 'Аквапарк под куполом' },
      { src: '/img/652e18efcb7ff2fb9e186a7d38be4edd.jpg', alt: 'Бассейн аквапарка' },
      ...DRUSKININKAI,
    ],
  },
  {
    id: 'grand-spa-druskininkai',
    name: 'Санаторий Гранд Спа Друскининкай',
    short: 'Гранд Спа Друскининкай',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'V. Kudirkos g. 45',
    starsN: 4,
    reviewsN: 13,
    photos: [{ src: '/img/e1a95754062c0aa141d79e8971428c9c.jpg', alt: 'Корпус санатория' }, ...DRUSKININKAI],
  },
  {
    id: 'belorus',
    name: 'Санаторий Беларусь',
    short: 'Беларусь',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Druskininkai',
    starsN: 3,
    reviewsN: 17,
    // the sanatorium's own photos (belorus.lt)
    photos: [
      { src: '/img/7d7576cf2b949466e6e7fdd81b5d43ad.jpg', alt: 'Бассейн с панорамными окнами в сосновый лес' },
      { src: '/img/ef252eab618b4a2fbe25e6d6fbbdc26c.jpg', alt: 'Бассейн и гидромассаж' },
      { src: '/img/c5b0fe0286e02bcf75eb209a7623f444.jpg', alt: 'Отдых в бассейне' },
      { src: '/img/fa34d6d4ecc45cf7fff93233ffbf430b.jpg', alt: 'Паровая баня из мозаики' },
      { src: '/img/de402f47934ad6b8e042936d4c704140.jpg', alt: 'Номер с большим окном' },
      ...DRUSKININKAI,
    ],
  },
  {
    id: 'draugyste',
    name: 'Санаторий Минерал Спа Драугисте',
    short: 'Минерал Спа Драугисте',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Druskininkai',
    starsN: 3,
    reviewsN: 4,
    // the sanatorium's own photos (draugyste.lt): the «Violeta» building in the evening, the pool hall
    photos: [
      { src: '/img/8c9ffb66b65bd2f85fa22df1c989c3b7.jpg', alt: 'Корпус «Виолета» вечером' },
      { src: '/img/5f3e80c631fc97a5f9b194173c9d9590.jpg', alt: 'Бассейн под стеклянным куполом' },
      { src: '/img/a3e6585f5dd9cb9a1b6daa1d5c50ff22.jpg', alt: 'Санаторий в лесу' },
      ...DRUSKININKAI,
    ],
  },
  {
    id: 'upa',
    name: 'Санаторий Упа Медикал Спа',
    short: 'Упа Медикал Спа',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Druskininkai',
    starsN: 3,
    reviewsN: 11,
    photos: [{ src: '/img/79c9318ba02a718e29de4346c9642a33.jpg', alt: 'Санаторий у парка' }, ...DRUSKININKAI],
  },
  {
    id: 'spa-vilnius',
    name: 'SPA Vilnius Друскининкай',
    short: 'SPA Vilnius',
    resort: 'Друскининкай',
    resortLink: '/results',
    address: 'Druskininkai',
    starsN: 4,
    reviewsN: 18,
    photos: [{ src: '/img/30b3b315653c1dbc711827ceb6c48ebe.jpg', alt: 'SPA Vilnius у Немана' }, ...DRUSKININKAI],
  },
  {
    id: 'gradiali',
    name: 'Санаторий Градиали',
    short: 'Градиали',
    resort: 'Паланга',
    resortLink: '/results',
    address: 'Palanga',
    starsN: 4,
    reviewsN: 17,
    photos: [{ src: '/img/983aebb39738d3905bb5383746fb9356.jpg', alt: 'Санаторий в Паланге' }, ...PALANGA],
  },
  {
    id: 'egle-birstonas',
    name: 'Санаторий Эгле Комфорт Бирштонас',
    short: 'Эгле Бирштонас',
    resort: 'Бирштонас',
    resortLink: '/results',
    address: 'Birštonas',
    starsN: 4,
    reviewsN: 35,
    photos: [
      { src: '/img/5f53f4a87e8d933d8e5bedf76624ab4a.jpg', alt: 'Санаторий «Эгле» в Бирштонасе среди высоких сосен' },
      { src: '/img/226796cc08c3c360c4ac718f6a4c433f.jpg', alt: 'Санаторий в Бирштонасе' },
      ...BIRSTONAS,
    ],
  },
];

export const HOTEL_IDS = BASE.map((b) => b.id);

/** Sanatorium by id; unknown ids show Eglė Comfort (the prototype's example order). */
export function hotelInfo(id?: string | null): HotelInfo {
  const b = BASE.find((x) => x.id === id) || BASE[0];
  const own = HOTEL_TEXTS[b.id];
  const text = own || HOTEL_TEXTS['egle-comfort'];
  return {
    ...b,
    address: (own && own.address) || b.address,
    text,
    reviews: REVIEWS[b.id] || [],
    rating: RATINGS[b.id] || { avg: 9, cats: [] },
  };
}

/** Id from a display name ("Эгле Комфорт", "Минерал SPA Драугисте"…) for links from cards. */
export function hotelIdByName(name: string): string {
  const n = name.toLowerCase().replace(/санаторий\s*/, '');
  const hit = BASE.find(
    (b) =>
      b.short.toLowerCase() === n ||
      b.name.toLowerCase().includes(n) ||
      n.includes(b.short.toLowerCase().split(' ')[0] + ' ' + (b.short.toLowerCase().split(' ')[1] || '')),
  );
  return hit ? hit.id : '';
}
