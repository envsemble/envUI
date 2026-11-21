import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { defaultPorts, resolveServers } from './scripts/DevServers.ts';

const projectFlag = '--project=';
const namedProjects = process.argv.flatMap((argument, index, all) =>
  argument === '--project'
    ? [all[index + 1]]
    : argument.startsWith(projectFlag)
      ? [argument.slice(projectFlag.length)]
      : [],
);

const allServers = ['site', 'site-build', 'fixture'];
const scansOnlyTheHostedBuild = () =>
  namedProjects.length > 0 && namedProjects.every((project) => project === 'a11y');

function wantedServers() {
  if (process.env.ENVUI_SERVERS)
    return new Set(process.env.ENVUI_SERVERS.split(',').filter((name) => name !== 'none'));
  if (scansOnlyTheHostedBuild()) return new Set<string>();
  return new Set(allServers);
}
const wanted = wantedServers();

const servers = await resolveServers(
  Object.fromEntries(
    Object.entries({
      site: { variable: 'ENVUI_SITE_PORT', port: defaultPorts.site, offset: 0 },
      fixture: { variable: 'ENVUI_FIXTURE_PORT', port: defaultPorts.fixture, offset: 1 },
      'site-build': {
        variable: 'ENVUI_SITE_BUILD_PORT',
        port: defaultPorts.siteBuild,
        offset: 2,
      },
    }).filter(([name]) => wanted.has(name)),
  ),
);

const workersInCI = 3;
const localShareOfCores = '50%';
const configuredWorkers = process.env.ENVUI_WORKERS;
const workers = configuredWorkers
  ? /^\d+$/.test(configuredWorkers)
    ? Number(configuredWorkers)
    : configuredWorkers
  : process.env.CI
    ? workersInCI
    : localShareOfCores;

const mostWorkersFirefoxAndWebKitGainFrom = 4;
const totalWorkers =
  typeof workers === 'number'
    ? workers
    : Math.max(1, Math.floor((availableParallelism() * parseFloat(workers)) / 100));
const runsOneEngineAlone = namedProjects.length === 1;
const engineWorkers = process.env.CI
  ? undefined
  : Math.max(
      1,
      Math.min(
        mostWorkersFirefoxAndWebKitGainFrom,
        runsOneEngineAlone ? totalWorkers : Math.floor(totalWorkers / 2),
      ),
    );

const testsThatDependOnTheEngine = /@engines/;
const bounceTrackingProtectionDisabled = 0;
const firefoxWithoutBounceTrackerWarnings = {
  firefoxUserPrefs: { 'privacy.bounceTrackingProtection.mode': bounceTrackingProtectionDisabled },
};

const softwareRasterRoundingButNotOnePercentLightness = 0.01;
const grayscaleTextAndWholeTileRedraws = ['--disable-lcd-text', '--disable-partial-raster'];

const bundleDependenciesAgainOnStart = '--force';
const buildAndPrerenderEveryPageTimeout = 180_000;

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
  projects: [
    {
      name: 'firefox',
      testIgnore: /LiveDevelopment/,
      grep: testsThatDependOnTheEngine,
      workers: engineWorkers,
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: firefoxWithoutBounceTrackerWarnings,
      },
    },
    {
      name: 'webkit',
      testIgnore: /LiveDevelopment/,
      grep: testsThatDependOnTheEngine,
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
    {
      name: 'a11y',
      testDir: './tests/accessibility',
      use: { ...devices['Desktop Chrome'], screenshot: 'off' },
    },
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
          threshold: softwareRasterRoundingButNotOnePercentLightness,
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
        launchOptions: { args: grayscaleTextAndWholeTileRedraws },
      },
    },
  ],
  webServer: [
    servers.site && {
      command: `node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${servers.site.port} --strictPort ${bundleDependenciesAgainOnStart}`,
      cwd: 'apps/site',
      url: `http://127.0.0.1:${servers.site.port}`,
      reuseExistingServer: servers.site.reuse,
    },
    servers['site-build'] && {
      command: `node scripts/test/ServeBuild.ts --app site --port ${servers['site-build'].port}`,
      url: `http://127.0.0.1:${servers['site-build'].port}`,
      reuseExistingServer: servers['site-build'].reuse,
      timeout: buildAndPrerenderEveryPageTimeout,
    },
    servers.fixture && {
      command: `node scripts/test/ServeBuild.ts --app fixture --port ${servers.fixture.port}`,
      url: `http://127.0.0.1:${servers.fixture.port}`,
      reuseExistingServer: servers.fixture.reuse,
    },
  ].filter((server) => server !== undefined),
});
