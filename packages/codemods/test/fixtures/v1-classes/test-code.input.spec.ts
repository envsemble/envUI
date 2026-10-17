import { expect, test } from '@playwright/test';

export const sidebar = (page) => page.locator('.workbench .env-app-sidebar');

test('the frame', async ({ page }) => {
  await expect(page.locator('.env-app-topbar')).toBeVisible();
  await expect(page.locator('.env-tree-row').first()).toHaveClass('env-tree-row');
  await expect(page.getByRole('treeitem').first()).toHaveClass(/env-tree-row/);
  await page.waitForSelector('.env-dropdown-options');
  const failure = page.getByRole('alert');
  expect(failure.classList).toContain('env-empty-state-error');
  expect(failure.classList).not.toContain('env-notice');
  expect(findByClass(page, 'env-grouped-rows')).toBe(true);
  expect(findByClass(page, '.env-app-sidebar')).toBe(true);
  expect(markup).toMatch(/class="env-diff-count"/);
  const label = 'the env-app-sidebar region';
  expect(markup).toContain('env-theme');
});
