import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** tests/fixture/Primitives.fixture.tsx, which mounts components under an EnvUIProvider among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByTestId('provided-locale')).toBeVisible();
}

test('EnvUIProvider sets the locale components read', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('locale').first()).toHaveText('runtime');
  await expect(page.getByTestId('provided-locale')).toHaveText('de-CH');
});
