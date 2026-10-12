import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('segmented controls choose one option with the pointer and arrow keys', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=segments`);
  for (const theme of ['light', 'dark']) {
    const group = page.getByRole('radiogroup', { name: `Work items ${theme}` });
    const value = page.getByTestId(`segments-value-${theme}`);
    const open = group.getByRole('radio', { name: 'Open 12' });
    const blocked = group.getByRole('radio', { name: 'Blocked 3' });
    const done = group.getByRole('radio', { name: 'Done 40' });
    await expect(open).toHaveAttribute('aria-checked', 'true');
    await expect(group.getByRole('radio', { name: 'Archived' })).toBeDisabled();

    // The chosen segment takes the primary action colors.
    const fill = await open.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--color-primary-action)';
      element.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(open).toHaveCSS('background-color', fill);

    await blocked.click();
    await expect(value).toHaveText(/^blocked/);
    await expect(blocked).toHaveAttribute('aria-checked', 'true');
    await expect(open).toHaveAttribute('aria-checked', 'false');

    // Arrow keys move and choose, skipping the disabled option.
    await blocked.focus();
    await page.keyboard.press('ArrowRight');
    await expect(done).toBeFocused();
    await expect(value).toHaveText(/^done/);
    await page.keyboard.press('ArrowLeft');
    await expect(blocked).toBeFocused();
    await expect(value).toHaveText(/^blocked/);

    const layout = page.getByRole('radiogroup', { name: `Layout ${theme}` });
    await layout.getByRole('radio', { name: 'Board' }).click();
    await expect(value).toHaveText(/board$/);
    const compactHeight = (await layout.boundingBox())!.height;
    expect(compactHeight).toBeLessThan((await group.boundingBox())!.height);
  }
  expect(errors).toEqual([]);
});
