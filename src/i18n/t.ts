/**
 * Site texts live in dictionaries (ru.ts is the source of truth; en.ts / he.ts hold what
 * has been translated so far). `t('rooms.title')` returns the text in the chosen language,
 * or the Russian one when the translation is missing — the site never shows a bare key.
 * Variables: t('stay.nights', { n: 9 }) with «{n}» in the text.
 *
 * Hebrew is right-to-left: usePageLanguage sets <html dir>, and the layout uses logical
 * CSS properties (margin-inline, padding-inline, inset-inline) where sides matter.
 */
import { useLang, type Lang } from './LanguageContext';
import { ru } from './ru';
import { en } from './en';
import { he } from './he';

type Dict = { [k: string]: string | Dict };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

/** every key of the Russian dictionary, dotted: 'rooms.title' */
type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TextKey = Paths<typeof ru>;
export type Translation = DeepPartial<typeof ru>;

const dicts: Record<Lang, Dict> = { ru, en: en as Dict, he: he as Dict };

function lookup(d: Dict, key: string): string | undefined {
  let cur: string | Dict | undefined = d;
  for (const part of key.split('.')) {
    if (!cur || typeof cur === 'string') return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;

/** A text in a given language (Russian when not translated). */
export function tIn(lang: Lang, key: TextKey, vars?: Record<string, string | number>): string {
  const s = lookup(dicts[lang], key) ?? lookup(ru, key);
  if (s === undefined) {
    if (import.meta.env.DEV) console.warn('missing text', key);
    return key;
  }
  return fill(s, vars);
}

/** A text in the page's language — the Russian one until a translation exists. */
export const t = (key: TextKey, vars?: Record<string, string | number>) => tIn(current, key, vars);

let current: Lang = 'ru';
/** usePageLanguage keeps this in step with the page; plain functions (labels in view-models) read it */
export const setCurrentLang = (l: Lang) => {
  current = l;
};

/** Languages the site can be shown in: a language counts when its dictionary is complete. */
export function completeLanguages(): Lang[] {
  const keys = allKeys(ru);
  return (Object.keys(dicts) as Lang[]).filter((l) => keys.every((k) => lookup(dicts[l], k) !== undefined));
}

function allKeys(d: Dict, p = ''): string[] {
  return Object.entries(d).flatMap(([k, v]) => (typeof v === 'string' ? [p + k] : allKeys(v, p + k + '.')));
}

/** The dictionary function for components: re-renders with the language. */
export function useT() {
  const { lang } = useLang();
  return (key: TextKey, vars?: Record<string, string | number>) => tIn(lang, key, vars);
}
