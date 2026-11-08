import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

/** tests/fixture/Primitives.tsx, which mounts its toolbars among envUI's primitives. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=primitives`);
  await expect(page.getByTestId('toolbar')).toBeVisible();
}

test.describe('Toolbar', () => {
  test('is one tab stop whose arrow keys move between enabled controls', async ({ page }) => {
    await open(page);
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    await toolbar.getByRole('button', { name: 'Bold' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Italic' })).toBeFocused();
    // The disabled Underline leaves the arrow keys' path.
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Undo' })).toBeFocused();
    // The application's own IconButton is no toolbar item: the arrows pass it.
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('link', { name: 'Help' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Bold' })).toBeFocused();
  });

  test('is one stop in the tab order, besides a button of its own', async ({ page }) => {
    await open(page);
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    await toolbar.getByRole('button', { name: 'Italic' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.getByRole('button', { name: 'Before toolbar' }).focus();
    // Tab reaches the control that holds the tab stop, then the application's own button, which
    // keeps a stop of its own, then leaves.
    const stops: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      await page.keyboard.press('Tab');
      stops.push(
        await page.evaluate(
          () =>
            document.activeElement?.getAttribute('aria-label') ??
            document.activeElement?.textContent ??
            '',
        ),
      );
    }
    expect(stops).toEqual(['Undo', 'Toolbar settings', 'After toolbar']);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(toolbar.getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Before toolbar' })).toBeFocused();
  });

  test('announces shortcuts in ARIA key names and shows no tooltip while disabled', async ({
    page,
  }) => {
    await open(page);
    await expect(page.getByRole('button', { name: 'Highlight' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Control+Shift+B',
    );
    // A sequence shows its keys, without the attribute.
    const undo = page.getByRole('button', { name: 'Redo' });
    await expect(undo).not.toHaveAttribute('aria-keyshortcuts');
    await undo.focus();
    const sequence = page.locator('.env-tooltip').filter({ hasText: 'Redo' });
    await expect(sequence.locator('.env-kbd')).toHaveText(['Ctrl', 'K', 'Ctrl', 'Z']);
    await expect(page.getByRole('button', { name: 'Highlight' })).toBeDisabled();
    // Modifier symbols written without +, as on a Mac, are keys of their own.
    await expect(page.getByRole('button', { name: 'Strong emphasis' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Meta+B',
    );
  });

  test('a disabled toolbar disables its links too', async ({ page }) => {
    await open(page);
    const link = page.getByRole('toolbar', { name: 'Disabled toolbar' }).getByLabel('Shortcuts');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('href');
    await expect(link).toHaveAttribute('tabindex', '-1');
  });

  test("runs its ref's cleanup rather than calling the ref with null", async ({ page }) => {
    await open(page);
    const log = page.getByTestId('ref-log');
    await expect(log).toContainText('attach');
    await page.getByRole('button', { name: 'Toggle ref toolbar' }).click();
    await expect(page.getByRole('toolbar', { name: 'Ref toolbar' })).toHaveCount(0);
    await expect(log).toHaveText(/,cleanup$/);
    await expect(log).not.toContainText('null');
  });

  for (const [name, disabler] of [
    ['Redo', 'the root'],
    ['Strike through', 'a group'],
  ] as const)
    test(`closes a button's tooltip as ${disabler} disables it`, async ({ page }) => {
      await open(page);
      const button = page.getByRole('button', { name, exact: true });
      await button.hover();
      const tooltip = page.locator('.env-tooltip').filter({ hasText: name });
      await expect(tooltip).toBeVisible();
      // The toolbar turns busy without the pointer moving.
      await page.getByRole('button', { name: 'Toggle busy' }).dispatchEvent('click');
      await expect(button).toBeDisabled();
      await expect(tooltip).toHaveCount(0);
    });

  test('opens its tooltips after tooltipDelay, at once with 0', async ({ page }) => {
    await open(page);
    // The default waits 400ms on hover, so a tooltip shown within 250ms came with no wait.
    for (const name of ['Instant button', 'Instant link']) {
      await page.getByRole('toolbar', { name: 'Instant names' }).getByLabel(name).hover();
      await expect(page.locator('.env-tooltip').filter({ hasText: name })).toBeVisible({
        timeout: 250,
      });
    }
  });

  test('names its buttons by label, shows a tooltip with the shortcut and reports pressed', async ({
    page,
  }) => {
    await open(page);
    const bold = page.getByRole('button', { name: 'Bold' });
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await expect(bold).toHaveAttribute('aria-keyshortcuts', 'Control+B');
    await expect(bold).not.toHaveAttribute('title');
    await bold.focus();
    const tooltip = page.locator('.env-tooltip').filter({ hasText: 'Bold' });
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('.env-kbd')).toHaveText(['Ctrl', 'B']);
    await page.keyboard.press('Enter');
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    // The selected fill eases in.
    await expect
      .poll(() => bold.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)');
  });
});
