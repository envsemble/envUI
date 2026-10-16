import pierreDark from '@pierre/theme/pierre-dark';
import pierreLight from '@pierre/theme/pierre-light';
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

/** The Pierre themes, the ones Diffs (diffs.com) uses, so code snippets and code diffs share colors. */
const pierre = {
  light: pierreLight as unknown as ThemeRegistration,
  dark: pierreDark as unknown as ThemeRegistration,
};

const direction = (scheme: ThemeValue): Direction => (scheme === 'light' ? 'darker' : 'lighter');

/**
 * The background of code in the app theme. Pierre Light's editor is as white as the light canvas,
 * so light code takes the theme's own sidebar grey to stand out.
 */
export function codeBackground(theme: ThemeValue): string | undefined {
  const colors = pierre[theme].colors;
  return theme === 'light' ? colors?.['sideBar.background'] : colors?.['editor.background'];
}

/** Every text color a theme gives code: its foreground and each token rule's foreground. */
function textColors(theme: ThemeRegistration) {
  const colors = [theme.colors?.['editor.foreground'] ?? ''];
  for (const rule of theme.tokenColors ?? [])
    if (rule.settings?.foreground) colors.push(rule.settings.foreground);
  return colors.filter(Boolean).map((color) => color.toLowerCase());
}

/** A Pierre theme under envUI's name, with its text colors replaced as `replacements` lists. */
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
      ...colors,
      ...(foreground && { 'editor.foreground': replace(foreground) }),
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
 * The code theme of an app theme and contrast: its Pierre theme, with each token color that falls
 * short of the contrast's target on code's background moved to the closest color of the same
 * OKLCH hue that reaches it, darker in the light theme and lighter in the dark one, with as much of
 * its chroma as the gamut allows there. Tokens that were distinct stay distinct. The colors are
 * computed where the theme first loads, from the installed Pierre themes.
 */
export const codeTheme = memo((scheme, contrast) =>
  withColors(
    pierre[scheme],
    `envui-pierre-${scheme}${contrast === 'high' ? '-high' : ''}`,
    readableReplacements(
      textColors(pierre[scheme]),
      [codeBackground(scheme)!],
      codeContrastTargets[contrast],
      direction(scheme),
    ),
  ),
);

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
  const theme = pierre[scheme];
  const background = codeBackground(scheme)!;
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
    `envui-pierre-diff-${scheme}${contrast === 'high' ? '-high' : ''}`,
    readableReplacements(textColors(theme), backgrounds, target, direction(scheme)),
    changeColors,
  );
});

/** The code theme's colors for the app theme, as CSS custom properties. */
export function codeThemeStyle(theme: ThemeValue): CSSProperties {
  return {
    '--env-code-background': codeBackground(theme),
    '--env-code-foreground': pierre[theme].colors?.['editor.foreground'],
    colorScheme: theme,
  } as CSSProperties;
}
