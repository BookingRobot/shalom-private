import { NextTip } from './NextTip';
import { IconPath } from './icons';
import { Fragment, useState } from 'react';
import { RoomGallery } from './RoomGallery';
import type { RoomPhoto } from '../data/roomPhotos';
import { Link } from 'react-router-dom';
import { PriceBox } from './PriceBox';

/** What every programme in a room offer includes — shown as one compact row of icon + label. */
const ROOM_INCL = [
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
 * Room offer card (sanatorium page and search results): photo, room facts,
 * price for the stay or "busy on your dates", programmes for this room.
 * `o` is the view-model built by the page (see roomsOf / offers in page logic).
 */
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

export function RoomCard({ o, nightsLabel }: { o: any; nightsLabel: string }) {
  // all photos of the room (the card shows the first); a tap opens the mini gallery
  const photos: RoomPhoto[] = o.photos && o.photos.length ? o.photos : [{ src: o.img, alt: o.room || o.short }];
  const [gal, setGal] = useState(false);
  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: o.cardBorder,
        background: o.cardBg,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div
          style={{
            position: 'relative',
            flex: '0 0 240px',
            width: '240px',
            maxWidth: 'calc(100% - 28px)',
            height: '200px',
            alignSelf: 'flex-start',
            margin: '14px 0 14px 14px',
            borderRadius: 'var(--r-field)',
            overflow: 'hidden',
            background: 'var(--ink)',
          }}
        >
          <img
            src={o.img}
            alt={o.room}
            style={{
              position: 'absolute',
              inset: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: o.imgFilter,
            }}
          />{' '}
          {o.busy ? (
            <>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '10px',
                  background: 'var(--muted)',
                  color: 'var(--paper)',
                  fontSize: '16px',
                  fontWeight: '800',
                  padding: '5px 10px',
                  borderRadius: 'var(--r-field)',
                }}
              >
                Занят на ваши даты
              </span>
            </>
          ) : null}{' '}
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
        <div
          style={{
            flex: '1 1 300px',
            minWidth: '0',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span className="pill" style={{ alignSelf: 'flex-start', background: o.pillBg, color: o.pillColor }}>
            {o.pill}
          </span>
          <h3 style={{ fontSize: '22px', color: o.nameColor }}>{o.short}</h3>
          <div style={{ fontSize: '16px', color: 'var(--ink-2)' }}>{o.roomLine}</div>
          <div style={{ fontSize: '16px', color: 'var(--ink-2)', marginTop: '-4px' }}>{o.progLine}</div>
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
        <div
          style={{
            flex: '0 0 240px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            borderLeft: '1px solid var(--line)',
            justifyContent: 'center',
          }}
        >
          {o.avail ? (
            <>
              <PriceBox forTwo={o.price} nightsLabel={nightsLabel} />
              {o.tip ? (
                <NextTip onClose={o.tipClose}>
                  Следующий шаг: <strong>выберите номер</strong>
                </NextTip>
              ) : null}
              <Link
                className={'btn btn-primary' + (o.tip ? ' next-pulse' : '')}
                to="/rooms"
                onClick={o.choose}
                data-cheapest={o.cheapest ? '1' : undefined}
                style={{ minHeight: '48px', fontSize: '16px', marginTop: o.tip ? '0' : '12px' }}
              >
                Выбрать номер
              </Link>
            </>
          ) : null}
          {o.busy ? (
            <>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-2)', lineHeight: '1.25' }}>
                Занят на {o.busyRange}
              </span>
              <span style={{ fontSize: '16px', color: 'var(--ink-2)', marginTop: '4px' }}>
                Свободен: <strong style={{ color: 'var(--ink)' }}>{o.nextFree}</strong>
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={o.openRoomCal}
                style={{ minHeight: '48px', fontSize: '16px', marginTop: '12px', padding: '0 14px' }}
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
                  <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                </svg>
                Выбрать другие даты
              </button>
            </>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={o.toggleDet}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          border: 'none',
          borderTop: '1px solid var(--line)',
          background: 'var(--sand)',
          padding: '12px 18px',
          minHeight: '48px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '16px',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            style={{ flex: 'none' }}
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
          style={{ transform: o.detChev }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {o.detOpen ? (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              padding: '18px 18px 18px',
              borderTop: '1px solid var(--line)',
              background: 'var(--sand)',
            }}
          >
            {/* 0. Programmes available for this room (cheapest first) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                Программы для этого номера
              </div>
              {(o.progRows || []).map((pr: any, _i1: number) => (
                <Fragment key={_i1}>
                  <button
                    type="button"
                    onClick={pr.pick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      minHeight: '64px',
                      padding: '10px 16px',
                      border: `2px solid ${pr.border ?? ''}`,
                      background: pr.bg,
                      borderRadius: 'var(--r-field)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${pr.border ?? ''}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none',
                        background: 'var(--paper)',
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: pr.dot }} />
                    </span>
                    <svg
                      width="28"
                      height="28"
                      viewBox="-1 -1 26 26"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flex: 'none' }}
                    >
                      <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                    </svg>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1',
                        minWidth: '0',
                        lineHeight: '1.25',
                      }}
                    >
                      <strong style={{ fontSize: '17px' }}>{pr.name}</strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>{pr.sub}</span>
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        lineHeight: '1.2',
                      }}
                    >
                      <strong style={{ fontSize: '18px', whiteSpace: 'nowrap' }}>{pr.price}</strong>
                      <span style={{ fontSize: '16px', color: pr.diffColor, whiteSpace: 'nowrap' }}>{pr.diff}</span>
                    </span>
                  </button>
                </Fragment>
              ))}
            </div>
            {/* 1. Value at a glance: big numbers + icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                {o.selName}: что вы получаете за {nightsLabel}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))',
                  gap: '10px',
                }}
              >
                {(o.value || []).map((v: any, _i1: number) => (
                  <Fragment key={_i1}>
                    <div
                      style={{
                        background: 'var(--green-soft)',
                        border: '1px solid var(--green-line)',
                        borderRadius: 'var(--r-field)',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minHeight: '118px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg
                          width="34"
                          height="34"
                          viewBox="-1 -1 26 26"
                          fill="none"
                          stroke="var(--green)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <IconPath d={v.d} />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Montserrat,Manrope,sans-serif',
                            fontSize: '32px',
                            fontWeight: '700',
                            lineHeight: '1',
                            color: 'var(--green)',
                          }}
                        >
                          {v.big}
                        </span>
                      </div>
                      <strong style={{ fontSize: '16px', lineHeight: '1.2', color: 'var(--ink)' }}>{v.label}</strong>
                      <span style={{ fontSize: '16px', lineHeight: '1.3', color: 'var(--ink-2)' }}>{v.sub}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            {/* 2. Programme items + room amenities */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 28px' }}>
              <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  В программу входит
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(o.prog || []).map((p: any, _i1: number) => (
                    <Fragment key={_i1}>
                      <div className="fact" style={{ color: 'var(--ink)', fontSize: '16px' }}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--green)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <IconPath d={p.d} />
                        </svg>
                        {p.t}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  Номер
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))',
                    gap: '8px 12px',
                  }}
                >
                  {(o.amen || []).map((a: any, _i1: number) => (
                    <Fragment key={_i1}>
                      <div className="fact" style={{ color: 'var(--ink)' }}>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--ink-2)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <IconPath d={a.d} />
                        </svg>
                        {a.t}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <p style={{ margin: '0', fontSize: '16px', color: 'var(--ink-2)' }}>{o.roomText}</p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                background: 'var(--sand)',
                borderRadius: 'var(--r-field)',
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  marginBottom: '4px',
                }}
              >
                Подробно о программе
              </div>
              {(o.detLines || []).map((l: any, _i1: number) => (
                <Fragment key={_i1}>
                  <div
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.45',
                      color: 'var(--ink)',
                      fontWeight: l.fw,
                      paddingLeft: l.pl,
                      marginTop: l.mt,
                    }}
                  >
                    {l.t}
                  </div>
                </Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link
                className="btn btn-primary"
                to="/rooms"
                onClick={o.choose}
                style={{ minHeight: '52px', fontSize: '17px' }}
              >
                Выбрать: {o.selName} · {o.selPrice}
              </Link>
            </div>
          </div>
        </>
      ) : null}
      {gal ? <RoomGallery title={o.short || o.room} photos={photos} onClose={() => setGal(false)} /> : null}
    </article>
  );
}
