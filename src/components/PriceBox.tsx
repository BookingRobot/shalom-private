import { useBooking } from '../context/BookingContext';
import { toNum } from '../lib/format';
import { eur, quote } from '../lib/pricing';
import { transferBySanatorium } from '../data/transferPolicy';

/**
 * Price the way agents quote it: one big number per person (in a double room, or
 * for a solo guest in a single room incl. the supplement), the party total below.
 * With the flight package the big number is "всё включено" and opens a breakdown.
 * `forTwo` is the tariff for two adults sharing a room.
 */
export function PriceBox({
  forTwo,
  nightsLabel,
  from = true,
  hotelId,
}: {
  forTwo: number | string;
  nightsLabel: string;
  from?: boolean;
  /** sanatorium of this price (defaults to the one in the order) */
  hotelId?: string;
}) {
  const { booking } = useBooking();
  const g = { adults: booking.adults, children: booking.children };
  const bySan = transferBySanatorium(hotelId || booking.hotelId);
  const q = quote(toNum(forTwo), g, booking.flightPackage, bySan);
  return (
    <div className="pbox">
      <span className="pbox-big">
        {from ? <small>от </small> : null}
        {eur(q.perPerson)}
      </span>
      <span className="pbox-note">{q.note}</span>
      {q.singleExtra ? <span className="pbox-sub">включая доплату за одноместное {eur(q.singleExtra)}</span> : null}
      {booking.flightPackage ? (
        <details className="pbox-det">
          <summary>Из чего складывается</summary>
          <span>
            Санаторий и лечение — {eur(q.place)}
            <br />
            {bySan
              ? 'Перелёт Тель-Авив ⇄ Вильнюс — ' + eur(q.perPerson - q.place) + ' (трансфер — от санатория)'
              : 'Перелёт Тель-Авив ⇄ Вильнюс и трансфер — ' + eur(q.perPerson - q.place)}
          </span>
        </details>
      ) : null}
      <span className="pbox-total">
        Итого {q.party}: <strong>{eur(q.total)}</strong> · {nightsLabel}
      </span>
    </div>
  );
}
