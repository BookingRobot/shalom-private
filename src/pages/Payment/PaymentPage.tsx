import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { orderPriceRows, OrderSummary } from '../../components/OrderSummary';
import { orderSummary } from '../../lib/orderSummary';
import { shortDate } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './PaymentPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class PaymentLogic extends PageLogic {
  constructor(props: PageServices) {
    super(props);
    this.state = { plan: 'adv' };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    // Agents' terms: a deposit (35 € per person, +100 € per person with flights) fixes the price;
    // the rest is paid before a set date, until which cancellation is free. Close to arrival — pay in full.
    const booking = this.props.booking.booking;
    const order = orderSummary(booking);
    const plan = order.fullOnly ? 'full' : (this.state.plan ?? 'adv');
    const adv = plan === 'adv';
    const TOTAL = order.total;
    const eur = (n: number) => fmt(n) + '\u00a0€';
    const advAmt = fmt(order.advance),
      restAmt = fmt(order.rest),
      totalAmt = fmt(TOTAL);
    const TODAY_LABEL = 'сегодня, ' + shortDate(TODAY);
    return {
      advAmt,
      restAmt,
      totalAmt,
      dueDate: order.dueDate,
      fullOnly: order.fullOnly,
      depositRule: booking.flightPackage
        ? '35\u00a0€ за санаторий и 100\u00a0€ за перелёт с человека'
        : '35\u00a0€ с человека',
      fullIncludes: order.flight
        ? 'Санаторий, перелёт и трансфер.'
        : order.transfer
          ? 'Проживание, лечение и трансфер.'
          : 'Проживание и лечение.',
      advCls: adv ? 'on' : '',
      fullCls: adv ? '' : 'on',
      pickAdv: () => this.setState({ plan: 'adv' }),
      pickFull: () => this.setState({ plan: 'full' }),
      amount: adv ? advAmt + '\u00a0€' : totalAmt + '\u00a0€',
      steps: adv
        ? [
            { when: TODAY_LABEL, what: 'депозит — цена зафиксирована', sum: eur(order.advance) },
            { when: 'до ' + order.dueDate, what: 'остаток, до этой даты отмена бесплатная', sum: eur(order.rest) },
            { when: 'при заезде', what: 'ничего не доплачиваете', sum: '0\u00a0€' },
          ]
        : [
            { when: TODAY_LABEL, what: 'вся сумма', sum: eur(TOTAL) },
            { when: 'при заезде', what: 'ничего не доплачиваете', sum: '0\u00a0€' },
          ],
      rest: adv
        ? 'Остаток ' + restAmt + '\u00a0€ — до ' + order.dueDate + ', отмена до этой даты бесплатная'
        : 'Всё оплачено. На месте ничего доплачивать не нужно',
      payLabel: adv ? 'Внести депозит ' + advAmt + '\u00a0€' : 'Оплатить ' + totalAmt + '\u00a0€',
    };
  }
}

export default function PaymentPage() {
  usePageTitle('Шаг 5 из 5 — оплата');
  const [v, logic] = usePageLogic(PaymentLogic);
  const order = orderSummary(logic.props.booking.booking);
  return (
    <div className="page pg-payment">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#3E4B44' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Защищённая оплата
            </span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps current={5} />
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
              logic.props.navigate('/done');
            }}
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '32px' }}>Как вам удобнее оплатить?</h1>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '18px' }}>
                Заказ подтверждается после оплаты. Санаторий бронирует номер за вами сразу.
              </p>
            </div>
            {/* Plan */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 style={{ fontSize: '24px' }}>Сумма к оплате сейчас</h2>
              <div className="plan-list">
                {v.fullOnly ? null : (
                  <button type="button" className={`choice plan plan-main ${v.advCls ?? ''}`} onClick={v.pickAdv}>
                    <span className={`radio ${v.advCls ?? ''}`}>
                      <i />
                    </span>
                    <span className="plan-body">
                      <span className="plan-head">
                        <strong className="plan-title">
                          Депозит — <span className="nowrap">{v.advAmt}&nbsp;€</span>
                        </strong>
                        <span className="plan-badge">Цена фиксируется</span>
                      </span>
                      <span className="plan-text">
                        {v.depositRule}. Остальные <strong>{v.restAmt}&nbsp;€</strong> — до {v.dueDate}; до этой даты
                        отмена бесплатная, депозит возвращаем.
                      </span>
                    </span>
                  </button>
                )}
                <button type="button" className={`choice plan plan-alt ${v.fullCls ?? ''}`} onClick={v.pickFull}>
                  <span className={`radio ${v.fullCls ?? ''}`}>
                    <i />
                  </span>
                  <span className="plan-body plan-inline">
                    <strong className="plan-title">
                      Вся сумма — <span className="nowrap">{v.totalAmt}&nbsp;€</span>
                    </strong>
                    <span className="plan-text">
                      {v.fullOnly
                        ? 'До заезда меньше недели — бронь подтверждаем только после полной оплаты.'
                        : v.fullIncludes + ' Больше ничего не платить — удобно, если оплачивают родственники.'}
                    </span>
                  </span>
                </button>
              </div>
              <div className="pay-steps" aria-label="График оплаты">
                <div className="pay-steps-title">График оплаты</div>
                {(v.steps || []).map((x: any) => (
                  <div className="pay-step" key={x.when}>
                    <span className="pay-when">{x.when}</span>
                    <span className="pay-what">{x.what}</span>
                    <strong className="pay-sum">{x.sum}</strong>
                  </div>
                ))}
              </div>
            </section>
            {/* Method */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <rect x="2" y="5" width="20" height="14" rx="1" />
                  <path d="M2 10h20M6 15h4" />
                </svg>
                <h2 style={{ fontSize: '24px' }}>Оплата картой</h2>
                <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                  Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '2px dashed #C8DED3',
                    background: '#FAFBF9',
                    borderRadius: '2px',
                    padding: '18px 20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '800',
                        fontSize: '17px',
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none' }}
                      >
                        <rect x="4" y="11" width="16" height="10" rx="1" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      Защищённая форма оплаты
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="lbl">Номер карты</span>
                      <div
                        className="input"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#6B776F',
                          fontSize: '18px',
                          letterSpacing: '.06em',
                        }}
                      >
                        0000 0000 0000 0000
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="lbl">Срок</span>
                      <div
                        className="input"
                        style={{ display: 'flex', alignItems: 'center', color: '#6B776F', fontSize: '18px' }}
                      >
                        ММ / ГГ
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="lbl">CVV</span>
                      <div
                        className="input"
                        style={{ display: 'flex', alignItems: 'center', color: '#6B776F', fontSize: '18px' }}
                      >
                        •••
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="lbl">Номер удостоверения личности (ת.ז.) — для карт израильских банков</span>
                    <div
                      className="input"
                      style={{ display: 'flex', alignItems: 'center', color: '#6B776F', fontSize: '18px' }}
                    >
                      000000000
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '48px',
                        padding: '0 18px',
                        borderRadius: '2px',
                        background: '#1C2620',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '16px',
                      }}
                    >
                      Apple Pay
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '48px',
                        padding: '0 18px',
                        borderRadius: '2px',
                        background: '#fff',
                        border: '2px solid #1C2620',
                        fontWeight: '700',
                        fontSize: '16px',
                      }}
                    >
                      Google Pay
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    fontSize: '16px',
                    color: '#3E4B44',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <rect x="4" y="11" width="16" height="10" rx="1" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span>
                    Данные карты вводятся в защищённой форме платёжной системы Tranzila прямо на этой странице — мы их
                    не видим и не храним. Банк может попросить подтвердить оплату кодом из SMS.
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '16px', color: '#3E4B44', borderTop: '1px solid #E3DED2', paddingTop: '12px' }}>
                Нужен банковский перевод (например, оплачивает организация)?{' '}
                <a href="tel:+37060000000" style={{ fontWeight: '700' }}>
                  Позвоните нам
                </a>{' '}
                — пришлём счёт.
              </div>
            </section>
            {/* Rules summary */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ fontSize: '24px' }}>Если планы изменятся</h2>
                <Link to="/rules" style={{ fontWeight: '700', fontSize: '16px' }}>
                  Полные условия бронирования →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="rule">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <span>
                    {v.fullOnly ? (
                      <>
                        <b>До заезда меньше недели</b> — условия отмены по правилам санатория [ПОДТВЕРДИТЬ УСЛОВИЯ].
                      </>
                    ) : (
                      <>
                        <b>До {v.dueDate}</b> — отмена бесплатная, депозит возвращаем полностью.
                      </>
                    )}
                  </span>
                </div>
                <div className="rule">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <span>
                    <b>Перенос дат</b> — бесплатно, если в санатории есть места.
                  </span>
                </div>
                <div className="rule">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C9893A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>
                  <span>
                    {v.fullOnly ? (
                      <>
                        <b>Незаезд без предупреждения</b> — санаторий может удержать стоимость первых суток.
                      </>
                    ) : (
                      <>
                        <b>После {v.dueDate}</b> — удерживаем депозит, остаток возвращаем [ПОДТВЕРДИТЬ УСЛОВИЯ].
                      </>
                    )}
                  </span>
                </div>
                <div className="rule">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <span>
                    <b>По болезни</b> — с медицинской справкой возвращаем депозит полностью в любой срок.
                  </span>
                </div>
              </div>
              <label
                className="chk"
                style={{ padding: '14px 16px', border: '2px solid #CFC9BB', borderRadius: '2px', marginTop: '4px' }}
              >
                {' '}
                <input type="checkbox" />{' '}
                <span>
                  Я ознакомился с <Link to="/rules">условиями бронирования и отмены</Link> и согласен на обработку
                  персональных данных гостей для оформления заказа.
                </span>{' '}
              </label>
            </section>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                paddingTop: '8px',
              }}
            >
              <Link className="btn btn-secondary" to="/guests">
                ← Назад к гостям
              </Link>
              <Link
                className="btn btn-primary"
                to="/done"
                style={{ minHeight: '68px', fontSize: '20px', padding: '0 44px' }}
              >
                {' '}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>{' '}
                {v.payLabel}{' '}
              </Link>
            </div>
          </form>
          <OrderSummary
            details={[
              ['Даты', order.dates],
              ['Номер', order.roomName],
              ['Программа', order.programName, order.programPerDay],
              ['Гости', 'Mikhail Levin, Irina Levina'],
              ['Трансфер', order.transferPlaces],
            ]}
            prices={orderPriceRows(order)}
            total={order.totalLabel}
            footer={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1F5F4A',
                  }}
                >
                  <span>Платите сейчас</span>
                  <strong style={{ fontSize: '24px', fontWeight: '800', whiteSpace: 'nowrap' }}>{v.amount}</strong>
                </div>
                <div style={{ fontSize: '16px', lineHeight: '1.5', color: '#3E4B44' }}>{v.rest}</div>
              </div>
            }
          />
        </div>
        <SiteFooter />
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
