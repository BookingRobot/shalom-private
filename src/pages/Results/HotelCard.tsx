import { Link } from 'react-router-dom';
import { NextTip } from '../../components/NextTip';
import { PriceBox } from '../../components/PriceBox';
import { RoomCard } from '../../components/RoomCard';
import { TeamHeads } from '../../components/TeamHeads';
import type { HotelVM } from './resultsTypes';
import './HotelCard.css';
import { sanatoriumPath } from '../../lib/seo';
import { track } from '../../lib/analytics';

/**
 * The rooms of a sanatorium slide out (CSS .rooms-reveal); the page follows them a little so
 * the guest sees them open: the start of the rooms comes up to about a third of the screen.
 */
function revealRooms(id: string) {
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const box = document.querySelector('#h-' + id + ' .rooms-reveal');
      if (!box) return;
      const top = box.getBoundingClientRect().top;
      const want = window.innerHeight * 0.38;
      const by = top > want ? Math.min(top - want, window.innerHeight * 0.5) : 0;
      // even when the rooms are already in view, move a little so the opening is noticed
      window.scrollBy({ top: by || 60, behavior: still ? 'auto' : 'smooth' });
    }),
  );
}

/**
 * One sanatorium on the list, short: photo, name and stars, the resort line, who meets the
 * guest, the price, «Номера и программы» and the compare tick. The facts, the procedures and
 * «Когда дешевле?» live on the sanatorium's own page; two cards fit a phone screen.
 */
export function HotelCard({
  h,
  nightsLabel,
  cmpLimit,
  onTipClose,
}: {
  h: HotelVM;
  nightsLabel: string;
  cmpLimit: number;
  onTipClose: () => void;
}) {
  const page = sanatoriumPath(h.id);
  return (
    <article
      className={'card hc' + (h.open ? ' hc-open' : '')}
      id={'h-' + h.id}
      data-canvas="results-card"
      style={{ ['--hc-border' as string]: h.border }}
    >
      <div className="hc-top">
        <Link to={page} className="hc-pic">
          <img src={h.img} alt={h.name} />
        </Link>
        <div className="hc-body">
          <div className="hc-name">
            <h2>
              <Link to={page}>{h.name}</Link>
            </h2>
            <span className="hc-stars">{h.stars}</span>
          </div>
          <div className="hc-sub">{h.sub}</div>
          {h.team.length ? (
            <div className="res-team">
              <TeamHeads roles={h.team} size={46} />
            </div>
          ) : null}
          <div className="hc-links">
            <Link to={page}>
              <span className="hc-long">Подробнее о санатории →</span>
              <span className="hc-short">О санатории</span>
            </Link>
            <button type="button" className="linkbtn hc-cal" onClick={h.openCal}>
              Когда дешевле?
            </button>
            <label className="cmp-check">
              <input type="checkbox" checked={!!h.cmpOn} disabled={h.cmpOff} onChange={h.cmpToggle} />
              {h.cmpOff ? 'Сравнить (не больше ' + cmpLimit + ')' : 'Сравнить'}
            </label>
          </div>
        </div>
        <div className="hc-buy">
          <PriceBox forTwo={h.price} nightsLabel={nightsLabel} hotelId={h.id} />
          {h.tipOn ? (
            <NextTip onClose={onTipClose} className="rm-tip">
              Следующий шаг: <strong>посмотрите номера</strong>
            </NextTip>
          ) : null}
          <button
            type="button"
            className={'btn hc-rooms ' + (h.btnCls ?? '')}
            onClick={() => {
              if (!h.open || h.closing) {
                revealRooms(h.id);
                track('Rooms opened', { sanatorium: h.id });
              }
              h.toggle();
            }}
            aria-expanded={h.open}
          >
            {h.btnLabel}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="hc-chev"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      {h.open ? (
        <div className={'rooms-reveal' + (h.closing ? ' closing' : '')} data-canvas="results-rooms">
          <div className="rooms-reveal-in">
            <div className="rooms-indent">
              {/* rooms of this sanatorium: indented with a guide line so the next sanatorium is not mistaken for a room */}
              <span aria-hidden="true" className="rooms-guide" />
              <div className="rooms-cap">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 4v9a4 4 0 0 0 4 4h10M15 13l4 4-4 4" />
                </svg>
                Номера · {h.name}
              </div>
              {h.offers.map((o) => (
                <RoomCard o={o} nightsLabel={nightsLabel} key={o.id || o.room} />
              ))}
              <div className="rooms-note">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  Процедуры подбирает врач после консультации. Специализации, время заезда и трансфер —{' '}
                  <Link to={page}>на странице санатория</Link>.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
