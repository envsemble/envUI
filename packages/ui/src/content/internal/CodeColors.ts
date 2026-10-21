import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';

/** Whether code takes its standard colors or those of a high-contrast theme. */
export type CodeContrast = 'standard' | 'high';

/**
 * The contrast every token color reaches on the backgrounds it sits on: 4.5:1 (WCAG AA for text),
 * and 7:1 (AAA) under high contrast, each with a margin so that rounding never drops below it.
 */
export const codeContrastTargets: Record<CodeContrast, number> = { standard: 4.55, high: 7.05 };

/** The colors code takes around its tokens, in one app theme and contrast. */
interface CodeColors {
  /**
   * Code blocks and diffs: the muted canvas of the themes' own design system (`bgColor-muted`),
   * which it draws code blocks on, since the themes' editor backgrounds are as white as the light
   * canvas, or too near the dark one, to set code apart. Under high contrast in the dark theme,
   * the theme's editor background, the darkest canvas: on the muted one, no text could reach 7:1
   * on the words a diff tints.
   */
  block: string;
  /** Inline code: the theme's own color for code in text (`textCodeBlock.background`) over its editor's. */
  inline: string;
  /** Text: the theme's foreground, which reaches the contrast's target on both backgrounds. */
  foreground: string;
}

/**
 * The colors of code around its tokens, from Shiki's code themes: github-light-default and
 * github-dark-dimmed, and github-light-high-contrast and github-dark-high-contrast under high
 * contrast. They are fixed here, so that inline code and the frames of blocks and diffs need no
 * theme loaded; tests/CodeHighlighting.test.mjs checks them against the installed themes.
 */
const colors: Record<ThemeValue, Record<CodeContrast, CodeColors>> = {
  light: {
    standard: { block: '#f6f8fa', inline: '#eff1f3', foreground: '#1f2328' },
    high: { block: '#e7ecf0', inline: '#eef0f2', foreground: '#0e1116' },
  },
  dark: {
    standard: { block: '#2d333b', inline: '#3c434d', foreground: '#adbac7' },
    high: { block: '#0a0c10', inline: '#454a51', foreground: '#f0f3f6' },
  },
};

/** The colors of code around its tokens in an app theme and contrast. */
export function codeColors(scheme: ThemeValue, contrast: CodeContrast = 'standard'): CodeColors {
  return colors[scheme][contrast];
}

/** The background of code blocks and diffs in an app theme and contrast. */
export function codeBackground(scheme: ThemeValue, contrast: CodeContrast = 'standard') {
  return colors[scheme][contrast].block;
}

/** The name envUI registers a code theme under, for code blocks or for diffs. */
export const codeThemeName = (kind: 'code' | 'diff', scheme: ThemeValue, contrast: CodeContrast) =>
  `envui-github${kind === 'diff' ? '-diff' : ''}-${scheme}${contrast === 'high' ? '-high' : ''}`;

/**
 * The code theme's colors for the app theme, standard and high-contrast, as CSS custom properties:
 * the style sheet takes the high-contrast ones where the nearest Theme's contrast is high.
 */
export function codeThemeStyle(theme: ThemeValue): CSSProperties {
  const [standard, high] = [colors[theme].standard, colors[theme].high];
  return {
    '--env-code-background': standard.block,
    '--env-code-background-high': high.block,
    '--env-code-inline-background': standard.inline,
    '--env-code-inline-background-high': high.inline,
    '--env-code-foreground': standard.foreground,
    '--env-code-foreground-high': high.foreground,
    colorScheme: theme,
  } as CSSProperties;
}
