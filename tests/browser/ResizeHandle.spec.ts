import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

/** tests/fixture/Primitives.tsx, which mounts a pane with a ResizeHandle in each direction among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByTestId('resize-ltr')).toBeVisible();
}

test.describe('ResizeHandle', () => {
  test('moves with the arrow keys, Home and End, in the reading direction', async ({ page }) => {
    await open(page);
    const ltr = page.getByTestId('resize-ltr').getByRole('separator', { name: 'Resize pane' });
    await expect(ltr).toHaveAttribute('aria-orientation', 'vertical');
    await expect(ltr).toHaveAttribute('aria-valuenow', '200');
    await ltr.focus();
    await page.keyboard.press('ArrowRight');
    await expect(ltr).toHaveAttribute('aria-valuenow', '210');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(ltr).toHaveAttribute('aria-valuenow', '110');
    await page.keyboard.press('End');
    await expect(ltr).toHaveAttribute('aria-valuenow', '400');
    await page.keyboard.press('Home');
    await expect(ltr).toHaveAttribute('aria-valuenow', '100');
    await expect(page.getByTestId('committed-ltr')).toHaveText('100');
    // In RTL the pane grows toward the left.
    const rtl = page.getByTestId('resize-rtl').getByRole('separator');
    await rtl.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(rtl).toHaveAttribute('aria-valuenow', '210');
  });

  test(
    'follows the pointer and commits as the drag ends',
    { tag: '@engines' },
    async ({ page }) => {
      await open(page);
      const handle = page.getByTestId('resize-ltr').getByRole('separator');
      // The mouse moves in the viewport, so the handle must be in it.
      await handle.scrollIntoViewIfNeeded();
      const box = (await handle.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
      await expect(handle).toHaveAttribute('data-resizing', '');
      await expect(handle).toHaveAttribute('aria-valuenow', '250');
      await expect(page.getByTestId('committed-ltr')).toHaveText('200');
      await page.mouse.up();
      await expect(page.getByTestId('committed-ltr')).toHaveText('250');
      await expect(handle).not.toHaveAttribute('data-resizing');
    },
  );
});
