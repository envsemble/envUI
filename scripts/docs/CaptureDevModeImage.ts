import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import { defaultPorts } from '../test/CheckoutMarker.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const site = (process.argv[2] ?? `http://127.0.0.1:${defaultPorts.site}`).replace(/\/$/, '');
const page = 'docs/dev-mode';
const aspect = 16 / 10;
const margin = 24;
const scale = 2;
const quality = 0.9;
const planes = '.env-dev-scene [data-plane]';
const window = { width: 1280, height: 800 };
const ctrlWheelStepsToZoomTheCardTwoAndAHalfTimes = 9;
const wheelZoomIn = -100;

type Theme = 'light' | 'dark';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function save(tab: Page, png: Buffer, name: string, theme: Theme) {
  const webp = await tab.evaluate(
    async ({ data, quality }: { data: string; quality: number }) => {
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
  const file = resolve(
    repositoryRoot,
    `apps/site/src/figures/dev-mode/dev-mode-${name}-${theme}.webp`,
  );
  await writeFile(file, Buffer.from(webp, 'base64'));
  console.log(`Wrote ${file} (${Math.round((webp.length * 0.75) / 1024)} KB).`);
}

const planesBox = (tab: Page, extra = margin): Promise<Box> =>
  tab.evaluate(
    ({ planes, extra }: { planes: string; extra: number }) => {
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

const inside = (box: Box, size: { width: number; height: number }) => {
  const x = Math.max(0, Math.round(box.x));
  const y = Math.max(0, Math.round(box.y));
  return {
    x,
    y,
    width: Math.min(size.width - x, Math.round(box.width)),
    height: Math.min(size.height - y, Math.round(box.height)),
  };
};

async function openDevMode(
  browser: Browser,
  theme: Theme,
  viewport: { width: number; height: number },
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  const tab = await context.newPage();
  await tab.goto(`${site}/${page}`);
  await tab.getByRole('button', { name: 'Try dev mode' }).click({ timeout: 30_000 });
  await tab.locator(planes).first().waitFor();
  await tab.evaluate(() => document.fonts.ready);
  return { context, tab };
}

async function turnTo(tab: Page, name: string) {
  await tab.getByRole('button', { name: 'View', exact: true }).click();
  await tab
    .getByRole('dialog', { name: 'View' })
    .getByRole('button', { name, exact: true })
    .click();
}

async function show(tab: Page, name: string) {
  await tab.getByRole('button', { name: 'Show', exact: true }).click();
  await tab.getByRole('menuitemcheckbox', { name: new RegExp(`^${name}`) }).click();
  await tab.keyboard.press('Escape');
}

async function settle(tab: Page) {
  await tab.mouse.move(0, 0);
  await tab.waitForTimeout(500);
}

async function captureView(browser: Browser, theme: Theme) {
  const { context, tab } = await openDevMode(browser, theme, { width: 1600, height: 1000 });
  await tab.getByRole('button', { name: 'Hide the nodes' }).click();
  await tab.getByRole('button', { name: 'Hide the inspector' }).click();
  await tab.locator('.env-dev-sidebar').first().waitFor({ state: 'detached' });
  await turnTo(tab, 'Tilted');
  await tab.getByRole('button', { name: 'View settings', exact: true }).click();
  const spacing = tab.getByRole('slider', { name: 'Spacing between levels' });
  await spacing.focus();
  for (let step = 0; step < 24; step++) await tab.keyboard.press('ArrowRight');
  await tab.keyboard.press('Escape');
  await turnTo(tab, 'Tilted');
  await tab.addStyleTag({
    content:
      '.env-dev-float, .env-dev-legend, .env-dev-card, .env-dev-toggle { visibility: hidden !important; }',
  });
  await settle(tab);
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

async function captureAtWork(browser: Browser, theme: Theme) {
  const { context, tab } = await openDevMode(browser, theme, window);
  const card = tab.getByRole('treeitem', { name: /^column "env-card"/ }).first();
  const select = async () => {
    if ((await card.getAttribute('aria-selected')) !== 'true') await card.click();
  };

  await select();
  await turnTo(tab, 'Tilted');
  await settle(tab);
  await save(tab, await tab.screenshot(), 'whole', theme);

  await tab.getByRole('button', { name: 'View', exact: true }).click();
  const angles = tab.getByRole('dialog', { name: 'View' });
  await angles.waitFor();
  await tab.mouse.move(0, 0);
  await tab.waitForTimeout(400);
  const bar = (await tab.locator('.env-dev-toolbar').boundingBox())!;
  const dropdown = (await angles.boundingBox())!;
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

  await show(tab, 'Only the selected');
  await turnTo(tab, 'Tilted');
  const alone = await planesBox(tab, 0);
  await tab.mouse.move(alone.x + alone.width / 2, alone.y + alone.height / 2);
  await tab.keyboard.down('Control');
  for (let step = 0; step < ctrlWheelStepsToZoomTheCardTwoAndAHalfTimes; step++)
    await tab.mouse.wheel(0, wheelZoomIn);
  await tab.keyboard.up('Control');
  await settle(tab);
  await save(
    tab,
    await tab.screenshot({ clip: inside(await planesBox(tab), window) }),
    'spacing',
    theme,
  );
  await show(tab, 'Only the selected');

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
  const tree = (await tab.locator('aside[data-side="tree"]').boundingBox())!;
  const lastRow = (await tab.locator('.env-dev-tree [role=treeitem]').last().boundingBox())!;
  await save(
    tab,
    await tab.screenshot({
      clip: inside({ ...tree, height: lastRow.y + lastRow.height + 12 - tree.y }, window),
    }),
    'problems',
    theme,
  );
  const inspector = (await tab.locator('aside.env-dev-sidebar').last().boundingBox())!;
  const tokens = (await tab.getByText('Tokens its styles use', { exact: true }).boundingBox())!;
  await save(
    tab,
    await tab.screenshot({
      clip: inside({ ...inspector, height: tokens.y - 8 - inspector.y }, window),
    }),
    'inspector',
    theme,
  );

  await turnTo(tab, 'Front');
  await settle(tab);
  const frame = (await tab.locator('.env-dev-frame').boundingBox())!;
  const label = (await tab.locator('.env-dev-frame-label').boundingBox())!;
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
  for (const theme of ['light', 'dark'] as const) {
    await captureView(browser, theme);
    await captureAtWork(browser, theme);
  }
} finally {
  await browser.close();
}
