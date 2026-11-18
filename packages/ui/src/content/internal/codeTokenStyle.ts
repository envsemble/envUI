import type { CSSProperties } from 'react';
import type { CodeToken } from './codeHighlighting.js';

const shikiFontStyle = { italic: 1, bold: 2, underline: 4, strikethrough: 8 };

export function tokenStyle({ light, dark, lightHigh, darkHigh }: CodeToken): CSSProperties {
  const { fontStyle: fontStyleOfEveryTheme = 0 } = light;
  return {
    '--_code-token': light.color,
    '--_code-token-high': lightHigh?.color ?? light.color,
    '--_code-token-dark': dark.color,
    '--_code-token-dark-high': darkHigh?.color ?? dark.color,
    fontStyle: fontStyleOfEveryTheme & shikiFontStyle.italic ? 'italic' : undefined,
    fontWeight: fontStyleOfEveryTheme & shikiFontStyle.bold ? 700 : undefined,
    textDecoration:
      [
        fontStyleOfEveryTheme & shikiFontStyle.underline ? 'underline' : '',
        fontStyleOfEveryTheme & shikiFontStyle.strikethrough ? 'line-through' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
