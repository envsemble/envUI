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

const standardShikiThemes: Record<ColorScheme, ThemeRegistration> = {
  light: githubLightDefault as ThemeRegistration,
  dark: githubDarkDimmed as ThemeRegistration,
};

let highContrastShikiThemes: Promise<Record<ColorScheme, ThemeRegistration>> | undefined;
function loadHighContrastThemesOnFirstUse() {
  highContrastShikiThemes ??= Promise.all([
    import('shiki/themes/github-light-high-contrast.mjs'),
    import('shiki/themes/github-dark-high-contrast.mjs'),
  ]).then(
    ([light, dark]) => ({
      light: light.default as ThemeRegistration,
      dark: dark.default as ThemeRegistration,
    }),
    (error: unknown) => {
      highContrastShikiThemes = undefined;
      throw error;
    },
  );
  return highContrastShikiThemes;
}

async function shikiTheme(scheme: ColorScheme, contrast: CodeContrast) {
  return contrast === 'high'
    ? (await loadHighContrastThemesOnFirstUse())[scheme]
    : standardShikiThemes[scheme];
}

const awayFromBackground = (scheme: ColorScheme): LightnessDirection =>
  scheme === 'light' ? 'darker' : 'lighter';
const towardsBackground = (scheme: ColorScheme): LightnessDirection =>
  scheme === 'light' ? 'lighter' : 'darker';

function textColors(theme: ThemeRegistration) {
  const colors = [theme.colors?.['editor.foreground'] ?? ''];
  for (const rule of theme.tokenColors ?? [])
    if (rule.settings?.foreground) colors.push(rule.settings.foreground);
  return colors.filter(Boolean).map((color) => color.toLowerCase());
}

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

const buildOncePerThemeAndContrast = <Built>(
  build: (scheme: ColorScheme, contrast: CodeContrast) => Promise<Built>,
) => {
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

const diffsChangeColorKeys = {
  addition: ['gitDecoration.addedResourceForeground', 'terminal.ansiGreen'],
  deletion: ['gitDecoration.deletedResourceForeground', 'terminal.ansiRed'],
} as const;
const changeKinds = ['addition', 'deletion'] as const;

export const codeTheme = buildOncePerThemeAndContrast(async (scheme, contrast) => {
  const theme = await shikiTheme(scheme, contrast);
  const { foreground } = codeColors(scheme, contrast);
  const backgrounds = codeBackgrounds('block', scheme, contrast);
  const target = codeContrastTargets[contrast];
  const changeColors: Record<string, string> = {};
  for (const kind of changeKinds) {
    const key = diffsChangeColorKeys[kind].find((candidate) => theme.colors?.[candidate]);
    const original = key && theme.colors?.[key];
    if (!key || !original) continue;
    const readable =
      readableReplacements([original], backgrounds, target, awayFromBackground(scheme))[
        original.toLowerCase()
      ] ?? original;
    for (const name of diffsChangeColorKeys[kind])
      if (theme.colors?.[name]?.toLowerCase() === original.toLowerCase())
        changeColors[name] = readable;
  }
  return withColors(
    theme,
    codeThemeName(scheme, contrast),
    readableReplacements(textColors(theme), backgrounds, target, awayFromBackground(scheme)),
    { ...changeColors, 'editor.background': backgrounds[0], 'editor.foreground': foreground },
  );
});

export interface DiffTintColors {
  addition: string;
  deletion: string;
  additionGutter: string;
  deletionGutter: string;
}

const darkThemeLineTintChroma = 0.45;
const fullChroma = 1;
const fallbackChangeColors = { addition: '#1a7f37', deletion: '#cf222e' };

export const diffTintColors = buildOncePerThemeAndContrast<DiffTintColors>(
  async (scheme, contrast) => {
    const theme = await codeTheme(scheme, contrast);
    const blocks = codeBackgrounds('block', scheme, contrast);
    const target = codeContrastTargets[contrast];
    const texts = textColors(theme);
    const tint = (kind: (typeof changeKinds)[number], chroma: number) => {
      const change = diffsChangeColorKeys[kind].map((key) => theme.colors?.[key]).find(Boolean);
      const color = change ?? fallbackChangeColors[kind];
      return nearestColor(
        chroma === fullChroma ? color : scaleChroma(color, chroma),
        (candidate) =>
          diffTintsOver(blocks, candidate).every((tinted) =>
            texts.every((text) => contrastRatio(text, tinted) >= target),
          ),
        towardsBackground(scheme),
      );
    };
    const lineChroma = scheme === 'dark' ? darkThemeLineTintChroma : fullChroma;
    return {
      addition: tint('addition', lineChroma),
      deletion: tint('deletion', lineChroma),
      additionGutter: tint('addition', fullChroma),
      deletionGutter: tint('deletion', fullChroma),
    };
  },
);
