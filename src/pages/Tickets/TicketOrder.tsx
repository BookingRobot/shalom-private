import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PhoneField } from '../../components/PhoneField';
import { track } from '../../lib/analytics';
import { checkPhone, nameError } from '../../lib/guestRules';
import { CardForm, cardMissing } from '../../components/CardForm';
import { BirthDateField, birthLabel } from '../../components/BirthDate';
import { PHONE_DISPLAY, PHONE_TEL } from '../../data/contacts';
import { COUNTRIES, FLIGHT_FACTS, type FlightLeg, type Offer } from '../../data/tickets';
import { WEEKDAYS_SHORT, plural, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';

export type OrderStep = 'pax' | 'pay' | 'done';

interface Pax {
  first: string;
  last: string;
  birth: string;
}
interface Saved {
  pax: Pax[];
  code?: string;
  phone: string;
  email: string;
  no: string;
}

const KEY = 'br-shalom:tickets';
const dayLabel = (s: string) => {
  const d = toD(s);
  return WEEKDAYS_SHORT[d.getUTCDay()].toLowerCase() + ', ' + shortDate(d);
};
const passengers = (n: number) => n + ' ' + plural(n, ['пассажир', 'пассажира', 'пассажиров']);

function load(n: number): Saved {
  let s: Partial<Saved> = {};
  try {
    s = JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    /* storage unavailable */
  }
  const pax = Array.from({ length: n }, (_, i) => s.pax?.[i] || { first: '', last: '', birth: '' });
  return { pax, code: s.code || '', phone: s.phone || '', email: s.email || '', no: s.no || '' };
}
function save(v: Saved) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

/** «Рейс → Пассажиры → Оплата»: where the guest is */
function Steps({ at }: { at: number }) {
  const names = ['Рейс', 'Пассажиры', 'Оплата'];
  return (
    <ol className="tk-steps" aria-label="Шаги покупки">
      {names.map((t, i) => (
        <li key={t} className={i + 1 < at ? 'done' : i + 1 === at ? 'on' : ''} aria-current={i + 1 === at}>
          <span>{i + 1 < at ? '✓' : i + 1}</span>
          {t}
        </li>
      ))}
    </ol>
  );
}

/** the chosen flights in two short lines */
function Flights({ offer }: { offer: Offer }) {
  const line = (label: string, l: FlightLeg) => (
    <div className="tk-sum-leg">
      <span className="tk-sum-l">{label}</span>
      <strong>
        {dayLabel(l.date)} · {l.dep} {COUNTRIES[l.from].city} → {l.arr} {COUNTRIES[l.to].city}
      </strong>
      <span className="tk-sum-no">
        {l.no} · {FLIGHT_FACTS.airline}
      </span>
    </div>
  );
  return (
    <div className="tk-sum-legs">
      {line('Туда', offer.there)}
      {offer.back ? line('Обратно', offer.back) : null}
    </div>
  );
}

/**
 * Buying the tickets online (until 24 hours before the departure): names as in the passport for
 * every passenger and where to send the tickets → the whole sum by card → thank you.
 */
export function TicketOrder({
  offer,
  n,
  step,
  go,
  onStay,
}: {
  offer: Offer;
  n: number;
  step: OrderStep;
  go: (s: OrderStep | '') => void;
  onStay?: () => void;
}) {
  const [v, setV] = useState<Saved>(() => load(n));
  const [bad, setBad] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [news, setNews] = useState(false);
  const [agreeBad, setAgreeBad] = useState(false);
  /** what is still empty in the card form */
  const [cardBad, setCardBad] = useState('');
  const [paying, setPaying] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => save(v), [v]);
  useEffect(() => {
    // a new step starts at its top
    const y = (top.current?.getBoundingClientRect().top || 0) + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, [step]);

  const setPax = (i: number, k: keyof Pax, val: string) => {
    setV((o) => ({ ...o, pax: o.pax.map((p, j) => (j === i ? { ...p, [k]: val } : p)) }));
    setBad((b) => {
      const c = { ...b };
      delete c[`p${i}${k}`];
      return c;
    });
  };
  const setField = (k: 'phone' | 'email' | 'code', val: string) => {
    setV((o) => ({ ...o, [k]: val }));
    setBad((b) => {
      const c = { ...b };
      delete c[k];
      return c;
    });
  };

  const checkPax = () => {
    const e: Record<string, string> = {};
    v.pax.forEach((p, i) => {
      // the same rules as step 3 «Гости» (lib/guestRules)
      const fe = nameError(p.first, 'имя');
      if (fe) e[`p${i}first`] = fe;
      const le = nameError(p.last, 'фамилию');
      if (le) e[`p${i}last`] = le;
      if (!p.birth) e[`p${i}birth`] = 'Выберите дату рождения';
    });
    const ph = checkPhone(v.code || '+972 · Израиль', v.phone);
    if (ph.error) e.phone = ph.error;
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Впишите e-mail, например name@gmail.com';
    setBad(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById('tk-' + first)?.focus();
      return;
    }
    go('pay');
  };

  const pay = () => {
    // [ТЕСТОВЫЙ РЕЖИМ] any card details are taken, only empty fields are asked for
    const card = cardMissing('tk');
    if (card.length) {
      setCardBad(card.map((m) => m.label).join(', '));
      document.querySelector<HTMLInputElement>(card[0].target)?.focus();
      return;
    }
    setCardBad('');
    if (!agree) {
      setAgreeBad(true);
      return;
    }
    setPaying(true);
    // [ПРИМЕР] here the card payment of the payment system runs
    window.setTimeout(() => {
      const no = 'TK-' + offer.there.date.slice(2).replace(/-/g, '') + '-' + (100 + Math.floor(Math.random() * 900));
      setV((o) => ({ ...o, no }));
      setPaying(false);
      track('Tickets paid', { passengers: v.pax.length });
      go('done');
    }, 1300);
  };

  const field = (id: string, label: string, input: ReactNode, hint?: string) => (
    <label className={'tk-in' + (bad[id] ? ' bad' : '')}>
      <span className="tk-in-l">{label}</span>
      {input}
      {bad[id] ? (
        <span className="tk-in-err" role="alert">
          {bad[id]}
        </span>
      ) : hint ? (
        <span className="tk-in-h">{hint}</span>
      ) : null}
    </label>
  );
  const total = (
    <div className="tk-sum-total">
      <span>
        {offer.back ? 'Туда и обратно' : 'В одну сторону'}, {passengers(n)}
      </span>
      <strong>{fmt(offer.total)}&nbsp;€</strong>
    </div>
  );

  return (
    <section className="tk-flow" ref={top} key={step} aria-label="Покупка билетов">
      {step !== 'done' ? <Steps at={step === 'pax' ? 2 : 3} /> : null}

      {step === 'pax' ? (
        <div className="tk-flow-in">
          <div className="tk-flow-main">
            <h2>Данные пассажиров</h2>
            <p className="tk-flow-lead">
              Имена и фамилии — как в загранпаспорте, латинскими буквами. Билеты выпишем на эти имена.
            </p>
            {v.pax.map((p, i) => (
              <fieldset className="tk-box" key={i}>
                <legend>Пассажир {i + 1}</legend>
                <div className="tk-grid3">
                  {field(
                    `p${i}first`,
                    'Имя',
                    <input
                      id={`tk-p${i}first`}
                      className="input tk-latin"
                      value={p.first}
                      autoComplete={i ? 'off' : 'given-name'}
                      placeholder="IVAN"
                      onChange={(e) => setPax(i, 'first', e.target.value)}
                    />,
                  )}
                  {field(
                    `p${i}last`,
                    'Фамилия',
                    <input
                      id={`tk-p${i}last`}
                      className="input tk-latin"
                      value={p.last}
                      autoComplete={i ? 'off' : 'family-name'}
                      placeholder="PETROV"
                      onChange={(e) => setPax(i, 'last', e.target.value)}
                    />,
                  )}
                  {field(
                    `p${i}birth`,
                    'Дата рождения',
                    <BirthDateField
                      id={`tk-p${i}birth`}
                      value={p.birth}
                      who={'пассажир ' + (i + 1)}
                      onChange={(d) => setPax(i, 'birth', d)}
                    />,
                  )}
                </div>
              </fieldset>
            ))}
            <fieldset className="tk-box">
              <legend>Куда прислать билеты</legend>
              <div className="tk-grid2">
                {field(
                  'phone',
                  'Телефон (WhatsApp)',
                  <PhoneField
                    id="tk-phone"
                    className="tk-tel"
                    code={v.code || '+972 · Израиль'}
                    number={v.phone}
                    onCode={(c) => setField('code', c)}
                    onNumber={(n) => setField('phone', n)}
                  />,
                )}
                {field(
                  'email',
                  'E-mail',
                  <input
                    id="tk-email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="name@gmail.com"
                    value={v.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />,
                )}
              </div>
            </fieldset>
            <div className="tk-flow-act">
              <button type="button" className="btn btn-secondary tk-back" onClick={() => go('')}>
                ← Назад к рейсу
              </button>
              <button type="button" className="btn btn-primary tk-next" onClick={checkPax}>
                Далее: оплата →
              </button>
            </div>
          </div>
          <aside className="tk-sum">
            <h3>Ваш рейс</h3>
            <Flights offer={offer} />
            {total}
          </aside>
        </div>
      ) : null}

      {step === 'pay' ? (
        <div className="tk-flow-in">
          <div className="tk-flow-main">
            <h2>Оплата</h2>
            <p className="tk-flow-lead">Билеты оплачиваются сразу полностью — картой, Apple Pay или Google Pay.</p>
            <div className="tk-box">
              <h3>Пассажиры</h3>
              <ul className="tk-names">
                {v.pax.map((p, i) => (
                  <li key={i}>
                    <strong>
                      {p.first.toUpperCase()} {p.last.toUpperCase()}
                    </strong>
                    <span>{birthLabel(p.birth)}</span>
                  </li>
                ))}
              </ul>
              <span className="tk-names-to">
                Билеты пришлём: {v.email} · WhatsApp {(v.code || '+972').split(' ')[0]} {v.phone}
              </span>
              <button type="button" className="linkbtn tk-back" onClick={() => go('pax')}>
                Изменить данные
              </button>
            </div>
            <div className="tk-box tk-card">
              <h3>Оплата картой</h3>
              <span className="tk-card-sub">Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay</span>
              <CardForm idPrefix="tk" />
              {cardBad ? (
                <span className="tk-in-err" role="alert">
                  Заполните: {cardBad}
                </span>
              ) : null}
              <span className="tk-card-note">
                Данные карты вводятся в защищённой форме платёжной системы — мы их не видим и не храним. [ПРИМЕР]
              </span>
            </div>
            {/* the newsletter: optional, not ticked for the guest */}
            <label className="tk-agree tk-news">
              <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} />
              <span>
                Подписаться на новости о санаториях Литвы — новые программы, скидки и даты с прямым рейсом. Не чаще раза
                в месяц, отписаться можно в любой момент.
              </span>
            </label>
            <label className={'tk-agree' + (agreeBad && !agree ? ' bad' : '')}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => {
                  setAgree(e.target.checked);
                  setAgreeBad(false);
                }}
              />
              <span>
                Имена проверены — как в паспорте. Согласен с правилами перевозчика {FLIGHT_FACTS.airline}: билеты не
                возвращаются, изменения — за доплату. Данные пассажиров передаём авиакомпании по{' '}
                <Link to="/privacy">политике конфиденциальности</Link>.
              </span>
            </label>
            {agreeBad && !agree ? (
              <span className="tk-in-err" role="alert">
                Отметьте, что имена проверены
              </span>
            ) : null}
            <div className="tk-flow-act">
              <button type="button" className="btn btn-secondary tk-back" onClick={() => go('pax')}>
                ← Назад
              </button>
              <button type="button" className="btn btn-primary tk-pay" onClick={pay} disabled={paying}>
                {paying ? (
                  <>
                    <span className="tk-spin" aria-hidden="true" /> Оплачиваем…
                  </>
                ) : (
                  <>Оплатить {fmt(offer.total)}&nbsp;€</>
                )}
              </button>
            </div>
          </div>
          <aside className="tk-sum">
            <h3>Ваш рейс</h3>
            <Flights offer={offer} />
            {total}
          </aside>
        </div>
      ) : null}

      {step === 'done' ? (
        <div className="tk-done">
          <span className="tk-done-ic" aria-hidden="true">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--paper)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          </span>
          <h2>Спасибо! Билеты оплачены</h2>
          <p>
            Заказ <strong>{v.no || 'TK-…'}</strong>. Билеты на имена{' '}
            {v.pax.map((p) => (p.first + ' ' + p.last).toUpperCase()).join(', ')} пришлём на {v.email || 'e-mail'} и в
            WhatsApp в течение 2 часов.
          </p>
          <Flights offer={offer} />
          <p className="tk-done-q">
            Вопросы — звоните или пишите: <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </p>
          <div className="tk-flow-act">
            {onStay ? (
              <button type="button" className="btn btn-primary tk-stay-btn" onClick={onStay}>
                Подобрать санаторий на эти даты
              </button>
            ) : null}
            <Link className="btn btn-secondary" to="/">
              На главную
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
