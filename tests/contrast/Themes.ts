import type { Page } from '@playwright/test';
import type { ContrastKind } from './Pairs.ts';

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
 * State fills are compared as their OKLab distance, ΔEOK, rather than a luminance ratio: WCAG sets
 * no minimum for them, since a selection also carries a second cue (its label color, a check mark
 * or a bar), and the light selection differs from a gray hover by hue as much as by lightness.
 *
 * - difference, ΔEOK 0.02 in every theme: one just-noticeable difference, the threshold CSS Color 4
 *   uses for gamut mapping. It holds a state against its own rest or the surface it borders, such
 *   as a hovered row against its table: the two share an edge, or one replaces the other where the
 *   pointer is, and that change is seen side by side or as it happens.
 * - distinct, ΔEOK 0.03, and 0.04 at high contrast: two states of different items that mean
 *   different things, the selection against another item at rest or under the pointer, and the
 *   hovered selection against a hovered item. These are compared across a gap or from memory, as
 *   the pointer moves, which takes more than one JND; 0.7 kept the selection and a hovered
 *   navigation item 0.073 apart, and an 8% state layer, the usual hover, is about 0.05 from its
 *   surface. Two JNDs, 0.04, is the aim, and high contrast holds every theme to it. At standard
 *   contrast the light theme can’t reach it: its selection must keep muted text at 4.5:1 when
 *   pressed (grade 10 and lighter) and an inset ring at 3:1 (grade 13 and lighter), which puts it
 *   within the lightness of the gray hover rows, and blue at those grades carries at most 0.045
 *   of chroma. The selection against a row hovered on the default surface measures 0.033 there,
 *   and the hovered selection against a hovered navigation item 0.031, so 0.03 is the standard
 *   minimum. A lightness (ΔL) minimum was considered and not taken: the dark selection is a
 *   blue-gray as light as a hovered dark row, distinct by hue (0.049), as the second cue allows.
 */
const difference = 0.02;
/** WCAG 2.x AA: text 4.5:1 (1.4.3), boundaries, indicators and focus rings 3:1 (1.4.11, 2.4.13). */
const standard = { text: 4.5, 'non-text': 3, focus: 3, difference, distinct: 0.03 } as const;
/** High contrast: text at AAA, 7:1 (1.4.6), every boundary, indicator and ring at 4.5:1. */
const high = { text: 7, 'non-text': 4.5, focus: 4.5, difference, distinct: 0.04 } as const;

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
