import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

test(
  'useContainerSize follows the content and border box along the writing mode',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=container-size`);
    await expect(page.getByTestId('content-size')).toHaveText('276 × 76');
    await expect(page.getByTestId('border-size')).toHaveText('300 × 100');
    // In vertical text the inline size is the height: the box is 200 px wide and 80 px tall.
    await expect(page.getByTestId('vertical-size')).toHaveText('80 × 200');
    await page.getByRole('button', { name: 'Widen the box' }).click();
    await expect(page.getByTestId('content-size')).toHaveText('396 × 76');
    await expect(page.getByTestId('border-size')).toHaveText('420 × 100');
  },
);
