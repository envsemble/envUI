import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

// The primitives batch A of 1.0 adds: Toolbar, Field and CloseButton, which are public, and the
// internals that envUI's own components build on: ResizeHandle, useRovingFocus, PopupSurface,
// ListRow and useCopy. tests/fixture/Primitives.tsx mounts each.

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

  test("gives the application's buttons the ghost variant", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('app-button')).toHaveAttribute('data-variant', 'ghost');
    await expect(page.getByRole('button', { name: 'Undo' })).toHaveAttribute(
      'data-variant',
      'ghost',
    );
    await expect(page.getByRole('button', { name: 'Toggle invalid' })).toHaveAttribute(
      'data-variant',
      'secondary',
    );
  });
});

test.describe('Button emphasis', () => {
  test("takes its container's variant where it has the button's tone", async ({ page }) => {
    await open(page);
    const emphasis = (testId: string) =>
      page
        .getByTestId(testId)
        .evaluate((element) => [element.dataset.variant, element.dataset.tone]);
    // Ghost has danger but no accent: an accent button stays the primary accent one.
    expect(await emphasis('toolbar-accent')).toEqual(['primary', 'accent']);
    expect(await emphasis('toolbar-danger')).toEqual(['ghost', 'danger']);
    // ConfirmButton and CopyButton follow the toolbar, and else rest outline and secondary.
    expect(await emphasis('toolbar-confirm')).toEqual(['ghost', 'neutral']);
    expect(await emphasis('toolbar-copy')).toEqual(['ghost', 'neutral']);
    expect(await emphasis('confirm-resting')).toEqual(['outline', 'neutral']);
    expect(await emphasis('copy-resting')).toEqual(['secondary', 'neutral']);
  });

  test("leaves a toolbar's and a field's ghost default outside their popovers", async ({
    page,
  }) => {
    await open(page);
    const trigger = page.getByTestId('toolbar-popover-trigger');
    await expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await trigger.click();
    await expect(page.getByTestId('toolbar-popover-button')).toHaveAttribute(
      'data-variant',
      'primary',
    );
    await page.keyboard.press('Escape');
    const fieldTrigger = page.getByRole('button', { name: 'Link options' });
    await expect(fieldTrigger).toHaveAttribute('data-variant', 'ghost');
    await fieldTrigger.click();
    await expect(page.getByTestId('field-popover-button')).toHaveAttribute(
      'data-variant',
      'primary',
    );
  });

  test('renders a pair no variant is designed in as neutral, and reports it', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await open(page);
    expect(errors).toEqual([]);
    await page.getByRole('button', { name: 'Show undesigned' }).click();
    await expect(page.getByTestId('undesigned')).toHaveAttribute('data-variant', 'secondary');
    await expect(page.getByTestId('undesigned')).toHaveAttribute('data-tone', 'neutral');
    expect(
      errors.filter((text) => text.includes('a secondary button has no danger tone')),
    ).toHaveLength(1);
  });
});

test.describe('Field', () => {
  test('labels and describes its control, and shows the error while invalid', async ({ page }) => {
    await open(page);
    const field = page.getByTestId('field');
    const control = field.getByRole('textbox', { name: 'Project name' });
    await expect(control).toBeVisible();
    await expect(control).toHaveAccessibleDescription('Up to 40 characters.');
    await expect(field.locator('.env-field-error')).toHaveCount(0);
    await field.getByRole('button', { name: 'Toggle invalid' }).click();
    await expect(control).toHaveAttribute('aria-invalid', 'true');
    const error = field.locator('.env-field-error');
    await expect(error).toHaveText('Enter a project name.');
    await expect(error.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(control).toHaveAccessibleDescription(/Enter a project name\./);
    await field.getByText('Project name', { exact: true }).click();
    await expect(control).toBeFocused();
    await expect(field.getByRole('textbox', { name: 'Disabled field' })).toBeDisabled();
  });

  test('draws its control at the control height with the pill outline', async ({ page }) => {
    await open(page);
    const control = page.getByRole('textbox', { name: 'Project name' });
    const style = await control.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        radius: parseFloat(computed.borderTopLeftRadius),
        border: computed.borderTopWidth,
      };
    });
    expect(style.height).toBeGreaterThanOrEqual(40);
    expect(style.radius).toBeGreaterThanOrEqual(style.height / 2 - 1);
    expect(style.border).toBe('1px');
  });
});

test.describe('CloseButton', () => {
  test('is named Close, by the provider, or by its own label', async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('close-default')).toHaveAccessibleName('Close');
    await expect(page.getByTestId('close-provider')).toHaveAccessibleName('Schließen');
    await expect(page.getByTestId('close-own')).toHaveAccessibleName('Remove Alex Morgan');
    await expect(page.getByTestId('close-default')).toHaveAttribute('data-variant', 'ghost');
    await expect(page.getByTestId('close-small')).toHaveAttribute('data-variant', 'secondary');
  });

  test.describe('on a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true });
    test('reaches the touch size with its hit area', async ({ page, browserName }) => {
      test.skip(browserName === 'firefox', 'Firefox does not emulate a coarse pointer.');
      await open(page);
      const area = await page.getByTestId('close-small').evaluate((element) => {
        const before = getComputedStyle(element, '::before');
        const box = element.getBoundingClientRect();
        return {
          height: box.height + -2 * parseFloat(before.top),
          width: box.width + -2 * parseFloat(before.left),
        };
      });
      expect(area.height).toBeGreaterThanOrEqual(44);
      expect(area.width).toBeGreaterThanOrEqual(44);
    });
  });
});

test.describe('ResizeHandle', () => {
  test('moves with the arrow keys, Home and End, in the reading direction', async ({ page }) => {
    await open(page);
    const ltr = page.getByTestId('resize-ltr').getByRole('separator', { name: 'Resize pane' });
    await expect(ltr).toHaveAttribute('aria-orientation', 'vertical');
    await expect(ltr).toHaveAttribute('aria-valuenow', '200');
    await ltr.focus();
    await page.keyboard.press('ArrowRight');
    await expect(ltr).toHaveAttribute('aria-valuenow', '210');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(ltr).toHaveAttribute('aria-valuenow', '110');
    await page.keyboard.press('End');
    await expect(ltr).toHaveAttribute('aria-valuenow', '400');
    await page.keyboard.press('Home');
    await expect(ltr).toHaveAttribute('aria-valuenow', '100');
    await expect(page.getByTestId('committed-ltr')).toHaveText('100');
    // In RTL the pane grows toward the left.
    const rtl = page.getByTestId('resize-rtl').getByRole('separator');
    await rtl.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(rtl).toHaveAttribute('aria-valuenow', '210');
  });

  test('follows the pointer and commits as the drag ends', async ({ page }) => {
    await open(page);
    const handle = page.getByTestId('resize-ltr').getByRole('separator');
    // The mouse moves in the viewport, so the handle must be in it.
    await handle.scrollIntoViewIfNeeded();
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
    await expect(handle).toHaveAttribute('data-dragging', '');
    await expect(handle).toHaveAttribute('aria-valuenow', '250');
    await expect(page.getByTestId('committed-ltr')).toHaveText('200');
    await page.mouse.up();
    await expect(page.getByTestId('committed-ltr')).toHaveText('250');
    await expect(handle).not.toHaveAttribute('data-dragging');
  });
});

test.describe('useRovingFocus', () => {
  test('moves through a grid by rows and columns, skipping disabled cells', async ({ page }) => {
    await open(page);
    const grid = page.getByRole('grid', { name: 'Days ltr' });
    const cell = (name: string) => grid.getByRole('gridcell', { name, exact: true });
    await expect(cell('1')).toHaveAttribute('tabindex', '0');
    await cell('1').focus();
    await page.keyboard.press('ArrowDown');
    await expect(cell('8')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(cell('4')).toBeFocused();
    // Day 5 is disabled: the move skips to day 6.
    await page.keyboard.press('ArrowRight');
    await expect(cell('6')).toBeFocused();
    await page.keyboard.press('End');
    await expect(cell('7')).toBeFocused();
    await page.keyboard.press('Control+End');
    await expect(cell('14')).toBeFocused();
    await expect(cell('14')).toHaveAttribute('tabindex', '0');
    await expect(cell('1')).toHaveAttribute('tabindex', '-1');
  });

  test('follows the text direction for Left and Right', async ({ page }) => {
    await open(page);
    const grid = page.getByRole('grid', { name: 'Days rtl' });
    await grid.getByRole('gridcell', { name: '1', exact: true }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(grid.getByRole('gridcell', { name: '2', exact: true })).toBeFocused();
  });

  test('moves to an item as its name is typed', async ({ page }) => {
    await open(page);
    const list = page.getByTestId('roving-list');
    await list.getByRole('option', { name: 'Alex Morgan' }).focus();
    await page.keyboard.type('sa');
    await expect(list.getByRole('option', { name: 'Sam Lee' })).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(list.getByRole('option', { name: 'Samir Haddad' })).toBeFocused();
  });
});

test.describe('PopupSurface', () => {
  test('carries the theme into the portal and the direction at its trigger', async ({ page }) => {
    await open(page);
    for (const dir of ['ltr', 'rtl'] as const) {
      await page.getByRole('button', { name: `Open ${dir}` }).click();
      const popup = page.getByTestId(`popup-${dir}`);
      await expect(popup).toBeVisible();
      await expect(popup).toHaveClass(/env-popup/);
      await expect(popup).toHaveAttribute('data-elevation', '2');
      await expect(popup).toHaveAttribute('data-width', 'md');
      const theme = popup.locator('xpath=ancestor::*[contains(@class, "env-popup-theme")]');
      await expect(theme).toHaveAttribute('data-env-theme', 'light');
      expect(await popup.evaluate((element) => getComputedStyle(element).direction)).toBe(dir);
      await page.keyboard.press('Escape');
      await expect(popup).toBeHidden();
    }
  });

  test('takes the direction at its trigger while focus is elsewhere', async ({ page }) => {
    await open(page);
    // Focus stays in a left-to-right region while code opens the right-to-left popup.
    await page.getByRole('button', { name: 'Open ltr' }).focus();
    await page.getByRole('button', { name: 'Open rtl' }).dispatchEvent('click');
    const popup = page.getByTestId('popup-rtl');
    await expect(popup).toBeVisible();
    expect(await popup.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');
  });
});

test('ListRow lays out a menu item with its icon, description and shortcut', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Open rows' }).click();
  const menu = page.getByTestId('row-menu');
  const item = menu.getByRole('menuitem', { name: /Settings/ });
  await expect(item).toHaveClass(/env-list-row/);
  await expect(item.locator('.env-list-row-description')).toHaveText('Account and workspace');
  await expect(item.locator('.env-list-row-shortcut')).toHaveText('Ctrl+,');
  await expect(menu.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
    'data-disabled',
    '',
  );
});

test('useCopy writes through a custom writer and reports the result', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Copy name' }).click();
  await expect(page.getByTestId('copy-written')).toHaveText('Northwind');
  await expect(page.getByTestId('copy-status')).toHaveText('copied');
  await expect(page.getByTestId('copy-status')).toHaveText('idle', { timeout: 5000 });
});

test('EnvUIProvider sets the locale components read', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('locale').first()).toHaveText('runtime');
  await expect(page.getByTestId('provided-locale')).toHaveText('de-CH');
});
