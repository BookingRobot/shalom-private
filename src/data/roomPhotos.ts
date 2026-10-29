/**
 * Room photos for the mini gallery on a room card (tap the photo → all photos of the room).
 * Eglė's photos are the sanatorium's own (sanatorija.lt), kept on our site, no watermarks.
 * Other sanatoriums: the card's one photo until their sets are added.
 */
export interface RoomPhoto {
  src: string;
  alt: string;
}

const img = (id: string, alt: string): RoomPhoto => ({ src: '/img/' + id + '.jpg', alt });

export const EGLE_PIC = {
  twin: img('30a09b201ad3dfff7b616c3b574c0cd7', 'Две отдельные кровати'),
  doubleDesk: img('ae6a1f502266ecdbbacb6ca2d306bd4e', 'Номер с рабочим столом'),
  desk: img('088f60d49aaeb0d8d55730ad0f5a5c1e', 'Рабочий стол, телевизор и шкаф'),
  bath: img('14d83b7ba845989e11a462ea00ac975f', 'Ванная комната с душем'),
  double: img('53a8f8fb802e97e7d2d6d07e7b2fde1f', 'Двуспальная кровать'),
  robe: img('1ed30c344894ad7c430ca1d7e9ef3294', 'Отдых в номере после процедур'),
  family: img('20723f6762def3e0cb3ac4020d04b190', 'Просторный номер с креслами'),
  suiteLiving: img('794cb69bc6eed1df84ab1b9aa9217ecd', 'Гостиная апартаментов'),
  suiteChairs: img('1ce3cd93dc0ac8a1b56b5f5419e1105c', 'Кресла у окна'),
  aerial: img('fb73f403570a6fbef87fc765dca0ae4e', 'Санаторий «Эгле» среди сосен — вид сверху'),
  poolFall: img('0a18cb239146a0c57e988d958f7d3fb6', 'Бассейн с водопадом'),
  poolCure: img('3e9bbbffd3598d2ad6730ff283702d81', 'Лечебный бассейн'),
  bathCure: img('492539952f6c27d366c1c41dc43caedb', 'Минеральная ванна'),
  aquagym: img('155624dd9fce2e7f57a8ef9284014a46', 'Аквагимнастика'),
  doctor: img('4d2477d20bf0d31312e1ee866067862f', 'Консультация врача'),
  buffet: img('381871630bbe34ddaa0416dabe5c95f2', 'Шведский стол: свежие салаты'),
  gallery: img('8ad988c296eca1d86370daaa7b689fd5', 'Тёплая стеклянная галерея между корпусами'),
  library: img('89b3184bd2764343b0ba91b35fda7c73', 'Библиотека'),
  park: img('09fcf1591051e880a864ee45328eb4af', 'Парк санатория с дорожками'),
  pump: img('c9275cfc97ab501c50b59640509e6bf0', 'Бювет минеральной воды в парке'),
};

const E = EGLE_PIC;
const ROOMS: Record<string, RoomPhoto[]> = {
  'egle-comfort|Двухместный номер': [E.twin, E.desk, E.bath],
  'egle-comfort|Улучшенный двухместный': [E.double, E.robe, E.doubleDesk, E.bath],
  'egle-comfort|Полулюкс': [E.family, E.suiteChairs, E.desk, E.bath],
  'egle-comfort|Апартаменты': [E.suiteLiving, E.suiteChairs, E.double, E.bath],
};

/** All photos of a room (the first one is the card's photo); one photo when there is no set. */
export function roomPhotos(hotelId: string, room: string, fallback?: string): RoomPhoto[] {
  return ROOMS[hotelId + '|' + room] || (fallback ? [{ src: fallback, alt: room }] : []);
}
