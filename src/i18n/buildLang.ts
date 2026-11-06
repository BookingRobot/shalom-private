/**
 * Each language is its own build of the same site: Russian at «/», Hebrew at «/he/» (vite.config.ts,
 * `vite build --mode he`). The Hebrew build swaps every Russian text for its translation at build time
 * (scripts/translate.mjs + src/i18n/he.texts.json) and mirrors the layout right-to-left (rtlcss).
 */
export type BuildLang = 'ru' | 'he';
export const BUILD_LANG: BuildLang = __LANG__ === 'he' ? 'he' : 'ru';

/** the same page in the other language: a full page load into the other build */
export function langHref(to: BuildLang, pathname: string, search = '', hash = ''): string {
  const p = pathname.startsWith('/') ? pathname : '/' + pathname;
  return (to === 'he' ? '/he' + (p === '/' ? '/' : p) : p) + search + hash;
}
