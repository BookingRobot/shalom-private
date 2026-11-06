import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AGENCY,
  AGENCY_LOGO,
  AGENCY_LOGO_WHITE,
  PHONE_DISPLAY,
  PHONE_TEL,
  SITE_NAME,
  WHATSAPP_URL,
} from '../../data/contacts';
import { useT } from '../../i18n/t';
import { BUILD_LANG, SITE_LANGS, langHref } from '../../i18n/buildLang';
import { PhoneIcon } from '../icons';
import './SiteHeader.css';

type Tone = 'light' | 'dark';

/** the site's forest green: the header bar is painted with it, so the agency's logo goes white on it */
export const HEADER_GREEN = 'var(--green)';

/** the parts of the header read it: on the green bar the logo, menu and phone are white */
const OnGreen = createContext(false);
const useTone = (tone: Tone): Tone => (useContext(OnGreen) ? 'dark' : tone);

/**
 * Top bar of the site: a solid forest-green bar with the agency's white logo and a white menu
 * (the colour logo's blue would clash with the site's greens). Composed from small parts so each
 * page keeps its own layout:
 *   <HeaderBar><Brand /><MainNav active="resorts" /><PhoneLink /></HeaderBar>
 */
export function HeaderBar({
  minHeight = 64,
  maxWidth = 1180,
  children,
}: {
  minHeight?: number;
  maxWidth?: number;
  /** kept for older callers: the bar is always green now */
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <header className="site-header on-green" style={{ background: HEADER_GREEN }}>
      <div
        style={{
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
          padding: '0 24px',
          minHeight: `${minHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <OnGreen.Provider value={true}>{children}</OnGreen.Provider>
        <LangLink />
        <MobileMenu />
      </div>
    </header>
  );
}

/**
 * Phone: the header is one slim row — the logo and «Меню». The menu opens as a sheet under the bar:
 * every page of the menu, the phone and WhatsApp, the language. Laptop: hidden.
 */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const t = useT();
  const btn = useRef<HTMLLabelElement>(null);
  // a new page closes the menu
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);
  // the sheet opens right under the green bar, wherever the page is scrolled
  const [top, setTop] = useState(56);
  const toggle = () => {
    const bar = btn.current?.closest('header');
    if (bar) setTop(Math.max(0, Math.round(bar.getBoundingClientRect().bottom)));
    setOpen(!open);
  };
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
    };
  }, [open]);
  const here = (to: string) => {
    const [path, hash] = to.split('#');
    return loc.pathname === path && (hash ? loc.hash === '#' + hash : !loc.hash);
  };
  return (
    <>
      {/* phone: one tap to call — the consultant is the guest's safety net on every page */}
      <a className="hd-call" href={PHONE_TEL} aria-label={'Позвонить: ' + PHONE_DISPLAY}>
        <PhoneIcon size={20} color="currentColor" />
        <span className="hd-call-t">Позвонить</span>
      </a>
      {/* a checkbox under the label keeps the menu working even without scripts (the canvas boards) */}
      <input
        type="checkbox"
        id="hdToggle"
        className="hd-toggle"
        checked={open}
        onChange={(e) => {
          const bar = btn.current?.closest('header');
          if (bar) setTop(Math.max(0, Math.round(bar.getBoundingClientRect().bottom)));
          setOpen(e.target.checked);
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <label
        ref={btn}
        htmlFor="hdToggle"
        className="hd-burger"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="hdMenu"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span className="hd-burger-ico" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="hd-burger-m">{t('nav.menu')}</span>
        <span className="hd-burger-x">{t('nav.close')}</span>
      </label>
      {
        <div
          className="hd-menu-back"
          style={{ ['--hd-menu-top' as string]: top + 'px' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <nav id="hdMenu" className="hd-menu" aria-label={t('nav.menu')}>
            <ul className="hd-menu-list">
              {NAV.map((n) => (
                <li key={n.key}>
                  <Link to={n.to} aria-current={here(n.to) ? 'page' : undefined} onClick={() => setOpen(false)}>
                    {t(`nav.${n.key}`)}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hd-menu-call">
              <span className="hd-menu-k">{t('nav.consult')}</span>
              <a className="hd-menu-tel" href={PHONE_TEL} dir="ltr">
                <PhoneIcon size={20} color="currentColor" />
                {PHONE_DISPLAY}
              </a>
              <a className="hd-menu-wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {t('nav.whatsapp')}
              </a>
            </div>
            <div className="hd-menu-lang">
              <span className="hd-menu-k">Язык · Language · שפה</span>
              <div className="hd-seg">
                {SITE_LANGS.map((l) => (
                  <a
                    key={l.code}
                    className={BUILD_LANG === l.code ? 'on' : ''}
                    href={langHref(l.code, loc.pathname, loc.search)}
                    lang={l.code}
                    aria-current={BUILD_LANG === l.code ? 'true' : undefined}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      }
    </>
  );
}

/** The agency's logo (data/contacts: the demo brand or Atlantis), links to the home page; white on the green bar. */
export function Brand({
  logo = 32,
  tone = 'light',
}: {
  round?: number;
  logo?: number;
  size?: number;
  gap?: number;
  tone?: Tone;
  name?: ReactNode;
}) {
  const h = Math.round(logo * 1.2);
  const white = useTone(tone) === 'dark';
  return (
    <Link
      to="/"
      className="brand"
      style={{ display: 'flex', alignItems: 'center', padding: '4px 0', margin: '-4px 0' }}
    >
      <img
        src={white ? AGENCY_LOGO_WHITE : AGENCY_LOGO}
        alt={AGENCY + ' — ' + SITE_NAME}
        height={h}
        width={Math.round((h * 738) / 165)}
        style={{ display: 'block', height: h + 'px', width: 'auto' }}
      />
    </Link>
  );
}

export type NavKey = 'resorts' | 'flights' | 'pay' | 'rules' | 'contacts';
const NAV: { key: NavKey; to: string }[] = [
  { key: 'resorts', to: '/results' },
  { key: 'flights', to: '/tickets' },
  { key: 'pay', to: '/rules#pay' },
  { key: 'rules', to: '/rules' },
  { key: 'contacts', to: '/rules#contact' },
];
/** the language switch shows only when a second language is complete: a switch that changes nothing misleads */
/** laptop: RU · EN · עב in the bar — the same page in another language */
function LangLink() {
  const loc = useLocation();
  return (
    <nav className="hd-langs" aria-label="Язык · Language · שפה">
      {SITE_LANGS.map((l) => (
        <a
          key={l.code}
          className={'hd-lang' + (BUILD_LANG === l.code ? ' on' : '')}
          href={langHref(l.code, loc.pathname, loc.search)}
          lang={l.code}
          title={l.label}
          aria-current={BUILD_LANG === l.code ? 'true' : undefined}
        >
          {l.short}
        </a>
      ))}
    </nav>
  );
}

/** Main navigation: resorts, direct flights, payment, terms, contacts. */
export function MainNav({
  gap = 36,
  size = 17,
  active,
  tone: toneProp = 'light',
}: {
  gap?: number;
  size?: number;
  active?: NavKey;
  tone?: Tone;
}) {
  const tone = useTone(toneProp);
  const t = useT();
  return (
    <nav
      className="hd-nav"
      aria-label={t('nav.mainMenu')}
      style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, flexWrap: 'wrap' }}
    >
      {NAV.map((n) => (
        <Link
          key={n.key}
          className="navlink"
          to={n.to}
          aria-current={n.key === active ? 'page' : undefined}
          style={{
            ...(size !== 17 ? { fontSize: `${size}px` } : null),
            ...(tone === 'dark' ? { color: 'var(--paper)' } : n.key === active ? { color: 'var(--green)' } : null),
          }}
        >
          {t(`nav.${n.key}`)}
        </Link>
      ))}
    </nav>
  );
}

/** Clickable phone number. */
export function PhoneLink({
  size = 18,
  icon = 20,
  gap = 10,
  tone: toneProp = 'light',
}: {
  size?: number;
  icon?: number;
  gap?: number;
  tone?: Tone;
}) {
  const tone = useTone(toneProp);
  return (
    <a
      href={PHONE_TEL}
      dir="ltr"
      className="hd-phone"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
        textDecoration: 'none',
        color: tone === 'dark' ? 'var(--paper)' : 'var(--ink)',
        fontWeight: '800',
        fontSize: `${size}px`,
        padding: '8px 0',
        margin: '-8px 0',
      }}
    >
      <PhoneIcon size={icon} color={tone === 'dark' ? 'currentColor' : 'var(--green)'} />
      {PHONE_DISPLAY}
    </a>
  );
}

/** Right-hand group: a note or switch next to the phone. */
export function HeaderAside({
  children,
  gap = 14,
  wrap = true,
}: {
  children: ReactNode;
  gap?: number;
  wrap?: boolean;
}) {
  return (
    <div
      className="hd-aside"
      style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, ...(wrap ? { flexWrap: 'wrap' } : null) }}
    >
      {children}
    </div>
  );
}
