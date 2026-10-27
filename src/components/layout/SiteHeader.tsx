import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PHONE_DISPLAY, PHONE_TEL, SITE_NAME } from '../../data/contacts';
import { LogoMark, PhoneIcon } from '../icons';
import './SiteHeader.css';

type Tone = 'light' | 'dark';

/**
 * Top bar of the site. Composed from small parts so each page keeps its own layout:
 *   <HeaderBar><Brand /><MainNav active="resorts" /><PhoneLink /></HeaderBar>
 */
export function HeaderBar({
  minHeight = 64,
  tone = 'light',
  children,
}: {
  minHeight?: number;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <header
      className="site-header"
      style={tone === 'dark' ? { position: 'relative' } : { background: '#fff', borderBottom: '1px solid #E3DED2' }}
    >
      <div
        style={{
          maxWidth: '1180px',
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
        {children}
      </div>
    </header>
  );
}

/** Logo + site name, links to the home page. */
export function Brand({
  logo = 32,
  size = 21,
  gap = 12,
  tone = 'light',
  name = SITE_NAME,
}: {
  logo?: number;
  size?: number;
  gap?: number;
  tone?: Tone;
  name?: ReactNode;
}) {
  return (
    <Link
      to="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
        textDecoration: 'none',
        color: tone === 'dark' ? '#fff' : '#1C2620',
        padding: '4px 0',
        margin: '-4px 0',
      }}
    >
      <LogoMark size={logo} />
      <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: `${size}px`, fontWeight: '700' }}>{name}</span>
    </Link>
  );
}

export type NavKey = 'resorts' | 'pay' | 'rules' | 'contacts';
const NAV: { key: NavKey; label: string; to: string }[] = [
  { key: 'resorts', label: 'Курорты', to: '/results' },
  { key: 'pay', label: 'Как оплатить', to: '/rules#pay' },
  { key: 'rules', label: 'Условия', to: '/rules' },
  { key: 'contacts', label: 'Контакты', to: '/rules#contact' },
];

/** Main navigation: resorts, payment, terms, contacts. */
export function MainNav({
  gap = 36,
  size = 17,
  active,
  tone = 'light',
}: {
  gap?: number;
  size?: number;
  active?: NavKey;
  tone?: Tone;
}) {
  return (
    <nav
      aria-label="Основное меню"
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
            ...(tone === 'dark' ? { color: '#fff' } : n.key === active ? { color: '#1F5F4A' } : null),
          }}
        >
          {n.label}
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
  tone = 'light',
}: {
  size?: number;
  icon?: number;
  gap?: number;
  tone?: Tone;
}) {
  return (
    <a
      href={PHONE_TEL}
      dir="ltr"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
        textDecoration: 'none',
        color: tone === 'dark' ? '#fff' : '#1C2620',
        fontWeight: '800',
        fontSize: `${size}px`,
        padding: '8px 0',
        margin: '-8px 0',
      }}
    >
      <PhoneIcon size={icon} color={tone === 'dark' ? 'currentColor' : '#1F5F4A'} />
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
    <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, ...(wrap ? { flexWrap: 'wrap' } : null) }}>
      {children}
    </div>
  );
}
