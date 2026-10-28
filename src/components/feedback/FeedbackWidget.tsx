import { useEffect, useRef, useState } from 'react';
import { captureScreenshot } from '../../lib/feedback/screenshot';
import {
  TYPE_RU,
  copyScreenshot,
  githubIssueUrl,
  hasEndpoint,
  sendFeedback,
  type FeedbackNote,
  type FeedbackType,
} from '../../lib/feedback/submit';
import './FeedbackWidget.css';

/**
 * «Ваши пожелания» — a red button above «Свяжитесь со мной» (like On Time's
 * "Pastaba šiam langui"): point at a spot on the page, a screenshot is taken with the
 * spot framed, write what to change — the note becomes a GitHub issue that waits for review.
 */
type Stage = 'idle' | 'marking' | 'capturing' | 'form' | 'sending' | 'done' | 'github';

const NAME_KEY = 'br-shalom:feedback-name';
const TYPES: [FeedbackType, string, string][] = [
  [
    'idea',
    TYPE_RU.idea,
    'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  ],
  [
    'bug',
    TYPE_RU.bug,
    'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  ],
  ['other', TYPE_RU.other, 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
];
const PLACEHOLDER: Record<FeedbackType, string> = {
  idea: 'Что добавить или сделать иначе? Например: «Хочу видеть цену сразу за двоих».',
  bug: 'Что не так? Что вы нажали и что увидели вместо ожидаемого?',
  other: 'Напишите, что хотите сообщить.',
};

const readName = () => {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
};

/** A meaningful element under the pointer: a control, a card, or a block of a sensible size. */
function meaningful(el: Element | null): Element | null {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.closest('[data-feedback-ignore]')) return null;
    if (
      cur.matches(
        'button, a, input, select, textarea, label, [role=dialog], article, section, aside, nav, .card, h1, h2, h3, img',
      )
    )
      return cur;
    const r = cur.getBoundingClientRect();
    if (r.width >= 60 && r.height >= 28 && r.width < window.innerWidth * 0.98) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function describe(el: Element | null): string {
  if (!el) return '';
  const text = (
    el.getAttribute('aria-label') ||
    (el as HTMLElement).innerText ||
    el.textContent ||
    (el as HTMLImageElement).alt ||
    ''
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  const tag = el.tagName.toLowerCase();
  const kind =
    tag === 'button'
      ? 'mygtukas'
      : tag === 'a'
        ? 'nuoroda'
        : tag === 'img'
          ? 'paveikslėlis'
          : /^h\d$/.test(tag)
            ? 'antraštė'
            : tag === 'input' || tag === 'textarea' || tag === 'select'
              ? 'laukas'
              : 'blokas';
  return `${kind} „${text || tag}“`;
}

function browserName() {
  const ua = navigator.userAgent;
  const b = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Safari\//.test(ua)
        ? 'Safari'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : 'kita';
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : 'kita';
  return b + ' · ' + os;
}

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function FeedbackWidget({ bottom = '20px' }: { bottom?: string }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [type, setType] = useState<FeedbackType>('idea');
  const [text, setText] = useState('');
  const [name, setName] = useState(readName);
  const [contact, setContact] = useState('');
  const [shot, setShot] = useState<Blob | null>(null);
  const [shotUrl, setShotUrl] = useState('');
  const [noShot, setNoShot] = useState(false);
  const [element, setElement] = useState('');
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [result, setResult] = useState<{ number?: number; url?: string; copied?: boolean }>({});
  const [error, setError] = useState('');
  const hoverEl = useRef<Element | null>(null);

  // screenshot preview URL
  useEffect(() => {
    if (!shot) return setShotUrl('');
    const u = URL.createObjectURL(shot);
    setShotUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [shot]);

  const pick = async (el: Element | null) => {
    setHover(null);
    setElement(describe(el));
    setStage('capturing');
    // the marking layer leaves the page before the picture is taken
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const blob = await captureScreenshot(el);
    setShot(blob);
    setNoShot(false);
    setStage('form');
  };

  // marking mode: the spot under the pointer is outlined, a click picks it
  useEffect(() => {
    if (stage !== 'marking') return;
    const move = (e: PointerEvent) => {
      const el = meaningful(document.elementFromPoint(e.clientX, e.clientY));
      hoverEl.current = el;
      setHover(el ? el.getBoundingClientRect() : null);
    };
    const click = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('[data-feedback-ignore]')) return;
      e.preventDefault();
      e.stopPropagation();
      const el = meaningful(document.elementFromPoint(e.clientX, e.clientY)) || hoverEl.current;
      pick(el);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setStage('idle');
    window.addEventListener('pointermove', move, true);
    window.addEventListener('click', click, true);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('click', click, true);
      window.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== 'form' && stage !== 'done' && stage !== 'github') return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const start = () => {
    setError('');
    setResult({});
    setStage('marking');
  };
  const close = () => {
    setStage('idle');
    setShot(null);
    setElement('');
    setError('');
  };
  const reset = () => {
    close();
    setText('');
    setContact('');
    setType('idea');
  };

  const note = (): FeedbackNote => ({
    type,
    text,
    name: name.trim(),
    contact: contact.trim(),
    page: window.location.href,
    pageTitle: document.title,
    element,
    viewport: window.innerWidth + '×' + window.innerHeight,
    browser: browserName(),
    when: new Date().toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius' }),
    screenshot: noShot ? null : shot,
  });

  const send = async () => {
    if (!text.trim()) return setError('Напишите хотя бы пару слов.');
    if (!name.trim()) return setError('Как вас зовут? Так мы поймём, кому ответить.');
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* ignore */
    }
    const n = note();
    if (!hasEndpoint()) {
      // inside the click: the browser lets us open GitHub and copy the picture
      window.open(githubIssueUrl(n), '_blank', 'noopener');
      const copied = n.screenshot ? await copyScreenshot(n.screenshot) : false;
      setResult({ url: githubIssueUrl(n), copied });
      setStage('github');
      return;
    }
    setStage('sending');
    try {
      const r = await sendFeedback(n);
      setResult(r);
      setStage('done');
    } catch {
      setError('Не получилось отправить. Проверьте интернет и попробуйте ещё раз.');
      setStage('form');
    }
  };

  return (
    <div data-feedback-ignore>
      {stage === 'idle' ? (
        <button type="button" className="fb-btn" style={{ bottom: `calc(${bottom} + 60px)` }} onClick={start}>
          <span className="fb-btn-ico">
            <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h5" size={18} />
          </span>
          Ваши пожелания
        </button>
      ) : null}

      {stage === 'marking' ? (
        <>
          <div className="fb-mark-bar" role="status">
            <span className="fb-mark-dot" aria-hidden="true" />
            <span className="fb-mark-t">
              <strong>Покажите место на странице</strong>
              <span className="fb-desk">
                Наведите курсор и нажмите — сделаем снимок экрана с этим местом. Esc — отмена.
              </span>
              <span className="fb-touch">Нажмите на место, о котором хотите написать.</span>
            </span>
            <button type="button" className="fb-ghost" onClick={() => pick(null)}>
              Весь экран
            </button>
            <button type="button" className="fb-ghost" onClick={() => setStage('idle')}>
              Отмена
            </button>
          </div>
          {hover ? (
            <div
              className="fb-hover"
              style={{ left: hover.left - 4, top: hover.top - 4, width: hover.width + 8, height: hover.height + 8 }}
            />
          ) : null}
        </>
      ) : null}

      {stage === 'capturing' ? (
        <div className="fb-toast" role="status">
          Делаем снимок экрана…
        </div>
      ) : null}

      {stage === 'form' || stage === 'sending' || stage === 'done' || stage === 'github' ? (
        <div className="fb-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fbTitle">
            <div className="fb-head">
              <div>
                <h2 id="fbTitle">Ваши пожелания</h2>
                <span>Предложение, ошибка или вопрос — команда сайта прочитает каждое сообщение.</span>
              </div>
              <button type="button" className="fb-x" onClick={close} aria-label="Закрыть">
                <Icon d="M6 6l12 12M18 6L6 18" />
              </button>
            </div>

            {stage === 'done' ? (
              <div className="fb-done ios-in">
                <span className="fb-done-ico">
                  <Icon d="m5 12 5 5L20 7" size={30} />
                </span>
                <strong>Спасибо! Записали{result.number ? ' под номером #' + result.number : ''}.</strong>
                <span>Посмотрим и решим, что сделать. Ничего не меняем, пока не проверим.</span>
                <button type="button" className="btn btn-primary" onClick={reset}>
                  Готово
                </button>
              </div>
            ) : stage === 'github' ? (
              <div className="fb-done ios-in">
                <span className="fb-done-ico">
                  <Icon d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" size={28} />
                </span>
                <strong>Осталось нажать «Submit new issue» на GitHub</strong>
                <ol className="fb-steps">
                  <li>В новой вкладке открылась задача — текст уже заполнен.</li>
                  {result.copied ? (
                    <li>Снимок экрана скопирован — вставьте его в описание: Ctrl+V (на Mac — ⌘V).</li>
                  ) : shotUrl ? (
                    <li>
                      Скачайте снимок и перетащите его в описание:{' '}
                      <a href={shotUrl} download="snimok.webp">
                        скачать снимок
                      </a>
                      .
                    </li>
                  ) : null}
                  <li>
                    Нажмите «Submit new issue». Задача получит метку «laukia-peržiūros» — её не возьмут в работу без
                    проверки.
                  </li>
                </ol>
                <div className="fb-row">
                  <a className="btn btn-secondary" href={result.url} target="_blank" rel="noreferrer">
                    Открыть ещё раз
                  </a>
                  <button type="button" className="btn btn-primary" onClick={reset}>
                    Готово
                  </button>
                </div>
              </div>
            ) : (
              <div className="fb-body">
                <div className="fb-seg" role="radiogroup" aria-label="Что вы хотите сообщить">
                  {TYPES.map(([k, t, d]) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={type === k}
                      className={type === k ? 'on' : ''}
                      onClick={() => setType(k)}
                    >
                      <Icon d={d} size={18} />
                      {t}
                    </button>
                  ))}
                </div>
                <label className="fb-field">
                  <span>Что вы хотите сообщить?</span>
                  <textarea
                    rows={4}
                    value={text}
                    placeholder={PLACEHOLDER[type]}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                  />
                </label>
                <div className="fb-shot">
                  {shotUrl && !noShot ? (
                    <img src={shotUrl} alt="Снимок экрана с отмеченным местом" />
                  ) : (
                    <div className="fb-shot-none">
                      {noShot ? 'Снимок не отправим.' : 'Снимок не получился — можно отправить без него.'}
                    </div>
                  )}
                  <div className="fb-shot-side">
                    <strong>Снимок экрана</strong>
                    <span>{element ? 'Отмечено: ' + element : 'Весь экран'}</span>
                    <button type="button" className="fb-link" onClick={start}>
                      Отметить другое место
                    </button>
                    {shot ? (
                      <button type="button" className="fb-link" onClick={() => setNoShot(!noShot)}>
                        {noShot ? 'Вернуть снимок' : 'Отправить без снимка'}
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="fb-two">
                  <label className="fb-field">
                    <span>Ваше имя</span>
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </label>
                  <label className="fb-field">
                    <span>Как с вами связаться (по желанию)</span>
                    <input
                      className="input"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="WhatsApp или e-mail"
                    />
                  </label>
                </div>
                {error ? (
                  <div className="fb-error" role="alert">
                    {error}
                  </div>
                ) : null}
                <div className="fb-foot">
                  <span>Сообщение попадёт в список задач команды. Ничего не меняем, пока не проверим.</span>
                  <button
                    type="button"
                    className="btn btn-primary fb-send"
                    onClick={send}
                    disabled={stage === 'sending'}
                  >
                    {stage === 'sending' ? 'Отправляем…' : 'Отправить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
