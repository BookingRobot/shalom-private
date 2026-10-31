import { expect, type Locator, type Page } from '@playwright/test';

/** every route of the site a guest can open by address */
export const ROUTES = [
  '/',
  '/results',
  '/hotel',
  '/rooms',
  '/transfer',
  '/guests',
  '/payment',
  '/done',
  '/tickets',
  '/rules',
];

/** the page background from src/styles/tokens.css (--sand): a sure sign the styles are loaded */
export const SAND = 'rgb(244, 241, 234)';

export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1366) < 760;

/** console errors and uncaught exceptions of the page, collected from `goto` on */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // a 404 of a missing image is a content problem, not a broken page
    if (/Failed to load resource/.test(t)) return;
    errors.push('console: ' + t);
  });
  return errors;
}

/** the page must never be wider than the phone: no horizontal scroll */
export async function expectNoHorizontalScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'horizontal overflow in px').toBeLessThanOrEqual(0);
}

export async function expectStylesLoaded(page: Page) {
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(SAND);
}

/** the first visible element among several copies (the sticky bar and the row both carry «Далее») */
export const firstVisible = (loc: Locator) => loc.locator('visible=true').first();

/**
 * The «Далее» of a checkout step (StepNext): the button that leads to `to`. The hint bubble
 * «Осталось…» is only a signal that something is still missing — never a selector tests rely on.
 */
export async function clickNext(page: Page, to: string) {
  await firstVisible(page.locator(`[data-to="${to}"]`)).click();
}

/** Pick a resort on the home search: a sheet of resorts on a phone, a combobox on a laptop. */
export async function pickResort(page: Page, name: string) {
  const city = page.locator('#city');
  await city.click();
  if (
    await page
      .locator('.ps-sheet')
      .isVisible()
      .catch(() => false)
  ) {
    await page.locator('.ps-sheet').getByRole('button', { name }).first().click();
  } else {
    await city.fill(name.slice(0, 5));
    await page
      .getByRole('option', { name: new RegExp(name) })
      .first()
      .click();
  }
}

/**
 * Year → month → day picker of a date of birth (the guest step and the tickets use the same
 * window): the year page starts at 1950, the day click saves and closes the window.
 */
export async function pickBirthDate(page: Page, trigger: string, year = '1960', day = '15') {
  await page.locator(trigger).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await dlg.locator('.dob-grid-y .pick', { hasText: new RegExp(`^${year}$`) }).click();
  await dlg.locator('.dob-grid-m .pick').first().click();
  await dlg
    .locator('.dob-grid-d .pick, .dob-days .pick', { hasText: new RegExp(`^${day}$`) })
    .first()
    .click();
  await expect(dlg).toBeHidden();
}

/** Fill the card form of the test mode (CardForm with `idPrefix`): anything non-empty is taken. */
export async function fillCard(page: Page, prefix: string) {
  await page.locator(`#${prefix}No`).fill('4580 0000 0000 0000');
  await page.locator(`#${prefix}Exp`).fill('12 / 28');
  await page.locator(`#${prefix}Cvv`).fill('123');
  const tz = page.locator(`#${prefix}Tz`);
  if (await tz.count()) await tz.fill('123456789');
}

/**
 * Answer whatever the road step still asks: in every visible question without an answer take the
 * first answer, fill empty text fields, then press «Далее» — until the next step opens.
 */
export async function answerRoadQuestions(page: Page, next = '/guests', maxRounds = 8) {
  for (let round = 0; round < maxRounds; round++) {
    const groups = page.locator('[role=radiogroup]:visible');
    for (let i = 0; i < (await groups.count()); i++) {
      const g = groups.nth(i);
      if (await g.locator('[role=radio][aria-checked="true"]').count()) continue;
      const first = g.locator('[role=radio]').first();
      // near the top-left corner: the centre of an answer card may be its «i» button
      if (await first.isVisible()) await first.click({ position: { x: 24, y: 24 } });
    }
    const inputs = page.locator('.page input[type=text]:visible');
    for (let i = 0; i < (await inputs.count()); i++) {
      const inp = inputs.nth(i);
      if (!(await inp.inputValue()).trim()) await inp.fill('Hotel Europa Royale');
    }
    const selects = page.locator('.page select:visible');
    for (let i = 0; i < (await selects.count()); i++) {
      const sel = selects.nth(i);
      if (!(await sel.inputValue())) await sel.selectOption({ index: 1 });
    }
    await clickNext(page, next);
    if (
      await page.waitForURL(new RegExp(next + '$'), { timeout: 2500 }).then(
        () => true,
        () => false,
      )
    )
      return;
  }
  throw new Error(
    'the road step still asks: ' +
      ((await page
        .locator('.step-hint, .next-tip')
        .first()
        .textContent()
        .catch(() => '')) || '?'),
  );
}
