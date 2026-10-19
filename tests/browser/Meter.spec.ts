import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

// Meter, Progress and Spinner: the values assistive technology reads, and what it doesn't.
test('meters and progress bars read their values; spinners hide their drawing', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=meters`);
  // Without a text of the application's, Base UI's formatted value stays.
  const storage = page.getByRole('meter', { name: 'Storage used' });
  await expect(storage).toHaveAttribute('aria-valuenow', '40');
  await expect(storage).toHaveAttribute('aria-valuetext', /40/);
  await expect(storage).toHaveClass(/env-meter/);
  await expect(page.getByRole('meter', { name: 'Seats assigned' })).toHaveAttribute(
    'aria-valuetext',
    '2 of 5 seats',
  );

  // An indeterminate bar says that the work is loading.
  const importing = page.getByRole('progressbar', { name: 'Importing' });
  await expect(importing).not.toHaveAttribute('aria-valuenow');
  await expect(importing).toHaveAttribute('aria-valuetext', 'Loading');
  await expect(importing).toHaveAttribute('data-indeterminate');
  await expect(page.getByRole('progressbar', { name: 'Uploading' })).toHaveAttribute(
    'aria-valuetext',
    /30/,
  );

  // Segments fill in turn: half of four is two full steps.
  const fills = await page
    .getByTestId('segmented')
    .locator('.env-progress-segment')
    .evaluateAll((segments) =>
      segments.map((segment) =>
        getComputedStyle(segment).getPropertyValue('--env-progress-segment-fill').trim(),
      ),
    );
  expect(fills).toEqual(['1', '1', '0', '0']);

  // A spinner without a label is hidden whole; with one, it is a named progress bar whose
  // drawing stays hidden.
  await expect(page.getByTestId('quiet-spinner')).toHaveAttribute('aria-hidden', 'true');
  const named = page.getByRole('progressbar', { name: 'Refreshing members' });
  await expect(named).toHaveAttribute('data-size', 'sm');
  await expect(named.locator('svg')).toHaveAttribute('aria-hidden', 'true');
});
