import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RESORT_STORIES } from '../data/resorts';

/**
 * "Выберите курорт": a big pop-up with a short story for first-time guests — photos,
 * the resort's film, what to see, which sanatoriums we have there — and one button
 * that puts the resort into the search form above. Other resorts are one tap away.
 */
export function ResortModal({
  id,
  onClose,
  onSwitch,
  onChoose,
}: {
  id: string;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onChoose: (id: string) => void;
}) {
  const r = RESORT_STORIES.find((x) => x.id === id);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  if (!r) return null;
  return (
    <div className="rs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="rsTitle" className="rs">
        <div className="rs-hero" style={{ backgroundImage: `url(${r.hero})` }}>
          <button type="button" className="btn btn-secondary rs-close" onClick={onClose}>
            ✕ Закрыть
          </button>
          <div className="rs-hero-text">
            <h2 id="rsTitle">{r.name}</h2>
            <span>{r.tagline}</span>
          </div>
        </div>
        <div className="rs-tabs" role="tablist" aria-label="Курорты">
          {RESORT_STORIES.map((x) => (
            <button
              type="button"
              role="tab"
              key={x.id}
              aria-selected={x.id === r.id}
              className={x.id === r.id ? 'on' : ''}
              onClick={() => onSwitch(x.id)}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="rs-body">
          <div className="rs-main">
            {r.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <h3>Что посмотреть</h3>
            <ul className="rs-sights">
              {r.sights.map((s) => (
                <li key={s.t}>
                  <strong>{s.t}</strong>
                  <span>{s.d}</span>
                </li>
              ))}
            </ul>
            {r.gallery.length ? (
              <div className="rs-gallery">
                {r.gallery.map((g) => (
                  <img key={g.src} src={g.src} alt={g.alt} />
                ))}
              </div>
            ) : null}
          </div>
          <aside className="rs-side">
            {r.video ? (
              <iframe
                className="rs-video"
                src={r.video}
                title={'Видео о курорте ' + r.name}
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="rs-video rs-video-empty" role="img" aria-label="Видео о курорте">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 8l6 4-6 4z" fill="#fff" />
                </svg>
                <span>Видео о курорте от туристического центра · [ДОБАВИТЬ ССЫЛКУ]</span>
              </div>
            )}
            <dl className="rs-facts">
              {r.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {r.sanatoriums.length ? (
              <div className="rs-sans">
                <h3>Санатории</h3>
                <div className="rs-san-list">
                  {r.sanatoriums.map((s) =>
                    s.id ? (
                      <Link key={s.name} className="ps-chip" to={'/results?h=' + s.id}>
                        {s.name}
                      </Link>
                    ) : (
                      <span key={s.name} className="ps-chip rs-chip-off">
                        {s.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
        <div className="rs-foot">
          <button type="button" className="btn btn-primary rs-go" onClick={() => onChoose(r.id)}>
            Хочу в {r.name} — подобрать санаторий
          </button>
          <span>Курорт подставим в поиск — останется выбрать даты.</span>
        </div>
      </div>
    </div>
  );
}
