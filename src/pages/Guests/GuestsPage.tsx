import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './GuestsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class GuestsLogic extends PageLogic {
  constructor(props?: any) {
    super(props);
    this.state = { dob: {}, pk: null };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const st = this.state || {};
    const dob = st.dob || {};
    const pk = st.pk; // { g: 'g1'|'g2', step: 'year'|'month'|'day', y, m, d, from }
    const MONTHS = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const MONTHS_N = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ];
    const fmtDob = (v) => (v ? v.d + ' ' + MONTHS[v.m] + ' ' + v.y : 'Выберите дату');
    const set = (patch) => this.setState({ pk: { ...pk, ...patch } });
    // Years: 20 per screen; opens around the 1960s, the typical birth decade of our guests
    const open = (g) => () => {
      const v = dob[g];
      this.setState({
        pk: {
          g,
          step: 'year',
          y: v ? v.y : null,
          m: v ? v.m : null,
          d: v ? v.d : null,
          from: v ? Math.floor(v.y / 10) * 10 - 10 : 1950,
        },
      });
    };
    const vals = {
      dob1: fmtDob(dob.g1),
      dob2: fmtDob(dob.g2),
      dob1Color: dob.g1 ? '#1C2620' : '#8A968F',
      dob2Color: dob.g2 ? '#1C2620' : '#8A968F',
      openDob1: open('g1'),
      openDob2: open('g2'),
      dobOpen: !!pk,
      closeDob: () => this.setState({ pk: null }),
    };
    if (!pk)
      return {
        ...vals,
        dobWho: '',
        dobHint: '',
        stYearCls: '',
        stMonthCls: '',
        stDayCls: '',
        yearPicked: '',
        monthPicked: '',
        dayPicked: '',
        monthOff: true,
        stepYear: false,
        stepMonth: false,
        stepDay: false,
        years: [],
        months: [],
        days: [],
        yearsTitle: '',
        dayTitle: '',
        dobSummary: '',
        backOff: true,
        doneOff: true,
        goYear: () => {},
        goMonth: () => {},
        yearsPrev: () => {},
        yearsNext: () => {},
        dobBack: () => {},
        dobDone: () => {},
      };
    const from = pk.from ?? 1950;
    const years = [];
    for (let y = from; y < from + 20; y++)
      years.push({ t: String(y), cls: y === pk.y ? 'on' : '', pick: () => set({ y, step: 'month', d: null }) });
    const months = MONTHS_N.map((t, i) => ({
      t,
      cls: i === pk.m ? 'on' : '',
      pick: () => set({ m: i, step: 'day', d: null }),
    }));
    const days = [];
    if (pk.y != null && pk.m != null) {
      const first = new Date(Date.UTC(pk.y, pk.m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const n = new Date(Date.UTC(pk.y, pk.m + 1, 0)).getUTCDate();
      for (let i = 0; i < lead; i++) days.push({ t: '', cls: '', off: true, border: 'transparent', pick: () => {} });
      for (let d = 1; d <= n; d++)
        days.push({ t: String(d), cls: d === pk.d ? 'on' : '', off: false, border: '#CFC9BB', pick: () => set({ d }) });
    }
    const complete = pk.y != null && pk.m != null && pk.d != null;
    const step = pk.step;
    return {
      ...vals,
      dobWho: pk.g === 'g1' ? 'первый гость' : 'второй гость',
      dobHint:
        step === 'year'
          ? 'Сначала выберите год рождения'
          : step === 'month'
            ? 'Теперь выберите месяц'
            : 'И наконец — день',
      stYearCls: step === 'year' ? 'on' : pk.y != null ? 'done' : '',
      stMonthCls: step === 'month' ? 'on' : pk.m != null ? 'done' : '',
      stDayCls: step === 'day' ? 'on' : pk.d != null ? 'done' : '',
      yearPicked: pk.y != null ? ': ' + pk.y : '',
      monthPicked: pk.m != null ? ': ' + MONTHS_N[pk.m].toLowerCase() : '',
      dayPicked: pk.d != null ? ': ' + pk.d : '',
      monthOff: pk.y == null,
      goYear: () => set({ step: 'year' }),
      goMonth: () => {
        if (pk.y != null) set({ step: 'month' });
      },
      stepYear: step === 'year',
      stepMonth: step === 'month',
      stepDay: step === 'day',
      years,
      yearsTitle: from + '–' + (from + 19),
      yearsPrev: () => set({ from: from - 20 }),
      yearsNext: () => {
        if (from + 20 <= 2026) set({ from: from + 20 });
      },
      months,
      days,
      dayTitle: pk.y != null && pk.m != null ? MONTHS_N[pk.m] + ' ' + pk.y : '',
      dobSummary: complete
        ? pk.d + ' ' + MONTHS[pk.m] + ' ' + pk.y
        : [pk.y, pk.m != null ? MONTHS_N[pk.m].toLowerCase() : null, pk.d].filter((x) => x != null).join(' · ') || '—',
      backOff: step === 'year',
      dobBack: () => set({ step: step === 'day' ? 'month' : 'year' }),
      doneOff: !complete,
      dobDone: () => {
        if (complete) this.setState({ dob: { ...dob, [pk.g]: { y: pk.y, m: pk.m, d: pk.d } }, pk: null });
      },
    };
  }
}

export default function GuestsPage() {
  usePageTitle('Шаг 2 из 3 — данные гостей');
  const [v, logic] = usePageLogic(GuestsLogic);
  return (
    <div className="page pg-guests">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '0 24px',
              minHeight: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#1C2620' }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
              </svg>
              <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '24px', fontWeight: '700' }}>
                Санатории Литвы
              </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>Нужна помощь с заказом?</span>
              <a
                href="tel:+37060000000"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: '#1C2620',
                  fontWeight: '800',
                  fontSize: '20px',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
                </svg>
                +370&nbsp;600 00000
              </a>
            </div>
          </div>
        </header>
        <div style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              flexWrap: 'wrap',
            }}
          >
            <div className="step done">
              <span className="num">✓</span>Номер
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step done">
              <span className="num">✓</span>Трансфер
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step on">
              <span className="num">3</span>Гости
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step">
              <span className="num">4</span>Рейсы
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step">
              <span className="num">5</span>Оплата
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CFC9BB"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="step" style={{ gap: '8px' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A968F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
              </svg>
              Готово
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '32px 24px 56px',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <form
            action="flights.html"
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '36px' }}>Кто едет в санаторий?</h1>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '18px' }}>
                Имена и фамилии — как в паспорте, латинскими буквами. Они нужны санаторию для регистрации и врачу для
                карты лечения.
              </p>
            </div>
            {/* Guest 1 */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '2px',
                    background: '#1F5F4A',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '20px',
                  }}
                >
                  1
                </span>
                <h2 style={{ fontSize: '24px' }}>Первый гость — он же контактное лицо</h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1fn">
                    Имя
                  </label>
                  <input
                    id="g1fn"
                    className="input"
                    type="text"
                    placeholder="Например: Mikhail"
                    autoComplete="given-name"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1ln">
                    Фамилия
                  </label>
                  <input
                    id="g1ln"
                    className="input"
                    type="text"
                    placeholder="Например: Levin"
                    autoComplete="family-name"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1dob">
                    Дата рождения
                  </label>
                  <button
                    type="button"
                    id="g1dob"
                    className="input datebtn"
                    onClick={v.openDob1}
                    style={{ color: v.dob1Color }}
                  >
                    {v.dob1}
                  </button>
                  <span className="hint">Нужна врачу санатория</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="lbl">Пол</span>
                  <div className="seg">
                    <label>
                      <input type="radio" name="g1sex" defaultChecked={true} />
                      Мужской
                    </label>
                    <label style={{ borderLeft: '2px solid #CFC9BB' }}>
                      <input type="radio" name="g1sex" />
                      Женский
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1ph">
                    Мобильный телефон
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 'none', width: '210px' }}>
                      <select
                        className="input"
                        aria-label="Страна и код"
                        style={{ paddingRight: '40px', fontWeight: '700' }}
                        defaultValue={'+972 · Израиль'}
                      >
                        <option>+972 · Израиль</option>
                        <option>+370 · Литва</option>
                        <option>+1 · США и Канада</option>
                        <option>+49 · Германия</option>
                        <option>+44 · Великобритания</option>
                        <option>+33 · Франция</option>
                        <option>+371 · Латвия</option>
                        <option>+372 · Эстония</option>
                        <option>+48 · Польша</option>
                        <option>+7 · Россия</option>
                        <option>+380 · Украина</option>
                        <option>+375 · Беларусь</option>
                        <option>+7 · Казахстан</option>
                        <option>+995 · Грузия</option>
                        <option>+374 · Армения</option>
                        <option>+373 · Молдова</option>
                      </select>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                        style={{ position: 'absolute', right: '12px', top: '19px', pointerEvents: 'none' }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    <input
                      id="g1ph"
                      className="input"
                      type="tel"
                      placeholder="50 123 4567"
                      autoComplete="tel-national"
                      inputMode="numeric"
                    />
                  </div>
                  <span className="hint">Сюда напишем в WhatsApp подтверждение и детали трансфера</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1em">
                    Электронная почта
                  </label>
                  <input id="g1em" className="input" type="email" placeholder="name@gmail.com" autoComplete="email" />
                  <span className="hint">Пришлём подтверждение и ссылку на оплату</span>
                </div>
              </div>
            </section>
            {/* Guest 2 */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '2px',
                    background: '#1F5F4A',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '20px',
                  }}
                >
                  2
                </span>
                <h2 style={{ fontSize: '24px' }}>Второй гость</h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g2fn">
                    Имя
                  </label>
                  <input id="g2fn" className="input" type="text" placeholder="Например: Irina" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g2ln">
                    Фамилия
                  </label>
                  <input id="g2ln" className="input" type="text" placeholder="Например: Levina" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g2dob">
                    Дата рождения
                  </label>
                  <button
                    type="button"
                    id="g2dob"
                    className="input datebtn"
                    onClick={v.openDob2}
                    style={{ color: v.dob2Color }}
                  >
                    {v.dob2}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="lbl">Пол</span>
                  <div className="seg">
                    <label>
                      <input type="radio" name="g2sex" />
                      Мужской
                    </label>
                    <label style={{ borderLeft: '2px solid #CFC9BB' }}>
                      <input type="radio" name="g2sex" defaultChecked={true} />
                      Женский
                    </label>
                  </div>
                </div>
              </div>
            </section>
            {/* Wishes */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 style={{ fontSize: '24px' }}>Пожелания к заезду</h2>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '17px' }}>
                Не обязательно, но санаторию полезно знать заранее.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))',
                  gap: '4px 24px',
                }}
              >
                <label className="chk">
                  <input type="checkbox" />
                  Номер на нижнем этаже
                </label>
                <label className="chk">
                  <input type="checkbox" />
                  Номер на верхнем этаже
                </label>
                <label className="chk">
                  <input type="checkbox" />
                  Приедем на автомобиле, нужна парковка
                </label>
                <label className="chk">
                  <input type="checkbox" />
                  Интересуют экскурсии (Вильнюс, Тракай, Каунас)
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="lbl" htmlFor="notes">
                  Что ещё нам важно знать
                </label>
                <textarea
                  id="notes"
                  className="input"
                  rows={3}
                  placeholder="Например: ограниченная подвижность, диета, хотим номера рядом с друзьями…"
                  style={{ padding: '14px 16px', minHeight: '110px', resize: 'vertical' }}
                />
              </div>
            </section>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                paddingTop: '8px',
              }}
            >
              <Link className="btn btn-secondary" to="/transfer">
                ← Назад к трансферу
              </Link>
              <Link
                className="btn btn-primary"
                to="/flights"
                style={{ minHeight: '64px', fontSize: '21px', padding: '0 40px' }}
              >
                Далее: оплата аванса →
              </Link>
            </div>
          </form>
          <aside
            className="card"
            style={{
              flex: '1 1 300px',
              maxWidth: '360px',
              padding: '0',
              overflow: 'hidden',
              position: 'sticky',
              top: '16px',
            }}
          >
            <img
              src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
              alt=""
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />{' '}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: '800', fontSize: '20px' }}>Санаторий Эгле Комфорт</div>
                <div style={{ fontSize: '16px', color: '#3E4B44' }}>Друскининкай · ★★★★</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '16px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Даты</span>
                  <strong>9–18 ноября · 9 ночей</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Номер</span>
                  <strong>Двухместный</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Программа</span>
                  <strong>«Миди», 3 процедуры</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Гости</span>
                  <strong>2 взрослых</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Трансфер</span>
                  <strong>из аэропорта Вильнюса, туда и обратно</strong>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '16px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Проживание и лечение</span>
                  <strong>2&nbsp;138&nbsp;€</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Трансфер групповой, туда и обратно</span>
                  <strong>120&nbsp;€</strong>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  borderTop: '2px solid #1C2620',
                  paddingTop: '12px',
                }}
              >
                <span style={{ fontWeight: '800', fontSize: '18px' }}>Итого</span>
                <span style={{ fontWeight: '800', fontSize: '28px' }}>2&nbsp;258&nbsp;€</span>
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#3E4B44',
                  background: '#F4F1EA',
                  borderRadius: '2px',
                  padding: '10px 12px',
                }}
              >
                Сейчас к оплате только аванс 4 % — <strong>86&nbsp;€</strong>. Остальное — в санатории при заезде.
              </div>
            </div>
          </aside>
        </div>
        <footer style={{ background: '#1C2620', color: '#D9E2DC', marginTop: 'auto' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '28px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '16px',
            }}
          >
            <div>Санатории Литвы · консультация на русском 24/7 · WhatsApp +370&nbsp;600 00000</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Как оплатить
              </Link>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Условия отмены
              </Link>
            </div>
          </div>
        </footer>
      </div>{' '}
      {/* Date-of-birth picker: year → month → day, tuned for 55+ guests */}{' '}
      {v.dobOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(18,34,27,.55)',
              zIndex: '50',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 16px',
              overflow: 'auto',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dobTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                width: 'min(760px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '26px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="dobTitle" style={{ fontSize: '30px' }}>
                    Дата рождения — {v.dobWho}
                  </h2>
                  <span style={{ fontSize: '17px', color: '#3E4B44' }}>{v.dobHint}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.closeDob}
                  style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  Закрыть
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '22px',
                  flexWrap: 'wrap',
                  padding: '12px 16px',
                  background: '#F4F1EA',
                  borderRadius: '2px',
                }}
              >
                <button
                  type="button"
                  className={`pstep ${v.stYearCls ?? ''}`}
                  onClick={v.goYear}
                  style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
                >
                  <span className="n">1</span>Год{v.yearPicked}
                </button>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CFC9BB"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <button
                  type="button"
                  className={`pstep ${v.stMonthCls ?? ''}`}
                  onClick={v.goMonth}
                  disabled={!!v.monthOff}
                  style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
                >
                  <span className="n">2</span>Месяц{v.monthPicked}
                </button>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CFC9BB"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <div className={`pstep ${v.stDayCls ?? ''}`}>
                  <span className="n">3</span>День{v.dayPicked}
                </div>
              </div>
              {v.stepYear ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button type="button" className="navbtn" onClick={v.yearsPrev} aria-label="Более ранние годы">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m15 6-6 6 6 6" />
                      </svg>
                    </button>
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          textAlign: 'center',
                          fontFamily: 'Lora,Georgia,serif',
                          fontSize: '22px',
                          fontWeight: '600',
                        }}
                      >
                        {v.yearsTitle}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
                        {(v.years || []).map((y: any, _i0: number) => (
                          <Fragment key={_i0}>
                            <button type="button" className={`pick ${y.cls ?? ''}`} onClick={y.pick}>
                              {y.t}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="navbtn" onClick={v.yearsNext} aria-label="Более поздние годы">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : null}
              {v.stepMonth ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                    {(v.months || []).map((m: any, _i0: number) => (
                      <Fragment key={_i0}>
                        <button
                          type="button"
                          className={`pick ${m.cls ?? ''}`}
                          onClick={m.pick}
                          style={{ fontSize: '20px' }}
                        >
                          {m.t}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </>
              ) : null}
              {v.stepDay ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: 'Lora,Georgia,serif',
                        fontSize: '22px',
                        fontWeight: '600',
                      }}
                    >
                      {v.dayTitle}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
                      <div className="wd">Пн</div>
                      <div className="wd">Вт</div>
                      <div className="wd">Ср</div>
                      <div className="wd">Чт</div>
                      <div className="wd">Пт</div>
                      <div className="wd">Сб</div>
                      <div className="wd">Вс</div>
                      {(v.days || []).map((d: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <button
                            type="button"
                            className={`pick ${d.cls ?? ''}`}
                            onClick={d.pick}
                            disabled={!!d.off}
                            style={{ minHeight: '54px', borderColor: d.border }}
                          >
                            {d.t}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <span style={{ fontSize: '18px' }}>
                  Выбрано: <strong>{v.dobSummary}</strong>
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={v.dobBack} disabled={!!v.backOff}>
                    ← Назад
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={v.dobDone}
                    disabled={!!v.doneOff}
                    style={{ minHeight: '56px', fontSize: '18px', padding: '0 32px' }}
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
