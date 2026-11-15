import { expect, type Page } from '@playwright/test';
import { allPages } from '../../../apps/site/src/routes/SiteRoutes';

export type ThemeName = 'light' | 'dark' | 'light-hc' | 'dark-hc';

export interface CatalogueTheme {
  name: ThemeName;
  scheme: 'light' | 'dark';
  contrast: 'no-preference' | 'more';
}

const standardThemes: readonly CatalogueTheme[] = [
  { name: 'light', scheme: 'light', contrast: 'no-preference' },
  { name: 'dark', scheme: 'dark', contrast: 'no-preference' },
];
const highContrastThemes: readonly CatalogueTheme[] = [
  { name: 'light-hc', scheme: 'light', contrast: 'more' },
  { name: 'dark-hc', scheme: 'dark', contrast: 'more' },
];
export const allThemes: readonly CatalogueTheme[] = [...standardThemes, ...highContrastThemes];

const samplePages: ReadonlySet<string> = new Set([
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
    `samplePages in tests/browser/support/CatalogueThemes.ts names pages the catalogue does not have: ${unknownPages.join(', ')}.`,
  );

export function themesFor(path: string): readonly CatalogueTheme[] {
  return samplePages.has(path) ? allThemes : standardThemes.slice(0, 1);
}

export async function emulateContrast(page: Page, theme: CatalogueTheme) {
  await page.emulateMedia({ contrast: theme.contrast });
}

export async function chooseScheme(page: Page, scheme: 'light' | 'dark') {
  await page.getByRole('button', { name: 'Display', exact: true }).click();
  const menu = page.getByRole('menu', { name: 'Display' });
  await menu
    .getByRole('menuitemradio', { name: scheme === 'dark' ? 'Dark' : 'Light', exact: true })
    .click();
  await page.locator(`html[data-env-theme="${scheme}"]`).waitFor();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
}
