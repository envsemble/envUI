import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=split-panes`;

test.describe('ListDetail', () => {
  test('shows the list beside the detail, with the handle between', async ({ page }) => {
    await page.goto(fixture);
    const root = page.getByTestId('list-detail');
    await expect(root.getByRole('region', { name: 'Projects' })).toBeVisible();
    await expect(root.getByRole('region', { name: 'No project' })).toBeVisible();
    await expect(root.getByRole('separator', { name: 'Resize panes' })).toHaveAttribute(
      'aria-valuenow',
      '32',
    );
    // WebKit doesn't focus a button it clicks, so the keyboard presses it.
    await root.getByRole('button', { name: 'Annual report' }).focus();
    await page.keyboard.press('Enter');
    await expect(root.getByRole('region', { name: 'Annual report' })).toContainText(
      'Annual report details',
    );
    // Side by side, focus stays where it was, and there is no back button.
    await expect(root.getByRole('button', { name: 'Annual report' })).toBeFocused();
    await expect(root.getByRole('button', { name: 'All projects' })).toHaveCount(0);
  });

  test('stacked, shows one at a time and moves focus between them', async ({ page }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    const root = page.getByTestId('list-detail');
    await expect(root).toHaveAttribute('data-stacked', '');
    const list = root.getByRole('region', { name: 'Projects' });
    await expect(list).toBeVisible();
    await expect(root.getByRole('region', { name: 'No project' })).toBeHidden();
    await expect(root.getByRole('separator')).toHaveCount(0);

    await root.getByRole('button', { name: 'Office move' }).focus();
    await page.keyboard.press('Enter');
    const back = root.getByRole('button', { name: 'All projects' });
    await expect(back).toBeFocused();
    await expect(list).toBeHidden();
    await expect(root.getByRole('region', { name: 'Office move' })).toContainText(
      'Office move details',
    );

    await page.keyboard.press('Enter');
    await expect(list).toBeVisible();
    // Back returns focus to the list's current row.
    const current = root.getByRole('button', { name: 'Office move' });
    await expect(current).toBeFocused();
    await expect(current).toHaveAttribute('aria-current', 'true');

    // Widening with the detail shown shows both again, and narrowing the detail alone.
    await root.getByRole('button', { name: 'Hiring plan' }).click();
    await expect(back).toBeFocused();
    await page.getByRole('button', { name: 'Wide list and detail' }).click();
    await expect(list).toBeVisible();
    await expect(back).toHaveCount(0);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    await expect(list).toBeHidden();
    await expect(back).toBeVisible();
  });

  test('turns its back arrow in right-to-left text', async ({ page }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    const root = page.getByTestId('list-detail');
    await root.getByRole('button', { name: 'Annual report' }).click();
    await root.evaluate((element) => element.setAttribute('dir', 'rtl'));
    const icon = root.getByRole('button', { name: 'All projects' }).locator('.env-icon');
    await expect(icon).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  });
});
