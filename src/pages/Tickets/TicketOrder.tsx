import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCodeSelect } from '../../components/PhoneCodeSelect';
import { PHONE_DISPLAY, PHONE_TEL } from '../../data/contacts';
import { COUNTRIES, FLIGHT_FACTS, type FlightLeg, type Offer } from '../../data/tickets';
import { WEEKDAYS_SHORT, iso, plural, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { TODAY } from '../../data/demo';

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
const LATIN = /^[A-Za-z][A-Za-z' -]*$/;
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
  const [agreeBad, setAgreeBad] = useState(false);
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
  const setField = (k: 'phone' | 'email', val: string) => {
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
      if (!p.first.trim()) e[`p${i}first`] = 'Впишите имя';
      else if (!LATIN.test(p.first.trim())) e[`p${i}first`] = 'Латинскими буквами, как в паспорте';
      if (!p.last.trim()) e[`p${i}last`] = 'Впишите фамилию';
      else if (!LATIN.test(p.last.trim())) e[`p${i}last`] = 'Латинскими буквами, как в паспорте';
      if (!p.birth) e[`p${i}birth`] = 'Выберите дату рождения';
    });
    if (v.phone.replace(/\D/g, '').length < 6) e.phone = 'Впишите номер телефона';
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Впишите e-mail, например name@gmail.com';
    setBad(e);
    // the country code of the phone (the select keeps its own value)
    const code = (document.querySelector('.tk-tel select') as HTMLSelectElement | null)?.value.split(' ')[0] || '';
    setV((o) => ({ ...o, code }));
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById('tk-' + first)?.focus();
      return;
    }
    go('pay');
  };

  const pay = () => {
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
                    <input
                      id={`tk-p${i}birth`}
                      className="input"
                      type="date"
                      value={p.birth}
                      min="1920-01-01"
                      max={iso(TODAY)}
                      onChange={(e) => setPax(i, 'birth', e.target.value)}
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
                  <span className="tk-tel">
                    <PhoneCodeSelect className="input" />
                    <input
                      id="tk-phone"
                      className="input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="50 123 4567"
                      value={v.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </span>,
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
                    <span>{p.birth ? p.birth.split('-').reverse().join('.') : ''}</span>
                  </li>
                ))}
              </ul>
              <span className="tk-names-to">
                Билеты пришлём: {v.email} · WhatsApp {v.code} {v.phone}
              </span>
              <button type="button" className="linkbtn tk-back" onClick={() => go('pax')}>
                Изменить данные
              </button>
            </div>
            <div className="tk-box tk-card">
              <h3>Оплата картой</h3>
              <span className="tk-card-sub">Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay</span>
              <div className="tk-card-form">
                <span className="tk-card-safe">🔒 Защищённая форма оплаты</span>
                <div className="tk-card-grid">
                  <span>
                    <span className="lbl">Номер карты</span>
                    <span className="input tk-ph">0000 0000 0000 0000</span>
                  </span>
                  <span>
                    <span className="lbl">Срок</span>
                    <span className="input tk-ph">ММ / ГГ</span>
                  </span>
                  <span>
                    <span className="lbl">CVV</span>
                    <span className="input tk-ph">•••</span>
                  </span>
                </div>
                <span className="tk-card-pays">
                  <span className="tk-apple">Apple Pay</span>
                  <span className="tk-gpay">Google Pay</span>
                </span>
              </div>
              <span className="tk-card-note">
                Данные карты вводятся в защищённой форме платёжной системы — мы их не видим и не храним. [ПРИМЕР]
              </span>
            </div>
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
                возвращаются, изменения — за доплату.
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
              stroke="#fff"
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
