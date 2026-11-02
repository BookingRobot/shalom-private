import { Link } from 'react-router-dom';
import { IconPath } from './icons';
import type { RoomOfferVM } from './RoomCard';

const PROC_ICON =
  'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0';

/**
 * The open part of a room card: the programmes for this room (cheapest first), what the
 * chosen programme gives in big numbers, its items, the room's amenities and the full text.
 */
export function RoomDetails({ o, nightsLabel }: { o: RoomOfferVM; nightsLabel: string }) {
  return (
    <div className="rd">
      {/* 0. Programmes available for this room (cheapest first) */}
      <div className="rd-sec">
        <div className="rd-cap">Программы для этого номера</div>
        {(o.progRows || []).map((pr) => (
          <button
            type="button"
            key={pr.name}
            onClick={pr.pick}
            className="rd-prog"
            style={{
              ['--rd-border' as string]: pr.border,
              ['--rd-bg' as string]: pr.bg,
              ['--rd-dot' as string]: pr.dot,
            }}
          >
            <span className="rd-radio">
              <span />
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
            >
              <path d={PROC_ICON} />
            </svg>
            <span className="rd-prog-t">
              <strong>{pr.name}</strong>
              <span>{pr.sub}</span>
            </span>
            <span className="rd-prog-p">
              <strong>{pr.price}</strong>
              <span style={{ color: pr.diffColor }}>{pr.diff}</span>
            </span>
          </button>
        ))}
      </div>
      {/* 1. Value at a glance: big numbers + icons */}
      <div className="rd-sec">
        <div className="rd-cap">
          {o.selName}: что вы получаете за {nightsLabel}
        </div>
        <div className="rd-tiles">
          {(o.value || []).map((v) => (
            <div className="rd-tile" key={v.label}>
              <div className="rd-tile-top">
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
                >
                  <IconPath d={v.d} />
                </svg>
                <span className="rd-big">{v.big}</span>
              </div>
              <strong>{v.label}</strong>
              <span>{v.sub}</span>
            </div>
          ))}
        </div>
      </div>
      {/* 2. Programme items + room amenities */}
      <div className="rd-cols">
        <div className="rd-col">
          <div className="rd-cap">В программу входит</div>
          <div className="rd-list">
            {(o.prog || []).map((p) => (
              <div className="fact rd-fact" key={p.t}>
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
            ))}
          </div>
        </div>
        <div className="rd-col">
          <div className="rd-cap">Номер</div>
          <div className="rd-amen">
            {(o.amen || []).map((a) => (
              <div className="fact rd-fact" key={a.t}>
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
            ))}
          </div>
          <p className="rd-text">{o.roomText}</p>
        </div>
      </div>
      <div className="rd-full">
        <div className="rd-cap">Подробно о программе</div>
        {(o.detLines || []).map((l, i) => (
          <div key={i} className="rd-line" style={{ fontWeight: l.fw, paddingLeft: l.pl, marginTop: l.mt }}>
            {l.t}
          </div>
        ))}
      </div>
      <div className="rd-go">
        <Link className="btn btn-primary" to="/rooms" onClick={o.choose}>
          Выбрать: {o.selName} · {o.selPrice}
        </Link>
      </div>
    </div>
  );
}
