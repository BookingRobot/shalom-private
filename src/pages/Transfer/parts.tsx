import type { TransferVals } from './transferLogic';

/** «Уже оплачено»: what the sanatorium or the flight package pays — a stamp, not a choice */
export function PaidStamp({ children }: { children: string }) {
  return (
    <span className="paid-stamp">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 5 5L20 7" />
      </svg>
      {children}
    </span>
  );
}

/** the arrow at the right of a <select> that looks like an input */
export const Chevron = () => (
  <svg
    className="tr-chevron"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--green)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** a field for the flight number and time, filled in from our flight or left to the guest */
export function FlightField({
  id,
  label,
  value,
  onChange,
  placeholder,
  ourFlight,
}: {
  id: string;
  label: string;
  value: string;
  onChange: TransferVals['setFlightIn'];
  placeholder: string;
  ourFlight: boolean;
}) {
  return (
    <div className="tr-field">
      <label className="lbl tr-lbl-16" htmlFor={id}>
        {label}
        <span className="tr-lbl-note"> · {ourFlight ? 'заполнили по вашему перелёту' : 'необязательно'}</span>
      </label>
      <input
        id={id}
        className="input tr-input-44"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/** the flight home (on the way back) */
export function BackFlight({ v, id }: { v: TransferVals; id: string }) {
  return (
    <FlightField
      id={id}
      label={v.ourFlight ? 'Ваш рейс и время отправления' : 'Уже есть билеты? Рейс и время отправления'}
      value={v.flightBack}
      onChange={v.setFlightBack}
      placeholder="Например: LO 772, 16:10"
      ourFlight={v.ourFlight}
    />
  );
}

/** a radio-looking answer: the round mark on the left */
export function Radio({ cls }: { cls: string }) {
  return (
    <span className={`radio ${cls}`}>
      <i />
    </span>
  );
}
