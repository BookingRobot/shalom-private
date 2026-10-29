import { useRef, useState, type ReactNode } from 'react';
import './InfoTip.css';

/**
 * A title with a small «i»: the extra explanation is not on the page but in a balloon that
 * opens under the title on a tap (and closes on a second tap or a tap elsewhere). Fewer words
 * on the screen; the details are one tap away. It sits inside choice buttons, so a tap on «i»
 * never selects the option. Without scripts (the design canvas) focus alone opens it.
 */
export function InfoTitle({
  title,
  info,
  extra,
}: {
  title: ReactNode;
  /** the explanation shown in the balloon */
  info: ReactNode;
  /** things that stay next to the title (a stamp, a badge) */
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const was = useRef(false);
  return (
    <span className={'info-host' + (open ? ' open' : '')}>
      <span className="info-line">
        {typeof title === 'string' ? <strong>{title}</strong> : title}
        <span
          className="info-tip"
          role="button"
          tabIndex={0}
          aria-label="Подробнее"
          aria-expanded={open}
          onMouseDown={(e) => {
            was.current = document.activeElement === e.currentTarget;
            // no focus (and no balloon) on press: the balloon opens on the click itself, so the
            // answer around it does not move under the finger and does not get chosen by mistake
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const el = e.currentTarget;
            if (was.current) el.blur();
            else el.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setOpen((o) => !o);
            } else if (e.key === 'Escape') e.currentTarget.blur();
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          i
        </span>
        {extra}
      </span>
      <span className="info-pop" role="note">
        {info}
      </span>
    </span>
  );
}
