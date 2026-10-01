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
