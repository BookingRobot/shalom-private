/**
 * Makes the Main and Results canvas boards work in Play: the snapshot markup gets
 * Design-canvas holes and handlers, and a small logic class ports the site's
 * calendar (exact + "не знаю точных дат"), guests +/−, search list, room dates,
 * the "Помогите выбрать" wizard, compare and the price calendar.
 * Used by snapshot-canvas.cjs.
 */

/* ---------- browser helpers (injected into the page) ---------- */
const HELPERS = `
window.__dc = {
  on(el, ev, name) { if (el) el.setAttribute('data-dc-' + ev, name); },
  text(el, name) { if (el) el.textContent = '\\u27E6' + name + '\\u27E7'; },
  attr(el, a, name) { if (el) el.setAttribute(a, '\\u27E6' + name + '\\u27E7'); },
  raw(name) { const r = document.createElement('dc-raw'); r.setAttribute('data-k', name); return r; },
  fixedRoot(el) {
    let x = el;
    while (x && x !== document.body) { if (getComputedStyle(x).position === 'fixed') return x; x = x.parentElement; }
    return el;
  },
  sync() {
    document.querySelectorAll('input').forEach((i) => {
      if (i.type === 'checkbox' || i.type === 'radio') { i.checked ? i.setAttribute('checked', '') : i.removeAttribute('checked'); }
      else if (i.value) i.setAttribute('value', i.value);
    });
  },
  /** calendar dialog (exact mode) → template */
  markCal(dialog) {
    const d = window.__dc;
    const h2 = dialog.querySelector('h2');
    d.text(h2, 'calTitleText');
    const head = h2.parentElement;
    head.querySelectorAll(':scope > strong').forEach((s) => s.remove());
    h2.after(d.raw('roomline'));
    const hint = head.querySelector(':scope > span');
    d.text(hint, 'calHint');
    const closeBtn = dialog.querySelector('.btn.btn-secondary');
    d.on(closeBtn, 'click', 'closeCal');
    const tabs = dialog.querySelectorAll('.dm-tabs button');
    if (tabs.length) {
      d.on(tabs[0], 'click', 'calToExact'); d.attr(tabs[0], 'class', 'tabExactCls'); tabs[0].removeAttribute('aria-selected');
      d.on(tabs[1], 'click', 'calToFlex'); d.attr(tabs[1], 'class', 'tabFlexCls'); tabs[1].removeAttribute('aria-selected');
      tabs[0].parentElement.before(d.raw('tabs-start'));
      tabs[0].parentElement.after(d.raw('tabs-end'));
    }
    const presets = dialog.querySelectorAll('.preset');
    ['p7', 'p10', 'p14', 'p21'].forEach((n, i) => d.on(presets[i], 'click', n));
    const mc = dialog.querySelector('.months-calendar');
    const nav = mc.querySelectorAll(':scope > .navbtn');
    d.on(nav[0], 'click', 'calPrev'); d.on(nav[1], 'click', 'calNext');
    const month = mc.querySelector(':scope > div > div');
    d.text(month.children[0], 'calMonth');
    const grid = month.children[1];
    grid.querySelectorAll('.cell').forEach((c) => c.remove());
    grid.appendChild(d.raw('cells'));
    presets[0].parentElement.before(d.raw('exact-start'));
    mc.after(d.raw('exact-end'));
    const sel = dialog.querySelectorAll('.lbl + strong');
    d.text(sel[0], 'selIn'); d.text(sel[1], 'selOut'); d.text(sel[2], 'selNights');
    const footer = sel[0].closest('div[style*="border-top"]') || dialog;
    footer.before(d.raw('foot-start'));
    footer.after(d.raw('foot-end'));
    const fb = footer.querySelectorAll('.btn');
    d.on(fb[fb.length - 2], 'click', 'closeCal');
    d.on(fb[fb.length - 1], 'click', 'applyCal');
    d.attr(fb[fb.length - 1], 'disabled', 'applyOff');
    return d.fixedRoot(dialog).outerHTML;
  },
  markGuests(pop) {
    const d = window.__dc;
    const b = pop.querySelectorAll('.gp-btn');
    ['adMinus', 'adPlus', 'chMinus', 'chPlus'].forEach((n, i) => { d.on(b[i], 'click', n); d.attr(b[i], 'disabled', n + 'Off'); });
    const nums = pop.querySelectorAll('.gp-num');
    d.text(nums[0], 'gAd'); d.text(nums[1], 'gCh');
    d.on(pop.querySelector('.gp-done'), 'click', 'closeGuests');
    d.on(pop.querySelector('.gp-more'), 'click', 'closeGuests');
    return pop.outerHTML;
  },
};
`;

/* ---------- templates (Design-canvas syntax) ---------- */
const PLANE =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F5F4A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z"></path></svg>';

const CELLS = `<sc-for list="{{cells}}" as="c" hint-placeholder-count="35"><button type="button" class="cell" onClick="{{c.pick}}" disabled="{{c.off}}" aria-label="{{c.aria}}" style="background:{{c.bg}};border-color:{{c.border}};color:{{c.color}};cursor:{{c.cursor}}"><span>{{c.day}}</span><small style="color:{{c.subColor}}">{{c.sub}}</small><sc-if value="{{c.fly}}" hint-placeholder-val="{{false}}"><span style="position:absolute;top:4px;right:5px;line-height:0" title="Рейс из Израиля">${PLANE}</span></sc-if></button></sc-for>`;

const FLEX = (isMain) => `<div class="flex-dates">
<div class="fd-row"><span class="fd-lbl">Месяц</span><div class="fd-car"><button type="button" class="navbtn" aria-label="Раньше" disabled="{{fdPrevOff}}" onClick="{{fdPrev}}">‹</button><div class="fd-tiles" role="group" aria-label="Месяц" style="--per:6"><sc-for list="{{fdMonths}}" as="m" hint-placeholder-count="6"><button type="button" class="{{m.cls}}" onClick="{{m.pick}}"><strong>{{m.t}}</strong><span>{{m.y}}</span><small>{{m.from}}</small></button></sc-for></div><button type="button" class="navbtn" aria-label="Позже" disabled="{{fdNextOff}}" onClick="{{fdNext}}">›</button></div></div>
<div class="fd-row"><span class="fd-lbl">Сколько ночей</span><div class="fd-opts" role="group" aria-label="Сколько ночей"><sc-for list="{{fdNights}}" as="n" hint-placeholder-count="4"><button type="button" class="{{n.cls}}" onClick="{{n.pick}}">{{n.t}}</button></sc-for></div></div>
<div class="fd-list"><span class="fd-title">{{fdTitle}}</span><sc-if value="{{fdEmpty}}" hint-placeholder-val="{{false}}"><span class="fd-empty">В этом месяце свободных дат нет — выберите другой.</span></sc-if>
<sc-for list="{{fdOpts}}" as="o" hint-placeholder-count="5">${isMain ? `<a class="fd-opt" href="Results-B.dc.html" style="text-decoration:none"><span class="fd-when">{{o.when}}<span class="fd-fly">✈ рейс туда · ✈ обратно</span></span><span class="fd-sum">≈ {{o.sum}} € на человека<sc-if value="{{o.best}}" hint-placeholder-val="{{false}}"><span class="fd-best">дешевле всего</span></sc-if></span><span class="fd-go" aria-hidden="true">→</span></a>` : `<button type="button" class="fd-opt" onClick="{{o.pick}}"><span class="fd-when">{{o.when}}<span class="fd-fly">✈ рейс туда · ✈ обратно</span></span><span class="fd-sum">≈ {{o.sum}} € на человека<sc-if value="{{o.best}}" hint-placeholder-val="{{false}}"><span class="fd-best">дешевле всего</span></sc-if></span><span class="fd-go" aria-hidden="true">→</span></button>`}</sc-for>
<span class="fd-note">Средняя цена по курорту за проживание и лечение. Выберите вариант — сразу покажем санатории на эти даты.</span></div>
</div>`;

const GLABEL = `<span style="display:block;white-space:nowrap">{{gAdL}}</span><sc-if value="{{gHasCh}}" hint-placeholder-val="{{false}}"><span style="display:block;white-space:nowrap;font-size:13px;font-weight:600;color:#5E6862">+ {{gChL}}</span></sc-if>`;

const ROOMLINE = `<sc-if value="{{roomOn}}" hint-placeholder-val="{{false}}"><strong style="font-size:16px;color:#1C2620">{{roomLine}}</strong></sc-if>`;

/** marker → template, then data-dc-* → handlers, ⟦x⟧ → {{x}} */
function finish(html, raws) {
  let out = html.replace(/<dc-raw data-k="([^"]+)"><\/dc-raw>/g, (_, k) => {
    if (!(k in raws)) throw new Error('no template for ' + k);
    return raws[k];
  });
  out = out
    .replace(/data-dc-click="([^"]+)"/g, 'onClick="{{$1}}"')
    .replace(/data-dc-change="([^"]+)"/g, 'onChange="{{$1}}"')
    .replace(/⟦([A-Za-z0-9_.]+)⟧/g, '{{$1}}');
  return out;
}

/* ---------- logic class (classic JS, runs in the canvas) ---------- */
const LOGIC = `
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { inD: '2026-11-09', outD: '2026-11-18', cal: '', room: false, sel: null, m: null, y: null, fn: 14,
      fm: 8, fo: 5, ad: 2, ch: 0, gOpen: false, sOpen: false, wz: 0, cmp: [false, false, false, false], cmpDlg: false, price: false };
  }
  renderVals() {
    const st = this.state;
    const DAY = 86400000, toD = (s) => new Date(s + 'T00:00:00Z'), iso = (d) => d.toISOString().slice(0, 10);
    const addD = (d, n) => new Date(d.getTime() + n * DAY);
    const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    const MONTHS_N = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const WD = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    const TODAY = toD('2026-10-27');
    const SOLD = ['2026-11-20','2026-11-21','2026-11-22','2026-12-24','2026-12-25','2026-12-26','2026-12-27','2026-12-31','2027-01-01'];
    const ROOM = ['2026-11-01', '2026-11-23'];
    const isFly = (d) => [0, 2, 4].includes(d.getUTCDay());
    const ppn = (d) => {
      const n = Math.round((d - TODAY) / DAY), wd = d.getUTCDay(), m = d.getUTCMonth();
      return Math.round(100 * (1 + 0.12 * Math.sin(n * 0.42) + (wd === 5 || wd === 6 ? 0.06 : 0) +
        (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) + (m >= 5 && m <= 7 ? 0.15 : 0) + (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)));
    };
    const nW = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'ночь' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ночи' : 'ночей');
    const longD = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    const shortD = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
    const fmt = (n) => String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ');
    const inD = toD(st.inD), outD = toD(st.outD);
    const sel = st.sel || { in: st.inD, out: st.outD };
    const sIn = sel.in ? toD(sel.in) : null, sOut = sel.out ? toD(sel.out) : null;
    const m0 = st.m == null ? inD.getUTCMonth() : st.m, y0 = st.y == null ? inD.getUTCFullYear() : st.y;
    const roomBusy = (d) => st.room && iso(d) >= ROOM[0] && iso(d) < ROOM[1];
    const roomOverlap = (a, b) => st.room && a < toD(ROOM[1]) && b > toD(ROOM[0]);
    const pick = (date) => () => {
      const k = iso(date);
      if (!sel.in || (sel.in && sel.out)) this.setState({ sel: { in: k, out: null } });
      else if (date > toD(sel.in) && !roomOverlap(toD(sel.in), date)) this.setState({ sel: { in: sel.in, out: k } });
      else this.setState({ sel: { in: k, out: null } });
    };
    const first = new Date(Date.UTC(y0, m0, 1)), lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y0, m0 + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push({ day: '', sub: '', fly: false, bg: 'transparent', border: 'transparent', color: '#1C2620', subColor: '#3E4B44', off: true, cursor: 'default', aria: '', pick: () => {} });
    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.UTC(y0, m0, d)), past = date < TODAY, full = !past && SOLD.includes(iso(date));
      const busy = !past && !full && roomBusy(date), p = ppn(date), r = p / 100;
      let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9', color = '#1C2620', subColor = '#3E4B44', border = 'transparent';
      const isIn = sIn && iso(date) === iso(sIn), isOut = sOut && iso(date) === iso(sOut), between = sIn && sOut && date > sIn && date < sOut;
      if (past) { bg = '#E8E6E1'; color = '#9AA39E'; subColor = '#9AA39E'; }
      if (full || busy) { bg = 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)'; color = '#8A968F'; subColor = '#8A5A00'; }
      if (between) border = '#1F5F4A';
      if (isIn || isOut) { bg = '#1F5F4A'; color = '#fff'; subColor = '#D9E2DC'; border = '#1F5F4A'; }
      cells.push({ day: d, fly: isFly(date) && !past, sub: past ? '' : full ? 'нет мест' : busy ? 'занят' : isIn ? 'заезд' : isOut ? 'выезд' : p + ' €',
        bg, border, color, subColor, off: past || full || busy, cursor: past || full || busy ? 'not-allowed' : 'pointer',
        aria: d + ' ' + MONTHS[m0], pick: pick(date) });
    }
    const nights = sIn && sOut ? Math.round((sOut - sIn) / DAY) : 0;
    const preset = (n) => () => { const a = sIn || inD; this.setState({ sel: { in: iso(a), out: iso(addD(a, n)) } }); };
    // flexible dates: 24-month carousel, 6 tiles visible
    const months24 = Array.from({ length: 24 }, (_, i) => new Date(Date.UTC(2026, 9 + i, 1)));
    const optsFor = (md) => {
      const nd = new Date(Date.UTC(md.getUTCFullYear(), md.getUTCMonth() + 1, 0)).getUTCDate();
      const res = [];
      for (let i = 1; i <= nd; i++) {
        const d = new Date(Date.UTC(md.getUTCFullYear(), md.getUTCMonth(), i));
        if (d <= TODAY || !isFly(d) || !isFly(addD(d, st.fn))) continue;
        let sum = 0, ok = true;
        for (let k = 0; k < st.fn; k++) { const x = addD(d, k); if (SOLD.includes(iso(x))) ok = false; sum += ppn(x); }
        if (ok) res.push({ d, sum });
      }
      return res;
    };
    const r10 = (n) => Math.round(n / 10) * 10;
    const fo = Math.min(st.fo || 0, 18);
    const fmD = months24[st.fm];
    let opts = optsFor(fmD).sort((a, b) => a.sum - b.sum).slice(0, 5).sort((a, b) => a.d - b.d);
    const minS = opts.length ? Math.min(...opts.map((o) => r10(o.sum))) : 0;
    // guests
    const ad = st.ad, ch = st.ch;
    // compare
    const cmp = st.cmp, cmpN = cmp.filter(Boolean).length;
    const cmpT = (i) => () => { const c = cmp.slice(); c[i] = !c[i]; this.setState({ cmp: c }); };
    const __f = this.__filters ? this.__filters(st) : {};
    return {
      ...__f,
      // page fields
      inLabel: longD(inD), outLabel: longD(outD),
      openCal: () => this.setState({ cal: 'exact', room: false, sel: { in: st.inD, out: st.outD }, m: inD.getUTCMonth(), y: inD.getUTCFullYear() }),
      openRoomCal: () => this.setState({ cal: 'exact', room: true, sel: { in: null, out: null }, m: inD.getUTCMonth(), y: inD.getUTCFullYear() }),
      // calendar
      calOpen: !!st.cal, calExact: st.cal !== 'flex', calFlex: st.cal === 'flex', tabsOn: !st.room,
      calTitleText: st.room ? 'Свободные даты номера' : 'Выберите даты поездки',
      roomOn: st.room, roomLine: 'Полулюкс · Санаторий Эгле Комфорт — занятые дни закрыты',
      calHint: st.cal === 'flex' ? 'Выберите месяц и сколько ночей — подберём лучшие даты с рейсами' : !sIn ? 'Нажмите день заезда' : !sOut ? 'Теперь нажмите день выезда' : 'Можно поменять: нажмите новый день заезда',
      tabExactCls: st.cal !== 'flex' ? 'on' : '', tabFlexCls: st.cal === 'flex' ? 'on' : '',
      calToExact: () => this.setState({ cal: 'exact' }), calToFlex: () => this.setState({ cal: 'flex' }),
      closeCal: () => this.setState({ cal: '', room: false }),
      calPrev: () => { const m = m0 - 1; this.setState({ m: (m + 12) % 12, y: m < 0 ? y0 - 1 : y0 }); },
      calNext: () => { const m = m0 + 1; this.setState({ m: m % 12, y: m > 11 ? y0 + 1 : y0 }); },
      calMonth: MONTHS_N[m0] + ' ' + y0, cells,
      p7: preset(7), p10: preset(10), p14: preset(14), p21: preset(21),
      selIn: sIn ? shortD(sIn) : '—', selOut: sOut ? shortD(sOut) : '—', selNights: nights ? nights + ' ' + nW(nights) : '—',
      applyOff: !nights,
      applyCal: () => { if (nights) this.setState({ inD: sel.in, outD: sel.out, cal: '', room: false }); },
      fdMonths: months24.slice(fo, fo + 6).map((x, j) => {
        const i = fo + j, o = optsFor(x), from = o.length ? Math.min(...o.map((q) => r10(q.sum))) : 0;
        return { t: MONTHS_N[x.getUTCMonth()], y: String(x.getUTCFullYear()), from: from ? 'от ' + fmt(from) + ' €' : 'нет мест',
          cls: 'fd-tile' + (i === st.fm ? ' on' : ''), pick: () => this.setState({ fm: i }) };
      }),
      fdPrevOff: fo === 0, fdNextOff: fo >= 18,
      fdPrev: () => this.setState({ fo: Math.max(0, fo - 6) }), fdNext: () => this.setState({ fo: Math.min(18, fo + 6) }),
      fdNights: [7, 10, 14, 21].map((n) => ({ t: n === 7 ? '7 ночей · неделя' : n === 14 ? '14 ночей · 2 недели' : n === 21 ? '21 ночь · 3 недели' : '10 ночей',
        cls: 'qf-chip' + (n === st.fn ? ' on' : ''), pick: () => this.setState({ fn: n }) })),
      fdTitle: 'Лучшие даты в ' + MONTHS[fmD.getUTCMonth()].replace(/я$/, 'е').replace(/а$/, 'е') + ' — с рейсами туда и обратно',
      fdEmpty: opts.length === 0,
      fdOpts: opts.map((o) => {
        const out = addD(o.d, st.fn);
        return { when: WD[o.d.getUTCDay()] + ', ' + shortD(o.d) + ' → ' + WD[out.getUTCDay()] + ', ' + shortD(out), sum: fmt(r10(o.sum)), best: r10(o.sum) === minS,
          pick: () => this.setState({ inD: iso(o.d), outD: iso(out), sel: null, cal: '', room: false }) };
      }),
      // guests
      gOpen: st.gOpen, openGuests: () => this.setState({ gOpen: !st.gOpen, sOpen: false }), closeGuests: () => this.setState({ gOpen: false }),
      gAd: String(ad), gCh: String(ch), gAdL: ad + ' ' + (ad === 1 ? 'взрослый' : 'взрослых'), gHasCh: ch > 0, gChL: ch + ' ' + (ch === 1 ? 'ребёнок' : 'ребёнка'),
      adMinus: () => ad > 1 && this.setState({ ad: ad - 1 }), adPlus: () => ad < 4 && this.setState({ ad: ad + 1 }),
      chMinus: () => ch > 0 && this.setState({ ch: ch - 1 }), chPlus: () => ch < 3 && this.setState({ ch: ch + 1 }),
      adMinusOff: ad <= 1, adPlusOff: ad >= 4, chMinusOff: ch <= 0, chPlusOff: ch >= 3,
      // search list
      sOpen: st.sOpen, openSearch: () => this.setState({ sOpen: !st.sOpen, gOpen: false }),
      // wizard
      wz1: st.wz === 1, wz2: st.wz === 2, wz3: st.wz === 3, wz4: st.wz === 4,
      wzOpen: () => this.setState({ wz: 1 }), wzNext: () => this.setState({ wz: Math.min(4, st.wz + 1) }),
      wzBack: () => this.setState({ wz: Math.max(1, st.wz - 1) }), wzRestart: () => this.setState({ wz: 1 }), wzClose: () => this.setState({ wz: 0 }),
      // compare
      cmpAny: cmpN > 0, cmpDlg: st.cmpDlg, cmpOpen: () => this.setState({ cmpDlg: true }), cmpClose: () => this.setState({ cmpDlg: false }),
      cmpClear: () => this.setState({ cmp: [false, false, false, false], cmpDlg: false }),
      cmpOn0: cmp[0], cmpOn1: cmp[1], cmpOn2: cmp[2], cmpOn3: cmp[3], cmpT0: cmpT(0), cmpT1: cmpT(1), cmpT2: cmpT(2), cmpT3: cmpT(3),
      // price calendar ("Когда дешевле?")
      priceOn: st.price, priceOpen: () => this.setState({ price: true }), priceClose: () => this.setState({ price: false }),
    };
  }
}
`;

/** template pieces shared by both boards */
const calRaws = (calHtml) => ({});

/**
 * Results filter panel in Play: tiles/checkboxes and chips switch on and off, "Ещё фильтры"
 * opens the rest, "Свернуть"/"Показать" close it. The list itself stays as on the site.
 */
function filtersLogic(keys, bases, init, groups) {
  return LOGIC.replace(
    /\n}\n$/,
    `
  __filters(st) {
    const F_BASE = ${JSON.stringify(bases)};
    const F_INIT = ${JSON.stringify(init)};
    const GROUPS = ${JSON.stringify(groups)};
    const fv = st.fv || F_INIT;
    const qf = st.qf || GROUPS.map((g) => (g.one ? [0] : []));
    const fx = {
      fOpenV: !!st.fOpen, fClosedV: !st.fOpen, fMoreOn: !!st.fMore, fMoreOff: !st.fMore,
      fOpenFn: () => this.setState({ fOpen: true }),
      fClose: () => this.setState({ fOpen: false, fMore: false }),
      fMoreT: () => this.setState({ fMore: !st.fMore }),
      fReset: () => this.setState({ fv: F_INIT.map(() => false), qf: GROUPS.map((g) => (g.one ? [0] : [])) }),
    };
    F_BASE.forEach((base, i) => {
      fx['fOn' + i] = !!fv[i];
      fx['fCls' + i] = base + (fv[i] ? ' on' : '');
      fx['fT' + i] = () => { const v = fv.slice(); v[i] = !v[i]; this.setState({ fv: v }); };
    });
    GROUPS.forEach((g, gi) => {
      for (let j = 0; j < g.n; j++) {
        const on = qf[gi].includes(j);
        fx['qfc' + gi + '_' + j] = 'qf-chip' + (on ? ' on' : '');
        fx['qf' + gi + '_' + j] = () => {
          const v = qf.map((x) => x.slice());
          if (g.one) v[gi] = [j];
          else v[gi] = on ? v[gi].filter((x) => x !== j) : v[gi].concat(j);
          this.setState({ qf: v });
        };
      }
    });
    return fx;
  }
}
`,
  );
}

module.exports = { HELPERS, CELLS, FLEX, GLABEL, ROOMLINE, LOGIC, filtersLogic, finish, calRaws };
