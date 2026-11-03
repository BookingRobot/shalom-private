import { useState, type KeyboardEvent } from 'react';
import { nameError } from '../lib/guestRules';

/**
 * The keyboard's «Далее» (Enter) goes to the next field of the form instead of doing nothing;
 * when the next field is the date-of-birth button, its picker opens, as on an iPhone.
 */
function nextOnEnter(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
  e.preventDefault();
  const form = e.currentTarget.form;
  if (!form) return;
  const fields = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea, button.datebtn',
    ),
  );
  const next = fields[fields.indexOf(e.currentTarget) + 1];
  if (!next) return;
  next.focus();
  if (next.classList.contains('datebtn')) next.click();
}

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
      {/* iOS must not «correct» LEVIN into a Russian or English word, nor start it in lower case */}
      <input
        id={id}
        className="input"
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete ?? 'off'}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        value={value}
        aria-invalid={!!err}
        aria-describedby={err ? id + '-err' : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={nextOnEnter}
      />
      {err ? (
        <span id={id + '-err'} className="g-err">
          {err}
        </span>
      ) : null}
    </div>
  );
}
