import { VanIcon } from '../../components/icons';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../../data/contacts';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { orderSummary } from '../../lib/orderSummary';
import { daysBetween, nightsWord, plural, shortDate, toD } from '../../lib/dates';
import { fmt } from '../../lib/format';
import { TODAY } from '../../data/demo';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { HelpStripBand } from '../../components/layout/HelpStrip';
import { AgencyBlock, FooterSlot } from '../../components/layout/SiteFooter';
import { usePageTitle } from '../../lib/usePageTitle';
import './DonePage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class DoneLogic extends PageLogic {
  renderVals() {
    return this._rv();
  }
  _rv() {
    return {};
  }
}

export default function DonePage() {
  usePageTitle('Заказ принят');
  const [, logic] = usePageLogic(DoneLogic);
  const booking = logic.props.booking.booking;
  const o = orderSummary(booking);
  const inDay = shortDate(toD(booking.checkin));
  const outDay = shortDate(toD(booking.checkout));
  const daysLeft = daysBetween(TODAY, toD(booking.checkin));
  const eur = (n: number) => fmt(n) + '\u00a0€';
  return (
    <div className="page pg-done">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <PhoneLink />
        </HeaderBar>
        <CheckoutSteps current={5} compact />
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '32px 24px 48px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Status */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'var(--green-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '32px' }}>Спасибо! Заказ № 12345 принят</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '22px' }}>
                  Депозит {o.advanceLabel} внесён — цена зафиксирована.
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--warn-bg)',
                    color: 'var(--warn-ink)',
                    fontWeight: '700',
                    fontSize: '16px',
                    padding: '7px 12px',
                    borderRadius: 'var(--r-field)',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Ожидаем подтверждение санатория
                </span>
              </div>
              <p style={{ fontSize: '17px', color: 'var(--ink-2)' }}>
                Детали заказа отправлены на <strong style={{ color: 'var(--ink)' }}>name@gmail.com</strong> и в
                WhatsApp.
              </p>
            </div>
          </div>
          {/* Next step band */}
          <div
            style={{
              background: 'var(--green-line)',
              borderRadius: 'var(--r-field)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--green)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flex: 'none' }}
            >
              <path d="M3 6h18v12H3zM3 6l9 7 9-7" />
              <circle cx="18" cy="17" r="4.5" fill="var(--green-line)" />
              <path d="M18 15v2l1.5 1" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <strong style={{ fontSize: '18px', color: 'var(--green)' }}>
                Следующий шаг — подтверждение санатория до 28 октября.
              </strong>
              <span style={{ fontSize: '16px', color: 'var(--ink)' }}>Сейчас от вас ничего не требуется.</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'start' }}>
            {/* Left: timeline */}
            <div style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <section
                className="card"
                style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <h2 style={{ fontSize: '26px' }}>Что дальше</h2>
                  <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                    До заезда {daysLeft} {plural(daysLeft, ['день', 'дня', 'дней'])}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div className="tl">
                    <div className="line" />
                    <div className="dot" style={{ background: 'var(--green)', borderColor: 'var(--green)' }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--paper)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">27 октября · сегодня</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Депозит получен
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Оплата {o.advanceLabel} прошла успешно. Цена больше не изменится.
                      </span>
                    </div>
                  </div>
                  <div className="tl" style={{ background: 'var(--warn-bg)' }}>
                    <div className="line" />
                    <div className="dot" style={{ borderColor: 'var(--accent)' }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip" style={{ background: 'var(--warn-bg)', color: 'var(--warn-ink)' }}>
                        До 28 октября
                      </span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Подтверждение санатория
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Отправим ваучер с номером брони на почту и в WhatsApp.
                      </span>
                    </div>
                  </div>
                  <div className="tl">
                    <div className="line" />
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">2–6 ноября</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Памятка и встреча
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Пришлём время встречи, контакты водителя и список вещей.
                      </span>
                    </div>
                  </div>
                  <div className="tl">
                    <div className="line" />
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">{inDay} · с 14:00</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Заезд в санаторий
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Всё оплачено заранее — на месте доплачивать ничего не нужно.
                      </span>
                    </div>
                  </div>
                  <div className="tl">
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">{outDay} · до 12:00</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Выезд и обратный трансфер
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Время подачи автомобиля согласуем отдельно.
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link className="btn btn-primary" to="/done">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                  Скачать детали заказа
                </Link>
                <Link className="btn btn-secondary" to="/done">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Добавить в календарь
                </Link>
              </div>
              <Link to="/" style={{ fontWeight: '700', fontSize: '16px' }}>
                На главную
              </Link>
              <section
                style={{
                  background: 'var(--green-soft)',
                  border: '1px solid var(--green-line)',
                  borderRadius: 'var(--r-field)',
                  padding: '22px 24px',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
                </svg>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '20px' }}>
                      Нужна помощь? Мы на связи
                    </strong>
                    <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                      Отвечаем на русском языке.
                      <br />
                      Назовите номер заказа <strong style={{ color: 'var(--ink)' }}>12345</strong>.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a className="btn btn-secondary" href={WHATSAPP_URL}>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" />
                        <path d="M9 10a4 4 0 0 0 5 5" />
                      </svg>
                      Написать в WhatsApp
                    </a>
                    <a
                      className="btn btn-secondary"
                      href={PHONE_TEL}
                      style={{ flexDirection: 'column', gap: '0', lineHeight: '1.2', padding: '8px 20px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
                        </svg>
                        Позвонить
                      </span>
                      <span dir="ltr">{PHONE_DISPLAY}</span>
                    </a>
                  </div>
                </div>
              </section>
            </div>
            {/* Right: trip + payment */}
            <aside
              style={{ flex: '1 1 300px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div className="card" style={{ overflow: 'hidden' }}>
                <img
                  src="/img/d82431114d102eee0f48639f84940aad.jpg"
                  alt=""
                  style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                />{' '}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '22px', fontWeight: '600' }}>
                      Эгле Комфорт
                    </div>
                    <span style={{ color: 'var(--warn-ink)', fontSize: '16px', letterSpacing: '1px' }}>★★★★</span>
                  </div>
                  <div className="fact">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Друскининкай · Eglės g. 1
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      borderTop: '1px solid var(--line)',
                      borderBottom: '1px solid var(--line)',
                      padding: '10px 0',
                    }}
                  >
                    <div
                      style={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        paddingRight: '12px',
                        borderRight: '1px solid var(--line)',
                      }}
                    >
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>Заезд</span>
                      <span className="fact" style={{ fontWeight: '700' }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--green)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                        </svg>
                        {inDay} · 14:00
                      </span>
                    </div>
                    <div
                      style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '12px' }}
                    >
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>Выезд</span>
                      <span className="fact" style={{ fontWeight: '700' }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--green)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                        </svg>
                        {outDay} · 12:00
                      </span>
                    </div>
                  </div>
                  <div className="fact">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                    </svg>
                    {o.nights} {nightsWord(o.nights)} · {o.guests}
                  </div>
                  <div className="fact">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M5 9V6h6v3M13 9V6h6v3" />
                    </svg>
                    Двухместный номер
                  </div>
                  <div className="fact">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
                    </svg>
                    {o.programFull}
                  </div>
                  <div className="fact">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="8" r="3.5" />
                      <circle cx="17" cy="9" r="2.5" />
                      <path d="M2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3M15 21v-3a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v3" />
                    </svg>
                    Гости: Mikhail Levin, Irina Levina
                  </div>
                  <div className="fact">
                    <VanIcon height={20} />
                    {o.transferLine}
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h2 style={{ fontSize: '22px' }}>Стоимость и оплата</h2>
                <div className="row">
                  <span style={{ color: 'var(--ink-2)' }}>
                    Проживание и программа{o.stayCalc ? ', ' + o.stayCalc : ''}
                  </span>
                  <strong>{o.stayLabel}</strong>
                </div>
                {o.flight ? (
                  <div className="row">
                    <span style={{ color: 'var(--ink-2)' }}>Перелёт и трансфер</span>
                    <strong>{o.flightLabel}</strong>
                  </div>
                ) : null}
                {o.transfer ? (
                  <div className="row">
                    <span style={{ color: 'var(--ink-2)' }}>{o.transferKind}</span>
                    <strong>{o.transferLabel}</strong>
                  </div>
                ) : null}
                <div
                  className="row"
                  style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', fontSize: '18px' }}
                >
                  <strong>Всего</strong>
                  <strong style={{ fontSize: '20px' }}>{o.totalLabel}</strong>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--ink-2)' }}>Оплачено</span>
                  <strong style={{ color: 'var(--green)' }}>{o.advanceLabel} ✓</strong>
                </div>
                <div
                  style={{
                    background: 'var(--green-soft)',
                    borderRadius: 'var(--r-field)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ color: 'var(--green)', fontSize: '16px', fontWeight: '700' }}>
                    Осталось оплатить до {o.dueDate}
                  </span>
                  <strong style={{ fontSize: '28px', lineHeight: '1.1', color: 'var(--green)', whiteSpace: 'nowrap' }}>
                    {eur(o.total - o.advance)}
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '16px' }}>
                  <span>Картой или переводом — пришлём ссылку на оплату и напомним за неделю.</span>
                  <span>До {o.dueDate} отмена бесплатная.</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start',
                    fontSize: '16px',
                    color: 'var(--ink-2)',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                    style={{ flex: 'none', marginTop: '2px' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  При заезде доплачивать ничего не нужно.
                </div>
              </div>
            </aside>
          </div>
        </div>
        <HelpStripBand />
        <footer style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'Montserrat,Manrope,sans-serif',
                fontSize: '18px',
                fontWeight: '700',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="var(--green)" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="var(--sand)" />
              </svg>
              Санатории Литвы
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/rules#contact" style={{ textDecoration: 'none', color: 'var(--ink-2)' }}>
                Контакты
              </Link>
              <Link to="/rules" style={{ textDecoration: 'none', color: 'var(--ink-2)' }}>
                Оплата и отмена
              </Link>
            </div>
            <FooterSlot />
          </div>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px 18px' }}>
            <AgencyBlock tone="light" />
          </div>
        </footer>
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
