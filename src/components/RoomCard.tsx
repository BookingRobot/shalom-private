import { Fragment } from 'react';
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
export function RoomCard({ o, nightsLabel }: { o: any; nightsLabel: string }) {
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
            borderRadius: '2px',
            overflow: 'hidden',
            background: '#2B3A33',
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
                  background: '#5E6862',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '800',
                  padding: '5px 10px',
                  borderRadius: '2px',
                }}
              >
                Занят на ваши даты
              </span>
            </>
          ) : null}{' '}
          <span
            style={{
              position: 'absolute',
              left: '10px',
              bottom: '10px',
              background: 'rgba(28,38,32,.8)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              padding: '5px 9px',
              borderRadius: '2px',
            }}
          >
            Фото номера
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
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>{o.roomLine}</div>
          <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>{o.progLine}</div>
          <ul className="room-incl" aria-label="Входит в программу">
            {ROOM_INCL.map((it) => (
              <li key={it.t}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={it.d} />
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
            borderLeft: '1px solid #E3DED2',
            justifyContent: 'center',
          }}
        >
          {o.avail ? (
            <>
              <PriceBox forTwo={o.price} nightsLabel={nightsLabel} />
              <Link
                className="btn btn-primary"
                to="/rooms"
                onClick={o.choose}
                style={{ minHeight: '48px', fontSize: '16px', marginTop: '12px' }}
              >
                Выбрать номер
              </Link>
            </>
          ) : null}
          {o.busy ? (
            <>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#3E4B44', lineHeight: '1.25' }}>
                Занят на {o.busyRange}
              </span>
              <span style={{ fontSize: '15px', color: '#3E4B44', marginTop: '4px' }}>
                Свободен: <strong style={{ color: '#1C2620' }}>{o.nextFree}</strong>
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
          borderTop: '1px solid #E3DED2',
          background: '#FAFBF9',
          padding: '12px 18px',
          minHeight: '48px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '15px',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1F5F4A"
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
          stroke="#1F5F4A"
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
              borderTop: '1px solid #E3DED2',
              background: '#FAFBF9',
            }}
          >
            {/* 0. Programmes available for this room (cheapest first) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#5E6862',
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
                      borderRadius: '2px',
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
                        background: '#fff',
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: pr.dot }} />
                    </span>
                    <svg
                      width="28"
                      height="28"
                      viewBox="-1 -1 26 26"
                      fill="none"
                      stroke="#1F5F4A"
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
                      <span style={{ fontSize: '14px', color: '#3E4B44' }}>{pr.sub}</span>
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
                      <span style={{ fontSize: '14px', color: pr.diffColor, whiteSpace: 'nowrap' }}>{pr.diff}</span>
                    </span>
                  </button>
                </Fragment>
              ))}
            </div>
            {/* 1. Value at a glance: big numbers + icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#5E6862',
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
                        background: '#EEF5F1',
                        border: '1px solid #C8DED3',
                        borderRadius: '2px',
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
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d={v.d} />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Lora,Georgia,serif',
                            fontSize: '32px',
                            fontWeight: '700',
                            lineHeight: '1',
                            color: '#1F5F4A',
                          }}
                        >
                          {v.big}
                        </span>
                      </div>
                      <strong style={{ fontSize: '16px', lineHeight: '1.2', color: '#1C2620' }}>{v.label}</strong>
                      <span style={{ fontSize: '14px', lineHeight: '1.3', color: '#3E4B44' }}>{v.sub}</span>
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
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#5E6862',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  В программу входит
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(o.prog || []).map((p: any, _i1: number) => (
                    <Fragment key={_i1}>
                      <div className="fact" style={{ color: '#1C2620', fontSize: '16px' }}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={p.d} />
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
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#5E6862',
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
                      <div className="fact" style={{ color: '#1C2620' }}>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3E4B44"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={a.d} />
                        </svg>
                        {a.t}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <p style={{ margin: '0', fontSize: '14px', color: '#3E4B44' }}>{o.roomText}</p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                background: '#FAF8F3',
                borderRadius: '2px',
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#5E6862',
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
                      fontSize: '15px',
                      lineHeight: '1.45',
                      color: '#1C2620',
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
    </article>
  );
}
