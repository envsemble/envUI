import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const drawers = `${fixtureUrl}/?fixture=drawers`;

/** Whether focus is inside the element. */
const holdsFocus = (page: Page, name: string) =>
  page
    .getByRole('dialog', { name })
    .evaluate((element) => element.contains(document.activeElement));

test.describe('Drawer', () => {
  test('traps focus while open and returns it to the trigger on close', async ({
    page,
    browserName,
  }) => {
    await page.goto(drawers);
    const trigger = page.getByRole('button', { name: 'Open filters' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Filters' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAccessibleDescription('Narrow the list.');
    // Focus starts on the first element that takes Tab, the close button.
    await expect(drawer.getByRole('button', { name: 'Close' })).toBeFocused();
    // Tab and Shift+Tab cycle through the close button, the field and the action, never leaving.
    // WebKit's Tab reaches only fields, as Safari's does by default; Alt+Tab reaches every control.
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    for (const key of [tab, tab, tab, tab, `Shift+${tab}`, `Shift+${tab}`, `Shift+${tab}`]) {
      await page.keyboard.press(key);
      // Focus passes through the trap's guards on its way round, so it settles first.
      await expect.poll(() => holdsFocus(page, 'Filters')).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();

    // The close button, named Close, closes it too, and focus returns again.
    await trigger.click();
    await drawer.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('opens at its edge in either direction, sliding from that edge', async ({ page }) => {
    await page.goto(drawers);
    const width = page.viewportSize()!.width;
    const open = async (trigger: string, name: string) => {
      await page.getByRole('button', { name: trigger }).click();
      const drawer = page.getByRole('dialog', { name });
      await expect(drawer).toBeVisible();
      await drawer.evaluate((element) =>
        Promise.all(element.getAnimations().map((animation) => animation.finished)),
      );
      return drawer;
    };
    const offset = (drawer: import('@playwright/test').Locator) =>
      drawer.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--env-drawer-offset').trim(),
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

    // In right-to-left text the end is the left edge, and the drawer slides in from it.
    const rtl = await open('Open details rtl', 'Details');
    await expect(rtl.locator('xpath=ancestor-or-self::*[@dir][1]')).toHaveAttribute('dir', 'rtl');
    expect((await rtl.boundingBox())!.x).toBeCloseTo(0, 0);
    expect(await offset(rtl)).toBe('-2rem');
  });

  test('a drag toward its edge moves the drawer with the pointer, in either direction', async ({
    page,
  }) => {
    await page.goto(drawers);
    for (const [trigger, name, toward] of [
      ['Open filters', 'Filters', 1],
      ['Open details rtl', 'Details', -1],
    ] as const) {
      await page.getByRole('button', { name: trigger }).click();
      const drawer = page.getByRole('dialog', { name });
      await expect(drawer).toBeVisible();
      await drawer.evaluate((element) =>
        Promise.all(element.getAnimations().map((animation) => animation.finished)),
      );
      const rest = (await drawer.boundingBox())!;
      // Press on the heading's text, away from the controls, and drag 54 px toward the edge.
      const heading = (await drawer.getByRole('heading', { name }).boundingBox())!;
      const start = { x: heading.x + 4, y: heading.y + heading.height / 2 };
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      for (let step = 1; step <= 6; step += 1)
        await page.mouse.move(start.x + toward * 9 * step, start.y);
      await expect(drawer).toHaveAttribute('data-swiping');
      // The drawer follows the pointer once, toward the edge: about 54 px, well under twice that.
      // Under load a frame can lag the pointer, so the band is wide.
      const moved = async () => Math.round(((await drawer.boundingBox())!.x - rest.x) * toward);
      await expect.poll(moved).toBeGreaterThan(54 * 0.4);
      expect(await moved()).toBeLessThan(54 * 1.3);
      await page.mouse.up();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
  });

  test('opened by touch, it focuses the drawer, not a field inside; by keyboard, the field', async ({
    browser,
  }) => {
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    await page.goto(drawers);
    // Its first element that takes Tab is a field; a field focused by touch opens the keyboard.
    await page.getByRole('button', { name: 'Open search' }).tap();
    const drawer = page.getByRole('dialog', { name: 'Search' });
    await expect(drawer).toBeFocused();
    await expect(drawer.getByRole('textbox', { name: 'Query' })).not.toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    const trigger = page.getByRole('button', { name: 'Open search' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(drawer.getByRole('textbox', { name: 'Query' })).toBeFocused();
    await context.close();
  });

  test('a drawer the application opens reports why it closes and sends focus where it says', async ({
    page,
  }) => {
    await page.goto(drawers);
    await page.getByRole('button', { name: 'Open controlled' }).click();
    const drawer = page.getByRole('dialog', { name: 'Controlled' });
    await expect(drawer).toBeVisible();
    expect((await drawer.boundingBox())!.width).toBeCloseTo(44 * 16, 0);
    // closeButton={false} leaves out the close button; Escape still closes it.
    await expect(drawer.getByRole('button', { name: 'Close' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(page.getByTestId('drawer-reason')).toHaveText('escape-key');
    await expect(page.getByTestId('drawer-main')).toBeFocused();
  });
});
