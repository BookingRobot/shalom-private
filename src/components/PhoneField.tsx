import { useState } from 'react';
import { PHONE_CODES_FULL } from '../data/phoneCodes';
import { checkPhone, formatAsTyped } from '../lib/guestRules';
import './PhoneField.css';

/** «+972 · Израиль» → the code «+972» and the country «Израиль». */
function splitLabel(label: string) {
  // \s also matches the no-break space the build-time typography may put around «·»
  const [dial = '', country = ''] = label.split(/\s*·\s*/);
  return { dial, country };
}

/**
 * Country code + number, the same in every form: the number is spaced the way that country
 * writes it while typing, checked when the guest leaves the field, and a landline gets a
 * gentle note (WhatsApp needs a mobile). `error` from the form's own check wins.
 * On a phone the closed list shows only the code (`.phone-code-v` over the native select,
 * whose own text is hidden), so the number gets the width; the open list keeps the countries.
 */
export function PhoneField({
  id,
  code,
  number,
  onCode,
  onNumber,
  error,
  className = '',
}: {
  id: string;
  code: string;
  number: string;
  onCode: (code: string) => void;
  onNumber: (n: string) => void;
  error?: string;
  className?: string;
}) {
  const [touched, setTouched] = useState(false);
  const check = touched && number ? checkPhone(code, number) : null;
  const shown = error || check?.error || '';
  const { dial, country } = splitLabel(code);
  return (
    <span className={'phone-field ' + className}>
      <span className="phone-row">
        <select
          className="input phone-code"
          aria-label={country ? 'Код страны: ' + country : 'Код страны'}
          value={code}
          onChange={(e) => {
            onCode(e.target.value);
            onNumber(formatAsTyped(e.target.value, number));
          }}
        >
          {PHONE_CODES_FULL.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="phone-code-v" aria-hidden="true">
          {dial}
        </span>
        <input
          id={id}
          className="input phone-num"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="50 123 4567"
          value={number}
          aria-invalid={!!shown}
          aria-describedby={shown || check?.note ? id + '-msg' : undefined}
          onChange={(e) => onNumber(formatAsTyped(code, e.target.value))}
          onBlur={() => setTouched(true)}
        />
      </span>
      {shown ? (
        <span id={id + '-msg'} className="phone-msg bad">
          {shown}
        </span>
      ) : check?.note ? (
        <span id={id + '-msg'} className="phone-msg">
          {check.note}
        </span>
      ) : null}
    </span>
  );
}
