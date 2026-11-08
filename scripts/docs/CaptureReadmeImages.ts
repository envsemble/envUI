// Captures the README's pictures, in the light and the dark theme: the catalogue's overview, its
// banner and the fan of cards under it, and the top of the components' gallery, saved as
// assets/readme/<picture>-<theme>.png. The package ships them with its README (BuildLibrary.ts).
//
//   npm run docs:readme-images
//
// It starts the site's development server on ENVUI_SITE_PORT, else 8770, else a port of this
// checkout's own (CheckoutMarker.ts), or reuses this checkout's server already running there. Run
// it when the site's look changes, such as before a release, look at the images, and commit them.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { defaultPorts, resolveServers } from '../test/CheckoutMarker.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

/**
 * The pictures: each a page in a desktop window, cut off at `end`, an element of the page, halfway
 * through the space under it. The gallery's window is wider than the overview's, so a row holds
 * three tiles rather than two.
 */
const pictures = [
  {
    name: 'overview',
    path: '/',
    window: { width: 1440, height: 900 },
    // The fan of cards, under the banner.
    end: '.catalogue-fan',
  },
  {
    name: 'gallery',
    path: '/components',
    window: { width: 1920, height: 1200 },
    // The first group's tiles, under the banner.
    end: '.catalogue-gallery-grid',
  },
] as const;
/** Pixels to a CSS pixel, so the pictures stay sharp on a high-density screen. */
const deviceScaleFactor = 2;

const { site } = await resolveServers({
  site: { variable: 'ENVUI_SITE_PORT', port: defaultPorts.site, offset: 0 },
});
let server: ViteDevServer | undefined;
if (!site.reuse) {
  server = await createServer({
    root: resolve(root, 'apps/site'),
    configFile: resolve(root, 'apps/site/vite.config.ts'),
    logLevel: 'warn',
    server: { host: '127.0.0.1', port: site.port, strictPort: true },
  });
  await server.listen();
}
const origin = `http://127.0.0.1:${site.port}`;

/** Waits until the page has settled: every part loaded, the fonts in, every entrance finished. */
async function settle(page: Page, end: string) {
  await page.locator('main h1').first().waitFor();
  await page.locator(end).first().waitFor();
  // No outline of a section is left (template/SectionOutline.ts), nor a skeleton of a part
  // (loading/Loading.tsx).
  await page.locator('[data-site-pending]').first().waitFor({ state: 'detached' });
  await page.locator('.site-loading').first().waitFor({ state: 'detached' });
  // Every gallery tile in the window shows its picture, fitted to its stage (figures/TileStage.tsx).
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.catalogue-gallery-tile')]
      .filter((tile) => tile.getBoundingClientRect().top < innerHeight)
      .every((tile) => tile.querySelector('.catalogue-related-canvas[data-fitted]')),
  );
  // The fonts and every entrance settle before the picture is taken; an animation that runs
  // forever, follows the scroll, as the drawer's fade does, is held still, as a tile's picture is
  // at rest, or is cancelled as the page settles, isn't waited for.
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
        // With motion, as most readers see the site, whatever the machine's own setting.
        reducedMotion: 'no-preference',
      });
      // The first load of a page warms the development server, which may optimize a dependency
      // and reload the page; the picture is taken on the second.
      for (const _load of [0, 1]) {
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
        await settle(page, end);
      }
      // Halfway through the space between the end element and what follows it.
      const height = await page.evaluate((selector) => {
        const element = document.querySelector(selector)!;
        const bottom = element.getBoundingClientRect().bottom;
        const next = element.nextElementSibling ?? element.parentElement?.nextElementSibling;
        const after = next ? next.getBoundingClientRect().top : bottom;
        return Math.min(innerHeight, Math.round(bottom + Math.max(0, after - bottom) / 2));
      }, end);
      const file = resolve(root, `assets/readme/${name}-${theme}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: window.width, height } });
      console.log(`Wrote ${file}.`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
}
