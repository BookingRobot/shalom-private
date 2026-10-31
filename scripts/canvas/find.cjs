/**
 * How the canvas script finds things on a page. A spec (written in boards.json and in the page
 * modules) names an element by what the product itself marks, never by a styling class:
 *
 *   { "canvas": "flight-dates" }                                   — [data-canvas="flight-dates"]
 *   { "canvas": "transfer-flight", "role": "radio", "name": "Нет" } — a role inside that block, by its name
 *   { "role": "button", "name": "Помогите выбрать санаторий" }     — a role anywhere on the page
 *   { "id": "datein" }                                             — a form field (the id its <label> points to)
 *   … plus "nth": 2 (0-based) when several match.
 *
 * The same spec works in Playwright (actions: click, check) and inside the page (links for Play).
 */

/** Playwright locator for a spec. */
function locate(page, spec) {
  if (typeof spec === 'string') throw new Error('find: specs are objects, got ' + spec);
  let l;
  if (spec.id) l = page.locator('#' + spec.id);
  else {
    l = spec.canvas ? page.locator(`[data-canvas="${spec.canvas}"]`) : page;
    if (spec.role) l = l.getByRole(spec.role, spec.name ? { name: spec.name } : {});
    else if (spec.text) l = l.getByText(spec.text);
    else if (!spec.canvas) throw new Error('find: empty spec ' + JSON.stringify(spec));
  }
  return spec.nth != null ? l.nth(spec.nth) : l.first();
}

/** Browser side: every element a spec matches (same rules as `locate`). Injected with page.evaluate. */
const BROWSER_FIND = `
window.__find = function (spec) {
  const ROLE = {
    button: 'button, [role="button"]',
    link: 'a[href]',
    radio: '[role="radio"], input[type="radio"]',
    checkbox: '[role="checkbox"], input[type="checkbox"]',
    tab: '[role="tab"]',
    dialog: '[role="dialog"]',
    heading: 'h1, h2, h3, h4',
    option: '[role="option"]',
  };
  const norm = (s) => String(s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
  const nameOf = (el) => {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(' ').map((id) => (document.getElementById(id) || {}).textContent || '').join(' ');
    return el.textContent;
  };
  let out;
  if (spec.id) out = [document.getElementById(spec.id)].filter(Boolean);
  else {
    const roots = spec.canvas ? Array.from(document.querySelectorAll('[data-canvas="' + spec.canvas + '"]')) : [document];
    if (!spec.role && !spec.text) out = roots;
    else {
      out = [];
      roots.forEach((r) => r.querySelectorAll(spec.role ? ROLE[spec.role] : '*').forEach((el) => out.push(el)));
      if (spec.name) out = out.filter((el) => norm(nameOf(el)).includes(norm(spec.name)));
      if (spec.text) out = out.filter((el) => !el.children.length && norm(el.textContent).includes(norm(spec.text)));
    }
  }
  return spec.nth != null ? out.slice(spec.nth, spec.nth + 1) : out;
};
`;

/** Run a board's actions: [{ click: spec }, { check: spec }, { wait: ms }, { press: 'Escape' }, …]. */
async function act(page, steps, named = {}) {
  for (const s of steps || []) {
    if (s.click) await locate(page, s.click).click();
    else if (s.check) await locate(page, s.check).check();
    else if (s.fill) await locate(page, s.fill).fill(s.value);
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.wait) await page.waitForTimeout(s.wait);
    else if (s.waitFor) await locate(page, s.waitFor).waitFor({ timeout: 15000 });
    else if (s.session) {
      // put something into the site's sessionStorage and reload (an order, a ticket form)
      await page.evaluate(({ key, value, merge }) => {
        const old = merge ? JSON.parse(sessionStorage.getItem(key) || '{}') : {};
        sessionStorage.setItem(key, JSON.stringify({ ...old, ...value }));
      }, s.session);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    } else if (s.run) {
      const fn = named[s.run];
      if (!fn) throw new Error('no setup named ' + s.run);
      await fn(page);
    } else throw new Error('unknown step ' + JSON.stringify(s));
  }
}

/** Turn what each link spec finds into a link to another board (so Play walks through the flow). */
async function linkBoards(page, links) {
  if (!links || !links.length) return;
  await page.addScriptTag({ content: BROWSER_FIND });
  const missing = await page.evaluate((links) => {
    const miss = [];
    for (const { find, to } of links) {
      const els = window.__find(find);
      if (!els.length) miss.push(JSON.stringify(find));
      for (const b of els) {
        if (b.tagName === 'A') {
          b.setAttribute('href', to);
          continue;
        }
        const a = document.createElement('a');
        for (const at of Array.from(b.attributes))
          if (!['type', 'disabled', 'role', 'aria-checked'].includes(at.name)) a.setAttribute(at.name, at.value);
        a.setAttribute('href', to);
        a.style.textDecoration = 'none';
        while (b.firstChild) a.appendChild(b.firstChild);
        b.replaceWith(a);
      }
    }
    return miss;
  }, links);
  return missing;
}

module.exports = { locate, act, linkBoards, BROWSER_FIND };
