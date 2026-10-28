/**
 * Sanatoriums that meet guests themselves: the airport transfer is part of the stay,
 * so we don't sell our own transfer for them. Today only Eglė; later this list comes
 * from the admin settings of each sanatorium. [ПРИМЕР ДАННЫХ — НАСТРОЙКА В АДМИНКЕ]
 */
export const TRANSFER_BY_SANATORIUM: Record<string, string> = {
  'egle-comfort': 'Эгле Комфорт',
  'egle-standart': 'Эгле Стандарт',
};

export const transferBySanatorium = (hotelId?: string | null) => !!hotelId && hotelId in TRANSFER_BY_SANATORIUM;

/** "санаторий «Эгле Комфорт»" */
export const sanatoriumTransferName = (hotelId?: string | null) =>
  'санаторий «' + (hotelId ? TRANSFER_BY_SANATORIUM[hotelId] || '' : '') + '»';
