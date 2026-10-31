import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DemoMark } from '../DemoMark';
import { useHelp } from '../../context/HelpContext';
import {
  ADDRESS,
  AGENCY_LICENSE,
  AGENCY,
  AGENCY_LOGO,
  AGENCY_LOGO_WHITE,
  EMAIL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
  SITE_NAME,
  WHATSAPP_URL,
} from '../../data/contacts';
import { HeadsetIcon, PhoneIcon } from '../icons';
import './SiteFooter.css';

/** the title and line of the «Поможем выбрать» block, when a page wants its own wording */
export interface HelpStripText {
  title?: string;
  sub?: string;
}

/** the agency's opening hours, shown next to the phone */
export const HOURS = 'Ежедневно с 9:00 до 20:00';

export const footerInfo = (allDay = true) =>
  `${SITE_NAME} · консультация на русском${allDay ? ' 24/7' : ''} · ${PHONE_DISPLAY}`;

/** Who sells and answers: the agency's logo, its address, phone and e-mail (kept for the light pages). */
export function AgencyBlock({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className={'ft-agency' + (tone === 'light' ? ' light' : '')}>
      <span className="ft-agency-logo">
        <img src={tone === 'light' ? AGENCY_LOGO : AGENCY_LOGO_WHITE} alt={AGENCY} width="160" height="36" />
      </span>
      <span className="ft-agency-t">
        <span>
          {SITE_NAME} · заказы оформляет туристическое агентство {AGENCY}
        </span>
        <span>{ADDRESS}</span>
        <span>
          <a href={PHONE_TEL} dir="ltr">
            {PHONE_DISPLAY}
          </a>{' '}
          · <a href={MAILTO}>{EMAIL}</a>
        </span>
      </span>
    </div>
  );
}

/** Where «Ваши пожелания» is placed (FeedbackWidget renders its button into it). */
export const FooterSlot = () => <div id="ftSlot" className="ft-slot" />;

const LINKS = [
  { to: '/rules', label: 'Условия' },
  { to: '/rules#pay', label: 'Как оплатить' },
  { to: '/rules#contact', label: 'Контакты' },
  { to: '/tickets', label: 'Прямые перелёты' },
  { to: '/privacy', label: 'Конфиденциальность' },
];

/**
 * The one footer of every page: the agency and how to reach it on the left, «Свяжитесь со мной»
 * on the right, the links in one row under them. It replaces the three blocks that used to end a
 * page (the green «Поможем выбрать» band, the dark agency footer and the links row): on a phone
 * «Далее» already sticks to the bottom, so the end of the page says the phone once.
 */
export function SiteFooter({
  pinned = true,
  help,
  maxWidth = 1180,
  right,
}: {
  /** push to the bottom of short pages */
  pinned?: boolean;
  /** title and line of the «Поможем выбрать» block */
  help?: HelpStripText;
  /** page content width when it differs from 1180px */
  maxWidth?: number;
  /** a small extra on the links row (e.g. a copyright) */
  right?: ReactNode;
  /** kept for older callers; the footer has one padding now */
  padding?: string;
  info?: ReactNode;
}) {
  const helpApi = useHelp();
  const title = help?.title || 'Поможем выбрать';
  const sub = help?.sub || 'Подскажем санаторий и программу, объясним условия — на русском языке';
  return (
    <footer className={'ft' + (pinned ? ' pinned' : '')} data-canvas="footer">
      <div className="ft-in" style={maxWidth !== 1180 ? { maxWidth: `${maxWidth}px` } : undefined}>
        <div className="ft-l">
          <img className="ft-logo" src={AGENCY_LOGO_WHITE} alt={AGENCY} width="160" height="36" />
          <span className="ft-who">
            {SITE_NAME} · заказы оформляет туристическое агентство {AGENCY}
          </span>
          <a className="ft-tel" href={PHONE_TEL} dir="ltr">
            <PhoneIcon size={20} color="currentColor" />
            {PHONE_DISPLAY}
          </a>
          <span className="ft-hours">{HOURS}</span>
          <span className="ft-contacts">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={MAILTO}>{EMAIL}</a>
          </span>
          <span className="ft-addr">
            {ADDRESS}
            {AGENCY_LICENSE ? ' · лицензия № ' + AGENCY_LICENSE : <DemoMark> · лицензия № [УТОЧНИТЬ]</DemoMark>}
          </span>
        </div>
        {/* «Поможем выбрать»: one button opens the support form (the canvas script finds .help-strip-band / .hs-btn) */}
        <div className="ft-r help-strip-band" data-canvas="footer-help">
          <HeadsetIcon size={36} color="var(--green-mid)" strokeWidth={1.8} />
          <div className="ft-help-t">
            <strong>{title}</strong>
            <span>{sub}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary hs-btn ft-help-btn"
            onClick={helpApi.open}
            aria-haspopup="dialog"
          >
            Свяжитесь со мной
          </button>
        </div>
      </div>
      <div className="ft-links-row" style={maxWidth !== 1180 ? { maxWidth: `${maxWidth}px` } : undefined}>
        <nav className="ft-links" aria-label="Ссылки внизу страницы">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="ft-right">
          {right}
          <FooterSlot />
        </span>
      </div>
    </footer>
  );
}
