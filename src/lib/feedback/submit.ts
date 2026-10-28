/**
 * Where a "Ваши пожелания" note goes.
 *
 * 1. VITE_FEEDBACK_URL set (the small worker in feedback-worker/, see its README):
 *    the note and the screenshot are POSTed there; the worker keeps the screenshot in the
 *    repository branch `feedback-files` and opens a GitHub issue labelled
 *    «atsiliepimas» + «laukia-peržiūros» — nobody works on it before it is reviewed.
 * 2. Not set yet: the GitHub "new issue" page opens with everything filled in and the
 *    screenshot is copied to the clipboard — paste it (Ctrl+V) and press Submit.
 *    Works for everyone with access to the repository (the team).
 */
export type FeedbackType = 'idea' | 'bug' | 'other';

export interface FeedbackNote {
  type: FeedbackType;
  text: string;
  name: string;
  contact: string;
  page: string;
  pageTitle: string;
  element: string;
  viewport: string;
  browser: string;
  when: string;
  screenshot: Blob | null;
}

export const REPO = 'BookingRobot-M/br-shalom';
export const LABELS = ['atsiliepimas', 'laukia-peržiūros'];
const ENDPOINT = (import.meta.env.VITE_FEEDBACK_URL as string | undefined) || '';

export const TYPE_RU: Record<FeedbackType, string> = { idea: 'Предложение', bug: 'Ошибка', other: 'Другое' };
const TYPE_LT: Record<FeedbackType, string> = { idea: 'Pasiūlymas', bug: 'Klaida', other: 'Kita' };

export const hasEndpoint = () => !!ENDPOINT;

export function issueTitle(n: FeedbackNote) {
  const first = n.text.replace(/\s+/g, ' ').trim().slice(0, 70);
  return `[${TYPE_RU[n.type]}] ${first}${n.text.trim().length > 70 ? '…' : ''}`;
}

/** Issue text: the team reads Lithuanian, the guest's own words stay as written. */
export function issueBody(n: FeedbackNote, screenshotMd = '') {
  return [
    '> ⏸ **Nevykdyti** — laukia peržiūros. Pradėti darbą tik nuėmus žymą `laukia-peržiūros`.',
    '',
    `**Tipas:** ${TYPE_LT[n.type]}`,
    `**Kas rašo:** ${n.name || '—'}${n.contact ? ' · ' + n.contact : ''}`,
    `**Puslapis:** ${n.pageTitle} — ${n.page}`,
    `**Pažymėta vieta:** ${n.element || 'visas ekranas'}`,
    `**Ekranas / naršyklė:** ${n.viewport} · ${n.browser}`,
    `**Kada:** ${n.when}`,
    '',
    '### Ką parašė',
    '',
    n.text.trim(),
    '',
    '### Ekrano nuotrauka',
    '',
    screenshotMd || (n.screenshot ? '_(įklijuokite nuotrauką čia — ji nukopijuota į iškarpinę)_' : '_be nuotraukos_'),
  ].join('\n');
}

/** Prefilled "new issue" page (no endpoint yet). Open it right in the click — popup blockers. */
export function githubIssueUrl(n: FeedbackNote) {
  return (
    `https://github.com/${REPO}/issues/new?` +
    new URLSearchParams({ title: issueTitle(n), body: issueBody(n), labels: LABELS.join(',') }).toString()
  );
}

/** Sends the note to the endpoint; returns the issue number and link. */
export async function sendFeedback(n: FeedbackNote): Promise<{ number?: number; url?: string }> {
  const form = new FormData();
  const { screenshot, ...rest } = n;
  // the worker puts the screenshot link in place of the marker
  form.append('note', JSON.stringify({ ...rest, title: issueTitle(n), body: issueBody(n, '{{SCREENSHOT}}') }));
  if (screenshot) form.append('screenshot', screenshot, screenshot.type === 'image/png' ? 'shot.png' : 'shot.webp');
  const res = await fetch(ENDPOINT, { method: 'POST', body: form });
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
