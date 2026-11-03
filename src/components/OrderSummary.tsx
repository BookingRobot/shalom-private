import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useBooking } from '../context/BookingContext';
import { SANATORIUMS } from '../data/sanatoriums';
import { BASKET_OPEN, basketNext } from '../lib/basket';
import './OrderSummary.css';

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
  const img = h && booking.hotelId !== 'egle-comfort' ? h.img : '/img/d82431114d102eee0f48639f84940aad.jpg';
  const name = h ? h.name : 'Санаторий Эгле Комфорт';
  const place = (h ? h.sub.split(' · ')[0] : 'Друскининкай') + ' · ' + '★'.repeat(h ? h.starsN : 4);
  // phone: the box is not in the page; the basket in the bottom bar opens it in a window
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const o = () => setOpen(true);
    window.addEventListener(BASKET_OPEN, o);
    return () => window.removeEventListener(BASKET_OPEN, o);
  }, []);
  const content = (
    <>
      <img className="os-img" src={img} alt="" />
      <div className="os-body">
        <div className="os-head">
          <div className="os-name">{name}</div>
          <div className="os-place">{place}</div>
        </div>
        <div className="os-section">
          {details.map(([name, value, sub]) => (
            <div className="os-row" key={name}>
              <span className="os-label">{name}</span>
              <span className="os-detail">{value}</span>
              {sub ? <span className="os-detail os-sub">{sub}</span> : null}
            </div>
          ))}
        </div>
        <div className="os-section">
          {prices.map(([name, value]) => (
            <div className="os-row" key={name}>
              <span className="os-label">{name}</span>
              <span className="os-price">{value}</span>
            </div>
          ))}
        </div>
        <div className="os-total">
          <span>Итого</span>
          <strong>{total}</strong>
        </div>
        {footer}
      </div>
    </>
  );
  return (
    <>
      <aside className="card order-aside" aria-label="Ваш заказ">
        {content}
      </aside>
      {open ? (
        <BasketWindow
          onClose={() => setOpen(false)}
          onNext={() => {
            setOpen(false);
            basketNext();
          }}
        >
          {content}
        </BasketWindow>
      ) : null}
    </>
  );
}

/** the order in a window over the page (phone): what is chosen so far, «Продолжить» or close */
function BasketWindow({ children, onClose, onNext }: { children: ReactNode; onClose: () => void; onNext: () => void }) {
  const x = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    x.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = ov;
      back?.focus?.();
    };
  }, []);
  return (
    <div className="bk-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bk" role="dialog" aria-modal="true" aria-labelledby="bkTitle">
        <div className="bk-head">
          <span>
            <h2 id="bkTitle">Ваш заказ</h2>
            <span className="bk-sub">Вы уже выбрали</span>
          </span>
          <button type="button" className="bk-x" onClick={onClose} ref={x} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="bk-body">{children}</div>
        <div className="bk-foot">
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Продолжить →
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

/** Grey note under the total: a small deposit fixes the price, the rest is paid later. */
export const AdvanceNote = ({
  order,
}: {
  order: { advanceLabel: string; restLabel: string; dueDate: string; fullOnly: boolean };
}) => (
  <div className="os-advance">
    {order.fullOnly ? (
      <>До заезда меньше недели — оплата сразу всей суммы.</>
    ) : (
      <>
        Цена фиксируется после депозита <strong>{order.advanceLabel}</strong>. Остаток{' '}
        <strong className="os-nowrap">{order.restLabel}</strong> — до {order.dueDate}; до этой даты отмена бесплатная.
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
    ...(order.sanTransfer ? [['Трансфер санатория', 'входит в цену'] as [string, string]] : []),
  ];
}
