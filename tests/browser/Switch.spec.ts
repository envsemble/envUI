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

test('the track and thumb follow the scale, and the row is a 24 px target, or the touch height on touch screens', async ({
  browser,
}) => {
  for (const [scale, track, thumb, touch] of [
    ['comfortable', [40, 24], 16, false],
    ['compact', [34, 21], 13, false],
    ['compact', [34, 21], 13, true],
  ] as const) {
    const context = await browser.newContext({ hasTouch: touch });
    const page = await context.newPage();
    await page.goto(`${fixtureUrl}/?fixture=choice-controls&scale=${scale}`);
    const input = page.getByRole('switch').first();
    const box = (await input.boundingBox())!;
    expect([box.width, box.height].map(Math.round), `${scale}${touch ? ' touch' : ''}`).toEqual(
      track,
    );
    await expect
      .poll(() => input.evaluate((element) => getComputedStyle(element, '::before').width))
      .toBe(`${thumb}px`);
    const row = (await page.locator('label.env-switch', { has: input }).boundingBox())!;
    expect(row.height).toBeGreaterThanOrEqual(touch ? 44 : 24);
    await context.close();
  }
});
