import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setCurrentLang } from './t';
import { BUILD_LANG } from './buildLang';

export type Lang = 'ru' | 'en' | 'he';
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'HE' },
];
export const isRtl = (l: Lang) => l === 'he';

interface LangApi {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const LangCtx = createContext<LangApi>({ lang: 'ru', setLang: () => {} });
const KEY = 'br-shalom:lang';

function readLang(): Lang {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === 'ru' || v === 'en' || v === 'he') return v;
  } catch {
    /* storage unavailable */
  }
  return 'ru';
}

/** Chosen interface language (Russian by default), remembered for the browser session. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const api = useMemo(
    () => ({
      lang,
      setLang: (l: Lang) => {
        setLangState(l);
        try {
          sessionStorage.setItem(KEY, l);
        } catch {
          /* ignore */
        }
      },
    }),
    [lang],
  );
  return <LangCtx.Provider value={api}>{children}</LangCtx.Provider>;
}

/** The chosen language and its switch (the menu uses it; pages use usePageLanguage). */
export const useLang = () => useContext(LangCtx);

/**
 * Language for the current page. Pages translated only into Russian pass ['ru'] and
 * stay Russian even if the guest switched language elsewhere. Sets <html lang/dir>.
 */
export function usePageLanguage(supported: readonly Lang[] = ['ru']): LangApi & { dir: 'ltr' | 'rtl' } {
  const api = useContext(LangCtx);
  // the Hebrew build is Hebrew everywhere: its texts were translated at build time
  const lang: Lang = BUILD_LANG === 'he' ? 'he' : supported.includes(api.lang) ? api.lang : supported[0];
  const dir = isRtl(lang) ? 'rtl' : 'ltr';
  setCurrentLang(lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  return { lang, setLang: api.setLang, dir };
}
