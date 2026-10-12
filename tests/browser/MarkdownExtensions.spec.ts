import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('Markdown accepts component overrides and remark and rehype plugins', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=markdown-extensions`);
  const scope = page.getByTestId('markdown-extensions');
  await expect(scope.locator('.env-markdown')).toHaveClass(/fixture-markdown/);
  // envUI's heading offset still applies, and the rehype plugin's id reaches the element.
  const heading = scope.getByRole('heading', { name: 'Project plan', level: 2 });
  await expect(heading).toHaveAttribute('id', 'project-plan');
  // The application's override wins over envUI's components.
  await expect(scope.locator('blockquote[data-custom-quote]')).toHaveText('A quoted decision');
  // The remark plugin runs after GFM, which still renders tables.
  await expect(scope.locator('em')).toHaveText('TODO');
  await expect(scope.getByRole('table')).toBeVisible();
  // Raw HTML stays ignored, even with a rehype plugin that would render it.
  await expect(scope.getByText('Some inline HTML')).toBeVisible();
  await expect(scope.locator('.env-markdown [data-raw]')).toHaveCount(0);
  await expect(scope).not.toContainText('A block');
  await expect(scope).not.toContainText('<span>');
});
