// Captures the dev mode page's picture: dev mode's 3D view of the demo application, in the light
// and the dark theme, as apps/catalogue/src/demos/dev-mode/dev-mode-3d-{light,dark}.webp. It opens
// the real dev mode in the catalogue, closes dev mode's node tree and inspector and hides the view's
// toolbar and legend, so the picture holds only the view's planes, and crops to them at twice the CSS size.
//
//   npm run docs:dev-mode-image                    the catalogue at http://127.0.0.1:8770 (npm run dev)
//   npm run docs:dev-mode-image -- <catalogue URL>  another running catalogue
//
// Run it after a change to dev mode's 3D view or to the demo application, and commit the images.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogue = (process.argv[2] ?? 'http://127.0.0.1:8770').replace(/\/$/, '');
const page = 'docs/dev-mode';
/** The picture's shape, width to height, as DevModeDemo.tsx declares it, and its margin in px. */
const aspect = 16 / 10;
const margin = 24;
const scale = 2;
const quality = 0.9;
/** The view's planes; the legend's swatches take the plane class too, so the scene scopes them. */
const planes = '.env-dev-scene [data-plane]';

const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: scale,
      colorScheme: theme,
      reducedMotion: 'reduce',
    });
    const tab = await context.newPage();
    await tab.goto(`${catalogue}/${page}`);
    // Try dev mode puts the application in the picture's place and opens dev mode over it, with
    // the responsive frame off.
    await tab.getByRole('button', { name: 'Try dev mode' }).click({ timeout: 30_000 });
    await tab.locator(planes).first().waitFor();
    // The node tree and the inspector are closed, so the view takes the whole window.
    for (const panel of ['Nodes', 'Inspector']) {
      const toggle = tab.getByRole('button', { name: panel, exact: true });
      if ((await toggle.getAttribute('aria-pressed')) === 'true') await toggle.click();
    }
    await tab.locator('.env-dev-sidebar').first().waitFor({ state: 'detached' });
    // The whole application in view, its levels pulled further apart than by default.
    await tab.getByRole('button', { name: 'Fit', exact: true }).click();
    await tab.getByRole('button', { name: 'View settings', exact: true }).click();
    const spacing = tab.getByRole('slider', { name: 'Spacing between levels' });
    await spacing.focus();
    for (let step = 0; step < 24; step++) await tab.keyboard.press('ArrowRight');
    await tab.keyboard.press('Escape');
    await tab.getByRole('button', { name: 'Fit', exact: true }).click();
    // The view's floating toolbar, its legend and the card under the pointer stay out of the
    // picture; the view keeps its size.
    await tab.mouse.move(0, 0);
    await tab.addStyleTag({
      content:
        '.env-dev-float, .env-dev-legend, .env-dev-card, .env-dev-toggle { visibility: hidden !important; }',
    });
    await tab.evaluate(() => document.fonts.ready);
    await tab.waitForTimeout(500);
    // The planes' extent, with a margin, widened or heightened to the picture's shape.
    const box = await tab.evaluate((planes) => {
      const boxes = [...document.querySelectorAll(planes)]
        .map((plane) => plane.getBoundingClientRect())
        .filter((rect) => rect.width > 1 && rect.height > 1);
      return {
        left: Math.min(...boxes.map((rect) => rect.left)),
        top: Math.min(...boxes.map((rect) => rect.top)),
        right: Math.max(...boxes.map((rect) => rect.right)),
        bottom: Math.max(...boxes.map((rect) => rect.bottom)),
      };
    }, planes);
    let width = box.right - box.left + 2 * margin;
    let height = box.bottom - box.top + 2 * margin;
    if (width / height > aspect) height = width / aspect;
    else width = height * aspect;
    const x = Math.round((box.left + box.right) / 2 - width / 2);
    const y = Math.round((box.top + box.bottom) / 2 - height / 2);
    const png = await tab.screenshot({
      clip: { x, y, width: Math.round(width), height: Math.round(height) },
    });
    // The browser encodes the WebP, so the script needs no image library.
    const webp = await tab.evaluate(
      async ({ data, quality }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', quality).split(',')[1];
      },
      { data: png.toString('base64'), quality },
    );
    const file = resolve(root, `apps/catalogue/src/demos/dev-mode/dev-mode-3d-${theme}.webp`);
    await writeFile(file, Buffer.from(webp, 'base64'));
    console.log(`Wrote ${file} (${Math.round((webp.length * 0.75) / 1024)} KB).`);
    await context.close();
  }
} finally {
  await browser.close();
}
