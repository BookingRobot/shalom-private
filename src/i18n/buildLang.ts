/**
 * Each language is its own build of the same site: Russian at «/», Hebrew at «/he/», English at «/en/»
 * (vite.config.ts, `vite build --mode he|en`). A translated build swaps every Russian text for its
 * translation at build time (scripts/translate.mjs + src/i18n/<lang>.texts.json); Hebrew also mirrors
 * the layout right-to-left (rtlcss).
 */
export type BuildLang = 'ru' | 'he' | 'en';
export const BUILD_LANG: BuildLang = __LANG__ === 'he' ? 'he' : __LANG__ === 'en' ? 'en' : 'ru';

/** the languages in the switch, each named in its own language */
export const SITE_LANGS: { code: BuildLang; label: string; short: string }[] = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'he', label: 'עברית', short: 'עב' },
];

/** the same page in another language: a full page load into that build */
export function langHref(to: BuildLang, pathname: string, search = '', hash = ''): string {
  const p = pathname.startsWith('/') ? pathname : '/' + pathname;
  return (to === 'ru' ? p : `/${to}` + (p === '/' ? '/' : p)) + search + hash;
}
