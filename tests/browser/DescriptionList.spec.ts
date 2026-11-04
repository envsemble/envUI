import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const fixture = `${fixtureUrl}/?fixture=description-lists`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('DescriptionList', () => {
  test('is a dl of terms and their definitions', async ({ page }) => {
    await page.goto(fixture);
    const list = page.getByTestId('auto');
    await expect(list.getByRole('term')).toHaveText(['Owner', 'Status', 'Last updated']);
    await expect(list.getByRole('definition')).toHaveText([
      'Alex Morgan',
      'Active',
      '4 March 2026',
    ]);
    // dl > div > dt + dd, as HTML allows.
    const shapes = await list.evaluate((element) =>
      [...element.children].map(
        (item) => `${item.tagName}>${[...item.children].map((child) => child.tagName).join('+')}`,
      ),
    );
    expect(shapes).toEqual(['DIV>DT+DD', 'DIV>DT+DD', 'DIV>DT+DD']);
  });

  test('puts labels beside values, and above them below 24 rem', async ({ page }) => {
    await page.goto(fixture);
    const list = page.getByTestId('auto');
    const label = list.getByRole('term').first();
    const value = list.getByRole('definition').first();
    // Inline, the values line up in a column after the longest label.
    const longest = await box(list.getByRole('term').nth(2));
    expect((await box(value)).x).toBeGreaterThan(longest.x + longest.width);
    expect((await box(list.getByRole('definition').nth(2))).x).toBeCloseTo((await box(value)).x, 0);
    expect(Math.abs((await box(value)).y - (await box(label)).y)).toBeLessThan(4);
    // Labels are muted.
    const color = (locator: Locator) =>
      locator.evaluate((element) => getComputedStyle(element).color);
    expect(await color(label)).not.toBe(await color(value));

    await page.getByRole('button', { name: 'Narrow list' }).click();
    const above = await box(label);
    await expect
      .poll(async () => (await box(value)).y)
      .toBeGreaterThanOrEqual(above.y + above.height);
    expect((await box(value)).x).toBeCloseTo(above.x, 0);
    // A stacked list puts each label above its value at any width.
    const stacked = page.getByTestId('stacked');
    const email = await box(stacked.getByRole('term').first());
    expect((await box(stacked.getByRole('definition').first())).y).toBeGreaterThanOrEqual(
      email.y + email.height,
    );
  });

  test('with controls, rows are as tall as a small control', async ({ page }) => {
    await page.goto(fixture);
    const list = page.getByTestId('controls');
    expect((await box(list.getByRole('definition').nth(1))).height).toBeGreaterThanOrEqual(31.5);
    // The label sits on the control's line.
    const label = await box(list.getByRole('term').first());
    const control = await box(list.getByRole('combobox', { name: 'Visibility' }));
    expect(Math.abs(label.y + label.height / 2 - (control.y + control.height / 2))).toBeLessThan(2);
  });
});
