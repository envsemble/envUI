import type { Page } from '@playwright/test';

/** A theme the contrast gate measures. */
export interface ContrastTheme {
  name: string;
  /** Attributes of the `.env-theme` boundary, as the Theme component writes them. */
  attributes: Readonly<Record<string, string>>;
  /** Media features the theme needs, such as `{ contrast: 'more' }` for a high-contrast theme. */
  media?: Parameters<Page['emulateMedia']>[0];
}

/** Every theme is measured against every pair. Add high-contrast themes here once tokens define them. */
export const themes: readonly ContrastTheme[] = [
  { name: 'light', attributes: { 'data-env-theme': 'light' } },
  { name: 'dark', attributes: { 'data-env-theme': 'dark' } },
];
