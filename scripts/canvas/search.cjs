/**
 * The two boards with the search card that work in Play — the home page (Main.dc.html) and the
 * results (Results-B.dc.html): the calendar (exact and flexible), guests +/−, the resort list,
 * the «Помогите выбрать» wizard; on the results also the filters, the comparison, the price
 * calendar and every sanatorium's rooms. Each part is captured open on the live site and turned
 * into a template; the board's logic (interactive.cjs) opens and fills it.
 *
 * Parts are found by their data-canvas marks (see find.cjs); inside a part, the script reads the
 * part's own structure (month grids, cells, chips) to put the template holes in.
 */
const IA = require('./interactive.cjs');
const { BROWSER_FIND, act } = require('./find.cjs');
const { fs, path, OUT, DATA, post, docFor, grab: grabRaw, wrapIf } = require('./core.cjs');
const { roomGallery, rgRaw, rgLogic } = require('./gallery.cjs');

const HELP = [IA.HELPERS, BROWSER_FIND];
const grab = (b, route, setup, fn, arg) =>
  grabRaw(b, route, typeof setup === 'function' ? setup : setup ? (p) => act(p, setup) : null, fn, arg, HELP);

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

/** a calendar window captured open (by its data-canvas mark), as a template */
async function calendarRaw(b, route, canvas, isMain, before) {
  return IA.finish(
    post(
      await grab(
        b,
        route,
        async (p) => {
          if (before) await before(p);
          else await act(p, [{ click: { id: 'datein' } }]);
        },
        (canvas) => {
          const dlg = document.querySelector('[data-canvas="' + canvas + '"] [role="dialog"]');
          dlg.querySelector('.cal-price')?.remove();
          return window.__dc.markCal(dlg);
        },
        canvas,
      ),
    ),
    calRawsFor(isMain),
  );
}

const WZ_OPEN = [{ click: { role: 'button', name: 'Помогите выбрать санаторий' } }];
const WZ_ANSWERS = ['Спина и суставы', 'нужен лифт', 'До 1 000'];

/** the "Помогите выбрать" wizard, 3 questions + answer; on Main the answer links to the results board */
async function wizardRaws(b, toResults) {
  const wz = [];
  for (let step = 1; step <= 4; step++) {
    wz.push(
      await grab(
        b,
        '/results',
        [
          ...WZ_OPEN,
          ...WZ_ANSWERS.slice(0, step - 1).map((name) => ({ click: { canvas: 'wizard', role: 'button', name } })),
        ],
        (toResults) => {
          const d = window.__dc;
          const o = document.querySelector('[data-canvas="wizard"]');
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

/** Results: the comparison bar and window (folded and with the identical rows open) */
async function compareRaws(b, route) {
  const open = [
    { check: { canvas: 'results-card', role: 'checkbox', name: 'Сравнить', nth: 0 } },
    { check: { canvas: 'results-card', role: 'checkbox', name: 'Сравнить', nth: 1 } },
    { click: { canvas: 'results-compare', role: 'button', name: 'Сравнить (2)' } },
  ];
  const take = async (same) =>
    grab(
      b,
      route,
      same ? [...open, { click: { canvas: 'compare-dialog', role: 'button', name: 'Одинаково у всех' } }] : open,
      () => {
        const d = window.__dc;
        const bar = document.querySelector('[data-canvas="results-compare"]');
        const bb = window.__find({ canvas: 'results-compare', role: 'button' });
        d.on(bb[0], 'click', 'cmpClear');
        d.on(bb[1], 'click', 'cmpOpen');
        bb[1].removeAttribute('disabled');
        const ov = document.querySelector('[data-canvas="compare-dialog"]');
        window
          .__find({ canvas: 'compare-dialog', role: 'button', name: 'Закрыть' })
          .forEach((x) => d.on(x, 'click', 'cmpClose'));
        window
          .__find({ canvas: 'compare-dialog', role: 'button', name: 'Убрать' })
          .forEach((x) => d.on(x, 'click', 'cmpClose'));
        // «Одинаково у всех (N)» folds and opens the identical rows
        window.__find({ canvas: 'compare-dialog', role: 'button', name: 'одинаков' }).forEach((x) => {
          d.on(x, 'click', 'cmpSameT');
          x.removeAttribute('aria-expanded');
        });
        return { bar: bar.outerHTML, ov: ov.outerHTML };
      },
    );
  const folded = await take(false);
  const all = await take(true);
  return (
    wrapIf('cmpAny', IA.finish(post(folded.bar), {})) +
    wrapIf(
      'cmpDlg',
      wrapIf('cmpSameOff', IA.finish(post(folded.ov), {})) + wrapIf('cmpSameOn', IA.finish(post(all.ov), {})),
    )
  );
}

/** Results: the filter panel — closed «more», open «more»; and the config the filter logic needs */
async function filterRaws(b, route) {
  const panel = async (more, keys) =>
    grab(
      b,
      route,
      [
        { click: { canvas: 'results-head', role: 'button', name: 'Фильтры' } },
        ...(more ? [{ click: { canvas: 'results-filters', role: 'button', name: 'Ещё фильтры' } }] : []),
      ],
      ({ more, keys }) => {
        const d = window.__dc;
        const sec = document.querySelector('[data-canvas="results-filters"]');
        const accs = sec.querySelectorAll('button.acc');
        d.on(accs[0], 'click', 'fClose');
        if (more) d.on(accs[1], 'click', 'fMoreT');
        else
          d.on(window.__find({ canvas: 'results-filters', role: 'button', name: 'Ещё фильтры' })[0], 'click', 'fMoreT');
        sec.querySelectorAll('.btn-primary').forEach((x) => {
          d.on(x, 'click', 'fApply');
          d.text(x, 'applyLabel');
        });
        Array.from(sec.querySelectorAll('span'))
          .filter((x) => /^(Выбрано \d|Условия не выбраны)/.test(x.textContent.trim()) && !x.children.length)
          .forEach((x) => d.text(x, 'pendCount'));
        window
          .__find({ canvas: 'results-filters', role: 'button', name: 'Сбросить' })
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
        sec.querySelectorAll('[role="group"]').forEach((g, gi) => {
          const chips = g.querySelectorAll('button');
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
  const raws = {
    'fclosed-start': '<sc-if value="{{fClosedV}}" hint-placeholder-val="{{true}}">',
    'fclosed-end':
      '</sc-if><sc-if value="{{fOpenV}}" hint-placeholder-val="{{false}}">' +
      wrapIf('fMoreOff', IA.finish(post(pClosed.html), {})) +
      wrapIf('fMoreOn', IA.finish(post(pOpen.html), {})) +
      '</sc-if>',
  };
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
  const order = await grab(b, route, null, () =>
    Array.from(document.querySelectorAll('[data-canvas="results-card"]')).map((a) => a.id.slice(2)),
  );
  const cfg = {
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
  // the "Выбрано:" row with removable chips — it exists only with filters on: open the page with two
  let actrow = await grab(b, route + '?f=daily,doctor', null, () => {
    const d = window.__dc;
    const row = document.querySelector('[data-canvas="results-active"]');
    const chips = Array.from(row.querySelectorAll('button')).filter((x) => !/Сбросить/.test(x.textContent));
    const first = chips[0];
    chips.slice(1).forEach((x) => x.remove());
    d.on(first, 'click', 'a.off');
    first.firstChild.textContent = '⟦a.t⟧';
    first.before(d.raw('actfor-start'));
    first.after(d.raw('actfor-end'));
    window
      .__find({ canvas: 'results-active', role: 'button', name: 'Сбросить' })
      .forEach((x) => d.on(x, 'click', 'fResetAll'));
    return row.outerHTML;
  });
  raws.actrow = wrapIf(
    'hasActive',
    IA.finish(post(actrow), {
      'actfor-start': '<sc-for list="{{activeList}}" as="a" hint-placeholder-count="2">',
      'actfor-end': '</sc-for>',
    }),
  );
  return { raws, cfg };
}

/** the resort story windows of the home page, one per resort */
async function resortRaws(b, route) {
  const resIds = ['druskininkai', 'birstonas', 'palanga', 'anyksciai'];
  let out = '';
  for (let i = 0; i < resIds.length; i++) {
    const h = await grab(
      b,
      route,
      (p) => p.click('[data-resort="' + resIds[i] + '"]'),
      (i) => {
        const d = window.__dc;
        const o = document.querySelector('[data-canvas="resort-modal"]');
        window
          .__find({ canvas: 'resort-modal', role: 'button', name: 'Закрыть' })
          .forEach((x) => d.on(x, 'click', 'closeRes'));
        window.__find({ canvas: 'resort-modal', role: 'tab' }).forEach((t, j) => {
          d.on(t, 'click', 'openRes' + j);
          t.removeAttribute('aria-selected');
        });
        d.on(window.__find({ canvas: 'resort-modal', role: 'button', name: 'Хочу в' })[0], 'click', 'chooseRes' + i);
        return o.outerHTML;
      },
      i,
    );
    out += wrapIf('resOn' + i, IA.finish(post(h), {}));
  }
  return out;
}

/** Results: «Когда дешевле?» — one month of prices */
async function priceRaw(b, route) {
  const price = await grab(
    b,
    route,
    [{ click: { canvas: 'results-card', role: 'button', name: 'Когда дешевле?', nth: 0 } }],
    () => {
      const d = window.__dc;
      const ov = document.querySelector('[data-canvas="results-pricecal"]');
      const dlg = ov.querySelector('[role="dialog"]');
      dlg
        .querySelectorAll('button[aria-label="Закрыть"], .acc, .btn-primary')
        .forEach((x) => d.on(x, 'click', 'priceClose'));
      window
        .__find({ canvas: 'results-pricecal', role: 'button', name: 'Закрыть' })
        .forEach((x) => d.on(x, 'click', 'priceClose'));
      return ov.outerHTML;
    },
  );
  return wrapIf('priceOn', IA.finish(post(price), {}));
}

/** Build Main.dc.html (isMain) or Results-B.dc.html over its static snapshot. */
async function buildSearchPage(b, sizes, bd, isMain) {
  const route = bd.route;
  const file = bd.file;
  let filterCfg = null;
  const cal = await calendarRaw(b, route, isMain ? 'main-calendar' : 'results-calendar', isMain);
  const gpop = IA.finish(
    post(
      await grab(b, route, [{ click: { id: 'guests' } }], () =>
        window.__dc.markGuests(document.querySelector('[data-canvas="guests-pop"]')),
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
  const list = post(
    await grab(
      b,
      route,
      [{ click: { id: 'city' } }],
      (isMain) => {
        const ul = document.querySelector('[data-canvas="place-list"]');
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
  const cityLabels = [...list.matchAll(/<strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
  raws.slist = wrapIf('sOpen', IA.finish(list, {}));
  if (isMain) {
    // «Ответить на 3 вопроса» opens the 3-question wizard right here
    raws.wizard = await wizardRaws(b, true);
    raws.resorts = await resortRaws(b, route);
  } else {
    raws.wizard = await wizardRaws(b, false);
    raws.cmp = await compareRaws(b, route);
    raws.price = await priceRaw(b, route);
    const f = await filterRaws(b, route);
    Object.assign(raws, f.raws);
    filterCfg = f.cfg;
  }
  // Results: every sanatorium's rooms open; a room photo opens its gallery
  const openAll = async (p) => {
    // handles, not locators: a button's name changes once its rooms are open
    const btns = await p
      .locator('[data-canvas="results-card"]')
      .getByRole('button', { name: 'Номера и программы' })
      .elementHandles();
    for (const bt of btns) await bt.click();
    await p.waitForTimeout(1600);
  };
  const rg = isMain ? { roomPics: [], rgHtml: '' } : await roomGallery(b, route, openAll, HELP);
  raws.roomgal = rgRaw(rg.rgHtml);
  // the page itself, with fields wired to the logic (Results: all sanatoriums, filters applied by the logic)
  const base = await grab(
    b,
    route,
    isMain ? null : openAll,
    (isMain) => {
      const d = window.__dc;
      const F = window.__find;
      ['datein', 'dateout'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (isMain) {
          // empty until chosen: «Выберите дату»
          el.innerHTML = '';
          el.appendChild(d.raw(i ? 'outtext' : 'intext'));
          d.attr(el.closest('.sf'), 'class', 'sfDatesCls');
        } else d.text(el, i ? 'outLabel' : 'inLabel');
        d.on(el, 'click', 'openCal');
      });
      const card = document.querySelector('[data-canvas="search-card"]');
      if (isMain) {
        card.querySelectorAll('.go-tip').forEach((t) => t.remove());
        const dest = card.querySelector('.sf-dest');
        dest.querySelector('.sf-at').prepend(d.raw('tipplace'));
        d.attr(dest, 'class', 'sfPlaceCls');
        document.getElementById('datein').parentElement.prepend(d.raw('tipdates'));
        // «Найти санаторий»: a link to the results once all is chosen, before that it opens what is missing
        const go = F({ canvas: 'search-card', role: 'link', name: 'Найти санаторий' })[0];
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
      const g = document.getElementById('guests');
      g.innerHTML = '';
      g.appendChild(d.raw('glabel'));
      d.on(g, 'click', 'openGuests');
      g.parentElement.appendChild(d.raw('gpop'));
      const page = document.querySelector('#root .page');
      const goBox = card.querySelector('.sf-go');
      if (goBox) goBox.prepend(d.raw('gotip'));
      const city = document.getElementById('city');
      d.on(city, 'click', 'openSearch');
      city.after(d.raw('slist'));
      d.attr(city, 'value', 'cityLabel');
      if (isMain) {
        F({ role: 'button', name: 'Ответить на 3 вопроса' }).forEach((x) => d.on(x, 'click', 'wzOpen'));
        document.querySelectorAll('[data-resort]').forEach((x, i) => d.on(x, 'click', 'openRes' + i));
        page.appendChild(d.raw('resorts'));
        page.appendChild(d.raw('wizard'));
        card.querySelectorAll('.ps-chip').forEach((c) => {
          const a = document.createElement('a');
          a.className = c.className;
          a.href = '/results';
          a.style.cssText = 'display:inline-flex;align-items:center;text-decoration:none';
          a.textContent = c.textContent;
          c.replaceWith(a);
        });
      } else {
        F({ role: 'button', name: 'Помогите выбрать санаторий' }).forEach((x) => d.on(x, 'click', 'wzOpen'));
        F({ canvas: 'results-card', role: 'button', name: 'Выбрать другие даты' }).forEach((x) =>
          d.on(x, 'click', 'openRoomCal'),
        );
        F({ canvas: 'results-card', role: 'button', name: 'Когда дешевле?' }).forEach((x) =>
          d.on(x, 'click', 'priceOpen'),
        );
        // «нет мест на ваши даты»: «Свяжитесь со мной» opens the form board
        [
          ...F({ canvas: 'results-card', role: 'button', name: 'Свяжитесь со мной' }),
          ...F({ canvas: 'results-soldout', role: 'button', name: 'Свяжитесь со мной' }),
        ].forEach((x) => {
          const a = document.createElement('a');
          a.className = x.className;
          a.href = 'Help.dc.html';
          a.innerHTML = x.innerHTML;
          a.setAttribute('style', (x.getAttribute('style') || '') + ';text-decoration:none');
          x.replaceWith(a);
        });
        // "Фильтры" (next to the wizard button) opens / closes the panel in place (see filtersLogic)
        const fb = F({ canvas: 'results-head', role: 'button', name: 'Фильтры' })[0];
        d.on(fb, 'click', 'fToggle');
        d.attr(fb, 'class', 'fBtnCls');
        d.text(fb.querySelector('.f-badge'), 'fBadge');
        const slot = document.querySelector('[data-canvas="results-filters-slot"]');
        slot.before(d.raw('fclosed-start'));
        slot.after(d.raw('fclosed-end'));
        slot.remove();
        F({ canvas: 'results-card', role: 'checkbox', name: 'Сравнить' }).forEach((x, i) => {
          d.on(x, 'change', 'cmpT' + i);
          d.attr(x, 'checked', 'cmpOn' + i);
        });
        // filter state shown on the page
        d.attr(fb, 'title', 'appliedSummary');
        const h2 = document.querySelector('[data-canvas="results-list-head"] h2');
        d.text(h2, 'foundLabel');
        h2.parentElement.before(d.raw('actrow'));
        document.querySelectorAll('[data-canvas="results-card"]').forEach((a, i) => {
          // «Номера и программы» opens and folds this sanatorium's rooms in Play
          const box = a.querySelector('[data-canvas="results-rooms"]');
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
            if (t) t.textContent = '⟦roLbl' + i + '⟧';
            const svg = btn.querySelector('svg');
            if (svg) d.attr(svg, 'style', 'roChev' + i);
            // the next step after the search: the bubble over the first sanatorium's button
            if (i === 0) {
              a.querySelectorAll('.next-tip').forEach((t) => !t.closest('[data-canvas="results-rooms"]') && t.remove());
              btn.before(d.raw('rmtip'));
            }
          }
          a.before(d.raw('hv-start-' + i));
          a.after(d.raw('hv-end'));
        });
        document.querySelector('[data-canvas="footer"]').before(d.raw('cmp'));
        F({ canvas: 'room-card', role: 'button', name: 'Смотреть фото номера' }).forEach((x, i) =>
          d.on(x, 'click', 'rgOpen' + i),
        );
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
  const left = body.match(/⟦|data-dc-|<dc-raw/g);
  if (left) console.warn(file, 'unconverted markers:', left.length);
  const h = sizes[file].h;
  let logic = filterCfg ? IA.filtersLogic(filterCfg) : isMain ? IA.mainLogic(cityLabels) : IA.LOGIC;
  if (!isMain)
    // the room galleries and the comparison's «Одинаково у всех» on top of the results logic
    logic =
      logic.replace('class Component extends DCLogic', 'class ResBase extends DCLogic') +
      `
class Component extends ResBase {
  constructor(props) {
    super(props);
    Object.assign(this.state, { rg: -1, rgI: 0, cmpSame: false });
  }
  renderVals() {
    const v = super.renderVals(), st = this.state;${rgLogic(rg.roomPics)}
    Object.assign(v, { cmpSameOn: st.cmpSame, cmpSameOff: !st.cmpSame, cmpSameT: () => this.setState({ cmpSame: !st.cmpSame }) });
    return v;
  }
}`;
  fs.writeFileSync(path.join(OUT, file), docFor(sizes[file].title, route, body, h, logic));
  console.log(file, 'interactive', body.length);
}

module.exports = { buildSearchPage, calendarRaw, calRawsFor };
