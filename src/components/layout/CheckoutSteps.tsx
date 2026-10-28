import { Fragment } from 'react';
import './CheckoutSteps.css';

export const STEP_LABELS_RU = ['Номер', 'Дорога', 'Гости', 'Оплата', 'Готово'];

/**
 * Progress of the booking: 4 steps and the finish flag
 * (Номер → Дорога → Гости → Оплата → Готово).
 * `current` is 1–4 for a step, 5 when the order is placed.
 */
export function CheckoutSteps({
  current,
  labels = STEP_LABELS_RU,
  compact = false,
}: {
  current: 1 | 2 | 3 | 4 | 5;
  labels?: string[];
  compact?: boolean;
}) {
  const steps = labels.slice(0, -1);
  const finished = current > steps.length;
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
      <div
        className={'checkout-steps' + (compact ? ' compact' : '')}
        aria-label="Шаги оформления"
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: compact ? '10px 24px' : '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '18px' : '22px',
          flexWrap: 'wrap',
        }}
      >
        {steps.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'on' : '';
          return (
            <Fragment key={n}>
              <div className={'step ' + state} aria-current={state === 'on' ? 'step' : undefined}>
                <span className="num">{state === 'done' ? '✓' : n}</span>
                {label}
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CFC9BB"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Fragment>
          );
        })}
        <div
          className={'step' + (finished ? ' on' : '')}
          aria-current={finished ? 'step' : undefined}
          style={{ gap: '8px' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={finished ? '#1F5F4A' : '#8A968F'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
          </svg>
          {labels[labels.length - 1]}
        </div>
      </div>
    </div>
  );
}
