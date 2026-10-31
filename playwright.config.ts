import { defineConfig, devices } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * End-to-end tests of the built site (tests/e2e). `npm run build` first, then `npm run test:e2e`:
 * the config starts `vite preview` on the build itself (PW_DIST picks another output folder,
 * PW_BASE_URL points the tests at a server that is already running, e.g. the live site).
 */
const PORT = 4190;
const baseURL = process.env.PW_BASE_URL || `http://localhost:${PORT}`;
const dist = process.env.PW_DIST || 'dist';

/**
 * Outside CI the browser may be pre-installed under another Playwright build: use that binary
 * (PW_CHROMIUM, or the first chrome found in the usual browser folders) instead of downloading.
 */
function localChromium(): string | undefined {
  if (process.env.CI) return undefined;
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), '.cache', 'ms-playwright'), '/opt/pw-browsers'];
  for (const root of roots) {
    if (!root || !existsSync(root)) continue;
    for (const dir of readdirSync(root)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort()
      .reverse()) {
      for (const sub of ['chrome-linux64', 'chrome-linux']) {
        const bin = join(root, dir, sub, 'chrome');
        if (existsSync(bin)) return bin;
      }
    }
  }
  return undefined;
}
const executablePath = localChromium();

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ru-RU',
    timezoneId: 'Asia/Jerusalem',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    {
      // a guest's phone: the burger menu, the resort sheet, the sticky «Далее» bar
      name: 'phone',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
    {
      // a laptop: the full header, the search row on one line, three columns in the compare window
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } },
    },
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npx vite preview --outDir ${dist} --port ${PORT} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
