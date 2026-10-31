import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  RESORT_STORIES,
  type FunKind,
  type Resort,
  type ResortIcon,
  type Sight,
  type SightPhoto,
} from '../data/resorts';
import { resortPath } from '../lib/seo';

const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/** "Чем заняться вне санатория": the groups, in this order on every resort */
const FUN: Record<FunKind, { t: string; d: string }> = {
  museum: { t: 'Музеи и история', d: 'M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18' },
  park: {
    t: 'Парки и прогулки',
    d: 'M12 21v-5M12 16c-3.5 0-6-2.2-6-5.2C6 7.5 8.7 3 12 3s6 4.5 6 7.8c0 3-2.5 5.2-6 5.2zM8 21h8',
  },
  water: {
    t: 'Пляжи и вода',
    d: 'M2 12c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 7.5a4 4 0 0 1 8 0',
  },
  evening: {
    t: 'Развлечения и вечера',
    d: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  },
  trip: {
    t: 'Поездки на день',
    d: 'M5 17V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V17zM5 12h14M8 17v3M16 17v3M8.5 14.5h.01M15.5 14.5h.01',
  },
};
const RAIN = 'M3 12a9 9 0 0 1 18 0zM12 12v6.5a2 2 0 0 0 4 0';
const PIN =
  'M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21zM12 12.3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';

const commons = (file: string) =>
  'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_'));

/** a photo with its credit: who made it and the licence, linked to the file on Wikimedia Commons */
function SightPic({ p }: { p: SightPhoto }) {
  return (
    <figure className={'rs-pic' + (p.wide ? ' wide' : '')}>
      <img src={p.src} alt={p.alt} loading="lazy" style={p.pos ? { objectPosition: p.pos } : undefined} />
      <figcaption>
        <a href={commons(p.file)} target="_blank" rel="noopener noreferrer">
          {p.cap ? p.cap : 'Фото: ' + p.by} · {p.lic} · Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}

/** a place worth seeing: the photo on the left (on top on a phone), what it is, when and who, how to get there */
function SightRow({ s }: { s: Sight }) {
  const wide = s.photos.length > 1 || s.photos.some((p) => p.wide);
  return (
    <li className={'rs-sight' + (wide ? ' rs-sight-wide' : '')}>
      <div className={'rs-pics' + (s.photos.length > 1 ? ' two' : '')}>
        {s.photos.map((p) => (
          <SightPic key={p.src} p={p} />
        ))}
      </div>
      <div className="rs-sight-t">
        <strong>{s.t}</strong>
        {s.meta ? <span className="rs-sight-meta">{s.meta}</span> : null}
        <p>{s.d}</p>
        {s.go ? (
          <span className="rs-sight-go">
            <Ico d={PIN} size={18} />
            {s.go}
          </span>
        ) : null}
      </div>
    </li>
  );
}

const ICON: Record<ResortIcon, string> = {
  water: 'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11zM9.5 15a2.5 2.5 0 0 0 2.5 2.5',
  mud: 'M4 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4-1.5M4 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4-1.5M8 10a4 4 0 0 1 8 0',
  pine: 'M12 3 6 11h3l-4 6h14l-4-6h3zM12 17v4',
  sea: 'M2 9c2 0 2-1.5 4-1.5S8 9 10 9s2-1.5 4-1.5S16 9 18 9s2-1.5 4-1.5M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5',
  river: 'M4 4c4 0 6 3 6 6s2 6 6 6h4M4 9c2 0 3 1.5 3 3s1 4 4 4M14 4h6',
  quiet: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  spa: 'M12 21c-4-2-7-5-7-9 3 0 5 1.5 7 4 2-2.5 4-4 7-4 0 4-3 7-7 9zM12 16c0-4 0-7 0-12',
};

/**
 * "Выберите курорт": a big pop-up that scrolls inside — a story for first-time guests of 60+:
 * why people come, three weeks on the resort told week by week, what there is to do outside the
 * sanatorium (museums, parks, beaches and water, evenings, day trips, a rainy day), a usual day,
 * good to know, the film, the sanatoriums. «Закрыть» is always at hand (top and bottom);
 * «Хочу в …» puts the resort into the search form above. Other resorts are one tap away.
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
  const scroller = useRef<HTMLDivElement>(null);
  // another resort: start reading it from the top
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [id]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  if (!r) return null;
  return (
    <div className="rs-overlay" data-canvas="resort-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="rsTitle" className="rs">
        {/* always at hand, whatever is scrolled */}
        <button type="button" className="rs-close" onClick={onClose} aria-label="Закрыть">
          ✕<span> Закрыть</span>
        </button>
        <div className="rs-scroll" ref={scroller}>
          <div className="rs-hero" style={{ backgroundImage: `url(${r.hero})` }}>
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
          <ResortStory r={r} />
        </div>
        <div className="rs-foot">
          <button type="button" className="btn btn-primary rs-go" onClick={() => onChoose(r.id)}>
            Хочу в {r.nameTo}
            <span className="rs-go-more"> — подобрать санаторий</span>
          </button>
          <span className="rs-foot-note">
            Курорт подставим в поиск — останется выбрать даты.{' '}
            <Link to={resortPath(r.id)} onClick={onClose}>
              Ссылка на эту страницу
            </Link>
          </span>
          <button type="button" className="btn btn-secondary rs-close-b" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The resort's story — why people come, three weeks told week by week, what to see, a usual
 * day, good to know, the film, the facts and the sanatoriums. Shown in the «Выберите курорт»
 * window and on the resort's own page (/kurort/<id>), which search engines can find.
 */
export function ResortStory({ r }: { r: Resort }) {
  return (
    <div className="rs-body">
      <div className="rs-main">
        {r.story.map((p, i) => (
          <p key={i} className={i === 0 ? 'rs-lead' : ''}>
            {p}
          </p>
        ))}
        <h3>Почему сюда едут</h3>
        <ul className="rs-why">
          {r.why.map((w) => (
            <li key={w.t}>
              <span className="rs-ico" aria-hidden="true">
                <Ico d={ICON[w.icon]} size={26} />
              </span>
              <span>
                <strong>{w.t}</strong>
                <span>{w.d}</span>
              </span>
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
        <h3>Три недели на курорте: как это может быть</h3>
        <p className="rs-sub">Лечение — в первой половине дня. Остальное время ваше.</p>
        <ol className="rs-weeks">
          {r.weeks.map((w, i) => (
            <li key={w.t}>
              <span className="rs-wk" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong>{w.t}</strong>
                <span>{w.d}</span>
              </span>
            </li>
          ))}
        </ol>
        {r.sights.length ? (
          <>
            <h3>Что стоит увидеть</h3>
            <p className="rs-sub">Музеи, храмы, парки и окрестности — всё в спокойном темпе.</p>
            <ul className="rs-sights">
              {r.sights.map((s) => (
                <SightRow key={s.t} s={s} />
              ))}
            </ul>
          </>
        ) : null}
        <h3>{r.sights.length ? 'Ещё чем заняться' : 'Чем заняться вне санатория'}</h3>
        <div className="rs-fun">
          {r.fun.map((g) => (
            <section key={g.kind} className="rs-fun-g" aria-label={FUN[g.kind].t}>
              <h4>
                <span className="rs-ico rs-ico-s" aria-hidden="true">
                  <Ico d={FUN[g.kind].d} size={22} />
                </span>
                {FUN[g.kind].t}
              </h4>
              <ul className="rs-list">
                {g.items.map((it) => (
                  <li key={it.t}>
                    <strong>{it.t}</strong>
                    <span>{it.d}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="rs-rain">
          <span className="rs-ico rs-ico-s" aria-hidden="true">
            <Ico d={RAIN} size={22} />
          </span>
          <span>
            <strong>Если идёт дождь: </strong>
            {r.rain}
          </span>
        </p>
        <h3>Как проходит день на курорте</h3>
        <ol className="rs-day">
          {r.day.map((d) => (
            <li key={d.time + d.t}>
              <time>{d.time}</time>
              <span>
                <strong>{d.t}</strong>
                {d.d ? <span>{d.d}</span> : null}
              </span>
            </li>
          ))}
        </ol>
        <h3>Полезно знать</h3>
        <ul className="rs-tips">
          {r.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <aside className="rs-side">
        {r.video ? (
          /* a picture of the film with a link to YouTube (no player on the page) */
          <a
            className="rs-yt"
            href={'https://www.youtube.com/watch?v=' + r.video.id}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={'Смотреть видео на YouTube: ' + r.video.title}
          >
            <span className="rs-yt-pic">
              {/* the resort's own photo under the YouTube frame: shows if the frame does not load */}
              <img className="rs-yt-bg" src={r.hero} alt="" />
              <img
                className="rs-yt-thumb"
                src={'https://i.ytimg.com/vi/' + r.video.id + '/hqdefault.jpg'}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <span className="rs-yt-play" aria-hidden="true">
                <svg width="68" height="48" viewBox="0 0 68 48">
                  <path
                    d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.4 34 .4 34 .4s-21.2 0-26.5 1.3a8.5 8.5 0 0 0-6 6C.2 13 .2 24 .2 24s0 11 1.3 16.3a8.5 8.5 0 0 0 6 6C12.8 47.6 34 47.6 34 47.6s21.2 0 26.5-1.3a8.5 8.5 0 0 0 6-6C67.8 35 67.8 24 67.8 24s0-11-1.3-16.3z"
                    fill="var(--danger)"
                  />
                  <path d="M45 24 27 14v20z" fill="var(--paper)" />
                </svg>
              </span>
            </span>
            <span className="rs-yt-cap">
              <strong>{r.video.title}</strong>
              <span>Смотреть на YouTube · на русском · {r.video.by} ↗</span>
            </span>
          </a>
        ) : null}
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
  );
}
