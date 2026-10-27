import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PHONE_DISPLAY, SITE_NAME } from '../../data/contacts';

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

/** Dark footer used on search and booking pages. */
export function SiteFooter({
  padding = '28px 24px',
  pinned = true,
  info = footerInfo(),
  right = <FooterLinks />,
}: {
  padding?: string;
  /** push to the bottom of short pages */
  pinned?: boolean;
  info?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <footer style={{ background: '#1C2620', color: '#D9E2DC', ...(pinned ? { marginTop: 'auto' } : null) }}>
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
        {right}
      </div>
    </footer>
  );
}
