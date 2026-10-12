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
