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

test('the box follows the scale, and its row grows to the touch height on touch screens', async ({
  browser,
}) => {
  for (const [scale, size, touch] of [
    ['comfortable', 18, false],
    ['compact', 16, false],
    ['compact', 16, true],
  ] as const) {
    const context = await browser.newContext({ hasTouch: touch });
    const page = await context.newPage();
    await page.goto(`${fixtureUrl}/?fixture=choice-controls&scale=${scale}`);
    const input = page.getByRole('checkbox', { name: 'Subscribe', exact: true });
    const box = (await input.boundingBox())!;
    expect([box.width, box.height].map(Math.round), `${scale}${touch ? ' touch' : ''}`).toEqual([
      size,
      size,
    ]);
    const row = (await page.locator('label.env-checkbox', { has: input }).boundingBox())!;
    expect(row.height).toBeGreaterThanOrEqual(touch ? 44 : size);
    await context.close();
  }
});
