import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RoomPhoto } from '../data/roomPhotos';
import './RoomGallery.css';

/**
 * Mini gallery of a room: the big photo, ‹ › and a row of small photos; arrows, a swipe on a
 * phone, ← → and Esc on a keyboard. «Закрыть» at the top and a tap outside close it.
 */
export function RoomGallery({
  title,
  photos,
  start = 0,
  onClose,
}: {
  title: string;
  photos: RoomPhoto[];
  start?: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const n = photos.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const touch = useRef<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', k);
    const html = document.documentElement;
    const was = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      html.style.overflow = was;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = photos[i];
  // on top of everything, outside the room card (its animations would trap a fixed layer)
  return createPortal(
    <div className="rg-overlay" data-canvas="room-gallery" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="rg"
        role="dialog"
        aria-modal="true"
        aria-label={'Фото: ' + title}
        tabIndex={-1}
        ref={box}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="rg-top">
          <span className="rg-title">
            <strong>{title}</strong>
            <span>
              {i + 1} из {n} · {p.alt}
            </span>
          </span>
          <button type="button" className="rg-close" onClick={onClose}>
            ✕ Закрыть
          </button>
        </div>
        <div className="rg-stage">
          <img key={p.src} className="rg-img" src={p.src} alt={p.alt} />
          {n > 1 ? (
            <>
              <button type="button" className="rg-nav rg-prev" aria-label="Предыдущее фото" onClick={() => go(-1)}>
                ‹
              </button>
              <button type="button" className="rg-nav rg-next" aria-label="Следующее фото" onClick={() => go(1)}>
                ›
              </button>
            </>
          ) : null}
        </div>
        {n > 1 ? (
          <div className="rg-thumbs" role="group" aria-label="Все фото номера">
            {photos.map((t, k) => (
              <button
                type="button"
                key={t.src}
                className={'rg-thumb' + (k === i ? ' on' : '')}
                aria-label={'Фото ' + (k + 1) + ': ' + t.alt}
                aria-current={k === i}
                onClick={() => setI(k)}
              >
                <img src={t.src} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
