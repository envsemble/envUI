import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('public components hydrate server output without recoverable errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(pathToFileURL(resolve('.cache/Hydration.html')).href);
  await expect(page.getByRole('textbox', { name: 'Hydrated input' })).toHaveValue('Server value');
  await page.getByRole('textbox', { name: 'Hydrated input' }).fill('Client value');
  await expect(page.locator('output')).toHaveText('Client value');
  const color = page.getByRole('textbox', { name: 'Hydrated color HEX' });
  await expect(color).toHaveValue('#1a73e8');
  await color.fill('ABCDEF');
  await expect(color).toHaveValue('#abcdef');
  await expect(page.getByRole('checkbox', { name: 'Hydrated choice' })).toHaveJSProperty(
    'indeterminate',
    true,
  );
  await page.getByRole('checkbox', { name: 'Hydrated choice' }).click();
  await expect(page.getByRole('checkbox', { name: 'Hydrated choice' })).toBeChecked();
  await page.getByRole('combobox', { name: 'Hydrated select' }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Hydrated select' })).toContainText('Two');
  await page.getByRole('button', { name: 'Open hydrated dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Hydrated dialog' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Notify', exact: true }).click();
  await expect(page.locator('.env-toast-viewport .env-toast')).toContainText('Hydrated notice');
  expect(
    await page.evaluate(() => (window as unknown as { hydrationErrors: string[] }).hydrationErrors),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
