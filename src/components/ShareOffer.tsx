import { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { orderSummary } from '../lib/orderSummary';
import { offerLink } from '../lib/share';
import { track } from '../lib/analytics';
import './ShareOffer.css';

/**
 * "Посоветоваться с семьёй": send the offer (sanatorium, dates, guests, price, link)
 * to WhatsApp or copy it, and ask to be told if the price changes.
 * The most common reasons not to book were "подумаю" and "посоветуюсь с женой".
 */
export function ShareOffer({ hotelName = 'Санаторий Эгле Комфорт, Друскининкай' }: { hotelName?: string }) {
  const { booking, draftCode, ensureDraft } = useBooking();
  const [open, setOpen] = useState<'' | 'share' | 'alert'>('');
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState('');
  const [agree, setAgree] = useState(false);
  const [sent, setSent] = useState(false);
  const o = orderSummary(booking);
  // the link opens the same draft on any phone once the order has a code
  const link = offerLink(booking, '/rooms', draftCode);
  const openShare = () => {
    setOpen(open === 'share' ? '' : 'share');
    if (open !== 'share') track('Share offer');
    if (!draftCode)
      ensureDraft().catch(() => {
        /* no server: the link carries the choices themselves */
      });
  };
  const text =
    `${hotelName}\n${o.dates} · ${o.guests}\nНомер: ${o.roomName.toLowerCase()}, программа ${o.programName} (${o.programPerDay})\n` +
    `${o.placeLabel} ${o.placeNote}` +
    (o.flightPackage ? ', с перелётом и трансфером' : '') +
    `\nИтого ${o.party}: ${o.totalLabel}\n${link}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="share">
      <div className="share-btns">
        <button
          type="button"
          className={`btn btn-secondary share-btn ${open === 'share' ? 'on' : ''}`}
          aria-expanded={open === 'share'}
          onClick={openShare}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Отправить предложение семье
        </button>
        <button
          type="button"
          className={`btn btn-secondary share-btn ${open === 'alert' ? 'on' : ''}`}
          aria-expanded={open === 'alert'}
          onClick={() => setOpen(open === 'alert' ? '' : 'alert')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" />
          </svg>
          Сообщить, если цена изменится
        </button>
      </div>
      {open === 'share' ? (
        <div className="share-panel">
          <span className="share-hint">Ссылка откроет этот же вариант: санаторий, номер, даты, гостей и цену.</span>
          <pre className="share-text">{text}</pre>
          <div className="share-btns">
            <a
              className="btn btn-primary share-btn"
              href={'https://wa.me/?text=' + encodeURIComponent(text)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Отправить в WhatsApp
            </a>
            <button type="button" className="btn btn-secondary share-btn" onClick={copy}>
              {copied ? '✓ Скопировано' : 'Скопировать текст и ссылку'}
            </button>
          </div>
        </div>
      ) : null}
      {open === 'alert' ? (
        <div className="share-panel">
          {sent ? (
            <span className="share-ok" role="status">
              ✓ Готово. Если цена на эти даты изменится, напишем на {contact}.
            </span>
          ) : (
            <form
              className="share-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (contact.trim() && agree) setSent(true); // [ДЕМО] здесь отправка подписки в BookingRobot
              }}
            >
              <label className="lbl" htmlFor="alertContact">
                Телефон (WhatsApp) или e-mail
              </label>
              <input
                id="alertContact"
                className="input share-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+972 … или имя@почта"
                autoComplete="email"
              />
              <label className="share-agree">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                Согласен(на) получить одно сообщение об изменении цены
              </label>
              <button type="submit" className="btn btn-primary share-btn" disabled={!contact.trim() || !agree}>
                Сообщить мне
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
