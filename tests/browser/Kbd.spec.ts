import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

test('keys render as key caps joined by plus', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=data-display`);
  const scope = page.getByTestId('data-light');
  const combination = scope.locator('kbd.env-kbd-combination');
  await expect(combination).toHaveText('Ctrl+P');
  await expect(combination.locator('kbd.env-kbd')).toHaveCount(2);
  await expect(scope.locator('kbd.env-kbd').filter({ hasText: 'F2' })).toBeVisible();
});
