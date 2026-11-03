import { useEffect, useRef } from 'react';
import { FeedbackWidget } from './feedback/FeedbackWidget';
import { useHelp } from '../context/HelpContext';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../data/contacts';
import { addD, iso, shortDate, toD } from '../lib/dates';
import { PhoneCodeSelect } from './PhoneCodeSelect';
import { CheckIcon, CloseIcon, HeadsetIcon } from './icons';
import './HelpWidget.css';

/** What the current page already knows about the guest's plans (sent along with the request). */
export interface HelpContextInfo {
  /** sanatorium the guest is looking at, e.g. "Санаторий Эгле Комфорт, Друскининкай" */
  hotel?: string;
  /** resort key when no specific sanatorium is chosen yet (kept for callers) */
  dest?: string;
  in?: string;
  out?: string;
  /** distance of the sticky button from the bottom edge (pages with a sticky bottom bar move it up) */
  bottom?: string;
}

interface Props {
  ctx: HelpContextInfo;
  /** page state: dates the guest picked on this page override the defaults */
  pageState?: { in?: string; out?: string; checkin?: string; nights?: number };
}

/** resort keys of HelpContextInfo.dest */
const DEST_NAMES: Record<string, string> = {
  druskininkai: 'Друскининкай',
  birstonas: 'Бирштонас',
  palanga: 'Паланга',
  anyksciai: 'Аникщяй',
};

/** «9–18 ноября» or «28 ноября – 5 декабря»; empty when a date is missing or broken. */
function stayText(a: string, b: string): string {
  if (!a || !b) return '';
  const d1 = toD(a);
  const d2 = toD(b);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';
  return d1.getUTCMonth() === d2.getUTCMonth()
    ? `${d1.getUTCDate()}–${shortDate(d2)}`
    : `${shortDate(d1)} – ${shortDate(d2)}`;
}

/**
 * The «Свяжитесь со мной» support pop-up (opened from the help band above the footer and from
 * page buttons). Four fields only: name, phone, e-mail (optional), question. What the page already
 * knows (sanatorium or resort, dates) goes with the request and is shown as one quiet line.
 */
export function HelpWidget({ ctx, pageState = {} }: Props) {
  const { status, close, send } = useHelp();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const helpIn = pageState.in || pageState.checkin || ctx.in || '';
  let helpOut = pageState.out || ctx.out || '';
  if (!pageState.out && pageState.checkin) helpOut = iso(addD(toD(pageState.checkin), pageState.nights || 9));
  const stay = stayText(helpIn, helpOut);
  const place = ctx.hotel || (ctx.dest ? DEST_NAMES[ctx.dest] : '') || '';
  const known = [place, stay].filter(Boolean).join(', ');

  // keyboard: focus moves into the window when it opens, Esc closes, focus returns to the opener
  useEffect(() => {
    if (status === 'closed') {
      openerRef.current?.focus({ preventScroll: true });
      openerRef.current = null;
      return;
    }
    if (!openerRef.current && document.activeElement instanceof HTMLElement) openerRef.current = document.activeElement;
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, close]);

  return (
    <>
      {/* «Ваши пожелания»: its button is placed in the page footer */}
      <FeedbackWidget bottom={ctx.bottom || '20px'} />

      {status !== 'closed' && (
        <div
          className="hw-overlay"
          dir="ltr"
          lang="ru"
          data-canvas="help-form"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div
            ref={dialogRef}
            className="hw-dialog"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="helpTitle"
          >
            <div className="hw-head">
              <div className="hw-head-main">
                <span className="hw-head-icon" aria-hidden="true">
                  <HeadsetIcon size={28} color="var(--green)" strokeWidth={1.8} />
                </span>
                <div>
                  <h2 id="helpTitle" className="hw-title">
                    Свяжитесь со мной
                  </h2>
                  <p className="hw-sub">Ответим на русском в течение 2 часов, ежедневно 9:00–20:00</p>
                </div>
              </div>
              <button type="button" className="hw-close" onClick={close} aria-label="Закрыть">
                <CloseIcon size={22} />
              </button>
            </div>

            {status === 'form' && (
              <div className="hw-direct">
                <span className="hw-direct-label">Можно сразу:</span>
                <a className="hw-link" href={WHATSAPP_URL}>
                  WhatsApp
                </a>
                <a className="hw-link" href={PHONE_TEL} dir="ltr">
                  {PHONE_DISPLAY}
                </a>
              </div>
            )}

            {status === 'form' && (
              <div className="hw-form">
                <div className="hw-two">
                  <label className="hw-field">
                    <span className="hw-label">Имя</span>
                    <input type="text" className="hw-input" placeholder="Например: Михаил" autoComplete="name" />
                  </label>
                  <label className="hw-field">
                    <span className="hw-label">Телефон</span>
                    <span className="hw-phone">
                      <PhoneCodeSelect className="hw-input hw-code" />
                      <input
                        type="tel"
                        className="hw-input"
                        inputMode="numeric"
                        placeholder="50 123 4567"
                        autoComplete="tel-national"
                      />
                    </span>
                  </label>
                </div>

                <label className="hw-field">
                  <span className="hw-label">
                    E-mail <span className="hw-opt">не обязательно</span>
                  </span>
                  <input type="email" className="hw-input" placeholder="name@gmail.com" autoComplete="email" />
                </label>

                <label className="hw-field">
                  <span className="hw-label">Ваш вопрос</span>
                  <textarea
                    rows={3}
                    className="hw-input hw-textarea"
                    placeholder="Например: какой санаторий лучше для суставов? Можно ли приехать с внуком?"
                  />
                </label>
                {known && (
                  <p className="hw-known">
                    <CheckIcon size={18} color="var(--green)" strokeWidth={2.5} />
                    <span>К заявке приложим ваш поиск: {known}</span>
                  </p>
                )}

                <div className="hw-foot">
                  <p className="hw-note">Нужно указать имя и телефон. Используем их только для ответа.</p>
                  <button type="button" className="hw-send" onClick={send}>
                    Отправить
                  </button>
                </div>
              </div>
            )}

            {status === 'sent' && (
              <div className="hw-sent">
                <span className="hw-sent-icon">
                  <CheckIcon size={34} color="var(--paper)" strokeWidth={2.6} />
                </span>
                <strong className="hw-sent-title">Спасибо! Мы скоро свяжемся с вами</strong>
                <p className="hw-sent-text">
                  Консультант ответит в течение 2 часов в рабочее время. Ваш поиск и выбор на этой странице сохранены.
                </p>
                <button type="button" className="hw-back" onClick={close}>
                  Вернуться
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
