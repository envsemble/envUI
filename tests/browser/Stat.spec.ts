import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;
const statsFixture = `${fixtureUrl}/?fixture=stats`;

test('stats read as label, figure, trend and detail, with the trend in icon and text', async ({
  page,
}) => {
  await page.goto(statsFixture);
  // A named group is exposed as a group with that name; an unnamed one adds no role.
  const group = page.getByRole('group', { name: 'Project health light' });
  await expect(group).toHaveAttribute('data-testid', 'stat-group-light');
  await expect(page.getByTestId('stat-row-group-light')).not.toHaveAttribute('role');
  const stats = group.locator('.env-stat');
  await expect(stats).toHaveCount(4);
  await expect(stats.nth(0)).toHaveText(/^Active projects128\+12% from last monthLast 30 days$/);
  await expect(stats.nth(0).locator('.env-stat-value')).toHaveCSS(
    'font-variant-numeric',
    'tabular-nums',
  );
  // Each trend shows a decorative icon beside its text, in a tone chosen by direction or by tone.
  const trends = group.locator('.env-stat-trend');
  await expect(trends.locator('.env-icon[aria-hidden="true"] svg')).toHaveCount(4);
  expect(
    await trends.evaluateAll((elements) =>
      elements.map((element) => [element.dataset.direction, element.dataset.tone]),
    ),
  ).toEqual([
    ['up', 'success'],
    ['down', 'success'],
    ['up', 'danger'],
    ['flat', 'neutral'],
  ]);
  // A value can be an AnimatedNumber.
  const reviews = stats.nth(3).locator('.env-stat-value');
  await expect(reviews).toHaveText('41');
  await page.getByRole('button', { name: 'Add review light' }).click();
  await expect(reviews).toHaveText('42');
  await expect(page.getByTestId('stat-standalone-light')).toHaveText('Standalone7');
});

test('a stat group wraps its stats into even columns as space runs out', async ({ page }) => {
  await page.goto(statsFixture);
  const group = page.getByTestId('stat-group-light');
  const columns = async () =>
    group.locator('.env-stat').evaluateAll((elements) => {
      const boxes = elements.map((element) => element.getBoundingClientRect());
      const rows = new Set(boxes.map((box) => Math.round(box.top)));
      const widths = new Set(boxes.map((box) => Math.round(box.width)));
      return {
        perRow: boxes.filter((box) => Math.round(box.top) === Math.round(boxes[0]!.top)).length,
        rows: rows.size,
        widths: widths.size,
      };
    });
  // Polled, so the measure waits for the stats to render.
  await expect.poll(columns).toEqual({ perRow: 4, rows: 1, widths: 1 });
  await page.setViewportSize({ width: 560, height: 900 });
  await expect.poll(columns).toEqual({ perRow: 2, rows: 2, widths: 1 });
  // A phone keeps two columns, with figures that still fit their column.
  await page.setViewportSize({ width: 390, height: 900 });
  await expect.poll(columns).toEqual({ perRow: 2, rows: 2, widths: 1 });
  for (const value of await group.locator('.env-stat-value').all())
    expect(await value.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
  // Only a very narrow group stacks its stats.
  await page.setViewportSize({ width: 320, height: 900 });
  await expect.poll(columns).toEqual({ perRow: 1, rows: 4, widths: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // The group is a pane, or a row tone on a pane.
  await expect(group).toHaveAttribute('data-background', 'default');
  await expect(page.getByTestId('stat-row-group-light')).toHaveAttribute(
    'data-background',
    'muted',
  );
});

test('AnimatedNumber rolls up when a count grows and down when it shrinks', async ({ page }) => {
  await page.goto(adoption);
  const number = page.getByTestId('animated-number');
  const value = number.locator('.env-animated-number-value');
  await expect(number).toHaveText('3');
  await expect(value).not.toHaveAttribute('data-direction');
  await expect(page.getByRole('button', { name: 'Show 3 homes' })).toBeVisible();

  await page.getByRole('button', { name: 'More homes' }).click();
  await expect(number).toHaveText('4');
  await expect(value).toHaveAttribute('data-direction', 'up');
  await expect(value).toHaveCSS('animation-name', 'env-motion-roll-up');
  await page.getByRole('button', { name: 'Fewer homes' }).click();
  await page.getByRole('button', { name: 'Fewer homes' }).click();
  await expect(number).toHaveText('2');
  await expect(value).toHaveAttribute('data-direction', 'down');
  await expect(value).toHaveCSS('animation-name', 'env-motion-roll-down');

  // With reduced motion the new value only fades in.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'More homes' }).click();
  await expect(value).toHaveCSS('animation-name', 'env-motion-fade-in');
});
