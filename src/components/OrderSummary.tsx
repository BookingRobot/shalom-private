import type { ReactNode } from 'react';
import { useBooking } from '../context/BookingContext';
import { SANATORIUMS } from '../data/sanatoriums';

const row = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'baseline',
  gap: '16px',
} as const;
const label = { color: '#3E4B44', fontSize: '16px' } as const;
/** order details (room, programme, guests): medium weight, so the money stands out */
const detailValue = { fontWeight: '600', textAlign: 'right', color: '#1C2620', textWrap: 'balance' } as const;
const priceValue = { fontWeight: '700', textAlign: 'right', whiteSpace: 'nowrap' } as const;
const section = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '16px',
  borderTop: '1px solid #E3DED2',
  paddingTop: '12px',
} as const;

/**
 * Sticky "your order" box on the booking steps: sanatorium, dates, room,
 * programme, guests, prices and the total.
 */
export function OrderSummary({
  details,
  prices,
  total,
  footer,
}: {
  /** [label, value, second line?] rows: dates, room, programme, guests… */
  details: [string, ReactNode, ReactNode?][];
  /** [label, amount] rows */
  prices: [string, ReactNode][];
  total: ReactNode;
  footer?: ReactNode;
}) {
  // the sanatorium of this order (the prototype's example order is Eglė Comfort)
  const { booking } = useBooking();
  const h = SANATORIUMS.find((x) => x.id === booking.hotelId);
  const img = h && booking.hotelId !== 'egle-comfort' ? h.img : '/img/1efd1efc34d4137ff98a8658a068afc5.jpg';
  const name = h ? h.name : 'Санаторий Эгле Комфорт';
  const place = (h ? h.sub.split(' · ')[0] : 'Друскининкай') + ' · ' + '★'.repeat(h ? h.starsN : 4);
  return (
    <aside
      className="card"
      aria-label="Ваш заказ"
      style={{
        flex: '1 1 300px',
        maxWidth: '360px',
        padding: '0',
        overflow: 'hidden',
        position: 'sticky',
        top: '16px',
      }}
    >
      <img src={img} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />{' '}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontWeight: '800', fontSize: '18px' }}>{name}</div>
          <div style={{ fontSize: '16px', color: '#3E4B44' }}>{place}</div>
        </div>
        <div style={section}>
          {details.map(([name, value, sub]) => (
            <div style={row} key={name}>
              <span style={label}>{name}</span>
              <span style={detailValue}>{value}</span>
              {sub ? <span style={{ ...detailValue, gridColumn: '1 / -1', marginTop: '-12px' }}>{sub}</span> : null}
            </div>
          ))}
        </div>
        <div style={section}>
          {prices.map(([name, value]) => (
            <div style={row} key={name}>
              <span style={label}>{name}</span>
              <span style={priceValue}>{value}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
            borderTop: '2px solid #1C2620',
            paddingTop: '12px',
          }}
        >
          <span style={{ fontWeight: '800', fontSize: '18px' }}>Итого</span>
          <span style={{ fontWeight: '800', fontSize: '26px', whiteSpace: 'nowrap' }}>{total}</span>
        </div>
        {footer}
      </div>
    </aside>
  );
}

/** Grey note under the total: a small deposit fixes the price, the rest is paid later. */
export const AdvanceNote = ({
  order,
}: {
  order: { advanceLabel: string; restLabel: string; dueDate: string; fullOnly: boolean };
}) => (
  <div style={{ fontSize: '15px', color: '#3E4B44', background: '#F4F1EA', borderRadius: '2px', padding: '10px 12px' }}>
    {order.fullOnly ? (
      <>До заезда меньше недели — оплата сразу всей суммы.</>
    ) : (
      <>
        Цена фиксируется после депозита <strong>{order.advanceLabel}</strong>. Остаток{' '}
        <strong style={{ whiteSpace: 'nowrap' }}>{order.restLabel}</strong> — до {order.dueDate}; до этой даты отмена
        бесплатная.
      </>
    )}
  </div>
);

/** Price rows of the order box, the same on every step: stay (place × guests), flight package, transfer. */
export function orderPriceRows(order: {
  stayLabel: string;
  stayCalc: string;
  flight: number;
  flightLabel: string;
  flightName?: string;
  sanTransfer?: boolean;
  transfer: number;
  transferKind: string;
  transferLabel: string;
}): [string, string][] {
  return [
    ['Проживание и лечение' + (order.stayCalc ? ', ' + order.stayCalc : ''), order.stayLabel],
    ...(order.flight
      ? [[order.flightName || 'Перелёт Тель-Авив ⇄ Вильнюс и трансфер', order.flightLabel] as [string, string]]
      : []),
    ...(order.transfer ? [[order.transferKind, order.transferLabel] as [string, string]] : []),
    ...(order.sanTransfer ? [['Трансфер — от санатория', 'включён'] as [string, string]] : []),
  ];
}
