import type { ReactNode } from 'react';
import { WIZ_ICONS } from '../wizardIcons';

/**
 * Line illustrations for the sanatorium tabs: a doctor portrait when the sanatorium
 * has no photo of the doctor, and pictograms for procedures, meals and amenities.
 */

const TONES = [
  { bg: '#E6F2EA', skin: '#F2D3BC', hair: '#5B4636' },
  { bg: '#EEE9F7', skin: '#E9C3A6', hair: '#2F2A27' },
  { bg: '#FFF1DC', skin: '#F4D9C4', hair: '#A9A39A' },
  { bg: '#E4EEF6', skin: '#E2B897', hair: '#7A5232' },
];

/** Illustrated doctor (not a photo): head, hair, white coat, stethoscope. */
export function DoctorAvatar({ variant = 0, size = 72 }: { variant?: number; size?: number }) {
  const t = TONES[variant % TONES.length];
  const longHair = variant % 2 === 1;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="36" fill={t.bg} />
      {longHair ? <path d="M21 34c0-11 6.5-18 15-18s15 7 15 18v12H21z" fill={t.hair} /> : null}
      <path d="M14 72c1-13 9.5-20 22-20s21 7 22 20z" fill="#fff" stroke="#D5DED8" />
      <path d="M31 52l5 9 5-9" fill="none" stroke="#9CC9B5" strokeWidth="2" />
      <rect x="31" y="42" width="10" height="10" rx="3" fill={t.skin} />
      <circle cx="36" cy="33" r="12" fill={t.skin} />
      {longHair ? (
        <path d="M24 31c1-8 6-12 12-12s11 4 12 12c-4-3-9-5-12-9-3 4-8 6-12 9z" fill={t.hair} />
      ) : (
        <path d="M24.5 30c0-7 5-11.5 11.5-11.5S47.5 23 47.5 30c-3-3.5-7-5-11.5-5S27.5 26.5 24.5 30z" fill={t.hair} />
      )}
      <path d="M26 54c0 6 3 9 7 9M46 54v6" fill="none" stroke="#1F5F4A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="62" r="2.6" fill="none" stroke="#1F5F4A" strokeWidth="2" />
    </svg>
  );
}

const Ico = ({ children, size = 26 }: { children: ReactNode; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Pictograms by topic; `pick()` chooses one from a free-text label. */
export const PICTO: Record<string, ReactNode> = {
  bath: (
    <Ico>
      <path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />
      <path d="M6 12V6a2 2 0 0 1 4 0M7 20l-1 2M17 20l1 2" />
      <path d="M13 5.5c.5-1 1.5-1 2 0M16 8c.5-1 1.5-1 2 0" />
    </Ico>
  ),
  mud: (
    <Ico>
      <path d="M4 15c2.5-3 5-3 8 0s5.5 3 8 0" />
      <path d="M4 19c2.5-3 5-3 8 0s5.5 3 8 0" />
      <path d="M9 10a3 3 0 0 1 6 0" />
    </Ico>
  ),
  massage: (
    <Ico>
      <path d="M5 13c2-1 4 0 5 2l1.5 3M3 18h18" />
      <path d="M13 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M14 8l3 4 3-1" />
    </Ico>
  ),
  water: (
    <Ico>
      <path d="M8 3h8l-1 17a2 2 0 0 1-2 1.8h-2A2 2 0 0 1 9 20z" />
      <path d="M8.5 9h7" />
    </Ico>
  ),
  inhale: (
    <Ico>
      <path d="M12 3v6M12 9c-2 0-3 2-3 4v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3c0-3 2-5 6-5M12 9c2 0 3 2 3 4v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3c0-3-2-5-6-5" />
    </Ico>
  ),
  salt: (
    <Ico>
      <path d="M12 3l7 4v10l-7 4-7-4V7z" />
      <path d="M12 3v18M5 7l7 4 7-4" />
    </Ico>
  ),
  physio: (
    <Ico>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Ico>
  ),
  gym: (
    <Ico>
      <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
    </Ico>
  ),
  pool: (
    <Ico>
      <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6" />
    </Ico>
  ),
  sauna: (
    <Ico>
      <path d="M4 21V9l8-6 8 6v12z" />
      <path d="M9 17c0-2 2-2 2-4M13 17c0-2 2-2 2-4" />
    </Ico>
  ),
  doctor: (
    <Ico>
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4" />
    </Ico>
  ),
  heart: (
    <Ico>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
    </Ico>
  ),
  leaf: (
    <Ico>
      <path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" />
      <path d="M5 19l8-8" />
    </Ico>
  ),
  breakfast: (
    <Ico>
      <path d="M4 11h13v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 12h1.5a2 2 0 0 1 0 4H17M8 4c-.6.8-.6 1.7 0 2.5s.6 1.7 0 2.5M12 4c-.6.8-.6 1.7 0 2.5s.6 1.7 0 2.5" />
    </Ico>
  ),
  lunch: (
    <Ico>
      <circle cx="12" cy="13" r="6" />
      <path d="M3 4v6a2 2 0 0 0 2 2V21M5 4v4M21 4c-1.5 0-2.5 2-2.5 5v3H21v9" />
    </Ico>
  ),
  dinner: (
    <Ico>
      <path d="M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v7M8.5 21h7" />
    </Ico>
  ),
  meals: (
    <Ico>
      <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8" />
    </Ico>
  ),
  diet: (
    <Ico>
      <path d="M12 21c-5 0-8-3.5-8-8s3-7 8-7 8 2.5 8 7-3 8-8 8z" />
      <path d="M12 6c0-2 1-3 3-3M9 13l2 2 4-4" />
    </Ico>
  ),
  tree: (
    <Ico>
      <path d="M12 3 6 11h3l-4 6h14l-4-6h3z" />
      <path d="M12 17v4" />
    </Ico>
  ),
  pin: (
    <Ico>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </Ico>
  ),
  lift: (
    <Ico>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 3v18M8 10l1.5-2 1.5 2M13 14l1.5 2 1.5-2" />
    </Ico>
  ),
  wifi: (
    <Ico>
      <path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="1" />
    </Ico>
  ),
  car: (
    <Ico>
      <path d="M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </Ico>
  ),
  book: (
    <Ico>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </Ico>
  ),
  star: (
    <Ico>
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z" />
    </Ico>
  ),
  bed: (
    <Ico>
      <path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </Ico>
  ),
  check: (
    <Ico>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </Ico>
  ),
};

// treatment profiles reuse the "Помогите выбрать" pictograms, at list size
const small = (k: string) => <span className="ht-wiz">{WIZ_ICONS[k]}</span>;
PICTO.spine = small('oda');
PICTO.nerv = small('nerv');
PICTO.diab = small('diab');
PICTO.digest = (
  <Ico>
    <path d="M9 3v4a4 4 0 0 0 4 4h1a4.5 4.5 0 0 1 0 9h-2a4.5 4.5 0 0 1-4.5-4.5V14M15 3v4" />
  </Ico>
);
PICTO.skin = (
  <Ico>
    <path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 13l-2-2a1.5 1.5 0 0 0-2 2l3 5a6 6 0 0 0 5 3h2a5 5 0 0 0 5-5v-3" />
  </Ico>
);
PICTO.female = (
  <Ico>
    <circle cx="12" cy="8" r="5" />
    <path d="M12 13v8M9 18h6" />
  </Ico>
);

const RULES: [RegExp, string][] = [
  [/опорно|сустав|позвоноч|спин|травм|ортопед|артр|остеохонд|реабилит/i, 'spine'],
  [/нервн|невро|сон|стресс|бессон|психо/i, 'nerv'],
  [/диабет|эндокрин|обмен|щитовид|ожирен|вес/i, 'diab'],
  [/пищевар|желуд|кишеч|печен|гастр|желч/i, 'digest'],
  [/кож|дермат|псориаз/i, 'skin'],
  [/гинек|урол|женск/i, 'female'],
  [/ванн|жемчуж|углекисл|гидро|душ|шарко|бальнео/i, 'bath'],
  [/гряз|пелоид|аппликац/i, 'mud'],
  [/массаж/i, 'massage'],
  [/минерал|бювет|питьев|вода/i, 'water'],
  [/ингаляц|дыхат|спелео|галотерап/i, 'inhale'],
  [/соля|галокамер/i, 'salt'],
  [/физио|электро|магнит|лазер|ультразв|токи|ударно/i, 'physio'],
  [/кинези|лфк|гимнаст|тренаж|спорт|фитнес|ходьб/i, 'gym'],
  [/бассейн|аквапарк|плаван/i, 'pool'],
  [/саун|бан[ия]|хамам/i, 'sauna'],
  [/врач|консульт|осмотр|диагност|кардио|невро/i, 'doctor'],
  [/сердц|сосуд|давлен/i, 'heart'],
  [/парк|лес|сосн|природ|сад/i, 'tree'],
  [/лифт/i, 'lift'],
  [/wi-?fi|интернет/i, 'wifi'],
  [/парков|трансфер|автомоб/i, 'car'],
  [/библиот|книг/i, 'book'],
  [/ресторан|кафе|бар|питани|завтрак|обед|ужин|шведск/i, 'meals'],
  [/диет|вегет|глютен|стол №|без сахара/i, 'diet'],
  [/номер|кроват|корпус/i, 'bed'],
  [/центр|неман|мор|берег|река|км|адрес|располож/i, 'pin'],
];

export const pick = (label: string, fallback = 'check') => {
  const hit = RULES.find(([re]) => re.test(label));
  return PICTO[hit ? hit[1] : fallback];
};
