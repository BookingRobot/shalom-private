import { IconPath } from '../../components/icons';

/** A 24×24 stroke icon in the site's green (or the current colour). */
export function HotelIcon({
  d,
  size = 20,
  stroke = 'var(--green)',
  width = 1.8,
  className,
}: {
  d: string;
  size?: number;
  stroke?: string;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <IconPath d={d} />
    </svg>
  );
}

/** the fold-out row's chevron */
export const Chevron = () => <HotelIcon d="m6 9 6 6 6-6" width={2.5} className="hr-chev" />;

/** the dotted arrow between the steps of the transfer film */
export const StepArrow = () => (
  <svg
    width="30"
    height="12"
    viewBox="0 0 46 12"
    fill="none"
    stroke="var(--green-mid)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="hr-film-arrow"
  >
    <path d="M2 6h30" strokeDasharray="2 4" />
    <path d="M36 2l5 4-5 4" />
  </svg>
);

export const CALENDAR_D = 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18';
export const CLOCK_D = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2';
export const INFO_D = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01';
export const PLUS_D = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8';
