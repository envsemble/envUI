import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a checkbox takes its class and style on its root, and its ref and native props on the input', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=choice-controls`);
  const input = page.getByRole('checkbox', { name: 'Subscribe', exact: true });
  await expect(input).toHaveAttribute('data-testid', 'checkbox-input');
  await expect(input).toHaveAttribute('name', 'subscribe');
  await expect(input).toHaveClass('env-checkbox-input');
  const root = page.locator('label.env-checkbox', { has: input });
  await expect(root).toHaveClass('env-checkbox app-checkbox');
  await expect(root).toHaveCSS('margin-inline-start', '3px');
  await page.getByRole('button', { name: 'Read refs' }).click();
  await expect(page.getByTestId('choice-refs')).toContainText('INPUT:checkbox');
  // The label still toggles the box.
  await root.getByText('Subscribe').click();
  await expect(input).toBeChecked();
});
