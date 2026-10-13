import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('icon-only buttons keep their square size where their container is squeezed', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  for (const theme of ['light', 'dark']) {
    const row = page.getByTestId(`layout-${theme}`).getByTestId('shrink-row');
    const button = row.getByRole('button', { name: `Squeezed next ${theme}` });
    await expect(button).toBeVisible();
    // The slot around the button is squeezed below the button's size; the button is not.
    const slot = (await row.locator('.fixture-shrink-slot').boundingBox())!;
    expect(slot.width).toBeLessThan(40);
    const box = (await button.boundingBox())!;
    expect(box.width).toBeCloseTo(40, 0);
    expect(box.height).toBeCloseTo(40, 0);
    await expect(button.locator('svg')).toBeVisible();
  }
});
