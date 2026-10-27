import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { fmt } from '../../lib/format';
import { OrderSummary } from '../../components/OrderSummary';
import { ADVANCE_RATE, orderSummary } from '../../lib/orderSummary';
import { shortDate, toD } from '../../lib/dates';
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
    this.state = { plan: 'adv', method: 'card' };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const plan = this.state.plan ?? 'adv';
    const method = this.state.method ?? 'card';
    const adv = plan === 'adv';
    // Минимальный аванс — 4 % от суммы бронирования (проживание и программа), округляем вверх до евро
    const booking = this.props.booking.booking;
    const TOTAL = orderSummary(booking).stay,
      ADV_RATE = ADVANCE_RATE,
      ILS = 3.85;
    const checkinDay = shortDate(toD(booking.checkin));
    const advN = Math.ceil(TOTAL * ADV_RATE),
      restN = TOTAL - advN;
    const advAmt = fmt(advN),
      restAmt = fmt(restN),
      totalAmt = fmt(TOTAL);
    const amount = adv ? advAmt + '\u00a0€' : totalAmt + '\u00a0€';
    return {
      advAmt,
      restAmt,
      totalAmt,
      advCls: adv ? 'on' : '',
      fullCls: adv ? '' : 'on',
      pickAdv: () => this.setState({ plan: 'adv' }),
      pickFull: () => this.setState({ plan: 'full' }),
      isCard: method === 'card',
      isBit: method === 'bit',
      cardCls: method === 'card' ? 'on' : '',
      bitCls: method === 'bit' ? 'on' : '',
      pickCard: () => this.setState({ method: 'card' }),
      pickBit: () => this.setState({ method: 'bit' }),
      // Bit: ILS only, up to 5 000 ₪ per payment [КУРС EUR→ILS — из платёжной системы]
      bitIls: fmt(Math.round((adv ? advN : TOTAL) * ILS)) + '\u00a0₪',
      bitOk: (adv ? advN : TOTAL) * ILS <= 5000,
      bitTooBig: (adv ? advN : TOTAL) * ILS > 5000,
      amount,
      schedule: adv
        ? 'График: ' +
          advAmt +
          '\u00a0€ — сегодня, 27 октября. ' +
          restAmt +
          '\u00a0€ — при заезде ' +
          checkinDay +
          ' в санатории.'
        : 'График: ' + totalAmt + '\u00a0€ — сегодня, 27 октября. На месте доплачивать ничего не нужно.',
      rest: adv ? 'Остаток ' + restAmt + '\u00a0€ — в санатории при заезде' : 'На месте ничего доплачивать не нужно',
      payLabel:
        method === 'bit' && (adv ? advN : TOTAL) * ILS <= 5000
          ? 'Оплатить в Bit ' + fmt(Math.round((adv ? advN : TOTAL) * ILS)) + '\u00a0₪'
          : adv
            ? 'Оплатить аванс ' + advAmt + '\u00a0€'
            : 'Оплатить ' + totalAmt + '\u00a0€',
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
        <HeaderBar minHeight={84}>
          <Brand logo={40} size={24} />
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
            <PhoneLink icon={24} />
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
              <h1 style={{ fontSize: '38px' }}>Как вам удобнее оплатить?</h1>
              <p style={{ margin: '0', color: '#3E4B44', fontSize: '18px' }}>
                Заказ подтверждается после оплаты. Санаторий бронирует номер за вами сразу.
              </p>
            </div>
            {/* Plan */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 style={{ fontSize: '28px' }}>Сумма к оплате сейчас</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))',
                  gap: '14px',
                }}
              >
                <button type="button" className={`choice plan ${v.advCls ?? ''}`} onClick={v.pickAdv}>
                  <span className={`radio ${v.advCls ?? ''}`}>
                    <i />
                  </span>
                  <span className="plan-body">
                    <span className="plan-title">Минимальный аванс</span>
                    <span className="plan-amount">
                      {v.advAmt}&nbsp;€ <small>сейчас</small>
                    </span>
                    <span className="plan-note">4&nbsp;% от стоимости бронирования</span>
                    <span className="plan-text">Этого достаточно, чтобы санаторий подтвердил бронь.</span>
                    <span className="plan-rest">
                      Остальные <strong>{v.restAmt}&nbsp;€</strong> — при заезде: наличными, картой или переводом.
                    </span>
                    <span className="plan-badge">Так платят 9 из 10 гостей</span>
                  </span>
                </button>
                <button type="button" className={`choice plan ${v.fullCls ?? ''}`} onClick={v.pickFull}>
                  <span className={`radio ${v.fullCls ?? ''}`}>
                    <i />
                  </span>
                  <span className="plan-body">
                    <span className="plan-title">Вся сумма</span>
                    <span className="plan-amount">
                      {v.totalAmt}&nbsp;€ <small>сейчас</small>
                    </span>
                    <span className="plan-note">Ничего не платить на месте</span>
                    <span className="plan-text">Удобно, если оплачивают родственники или организация.</span>
                  </span>
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'start',
                  padding: '14px 16px',
                  borderRadius: '2px',
                  background: '#F4F1EA',
                  fontSize: '16px',
                  color: '#3E4B44',
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
                  style={{ flex: 'none' }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>{v.schedule}</span>
              </div>
            </section>
            {/* Method */}
            <section
              className="card"
              style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <h2 style={{ fontSize: '28px' }}>Способ оплаты</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`choice ${v.cardCls ?? ''}`}
                  onClick={v.pickCard}
                  style={{ flex: '1 1 260px', alignItems: 'center' }}
                >
                  {' '}
                  <span className={`radio ${v.cardCls ?? ''}`} style={{ margin: '0' }}>
                    <i />
                  </span>{' '}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg
                      width="30"
                      height="30"
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
                    <span className="method-body">
                      <span className="method-title">Банковская карта</span>
                      <span className="method-text">Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay</span>
                    </span>
                  </span>{' '}
                </button>
                <button
                  type="button"
                  className={`choice ${v.bitCls ?? ''}`}
                  onClick={v.pickBit}
                  style={{ flex: '1 1 260px', alignItems: 'center' }}
                >
                  {' '}
                  <span className={`radio ${v.bitCls ?? ''}`} style={{ margin: '0' }}>
                    <i />
                  </span>{' '}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        width: '40px',
                        height: '30px',
                        flex: 'none',
                        borderRadius: '2px',
                        background: '#1F5F4A',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '.02em',
                      }}
                    >
                      bit
                    </span>
                    <span className="method-body">
                      <span className="method-title">Bit</span>
                      <span className="method-text">Через приложение на телефоне, в шекелях</span>
                    </span>
                  </span>{' '}
                </button>
              </div>
              {v.isCard ? (
                <>
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
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#5E6862',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                          }}
                        >
                          [iframe Tranzila]
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
                              fontSize: '20px',
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
                            style={{ display: 'flex', alignItems: 'center', color: '#6B776F', fontSize: '20px' }}
                          >
                            ММ / ГГ
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className="lbl">CVV</span>
                          <div
                            className="input"
                            style={{ display: 'flex', alignItems: 'center', color: '#6B776F', fontSize: '20px' }}
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
                        Данные карты вводятся в защищённой форме платёжной системы Tranzila прямо на этой странице — мы
                        их не видим и не храним. Банк может попросить подтвердить оплату кодом из SMS.
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
              {v.isBit ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {v.bitOk ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            gap: '22px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            border: '2px solid #C8DED3',
                            background: '#EEF5F1',
                            borderRadius: '2px',
                            padding: '18px 20px',
                          }}
                        >
                          <div
                            aria-label="QR-код для оплаты в Bit"
                            style={{
                              width: '150px',
                              height: '150px',
                              flex: 'none',
                              background: '#fff',
                              border: '1px solid #CFC9BB',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: '#5E6862',
                              textAlign: 'center',
                              padding: '10px',
                            }}
                          >
                            [QR-код Bit]
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 300px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '22px' }}>
                                К оплате в Bit: <span style={{ whiteSpace: 'nowrap' }}>{v.bitIls}</span>
                              </strong>
                              <span style={{ fontSize: '16px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                                = {v.amount}
                              </span>
                            </div>
                            <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                              <strong>С компьютера:</strong> откройте Bit на телефоне и наведите камеру на QR-код.
                              <br />
                              <strong>С телефона:</strong> нажмите зелёную кнопку внизу — откроется приложение Bit.
                            </div>
                            <div style={{ fontSize: '16px', color: '#3E4B44' }}>
                              Код действует 9 минут. После оплаты страница сама перейдёт к подтверждению заказа.
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.bitTooBig ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            background: '#FFF1D6',
                            borderRadius: '2px',
                            padding: '14px 18px',
                            fontSize: '16px',
                            color: '#1C2620',
                          }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#8A5A00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            style={{ flex: 'none', marginTop: '2px' }}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v5M12 16h.01" />
                          </svg>
                          <span>
                            Bit принимает платежи до 5&nbsp;000&nbsp;₪. Через Bit можно оплатить <strong>аванс</strong>;
                            для оплаты всей суммы выберите карту.
                          </span>
                        </div>
                      </>
                    ) : null}
                    <div style={{ fontSize: '16px', color: '#5E6862' }}>
                      Сумма пересчитана в шекели по курсу [КУРС] на сегодня. Цены в заказе остаются в евро.
                    </div>
                  </div>
                </>
              ) : null}
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
                <h2 style={{ fontSize: '28px' }}>Если планы изменятся</h2>
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
                    <b>За [N] и более дней</b> до заезда — отмена бесплатно, аванс возвращаем полностью.
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
                    <b>Менее чем за [N] дней</b> — аванс не возвращается, остальная сумма не взимается.
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
                    <b>По болезни</b> — с медицинской справкой возвращаем аванс полностью в любой срок.
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
                style={{ minHeight: '68px', fontSize: '22px', padding: '0 44px' }}
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
              ['Номер', 'Двухместный'],
              ['Программа', order.program],
              ['Гости', 'Mikhail Levin, Irina Levina'],
              ['Трансфер', order.transferPlaces],
            ]}
            prices={[
              ['Проживание и лечение', order.stayLabel],
              ...(order.transfer ? [[order.transferKind, order.transferLabel] as [string, string]] : []),
            ]}
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
                  <strong style={{ fontSize: '28px', fontWeight: '800', whiteSpace: 'nowrap' }}>{v.amount}</strong>
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
