import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** Lines of text plus the field's 1 rem inset above and below. */
async function linesHigh(field: Locator, lines: number) {
  const lineHeight = await field.evaluate((element) =>
    parseFloat(getComputedStyle(element).lineHeight),
  );
  return lines * lineHeight + 32;
}

test('a growing textarea starts at its rows and grows with its lines', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const height = async (field: Locator) => (await field.boundingBox())!.height;
  const one = page.getByRole('textbox', { name: 'One line', exact: true });
  const three = page.getByRole('textbox', { name: 'Three lines', exact: true });
  await expect(one).toHaveAttribute('data-sizing', 'content');
  expect(await height(one)).toBeCloseTo(await linesHigh(one, 1), 0);
  expect(await height(three)).toBeCloseTo(await linesHigh(three, 3), 0);
  await one.fill(['First', 'Second'].join('\n'));
  await expect.poll(() => height(one)).toBeCloseTo(await linesHigh(one, 2), 0);
  await one.fill('');
  await expect.poll(() => height(one)).toBeCloseTo(await linesHigh(one, 1), 0);
  // Without rows, growing and fixed fields keep the shared 7.5 rem start.
  expect(await height(page.getByRole('textbox', { name: 'Default lines', exact: true }))).toBe(120);
  expect(await height(page.getByRole('textbox', { name: 'Two fixed lines', exact: true }))).toBe(
    120,
  );
});
