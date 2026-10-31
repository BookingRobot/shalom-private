/**
 * The same rules for every form with people in it (step 3 «Гости», tickets): names as in the
 * passport, the phone checked and formatted for its country. A wrong number means the agency
 * cannot reach the guest; a name unlike the passport means trouble with tickets and check-in.
 */
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max';
import { COUNTRY_OF } from '../data/phoneCodes';

/** Latin letters, a space, a hyphen or an apostrophe — what a passport's machine line holds. */
const PASSPORT_NAME = /^[A-Za-z][A-Za-z' -]*$/;

/** What is wrong with a first name or surname, or '' when it is fine. */
export function nameError(raw: string, what: 'имя' | 'фамилию'): string {
  const s = raw.trim();
  if (!s) return `Впишите ${what}`;
  if (/[А-Яа-яЁё]/.test(s)) return 'Латинскими буквами, как в загранпаспорте (например, IVAN)';
  if (!PASSPORT_NAME.test(s)) return 'Только латинские буквы, пробел или дефис — как в паспорте';
  if (s.replace(/[^A-Za-z]/g, '').length < 2) return 'Слишком коротко — проверьте по паспорту';
  return '';
}

/** A name as the passport writes it: upper case, single spaces. */
export const passportName = (raw: string) => raw.trim().replace(/\s+/g, ' ').toUpperCase();

export const countryOf = (codeLabel: string): CountryCode => (COUNTRY_OF[codeLabel] || 'IL') as CountryCode;

/** The number as the guest types it, spaced the way that country writes it (50 123 4567). */
export function formatAsTyped(codeLabel: string, national: string): string {
  const digits = national.replace(/[^\d]/g, '');
  if (!digits) return '';
  return new AsYouType(countryOf(codeLabel)).input(digits);
}

export interface PhoneCheck {
  /** the problem in plain words, '' when the number is fine */
  error: string;
  /** a note that does not stop the guest (a landline cannot have WhatsApp) */
  note: string;
  /** +972501234567 — what the agency stores and dials */
  e164: string;
}

/** Is this a real number of that country, and can it have WhatsApp (a mobile)? */
export function checkPhone(codeLabel: string, national: string, needWhatsApp = true): PhoneCheck {
  const digits = national.replace(/[^\d]/g, '');
  if (!digits) return { error: 'Впишите номер телефона', note: '', e164: '' };
  const n = parsePhoneNumberFromString(digits, countryOf(codeLabel));
  if (!n || !n.isValid())
    return { error: 'Номер не похож на настоящий — проверьте цифры и код страны', note: '', e164: '' };
  const type = n.getType();
  const mobile = type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE' || type === undefined;
  return {
    error: '',
    note: needWhatsApp && !mobile ? 'Похоже на городской номер: WhatsApp на нём не работает. Лучше мобильный.' : '',
    e164: n.number,
  };
}
