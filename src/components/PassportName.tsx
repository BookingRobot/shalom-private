import { useState } from 'react';
import { nameError } from '../lib/guestRules';

/**
 * A first name or surname as in the passport: Latin letters, checked when the guest leaves
 * the field (not while typing), with the reason under it in plain words.
 */
export function PassportName({
  id,
  label,
  what,
  value,
  onChange,
  placeholder,
  autoComplete,
  forceCheck = false,
}: {
  id: string;
  label: string;
  what: 'имя' | 'фамилию';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  /** show the error even before the field was left (after «Далее») */
  forceCheck?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const err = (touched || forceCheck) && (value || forceCheck) ? nameError(value, what) : '';
  return (
    <div className="g-field">
      <label className="lbl" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete ?? 'off'}
        autoCapitalize="characters"
        spellCheck={false}
        value={value}
        aria-invalid={!!err}
        aria-describedby={err ? id + '-err' : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
      />
      {err ? (
        <span id={id + '-err'} className="g-err">
          {err}
        </span>
      ) : null}
    </div>
  );
}
