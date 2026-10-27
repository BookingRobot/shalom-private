import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './PaymentPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class PaymentLogic extends PageLogic {
  constructor(props?: any) {
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
    const TOTAL = 2138,
      ADV_RATE = 0.04,
      ILS = 3.85;
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
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
          '\u00a0€ — при заезде 9 ноября в санатории.'
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
  usePageTitle('Шаг 3 из 3 — оплата');
  const [v, logic] = usePageLogic(PaymentLogic);
  return (
    <div className="page pg-payment">
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
            <div className="step done">
              <span className="num">✓</span>Гости
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
              <span className="num">✓</span>Рейсы
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
            action="done.html"
            style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '36px' }}>Как вам удобнее оплатить?</h1>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))',
                  gap: '14px',
                }}
              >
                <button type="button" className={`choice ${v.advCls ?? ''}`} onClick={v.pickAdv}>
                  {' '}
                  <span className={`radio ${v.advCls ?? ''}`}>
                    <i />
                  </span>{' '}
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <strong style={{ fontSize: '22px', lineHeight: '1.2' }}>
                      Минимальный аванс — <span style={{ whiteSpace: 'nowrap' }}>{v.advAmt}&nbsp;€</span>
                    </strong>
                    <span style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>
                      4&nbsp;% от стоимости бронирования
                    </span>
                    <span style={{ color: '#3E4B44', fontSize: '16px' }}>
                      Этого достаточно, чтобы санаторий подтвердил бронь. Остальные{' '}
                      <strong style={{ color: '#1C2620', whiteSpace: 'nowrap' }}>{v.restAmt}&nbsp;€</strong> оплатите
                      при заезде: наличными, картой или переводом.
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignSelf: 'flex-start',
                        background: '#FFF1D6',
                        color: '#8A5A00',
                        fontSize: '14px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '2px',
                      }}
                    >
                      Так платят 9 из 10 гостей
                    </span>
                  </span>{' '}
                </button>
                <button type="button" className={`choice ${v.fullCls ?? ''}`} onClick={v.pickFull}>
                  {' '}
                  <span className={`radio ${v.fullCls ?? ''}`}>
                    <i />
                  </span>{' '}
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <strong style={{ fontSize: '22px', lineHeight: '1.2' }}>
                      Вся сумма — <span style={{ whiteSpace: 'nowrap' }}>{v.totalAmt}&nbsp;€</span>
                    </strong>
                    <span style={{ color: '#3E4B44', fontSize: '16px' }}>
                      Ничего не платить на месте. Удобно, если оплачивают родственники или организация.
                    </span>
                  </span>{' '}
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
              <h2 style={{ fontSize: '24px' }}>Способ оплаты</h2>
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
                    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.25' }}>
                      <strong>Банковская карта</strong>
                      <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                        Visa, Mastercard, Isracard, Amex · Apple Pay, Google Pay
                      </span>
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
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '.02em',
                      }}
                    >
                      bit
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.25' }}>
                      <strong>Bit</strong>
                      <span style={{ fontSize: '14px', color: '#3E4B44' }}>
                        Через приложение на телефоне, в шекелях
                      </span>
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
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#6B776F',
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
                              color: '#8A968F',
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
                            style={{ display: 'flex', alignItems: 'center', color: '#8A968F', fontSize: '20px' }}
                          >
                            ММ / ГГ
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className="lbl">CVV</span>
                          <div
                            className="input"
                            style={{ display: 'flex', alignItems: 'center', color: '#8A968F', fontSize: '20px' }}
                          >
                            •••
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span className="lbl">Номер удостоверения личности (ת.ז.) — для карт израильских банков</span>
                        <div
                          className="input"
                          style={{ display: 'flex', alignItems: 'center', color: '#8A968F', fontSize: '18px' }}
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
                        fontSize: '15px',
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
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#6B776F',
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
                              <span style={{ fontSize: '15px', color: '#3E4B44', whiteSpace: 'nowrap' }}>
                                = {v.amount}
                              </span>
                            </div>
                            <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                              <strong>С компьютера:</strong> откройте Bit на телефоне и наведите камеру на QR-код.
                              <br />
                              <strong>С телефона:</strong> нажмите зелёную кнопку внизу — откроется приложение Bit.
                            </div>
                            <div style={{ fontSize: '14px', color: '#3E4B44' }}>
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
                    <div style={{ fontSize: '14px', color: '#6B776F' }}>
                      Сумма пересчитана в шекели по курсу [КУРС] на сегодня. Цены в заказе остаются в евро.
                    </div>
                  </div>
                </>
              ) : null}
              <div style={{ fontSize: '15px', color: '#3E4B44', borderTop: '1px solid #E3DED2', paddingTop: '12px' }}>
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
                  <strong>Mikhail Levin, Irina Levina</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#3E4B44' }}>Трансфер</span>
                  <strong>Вильнюс, аэропорт ⇄ санаторий</strong>
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
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '16px' }}>
                  <span>Платите сейчас</span>
                  <strong style={{ fontSize: '22px' }}>{v.amount}</strong>
                </div>
                <div style={{ fontSize: '15px', color: '#3E4B44' }}>{v.rest}</div>
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
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
