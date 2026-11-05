import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

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
    // A fine pointer has Esc: the palette shows no close button of its own.
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeHidden();
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

  test('the search is a large ghost text field, solid in every state', async ({ page }) => {
    await page.goto(paletteFixture);
    await page.getByRole('button', { name: 'Quick open light' }).focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Go to document' });
    const input = dialog.getByRole('combobox', { name: 'Go to document' });
    await expect(input).toBeFocused();
    // Autocomplete's combobox, in TextField's ghost frame at the large size.
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveClass(/\benv-text-field-input\b/);
    const search = dialog.locator('.env-command-palette-search');
    await expect(search).toHaveClass(/\benv-text-field\b/);
    await expect(search).toHaveAttribute('data-size', 'lg');
    const control = search.locator('.env-text-field-control');
    await expect(control).toHaveAttribute('data-variant', 'ghost');
    const look = () =>
      control.evaluate((element) => {
        const style = getComputedStyle(element);
        const field = element.querySelector('input')!;
        const border = element.querySelector('.env-text-field-border')!;
        // Its layout height: the palette may still be scaling in.
        const height = (element as HTMLElement).offsetHeight;
        return {
          height,
          pill: parseFloat(style.borderTopLeftRadius) >= height / 2,
          // The neutral fill over the popup's opaque color.
          fill: [style.backgroundImage.startsWith('linear-gradient'), style.backgroundColor],
          placeholder: getComputedStyle(field, '::placeholder').color,
          edge: getComputedStyle(border).borderTopColor,
          ring: getComputedStyle(element.closest('.env-command-palette-search')!, '::after')
            .borderTopColor,
        };
      });
    const focused = await look();
    expect(focused.height).toBe(48);
    expect(focused.pill).toBe(true);
    expect(focused.fill[0]).toBe(true);
    expect(focused.fill[1]).toMatch(/^rgb\(/);
    // Always focused, it keeps its placeholder; frosted, it has no edge, and holding the caret, it
    // shows the focus ring.
    expect(focused.placeholder).not.toBe('rgba(0, 0, 0, 0)');
    expect(focused.edge).toBe('rgba(0, 0, 0, 0)');
    expect(focused.ring).toMatch(/^rgb\(/);
    // Under the pointer it stays as it is.
    await control.hover();
    expect(await look()).toEqual(focused);

    // Typing and the arrow keys keep the focus in the field, and so does Tab.
    await page.keyboard.type('document 2');
    await expect(input).toHaveValue('document 2');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe('documents/Document 20.md');
    await expect(input).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();

    // On a solid palette, as at high contrast, its edge returns.
    await page.emulateMedia({ contrast: 'more' });
    await expect.poll(async () => (await look()).edge).toMatch(/^rgb\(/);
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
    // The application's title, with the default hint that quotes the query under it.
    await expect(dialog.locator('.env-command-palette-empty-title')).toHaveText(
      'No matching documents',
    );
    await expect(dialog.getByRole('status')).toHaveText(
      'No matching documents Nothing matches “nothing matches this”. Check the spelling or try other words.',
    );
    await expect(dialog.getByRole('listbox', { includeHidden: true })).toBeHidden();
    // With nothing to choose, the hints for Enter go; the application's footer stays.
    await expect(dialog.locator('.env-command-palette-hint')).toHaveCount(0);
    await expect(dialog.locator('.env-command-palette-footer-content')).toBeVisible();
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

  test('the empty states invite a search, say what found nothing, and follow the messages', async ({
    page,
  }) => {
    await page.goto(paletteFixture);
    const root = page.getByTestId('palette-empty');
    await root.getByRole('button', { name: 'Open Find a page' }).click();
    const dialog = page.getByRole('dialog', { name: 'Find a page' });
    const status = dialog.getByRole('status');
    const icon = dialog.locator('.env-command-palette-empty-icon');
    // Before people type, an invitation in place of the list, with the search icon; the icon is
    // decorative, so only the words are announced.
    await expect(status).toHaveText('Type to search');
    await expect(dialog.getByRole('listbox', { includeHidden: true })).toBeHidden();
    await expect(icon.locator('.env-icon')).toHaveAttribute('aria-hidden', 'true');
    const search = await icon.innerHTML();
    // A query that finds nothing says so, quoting it, with another icon.
    await dialog.getByRole('combobox').fill('  roadmap ');
    await expect(status).toHaveText(
      'No results Nothing matches “roadmap”. Check the spelling or try other words.',
    );
    await expect(icon.locator('.env-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(await icon.innerHTML()).not.toBe(search);
    // Whatever it finds replaces the empty state, and only the count is announced.
    await dialog.getByRole('combobox').fill('bill');
    await expect(dialog.getByRole('option', { name: 'Billing' })).toBeVisible();
    await expect(status).toHaveText('1 result');
    await expect(icon).toHaveCount(0);
    await page.keyboard.press('Escape');

    // EnvUIProvider's messages replace the words of both states.
    await root.getByRole('button', { name: 'Open Najít stránku' }).click();
    const translated = page.getByRole('dialog', { name: 'Najít stránku' });
    await expect(translated.getByRole('status')).toHaveText('Začněte psát');
    await translated.getByRole('combobox').fill('xyz');
    await expect(translated.getByRole('status')).toHaveText('Nic nenalezeno Pro „xyz“ nic není.');
  });

  test('while results load, the palette says so, and results already shown stay, busy', async ({
    page,
  }) => {
    await page.goto(paletteFixture);
    const root = page.getByTestId('palette-empty');
    await root.getByRole('button', { name: 'Open Search the server' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search the server' });
    const status = dialog.getByRole('status');
    const icon = dialog.locator('.env-command-palette-empty-icon');
    const field = dialog.locator('.env-command-palette-search');
    // With nothing to show yet, the empty state says the results are on their way, beside a
    // spinner hidden from assistive technology, and only the words are announced.
    await expect(status).toHaveText('Searching…');
    await expect(icon.locator('.env-spinner')).toHaveAttribute('aria-hidden', 'true');
    await expect(field.locator('.env-spinner')).toHaveCount(0);
    await dialog.getByRole('combobox').fill('xyz');
    await expect(status).toHaveText('Searching…');
    // Results already found stay, marked busy, with the loading words announced in place of the
    // count, and the search field's icon turns into a spinner.
    await dialog.getByRole('combobox').fill('bill');
    await expect(dialog.getByRole('option', { name: 'Billing' })).toBeVisible();
    await expect(dialog.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    await expect(status).toHaveText('Searching…');
    await expect(icon).toHaveCount(0);
    await expect(field.locator('.env-spinner')).toHaveCount(1);
  });

  test('default items show until people type, and choose like results', async ({ page }) => {
    await page.goto(paletteFixture);
    const root = page.getByTestId('palette-empty');
    const trigger = root.getByRole('button', { name: 'Open Go to page' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Go to page' });
    const input = dialog.getByRole('combobox', { name: 'Go to page' });
    const active = () =>
      input.evaluate(
        (field) =>
          document.getElementById(field.getAttribute('aria-activedescendant') ?? '')?.dataset
            .itemId ?? null,
      );
    // The default items, in their group, in place of an invitation; the first is highlighted.
    const group = dialog.getByRole('group', { name: 'Suggested' });
    await expect(group.getByRole('option')).toHaveText(['Home', 'Settings']);
    await expect(dialog.getByRole('status')).toHaveText('2 results');
    await expect.poll(active).toBe('suggested/Home');
    await page.keyboard.press('ArrowDown');
    await expect.poll(active).toBe('suggested/Settings');
    await page.keyboard.press('Control+Enter');
    await expect(root.getByTestId('log-Go to page')).toHaveText('side suggested/Settings');
    await expect(dialog).toBeHidden();

    // Typing replaces them with the results, and clearing the text brings them back.
    await trigger.click();
    await input.fill('keyboard');
    await expect(dialog.getByRole('option')).toHaveText(['Keyboard shortcuts']);
    await expect(dialog.getByRole('group', { name: 'Suggested' })).toHaveCount(0);
    // A query that finds nothing shows the application's words, without an icon.
    await input.fill('roadmap');
    await expect(dialog.getByRole('status')).toHaveText(
      "No matching pages Try a page's name, such as Billing.",
    );
    await expect(dialog.locator('.env-command-palette-empty-icon')).toHaveCount(0);
    await input.fill('');
    await expect(dialog.getByRole('option')).toHaveText(['Home', 'Settings']);
    await expect.poll(active).toBe('suggested/Home');
    await page.keyboard.press('Enter');
    await expect(root.getByTestId('log-Go to page')).toHaveText('open suggested/Home');
    await expect(dialog).toBeHidden();
  });
});

test.describe('CommandPalette on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('shows no keys, and a close button follows the search', async ({ page }) => {
    await page.goto(paletteFixture);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    for (const theme of ['light', 'dark']) {
      await page.getByRole('button', { name: `Quick open ${theme}` }).click();
      const dialog = page.getByRole('dialog', { name: 'Go to document' });
      await expect(dialog).toBeVisible();
      // The key hints go, and with them a footer that holds nothing else.
      await expect(dialog.locator('.env-command-palette-hint').first()).toBeHidden();
      const footer = dialog.locator('.env-command-palette-footer');
      if (theme === 'light') await expect(footer).toBeHidden();
      else await expect(footer.locator('.env-command-palette-footer-content')).toBeVisible();
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).toBeHidden();
    }
  });
});
