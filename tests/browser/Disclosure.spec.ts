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
  // A parent that ignores onOpenChange keeps a controlled disclosure as open says.
  const kept = scope.locator('details').filter({ hasText: 'Kept closed' });
  await kept.getByText('Kept closed', { exact: true }).click();
  await expect(scope.getByTestId('disclosure-requests')).toHaveText('true');
  await expect(kept).not.toHaveAttribute('open');
  await expect(kept.getByText('Details kept closed')).toBeHidden();
  await kept.getByText('Kept closed', { exact: true }).click();
  await expect(scope.getByTestId('disclosure-requests')).toHaveText('true true');
  await expect(kept).not.toHaveAttribute('open');
  // defaultOpen sets how a disclosure that keeps its own state starts.
  const own = scope.locator('details').filter({ hasText: 'Open at first' });
  await expect(own.getByText('Details shown at first')).toBeVisible();
  await own.getByText('Open at first', { exact: true }).click();
  await expect(own).not.toHaveAttribute('open');
});
