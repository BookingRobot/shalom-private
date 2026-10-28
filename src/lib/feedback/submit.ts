/**
 * Where a "Ваши пожелания" note goes.
 *
 * 1. The intake (feedback-worker/, runs on coding.ateisiu.lt — see its README; another
 *    address can be set with VITE_FEEDBACK_URL): the note and the pictures are POSTed there;
 *    it keeps the pictures in the repository branch `feedback-files` and opens a GitHub
 *    issue labelled «atsiliepimas» + «laukia-peržiūros» — nobody works on it before review.
 * 2. Intake not reachable (or VITE_FEEDBACK_URL set to "github"): the GitHub "new issue" page
 *    opens with everything filled in and the screenshot is copied to the clipboard — paste it
 *    (Ctrl+V) and press Submit. Works for everyone with access to the repository (the team).
 */
export type FeedbackType = 'bug' | 'change' | 'idea' | 'question';
export type FeedbackSeverity = 'blocking' | 'annoying' | 'later';

export interface FeedbackNote {
  type: FeedbackType;
  severity: FeedbackSeverity;
  /** one line, up to 120 characters */
  title: string;
  /** a bug: what the guest did / expected / saw */
  whatDoing: string;
  expected: string;
  actual: string;
  /** the other types */
  description: string;
  name: string;
  contact: string;
  page: string;
  pageTitle: string;
  element: string;
  viewport: string;
  browser: string;
  when: string;
  /** the screenshot with the marked spot */
  screenshot: Blob | null;
  /** more screenshots and pictures (images only) */
  images: Blob[];
}

export const REPO = 'BookingRobot-M/br-shalom';
export const LABELS = ['atsiliepimas', 'laukia-peržiūros'];
const SET = (import.meta.env.VITE_FEEDBACK_URL as string | undefined) || '';
const ENDPOINT = SET === 'github' ? '' : SET || 'https://coding.ateisiu.lt/br-shalom-feedback';

export const TYPE_RU: Record<FeedbackType, string> = {
  bug: 'Ошибка',
  change: 'Изменение',
  idea: 'Идея',
  question: 'Вопрос',
};
const TYPE_LT: Record<FeedbackType, string> = {
  bug: 'Klaida',
  change: 'Pakeitimas',
  idea: 'Nauja idėja',
  question: 'Klausimas',
};
export const SEVERITY_RU: Record<FeedbackSeverity, string> = {
  blocking: 'Мешает',
  annoying: 'Неудобно',
  later: 'На будущее',
};
const SEVERITY_LT: Record<FeedbackSeverity, string> = {
  blocking: 'Trukdo naudotis',
  annoying: 'Nepatogu',
  later: 'Idėja ateičiai',
};

export const hasEndpoint = () => !!ENDPOINT;

export function issueTitle(n: FeedbackNote) {
  const first = n.title.replace(/\s+/g, ' ').trim().slice(0, 120);
  return `[${TYPE_RU[n.type]}] ${first}`;
}

/** Plain text of the note (older intakes read `text`). */
export function noteText(n: FeedbackNote) {
  return (
    n.type === 'bug'
      ? [n.title, n.whatDoing && 'Делал: ' + n.whatDoing, 'Ожидал: ' + n.expected, 'Произошло: ' + n.actual]
      : [n.title, n.description]
  )
    .filter(Boolean)
    .join('\n\n');
}

const section = (title: string, text: string) => (text.trim() ? ['', `### ${title}`, '', text.trim()] : []);

/** Issue text: the team reads Lithuanian, the guest's own words stay as written. */
export function issueBody(n: FeedbackNote, shots = { screenshot: '', images: '' }) {
  const extra = n.images.length;
  return [
    '> ⏸ **Nevykdyti** — laukia peržiūros. Pradėti darbą tik nuėmus žymą `laukia-peržiūros`.',
    '',
    `**Tipas:** ${TYPE_LT[n.type]} · **Svarba:** ${SEVERITY_LT[n.severity]}`,
    `**Kas rašo:** ${n.name || '—'}${n.contact ? ' · ' + n.contact : ''}`,
    `**Puslapis:** ${n.pageTitle} — ${n.page}`,
    `**Pažymėta vieta:** ${n.element || 'visas ekranas'}`,
    `**Ekranas / naršyklė:** ${n.viewport} · ${n.browser}`,
    `**Kada:** ${n.when}`,
    ...section('Trumpai', n.title),
    ...(n.type === 'bug'
      ? [...section('Ką darė', n.whatDoing), ...section('Ko tikėjosi', n.expected), ...section('Kas įvyko', n.actual)]
      : section('Aprašymas', n.description)),
    '',
    '### Ekrano nuotraukos',
    '',
    shots.screenshot ||
      (n.screenshot
        ? '_(įklijuokite nuotrauką čia — ji nukopijuota į iškarpinę)_'
        : '_be pažymėtos vietos nuotraukos_'),
    ...(extra ? ['', shots.images || `_(dar paveikslėlių: ${extra} — pridėkite juos ranka)_`] : []),
  ].join('\n');
}

/** Prefilled "new issue" page (no endpoint yet). Open it right in the click — popup blockers. */
export function githubIssueUrl(n: FeedbackNote) {
  return (
    `https://github.com/${REPO}/issues/new?` +
    new URLSearchParams({ title: issueTitle(n), body: issueBody(n), labels: LABELS.join(',') }).toString()
  );
}

const ext = (b: Blob) => (b.type === 'image/png' ? 'png' : b.type === 'image/jpeg' ? 'jpg' : 'webp');

/** The intake refused the note: a wrong code, or too many wrong codes (try again in an hour). */
export class FeedbackRefused extends Error {
  constructor(public reason: 'pin' | 'locked') {
    super(reason);
  }
}

/** Sends the note to the endpoint; returns the issue number and link. */
export async function sendFeedback(n: FeedbackNote, pin = ''): Promise<{ number?: number; url?: string }> {
  const form = new FormData();
  // the code goes on its own: it is checked on the server and never stored with the note
  form.append('pin', pin);
  const { screenshot, images, ...rest } = n;
  // the intake puts the picture links in place of the markers
  form.append(
    'note',
    JSON.stringify({
      ...rest,
      text: noteText(n),
      title: issueTitle(n),
      body: issueBody(n, { screenshot: '{{SCREENSHOT}}', images: images.length ? '{{IMAGES}}' : '' }),
    }),
  );
  if (screenshot) form.append('screenshot', screenshot, 'shot.' + ext(screenshot));
  images.forEach((b, i) => form.append('images', b, `image-${i + 1}.${ext(b)}`));
  const res = await fetch(ENDPOINT, { method: 'POST', body: form, signal: AbortSignal.timeout(45000) });
  if (res.status === 401) throw new FeedbackRefused('pin');
  if (res.status === 429) throw new FeedbackRefused('locked');
  if (!res.ok) throw new Error('feedback ' + res.status);
  return res.json();
}

function toPng(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return Promise.resolve(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')?.drawImage(img, 0, 0);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png');
    };
    img.onerror = () => reject(new Error('img'));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Puts the screenshot on the clipboard as PNG. Called synchronously inside the click: the
 * PNG is handed over as a promise, so the browser keeps the permission of the click.
 */
export async function copyScreenshot(blob: Blob): Promise<boolean> {
  try {
    if (!('ClipboardItem' in window) || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': toPng(blob) })]);
    return true;
  } catch {
    return false;
  }
}
