import { test, expect } from '@playwright/test';
import { catalogueUrl } from './Servers';

// Options for dense, document-centred applications: compact menus, subtle inline code and tabs that
// fill a region.

test('a compact menu has shorter rows on one pane than a standard menu', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/menu/preview`);
  await page.getByRole('button', { name: 'View options' }).click();
  const standard = page.getByRole('menu', { name: 'View options' });
  const standardRow = await standard.getByRole('menuitemradio', { name: 'Name' }).boundingBox();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'File actions' }).click();
  const compact = page.getByRole('menu', { name: 'File actions' });
  await expect(compact).toHaveAttribute('data-density', 'compact');
  const compactRow = await compact.getByRole('menuitem', { name: 'Open' }).boundingBox();
  expect(compactRow!.height).toBeLessThanOrEqual(34);
  expect(compactRow!.height).toBeLessThan(standardRow!.height);
  await expect(compact.getByRole('separator')).toHaveCount(1);
  await compact.getByRole('menuitem', { name: 'Rename' }).click();
  await expect(compact).toBeHidden();
});

test('subtle inline code follows the theme instead of the dark code colours', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/code/preview`);
  const dark = page.locator('code', { hasText: 'theme="dark"' }).first();
  const subtle = page.locator('code', { hasText: 'c9f60ee' }).first();
  await expect(subtle).toBeVisible();
  const background = (locator: typeof dark) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(subtle)).not.toBe(await background(dark));
});

test('filling tabs give the selected panel the height left below the list', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/tabs/preview`);
  const canvas = page.getByTestId('fill-canvas');
  await expect(canvas).toBeVisible();
  const region = await page.locator('.docs-fill-region').boundingBox();
  const list = await page.getByRole('tablist', { name: 'Diagram views' }).boundingBox();
  const box = await canvas.boundingBox();
  // The canvas reaches the bottom of the region and starts below the list.
  expect(Math.abs(box!.y + box!.height - (region!.y + region!.height))).toBeLessThanOrEqual(2);
  expect(box!.y).toBeGreaterThan(list!.y + list!.height - 1);
  expect(box!.height).toBeGreaterThan(100);
});

test('a compact surface gives its controls the compact height', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/surface/preview`);
  const height = async (toolbar: string, name: string) =>
    (await page.getByRole('group', { name: toolbar }).getByRole('button', { name }).boundingBox())!
      .height;
  expect(await height('Compact toolbar', 'Fit')).toBeLessThan(
    await height('Standard toolbar', 'Fit'),
  );
  expect(await height('Compact toolbar', 'Views')).toBeLessThan(
    await height('Standard toolbar', 'Views'),
  );
  await expect(page.getByRole('group', { name: 'Compact toolbar' })).toHaveAttribute(
    'data-density',
    'compact',
  );
});
