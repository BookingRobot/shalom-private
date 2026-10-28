#!/usr/bin/env node
/**
 * «Ваши пожелания» intake on an ordinary Linux server (Node 20+) instead of Cloudflare.
 * worker.js runs unchanged: every request goes to worker.fetch(request, env).
 *
 * Settings come from the environment (systemd: EnvironmentFile=/etc/br-shalom-feedback.env):
 *   GITHUB_TOKEN     fine-grained token, repository br-shalom only: Issues + Contents read & write
 *   REPO             BookingRobot-M/br-shalom
 *   FILES_BRANCH     feedback-files
 *   ALLOWED_ORIGINS  https://shalom.bookingrobot.eu,…
 *   PIN_HASH         the form code as pbkdf2:<iterations>:<salt>:<hash> (install.sh makes it;
 *                    empty = no code asked)
 *   PORT / HOST      8787 / 127.0.0.1 (the web server in front adds HTTPS)
 *
 *   node server.mjs           start
 *   node server.mjs --check   check the token and the repository, then exit
 */
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import worker from './worker.js';

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  REPO: process.env.REPO || 'BookingRobot-M/br-shalom',
  FILES_BRANCH: process.env.FILES_BRANCH || 'feedback-files',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'https://shalom.bookingrobot.eu',
  PIN_HASH: process.env.PIN_HASH || '',
};
const MAX_BODY = 6 * 1024 * 1024;
// every note becomes a GitHub issue: keep a stranger from flooding the repository
const PER_IP_HOUR = Number(process.env.PER_IP_HOUR || 20);
const PER_DAY = Number(process.env.PER_DAY || 300);
// hop-by-hop headers, and the address headers a client could fake (we set x-client-ip ourselves)
const HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'x-client-ip',
  'cf-connecting-ip',
]);

const hits = new Map();
let day = { key: '', n: 0 };
function limited(ip) {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (day.key !== today) day = { key: today, n: 0 };
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (list.length >= PER_IP_HOUR || day.n >= PER_DAY) return true;
  list.push(now);
  hits.set(ip, list);
  day.n++;
  return false;
}

const clientIp = (req) => {
  const peer = req.socket.remoteAddress || '';
  const fwd = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  // trust the forwarded address only from the web server on this machine
  return /^(::1|127\.|::ffff:127\.)/.test(peer) && fwd ? fwd : peer;
};

export function createServer(handler = worker, cfg = env) {
  return http.createServer(async (req, res) => {
    let status = 500;
    try {
      if (req.method === 'GET' && /\/health\/?$/.test(req.url || '')) {
        status = 200;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('ok');
      }
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > MAX_BODY) {
          status = 413;
          res.writeHead(413);
          return res.end();
        }
        chunks.push(c);
      }
      if (req.method === 'POST' && limited(clientIp(req))) {
        status = 429;
        res.writeHead(429, { 'Content-Type': 'application/json' });
        return res.end('{"error":"too many"}');
      }
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers))
        if (v !== undefined && !HOP.has(k)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      headers.set('x-client-ip', clientIp(req));
      const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method || 'GET');
      const request = new Request('http://localhost' + (req.url || '/'), {
        method: req.method,
        headers,
        body: hasBody ? Buffer.concat(chunks) : undefined,
      });
      const r = await handler.fetch(request, cfg);
      status = r.status;
      const out = {};
      r.headers.forEach((v, k) => (out[k] = v));
      const buf = Buffer.from(await r.arrayBuffer());
      res.writeHead(r.status, out);
      res.end(buf);
      if (req.method === 'POST') {
        const info = r.status === 200 ? 'issue #' + JSON.parse(buf.toString()).number : buf.toString().slice(0, 200);
        console.log(new Date().toISOString(), 'POST', r.status, info);
      }
    } catch (e) {
      console.error(new Date().toISOString(), req.method, 'error', e && e.message);
      if (!res.headersSent) res.writeHead(status);
      res.end();
    }
  });
}

/** Token and repository check (does not write anything). */
async function check() {
  const say = (ok, msg) => console.log((ok ? '  ✔ ' : '  ✘ ') + msg);
  if (!env.GITHUB_TOKEN) {
    say(false, 'GITHUB_TOKEN tuščias');
    process.exit(1);
  }
  const get = (p) =>
    fetch(`https://api.github.com/repos/${env.REPO}${p}`, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'br-shalom-feedback',
      },
    });
  let bad = 0;
  const repo = await get('');
  say(repo.ok, repo.ok ? `tokenas mato ${env.REPO}` : `tokenas nemato ${env.REPO} (HTTP ${repo.status})`);
  if (!repo.ok) process.exit(1);
  const br = await get(`/branches/${env.FILES_BRANCH}`);
  say(br.ok, br.ok ? `šaka ${env.FILES_BRANCH} yra` : `šakos ${env.FILES_BRANCH} nėra (HTTP ${br.status})`);
  if (!br.ok) bad++;
  for (const l of ['atsiliepimas', 'laukia-peržiūros']) {
    const r = await get(`/labels/${encodeURIComponent(l)}`);
    say(r.ok, r.ok ? `žyma ${l} yra` : `žymos ${l} nėra (HTTP ${r.status})`);
    if (!r.ok) bad++;
  }
  say(true, env.PIN_HASH ? 'formos kodas nustatytas' : 'formos kodas nenustatytas — siųsti gali bet kas');
  const issues = await get('/issues?per_page=1');
  say(
    issues.ok,
    issues.ok ? 'tokenas mato issues' : `tokenas nemato issues (HTTP ${issues.status}) — reikia Issues teisės`,
  );
  if (!issues.ok) bad++;
  process.exit(bad ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (process.argv.includes('--check')) await check();
  else {
    const port = Number(process.env.PORT || 8787);
    const host = process.env.HOST || '127.0.0.1';
    createServer().listen(port, host, () => console.log(`br-shalom-feedback: http://${host}:${port} (${env.REPO})`));
  }
}
