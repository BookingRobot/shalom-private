import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NextTip } from './NextTip';
import { IconPath } from './icons';
import { RoomGallery } from './RoomGallery';
import { RoomDetails } from './RoomDetails';
import type { RoomPhoto } from '../data/roomPhotos';
import { PriceBox } from './PriceBox';
import './RoomCard.css';

/** an icon + label pair (amenity, programme item) */
export interface IconText {
  d: string;
  t: string;
}
/** a programme of the room in the details: the radio row */
export interface ProgRow {
  name: string;
  sub: string;
  price: string;
  diff: string;
  diffColor: string;
  border: string;
  bg: string;
  dot: string;
  pick: () => void;
}
/** «что вы получаете»: big number + label + note */
export interface ValueTile {
  d: string;
  big: string;
  label: string;
  sub: string;
}
/** one line of the programme text with its weight and indent */
export interface DetLine {
  t: string;
  fw: number;
  pl: string;
  mt: string;
}

/** The room offer as the page builds it (see hotelsVals / the sanatorium page). */
export interface RoomOfferVM {
  n?: number;
  id?: string;
  room: string;
  short?: string;
  img: string;
  photos?: RoomPhoto[];
  price: string | number;
  old?: string;
  sub?: string;
  roomLine?: string;
  progLine?: string;
  pill?: string;
  pillBg?: string;
  pillColor?: string;
  nameColor?: string;
  cardBorder?: string;
  cardBg?: string;
  imgFilter?: string;
  busy?: boolean;
  avail?: boolean;
  busyRange?: string;
  nextFree?: string;
  amen?: IconText[];
  amenTop?: IconText[];
  roomText?: string;
  prog?: IconText[];
  progRows?: ProgRow[];
  value?: ValueTile[];
  detLines?: DetLine[];
  selName?: string;
  selPrice?: string;
  addLabel?: string;
  detBtn?: string;
  detChev?: string;
  detOpen?: boolean;
  detLabel?: string;
  toggleDet?: () => void;
  choose?: () => void;
  openRoomCal?: () => void;
  /** set by tipCheapest */
  cheapest?: boolean;
  tip?: boolean;
  tipClose?: () => void;
}

/** What every programme in a room offer includes — shown as one compact row of icon + label. */
const ROOM_INCL: IconText[] = [
  {
    t: 'Консультация врача',
    d: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4',
  },
  { t: 'Питание 3 раза в день', d: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8' },
  {
    t: 'Бассейн и сауны',
    d: 'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6',
  },
  {
    t: 'Процедуры ежедневно',
    d: 'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0',
  },
];

/**
 * Marks the cheapest free room of a list (`cheapest`) and, when `on`, gives it the
 * «Следующий шаг: выберите номер» bubble (`tip`).
 */
export function tipCheapest<T extends { avail?: boolean; price: string | number }>(
  offers: T[],
  on: boolean,
  close: () => void,
): (T & { cheapest: boolean; tip: boolean; tipClose: () => void })[] {
  let best = -1,
    min = Infinity;
  offers.forEach((o, i) => {
    const p = Number(String(o.price).replace(/\s/g, ''));
    if (o.avail && p < min) {
      min = p;
      best = i;
    }
  });
  return offers.map((o, i) => ({ ...o, cheapest: i === best, tip: on && i === best, tipClose: close }));
}

const CAL_ICON = 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18';

/**
 * Room offer card (sanatorium page and search results): photo, room facts,
 * price for the stay or "busy on your dates", programmes for this room.
 * `o` is the view-model built by the page (see roomsOf / offers in page logic).
 */
export function RoomCard({ o, nightsLabel }: { o: RoomOfferVM; nightsLabel: string }) {
  // all photos of the room (the card shows the first); a tap opens the mini gallery
  const photos: RoomPhoto[] = o.photos && o.photos.length ? o.photos : [{ src: o.img, alt: o.room || o.short || '' }];
  const [gal, setGal] = useState(false);
  const look = {
    ['--rc-border' as string]: o.cardBorder,
    ['--rc-bg' as string]: o.cardBg,
    ['--rc-filter' as string]: o.imgFilter,
    ['--rc-pill-bg' as string]: o.pillBg,
    ['--rc-pill-color' as string]: o.pillColor,
    ['--rc-name' as string]: o.nameColor,
  };
  return (
    <article className={'card rc' + (o.busy ? ' rc-busy' : '')} style={look} data-canvas="room-card">
      <div className="rc-top">
        <div className="rc-pic">
          <img src={o.img} alt={o.room} />
          {o.busy ? <span className="rc-busy-tag">Занят на ваши даты</span> : null}
          <button
            type="button"
            className="rc-photo"
            onClick={() => setGal(true)}
            aria-label={
              'Смотреть фото номера: ' + (o.short || o.room) + (photos.length > 1 ? ', ' + photos.length + ' фото' : '')
            }
          />
          <span className="rc-count" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {photos.length > 1 ? photos.length + ' фото' : 'Фото номера'}
          </span>
        </div>
        <div className="rc-body">
          <span className="pill rc-pill">{o.pill}</span>
          <h3 className="rc-name">{o.short}</h3>
          <div className="rc-line">{o.roomLine}</div>
          <div className="rc-line rc-line-tight">{o.progLine}</div>
          <ul className="room-incl" aria-label="Входит в программу">
            {ROOM_INCL.map((it) => (
              <li key={it.t}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <IconPath d={it.d} />
                </svg>
                {it.t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rc-buy">
          {o.avail ? (
            <>
              <PriceBox forTwo={o.price} nightsLabel={nightsLabel} />
              {o.tip ? (
                <NextTip onClose={o.tipClose}>
                  Следующий шаг: <strong>выберите номер</strong>
                </NextTip>
              ) : null}
              <Link
                className={'btn btn-primary rc-choose' + (o.tip ? ' next-pulse' : '')}
                to="/rooms"
                onClick={o.choose}
                data-cheapest={o.cheapest ? '1' : undefined}
              >
                Выбрать номер
              </Link>
            </>
          ) : null}
          {o.busy ? (
            <>
              <span className="rc-busy-t">Занят на {o.busyRange}</span>
              <span className="rc-busy-s">
                Свободен: <strong>{o.nextFree}</strong>
              </span>
              <button type="button" className="btn btn-secondary rc-dates" onClick={o.openRoomCal}>
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
                  <path d={CAL_ICON} />
                </svg>
                Выбрать другие даты
              </button>
            </>
          ) : null}
        </div>
      </div>
      <button type="button" className="rc-det-btn" onClick={o.toggleDet} aria-expanded={!!o.detOpen}>
        <span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
          </svg>
          {o.detBtn}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={'rc-chev' + (o.detOpen ? ' open' : '')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {o.detOpen ? <RoomDetails o={o} nightsLabel={nightsLabel} /> : null}
      {gal ? <RoomGallery title={o.short || o.room} photos={photos} onClose={() => setGal(false)} /> : null}
    </article>
  );
}
