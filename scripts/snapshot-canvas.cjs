/**
 * Snapshot the built site into Design-canvas artboards (.dc.html), so the canvas shows exactly
 * what is online. Run against a served build:
 *
 *   npm run build && npx vite preview --port 4173
 *   NODE_PATH=$(npm root -g) node scripts/snapshot-canvas.cjs <outDir> [baseUrl]
 *
 * (baseUrl defaults to http://localhost:4173; CANVAS_DIST=<folder> when the served build is not
 * in dist — its CSS goes into the boards; BOARDS=A.dc.html,B.dc.html for a few boards only.)
 *
 * The boards are listed in scripts/canvas/boards.json; what a page needs beyond clicks lives in
 * scripts/canvas/<page>.cjs. Elements are found by data-canvas marks and roles (canvas/find.cjs),
 * never by styling classes. Output: one <file>.dc.html per board + sizes.json (height, title,
 * state, interactive, and w for boards narrower than 1280).
 */
const core = require('./canvas/core.cjs');

/** page modules: setups (named steps) and builds (boards that work in Play) */
const PAGES = {
  home: require('./canvas/home.cjs'),
  results: require('./canvas/results.cjs'),
  hotel: require('./canvas/hotel.cjs'),
  transfer: require('./canvas/transfer.cjs'),
};
const NAMED = Object.fromEntries(
  Object.entries(PAGES).flatMap(([page, m]) => Object.entries(m.setups || {}).map(([k, fn]) => [page + '.' + k, fn])),
);

(async () => {
  const { fs, path, OUT, BASE, BOARDS, playwright } = core;
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.env.BOARDS ? process.env.BOARDS.split(',') : null;
  const boards = only ? BOARDS.filter((b) => only.includes(b.file)) : BOARDS;
  console.log('canvas:', boards.length, 'boards from', BASE, '→', OUT);
  const browser = await playwright().chromium.launch();
  const sizes = {};
  // 1) every board as a still picture of its page (the height of a built board comes from here)
  for (const bd of boards) {
    try {
      await core.snapshot(browser, bd, NAMED, sizes);
    } catch (e) {
      console.error(bd.file, 'FAILED:', e.message.split('\n')[0]);
    }
  }
  // 2) boards that work in Play are rebuilt from parts captured open on the live site
  for (const bd of boards.filter((b) => b.build && sizes[b.file])) {
    try {
      await PAGES[bd.build].build(browser, sizes, bd);
    } catch (e) {
      console.error(bd.file, 'BUILD FAILED:', e.message.split('\n')[0]);
      process.exitCode = 1;
    }
  }
  const sizesFile = path.join(OUT, 'sizes.json');
  const prev = only && fs.existsSync(sizesFile) ? JSON.parse(fs.readFileSync(sizesFile, 'utf8')) : {};
  fs.writeFileSync(sizesFile, JSON.stringify({ ...prev, ...sizes }, null, 1));
  await browser.close();
  const failed = boards.filter((b) => !sizes[b.file]).map((b) => b.file);
  if (failed.length) {
    console.error('not produced:', failed.join(', '));
    process.exitCode = 1;
  }
})();
