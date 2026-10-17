import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a switch takes its class and style on its root, and its ref and native props on the input', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=choice-controls`);
  const input = page.getByRole('switch', { name: 'Alerts', exact: true });
  await expect(input).toHaveAttribute('data-testid', 'switch-input');
  await expect(input).toHaveAttribute('name', 'alerts');
  await expect(input).toHaveClass('env-switch-input');
  const root = page.locator('label.env-switch', { has: input });
  await expect(root).toHaveClass('env-switch app-switch');
  await expect(root).toHaveCSS('margin-inline-start', '3px');
  await page.getByRole('button', { name: 'Read refs' }).click();
  await expect(page.getByTestId('choice-refs')).toHaveText(/INPUT:checkbox INPUT:checkbox/);
});
