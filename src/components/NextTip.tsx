import type { ReactNode } from 'react';
import './NextTip.css';

/**
 * «What to do now»: the green bubble that hops over the next thing to press — the rooms of
 * the first sanatorium, the cheapest free room, «Далее» of a step. One at a time on a page,
 * so a guest of any age is led step by step to the order.
 *
 * `float`: sits above its anchor (the parent needs `position: relative`) instead of in the flow;
 * `arrow`: where the little arrow points down — the middle or near the right edge.
 */
export function NextTip({
  children,
  onClose,
  float = false,
  arrow = 'center',
  className = '',
}: {
  children: ReactNode;
  onClose?: () => void;
  float?: boolean;
  arrow?: 'center' | 'right';
  className?: string;
}) {
  return (
    <div
      className={
        'next-tip' + (float ? ' next-tip-float' : '') + ' next-tip-' + arrow + (className ? ' ' + className : '')
      }
      role="status"
    >
      <span className="next-tip-t">{children}</span>
      {onClose ? (
        <button type="button" className="next-tip-x" aria-label="Скрыть подсказку" onClick={onClose}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
