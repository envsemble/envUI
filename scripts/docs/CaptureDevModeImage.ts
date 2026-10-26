// Captures the pictures of dev mode, in the light and the dark theme, each in the site of that
// theme, whose examples take its theme; dev mode takes the demo's. Each opens the real dev mode on
// the demo application in the site and saves apps/site/src/demos/dev-mode/dev-mode-<name>-
// <theme>.webp at twice the CSS size:
//
// - 3d: the picture of the dev mode guide's demo, the view's planes alone, with the node tree, the
//   inspector, the toolbar and the legend out of the picture, cropped to the planes;
// - the guide's pictures of dev mode at work (DevModePictures.tsx): whole, the whole of it with a
//   card selected; toolbar, the view's toolbar with its View dropdown open; spacing, a card alone,
//   its padding and gaps hatched; problems, the node tree on a phone, its problems counted;
//   inspector, the selected card's details with its problem, down to where its tokens start;
//   frame, the page on a phone, straight on.
//
//   npm run docs:dev-mode-image                the site at http://127.0.0.1:8770 (npm run dev)
//   npm run docs:dev-mode-image -- <site URL>  another running site
//
// Run it after a change to dev mode's UI or to the demo application, and commit the images.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = (process.argv[2] ?? 'http://127.0.0.1:8770').replace(/\/$/, '');
const page = 'docs/dev-mode';
/** The 3D picture's shape, width to height, as DevModeDemo.tsx declares it, and its margin in px. */
const aspect = 16 / 10;
const margin = 24;
const scale = 2;
const quality = 0.9;
/** The view's planes; the legend's swatches take the plane class too, so the scene scopes them. */
const planes = '.env-dev-scene [data-plane]';
/** The window the pictures of dev mode at work are taken in. */
const window = { width: 1280, height: 800 };

/** A PNG screenshot as WebP: the browser encodes it, so the script needs no image library. */
async function save(tab, png, name, theme) {
  const webp = await tab.evaluate(
    async ({ data, quality }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', quality).split(',')[1];
    },
    { data: png.toString('base64'), quality },
  );
  const file = resolve(root, `apps/site/src/demos/dev-mode/dev-mode-${name}-${theme}.webp`);
  await writeFile(file, Buffer.from(webp, 'base64'));
  console.log(`Wrote ${file} (${Math.round((webp.length * 0.75) / 1024)} KB).`);
}

/** The box around the planes, with a margin. */
const planesBox = (tab, extra = margin) =>
  tab.evaluate(
    ({ planes, extra }) => {
      const boxes = [...document.querySelectorAll(planes)]
        .map((plane) => plane.getBoundingClientRect())
        .filter((rect) => rect.width > 1 && rect.height > 1);
      const left = Math.min(...boxes.map((rect) => rect.left)) - extra;
      const top = Math.min(...boxes.map((rect) => rect.top)) - extra;
      const right = Math.max(...boxes.map((rect) => rect.right)) + extra;
      const bottom = Math.max(...boxes.map((rect) => rect.bottom)) + extra;
      return { x: left, y: top, width: right - left, height: bottom - top };
    },
    { planes, extra },
  );

/** A box rounded to whole pixels and kept inside the window. */
const inside = (box, size) => {
  const x = Math.max(0, Math.round(box.x));
  const y = Math.max(0, Math.round(box.y));
  return {
    x,
    y,
    width: Math.min(size.width - x, Math.round(box.width)),
    height: Math.min(size.height - y, Math.round(box.height)),
  };
};

/** Opens the Docs' dev mode page in a theme, and dev mode on its demo with Try dev mode. */
async function openDevMode(browser, theme, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  const tab = await context.newPage();
  await tab.goto(`${site}/${page}`);
  // Try dev mode puts the application in the picture's place and opens dev mode over it, with
  // the responsive frame off.
  await tab.getByRole('button', { name: 'Try dev mode' }).click({ timeout: 30_000 });
  await tab.locator(planes).first().waitFor();
  await tab.evaluate(() => document.fonts.ready);
  return { context, tab };
}

/** Picks an angle in the toolbar's View dropdown, with the whole page in view. */
async function turnTo(tab, name) {
  await tab.getByRole('button', { name: 'View', exact: true }).click();
  await tab
    .getByRole('dialog', { name: 'View' })
    .getByRole('button', { name, exact: true })
    .click();
}

/** Turns a check item of the toolbar's Show dropdown on or off, and closes the dropdown. */
async function show(tab, name) {
  await tab.getByRole('button', { name: 'Show', exact: true }).click();
  await tab.getByRole('menuitemcheckbox', { name: new RegExp(`^${name}`) }).click();
  await tab.keyboard.press('Escape');
}

/** Waits for the view to settle after a change, with the pointer out of the way. */
async function settle(tab) {
  await tab.mouse.move(0, 0);
  await tab.waitForTimeout(500);
}

/** Dev mode's 3D view of the demo application alone, as the dev mode guide's demo shows it. */
async function captureView(browser, theme) {
  const { context, tab } = await openDevMode(browser, theme, { width: 1600, height: 1000 });
  // The node tree and the inspector are hidden, so the view takes the whole window.
  await tab.getByRole('button', { name: 'Hide the nodes' }).click();
  await tab.getByRole('button', { name: 'Hide the inspector' }).click();
  await tab.locator('.env-dev-sidebar').first().waitFor({ state: 'detached' });
  // The whole application in view, its levels pulled further apart than by default.
  await turnTo(tab, 'Tilted');
  await tab.getByRole('button', { name: 'View settings', exact: true }).click();
  const spacing = tab.getByRole('slider', { name: 'Spacing between levels' });
  await spacing.focus();
  for (let step = 0; step < 24; step++) await tab.keyboard.press('ArrowRight');
  await tab.keyboard.press('Escape');
  await turnTo(tab, 'Tilted');
  // The view's floating toolbar and corner buttons, its legend and the card under the pointer stay out of the
  // picture; the view keeps its size.
  await tab.addStyleTag({
    content:
      '.env-dev-float, .env-dev-legend, .env-dev-card, .env-dev-toggle { visibility: hidden !important; }',
  });
  await settle(tab);
  // The planes' extent, with a margin, widened or heightened to the picture's shape.
  const box = await planesBox(tab);
  let { width, height } = box;
  if (width / height > aspect) height = width / aspect;
  else width = height * aspect;
  const x = Math.round(box.x + box.width / 2 - width / 2);
  const y = Math.round(box.y + box.height / 2 - height / 2);
  const png = await tab.screenshot({
    clip: { x, y, width: Math.round(width), height: Math.round(height) },
  });
  await save(tab, png, '3d', theme);
  await context.close();
}

/** Dev mode at work on the demo application, in the pictures the dev mode guide shows. */
async function captureAtWork(browser, theme) {
  const { context, tab } = await openDevMode(browser, theme, window);
  const card = tab.getByRole('treeitem', { name: /^column "env-card"/ }).first();
  // Clicking the selected node again would clear the selection.
  const select = async () => {
    if ((await card.getAttribute('aria-selected')) !== 'true') await card.click();
  };

  // The whole of dev mode, a card selected: the tree, the view and the inspector.
  await select();
  await turnTo(tab, 'Tilted');
  await settle(tab);
  await save(tab, await tab.screenshot(), 'whole', theme);

  // The view's toolbar, its View dropdown open on the angles.
  await tab.getByRole('button', { name: 'View', exact: true }).click();
  const angles = tab.getByRole('dialog', { name: 'View' });
  await angles.waitFor();
  await tab.mouse.move(0, 0);
  await tab.waitForTimeout(400);
  const bar = await tab.locator('.env-dev-toolbar').boundingBox();
  const dropdown = await angles.boundingBox();
  const barLeft = Math.min(bar.x, dropdown.x) - 12;
  const barRight = Math.max(bar.x + bar.width, dropdown.x + dropdown.width) + 12;
  await save(
    tab,
    await tab.screenshot({
      clip: inside(
        {
          x: barLeft,
          y: bar.y - 8,
          width: barRight - barLeft,
          height: dropdown.y + dropdown.height + 12 - bar.y + 8,
        },
        window,
      ),
    }),
    'toolbar',
    theme,
  );
  await tab.keyboard.press('Escape');

  // The card alone, close up, its padding and gaps hatched.
  await show(tab, 'Only the selected');
  await turnTo(tab, 'Tilted');
  // Ctrl+wheel zooms toward the pointer, a tenth a step: the card about twice and a half as big.
  const alone = await planesBox(tab, 0);
  await tab.mouse.move(alone.x + alone.width / 2, alone.y + alone.height / 2);
  await tab.keyboard.down('Control');
  for (let step = 0; step < 9; step++) await tab.mouse.wheel(0, -100);
  await tab.keyboard.up('Control');
  await settle(tab);
  await save(
    tab,
    await tab.screenshot({ clip: inside(await planesBox(tab), window) }),
    'spacing',
    theme,
  );
  await show(tab, 'Only the selected');

  // The page on a phone: three columns of cards squeezed, their problems counted in the tree and
  // the selected card's problem in the inspector.
  await tab.getByRole('button', { name: 'Responsive', exact: true }).click();
  await tab.getByRole('menuitemcheckbox', { name: /^Responsive frame/ }).click();
  await tab.getByRole('menuitem', { name: /^Device/ }).click();
  await tab
    .locator('[role=menuitemradio]')
    .filter({ hasText: /^iPhone 15393/ })
    .click();
  await select();
  await turnTo(tab, 'Tilted');
  await settle(tab);
  const tree = await tab.locator('aside[data-side="tree"]').boundingBox();
  const lastRow = await tab.locator('.env-dev-tree [role=treeitem]').last().boundingBox();
  await save(
    tab,
    await tab.screenshot({
      clip: inside({ ...tree, height: lastRow.y + lastRow.height + 12 - tree.y }, window),
    }),
    'problems',
    theme,
  );
  const inspector = await tab.locator('aside.env-dev-sidebar').last().boundingBox();
  const tokens = await tab.getByText('Tokens its styles use', { exact: true }).boundingBox();
  await save(
    tab,
    await tab.screenshot({
      clip: inside({ ...inspector, height: tokens.y - 8 - inspector.y }, window),
    }),
    'inspector',
    theme,
  );

  // The page on a phone, straight on, with the frame and its size above it.
  // Tilted would tilt the view again.
  await turnTo(tab, 'Front');
  await settle(tab);
  const frame = await tab.locator('.env-dev-frame').boundingBox();
  const label = await tab.locator('.env-dev-frame-label').boundingBox();
  const top = Math.min(frame.y, label.y);
  const left = Math.min(frame.x, label.x);
  const right = Math.max(frame.x + frame.width, label.x + label.width);
  await save(
    tab,
    await tab.screenshot({
      clip: inside(
        {
          x: left - margin,
          y: top - margin,
          width: right - left + 2 * margin,
          height: frame.y + frame.height - top + 2 * margin,
        },
        window,
      ),
    }),
    'frame',
    theme,
  );
  await context.close();
}

const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    await captureView(browser, theme);
    await captureAtWork(browser, theme);
  }
} finally {
  await browser.close();
}
