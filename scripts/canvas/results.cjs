/**
 * Results boards: Results-B.dc.html works in Play (search card, filters, comparison, price
 * calendar, rooms); the setups below are the states that need more than a few clicks.
 */
const { buildSearchPage } = require('./search.cjs');
const { locate } = require('./find.cjs');

const setups = {
  /** «Ваши пожелания» filled in, with a marked spot and a second whole-screen shot */
  async feedback(p) {
    await locate(p, { canvas: 'footer', role: 'button', name: 'Ваши пожелания' }).click();
    // mark the «Фильтры» button on the page
    const box = await locate(p, { canvas: 'results-head', role: 'button', name: 'Фильтры' }).boundingBox();
    await p.mouse.move(box.x + 10, box.y + 10);
    await p.mouse.click(box.x + 10, box.y + 10);
    await locate(p, { canvas: 'feedback-form' }).waitFor({ timeout: 15000 });
    await p.fill('[data-f=title]', 'Фильтры хочу видеть сразу');
    await p.fill('[data-f=description]', 'Хочу, чтобы фильтры были видны сразу, без нажатия на кнопку.');
    await p.fill('[data-f=name]', 'Ирина');
    // one more screenshot: the whole screen
    await locate(p, { canvas: 'feedback-form', role: 'button', name: 'Ещё снимок экрана' }).click();
    await locate(p, { canvas: 'feedback-mark', role: 'button', name: 'Весь экран' }).click();
    await locate(p, { canvas: 'feedback-form' }).waitFor({ timeout: 15000 });
    // the previews are blob: URLs — keep them as pictures in the board
    await p.evaluate(async () => {
      const form = document.querySelector('[data-canvas="feedback-form"]');
      form.querySelectorAll('a[href^="blob:"]').forEach((a) => a.removeAttribute('href'));
      form.querySelectorAll('img[src^="blob:"]').forEach((img) => {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 200;
        c.getContext('2d').drawImage(img, 0, 0, c.width, (c.width * img.naturalHeight) / img.naturalWidth);
        img.src = c.toDataURL('image/jpeg', 0.8);
      });
    });
    await p.waitForTimeout(200);
  },
};

module.exports = {
  setups,
  build: (b, sizes, bd) => buildSearchPage(b, sizes, bd, false),
};
