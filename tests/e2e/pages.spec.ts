import { expect, test } from '@playwright/test';
import { ROUTES, expectNoHorizontalScroll, expectStylesLoaded, isPhone, watchErrors } from './helpers';

/**
 * Every page opened by address: styles are on, nothing is wider than the screen, the console is
 * clean. This is the check that would have caught the lost step-2 styles.
 */
for (const route of ROUTES) {
  test(`page ${route}: styles, no horizontal scroll, no errors`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    // the pages glide in (PageTransition); give the last block a moment
    await page.waitForTimeout(700);
    await expectStylesLoaded(page);
    await expect(page.locator('header.site-header')).toBeVisible();
    await expectNoHorizontalScroll(page);
    // a tall page: the bottom must be as narrow as the top
    await page.mouse.wheel(0, 20_000);
    await page.waitForTimeout(300);
    await expectNoHorizontalScroll(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

/** Phone: the header is one slim row; «Меню» opens the sheet with the pages and the phone. */
test('phone header: the burger opens the menu with the phone number', async ({ page }) => {
  test.skip(!isPhone(page), 'the burger menu exists on a phone only');
  await page.goto('/');
  const burger = page.locator('.hd-burger');
  await expect(burger).toBeVisible();
  await burger.click();
  const menu = page.locator('#hdMenu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Курорты' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Прямые перелёты' })).toBeVisible();
  await expect(menu.locator('.hd-menu-tel')).toContainText('+972');
  // the language segment lives in the menu while the site offers more than one language
  const lang = menu.getByRole('radiogroup', { name: 'Язык сайта' });
  if (await lang.count()) await expect(lang.getByRole('radio', { name: /RU/ })).toBeVisible();
  // a page link closes the menu
  await menu.getByRole('link', { name: 'Условия' }).click();
  await expect(page).toHaveURL(/\/rules/);
  await expect(menu).toBeHidden();
  await expectNoHorizontalScroll(page);
});

/** Laptop: the full menu and the phone number sit in the green bar. */
test('laptop header: menu links and the phone number', async ({ page }) => {
  test.skip(isPhone(page), 'the full header shows on a laptop only');
  await page.goto('/');
  const header = page.locator('header.site-header');
  await expect(header.getByRole('link', { name: 'Курорты' })).toBeVisible();
  await expect(header.locator('.hd-phone')).toContainText('+972');
});
