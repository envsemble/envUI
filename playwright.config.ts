import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { catalogueUrl, cataloguePort, fixtureUrl, fixturePort } from './tests/browser/Servers';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 3,
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
    { name: 'chromium', testIgnore: /LiveDevelopment/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: /LiveDevelopment/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: /LiveDevelopment/, use: { ...devices['Desktop Safari'] } },
    {
      name: 'live-development',
      testMatch: /LiveDevelopment/,
      dependencies: ['chromium', 'firefox', 'webkit'],
      use: { ...devices['Desktop Chrome'] },
    },
    // `npm run test:a11y`: axe over every catalogue page in both themes, Chromium only. Its setup
    // first removes the lock a stopped update can leave on KnownViolations.json.
    { name: 'a11y-setup', testDir: './tests/accessibility', testMatch: /Lock\.setup\.ts/ },
    {
      name: 'a11y',
      testDir: './tests/accessibility',
      dependencies: ['a11y-setup'],
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
      },
    },
  ],
  webServer: [
    {
      command: `node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${cataloguePort} --strictPort`,
      cwd: 'apps/catalogue',
      url: catalogueUrl,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node node_modules/vite/bin/vite.js --config tests/fixture/vite.config.ts --host 127.0.0.1 --port ${fixturePort} --strictPort`,
      url: fixtureUrl,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
