import './ChooseCard.css';

/**
 * Home page: "which sanatorium suits you?" — opens the 3-question wizard.
 * Shown once, between the resorts and the popular sanatoriums.
 */
export function ChooseCard({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="choose-card" aria-labelledby="chooseCardTitle">
      <ChooseArt />
      <div className="choose-txt">
        <h2 id="chooseCardTitle">Какой санаторий подойдёт вам?</h2>
        <p>Ответьте на 3 вопроса — подберём варианты по вашим пожеланиям.</p>
      </div>
      <button type="button" className="choose-btn" aria-haspopup="dialog" onClick={onOpen}>
        Ответить на 3 вопроса
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </section>
  );
}

const G = '#1F5F4A';

/** A folded map and three sanatorium cards, the middle one ticked; a small question mark above. */
function ChooseArt() {
  const building = (x: number, y: number) => (
    <g fill="none" stroke={G} strokeWidth="1.4" strokeLinejoin="round">
      <path d={`M${x - 11} ${y + 18}V${y + 3}l11-6 11 6v15`} />
      <path d={`M${x - 15} ${y + 18}h30`} strokeLinecap="round" />
      <path
        d={`M${x - 6} ${y + 5}h3M${x + 3} ${y + 5}h3M${x - 6} ${y + 10}h3M${x + 3} ${y + 10}h3M${x - 2} ${y + 18}v-4h4v4`}
        strokeLinecap="round"
      />
    </g>
  );
  const card = (x: number, y: number, on: boolean) => (
    <g>
      <rect
        x={x}
        y={y}
        width="52"
        height="64"
        rx="5"
        fill={on ? '#E1EFE5' : '#FBF8F1'}
        stroke={G}
        strokeWidth={on ? 2 : 1.4}
      />
      {building(x + 26, y + 15)}
      <path
        d={`M${x + 12} ${y + 44}h28M${x + 12} ${y + 51}h20`}
        stroke={on ? G : '#9DB8A9'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg className="choose-art" viewBox="0 0 326 118" role="img" aria-label="Карта и три санатория на выбор">
      {/* folded map */}
      <g strokeLinejoin="round">
        <path d="M2 42 50 28 56 102 8 116Z" fill="#F7F1E3" stroke={G} strokeWidth="1.5" />
        <path d="M50 28 100 42 104 112 56 102Z" fill="#E2EEE4" stroke={G} strokeWidth="1.5" />
        <path d="M100 42 148 26 152 96 104 112Z" fill="#F7F1E3" stroke={G} strokeWidth="1.5" />
        <path d="M12 62 38 54 42 84 16 92Z" fill="#CFE3D5" />
        <path d="M112 62 138 52 141 78 115 86Z" fill="#CFE3D5" />
        <path
          d="M16 104C34 94 50 80 70 76S106 82 122 70 138 52 144 48"
          fill="none"
          stroke={G}
          strokeWidth="1.3"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
        {[
          [24, 74],
          [33, 68],
          [124, 70],
        ].map(([x, y]) => (
          <path key={x} d={`M${x} ${y - 11}l6 11h-12Z`} fill="#8FBFA5" stroke={G} strokeWidth="1.2" />
        ))}
        <path
          d="M80 74c-6-8-10-12-10-18a10 10 0 0 1 20 0c0 6-4 10-10 18Z"
          fill="#E9B44C"
          stroke={G}
          strokeWidth="1.5"
        />
        <circle cx="80" cy="56" r="3.6" fill="#fff" stroke={G} strokeWidth="1.2" />
      </g>
      {/* question mark */}
      <path
        d="M178 4h22a14 14 0 0 1 0 28h-12l-8 7v-7.4A14 14 0 0 1 178 4Z"
        fill="#fff"
        stroke={G}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x="189"
        y="25"
        textAnchor="middle"
        fontFamily="Montserrat,Manrope,sans-serif"
        fontSize="19"
        fontWeight="700"
        fill={G}
      >
        ?
      </text>
      {/* three sanatoriums, the middle one chosen */}
      {card(150, 48, false)}
      {card(272, 48, false)}
      {card(211, 42, true)}
      <circle cx="237" cy="42" r="10" fill={G} stroke="#fff" strokeWidth="2" />
      <path
        d="M232.4 42.2l3.2 3.1 5.8-6.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M250 22l4-9M258 27l9-5M259 36h9" stroke="#E3A93B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
