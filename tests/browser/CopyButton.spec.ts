import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=copy-buttons`;

/**
 * Records what the page writes to the clipboard. available: the asynchronous Clipboard API works;
 * selection: copying a selection works, as the fallback; neither: nothing can be copied; refused:
 * the Clipboard API refuses every write at once. It also records unhandled rejections.
 */
async function recordClipboard(
  page: Page,
  mode: 'available' | 'selection' | 'neither' | 'refused',
) {
  await page.addInitScript((mode) => {
    const writes: string[] = [];
    (window as unknown as { clipboardWrites: string[] }).clipboardWrites = writes;
    const unhandled: string[] = [];
    (window as unknown as { unhandledRejections: string[] }).unhandledRejections = unhandled;
    addEventListener('unhandledrejection', (event) => unhandled.push(String(event.reason)));
    const refuse = () => Promise.reject(new DOMException('Write refused', 'NotAllowedError'));
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
          : mode === 'refused'
            ? { writeText: refuse, write: refuse }
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
  const shown = Date.now();
  await expect(status).toHaveText('Copied');
  // The result stays for about two seconds, also once the pointer leaves, and the name never
  // changes. However slow the machine, the result shows at least as long as measured here.
  await movePointerAway(page);
  await expect(tooltip).toHaveText('Copied');
  await expect(button).toHaveAccessibleName('Copy link light');
  await expect(tooltip).toHaveCount(0, { timeout: 4_000 });
  expect(Date.now() - shown).toBeGreaterThan(1_500);
  await expect(button).not.toHaveAttribute('data-copied');
  expect(await button.locator('path').getAttribute('d')).toBe(restingIcon);
  await expect(status).toHaveText('');
});

test('a labelled copy button copies the result of a function from the keyboard and keeps focus', async ({
  page,
}) => {
  await recordClipboard(page, 'available');
  await page.clock.install();
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy ID light' });
  const tooltip = page.locator(shownTooltip);
  // A labelled button needs no tooltip at rest.
  await button.hover();
  await page.clock.runFor(600);
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

test(
  'copying falls back to a selection where the Clipboard API is unavailable',
  { tag: '@engines' },
  async ({ page }) => {
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
  },
);

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

test("write copies through the application's own clipboard, and its refusal says so", async ({
  page,
}) => {
  // The browser's clipboard works, so a write that reached it would show up here.
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const scope = page.getByTestId('writers-light');
  const tooltip = page.locator(shownTooltip);
  const bridged = scope.getByRole('button', { name: 'Copy through the bridge light' });
  await bridged.click();
  await expect(scope.getByTestId('bridged-light')).toHaveText('Bridged');
  await expect(bridged).toHaveAttribute('data-copied', '');
  await expect(statusOf(bridged)).toHaveText('Copied');
  await expect(page.getByTestId('copy-buttons-light').getByTestId('copied')).toHaveText('Bridged');
  expect(await writes(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);

  const refused = scope.getByRole('button', { name: 'Copy refused by the bridge light' });
  await refused.click();
  await expect(refused).toHaveAttribute('data-failed', '');
  await expect(statusOf(refused)).toHaveText('Couldn’t copy');
  expect(await writes(page)).toEqual([]);
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
    await expect(page.locator(`.env-popup-theme:has(${shownTooltip})`)).toHaveAttribute(
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
  await expect(page.locator('.env-tooltip', { hasText: 'Copied' })).toHaveCount(0);
  expect(await tooltip.count()).toBeLessThanOrEqual(1);
});

test('a copy button without words or a name of its own is named Copy', async ({ page }) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const buttons = page.getByTestId('unnamed-light').getByRole('button');
  await expect(buttons).toHaveCount(4);
  // An empty label, a label of no elements, and a blank aria-label leave the default name.
  await expect(buttons.nth(0)).toHaveAccessibleName('Copy');
  await expect(buttons.nth(1)).toHaveAccessibleName('Copy');
  await expect(buttons.nth(2)).toHaveAccessibleName('Copy');
  await expect(buttons.nth(3)).toHaveAccessibleName('Kopieren');
  // An icon-only button shows it in its tooltip.
  await buttons.nth(2).hover();
  await expect(page.locator(shownTooltip)).toHaveText('Copy');
  await movePointerAway(page);
  await expect(page.locator(shownTooltip)).toHaveCount(0);
  // A label without words leaves the button icon-only, round with its name in the tooltip.
  const empty = buttons.nth(0);
  const emptyBox = (await empty.boundingBox())!;
  expect(Math.abs(emptyBox.width - emptyBox.height)).toBeLessThan(1);
  await empty.hover();
  await expect(page.locator(shownTooltip)).toHaveText('Copy');
  await empty.click();
  await expect.poll(() => writes(page)).toEqual(['Empty label']);
});

test('a copy button takes the small size in small toolbars and with size sm', async ({ page }) => {
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

test('a promised text that never arrives fails quietly after the clipboard refused it', async ({
  page,
}) => {
  await recordClipboard(page, 'refused');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(fixture);
  const scope = page.getByTestId('copy-buttons-light');
  const button = scope.getByRole('button', { name: 'Copy gone light' });
  await button.click();
  await expect(page.locator(shownTooltip)).toHaveText('Couldn’t copy');
  await expect(button).toHaveAttribute('data-failed', '');
  await expect(statusOf(button)).toHaveText('Couldn’t copy');
  // The text's rejection is reported, if at all, before the next frame.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  expect(
    await page.evaluate(
      () => (window as unknown as { unhandledRejections: string[] }).unhandledRejections,
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
