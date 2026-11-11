import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

const tabsFixture = `${fixtureUrl}/?fixture=document-tabs`;

function lastLog(page: Page, theme = 'light') {
  return page
    .getByTestId(`document-tabs-log-${theme}`)
    .evaluate((output) => output.textContent!.split('\n').at(-1));
}

test.describe('DocumentTabs', () => {
  test('tabs select, pin, close and keep one tab stop', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(tabsFixture);
    const strip = page.getByRole('tablist', { name: 'Open documents light' });
    const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
    const retrospective = strip.getByRole('tab', { name: 'Retrospective.md', exact: true });
    await expect(roadmap).toHaveAttribute('aria-selected', 'true');
    await expect(roadmap).toHaveAttribute('tabindex', '0');
    await expect(roadmap).toHaveAttribute('data-tab-id', 'plans/roadmap.md');
    await expect(roadmap).toHaveAttribute('aria-controls', 'document-panel-light');
    await expect(decisions).toHaveAttribute('tabindex', '-1');
    await expect(retrospective).toHaveAttribute('data-preview', '');
    await expect(retrospective.locator('.env-document-tabs-tab-label')).toHaveCSS(
      'font-style',
      'italic',
    );

    await decisions.click();
    await expect.poll(() => lastLog(page)).toBe('select plans/decisions.md');
    await expect(decisions).toHaveAttribute('aria-selected', 'true');
    await retrospective.dblclick();
    await expect.poll(() => lastLog(page)).toBe('pin plans/retrospective.md');
    await expect(retrospective).not.toHaveAttribute('data-preview');

    // Arrow keys move and activate; Home and End reach the ends.
    await decisions.focus();
    await page.keyboard.press('ArrowRight');
    await expect(retrospective).toBeFocused();
    await expect(retrospective).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(roadmap).toBeFocused();
    await page.keyboard.press('End');
    const last = strip.getByRole('tab', { name: /number 7/ });
    await expect(last).toBeFocused();
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).toBeInViewport({ ratio: 0.9 });
    await page.keyboard.press('Home');
    await expect(roadmap).toBeFocused();
    // Keys with Alt, Ctrl or ⌘ are the application's: the strip leaves them unhandled.
    await page.evaluate(() => {
      window.addEventListener('keydown', (event) => {
        if (!event.key.startsWith('Arrow')) return;
        document.body.dataset.applicationKeys =
          (document.body.dataset.applicationKeys ?? '') + (event.defaultPrevented ? '-' : '+');
        event.preventDefault();
      });
    });
    await page.keyboard.press('Alt+ArrowRight');
    await page.keyboard.press('Control+ArrowRight');
    await expect(page.locator('body')).toHaveAttribute('data-application-keys', '++');
    await expect(roadmap).toBeFocused();
    await expect(roadmap).toHaveAttribute('aria-selected', 'true');
    // Delete closes the focused tab, and focus moves to the tab that becomes active.
    await page.keyboard.press('Delete');
    await expect.poll(() => lastLog(page)).toBe('close plans/roadmap.md');
    await expect(roadmap).toHaveCount(0);
    await expect(decisions).toHaveAttribute('aria-selected', 'true');
    await expect(decisions).toBeFocused();

    // So does the close button, a pointer's affordance beside the tab, outside it and hidden from
    // assistive technology: Delete, Backspace and the context menu close a tab from the keyboard.
    await expect(decisions).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace');
    await expect(decisions.locator('button')).toHaveCount(0);
    const closeDecisions = strip
      .locator('.env-document-tabs-item')
      .filter({ has: page.getByRole('tab', { name: 'Decisions.md', exact: true }) })
      .locator('.env-document-tabs-close');
    await expect(closeDecisions).toHaveAttribute('tabindex', '-1');
    await expect(closeDecisions).toHaveAttribute('aria-hidden', 'true');
    await expect(closeDecisions).toHaveAttribute('title', 'Close Decisions.md');
    await closeDecisions.click();
    await expect.poll(() => lastLog(page)).toBe('close plans/decisions.md');
    await expect(decisions).toHaveCount(0);
    await expect(retrospective).toHaveAttribute('aria-selected', 'true');
    await retrospective.focus();

    // A middle click closes a tab without activating it.
    const firstNote = strip.getByRole('tab', { name: /number 1\.md/ });
    await firstNote.click({ button: 'middle' });
    await expect.poll(() => lastLog(page)).toBe('close notes/note-1.md');
    await expect(firstNote).toHaveCount(0);
    await expect(retrospective).toHaveAttribute('aria-selected', 'true');

    // The application's own shortcut closes the focused tab, and focus still follows.
    await retrospective.focus();
    await page.keyboard.press('Alt+KeyW');
    await expect.poll(() => lastLog(page)).toBe('close plans/retrospective.md');
    const secondNote = strip.getByRole('tab', { name: /number 2\.md/ });
    await expect(secondNote).toHaveAttribute('aria-selected', 'true');
    await expect(secondNote).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('the context menu closes a tab or all tabs, with the pointer and the keyboard', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(tabsFixture);
    const strip = page.getByRole('tablist', { name: 'Open documents light' });
    const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
    const retrospective = strip.getByRole('tab', { name: 'Retrospective.md', exact: true });
    const menu = page.getByRole('menu', { name: 'Tab actions' });

    // A right click on a tab offers closing that tab and all tabs.
    await decisions.click({ button: 'right' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem')).toHaveText(['Close Decisions.md', 'Close all tabs']);
    await menu.getByRole('menuitem', { name: 'Close Decisions.md' }).click();
    await expect.poll(() => lastLog(page)).toBe('close plans/decisions.md');
    await expect(decisions).toHaveCount(0);
    await expect(roadmap).toHaveAttribute('aria-selected', 'true');
    await expect(roadmap).toBeFocused();

    // Shift+F10 opens it for the focused tab; when that tab closes, focus moves to the active tab.
    await roadmap.focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Close Roadmap.md' })).toHaveAttribute(
      'data-highlighted',
      '',
    );
    await page.keyboard.press('Enter');
    await expect.poll(() => lastLog(page)).toBe('close plans/roadmap.md');
    await expect(retrospective).toHaveAttribute('aria-selected', 'true');
    await expect(retrospective).toBeFocused();

    // So does the Menu key; Close all tabs leaves an empty strip.
    await page.keyboard.press('ContextMenu');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitem', { name: 'Close all tabs' }).click();
    await expect.poll(() => lastLog(page)).toBe('close all');
    await expect(strip.getByRole('tab')).toHaveCount(0);
    await expect(page.locator('body')).toBeFocused();

    // On the empty strip the menu has only Close all tabs, unavailable without tabs.
    await strip.click({ button: 'right' });
    await expect(menu.getByRole('menuitem')).toHaveText(['Close all tabs']);
    await expect(menu.getByRole('menuitem')).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    // Without onCloseAll, a tab still offers Close, from the pointer and the keyboard.
    const dark = page.getByRole('tablist', { name: 'Open documents dark' });
    const darkRoadmap = dark.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const darkDecisions = dark.getByRole('tab', { name: 'Decisions.md', exact: true });
    const darkMenu = page.getByRole('menu', { name: 'Tab actions' });
    await darkDecisions.click({ button: 'right' });
    await expect(darkMenu.getByRole('menuitem')).toHaveText(['Close Decisions.md']);
    await page.keyboard.press('Escape');
    await expect(darkMenu).toBeHidden();
    await darkRoadmap.focus();
    await page.keyboard.press('Shift+F10');
    await expect(darkMenu).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect.poll(() => lastLog(page, 'dark')).toBe('close plans/roadmap.md');
    await expect(darkRoadmap).toHaveCount(0);
    await expect(darkDecisions).toBeFocused();

    // Backspace closes the focused tab too, for keyboards without a forward Delete key. A held key
    // closes only that tab: its repeats close no more.
    const darkTabs = await dark.getByRole('tab').count();
    await page.keyboard.down('Backspace');
    await expect.poll(() => lastLog(page, 'dark')).toBe('close plans/decisions.md');
    await expect(darkDecisions).toHaveCount(0);
    for (const key of ['Backspace', 'Delete']) {
      await page.evaluate((key) => {
        const init = { key, repeat: true, bubbles: true, cancelable: true };
        document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', init));
      }, key);
    }
    await page.keyboard.up('Backspace');
    await expect(dark.getByRole('tab')).toHaveCount(darkTabs - 1);
    await expect.poll(() => lastLog(page, 'dark')).toBe('close plans/decisions.md');

    // The strip around the tabs offers no menu without onCloseAll, and leaves the browser its own:
    // neither a right click in the gap before the first tab nor a contextmenu event is cancelled.
    await dark.evaluate((element) => {
      element.scrollLeft = 0;
      element.addEventListener('contextmenu', (event) => {
        const strip = element as HTMLElement & { lastContextMenu?: MouseEvent };
        if (event.target === element) strip.lastContextMenu = event;
      });
    });
    const gap = { x: 2, y: 8 };
    expect(
      await dark.evaluate((element, point) => {
        const box = element.getBoundingClientRect();
        return document.elementFromPoint(box.left + point.x, box.top + point.y) === element;
      }, gap),
    ).toBe(true);
    await dark.click({ button: 'right', position: gap });
    expect(
      await dark.evaluate(
        (element) =>
          (element as HTMLElement & { lastContextMenu?: MouseEvent }).lastContextMenu
            ?.defaultPrevented,
      ),
    ).toBe(false);
    // dispatchEvent returns false for an event that was cancelled.
    expect(
      await dark.evaluate((element) =>
        element.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 1,
            clientY: 1,
          }),
        ),
      ),
    ).toBe(true);
    // React mounts a menu in the frame after the event; two frames on, none has.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test(
    'the strip scrolls sideways and keeps the active tab in view',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(tabsFixture);
      const strip = page.getByRole('tablist', { name: 'Open documents light' });
      const scrollLeft = () => strip.evaluate((element) => element.scrollLeft);
      expect(await strip.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
        true,
      );
      await page
        .getByTestId('document-tabs-light')
        .getByRole('button', {
          name: 'Activate the last note',
        })
        .click();
      await expect(strip.getByRole('tab', { name: /number 7/ })).toBeInViewport({ ratio: 0.9 });
      const scrolled = await scrollLeft();
      expect(scrolled).toBeGreaterThan(0);

      await strip.hover();
      await page.mouse.wheel(0, -200);
      await expect.poll(scrollLeft).toBeLessThan(scrolled);
      // Long labels truncate within the maximum width.
      const width = await strip
        .getByRole('tab', { name: /number 1\.md/ })
        .evaluate((tab) => tab.getBoundingClientRect().width);
      expect(width).toBeLessThanOrEqual(14 * 16 + 1);
    },
  );

  test('the close button shows on the active and hovered tabs in both themes', async ({ page }) => {
    await page.goto(tabsFixture);
    for (const theme of ['light', 'dark']) {
      const strip = page.getByRole('tablist', { name: `Open documents ${theme}` });
      const item = (name: string) =>
        strip
          .locator('.env-document-tabs-item')
          .filter({ has: page.getByRole('tab', { name, exact: true }) });
      const active = item('Roadmap.md');
      const other = item('Decisions.md');
      await expect(active.locator('.env-document-tabs-close')).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(other.locator('.env-document-tabs-close')).toBeHidden();
      await other.hover();
      await expect(other.locator('.env-document-tabs-close')).toBeVisible();
      const indicator = await active.evaluate(
        (tab) => getComputedStyle(tab, '::after').backgroundColor,
      );
      expect(indicator).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test(
    'in right-to-left text the arrow keys and the wheel run toward the end',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(`${fixtureUrl}/?fixture=document-tabs-rtl`);
      const strip = page.getByRole('tablist', { name: 'Right-to-left documents' });
      const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
      const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
      await roadmap.focus();
      // The next tab is to the left.
      await page.keyboard.press('ArrowLeft');
      await expect(decisions).toBeFocused();
      await expect(decisions).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowRight');
      await expect(roadmap).toBeFocused();
      // Turning the wheel down scrolls toward the end, the left, where scrollLeft is negative.
      const scrollLeft = () => strip.evaluate((element) => element.scrollLeft);
      // Back on the first tab, the strip scrolls home, clear of the fade at its edge, on the next
      // frame; a slower machine may read it before then.
      await expect.poll(scrollLeft).toBe(0);
      await strip.hover();
      await page.mouse.wheel(0, 200);
      await expect.poll(scrollLeft).toBeLessThan(0);
      const scrolled = await scrollLeft();
      await page.mouse.wheel(0, -100);
      await expect.poll(scrollLeft).toBeGreaterThan(scrolled);
    },
  );

  test.describe('on a coarse pointer', () => {
    test.use({ hasTouch: true });

    for (const scale of ['comfortable', 'compact'] as const)
      test(`tabs and their close buttons are the touch height in the ${scale} scale`, async ({
        page,
      }) => {
        await page.goto(`${tabsFixture}&scale=${scale}`);
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
        const strip = page.locator('.env-document-tabs-list').first();
        await expect(
          strip.locator('xpath=ancestor::*[contains(@class, "env-theme")][1]'),
        ).toHaveAttribute('data-env-scale', scale);
        const boxes = await strip.evaluate((element) => ({
          inside: element.clientHeight,
          tabs: [...element.querySelectorAll('.env-document-tabs-item')].map(
            (tab) => tab.getBoundingClientRect().height,
          ),
          closes: [...element.querySelectorAll('.env-document-tabs-close')].map((close) => {
            const box = close.getBoundingClientRect();
            return [box.width, box.height];
          }),
        }));
        // The tabs fill the strip, and every close button shows, as tall and wide as its tab.
        expect(boxes.inside).toBe(44);
        expect(boxes.tabs.length).toBeGreaterThan(0);
        expect(boxes.tabs.filter((height) => height !== 44)).toEqual([]);
        expect(boxes.closes.filter(([width, height]) => width !== 44 || height !== 44)).toEqual([]);
        // Every close button shows, the inactive tabs' too, not only the active tab's.
        const closes = strip.locator('.env-document-tabs-close');
        expect(await closes.count()).toBeGreaterThan(1);
        expect(
          await closes.evaluateAll(
            (buttons) =>
              buttons.filter((button) => getComputedStyle(button).visibility !== 'visible').length,
          ),
        ).toBe(0);
      });
  });

  test('a parent re-rendering with new items leaves focus where it is', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${fixtureUrl}/?fixture=document-tabs-rerender`);
    const strip = page.getByRole('tablist', { name: 'Re-rendered documents' });
    const two = strip.getByRole('tab', { name: 'two.md', exact: true });
    const three = strip.getByRole('tab', { name: 'three.md', exact: true });
    const renders = page.getByTestId('rerender-count');
    const rendersPast = async (more: number) => {
      const from = Number(await renders.textContent());
      await expect
        .poll(async () => Number(await renders.textContent()))
        .toBeGreaterThan(from + more);
    };
    await two.click();
    await expect(two).toBeFocused();

    // Opening a menu re-renders the parent as it opens and while it stays open: the menu keeps focus.
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    const menu = page.getByRole('menu', { name: 'File' });
    await expect(page.getByTestId('rerender-state')).toHaveText('open');
    await expect(menu).toBeVisible();
    await rendersPast(3);
    await expect(menu).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'First action' })).toBeFocused();
    await rendersPast(3);
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'First action' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    // Typing elsewhere re-renders the parent on each key: the input keeps focus.
    await two.focus();
    const draft = page.getByRole('textbox', { name: 'Draft' });
    await draft.click();
    await page.keyboard.type('abc');
    await rendersPast(3);
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('abc');

    // Closing the focused tab still moves focus to its right neighbour.
    await two.focus();
    await page.keyboard.press('Delete');
    await expect(two).toHaveCount(0);
    await expect(three).toHaveAttribute('aria-selected', 'true');
    await expect(three).toBeFocused();
    expect(errors).toEqual([]);
  });
});
