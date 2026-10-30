import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { MONTHS_N } from '../../lib/dates';
import { AdvanceNote, OrderSummary, orderPriceRows } from '../../components/OrderSummary';
import { StepNext, type Missing } from '../../components/StepNext';
import { orderSummary } from '../../lib/orderSummary';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import '../../components/BirthDate.css';
import './GuestsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class GuestsLogic extends PageLogic {
  constructor(props: PageServices) {
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
          // the 20 years around the chosen one, or the 1950s–60s, the usual decades of our guests
          from: v ? Math.floor(v.y / 10) * 10 - 10 : 1950,
        },
      });
    };
    const vals = {
      dob1: fmtDob(dob.g1),
      dob2: fmtDob(dob.g2),
      dob1Color: dob.g1 ? '#1C2620' : '#6B776F',
      dob2Color: dob.g2 ? '#1C2620' : '#6B776F',
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
    const years: any[] = [];
    for (let y = from; y < from + 20; y++)
      years.push({ t: String(y), cls: y === pk.y ? 'on' : '', pick: () => set({ y, step: 'month', d: null }) });
    const months = MONTHS_N.map((t, i) => ({
      t,
      cls: i === pk.m ? 'on' : '',
      pick: () => set({ m: i, step: 'day', d: null }),
    }));
    const days: any[] = [];
    if (pk.y != null && pk.m != null) {
      const first = new Date(Date.UTC(pk.y, pk.m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const n = new Date(Date.UTC(pk.y, pk.m + 1, 0)).getUTCDate();
      for (let i = 0; i < lead; i++) days.push({ t: '', cls: '', off: true, border: 'transparent', pick: () => {} });
      for (let d = 1; d <= n; d++)
        days.push({
          t: String(d),
          cls: d === pk.d ? 'on' : '',
          off: false,
          border: '#CFC9BB',
          // the third tap: the date is saved and the window closes — no «Готово» to press
          pick: () => this.setState({ dob: { ...dob, [pk.g]: { y: pk.y, m: pk.m, d } }, pk: null }),
        });
    }
    const complete = pk.y != null && pk.m != null && pk.d != null;
    const step = pk.step;
    return {
      ...vals,
      dobWho: pk.g === 'g1' ? 'первый гость' : 'второй гость',
      dobHint: step === 'year' ? 'Выберите год' : step === 'month' ? 'Теперь месяц' : 'И день — дата сохранится сама',
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
  usePageTitle('Шаг 3 из 4 — данные гостей');
  const [v, logic] = usePageLogic(GuestsLogic);
  const order = orderSummary(logic.props.booking.booking);
  return (
    <div className="page pg-guests">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span className="hd-note">Нужна помощь с заказом?</span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps current={3} />
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
            onSubmit={(e) => {
              e.preventDefault();
              logic.props.navigate('/payment');
            }}
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '32px' }}>Кто едет в санаторий?</h1>
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
                    borderRadius: 'var(--r)',
                    background: '#1F5F4A',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px',
                  }}
                >
                  1
                </span>
                <h2 style={{ fontSize: '22px' }}>Первый гость — он же контактное лицо</h2>
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
                  <div className="g-tel">
                    <div className="g-tel-code">
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
                    borderRadius: 'var(--r)',
                    background: '#1F5F4A',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px',
                  }}
                >
                  2
                </span>
                <h2 style={{ fontSize: '22px' }}>Второй гость</h2>
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
              <h2 style={{ fontSize: '22px' }}>Пожелания к заезду</h2>
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
            <StepNext
              verb="не заполнили"
              back={{ to: '/transfer', label: '← Назад: дорога' }}
              next={{ to: '/payment', label: 'Далее: оплата →' }}
              info={
                <>
                  Итого: <strong>{order.totalLabel}</strong>
                </>
              }
              missing={() => {
                const empty = (id: string) => !document.querySelector<HTMLInputElement>('#' + id)?.value.trim();
                const dob = (logic.state.dob || {}) as Record<string, unknown>;
                const m: Missing[] = [];
                if (empty('g1fn') || empty('g1ln')) m.push({ label: 'имя и фамилию 1-го гостя', target: '#g1fn' });
                if (!dob.g1) m.push({ label: 'дату рождения 1-го гостя', target: '#g1dob' });
                if (empty('g1ph')) m.push({ label: 'телефон для связи', target: '#g1ph' });
                if (empty('g2fn') || empty('g2ln')) m.push({ label: 'имя и фамилию 2-го гостя', target: '#g2fn' });
                if (!dob.g2) m.push({ label: 'дату рождения 2-го гостя', target: '#g2dob' });
                return m;
              }}
            />
          </form>
          <OrderSummary
            details={[
              ['Даты', order.dates],
              ['Номер', order.roomName],
              ['Программа', order.programName, order.programPerDay],
              ['Гости', order.guests],
              ['Трансфер', order.transferRoute],
            ]}
            prices={orderPriceRows(order)}
            total={order.totalLabel}
            footer={<AdvanceNote order={order} />}
          />
        </div>
        <SiteFooter />
      </div>{' '}
      {/* Date-of-birth picker: tap the year, tap the month, tap the day — it closes and keeps the date */}
      {v.dobOpen ? (
        <div className="dob-back" onClick={(e) => e.target === e.currentTarget && v.closeDob()}>
          <div role="dialog" aria-modal="true" aria-labelledby="dobTitle" className="dob">
            <div className="dob-head">
              <h2 id="dobTitle">
                Дата рождения <span>· {v.dobWho}</span>
              </h2>
              <button type="button" className="dob-x" onClick={v.closeDob} aria-label="Закрыть">
                ✕
              </button>
            </div>
            {/* what is chosen so far: a tap goes back to that step */}
            <div className="dob-crumbs">
              <button type="button" className={'dob-crumb ' + v.stYearCls} onClick={v.goYear}>
                {v.yearPicked ? v.yearPicked.replace(': ', '') : 'Год'}
              </button>
              <span aria-hidden="true">›</span>
              <button type="button" className={'dob-crumb ' + v.stMonthCls} onClick={v.goMonth} disabled={!!v.monthOff}>
                {v.monthPicked ? v.monthPicked.replace(': ', '') : 'Месяц'}
              </button>
              <span aria-hidden="true">›</span>
              <span className={'dob-crumb ' + v.stDayCls}>День</span>
            </div>
            <p className="dob-hint">{v.dobHint}</p>
            {v.stepYear ? (
              <div className="dob-years">
                <div className="dob-nav">
                  <button type="button" className="dob-arrow" onClick={v.yearsPrev} aria-label="Более ранние годы">
                    ‹
                  </button>
                  <strong>{v.yearsTitle}</strong>
                  <button type="button" className="dob-arrow" onClick={v.yearsNext} aria-label="Более поздние годы">
                    ›
                  </button>
                </div>
                <div className="dob-grid dob-grid-y">
                  {(v.years || []).map((y: any) => (
                    <button type="button" key={y.t} className={'pick ' + y.cls} onClick={y.pick}>
                      {y.t}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {v.stepMonth ? (
              <div className="dob-grid dob-grid-m">
                {(v.months || []).map((m: any) => (
                  <button type="button" key={m.t} className={'pick ' + m.cls} onClick={m.pick}>
                    {m.t}
                  </button>
                ))}
              </div>
            ) : null}
            {v.stepDay ? (
              <div className="dob-days">
                <strong className="dob-month">{v.dayTitle}</strong>
                <div className="dob-grid dob-grid-d">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => (
                    <span className="dob-wd" key={w}>
                      {w}
                    </span>
                  ))}
                  {(v.days || []).map((d: any, i: number) => (
                    <button
                      type="button"
                      key={i}
                      className={'pick ' + d.cls}
                      onClick={d.pick}
                      disabled={!!d.off}
                      style={d.off ? { borderColor: 'transparent' } : undefined}
                    >
                      {d.t}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
