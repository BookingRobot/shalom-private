import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { POPULAR_NAMES, RESORTS, SANATORIUM_NAMES } from '../data/search';

type Item = { kind: 'resort' | 'san'; id: string; label: string; sub: string; sold?: boolean };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е').trim();

const ALL: Item[] = [
  ...RESORTS.map(([id, label]) => ({ kind: 'resort' as const, id, label, sub: 'курорт' })),
  ...SANATORIUM_NAMES.map((s) => ({
    kind: 'san' as const,
    id: s.id,
    label: s.name,
    sub: 'санаторий · ' + s.resort + (s.sold ? ' · нет мест на ваши даты' : ''),
    sold: s.sold,
  })),
];

const matches = (q: string) => {
  const n = norm(q);
  if (!n) return ALL;
  return ALL.filter((it) => {
    const names = [it.label, ...(SANATORIUM_NAMES.find((s) => s.id === it.id)?.aliases || [])].map(norm);
    return names.some((x) => x.includes(n) || n.split(' ').every((w) => x.includes(w)));
  });
};

/**
 * "Курорт или санаторий": most agency requests start with a sanatorium's name
 * ("Беларусь", "Эгле Комфорт", "Гранд Спа Лиетува"), so the first search field takes
 * either a resort or a sanatorium, in any spelling. Picking a sanatorium opens its rooms.
 */
/** What the field shows for the guest's choice: the sanatorium's name or the resort's. */
export function placeLabel(chosenPlace: string, dest: string) {
  if (chosenPlace.startsWith('san:')) {
    const s = SANATORIUM_NAMES.find((x) => x.id === chosenPlace.slice(4));
    if (s) return s.name;
  }
  return RESORTS.find(([id]) => id === dest)?.[1] || 'Друскининкай';
}

/**
 * Pick a resort (stay on the form) or a sanatorium. Elsewhere a sanatorium opens its rooms in
 * the results right away; on the home page (`stay`) it stays in the field like a resort, and
 * the guest goes on with the dates and «Найти санаторий».
 */
function usePick(onPicked?: (label: string) => void, stay = false) {
  const { update } = useBooking();
  const navigate = useNavigate();
  return (it: Item) => {
    if (it.kind === 'resort') {
      update({ dest: it.id, chosenPlace: 'resort:' + it.id });
      onPicked?.(it.label);
      return;
    }
    update({ dest: 'druskininkai', chosenPlace: 'san:' + it.id, ...(it.sold ? {} : { hotelId: it.id }) });
    if (stay) onPicked?.(it.label);
    else navigate('/results?h=' + it.id);
  };
}

/**
 * `guide` (home page): the field stays empty until the guest picks a resort or a sanatorium
 * themselves, and a sanatorium does not leave the page.
 */
export function PlaceSearch({ guide = false }: { guide?: boolean }) {
  const { booking } = useBooking();
  const label = placeLabel(booking.chosenPlace, booking.dest);
  const resortLabel = guide
    ? booking.chosenPlace
      ? label
      : ''
    : RESORTS.find(([id]) => id === booking.dest)?.[1] || 'Друскининкай';
  const [q, setQ] = useState(resortLabel);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  // the resort may be set from elsewhere (resort pop-up): show it in the field
  useEffect(() => {
    if (!open) setQ(resortLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resortLabel]);
  const list = open ? matches(q === resortLabel ? '' : q).slice(0, 8) : [];

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setQ(resortLabel);
      }
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [open, resortLabel]);

  const choose = usePick(setQ, guide);
  const pick = (it: Item) => {
    setOpen(false);
    choose(it);
    // the next step is on the page: put the phone keyboard away
    if (guide) input.current?.blur();
  };

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
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
      <input
        ref={input}
        id="city"
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && list[active] ? listId + '-' + active : undefined}
        autoComplete="off"
        placeholder={guide ? 'Введите или выберите' : 'Курорт или санаторий'}
        value={q}
        onFocus={(e) => {
          setOpen(true);
          setActive(0);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, list.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && open && list[active]) {
            e.preventDefault();
            pick(list[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
            setQ(resortLabel);
          }
        }}
      />
      {open ? (
        <ul id={listId} role="listbox" className="ps-list" aria-label="Курорты и санатории">
          {list.length === 0 ? <li className="ps-empty">Не нашли — напишите иначе или спросите консультанта</li> : null}
          {list.map((it, i) => (
            <li
              id={listId + '-' + i}
              key={it.kind + it.id}
              role="option"
              aria-selected={i === active}
              className={`ps-opt ${i === active ? 'on' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(it);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <strong>{it.label}</strong>
              <span>{it.sub}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** "Часто ищут: Беларусь · Эгле Комфорт …" — one tap opens that sanatorium. */
export function PlaceChips() {
  const pick = usePick();
  return (
    <div className="ps-chips">
      <span>Часто ищут:</span>
      {POPULAR_NAMES.map((id) => {
        const s = SANATORIUM_NAMES.find((x) => x.id === id)!;
        return (
          <button
            type="button"
            key={id}
            className="ps-chip"
            onClick={() => pick({ kind: 'san', id, label: s.name, sub: '', sold: s.sold })}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}
