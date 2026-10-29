import { Link } from 'react-router-dom';
import { useHelp } from '../../context/HelpContext';
import { PHONE_DISPLAY, PHONE_TEL } from '../../data/contacts';
import { HeadsetIcon, PhoneIcon } from '../icons';
import './HelpStrip.css';

export interface HelpStripText {
  title?: string;
  sub?: string;
}

/**
 * «Поможем выбрать» band at the bottom of every page: what we help with, the phone and
 * «Свяжитесь со мной» (the support form). Replaces the floating button.
 */
export function HelpStrip({
  title = 'Поможем выбрать',
  sub = 'Подскажем санаторий и программу, объясним условия — на русском языке',
}: HelpStripText) {
  const help = useHelp();
  return (
    <section className="help-strip" aria-label="Помощь консультанта">
      <div className="hs-part hs-what">
        <HeadsetIcon size={40} color="#1F5F4A" strokeWidth={1.8} />
        <div className="hs-txt">
          <strong className="hs-title">{title}</strong>
          <span>{sub}</span>
        </div>
      </div>
      <div className="hs-part hs-phone">
        <PhoneIcon size={24} color="#1F5F4A" />
        <div className="hs-txt">
          <a href={PHONE_TEL} dir="ltr" className="hs-tel">
            {PHONE_DISPLAY}
          </a>
          <span>
            Ежедневно с 9:00 до 20:00 · <Link to="/rules">Условия оплаты и отмены</Link>
          </span>
        </div>
      </div>
      <button type="button" className="btn btn-primary hs-btn" onClick={help.open} aria-haspopup="dialog">
        <HeadsetIcon size={20} color="#fff" strokeWidth={2} />
        Свяжитесь со мной
      </button>
    </section>
  );
}

/** The band with the page's side padding, placed right above the footer. */
export function HelpStripBand({
  text,
  pinned = true,
  maxWidth,
}: {
  text?: HelpStripText;
  pinned?: boolean;
  /** page content width when it differs from 1180px */
  maxWidth?: number;
}) {
  return (
    <div
      className="help-strip-band"
      style={{ ...(pinned ? { marginTop: 'auto' } : null), ...(maxWidth ? { maxWidth: `${maxWidth}px` } : null) }}
    >
      <HelpStrip {...text} />
    </div>
  );
}
