/** Resorts offered in the search form: [key, label]. */
export const RESORTS: [string, string][] = [
  ['druskininkai', 'Друскининкай'],
  ['birstonas', 'Бирштонас'],
  ['palanga', 'Паланга'],
  ['anyksciai', 'Аникщяй'],
];

/**
 * Sanatoriums people ask for by name, with the spellings they use (Cyrillic, Latin,
 * Lithuanian, short forms). id = SANATORIUMS id; sold = shown in "нет мест".
 * [ПРИМЕР ДАННЫХ — из BookingRobot API]
 */
export const SANATORIUM_NAMES: { id: string; name: string; resort: string; aliases: string[]; sold?: boolean }[] = [
  {
    id: 'belorus',
    name: 'Беларусь',
    resort: 'Друскининкай',
    aliases: ['белорусь', 'belarus', 'belorus', 'baltarusija'],
  },
  {
    id: 'egle-comfort',
    name: 'Эгле Комфорт',
    resort: 'Друскининкай',
    aliases: ['эгле', 'игле', 'egle', 'eglė', 'egles', 'comfort', 'комфорт'],
  },
  {
    id: 'egle-standart',
    name: 'Эгле Стандарт',
    resort: 'Друскининкай',
    aliases: ['эгле', 'egle', 'eglė', 'standart', 'стандарт'],
  },
  {
    id: 'grand-spa-lietuva',
    name: 'Гранд Спа Лиетува',
    resort: 'Друскининкай',
    aliases: ['литва', 'лиетува', 'летува', 'lietuva', 'grand spa lietuva', 'гранд спа литва'],
  },
  {
    id: 'grand-spa-druskininkai',
    name: 'Гранд Спа Друскининкай',
    resort: 'Друскининкай',
    aliases: ['grand spa druskininkai', 'гранд спа'],
  },
  {
    id: 'draugyste',
    name: 'Минерал Спа Драугисте',
    resort: 'Друскининкай',
    aliases: ['драугисте', 'дружба', 'draugyste', 'draugystė', 'mineral spa', 'минерал'],
  },
  { id: 'upa', name: 'Упа Медикал Спа', resort: 'Друскининкай', aliases: ['упа', 'upa', 'upa medical'], sold: true },
  {
    id: 'spa-vilnius',
    name: 'SPA Vilnius Друскининкай',
    resort: 'Друскининкай',
    aliases: ['спа вильнюс', 'spa vilnius', 'вильнюс'],
    sold: true,
  },
];

/** Most-asked names — chips under the search. */
export const POPULAR_NAMES = ['belorus', 'egle-comfort', 'grand-spa-lietuva', 'draugyste', 'spa-vilnius'];
