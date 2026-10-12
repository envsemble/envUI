import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

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
    await expect(retrospective).toHaveAttribute('data-preview', 'true');
    await expect(retrospective.locator('.env-document-tab-label')).toHaveCSS(
      'font-style',
      'italic',
    );

    await decisions.click();
    await expect.poll(() => lastLog(page)).toBe('select plans/decisions.md');
    await expect(decisions).toHaveAttribute('aria-selected', 'true');
    await retrospective.dblclick();
    await expect.poll(() => lastLog(page)).toBe('pin plans/retrospective.md');
    await expect(retrospective).toHaveAttribute('data-preview', 'false');

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
    // Delete closes the focused tab, and focus moves to the tab that becomes active.
    await page.keyboard.press('Delete');
    await expect.poll(() => lastLog(page)).toBe('close plans/roadmap.md');
    await expect(roadmap).toHaveCount(0);
    await expect(decisions).toHaveAttribute('aria-selected', 'true');
    await expect(decisions).toBeFocused();

    // So does the close button.
    const closeDecisions = decisions.getByRole('button', { name: 'Close Decisions.md' });
    await expect(closeDecisions).toHaveAttribute('tabindex', '-1');
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

  test('the strip scrolls sideways and keeps the active tab in view', async ({ page }) => {
    await page.goto(tabsFixture);
    const strip = page.getByRole('tablist', { name: 'Open documents light' });
    const scrollLeft = () => strip.evaluate((element) => element.scrollLeft);
    expect(await strip.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
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
  });

  test('the close button shows on the active and hovered tabs in both themes', async ({ page }) => {
    await page.goto(tabsFixture);
    for (const theme of ['light', 'dark']) {
      const strip = page.getByRole('tablist', { name: `Open documents ${theme}` });
      const active = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
      const other = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
      await expect(active.locator('.env-document-tab-close')).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(other.locator('.env-document-tab-close')).toBeHidden();
      await other.hover();
      await expect(other.locator('.env-document-tab-close')).toBeVisible();
      const indicator = await active.evaluate(
        (tab) => getComputedStyle(tab, '::after').backgroundColor,
      );
      expect(indicator).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});
