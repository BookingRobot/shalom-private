import { useEffect, useRef, useState } from 'react';
import { captureScreenshot } from '../../lib/feedback/screenshot';
import {
  FeedbackRefused,
  SEVERITY_RU,
  TYPE_RU,
  copyScreenshot,
  githubIssueUrl,
  hasEndpoint,
  sendFeedback,
  type FeedbackNote,
  type FeedbackSeverity,
  type FeedbackType,
} from '../../lib/feedback/submit';
import { IMAGE_TYPES, MAX_PICTURES, MAX_TOTAL, prepareImage } from '../../lib/feedback/images';
import './FeedbackWidget.css';

/**
 * «Ваши пожелания» — a red button above «Свяжитесь со мной» (like On Time's
 * "Pastaba šiam langui"): point at a spot on the page, a screenshot is taken with the
 * spot framed, write what to change — the note becomes a GitHub issue that waits for review.
 */
type Stage = 'idle' | 'marking' | 'capturing' | 'form' | 'sending' | 'done' | 'github';

const NAME_KEY = 'br-shalom:feedback-name';
const PIN_KEY = 'br-shalom:feedback-code';
const TYPES: [FeedbackType, string][] = [
  ['bug', 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'],
  ['change', 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  ['idea', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z'],
  ['question', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01'],
];
const SEVERITIES: FeedbackSeverity[] = ['blocking', 'annoying', 'later'];
const DESCRIBE: Record<Exclude<FeedbackType, 'bug'>, [string, string]> = {
  change: ['Что изменить?', 'Как сейчас и как было бы лучше. Например: «Цену хочу видеть сразу за двоих».'],
  idea: ['Опишите идею', 'Что добавить на сайт и зачем это гостям.'],
  question: ['Ваш вопрос', 'Что непонятно на этой странице?'],
};

interface Pic {
  id: number;
  blob: Blob;
  url: string;
  /** the screenshot with the marked spot */
  main: boolean;
  label: string;
}
let picId = 0;
// phones: no keyboard popping up as soon as the form opens
const coarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
const pic = (blob: Blob, main: boolean, label: string): Pic => ({
  id: ++picId,
  blob,
  url: URL.createObjectURL(blob),
  main,
  label,
});

const read = (key: string) => {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};
const readName = () => read(NAME_KEY);
const keep = (key: string, value: string) => {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
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

/** The marked spot in words: Russian for the guest, Lithuanian for the team's issue. */
function describe(el: Element | null): { ru: string; lt: string } {
  if (!el) return { ru: '', lt: '' };
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
  const [lt, ru] =
    tag === 'button'
      ? ['mygtukas', 'кнопка']
      : tag === 'a'
        ? ['nuoroda', 'ссылка']
        : tag === 'img'
          ? ['paveikslėlis', 'картинка']
          : /^h\d$/.test(tag)
            ? ['antraštė', 'заголовок']
            : tag === 'input' || tag === 'textarea' || tag === 'select'
              ? ['laukas', 'поле']
              : ['blokas', 'блок'];
  return { lt: `${lt} „${text || tag}“`, ru: `${ru} «${text || tag}»` };
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
  const [type, setType] = useState<FeedbackType>('change');
  const [severity, setSeverity] = useState<FeedbackSeverity>('annoying');
  const [title, setTitle] = useState('');
  const [whatDoing, setWhatDoing] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState(readName);
  const [contact, setContact] = useState('');
  // the team's code (checked on the server); remembered on this device only if asked
  const [pin, setPin] = useState(() => read(PIN_KEY));
  const [rememberPin, setRememberPin] = useState(true);
  const [pics, setPics] = useState<Pic[]>([]);
  // what the next marking is for: the main screenshot or one more
  const [adding, setAdding] = useState(false);
  const [element, setElement] = useState({ ru: '', lt: '' });
  const [shotFailed, setShotFailed] = useState(false);
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [result, setResult] = useState<{ number?: number; url?: string; copied?: boolean }>({});
  const [error, setError] = useState('');
  const [picError, setPicError] = useState('');
  const [bad, setBad] = useState<Record<string, boolean>>({});
  // the intake did not answer: the team can still file the note on GitHub by hand
  const [failed, setFailed] = useState(false);
  const hoverEl = useRef<Element | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const picsRef = useRef<Pic[]>([]);
  picsRef.current = pics;

  // free the preview URLs when the widget goes away
  useEffect(() => () => picsRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const dropPics = (keep: (p: Pic) => boolean) =>
    setPics((list) => {
      list.filter((p) => !keep(p)).forEach((p) => URL.revokeObjectURL(p.url));
      return list.filter(keep);
    });

  const pickSpot = async (el: Element | null) => {
    setHover(null);
    const label = describe(el);
    setStage('capturing');
    // the marking layer leaves the page before the picture is taken
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const blob = await captureScreenshot(el);
    if (adding) {
      if (blob) setPics((list) => [...list, pic(blob, false, 'Снимок: ' + (label.ru || 'весь экран'))]);
      else setPicError('Снимок не получился. Можно добавить картинку с компьютера.');
    } else {
      setElement(label);
      setShotFailed(!blob);
      setPics((list) => {
        list.filter((p) => p.main).forEach((p) => URL.revokeObjectURL(p.url));
        const rest = list.filter((p) => !p.main);
        return blob ? [pic(blob, true, label.ru ? 'Отмечено: ' + label.ru : 'Весь экран'), ...rest] : rest;
      });
    }
    setAdding(false);
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
      pickSpot(el);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && cancelMarking();
    window.addEventListener('pointermove', move, true);
    window.addEventListener('click', click, true);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('click', click, true);
      window.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, adding]);

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
    setAdding(false);
    setStage('marking');
  };
  const markAgain = () => {
    setAdding(false);
    setStage('marking');
  };
  const markMore = () => {
    setPicError('');
    if (pics.length >= MAX_PICTURES) return setPicError(`Не больше ${MAX_PICTURES} картинок.`);
    setAdding(true);
    setStage('marking');
  };
  // Esc / «Отмена» while marking: back to the form if it is already open
  const cancelMarking = () => setStage(adding || pics.length || title ? 'form' : 'idle');
  const close = () => {
    setStage('idle');
    setError('');
    setFailed(false);
  };
  const reset = () => {
    close();
    dropPics(() => false);
    setElement({ ru: '', lt: '' });
    setShotFailed(false);
    setTitle('');
    setWhatDoing('');
    setExpected('');
    setActual('');
    setDescription('');
    setContact('');
    setType('change');
    setSeverity('annoying');
    setBad({});
    setPicError('');
  };

  /** pictures from a file, a paste or a drop — images only */
  const addFiles = async (files: Blob[]) => {
    setPicError('');
    let list = picsRef.current;
    for (const f of files) {
      if (list.length >= MAX_PICTURES) {
        setPicError(`Не больше ${MAX_PICTURES} картинок.`);
        break;
      }
      if (!IMAGE_TYPES.includes(f.type)) {
        setPicError('Можно добавлять только картинки: PNG, JPG, WebP или GIF.');
        continue;
      }
      const ready = await prepareImage(f);
      if (!ready) {
        setPicError('Эту картинку не получилось открыть. Попробуйте другую.');
        continue;
      }
      const total = list.reduce((n, p) => n + p.blob.size, 0) + ready.size;
      if (total > MAX_TOTAL) {
        setPicError('Картинок слишком много по объёму — уберите одну.');
        break;
      }
      const name = (f as File).name;
      list = [...list, pic(ready, false, name && !/^image\.\w+$/.test(name) ? name : 'Картинка')];
      setPics(list);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.items)
      .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
      .map((i) => i.getAsFile())
      .filter((f): f is File => !!f);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const main = pics.find((p) => p.main) || null;
  const note = (): FeedbackNote => ({
    type,
    severity,
    title: title.trim(),
    whatDoing: type === 'bug' ? whatDoing.trim() : '',
    expected: type === 'bug' ? expected.trim() : '',
    actual: type === 'bug' ? actual.trim() : '',
    description: type === 'bug' ? '' : description.trim(),
    name: name.trim(),
    contact: contact.trim(),
    page: window.location.href,
    pageTitle: document.title,
    element: element.lt,
    viewport: window.innerWidth + '×' + window.innerHeight,
    browser: browserName(),
    when: new Date().toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius' }),
    screenshot: main ? main.blob : null,
    images: pics.filter((p) => !p.main).map((p) => p.blob),
  });

  const checked = () => {
    const miss: Record<string, boolean> = {
      title: !title.trim(),
      expected: type === 'bug' && !expected.trim(),
      actual: type === 'bug' && !actual.trim(),
      description: type !== 'bug' && !description.trim(),
      name: !name.trim(),
      pin: hasEndpoint() && !pin.trim(),
    };
    setBad(miss);
    const first = Object.keys(miss).find((k) => miss[k]);
    if (first) {
      setError(
        first === 'name'
          ? 'Как вас зовут? Так мы поймём, кому ответить.'
          : first === 'pin'
            ? 'Введите код доступа — без него сообщение не отправится.'
            : first === 'title'
              ? 'Напишите коротко, о чём сообщение.'
              : 'Заполните отмеченные поля.',
      );
      document.querySelector<HTMLElement>(`.fb-panel [data-f="${first}"]`)?.focus();
      return false;
    }
    keep(NAME_KEY, name.trim());
    return true;
  };

  // inside the click: the browser lets us open GitHub and copy the picture
  const viaGithub = async () => {
    if (!checked()) return;
    const n = note();
    window.open(githubIssueUrl(n), '_blank', 'noopener');
    const copied = n.screenshot ? await copyScreenshot(n.screenshot) : false;
    setResult({ url: githubIssueUrl(n), copied });
    setError('');
    setStage('github');
  };

  const send = async () => {
    if (!hasEndpoint()) return viaGithub();
    if (!checked()) return;
    setError('');
    setStage('sending');
    try {
      const r = await sendFeedback(note(), pin.trim());
      keep(PIN_KEY, rememberPin ? pin.trim() : '');
      setResult(r);
      setFailed(false);
      setStage('done');
    } catch (e) {
      setStage('form');
      if (e instanceof FeedbackRefused) {
        setFailed(false);
        if (e.reason === 'pin') {
          keep(PIN_KEY, '');
          setBad({ pin: true });
          setError('Неверный код доступа. Проверьте и попробуйте ещё раз.');
          document.querySelector<HTMLElement>('.fb-panel [data-f="pin"]')?.focus();
        } else setError('Слишком много неверных попыток. Попробуйте снова через час.');
        return;
      }
      setError('Не получилось отправить. Проверьте интернет и попробуйте ещё раз.');
      setFailed(true);
    }
  };

  const fixed = (key: string) => {
    const next = { ...bad, [key]: false };
    setBad(next);
    if (!Object.values(next).some(Boolean)) setError('');
  };

  const field = (
    key: string,
    label: string,
    value: string,
    set: (v: string) => void,
    opts: { rows?: number; optional?: boolean; placeholder?: string } = {},
  ) => (
    <label className={'fb-field' + (bad[key] ? ' bad' : '')}>
      <span>
        {label}
        {opts.optional ? <em> (по желанию)</em> : null}
      </span>
      <textarea
        data-f={key}
        rows={opts.rows || 2}
        value={value}
        maxLength={5000}
        placeholder={opts.placeholder}
        onChange={(e) => {
          set(e.target.value);
          if (bad[key]) fixed(key);
        }}
      />
    </label>
  );

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
              <strong>{adding ? 'Ещё один снимок: покажите место' : 'Покажите место на странице'}</strong>
              <span className="fb-desk">
                Наведите курсор и нажмите — сделаем снимок экрана с этим местом. Esc — отмена.
              </span>
              <span className="fb-touch">Нажмите на место, о котором хотите написать.</span>
            </span>
            <button type="button" className="fb-ghost" onClick={() => pickSpot(null)}>
              Весь экран
            </button>
            <button type="button" className="fb-ghost" onClick={cancelMarking}>
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
          <div className="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fbTitle" onPaste={onPaste}>
            <div className="fb-head">
              <div>
                <h2 id="fbTitle">Ваши пожелания</h2>
                <span>Ошибка, изменение, идея или вопрос — команда сайта прочитает каждое сообщение.</span>
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
                  ) : null}
                  {pics.some((p) => !(result.copied && p.main)) ? (
                    <li>
                      Скачайте {result.copied ? 'остальные картинки' : 'картинки'} и перетащите их в описание:{' '}
                      {pics
                        .filter((p) => !(result.copied && p.main))
                        .map((p, i) => (
                          <a key={p.id} href={p.url} download={`snimok-${i + 1}.webp`}>
                            {'снимок ' + (i + 1)}
                          </a>
                        ))
                        .reduce<React.ReactNode[]>((acc, a, i) => (i ? [...acc, ', ', a] : [a]), [])}
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
              <>
                <div className="fb-body">
                  <ul className="fb-ctx" aria-label="Отправим автоматически">
                    <li>
                      <span>Страница</span>
                      <strong>{document.title}</strong>
                    </li>
                    <li>
                      <span>Отмечено</span>
                      <strong>{element.ru || 'весь экран'}</strong>
                      <button type="button" className="fb-link" onClick={markAgain}>
                        Отметить другое место
                      </button>
                    </li>
                  </ul>

                  <div className="fb-q">
                    <span className="fb-q-l" id="fbType">
                      Что это?
                    </span>
                    <div className="fb-seg fb-seg-4" role="radiogroup" aria-labelledby="fbType">
                      {TYPES.map(([k, d]) => (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={type === k}
                          className={type === k ? 'on' : ''}
                          onClick={() => setType(k)}
                        >
                          <Icon d={d} size={18} />
                          {TYPE_RU[k]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fb-q">
                    <span className="fb-q-l" id="fbSev">
                      Насколько важно?
                    </span>
                    <div className="fb-seg" role="radiogroup" aria-labelledby="fbSev">
                      {SEVERITIES.map((k) => (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={severity === k}
                          className={severity === k ? 'on' : ''}
                          onClick={() => setSeverity(k)}
                        >
                          <i className={'fb-dot fb-dot-' + k} aria-hidden="true" />
                          {SEVERITY_RU[k]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className={'fb-field' + (bad.title ? ' bad' : '')}>
                    <span>Коротко</span>
                    <input
                      className="input"
                      data-f="title"
                      value={title}
                      maxLength={120}
                      placeholder="Например: «Не вижу цену за двоих»"
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (bad.title) fixed('title');
                      }}
                      autoFocus={!coarse}
                    />
                    <small className="fb-count" aria-live="polite">
                      {title.length} из 120
                    </small>
                  </label>

                  {type === 'bug' ? (
                    <div className="fb-group ios-in" key="bug">
                      {field('whatDoing', 'Что вы делали?', whatDoing, setWhatDoing, {
                        optional: true,
                        placeholder: 'Например: выбрал даты и нажал «Найти санаторий».',
                      })}
                      {field('expected', 'Что ожидали?', expected, setExpected)}
                      {field('actual', 'Что произошло?', actual, setActual)}
                    </div>
                  ) : (
                    <div className="fb-group ios-in" key={type}>
                      {field('description', DESCRIBE[type][0], description, setDescription, {
                        rows: 3,
                        placeholder: DESCRIBE[type][1],
                      })}
                    </div>
                  )}

                  <section
                    className="fb-pics"
                    aria-label="Снимки экрана"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFiles(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <div className="fb-pics-h">
                      <strong>Снимки экрана</strong>
                      <span>
                        {pics.length} из {MAX_PICTURES}
                      </span>
                    </div>
                    {shotFailed && !main ? (
                      <p className="fb-hint">Снимок отмеченного места не получился — можно отправить без него.</p>
                    ) : null}
                    {pics.length ? null : (
                      <p className="fb-hint">Снимков пока нет — добавьте, если так будет понятнее.</p>
                    )}
                    <ul className="fb-grid">
                      {pics.map((p) => (
                        <li key={p.id} className={'fb-tile ios-in' + (p.main ? ' main' : '')}>
                          <a href={p.url} target="_blank" rel="noreferrer" className="fb-thumb">
                            <img src={p.url} alt={p.label} />
                          </a>
                          <span className="fb-cap" title={p.label}>
                            {p.label}
                          </span>
                          <button
                            type="button"
                            className="fb-rm"
                            aria-label={'Убрать: ' + p.label}
                            onClick={() => dropPics((x) => x.id !== p.id)}
                          >
                            <Icon d="M6 6l12 12M18 6L6 18" size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <input
                      ref={fileInput}
                      type="file"
                      accept={IMAGE_TYPES.join(',')}
                      multiple
                      hidden
                      onChange={(e) => {
                        addFiles(Array.from(e.target.files || []));
                        e.target.value = '';
                      }}
                    />
                    {pics.length < MAX_PICTURES ? (
                      <div className="fb-adds">
                        <button type="button" className="fb-add" onClick={markMore}>
                          <Icon d="M3 7h3l2-3h8l2 3h3v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={18} />
                          Ещё снимок экрана
                        </button>
                        <button type="button" className="fb-add" onClick={() => fileInput.current?.click()}>
                          <Icon d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01" size={18} />
                          {coarse ? 'Фото из галереи' : 'Картинка с компьютера'}
                        </button>
                      </div>
                    ) : null}
                    <p className="fb-hint">
                      {coarse
                        ? 'Только картинки (PNG, JPG, WebP, GIF).'
                        : 'Только картинки (PNG, JPG, WebP, GIF). Можно вставить из буфера — Ctrl+V — или перетащить сюда.'}
                    </p>
                    {picError ? (
                      <p className="fb-hint fb-hint-err" role="alert">
                        {picError}
                      </p>
                    ) : null}
                  </section>

                  <div className="fb-two">
                    <label className={'fb-field' + (bad.name ? ' bad' : '')}>
                      <span>Ваше имя</span>
                      <input
                        className="input"
                        data-f="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (bad.name) fixed('name');
                        }}
                        autoComplete="name"
                      />
                    </label>
                    <label className="fb-field">
                      <span>
                        Как с вами связаться<em> (по желанию)</em>
                      </span>
                      <input
                        className="input"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="WhatsApp или e-mail"
                      />
                    </label>
                  </div>

                  {hasEndpoint() ? (
                    <div className="fb-pin">
                      <label className={'fb-field' + (bad.pin ? ' bad' : '')}>
                        <span>Код доступа</span>
                        <input
                          className="input"
                          data-f="pin"
                          type="password"
                          value={pin}
                          autoComplete="off"
                          spellCheck={false}
                          maxLength={100}
                          onChange={(e) => {
                            setPin(e.target.value);
                            if (bad.pin) fixed('pin');
                          }}
                        />
                      </label>
                      <label className="fb-remember">
                        <input
                          type="checkbox"
                          checked={rememberPin}
                          onChange={(e) => setRememberPin(e.target.checked)}
                        />
                        Запомнить на этом устройстве
                      </label>
                      <p className="fb-hint">Код знает команда сайта. Его проверяет сервер, на сайте его нет.</p>
                    </div>
                  ) : null}

                  <details className="fb-what">
                    <summary>Что отправится?</summary>
                    <ul>
                      <li>Страница и её адрес, отмеченное место.</li>
                      <li>Снимки экрана и картинки, которые вы добавили.</li>
                      <li>Размер экрана и браузер — чтобы повторить ошибку.</li>
                      <li>Телефоны и e-mail на снимках закрываем точками.</li>
                    </ul>
                  </details>

                  {error ? (
                    <div className="fb-error" role="alert">
                      {error}
                    </div>
                  ) : null}
                  {failed ? (
                    <button type="button" className="fb-link" onClick={viaGithub}>
                      Для команды: создать задачу на GitHub вручную
                    </button>
                  ) : null}
                </div>
                <div className="fb-foot">
                  <button type="button" className="fb-link fb-clear" onClick={reset} disabled={stage === 'sending'}>
                    Очистить
                  </button>
                  <span className="fb-foot-r">
                    <button type="button" className="btn btn-secondary" onClick={close} disabled={stage === 'sending'}>
                      Отмена
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fb-send"
                      onClick={send}
                      disabled={stage === 'sending'}
                    >
                      {stage === 'sending' ? 'Отправляем…' : 'Отправить'}
                    </button>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
