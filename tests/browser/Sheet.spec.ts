import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const sheets = `${fixtureUrl}/?fixture=sheets`;

/** Whether focus is inside the element. */
const holdsFocus = (page: Page, name: string) =>
  page
    .getByRole('dialog', { name })
    .evaluate((element) => element.contains(document.activeElement));

/**
 * Waits for an opened sheet's entrance to end. Base UI marks the first frame with
 * data-starting-style, and only once it removes that do the transitions start: a busy engine can
 * read no animations before then, and the sheet would still be sliding in.
 */
const slidIn = (sheet: Locator) =>
  sheet.evaluate(async (element) => {
    while (element.hasAttribute('data-starting-style'))
      await new Promise((resolve) => requestAnimationFrame(resolve));
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });

test.describe('Sheet', () => {
  test(
    'traps focus while open and returns it to the trigger on close',
    { tag: '@engines' },
    async ({ page, browserName }) => {
      await page.goto(sheets);
      const trigger = page.getByRole('button', { name: 'Open filters' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const sheet = page.getByRole('dialog', { name: 'Filters' });
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAccessibleDescription('Narrow the list.');
      // Focus starts on the first element that takes Tab, the close button.
      await expect(sheet.getByRole('button', { name: 'Close' })).toBeFocused();
      // Tab and Shift+Tab cycle through the close button, the field and the action, never leaving.
      // WebKit's Tab reaches only fields, as Safari's does by default; Alt+Tab reaches every control.
      const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
      for (const key of [tab, tab, tab, tab, `Shift+${tab}`, `Shift+${tab}`, `Shift+${tab}`]) {
        await page.keyboard.press(key);
        // Focus passes through the trap's guards on its way round, so it settles first.
        await expect.poll(() => holdsFocus(page, 'Filters')).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await expect(trigger).toBeFocused();

      // The close button, named Close, closes it too, and focus returns again.
      await trigger.click();
      await sheet.getByRole('button', { name: 'Close' }).click();
      await expect(sheet).toBeHidden();
      await expect(trigger).toBeFocused();
    },
  );

  test('opens at its edge in either direction, sliding from that edge', async ({ page }) => {
    await page.goto(sheets);
    const width = page.viewportSize()!.width;
    const open = async (trigger: string, name: string) => {
      await page.getByRole('button', { name: trigger }).click();
      const sheet = page.getByRole('dialog', { name });
      await expect(sheet).toBeVisible();
      await slidIn(sheet);
      return sheet;
    };
    const offset = (sheet: import('@playwright/test').Locator) =>
      sheet.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--env-sheet-offset-x').trim(),
      );

    const end = await open('Open filters', 'Filters');
    const endBox = (await end.boundingBox())!;
    expect(endBox.x + endBox.width).toBeCloseTo(width, 0);
    expect(endBox.width).toBeCloseTo(24 * 16, 0);
    expect(await offset(end)).toBe('2rem');
    await page.keyboard.press('Escape');
    await expect(end).toBeHidden();

    // Named by aria-label, without a title; its width a CSS length.
    const start = await open('Open navigation', 'Navigation');
    const startBox = (await start.boundingBox())!;
    expect(startBox.x).toBeCloseTo(0, 0);
    expect(startBox.width).toBeCloseTo(18 * 16, 0);
    expect(await offset(start)).toBe('-2rem');
    await expect(start.getByRole('heading')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(start).toBeHidden();

    // In right-to-left text the end is the left edge, and the sheet slides in from it.
    const rtl = await open('Open details rtl', 'Details');
    await expect(rtl.locator('xpath=ancestor-or-self::*[@dir][1]')).toHaveAttribute('dir', 'rtl');
    expect((await rtl.boundingBox())!.x).toBeCloseTo(0, 0);
    expect(await offset(rtl)).toBe('-2rem');
  });

  test(
    'a drag toward its edge moves the sheet with the pointer, in either direction',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(sheets);
      for (const [trigger, name, toward] of [
        ['Open filters', 'Filters', 1],
        ['Open details rtl', 'Details', -1],
      ] as const) {
        await page.getByRole('button', { name: trigger }).click();
        const sheet = page.getByRole('dialog', { name });
        await expect(sheet).toBeVisible();
        await slidIn(sheet);
        const rest = (await sheet.boundingBox())!;
        // Press on the heading's text, away from the controls, and drag 54 px toward the edge.
        const heading = (await sheet.getByRole('heading', { name }).boundingBox())!;
        const start = { x: heading.x + 4, y: heading.y + heading.height / 2 };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        for (let step = 1; step <= 6; step += 1)
          await page.mouse.move(start.x + toward * 9 * step, start.y);
        await expect(sheet).toHaveAttribute('data-swiping');
        // The sheet follows the pointer once, toward the edge: about 54 px, well under twice that.
        // WebKit can start the swipe a step or two late and settle as low as about 21 px, so the
        // band is wide; what matters is the direction and no doubled move.
        const moved = async () => Math.round(((await sheet.boundingBox())!.x - rest.x) * toward);
        await expect.poll(moved).toBeGreaterThan(54 * 0.25);
        expect(await moved()).toBeLessThan(54 * 1.3);
        await page.mouse.up();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      }
    },
  );

  test(
    'opened by touch, it focuses the sheet, not a field inside; by keyboard, the field',
    { tag: '@engines' },
    async ({ browser }) => {
      const context = await browser.newContext({ hasTouch: true });
      const page = await context.newPage();
      await page.goto(sheets);
      // Its first element that takes Tab is a field; a field focused by touch opens the keyboard.
      await page.getByRole('button', { name: 'Open search' }).tap();
      const sheet = page.getByRole('dialog', { name: 'Search' });
      await expect(sheet).toBeFocused();
      await expect(sheet.getByRole('textbox', { name: 'Query' })).not.toBeFocused();
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      const trigger = page.getByRole('button', { name: 'Open search' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(sheet.getByRole('textbox', { name: 'Query' })).toBeFocused();
      await context.close();
    },
  );

  test('a sheet the application opens reports why it closes and sends focus where it says', async ({
    page,
  }) => {
    await page.goto(sheets);
    await page.getByRole('button', { name: 'Open controlled' }).click();
    const sheet = page.getByRole('dialog', { name: 'Controlled' });
    await expect(sheet).toBeVisible();
    expect((await sheet.boundingBox())!.width).toBeCloseTo(44 * 16, 0);
    // closeButton={false} leaves out the close button; Escape still closes it.
    await expect(sheet.getByRole('button', { name: 'Close' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page.getByTestId('sheet-reason')).toHaveText('escape-key');
    await expect(page.getByTestId('sheet-main')).toBeFocused();
  });

  test('a bottom sheet sits at the bottom edge, as tall as its content', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await page.goto(sheets);
    await page.getByRole('button', { name: 'Open choices' }).click();
    const sheet = page.getByRole('dialog', { name: 'Choices' });
    await expect(sheet).toBeVisible();
    await slidIn(sheet);
    const box = (await sheet.boundingBox())!;
    // At most 40 rem wide, centered, flush with the bottom edge and shorter than the window.
    expect(box.width).toBeCloseTo(40 * 16, 0);
    expect(box.x + box.width / 2).toBeCloseTo(450, 0);
    expect(box.y + box.height).toBeCloseTo(700, 0);
    expect(box.height).toBeLessThan(350);
    const style = await sheet.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        topRadius: computed.borderStartStartRadius,
        bottomRadius: computed.borderEndStartRadius,
        offset: computed.getPropertyValue('--env-sheet-offset-y').trim(),
      };
    });
    expect(style.topRadius).not.toBe('0px');
    expect(style.bottomRadius).toBe('0px');
    expect(style.offset).toBe('2rem');
  });

  test('a md side sheet takes the whole width of a compact window', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto(sheets);
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await expect(sheet).toBeVisible();
    await slidIn(sheet);
    expect((await sheet.boundingBox())!.width).toBeCloseTo(400, 0);
  });
});

test.describe('Sheet resizable', () => {
  /** Opens a sheet from its trigger and waits for it to slide in. */
  const open = async (page: Page, trigger: string, name: string) => {
    await page.getByRole('button', { name: trigger, exact: true }).click();
    const sheet = page.getByRole('dialog', { name, exact: true });
    await expect(sheet).toBeVisible();
    await slidIn(sheet);
    return sheet;
  };

  test('a resizable sheet ignores a CSS length as its width, and warns of it while developing', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.goto(sheets);
    const sheet = await open(page, 'Open resizable css width', 'Resizable css width');
    await expect(sheet.getByRole('separator', { name: 'Resize' })).toHaveAttribute(
      'aria-valuetext',
      '24 rem',
    );
    expect((await sheet.boundingBox())!.width).toBeCloseTo(24 * 16, 0);
    expect(warnings.filter((text) => text.includes('resizable Sheet ignores'))).toEqual([
      expect.stringContaining('width="min(30rem, 90%)"'),
    ]);
  });

  test('a side sheet resizes by its inner edge, by keys and pointer, and a drag never closes it', async ({
    page,
  }) => {
    await page.goto(sheets);
    const sheet = await open(page, 'Open resizable', 'Resizable');
    const handle = sheet.getByRole('separator', { name: 'Resize' });
    await expect(handle).toHaveAttribute('aria-valuetext', '24 rem');
    const width = async () => (await sheet.boundingBox())!.width;
    expect(await width()).toBeCloseTo(24 * 16, 0);
    // The handle runs down the sheet's start edge, inside its edge, toward the page.
    const sheetBox = (await sheet.boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    expect(handleBox.x).toBeCloseTo(sheetBox.x + 1, 0);
    expect(handleBox.height).toBeGreaterThanOrEqual(sheetBox.height - 1);

    // At the end edge, it grows as its start edge moves toward the start.
    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuetext', '25 rem');
    expect(await width()).toBeCloseTo(25 * 16, 0);
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuetext', '16 rem');

    const box = (await handle.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 64, y, { steps: 4 });
    await expect(handle).toHaveAttribute('aria-valuetext', '20 rem');
    // Toward the sheet's own edge, the way a swipe closes it, the drag stops at the least width.
    await page.mouse.move(box.x + box.width / 2 + 400, y, { steps: 6 });
    await page.mouse.up();
    await expect(handle).toHaveAttribute('aria-valuetext', '16 rem');
    await expect(sheet).toBeVisible();
    await handle.dblclick();
    await expect(handle).toHaveAttribute('aria-valuetext', '24 rem');
  });

  test(
    'a controlled sheet reports its width, keeps to the window and its handle to its height',
    { tag: '@engines' },
    async ({ page }) => {
      await page.setViewportSize({ width: 640, height: 600 });
      await page.goto(sheets);
      const sheet = await open(page, 'Open kept width', 'Kept width');
      const handle = sheet.getByRole('separator');
      // A start sheet's handle is on its end edge; it starts at the width the application keeps.
      const sheetBox = (await sheet.boundingBox())!;
      expect(sheetBox.x).toBeCloseTo(0, 0);
      expect(sheetBox.width).toBeCloseTo(30 * 16, 0);
      const handleBox = (await handle.boundingBox())!;
      expect(handleBox.x + handleBox.width).toBeCloseTo(sheetBox.width - 1, 0);
      await handle.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByTestId('sheet-committed')).toHaveText('31');
      // End goes no further than the window: 640 pixels are 40 rem.
      await page.keyboard.press('End');
      await expect(page.getByTestId('sheet-committed')).toHaveText('40');
      expect((await sheet.boundingBox())!.width).toBeCloseTo(640, 0);
      await page.keyboard.press('Shift+ArrowLeft');
      await expect(page.getByTestId('sheet-width')).toHaveText('35');

      // Scrolled to its end, the handle still runs along the whole edge.
      await sheet.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
      const scrolled = (await sheet.boundingBox())!;
      const edge = (await handle.boundingBox())!;
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.getAttribute('role'),
        [edge.x + edge.width / 2, scrolled.y + scrolled.height - 4],
      );
      expect(hit).toBe('separator');
    },
  );

  test('in right-to-left text an end sheet grows to the right; a bottom sheet has no handle', async ({
    page,
  }) => {
    await page.goto(sheets);
    const sheet = await open(page, 'Open resizable rtl', 'Resizable rtl');
    const handle = sheet.getByRole('separator');
    const sheetBox = (await sheet.boundingBox())!;
    expect(sheetBox.x).toBeCloseTo(0, 0);
    const handleBox = (await handle.boundingBox())!;
    expect(handleBox.x + handleBox.width).toBeCloseTo(sheetBox.width - 1, 0);
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuetext', '25 rem');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();

    const bottom = await open(page, 'Open bottom resizable', 'Bottom resizable');
    await expect(bottom.getByRole('separator')).toHaveCount(0);
    await expect(bottom).not.toHaveAttribute('data-resizable');
  });
});
