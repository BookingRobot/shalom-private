/**
 * Screenshot for "Ваши пожелания" (the same way as On Time's notes): the page is drawn in the
 * browser with modern-screenshot, the widget itself is left out, the picture is cut to what the
 * guest sees, the marked spot gets a red frame, and it is encoded as WebP under ~1.5 MB.
 * Personal data (e-mails, phone numbers) in the picture become dots.
 */
import type { Options } from 'modern-screenshot';

export const IGNORE = '[data-feedback-ignore]';
const MAX_BYTES = 1.5 * 1024 * 1024;
const PERSONAL = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+\.[a-z]{2,}|(?:\+\d[\d\s-]{7,14}\d)/gi;
/** our own public phone and e-mail stay readable in the picture */
const PLACEHOLDER_PHONE = /\+972\s?3\s?655\s?25\s?22|info@atlantistravel\.co\.il/;

function redactClone(root: Node) {
  const doc = root.ownerDocument ?? document;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent ?? '';
    if (PLACEHOLDER_PHONE.test(t)) continue;
    if (PERSONAL.test(t)) n.textContent = t.replace(PERSONAL, (m) => m.replace(/\S/g, '•'));
    PERSONAL.lastIndex = 0;
  }
  if ('querySelectorAll' in root) {
    (root as ParentNode).querySelectorAll('input[type="email"], input[type="tel"]').forEach((el) => {
      const v = (el as HTMLInputElement).value || el.getAttribute('value') || '';
      el.setAttribute('value', v.replace(/\S/g, '•'));
    });
  }
}

const keepNode = (node: Node) => !(node instanceof Element && node.matches(IGNORE));

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), type, quality);
    } catch {
      resolve(null);
    }
  });
}

function scaled(source: HTMLCanvasElement, f: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(source.width * f));
  c.height = Math.max(1, Math.round(source.height * f));
  c.getContext('2d')?.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

async function withinLimit(canvas: HTMLCanvasElement): Promise<Blob | null> {
  let cur = canvas;
  let q = 0.85;
  for (let i = 0; i < 6; i++) {
    const blob = (await toBlob(cur, 'image/webp', q)) || (await toBlob(cur, 'image/png', 1));
    if (!blob) return null;
    if (blob.size <= MAX_BYTES) return blob;
    cur = scaled(cur, 0.75);
    q = Math.max(0.6, q - 0.05);
  }
  return null;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** What the guest sees of the page, the marked spot framed in white and red. */
function visiblePart(page: HTMLCanvasElement, body: Box, selected: Box | null) {
  const ratio = body.width > 0 ? page.width / body.width : 1;
  const c = document.createElement('canvas');
  c.width = Math.round(window.innerWidth * ratio);
  c.height = Math.round(window.innerHeight * ratio);
  const ctx = c.getContext('2d');
  if (!ctx) return page;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(
    page,
    Math.max(0, -body.left * ratio),
    Math.max(0, -body.top * ratio),
    c.width,
    c.height,
    0,
    0,
    c.width,
    c.height,
  );
  if (selected) {
    const pad = 4 * ratio;
    const frame = (w: number, colour: string) => {
      ctx.lineWidth = w;
      ctx.strokeStyle = colour;
      ctx.strokeRect(
        selected.left * ratio - pad,
        selected.top * ratio - pad,
        selected.width * ratio + 2 * pad,
        selected.height * ratio + 2 * pad,
      );
    };
    frame(7 * ratio, '#fff');
    frame(3.5 * ratio, token('--danger', '#b3261e'));
  }
  return c;
}

/** a design token's value — the 2D canvas cannot read var(--…) itself */
const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** The screenshot as a Blob, or null when the browser cannot make one (the note goes without it). */
export async function captureScreenshot(selected: Element | null): Promise<Blob | null> {
  try {
    const { domToCanvas } = await import('modern-screenshot');
    const body = document.body.getBoundingClientRect();
    const sel = selected ? selected.getBoundingClientRect() : null;
    const opts: Options = {
      scale: Math.min(window.devicePixelRatio || 1, 1.5),
      backgroundColor: getComputedStyle(document.body).backgroundColor || '#fff',
      filter: keepNode,
      onCloneNode: (clone) => redactClone(clone),
      timeout: 8000,
      features: { restoreScrollPosition: true },
    };
    const page = await domToCanvas(document.body, opts);
    return await withinLimit(visiblePart(page, body, sel));
  } catch {
    return null;
  }
}
