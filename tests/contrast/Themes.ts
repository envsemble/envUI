import type { Page } from '@playwright/test';
import type { ContrastKind } from './Pairs';

/** A theme the contrast gate measures. */
export interface ContrastTheme {
  name: string;
  /** Attributes of the `.env-theme` boundary, as the Theme component writes them. */
  attributes: Readonly<Record<string, string>>;
  /** Media features the theme needs, such as `{ contrast: 'more' }`. */
  media?: Parameters<Page['emulateMedia']>[0];
  contrast: 'standard' | 'high';
  /** The minimum ratio of each kind of pair. */
  minimums: Readonly<Record<ContrastKind, number>>;
}

/**
 * Two state fills, or two labels, that must be told apart differ by at least one just-noticeable
 * difference, ΔEOK 0.02, the threshold CSS Color 4 uses for gamut mapping. WCAG sets no minimum for
 * it: a selection also carries a second cue (its label color, a check mark or a bar), so its fill
 * must be visible rather than 3:1. ΔEOK rather than a luminance ratio, because the light theme’s
 * selection differs from a hovered row by hue more than by lightness.
 */
const difference = 0.02;
/** WCAG 2.x AA: text 4.5:1 (1.4.3), boundaries, indicators and focus rings 3:1 (1.4.11, 2.4.13). */
const standard = { text: 4.5, 'non-text': 3, focus: 3, difference } as const;
/** High contrast: text at AAA, 7:1 (1.4.6), and every boundary, indicator and ring at 4.5:1. */
const high = { text: 7, 'non-text': 4.5, focus: 4.5, difference } as const;

/** Every theme is measured against every pair. */
export const themes: readonly ContrastTheme[] = [
  {
    name: 'light',
    attributes: { 'data-env-theme': 'light' },
    contrast: 'standard',
    minimums: standard,
  },
  {
    name: 'dark',
    attributes: { 'data-env-theme': 'dark' },
    contrast: 'standard',
    minimums: standard,
  },
  {
    name: 'light-high-contrast',
    attributes: { 'data-env-theme': 'light', 'data-env-contrast': 'high' },
    contrast: 'high',
    minimums: high,
  },
  {
    name: 'dark-high-contrast',
    attributes: { 'data-env-theme': 'dark', 'data-env-contrast': 'high' },
    contrast: 'high',
    minimums: high,
  },
];
