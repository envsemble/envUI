import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const heatmapFixture = `${fixtureUrl}/?fixture=heatmap`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  return errors;
}

const focusedName = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('aria-label'));

test('a year of days is one grid with named cells and a single tab stop', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  await expect(grid).toHaveAttribute('aria-readonly', 'true');
  const cells = grid.getByRole('gridcell');
  await expect(cells).toHaveCount(365);
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
  await expect(grid.locator('td[tabindex="0"]')).toHaveAttribute(
    'aria-label',
    'Sat 10 Oct 2026: 0',
  );
  // Rows run by weekday: the first row holds the Sundays.
  await expect(cells.first()).toHaveAttribute('aria-label', /^Sun 12 Oct 2025: \d+$/);
  await expect(grid.locator('td[data-date="2025-10-11"]')).toHaveAttribute(
    'aria-label',
    /^Sat 11 Oct 2025: \d+$/,
  );
  // Month and weekday names are visual; each day names its own date.
  await expect(grid.locator('thead')).toHaveAttribute('aria-hidden', 'true');
  await expect(grid.locator('.env-heatmap-month span').first()).toHaveText('Oct');
  await expect(grid.locator('.env-heatmap-weekday span')).toHaveText(['Mon', 'Wed', 'Fri']);
  const legend = page.getByTestId('heatmap-year-light').locator('.env-heatmap-legend');
  await expect(legend).toHaveAttribute('aria-hidden', 'true');
  await expect(legend).toHaveText('LessMore');
  await expect(legend.locator('.env-heatmap-swatch')).toHaveCount(5);
  // No tooltip is in the document at rest.
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('arrow keys move by day and week, Home and End reach the range, Escape hides the value', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-heatmap-tooltip');
  await page.getByRole('button', { name: 'Update light' }).focus();
  await page.keyboard.press('Shift+Tab');
  expect(await focusedName(page)).toBe('Sat 10 Oct 2026: 0');
  await expect(tooltip).toHaveText('Sat 10 Oct 2026: 0');
  await page.keyboard.press('ArrowLeft');
  expect(await focusedName(page)).toMatch(/^Sat 3 Oct 2026: \d+$/);
  await page.keyboard.press('ArrowUp');
  expect(await focusedName(page)).toMatch(/^Fri 2 Oct 2026: \d+$/);
  await expect(tooltip).toHaveText((await focusedName(page))!);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  expect(await focusedName(page)).toBe('Sat 10 Oct 2026: 0');
  // The range ends here: further steps stay put.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  expect(await focusedName(page)).toBe('Sat 10 Oct 2026: 0');
  await page.keyboard.press('Home');
  expect(await focusedName(page)).toMatch(/^Sat 11 Oct 2025: \d+$/);
  await page.keyboard.press('ArrowUp');
  expect(await focusedName(page)).toMatch(/^Sat 11 Oct 2025: \d+$/);
  await page.keyboard.press('End');
  expect(await focusedName(page)).toBe('Sat 10 Oct 2026: 0');
  // Only the focused day is a tab stop.
  await expect(grid.locator('td[tabindex="0"]')).toHaveAttribute(
    'aria-label',
    'Sat 10 Oct 2026: 0',
  );
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  expect(await focusedName(page)).toBe('Sat 10 Oct 2026: 0');
  // Leaving the grid hides the value; returning shows it again.
  await page.keyboard.press('Tab');
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  await page.keyboard.press('Shift+Tab');
  await expect(tooltip).toHaveText('Sat 10 Oct 2026: 0');
});

test('one tooltip follows the pointer across days and leaves with it', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-heatmap-tooltip');
  const first = grid.locator('td[data-date="2026-06-01"]');
  const second = grid.locator('td[data-date="2026-06-08"]');
  await first.hover();
  await expect(tooltip).toHaveText((await first.getAttribute('aria-label'))!);
  // The tooltip sits above its day.
  const tip = (await page.locator('.env-tooltip-positioner').boundingBox())!;
  const cell = (await first.boundingBox())!;
  expect(tip.y + tip.height).toBeLessThanOrEqual(cell.y + 1);
  expect(Math.abs(tip.x + tip.width / 2 - (cell.x + cell.width / 2))).toBeLessThan(2);
  await second.hover();
  await expect(tooltip).toHaveText((await second.getAttribute('aria-label'))!);
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(1);
  await page.mouse.move(5, 5);
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
});

test('custom labels, weeks from Monday, levels and a tone', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Deployments light' });
  await expect(grid.getByRole('gridcell')).toHaveCount(35);
  await expect(grid.locator('.env-heatmap-weekday span')).toHaveText(['Mo', 'Mi', 'Fr']);
  await expect(grid.locator('.env-heatmap-month span')).toHaveText(['Mär']);
  // The first week starts on Monday 23 February; only Sunday 1 March is in range.
  const firstColumn = await grid
    .locator('tbody tr')
    .evaluateAll((rows) => rows.map((row) => row.children[1]!.getAttribute('aria-label')));
  expect(firstColumn).toEqual([null, null, null, null, null, null, 'So 1 Mär 2026: 0']);
  const named = grid.locator('td[data-date="2026-03-03"]');
  await expect(named).toHaveAttribute('aria-label', 'Di 3 Mär 2026: 4 deployments');
  await expect(named).toHaveAttribute('data-level', '1');
  await expect(grid.locator('td[data-date="2026-03-24"]')).toHaveAttribute('data-level', '2');
  await named.focus();
  await expect(page.locator('.env-heatmap-tooltip')).toHaveText('4 deployments on 2026-03-03');
  const scope = page.getByTestId('heatmap-light');
  await expect(scope.getByText('Weniger')).toBeVisible();
  await expect(scope.getByText('Mehr')).toBeVisible();
  // The strongest step is the tone itself, as painted.
  const colors = await grid.locator('td[data-date="2026-03-24"]').evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const paint = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-tone-success)';
    element.closest('.env-heatmap')!.append(probe);
    const tone = paint(getComputedStyle(probe).color);
    probe.remove();
    return { cell: paint(getComputedStyle(element).backgroundColor), tone };
  });
  colors.cell.forEach((channel, index) => expect(channel).toBeCloseTo(colors.tone[index]!, -0.5));
});

test('the ramp rises from the empty fill to the tone in both themes', async ({ page }) => {
  await page.goto(heatmapFixture);
  for (const theme of ['light', 'dark']) {
    const result = await page.getByTestId(`heatmap-year-${theme}`).evaluate((element) => {
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
      const ground = getComputedStyle(element.closest('.env-theme')!).backgroundColor;
      const contrast = (color: string) => {
        const [lighter, darker] = [luminance([ground]), luminance([ground, color])].sort(
          (a, b) => b - a,
        );
        return (lighter! + 0.05) / (darker! + 0.05);
      };
      const swatches = [...element.querySelectorAll<HTMLElement>('.env-heatmap-swatch')].map(
        (swatch) => getComputedStyle(swatch).backgroundColor,
      );
      // Every day uses the swatch of its level.
      const mismatched = [...element.querySelectorAll<HTMLElement>('td[data-level]')].filter(
        (cell) => getComputedStyle(cell).backgroundColor !== swatches[Number(cell.dataset.level)],
      ).length;
      return { contrasts: swatches.map(contrast), mismatched };
    });
    expect(result.mismatched).toBe(0);
    const [empty, ...steps] = result.contrasts;
    // Each step stands further from the canvas than the one before, ending at 3:1 or more.
    for (let index = 1; index < steps.length; index++)
      expect(steps[index]!).toBeGreaterThan(steps[index - 1]!);
    expect(steps[0]!).toBeGreaterThan(empty!);
    expect(steps.at(-1)!).toBeGreaterThanOrEqual(3);
  }
  // Month, weekday and legend text keep 4.5:1 on the canvas and on panes.
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
    for (const text of document.querySelectorAll<HTMLElement>(
      '.env-heatmap-month span, .env-heatmap-weekday span, .env-heatmap-legend > span:not(.env-heatmap-swatch)',
    )) {
      const layers: string[] = [];
      for (let element: HTMLElement | null = text; element; element = element.parentElement) {
        layers.unshift(getComputedStyle(element).backgroundColor);
        if (element.classList.contains('env-theme')) break;
      }
      const [lighter, darker] = [
        luminance(layers),
        luminance([...layers, getComputedStyle(text).color]),
      ].sort((a, b) => b - a);
      const ratio = (lighter! + 0.05) / (darker! + 0.05);
      if (ratio < 4.5) results.push(`${text.textContent}: ${ratio.toFixed(2)}`);
    }
    return results;
  });
  expect(failures).toEqual([]);
});

test('an update rescales the days', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const last = grid.locator('td[data-date="2026-10-10"]');
  await expect(last).toHaveAttribute('data-level', '0');
  const before = await grid.locator('td[data-level="4"]').count();
  await page.getByRole('button', { name: 'Update light' }).click();
  await expect(last).toHaveAttribute('data-level', '4');
  await expect(last).toHaveAttribute('aria-label', 'Sat 10 Oct 2026: 20');
  // With a larger maximum, fewer days reach the strongest step.
  expect(await grid.locator('td[data-level="4"]').count()).toBeLessThan(before);
});

test('a year renders updates and focus moves within a frame', async ({ page }) => {
  await page.goto(heatmapFixture);
  await expect(page.getByRole('grid', { name: 'Activity light' })).toBeVisible();
  const timings = await page.evaluate(async () => {
    const scope = document.querySelector('[data-testid="heatmap-light"]')!;
    const cell = scope.querySelector('td[data-date="2026-10-10"]')!;
    const button = [...scope.querySelectorAll('button')].find(
      (element) => element.textContent === 'Update light',
    )!;
    // A click renders synchronously, so the attribute changes before the observer reports it.
    const update = await new Promise<number>((resolve) => {
      const start = performance.now();
      const observer = new MutationObserver(() => {
        observer.disconnect();
        resolve(performance.now() - start);
      });
      observer.observe(cell, { attributes: true });
      button.click();
    });
    const days = [...scope.querySelectorAll<HTMLElement>('td[data-day]')].slice(100, 140);
    const start = performance.now();
    for (const day of days) day.focus();
    return { update, focus: (performance.now() - start) / days.length };
  });
  expect(timings.update).toBeLessThan(100);
  expect(timings.focus).toBeLessThan(16);
  // Moving across forty days left a single tooltip.
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(1);
});

test('a narrow container scrolls the weeks, starting at the most recent', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(heatmapFixture);
  const heatmap = page.getByTestId('heatmap-year-light');
  const scroller = heatmap.locator('.env-heatmap-scroll');
  // It stays at the end while the weeks settle, such as when the web font loads.
  await expect
    .poll(() =>
      scroller.evaluate((element) => ({
        scrolls: element.scrollWidth > element.clientWidth,
        atEnd: Math.abs(element.scrollLeft + element.clientWidth - element.scrollWidth) < 2,
      })),
    )
    .toEqual({ scrolls: true, atEnd: true });
  const box = (await scroller.boundingBox())!;
  const last = (await heatmap.locator('td[data-date="2026-10-10"]').boundingBox())!;
  expect(last.x + last.width).toBeLessThanOrEqual(box.x + box.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Home scrolls the first week into view.
  await heatmap.locator('td[tabindex="0"]').focus();
  await page.keyboard.press('Home');
  const first = (await heatmap.locator('td[data-date="2025-10-11"]').boundingBox())!;
  expect(first.x).toBeGreaterThanOrEqual(box.x - 1);
});

test('right-to-left heatmaps run the weeks from the right and turn the arrow keys', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const heatmap = page.getByTestId('heatmap-year-light');
  await heatmap.evaluate((element) => element.setAttribute('dir', 'rtl'));
  const early = (await heatmap.locator('td[data-date="2026-06-01"]').boundingBox())!;
  const later = (await heatmap.locator('td[data-date="2026-06-08"]').boundingBox())!;
  expect(later.x).toBeLessThan(early.x);
  await heatmap.locator('td[data-date="2026-06-01"]').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('data-date'))).toBe(
    '2026-06-08',
  );
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('a tap shows the value of the day, and the days grow', async ({ page }) => {
    await page.goto(heatmapFixture);
    const cell = page
      .getByRole('grid', { name: 'Activity light' })
      .locator('td[data-date="2026-06-01"]');
    await expect(cell).toHaveCSS('width', '16px');
    await cell.tap();
    await expect(page.locator('.env-heatmap-tooltip')).toHaveText(
      (await cell.getAttribute('aria-label'))!,
    );
    await page.getByRole('button', { name: 'Update light' }).tap();
    await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  });
});
