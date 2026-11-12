import githubDarkDimmed from 'shiki/themes/github-dark-dimmed.mjs';
import githubLightDefault from 'shiki/themes/github-light-default.mjs';
import type { ThemeRegistration } from 'shiki/core';
import type { ColorScheme } from '../../foundations/Theme.js';
import {
  codeBackgrounds,
  codeColors,
  codeContrastTargets,
  codeThemeName,
  diffTintsOver,
  type CodeContrast,
} from './codeColors.js';
import {
  contrastRatio,
  nearestColor,
  readableReplacements,
  scaleChroma,
  type LightnessDirection,
} from './readableColors.js';

/** The standard code themes, as Shiki ships them: github-light-default and the grey github-dark-dimmed. */
const standard: Record<ColorScheme, ThemeRegistration> = {
  light: githubLightDefault as ThemeRegistration,
  dark: githubDarkDimmed as ThemeRegistration,
};

let highContrast: Promise<Record<ColorScheme, ThemeRegistration>> | undefined;
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
      // Shiki's bundled themes are typed loosely; each is a theme registration.
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
async function shikiTheme(scheme: ColorScheme, contrast: CodeContrast) {
  return contrast === 'high' ? (await loadHighContrast())[scheme] : standard[scheme];
}

const direction = (scheme: ColorScheme): LightnessDirection =>
  scheme === 'light' ? 'darker' : 'lighter';

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
  // The theme with its colors replaced, still a theme registration.
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

/** Builds each theme, or what is made of it, once, when it is first asked for. */
const memo = <Built>(build: (scheme: ColorScheme, contrast: CodeContrast) => Promise<Built>) => {
  const built = new Map<string, Promise<Built>>();
  return (scheme: ColorScheme, contrast: CodeContrast = 'standard') => {
    const key = `${scheme}-${contrast}`;
    let theme = built.get(key);
    if (!theme) {
      theme = build(scheme, contrast).catch((error: unknown) => {
        built.delete(key);
        throw error;
      });
      built.set(key, theme);
    }
    return theme;
  };
};

/** The colors Diffs takes a theme's addition and deletion colors from, for lines and counts. */
const changeColorKeys = {
  addition: ['gitDecoration.addedResourceForeground', 'terminal.ansiGreen'],
  deletion: ['gitDecoration.deletedResourceForeground', 'terminal.ansiRed'],
} as const;
const changeKinds = ['addition', 'deletion'] as const;

/**
 * The code theme of an app theme and contrast, which code blocks and code diffs share: its Shiki
 * theme, with each token color that falls short of the contrast's target on a code block, over any
 * surface, moved to the closest color of the same OKLCH hue that reaches it, darker in the light
 * theme and lighter in the dark one, with as much of its chroma as the gamut allows there. Tokens
 * that were distinct stay distinct. Its addition and deletion colors, which color a diff's change
 * counts and line numbers, reach the target on a block too. The colors are computed where the
 * theme first loads, from the installed Shiki themes.
 */
export const codeTheme = memo(async (scheme, contrast) => {
  const theme = await shikiTheme(scheme, contrast);
  const { foreground } = codeColors(scheme, contrast);
  const backgrounds = codeBackgrounds('block', scheme, contrast);
  const target = codeContrastTargets[contrast];
  const changeColors: Record<string, string> = {};
  for (const kind of changeKinds) {
    const key = changeColorKeys[kind].find((candidate) => theme.colors?.[candidate]);
    const original = key && theme.colors?.[key];
    if (!key || !original) continue;
    const readable =
      readableReplacements([original], backgrounds, target, direction(scheme))[
        original.toLowerCase()
      ] ?? original;
    for (const name of changeColorKeys[kind])
      if (theme.colors?.[name]?.toLowerCase() === original.toLowerCase())
        changeColors[name] = readable;
  }
  return withColors(
    theme,
    codeThemeName(scheme, contrast),
    readableReplacements(textColors(theme), backgrounds, target, direction(scheme)),
    { ...changeColors, 'editor.background': backgrounds[0], 'editor.foreground': foreground },
  );
});

/**
 * The colors a diff tints its changed lines and words with, at `diffTintOpacity`, and its line
 * numbers' gutter with.
 */
export interface DiffTintColors {
  addition: string;
  deletion: string;
  /** The gutter's tints, the change colors at their own chroma. */
  additionGutter: string;
  deletionGutter: string;
}

/**
 * How much of its chroma a changed line's tint keeps in the dark theme, where saturated token colors
 * would otherwise compete with saturated red and green fills: the gutter keeps its chroma and carries
 * the change.
 */
const darkLineChroma = 0.45;

/**
 * How a code diff tints its changed lines and words in an app theme and contrast. A diff sits on a
 * code block's layer and takes the code theme's token colors as they are, so the tints are chosen
 * to keep them readable: each kind's color is the theme's change color, moved in OKLCH lightness
 * towards the background, darker in the dark theme and lighter in the light one, only as far as
 * every token then reaches the target on its line and its word over every surface. In dark a line's
 * tint keeps less of the color's chroma than its gutter's.
 */
export const diffTintColors = memo<DiffTintColors>(async (scheme, contrast) => {
  const theme = await codeTheme(scheme, contrast);
  const blocks = codeBackgrounds('block', scheme, contrast);
  const target = codeContrastTargets[contrast];
  const texts = textColors(theme);
  const tint = (kind: (typeof changeKinds)[number], chroma: number) => {
    const change = changeColorKeys[kind].map((key) => theme.colors?.[key]).find(Boolean);
    const color = change ?? (kind === 'addition' ? '#1a7f37' : '#cf222e');
    return nearestColor(
      chroma === 1 ? color : scaleChroma(color, chroma),
      (candidate) =>
        diffTintsOver(blocks, candidate).every((tinted) =>
          texts.every((text) => contrastRatio(text, tinted) >= target),
        ),
      scheme === 'light' ? 'lighter' : 'darker',
    );
  };
  const line = scheme === 'dark' ? darkLineChroma : 1;
  return {
    addition: tint('addition', line),
    deletion: tint('deletion', line),
    additionGutter: tint('addition', 1),
    deletionGutter: tint('deletion', 1),
  };
});
