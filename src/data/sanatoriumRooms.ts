/**
 * Rooms and programmes for the sanatorium page. Eglė Comfort has its full price
 * list; for the other sanatoriums they are built from the offers shown in the
 * results (one room per offer, one programme per offer title).
 * [ПРИМЕР ДАННЫХ — из BookingRobot API]
 */
import { toNum } from '../lib/format';
import { EGLE_PROGRAMS, EGLE_ROOMS } from './egleComfort';
import { amenity } from './iconPaths';
import { SANATORIUMS } from './sanatoriums';

const EGLE_PREMIUM = {
  n: 3,
  title: 'Программа «Премиум» — 5 процедур в день + массаж',
  price: '2 550',
  prog: [
    amenity('meals', 'Полный пансион, диетическое меню'),
    amenity('doctor', 'Консультация врача'),
    amenity('proc', '5 процедур в день'),
    amenity('massage', 'Массаж каждый день'),
    amenity('pool', 'Бассейны без ограничений'),
  ],
  details:
    'Для взрослого в цену включено:\n— Всё, что в программе «Макси»\n— Ежедневный классический массаж 30 мин\n— Полный пансион: завтрак, обед, полдник, ужин, диетическое меню по назначению врача\n\nПроцедуры назначает врач после консультации.',
};

export function roomsAndPrograms(id: string) {
  if (!id || id === 'egle-comfort') {
    return {
      rooms: EGLE_ROOMS as any[],
      programs: (EGLE_PROGRAMS as any[]).concat([EGLE_PREMIUM]),
      /** room types fully booked on some dates: room n → availability key */
      busyKeys: { 3: 'egle-comfort:junior' } as Record<number, string>,
    };
  }
  const h = SANATORIUMS.find((x) => x.id === id);
  if (!h) return { rooms: [], programs: [], busyKeys: {} };
  const offers = h.offers as any[];
  const min = Math.min(...offers.map((o) => toNum(o.price)));
  const rooms: any[] = [];
  offers.forEach((o) => {
    if (rooms.some((r) => r.name === o.room)) return;
    const own = Math.min(...offers.filter((x) => x.room === o.room).map((x) => toNum(x.price)));
    rooms.push({
      n: rooms.length + 1,
      top: rooms.length === 0,
      name: o.room,
      line: (o.amen || [])
        .slice(0, 3)
        .map((a: any) => a.t)
        .join(' · '),
      add: own - min,
      img: o.img || h.img,
      amen: o.amen || [],
    });
  });
  const programs: any[] = [];
  offers.forEach((o) => {
    if (programs.some((p) => p.title === o.title)) return;
    const room = rooms.find((r) => r.name === o.room);
    programs.push({
      n: programs.length + 1,
      title: o.title,
      prog: o.prog,
      price: String(toNum(o.price) - (room ? room.add : 0)),
      details: o.details,
    });
  });
  return { rooms, programs, busyKeys: {} as Record<number, string> };
}
