import pierreDark from '@pierre/theme/pierre-dark';
import pierreLight from '@pierre/theme/pierre-light';
import type { ThemeRegistration } from 'shiki/core';
import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';

/**
 * The Pierre themes, the ones Diffs (diffs.com) uses, so code snippets and code diffs share their
 * colors; kept intact, independently of the envUI palette.
 */
export const codeThemes = {
  light: pierreLight as unknown as ThemeRegistration,
  dark: pierreDark as unknown as ThemeRegistration,
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
