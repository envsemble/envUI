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
