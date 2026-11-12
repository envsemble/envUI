import { expect } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import { box, keyboard, mouse } from './Browser.ts';

// The popups of the theme-contrast fixture, which ThemeContrast.test and ForcedColors.test open.

/** Every kind of popup envUI portals, each of which the fixture opens from every boundary. */
export const popupKinds = [
  'menu',
  'compact menu',
  'context menu',
  'menubar menu',
  'select',
  'compact select',
  'combobox',
  'date picker',
  'popover',
  'hover card',
  'tooltip',
  'dialog',
  'side panel',
  'command palette',
  'toast',
] as const;
export type PopupKind = (typeof popupKinds)[number];

/** The popup an element of a class holds a text in, such as a tooltip. */
const withText = (selector: string, text: string) =>
  [...document.querySelectorAll<HTMLElement>(selector)].find((element) =>
    element.textContent?.includes(text),
  ) ?? null;

/** The middle of an element, scrolled into view first, as Playwright's hover() finds it. */
function middle(element: Element) {
  element.scrollIntoView({ block: 'nearest' });
  const { x, y, width, height } = box(element);
  return { x: x + width / 2, y: y + height / 2 };
}

async function hover(locator: Locator) {
  const { x, y } = middle(locator.element());
  await mouse.move(x, y);
}

/**
 * Opens one popup of a boundary of the fixture and returns a function that finds it: a popup
 * leaves the page as it closes, and some are found by their text alone.
 */
export async function openPopup(kind: PopupKind, name: string): Promise<() => HTMLElement | null> {
  const button = (label: string) => page.getByRole('button', { name: label, exact: true });
  const role = (locator: Locator) => () => locator.query() as HTMLElement | null;
  const dialog = (label: string) => role(page.getByRole('dialog', { name: label, exact: true }));
  const menu = (label: string) => role(page.getByRole('menu', { name: label, exact: true }));
  const list = role(page.getByRole('listbox'));
  switch (kind) {
    case 'menu':
      await button(`Menu ${name}`).click();
      return menu(`Actions ${name}`);
    case 'compact menu':
      await button(`Compact menu ${name}`).click();
      return menu(`Compact actions ${name}`);
    case 'context menu':
      await page.getByText(`Context ${name}`, { exact: true }).click({ button: 'right' });
      return menu(`Context actions ${name}`);
    case 'menubar menu':
      await page.getByRole('menuitem', { name: `File ${name}`, exact: true }).click();
      return menu(`File ${name}`);
    case 'select':
      await page.getByRole('combobox', { name: `Status ${name}`, exact: true }).click();
      return list;
    case 'compact select':
      await page.getByRole('combobox', { name: `Sort ${name}`, exact: true }).click();
      return list;
    case 'combobox': {
      // The floating label covers an empty field, so the keyboard opens its list.
      const field = page.getByRole('combobox', { name: `Person ${name}`, exact: true });
      (field.element() as HTMLElement).focus();
      await keyboard.press('ArrowDown');
      return list;
    }
    case 'date picker':
      await page.getByRole('combobox', { name: `Due ${name}`, exact: true }).click();
      return dialog(`Due ${name}`);
    case 'popover':
      await button(`Popover ${name}`).click();
      return dialog(`Details ${name}`);
    case 'hover card':
      await hover(page.getByRole('link', { name: `Card ${name}`, exact: true }));
      return () => withText('.env-hover-card', `Card ${name} details.`);
    case 'tooltip':
      await hover(button(`Tooltip ${name}`));
      return () => withText('.env-tooltip', `Tooltip ${name}`);
    case 'dialog':
      await button(`Dialog ${name}`).click();
      return dialog(`Dialog ${name}`);
    case 'side panel':
      await button(`Panel ${name}`).click();
      return dialog(`Panel ${name}`);
    case 'command palette':
      await button(`Palette ${name}`).click();
      return dialog(`Palette ${name}`);
    case 'toast':
      await button(`Toast ${name}`).click();
      return () => withText('.env-toast', `Toast ${name}`);
  }
}

/** Whether a popup openPopup found is in the page and shows, as Playwright's toBeVisible reads it. */
export function popupShown(popup: () => HTMLElement | null) {
  const element = popup();
  if (!element) return false;
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && getComputedStyle(element).visibility !== 'hidden';
}

/** Closes a popup that openPopup opened, and waits until it is gone. */
export async function closePopup(kind: PopupKind, popup: () => HTMLElement | null) {
  if (kind === 'tooltip' || kind === 'hover card') await mouse.move(0, 0);
  else if (kind === 'toast') {
    const { x, y } = middle(popup()!.querySelector('[aria-label="Dismiss notification"]')!);
    await mouse.click(x, y);
  } else await keyboard.press('Escape');
  await expect.poll(() => popupShown(popup), { message: `${kind} closes` }).toBe(false);
}
