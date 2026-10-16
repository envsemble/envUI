/**
 * The themes the visual baseline and the accessibility scan show catalogue pages in. Every page is
 * checked in light and dark; the pages in highContrastPages are checked in high contrast as well.
 */
import type { Page } from '@playwright/test';
import { referencePages } from '../../apps/catalogue/src/navigation/DocumentationRoutes';

export type ThemeName = 'light' | 'dark' | 'light-hc' | 'dark-hc';

export interface CatalogueTheme {
  /** Names the theme in snapshot files and in KnownViolations.json. */
  name: ThemeName;
  /** The scheme the catalogue's theme button switches to. */
  scheme: 'light' | 'dark';
  /**
   * The emulated prefers-contrast. The token CSS applies the high-contrast values to every theme
   * boundary under prefers-contrast: more unless the boundary opts out, so the catalogue and the
   * popups it portals out both follow it without changing the page.
   */
  contrast: 'no-preference' | 'more';
}

export const standardThemes: readonly CatalogueTheme[] = [
  { name: 'light', scheme: 'light', contrast: 'no-preference' },
  { name: 'dark', scheme: 'dark', contrast: 'no-preference' },
];
export const highContrastThemes: readonly CatalogueTheme[] = [
  { name: 'light-hc', scheme: 'light', contrast: 'more' },
  { name: 'dark-hc', scheme: 'dark', contrast: 'more' },
];
export const allThemes: readonly CatalogueTheme[] = [...standardThemes, ...highContrastThemes];

/**
 * Pages that are also checked in high contrast. Together they show every family of color roles:
 * the swatches of each role, actions with their forced states, choice controls, fields and
 * validation, select triggers, navigation with its forced states, tabs, table and list rows, the
 * feedback tones of alerts, badges and toasts, and raised surfaces. Menus, selects, comboboxes and
 * the command palette are captured open in high contrast by the visual baseline's open lists.
 */
export const highContrastPages: ReadonlySet<string> = new Set([
  'foundations/colors',
  'components/button',
  'components/checkbox',
  'components/radio',
  'components/text-field',
  'components/select',
  'components/nav-list',
  'components/tabs',
  'components/table',
  'components/list',
  'components/alert',
  'components/badge',
  'components/toast',
  'components/card',
  // Highlighted code and code diffs take high-contrast token colors of their own.
  'components/code',
]);

const unknownPages = [...highContrastPages].filter(
  (path) => !referencePages.some((page) => page.path === path),
);
if (unknownPages.length)
  throw new Error(
    `highContrastPages in tests/browser/CatalogueThemes.ts names pages the catalogue does not have: ${unknownPages.join(', ')}.`,
  );

/** The themes a catalogue page, by its path such as components/button, is checked in. */
export function themesFor(path: string): readonly CatalogueTheme[] {
  return highContrastPages.has(path) ? allThemes : standardThemes;
}

/** Emulates the theme's contrast preference; the catalogue's theme button sets the scheme. */
export async function emulateContrast(page: Page, theme: CatalogueTheme) {
  await page.emulateMedia({ contrast: theme.contrast });
}
