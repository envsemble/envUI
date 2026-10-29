import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const heatmapFixture = `${fixtureUrl}/?fixture=calendar-heatmap`;

// British English, so the names of days read as Sat 10 Oct 2026, from Intl, with a comma after the
// weekday in some engines.
test.use({ locale: 'en-GB' });

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  return errors;
}

/** Waits for two frames, so pointer events and the renders they cause have run. */
const nextFrames = (page: Page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );

/** Moves the pointer straight up from a day onto its tooltip. */
async function moveOntoTooltip(page: Page, day: import('@playwright/test').Locator) {
  const from = (await day.boundingBox())!;
  const to = (await page.locator('.env-calendar-heatmap-tooltip').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, to.y + to.height / 2, { steps: 12 });
  await nextFrames(page);
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
    /^Sat,? 10 Oct 2026: 0$/,
  );
  // Rows run by weekday: the first row holds the Sundays.
  await expect(cells.first()).toHaveAttribute('aria-label', /^Sun,? 12 Oct 2025: \d+$/);
  await expect(grid.locator('td[data-date="2025-10-11"]')).toHaveAttribute(
    'aria-label',
    /^Sat,? 11 Oct 2025: \d+$/,
  );
  // Month and weekday names are visual; each day names its own date.
  await expect(grid.locator('thead')).toHaveAttribute('aria-hidden', 'true');
  await expect(grid.locator('.env-calendar-heatmap-month span').first()).toHaveText('Oct');
  await expect(grid.locator('.env-calendar-heatmap-weekday span')).toHaveText([
    'Mon',
    'Wed',
    'Fri',
  ]);
  const legend = page
    .getByTestId('calendar-heatmap-year-light')
    .locator('.env-calendar-heatmap-legend');
  await expect(legend).toHaveAttribute('aria-hidden', 'true');
  await expect(legend).toHaveText('LessMore');
  await expect(legend.locator('.env-calendar-heatmap-swatch')).toHaveCount(5);
  // No tooltip is in the document at rest.
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('arrow keys move by day and week, Home and End along the weekday, Escape hides the value', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
  await page.getByRole('button', { name: 'Update light' }).focus();
  await page.keyboard.press('Shift+Tab');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await expect(tooltip).toHaveText(/^Sat,? 10 Oct 2026: 0$/);
  await page.keyboard.press('ArrowLeft');
  expect(await focusedName(page)).toMatch(/^Sat,? 3 Oct 2026: \d+$/);
  await page.keyboard.press('ArrowUp');
  expect(await focusedName(page)).toMatch(/^Fri,? 2 Oct 2026: \d+$/);
  await expect(tooltip).toHaveText((await focusedName(page))!);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // The range ends here: further steps stay put.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await page.keyboard.press('Home');
  expect(await focusedName(page)).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await page.keyboard.press('ArrowUp');
  expect(await focusedName(page)).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await page.keyboard.press('End');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // Only the focused day is a tab stop.
  await expect(grid.locator('td[tabindex="0"]')).toHaveAttribute(
    'aria-label',
    /^Sat,? 10 Oct 2026: 0$/,
  );
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  // Leaving the grid hides the value; returning shows it again.
  await page.keyboard.press('Tab');
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
  await page.keyboard.press('Shift+Tab');
  await expect(tooltip).toHaveText(/^Sat,? 10 Oct 2026: 0$/);
});

test('Page Up and Page Down reach the ends of the week, Ctrl+Home and Ctrl+End the range', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  await grid.locator('td[data-date="2026-10-07"]').focus();
  expect(await focusedName(page)).toMatch(/^Wed,? 7 Oct 2026: \d+$/);
  // Home and End keep the weekday: the first week holds only the first day, so Home goes to the
  // Wednesday of the second week.
  await page.keyboard.press('Home');
  expect(await focusedName(page)).toMatch(/^Wed,? 15 Oct 2025: \d+$/);
  await page.keyboard.press('End');
  expect(await focusedName(page)).toMatch(/^Wed,? 7 Oct 2026: \d+$/);
  await page.keyboard.press('PageUp');
  expect(await focusedName(page)).toMatch(/^Sun,? 4 Oct 2026: \d+$/);
  await page.keyboard.press('PageDown');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await page.keyboard.press('Control+Home');
  expect(await focusedName(page)).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  // The range starts on the last day of its first week, so Page Up stays there.
  await page.keyboard.press('PageUp');
  expect(await focusedName(page)).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await page.keyboard.press('PageDown');
  expect(await focusedName(page)).toMatch(/^Sat,? 11 Oct 2025: \d+$/);
  await page.keyboard.press('Control+End');
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);
  await expect(grid.locator('td[tabindex="0"]')).toHaveCount(1);
});

test('one tooltip follows the pointer across days and leaves with it', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
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

test('people can move the pointer onto the tooltip of a hovered day to read it', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
  const positioner = page.locator('.env-tooltip-positioner');
  // A day in the middle of its week, with days above it, and a Sunday in the top row.
  for (const date of ['2026-06-03', '2026-06-07']) {
    const day = grid.locator(`td[data-date="${date}"]`);
    const name = (await day.getAttribute('aria-label'))!;
    await day.hover();
    await expect(tooltip).toHaveText(name);
    await expect(positioner).not.toHaveCSS('pointer-events', 'none');
    // Straight up from the day, the pointer crosses only the gap between days to reach it.
    const from = (await day.boundingBox())!;
    const to = (await tooltip.boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, to.y + to.height / 2, { steps: 12 });
    await page.clock.runFor(600);
    await expect(tooltip).toHaveText(name);
    // Leaving the tooltip for anything but the days closes it.
    await page.mouse.move(to.x - 40, to.y - 60, { steps: 4 });
    await expect(positioner).toHaveCount(0);
  }
});

test('a day clicked with the mouse shows a tooltip the pointer can move onto', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
  const day = grid.locator('td[data-date="2026-06-03"]');
  const name = (await day.getAttribute('aria-label'))!;
  await day.hover();
  await expect(tooltip).toHaveText(name);
  await day.click();
  await expect(day).toBeFocused();
  await expect(page.locator('.env-tooltip-positioner')).not.toHaveCSS('pointer-events', 'none');
  await moveOntoTooltip(page, day);
  await expect(tooltip).toHaveText(name);
});

test('a press released outside the days leaves keyboard focus its own tooltip', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const update = page.getByRole('button', { name: 'Update light' });
  const positioner = page.locator('.env-tooltip-positioner');
  // The tooltip marks that focus opened it, and its positioner then takes no pointer.
  const popup = page.locator('.env-calendar-heatmap-tooltip');
  await update.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(popup).toHaveAttribute('data-focus-opened', '');
  // A press on the focused day moves no focus; it ends outside the grid.
  const day = (await grid.locator('td[tabindex="0"]').boundingBox())!;
  await page.mouse.move(day.x + day.width / 2, day.y + day.height / 2);
  await page.mouse.down();
  await page.mouse.move(5, 5, { steps: 4 });
  await page.mouse.up();
  // Focus that comes back from the keyboard opens a tooltip that takes no pointer.
  await page.keyboard.press('Tab');
  await expect(update).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(popup).toHaveAttribute('data-focus-opened', '');
  await expect(positioner).toHaveCSS('pointer-events', 'none');
});

test('a tooltip the pointer rests on stays when focus leaves the days', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
  await page.getByRole('button', { name: 'Update light' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(tooltip).toHaveText(/^Sat,? 10 Oct 2026: 0$/);
  const day = grid.locator('td[data-date="2026-06-03"]');
  const name = (await day.getAttribute('aria-label'))!;
  await day.hover();
  await expect(tooltip).toHaveText(name);
  await moveOntoTooltip(page, day);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Update light' })).toBeFocused();
  await nextFrames(page);
  await expect(page.locator('.env-tooltip-positioner')).toHaveAttribute('data-open', '');
  await expect(tooltip).toHaveText(name);
});

test('custom labels, weeks from Monday, levels and a tone', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Deployments light' });
  await expect(grid.getByRole('gridcell')).toHaveCount(35);
  await expect(grid.locator('.env-calendar-heatmap-weekday span')).toHaveText(['Mo', 'Mi', 'Fr']);
  await expect(grid.locator('.env-calendar-heatmap-month span')).toHaveText(['Mär']);
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
  await expect(page.locator('.env-calendar-heatmap-tooltip')).toHaveText(
    '4 deployments on 2026-03-03',
  );
  const scope = page.getByTestId('calendar-heatmap-light');
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
    probe.style.color = 'var(--env-color-fg-success)';
    element.closest('.env-calendar-heatmap')!.append(probe);
    const tone = paint(getComputedStyle(probe).color);
    probe.remove();
    return { cell: paint(getComputedStyle(element).backgroundColor), tone };
  });
  colors.cell.forEach((channel, index) => expect(channel).toBeCloseTo(colors.tone[index]!, -0.5));
});

test("names, dates and values follow the provider's locale, and the legend its messages", async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const scope = page.getByTestId('calendar-heatmap-provided-light');
  const grid = scope.getByRole('grid', { name: 'Provided light' });
  const expected = await page.evaluate(() => {
    const utc = { timeZone: 'UTC' } as const;
    return {
      month: new Intl.DateTimeFormat('de-DE', { month: 'short', ...utc }).format(
        Date.UTC(2026, 9, 1),
      ),
      monday: new Intl.DateTimeFormat('de-DE', { weekday: 'short', ...utc }).format(
        Date.UTC(2026, 9, 5),
      ),
      day: new Intl.DateTimeFormat('de-DE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...utc,
      }).format(Date.UTC(2026, 9, 6)),
    };
  });
  await expect(grid.locator('.env-calendar-heatmap-month span').first()).toHaveText(expected.month);
  await expect(grid.locator('.env-calendar-heatmap-weekday span').first()).toHaveText(
    expected.monday,
  );
  await expect(grid.locator('td[data-date="2026-10-06"]')).toHaveAttribute(
    'aria-label',
    `${expected.day}: 1.234`,
  );
  await expect(scope.locator('.env-calendar-heatmap-legend')).toHaveText('WenigViel');
});

test('an update rescales the days', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const last = grid.locator('td[data-date="2026-10-10"]');
  await expect(last).toHaveAttribute('data-level', '0');
  const before = await grid.locator('td[data-level="4"]').count();
  await page.getByRole('button', { name: 'Update light' }).click();
  await expect(last).toHaveAttribute('data-level', '4');
  await expect(last).toHaveAttribute('aria-label', /^Sat,? 10 Oct 2026: 20$/);
  // With a larger maximum, fewer days reach the strongest step.
  expect(await grid.locator('td[data-level="4"]').count()).toBeLessThan(before);
});

test('a year renders updates and focus moves within a frame', async ({ page }) => {
  // Times on a fresh page. Another browser busy beside this one can stall a single run past the
  // budget, so the best of up to three runs counts: a slow update is slow in every run.
  const measure = async () => {
    await page.goto(heatmapFixture);
    await expect(page.getByRole('grid', { name: 'Activity light' })).toBeVisible();
    return page.evaluate(async () => {
      const scope = document.querySelector('[data-testid="calendar-heatmap-light"]')!;
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
  };
  let timings = await measure();
  for (let run = 1; run < 3 && (timings.update >= 100 || timings.focus >= 16); run++) {
    const next = await measure();
    timings = {
      update: Math.min(timings.update, next.update),
      focus: Math.min(timings.focus, next.focus),
    };
  }
  expect(timings.update).toBeLessThan(100);
  expect(timings.focus).toBeLessThan(16);
  // Moving across forty days left a single tooltip.
  await expect(page.locator('.env-tooltip-positioner')).toHaveCount(1);
});

test(
  'a narrow container scrolls the weeks, starting at the most recent',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(heatmapFixture);
    const heatmap = page.getByTestId('calendar-heatmap-year-light');
    const scroller = heatmap.locator('.env-calendar-heatmap-scroll');
    // It starts and stays at the end while the weeks settle, such as when the web font loads: the
    // scroller is a reversed row, whose scroll origin is its end, so no script scrolls it.
    await expect
      .poll(() =>
        scroller.evaluate((element) => ({
          scrolls: element.scrollWidth > element.clientWidth,
          atEnd: Math.abs(element.scrollLeft) < 2,
          reversed: getComputedStyle(element).flexDirection,
        })),
      )
      .toEqual({ scrolls: true, atEnd: true, reversed: 'row-reverse' });
    const box = (await scroller.boundingBox())!;
    const last = (await heatmap.locator('td[data-date="2026-10-10"]').boundingBox())!;
    expect(last.x + last.width).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    // Home scrolls the first week into view.
    await heatmap.locator('td[tabindex="0"]').focus();
    await page.keyboard.press('Home');
    const first = (await heatmap.locator('td[data-date="2025-10-11"]').boundingBox())!;
    expect(first.x).toBeGreaterThanOrEqual(box.x - 1);
  },
);

test('right-to-left heatmaps run the weeks from the right and turn the arrow keys', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const heatmap = page.getByTestId('calendar-heatmap-year-light');
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

  test(
    'a tap shows the value of the day, and the days grow',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(heatmapFixture);
      const cell = page
        .getByRole('grid', { name: 'Activity light' })
        .locator('td[data-date="2026-06-01"]');
      await expect(cell).toHaveCSS('width', '20px');
      // Days are 24 px apart in both directions, the minimum target size with its spacing. Both are
      // measured at once, as the weeks may still scroll to the most recent while the font loads.
      const pitch = await page.getByRole('grid', { name: 'Activity light' }).evaluate((grid) => {
        const box = (date: string) =>
          grid.querySelector(`td[data-date="${date}"]`)!.getBoundingClientRect();
        const day = box('2026-06-01');
        return { down: box('2026-06-02').y - day.y, across: box('2026-06-08').x - day.x };
      });
      expect(pitch.down).toBeGreaterThan(23.99);
      expect(pitch.across).toBeGreaterThan(23.99);
      await cell.scrollIntoViewIfNeeded();
      await cell.tap();
      await expect(page.locator('.env-calendar-heatmap-tooltip')).toHaveText(
        (await cell.getAttribute('aria-label'))!,
      );
      await page.getByRole('button', { name: 'Update light' }).tap();
      await expect(page.locator('.env-tooltip-positioner')).toHaveCount(0);
    },
  );
});

test('thresholds set the color steps, for example to color days by rank', async ({ page }) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Ranked light' });
  const level = (date: string) =>
    grid.locator(`td[data-date="${date}"]`).getAttribute('data-level');
  await expect(grid.locator('td[data-date="2026-05-04"]')).toBeAttached();
  // Thresholds in any order: 1, 10, 20 and 40 start the four steps above the empty one.
  expect(await level('2026-05-04')).toBe('1');
  expect(await level('2026-05-05')).toBe('2');
  expect(await level('2026-05-06')).toBe('3');
  expect(await level('2026-05-07')).toBe('4');
  // Below the first threshold a day shows as empty, like a day without data.
  expect(await level('2026-05-08')).toBe('0');
  expect(await level('2026-05-09')).toBe('0');
  const legend = page
    .locator('.env-calendar-heatmap')
    .filter({ has: grid })
    .locator('.env-calendar-heatmap-legend');
  await expect(legend.locator('.env-calendar-heatmap-swatch')).toHaveCount(5);
});

test('explicit thresholds color days of 0, and two levels color their only step in the tone', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const fromZero = page.getByRole('grid', { name: 'From zero light' });
  const level = (date: string) =>
    fromZero.locator(`td[data-date="${date}"]`).getAttribute('data-level');
  await expect(fromZero.locator('td[data-date="2026-05-04"]')).toBeAttached();
  // A first threshold of 0 colors days of 0, with or without data; values below it stay empty.
  expect(await level('2026-05-04')).toBe('1');
  expect(await level('2026-05-03')).toBe('1');
  expect(await level('2026-05-05')).toBe('2');
  expect(await level('2026-05-06')).toBe('0');

  const two = page.getByRole('grid', { name: 'Two steps light' });
  await expect(two.locator('td[data-date="2026-05-05"]')).toHaveAttribute('data-level', '0');
  const day = two.locator('td[data-date="2026-05-04"]');
  await expect(day).toHaveAttribute('data-level', '1');
  const colors = await day.evaluate((element) => {
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
    probe.style.color = 'var(--env-color-fg-primary)';
    element.closest('.env-calendar-heatmap')!.append(probe);
    const tone = paint(getComputedStyle(probe).color);
    probe.remove();
    return { cell: paint(getComputedStyle(element).backgroundColor), tone };
  });
  colors.cell.forEach((channel, index) => expect(channel).toBeCloseTo(colors.tone[index]!, -0.5));
});

test('a tooltip opened by focus leaves with the pointer and never blocks a press', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  const grid = page.getByRole('grid', { name: 'Activity light' });
  const tooltip = page.locator('.env-calendar-heatmap-tooltip');
  const positioner = page.locator('.env-tooltip-positioner');
  const update = page.getByRole('button', { name: 'Update light' });
  await update.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(tooltip).toHaveText(/^Sat,? 10 Oct 2026: 0$/);
  // The tooltip takes no pointer: a press where it shows reaches what lies under it.
  await expect(positioner).toHaveCSS('pointer-events', 'none');
  const box = (await tooltip.boundingBox())!;
  const under = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest('.env-tooltip-positioner') ?? null,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(under).toBeNull();
  // Moving the pointer elsewhere on the page closes it; the day keeps focus.
  await page.mouse.move(5, 5);
  await page.mouse.move(60, 40);
  await expect(positioner).toHaveCount(0);
  expect(await focusedName(page)).toMatch(/^Sat,? 10 Oct 2026: 0$/);

  // Hovering the days and then leaving them closes it too, also while a day has keyboard focus.
  await page.keyboard.press('ArrowLeft');
  await expect(tooltip).toHaveText((await focusedName(page))!);
  const day = grid.locator('td[data-date="2026-06-01"]');
  await day.hover();
  await expect(tooltip).toHaveText((await day.getAttribute('aria-label'))!);
  await update.hover();
  await expect(positioner).toHaveCount(0);
  await expect(grid.locator('td[tabindex="0"]')).toBeFocused();
});

test('Escape hides the tooltip of a heatmap in a dialog and keeps the dialog open', async ({
  page,
}) => {
  await page.goto(heatmapFixture);
  await page.getByRole('button', { name: 'Open activity light' }).click();
  const dialog = page.getByRole('dialog', { name: 'Activity details light' });
  await expect(dialog).toBeVisible();
  const grid = dialog.getByRole('grid', { name: 'Activity in a dialog light' });
  await grid.locator('td[tabindex="0"]').focus();
  await expect(page.locator('.env-calendar-heatmap-tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.env-calendar-heatmap-tooltip')).toHaveCount(0);
  await expect(dialog).toBeVisible();
  // With no tooltip to hide, Escape closes the dialog as usual.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
