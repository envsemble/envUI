import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const splitFixture = `${fixtureUrl}/?fixture=split-view`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

function splitOf(divider: Locator) {
  return divider.locator('xpath=..');
}

async function paneWidths(split: Locator) {
  return split.evaluate((element) => {
    const [start, end] = element.querySelectorAll<HTMLElement>(':scope > .env-split-view-pane');
    return { start: start!.offsetWidth, end: end!.offsetWidth };
  });
}

test('the divider resizes with the pointer and the keyboard and remembers the size', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(splitFixture);
  const divider = page.getByRole('separator', { name: 'Resize documents light' });
  const split = splitOf(divider);
  await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  await expect(divider).toHaveAttribute('aria-valuenow', '40');
  await expect(divider).toHaveAttribute('aria-valuemin', '25');
  await expect(divider).toHaveAttribute('aria-valuemax', '75');
  await expect(divider).toHaveAttribute('aria-valuetext', '40%');
  await expect(divider).toHaveAttribute('tabindex', '0');
  const controls = await divider.getAttribute('aria-controls');
  await expect(split.locator(`[id="${controls}"]`)).toHaveAttribute('data-pane', 'start');
  const widths = await paneWidths(split);
  const shared = widths.start + widths.end;
  expect(widths.start / shared).toBeCloseTo(0.4, 2);

  // Dragging moves the divider with the pointer.
  const box = (await divider.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + shared * 0.1, box.y + 40, { steps: 5 });
  await expect(split).toHaveAttribute('data-resizing', 'true');
  await page.mouse.up();
  await expect(split).not.toHaveAttribute('data-resizing');
  await expect(divider).toHaveAttribute('aria-valuenow', '50');
  expect((await paneWidths(split)).start / shared).toBeCloseTo(0.5, 2);
  expect(
    Number(await page.evaluate(() => localStorage.getItem('fixture-split-light'))),
  ).toBeCloseTo(50, 0);
  await expect(page.getByTestId('split-changes-light')).not.toHaveText('');

  // Arrow keys step by 2, with Shift by 10; Home and End reach the bounds.
  await divider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(divider).toHaveAttribute('aria-valuenow', '48');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(divider).toHaveAttribute('aria-valuenow', '58');
  await page.keyboard.press('End');
  await expect(divider).toHaveAttribute('aria-valuenow', '75');
  await page.keyboard.press('Home');
  await expect(divider).toHaveAttribute('aria-valuenow', '25');
  expect((await paneWidths(split)).start / shared).toBeCloseTo(0.25, 2);

  // Dragging past a bound stops at it.
  const edge = (await divider.boundingBox())!;
  await page.mouse.move(edge.x + edge.width / 2, edge.y + 40);
  await page.mouse.down();
  await page.mouse.move(edge.x - 400, edge.y + 40, { steps: 4 });
  await page.mouse.up();
  await expect(divider).toHaveAttribute('aria-valuenow', '25');

  await divider.focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(divider).toHaveAttribute('aria-valuenow', '35');
  await page.reload();
  await expect(page.getByRole('separator', { name: 'Resize documents light' })).toHaveAttribute(
    'aria-valuenow',
    '35',
  );

  // A double click returns to the default and forgets the chosen size.
  await page.getByRole('separator', { name: 'Resize documents light' }).dblclick();
  await expect(page.getByRole('separator', { name: 'Resize documents light' })).toHaveAttribute(
    'aria-valuenow',
    '40',
  );
  expect(await page.evaluate(() => localStorage.getItem('fixture-split-light'))).toBeNull();
  expect(errors).toEqual([]);
});

test('another storage key brings the share stored under it, or the default', async ({ page }) => {
  await page.goto(splitFixture);
  await page.evaluate(() => localStorage.setItem('fixture-split-light', '60'));
  await page.reload();
  const divider = page.getByRole('separator', { name: 'Resize documents light' });
  await expect(divider).toHaveAttribute('aria-valuenow', '60');
  const switchStorage = page.getByRole('button', { name: 'Switch storage light' });
  await switchStorage.click();
  // Nothing is stored under the new key yet, so the split starts at its default.
  await expect(divider).toHaveAttribute('aria-valuenow', '40');
  await divider.focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(divider).toHaveAttribute('aria-valuenow', '50');
  expect(await page.evaluate(() => localStorage.getItem('fixture-split-light-other'))).toBe('50');
  await switchStorage.click();
  await expect(divider).toHaveAttribute('aria-valuenow', '60');
  await switchStorage.click();
  await expect(divider).toHaveAttribute('aria-valuenow', '50');
});

test('a controlled split reports sizes and follows its size prop', async ({ page }) => {
  await page.goto(splitFixture);
  const divider = page.getByRole('separator', { name: 'Resize controlled light' });
  await expect(divider).toHaveAttribute('aria-valuenow', '30');
  await divider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('split-size-light')).toHaveText('32');
  await expect(divider).toHaveAttribute('aria-valuenow', '32');
  await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(page.getByTestId('split-size-light')).toHaveText('20');
});

test('a hidden split view keeps its panes stacked, and one that leaves reports it', async ({
  page,
}) => {
  await page.goto(splitFixture);
  const frame = page.getByTestId('split-frame-light');
  const split = frame.locator('.env-split-view');
  const stackedChanges = page.getByTestId('split-stacked-light');
  await frame.evaluate((element) => (element.style.inlineSize = '30rem'));
  await expect(split).toHaveAttribute('data-stacked', 'true');
  await expect(stackedChanges).toHaveText('true');
  // Hidden, as in a hidden tab panel, it has nothing to measure and shows again stacked.
  await frame.evaluate((element) => (element.hidden = true));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  expect(
    await frame.evaluate((element) => {
      element.hidden = false;
      return element.querySelector('.env-split-view')!.getAttribute('data-stacked');
    }),
  ).toBe('true');
  await expect(stackedChanges).toHaveText('true');
  // Leaving while stacked reports that the panes no longer stack.
  await page.getByRole('button', { name: 'Toggle documents split light' }).click();
  await expect(split).toHaveCount(0);
  await expect(stackedChanges).toHaveText('true false');
});

test('a bare number for stackBelow is a width in pixels', async ({ page }) => {
  await page.goto(splitFixture);
  const split = page.getByTestId('controlled-split-light');
  await expect(split).not.toHaveAttribute('data-stacked');
  await split.evaluate((element) => (element.style.inlineSize = '500px'));
  await expect(split).toHaveAttribute('data-stacked', 'true');
  await split.evaluate((element) => (element.style.inlineSize = '700px'));
  await expect(split).not.toHaveAttribute('data-stacked');
});

test('the panes stack below their own width threshold and the divider leaves', async ({ page }) => {
  await page.goto(splitFixture);
  const frame = page.getByTestId('split-frame-light');
  const split = frame.locator('.env-split-view');
  const stackedChanges = page.getByTestId('split-stacked-light');
  await expect(split).not.toHaveAttribute('data-stacked');
  await expect(stackedChanges).toHaveText('');
  // The window stays wide; only the split view's container narrows.
  await frame.evaluate((element) => (element.style.inlineSize = '30rem'));
  await expect(split).toHaveAttribute('data-stacked', 'true');
  // The application hears about it once, with the new arrangement.
  await expect(stackedChanges).toHaveText('true');
  await expect(page.getByRole('separator', { name: 'Resize documents light' })).toHaveCount(0);
  const [start, end] = await split
    .locator(':scope > .env-split-view-pane')
    .evaluateAll((panes) => panes.map((pane) => pane.getBoundingClientRect().toJSON()));
  expect(end!.top).toBeGreaterThanOrEqual(start!.bottom);
  expect(start!.width).toBeCloseTo(end!.width, 0);
  // The stacked panes scroll together within the set height, never sideways.
  for (const direction of ['ltr', 'rtl']) {
    await frame.evaluate((element, value) => element.setAttribute('dir', value), direction);
    expect(
      await split.evaluate((element) => ({
        overflow: getComputedStyle(element).overflowY,
        sideways: element.scrollWidth > element.clientWidth,
        down: element.scrollHeight > element.clientHeight,
      })),
    ).toEqual({ overflow: 'auto', sideways: false, down: true });
  }
  await frame.evaluate((element) => element.removeAttribute('dir'));
  await frame.evaluate((element) => (element.style.inlineSize = ''));
  await expect(split).not.toHaveAttribute('data-stacked');
  await expect(page.getByRole('separator', { name: 'Resize documents light' })).toBeVisible();
  await expect(stackedChanges).toHaveText('true false');

  // A narrow window stacks the panes without overflowing.
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(split).toHaveAttribute('data-stacked', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('right-to-left splits put the start pane on the right and turn the arrow keys', async ({
  page,
}) => {
  await page.goto(splitFixture);
  const frame = page.getByTestId('split-frame-light');
  await frame.evaluate((element) => element.setAttribute('dir', 'rtl'));
  const divider = page.getByRole('separator', { name: 'Resize documents light' });
  const split = splitOf(divider);
  const [start, end] = await split
    .locator(':scope > .env-split-view-pane')
    .evaluateAll((panes) => panes.map((pane) => pane.getBoundingClientRect().toJSON()));
  expect(start!.left).toBeGreaterThan(end!.left);
  await divider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(divider).toHaveAttribute('aria-valuenow', '42');
  // Dragging toward the end pane, to the left, widens the start pane.
  const box = (await divider.boundingBox())!;
  const widths = await paneWidths(split);
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - (widths.start + widths.end) * 0.1, box.y + 40, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(divider).toHaveAttribute('aria-valuenow', '52');
});

test('the divider line and its focus keep their colors in both themes', async ({ page }) => {
  await page.goto(splitFixture);
  for (const theme of ['light', 'dark']) {
    const divider = page.getByRole('separator', { name: `Resize documents ${theme}` });
    const line = () =>
      divider.evaluate((element) => {
        const style = getComputedStyle(element, '::after');
        const probe = document.createElement('span');
        element.append(probe);
        probe.style.color = 'var(--color-border-strong)';
        const border = getComputedStyle(probe).color;
        probe.style.color = 'var(--color-focus-ring)';
        const focus = getComputedStyle(probe).color;
        probe.remove();
        return { color: style.backgroundColor, width: style.width, border, focus };
      });
    const rest = await line();
    expect(rest.color).toBe(rest.border);
    expect(rest.width).toBe('1px');
    await divider.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await line()).width).toBe('2px');
    await expect.poll(async () => (await line()).color).toBe(rest.focus);
    // The focused line keeps 3:1 against the canvas.
    const ratio = await divider.evaluate((element) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const luminance = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        const linear = (value: number) => {
          const channel = value / 255;
          return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
      };
      const ground = luminance(getComputedStyle(element.closest('.env-theme')!).backgroundColor);
      const line = luminance(getComputedStyle(element, '::after').backgroundColor);
      return (Math.max(ground, line) + 0.05) / (Math.min(ground, line) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  }
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('the divider takes the touch size beyond its gutter', async ({ page }) => {
    await page.goto(splitFixture);
    const divider = page.getByRole('separator', { name: 'Resize documents light' });
    const box = (await divider.boundingBox())!;
    const reached = await page.evaluate(
      ({ x, y }) =>
        [-20, 20].map((offset) =>
          document.elementFromPoint(x + offset, y)?.classList.contains('env-split-view-divider'),
        ),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    expect(reached).toEqual([true, true]);
  });
});
