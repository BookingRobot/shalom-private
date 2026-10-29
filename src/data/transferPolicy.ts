/**
 * Sanatoriums that meet guests themselves: their shuttle from some cities is part of the
 * stay (free for the guest); from other places we sell our transfer as usual. Today only
 * Eglė (Vilnius and Kaunas); later this comes from the admin settings of each sanatorium.
 * [ПРИМЕР ДАННЫХ — НАСТРОЙКА В АДМИНКЕ]
 */
export const TRANSFER_BY_SANATORIUM: Record<string, string> = {
  'egle-comfort': 'Эгле Комфорт',
  'egle-standart': 'Эгле Стандарт',
};

export const transferBySanatorium = (hotelId?: string | null) => !!hotelId && hotelId in TRANSFER_BY_SANATORIUM;

/** "санаторий «Эгле Комфорт»" */
export const sanatoriumTransferName = (hotelId?: string | null) =>
  'санаторий «' + (hotelId ? TRANSFER_BY_SANATORIUM[hotelId] || '' : '') + '»';

/** Pick-up cities the sanatorium serves free of charge with its own group transfer. */
export const FREE_TRANSFER_PLACES: Record<string, string[]> = {
  'egle-comfort': ['vilnius', 'kaunas'],
  'egle-standart': ['vilnius', 'kaunas'],
};

export const freeTransferPlaces = (hotelId?: string | null) => (hotelId && FREE_TRANSFER_PLACES[hotelId]) || [];
