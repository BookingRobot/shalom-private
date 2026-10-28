/**
 * «Ваши пожелания» intake — a Cloudflare Worker (free plan is enough).
 *
 * POST multipart: `note` (JSON from src/lib/feedback/submit.ts) and optional `screenshot`.
 *  1. the note (JSON) and the screenshot are saved in the repository branch FILES_BRANCH
 *     (feedback/<month>/<id>.json|.webp) — this is the archive of all notes;
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
 */
const LABELS = ['atsiliepimas', 'laukia-peržiūros'];
const HOLD = '> ⏸ **Nevykdyti** — laukia peržiūros. Pradėti darbą tik nuėmus žymą `laukia-peržiūros`.';
const MAX_SHOT = 2 * 1024 * 1024;

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
      const note = JSON.parse(String(form.get('note') || '{}'));
      const text = String(note.text || '').trim();
      if (!text || text.length > 5000) return json({ error: 'text' }, 400, headers);

      const now = new Date();
      const month = now.toISOString().slice(0, 7);
      const id = now.toISOString().replace(/[-:T]/g, '').slice(0, 14) + '-' + Math.random().toString(36).slice(2, 7);
      const branch = env.FILES_BRANCH || 'feedback-files';

      let shotMd = '_be nuotraukos_';
      const shot = form.get('screenshot');
      if (shot && typeof shot !== 'string' && shot.size > 0 && shot.size <= MAX_SHOT) {
        const ext = shot.type === 'image/png' ? 'png' : 'webp';
        const path = `feedback/${month}/${id}.${ext}`;
        await putFile(env, path, b64(await shot.arrayBuffer()), `feedback ${id}: screenshot`);
        shotMd = `![Ekrano nuotrauka](https://github.com/${env.REPO}/blob/${branch}/${path}?raw=true)`;
      }

      const title = String(note.title || '[Пожелание] ' + text.slice(0, 70)).slice(0, 200);
      let body = String(note.body || text).replace('{{SCREENSHOT}}', shotMd);
      if (!body.startsWith(HOLD)) body = HOLD + '\n\n' + body;
      body += `\n\n<sub>feedback ${id}</sub>`;

      const issue = await gh(env, '/issues', { method: 'POST', body: JSON.stringify({ title, body, labels: LABELS }) });

      const record = { id, issue: issue.number, received: now.toISOString(), ...note, body: undefined, title };
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
