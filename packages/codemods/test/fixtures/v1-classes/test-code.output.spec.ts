import { expect, test } from '@playwright/test';

export const sidebar = (page) => page.locator('.workbench .env-app-sidebar');

test('the frame', async ({ page }) => {
  await expect(page.locator('.env-top-bar')).toBeVisible();
  await expect(page.locator('.env-tree-item').first()).toHaveClass('env-tree-item');
  await expect(page.getByRole('treeitem').first()).toHaveClass(/env-tree-row/);
  await page.waitForSelector('.env-select-popup');
  const failure = page.getByRole('alert');
  expect(failure.classList).toContain('env-empty-state-error');
  expect(failure.classList).not.toContain('env-alert');
  expect(findByClass(page, 'env-list')).toBe(true);
  expect(findByClass(page, '.env-app-sidebar')).toBe(true);
  expect(markup).toMatch(/class="env-diff-count"/);
  const label = 'the env-app-sidebar region';
  expect(markup).toContain('env-theme');
  await cy.get('.env-tree-item').should('exist');
  expect(markup).toMatch(/var\(--color-text-muted\)/);
});

// Exact class names outside a class context may be no class: they stay and are reported.
test('ids and keys', async ({ page }) => {
  await page.getByTestId('env-app-sidebar').click();
  const ids = { 'env-tree-row': 'row' };
  expect(page.locator('#main')).toHaveAttribute('id', 'env-notice');
});
