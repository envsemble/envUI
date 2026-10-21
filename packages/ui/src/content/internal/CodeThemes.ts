import githubDarkDimmed from 'shiki/themes/github-dark-dimmed.mjs';
import githubDarkHighContrast from 'shiki/themes/github-dark-high-contrast.mjs';
import githubLightDefault from 'shiki/themes/github-light-default.mjs';
import githubLightHighContrast from 'shiki/themes/github-light-high-contrast.mjs';
import type { ThemeRegistration } from 'shiki/core';
import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';
import { diffTints } from './CodeDiffTints.js';
import { mixInLab, over, readableReplacements, type Direction } from './ReadableColors.js';

/** Whether code takes its standard colors or those of a high-contrast theme. */
export type CodeContrast = 'standard' | 'high';

/**
 * The contrast every token color reaches on the backgrounds it sits on: 4.5:1 (WCAG AA for text),
 * and 7:1 (AAA) under high contrast, each with a margin so that rounding never drops below it.
 */
export const codeContrastTargets: Record<CodeContrast, number> = { standard: 4.55, high: 7.05 };

/**
 * The code themes, as Shiki ships them: github-light-default and github-dark-dimmed, the grey dark
 * one, and github-light-high-contrast and github-dark-high-contrast under high contrast.
 */
const github: Record<ThemeValue, Record<CodeContrast, ThemeRegistration>> = {
  light: {
    standard: githubLightDefault as ThemeRegistration,
    high: githubLightHighContrast as ThemeRegistration,
  },
  dark: {
    standard: githubDarkDimmed as ThemeRegistration,
    high: githubDarkHighContrast as ThemeRegistration,
  },
};

/**
 * The background of code blocks and diffs: the muted canvas of the themes' own design system
 * (`bgColor-muted`), which it draws code blocks on, since the themes' editor backgrounds are as
 * white as the light canvas, or too near the dark one, to set code apart. Under high contrast in
 * the dark theme, code keeps its theme's editor background, the darkest canvas: on the muted one,
 * no text could reach 7:1 on the words a diff tints.
 */
const blockBackgrounds: Record<ThemeValue, Record<CodeContrast, string>> = {
  light: { standard: '#f6f8fa', high: '#e7ecf0' },
  dark: { standard: '#2d333b', high: '#0a0c10' },
};

const direction = (scheme: ThemeValue): Direction => (scheme === 'light' ? 'darker' : 'lighter');

/** The background of code blocks and diffs in the app theme and contrast. */
export function codeBackground(scheme: ThemeValue, contrast: CodeContrast = 'standard') {
  return blockBackgrounds[scheme][contrast];
}

/**
 * The background of inline code: the theme's own color for code in text
 * (`textCodeBlock.background`), over its editor's background.
 */
export function inlineCodeBackground(scheme: ThemeValue, contrast: CodeContrast = 'standard') {
  const colors = github[scheme][contrast].colors ?? {};
  const editor = colors['editor.background'] ?? codeBackground(scheme, contrast);
  const text = colors['textCodeBlock.background'];
  if (!text) return codeBackground(scheme, contrast);
  const alpha = text.length === 9 ? Number.parseInt(text.slice(7), 16) / 255 : 1;
  return over(text.slice(0, 7), alpha, editor);
}

/** Every text color a theme gives code: its foreground and each token rule's foreground. */
function textColors(theme: ThemeRegistration) {
  const colors = [theme.colors?.['editor.foreground'] ?? ''];
  for (const rule of theme.tokenColors ?? [])
    if (rule.settings?.foreground) colors.push(rule.settings.foreground);
  return colors.filter(Boolean).map((color) => color.toLowerCase());
}

/** A code theme under envUI's name, with its text colors replaced as `replacements` lists. */
function withColors(
  theme: ThemeRegistration,
  name: string,
  replacements: Record<string, string>,
  colors: Record<string, string> = {},
) {
  const replace = (color: string | undefined) =>
    color === undefined ? color : (replacements[color.toLowerCase()] ?? color);
  const foreground = theme.colors?.['editor.foreground'];
  return {
    ...theme,
    name,
    colors: {
      ...theme.colors,
      ...(foreground && { 'editor.foreground': replace(foreground) }),
      ...colors,
    },
    tokenColors: theme.tokenColors?.map((rule) =>
      rule.settings?.foreground
        ? { ...rule, settings: { ...rule.settings, foreground: replace(rule.settings.foreground) } }
        : rule,
    ),
  } as ThemeRegistration;
}

const memo = <T>(build: (scheme: ThemeValue, contrast: CodeContrast) => T) => {
  const built = new Map<string, T>();
  return (scheme: ThemeValue, contrast: CodeContrast = 'standard') => {
    const key = `${scheme}-${contrast}`;
    if (!built.has(key)) built.set(key, build(scheme, contrast));
    return built.get(key)!;
  };
};

/**
 * The text color of code, inline and in blocks: the theme's foreground, moved as the token colors
 * are where it falls short on either background.
 */
export const codeForeground = memo((scheme, contrast) => {
  const original = github[scheme][contrast].colors?.['editor.foreground'] ?? '';
  return (
    readableReplacements(
      [original],
      [codeBackground(scheme, contrast), inlineCodeBackground(scheme, contrast)],
      codeContrastTargets[contrast],
      direction(scheme),
    )[original.toLowerCase()] ?? original
  );
});

/** The name envUI registers a code theme under, for code blocks or for diffs. */
export const codeThemeName = (kind: 'code' | 'diff', scheme: ThemeValue, contrast: CodeContrast) =>
  `envui-github${kind === 'diff' ? '-diff' : ''}-${scheme}${contrast === 'high' ? '-high' : ''}`;

/**
 * The code theme of an app theme and contrast: its Shiki theme, with each token color that falls
 * short of the contrast's target on code's background moved to the closest color of the same
 * OKLCH hue that reaches it, darker in the light theme and lighter in the dark one, with as much of
 * its chroma as the gamut allows there. Tokens that were distinct stay distinct. The colors are
 * computed where the theme first loads, from the installed Shiki themes.
 */
export const codeTheme = memo((scheme, contrast) => {
  const theme = github[scheme][contrast];
  return withColors(
    theme,
    codeThemeName('code', scheme, contrast),
    readableReplacements(
      textColors(theme),
      [codeBackground(scheme, contrast)],
      codeContrastTargets[contrast],
      direction(scheme),
    ),
    {
      'editor.background': codeBackground(scheme, contrast),
      'editor.foreground': codeForeground(scheme, contrast),
    },
  );
});

/** The colors Diffs takes a theme's addition and deletion colors from, for lines and counts. */
const changeColorKeys = {
  addition: ['gitDecoration.addedResourceForeground', 'terminal.ansiGreen'],
  deletion: ['gitDecoration.deletedResourceForeground', 'terminal.ansiRed'],
} as const;

/**
 * The theme of code diffs for an app theme and contrast: as the code theme, but with its tokens
 * readable on the lines and words Diffs tints with the addition and deletion colors too, and those
 * colors, which also color the change counts, readable on code's background.
 */
export const diffTheme = memo((scheme, contrast) => {
  const theme = github[scheme][contrast];
  const background = codeBackground(scheme, contrast);
  const target = codeContrastTargets[contrast];
  const changeColors: Record<string, string> = {};
  const backgrounds = [background];
  for (const kind of ['addition', 'deletion'] as const) {
    const key = changeColorKeys[kind].find((candidate) => theme.colors?.[candidate]);
    const original = key && theme.colors?.[key];
    if (!key || !original) continue;
    const readable =
      readableReplacements([original], [background], target, direction(scheme))[
        original.toLowerCase()
      ] ?? original;
    for (const name of changeColorKeys[kind])
      if (theme.colors?.[name]?.toLowerCase() === original.toLowerCase())
        changeColors[name] = readable;
    const { mix, alpha } = diffTints[kind][scheme];
    const line = mixInLab(background, readable, mix);
    backgrounds.push(line, over(readable, alpha, line));
  }
  return withColors(
    theme,
    codeThemeName('diff', scheme, contrast),
    readableReplacements(textColors(theme), backgrounds, target, direction(scheme)),
    { ...changeColors, 'editor.background': background },
  );
});

/**
 * The code theme's colors for the app theme, standard and high-contrast, as CSS custom properties:
 * the style sheet takes the high-contrast ones where the nearest Theme's contrast is high.
 */
export function codeThemeStyle(theme: ThemeValue): CSSProperties {
  return {
    '--env-code-background': codeBackground(theme),
    '--env-code-background-high': codeBackground(theme, 'high'),
    '--env-code-inline-background': inlineCodeBackground(theme),
    '--env-code-inline-background-high': inlineCodeBackground(theme, 'high'),
    '--env-code-foreground': codeForeground(theme),
    '--env-code-foreground-high': codeForeground(theme, 'high'),
    colorScheme: theme,
  } as CSSProperties;
}
