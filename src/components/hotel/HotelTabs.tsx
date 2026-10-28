import type { HotelInfo } from '../../data/hotelInfo';
import { DoctorAvatar, PICTO, pick } from './illustrations';
import './HotelTabs.css';

/**
 * Sanatorium page tabs besides "Номера и программы": treatment, meals, about and
 * reviews — iPhone-like grouped lists and tiles, readable at a glance.
 */
export type HotelTab = 'rooms' | 'treat' | 'food' | 'about' | 'reviews';

export const HOTEL_TABS: [HotelTab, string][] = [
  ['rooms', 'Номера и программы'],
  ['treat', 'Лечение'],
  ['food', 'Питание'],
  ['about', 'О санатории'],
  ['reviews', 'Отзывы'],
];

function ToRooms({ onRooms }: { onRooms: () => void }) {
  return (
    <div className="ht-cta">
      <span>Нравится? Выберите номер и программу — цена сразу на ваши даты.</span>
      <button type="button" className="btn btn-primary" onClick={onRooms}>
        Выбрать номер →
      </button>
    </div>
  );
}

function Treat({ info, onRooms }: { info: HotelInfo; onRooms: () => void }) {
  const t = info.text.treatment;
  const doctors = t.doctors.length
    ? t.doctors
    : [
        { name: '', specialty: 'Врач-терапевт', source: '' },
        { name: '', specialty: 'Врач-физиотерапевт', source: '' },
        { name: '', specialty: 'Врач-реабилитолог', source: '' },
      ];
  return (
    <div className="ht ios-in">
      <p className="ht-lead">{t.lead}</p>
      {t.profiles.length ? (
        <section className="ht-sec">
          <h3>Что лечат</h3>
          <div className="ht-tiles">
            {t.profiles.map((p) => (
              <div className="ht-tile" key={p}>
                <span className="ht-ico">{pick(p, 'heart')}</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {t.naturalFactors ? (
        <div className="ht-callout">
          <span className="ht-ico">{PICTO.water}</span>
          <div>
            <strong>Природные лечебные факторы</strong>
            <span>{t.naturalFactors}</span>
          </div>
        </div>
      ) : null}
      {t.procedures.length ? (
        <section className="ht-sec">
          <h3>Процедуры</h3>
          <div className="ios-list">
            {t.procedures.map((p) => (
              <div className="ios-row" key={p.name}>
                <span className="ios-ico">{pick(p.name, 'physio')}</span>
                <span className="ios-main">
                  <strong>{p.name}</strong>
                  {p.note ? <span className="ios-sub">{p.note}</span> : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {t.howItWorks.length ? (
        <section className="ht-sec">
          <h3>Как проходит лечение</h3>
          <ol className="ht-steps">
            {t.howItWorks.map((s, i) => (
              <li key={i}>
                <span className="ht-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <section className="ht-sec">
        <h3>Врачи</h3>
        <div className="ht-docs">
          {doctors.map((d, i) => (
            <div className="ht-doc" key={d.name + d.specialty}>
              <DoctorAvatar variant={i} />
              <strong>{d.name || d.specialty}</strong>
              <span>{d.name ? d.specialty : 'консультация при заезде'}</span>
            </div>
          ))}
        </div>
        <span className="ht-foot">
          Портреты — иллюстрации; фото врачей добавим, когда санаторий их пришлёт. Процедуры назначает врач после
          консультации.
        </span>
      </section>
      <ToRooms onRooms={onRooms} />
    </div>
  );
}

function Food({ info, onRooms }: { info: HotelInfo; onRooms: () => void }) {
  const m = info.text.meals;
  const day: [string, string, string[]][] = [
    ['breakfast', 'Завтрак', m.sampleDay.breakfast],
    ['lunch', 'Обед', m.sampleDay.lunch],
    ['dinner', 'Ужин', m.sampleDay.dinner],
  ];
  return (
    <div className="ht ios-in">
      <p className="ht-lead">{m.lead}</p>
      <div className="ht-stats">
        {m.format ? (
          <div className="ht-stat">
            <span className="ht-ico">{PICTO.meals}</span>
            <strong>{m.format}</strong>
            <span>формат питания</span>
          </div>
        ) : null}
        {m.mealsPerDay ? (
          <div className="ht-stat">
            <span className="ht-ico">{PICTO.lunch}</span>
            <strong>{m.mealsPerDay}</strong>
            <span>в день</span>
          </div>
        ) : null}
        {m.diets.length ? (
          <div className="ht-stat">
            <span className="ht-ico">{PICTO.diet}</span>
            <strong>Диетическое меню</strong>
            <span>по назначению врача</span>
          </div>
        ) : null}
      </div>
      {m.sampleDay.breakfast.length ? (
        <section className="ht-sec">
          <h3>{m.typical ? 'Примерное меню на день' : 'Меню на день'}</h3>
          <div className="ht-menu">
            {day.map(([k, title, items]) => (
              <div className="ht-meal" key={k}>
                <span className="ht-ico big">{PICTO[k]}</span>
                <strong>{title}</strong>
                <ul>
                  {items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {m.typical ? <span className="ht-foot">Пример — меню меняется каждый день.</span> : null}
        </section>
      ) : null}
      {m.diets.length ? (
        <section className="ht-sec">
          <h3>Особое питание</h3>
          <div className="ht-chips">
            {m.diets.map((d) => (
              <span className="ht-chip" key={d}>
                {PICTO.check}
                {d}
              </span>
            ))}
          </div>
        </section>
      ) : null}
      {m.restaurant || m.notes ? (
        <div className="ht-callout">
          <span className="ht-ico">{PICTO.dinner}</span>
          <div>
            {m.restaurant ? <strong>{m.restaurant}</strong> : null}
            {m.notes ? <span>{m.notes}</span> : null}
          </div>
        </div>
      ) : null}
      <ToRooms onRooms={onRooms} />
    </div>
  );
}

function About({ info, onRooms, onPhoto }: { info: HotelInfo; onRooms: () => void; onPhoto: (i: number) => void }) {
  const a = info.text.about;
  return (
    <div className="ht ios-in">
      <p className="ht-lead">{a.lead}</p>
      {a.paragraphs.map((p, i) => (
        <p className="ht-p" key={i}>
          {p}
        </p>
      ))}
      <div className="ht-photos">
        {info.photos.slice(0, 6).map((p, i) => (
          <button type="button" key={p.src + i} onClick={() => onPhoto(i)} aria-label={'Фото: ' + p.alt}>
            <img src={p.src} alt="" />
            <span>{p.alt}</span>
          </button>
        ))}
      </div>
      {a.facts.length ? (
        <section className="ht-sec">
          <h3>Коротко</h3>
          <div className="ios-list">
            {a.facts.map(([k, v]) => (
              <div className="ios-row" key={k}>
                <span className="ios-main">
                  <span className="ios-sub">{k}</span>
                </span>
                <span className="ht-fact">{v}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {a.amenities.length ? (
        <section className="ht-sec">
          <h3>Что есть на месте</h3>
          <div className="ht-tiles">
            {a.amenities.map((x) => (
              <div className="ht-tile" key={x}>
                <span className="ht-ico">{pick(x)}</span>
                <span>{x}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {a.location ? (
        <div className="ht-callout">
          <span className="ht-ico">{PICTO.pin}</span>
          <div>
            <strong>
              {info.resort} · {info.address}
            </strong>
            <span>{a.location}</span>
          </div>
        </div>
      ) : null}
      {info.text.website ? (
        <span className="ht-foot">
          Описание — по материалам сайта санатория:{' '}
          <a href={info.text.website} target="_blank" rel="noreferrer">
            {info.text.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
        </span>
      ) : null}
      <ToRooms onRooms={onRooms} />
    </div>
  );
}

const AV_COLORS = ['#E6F2EA', '#EEE9F7', '#FFF1DC', '#E4EEF6', '#FCEDE9'];

function Reviews({ info, onRooms }: { info: HotelInfo; onRooms: () => void }) {
  const r = info.rating;
  const word = r.avg >= 9 ? 'Превосходно' : r.avg >= 8.5 ? 'Отлично' : 'Очень хорошо';
  return (
    <div className="ht ios-in">
      <div className="ht-score">
        <div className="ht-score-big">
          <strong>{r.avg.toFixed(1).replace('.', ',')}</strong>
          <span>
            {word}
            <br />
            {info.reviewsN} отзывов
          </span>
        </div>
        <div className="ht-bars">
          {r.cats.map(([k, v]) => (
            <div className="ht-bar" key={k}>
              <span>{k}</span>
              <i>
                <b style={{ width: v * 10 + '%' }} />
              </i>
              <strong>{v.toFixed(1).replace('.', ',')}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="ht-reviews">
        {info.reviews.map((x, i) => (
          <article className="ht-review" key={x.name + x.when}>
            <header>
              <span className="ht-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>
                {x.name
                  .split(/\s+и\s+|\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </span>
              <span className="ht-who">
                <strong>{x.name}</strong>
                <span>
                  {x.city} · {x.trip}
                </span>
              </span>
              <span className="ht-rate">{x.rating}</span>
            </header>
            <p>{x.text}</p>
            <span className="ht-when">{x.when}</span>
          </article>
        ))}
      </div>
      <span className="ht-foot">[ПРИМЕР ОТЗЫВОВ — заменим настоящими отзывами гостей]</span>
      <ToRooms onRooms={onRooms} />
    </div>
  );
}

export function HotelTabContent({
  tab,
  info,
  onRooms,
  onPhoto,
}: {
  tab: HotelTab;
  info: HotelInfo;
  onRooms: () => void;
  onPhoto: (i: number) => void;
}) {
  if (tab === 'treat') return <Treat info={info} onRooms={onRooms} />;
  if (tab === 'food') return <Food info={info} onRooms={onRooms} />;
  if (tab === 'about') return <About info={info} onRooms={onRooms} onPhoto={onPhoto} />;
  if (tab === 'reviews') return <Reviews info={info} onRooms={onRooms} />;
  return null;
}
