import type { ReactNode } from 'react';

const row = { display: 'flex', justifyContent: 'space-between', gap: '12px' } as const;
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
  /** [label, value] rows: dates, room, programme, guests… */
  details: [string, ReactNode][];
  /** [label, amount] rows */
  prices: [string, ReactNode][];
  total: ReactNode;
  footer?: ReactNode;
}) {
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
      <img
        src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
        alt=""
        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
      />{' '}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontWeight: '800', fontSize: '20px' }}>Санаторий Эгле Комфорт</div>
          <div style={{ fontSize: '16px', color: '#3E4B44' }}>Друскининкай · ★★★★</div>
        </div>
        <div style={section}>
          {details.map(([label, value]) => (
            <div style={row} key={label}>
              <span style={{ color: '#3E4B44' }}>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div style={section}>
          {prices.map(([label, value]) => (
            <div style={row} key={label}>
              <span style={{ color: '#3E4B44' }}>{label}</span>
              <strong>{value}</strong>
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
          <span style={{ fontWeight: '800', fontSize: '28px' }}>{total}</span>
        </div>
        {footer}
      </div>
    </aside>
  );
}

/** Grey note under the total: only the advance is paid now. */
export const AdvanceNote = ({ advance }: { advance: string }) => (
  <div style={{ fontSize: '15px', color: '#3E4B44', background: '#F4F1EA', borderRadius: '2px', padding: '10px 12px' }}>
    Сейчас к оплате только аванс 4 % — <strong>{advance}</strong>. Остальное — в санатории при заезде.
  </div>
);
