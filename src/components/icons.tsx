import { useId, type CSSProperties, type ReactNode } from 'react';
import { ICON_PATHS } from '../data/iconPaths';

const DOCTOR_D = ICON_PATHS.doctor;

/** Small stroke icons used across pages (24×24 grid, currentColor by default). */
interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

function Svg({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  style,
  children,
  join = true,
}: IconProps & { children: ReactNode; join?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin={join ? 'round' : undefined}
      aria-hidden="true"
      style={style}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);

export const CloseIcon = ({ color = '#1C2620', strokeWidth = 2.5, ...p }: IconProps) => (
  <Svg color={color} strokeWidth={strokeWidth} join={false} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const HeadsetIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
  </Svg>
);

/** Brand mark: green square with a stylised fir tree. */
export const LogoMark = ({ size = 38, round = 0 }: { size?: number; round?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <rect x="1" y="1" width="38" height="38" rx={round} fill="#1F5F4A" />
    <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
  </svg>
);

/**
 * The Mercedes minibus of our transfers, drawn small: used everywhere instead of a line
 * icon of a car (transparent around, the van's body stays white).
 */
export const VAN_IMG = '/img/1e848da921b34b866eb461ecca33fca7.png';
export const VanIcon = ({ height = 22, className = '' }: { height?: number; className?: string }) => (
  <img
    src={VAN_IMG}
    alt=""
    aria-hidden="true"
    className={'van-ico' + (className ? ' ' + className : '')}
    width={Math.round((height * 168) / 79)}
    height={height}
    style={{ flex: 'none', display: 'block', height, width: 'auto' }}
  />
);

/**
 * The doctor sign: a doctor in a ring with a V collar, tie and a cross on the chest.
 * Drawn inside any 24×24 stroke icon: it takes the icon's stroke colour (a stroke-filled
 * square seen through a mask of the figure), so it works on light and dark chips alike.
 */
export function DoctorMark() {
  const id = 'doc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <circle cx="12" cy="12" r="10.6" fill="none" stroke="#fff" strokeWidth="1.5" />
        <ellipse cx="12" cy="7.9" rx="3.1" ry="3.6" fill="#fff" stroke="none" />
        <path
          d="M5.6 18.04V16.4A3.4 3.4 0 0 1 9 13h6a3.4 3.4 0 0 1 3.4 3.4v1.64a8.8 8.8 0 0 1-12.8 0z"
          fill="#fff"
          stroke="none"
        />
        {/* V collar with the tie */}
        <path d="M10.2 13 12 16.3l1.8-3.3z" fill="#000" stroke="none" />
        <path d="M12 14.1l.55.9-.55 1.55-.55-1.55z" fill="#fff" stroke="none" />
        {/* stethoscope over the left shoulder */}
        <path d="M8.4 13.3c-1 1.1-1.1 2.8-.1 3.7.9.8 2.2.3 2.3-.9" fill="none" stroke="#000" strokeWidth=".9" />
        {/* cross */}
        <path d="M15.9 15.5v2.8M14.5 16.9h2.8" fill="none" stroke="#000" strokeWidth="1.05" strokeLinecap="butt" />
      </mask>
      <path d="M0 12h24" strokeWidth="24" strokeLinecap="butt" mask={`url(#${id})`} />
    </>
  );
}

/** One icon path from data (amenities, chips); the doctor gets its own sign. */
export function IconPath({ d }: { d: string }) {
  return d === DOCTOR_D ? <DoctorMark /> : <path d={d} />;
}
