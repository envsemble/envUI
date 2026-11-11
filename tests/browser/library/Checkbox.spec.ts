import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

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

test('the box follows the scale, and its row is a 24 px target, or the touch height on touch screens', async ({
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
    expect(row.height).toBeGreaterThanOrEqual(touch ? 44 : 24);
    await context.close();
  }
});

test('a checkbox without a visible label takes presses across a 24 px target, or 44 px on touch screens, with its box as drawn', async ({
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
    const input = page.getByRole('checkbox', { name: 'Select row', exact: true });
    const root = page.locator('label.env-checkbox', { has: input });
    const label = `${scale}${touch ? ' touch' : ''}`;
    // The box and the row's width in the layout stay the box's.
    const box = (await input.boundingBox())!;
    expect([box.width, box.height].map(Math.round), label).toEqual([size, size]);
    expect(Math.round((await root.boundingBox())!.width), label).toBe(size);
    const target = touch ? 44 : 24;
    const area = await root.evaluate((element) => {
      const { width, height } = getComputedStyle(element, '::before');
      return [width, height].map((value) => Math.round(parseFloat(value)));
    });
    expect(area, label).toEqual([target, target]);
    // A press just inside the target, beside the box, toggles it; one just outside doesn't.
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const reach = target / 2 - 2;
    await page.mouse.click(centerX + reach, centerY);
    await expect(input, label).toBeChecked();
    await page.mouse.click(centerX - reach, centerY);
    await expect(input, label).not.toBeChecked();
    await page.mouse.click(centerX + target / 2 + 2, centerY);
    await expect(input, label).not.toBeChecked();
    await context.close();
  }
});

test('a controlled mixed checkbox retains its DOM state when the owner retains mixed', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const fixed = page.getByTestId('frozen-checkbox');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await fixed.click();
  await expect(page.getByTestId('frozen-request')).toHaveText('true');
  await expect(fixed).toHaveAttribute('aria-checked', 'mixed');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await expect(fixed).not.toBeChecked();
});
