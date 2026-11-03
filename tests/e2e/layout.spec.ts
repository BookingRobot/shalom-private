import { expect, test, type BrowserContext, type Page } from '@playwright/test';

/**
 * Layout guard for the 60+ readability work: every page, at the narrow phones (320, 360, 390 px)
 * and on a laptop (1366×768), must
 *   1. never scroll sideways (a date matrix may scroll inside its own box — that is not the page),
 *   2. keep running text at 15 px or more,
 *   3. never break a word in the middle across two lines.
 * One browser context per width with one page that is reused for every route (the machine is small).
 * The phone widths run in the `phone` project, the laptop width in the `laptop` project.
 */

const ROUTES = [
  '/',
  '/results',
  '/sanatoriy/egle-comfort',
  '/kurort/druskininkai',
  '/rooms',
  '/transfer',
  '/guests',
  '/payment',
  '/done',
  '/rules',
  '/privacy',
  '/tickets',
];

const VIEWPORTS = [
  { width: 320, height: 700, project: 'phone' },
  { width: 360, height: 700, project: 'phone' },
  { width: 390, height: 700, project: 'phone' },
  { width: 1366, height: 768, project: 'laptop' },
];

const MIN_FONT_PX = 15;

/**
 * Text that may stay under 15 px, as CSS selectors matched with `closest()`. Keep it short and give
 * the reason: only legal fine print and tiny badges belong here, never body text.
 */
const SMALL_TEXT_OK: Record<string, string> = {
  // photo credits under the resort photos (author · licence · Wikimedia Commons): legal attribution
  figcaption: 'licence credit of a photo',
  // the round «i» mark of an explanation is an icon, not text (its tap area is 44 px)
  '.info-tip': 'the «i» icon of an explanation',
  // KNOWN ISSUES found on 2026-11-03 — raise them to 16 px, then delete the line:
  '.gp-inline-l': 'sanatorium page: the 13 px caps label «ГОСТИ»',
  '.rm-room-k': 'step «Номер»: the 13 px caps label «ВАШ НОМЕР»',
  '.rm-people-note': 'step «Номер»: the 13 px note «Фото для примера»',
  '.tk-f-l': 'tickets: the 13 px caps labels «ОТКУДА», «КУДА», «ТУДА», «ОБРАТНО», «ПАССАЖИРЫ»',
  '.rp-foot .btn': 'resort page: «Хочу в … — подобрать санаторий» keeps the browser default 13.3 px',
};

type Check = 'scroll' | 'font' | 'words';

/**
 * Problems that exist today and are not fixed yet: the check is skipped for that page and width
 * (with an annotation), every other check of the page still runs. Remove an entry once it is fixed —
 * the test then says so in its annotations.
 */
const KNOWN_ISSUES: { route: string; widths: number[]; check: Check; reason: string }[] = [
  // found by the first run on 2026-11-03 (route '*' = every page: the header is shared)
  {
    route: '*',
    widths: [320],
    check: 'scroll',
    reason: 'the phone header («Позвонить» + «Меню») is 32px wider than a 320px screen: label.hd-burger ends at 352px',
  },
  {
    route: '/privacy',
    widths: [320, 360, 390],
    check: 'words',
    reason: 'the heading «Политика конфиденциальности» breaks «конфиденциальности» in the middle',
  },
];

type Findings = { overflowPx: number; sticking: string[]; small: string[]; broken: string[] };

/** Runs in the page: measures the three rules and describes every offender in a readable line. */
function analyse({ minFont, okSmall }: { minFont: number; okSmall: string[] }): Findings {
  const vw = window.innerWidth;
  const say = (el: Element) => {
    const cls =
      typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
    const text = ((el as HTMLElement).innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return `<${el.tagName.toLowerCase()}${cls}> «${text}»`;
  };
  const shown = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false; // empty or visually hidden (screen-reader only)
    const v = el as Element & { checkVisibility?: (o: object) => boolean };
    if (v.checkVisibility && !v.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    return !el.closest('[aria-hidden="true"]');
  };
  const inOwnScroller = (el: Element) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const ox = getComputedStyle(e).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
    }
    return false;
  };

  // 1. sideways scroll of the page, and the elements that stick out of the screen
  const overflowPx = document.documentElement.scrollWidth - vw;
  const sticking: string[] = [];
  if (overflowPx > 1) {
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (sticking.length >= 8) break;
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 1 || r.width < 2 || getComputedStyle(el).position === 'fixed') continue;
      if (inOwnScroller(el)) continue;
      sticking.push(`${say(el)} ends at ${Math.round(r.right)}px`);
    }
  }

  // 2. running text under the minimum size
  const small = new Set<string>();
  const tags = 'p, li, label, button, a, span, small, strong, b, em, td, th, dd, dt, summary, legend';
  for (const el of Array.from(document.querySelectorAll(tags))) {
    const own = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && /[\p{L}\p{N}]/u.test(n.textContent ?? ''),
    );
    if (!own || !shown(el)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    // font-size 0 hides the text on purpose (the children carry their own size)
    if (!size || size >= minFont || okSmall.some((s) => el.closest(s))) continue;
    small.add(`${size}px ${say(el)}`);
  }

  // 3. words broken in the middle: the letters of one word lie on two lines
  const broken = new Set<string>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const s = node.textContent ?? '';
    if (!parent || !/\S/.test(s) || /^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(parent.tagName) || !shown(parent)) continue;
    // a line may end after a space, a hyphen, a dash or a slash; anything else is the middle of a word
    for (const m of s.matchAll(/[^\s\-‐‑–—/]{3,}/gu)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const tops = Array.from(range.getClientRects())
        .filter((x) => x.width > 0)
        .map((x) => x.top);
      if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 2) broken.add(`«${m[0]}» in ${say(parent)}`);
    }
  }

  return { overflowPx, sticking, small: [...small], broken: [...broken] };
}

const list = (items: string[]) =>
  items
    .slice(0, 15)
    .map((x) => '  · ' + x)
    .join('\n') + (items.length > 15 ? `\n  … and ${items.length - 15} more` : '');

for (const vp of VIEWPORTS) {
  test.describe(`layout at ${vp.width}px`, () => {
    let ctx: BrowserContext | undefined;
    let page: Page;

    test.beforeAll(async ({ browser }, testInfo) => {
      if (testInfo.project.name !== vp.project) return;
      const use = testInfo.project.use;
      ctx = await browser.newContext({
        baseURL: use.baseURL,
        locale: use.locale,
        timezoneId: use.timezoneId,
        viewport: { width: vp.width, height: vp.height },
        hasTouch: vp.project === 'phone',
      });
      // only the site itself: outside requests (web fonts, analytics) may hang here and must not decide the result
      const origin = new URL(use.baseURL ?? 'http://localhost').origin;
      await ctx.route(
        (url) => url.origin !== origin,
        (r) => r.abort(),
      );
      page = await ctx.newPage();
    });

    test.afterAll(async () => {
      await ctx?.close();
    });

    for (const route of ROUTES) {
      test(`${route} @${vp.width}`, async () => {
        const testInfo = test.info();
        test.skip(testInfo.project.name !== vp.project, `the ${vp.width}px width runs in the ${vp.project} project`);

        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.locator('#root > *').first().waitFor();
        await page.waitForTimeout(400); // entrance transitions settle
        const f = await page.evaluate(analyse, { minFont: MIN_FONT_PX, okSmall: Object.keys(SMALL_TEXT_OK) });

        const known = (check: Check) => {
          const k = KNOWN_ISSUES.find(
            (i) => (i.route === route || i.route === '*') && i.check === check && i.widths.includes(vp.width),
          );
          if (k) testInfo.annotations.push({ type: `known issue (${check})`, description: k.reason });
          return !!k;
        };
        const fixedNote = (check: Check) =>
          testInfo.annotations.push({
            type: 'known issue fixed',
            description: `remove ${check} of ${route} @${vp.width} from KNOWN_ISSUES`,
          });

        if (!known('scroll'))
          expect
            .soft(
              f.overflowPx,
              `${route} @${vp.width}: the page scrolls sideways by ${f.overflowPx}px\n${list(f.sticking)}\n`,
            )
            .toBeLessThanOrEqual(1);
        else if (f.overflowPx <= 1) fixedNote('scroll');

        if (!known('font'))
          expect.soft(f.small, `${route} @${vp.width}: text under ${MIN_FONT_PX}px\n${list(f.small)}\n`).toEqual([]);
        else if (!f.small.length) fixedNote('font');

        if (!known('words'))
          expect.soft(f.broken, `${route} @${vp.width}: words broken in the middle\n${list(f.broken)}\n`).toEqual([]);
        else if (!f.broken.length) fixedNote('words');
      });
    }
  });
}
