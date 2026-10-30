import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
  tag: Tag = 'strong',
  id,
  style,
}: {
  title: ReactNode;
  /** the explanation shown in the balloon */
  info: ReactNode;
  /** things that stay next to the title (a stamp, a badge) */
  extra?: ReactNode;
  /** the title as a heading (step titles) */
  tag?: 'strong' | 'span' | 'h1' | 'h2' | 'h3';
  id?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const was = useRef(false);
  const tip = (
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
  );
  // the «i» is glued to the last word: it never drops onto a line of its own
  const glued = (t: string) => {
    const k = t.trimEnd().lastIndexOf(' ');
    return (
      <>
        {k > 0 ? t.slice(0, k + 1) : ''}
        <span className="info-glue">
          {k > 0 ? t.slice(k + 1).trimEnd() : t.trimEnd()}
          {tip}
        </span>
      </>
    );
  };
  return (
    <span className={'info-host' + (open ? ' open' : '')}>
      <span className="info-line">
        {typeof title === 'string' ? (
          <Tag className="info-t" id={id} style={style}>
            {glued(title)}
          </Tag>
        ) : (
          <>
            {title}
            {tip}
          </>
        )}
        {extra ? <span className="info-extra">{extra}</span> : null}
      </span>
      <span className="info-pop" role="note">
        {info}
      </span>
    </span>
  );
}
