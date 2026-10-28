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
  { file: 'Main.dc.html', title: '1 · Главная и поиск', route: '/', search: { city: true } },
  {
    file: 'Results-B.dc.html',
    title: '2 · Результаты (Друскининкай)',
    route: '/results',
    search: { city: false },
    links: [
      ['button', 'Помогите выбрать санаторий', 'Results-wizard.dc.html'],
      ['button', 'Выбрать другие даты', 'Results-roomdates.dc.html'],
      ['button', 'Раскрыть фильтры', 'Results-filters.dc.html'],
    ],
  },
  {
    file: 'Results-filters.dc.html',
    title: 'Результаты · «Уточните выбор» открыт',
    route: '/results',
    state: true,
    setup: async (p) => p.click('text=Раскрыть фильтры'),
    links: [
      ['button', 'Свернуть', 'Results-B.dc.html'],
      ['button', 'Показать', 'Results-B.dc.html'],
    ],
  },
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
    setup: async (p) => p.click('text=Выбрать другие даты'),
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

const post = (html) =>
  html
    .replace(/(src|href)="\/img\/([0-9a-f]{32})\.[a-z]+"/g, '$1="/_blob/$2"')
    .replace(/url\(&quot;\/img\/([0-9a-f]{32})\.[a-z]+&quot;\)/g, 'url(&quot;/_blob/$1&quot;)')
    .replace(/url\(\/img\/([0-9a-f]{32})\.[a-z]+\)/g, 'url(/_blob/$1)')
    .replace(/href="([^"]*)"/g, (_, href) => 'href="' + linkFor(href.replace(/&amp;/g, '&')).replace(/&/g, '&amp;') + '"')
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
</style>
</helmet>
<!-- Снимок страницы ${esc(route)} с shalom.bookingrobot.eu — макет совпадает с сайтом -->
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
    if (bd.search) await searchBand(p, bd.search);
    if (bd.links) await linkButtons(p, bd.links);
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
  cells: IA.CELLS,
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
          const answers = ['.wz-opt:has-text("Спина и суставы")', '.wz-opt:has-text("нужен лифт")', '.wz-opt:has-text("До 1 000")'];
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
      post(await grab(b, route, (p) => p.click('#datein'), () => window.__dc.markCal(document.querySelector('[role="dialog"]')))),
      calRawsFor(isMain),
    );
    const gpop = IA.finish(
      post(await grab(b, route, (p) => p.click('#guests'), () => window.__dc.markGuests(document.querySelector('.gp-pop')))),
      {},
    );
    const raws = { glabel: IA.GLABEL, gpop: wrapIf('gOpen', gpop), calmodal: wrapIf('calOpen', cal) };
    if (isMain) {
      const list = post(
        await grab(b, route, (p) => p.click('#city'), () => {
          const ul = document.querySelector('.ps-list');
          ul.querySelectorAll('li').forEach((li) => {
            const a = document.createElement('a');
            a.href = '/results';
            a.style.cssText = 'display:flex;flex-direction:column;text-decoration:none;color:inherit';
            a.innerHTML = li.innerHTML;
            li.innerHTML = '';
            li.appendChild(a);
          });
          return ul.outerHTML;
        }),
      );
      raws.slist = wrapIf('sOpen', list);
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
            d.on(o.querySelector('.rs-close'), 'click', 'closeRes');
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
          dlg.querySelectorAll('button[aria-label="Закрыть"], .acc, .btn-primary').forEach((x) => d.on(x, 'click', 'priceClose'));
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
            await p.click('text=Раскрыть фильтры');
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
            Array.from(sec.querySelectorAll('button')).filter((x) => /Сбросить/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'fReset'));
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
    // the page itself, with fields wired to the logic (Results: all sanatoriums, filters applied by the logic)
    const base = await grab(b, route, isMain ? null : (p) => p.click('text=Сбросить всё'), (isMain) => {
      const d = window.__dc;
      ['#datein', '#dateout'].forEach((s, i) => {
        const el = document.querySelector(s);
        d.text(el, i ? 'outLabel' : 'inLabel');
        d.on(el, 'click', 'openCal');
      });
      const g = document.querySelector('#guests');
      g.innerHTML = '';
      g.appendChild(d.raw('glabel'));
      d.on(g, 'click', 'openGuests');
      g.parentElement.appendChild(d.raw('gpop'));
      const page = document.querySelector('#root .page');
      if (isMain) {
        const city = document.querySelector('#city');
        d.on(city, 'click', 'openSearch');
        city.after(d.raw('slist'));
        document.querySelectorAll('.wz-link').forEach((x) => d.on(x, 'click', 'wzOpen'));
        document.querySelectorAll('[data-resort]').forEach((x, i) => d.on(x, 'click', 'openRes' + i));
        page.appendChild(d.raw('resorts'));
        d.attr(document.querySelector('#city'), 'value', 'cityLabel');
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
        btns.filter((x) => /Помогите выбрать санаторий/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'wzOpen'));
        btns.filter((x) => /Выбрать другие даты/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'openRoomCal'));
        btns.filter((x) => /Когда дешевле\?/.test(x.textContent)).forEach((x) => d.on(x, 'click', 'priceOpen'));
        // "Раскрыть фильтры" opens the panel in place (see filtersLogic)
        btns
          .filter((x) => /Раскрыть фильтры/.test(x.textContent))
          .forEach((x) => {
            d.on(x, 'click', 'fOpenFn');
            const sec = x.closest('section');
            sec.before(d.raw('fclosed-start'));
            sec.after(d.raw('fclosed-end'));
          });
        document.querySelectorAll('.cmp-check input').forEach((x, i) => {
          d.on(x, 'change', 'cmpT' + i);
          d.attr(x, 'checked', 'cmpOn' + i);
        });
        // filter state shown on the page
        const sum = Array.from(document.querySelectorAll('span')).find((x) => /^(Условия не выбраны|Выбрано:)/.test(x.textContent.trim()) && !x.children.length && x.closest('section'));
        d.text(sum, 'appliedSummary');
        const h2 = Array.from(document.querySelectorAll('h2')).find((x) => /^(Все \d|Подходят \d)/.test(x.textContent.trim()));
        d.text(h2, 'foundLabel');
        h2.parentElement.before(d.raw('actrow'));
        document.querySelectorAll('article[id^="h-"]').forEach((a, i) => {
          a.before(d.raw('hv-start-' + i));
          a.after(d.raw('hv-end'));
        });
        const ask = Array.from(document.querySelectorAll('section')).find((x) => /Задать вопрос/.test(x.textContent));
        ask.after(d.raw('cmp'));
        page.appendChild(d.raw('wizard'));
        page.appendChild(d.raw('price'));
      }
      page.appendChild(d.raw('calmodal'));
      return document.getElementById('root').innerHTML;
    }, isMain);
    if (filterCfg) {
      filterCfg.order.forEach((_, i) => (raws['hv-start-' + i] = '<sc-if value="{{hv' + i + '}}" hint-placeholder-val="{{true}}">'));
      raws['hv-end'] = '</sc-if>';
    }
    const body = IA.finish(post(base), raws);
    const left = body.match(/\u27E6|data-dc-|<dc-raw/g);
    if (left) console.warn(file, 'unconverted markers:', left.length);
    const h = sizes[file].h;
    const logic = filterCfg ? IA.filtersLogic(filterCfg) : IA.LOGIC;
    fs.writeFileSync(path.join(OUT, file), docFor(sizes[file].title, route, body, h, logic));
    console.log(file, 'interactive', body.length);
  }
}
