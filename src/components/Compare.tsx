import { useEffect, useState, type ReactNode } from 'react';
import { teamOf } from '../data/team';
import { TeamHeads } from './TeamHeads';
import { transferBySanatorium } from '../data/transferPolicy';
import { useBooking } from '../context/BookingContext';
import { toNum } from '../lib/format';
import { eur, quote } from '../lib/pricing';

export interface CompareHotel {
  id: string;
  name: string;
  starsN: number;
  img: string;
  price: string | number;
  tags: string[];
  inc: string[];
  spec?: string;
}

/** Up to 3 sanatoriums side by side on a laptop, 2 on a phone. */
export const useCompareLimit = () => {
  const [limit, setLimit] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const set = () => setLimit(mq.matches ? 2 : 3);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  return limit;
};

const yes = (b: boolean) => (b ? '✓ да' : '—');
const meals = (t: string[]) =>
  [t.includes('meals2') && '2 раза', t.includes('meals3') && '3 раза', t.includes('mfull') && 'полный пансион']
    .filter(Boolean)
    .join(' или ') || '—';
const procs = (h: CompareHotel) =>
  h.tags.includes('proc3') || h.tags.includes('proc5')
    ? [h.tags.includes('proc3') && '3', h.tags.includes('proc5') && '5'].filter(Boolean).join(' или ') + ' в день'
    : h.inc[0];

/** Sticky bar "Сравнить (2)" + the comparison table pop-up. */
export function Compare({
  hotels,
  ids,
  onRemove,
  onClear,
}: {
  hotels: CompareHotel[];
  ids: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const { booking } = useBooking();
  const [open, setOpen] = useState(false);
  const list = ids.map((id) => hotels.find((h) => h.id === id)).filter(Boolean) as CompareHotel[];
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);
  if (list.length === 0) return null;
  const g = { adults: booking.adults, children: booking.children };
  const rows: [string, (h: CompareHotel) => ReactNode][] = [
    [
      booking.adults === 1 ? 'Цена за одного' : 'Цена на человека',
      (h) => eur(quote(toNum(h.price), g, booking.flightPackage, transferBySanatorium(h.id)).perPerson),
    ],
    ['Категория', (h) => '★'.repeat(h.starsN)],
    // who meets the guest: more heads — more people to help
    ['Кто вас встретит', (h) => (teamOf(h.id).length ? <TeamHeads roles={teamOf(h.id)} size={40} /> : '—')],
    ['Процедуры', procs],
    ['Питание', (h) => meals(h.tags)],
    ['Консультация врача', (h) => yes(h.tags.includes('doctor'))],
    ['Врач говорит по-русски', (h) => yes(h.tags.includes('ru'))],
    ['Бассейн', (h) => yes(h.tags.includes('pool'))],
    ['Всё в одном здании', (h) => yes(h.tags.includes('samebld'))],
    ['Лифт', (h) => yes(h.tags.includes('lift'))],
    ['Новый корпус', (h) => yes(h.tags.includes('newbld'))],
    ['Кондиционер в номере', (h) => yes(h.tags.includes('ac'))],
    ['Балкон', (h) => yes(h.tags.includes('balcony'))],
    ['Лечит', (h) => h.spec || '—'],
  ];
  return (
    <>
      <div className="cmp-bar" role="region" aria-label="Сравнение санаториев">
        <span className="cmp-names">
          <strong>Сравнить:</strong> {list.map((h) => h.name.replace('Санаторий ', '')).join(', ')}
        </span>
        <span className="cmp-actions">
          <button type="button" className="btn btn-secondary cmp-btn" onClick={onClear}>
            Очистить
          </button>
          <button
            type="button"
            className="btn btn-primary cmp-btn"
            disabled={list.length < 2}
            onClick={() => setOpen(true)}
          >
            {list.length < 2 ? 'Отметьте ещё один' : `Сравнить (${list.length}) →`}
          </button>
        </span>
      </div>
      {open ? (
        <div className="cmp-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="cmpTitle" className="cmp-dialog">
            <div className="cmp-head">
              <h2 id="cmpTitle" style={{ fontSize: '26px' }}>
                Сравнение санаториев
              </h2>
              <button type="button" className="btn btn-secondary cmp-btn" onClick={() => setOpen(false)}>
                ✕ Закрыть
              </button>
            </div>
            <div className="cmp-table" style={{ ['--n' as string]: list.length }}>
              <div className="cmp-row cmp-top">
                <span className="cmp-lbl" />
                {list.map((h) => (
                  <span className="cmp-cell" key={h.id}>
                    <img src={h.img} alt="" />
                    <strong>{h.name}</strong>
                    <button type="button" className="cmp-x" onClick={() => onRemove(h.id)}>
                      Убрать
                    </button>
                  </span>
                ))}
              </div>
              {rows.map(([label, fn]) => (
                <div className="cmp-row" key={label}>
                  <span className="cmp-lbl">{label}</span>
                  {list.map((h) => (
                    <span className="cmp-cell" key={h.id}>
                      {fn(h)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="cmp-foot">
              Цена — за весь заезд{booking.flightPackage ? ', с перелётом и трансфером' : ''}. Не знаете, что выбрать?
              Консультант поможет по телефону или в WhatsApp.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
