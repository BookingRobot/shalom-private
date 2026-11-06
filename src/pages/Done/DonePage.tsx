import { useEffect, useState } from 'react';
import { VanIcon } from '../../components/icons';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../../data/contacts';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { guestNames, orderSummary } from '../../lib/orderSummary';
import { MONTHS, addD, daysBetween, nightsWord, plural, shortDate, toD } from '../../lib/dates';
import { TODAY } from '../../data/demo';
import type { Booking } from '../../data/booking';
import { transferBySanatorium } from '../../data/transferPolicy';
import { DEPOSIT_FLIGHT_PP, persons } from '../../lib/pricing';
import { fmt } from '../../lib/format';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { usePageTitle } from '../../lib/usePageTitle';
import './DonePage.css';

/** The order number: shown big in the hero and read out to the consultant. [ПРИМЕР ДАННЫХ] */
const ORDER_NO = '12345';
const HOTEL_NAME = 'Эгле Комфорт';
const HOTEL_ADDRESS = 'Eglės g. 1, Druskininkai';

/** What to pack — the same for every sanatorium until each one gets its own list. */
const BRING = [
  'Паспорт',
  'Медицинская страховка',
  'Выписки и назначения врача',
  'Удобная обувь',
  'Купальник и шапочка для бассейна',
];

/**
 * What is paid and what is still due — the same rule as step 4: where the sanatorium meets its
 * guests itself (Eglė), its rest is paid at the sanatorium on arrival; only the flight rest comes to us.
 */
function payState(b: Booking, o: ReturnType<typeof orderSummary>) {
  const eur = (n: number) => fmt(n) + ' €';
  const full = (b.paid ?? (o.fullOnly ? 'full' : 'adv')) === 'full';
  const atSan = transferBySanatorium(b.hotelId);
  const flightRest = o.flight ? Math.max(0, o.flight - DEPOSIT_FLIGHT_PP * persons(b)) : 0;
  const before = full ? 0 : atSan ? flightRest : o.rest; // paid to us by the due date
  const onArrival = full ? 0 : atSan ? o.rest - flightRest : 0; // paid at the sanatorium
  const restText = [
    before ? (atSan ? 'Перелёт: остаток ' : 'Остаток ') + eur(before) + ' — до ' + o.dueDate + '.' : '',
    onArrival
      ? (before ? 'Санаторий: остаток ' : 'Остаток ') + eur(onArrival) + ' оплачиваете в санатории при заезде.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    full,
    paidLabel: full ? o.totalLabel : o.advanceLabel,
    before,
    beforeLabel: eur(before),
    beforeTitle: atSan ? 'Оплата перелёта' : 'Оплата остатка',
    onArrival,
    onArrivalLabel: eur(onArrival),
    line: full
      ? `Оплачено ${o.totalLabel} — больше ничего платить не нужно.`
      : `Депозит ${o.advanceLabel} внесён — цена зафиксирована. ${restText}`,
  };
}

/** "2–6 ноября" / "30 октября – 3 ноября" */
function dayRange(a: Date, b: Date): string {
  if (a.getTime() >= b.getTime()) return shortDate(a);
  if (a.getUTCMonth() === b.getUTCMonth()) return a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[b.getUTCMonth()];
  return shortDate(a) + ' – ' + shortDate(b);
}

/** Dates of the «Что дальше» timeline, counted from today and the check-in day. */
function timelineDates(today: Date, checkin: Date) {
  // the sanatorium answers by the next day; the memo goes out 7–3 days before arrival
  const confirmBy = addD(today, 1);
  const memoFrom = new Date(Math.max(addD(checkin, -7).getTime(), confirmBy.getTime()));
  const memoTo = new Date(Math.max(addD(checkin, -3).getTime(), memoFrom.getTime()));
  return { today: shortDate(today), confirmBy: shortDate(confirmBy), memo: dayRange(memoFrom, memoTo) };
}

/** "+972 50 123 4567" from step 3, or '' when the guest has not given a phone */
function guestPhone(b: Booking): string {
  const d = b.details;
  if (!d || !d.phone.trim()) return '';
  return [d.phoneCode.split('·')[0].trim(), d.phone.trim()].filter(Boolean).join(' ');
}

/** Copies text; older browsers without the Clipboard API get the copy command. */
function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement('textarea');
  t.value = text;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  const ok = document.execCommand('copy');
  t.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
}

/** Saves the stay as a calendar file: check-in 14:00, check-out 12:00, Lithuanian time. */
function saveCalendar(b: Booking) {
  const at = (isoDay: string, hm: string) => isoDay.replace(/-/g, '') + 'T' + hm + '00';
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => '\\' + c);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BookingRobot//Shalom//RU',
    'BEGIN:VEVENT',
    'UID:order-' + ORDER_NO + '@shalom.bookingrobot.eu',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
    'DTSTART;TZID=Europe/Vilnius:' + at(b.checkin, '1400'),
    'DTEND;TZID=Europe/Vilnius:' + at(b.checkout, '1200'),
    'SUMMARY:' + esc('Санаторий ' + HOTEL_NAME + ' — заказ № ' + ORDER_NO),
    'LOCATION:' + esc(HOTEL_ADDRESS),
    'DESCRIPTION:' +
      esc('Заказ № ' + ORDER_NO + '. Заезд с 14:00, выезд до 12:00. Вопросы: ' + PHONE_DISPLAY + ' (WhatsApp).'),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zakaz-' + ORDER_NO + '.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** the page keeps no state of its own: the order comes from the shared booking */
class DoneLogic extends PageLogic<Record<string, never>> {
  renderVals(): Record<string, never> {
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
  const tl = timelineDates(TODAY, toD(booking.checkin));
  const phone = guestPhone(booking);
  const withTransfer = !!booking.transfer.mode && booking.transfer.mode !== 'none';
  const helpCtx: HelpContextInfo = {
    hotel: 'Санаторий ' + HOTEL_NAME + ', Друскининкай',
    in: booking.checkin,
    out: booking.checkout,
  };
  // one honest money line, used in the hero, the timeline and the payment box
  const pay = payState(booking, o);
  const paidLabel = pay.paidLabel;
  const moneyLine = pay.line;
  const askUrl = WHATSAPP_URL + '?text=' + encodeURIComponent('Здравствуйте! Мой заказ № ' + ORDER_NO + '. Вопрос: ');

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = () => {
    copyText(ORDER_NO).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <div className="page pg-done">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <PhoneLink />
        </HeaderBar>
        <CheckoutSteps current={5} compact />
        <div
          className="dn-wrap"
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
          <div className="dn-status" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
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
            <div className="dn-hero" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '0' }}>
              <h1 className="dn-h1">Спасибо! Заказ принят</h1>
              <div className="dn-order">
                <span className="dn-order-text">
                  Номер заказа <strong>{ORDER_NO}</strong>
                </span>
                <button
                  type="button"
                  className={'dn-copy' + (copied ? ' is-done' : '')}
                  onClick={copy}
                  aria-live="polite"
                >
                  {copied ? 'Скопировано ✓' : 'Скопировать'}
                </button>
              </div>
              <p className="dn-money">{moneyLine}</p>
              <p className="dn-now">
                Заказ передан в санаторий. Подтверждение пришлём до {tl.confirmBy}
                {phone ? (
                  <>
                    {' '}
                    в WhatsApp на номер{' '}
                    <span dir="ltr" style={{ whiteSpace: 'nowrap' }}>
                      {phone}
                    </span>
                  </>
                ) : null}
                . Сейчас от вас ничего не требуется.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'start' }}>
            {/* Left: timeline */}
            <div style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <section
                className="card"
                style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '4px 12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <h2 className="dn-h2">Что дальше</h2>
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
                      <span className="chip">{tl.today} · сегодня</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        {pay.full ? 'Оплата получена' : 'Депозит получен'}
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Оплата {paidLabel} прошла успешно.{' '}
                        {pay.full ? 'Больше ничего платить не нужно.' : 'Цена больше не изменится.'}
                      </span>
                    </div>
                  </div>
                  <div className="tl">
                    <div className="line" />
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">До {tl.confirmBy}</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        Подтверждение санатория
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        Пришлём ваучер с номером брони{phone ? ' в WhatsApp' : ''}.
                      </span>
                    </div>
                  </div>
                  {!pay.before ? null : (
                    <div className="tl">
                      <div className="line" />
                      <div className="dot" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="chip">До {o.dueDate}</span>
                        <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                          {pay.beforeTitle} — {pay.beforeLabel}
                        </strong>
                        <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                          Пришлём ссылку на оплату и напомним за неделю. До этой даты отмена бесплатная.
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="tl">
                    <div className="line" />
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">{tl.memo}</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        {withTransfer ? 'Памятка и встреча' : 'Памятка'}
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        {withTransfer
                          ? 'Пришлём время встречи, контакты водителя и подробную памятку.'
                          : 'Пришлём подробную памятку о поездке.'}
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
                        {pay.full
                          ? 'Всё оплачено — на месте доплачивать ничего не нужно.'
                          : pay.onArrival
                            ? `Остаток ${pay.onArrivalLabel} оплачиваете в санатории при заезде.`
                            : `Если остаток оплачен до ${o.dueDate}, на месте доплачивать ничего не нужно.`}
                      </span>
                    </div>
                  </div>
                  <div className="tl">
                    <div className="dot" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="chip">{outDay} · до 12:00</span>
                      <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '18px' }}>
                        {withTransfer && booking.transfer.back ? 'Выезд и обратный трансфер' : 'Выезд'}
                      </strong>
                      <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                        {withTransfer && booking.transfer.back
                          ? 'Время подачи автомобиля согласуем отдельно.'
                          : 'Номер нужно освободить до 12:00.'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="dn-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => saveCalendar(booking)}>
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
                  </button>
                </div>
              </section>
              <section className="card dn-bring">
                <h2 className="dn-h2">Что взять с собой</h2>
                <ul>
                  {BRING.map((item) => (
                    <li key={item}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--green)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
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
                <div
                  style={{ flex: '1 1 240px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong style={{ fontFamily: 'Montserrat,Manrope,sans-serif', fontSize: '20px' }}>
                      Нужна помощь? Мы на связи
                    </strong>
                    <span style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
                      Отвечаем на русском языке.
                      <br />
                      Назовите номер заказа <strong style={{ color: 'var(--ink)' }}>{ORDER_NO}</strong>.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a className="btn btn-secondary" href={askUrl}>
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
              <Link className="dn-home" to="/">
                На главную
              </Link>
            </div>
            {/* Right: trip + payment */}
            <aside
              style={{
                flex: '1 1 300px',
                minWidth: '0',
                maxWidth: '360px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
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
                      {HOTEL_NAME}
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
                        paddingInlineEnd: '12px',
                        borderInlineEnd: '1px solid var(--line)',
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
                      style={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        paddingInlineStart: '12px',
                      }}
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
                    Гости: {guestNames(booking) || o.guests}
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
                  <span style={{ color: 'var(--ink-2)' }}>{pay.full ? 'Оплачено полностью' : 'Депозит оплачен'}</span>
                  <strong style={{ color: 'var(--green)' }}>{paidLabel} ✓</strong>
                </div>
                {!pay.onArrival ? null : (
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
                      Оплачиваете в санатории при заезде
                    </span>
                    <strong
                      style={{ fontSize: '28px', lineHeight: '1.1', color: 'var(--green)', whiteSpace: 'nowrap' }}
                    >
                      {pay.onArrivalLabel}
                    </strong>
                  </div>
                )}
                {pay.full ? null : (
                  <>
                    {!pay.before ? null : (
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
                        <strong
                          style={{ fontSize: '28px', lineHeight: '1.1', color: 'var(--green)', whiteSpace: 'nowrap' }}
                        >
                          {pay.beforeLabel}
                        </strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '16px' }}>
                      {pay.before ? (
                        <span>Картой или переводом — пришлём ссылку на оплату и напомним за неделю.</span>
                      ) : null}
                      <span>До {o.dueDate} отмена бесплатная.</span>
                    </div>
                  </>
                )}
                <div
                  style={{
                    display: pay.onArrival ? 'none' : 'flex',
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
                  {pay.full
                    ? 'При заезде доплачивать ничего не нужно.'
                    : 'Когда остаток оплачен, при заезде доплачивать ничего не нужно.'}
                </div>
              </div>
            </aside>
          </div>
        </div>
        <SiteFooter />
      </div>{' '}
      <HelpWidget ctx={helpCtx} pageState={logic.state} />
    </div>
  );
}
