import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { FlightToggle } from './FlightToggle';
import { GuestsPicker } from './GuestsPicker';
import { PlaceSearch } from './PlaceSearch';
import './SearchCard.css';

/** after «Найти санаторий» the results page glides down to the list (PageTransition) */
const TO_LIST = { scrollTo: 'resList' };

type Step = 'place' | 'dates' | 'go';

const calIcon = (
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
);

const reduced = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** On a phone the next field may be under the fold or under the floating buttons: bring it up. */
function bringUp(el: HTMLElement | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top < 110 || r.bottom > window.innerHeight - 150)
    el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
}

/** The green bubble «what to do now», with a small arrow down to its field. */
function GoTip({ at, children, onClose }: { at: Step; children: ReactNode; onClose: () => void }) {
  return (
    <div className={'go-tip go-tip-' + at} role="status">
      <span>{children}</span>
      <button type="button" className="go-tip-x" aria-label="Скрыть подсказку" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

/**
 * The search card of the home page — resort or sanatorium, check-in, check-out, guests,
 * «Найти санаторий» and the plain «С перелётом из Тель-Авива» check box. The results page
 * shows the very same card above the list.
 *
 * `guide` (home page): the resort and the dates stay empty until the guest picks them, and a
 * green bubble hops over what to fill next — the resort, then the dates (or the other way
 * round, whichever is still missing), then «Найти санаторий». Guests are 2 adults already.
 * Without `guide` (results page) the bubble only points at «Найти санаторий» after new dates.
 */
export function SearchCard({
  inLabel,
  outLabel,
  onOpenCal,
  className,
  guide = false,
}: {
  inLabel: string;
  outLabel: string;
  onOpenCal: () => void;
  className?: string;
  guide?: boolean;
}) {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const placeAt = useRef<HTMLDivElement>(null);
  const datesAt = useRef<HTMLDivElement>(null);
  const goAt = useRef<HTMLDivElement>(null);

  // ── home page: the next step to fill ──
  const step: Step = !booking.chosenPlace ? 'place' : !booking.chosenDates ? 'dates' : 'go';
  const goTo = booking.chosenPlace.startsWith('san:') ? '/results?h=' + booking.chosenPlace.slice(4) : '/results';
  // the step whose bubble the guest closed (it comes back with the next step)
  const [closed, setClosed] = useState<Step | ''>('');
  // bumped to make the bubble hop again (a press on «Найти» with something missing)
  const [hop, setHop] = useState(0);
  const lastStep = useRef(step);
  useEffect(() => {
    if (!guide || lastStep.current === step) return;
    lastStep.current = step;
    setClosed('');
    requestAnimationFrame(() =>
      bringUp(step === 'place' ? placeAt.current : step === 'dates' ? datesAt.current : goAt.current),
    );
  }, [guide, step]);

  // ── results page: after new dates a bubble points at «Найти санаторий» ──
  const [nudge, setNudge] = useState(false);
  const dates = inLabel + '|' + outLabel;
  const shown = useRef(dates);
  useEffect(() => {
    if (guide || shown.current === dates) return;
    shown.current = dates;
    setNudge(true);
    requestAnimationFrame(() => bringUp(goAt.current));
    const t = window.setTimeout(() => setNudge(false), 12000);
    return () => window.clearTimeout(t);
  }, [guide, dates]);

  const tipOn = (at: Step) => guide && step === at && closed !== at;
  const tip = (at: Step) =>
    tipOn(at) ? (
      <GoTip key={at + hop} at={at} onClose={() => setClosed(at)}>
        {at === 'place' ? (
          <>
            {booking.chosenDates ? 'Теперь выберите ' : 'Выберите '}
            <strong>курорт или санаторий</strong>
          </>
        ) : at === 'dates' ? (
          <>
            Теперь выберите <strong>даты поездки</strong>
          </>
        ) : (
          <>
            Всё выбрано. Нажмите <strong>«Найти санаторий»</strong>
          </>
        )}
      </GoTip>
    ) : null;

  // «Найти» with something still missing: take the guest straight to it
  const find = (e: { preventDefault: () => void }) => {
    setNudge(false);
    if (!guide || step === 'go') return;
    e.preventDefault();
    setClosed('');
    setHop((h) => h + 1);
    if (step === 'place') {
      bringUp(placeAt.current);
      placeAt.current?.querySelector<HTMLInputElement>('input')?.focus();
    } else onOpenCal();
  };

  const emptyDates = guide && !booking.chosenDates;
  const dateText = (label: string) => (emptyDates ? <span className="datebtn-ph">Выберите дату</span> : label);

  return (
    <form
      className={'card search' + (guide ? ' search-guide' : '') + (className ? ' ' + className : '')}
      onSubmit={(e) => {
        e.preventDefault();
        if (guide && step !== 'go') return find(e);
        navigate(guide ? goTo : '/results', { state: guide && goTo !== '/results' ? null : TO_LIST });
      }}
    >
      <div className="search-grid">
        <div className={'sf sf-dest' + (tipOn('place') ? ' sf-next' : '')}>
          <label className="lbl" htmlFor="city">
            Курорт или санаторий
          </label>
          <div className="sf-at" ref={placeAt}>
            {tip('place')}
            <PlaceSearch guide={guide} />
          </div>
        </div>
        <div className={'sf' + (tipOn('dates') ? ' sf-next' : '')}>
          <label className="lbl" htmlFor="datein">
            Заезд
          </label>
          <div className="sf-at" ref={datesAt}>
            {tip('dates')}
            {calIcon}
            <button type="button" id="datein" className="input datebtn" onClick={onOpenCal}>
              {dateText(inLabel)}
            </button>
          </div>
        </div>
        <div className={'sf' + (tipOn('dates') ? ' sf-next' : '')}>
          <label className="lbl" htmlFor="dateout">
            Выезд
          </label>
          <div className="sf-at">
            {calIcon}
            <button type="button" id="dateout" className="input datebtn" onClick={onOpenCal}>
              {dateText(outLabel)}
            </button>
          </div>
        </div>
        <div className="sf">
          <label className="lbl" htmlFor="guests">
            Гости
          </label>
          <GuestsPicker inputClass="input" />
        </div>
        <div className="sf-go" ref={goAt}>
          {guide ? (
            tip('go')
          ) : nudge ? (
            <GoTip at="go" onClose={() => setNudge(false)}>
              Даты выбраны. Теперь нажмите <strong>«Найти санаторий»</strong>
            </GoTip>
          ) : null}
          <Link
            className={'btn btn-primary search-go' + (nudge || tipOn('go') ? ' nudged' : '')}
            to={guide ? goTo : '/results'}
            state={guide && goTo !== '/results' ? null : TO_LIST}
            onClick={find}
          >
            Найти санаторий
          </Link>
        </div>
      </div>
      <FlightToggle plain />
    </form>
  );
}
