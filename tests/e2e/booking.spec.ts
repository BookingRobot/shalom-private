import { expect, test } from '@playwright/test';
import {
  answerRoadQuestions,
  clickNext,
  expectNoHorizontalScroll,
  fillCard,
  firstVisible,
  pickBirthDate,
  pickResort,
  watchErrors,
} from './helpers';

/**
 * The guest's main path: search on the home page → a sanatorium's rooms → the four checkout
 * steps (room & programme, road, guests, payment) → the order confirmation.
 */
test('booking: home search to the order confirmation', async ({ page }) => {
  const errors = watchErrors(page);

  // home: resort, dates, two adults (already set), «Найти санаторий»
  await page.goto('/');
  await pickResort(page, 'Друскининкай');
  await page.locator('#datein').click();
  const cal = page.locator('.cal-dlg, [role=dialog]').first();
  await expect(cal).toBeVisible();
  await cal.getByRole('button', { name: /^9 ноября/ }).click();
  await cal.getByRole('button', { name: /^18 ноября/ }).click();
  await cal.getByRole('button', { name: 'Подтвердить даты' }).click();
  await expect(page.locator('#guests')).toContainText('2 взрослых');
  await page.locator('form.search .btn-primary').click();
  await expect(page).toHaveURL(/\/results/);

  // results: open the rooms of the first sanatorium with places, choose a room
  await expect(page.getByRole('heading', { name: /Санатории/ })).toBeVisible();
  await firstVisible(page.getByRole('button', { name: 'Номера и программы' })).click();
  const choose = firstVisible(page.getByRole('link', { name: 'Выбрать номер' }));
  await expect(choose).toBeVisible();
  await choose.click();
  await expect(page).toHaveURL(/\/rooms/);

  // step 1: a programme is chosen on arrival — «Далее: дорога»
  await expectNoHorizontalScroll(page);
  await firstVisible(page.getByRole('link', { name: /Далее: дорога/ })).click();
  await expect(page).toHaveURL(/\/transfer/);

  // step 2: own tickets, then every transfer question the page asks
  await page.getByRole('radio', { name: /Нет, билеты уже есть/ }).click({ position: { x: 24, y: 24 } });
  await answerRoadQuestions(page, '/guests');
  await expect(page).toHaveURL(/\/guests/);

  // step 3: both guests, a date of birth and gender each, the phone
  await page.locator('#g1fn').fill('Mikhail');
  await page.locator('#g1ln').fill('Levin');
  await pickBirthDate(page, '#g1dob');
  // gender is never pre-chosen: the guest taps it
  await page.locator('#g1sex').getByText('Мужской').click();
  await page.locator('#g1ph').fill('50 123 4567');
  await page.locator('#g1em').fill('levin@example.com');
  await page.locator('#g2fn').fill('Irina');
  await page.locator('#g2ln').fill('Levina');
  await pickBirthDate(page, '#g2dob', '1962', '3');
  await page.locator('#g2sex').getByText('Женский').click();
  await clickNext(page, '/payment');
  await expect(page).toHaveURL(/\/payment/);

  // step 4: the card (test mode takes anything), the agreement, the payment
  await fillCard(page, 'pay');
  await page.locator('#payAgree input').check();
  await clickNext(page, '/done');
  await expect(page).toHaveURL(/\/done/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Спасибо/);
  await expectNoHorizontalScroll(page);
  expect(errors, errors.join('\n')).toEqual([]);
});
