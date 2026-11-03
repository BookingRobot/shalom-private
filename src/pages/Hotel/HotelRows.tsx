import type { ReactNode } from 'react';
import { VanIcon } from '../../components/icons';
import { CLOCK_D, Chevron, HotelIcon, INFO_D, StepArrow } from './hotelIcons';
import type { Specialization, StayTimes } from './hotelTypes';

/** A fold-out row: the button, then (when open) its content as the next sibling. */
function Row({
  icon,
  title,
  open,
  toggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  open: boolean;
  toggle: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <button type="button" className="accrow" onClick={toggle} aria-expanded={open}>
        <span className="hr-row-t">
          {icon}
          {title}
        </span>
        <Chevron />
      </button>
      {open ? <div className="hr-body">{children}</div> : null}
    </>
  );
}

const FILM = [
  {
    img: '/img/39ad8fe2bfcea92423d717bc9dac8f37.png',
    alt: 'Водитель встречает с табличкой',
    t: 'Встретим с табличкой',
    s: 'Водитель ждёт в зале прилёта с вашей фамилией',
  },
  {
    img: '/img/838118fe86e78736560c2ece8886b813.png',
    alt: 'Водитель укладывает чемодан в багажник',
    t: 'Поможем с багажом',
    s: 'Чемоданы — в багажник, вам ничего нести не нужно',
  },
  {
    img: '/img/565b4c9fbca5b96b414361547b3a452f.png',
    alt: 'Микроавтобус едет к санаторию',
    t: 'Довезём до санатория',
    s: 'Остановки по пути — по вашей просьбе',
  },
  {
    img: '/img/05b41fccbf0a437d88db58e3ce3a1a91.png',
    alt: 'Гость у стойки регистрации санатория',
    t: 'Проводим до стойки',
    s: 'Передадим администратору, обратно — так же',
  },
];

/** «Как добраться»: distance, the four steps of the transfer, the two rules. */
export function HotelTransferRow({
  title,
  open,
  toggle,
  freeTr,
}: {
  title: string;
  open: boolean;
  toggle: () => void;
  freeTr: string;
}) {
  return (
    <Row icon={<VanIcon height={22} />} title={title} open={open} toggle={toggle}>
      <div className="hr-facts">
        <span className="ico">
          <HotelIcon d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
          Из аэропорта Вильнюса — <strong>130 км</strong>
        </span>
        <span className="ico">
          <HotelIcon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" />В пути <strong>около 2 часов</strong>
        </span>
        <span className="ico">
          <VanIcon height={20} />
          Также из Каунаса, Варшавы, Мариямполе
        </span>
      </div>
      <div className="hr-film-box">
        <div className="hr-film-lead">{freeTr}</div>
        <div className="hr-film-k">Как проходит трансфер</div>
        <div className="hr-film">
          {FILM.map((f, i) => (
            <div className="hr-film-step-wrap" key={f.t}>
              {i ? <StepArrow /> : null}
              <div className="hr-film-step">
                <img src={f.img} alt={f.alt} />
                <span className="hr-film-t">{f.t}</span>
                <span className="hr-film-s">{f.s}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hr-film-rules">
          <span>
            • <strong>Если рейс задерживается</strong> — следим по номеру и ждём без доплаты.
          </span>
          <span>
            • <strong>Обратно</strong> — заберём из санатория так, чтобы вы были в аэропорту за 3 часа до вылета. Точное
            время сообщим за день.
          </span>
        </div>
      </div>
    </Row>
  );
}

/** «Время заезда и выезда»: the two times and the three notes. */
export function HotelTimesRow({ open, toggle, times }: { open: boolean; toggle: () => void; times: StayTimes }) {
  return (
    <Row icon={<HotelIcon d={CLOCK_D} size={22} />} title="Время заезда и выезда" open={open} toggle={toggle}>
      <div className="hr-times">
        <div className="hr-time in">
          <div className="hr-time-ico">
            <HotelIcon d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-5h4v5M9 11h.01M15 11h.01M9 15h.01M15 15h.01" size={30} />
          </div>
          <div className="hr-time-txt">
            <span className="hr-k">Заезд</span>
            <span className="hr-time-big">с {times.checkin}</span>
            <span className="hr-time-date">{times.checkinDate}</span>
          </div>
        </div>
        <div className="hr-time out">
          <div className="hr-time-ico">
            <HotelIcon d="M10 17l5-5-5-5M15 12H3M21 3v18" size={30} />
          </div>
          <div className="hr-time-txt">
            <span className="hr-k">Выезд</span>
            <span className="hr-time-big">до {times.checkout}</span>
            <span className="hr-time-date">{times.checkoutDate}</span>
          </div>
        </div>
      </div>
      <div className="hr-notes">
        {times.notes.map((n) => (
          <div className="ico hr-note-row" key={n.t}>
            <HotelIcon d={n.d} className="hr-note-ico" />
            <span>
              <strong>{n.t}</strong> — {n.s}
            </span>
          </div>
        ))}
      </div>
    </Row>
  );
}

/** «Специализации санатория»: what it treats. */
export function HotelSpecsRow({ open, toggle, specs }: { open: boolean; toggle: () => void; specs: Specialization[] }) {
  return (
    <Row
      icon={
        <HotelIcon
          d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0"
          size={22}
        />
      }
      title="Специализации санатория"
      open={open}
      toggle={toggle}
    >
      <div className="hr-specs">
        {specs.map((s) => (
          <div className="hr-spec" key={s.t}>
            <div className="hr-spec-ico">
              <HotelIcon d={s.d} size={28} width={1.7} />
            </div>
            <div className="hr-spec-txt">
              <strong>{s.t}</strong>
              <span>{s.s}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hr-note hr-note-plain">
        <HotelIcon d={INFO_D} />
        При заезде врач проводит осмотр и подбирает процедуры под ваш профиль. Если сомневаетесь, подходит ли санаторий,
        — позвоните нам, подскажем.
      </div>
    </Row>
  );
}
