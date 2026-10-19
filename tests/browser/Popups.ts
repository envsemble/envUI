import { expect, type Locator, type Page } from '@playwright/test';

// The popups of the theme-contrast fixture, which ThemeContrast.spec and ForcedColors.spec open.

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

/** Opens one popup of a boundary of the fixture and returns it. */
export async function openPopup(page: Page, kind: PopupKind, name: string): Promise<Locator> {
  const button = (label: string) => page.getByRole('button', { name: label, exact: true });
  const dialog = (label: string) => page.getByRole('dialog', { name: label, exact: true });
  switch (kind) {
    case 'menu':
      await button(`Menu ${name}`).click();
      return page.getByRole('menu', { name: `Actions ${name}`, exact: true });
    case 'compact menu':
      await button(`Compact menu ${name}`).click();
      return page.getByRole('menu', { name: `Compact actions ${name}`, exact: true });
    case 'context menu':
      await page.getByText(`Context ${name}`, { exact: true }).click({ button: 'right' });
      return page.getByRole('menu', { name: `Context actions ${name}`, exact: true });
    case 'menubar menu':
      await page.getByRole('menuitem', { name: `File ${name}`, exact: true }).click();
      return page.getByRole('menu', { name: `File ${name}`, exact: true });
    case 'select':
      await page.getByRole('combobox', { name: `Status ${name}`, exact: true }).click();
      return page.getByRole('listbox');
    case 'compact select':
      await page.getByRole('combobox', { name: `Sort ${name}`, exact: true }).click();
      return page.getByRole('listbox');
    case 'combobox': {
      const field = page.getByRole('combobox', { name: `Person ${name}`, exact: true });
      // The floating label covers an empty field, so the keyboard opens its list.
      await field.focus();
      await field.press('ArrowDown');
      return page.getByRole('listbox');
    }
    case 'date picker':
      await page.getByRole('combobox', { name: `Due ${name}`, exact: true }).click();
      return dialog(`Due ${name}`);
    case 'popover':
      await button(`Popover ${name}`).click();
      return dialog(`Details ${name}`);
    case 'hover card':
      await page.getByRole('link', { name: `Card ${name}`, exact: true }).hover();
      return page.locator('.env-hover-card', { hasText: `Card ${name} details.` });
    case 'tooltip':
      await button(`Tooltip ${name}`).hover();
      return page.locator('.env-tooltip', { hasText: `Tooltip ${name}` });
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
      return page.locator('.env-toast', { hasText: `Toast ${name}` });
  }
}

/** Closes a popup that open() opened, and waits until it is gone. */
export async function closePopup(page: Page, kind: PopupKind, popup: Locator) {
  if (kind === 'tooltip' || kind === 'hover card') await page.mouse.move(0, 0);
  else if (kind === 'toast')
    await popup.getByRole('button', { name: 'Dismiss notification' }).click();
  else await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
}
