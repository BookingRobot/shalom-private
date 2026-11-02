import { Link } from 'react-router-dom';
import { HeadsetIcon, IconPath, VanIcon } from '../../components/icons';
import { CAR_ICON } from '../../data/filters';
import './SoldOutList.css';
import type { ResultsVals } from './resultsTypes';
import { sanatoriumPath } from '../../lib/seo';

/** Sanatoriums with no availability on the chosen dates: viewable, not bookable. */
export function SoldOutList({ v }: { v: ResultsVals }) {
  return (
    <section className="so" data-canvas="results-soldout">
      <div className="so-head">
        <h2 id="sold">Нет свободных мест на ваши даты · {v.soldCount}</h2>
        <span>На {v.dateRange} эти санатории заняты. Описание можно посмотреть, а забронировать — на другие даты.</span>
      </div>
      {v.soldHotels.map((u) => (
        <article className="so-card" key={u.id}>
          <Link to={sanatoriumPath(u.id)} className="so-pic">
            <img src={u.img} alt={u.name} />
            <span className="so-tag">Нет мест</span>
          </Link>
          <div className="so-body">
            <div className="so-name">
              <h3>
                <Link to={sanatoriumPath(u.id)}>{u.name}</Link>
              </h3>
              <span className="so-stars">{u.stars}</span>
            </div>
            <span className="so-sub">{u.sub}</span>
            <div className="so-chips">
              {u.chips.map((c) => (
                <span className="fact so-fact" key={c.t}>
                  {c.d === CAR_ICON ? (
                    <VanIcon height={18} />
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--muted-2)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <IconPath d={c.d} />
                    </svg>
                  )}
                  {c.t}
                </span>
              ))}
            </div>
            <span className="so-next">
              Ближайшие свободные даты: <strong>{u.next}</strong>
            </span>
          </div>
          <div className="so-buy">
            <Link className="btn btn-secondary so-view" to={sanatoriumPath(u.id)}>
              Посмотреть санаторий
            </Link>
            <button type="button" className="btn btn-primary so-call" onClick={u.notify}>
              <HeadsetIcon size={20} />
              Свяжитесь со мной
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
