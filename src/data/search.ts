import type { Booking } from './booking';

/** Resorts offered in the search form: [key, label]. */
export const RESORTS: [string, string][] = [
  ['druskininkai', 'Друскининкай'],
  ['birstonas', 'Бирштонас'],
  ['palanga', 'Паланга'],
  ['anyksciai', 'Аникщяй'],
];

/** Guest combinations in the search form; value = "adults-children". */
export const GUEST_OPTIONS = [
  { value: '2-0', label: '2 взрослых' },
  { value: '1-0', label: '1 взрослый' },
  { value: '2-1', label: '2 взрослых, 1 ребёнок' },
  { value: '2-2', label: '2 взрослых, 2 ребёнка' },
  { value: '3-0', label: '3 взрослых' },
  { value: '4-0', label: '4 взрослых' },
];

export const guestsKey = (b: Pick<Booking, 'adults' | 'children'>) => `${b.adults}-${b.children}`;
export const parseGuests = (key: string) => {
  const [adults, children] = key.split('-').map(Number);
  return { adults, children };
};
