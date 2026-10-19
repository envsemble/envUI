import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const paletteFixture = `${fixtureUrl}/?fixture=palette`;

function highlighted(page: Page) {
  return page
    .getByRole('combobox', { name: 'Go to document' })
    .evaluate(
      (input) =>
        document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.dataset
          .itemId ?? null,
    );
}

/** Whether the highlighted option shows whole inside the list's scrolled area. */
async function highlightInList(page: Page) {
  return page.getByRole('combobox', { name: 'Go to document' }).evaluate((input) => {
    const option = document.getElementById(input.getAttribute('aria-activedescendant') ?? '');
    const list = document.getElementById(input.getAttribute('aria-controls') ?? '');
    if (!option || !list) return false;
    const [inner, outer] = [option.getBoundingClientRect(), list.getBoundingClientRect()];
    return inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
  });
}

test.describe('CommandPalette', () => {
  test('typing filters, arrows move the highlight and Enter selects', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(paletteFixture);
    const trigger = page.getByRole('button', { name: 'Quick open light' });
    // Opened from the keyboard, as with a shortcut; some engines do not focus clicked buttons.
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Go to document' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      'light',
    );
    const input = dialog.getByRole('combobox', { name: 'Go to document' });
    await expect(input).toBeFocused();
    // Key hints show their keys as Kbd.
    await expect(dialog.locator('.env-command-palette-hint kbd.env-kbd')).toHaveText([
      'Enter',
      'Ctrl',
      'Enter',
    ]);
    const list = dialog.getByRole('listbox', { name: 'Go to document' });
    await expect(input).toHaveAttribute('aria-controls', (await list.getAttribute('id'))!);
    await expect(dialog.getByRole('group', { name: 'Recently opened' })).toBeVisible();
    await expect(dialog.getByRole('group', { name: 'Documents' })).toBeVisible();
    await expect.poll(() => highlighted(page)).toBe('recent/Roadmap.md');

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe('recent/Decisions.md');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 60.md');
    // The highlighted option scrolls into view within the list.
    await expect(list.locator('[data-item-id="documents/Document 60.md"]')).toBeInViewport();
    // Page Up and Page Down move a list's height and stop at the ends.
    await page.keyboard.press('PageUp');
    await expect.poll(() => highlighted(page)).not.toBe('documents/Document 60.md');
    await expect.poll(() => highlightInList(page)).toBe(true);
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageDown');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 60.md');
    await expect.poll(() => highlightInList(page)).toBe(true);
    // Moving up from the end scrolls back far enough to show the option whole.
    for (let step = 0; step < 12; step++) await page.keyboard.press('ArrowUp');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 48.md');
    await expect.poll(() => highlightInList(page)).toBe(true);

    // A new query highlights the first match again, and its count is announced.
    await input.fill('document 1');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 1.md');
    await expect(dialog.getByRole('status')).toHaveText('11 results');
    // That status is the palette's only live region, so the count is announced once.
    await expect(
      dialog.locator('[aria-live], [role="status"], [role="alert"], [role="log"]'),
    ).toHaveCount(1);
    await expect(dialog.getByRole('group', { name: 'Recently opened' })).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 10.md');
    await expect(list.getByRole('option', { name: 'Document 10.md documents' })).toHaveAttribute(
      'data-highlighted',
    );
    // End and Home move the highlight to the last and first options.
    await page.keyboard.press('End');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 19.md');
    await page.keyboard.press('Home');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 1.md');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 10.md');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('palette-log-light')).toHaveText('open documents/Document 10.md');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('modifier selection, pointer highlight, empty results and Escape', async ({
    page,
    browserName,
  }) => {
    await page.goto(paletteFixture);
    const trigger = page.getByRole('button', { name: 'Quick open dark' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Go to document' });
    await expect(dialog.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      'dark',
    );
    // The application's footer content flows as text after the hints, keys included.
    const content = dialog.locator('.env-command-palette-footer-content');
    await expect(content).toHaveText('Press Esc to close');
    await expect(content.locator('kbd.env-kbd')).toHaveText('Esc');
    // Words and keys keep ordinary spacing instead of becoming separate, gapped flex items.
    const spacing = await content.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element.firstChild!);
      return (
        element.querySelector('kbd')!.getBoundingClientRect().left -
        range.getBoundingClientRect().right
      );
    });
    expect(spacing).toBeLessThan(8);
    await page.keyboard.press('Control+Enter');
    await expect(page.getByTestId('palette-log-dark')).toHaveText('side recent/Roadmap.md');

    await trigger.click();
    const option = dialog.locator('[data-item-id="documents/Document 3.md"]');
    await option.hover();
    // The highlight follows a pointer that moves over an option.
    const box = (await option.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2 + 8, box.y + box.height / 2, { steps: 2 });
    // Playwright's WebKit moves the mouse without the pointer movement Base UI's hover reads.
    if (browserName !== 'webkit')
      await expect.poll(() => highlighted(page)).toBe('documents/Document 3.md');
    await option.click({ modifiers: ['ControlOrMeta'] });
    await expect(page.getByTestId('palette-log-dark')).toHaveText('side documents/Document 3.md');

    await trigger.click();
    await dialog.getByRole('combobox').fill('nothing matches this');
    await expect(dialog.getByRole('status')).toHaveText('No matching documents');
    await expect(dialog.getByRole('listbox', { includeHidden: true })).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
