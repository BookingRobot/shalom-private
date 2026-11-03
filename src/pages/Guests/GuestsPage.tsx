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
import { PassportName } from '../../components/PassportName';
import { PhoneField } from '../../components/PhoneField';
import { checkPhone, nameError } from '../../lib/guestRules';
import type { GuestDetails } from '../../data/booking';
import './GuestsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class GuestsLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    // names and the phone are kept in the order's draft, so another device or the consultant sees them
    const saved = props.booking.booking.details;
    this.state = {
      dob: saved?.dob ?? {},
      pk: null,
      names: saved?.names ?? { g1fn: '', g1ln: '', g2fn: '', g2ln: '' },
      phoneCode: saved?.phoneCode ?? '+972 · Израиль',
      phone: saved?.phone ?? '',
      // gender: nothing is chosen for the guest (two friends or sisters often travel together)
      sex: saved?.sex ?? {},
      checked: false,
    };
  }
  /** the form goes into the order (and its draft on the server) with every change */
  syncBooking(st: Record<string, any>) {
    const details: GuestDetails = {
      dob: st.dob,
      names: st.names,
      phoneCode: st.phoneCode,
      phone: st.phone,
      sex: st.sex,
    };
    return { details };
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
    const keep = (patch: Partial<GuestDetails>) => this.setState(patch);
    const vals = {
      names: st.names as GuestDetails['names'],
      setName: (k: keyof GuestDetails['names']) => (val: string) => keep({ names: { ...st.names, [k]: val } }),
      phoneCode: st.phoneCode as string,
      phone: st.phone as string,
      setPhoneCode: (c: string) => keep({ phoneCode: c }),
      setPhone: (n: string) => keep({ phone: n }),
      phoneError: checkPhone(st.phoneCode, st.phone).error,
      sex: (st.sex || {}) as NonNullable<GuestDetails['sex']>,
      setSex: (g: 'g1' | 'g2') => (s: 'm' | 'f') => keep({ sex: { ...st.sex, [g]: s } }),
      checked: !!st.checked,
      hasDob1: !!dob.g1,
      hasDob2: !!dob.g2,
      dob1: fmtDob(dob.g1),
      dob2: fmtDob(dob.g2),
      dob1Color: dob.g1 ? 'var(--ink)' : 'var(--muted)',
      dob2Color: dob.g2 ? 'var(--ink)' : 'var(--muted)',
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
          border: 'var(--line-strong)',
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

const SEXES = [
  ['m', 'Мужской'],
  ['f', 'Женский'],
] as const;

/** Gender as a segmented control: empty until the guest taps; after «Далее» an empty one says so. */
function SexChoice({
  g,
  value,
  onPick,
  showError,
}: {
  g: 'g1' | 'g2';
  value?: 'm' | 'f';
  onPick: (s: 'm' | 'f') => void;
  showError: boolean;
}) {
  const err = showError && !value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span className="lbl" id={g + 'sex-lbl'}>
        Пол
      </span>
      <div
        id={g + 'sex'}
        className={'seg g-sex' + (err ? ' is-err' : '')}
        role="radiogroup"
        aria-labelledby={g + 'sex-lbl'}
        aria-describedby={err ? g + 'sex-err' : undefined}
      >
        {SEXES.map(([s, t]) => (
          <label key={s} className={value === s ? 'on' : undefined}>
            <input type="radio" name={g + 'sex'} value={s} checked={value === s} onChange={() => onPick(s)} />
            {t}
          </label>
        ))}
      </div>
      {err ? (
        <span id={g + 'sex-err'} className="g-err">
          Выберите пол
        </span>
      ) : null}
    </div>
  );
}

/** The date-of-birth button (opens the picker); after «Далее» an empty one says what to do. */
function DobField({
  g,
  text,
  color,
  onOpen,
  showError,
  hint,
}: {
  g: 'g1' | 'g2';
  text: string;
  color: string;
  onOpen: () => void;
  showError: boolean;
  hint?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="lbl" htmlFor={g + 'dob'}>
        Дата рождения
      </label>
      <button
        type="button"
        id={g + 'dob'}
        className={'input datebtn' + (showError ? ' is-err' : '')}
        onClick={onOpen}
        style={{ color }}
        aria-describedby={showError ? g + 'dob-err' : undefined}
      >
        {text}
      </button>
      {showError ? (
        <span id={g + 'dob-err'} className="g-err">
          Выберите дату рождения
        </span>
      ) : null}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
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
              // step 3 is done: the payment step may open (StepGuard)
              if (logic.props.booking.booking.progress < 3) logic.props.booking.update({ progress: 3 });
              logic.props.navigate('/payment');
            }}
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '32px' }}>Кто едет в санаторий?</h1>
              <p style={{ margin: '0', color: 'var(--ink-2)', fontSize: '18px' }}>
                Имя и фамилия — английскими буквами, точно как в паспорте, по которому летите. Они нужны санаторию для
                регистрации и врачу для карты лечения.
              </p>
            </div>
            {/* Guest 1 */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <h2 style={{ fontSize: '22px' }}>Гость 1 — контактное лицо</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                  gap: '18px',
                }}
              >
                <PassportName
                  id="g1fn"
                  label="Имя"
                  what="имя"
                  placeholder="Например: MIKHAIL"
                  autoComplete="given-name"
                  value={v.names.g1fn}
                  onChange={v.setName('g1fn')}
                  forceCheck={v.checked}
                />
                <PassportName
                  id="g1ln"
                  label="Фамилия"
                  what="фамилию"
                  placeholder="Например: LEVIN"
                  autoComplete="family-name"
                  value={v.names.g1ln}
                  onChange={v.setName('g1ln')}
                  forceCheck={v.checked}
                />
                <DobField
                  g="g1"
                  text={v.dob1}
                  color={v.dob1Color}
                  onOpen={v.openDob1}
                  showError={v.checked && !v.hasDob1}
                  hint="Нужна врачу санатория"
                />
                <SexChoice g="g1" value={v.sex.g1} onPick={v.setSex('g1')} showError={v.checked} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1ph">
                    Мобильный телефон
                  </label>
                  <PhoneField
                    id="g1ph"
                    code={v.phoneCode}
                    number={v.phone}
                    onCode={v.setPhoneCode}
                    onNumber={v.setPhone}
                    error={v.checked ? v.phoneError : ''}
                  />
                  <span className="hint">Сюда напишем в WhatsApp подтверждение и детали трансфера</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="lbl" htmlFor="g1em">
                    Электронная почта <span className="g-opt">(не обязательно)</span>
                  </label>
                  <input
                    id="g1em"
                    className="input"
                    type="email"
                    inputMode="email"
                    placeholder="name@gmail.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <span className="hint">Копию подтверждения пришлём и сюда</span>
                </div>
              </div>
            </section>
            {/* Guest 2 */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <h2 style={{ fontSize: '22px' }}>Гость 2</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                  gap: '18px',
                }}
              >
                <PassportName
                  id="g2fn"
                  label="Имя"
                  what="имя"
                  placeholder="Например: IRINA"
                  value={v.names.g2fn}
                  onChange={v.setName('g2fn')}
                  forceCheck={v.checked}
                />
                <PassportName
                  id="g2ln"
                  label="Фамилия"
                  what="фамилию"
                  placeholder="Например: LEVINA"
                  value={v.names.g2ln}
                  onChange={v.setName('g2ln')}
                  forceCheck={v.checked}
                />
                <DobField
                  g="g2"
                  text={v.dob2}
                  color={v.dob2Color}
                  onOpen={v.openDob2}
                  showError={v.checked && !v.hasDob2}
                />
                <SexChoice g="g2" value={v.sex.g2} onPick={v.setSex('g2')} showError={v.checked} />
              </div>
            </section>
            {/* Wishes */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 style={{ fontSize: '22px' }}>Пожелания к заезду</h2>
              <p style={{ margin: '0', color: 'var(--ink-2)', fontSize: '17px' }}>
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
              // after «Далее» every field shows what is wrong with it (not before the guest typed)
              onAttempt={() => !v.checked && logic.setState({ checked: true })}
              missing={() => {
                const dob = (logic.state.dob || {}) as Record<string, unknown>;
                const sex = (logic.state.sex || {}) as Record<string, unknown>;
                const m: Missing[] = [];
                const n = v.names;
                const bad = (k: keyof typeof n, what: 'имя' | 'фамилию') => !!nameError(n[k], what);
                if (bad('g1fn', 'имя') || bad('g1ln', 'фамилию'))
                  m.push({ label: 'имя и фамилию 1-го гостя английскими буквами, как в паспорте', target: '#g1fn' });
                if (!dob.g1) m.push({ label: 'дату рождения 1-го гостя', target: '#g1dob' });
                if (!sex.g1) m.push({ label: 'пол 1-го гостя', target: '#g1sex' });
                if (v.phoneError) m.push({ label: 'телефон для связи', target: '#g1ph' });
                if (bad('g2fn', 'имя') || bad('g2ln', 'фамилию'))
                  m.push({ label: 'имя и фамилию 2-го гостя английскими буквами, как в паспорте', target: '#g2fn' });
                if (!dob.g2) m.push({ label: 'дату рождения 2-го гостя', target: '#g2dob' });
                if (!sex.g2) m.push({ label: 'пол 2-го гостя', target: '#g2sex' });
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
