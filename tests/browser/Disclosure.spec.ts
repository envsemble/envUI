import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a disclosure reports each change through onOpenChange, controlled or on its own', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=disclosures`);
  const scope = page.getByTestId('disclosures');
  const controlled = scope.locator('details').filter({ hasText: 'Controlled' });
  const changes = scope.getByTestId('disclosure-changes');
  await expect(controlled).not.toHaveAttribute('open');
  await controlled.getByText('Controlled', { exact: true }).click();
  await expect(controlled).toHaveAttribute('open', '');
  await expect(changes).toHaveText('true');
  await controlled.getByText('Controlled', { exact: true }).click();
  await expect(controlled).not.toHaveAttribute('open');
  await expect(changes).toHaveText('true false');
  // Opening it through open reports nothing: only people's changes do.
  await scope.getByRole('button', { name: 'Open from outside' }).click();
  await expect(controlled).toHaveAttribute('open', '');
  await expect(controlled.getByText('Controlled details')).toBeVisible();
  await expect(changes).toHaveText('true false');
  // defaultOpen sets how a disclosure that keeps its own state starts.
  const own = scope.locator('details').filter({ hasText: 'Open at first' });
  await expect(own.getByText('Details shown at first')).toBeVisible();
  await own.getByText('Open at first', { exact: true }).click();
  await expect(own).not.toHaveAttribute('open');
});
