import type { CSSProperties } from 'react';
import type { ColorScheme } from '../../foundations/Theme.js';
import { over } from './readableColors.js';

export type CodeContrast = 'standard' | 'high';

const wcagAaText = 4.5;
const wcagAaaText = 7;
const marginAboveRounding = 0.05;

export const codeContrastTargets: Record<CodeContrast, number> = {
  standard: wcagAaText + marginAboveRounding,
  high: wcagAaaText + marginAboveRounding,
};

interface CodeLayer {
  color: string;
  alpha: number;
}

interface CodeColors {
  surfaces: readonly string[];
  block: CodeLayer;
  inline: CodeLayer;
  foreground: string;
}

const lightThemeText = '#1f1f22';
const darkThemeText = '#e8eaee';
const darkHighContrastEditorBackground = '#0a0c10';

const colorsOfShikiGithubThemes: Record<ColorScheme, Record<CodeContrast, CodeColors>> = {
  light: {
    standard: {
      surfaces: ['#eaeaec', '#f4f4f6', '#ffffff'],
      block: { color: lightThemeText, alpha: 0.06 },
      inline: { color: lightThemeText, alpha: 0.1 },
      foreground: '#1f2328',
    },
    high: {
      surfaces: ['#f1f1f3', '#f5f5f7', '#f8f8fa', '#ffffff'],
      block: { color: lightThemeText, alpha: 0.06 },
      inline: { color: lightThemeText, alpha: 0.06 },
      foreground: '#0e1116',
    },
  },
  dark: {
    standard: {
      surfaces: ['#191a1b', '#28292b', '#343638'],
      block: { color: darkThemeText, alpha: 0.05 },
      inline: { color: darkThemeText, alpha: 0.125 },
      foreground: '#b2c0cd',
    },
    high: {
      surfaces: ['#1e1f21', '#28292b', '#303234', '#343638'],
      block: { color: darkHighContrastEditorBackground, alpha: 1 },
      inline: { color: darkThemeText, alpha: 0.08 },
      foreground: '#f0f3f6',
    },
  },
};

export function codeColors(scheme: ColorScheme, contrast: CodeContrast = 'standard'): CodeColors {
  return colorsOfShikiGithubThemes[scheme][contrast];
}

export function codeBackgrounds(
  kind: 'block' | 'inline',
  scheme: ColorScheme,
  contrast: CodeContrast = 'standard',
) {
  const { surfaces, [kind]: layer } = colorsOfShikiGithubThemes[scheme][contrast];
  return [...new Set(surfaces.map((surface) => over(layer.color, layer.alpha, surface)))];
}

export const diffTintOpacity = { line: 0.3, word: 0.4 };

export function diffTintsOver(blocks: readonly string[], tint: string) {
  return blocks.flatMap((block) => {
    const line = over(tint, diffTintOpacity.line, block);
    return [line, over(tint, diffTintOpacity.word, line)];
  });
}

function layerColor({ color, alpha }: CodeLayer) {
  if (alpha === 1) return color;
  const [r, g, b] = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

export const codeThemeName = (scheme: ColorScheme, contrast: CodeContrast) =>
  `envui-github-${scheme}${contrast === 'high' ? '-high' : ''}`;

export function codeThemeStyle(theme: ColorScheme): CSSProperties {
  const { standard, high } = colorsOfShikiGithubThemes[theme];
  return {
    '--_code-background': layerColor(standard.block),
    '--_code-background-high': layerColor(high.block),
    '--_code-foreground': standard.foreground,
    '--_code-foreground-high': high.foreground,
    colorScheme: theme,
  };
}
