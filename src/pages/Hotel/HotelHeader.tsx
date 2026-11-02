import { Link } from 'react-router-dom';
import type { HotelInfo } from '../../data/hotelInfo';
import { pick as pickIcon } from '../../components/hotel/illustrations';
import { HotelIcon } from './hotelIcons';

/** Breadcrumb, name with stars, address and the «К результатам» link. */
export function HotelHeader({ info, onReviews }: { info: HotelInfo; onReviews: () => void }) {
  return (
    <>
      <div className="hh-crumbs">
        <Link to="/">Санатории</Link> → <Link to={info.resortLink}>{info.resort}</Link> → {info.short}
      </div>
      <div className="hh-top" data-canvas="hotel-hero">
        <div className="hh-title">
          <div className="hh-name">
            <h1>{info.name}</h1>
            <span className="hh-stars" aria-label={info.starsN + ' звезды'}>
              {'★'.repeat(info.starsN)}
            </span>
          </div>
          <div className="fact">
            <HotelIcon d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            {info.resort} · {info.address} ·{' '}
            <button type="button" className="ht-reviews-link" onClick={onReviews}>
              {info.reviewsN} отзывов
            </button>
          </div>
        </div>
        <Link className="btn btn-secondary hh-back" to="/results">
          ← К результатам
        </Link>
      </div>
    </>
  );
}

/** Key facts strip: four things worth knowing at a glance (item 15: facts live on this page). */
export function HotelFactsStrip({ strip }: { strip: string[] }) {
  return (
    <div className="hh-strip" id="facts" data-canvas="hotel-facts">
      {strip.map((x) => (
        <div className="strip" key={x}>
          <span className="hh-strip-ico">{pickIcon(x)}</span>
          {x}
        </div>
      ))}
    </div>
  );
}
