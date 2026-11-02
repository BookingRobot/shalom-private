import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, fillCard, pickBirthDate, watchErrors } from './helpers';

/**
 * Direct flights sold on their own: dates there and back (only days with our flight), passengers,
 * the passenger form with the date-of-birth picker, the card, the paid confirmation.
 */
test('tickets: dates, passengers, card, confirmation', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/tickets');

  // dates: a day with our flight there, far enough ahead to buy online (not within 24 hours);
  // the calendar then moves on to the way back
  await page.locator('.tk-date').first().click();
  const cal = page.getByRole('dialog');
  await expect(cal).toBeVisible();
  await cal
    .getByRole('button', { name: /есть рейс/ })
    .nth(2)
    .click();
  await expect(cal.getByRole('heading', { level: 2 })).toContainText(/обратно/i);
  await cal
    .getByRole('button', { name: /есть рейс/ })
    .first()
    .click();
  await expect(cal).toBeHidden();

  // two passengers (the default), «Найти рейсы», buy online
  await page.locator('.tk-go').click();
  await expect(page.locator('#tkRes')).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.locator('.tk-buy').click();

  // passengers: names as in the passport, dates of birth, contacts
  for (const [i, name] of [
    ['IVAN', 'PETROV'],
    ['OLGA', 'PETROVA'],
  ].entries()) {
    await page.locator(`#tk-p${i}first`).fill(name[0]);
    await page.locator(`#tk-p${i}last`).fill(name[1]);
    await pickBirthDate(page, `#tk-p${i}birth`, '1958', '7');
  }
  await page.locator('#tk-phone').fill('50 123 4567');
  await page.locator('#tk-email').fill('petrov@example.com');
  await page.locator('.tk-next').click();

  // the card and the agreement; the test payment takes about a second
  await fillCard(page, 'tk');
  await page.locator('.tk-agree input[type=checkbox]').last().check();
  await page.locator('.tk-pay').click();
  await expect(page.locator('.tk-done')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.tk-done')).toContainText(/Билеты оплачены/);
  await expectNoHorizontalScroll(page);
  expect(errors, errors.join('\n')).toEqual([]);
});
