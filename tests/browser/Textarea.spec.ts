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

test('a ghost textarea shows no border or fill at rest, and a soft fill while focused', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const field = page.getByRole('textbox', { name: 'Ghost notes', exact: true });
  const control = page.locator('.env-text-field-control', { has: field });
  await expect(control).toHaveAttribute('data-variant', 'ghost');
  await expect(control).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(control).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await field.focus();
  await expect
    .poll(() => control.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe('rgba(0, 0, 0, 0)');
});

test('the resize edge is a named separator that the arrow keys and Home move', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const field = page.getByRole('textbox', { name: 'Two fixed lines', exact: true });
  const edge = page
    .locator('.env-text-field-control', { has: field })
    .getByRole('separator', { name: 'Resize text area', exact: true });
  await expect(edge).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(edge).toHaveAttribute('aria-controls', (await field.getAttribute('id'))!);
  await expect(edge).toHaveAttribute('aria-description', /Up and Down arrows/);
  const before = (await field.boundingBox())!.height;
  await expect(edge).toHaveAttribute('aria-valuenow', String(Math.round(before)));
  // Without a CSS maximum height, the separator still has a finite maximum above its value.
  expect(Number(await edge.getAttribute('aria-valuemax'))).toBeGreaterThan(before * 10);
  await edge.focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(async () => (await field.boundingBox())!.height).toBeGreaterThan(before);
  await expect
    .poll(async () => Number(await edge.getAttribute('aria-valuenow')))
    .toBeGreaterThan(Math.round(before));
  await page.keyboard.press('Home');
  await expect.poll(async () => (await field.boundingBox())!.height).toBeCloseTo(before, 0);
});
