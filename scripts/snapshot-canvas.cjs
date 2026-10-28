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
  '/flights': 'Flights.dc.html',
  '/payment': 'Payment.dc.html',
  '/done': 'Done.dc.html',
  '/rules': 'Rules.dc.html',
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
  { file: 'Main.dc.html', title: '1 · Главная и поиск', route: '/' },
  { file: 'Results-B.dc.html', title: '2 · Результаты (Друскининкай)', route: '/results' },
  { file: 'Hotel-B.dc.html', title: '3 · Санаторий и выбор номера', route: '/hotel' },
  {
    file: 'Rooms.dc.html',
    title: 'Шаг 1 · Номер и программа',
    route: '/rooms',
    setup: async (p) => p.click('text=Отправить предложение семье'),
  },
  { file: 'Transfer.dc.html', title: 'Шаг 2 · Трансфер', route: '/transfer' },
  { file: 'Guests.dc.html', title: 'Шаг 3 · Данные гостей', route: '/guests' },
  { file: 'Flights.dc.html', title: 'Шаг 4 · Рейсы из Израиля', route: '/flights' },
  { file: 'Payment.dc.html', title: 'Шаг 5 · Оплата', route: '/payment' },
  { file: 'Done.dc.html', title: '🏁 Финиш · Заказ принят', route: '/done' },
  { file: 'Rules.dc.html', title: 'Справка · Условия и отмена', route: '/rules' },
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
  },
  {
    file: 'Results-roomdates.dc.html',
    title: 'Результаты · свободные даты номера',
    route: '/results',
    state: true,
    setup: async (p) => p.click('text=Выбрать другие даты'),
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
      await p.click('.ftog-box');
    },
  },
  {
    file: 'Transfer-package.dc.html',
    title: 'Шаг 2 · Трансфер в пакете с перелётом',
    route: '/results',
    state: true,
    setup: async (p) => {
      await p.click('.ftog-box');
      await p.goto(BASE + '/transfer', { waitUntil: 'networkidle' });
    },
  },
];

const linkFor = (href) => {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  const [p, hash] = href.split('#');
  const route = p.split('?')[0] || '/';
  const f = ROUTE_FILE[route];
  if (!f) return href;
  return f + (hash ? '#' + hash : '');
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

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
    const { html, h } = await p.evaluate(() => {
      // carry live form state into attributes so the snapshot shows it
      document.querySelectorAll('input').forEach((i) => {
        if (i.type === 'checkbox' || i.type === 'radio') {
          if (i.checked) i.setAttribute('checked', '');
          else i.removeAttribute('checked');
        } else if (i.value) i.setAttribute('value', i.value);
      });
      document.querySelectorAll('textarea').forEach((t) => (t.textContent = t.value));
      document.querySelectorAll('select').forEach((s) =>
        Array.from(s.options).forEach((o) => (o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'))),
      );
      const dialog = document.querySelector('[role="dialog"]');
      const bottom = dialog ? dialog.getBoundingClientRect().bottom + window.scrollY + 40 : 0;
      return {
        html: document.getElementById('root').innerHTML,
        h: Math.max(document.documentElement.scrollHeight, Math.ceil(bottom)),
      };
    });
    let out = html
      .replace(/(src|href)="\/img\/([0-9a-f]{32})\.[a-z]+"/g, '$1="/_blob/$2"')
      .replace(/url\(&quot;\/img\/([0-9a-f]{32})\.[a-z]+&quot;\)/g, 'url(&quot;/_blob/$1&quot;)')
      .replace(/url\(\/img\/([0-9a-f]{32})\.[a-z]+\)/g, 'url(/_blob/$1)')
      .replace(/href="([^"]*)"/g, (_, href) => 'href="' + linkFor(href.replace(/&amp;/g, '&')).replace(/&/g, '&amp;') + '"')
      .replace(/\{\{/g, '{&#123;');
    const left = out.match(/\/img\/[^"')\s]+/g);
    if (left) console.warn(bd.file, 'unmapped images:', [...new Set(left)]);
    const doc = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${esc(bd.title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
${css}
</style>
</helmet>
<!-- Снимок страницы ${esc(bd.route)} с shalom.bookingrobot.eu — макет совпадает с сайтом -->
${out}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1280,"height":${h}}}'>
class Component extends DCLogic {
  renderVals() {
    return {};
  }
}
</script>
</body>
</html>
`;
    fs.writeFileSync(path.join(OUT, bd.file), doc);
    sizes[bd.file] = { h, title: bd.title, state: !!bd.state };
    console.log(bd.file, h, errs.length ? 'ERR ' + errs.join(';') : '');
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'sizes.json'), JSON.stringify(sizes, null, 1));
  await b.close();
})();
