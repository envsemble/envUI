import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const offline = pathToFileURL(resolve('dist/DesignSystemGallery.html')).href;
const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;
const components = [
  'layout',
  'buttons',
  'icon-buttons',
  'input',
  'textarea',
  'checkbox',
  'switch',
  'radio',
  'select',
  'navigation',
  'rows',
  'cards',
  'notes',
  'empty-state',
  'loading',
  'toasts',
  'dialogs',
];
const foundations = ['colors', 'typography', 'spacing', 'icons', 'responsive', 'motion'];

test('offline reference loads every view without network or script errors', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`${offline}#/overview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design system');
  await expect(page.locator('.docs-sidebar-footer')).toContainText(`envsemble ui · ${version}`);
  for (const id of components) {
    for (const view of ['preview', 'guidelines', 'usage']) {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, `/components/${id}/${view}`);
      await expect(page.locator('.docs-tabs [aria-current="page"]')).toHaveText(
        view[0].toUpperCase() + view.slice(1),
      );
      if (view === 'preview') await expect(page.locator('.docs-preview')).toHaveCount(2);
    }
  }
  for (const id of foundations) {
    await page.evaluate((hash) => {
      location.hash = hash;
    }, `/foundations/${id}`);
    await expect(page.locator('.docs-preview')).toHaveCount(2);
  }
  await page.evaluate(() => {
    location.hash = '/getting-started';
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await expect(page.locator('.docs-code').first()).toContainText('@envsemble:registry');
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "Envsemble Inter"'))).toBe(true);
});

test('paired examples retain matching geometry and linked state', async ({ page }) => {
  await page.goto(`${offline}#/components/rows/preview`);
  const light = page.locator('.docs-preview[data-env-theme="light"]');
  const dark = page.locator('.docs-preview[data-env-theme="dark"]');
  await light.getByRole('combobox', { name: 'Row count' }).click();
  await page.getByRole('option', { name: '5 rows', exact: true }).click();
  await expect(dark.getByRole('combobox', { name: 'Row count' })).toContainText('5 rows');
  await expect(light.locator('.docs-example').first().locator('.env-row')).toHaveCount(5);
  await expect(dark.locator('.docs-example').first().locator('.env-row')).toHaveCount(5);
  for (const width of [1920, 1440, 960, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const geometry = await page.locator('.docs-preview').evaluateAll((panes) =>
      panes.map((pane) =>
        [...pane.children].map((child) => {
          const rect = child.getBoundingClientRect();
          return { y: rect.y, height: rect.height };
        }),
      ),
    );
    expect(geometry[0].length).toBe(geometry[1].length);
    geometry[0].forEach((rect, index) => {
      expect(Math.abs(rect.y - geometry[1][index].y)).toBeLessThan(1);
      expect(Math.abs(rect.height - geometry[1][index].height)).toBeLessThan(1);
    });
  }
  await page.getByRole('button', { name: 'Reset examples' }).click();
  await expect(light.getByRole('combobox', { name: 'Row count' })).toContainText('3 rows');
  await expect(dark.getByRole('combobox', { name: 'Row count' })).toContainText('3 rows');
  await page.evaluate(() => {
    location.hash = '/components/checkbox/preview';
  });
  await light.getByRole('checkbox', { name: 'Include archived items' }).check();
  await expect(dark.getByRole('checkbox', { name: 'Include archived items' })).toBeChecked();
  await page.evaluate(() => {
    location.hash = '/components/notes/preview';
  });
  await light.locator('summary').click();
  await expect(dark.locator('details')).toHaveAttribute('open', '');
});

test('offline hashes support direct links and back/forward navigation', async ({ page }) => {
  await page.goto(`${offline}#/components/select/usage`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Selects');
  await page.getByRole('link', { name: 'Guidelines', exact: true }).click();
  await page.getByRole('link', { name: 'Preview', exact: true }).click();
  await page.goBack();
  await expect(page.locator('.docs-tabs [aria-current="page"]')).toHaveText('Guidelines');
  await page.goForward();
  await expect(page.locator('.docs-tabs [aria-current="page"]')).toHaveText('Preview');
});

test('offline theme toggle inverts both panes and keeps the comparison canvas full height', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${offline}#/components/checkbox/preview`);
  const app = page.locator('.docs-app');
  const panes = page.locator('.docs-preview');
  await panes.first().getByRole('checkbox', { name: 'Include archived items' }).check();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes.last()).toHaveAttribute('data-env-theme', 'light');
  for (const pane of await panes.all())
    await expect(pane.getByRole('checkbox', { name: 'Include archived items' })).toBeChecked();
  await expect(page.locator('.docs-theme-label')).toHaveCount(0);

  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 1400 });
    const canvas = await page.locator('.docs-main').evaluate((main) => {
      const rect = main.getBoundingClientRect();
      return {
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
        background: getComputedStyle(main).backgroundImage,
      };
    });
    expect(canvas.height).toBeGreaterThanOrEqual(1400);
    expect(Math.abs(canvas.bottom - canvas.documentHeight)).toBeLessThan(1);
    expect(canvas.background).toContain('linear-gradient');
  }

  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.evaluate(() => {
    location.hash = '/foundations/colors';
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes.first().locator('.docs-swatch code').first()).toContainText('hsl(');
  const swatches = await panes.evaluateAll((columns) =>
    columns.map((column) => {
      const label = column.querySelector('.docs-palette-label')!.getBoundingClientRect();
      const swatch = column.querySelector('.docs-swatch')!.getBoundingClientRect();
      return { label: label.x, swatch: swatch.x, left: swatch.left, right: swatch.right };
    }),
  );
  expect(swatches[0].swatch).toBeGreaterThan(swatches[0].label);
  expect(swatches[1].swatch).toBeLessThan(swatches[1].label);
  expect(Math.abs(swatches[0].right - swatches[1].left)).toBeLessThan(1);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.last()).toHaveAttribute('data-env-theme', 'dark');
  await page.screenshot({
    path: testInfo.outputPath('offline-theme-light.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({
    path: testInfo.outputPath('offline-theme-dark.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.evaluate(() => {
    location.hash = '/getting-started';
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
});
