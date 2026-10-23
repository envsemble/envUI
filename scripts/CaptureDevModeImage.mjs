// Captures the dev mode page's picture: dev mode's 3D view of the demo application, in the light
// and the dark theme, as apps/catalogue/src/demos/dev-mode/dev-mode-3d-{light,dark}.webp. It opens
// the real dev mode in the catalogue, hides dev mode's own panels and controls, so the picture
// holds only the view's planes, and crops to them at twice the CSS size.
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
    // The page starts the demo on a press, and opens dev mode on another.
    await tab.getByRole('button', { name: /^(Try|Open) dev mode$/ }).waitFor({ timeout: 30_000 });
    const start = tab.getByRole('button', { name: 'Try dev mode' });
    if (await start.count()) await start.click();
    const open = tab.getByRole('button', { name: 'Open dev mode' });
    await open.click({ timeout: 30_000 });
    await tab.locator('.env-dev-plane').first().waitFor();
    // The whole application in view, its levels pulled further apart than by default.
    await tab.getByRole('button', { name: 'Fit', exact: true }).click();
    const spacing = tab.getByRole('slider', { name: 'Spacing between levels' });
    await spacing.focus();
    for (let step = 0; step < 24; step++) await tab.keyboard.press('ArrowRight');
    await tab.getByRole('button', { name: 'Fit', exact: true }).click();
    // Dev mode's panels and controls stay out of the picture; the view keeps its size.
    await tab.addStyleTag({
      content:
        '.env-dev-controls, .env-dev-inspector, .env-dev-toggle { visibility: hidden !important; }',
    });
    await tab.evaluate(() => document.fonts.ready);
    await tab.waitForTimeout(500);
    // The planes' extent, with a margin, widened or heightened to the picture's shape.
    const box = await tab.evaluate(() => {
      const boxes = [...document.querySelectorAll('.env-dev-plane')]
        .map((plane) => plane.getBoundingClientRect())
        .filter((rect) => rect.width > 1 && rect.height > 1);
      return {
        left: Math.min(...boxes.map((rect) => rect.left)),
        top: Math.min(...boxes.map((rect) => rect.top)),
        right: Math.max(...boxes.map((rect) => rect.right)),
        bottom: Math.max(...boxes.map((rect) => rect.bottom)),
      };
    });
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
