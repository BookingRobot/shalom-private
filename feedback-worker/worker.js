/**
 * «Ваши пожелания» intake — a Cloudflare Worker (free plan is enough).
 *
 * POST multipart: `note` (JSON from src/lib/feedback/submit.ts), optional `screenshot` (the
 * marked spot) and up to 4 `images` (more screenshots / pictures — images only).
 *  1. the note (JSON) and the pictures are saved in the repository branch FILES_BRANCH
 *     (feedback/<month>/<id>.json|.webp, <id>-2.webp …) — this is the archive of all notes;
 *  2. a GitHub issue is opened with the labels «atsiliepimas» and «laukia-peržiūros»
 *     (no one works on it before the label is removed);
 *  3. answers { number, url }.
 *
 * Secrets / vars (wrangler.toml, `wrangler secret put GITHUB_TOKEN`):
 *   GITHUB_TOKEN    fine-grained token, repository BookingRobot-M/br-shalom only:
 *                   Issues — read & write, Contents — read & write
 *   REPO            BookingRobot-M/br-shalom
 *   FILES_BRANCH    feedback-files
 *   ALLOWED_ORIGINS https://shalom.bookingrobot.eu,http://localhost:5173
 *   PIN_HASH        optional: the code the form asks for, as pbkdf2:<iterations>:<salt b64>:<hash b64>
 *                   (PBKDF2-SHA256; only the hash is kept, the code itself is nowhere)
 */
const LABELS = ['atsiliepimas', 'laukia-peržiūros'];

// wrong codes: 5 per address (and 200 in all) per hour, then the form waits
const FAILS_PER_IP = 5;
const FAILS_ALL = 200;
const fails = new Map();
let failsAll = [];
const hourAgo = () => Date.now() - 3600e3;
function locked(ip) {
  failsAll = failsAll.filter((t) => t > hourAgo());
  const mine = (fails.get(ip) || []).filter((t) => t > hourAgo());
  fails.set(ip, mine);
  return mine.length >= FAILS_PER_IP || failsAll.length >= FAILS_ALL;
}
function failed(ip) {
  const now = Date.now();
  fails.set(ip, [...(fails.get(ip) || []), now]);
  failsAll.push(now);
}

const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** the typed code against the stored hash, in constant time */
async function pinOk(pin, spec) {
  const [alg, iter, salt, hash] = String(spec).split(':');
  if (alg !== 'pbkdf2' || !pin) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(salt), iterations: Number(iter) },
      key,
      256,
    ),
  );
  const want = fromB64(hash);
  if (bits.length !== want.length) return false;
  let d = 0;
  for (let i = 0; i < bits.length; i++) d |= bits[i] ^ want[i];
  return d === 0;
}
const HOLD = '> ⏸ **Nevykdyti** — laukia peržiūros. Pradėti darbą tik nuėmus žymą `laukia-peržiūros`.';
const MAX_SHOT = 2 * 1024 * 1024;
const MAX_IMAGES = 4;
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
// the file itself must look like a picture, whatever its declared type
const looksLikeImage = (b) =>
  (b[0] === 0x89 && b[1] === 0x50) || // png
  (b[0] === 0xff && b[1] === 0xd8) || // jpeg
  (b[0] === 0x47 && b[1] === 0x49) || // gif
  (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45); // RIFF....WEBP

const cors = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
};

const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

async function gh(env, path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${env.REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'br-shalom-feedback',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const b64 = (bytes) => {
  let s = '';
  const a = new Uint8Array(bytes);
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
  return btoa(s);
};

async function putFile(env, path, contentB64, message) {
  return gh(env, `/contents/${encodeURI(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: contentB64, branch: env.FILES_BRANCH || 'feedback-files' }),
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, headers);
    if (!headers['Access-Control-Allow-Origin'] || headers['Access-Control-Allow-Origin'] !== origin)
      return json({ error: 'origin' }, 403, headers);

    try {
      const form = await request.formData();
      if (env.PIN_HASH) {
        const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-client-ip') || 'unknown';
        if (locked(ip)) return json({ error: 'locked' }, 429, headers);
        if (!(await pinOk(String(form.get('pin') || ''), env.PIN_HASH))) {
          failed(ip);
          return json({ error: 'pin' }, 401, headers);
        }
      }
      const note = JSON.parse(String(form.get('note') || '{}'));
      const text = String(note.text || note.title || '').trim();
      if (!text || text.length > 20000) return json({ error: 'text' }, 400, headers);

      const now = new Date();
      const month = now.toISOString().slice(0, 7);
      const id = now.toISOString().replace(/[-:T]/g, '').slice(0, 14) + '-' + Math.random().toString(36).slice(2, 7);
      const branch = env.FILES_BRANCH || 'feedback-files';
      const link = (path, alt) => `![${alt}](https://github.com/${env.REPO}/blob/${branch}/${path}?raw=true)`;

      /** saves one picture, returns its path or null when it is not a picture */
      const savePicture = async (file, name) => {
        if (!file || typeof file === 'string' || !file.size || file.size > MAX_SHOT) return null;
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!looksLikeImage(bytes)) return null;
        const ext = IMAGE_TYPES[file.type] || 'webp';
        const path = `feedback/${month}/${name}.${ext}`;
        await putFile(env, path, b64(bytes), `feedback ${id}: ${name}`);
        return path;
      };

      let shotMd = '_be pažymėtos vietos nuotraukos_';
      const shotPath = await savePicture(form.get('screenshot'), id);
      if (shotPath) shotMd = link(shotPath, 'Pažymėta vieta');

      const imagePaths = [];
      for (const f of form.getAll('images').slice(0, MAX_IMAGES)) {
        const path = await savePicture(f, `${id}-${imagePaths.length + 2}`);
        if (path) imagePaths.push(path);
      }
      const imagesMd = imagePaths.map((p, i) => link(p, `Paveikslėlis ${i + 2}`)).join('\n\n');

      const title = String(note.title || '[Пожелание] ' + text.slice(0, 70)).slice(0, 200);
      let body = String(note.body || text)
        .replace('{{SCREENSHOT}}', shotMd)
        .replace('{{IMAGES}}', imagesMd);
      if (!body.startsWith(HOLD)) body = HOLD + '\n\n' + body;
      body += `\n\n<sub>feedback ${id}</sub>`;

      const issue = await gh(env, '/issues', { method: 'POST', body: JSON.stringify({ title, body, labels: LABELS }) });

      const record = {
        id,
        issue: issue.number,
        received: now.toISOString(),
        ...note,
        body: undefined,
        title,
        screenshot: shotPath,
        images: imagePaths,
      };
      await putFile(
        env,
        `feedback/${month}/${id}.json`,
        b64(new TextEncoder().encode(JSON.stringify(record, null, 2))),
        `feedback ${id}: note (#${issue.number})`,
      );

      return json({ number: issue.number, url: issue.html_url }, 200, headers);
    } catch (e) {
      return json({ error: String(e && e.message) }, 500, headers);
    }
  },
};
