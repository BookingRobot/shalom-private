import { useBooking } from '../context/BookingContext';
import { isFlightDay } from '../data/flights';
import { toD } from '../lib/dates';
import { FLIGHT_PP, PACKAGE_TRANSFER_PP } from '../lib/pricing';

/**
 * Search option "С перелётом из Тель-Авива": flight + group transfer priced into one
 * "всё включено" number. Half of all agency requests ask for exactly this package.
 * [ПРИМЕР ДАННЫХ — цена перелёта и дни рейсов]
 */
export function FlightToggle({ dark = false }: { dark?: boolean }) {
  const { booking, update } = useBooking();
  const on = booking.flightPackage;
  const offDay = on && !isFlightDay(toD(booking.checkin));
  const toggle = () =>
    update(
      on
        ? { flightPackage: false }
        : {
            flightPackage: true,
            transfer: { ...booking.transfer, mode: 'group', back: true, place: 'vilnius', backPlace: 'vilnius' },
          },
    );
  return (
    <div className={`ftog ${dark ? 'ftog-dark' : ''}`}>
      <label className={`ftog-box ${on ? 'on' : ''}`}>
        <input type="checkbox" checked={on} onChange={toggle} />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flex: 'none' }}
        >
          <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
        </svg>
        <span>
          <strong>С перелётом из Тель-Авива</strong>
          <span className="ftog-sub">
            билеты с багажом и трансфер — в одной цене, около {FLIGHT_PP + PACKAGE_TRANSFER_PP}&nbsp;€ с человека
          </span>
        </span>
      </label>
      {offDay ? (
        <span className="ftog-warn" role="status">
          Рейсы — по вторникам, четвергам и воскресеньям. Выберите заезд в день, отмеченный ✈ в календаре.
        </span>
      ) : null}
    </div>
  );
}
