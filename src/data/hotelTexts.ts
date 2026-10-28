import { HOTEL_TEXTS_DATA } from './hotelTexts.data';
/** Texts of the sanatorium tabs. Filled from the sanatoriums' sites; see `sources`. */
export interface HotelText {
  id: string;
  nameRu: string;
  address: string;
  website: string;
  sources: string[];
  about: {
    lead: string;
    paragraphs: string[];
    location: string;
    facts: [string, string][];
    amenities: string[];
  };
  treatment: {
    lead: string;
    profiles: string[];
    procedures: { name: string; note: string }[];
    naturalFactors: string;
    howItWorks: string[];
    doctors: { name: string; specialty: string; source: string }[];
  };
  meals: {
    lead: string;
    format: string;
    mealsPerDay: string;
    diets: string[];
    restaurant: string;
    sampleDay: { breakfast: string[]; lunch: string[]; dinner: string[] };
    notes: string;
    typical?: boolean;
  };
}

const EGLE_FALLBACK: HotelText = {
  id: 'egle-comfort',
  nameRu: 'Санаторий Эгле Комфорт',
  address: 'Eglės g. 1',
  website: '',
  sources: [],
  about: {
    lead: 'Санаторий в сосновом парке Друскининкая: лечение, бассейны и номера — в одном комплексе.',
    paragraphs: [],
    location: 'Сосновый парк, до центра курорта — пешком по парку.',
    facts: [],
    amenities: [
      'Закрытый бассейн',
      'Турецкая и финская бани',
      'Бювет с минеральной водой',
      'Лифт во всех корпусах',
      'Бесплатная парковка',
      'Тренажёрный зал',
    ],
  },
  treatment: {
    lead: 'При заезде — консультация врача, затем процедуры по назначению: ванны, грязи, массаж, кинезитерапия и физиотерапия.',
    profiles: ['Опорно-двигательный аппарат', 'Позвоночник', 'Нервная система', 'Дыхательные пути', 'Сердце и сосуды'],
    procedures: [
      { name: 'Минеральные жемчужные и углекислые ванны', note: '' },
      { name: 'Грязевые аппликации', note: '' },
      { name: 'Лечебный массаж', note: '15 мин, каждый второй день' },
      { name: 'Подводный и аппаратный массаж', note: '20 мин' },
      { name: 'Кинезитерапия', note: 'в зале, в воде или в вертикальной ванне' },
      { name: 'Физиотерапия', note: 'электростимуляция, магнитотерапия' },
      { name: 'Ингаляции и соляная комната', note: '' },
    ],
    naturalFactors: 'Минеральная вода и лечебная грязь Друскининкая.',
    howItWorks: [
      'Консультация врача в день заезда',
      'Врач назначает процедуры по одной из каждой группы',
      'Расписание процедур — на весь заезд',
    ],
    doctors: [],
  },
  meals: {
    lead: 'Питание — шведский стол: завтрак, обед, ужин и два перекуса.',
    format: 'Шведский стол',
    mealsPerDay: '3 раза + 2 перекуса',
    diets: ['Диетическое меню по назначению врача'],
    restaurant: '',
    sampleDay: { breakfast: [], lunch: [], dinner: [] },
    notes: '',
  },
};

export const HOTEL_TEXTS: Record<string, HotelText> = { 'egle-comfort': EGLE_FALLBACK, ...HOTEL_TEXTS_DATA };
