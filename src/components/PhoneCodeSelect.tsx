import type { CSSProperties } from 'react';
import { PHONE_CODES_FULL, PHONE_CODES_SHORT } from '../data/phoneCodes';

interface Props {
  /** "short" — 6 most common codes (contact form), "full" — guest details form */
  list?: 'short' | 'full';
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/** Country code dropdown; Israel (+972) is the default. */
export function PhoneCodeSelect({ list = 'short', className, style, ariaLabel = 'Код страны' }: Props) {
  const codes = list === 'full' ? PHONE_CODES_FULL : PHONE_CODES_SHORT;
  return (
    <select className={className} aria-label={ariaLabel} style={style} defaultValue={codes[0]}>
      {codes.map((c, i) => (
        <option key={i}>{c}</option>
      ))}
    </select>
  );
}
