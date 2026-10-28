import type { ReactNode } from 'react';

/**
 * Pictograms for the "Помогите выбрать" answers — the guest recognises the
 * answer at a glance, the caption under it confirms. Simple line drawings.
 */
const Ico = ({ children }: { children: ReactNode }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const WIZ_ICONS: Record<string, ReactNode> = {
  // the back seen from behind, the spine marked down the middle
  oda: (
    <Ico>
      <circle cx="12" cy="3.8" r="2" />
      <path d="M6 21v-5.5c0-3 .9-5.3 2.6-6.8.8-.7 1.9-1 3.4-1s2.6.3 3.4 1c1.7 1.5 2.6 3.8 2.6 6.8V21" />
      <path d="M12 9.6v1.2M12 12.4v1.2M12 15.2v1.2M12 18v1.2" strokeWidth="2.4" />
    </Ico>
  ),
  // heart with a pulse line
  heart: (
    <Ico>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
      <path d="M6.2 12.4h2.9l1.4-2.4 2 4.6 1.5-2.2h3.8" />
    </Ico>
  ),
  // drop with a plus: blood sugar
  diab: (
    <Ico>
      <path d="M12 3s6 6.3 6 10.8a6 6 0 0 1-12 0C6 9.3 12 3 12 3z" />
      <path d="M12 11.2v5.2M9.4 13.8h5.2" />
    </Ico>
  ),
  // moon and a star: sleep, calm
  nerv: (
    <Ico>
      <path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z" />
      <path d="M16.5 3.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" />
    </Ico>
  ),
  // sun over the water: rest
  rest: (
    <Ico>
      <path d="M7 16a5 5 0 0 1 10 0" />
      <path d="M12 6.5v2M6.3 8.9l1.4 1.4M17.7 8.9l-1.4 1.4M3.5 13.5h2M18.5 13.5h2" />
      <path d="M3 16h18M6 19.2c1-.7 2-.7 3 0s2 .7 3 0 2-.7 3 0 2 .7 3 0" />
    </Ico>
  ),
  // walking person
  easy: (
    <Ico>
      <circle cx="13" cy="4" r="2" />
      <path d="M12.3 7.2 10.6 13l3 2.8.9 5.2" />
      <path d="M10.6 13 8 20.6" />
      <path d="M11.8 8.4l2.6 2.8 3.2.8" />
      <path d="M11.4 8.6 8.2 10.8 7 13.4" />
    </Ico>
  ),
  // lift: doors with up/down arrows
  lift: (
    <Ico>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M12 3v18" />
      <path d="M7 10l1.5-2 1.5 2M14 14l1.5 2 1.5-2" />
    </Ico>
  ),
  // one coin
  low: (
    <Ico>
      <ellipse cx="12" cy="10" rx="6" ry="2.6" />
      <path d="M6 10v3.6c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V10" />
    </Ico>
  ),
  // a stack of coins
  mid: (
    <Ico>
      <ellipse cx="12" cy="6.4" rx="6" ry="2.4" />
      <path d="M6 6.4v3.4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V6.4" />
      <path d="M6 9.8v3.4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V9.8" />
      <path d="M6 13.2v3.4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-3.4" />
    </Ico>
  ),
  // shield with a medical cross: treatment first
  any: (
    <Ico>
      <path d="M12 3l7 2.8v5.4c0 4.6-3.2 8.2-7 9.8-3.8-1.6-7-5.2-7-9.8V5.8z" />
      <path d="M12 8.6v6M9 11.6h6" />
    </Ico>
  ),
};
