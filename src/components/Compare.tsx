import { useEffect, useState, type ReactNode } from 'react';
import { teamOf } from '../data/team';
import { TeamHeads } from './TeamHeads';
import { transferBySanatorium } from '../data/transferPolicy';
import { useBooking } from '../context/BookingContext';
import { toNum } from '../lib/format';
import { eur, quote } from '../lib/pricing';
import './Compare.css';

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

/** a row of the table: the label, the cell, and a text key to tell whether the sanatoriums differ */
interface Row {
  label: string;
  cell: (h: CompareHotel) => ReactNode;
  key: (h: CompareHotel) => string;
  /** always on top, never folded */
  top?: boolean;
}

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
  const [same, setSame] = useState(false);
  const list = ids.map((id) => hotels.find((h) => h.id === id)).filter(Boolean) as CompareHotel[];
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);
  if (list.length === 0) return null;
  const g = { adults: booking.adults, children: booking.children };
  const priceOf = (h: CompareHotel) =>
    eur(quote(toNum(h.price), g, booking.flightPackage, transferBySanatorium(h.id)).perPerson);
  const tag = (k: string) => (h: CompareHotel) => yes(h.tags.includes(k));
  const tagKey = (k: string) => (h: CompareHotel) => String(h.tags.includes(k));
  const rows: Row[] = [
    {
      label: booking.adults === 1 ? 'Цена за одного' : 'Цена на человека',
      cell: (h) => <strong className="cmp-price">{priceOf(h)}</strong>,
      key: priceOf,
      top: true,
    },
    // who meets the guest: more heads — more people to help
    {
      label: 'Кто вас встретит',
      cell: (h) => (teamOf(h.id).length ? <TeamHeads roles={teamOf(h.id)} size={40} /> : '—'),
      key: (h) => teamOf(h.id).join(','),
      top: true,
    },
    { label: 'Категория', cell: (h) => '★'.repeat(h.starsN), key: (h) => String(h.starsN) },
    { label: 'Процедуры', cell: procs, key: procs },
    { label: 'Питание', cell: (h) => meals(h.tags), key: (h) => meals(h.tags) },
    { label: 'Консультация врача', cell: tag('doctor'), key: tagKey('doctor') },
    { label: 'Врач говорит по-русски', cell: tag('ru'), key: tagKey('ru') },
    { label: 'Бассейн', cell: tag('pool'), key: tagKey('pool') },
    { label: 'Всё в одном здании', cell: tag('samebld'), key: tagKey('samebld') },
    { label: 'Лифт', cell: tag('lift'), key: tagKey('lift') },
    { label: 'Новый корпус', cell: tag('newbld'), key: tagKey('newbld') },
    { label: 'Кондиционер в номере', cell: tag('ac'), key: tagKey('ac') },
    { label: 'Балкон', cell: tag('balcony'), key: tagKey('balcony') },
    { label: 'Лечит', cell: (h) => h.spec || '—', key: (h) => h.spec || '' },
  ];
  // the point of comparing is the difference: identical rows fold away under one button
  const differs = (r: Row) => new Set(list.map(r.key)).size > 1;
  const shown = rows.filter((r) => r.top || differs(r));
  const alike = rows.filter((r) => !r.top && !differs(r));
  const Rows = ({ rs }: { rs: Row[] }) => (
    <>
      {rs.map((r) => (
        <div className="cmp-row" key={r.label}>
          <span className="cmp-lbl">{r.label}</span>
          {list.map((h) => (
            <span className="cmp-cell" key={h.id}>
              {r.cell(h)}
            </span>
          ))}
        </div>
      ))}
    </>
  );
  return (
    <>
      <div className="cmp-bar" role="region" aria-label="Сравнение санаториев" data-canvas="results-compare">
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
        <div
          className="cmp-overlay"
          data-canvas="compare-dialog"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="cmpTitle" className="cmp-dialog">
            <div className="cmp-head">
              <h2 id="cmpTitle" className="cmp-title">
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
              <Rows rs={shown} />
              {alike.length ? (
                <>
                  <button type="button" className="cmp-same" aria-expanded={same} onClick={() => setSame(!same)}>
                    <span>
                      {same ? 'Скрыть одинаковое' : 'Одинаково у всех'} ({alike.length})
                    </span>
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
                      className={same ? 'open' : ''}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {same ? <Rows rs={alike} /> : null}
                </>
              ) : null}
            </div>
            <p className="cmp-foot">
              {shown.length > 2
                ? 'Сверху — чем санатории отличаются. '
                : 'Эти санатории почти не отличаются по условиям — смотрите цену и кто встретит. '}
              Цена — за весь заезд{booking.flightPackage ? ', с перелётом и трансфером' : ''}. Не знаете, что выбрать?
              Консультант поможет по телефону или в WhatsApp.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
