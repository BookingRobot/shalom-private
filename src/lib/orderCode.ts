/**
 * Short order codes for the draft address (/order/K7F2M): five characters from an alphabet
 * without look-alikes (no 0/O, 1/I/L), easy to read out over the phone.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_RE = new RegExp('^[' + ALPHABET + ']{5}$');

export function newOrderCode(length = 5) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** The code as a person typed it (spaces, lower case), or null when it is not a code. */
export function normalizeOrderCode(raw: string): string | null {
  const s = raw.replace(/\s|-/g, '').toUpperCase();
  return CODE_RE.test(s) ? s : null;
}
