import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';
import { over } from './ReadableColors.js';

/** Whether code takes its standard colors or those of a high-contrast theme. */
export type CodeContrast = 'standard' | 'high';

/**
 * The contrast every token color reaches on the backgrounds it sits on: 4.5:1 (WCAG AA for text),
 * and 7:1 (AAA) under high contrast, each with a margin so that rounding never drops below it.
 */
export const codeContrastTargets: Record<CodeContrast, number> = { standard: 4.55, high: 7.05 };

/** A fill: a color at an opacity, laid over whatever surface the code sits on. */
export interface CodeLayer {
  color: string;
  alpha: number;
}

/** The colors code takes around its tokens, in one app theme and contrast. */
interface CodeColors {
  /**
   * The surfaces code may sit on at rest, as the color tokens give them: the page, a pane or card
   * (also the raised fill), a popup, the muted fill of muted cards and surfaces, and a list item's.
   * Text in code reaches the contrast's target over each of them. Hover and pressed fills are
   * passing states and left out; so is the selected fill, which holds a row's own text.
   */
  surfaces: readonly string[];
  /**
   * Code blocks: a translucent layer of the text color, so that a block is a step from any surface,
   * as one level of the background ladder is from the next, in the light theme darker and in the
   * dark one lighter. Under high contrast in the dark theme, the theme's editor background, darker
   * than every surface: over a lighter one, no token could reach 7:1.
   */
  block: CodeLayer;
  /** Inline code: the neutral muted fill (`--env-color-bg-neutral-muted`). */
  inline: CodeLayer;
  /**
   * Diffs: the muted canvas of the themes' own design system (`bgColor-muted`), opaque, since
   * Diffs mixes its line tints from it; under high contrast in the dark theme, as blocks.
   */
  diff: string;
  /** Text: the theme's foreground, moved where it falls short on a block or inline code. */
  foreground: string;
}

const light = '#1e1f21';
const dark = '#e8eaee';

/**
 * The colors of code around its tokens, for Shiki's code themes: github-light-default and
 * github-dark-dimmed, and github-light-high-contrast and github-dark-high-contrast under high
 * contrast. They are fixed here, so that inline code and the frames of blocks and diffs need no
 * theme loaded; tests/CodeHighlighting.test.mjs checks them against the installed themes and the
 * color tokens.
 */
const colors: Record<ThemeValue, Record<CodeContrast, CodeColors>> = {
  light: {
    standard: {
      surfaces: ['#ffffff', '#eff1f5', '#e2e4e8'],
      block: { color: light, alpha: 0.06 },
      inline: { color: light, alpha: 0.1 },
      diff: '#f6f8fa',
      foreground: '#1f2328',
    },
    high: {
      surfaces: ['#ffffff', '#eff1f5', '#f6f8fc'],
      block: { color: light, alpha: 0.06 },
      inline: { color: light, alpha: 0.06 },
      diff: '#e7ecf0',
      foreground: '#0e1116',
    },
  },
  dark: {
    standard: {
      surfaces: ['#1e1f21', '#28292b', '#343638'],
      block: { color: dark, alpha: 0.05 },
      inline: { color: dark, alpha: 0.125 },
      diff: '#2d333b',
      foreground: '#b2c0cd',
    },
    high: {
      surfaces: ['#1e1f21', '#28292b', '#303234', '#343638'],
      block: { color: '#0a0c10', alpha: 1 },
      inline: { color: dark, alpha: 0.08 },
      diff: '#0a0c10',
      foreground: '#f0f3f6',
    },
  },
};

/** The colors of code around its tokens in an app theme and contrast. */
export function codeColors(scheme: ThemeValue, contrast: CodeContrast = 'standard'): CodeColors {
  return colors[scheme][contrast];
}

/**
 * What code blocks or inline code look like over each surface they may sit on, in an app theme and
 * contrast: the backgrounds their text has to be readable on.
 */
export function codeBackgrounds(
  kind: 'block' | 'inline',
  scheme: ThemeValue,
  contrast: CodeContrast = 'standard',
) {
  const { surfaces, [kind]: layer } = colors[scheme][contrast];
  return [...new Set(surfaces.map((surface) => over(layer.color, layer.alpha, surface)))];
}

/** The background of code diffs in an app theme and contrast. */
export function diffBackground(scheme: ThemeValue, contrast: CodeContrast = 'standard') {
  return colors[scheme][contrast].diff;
}

/** A layer as a CSS color. */
function layerColor({ color, alpha }: CodeLayer) {
  if (alpha === 1) return color;
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** The name envUI registers a code theme under, for code blocks or for diffs. */
export const codeThemeName = (kind: 'code' | 'diff', scheme: ThemeValue, contrast: CodeContrast) =>
  `envui-github${kind === 'diff' ? '-diff' : ''}-${scheme}${contrast === 'high' ? '-high' : ''}`;

/**
 * The code theme's colors for the app theme, standard and high-contrast, as CSS custom properties:
 * the style sheet takes the high-contrast ones where the nearest Theme's contrast is high. Inline
 * code takes the neutral muted fill from the color tokens.
 */
export function codeThemeStyle(theme: ThemeValue): CSSProperties {
  const [standard, high] = [colors[theme].standard, colors[theme].high];
  return {
    '--env-code-background': layerColor(standard.block),
    '--env-code-background-high': layerColor(high.block),
    '--env-code-diff-background': standard.diff,
    '--env-code-diff-background-high': high.diff,
    '--env-code-foreground': standard.foreground,
    '--env-code-foreground-high': high.foreground,
    colorScheme: theme,
  } as CSSProperties;
}
