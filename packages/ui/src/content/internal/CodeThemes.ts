import githubDarkDimmed from 'shiki/themes/github-dark-dimmed.mjs';
import githubLightDefault from 'shiki/themes/github-light-default.mjs';
import type { ThemeRegistration } from 'shiki/core';
import type { ThemeValue } from '../../foundations/Theme.js';
import {
  codeBackgrounds,
  codeColors,
  codeContrastTargets,
  codeThemeName,
  diffBackground,
  type CodeContrast,
} from './CodeColors.js';
import { diffTints } from './CodeDiffTints.js';
import { mixInLab, over, readableReplacements, type Direction } from './ReadableColors.js';

/** The standard code themes, as Shiki ships them: github-light-default and the grey github-dark-dimmed. */
const standard: Record<ThemeValue, ThemeRegistration> = {
  light: githubLightDefault as ThemeRegistration,
  dark: githubDarkDimmed as ThemeRegistration,
};

let highContrast: Promise<Record<ThemeValue, ThemeRegistration>> | undefined;
/**
 * The high-contrast code themes, github-light-high-contrast and github-dark-high-contrast, loaded
 * only once code is shown at high contrast, so that applications without it never download them.
 */
function loadHighContrast() {
  highContrast ??= Promise.all([
    import('shiki/themes/github-light-high-contrast.mjs'),
    import('shiki/themes/github-dark-high-contrast.mjs'),
  ]).then(
    ([light, dark]) => ({
      light: light.default as ThemeRegistration,
      dark: dark.default as ThemeRegistration,
    }),
    (error: unknown) => {
      highContrast = undefined;
      throw error;
    },
  );
  return highContrast;
}

/** The Shiki theme of an app theme and contrast. */
async function shikiTheme(scheme: ThemeValue, contrast: CodeContrast) {
  return contrast === 'high' ? (await loadHighContrast())[scheme] : standard[scheme];
}

const direction = (scheme: ThemeValue): Direction => (scheme === 'light' ? 'darker' : 'lighter');

/** Every text color a theme gives code: its foreground and each token rule's foreground. */
function textColors(theme: ThemeRegistration) {
  const colors = [theme.colors?.['editor.foreground'] ?? ''];
  for (const rule of theme.tokenColors ?? [])
    if (rule.settings?.foreground) colors.push(rule.settings.foreground);
  return colors.filter(Boolean).map((color) => color.toLowerCase());
}

/** A Shiki theme under envUI's name, with its text colors replaced as `replacements` lists. */
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

/** Builds each theme once, when it is first asked for. */
const memo = (
  build: (scheme: ThemeValue, contrast: CodeContrast) => Promise<ThemeRegistration>,
) => {
  const built = new Map<string, Promise<ThemeRegistration>>();
  return (scheme: ThemeValue, contrast: CodeContrast = 'standard') => {
    const key = `${scheme}-${contrast}`;
    if (!built.has(key))
      built.set(
        key,
        build(scheme, contrast).catch((error: unknown) => {
          built.delete(key);
          throw error;
        }),
      );
    return built.get(key)!;
  };
};

/**
 * The code theme of an app theme and contrast: its Shiki theme, with each token color that falls
 * short of the contrast's target on a code block, over any surface, moved to the closest color of the same
 * OKLCH hue that reaches it, darker in the light theme and lighter in the dark one, with as much of
 * its chroma as the gamut allows there. Tokens that were distinct stay distinct. The colors are
 * computed where the theme first loads, from the installed Shiki themes.
 */
export const codeTheme = memo(async (scheme, contrast) => {
  const theme = await shikiTheme(scheme, contrast);
  const { foreground } = codeColors(scheme, contrast);
  const backgrounds = codeBackgrounds('block', scheme, contrast);
  return withColors(
    theme,
    codeThemeName('code', scheme, contrast),
    readableReplacements(
      textColors(theme),
      backgrounds,
      codeContrastTargets[contrast],
      direction(scheme),
    ),
    { 'editor.background': backgrounds[0]!, 'editor.foreground': foreground },
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
export const diffTheme = memo(async (scheme, contrast) => {
  const theme = await shikiTheme(scheme, contrast);
  const background = diffBackground(scheme, contrast);
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
