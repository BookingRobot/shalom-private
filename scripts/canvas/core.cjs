/**
 * Shared parts of the canvas snapshot (scripts/snapshot-canvas.cjs): the browser, the site's
 * CSS, the board document, link rewriting and the generic «open the page, set it up, take its
 * markup» step. Page-specific work lives in scripts/canvas/<page>.cjs, the board list in
 * scripts/canvas/boards.json.
 */
const fs = require('fs');
const path = require('path');
const { act, linkBoards } = require('./find.cjs');

const ROOT = path.join(__dirname, '..', '..');

/** Playwright from the global install (NODE_PATH=$(npm root -g)): its browser is the one on this machine. */
function playwright() {
  for (const dir of (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)) {
    try {
      return require(path.join(dir, 'playwright'));
    } catch {
      /* next */
    }
  }
  return require('playwright');
}

const OUT = process.argv[2] || 'canvas-out';
const BASE = (process.argv[3] || process.env.SITE || 'http://localhost:4173').replace(/\/$/, '');
/** the build being served (its CSS goes into every board): dist, or CANVAS_DIST=dist-canvas */
const DIST = path.join(ROOT, process.env.CANVAS_DIST || 'dist', 'assets');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'boards.json'), 'utf8'));
const VIEWPORTS = CONFIG.viewports;
/** every board, in the order of boards.json, with its page name */
const BOARDS = Object.entries(CONFIG.pages).flatMap(([page, list]) => list.map((b) => ({ ...b, page })));

/** sanatorium tags and filter groups, straight from the site's data */
const DATA = (() => {
  const r = require('esbuild').buildSync({
    stdin: {
      contents: "export {SANATORIUMS} from './src/data/sanatoriums'; export {FILTER_GROUPS} from './src/data/filters';",
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });
  const m = { exports: {} };
  new Function('module', 'exports', 'require', r.outputFiles[0].text)(m, m.exports, require);
  return m.exports;
})();

const css = fs
  .readdirSync(DIST)
  .filter((f) => f.endsWith('.css'))
  .sort((a, b) => (a.startsWith('index') ? -1 : b.startsWith('index') ? 1 : a.localeCompare(b)))
  .map((f) => fs.readFileSync(path.join(DIST, f), 'utf8'))
  .join('\n')
  .replace(/@font-face\{[^}]*\}/g, '');

/** where a site link goes on the canvas: the board that `targets` that address (boards.json) */
const TARGETS = (() => {
  const m = {};
  for (const b of BOARDS) for (const t of b.targets || []) m[t] = b.file;
  return m;
})();
const linkFor = (href) => {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  const [p, hash] = href.split('#');
  const route = p.split('?')[0] || '/';
  const h = (p.split('?')[1] || '').match(/(?:^|&)h=([a-z-]+)/);
  // the sanatorium page: /sanatoriy/<id> or the older /hotel?h=<id>
  const f =
    (h && TARGETS['/sanatoriy/' + h[1]]) ||
    (route === '/hotel' && h ? TARGETS['/hotel?h=' + h[1]] : null) ||
    TARGETS[route] ||
    // another sanatorium or resort than the boards show: the first board of that kind
    Object.entries(TARGETS).find(([t]) => t.split('/')[1] === route.split('/')[1] && route.split('/')[2])?.[1];
  if (!f) return href;
  return f + (hash ? '#' + hash : '');
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** the site's markup → board markup: images from the canvas store, links to boards, no stray {{ */
const post = (html) =>
  html
    // «Ваши пожелания» opens the form board in Play
    .replace(
      /<button type="button" class="(fb-btn[^"]*)"([^>]*)>([\s\S]*?)<\/button>/,
      '<a class="$1" href="Feedback.dc.html"$2 style="text-decoration:none">$3</a>',
    )
    // «Свяжитесь со мной» in the footer opens the form board
    .replace(
      /<button type="button" class="([^"]*\bhs-btn\b[^"]*)"([^>]*)>([\s\S]*?)<\/button>/g,
      '<a class="$1" href="Help.dc.html"$2 style="text-decoration:none">$3</a>',
    )
    .replace(/(src|href)="\/img\/([0-9a-f]{32})\.[a-z]+"/g, '$1="/_blob/$2"')
    .replace(/url\(&quot;\/img\/([0-9a-f]{32})\.[a-z]+&quot;\)/g, 'url(&quot;/_blob/$1&quot;)')
    .replace(/url\(\/img\/([0-9a-f]{32})\.[a-z]+\)/g, 'url(/_blob/$1)')
    .replace(
      /href="([^"]*)"/g,
      (_, href) => 'href="' + linkFor(href.replace(/&amp;/g, '&')).replace(/&/g, '&amp;') + '"',
    )
    .replace(/\{\{/g, '{&#123;');

/** full .dc.html document */
const docFor = (title, route, body, h, logic, w = 1280) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
${css}
/* canvas only: «i» opens its balloon on hover (the site opens it on a tap with a script) */
.info-host:has(.info-tip:hover) .info-pop{display:block}
.info-host:has(.info-tip:hover) .info-tip{background:#1f5f4a;border-color:#1f5f4a;color:#fff}
</style>
</helmet>
<!-- Снимок страницы ${esc(route)} с shalom.bookingrobot.eu — макет совпадает с сайтом -->
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
${logic || 'class Component extends DCLogic {\n  renderVals() {\n    return {};\n  }\n}'}
</script>
</body>
</html>
`;

const viewportOf = (b) => VIEWPORTS[b.viewport || 'laptop'];

/** open a page in a fresh context at the board's size */
async function open(browser, route, viewport = VIEWPORTS.laptop) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE + route, { waitUntil: 'networkidle' });
  return { ctx, p, errs };
}

/** one static board: open, set up, turn buttons into links, freeze the live state into the markup */
async function snapshot(browser, bd, named, sizes, extra) {
  const vp = viewportOf(bd);
  const { ctx, p, errs } = await open(browser, bd.route, vp);
  await act(p, bd.setup, named);
  await p.waitForTimeout(250);
  // a step's «Далее» bar: scroll to the end once so the page shows its final state
  if (await p.$('[data-to]')) {
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(450);
  }
  if (extra) await extra(p);
  const missing = await linkBoards(p, bd.links);
  const { html, h } = await p.evaluate(() => {
    // «Далее» of a step: the bottom bar stays hidden on a board, the button becomes a link to the next board
    document.querySelectorAll('.step-bar').forEach((x) => x.classList.remove('on'));
    document.body.classList.remove('has-stepbar');
    document.querySelectorAll('button[data-to]').forEach((bt) => {
      const a = document.createElement('a');
      a.className = bt.className;
      a.setAttribute('href', bt.getAttribute('data-to'));
      a.style.textDecoration = 'none';
      a.innerHTML = bt.innerHTML;
      bt.replaceWith(a);
    });
    // carry live form state into attributes so the snapshot shows it
    document.querySelectorAll('input').forEach((i) => {
      if (i.type === 'checkbox' || i.type === 'radio') {
        if (i.checked) i.setAttribute('checked', '');
        else i.removeAttribute('checked');
      } else if (i.value) i.setAttribute('value', i.value);
    });
    document.querySelectorAll('textarea').forEach((t) => (t.textContent = t.value));
    document
      .querySelectorAll('select')
      .forEach((s) =>
        Array.from(s.options).forEach((o) => (o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'))),
      );
    const dialog = document.querySelector('[role="dialog"]');
    const bottom = dialog ? dialog.getBoundingClientRect().bottom + window.scrollY + 40 : 0;
    return {
      html: document.getElementById('root').innerHTML,
      h: Math.max(document.documentElement.scrollHeight, Math.ceil(bottom)),
    };
  });
  const out = post(html);
  const left = out.match(/\/img\/[^"')\s]+/g);
  if (left) console.warn(bd.file, 'unmapped images:', [...new Set(left)]);
  fs.writeFileSync(path.join(OUT, bd.file), docFor(bd.title, bd.route, out, h, null, vp.width));
  sizes[bd.file] = {
    h,
    title: bd.title,
    state: !!bd.state,
    interactive: !!(bd.build || bd.links),
    ...(vp.width !== 1280 ? { w: vp.width } : {}),
  };
  const warn = [errs.length ? 'ERR ' + errs.join(';') : '', missing && missing.length ? 'no link target: ' + missing.join(' ') : '']
    .filter(Boolean)
    .join(' · ');
  console.log(bd.file, h, warn);
  await ctx.close();
}

/** open a route, run its setup, then a function in the page (with the canvas helpers loaded) */
async function grab(browser, route, setup, fn, arg, helpers) {
  const { ctx, p } = await open(browser, route);
  if (setup) await setup(p);
  await p.waitForTimeout(200);
  for (const h of helpers || []) await p.addScriptTag({ content: h });
  const r = await p.evaluate(fn, arg);
  await ctx.close();
  return r;
}

const wrapIf = (cond, html) => `<sc-if value="{{${cond}}}" hint-placeholder-val="{{false}}">${html}</sc-if>`;

module.exports = {
  fs,
  path,
  playwright,
  OUT,
  BASE,
  BOARDS,
  VIEWPORTS,
  DATA,
  post,
  docFor,
  snapshot,
  grab,
  open,
  wrapIf,
};
