import { useState } from 'react';
import './CardForm.css';

/** digits in groups of four (other characters are left as typed — the test mode takes anything) */
const groupCard = (s: string) =>
  /^[\d ]*$/.test(s)
    ? s
        .replace(/\D/g, '')
        .slice(0, 19)
        .replace(/(\d{4})(?=\d)/g, '$1 ')
    : s;
/** «ММ / ГГ»: the slash comes by itself after the month */
const expiry = (s: string, prev: string) => {
  if (!/^[\d /]*$/.test(s)) return s;
  const d = s.replace(/\D/g, '').slice(0, 4);
  if (d.length > 2 || (d.length === 2 && s.length > prev.length)) return d.slice(0, 2) + ' / ' + d.slice(2);
  return d;
};

/**
 * The card form of the payment system (an example on the prototype): card number on its own
 * line, the date and CVV side by side, the Israeli ID number if the bank asks for it, Apple Pay
 * and Google Pay. [ТЕСТОВЫЙ РЕЖИМ] anything typed is accepted; only empty fields are asked for.
 */
export function CardForm({ withId = false, idPrefix = 'card' }: { withId?: boolean; idPrefix?: string }) {
  const [no, setNo] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [tz, setTz] = useState('');
  const id = (k: string) => idPrefix + k;
  return (
    <div className="cf">
      <span className="cf-safe">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="1" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Защищённая форма оплаты
      </span>
      <label className="cf-f cf-no" htmlFor={id('No')}>
        <span className="lbl">Номер карты</span>
        <input
          id={id('No')}
          className="input"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={no}
          onChange={(e) => setNo(groupCard(e.target.value))}
        />
      </label>
      <div className="cf-row">
        <label className="cf-f" htmlFor={id('Exp')}>
          <span className="lbl">Срок действия</span>
          <input
            id={id('Exp')}
            className="input"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="ММ / ГГ"
            value={exp}
            onChange={(e) => setExp(expiry(e.target.value, exp))}
          />
        </label>
        <label className="cf-f" htmlFor={id('Cvv')}>
          <span className="lbl">CVV</span>
          <input
            id={id('Cvv')}
            className="input"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="3 цифры"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.slice(0, 4))}
          />
        </label>
      </div>
      {withId ? (
        <label className="cf-f" htmlFor={id('Tz')}>
          <span className="lbl">
            Номер ת.ז. <span className="cf-opt">— только для карт израильских банков</span>
          </span>
          <input
            id={id('Tz')}
            className="input"
            inputMode="numeric"
            placeholder="9 цифр"
            value={tz}
            onChange={(e) => setTz(e.target.value.slice(0, 12))}
          />
        </label>
      ) : null}
      <div className="cf-pays">
        <span className="cf-apple">Apple Pay</span>
        <span className="cf-gpay">Google Pay</span>
      </div>
    </div>
  );
}

/** what is still empty in the card form (for «Осталось заполнить» / the yellow hint) */
export function cardMissing(idPrefix = 'card') {
  const val = (k: string) => (document.getElementById(idPrefix + k) as HTMLInputElement | null)?.value.trim() || '';
  const out: { label: string; target: string; todo: string }[] = [];
  const add = (k: string, label: string) => out.push({ label, target: '#' + idPrefix + k, todo: 'вписать' });
  if (!val('No')) add('No', 'номер карты');
  if (!val('Exp')) add('Exp', 'срок действия карты');
  if (!val('Cvv')) add('Cvv', 'CVV');
  return out;
}
