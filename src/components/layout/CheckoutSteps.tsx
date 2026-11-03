import { Fragment, useEffect, useState } from 'react';
import { StepNotice } from '../StepGuard';
import { t } from '../../i18n/t';
import './CheckoutSteps.css';

/** the steps' names in the page's language */
export const stepLabels = () =>
  (['rooms', 'transfer', 'guests', 'payment', 'done'] as const).map((k) => t(`steps.labels.${k}`));
/** kept for older callers */
export const STEP_LABELS_RU = ['Номер', 'Дорога', 'Гости', 'Оплата', 'Готово'];

/**
 * Progress of the booking: 4 steps and the finish flag
 * (Номер → Дорога → Гости → Оплата → Готово).
 * `current` is 1–4 for a step, 5 when the order is placed.
 */
export function CheckoutSteps({
  current,
  labels = stepLabels(),
  compact = false,
}: {
  current: 1 | 2 | 3 | 4 | 5;
  labels?: string[];
  compact?: boolean;
}) {
  const steps = labels.slice(0, -1);
  const finished = current > steps.length;
  // phone: only the numbers; a tap shows the step's name for a moment
  const [tip, setTip] = useState(-1);
  useEffect(() => {
    if (tip < 0) return;
    const t = window.setTimeout(() => setTip(-1), 2600);
    return () => window.clearTimeout(t);
  }, [tip]);
  const tipOf = (i: number) =>
    tip === i ? (
      <span className="step-tip" role="status">
        {i < steps.length ? t('steps.step', { n: i + 1 }) + ' · ' : ''}
        {labels[i]}
      </span>
    ) : null;
  return (
    <div className={'checkout-steps-bar' + (finished ? ' fin' : '')}>
      {/* phone: one line in words — «Шаг 2 из 4 · Дорога» — and four short bars */}
      {finished ? null : (
        <div className="steps-phone">
          <span className="steps-phone-t">
            {t('steps.stepOf', { n: current, total: steps.length })} · <strong>{labels[current - 1]}</strong>
          </span>
          <span className="steps-phone-bar" aria-hidden="true">
            {steps.map((_, i) => (
              <i key={i} className={i + 1 < current ? 'done' : i + 1 === current ? 'on' : ''} />
            ))}
          </span>
        </div>
      )}
      <div className={'checkout-steps' + (compact ? ' compact' : '')} aria-label={t('steps.aria')}>
        {steps.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'on' : '';
          return (
            <Fragment key={n}>
              <button
                type="button"
                className={'step ' + state}
                aria-current={state === 'on' ? 'step' : undefined}
                aria-label={t('steps.step', { n }) + ': ' + label}
                onClick={() => setTip(tip === i ? -1 : i)}
              >
                <span className="num">{state === 'done' ? '✓' : n}</span>
                <span className="step-l">{label}</span>
                {tipOf(i)}
              </button>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Fragment>
          );
        })}
        <button
          type="button"
          className={'step' + (finished ? ' on' : '')}
          aria-current={finished ? 'step' : undefined}
          aria-label={labels[labels.length - 1]}
          onClick={() => setTip(tip === steps.length ? -1 : steps.length)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={finished ? 'var(--green)' : 'var(--muted-2)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
          </svg>
          <span className="step-l">{labels[labels.length - 1]}</span>
          {tipOf(steps.length)}
        </button>
      </div>
      <StepNotice />
    </div>
  );
}
