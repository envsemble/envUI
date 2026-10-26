// Captures the README's pictures, in the light and the dark theme: a page of the catalogue and a
// page of the Docs, each the top of the page in a desktop window, saved as
// assets/readme/<part>-<theme>.png. The package ships them with its README (BuildLibrary.mjs).
//
//   npm run docs:readme-images                    the catalogue at http://127.0.0.1:8770 (npm run dev)
//   npm run docs:readme-images -- <catalogue URL>  another running catalogue
//
// Run it when the site's look changes, such as before a release, and commit the images.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogue = (process.argv[2] ?? 'http://127.0.0.1:8770').replace(/\/$/, '');
/** The pages pictured: one of the catalogue and its counterpart in the Docs. */
const pictures = [
  { part: 'catalogue', page: 'components/slider' },
  { part: 'docs', page: 'docs/components/slider' },
];
/** The window the pictures are taken in, as wide as the README shows them. */
const window = { width: 1440, height: 900 };

const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newPage({ viewport: window, colorScheme: theme });
    for (const { part, page } of pictures) {
      await context.goto(`${catalogue}/${page}`);
      await context.locator('.docs-page-banner').waitFor();
      // The fonts and every entrance settle before the picture is taken.
      await context.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(document.getAnimations().map((animation) => animation.finished));
      });
      const file = resolve(root, `assets/readme/${part}-${theme}.png`);
      await context.screenshot({ path: file });
      console.log(`Wrote ${file}.`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
