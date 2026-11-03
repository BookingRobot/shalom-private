import { useState, type KeyboardEvent } from 'react';
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
const focusField = (id: string) => document.getElementById(id)?.focus();

/** what every card field shares: digits keyboard, no autocorrect, no spell check */
const numeric = {
  className: 'input',
  inputMode: 'numeric' as const,
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
};

/**
 * The card form of the payment system (an example on the prototype): card number on its own
 * line, the date and CVV side by side, the Israeli ID number if the bank asks for it. The wallets
 * (Apple Pay, Google Pay) are named in the methods line of the page as plain text until they are
 * wired. No automatic jumps between fields (they surprise a guest correcting a digit): the
 * keyboard's «Далее» key moves on, «Готово» on the last field closes the keyboard.
 * [ТЕСТОВЫЙ РЕЖИМ] anything typed is accepted; only empty fields are asked for.
 */
export function CardForm({ withId = false, idPrefix = 'card' }: { withId?: boolean; idPrefix?: string }) {
  const [no, setNo] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [tz, setTz] = useState('');
  const id = (k: string) => idPrefix + k;
  // the keyboard's «next» key moves on; on the last field «done» closes the keyboard
  const order = withId ? ['No', 'Exp', 'Cvv', 'Tz'] : ['No', 'Exp', 'Cvv'];
  const hint = (k: string) => (k === order[order.length - 1] ? 'done' : 'next');
  const onEnter = (k: string) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const next = order[order.indexOf(k) + 1];
    if (next) focusField(id(next));
    else e.currentTarget.blur();
  };

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
          {...numeric}
          id={id('No')}
          autoComplete="cc-number"
          enterKeyHint={hint('No')}
          placeholder="0000 0000 0000 0000"
          value={no}
          onChange={(e) => setNo(groupCard(e.target.value))}
          onKeyDown={onEnter('No')}
        />
      </label>
      <div className="cf-row">
        <label className="cf-f" htmlFor={id('Exp')}>
          <span className="lbl">Срок действия</span>
          <input
            {...numeric}
            id={id('Exp')}
            autoComplete="cc-exp"
            enterKeyHint={hint('Exp')}
            placeholder="ММ / ГГ"
            value={exp}
            onChange={(e) => setExp(expiry(e.target.value, exp))}
            onKeyDown={onEnter('Exp')}
          />
        </label>
        <label className="cf-f" htmlFor={id('Cvv')}>
          <span className="lbl">CVV</span>
          <input
            {...numeric}
            id={id('Cvv')}
            autoComplete="cc-csc"
            enterKeyHint={hint('Cvv')}
            placeholder="3 цифры"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.slice(0, 4))}
            onKeyDown={onEnter('Cvv')}
          />
        </label>
      </div>
      {withId ? (
        <label className="cf-f" htmlFor={id('Tz')}>
          <span className="lbl">Номер теудат-зеут (ת.ז.)</span>
          <span className="cf-hint">9 цифр, только для карт израильских банков</span>
          <input
            {...numeric}
            id={id('Tz')}
            autoComplete="off"
            enterKeyHint={hint('Tz')}
            value={tz}
            onChange={(e) => setTz(e.target.value.slice(0, 12))}
            onKeyDown={onEnter('Tz')}
          />
        </label>
      ) : null}
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
