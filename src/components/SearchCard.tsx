import { Link, useNavigate } from 'react-router-dom';
import { FlightToggle } from './FlightToggle';
import { GuestsPicker } from './GuestsPicker';
import { PlaceSearch } from './PlaceSearch';
import './SearchCard.css';

/**
 * The search card of the home page — resort or sanatorium, check-in, check-out, guests,
 * «Найти санаторий» and the plain «С перелётом из Тель-Авива» check box. The results page
 * shows the very same card above the list.
 */
export function SearchCard({
  inLabel,
  outLabel,
  onOpenCal,
  className,
}: {
  inLabel: string;
  outLabel: string;
  onOpenCal: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <form
      className={'card search' + (className ? ' ' + className : '')}
      onSubmit={(e) => {
        e.preventDefault();
        navigate('/results');
      }}
    >
      <div className="search-grid">
        <div className="sf sf-dest">
          <label className="lbl" htmlFor="city">
            Курорт или санаторий
          </label>
          <PlaceSearch />
        </div>
        <div className="sf">
          <label className="lbl" htmlFor="datein">
            Заезд
          </label>
          <div style={{ position: 'relative' }}>
            <svg
              className="fieldico"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F5F4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
            </svg>
            <button type="button" id="datein" className="input datebtn" onClick={onOpenCal}>
              {inLabel}
            </button>
          </div>
        </div>
        <div className="sf">
          <label className="lbl" htmlFor="dateout">
            Выезд
          </label>
          <div style={{ position: 'relative' }}>
            <svg
              className="fieldico"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F5F4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
            </svg>
            <button type="button" id="dateout" className="input datebtn" onClick={onOpenCal}>
              {outLabel}
            </button>
          </div>
        </div>
        <div className="sf">
          <label className="lbl" htmlFor="guests">
            Гости
          </label>
          <GuestsPicker inputClass="input" />
        </div>
        <Link className="btn btn-primary search-go" to="/results">
          Найти санаторий
        </Link>
      </div>
      <FlightToggle plain />
    </form>
  );
}
