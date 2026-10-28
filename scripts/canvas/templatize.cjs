/**
 * Turns a rendered page into a working Design-canvas board: marks elements in the live DOM
 * with ⟦holes⟧ and data-dc-on="click:handler", which snapshot-canvas.cjs then rewrites into
 * {{holes}} / onClick="{{handler}}" for scripts/canvas/search-logic.js.
 */

/** Template the search band: date fields + calendar (exact and flexible), guests, resort list. */
async function searchBand(p, { city }) {
  // 1) guests pop-over → template
  await p.click('#guests');
  const guestsPop = await p.evaluate(() => {
    const pop = document.querySelector('.gp-pop');
    const mark = (el, h) => el && el.setAttribute('data-dc-on', 'click:' + h);
    const nums = pop.querySelectorAll('.gp-num');
    nums[0].textContent = '⟦gAd⟧';
    nums[1].textContent = '⟦gCh⟧';
    const btns = pop.querySelectorAll('.gp-btn');
    const names = ['adMinus', 'adPlus', 'chMinus', 'chPlus'];
    btns.forEach((b, i) => {
      mark(b, names[i]);
      b.removeAttribute('disabled');
      b.setAttribute('data-dc-disabled', names[i] + 'Off');
    });
    mark(pop.querySelector('.gp-done'), 'gClose');
    mark(pop.querySelector('.gp-more'), 'gClose');
    pop.removeAttribute('id');
    return pop.outerHTML;
  });
  await p.click('.gp-done');

  // 2) resort-or-sanatorium list → template
  let cityList = '';
  if (city) {
    await p.click('#city');
    cityList = await p.evaluate(() => {
      const ul = document.querySelector('.ps-list');
      const lis = ul.querySelectorAll('li');
      const li = lis[0];
      lis.forEach((x, i) => i && x.remove());
      li.removeAttribute('id');
      li.removeAttribute('aria-selected');
      li.setAttribute('class', 'ps-opt ⟦it.cls⟧');
      li.querySelector('strong').textContent = '⟦it.label⟧';
      li.querySelector('span').textContent = '⟦it.sub⟧';
      li.setAttribute('data-dc-on', 'click:it.pick');
      const loop = document.createElement('sc-for');
      loop.setAttribute('list', '⟦psItems⟧');
      loop.setAttribute('as', 'it');
      loop.setAttribute('hint-placeholder-count', '8');
      ul.insertBefore(loop, li);
      loop.appendChild(li);
      ul.removeAttribute('id');
      return ul.outerHTML;
    });
    await p.keyboard.press('Escape');
  }

  // 3) calendar: flexible-dates block → template, then the exact calendar in place
  await p.click('#datein');
  await p.click('text=Не знаю точных дат');
  const flexHtml = await p.evaluate(() => {
    const fx = document.querySelector('.flex-dates');
    const loopOf = (first, list, as) => {
      const parent = first.parentNode;
      Array.from(parent.children).forEach((x) => x !== first && x.remove());
      const loop = document.createElement('sc-for');
      loop.setAttribute('list', list);
      loop.setAttribute('as', as);
      loop.setAttribute('hint-placeholder-count', '4');
      parent.insertBefore(loop, first);
      loop.appendChild(first);
    };
    // month carousel: 6 tiles of 24 months, ‹ › move the window
    const car = fx.querySelector('.fd-car');
    const nav = car.querySelectorAll(':scope > .navbtn');
    nav[0].setAttribute('data-dc-on', 'click:fdPrev');
    nav[0].removeAttribute('disabled');
    nav[0].setAttribute('data-dc-disabled', 'fdPrevOff');
    nav[1].setAttribute('data-dc-on', 'click:fdNext');
    nav[1].removeAttribute('disabled');
    nav[1].setAttribute('data-dc-disabled', 'fdNextOff');
    const tile = car.querySelector('.fd-tile');
    tile.setAttribute('class', 'fd-tile ⟦m.cls⟧');
    tile.removeAttribute('aria-pressed');
    tile.querySelector('strong').textContent = '⟦m.label⟧';
    tile.querySelector('span').textContent = '⟦m.year⟧';
    tile.querySelector('small').textContent = '⟦m.from⟧';
    tile.setAttribute('data-dc-on', 'click:m.pick');
    loopOf(tile, '⟦fdMonths⟧', 'm');
    const opts = fx.querySelectorAll('.fd-opts');
    [[opts[0], '⟦fdNights⟧', 'n']].forEach(([box, list, as]) => {
      const chip = box.querySelector('.qf-chip');
      chip.setAttribute('class', 'qf-chip ⟦' + as + '.cls⟧');
      chip.removeAttribute('aria-pressed');
      chip.textContent = '⟦' + as + '.label⟧';
      chip.setAttribute('data-dc-on', 'click:' + as + '.pick');
      loopOf(chip, list, as);
    });
    fx.querySelector('.fd-title').textContent = '⟦fdTitle⟧';
    const opt = fx.querySelector('.fd-opt');
    opt.setAttribute('data-dc-on', 'click:o.pick');
    opt.querySelector('.fd-when').textContent = '⟦o.when⟧';
    const sum = opt.querySelector('.fd-sum');
    const best = sum.querySelector('.fd-best') || document.createElement('span');
    best.className = 'fd-best';
    best.textContent = 'дешевле всего';
    sum.textContent = '≈ ⟦o.sum⟧ € на человека';
    const iff = document.createElement('sc-if');
    iff.setAttribute('value', '⟦o.best⟧');
    iff.setAttribute('hint-placeholder-val', '⟦false⟧');
    iff.appendChild(best);
    sum.appendChild(iff);
    const list = fx.querySelector('.fd-list');
    Array.from(list.querySelectorAll('.fd-opt')).forEach((x) => x !== opt && x.remove());
    const empty = list.querySelector('.fd-empty');
    if (empty) empty.remove();
    const loop = document.createElement('sc-for');
    loop.setAttribute('list', '⟦fdList⟧');
    loop.setAttribute('as', 'o');
    loop.setAttribute('hint-placeholder-count', '5');
    list.insertBefore(loop, opt);
    loop.appendChild(opt);
    return fx.outerHTML;
  });
  await p.click('text=Точные даты');

  await p.evaluate(
    ({ guestsPop, cityList, flexHtml }) => {
      const mark = (el, h) => el && el.setAttribute('data-dc-on', 'click:' + h);
      const dialog = document.querySelector('[role="dialog"]');
      const overlay = dialog.parentElement;
      // header
      const hint = dialog.querySelector('h2').nextElementSibling;
      if (hint && hint.tagName === 'SPAN') hint.textContent = '⟦calHint⟧';
      mark(dialog.querySelector('.btn'), 'closeCal');
      const tabs = dialog.querySelectorAll('.dm-tabs button');
      tabs[0].setAttribute('class', '⟦tabExact⟧');
      tabs[1].setAttribute('class', '⟦tabFlex⟧');
      tabs.forEach((t) => t.removeAttribute('aria-selected'));
      mark(tabs[0], 'tabExactFn');
      mark(tabs[1], 'tabFlexFn');
      // presets
      const presets = dialog.querySelectorAll('.preset');
      ['p7', 'p10', 'p14', 'p21'].forEach((h, i) => mark(presets[i], h));
      // month grid
      const mc = dialog.querySelector('.months-calendar');
      const nav = mc.querySelectorAll(':scope > .navbtn');
      mark(nav[0], 'calPrev');
      mark(nav[1], 'calNext');
      const title = mc.querySelector('div[style*="Lora"]');
      title.textContent = '⟦monthTitle⟧';
      const cells = Array.from(mc.querySelectorAll('.cell'));
      const tpl = cells.find((c) => c.querySelector('svg')) || cells.find((c) => !c.disabled);
      cells.forEach((c) => c !== tpl && c.remove());
      tpl.removeAttribute('disabled');
      tpl.setAttribute('data-dc-disabled', 'c.off');
      tpl.setAttribute('aria-label', '⟦c.aria⟧');
      tpl.setAttribute('style', 'background: ⟦c.bg⟧; border-color: ⟦c.border⟧; color: ⟦c.color⟧; cursor: ⟦c.cursor⟧;');
      mark(tpl, 'c.pick');
      tpl.querySelector('span').textContent = '⟦c.day⟧';
      const small = tpl.querySelector('small');
      small.setAttribute('style', 'color: ⟦c.subColor⟧;');
      small.textContent = '⟦c.sub⟧';
      const plane = tpl.querySelector('span[style*="absolute"]');
      if (plane) {
        const iff = document.createElement('sc-if');
        iff.setAttribute('value', '⟦c.fly⟧');
        iff.setAttribute('hint-placeholder-val', '⟦false⟧');
        tpl.insertBefore(iff, plane);
        iff.appendChild(plane);
      }
      const loop = document.createElement('sc-for');
      loop.setAttribute('list', '⟦cells⟧');
      loop.setAttribute('as', 'c');
      loop.setAttribute('hint-placeholder-count', '35');
      tpl.parentNode.insertBefore(loop, tpl);
      loop.appendChild(tpl);
      // exact (presets + grid) vs flexible
      const presetRow = presets[0].parentElement;
      const exact = document.createElement('sc-if');
      exact.setAttribute('value', '⟦exactOn⟧');
      exact.setAttribute('hint-placeholder-val', '⟦true⟧');
      presetRow.parentNode.insertBefore(exact, presetRow);
      exact.appendChild(presetRow);
      exact.appendChild(mc);
      exact.insertAdjacentHTML(
        'afterend',
        '<sc-if value="⟦flexOn⟧" hint-placeholder-val="⟦false⟧">' + flexHtml + '</sc-if>',
      );
      // footer
      const strongs = dialog.querySelectorAll('.lbl + strong');
      ['⟦selIn⟧', '⟦selOut⟧', '⟦selNights⟧'].forEach((t, i) => strongs[i] && (strongs[i].textContent = t));
      Array.from(dialog.querySelectorAll('button')).forEach((b) => {
        const t = b.textContent.trim();
        if (t === 'Отмена') mark(b, 'closeCal');
        if (t === 'Подтвердить даты') {
          mark(b, 'applyCal');
          b.removeAttribute('disabled');
          b.setAttribute('data-dc-disabled', 'applyOff');
        }
      });
      const calIf = document.createElement('sc-if');
      calIf.setAttribute('value', '⟦calOpen⟧');
      calIf.setAttribute('hint-placeholder-val', '⟦false⟧');
      overlay.parentNode.insertBefore(calIf, overlay);
      calIf.appendChild(overlay);

      // search band fields
      const din = document.getElementById('datein'),
        dout = document.getElementById('dateout');
      din.textContent = '⟦inLabel⟧';
      dout.textContent = '⟦outLabel⟧';
      mark(din, 'openCal');
      mark(dout, 'openCal');
      const g = document.getElementById('guests');
      g.innerHTML =
        '<span style="display: block; white-space: nowrap;">⟦gAdL⟧</span>' +
        '<sc-if value="⟦gHasCh⟧" hint-placeholder-val="⟦false⟧"><span style="display: block; white-space: nowrap; font-size: 13px; font-weight: 600; color: rgb(94, 104, 98);">+ ⟦gChL⟧</span></sc-if>';
      g.removeAttribute('aria-expanded');
      g.removeAttribute('aria-controls');
      mark(g, 'gToggle');
      g.parentElement.insertAdjacentHTML(
        'beforeend',
        '<sc-if value="⟦gOpen⟧" hint-placeholder-val="⟦false⟧">' + guestsPop + '</sc-if>',
      );
      const city = document.getElementById('city');
      if (city && city.tagName === 'INPUT' && cityList) {
        city.value = '⟦cityLabel⟧';
        city.setAttribute('value', '⟦cityLabel⟧');
        city.setAttribute('readonly', '');
        ['aria-expanded', 'aria-controls', 'aria-activedescendant'].forEach((a) => city.removeAttribute(a));
        mark(city, 'psToggle');
        city.parentElement.insertAdjacentHTML(
          'beforeend',
          '<sc-if value="⟦psOpen⟧" hint-placeholder-val="⟦false⟧">' + cityList + '</sc-if>',
        );
      }
      // "9 ночей · …" and the results sub-line
      document.querySelectorAll('span, div').forEach((el) => {
        if (el.children.length) return;
        const t = el.textContent;
        if (/^\d+ ноч\S* · (Покажем|Цены)/.test(t)) el.textContent = t.replace(/^\d+ ноч\S*/, '⟦nightsLabel⟧');
        else if (/^\d+.\d+ \S+ \d{4} · \d+ ноч/.test(t) || /^\d+ \S+ – \d+ \S+ \d{4} · \d+ ноч/.test(t))
          el.textContent = '⟦rangeLine⟧';
      });
    },
    { guestsPop, cityList, flexHtml },
  );
}

/** Turn buttons (matched by visible text or selector) into links to other boards, for Play. */
async function linkButtons(p, rules) {
  await p.evaluate((rules) => {
    for (const [sel, text, href] of rules) {
      const els = Array.from(document.querySelectorAll(sel)).filter(
        (b) => !text || b.textContent.replace(/\s+/g, ' ').trim().includes(text),
      );
      for (const b of els) {
        const a = document.createElement('a');
        for (const at of Array.from(b.attributes)) if (!['type', 'disabled'].includes(at.name)) a.setAttribute(at.name, at.value);
        a.setAttribute('href', href);
        a.style.textDecoration = 'none';
        while (b.firstChild) a.appendChild(b.firstChild);
        b.replaceWith(a);
      }
    }
  }, rules);
}

module.exports = { searchBand, linkButtons };
