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
  await page.getByRole('radio', { name: 'Done' }).click();
  await expect(page.getByRole('radio', { name: 'Done' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('tab', { name: 'Two.md' }).click();
  await expect(page.getByRole('tab', { name: 'Two.md' })).toHaveAttribute('aria-selected', 'true');
  const file = page.getByRole('menuitem', { name: 'File', exact: true });
  await expect(page.locator('.env-title-bar')).toContainText('Hydrated title');
  await file.click();
  const fileMenu = page.getByRole('menu', { name: 'File' });
  await expect(fileMenu.getByRole('menuitem', { name: 'Hydrated new' })).toBeVisible();
  await fileMenu.getByRole('menuitem', { name: 'Hydrated recent' }).hover();
  await expect(page.getByRole('menuitem', { name: 'Hydrated report' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(fileMenu).toBeHidden();
  await page.getByRole('combobox', { name: 'Hydrated compact select' }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Hydrated compact select' })).toContainText(
    'Two',
  );
  const row = page.getByRole('treeitem', { name: 'Hydrated document 2', exact: true });
  await row.click();
  await expect(row).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('log', { name: 'Hydrated conversation' })).toContainText(
    'Hydrated answer',
  );
  const composer = page.getByRole('textbox', { name: 'Hydrated composer' });
  await expect(composer).toHaveAccessibleDescription('Hydrated composer footer');
  await composer.fill('Hydrated message');
  await composer.press('Enter');
  const conversation = page.getByRole('log', { name: 'Hydrated conversation' });
  await expect(conversation.getByRole('article')).toHaveCount(2);
  await expect(conversation.getByRole('article').last()).toHaveText('Hydrated message');
  await expect(composer).toHaveValue('');
  const split = page.getByRole('separator', { name: 'Hydrated split' });
  await expect(split).toHaveAttribute('aria-valuenow', '50');
  await split.focus();
  await page.keyboard.press('ArrowRight');
  await expect(split).toHaveAttribute('aria-valuenow', '52');
  expect(
    await page.evaluate(() => (window as unknown as { hydrationErrors: string[] }).hydrationErrors),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
