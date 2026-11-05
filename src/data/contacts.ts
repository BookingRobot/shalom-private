/**
 * Who runs the site: the agency's name, logo and public contacts. Two brands:
 *  - `demo`     — an invented brand «Shalom Spa» with sample contacts, for showing the project to
 *                 other agencies (the default);
 *  - `atlantis` — the travel agency Atlantis travel & tourism (Israel).
 * Switch back to Atlantis: GitHub → Settings → Secrets and variables → Actions → Variables →
 * VITE_BRAND = atlantis, then re-run the deploy (or change DEFAULT_BRAND below). The favicons follow
 * the same switch (vite.config.ts → brandIcons).
 */
export type BrandId = 'demo' | 'atlantis';
const DEFAULT_BRAND: BrandId = 'demo';

type Brand = {
  agency: string;
  logo: string;
  logoWhite: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  address: string;
};
const DEMO_BRAND: Brand = {
  agency: 'Shalom Spa',
  logo: '/brand/demo/logo.svg',
  logoWhite: '/brand/demo/logo-white.svg',
  phoneDisplay: '+972 3 000 00 00',
  phoneTel: 'tel:+97230000000',
  whatsapp: 'https://wa.me/97230000000',
  email: 'shalom@bookingrobot.eu',
  address: 'Израиль, Тель-Авив (адрес для примера)',
};
const ATLANTIS_BRAND: Brand = {
  agency: 'Atlantis travel & tourism',
  logo: '/img/5df2efd7b5bab4d4a08d500848a30611.png',
  logoWhite: '/img/9149f20f562e42cf5db1520edc7ab6e8.png',
  phoneDisplay: '+972 3 655 25 22',
  phoneTel: 'tel:+97236552522',
  whatsapp: 'https://wa.me/97236552522',
  email: 'info@atlantistravel.co.il',
  address: 'Израиль, г. Бат-Ям, ул. Ротшильд 29, 5938109',
};

// decided at build time: the brand that is not shown is left out of the site's code entirely
// __BRAND__ is VITE_BRAND turned into a constant at build time (vite.config.ts); empty — DEFAULT_BRAND
export const BRAND: BrandId = (__BRAND__ || DEFAULT_BRAND) === 'atlantis' ? 'atlantis' : 'demo';
const b: Brand = BRAND === 'atlantis' ? ATLANTIS_BRAND : DEMO_BRAND;

export const AGENCY = b.agency;
export const AGENCY_LOGO = b.logo;
/** the same logo, all white on transparent: for dark backgrounds (the header bar, the footer) */
export const AGENCY_LOGO_WHITE = b.logoWhite;
export const PHONE_DISPLAY = b.phoneDisplay;
export const PHONE_TEL = b.phoneTel;
export const WHATSAPP_URL = b.whatsapp;
export const EMAIL = b.email;
export const MAILTO = 'mailto:' + EMAIL;
export const ADDRESS = b.address;
/** the agency's licence number (Ministry of Tourism); empty until the agency gives it — launch checklist */
export const AGENCY_LICENSE = '';
export const SITE_NAME = 'Санатории Литвы';
export const SITE_URL = 'https://shalom.bookingrobot.eu';
