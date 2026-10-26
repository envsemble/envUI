import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { resolveServers } from './scripts/CheckoutMarker.mjs';

/**
 * The development servers this run needs: ENVUI_SERVERS lists them (site, fixture, or none; the
 * site's name before, catalogue, still counts),
 * as `npm run check` sets it for the specs it picked. Without it a run that only scans the hosted
 * build (the a11y projects) needs none, and any other run needs both.
 */
function wantedServers() {
  if (process.env.ENVUI_SERVERS)
    return new Set(
      process.env.ENVUI_SERVERS.split(',')
        .filter((name) => name !== 'none')
        .map((name) => (name === 'catalogue' ? 'site' : name)),
    );
  const projects = process.argv.flatMap((argument, index, all) =>
    argument === '--project'
      ? [all[index + 1]]
      : argument.startsWith('--project=')
        ? [argument.slice(10)]
        : [],
  );
  if (projects.length && projects.every((project) => project === 'a11y')) return new Set<string>();
  return new Set(['site', 'fixture']);
}
const wanted = wantedServers();

// Ports, and whether a server running there belongs to this checkout and can be reused. Specs read
// the chosen ports through tests/browser/Servers.ts; see scripts/CheckoutMarker.mjs.
// The site's port was ENVUI_CATALOGUE_PORT before, which still chooses it.
process.env.ENVUI_SITE_PORT ||= process.env.ENVUI_CATALOGUE_PORT;
const servers = await resolveServers(
  Object.fromEntries(
    Object.entries({
      site: { variable: 'ENVUI_SITE_PORT', port: 8770, offset: 0 },
      fixture: { variable: 'ENVUI_FIXTURE_PORT', port: 8766, offset: 1 },
    }).filter(([name]) => wanted.has(name)),
  ),
);

/**
 * Browser workers: ENVUI_WORKERS, a count or a share of the cores such as 50%; else half the cores
 * locally and 3 in CI. Each worker runs one browser, and the development servers serve them all.
 */
const configured = process.env.ENVUI_WORKERS;
const workers = configured
  ? /^\d+$/.test(configured)
    ? Number(configured)
    : configured
  : process.env.CI
    ? 3
    : '50%';
/**
 * Firefox and WebKit stop gaining beyond a few workers each (on 24 threads, about 1.5 tests a second
 * from 4 workers on), and with more their slowest specs run out of time. Locally each takes at most
 * half the workers, and 4; CI keeps its 3 shared. They come first in the projects, so their capped
 * share starts at once and Chromium and the accessibility scan, uncapped, fill the rest and the end.
 */
const totalWorkers =
  typeof workers === 'number'
    ? workers
    : Math.max(1, Math.floor((availableParallelism() * parseFloat(workers)) / 100));
const engineWorkers = process.env.CI
  ? undefined
  : Math.max(1, Math.min(4, Math.floor(totalWorkers / 2)));

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers,
  reporter: process.env.CI
    ? [['github'], ['json', { outputFile: 'test-results/results.json' }]]
    : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  // `npm run test:browser` runs the behavior projects; the gates below have their own scripts.
  projects: [
    // Firefox and WebKit run only the tests tagged @engines, which depend on the engine; the rest,
    // and the contrast gate (`npm run test:contrast`), run once, in Chromium.
    {
      name: 'firefox',
      testIgnore: /LiveDevelopment/,
      grep: /@engines/,
      workers: engineWorkers,
      use: {
        ...devices['Desktop Firefox'],
        // Firefox's bounce-tracking protection, after many quick visits to one address, warns that
        // 127.0.0.1 "has been classified as a bounce tracker" in the console of whichever test is
        // running, which fails the specs that collect console warnings.
        launchOptions: {
          // 0 is MODE_DISABLED: no classification, so no warning.
          firefoxUserPrefs: { 'privacy.bounceTrackingProtection.mode': 0 },
        },
      },
    },
    {
      name: 'webkit',
      testIgnore: /LiveDevelopment/,
      grep: /@engines/,
      workers: engineWorkers,
      use: { ...devices['Desktop Safari'] },
    },
    { name: 'chromium', testIgnore: /LiveDevelopment/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'live-development',
      testMatch: /LiveDevelopment/,
      dependencies: ['chromium', 'firefox', 'webkit'],
      use: { ...devices['Desktop Chrome'] },
    },
    // `npm run test:a11y`: axe over every page of the site, Chromium only.
    {
      name: 'a11y',
      testDir: './tests/accessibility',
      use: { ...devices['Desktop Chrome'], screenshot: 'off' },
    },
    // `npm run test:visual`: the screenshot baseline, rendered in the Linux Playwright image.
    {
      name: 'visual',
      testDir: './tests/visual',
      snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
      timeout: 180_000,
      expect: {
        timeout: 15_000,
        toHaveScreenshot: {
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
          // Chromium's software raster varies anti-aliased edge pixels by ±1 per channel between
          // runs. 0.01 absorbs that rounding (a YIQ distance of about 2.6 levels) while a colour
          // change of about 1% lightness or more still fails; the default, 0.2, would miss most.
          threshold: 0.01,
          stylePath: fileURLToPath(new URL('./tests/visual/Screenshot.css', import.meta.url)),
        },
      },
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',
        colorScheme: 'light',
        // Grayscale text everywhere. Chromium draws subpixel (LCD) text only where the content
        // sits in an opaque, uncomposited layer, so a fixed or sticky element elsewhere on the page
        // would switch every specimen's antialiasing; the baseline records grayscale. Whole tiles
        // are drawn again rather than only the changed part of one: a partial redraw's edges
        // depend on which frames came before, so the tooltip's capture varied by a pixel run to run.
        launchOptions: { args: ['--disable-lcd-text', '--disable-partial-raster'] },
      },
    },
  ],
  // --force bundles the dependencies again as a server starts. Vite reuses its bundle while the
  // lockfile is unchanged, so after a change imports a dependency it holds none of, such as a code
  // theme loaded on demand, the first page to ask for it makes Vite bundle it and reload every page
  // the server has open, and the tests on those pages lose their state midway.
  webServer: [
    servers.site && {
      command: `node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${servers.site.port} --strictPort --force`,
      cwd: 'apps/site',
      url: `http://127.0.0.1:${servers.site.port}`,
      reuseExistingServer: servers.site.reuse,
    },
    servers.fixture && {
      command: `node node_modules/vite/bin/vite.js --config tests/fixture/vite.config.ts --host 127.0.0.1 --port ${servers.fixture.port} --strictPort --force`,
      url: `http://127.0.0.1:${servers.fixture.port}`,
      reuseExistingServer: servers.fixture.reuse,
    },
  ].filter((server) => server !== undefined),
});
