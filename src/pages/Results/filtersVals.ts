import { FILTER_GROUPS } from '../../data/filters';
import type { FilterItem, FilterVals, Flags, OneOfItem, PriceRange, ResultsState, SortKey } from './resultsTypes';
import { plural, type Sanatorium } from './stayPricing';

type Pair = readonly [string, string, string?] | (string | undefined)[];
type Set = (patch: Partial<ResultsState>) => void;

/** a sanatorium passes one filter key */
const has = (h: Sanatorium, k: string) =>
  k === 's3'
    ? h.starsN === 3
    : k === 's4'
      ? h.starsN === 4
      : k === 's5'
        ? h.starsN === 5
        : k === 'shower'
          ? h.tags.includes('lift')
          : h.tags.includes(k);

const ppnOf = (h: Sanatorium) => Math.round(h.price / 2); // per person, double room, for the stay

/** the predicate for a set of flags and a price range: stars are "one of", everything else "all of" */
export const passWith = (F: Flags, P: PriceRange) => {
  const S = Object.keys(F).filter((k) => F[k]);
  const starS = S.filter((k) => k[0] === 's' && k.length === 2),
    otherS = S.filter((k) => !(k[0] === 's' && k.length === 2));
  return (h: Sanatorium) =>
    (starS.length === 0 || starS.some((k) => has(h, k))) &&
    otherS.every((k) => has(h, k)) &&
    (!P.min || ppnOf(h) >= P.min) &&
    (!P.max || ppnOf(h) <= P.max);
};

const labelOf = (k: string, pr: PriceRange) => {
  if (k === 'pmin') return 'от ' + pr.min + ' €';
  if (k === 'pmax') return 'до ' + pr.max + ' €';
  for (const g of Object.values(FILTER_GROUPS) as Pair[][]) {
    const hit = g.find((x) => x[0] === k);
    if (hit) return hit[1] as string;
  }
  return k;
};

/**
 * Filters and sorting of the list. Applied filters (f, pr) drive the list; pending ones
 * (pf, ppr) are edited in the panel and applied with its button.
 */
export function buildFilters(st: ResultsState, set: Set, all: Sanatorium[]): FilterVals {
  const f = st.f || {};
  const sel = Object.keys(f).filter((k) => f[k]);
  const pr = st.pr || {};
  const pf = st.pf || f;
  const ppr = st.ppr || pr;
  const passPending = passWith(pf, ppr);
  const pendingN = all.filter(passPending).length;
  const pendingCount = Object.keys(pf).filter((k) => pf[k]).length + (ppr.min ? 1 : 0) + (ppr.max ? 1 : 0);
  const mk = (pairs: Pair[]): FilterItem[] =>
    pairs.map(([k, t, d]) => ({
      k: k as string,
      t: t as string,
      d,
      on: !!pf[k as string],
      cls: pf[k as string] ? 'on' : '',
      n: all.filter((h) => has(h, k as string) && passWith({ ...pf, [k as string]: false }, ppr)(h)).length,
      toggle: () => set({ pf: { ...pf, [k as string]: !pf[k as string] } }),
    }));
  // one-of groups (meals, procedures per day): picking one clears the others; applied with the panel button
  const mkOne = (pairs: Pair[]): OneOfItem[] => {
    const keys = pairs.map((x) => x[0] as string);
    const cur = keys.find((k) => pf[k]) || '';
    const setOne = (k: string) => () => {
      const npf = { ...pf };
      keys.forEach((x) => (npf[x] = false));
      if (k && k !== cur) npf[k] = true;
      set({ pf: npf });
    };
    return [{ k: '', t: 'Любое', on: !cur, pick: setOne('') }].concat(
      pairs.map(([k, t]) => ({ k: k as string, t: t as string, on: cur === k, pick: setOne(k as string) })),
    );
  };
  // room features: several at once
  const mkNow = (pairs: Pair[]): OneOfItem[] =>
    pairs.map(([k, t]) => ({
      k: k as string,
      t: t as string,
      on: !!pf[k as string],
      pick: () => set({ pf: { ...pf, [k as string]: !pf[k as string] } }),
    }));
  const sort: SortKey = st.sort || 'pop';
  const activeKeys = sel.concat(pr.min ? ['pmin'] : [], pr.max ? ['pmax'] : []);
  return {
    hasActive: activeKeys.length > 0,
    active: activeKeys.map((k) => ({
      t: labelOf(k, pr),
      off: () => {
        if (k === 'pmin' || k === 'pmax') {
          const key = k === 'pmin' ? 'min' : 'max';
          set({ pr: { ...pr, [key]: 0 }, ppr: { ...ppr, [key]: 0 } });
        } else set({ f: { ...f, [k]: false }, pf: { ...pf, [k]: false } });
      },
    })),
    fTop: mk(FILTER_GROUPS.imp),
    fComfort: mk(FILTER_GROUPS.comfort),
    fStars: mk(FILTER_GROUPS.stars),
    fProfile: mk(FILTER_GROUPS.prof),
    fBeds: mk(FILTER_GROUPS.beds),
    fMeals: mkOne(FILTER_GROUPS.meals),
    fProcs: mkOne(FILTER_GROUPS.procs),
    fRoom: mkNow(FILTER_GROUPS.room),
    moreOpen: !!st.more,
    moreClosed: !st.more,
    toggleMore: () => set({ more: !st.more }),
    // The whole filter block is collapsed by default so the list starts higher on a laptop
    fOpen: !!st.fo,
    fClosed: !st.fo,
    openF: () => set({ fo: true, pf: { ...f }, ppr: { ...pr } }),
    closeF: () => set({ fo: false, more: false, pf: { ...f }, ppr: { ...pr } }),
    fBadge: String(activeKeys.length || ''),
    appliedSummary:
      activeKeys.length === 0
        ? 'Условия не выбраны — показаны все санатории'
        : 'Выбрано: ' + activeKeys.map((k) => labelOf(k, pr)).join(', '),
    pMin: ppr.min || '',
    pMax: ppr.max || '',
    setMin: (e) => set({ ppr: { ...ppr, min: Number(e.target.value) || 0 } }),
    setMax: (e) => set({ ppr: { ...ppr, max: Number(e.target.value) || 0 } }),
    pendCount:
      pendingCount === 0
        ? 'Условия не выбраны'
        : 'Выбрано ' + pendingCount + ' ' + (pendingCount === 1 ? 'условие' : pendingCount < 5 ? 'условия' : 'условий'),
    applyLabel: pendingN === 0 ? 'Ничего не подходит' : 'Показать ' + pendingN + ' ' + plural(pendingN),
    apply: () => set({ f: { ...pf }, pr: { ...ppr }, more: false, fo: false }),
    clearPending: () => set({ pf: {}, ppr: {} }),
    reset: () => set({ f: {}, pf: {}, pr: {}, ppr: {} }),
    sort,
    setSort: (e) => set({ sort: e.target.value as SortKey }),
  };
}

export const foundLabel = (shown: number, total: number) =>
  shown === total ? 'Все ' + total + ' ' + plural(total) : 'Подходят ' + shown + ' из ' + total + ' ' + plural(total);
