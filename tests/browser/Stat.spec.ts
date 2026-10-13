import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const statsFixture = `${fixtureUrl}/?fixture=stats`;

test('stats read as label, figure, trend and detail, with the trend in icon and text', async ({
  page,
}) => {
  await page.goto(statsFixture);
  const group = page.getByTestId('stat-group-light');
  await expect(group).toHaveAttribute('aria-label', 'Project health light');
  const stats = group.locator('.env-stat');
  await expect(stats).toHaveCount(4);
  await expect(stats.nth(0)).toHaveText(/^Active projects128\+12% from last monthLast 30 days$/);
  await expect(stats.nth(0).locator('.env-stat-value')).toHaveCSS(
    'font-variant-numeric',
    'tabular-nums',
  );
  // Each trend shows a decorative icon beside its text, in a tone chosen by direction or by tone.
  const trends = group.locator('.env-stat-trend');
  await expect(trends.locator('.env-symbol[aria-hidden="true"] svg')).toHaveCount(4);
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

test('stats keep 4.5:1 contrast on their surfaces in both themes', async ({ page }) => {
  await page.goto(statsFixture);
  // Two themes, each with seven stats.
  await expect(page.locator('.env-stat')).toHaveCount(14);
  const failures = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const luminance = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const results: string[] = [];
    for (const part of document.querySelectorAll<HTMLElement>(
      '.env-stat-label, .env-stat-value, .env-stat-trend, .env-stat-detail',
    )) {
      // Paint every surface from the theme down to the stat.
      const layers: string[] = [];
      for (let element: HTMLElement | null = part; element; element = element.parentElement) {
        layers.unshift(getComputedStyle(element).backgroundColor);
        if (element.classList.contains('env-theme')) break;
      }
      const background = luminance(layers);
      const foreground = luminance([...layers, getComputedStyle(part).color]);
      const [lighter, darker] = [background, foreground].sort((a, b) => b - a);
      const ratio = (lighter! + 0.05) / (darker! + 0.05);
      if (ratio < 4.5) {
        const theme = part.closest('[data-env-theme]')!.getAttribute('data-env-theme');
        results.push(`${theme} ${part.className} ${part.textContent}: ${ratio.toFixed(2)}`);
      }
    }
    return results;
  });
  expect(failures).toEqual([]);
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
  expect(await columns()).toEqual({ perRow: 4, rows: 1, widths: 1 });
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
  await expect(group).toHaveClass(/env-surface-pane/);
  await expect(page.getByTestId('stat-row-group-light')).toHaveClass(/env-surface-row/);
});
