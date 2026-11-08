import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

test(
  'destinations are tab stops in order, and Enter selects one',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=navigation`);
    const rail = page
      .getByTestId('navigation-light')
      .getByRole('navigation', { name: 'Mail rail' });
    const items = rail.locator('.env-navigation-rail-item');
    await items.first().focus();
    for (const label of ['Drafts', 'Sent', 'Starred']) {
      await page.keyboard.press('Tab');
      await expect(rail.getByRole('button', { name: new RegExp(`^${label}`) })).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await expect(rail.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByTestId('navigation-light').getByTestId('current')).toHaveText(
      'Starred, Labels',
    );
  },
);

test('Rail is a narrow column, and Drawer items fill its width', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const rail = scope.getByRole('navigation', { name: 'Mail rail' });
  const rem = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  expect((await rail.boundingBox())!.width).toBeCloseTo(5 * rem, 0);
  const drawer = scope.getByRole('navigation', { name: 'Mail drawer' });
  const list = (await drawer.locator('.env-navigation-drawer-list').boundingBox())!;
  for (const item of await drawer.locator('.env-navigation-drawer-item').all())
    expect(Math.abs((await item.boundingBox())!.width - list.width)).toBeLessThan(1);
});
