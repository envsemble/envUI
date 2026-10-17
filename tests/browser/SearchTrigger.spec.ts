import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const searchTriggers = `${fixtureUrl}/?fixture=search-triggers`;

/** Makes the page report an Apple platform, where `mod` is ⌘, before any script runs. */
async function onApple(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
    Object.defineProperty(navigator, 'userAgentData', { get: () => ({ platform: 'macOS' }) });
  });
}

/** Makes the page report another platform, where `mod` is Control. */
async function onOther(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'userAgentData', { get: () => ({ platform: 'Windows' }) });
  });
}

test.describe('SearchTrigger', () => {
  test('shows and handles Ctrl+K on other platforms', async ({ page }) => {
    await onOther(page);
    await page.goto(searchTriggers);
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    await expect(trigger).toHaveAttribute('aria-keyshortcuts', 'Control+K');
    // The keys show at the end; they're hidden from assistive technology, which hears the attribute.
    const keys = trigger.locator('.env-search-trigger-shortcut');
    await expect(keys).toHaveText('Ctrl+K');
    await expect(keys).toHaveAttribute('aria-hidden', 'true');
    // Keys sit at the inline end of the full-width trigger.
    const box = (await trigger.boundingBox())!;
    const keyBox = (await keys.boundingBox())!;
    expect(box.x + box.width - (keyBox.x + keyBox.width)).toBeLessThan(24);

    const log = page.getByTestId('search-log');
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('labelled');
    // Meta+K is not this platform's shortcut.
    await page.keyboard.press('Meta+K');
    await page.keyboard.press('Control+Shift+F');
    await expect(log).toHaveText('labelled,icon');
  });

  test('shows and handles ⌘K on Apple platforms', async ({ page }) => {
    await onApple(page);
    await page.goto(searchTriggers);
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    await expect(trigger).toHaveAttribute('aria-keyshortcuts', 'Meta+K');
    await expect(trigger.locator('.env-search-trigger-shortcut')).toHaveText('⌘+K');
    const icon = page.getByRole('button', { name: 'Find in page' });
    await expect(icon).toHaveAttribute('aria-keyshortcuts', 'Shift+Meta+F');

    const log = page.getByTestId('search-log');
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('');
    await page.keyboard.press('Meta+K');
    await expect(log).toHaveText('labelled');
  });

  test('gives a shortcut to the newest visible trigger, and leaves handled keys alone', async ({
    page,
  }) => {
    await onOther(page);
    await page.goto(searchTriggers);
    const log = page.getByTestId('search-log');
    // A trigger that doesn't listen, or has no shortcut, shows nothing and takes no key.
    await expect(page.getByRole('button', { name: 'Quiet search' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Control+K',
    );
    await expect(
      page.getByRole('button', { name: 'Search without a shortcut' }),
    ).not.toHaveAttribute('aria-keyshortcuts');
    // The hidden Jump trigger was mounted last but can't be pressed, so the visible one takes Ctrl+J.
    await page.keyboard.press('Control+J');
    await expect(log).toHaveText('jump');
    // A second Mod+K trigger, mounted later, takes the key while it is there.
    await page.getByRole('button', { name: 'Toggle second search' }).click();
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('jump,second');
    await page.getByRole('button', { name: 'Toggle second search' }).click();
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('jump,second,labelled');
    // In a text field the shortcut still opens search; an editor that handles it keeps it.
    await page.getByRole('textbox', { name: 'Note' }).focus();
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('jump,second,labelled,labelled');
    await page.getByRole('textbox', { name: 'Editor' }).focus();
    await page.keyboard.press('Control+K');
    await expect(log).toHaveText('jump,second,labelled,labelled,editor');
  });

  test('shows only its icon in a rail, with its name and keys in a tooltip at the inline end', async ({
    page,
  }) => {
    await onOther(page);
    await page.goto(searchTriggers);
    const rail = page.getByTestId('rail').getByRole('button', { name: 'Rail search' });
    await expect(rail).toHaveAttribute('data-variant', 'ghost');
    await expect(rail).toHaveText('');
    const box = (await rail.boundingBox())!;
    expect(box.width).toBeCloseTo(box.height, 0);
    await rail.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText(/Rail search\s*Ctrl\+K/);
    // In left-to-right text the inline end is the right.
    expect((await tooltip.boundingBox())!.x).toBeGreaterThan(box.x + box.width - 1);
    await rail.press('Enter');
    await expect(page.getByTestId('search-log')).toHaveText('rail');
  });
});
