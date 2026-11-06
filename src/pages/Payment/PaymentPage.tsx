import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Quote } from '../../api/types';
import { useQuote } from '../../api/useQuote';
import { track } from '../../lib/analytics';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../../data/contacts';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { orderPriceRows, OrderSummary } from '../../components/OrderSummary';
import { StepNext } from '../../components/StepNext';
import { guestNames, orderSummary } from '../../lib/orderSummary';
import { shortDate } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import { DEPOSIT_FLIGHT_PP, persons } from '../../lib/pricing';
import { transferBySanatorium } from '../../data/transferPolicy';
import { PageLogic, usePageLogic, type PageServices } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import { CardForm, cardMissing } from '../../components/CardForm';
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
    // the amounts charged come from the server's quote (the same numbers go on the invoice);
    // until it arrives the page shows the local estimate and the pay button waits
    const local = orderSummary(booking);
    const q: Quote | null = this.state.quote ?? null;
    const order = q ? { ...local, total: q.total, advance: q.deposit, rest: q.rest, fullOnly: q.fullOnly } : local;
    const plan = order.fullOnly ? 'full' : (this.state.plan ?? 'adv');
    const adv = plan === 'adv';
    const TOTAL = order.total;
    const eur = (n: number) => fmt(n) + '\u00a0€';
    const advAmt = fmt(order.advance),
      restAmt = fmt(order.rest),
      totalAmt = fmt(TOTAL);
    const TODAY_LABEL = 'сегодня, ' + shortDate(TODAY);
    // how the rest is paid: a payment link, a bank transfer or cash in our office;
    // at Eglė the sanatorium itself is paid on arrival
    const HOW =
      'пришлём ссылку для оплаты картой или реквизиты для банковского перевода, можно и наличными в нашем офисе';
    const atSan = transferBySanatorium(booking.hotelId);
    const flightRest = order.flight ? Math.max(0, order.flight - DEPOSIT_FLIGHT_PP * persons(booking)) : 0;
    const sanRest = order.rest - flightRest;
    const restLines = atSan
      ? [
          ...(flightRest ? ['Перелёт: остаток ' + eur(flightRest) + ' — до ' + order.dueDate + '; ' + HOW + '.'] : []),
          'Санаторий: остаток ' + eur(sanRest) + ' оплачиваете на месте, при заезде.',
        ]
      : ['Остаток ' + eur(order.rest) + ' — до ' + order.dueDate + ': ' + HOW + '.'];
    // one plain sentence right above the pay button: what is paid now and what is left.
    // Built from the same numbers as the button (the server quote once it arrives).
    // Free cancellation is said only as the rules page says it: free until the rest is due.
    const FREE_CANCEL = 'До ' + order.dueDate + ' отмена бесплатная.';
    const paySentence = order.fullOnly
      ? 'Сейчас вы платите всю сумму — ' +
        eur(TOTAL) +
        '. До заезда меньше недели, поэтому нужна полная оплата. На месте ничего доплачивать не нужно.'
      : adv
        ? 'Сейчас вы платите депозит ' +
          eur(order.advance) +
          '. ' +
          (atSan
            ? (flightRest ? 'Остаток за перелёт ' + eur(flightRest) + ' — до ' + order.dueDate + '. ' : '') +
              'Остаток за санаторий ' +
              eur(sanRest) +
              ' — на месте, при заезде. '
            : 'Остаток ' + eur(order.rest) + ' — до ' + order.dueDate + '. ') +
          FREE_CANCEL
        : 'Сейчас вы платите всю сумму — ' + eur(TOTAL) + '. На месте ничего доплачивать не нужно. ' + FREE_CANCEL;
    return {
      paySentence,
      restLines,
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
      // one rule for every line on the page:
      // deposit + sanatorium paid on arrival → the sanatorium rest at check-in (the flight rest by the due date);
      // deposit elsewhere → the rest by the due date, nothing at check-in; the whole sum → nothing later
      steps: adv
        ? atSan
          ? [
              { when: TODAY_LABEL, what: 'депозит — цена зафиксирована', sum: eur(order.advance) },
              ...(flightRest
                ? [
                    {
                      when: 'до ' + order.dueDate,
                      what: 'остаток за перелёт, до этой даты отмена бесплатная',
                      sum: eur(flightRest),
                    },
                  ]
                : []),
              { when: 'при заезде', what: 'остаток за санаторий — на месте, в санатории', sum: eur(sanRest) },
            ]
          : [
              { when: TODAY_LABEL, what: 'депозит — цена зафиксирована', sum: eur(order.advance) },
              { when: 'до ' + order.dueDate, what: 'остаток, до этой даты отмена бесплатная', sum: eur(order.rest) },
              { when: 'при заезде', what: 'ничего не доплачиваете', sum: '0\u00a0€' },
            ]
        : [{ when: TODAY_LABEL, what: 'вся сумма, больше ничего не платите', sum: eur(TOTAL) }],
      // the deposit option in the fold: when the rest is paid
      advLater: atSan
        ? flightRest
          ? 'За перелёт — до ' + order.dueDate + ', за санаторий — на месте, при заезде.'
          : 'Остальное — на месте, в санатории, при заезде.'
        : 'Остальное — позже, до ' + order.dueDate + '.',
      rest: adv
        ? atSan
          ? 'Остаток за санаторий ' +
            eur(sanRest) +
            ' — на месте, при заезде' +
            (flightRest ? '; за перелёт ' + eur(flightRest) + ' — до ' + order.dueDate : '') +
            '. Отмена до ' +
            order.dueDate +
            ' бесплатная'
          : 'Остаток ' + restAmt + '\u00a0€ — до ' + order.dueDate + ', отмена до этой даты бесплатная'
        : 'Всё оплачено. На месте ничего доплачивать не нужно',
      payLabel: !q
        ? 'Считаем сумму…'
        : adv
          ? 'Внести депозит ' + advAmt + '\u00a0€'
          : 'Оплатить ' + totalAmt + '\u00a0€',
      quoteReady: !!q,
      quoteFailed: !!this.state.quoteFailed,
    };
  }
}

export default function PaymentPage() {
  usePageTitle('Шаг 4 из 4 — оплата');
  const [v, logic] = usePageLogic(PaymentLogic);
  const order = orderSummary(logic.props.booking.booking);
  const quote = useQuote(logic.props.booking.booking);
  useEffect(() => {
    if (quote.data !== (logic.state.quote ?? null) || !!quote.error !== !!logic.state.quoteFailed)
      logic.setState({ quote: quote.data, quoteFailed: !!quote.error });
  }, [quote.data, quote.error, logic]);
  return (
    <div className="page pg-payment">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span className="hd-note" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg
                width="20"
                height="20"
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
              </svg>
              Защищённая оплата
            </span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps current={4} />
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
              // paid: the confirmation may open (StepGuard)
              // what was really paid (the deposit or the whole sum), for the confirmation page
              const paid: 'adv' | 'full' = v.fullCls ? 'full' : 'adv';
              logic.props.booking.update(logic.props.booking.booking.progress < 4 ? { paid, progress: 4 } : { paid });
              track('Deposit paid', { plan: paid });
              logic.props.navigate('/done');
            }}
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="pay-h1">Последний шаг — оплата</h1>
              <p style={{ margin: '0', color: 'var(--ink-2)', fontSize: '18px' }}>
                После оплаты сразу передаём заказ в санаторий и пришлём подтверждение в WhatsApp.
              </p>
            </div>
            {/* Plan */}
            <section
              id="payPlan"
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 style={{ fontSize: '24px' }}>Сумма к оплате сейчас</h2>
              {/* what is paid today, and how the rest is paid; other ways fold out below */}
              <div className="pay-now">
                <span className="pay-now-h">
                  <strong className="plan-title">
                    {v.advCls ? (
                      <>
                        Депозит сегодня — <span className="nowrap">{v.advAmt}&nbsp;€</span>
                      </>
                    ) : (
                      <>
                        Вся сумма сегодня — <span className="nowrap">{v.totalAmt}&nbsp;€</span>
                      </>
                    )}
                  </strong>
                  {v.advCls ? <span className="plan-badge">Цена фиксируется</span> : null}
                </span>
                {v.advCls ? (
                  <>
                    <span className="plan-text">
                      {v.depositRule}. До {v.dueDate} отмена бесплатная, депозит возвращаем.
                    </span>
                    {(v.restLines || []).map((t: string) => (
                      <span className="plan-text pay-rest" key={t}>
                        {t}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="plan-text">
                    {v.fullOnly
                      ? 'До заезда меньше недели — бронь подтверждаем только после полной оплаты.'
                      : v.fullIncludes + ' Больше ничего не платить.'}
                  </span>
                )}
              </div>
              {v.fullOnly ? null : (
                <details className="pay-more">
                  <summary>Оплатить всю сумму сразу · график оплаты</summary>
                  <div className="pay-more-in">
                    <div className="plan-list">
                      <button type="button" className={`choice plan plan-main ${v.advCls ?? ''}`} onClick={v.pickAdv}>
                        <span className={`radio ${v.advCls ?? ''}`}>
                          <i />
                        </span>
                        <span className="plan-body plan-inline">
                          <strong className="plan-title">
                            Депозит — <span className="nowrap">{v.advAmt}&nbsp;€</span>
                          </strong>
                          <span className="plan-text">{v.advLater}</span>
                        </span>
                      </button>
                      <button type="button" className={`choice plan plan-alt ${v.fullCls ?? ''}`} onClick={v.pickFull}>
                        <span className={`radio ${v.fullCls ?? ''}`}>
                          <i />
                        </span>
                        <span className="plan-body plan-inline">
                          <strong className="plan-title">
                            Вся сумма — <span className="nowrap">{v.totalAmt}&nbsp;€</span>
                          </strong>
                          <span className="plan-text">
                            {v.fullIncludes} Больше ничего не платить — удобно, если оплачивают родственники.
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
                  </div>
                </details>
              )}
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
                  stroke="var(--green)"
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
                <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                  Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <CardForm withId idPrefix="pay" />
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    fontSize: '16px',
                    color: 'var(--ink-2)',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
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

              <div
                style={{
                  fontSize: '16px',
                  color: 'var(--ink-2)',
                  borderTop: '1px solid var(--line)',
                  paddingTop: '12px',
                }}
              >
                Нужен банковский перевод (например, оплачивает организация)?{' '}
                <a href={PHONE_TEL} style={{ fontWeight: '700' }}>
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
                    stroke="var(--green)"
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
                        <b>До заезда меньше недели</b> — условия отмены по правилам санатория, подскажем их перед
                        оплатой.
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
                    stroke="var(--green)"
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
                    stroke="var(--accent)"
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
                        <b>После {v.dueDate}</b> — удерживаем депозит, остаток возвращаем за вычетом того, что
                        удерживает санаторий.
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
                    stroke="var(--green)"
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
              {/* the required consent: a plain row under a hairline (no box inside the card) */}
              <label id="payAgree" className="chk chk-row">
                <input type="checkbox" />
                <span>
                  Принимаю <Link to="/rules#cancel">условия бронирования и отмены</Link> и даю согласие на{' '}
                  <Link to="/privacy">обработку данных гостей</Link> для этого заказа.
                </span>
              </label>
            </section>
            {/* what is paid now and what is left — said once, right above the pay button */}
            <p className="pay-sentence">{v.paySentence}</p>
            <StepNext
              verb="не отметили"
              back={{ to: '/guests', label: '← Назад к гостям' }}
              next={{
                to: '/done',
                label: v.payLabel,
                icon: (
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
                  </svg>
                ),
              }}
              info={
                <>
                  Сейчас к оплате: <strong>{v.amount}</strong>
                </>
              }
              missing={() => [
                ...(v.quoteReady
                  ? []
                  : [
                      {
                        label: v.quoteFailed
                          ? 'сумма к оплате — нет связи, позвоните нам'
                          : 'сумма к оплате (ещё считается)',
                        target: '#payPlan',
                      },
                    ]),
                // [ТЕСТОВЫЙ РЕЖИМ] any card details are taken, only empty fields are asked for
                ...cardMissing('pay'),
                ...(document.querySelector<HTMLInputElement>('#payAgree input')?.checked
                  ? []
                  : [{ label: 'согласие с условиями бронирования', target: '#payAgree' }]),
              ]}
            />
            {/* a person to ask, right under the pay button */}
            <p className="pay-help">
              Есть вопрос? Позвоните{' '}
              <a href={PHONE_TEL} className="pay-help-a nowrap">
                {PHONE_DISPLAY}
              </a>{' '}
              или напишите в{' '}
              <a href={WHATSAPP_URL} className="pay-help-a" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              .
            </p>
            {/* the newsletter: optional, not ticked for the guest, apart from the consent and after the button */}
            <label id="payNews" className="chk pay-news">
              <input type="checkbox" />
              <span>
                По желанию: присылать новости о санаториях Литвы — не чаще раза в месяц, отписаться можно в любой
                момент.
              </span>
            </label>
          </form>
          <OrderSummary
            details={[
              ['Даты', order.dates],
              ['Номер', order.roomName],
              ['Программа', order.programName, order.programPerDay],
              ['Гости', guestNames(logic.props.booking.booking) || order.guests],
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
                  background: 'var(--green-soft)',
                  borderRadius: 'var(--r-field)',
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
                    color: 'var(--green)',
                  }}
                >
                  <span>Платите сейчас</span>
                  <strong style={{ fontSize: '24px', fontWeight: '800', whiteSpace: 'nowrap' }}>{v.amount}</strong>
                </div>
                <div style={{ fontSize: '16px', lineHeight: '1.5', color: 'var(--ink-2)' }}>{v.rest}</div>
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
