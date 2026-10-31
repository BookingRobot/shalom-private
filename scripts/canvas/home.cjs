/** Home page boards: Main.dc.html works in Play (search card, calendar, guests, resorts, wizard). */
const { buildSearchPage } = require('./search.cjs');

module.exports = {
  build: (b, sizes, bd) => buildSearchPage(b, sizes, bd, true),
};
