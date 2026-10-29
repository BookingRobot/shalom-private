import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PHONE_DISPLAY, SITE_NAME } from '../../data/contacts';
import { HelpStripBand, type HelpStripText } from './HelpStrip';

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
  `${SITE_NAME} · консультация на русском${allDay ? ' 24/7' : ''} · WhatsApp ${PHONE_DISPLAY}`;

/** Where «Ваши пожелания» is placed (FeedbackWidget renders its button into it). */
export const FooterSlot = () => <div id="ftSlot" className="ft-slot" />;

/** Dark footer used on search and booking pages, with the «Поможем выбрать» band above it. */
export function SiteFooter({
  padding = '28px 24px',
  pinned = true,
  info = footerInfo(),
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
          <div>{info}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {right}
            <FooterSlot />
          </div>
        </div>
      </footer>
    </>
  );
}
