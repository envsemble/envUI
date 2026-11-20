import { resolve } from 'node:path';
import { chromium, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { defaultPorts, resolveServers } from '../DevServers.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const pictures = [
  {
    name: 'overview',
    path: '/',
    window: { width: 1440, height: 900 },
    end: '.catalogue-fan',
  },
  {
    name: 'gallery',
    path: '/components',
    window: { width: 1920, height: 1200 },
    end: '.catalogue-gallery-grid',
  },
] as const;
const deviceScaleFactor = 2;

const { site } = await resolveServers({
  site: { variable: 'ENVUI_SITE_PORT', port: defaultPorts.site, offset: 0 },
});
let server: ViteDevServer | undefined;
if (!site.reuse) {
  server = await createServer({
    root: resolve(repositoryRoot, 'apps/site'),
    configFile: resolve(repositoryRoot, 'apps/site/vite.config.ts'),
    logLevel: 'warn',
    server: { host: '127.0.0.1', port: site.port, strictPort: true },
  });
  await server.listen();
}
const origin = `http://127.0.0.1:${site.port}`;

async function settle(page: Page, end: string) {
  await page.locator('main h1').first().waitFor();
  await page.locator(end).first().waitFor();
  await page.locator('[data-site-pending]').first().waitFor({ state: 'detached' });
  await page.locator('.site-loading').first().waitFor({ state: 'detached' });
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.catalogue-gallery-tile')]
      .filter((tile) => tile.getBoundingClientRect().top < innerHeight)
      .every((tile) => tile.querySelector('.catalogue-tile-canvas[data-fitted]')),
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    const entrances = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.playState === 'running' &&
          animation.timeline === document.timeline &&
          animation.effect?.getComputedTiming().iterations !== Infinity,
      );
    await Promise.allSettled(entrances.map((animation) => animation.finished));
  });
}

const browser = await chromium.launch();
try {
  for (const { name, path, window, end } of pictures) {
    for (const theme of ['light', 'dark'] as const) {
      const page = await browser.newPage({
        viewport: window,
        deviceScaleFactor,
        colorScheme: theme,
        reducedMotion: 'no-preference',
      });
      for (const _load of ['warm the development server', 'capture']) {
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
        await settle(page, end);
      }
      const height = await page.evaluate((selector) => {
        const element = document.querySelector(selector)!;
        const bottom = element.getBoundingClientRect().bottom;
        const next = element.nextElementSibling ?? element.parentElement?.nextElementSibling;
        const after = next ? next.getBoundingClientRect().top : bottom;
        return Math.min(innerHeight, Math.round(bottom + Math.max(0, after - bottom) / 2));
      }, end);
      const file = resolve(repositoryRoot, `assets/readme/${name}-${theme}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: window.width, height } });
      console.log(`Wrote ${file}.`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
}
