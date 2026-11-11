import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/CommandPalette.fixture.tsx';
import { box, collectErrors, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

/** The item the palette's combobox highlights, by its id. */
const highlightedIn = (input: Locator) => () =>
  document.getElementById(input.element().getAttribute('aria-activedescendant') ?? '')?.dataset
    .itemId ?? null;

/** Whether the highlighted option shows whole inside the list's scrolled area. */
const highlightInList = (input: Locator) => () => {
  const field = input.element();
  const option = document.getElementById(field.getAttribute('aria-activedescendant') ?? '');
  const list = document.getElementById(field.getAttribute('aria-controls') ?? '');
  if (!option || !list) return false;
  const [inner, outer] = [option.getBoundingClientRect(), list.getBoundingClientRect()];
  return inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
};

const texts = (elements: Iterable<Element>) => [...elements].map((each) => each.textContent);
const textOf = (locator: Locator) => () => locator.query()?.textContent;
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
/** Whether a palette shows its list, which is in the page, hidden, while it has nothing to show. */
const listShown = (dialog: Locator) => {
  const list = dialog.element().querySelector('[role="listbox"]');
  return list !== null && shown(page.elementLocator(list));
};
/** The theme of the nearest boundary around an element. */
const themeOf = (locator: Locator) =>
  locator.element().closest('[data-env-theme]')!.getAttribute('data-env-theme');

test('typing filters, arrows move the highlight and Enter selects', async () => {
  const errors = collectErrors();
  const trigger = page.getByRole('button', { name: 'Quick open light' });
  // Opened from the keyboard, as with a shortcut.
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Go to document' });
  await isShown(dialog);
  // A fine pointer has Esc: the palette shows no close button of its own.
  expect(shown(dialog.getByRole('button', { name: 'Close' }))).toBe(false);
  expect(themeOf(dialog)).toBe('light');
  const input = dialog.getByRole('combobox', { name: 'Go to document' });
  const highlighted = highlightedIn(input);
  await expect.element(input).toHaveFocus();
  // Key hints show their keys as Kbd.
  expect(texts(dialog.element().querySelectorAll('.env-command-palette-hint kbd.env-kbd'))).toEqual(
    ['Enter', 'Ctrl', 'Enter'],
  );
  const list = dialog.getByRole('listbox', { name: 'Go to document' });
  await expect.element(input).toHaveAttribute('aria-controls', list.element().id);
  expect(shown(dialog.getByRole('group', { name: 'Recently opened' }))).toBe(true);
  expect(shown(dialog.getByRole('group', { name: 'Documents' }))).toBe(true);
  await expect.poll(highlighted).toBe('recent/Roadmap.md');

  await keyboard.press('ArrowDown');
  await expect.poll(highlighted).toBe('recent/Decisions.md');
  await keyboard.press('ArrowUp');
  await keyboard.press('ArrowUp');
  await expect.poll(highlighted).toBe('documents/Document 60.md');
  // The highlighted option scrolls into view within the list.
  await expect.poll(highlightInList(input)).toBe(true);
  // Page Up and Page Down move a list's height and stop at the ends.
  await keyboard.press('PageUp');
  await expect.poll(highlighted).not.toBe('documents/Document 60.md');
  await expect.poll(highlightInList(input)).toBe(true);
  await keyboard.press('PageDown');
  await keyboard.press('PageDown');
  await expect.poll(highlighted).toBe('documents/Document 60.md');
  await expect.poll(highlightInList(input)).toBe(true);
  // Moving up from the end scrolls back far enough to show the option whole.
  for (let step = 0; step < 12; step++) await keyboard.press('ArrowUp');
  await expect.poll(highlighted).toBe('documents/Document 48.md');
  await expect.poll(highlightInList(input)).toBe(true);

  // A new query highlights the first match again, and its count is announced.
  await input.fill('document 1');
  await expect.poll(highlighted).toBe('documents/Document 1.md');
  await expect.poll(textOf(dialog.getByRole('status'))).toBe('11 results');
  // That status is the palette's only live region, so the count is announced once.
  expect(
    dialog.element().querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]'),
  ).toHaveLength(1);
  expect(dialog.getByRole('group', { name: 'Recently opened' }).query()).toBeNull();
  await keyboard.press('ArrowDown');
  await expect.poll(highlighted).toBe('documents/Document 10.md');
  await expect
    .element(list.getByRole('option', { name: 'Document 10.md documents' }))
    .toHaveAttribute('data-highlighted');
  // End and Home move the highlight to the last and first options.
  await keyboard.press('End');
  await expect.poll(highlighted).toBe('documents/Document 19.md');
  await keyboard.press('Home');
  await expect.poll(highlighted).toBe('documents/Document 1.md');
  // Tab keeps the focus in the field.
  await keyboard.press('Tab');
  await expect.element(input).toHaveFocus();
  await keyboard.press('ArrowDown');
  await expect.poll(highlighted).toBe('documents/Document 10.md');
  await keyboard.press('Enter');
  await isHidden(dialog);
  await expect
    .poll(textOf(page.getByTestId('palette-log-light')))
    .toBe('open documents/Document 10.md');
  await expect.element(trigger).toHaveFocus();
  expect(errors).toEqual([]);
});

test('modifier selection, pointer highlight, empty results and Escape', async () => {
  const trigger = page.getByRole('button', { name: 'Quick open dark' });
  const log = textOf(page.getByTestId('palette-log-dark'));
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Go to document' });
  await isShown(dialog);
  expect(themeOf(dialog)).toBe('dark');
  const input = dialog.getByRole('combobox');
  const highlighted = highlightedIn(input);
  // The application's footer content flows as text after the hints, keys included.
  const content = dialog.element().querySelector('.env-command-palette-footer-content')!;
  expect(content.textContent).toBe('Press Esc to close');
  expect(texts(content.querySelectorAll('kbd.env-kbd'))).toEqual(['Esc']);
  // Words and keys keep ordinary spacing instead of becoming separate, gapped flex items.
  const range = document.createRange();
  range.selectNodeContents(content.firstChild!);
  expect(
    content.querySelector('kbd')!.getBoundingClientRect().left -
      range.getBoundingClientRect().right,
  ).toBeLessThan(8);
  await keyboard.press('Control+Enter');
  await expect.poll(log).toBe('side recent/Roadmap.md');

  await trigger.click();
  await isShown(dialog);
  const option = page.elementLocator(
    dialog.element().querySelector('[data-item-id="documents/Document 3.md"]')!,
  );
  await option.hover();
  // The highlight follows a pointer that moves over an option.
  const at = box(option);
  await mouse.move(at.x + at.width / 2 + 8, at.y + at.height / 2, { steps: 2 });
  await expect.poll(highlighted).toBe('documents/Document 3.md');
  await option.click({ modifiers: ['ControlOrMeta'] });
  await expect.poll(log).toBe('side documents/Document 3.md');

  await trigger.click();
  await isShown(dialog);
  await dialog.getByRole('combobox').fill('nothing matches this');
  // The application's title, with the default hint that quotes the query under it.
  await expect
    .poll(() => dialog.element().querySelector('.env-command-palette-empty-title')?.textContent)
    .toBe('No matching documents');
  await expect
    .poll(textOf(dialog.getByRole('status')))
    .toBe(
      'No matching documents Nothing matches “nothing matches this”. Check the spelling or try other words.',
    );
  expect(listShown(dialog)).toBe(false);
  // With nothing to choose, the hints for Enter go; the application's footer stays.
  expect(dialog.element().querySelectorAll('.env-command-palette-hint')).toHaveLength(0);
  expect(
    shown(
      page.elementLocator(dialog.element().querySelector('.env-command-palette-footer-content')!),
    ),
  ).toBe(true);
  await keyboard.press('Enter');
  expect(shown(dialog)).toBe(true);
  await keyboard.press('Escape');
  await isHidden(dialog);
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await isShown(dialog);
  await keyboard.press('Escape');
  await isHidden(dialog);
  await expect.element(trigger).toHaveFocus();
});

test('the empty states invite a search, say what found nothing, and follow the messages; while results load, the palette says so, and results already shown stay, busy', async () => {
  const root = page.getByTestId('palette-empty');
  const icons = (dialog: Locator) =>
    dialog.element().querySelectorAll('.env-command-palette-empty-icon');
  await root.getByRole('button', { name: 'Open Find a page' }).click();
  const dialog = page.getByRole('dialog', { name: 'Find a page' });
  const status = textOf(dialog.getByRole('status'));
  // Before people type, an invitation in place of the list: one line of words, with no icon.
  await expect.poll(status).toBe('Type to search');
  expect(listShown(dialog)).toBe(false);
  expect(icons(dialog)).toHaveLength(0);
  // A query that finds nothing says so, quoting it, on the same one line.
  await dialog.getByRole('combobox').fill('  roadmap ');
  await expect
    .poll(status)
    .toBe('No results Nothing matches “roadmap”. Check the spelling or try other words.');
  expect(icons(dialog)).toHaveLength(0);
  // Whatever it finds replaces the empty state, and only the count is announced.
  await dialog.getByRole('combobox').fill('bill');
  await isShown(dialog.getByRole('option', { name: 'Billing' }));
  await expect.poll(status).toBe('1 result');
  expect(icons(dialog)).toHaveLength(0);
  await keyboard.press('Escape');
  await isHidden(dialog);

  // EnvUIProvider's messages replace the words of both states.
  await root.getByRole('button', { name: 'Open Najít stránku' }).click();
  const translated = page.getByRole('dialog', { name: 'Najít stránku' });
  await expect.poll(textOf(translated.getByRole('status'))).toBe('Začněte psát');
  await translated.getByRole('combobox').fill('xyz');
  await expect
    .poll(textOf(translated.getByRole('status')))
    .toBe('Nic nenalezeno Pro „xyz“ nic není.');
  await keyboard.press('Escape');
  await isHidden(translated);

  await root.getByRole('button', { name: 'Open Search the server' }).click();
  const server = page.getByRole('dialog', { name: 'Search the server' });
  const searching = textOf(server.getByRole('status'));
  const spinners = () =>
    server
      .element()
      .querySelectorAll('.env-command-palette-search .env-text-field-end .env-spinner');
  // With nothing to show yet, the empty state's line says the results are on their way, and a
  // spinner hidden from assistive technology turns at the search field's end.
  await expect.poll(searching).toBe('Searching…');
  expect(icons(server)).toHaveLength(0);
  expect(spinners()[0]!.getAttribute('aria-hidden')).toBe('true');
  await server.getByRole('combobox').fill('xyz');
  await expect.poll(searching).toBe('Searching…');
  // Results already found stay, marked busy, with the loading words announced in place of the
  // count, and the spinner stays at the search field's end.
  await server.getByRole('combobox').fill('bill');
  await isShown(server.getByRole('option', { name: 'Billing' }));
  await expect.element(server.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  await expect.poll(searching).toBe('Searching…');
  expect(icons(server)).toHaveLength(0);
  expect(spinners()).toHaveLength(1);
});

test('default items show until people type, and choose like results', async () => {
  const root = page.getByTestId('palette-empty');
  const trigger = root.getByRole('button', { name: 'Open Go to page' });
  const log = textOf(root.getByTestId('log-Go to page'));
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Go to page' });
  const input = dialog.getByRole('combobox', { name: 'Go to page' });
  const active = highlightedIn(input);
  const options = () => texts(dialog.getByRole('option').elements());
  // The default items, in their group, in place of an invitation; the first is highlighted.
  const group = dialog.getByRole('group', { name: 'Suggested' });
  await expect
    .poll(() => texts(group.getByRole('option').elements()))
    .toEqual(['Home', 'Settings']);
  await expect.poll(textOf(dialog.getByRole('status'))).toBe('2 results');
  await expect.poll(active).toBe('suggested/Home');
  await keyboard.press('ArrowDown');
  await expect.poll(active).toBe('suggested/Settings');
  await keyboard.press('Control+Enter');
  await expect.poll(log).toBe('side suggested/Settings');
  await isHidden(dialog);

  // Typing replaces them with the results, and clearing the text brings them back.
  await trigger.click();
  await isShown(dialog);
  await input.fill('keyboard');
  await expect.poll(options).toEqual(['Keyboard shortcuts']);
  expect(group.query()).toBeNull();
  // A query that finds nothing shows the application's words, without an icon.
  await input.fill('roadmap');
  await expect
    .poll(textOf(dialog.getByRole('status')))
    .toBe("No matching pages Try a page's name, such as Billing.");
  expect(dialog.element().querySelectorAll('.env-command-palette-empty-icon')).toHaveLength(0);
  await input.fill('');
  await expect.poll(options).toEqual(['Home', 'Settings']);
  await expect.poll(active).toBe('suggested/Home');
  await keyboard.press('Enter');
  await expect.poll(log).toBe('open suggested/Home');
  await isHidden(dialog);
});
