/**
 * Sanatorium boards (Hotel-B, Hotel-grand, Hotel-belorus, Hotel-upa) that work in Play: the
 * tabs, the photo lightbox, a room's mini gallery, the guests pop-over, the «Когда дешевле?»
 * calendar and the fold-out rows under the rooms. Parts are found by their data-canvas marks.
 */
const IA = require('./interactive.cjs');
const { BROWSER_FIND, act } = require('./find.cjs');
const { fs, path, OUT, post, docFor, grab: grabRaw, wrapIf } = require('./core.cjs');
const { roomGallery, rgRaw, rgLogic } = require('./gallery.cjs');
const { calendarRaw } = require('./search.cjs');

const HELP = [IA.HELPERS, BROWSER_FIND];
const grab = (b, route, setup, fn, arg) =>
  grabRaw(b, route, Array.isArray(setup) ? (p) => act(p, setup) : setup, fn, arg, HELP);

const TABS = [
  ['treat', 'Лечение'],
  ['food', 'Питание'],
  ['about', 'О санатории'],
  ['reviews', 'Отзывы'],
];

async function buildHotel(b, sizes, bd) {
  const { file, route } = bd;
  if (!sizes[file]) return;
  const lb = await grab(b, route, [{ click: { canvas: 'hotel-gallery', role: 'button', name: 'Все фото' } }], () => {
    const d = window.__dc;
    const over = document.querySelector('[data-canvas="hotel-lightbox"]');
    window
      .__find({ canvas: 'hotel-lightbox', role: 'button', name: 'Закрыть' })
      .forEach((x) => d.on(x, 'click', 'lbClose'));
    return over.outerHTML;
  });
  const { roomPics, rgHtml } = await roomGallery(b, route, null, HELP);
  // guests chip in the "Ваши даты" bar opens the same +/− pop-over as the search
  const gpop = await grab(b, route, [{ click: { id: 'guests' } }], () =>
    window.__dc.markGuests(document.querySelector('[data-canvas="guests-pop"]')),
  );
  // «Изменить даты · когда дешевле?» opens the same calendar as on windows 1–2
  const cal = await calendarRaw(b, route, 'hotel-calendar', false, (p) =>
    act(p, [{ click: { canvas: 'hotel-dates', role: 'button', name: 'Изменить даты' } }]),
  );
  // content of the other tabs
  const tabHtml = {};
  for (const [k, name] of TABS) {
    tabHtml[k] = await grab(b, route, [{ click: { canvas: 'hotel-tabs', role: 'button', name } }], () => {
      const d = window.__dc;
      const box = document.querySelector('[data-canvas="hotel-tab-panel"]');
      window
        .__find({ canvas: 'hotel-tab-panel', role: 'button', name: 'Выбрать номер' })
        .forEach((x) => d.on(x, 'click', 'tab_rooms'));
      window
        .__find({ canvas: 'hotel-tab-panel', role: 'button', name: 'Фото:' })
        .forEach((x) => d.on(x, 'click', 'lbOpen'));
      return box.innerHTML;
    });
  }
  // the fold-out rows (transfer, check-in times, specializations) open and close in Play:
  // mark what is there while they are closed, open them all, the new parts are their contents
  const openAcc = async (p) => {
    await p.evaluate(() =>
      document
        .querySelectorAll('[data-canvas="hotel-rooms"] button[aria-expanded]')
        .forEach((x) => Array.from(x.parentElement.children).forEach((c) => c.setAttribute('data-closed', ''))),
    );
    for (const bt of await p.locator('[data-canvas="hotel-rooms"] button[aria-expanded="false"]').elementHandles())
      await bt.click();
    await p.waitForTimeout(200);
  };
  const base = await grab(b, route, openAcc, () => {
    const d = window.__dc;
    const F = window.__find;
    document.querySelectorAll('[data-canvas="hotel-rooms"] button[aria-expanded]').forEach((btn, i) => {
      d.on(btn, 'click', 'acc' + i);
      btn.removeAttribute('aria-expanded');
      const parts = [];
      for (let el = btn.nextElementSibling; el && !el.hasAttribute('data-closed'); el = el.nextElementSibling)
        parts.push(el);
      if (parts.length) {
        parts[0].before(d.raw('acc-start-' + i));
        parts[parts.length - 1].after(d.raw('acc-end'));
      }
    });
    document.querySelectorAll('[data-closed]').forEach((x) => x.removeAttribute('data-closed'));
    // «нет мест»: «Свяжитесь со мной» opens the form board
    F({ canvas: 'hotel-no-places', role: 'button', name: 'Свяжитесь со мной' }).forEach((x) => {
      const a = document.createElement('a');
      a.className = x.className;
      a.href = 'Help.dc.html';
      a.innerHTML = x.innerHTML;
      a.setAttribute('style', (x.getAttribute('style') || '') + ';text-decoration:none');
      x.replaceWith(a);
    });
    F({ canvas: 'hotel-gallery', role: 'button' }).forEach((x) => d.on(x, 'click', 'lbOpen'));
    F({ canvas: 'hotel-hero', role: 'button', name: 'отзыв' }).forEach((x) => d.on(x, 'click', 'tab_reviews'));
    F({ canvas: 'room-card', role: 'button', name: 'Смотреть фото номера' }).forEach((x, i) =>
      d.on(x, 'click', 'rgOpen' + i),
    );
    const g = document.getElementById('guests');
    if (g) {
      d.on(g, 'click', 'openGuests');
      d.text(g.querySelector('strong'), 'gLabel');
      g.after(d.raw('gpop'));
    }
    const keys = ['rooms', 'treat', 'food', 'about', 'reviews'];
    F({ canvas: 'hotel-tabs', role: 'button' }).forEach((x, i) => {
      d.on(x, 'click', 'tab_' + keys[i]);
      d.attr(x, 'class', 'tabCls_' + keys[i]);
      x.removeAttribute('aria-current');
    });
    // «Ваши даты» follow the calendar
    const calBtn = F({ canvas: 'hotel-dates', role: 'button', name: 'Изменить даты' })[0];
    if (calBtn) {
      d.on(calBtn, 'click', 'openCal');
      const bar = document.querySelector('[data-canvas="hotel-dates"]');
      const range = bar.querySelector('strong');
      if (range) d.text(range, 'hbRange');
      const nights = bar.querySelector('.hb-nights');
      if (nights) d.text(nights, 'hbNights');
    }
    const rooms = document.querySelector('[data-canvas="hotel-tab-panel"]').firstElementChild;
    rooms.before(d.raw('rooms-start'));
    rooms.after(d.raw('rooms-end'));
    const page = document.querySelector('#root .page');
    page.appendChild(d.raw('lightbox'));
    page.appendChild(d.raw('roomgal'));
    page.appendChild(d.raw('calmodal'));
    return document.getElementById('root').innerHTML;
  });
  const ifs = (k, html) => `<sc-if value="{{tabOn_${k}}}" hint-placeholder-val="{{false}}">${html}</sc-if>`;
  const accN = new Set((base.match(/acc-start-\d+/g) || []).map(String)).size;
  const accRaws = { 'acc-end': '</sc-if>' };
  for (let i = 0; i < 12; i++)
    accRaws['acc-start-' + i] = '<sc-if value="{{accOn' + i + '}}" hint-placeholder-val="{{false}}">';
  const body = IA.finish(post(base), {
    ...accRaws,
    lightbox: wrapIf('lbOn', IA.finish(post(lb), {})),
    gpop: wrapIf('gOpen', IA.finish(post(gpop), {})),
    calmodal: wrapIf('calOpen', cal),
    roomgal: rgRaw(rgHtml),
    'rooms-start': '<sc-if value="{{tabOn_rooms}}" hint-placeholder-val="{{true}}">',
    'rooms-end': '</sc-if>' + TABS.map(([k]) => ifs(k, IA.finish(post(tabHtml[k]), {}))).join(''),
  });
  const left = body.match(/⟦|data-dc-|<dc-raw/g);
  if (left) console.warn(file, 'unconverted markers:', left.length);
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
    // the fold-out rows under the rooms
    for (let i = 0; i < ${accN}; i++) {
      v['acc' + i] = () => this.setState({ ['acc' + i]: !st['acc' + i] });
      v['accOn' + i] = !!st['acc' + i];
    }
    return v;
  }
}`;
  fs.writeFileSync(path.join(OUT, file), docFor(sizes[file].title, route, body, sizes[file].h, logic));
  console.log(file, 'interactive', body.length);
}

module.exports = { build: buildHotel };
