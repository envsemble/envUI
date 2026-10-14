import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=copy-buttons`;

/**
 * Records what the page writes to the clipboard. available: the asynchronous Clipboard API works;
 * selection: copying a selection works, as the fallback; neither: nothing can be copied.
 */
async function recordClipboard(page: Page, mode: 'available' | 'selection' | 'neither') {
  await page.addInitScript((mode) => {
    const writes: string[] = [];
    (window as unknown as { clipboardWrites: string[] }).clipboardWrites = writes;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value:
        mode === 'available'
          ? {
              writeText: async (text: string) => void writes.push(text),
              write: async (items: ClipboardItem[]) => {
                for (const item of items)
                  writes.push(await (await item.getType('text/plain')).text());
              },
            }
          : undefined,
    });
    document.execCommand = (command: string) => {
      if (command !== 'copy' || mode !== 'selection') return false;
      const field = document.activeElement as HTMLTextAreaElement;
      writes.push(field.value.slice(field.selectionStart, field.selectionEnd));
      return true;
    };
  }, mode);
}

const writes = (page: Page) =>
  page.evaluate(() => (window as unknown as { clipboardWrites: string[] }).clipboardWrites);

/** Tooltips that show, leaving out one that is still fading out. */
const shownTooltip = '.env-tooltip:not([data-ending-style])';

/**
 * Moves the pointer below the fixture, away from tooltips above their controls: a pointer that
 * jumps toward a tooltip in one step could still be on its way onto it.
 */
async function movePointerAway(page: Page) {
  await page.mouse.move(4, 900, { steps: 4 });
}

/** The visually hidden status that announces a copy button's result, right after the button. */
const statusOf = (button: Locator) =>
  button.locator('xpath=following-sibling::*[@role="status"][1]');

test('an icon-only copy button copies its text, shows a check and says Copied', async ({
  page,
}) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy link light' });
  const tooltip = page.locator(shownTooltip);
  const status = statusOf(button);
  await button.hover();
  await expect(tooltip).toHaveText('Copy link light');
  const restingIcon = await button.locator('path').getAttribute('d');
  await button.click();
  expect(await writes(page)).toEqual(['https://example.com/r/quarterly-report']);
  await expect(scope.getByTestId('copied')).toHaveText('https://example.com/r/quarterly-report');
  await expect(button).toHaveAttribute('data-copied', '');
  expect(await button.locator('path').getAttribute('d')).not.toBe(restingIcon);
  await expect(tooltip).toHaveText('Copied');
  await expect(status).toHaveText('Copied');
  // The result stays while the pointer leaves, for about two seconds, and the name never changes.
  await movePointerAway(page);
  await page.waitForTimeout(500);
  await expect(tooltip).toHaveText('Copied');
  await expect(button).toHaveAccessibleName('Copy link light');
  await expect(tooltip).toHaveCount(0, { timeout: 3_000 });
  await expect(button).not.toHaveAttribute('data-copied');
  expect(await button.locator('path').getAttribute('d')).toBe(restingIcon);
  await expect(status).toHaveText('');
});

test('a labelled copy button copies the result of a function from the keyboard and keeps focus', async ({
  page,
}) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy ID light' });
  const tooltip = page.locator(shownTooltip);
  // A labelled button needs no tooltip at rest.
  await button.hover();
  await page.waitForTimeout(600);
  await expect(tooltip).toHaveCount(0);
  await movePointerAway(page);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(tooltip).toHaveText('Copied');
  expect(await writes(page)).toEqual(['RPT-2041']);
  await expect(button).toBeFocused();
  // Escape hides the result at once.
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(button).not.toHaveAttribute('data-copied');
  // Each press announces its result again, as new content in the status.
  const status = statusOf(button);
  await page.keyboard.press('Space');
  await expect(status).toHaveText('Copied');
  await status.locator('span').evaluate((element) => element.setAttribute('data-announced', ''));
  await page.keyboard.press('Enter');
  await expect(status.locator('span')).not.toHaveAttribute('data-announced');
  await expect(status).toHaveText('Copied');
  expect(await writes(page)).toEqual(['RPT-2041', 'RPT-2041', 'RPT-2041']);
});

test('a promised text keeps the button pending until it resolves', async ({ page }) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy later light' });
  await button.click();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button.locator('.env-spinner')).toBeVisible();
  await expect(scope.getByTestId('copied')).toHaveText('Later text');
  await expect(button).not.toHaveAttribute('aria-busy');
  await expect(button).toHaveAttribute('data-copied', '');
  expect(await writes(page)).toEqual(['Later text']);
});

test('copying falls back to a selection where the Clipboard API is unavailable', async ({
  page,
}) => {
  await recordClipboard(page, 'selection');
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy link light' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(shownTooltip)).toHaveText('Copied');
  expect(await writes(page)).toEqual(['https://example.com/r/quarterly-report']);
  // Focus returns to the button, and the hidden field is gone.
  await expect(button).toBeFocused();
  await expect(page.locator('.env-copy-button-field')).toHaveCount(0);

  // Inside a dialog, which keeps focus within itself, the fallback works too.
  await scope.getByRole('button', { name: 'Share light' }).click();
  const dialog = page.getByRole('dialog', { name: 'Share light' });
  const shared = dialog.getByRole('button', { name: 'Copy shared link light' });
  await shared.click();
  await expect(shared).toHaveAttribute('data-copied', '');
  expect((await writes(page)).at(-1)).toBe('https://example.com/r/shared');
  await expect(dialog).toBeVisible();
});

test('a copy button says when nothing could be copied, in its own words if given', async ({
  page,
}) => {
  await recordClipboard(page, 'neither');
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const tooltip = page.locator(shownTooltip);
  const button = scope.getByRole('button', { name: 'Copy link light' });
  await button.click();
  await expect(tooltip).toHaveText('Couldn’t copy');
  await expect(button).toHaveAttribute('data-failed', '');
  await expect(button).not.toHaveAttribute('data-copied');
  await expect(statusOf(button)).toHaveText('Couldn’t copy');
  await expect(scope.getByTestId('copied')).toHaveText('');
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);

  const custom = scope.getByRole('button', { name: 'Copy custom light' });
  await custom.click();
  await expect(tooltip).toHaveText('Nicht kopiert');
});

test('labels, onClick, application tooltips and themes', async ({ page }) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const tooltip = page.locator(shownTooltip);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`copy-buttons-${theme}`);
    const custom = scope.getByRole('button', { name: `Copy custom ${theme}` });
    await custom.click();
    await expect(tooltip).toHaveText('Kopiert');
    // The tooltip takes the theme of the button it belongs to.
    await expect(page.locator(`.env-tooltip-theme:has(${shownTooltip})`)).toHaveAttribute(
      'data-env-theme',
      theme,
    );
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
  }
  const scope = page.getByTestId('copy-buttons-light');
  // onClick can keep a press from copying.
  await scope.getByRole('button', { name: 'Copy skipped light' }).click();
  await expect(scope.getByTestId('presses')).toHaveText('1');
  await expect(scope.getByRole('button', { name: 'Copy skipped light' })).not.toHaveAttribute(
    'data-copied',
  );
  expect(await writes(page)).toEqual(['Custom', 'Custom']);
  await movePointerAway(page);
  // Inside an application's Tooltip, that one describes the button; the result still shows.
  const plan = scope.getByRole('button', { name: 'Copy plan light' });
  await plan.hover();
  await expect(tooltip).toHaveText('Copy the address of the plan');
  await plan.click();
  await expect(plan).toHaveAttribute('data-copied', '');
  await expect(statusOf(plan)).toHaveText('Copied');
  await page.waitForTimeout(500);
  await expect(page.locator('.env-tooltip', { hasText: 'Copied' })).toHaveCount(0);
  expect(await tooltip.count()).toBeLessThanOrEqual(1);
});

test('a copy button takes the compact size in compact toolbars and with size compact', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const height = async (name: string) =>
    (await scope.getByRole('button', { name, exact: true }).boundingBox())!.height;
  await expect(scope.getByRole('button', { name: 'Copy report ID light' })).toBeVisible();
  expect(await height('Copy report ID light')).toBeCloseTo(32, 0);
  expect(await height('Report settings')).toBeCloseTo(32, 0);
  expect(await height('Copy standard')).toBeCloseTo(40, 0);
  expect(await height('Copy compact')).toBeCloseTo(32, 0);
  expect(await height('Copy compact label')).toBeCloseTo(32, 0);
  const compact = (await scope
    .getByRole('button', { name: 'Copy compact', exact: true })
    .boundingBox())!;
  expect(compact.width).toBeCloseTo(32, 0);
  // A narrow row squeezes its label, not the icon-only button.
  const narrow = (await scope
    .getByRole('button', { name: 'Copy narrow', exact: true })
    .boundingBox())!;
  expect(narrow.width).toBeCloseTo(40, 0);
  expect(narrow.height).toBeCloseTo(40, 0);
});

test('the Clipboard API receives the text in Chromium', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium grants clipboard access to tests.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  await scope.getByRole('button', { name: 'Copy link light' }).click();
  await expect(scope.getByTestId('copied')).toHaveText('https://example.com/r/quarterly-report');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://example.com/r/quarterly-report',
  );
  await scope.getByRole('button', { name: 'Copy later light' }).click();
  await expect(scope.getByTestId('copied')).toHaveText('Later text');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Later text');
});
