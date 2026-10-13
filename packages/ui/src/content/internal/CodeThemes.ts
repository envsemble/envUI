import githubLightDefault from '@shikijs/themes/github-light-default';
import githubDarkDefault from '@shikijs/themes/github-dark-default';
import type { CSSProperties } from 'react';
import type { ThemeValue } from '../../foundations/Theme.js';

/** Keep the published code themes intact, independently of the envUI palette. */
export const codeThemes = { light: githubLightDefault, dark: githubDarkDefault };

/** Code defaults to the dark theme, independently of the surrounding application theme. */
export function codeThemeStyle(theme: ThemeValue = 'dark'): CSSProperties {
  const colors = codeThemes[theme].colors;
  return {
    '--env-code-background': colors?.['editor.background'],
    '--env-code-foreground': colors?.['editor.foreground'],
    colorScheme: theme,
  } as CSSProperties;
}
