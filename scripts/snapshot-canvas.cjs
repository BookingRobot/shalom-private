/**
 * Snapshot the built site into Design-canvas artboards (.dc.html), so the canvas
 * shows exactly what is online. Run: npm run build && npx vite preview --port 4173,
 * then: NODE_PATH=$(npm root -g) node scripts/snapshot-canvas.cjs <outDir>
 *
 * Each board = the rendered page markup + the site's CSS, static (no logic).
 * Images /img/<hash>.<ext> → /_blob/<hash> (the canvas asset store uses the same hashes);
 * internal links → the matching artboard, so Play still walks through the flow.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const IA = require('./canvas-interactive.cjs');

/** sanatorium tags and filter groups, straight from the site's data */
const DATA = (() => {
  const r = require('esbuild').buildSync({
    stdin: {
      contents: "export {SANATORIUMS} from './src/data/sanatoriums'; export {FILTER_GROUPS} from './src/data/filters';",
      resolveDir: path.join(__dirname, '..'),
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
const { searchBand, linkButtons } = require('./canvas/templatize.cjs');
const SEARCH_LOGIC = fs.readFileSync(path.join(__dirname, 'canvas', 'search-logic.js'), 'utf8');

const BASE = process.env.SITE || 'http://localhost:4173';
const OUT = process.argv[2] || 'canvas-out';
const DIST = path.join(__dirname, '..', 'dist', 'assets');

const ROUTE_FILE = {
  '/': 'Main.dc.html',
  '/results': 'Results-B.dc.html',
  '/hotel': 'Hotel-B.dc.html',
  '/rooms': 'Rooms.dc.html',
  '/transfer': 'Transfer.dc.html',
  '/guests': 'Guests.dc.html',
  '/flights': 'Transfer.dc.html',
  '/payment': 'Payment.dc.html',
  '/done': 'Done.dc.html',
  '/rules': 'Rules.dc.html',
  '/tickets': 'Tickets.dc.html',
};

const css = fs
  .readdirSync(DIST)
  .filter((f) => f.endsWith('.css'))
  .sort((a, b) => (a.startsWith('index') ? -1 : b.startsWith('index') ? 1 : a.localeCompare(b)))
  .map((f) => fs.readFileSync(path.join(DIST, f), 'utf8'))
  .join('\n')
  .replace(/@font-face\{[^}]*\}/g, '');

/** Boards: file, title, route, optional setup steps (run after load). */
const BOARDS = [
  { file: 'Main.dc.html', title: '1 · Главная и поиск', route: '/', search: { city: true } },
  {
    file: 'Results-B.dc.html',
    title: '2 · Результаты (Друскининкай)',
    route: '/results',
    search: { city: true },
    links: [
      ['button', 'Помогите выбрать санаторий', 'Results-wizard.dc.html'],
      ['button', 'Выбрать другие даты', 'Results-roomdates.dc.html'],
      ['.f-btn', '', 'Results-filters.dc.html'],
    ],
  },
  {
    file: 'Results-filters.dc.html',
    title: 'Результаты · «Уточните выбор» открыт',
    route: '/results',
    state: true,
    setup: async (p) => p.click('.f-btn'),
    links: [
      ['button', 'Свернуть', 'Results-B.dc.html'],
      ['button', 'Показать', 'Results-B.dc.html'],
    ],
  },
  { file: 'Hotel-B.dc.html', title: '3 · Санаторий и выбор номера (вкладки работают)', route: '/hotel' },
  { file: 'Hotel-grand.dc.html', title: 'Санаторий · Гранд Спа Лиетува', route: '/hotel?h=grand-spa-lietuva' },
  { file: 'Hotel-belorus.dc.html', title: 'Санаторий · Беларусь', route: '/hotel?h=belorus' },
  {
    // no places on the guest's dates: the nearest dates with places and «Свяжитесь со мной»
    file: 'Hotel-upa.dc.html',
    title: 'Санаторий · на ваши даты мест нет (Упа): ближайшие даты и «Свяжитесь со мной»',
    route: '/hotel?h=upa',
    links: [['.ht-na-call', '', 'Help.dc.html']],
  },
  {
    file: 'Rooms.dc.html',
    title: 'Шаг 1 · Номер и программа',
    route: '/rooms',
    setup: async (p) => p.click('text=Отправить предложение семье'),
  },
  {
    file: 'Transfer.dc.html',
    title: 'Шаг 2 · Дорога: перелёт и трансфер — ничего не выбрано за гостя (Эгле: трансфер санатория уже оплачен)',
    route: '/transfer',
    links: [
      ['#flyChoice .choice', 'Да, добавить', 'Transfer-fly.dc.html'],
      ['#trNeed .choice', 'Да, нужен', 'Transfer-yes.dc.html'],
      ['.fly-help', '', 'Help.dc.html'],
    ],
  },
  { file: 'Guests.dc.html', title: 'Шаг 3 · Данные гостей', route: '/guests' },
  { file: 'Payment.dc.html', title: 'Шаг 4 · Оплата', route: '/payment' },
  { file: 'Done.dc.html', title: '🏁 Финиш · Заказ принят', route: '/done' },
  { file: 'Rules.dc.html', title: 'Справка · Условия и отмена', route: '/rules' },
  {
    file: 'Tickets.dc.html',
    title: 'Меню · Прямые перелёты Тель-Авив ⇄ Вильнюс — поиск',
    route: '/tickets',
    links: [
      ['.tk-date', '', 'Tickets-cal.dc.html'],
      ['.tk-go', '', 'Tickets-res.dc.html'],
    ],
  },
  {
    file: 'Tickets-cal.dc.html',
    title: 'Прямые перелёты · календарь: только дни с рейсом, цена с человека',
    route: '/tickets',
    state: true,
    setup: async (p) => {
      await p.click('.tk-date >> nth=0');
      await p.waitForTimeout(300);
    },
    links: [
      ['.tk-cal .cell:not([disabled])', '', 'Tickets-res.dc.html'],
      ['.tk-cal-h .btn', '', 'Tickets.dc.html'],
    ],
  },
  {
    file: 'Tickets-res.dc.html',
    title: 'Прямые перелёты · рейс найден: время, места, цена на всех, заказ и сравнение дат',
    route: '/tickets?from=IL&dep=2026-11-01&n=2&type=rt&ret=2026-11-15',
    state: true,
    setup: async (p) => {
      await p.click('.tk-cmp-h');
      await p.waitForTimeout(300);
    },
    links: [
      ['.tk-date', '', 'Tickets-cal.dc.html'],
      ['.tk-res button', 'Свяжитесь со мной', 'Help.dc.html'],
      ['.tk-res button', 'Подобрать санаторий', 'Results-B.dc.html'],
    ],
  },
  { file: 'Help.dc.html', title: 'Справка · Форма «Свяжитесь со мной» (на всех страницах)', route: '/?help=1' },
  // States people comment on: pop-ups and variants
  {
    file: 'Main-search.dc.html',
    title: 'Главная · поиск «Курорт или санаторий»',
    route: '/',
    state: true,
    setup: async (p) => p.click('#city'),
  },
  {
    file: 'Main-guests.dc.html',
    title: 'Главная · гости (+/−)',
    route: '/',
    state: true,
    setup: async (p) => p.click('#guests'),
  },
  {
    file: 'Main-flex.dc.html',
    title: 'Календарь · «Не знаю точных дат»',
    route: '/',
    state: true,
    setup: async (p) => {
      await p.click('#datein');
      await p.click('text=Не знаю точных дат');
    },
  },
  {
    file: 'Main-dates.dc.html',
    title: 'Календарь · точные даты',
    route: '/',
    state: true,
    setup: async (p) => p.click('#datein'),
  },
  {
    file: 'Results-wizard.dc.html',
    title: 'Результаты · «Помогите выбрать» — вопрос',
    route: '/results',
    state: true,
    setup: async (p) => p.click('text=Помогите выбрать санаторий'),
    links: [
      ['.wz-opt', '', 'Results-wizard-done.dc.html'],
      ['.wz-close', 'Закрыть', 'Results-B.dc.html'],
    ],
  },
  {
    file: 'Results-wizard-done.dc.html',
    title: 'Результаты · «Помогите выбрать» — ответ',
    route: '/results',
    state: true,
    setup: async (p) => {
      await p.click('text=Помогите выбрать санаторий');
      await p.click('.wz-opt:has-text("Спина и суставы")');
      await p.click('.wz-opt:has-text("нужен лифт")');
      await p.click('.wz-opt:has-text("До 1 000")');
    },
    links: [
      ['.wz-show', '', 'Results-B.dc.html'],
      ['.wz-close', 'Ответить заново', 'Results-wizard.dc.html'],
      ['.wz-close', '', 'Results-B.dc.html'],
    ],
  },
  {
    file: 'Results-compare.dc.html',
    title: 'Результаты · сравнение санаториев',
    route: '/results',
    state: true,
    setup: async (p) => {
      const c = await p.$$('.cmp-check input');
      await c[0].check();
      await c[1].check();
      await p.click('text=/Сравнить \\(2\\)/');
    },
    links: [['.cmp-btn', 'Закрыть', 'Results-B.dc.html']],
  },
  {
    file: 'Results-roomdates.dc.html',
    title: 'Результаты · свободные даты номера',
    route: '/results',
    state: true,
    setup: async (p) => {
      await p.click('#h-egle-comfort button[aria-expanded]');
      await p.waitForTimeout(1500);
      await p.click('text=Выбрать другие даты');
    },
    links: [
      ['button', 'Закрыть', 'Results-B.dc.html'],
      ['button', 'Отмена', 'Results-B.dc.html'],
      ['button', 'Подтвердить даты', 'Results-B.dc.html'],
    ],
  },
  {
    file: 'Results-solo-flight.dc.html',
    title: 'Результаты · 1 взрослый, с перелётом',
    route: '/results',
    state: true,
    setup: async (p) => {
      await p.click('#guests');
      await p.click('button[aria-label="Меньше: взрослые"]');
      await p.click('.gp-done');
      await p.click('.ftog-line input');
      await p.click('#h-egle-comfort button[aria-expanded]');
      await p.waitForTimeout(1500);
    },
  },
  {
    file: 'Feedback.dc.html',
    title: 'Ваши пожелания · форма (красная кнопка на всех страницах)',
    route: '/results',
    state: true,
    setup: async (p) => {
      await p.click('.fb-btn');
      const box = await p.locator('.f-btn').boundingBox();
      await p.mouse.move(box.x + 10, box.y + 10);
      await p.mouse.click(box.x + 10, box.y + 10);
      await p.waitForSelector('.fb-panel', { timeout: 15000 });
      await p.fill('[data-f=title]', 'Фильтры хочу видеть сразу');
      await p.fill('[data-f=description]', 'Хочу, чтобы фильтры были видны сразу, без нажатия на кнопку.');
      await p.fill('[data-f=name]', 'Ирина');
      // one more screenshot: the whole screen
      await p.click('text=Ещё снимок экрана');
      await p.waitForSelector('.fb-mark-bar');
      await p.click('.fb-mark-bar >> text=Весь экран');
      await p.waitForSelector('.fb-panel', { timeout: 15000 });
      // the previews are blob: URLs — keep them as pictures in the board
      await p.evaluate(async () => {
        document.querySelectorAll('.fb-thumb').forEach((a) => a.removeAttribute('href'));
        document.querySelectorAll('.fb-thumb img').forEach((img) => {
          const c = document.createElement('canvas');
          c.width = 320;
          c.height = 200;
          c.getContext('2d').drawImage(img, 0, 0, c.width, (c.width * img.naturalHeight) / img.naturalWidth);
          img.src = c.toDataURL('image/jpeg', 0.8);
        });
      });
      await p.waitForTimeout(200);
    },
    links: [
      ['.fb-x', '', 'Results-B.dc.html'],
      ['.fb-send', '', 'Results-B.dc.html'],
    ],
  },
  {
    file: 'Transfer-yes.dc.html',
    title: 'Шаг 2 · «Да» → «Групповой» → Вильнюс: дальше где встретить и обратно — гость выбирает сам',
    route: '/transfer',
    state: true,
    setup: async (p) => {
      await p.click('#flyChoice .choice >> nth=1');
      await p.click('#trNeed .choice >> nth=0');
      await p.click('#trHow .tr-how-opt >> nth=0');
      await p.click('#trFrom .rowpick >> nth=0');
      await p.waitForTimeout(300);
    },
    links: [['.fly-help', '', 'Help.dc.html']],
  },
  {
    file: 'Transfer-other.dc.html',
    title: 'Шаг 2 · Дорога — другой санаторий: трансфер продаём мы',
    route: '/transfer',
    state: true,
    setup: async (p) => {
      await p.evaluate(() => {
        const k = 'br-shalom:booking';
        const b = JSON.parse(sessionStorage.getItem(k) || '{}');
        sessionStorage.setItem(k, JSON.stringify({ ...b, hotelId: 'grand-spa-lietuva' }));
      });
      await p.reload({ waitUntil: 'networkidle' });
    },
    links: [['.fly-help', '', 'Help.dc.html']],
  },
  {
    file: 'Transfer-package.dc.html',
    title: 'Шаг 2 · Дорога — перелёт добавлен (Эгле, даты с рейсом)',
    route: '/transfer',
    state: true,
    setup: async (p) => {
      await p.click('#flyChoice .choice >> nth=0');
      await p.click('.fly-alt-row >> nth=0');
      await p.waitForTimeout(1300);
    },
    links: [
      ['#flyChoice .choice', 'Нет', 'Transfer.dc.html'],
      ['.fly-help', '', 'Help.dc.html'],
    ],
  },
  {
    file: 'Transfer-fly.dc.html',
    title: 'Шаг 2 · «Да, добавить наш перелёт»: в ваши даты рейса нет — ближайшие даты с рейсом',
    route: '/transfer',
    state: true,
    setup: async (p) => {
      await p.click('#flyChoice .choice >> nth=0');
      await p.waitForTimeout(1300);
    },
    links: [
      ['.fly-alt-row', '', 'Transfer-package.dc.html'],
      ['#flyChoice .choice', 'Нет', 'Transfer.dc.html'],
      ['.fly-help', '', 'Help.dc.html'],
    ],
  },
];

const linkFor = (href) => {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  const [p, hash] = href.split('#');
  const route = p.split('?')[0] || '/';
  const h = (p.split('?')[1] || '').match(/(?:^|&)h=([a-z-]+)/);
  const HOTEL_FILE = {
    'grand-spa-lietuva': 'Hotel-grand.dc.html',
    belorus: 'Hotel-belorus.dc.html',
    upa: 'Hotel-upa.dc.html',
  };
  if (route === '/hotel' && h && HOTEL_FILE[h[1]]) return HOTEL_FILE[h[1]];
  const f = ROUTE_FILE[route];
  if (!f) return href;
  return f + (hash ? '#' + hash : '');
};

/** the blocks that come in one after another when a board opens (same choice as PageTransition on the site) */
const MARK_REVEAL = `(() => {
  const root = document.querySelector('#root .page');
  if (!root) return;
  const vh = innerHeight, out = [];
  const walk = (el, depth) => {
    for (const c of Array.from(el.children)) {
      const cs = getComputedStyle(c);
      if (cs.position === 'fixed' || cs.display === 'none' || cs.display === 'contents') continue;
      const r = c.getBoundingClientRect();
      if (r.height < 4 || r.top > vh * 1.1) continue;
      const parts = Array.from(c.children).filter((k) => k.getBoundingClientRect().height > 4 && getComputedStyle(k).position !== 'fixed');
      if (depth < 4 && parts.length > 1 && r.height > vh * 0.4) walk(c, depth + 1);
      else out.push(c);
    }
  };
  walk(root, 0);
  out.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
  out.forEach((el, i) => {
    el.classList.add('dc-rv');
    if (el.querySelector('.step-bar, .next-tip, [style*="position: fixed"]')) el.classList.add('dc-rvf');
    el.style.animationDelay = (0.5 + Math.min(i, 12) * 0.07).toFixed(2) + 's';
  });
})()`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const post = (html) =>
  html
    // «Ваши пожелания» opens the form board in Play
    .replace(
      /<button type="button" class="(fb-btn[^"]*)"([^>]*)>([\s\S]*?)<\/button>/,
      '<a class="$1" href="Feedback.dc.html"$2 style="text-decoration:none">$3</a>',
    )
    // «Свяжитесь со мной» in the help band opens the form board
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
const docFor = (title, route, body, h, logic) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
${css}
/* canvas only: «i» opens its balloon on hover (the site opens it on a tap with a script) */
.info-host:has(.info-tip:hover) .info-pop{display:block}
.info-host:has(.info-tip:hover) .info-tip{background:#1f5f4a;border-color:#1f5f4a;color:#fff}
/* canvas only: opening a board shows the short «loading», then the page comes in from the top, as on the site */
.dc-ld{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#f4f1ea;pointer-events:none;animation:dcLdOut .26s ease-in .48s forwards}
.dc-ld i{width:42px;height:42px;border-radius:50%;border:3px solid #c8ded3;border-top-color:#1f5f4a;animation:dcSpin .75s linear infinite}
.dc-ld span{font:600 15px Manrope,sans-serif;color:#5e6862}
@keyframes dcLdOut{to{opacity:0;visibility:hidden}}
@keyframes dcSpin{to{transform:rotate(360deg)}}
@keyframes dcIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.dc-rv{animation:dcIn .55s cubic-bezier(.22,.8,.24,1) both}
.dc-rv.dc-rvf{animation-name:dcFade}
@keyframes dcFade{from{opacity:0}}
</style>
</helmet>
<!-- Снимок страницы ${esc(route)} с shalom.bookingrobot.eu — макет совпадает с сайтом -->
<div class="dc-ld" aria-hidden="true"><i></i><span>Загружаем…</span></div>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1280,"height":${h}}}'>
${logic || 'class Component extends DCLogic {\n  renderVals() {\n    return {};\n  }\n}'}
</script>
</body>
</html>
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const sizes = {};
  for (const bd of BOARDS) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + bd.route, { waitUntil: 'networkidle' });
    if (bd.setup) await bd.setup(p);
    await p.waitForTimeout(250);
    if (await p.$('.step-row')) {
      await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(450);
    }
    if (bd.search) await searchBand(p, bd.search);
    if (bd.links) await linkButtons(p, bd.links);
    await p.evaluate(MARK_REVEAL);
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
          Array.from(s.options).forEach((o) =>
            o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'),
          ),
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
    const doc = docFor(bd.title, bd.route, out, h);
    fs.writeFileSync(path.join(OUT, bd.file), doc);
    sizes[bd.file] = { h, title: bd.title, state: !!bd.state, interactive: !!(bd.search || bd.links) };
    console.log(bd.file, h, errs.length ? 'ERR ' + errs.join(';') : '');
    await ctx.close();
  }
  await buildInteractive(b, sizes);
  await buildHotel(b, sizes);
  await buildHotel(b, sizes, 'Hotel-grand.dc.html', '/hotel?h=grand-spa-lietuva');
  await buildHotel(b, sizes, 'Hotel-belorus.dc.html', '/hotel?h=belorus');
  fs.writeFileSync(path.join(OUT, 'sizes.json'), JSON.stringify(sizes, null, 1));
  await b.close();
})();

/* ---------- Main and Results boards that work in Play ---------- */
async function grab(b, route, setup, fn, arg) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + route, { waitUntil: 'networkidle' });
  if (setup) await setup(p);
  await p.waitForTimeout(200);
  await p.evaluate(MARK_REVEAL);
  await p.addScriptTag({ content: IA.HELPERS });
  const r = await p.evaluate(fn, arg);
  await ctx.close();
  return r;
}

const CAL_RAWS = {
  roomline: IA.ROOMLINE,
  'tabs-start': '<sc-if value="{{tabsOn}}" hint-placeholder-val="{{true}}">',
  'tabs-end': '</sc-if>',
  'exact-start': '<sc-if value="{{calExact}}" hint-placeholder-val="{{true}}">',
  'exact-end': '</sc-if>',
  'foot-start': '<sc-if value="{{calExact}}" hint-placeholder-val="{{true}}">',
  'foot-end': '</sc-if>',
  calnote: IA.CALNOTE,
  cells: IA.CELLS,
  cells2: IA.CELLS.replace('{{cells}}', '{{cells2}}'),
};
/** flexible dates sit after the exact calendar; on Main an option links to the results board */
const calRawsFor = (isMain) => ({
  ...CAL_RAWS,
  'exact-end': '</sc-if><sc-if value="{{calFlex}}" hint-placeholder-val="{{false}}">' + IA.FLEX(isMain) + '</sc-if>',
});
const wrapIf = (cond, html) => `<sc-if value="{{${cond}}}" hint-placeholder-val="{{false}}">${html}</sc-if>`;

/** the "Помогите выбрать" wizard, 3 questions + answer; on Main the answer links to the results board */
async function wizardRaws(b, toResults) {
  const wz = [];
  for (let step = 1; step <= 4; step++) {
    wz.push(
      await grab(
        b,
        '/results',
        async (p) => {
          await p.click('text=Помогите выбрать санаторий');
          const answers = [
            '.wz-opt:has-text("Спина и суставы")',
            '.wz-opt:has-text("нужен лифт")',
            '.wz-opt:has-text("До 1 000")',
          ];
          for (let i = 0; i < step - 1; i++) await p.click(answers[i]);
        },
        (toResults) => {
          const d = window.__dc;
          const o = document.querySelector('.wz-overlay');
          o.querySelectorAll('.wz-opt').forEach((x) => d.on(x, 'click', 'wzNext'));
          d.on(o.querySelector('.wz-head .wz-close'), 'click', 'wzClose');
          d.on(o.querySelector('.wz-back'), 'click', 'wzBack');
          o.querySelectorAll('.wz-show').forEach((x) => {
            if (!toResults) return d.on(x, 'click', 'wzClose');
            const a = document.createElement('a');
            a.className = x.className;
            a.setAttribute('href', 'Results-B.dc.html');
            a.setAttribute('style', 'text-decoration:none');
            a.textContent = x.textContent;
            x.replaceWith(a);
          });
          const foot = o.querySelectorAll('.wz-foot .btn');
          if (foot.length) {
            d.on(foot[0], 'click', 'wzRestart');
            d.on(foot[1], 'click', 'wzClose');
          }
          return o.outerHTML;
        },
        toResults,
      ),
    );
  }
  return wz.map((h, i) => wrapIf('wz' + (i + 1), IA.finish(post(h), {}))).join('');
}

async function buildInteractive(b, sizes) {
  for (const route of ['/', '/results']) {
    const isMain = route === '/';
    let filterCfg = null;
    const file = isMain ? 'Main.dc.html' : 'Results-B.dc.html';
    const cal = IA.finish(
      post(
        await grab(
          b,
          route,
          (p) => p.click('#datein'),
          () => window.__dc.markCal(document.querySelector('[role="dialog"]')),
        ),
      ),
      calRawsFor(isMain),
    );
    const gpop = IA.finish(
      post(
        await grab(
          b,
          route,
          (p) => p.click('#guests'),
          () => window.__dc.markGuests(document.querySelector('.gp-pop')),
        ),
      ),
      {},
    );
    const raws = {
      glabel: IA.GLABEL,
      gotip: IA.GOTIP,
      // home: the resort and the dates start empty, a bubble shows what to fill next
      ...(isMain ? { ...IA.GUIDE } : {}),
      gpop: wrapIf('gOpen', gpop),
      calmodal: wrapIf('calOpen', cal),
    };
    // the same search card on both boards: «Курорт или санаторий» opens its list
    // (home: a pick fills the field and the bubble moves on; results: a pick opens the results)
    let cityLabels = [];
    {
      const list = post(
        await grab(
          b,
          route,
          (p) => p.click('#city'),
          (isMain) => {
            const ul = document.querySelector('.ps-list');
            ul.querySelectorAll('li').forEach((li, i) => {
              if (isMain) {
                li.removeAttribute('aria-selected');
                li.className = 'ps-opt';
                li.style.cursor = 'pointer';
                return window.__dc.on(li, 'click', 'pickCity' + i);
              }
              const a = document.createElement('a');
              a.href = '/results';
              a.style.cssText = 'display:flex;flex-direction:column;text-decoration:none;color:inherit';
              a.innerHTML = li.innerHTML;
              li.innerHTML = '';
              li.appendChild(a);
            });
            return ul.outerHTML;
          },
          isMain,
        ),
      );
      cityLabels = [...list.matchAll(/<strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
      raws.slist = wrapIf('sOpen', IA.finish(list, {}));
    }
    if (isMain) {
      // "Не знаете, какой санаторий выбрать?" opens the 3-question wizard right here
      raws.wizard = await wizardRaws(b, true);
      // resort story pop-ups
      const resIds = ['druskininkai', 'birstonas', 'palanga', 'anyksciai'];
      let resHtml = '';
      for (let i = 0; i < resIds.length; i++) {
        const h = await grab(
          b,
          route,
          (p) => p.click('[data-resort="' + resIds[i] + '"]'),
          (i) => {
            const d = window.__dc;
            const o = document.querySelector('.rs-overlay');
            o.querySelectorAll('.rs-close, .rs-close-b').forEach((x) => d.on(x, 'click', 'closeRes'));
            o.querySelectorAll('.rs-tabs button').forEach((t, j) => {
              d.on(t, 'click', 'openRes' + j);
              t.removeAttribute('aria-selected');
            });
            d.on(o.querySelector('.rs-go'), 'click', 'chooseRes' + i);
            return o.outerHTML;
          },
          i,
        );
        resHtml += wrapIf('resOn' + i, IA.finish(post(h), {}));
      }
      raws.resorts = resHtml;
    } else {
      raws.wizard = await wizardRaws(b, false);
      const cmp = await grab(
        b,
        route,
        async (p) => {
          const c = await p.$$('.cmp-check input');
          await c[0].check();
          await c[1].check();
          await p.click('text=/Сравнить \\(2\\)/');
        },
        () => {
          const d = window.__dc;
          const bar = document.querySelector('.cmp-bar');
          const bb = bar.querySelectorAll('.cmp-btn');
          d.on(bb[0], 'click', 'cmpClear');
          d.on(bb[1], 'click', 'cmpOpen');
          bb[1].removeAttribute('disabled');
          const ov = document.querySelector('.cmp-overlay');
          d.on(ov.querySelector('.cmp-head .cmp-btn'), 'click', 'cmpClose');
          ov.querySelectorAll('.cmp-x').forEach((x) => d.on(x, 'click', 'cmpClose'));
          return { bar: bar.outerHTML, ov: ov.outerHTML };
        },
      );
      raws.cmp = wrapIf('cmpAny', IA.finish(post(cmp.bar), {})) + wrapIf('cmpDlg', IA.finish(post(cmp.ov), {}));
      const price = await grab(
        b,
        route,
        (p) => p.click('text=Когда дешевле? >> nth=0'),
        () => {
          const d = window.__dc;
          const dlg = document.querySelector('[role="dialog"]');
          dlg
            .querySelectorAll('button[aria-label="Закрыть"], .acc, .btn-primary')
            .forEach((x) => d.on(x, 'click', 'priceClose'));
          return d.fixedRoot(dlg).outerHTML;
        },
      );
      raws.price = wrapIf('priceOn', IA.finish(post(price), {}));
      // filter panel, closed "more" and open "more"
      const panel = async (more, keys) =>
        grab(
          b,
          route,
          async (p) => {
            await p.click('.f-btn');
            if (more) await p.click('.morebtn');
          },
          ({ more, keys }) => {
            const d = window.__dc;
            const sec = Array.from(document.querySelectorAll('section')).find(
              (x) => x.querySelector('button.acc') && /Свернуть/.test(x.textContent),
            );
            const accs = sec.querySelectorAll('button.acc');
            d.on(accs[0], 'click', 'fClose');
            if (more) d.on(accs[1], 'click', 'fMoreT');
            else d.on(sec.querySelector('.morebtn'), 'click', 'fMoreT');
            sec.querySelectorAll('.btn-primary').forEach((x) => {
              d.on(x, 'click', 'fApply');
              d.text(x, 'applyLabel');
            });
            Array.from(sec.querySelectorAll('span'))
              .filter((x) => /^(Выбрано \d|Условия не выбраны)/.test(x.textContent.trim()) && !x.children.length)
              .forEach((x) => d.text(x, 'pendCount'));
            Array.from(sec.querySelectorAll('button'))
              .filter((x) => /Сбросить/.test(x.textContent))
              .forEach((x) => d.on(x, 'click', 'fReset'));
            sec.querySelectorAll('input[type="number"]').forEach((i) => i.removeAttribute('value'));
            const found = [];
            sec.querySelectorAll('input[type="checkbox"]').forEach((inp) => {
              const lab = inp.closest('label');
              const k = lab.textContent.trim();
              found.push({ k, on: inp.checked, base: lab.className.replace(/\bon\b/, '').trim() });
              const i = keys ? keys.indexOf(k) : -1;
              if (i >= 0) {
                d.on(inp, 'change', 'fT' + i);
                d.attr(inp, 'checked', 'fOn' + i);
                d.attr(lab, 'class', 'fCls' + i);
              }
            });
            const groups = [];
            sec.querySelectorAll('.qf-opts').forEach((g, gi) => {
              const chips = g.querySelectorAll('.qf-chip');
              groups.push({ n: chips.length, one: /Любое/.test(chips[0].textContent) });
              chips.forEach((c, ci) => {
                d.on(c, 'click', 'qf' + gi + '_' + ci);
                d.attr(c, 'class', 'qfc' + gi + '_' + ci);
                c.removeAttribute('aria-pressed');
                if (!groups[gi].one) c.textContent = c.textContent.replace(/^✓\s*/, '');
              });
            });
            return { html: sec.outerHTML, found, groups };
          },
          { more, keys },
        );
      const probe = await panel(true, null);
      const fkeys = probe.found.map((x) => x.k);
      const pClosed = await panel(false, fkeys);
      const pOpen = await panel(true, fkeys);
      raws['fclosed-start'] = '<sc-if value="{{fClosedV}}" hint-placeholder-val="{{true}}">';
      raws['fclosed-end'] =
        '</sc-if><sc-if value="{{fOpenV}}" hint-placeholder-val="{{false}}">' +
        wrapIf('fMoreOff', IA.finish(post(pClosed.html), {})) +
        wrapIf('fMoreOn', IA.finish(post(pOpen.html), {})) +
        '</sc-if>';
      const FG = DATA.FILTER_GROUPS;
      const labels = {};
      Object.values(FG).forEach((g) => g.forEach((e) => (labels[e[0]] = e[1])));
      const keyOfLabel = (t) => {
        const hit = Object.values(FG)
          .flat()
          .filter((e) => t.startsWith(e[1]))
          .sort((a, b) => b[1].length - a[1].length)[0];
        return hit ? hit[0] : '';
      };
      const groupKeys = [FG.meals, FG.procs, FG.room].map((g) => g.map((e) => e[0]));
      // hotels in list order (the base page is captured with no filters, so all of them)
      const order = await grab(
        b,
        route,
        (p) => p.click('text=Сбросить всё'),
        () => Array.from(document.querySelectorAll('article[id^="h-"]')).map((a) => a.id.slice(2)),
      );
      filterCfg = {
        fkeys: fkeys.map(keyOfLabel),
        bases: probe.found.map((x) => x.base),
        init: probe.found.map((x) => x.on),
        groups: probe.groups.map((g, gi) => ({ ...g, keys: g.one ? [''].concat(groupKeys[gi]) : groupKeys[gi] })),
        hotels: order.map((id) => {
          const h = DATA.SANATORIUMS.find((x) => x.id === id);
          return { tags: h.tags, stars: h.starsN };
        }),
        labels,
        order,
      };
      // the "Выбрано:" row with removable chips
      raws.actrow = await grab(b, route, null, () => {
        const d = window.__dc;
        const lab = Array.from(document.querySelectorAll('span')).find((x) => x.textContent.trim() === 'Выбрано:');
        const row = lab.parentElement;
        const chips = Array.from(row.querySelectorAll('button')).filter((x) => !/Сбросить/.test(x.textContent));
        const first = chips[0];
        chips.slice(1).forEach((x) => x.remove());
        d.on(first, 'click', 'a.off');
        first.firstChild.textContent = '\u27E6a.t\u27E7';
        first.before(d.raw('actfor-start'));
        first.after(d.raw('actfor-end'));
        Array.from(row.querySelectorAll('button'))
          .filter((x) => /Сбросить/.test(x.textContent))
          .forEach((x) => d.on(x, 'click', 'fResetAll'));
        return row.outerHTML;
      });
      raws.actrow = wrapIf(
        'hasActive',
        IA.finish(post(raws.actrow), {
          'actfor-start': '<sc-for list="{{activeList}}" as="a" hint-placeholder-count="2">',
          'actfor-end': '</sc-for>',
        }),
      );
    }
    // Results: every sanatorium's rooms open (as in the base below); a room photo opens its gallery
    const openAll = async (p) => {
      await p.click('text=Сбросить всё');
      for (const bt of await p.$$('article[id^="h-"] button[aria-expanded="false"]')) await bt.click();
      await p.waitForTimeout(1600);
    };
    const rg = isMain ? { roomPics: [], rgHtml: '' } : await roomGallery(b, route, openAll);
    raws.roomgal = rgRaw(rg.rgHtml);
    // the page itself, with fields wired to the logic (Results: all sanatoriums, filters applied by the logic)
    const base = await grab(
      b,
      route,
      isMain ? null : openAll,
      (isMain) => {
        const d = window.__dc;
        ['#datein', '#dateout'].forEach((s, i) => {
          const el = document.querySelector(s);
          if (isMain) {
            // empty until chosen: «Выберите дату»
            el.innerHTML = '';
            el.appendChild(d.raw(i ? 'outtext' : 'intext'));
            d.attr(el.closest('.sf'), 'class', 'sfDatesCls');
          } else d.text(el, i ? 'outLabel' : 'inLabel');
          d.on(el, 'click', 'openCal');
        });
        if (isMain) {
          document.querySelectorAll('.search .go-tip').forEach((t) => t.remove());
          const dest = document.querySelector('.search .sf-dest');
          dest.querySelector('.sf-at').prepend(d.raw('tipplace'));
          d.attr(dest, 'class', 'sfPlaceCls');
          document.querySelector('#datein').parentElement.prepend(d.raw('tipdates'));
          // «Найти санаторий»: a link to the results once all is chosen, before that it opens what is missing
          const go = document.querySelector('.search .search-go');
          d.attr(go, 'class', 'goCls');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = go.textContent;
          d.attr(btn, 'class', 'goCls');
          d.on(btn, 'click', 'findGap');
          const mid = d.raw('gr-mid');
          const end = d.raw('gr-end');
          go.before(d.raw('gr-start'));
          go.after(mid);
          mid.after(btn);
          btn.after(end);
        }
        const g = document.querySelector('#guests');
        g.innerHTML = '';
        g.appendChild(d.raw('glabel'));
        d.on(g, 'click', 'openGuests');
        g.parentElement.appendChild(d.raw('gpop'));
        const page = document.querySelector('#root .page');
        const goBox = document.querySelector('.search .sf-go');
        if (goBox) goBox.prepend(d.raw('gotip'));
        const city = document.querySelector('#city');
        d.on(city, 'click', 'openSearch');
        city.after(d.raw('slist'));
        d.attr(city, 'value', 'cityLabel');
        if (isMain) {
          document.querySelectorAll('.wz-link, .choose-btn').forEach((x) => d.on(x, 'click', 'wzOpen'));
          document.querySelectorAll('[data-resort]').forEach((x, i) => d.on(x, 'click', 'openRes' + i));
          page.appendChild(d.raw('resorts'));
          page.appendChild(d.raw('wizard'));
          document.querySelectorAll('.ps-chip').forEach((c) => {
            const a = document.createElement('a');
            a.className = c.className;
            a.href = '/results';
            a.style.cssText = 'display:inline-flex;align-items:center;text-decoration:none';
            a.textContent = c.textContent;
            c.replaceWith(a);
          });
        } else {
          const btns = Array.from(document.querySelectorAll('button'));
          btns
            .filter((x) => /Помогите выбрать санаторий/.test(x.textContent))
            .forEach((x) => d.on(x, 'click', 'wzOpen'));
          btns.filter((x) => /Выбрать другие даты/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'openRoomCal'));
          btns.filter((x) => /Когда дешевле\?/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'priceOpen'));
          // «нет мест на ваши даты»: «Свяжитесь со мной» opens the form board
          btns
            .filter((x) => /Свяжитесь со мной/.test(x.textContent) && x.closest('article'))
            .forEach((x) => {
              const a = document.createElement('a');
              a.className = x.className;
              a.href = 'Help.dc.html';
              a.innerHTML = x.innerHTML;
              a.setAttribute('style', (x.getAttribute('style') || '') + ';text-decoration:none');
              x.replaceWith(a);
            });
          // "Фильтры" (next to the wizard button) opens / closes the panel in place (see filtersLogic)
          const fb = document.querySelector('.f-btn');
          d.on(fb, 'click', 'fToggle');
          d.attr(fb, 'class', 'fBtnCls');
          d.text(fb.querySelector('.f-badge'), 'fBadge');
          const slot = document.querySelector('.f-slot');
          slot.before(d.raw('fclosed-start'));
          slot.after(d.raw('fclosed-end'));
          slot.remove();
          document.querySelectorAll('.cmp-check input').forEach((x, i) => {
            d.on(x, 'change', 'cmpT' + i);
            d.attr(x, 'checked', 'cmpOn' + i);
          });
          // filter state shown on the page
          d.attr(fb, 'title', 'appliedSummary');
          const h2 = Array.from(document.querySelectorAll('h2')).find((x) =>
            /^(Все \d|Подходят \d)/.test(x.textContent.trim()),
          );
          d.text(h2, 'foundLabel');
          h2.parentElement.before(d.raw('actrow'));
          document.querySelectorAll('article[id^="h-"]').forEach((a, i) => {
            // «Номера и программы» opens and folds this sanatorium's rooms in Play
            const box = a.querySelector('.rooms-reveal');
            const btn = a.querySelector('button[aria-expanded]');
            if (box) {
              box.className = 'rooms-reveal';
              // the cheapest free room gets the bubble of the sanatorium opened last (see LOGIC rt*)
              box.querySelectorAll('.next-tip').forEach((t) => t.remove());
              const cheap = box.querySelector('[data-cheapest]');
              if (cheap) {
                cheap.before(d.raw('rtip-' + i));
                d.attr(cheap, 'class', 'rtCls' + i);
              }
              box.before(d.raw('ro-start-' + i));
              box.after(d.raw('ro-end'));
            }
            if (btn) {
              btn.removeAttribute('aria-expanded');
              d.on(btn, 'click', 'roT' + i);
              d.attr(btn, 'class', 'roCls' + i);
              const t = Array.from(btn.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
              if (t) t.textContent = '\u27E6roLbl' + i + '\u27E7';
              const svg = btn.querySelector('svg');
              if (svg) d.attr(svg, 'style', 'roChev' + i);
              // the next step after the search: the bubble over the first sanatorium's button
              if (i === 0) btn.before(d.raw('rmtip'));
            }
            a.before(d.raw('hv-start-' + i));
            a.after(d.raw('hv-end'));
          });
          document.querySelector('.help-strip-band').before(d.raw('cmp'));
          document.querySelectorAll('.rc-photo').forEach((x, i) => d.on(x, 'click', 'rgOpen' + i));
          page.appendChild(d.raw('roomgal'));
          page.appendChild(d.raw('wizard'));
          page.appendChild(d.raw('price'));
        }
        page.appendChild(d.raw('calmodal'));
        return document.getElementById('root').innerHTML;
      },
      isMain,
    );
    if (filterCfg) {
      filterCfg.order.forEach(
        (_, i) => (raws['hv-start-' + i] = '<sc-if value="{{hv' + i + '}}" hint-placeholder-val="{{true}}">'),
      );
      raws['hv-end'] = '</sc-if>';
      filterCfg.order.forEach(
        (_, i) => (raws['ro-start-' + i] = '<sc-if value="{{ro' + i + '}}" hint-placeholder-val="{{false}}">'),
      );
      raws['ro-end'] = '</sc-if>';
      raws.rmtip = IA.RMTIP;
      filterCfg.order.forEach((_, i) => (raws['rtip-' + i] = IA.RTIP(i)));
    }
    const body = IA.finish(post(base), raws);
    const left = body.match(/\u27E6|data-dc-|<dc-raw/g);
    if (left) console.warn(file, 'unconverted markers:', left.length);
    const h = sizes[file].h;
    let logic = filterCfg ? IA.filtersLogic(filterCfg) : isMain ? IA.mainLogic(cityLabels) : IA.LOGIC;
    if (!isMain && rg.roomPics.length)
      logic =
        logic.replace('class Component extends DCLogic', 'class ResBase extends DCLogic') +
        `
class Component extends ResBase {
  constructor(props) {
    super(props);
    Object.assign(this.state, { rg: -1, rgI: 0 });
  }
  renderVals() {
    const v = super.renderVals(), st = this.state;${rgLogic(rg.roomPics)}
    return v;
  }
}`;
    fs.writeFileSync(path.join(OUT, file), docFor(sizes[file].title, route, body, h, logic));
    console.log(file, 'interactive', body.length);
  }
}

/* ---------- a room photo opens the room's mini gallery (Hotel and Results boards) ---------- */
async function roomGallery(b, route, setup) {
  const rooms = await grab(b, route, setup, async () => {
    const out = [];
    const btns = Array.from(document.querySelectorAll('.rc-photo'));
    for (const bt of btns) {
      bt.click();
      await new Promise((r) => setTimeout(r, 150));
      const g = document.querySelector('.rg');
      const thumbs = Array.from(g.querySelectorAll('.rg-thumb img'));
      const main = g.querySelector('.rg-img');
      out.push({
        title: g.querySelector('.rg-title strong').textContent,
        photos: thumbs.length
          ? thumbs.map((t, k) => ({
              src: t.getAttribute('src'),
              alt: g
                .querySelectorAll('.rg-thumb')
                [k].getAttribute('aria-label')
                .replace(/^Фото \d+: /, ''),
            }))
          : [{ src: main.getAttribute('src'), alt: main.getAttribute('alt') }],
      });
      g.querySelector('.rg-close').click();
      await new Promise((r) => setTimeout(r, 80));
    }
    return out;
  });
  const rgHtml = rooms.length
    ? await grab(
        b,
        route,
        async (p) => {
          if (setup) await setup(p);
          await p.click('.rc-photo >> nth=0');
        },
        () => {
          const d = window.__dc;
          const o = document.querySelector('.rg-overlay');
          d.text(o.querySelector('.rg-title strong'), 'rgTitle');
          d.text(o.querySelector('.rg-title span'), 'rgLine');
          const img = o.querySelector('.rg-img');
          d.attr(img, 'src', 'rgSrc');
          d.attr(img, 'alt', 'rgAlt');
          d.on(o.querySelector('.rg-close'), 'click', 'rgClose');
          d.on(o.querySelector('.rg-prev'), 'click', 'rgPrev');
          d.on(o.querySelector('.rg-next'), 'click', 'rgNext');
          const th = o.querySelector('.rg-thumbs');
          if (th) {
            th.innerHTML = '';
            th.appendChild(d.raw('rgthumbs'));
          }
          return o.outerHTML;
        },
      )
    : '';
  const blob = (u) => String(u || '').replace(/^\/img\/([0-9a-f]{32})\.[a-z]+$/, '/_blob/$1');
  const roomPics = rooms.map((r) => ({
    title: r.title,
    photos: r.photos.map((x) => ({ src: blob(x.src), alt: x.alt })),
  }));
  return { roomPics, rgHtml };
}

/** the gallery pop-up, shown while a room's photos are open */
const rgRaw = (rgHtml) =>
  rgHtml
    ? '<sc-if value="{{rgOn}}" hint-placeholder-val="{{false}}">' +
      IA.finish(post(rgHtml), {
        rgthumbs:
          '<sc-for list="{{rgThumbs}}" as="t" hint-placeholder-count="4"><button type="button" class="{{t.cls}}" onClick="{{t.pick}}"><img src="{{t.src}}" alt=""></button></sc-for>',
      }) +
      '</sc-if>'
    : '';

/** board logic: open / browse / close a room's photos (inside renderVals, with v and st) */
const rgLogic = (roomPics) => `
    const ROOMS = ${JSON.stringify(roomPics)};
    const r = ROOMS[st.rg], pics = r ? r.photos : [], k = pics.length ? ((st.rgI % pics.length) + pics.length) % pics.length : 0;
    ROOMS.forEach((_, i) => (v['rgOpen' + i] = () => this.setState({ rg: i, rgI: 0 })));
    Object.assign(v, {
      rgOn: !!r, rgTitle: r ? r.title : '', rgSrc: pics[k] ? pics[k].src : '', rgAlt: pics[k] ? pics[k].alt : '',
      rgLine: r ? (k + 1) + ' из ' + pics.length + ' · ' + (pics[k] ? pics[k].alt : '') : '',
      rgThumbs: pics.map((p, j) => ({ src: p.src, cls: 'rg-thumb' + (j === k ? ' on' : ''), pick: () => this.setState({ rgI: j }) })),
      rgPrev: () => this.setState({ rgI: k - 1 }), rgNext: () => this.setState({ rgI: k + 1 }), rgClose: () => this.setState({ rg: -1 }),
    });`;

/* ---------- Hotel board: the photo gallery opens in Play ---------- */
/** Sanatorium boards: gallery lightbox, guests pop-over and the working tabs. */
async function buildHotel(b, sizes, file = 'Hotel-B.dc.html', route = '/hotel') {
  if (!sizes[file]) return;
  const lb = await grab(
    b,
    route,
    (p) => p.click('button[aria-label="Все фото"]'),
    () => {
      const d = window.__dc;
      const over = Array.from(document.querySelectorAll('div')).find(
        (x) => getComputedStyle(x).position === 'fixed' && x.querySelectorAll('img').length > 1,
      );
      over.querySelectorAll('button').forEach((x) => {
        if (/Закрыть|✕|←|Назад/.test(x.textContent) || x.getAttribute('aria-label') === 'Закрыть')
          d.on(x, 'click', 'lbClose');
      });
      return over.outerHTML;
    },
  );
  const { roomPics, rgHtml } = await roomGallery(b, route, null);
  // guests chip in the "Ваши даты" bar opens the same +/− pop-over as the search
  const gpop = await grab(
    b,
    route,
    (p) => p.click('#guests'),
    () => window.__dc.markGuests(document.querySelector('.gp-pop')),
  );
  // «Изменить даты · когда дешевле?» opens the same calendar as on windows 1–2
  const cal = IA.finish(
    post(
      await grab(
        b,
        route,
        (p) => p.click('text=Изменить даты · когда дешевле?'),
        () => {
          const dlg = document.querySelector('[role="dialog"]');
          dlg.querySelector('.cal-price')?.remove();
          return window.__dc.markCal(dlg);
        },
      ),
    ),
    calRawsFor(false),
  );
  // content of the other tabs
  const TABS = ['treat', 'food', 'about', 'reviews'];
  const tabHtml = {};
  for (const k of TABS) {
    tabHtml[k] = await grab(
      b,
      route,
      (p) => p.click('.ht-tabs button >> nth=' + (TABS.indexOf(k) + 1)),
      () => {
        const d = window.__dc;
        const box = document.querySelector('.ht').parentElement;
        box.querySelectorAll('.ht-cta .btn').forEach((x) => d.on(x, 'click', 'tab_rooms'));
        box.querySelectorAll('.ht-photos button').forEach((x) => d.on(x, 'click', 'lbOpen'));
        return box.outerHTML;
      },
    );
  }
  const base = await grab(b, route, null, () => {
    const d = window.__dc;
    const gal = document.querySelector('button[aria-label="Все фото"]').parentElement;
    gal.querySelectorAll(':scope > button').forEach((x) => d.on(x, 'click', 'lbOpen'));
    document.querySelectorAll('.ht-reviews-link').forEach((x) => d.on(x, 'click', 'tab_reviews'));
    document.querySelectorAll('.rc-photo').forEach((x, i) => d.on(x, 'click', 'rgOpen' + i));
    const g = document.querySelector('#guests');
    if (g) {
      d.on(g, 'click', 'openGuests');
      d.text(g.querySelector('.gp-inline-t strong'), 'gLabel');
      g.after(d.raw('gpop'));
    }
    const keys = ['rooms', 'treat', 'food', 'about', 'reviews'];
    document.querySelectorAll('.ht-tabs button').forEach((x, i) => {
      d.on(x, 'click', 'tab_' + keys[i]);
      d.attr(x, 'class', 'tabCls_' + keys[i]);
      x.removeAttribute('aria-current');
    });
    // «Ваши даты» follow the calendar
    const calBtn = Array.from(document.querySelectorAll('button')).find((x) => /Изменить даты/.test(x.textContent));
    if (calBtn) {
      d.on(calBtn, 'click', 'openCal');
      const bar = calBtn.parentElement;
      const range = bar.querySelector('strong');
      if (range) d.text(range, 'hbRange');
      const nights = bar.querySelector('.hb-nights');
      if (nights) d.text(nights, 'hbNights');
    }
    const nav = document.querySelector('.ht-tabs');
    const rooms = nav.nextElementSibling.firstElementChild;
    rooms.before(d.raw('rooms-start'));
    rooms.after(d.raw('rooms-end'));
    document.querySelector('#root .page').appendChild(d.raw('lightbox'));
    document.querySelector('#root .page').appendChild(d.raw('roomgal'));
    document.querySelector('#root .page').appendChild(d.raw('calmodal'));
    return document.getElementById('root').innerHTML;
  });
  const ifs = (k, html) => `<sc-if value="{{tabOn_${k}}}" hint-placeholder-val="{{false}}">${html}</sc-if>`;
  const body = IA.finish(post(base), {
    lightbox: '<sc-if value="{{lbOn}}" hint-placeholder-val="{{false}}">' + IA.finish(post(lb), {}) + '</sc-if>',
    gpop: '<sc-if value="{{gOpen}}" hint-placeholder-val="{{false}}">' + IA.finish(post(gpop), {}) + '</sc-if>',
    calmodal: wrapIf('calOpen', cal),
    roomgal: rgRaw(rgHtml),
    'rooms-start': '<sc-if value="{{tabOn_rooms}}" hint-placeholder-val="{{true}}">',
    'rooms-end': '</sc-if>' + TABS.map((k) => ifs(k, IA.finish(post(tabHtml[k]), {}))).join(''),
  });
  // the board's own state (photos, tabs, guests) on top of the shared calendar logic
  const logic =
    IA.LOGIC.replace('class Component extends DCLogic', 'class CalBase extends DCLogic') +
    `
class Component extends CalBase {
  constructor(props) {
    super(props);
    Object.assign(this.state, { lb: false, tab: 'rooms', rg: -1, rgI: 0 });
  }
  renderVals() {
    const v = super.renderVals();
    const st = this.state, ad = st.ad, ch = st.ch;
    const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const a = new Date(st.inD + 'T00:00:00Z'), b = new Date(st.outD + 'T00:00:00Z');
    const n = Math.round((b - a) / 86400000);
    const same = a.getUTCMonth() === b.getUTCMonth();
    Object.assign(v, {
      lbOn: st.lb, lbOpen: () => this.setState({ lb: true }), lbClose: () => this.setState({ lb: false }),
    });
    // a room's mini gallery (the room photos come from the site)${rgLogic(roomPics)}
    Object.assign(v, {
      gLabel: ad + ' ' + (ad === 1 ? 'взрослый' : 'взрослых') + (ch ? ', ' + ch + ' ' + (ch === 1 ? 'ребёнок' : 'ребёнка') : ''),
      hbRange: (same ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[b.getUTCMonth()]
        : a.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()] + ' – ' + b.getUTCDate() + ' ' + MONTHS[b.getUTCMonth()]) + ' ' + b.getUTCFullYear(),
      hbNights: n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'ночь' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'ночи' : 'ночей'),
    });
    ['rooms', 'treat', 'food', 'about', 'reviews'].forEach((k) => {
      v['tab_' + k] = () => this.setState({ tab: k });
      v['tabOn_' + k] = st.tab === k;
      v['tabCls_' + k] = st.tab === k ? 'on' : '';
    });
    return v;
  }
}`;
  fs.writeFileSync(path.join(OUT, file), docFor(sizes[file].title, route, body, sizes[file].h, logic));
  console.log(file, 'interactive', body.length);
}
