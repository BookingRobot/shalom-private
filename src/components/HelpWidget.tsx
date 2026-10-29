import { useEffect, useRef, type CSSProperties } from 'react';
import { FeedbackWidget } from './feedback/FeedbackWidget';
import { useHelp } from '../context/HelpContext';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../data/contacts';
import { PhoneCodeSelect } from './PhoneCodeSelect';
import { CheckIcon, CloseIcon, HeadsetIcon } from './icons';

/** What the current page already knows about the guest's plans (used to prefill the form). */
export interface HelpContextInfo {
  /** sanatorium the guest is looking at, e.g. "Санаторий Эгле Комфорт, Друскининкай" */
  hotel?: string;
  /** resort key when no specific sanatorium is chosen yet */
  dest?: string;
  in?: string;
  out?: string;
  /** distance of the sticky button from the bottom edge (pages with a sticky bottom bar move it up) */
  bottom?: string;
}

interface Props {
  ctx: HelpContextInfo;
  /** page state: dates the guest picked on this page override the defaults */
  pageState?: { in?: string; out?: string; checkin?: string; nights?: number };
}

const DESTINATIONS: [string, string][] = [
  ['', 'Ещё не знаю — подскажите'],
  ['druskininkai', 'Друскининкай'],
  ['birstonas', 'Бирштонас'],
  ['palanga', 'Паланга'],
  ['anyksciai', 'Аникщяй'],
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

const fieldLabel: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelText = (size: number): CSSProperties => ({ fontWeight: '700', fontSize: `${size}px`, color: '#3E4B44' });
const textInput: CSSProperties = {
  minHeight: '48px',
  border: '2px solid #CFC9BB',
  borderRadius: 'var(--r)',
  padding: '0 16px',
  font: '500 18px Manrope,sans-serif',
  width: '100%',
  boxSizing: 'border-box',
};
const smallField: CSSProperties = {
  minHeight: '52px',
  border: '2px solid #CFC9BB',
  borderRadius: 'var(--r)',
  padding: '0 12px',
  font: '600 17px Manrope,sans-serif',
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
};

/**
 * Sticky "Свяжитесь со мной" button + support pop-up. Same on every page;
 * dates and destination are prefilled from what the page knows.
 */
export function HelpWidget({ ctx, pageState = {} }: Props) {
  const { status, open, close, send } = useHelp();
  const dialogRef = useRef<HTMLDivElement>(null);

  let helpIn = pageState.in || pageState.checkin || ctx.in || '';
  let helpOut = pageState.out || ctx.out || '';
  if (!pageState.out && pageState.checkin) {
    const d = new Date(pageState.checkin + 'T00:00:00Z');
    helpOut = iso(new Date(d.getTime() + (pageState.nights || 9) * 86400000));
  }
  const dests = [...DESTINATIONS];
  if (ctx.hotel) dests.splice(2, 0, ['hotel', ctx.hotel]);
  const selected = ctx.hotel ? 'hotel' : ctx.dest || '';
  const prefilled = !!(helpIn || selected);

  // keyboard: Esc closes, focus moves into the dialog
  useEffect(() => {
    if (status === 'closed') return;
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, close]);

  return (
    <>
      {/* «Ваши пожелания» sits right above «Свяжитесь со мной» on every page */}
      <FeedbackWidget bottom={ctx.bottom || '20px'} />
      <button
        type="button"
        className="help-fab"
        dir="ltr"
        lang="ru"
        data-feedback-ignore
        onClick={open}
        aria-haspopup="dialog"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: ctx.bottom || '20px',
          zIndex: '40',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minHeight: '48px',
          padding: '0 18px 0 10px',
          border: 'none',
          borderRadius: '30px',
          background: '#1F5F4A',
          color: '#fff',
          font: "700 16px Manrope,'Segoe UI',Arial,sans-serif",
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(18,34,27,.35)',
        }}
      >
        <span
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HeadsetIcon size={18} color="#fff" strokeWidth={2} />
        </span>
        Свяжитесь со мной
      </button>

      {status !== 'closed' && (
        <div
          dir="ltr"
          lang="ru"
          onClick={(e) => e.target === e.currentTarget && close()}
          style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(18,34,27,.55)',
            zIndex: '70',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 16px',
            overflow: 'auto',
            fontFamily: "Manrope,'Segoe UI',Arial,sans-serif",
            color: '#1C2620',
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="helpTitle"
            style={{
              background: '#fff',
              borderRadius: 'var(--r)',
              width: 'min(720px,100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              padding: '26px 28px 24px',
              boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              outline: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#EEF5F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <HeadsetIcon size={28} color="#1F5F4A" strokeWidth={1.8} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2
                    id="helpTitle"
                    style={{
                      fontFamily: 'Lora,Georgia,serif',
                      fontSize: '24px',
                      fontWeight: '600',
                      margin: '0',
                      lineHeight: '1.2',
                    }}
                  >
                    Свяжитесь со мной
                  </h2>
                  <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                    Ответим на русском в течение 2 часов (9:00–20:00)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Закрыть"
                style={{
                  width: '48px',
                  height: '48px',
                  border: '2px solid #CFC9BB',
                  background: '#fff',
                  borderRadius: 'var(--r)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {status === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                    gap: '14px',
                  }}
                >
                  <label style={fieldLabel}>
                    <span style={labelText(16)}>Имя</span>
                    <input type="text" placeholder="Например: Михаил" autoComplete="name" style={textInput} />
                  </label>
                  <label style={fieldLabel}>
                    <span style={labelText(16)}>E-mail</span>
                    <input type="email" placeholder="name@gmail.com" autoComplete="email" style={textInput} />
                  </label>
                </div>
                <label style={fieldLabel}>
                  <span style={labelText(16)}>Телефон</span>
                  <span style={{ display: 'flex', gap: '8px' }}>
                    <PhoneCodeSelect
                      style={{
                        minHeight: '48px',
                        border: '2px solid #CFC9BB',
                        borderRadius: 'var(--r)',
                        padding: '0 12px',
                        font: '700 17px Manrope,sans-serif',
                        background: '#fff',
                        flex: 'none',
                        width: '170px',
                      }}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="50 123 4567"
                      autoComplete="tel-national"
                      style={textInput}
                    />
                  </span>
                </label>
                <label style={fieldLabel}>
                  <span style={labelText(16)}>Ваш вопрос</span>
                  <textarea
                    rows={3}
                    placeholder="Например: какой санаторий лучше для суставов? Можно ли приехать с внуком?"
                    style={{
                      minHeight: '100px',
                      border: '2px solid #CFC9BB',
                      borderRadius: 'var(--r)',
                      padding: '12px 16px',
                      font: '500 17px Manrope,sans-serif',
                      width: '100%',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#F7F5F0',
                    border: '1px solid #E3DED2',
                    borderRadius: 'var(--r)',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong style={{ fontSize: '16px' }}>Если уже знаете — так мы поможем быстрее</strong>
                    <span style={{ fontSize: '14px', color: '#5E6862' }}>не обязательно</span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))',
                      gap: '12px',
                    }}
                  >
                    <label style={fieldLabel}>
                      <span style={labelText(15)}>Заезд, примерно</span>
                      <input type="date" defaultValue={helpIn} key={helpIn} style={smallField} />
                    </label>
                    <label style={fieldLabel}>
                      <span style={labelText(15)}>Выезд, примерно</span>
                      <input type="date" defaultValue={helpOut} key={helpOut} style={smallField} />
                    </label>
                    <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
                      <span style={labelText(15)}>Куда хотите поехать</span>
                      <select defaultValue={selected} key={selected} style={{ ...smallField, boxSizing: undefined }}>
                        {dests.map(([value, text]) => (
                          <option key={value} value={value}>
                            {text}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {prefilled && (
                    <span
                      style={{ fontSize: '14px', color: '#1F5F4A', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckIcon size={16} color="#1F5F4A" strokeWidth={2.5} />
                      Заполнили по вашему поиску — можно изменить
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#5E6862', maxWidth: '340px' }}>
                    Нужно указать имя и телефон или e-mail. Данные используем только для ответа.
                  </span>
                  <button
                    type="button"
                    onClick={send}
                    style={{
                      minHeight: '50px',
                      padding: '0 24px',
                      border: 'none',
                      borderRadius: 'var(--r)',
                      background: '#1F5F4A',
                      color: '#fff',
                      font: '700 18px Manrope,sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    Отправить
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                    borderTop: '1px solid #E3DED2',
                    paddingTop: '14px',
                    fontSize: '16px',
                  }}
                >
                  <span style={{ color: '#3E4B44' }}>Или сразу:</span>
                  <a href={WHATSAPP_URL} style={{ fontWeight: '700', color: '#1F5F4A' }}>
                    WhatsApp
                  </a>
                  <a href={PHONE_TEL} style={{ fontWeight: '700', color: '#1F5F4A', whiteSpace: 'nowrap' }}>
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            )}

            {status === 'sent' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '6px 0 4px',
                }}
              >
                <span
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#1F5F4A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckIcon size={34} color="#fff" strokeWidth={2.6} />
                </span>
                <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '23px', fontWeight: '600' }}>
                  Спасибо! Мы скоро свяжемся с вами
                </strong>
                <span style={{ fontSize: '17px', color: '#3E4B44' }}>
                  Консультант ответит в течение 2 часов в рабочее время. Ваш поиск и выбор на этой странице сохранены.
                </span>
                <button
                  type="button"
                  onClick={close}
                  style={{
                    minHeight: '48px',
                    padding: '0 22px',
                    border: '2px solid #1F5F4A',
                    borderRadius: 'var(--r)',
                    background: '#fff',
                    color: '#1F5F4A',
                    font: '700 18px Manrope,sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Вернуться
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
