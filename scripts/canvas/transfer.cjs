/** Step 2 «Дорога» boards: the «Даты под наш рейс» calendar with a stay picked. */
const { locate } = require('./find.cjs');

const setups = {
  /** pick a day of arrival and a day home among the free flight days */
  async flightDates(p) {
    const free = () =>
      p.locator('[data-canvas="flight-dates"] [role="dialog"] button:not([disabled])').filter({ hasText: /^\d+/ });
    await locate(p, { canvas: 'flight-dates' }).waitFor();
    await free().nth(2).click();
    await free().nth(6).click();
    await p.waitForTimeout(200);
  },
};

module.exports = { setups };
