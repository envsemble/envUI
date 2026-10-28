/**
 * The themes the visual baseline and the accessibility scan show catalogue pages in: every page in
 * light, and the pages in samplePages in dark, light high contrast and dark high contrast as well.
 */
import { expect, type Page } from '@playwright/test';
import { allPages } from '../../../apps/site/src/navigation/SiteRoutes';

export type ThemeName = 'light' | 'dark' | 'light-hc' | 'dark-hc';

export interface CatalogueTheme {
  /** Names the theme in snapshot files and in KnownViolations.json. */
  name: ThemeName;
  /** The scheme chosen in the catalogue's Display menu. */
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
 * The theme sample: pages also checked in dark and in high contrast. Every other page is checked in
 * light alone. Together they show the color roles, actions with their forced states, a field, table
 * rows, highlighted code, which takes high-contrast token colors of its own, and the Docs' props
 * tables and token swatches. The contrast gate
 * (tests/browser/Contrast.spec.ts) measures every token pair in all four themes, and the visual
 * baseline's open lists capture menus and selects in dark and high contrast.
 */
export const samplePages: ReadonlySet<string> = new Set([
  'foundations/colors',
  'components/button',
  'components/text-field',
  'components/table',
  'components/code',
  'docs/components/button',
  'docs/tokens',
]);

const unknownPages = [...samplePages].filter(
  (path) => !allPages.some((page) => page.path === path),
);
if (unknownPages.length)
  throw new Error(
    `samplePages in tests/browser/helpers/CatalogueThemes.ts names pages the catalogue does not have: ${unknownPages.join(', ')}.`,
  );

/** The themes a catalogue page, by its path such as components/button, is checked in. */
export function themesFor(path: string): readonly CatalogueTheme[] {
  return samplePages.has(path) ? allThemes : standardThemes.slice(0, 1);
}

/** Emulates the theme's contrast preference; the catalogue's Display menu sets the scheme. */
export async function emulateContrast(page: Page, theme: CatalogueTheme) {
  await page.emulateMedia({ contrast: theme.contrast });
}

/**
 * Chooses a scheme in the catalogue's Display menu, where the theme is, and closes the menu, which
 * returns focus to its button.
 */
export async function chooseScheme(page: Page, scheme: 'light' | 'dark') {
  await page.getByRole('button', { name: 'Display', exact: true }).click();
  const menu = page.getByRole('menu', { name: 'Display' });
  await menu
    .getByRole('menuitemradio', { name: scheme === 'dark' ? 'Dark' : 'Light', exact: true })
    .click();
  await page.locator(`.site-app[data-env-theme="${scheme}"]`).waitFor();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
}
