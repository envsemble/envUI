import pierreDark from '@pierre/theme/pierre-dark';
import pierreLight from '@pierre/theme/pierre-light';
import type { ThemeRegistration } from 'shiki/core';
import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';
import { contrastColors, diffContrastColors } from './CodeThemeContrast.js';

/**
 * A Pierre theme under envUI's name, with each token color that falls below 4.5:1 on code's
 * background replaced by the closest one of the same hue and chroma that reaches it (see
 * scripts/GenerateCodeThemes.mjs). Everything else is the theme's own.
 */
function readable(theme: ThemeRegistration, name: string, replacements: Record<string, string>) {
  const replace = (color: string | undefined) =>
    color === undefined ? color : (replacements[color.toLowerCase()] ?? color);
  return {
    ...theme,
    name,
    tokenColors: theme.tokenColors?.map((rule) =>
      rule.settings?.foreground
        ? { ...rule, settings: { ...rule.settings, foreground: replace(rule.settings.foreground) } }
        : rule,
    ),
  } as ThemeRegistration;
}

/**
 * The Pierre themes, the ones Diffs (diffs.com) uses, so code snippets and code diffs share their
 * colors, independently of the envUI palette; token colors that would be hard to read on code's
 * background are made readable.
 */
export const codeThemes = {
  light: readable(
    pierreLight as unknown as ThemeRegistration,
    'envui-pierre-light',
    contrastColors.light,
  ),
  dark: readable(
    pierreDark as unknown as ThemeRegistration,
    'envui-pierre-dark',
    contrastColors.dark,
  ),
};

/** The colors Diffs takes a theme's addition and deletion colors from, for lines and counts. */
const changeColorKeys = {
  addition: ['gitDecoration.addedResourceForeground', 'terminal.ansiGreen'],
  deletion: ['gitDecoration.deletedResourceForeground', 'terminal.ansiRed'],
} as const;

/**
 * A Pierre theme for code diffs under envUI's name: as the code blocks' theme, but readable on the
 * lines Diffs tints with its addition and deletion colors too, and with those colors, which also
 * color the change counts, readable on code's background (see scripts/GenerateCodeThemes.mjs).
 */
function readableDiff(
  theme: ThemeRegistration,
  name: string,
  colors: typeof diffContrastColors.light,
) {
  const base = readable(theme, name, colors.tokens);
  const themeColors = { ...base.colors };
  for (const kind of ['addition', 'deletion'] as const)
    for (const key of changeColorKeys[kind])
      if (themeColors[key]?.toLowerCase() === colors[kind].from) themeColors[key] = colors[kind].to;
  return { ...base, colors: themeColors } as ThemeRegistration;
}

/** The themes of code diffs; see readableDiff. */
export const diffThemes = {
  light: readableDiff(
    pierreLight as unknown as ThemeRegistration,
    'envui-pierre-diff-light',
    diffContrastColors.light,
  ),
  dark: readableDiff(
    pierreDark as unknown as ThemeRegistration,
    'envui-pierre-diff-dark',
    diffContrastColors.dark,
  ),
};

/**
 * The background of code in the app theme. Pierre Light's editor is as white as the light canvas,
 * so light code takes the theme's own sidebar grey to stand out.
 */
export function codeBackground(theme: ThemeValue): string | undefined {
  const colors = codeThemes[theme].colors;
  return theme === 'light' ? colors?.['sideBar.background'] : colors?.['editor.background'];
}

/** The code theme's colors for the app theme, as CSS custom properties. */
export function codeThemeStyle(theme: ThemeValue): CSSProperties {
  const colors = codeThemes[theme].colors;
  return {
    '--env-code-background': codeBackground(theme),
    '--env-code-foreground': colors?.['editor.foreground'],
    colorScheme: theme,
  } as CSSProperties;
}
