import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ADDRESS, AGENCY, AGENCY_LOGO, EMAIL, MAILTO, PHONE_DISPLAY, PHONE_TEL, SITE_NAME } from '../../data/contacts';
import { HelpStripBand, type HelpStripText } from './HelpStrip';
import './SiteFooter.css';

const linkStyle = { color: '#D9E2DC', textDecoration: 'none' };

/** Default right-hand links: how to pay, cancellation terms. */
export const FooterLinks = () => (
  <div style={{ display: 'flex', gap: '24px' }}>
    <Link to="/rules#pay" style={linkStyle}>
      Как оплатить
    </Link>
    <Link to="/rules#cancel" style={linkStyle}>
      Условия отмены
    </Link>
  </div>
);

export const footerInfo = (allDay = true) =>
  `${SITE_NAME} · консультация на русском${allDay ? ' 24/7' : ''} · ${PHONE_DISPLAY}`;

/** Who sells and answers: the agency's logo on a light plate, its address, phone and e-mail. */
export function AgencyBlock({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className={'ft-agency' + (tone === 'light' ? ' light' : '')}>
      <span className="ft-agency-logo">
        <img src={AGENCY_LOGO} alt={AGENCY} width="148" height="33" />
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

/** Dark footer used on search and booking pages, with the «Поможем выбрать» band above it. */
export function SiteFooter({
  padding = '28px 24px',
  pinned = true,
  info,
  right = <FooterLinks />,
  help,
}: {
  padding?: string;
  /** push to the bottom of short pages */
  pinned?: boolean;
  info?: ReactNode;
  right?: ReactNode;
  /** title and line of the help band */
  help?: HelpStripText;
}) {
  return (
    <>
      <HelpStripBand text={help} pinned={pinned} />
      <footer style={{ background: '#1C2620', color: '#D9E2DC' }}>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding,
            display: 'flex',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '16px',
          }}
        >
          {info === undefined ? <AgencyBlock /> : <div>{info}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {right}
            <FooterSlot />
          </div>
        </div>
      </footer>
    </>
  );
}
