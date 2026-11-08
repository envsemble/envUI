import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

// The direction check: components whose keyboard or placement follows the text direction read it
// from EnvUIProvider's dir, or else from the dir at their element. tests/fixture/Direction.tsx
// mounts them in RTL both ways; as each batch moves a component onto useDirection, it adds it.

test("the arrow keys turn as soon as the region's dir changes, with focus inside", async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=direction`);
  const region = page.getByTestId('direction-switch');
  const toolbar = region.getByRole('toolbar', { name: 'Switching' });
  await toolbar.getByRole('button', { name: 'First' }).focus();
  await region.evaluate((element) => element.setAttribute('dir', 'rtl'));
  // The first key press after the change already moves the right-to-left way.
  await page.keyboard.press('ArrowLeft');
  await expect(toolbar.getByRole('button', { name: 'Second' })).toBeFocused();
});

test("a toolbar's direction stays with its keyboard, not the parts inside it", async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=direction`);
  const outside = await page.getByTestId('base-direction-outside').textContent();
  await expect(page.getByTestId('base-direction-inside')).toHaveText(outside ?? '');
});

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
      // Base UI's toolbar knows only its own direction provider: Toolbar.Root tells it. In LTR,
      // ArrowLeft from the first button would loop to the last.
      const toolbar = region.getByRole('toolbar', { name: 'Formatting' });
      await toolbar.getByRole('button', { name: 'Bold' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(toolbar.getByRole('button', { name: 'Italic' })).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(toolbar.getByRole('button', { name: 'Bold' })).toBeFocused();
      const view = region.getByRole('radiogroup', { name: 'View' });
      await view.getByRole('radio', { name: 'List' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(view.getByRole('radio', { name: 'Board' })).toBeFocused();
      const tabs = region.getByRole('tablist', { name: 'Sections' });
      await tabs.getByRole('tab', { name: 'Overview' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.getByRole('tab', { name: 'Activity' })).toBeFocused();
      const menubar = region.getByRole('menubar', { name: 'Application' });
      await menubar.getByRole('menuitem', { name: 'File' }).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(menubar.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    });
});
