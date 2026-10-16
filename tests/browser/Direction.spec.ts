import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

// The direction check: components whose keyboard or placement follows the text direction read it
// from EnvUIProvider's dir, or else from the dir at their element. tests/fixture/Direction.tsx
// mounts them in RTL both ways; as each batch moves a component onto useDirection, it adds it.

test.describe('in a right-to-left region', () => {
  for (const source of ['attribute', 'provider'] as const)
    test(`the arrow keys follow the direction from the ${source}`, async ({ page }) => {
      await page.goto(`${fixtureUrl}/?fixture=direction`);
      const region = page.getByTestId(`direction-${source}`);
      const handle = region.getByRole('separator', { name: 'Resize pane' });
      await handle.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(handle).toHaveAttribute('aria-valuenow', '210');
      const grid = region.getByRole('grid');
      await grid.getByRole('gridcell', { name: '1', exact: true }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(grid.getByRole('gridcell', { name: '2', exact: true })).toBeFocused();
    });
});
