import type { CSSProperties } from 'react';
import type { ColorScheme } from '../../foundations/Theme.js';
import { over } from './readableColors.js';

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
   * Code blocks and diffs: a translucent layer of the text color, so that a block is a step from any surface,
   * as one level of the background ladder is from the next, in the light theme darker and in the
   * dark one lighter. Under high contrast in the dark theme, the theme's editor background, darker
   * than every surface: over a lighter one, no token could reach 7:1.
   */
  block: CodeLayer;
  /** Inline code: the neutral muted fill (`--env-color-bg-neutral-muted`). */
  inline: CodeLayer;
  /** Text: the theme's foreground, moved where it falls short on a block or inline code. */
  foreground: string;
}

const light = '#1f1f22';
const dark = '#e8eaee';

/**
 * The colors of code around its tokens, for Shiki's code themes: github-light-default and
 * github-dark-dimmed, and github-light-high-contrast and github-dark-high-contrast under high
 * contrast. They are fixed here, so that inline code and the frames of blocks and diffs need no
 * theme loaded; tests/CodeHighlighting.test.mjs checks them against the installed themes and the
 * color tokens.
 */
const colors: Record<ColorScheme, Record<CodeContrast, CodeColors>> = {
  light: {
    standard: {
      surfaces: ['#eaeaec', '#f4f4f6', '#ffffff'],
      block: { color: light, alpha: 0.06 },
      inline: { color: light, alpha: 0.1 },
      foreground: '#1f2328',
    },
    high: {
      surfaces: ['#f1f1f3', '#f5f5f7', '#f8f8fa', '#ffffff'],
      block: { color: light, alpha: 0.06 },
      inline: { color: light, alpha: 0.06 },
      foreground: '#0e1116',
    },
  },
  dark: {
    standard: {
      surfaces: ['#1e1f21', '#28292b', '#303234', '#343638'],
      block: { color: dark, alpha: 0.05 },
      inline: { color: dark, alpha: 0.125 },
      foreground: '#b2c0cd',
    },
    high: {
      surfaces: ['#1e1f21', '#28292b', '#303234', '#343638'],
      block: { color: '#0a0c10', alpha: 1 },
      inline: { color: dark, alpha: 0.08 },
      foreground: '#f0f3f6',
    },
  },
};

/** The colors of code around its tokens in an app theme and contrast. */
export function codeColors(scheme: ColorScheme, contrast: CodeContrast = 'standard'): CodeColors {
  return colors[scheme][contrast];
}

/**
 * What code blocks or inline code look like over each surface they may sit on, in an app theme and
 * contrast: the backgrounds their text has to be readable on.
 */
export function codeBackgrounds(
  kind: 'block' | 'inline',
  scheme: ColorScheme,
  contrast: CodeContrast = 'standard',
) {
  const { surfaces, [kind]: layer } = colors[scheme][contrast];
  return [...new Set(surfaces.map((surface) => over(layer.color, layer.alpha, surface)))];
}

/**
 * The opacities of a diff's tints: a changed line's color over the block's layer, and a changed
 * word's over its line. Diffs mixes them from a transparent background, so they show over whatever
 * the block sits on.
 */
export const diffTintOpacity = { line: 0.3, word: 0.4 };

/** What a diff's changed lines and words look like over each of `blocks`, tinted with `tint`. */
export function diffTintsOver(blocks: readonly string[], tint: string) {
  return blocks.flatMap((block) => {
    const line = over(tint, diffTintOpacity.line, block);
    return [line, over(tint, diffTintOpacity.word, line)];
  });
}

/** A layer as a CSS color. */
function layerColor({ color, alpha }: CodeLayer) {
  if (alpha === 1) return color;
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** The name envUI registers a code theme under, for code blocks and diffs alike. */
export const codeThemeName = (scheme: ColorScheme, contrast: CodeContrast) =>
  `envui-github-${scheme}${contrast === 'high' ? '-high' : ''}`;

/**
 * The code theme's colors for the app theme, standard and high-contrast, as CSS custom properties:
 * the style sheet takes the high-contrast ones where the nearest Theme's contrast is high. Inline
 * code takes the neutral muted fill from the color tokens.
 */
export function codeThemeStyle(theme: ColorScheme): CSSProperties {
  const [standard, high] = [colors[theme].standard, colors[theme].high];
  return {
    '--env-code-background': layerColor(standard.block),
    '--env-code-background-high': layerColor(high.block),
    '--env-code-foreground': standard.foreground,
    '--env-code-foreground-high': high.foreground,
    colorScheme: theme,
  } as CSSProperties;
}
