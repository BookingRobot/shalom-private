/** 2138 → "2 138" with a non-breaking space, so sums never wrap. */
export const fmt = (n: number | string) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
/** "2 138" → 2138 */
export const toNum = (x: number | string) => Number(String(x).replace(/\s/g, ''));
