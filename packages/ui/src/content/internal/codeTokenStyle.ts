import type { CSSProperties } from 'react';
import type { CodeTokenStyle } from './codeHighlighting.js';

/**
 * A token's style: its colors as custom properties, the standard one and the high-contrast one,
 * between which the style sheet chooses by the contrast of the nearest Theme. A token without
 * high-contrast styles keeps its standard color at high contrast.
 */
export function tokenStyle(
  { color, fontStyle = 0 }: CodeTokenStyle,
  high?: CodeTokenStyle,
): CSSProperties {
  return {
    '--env-code-token': color,
    '--env-code-token-high': high?.color ?? color,
    fontStyle: fontStyle & 1 ? 'italic' : undefined,
    fontWeight: fontStyle & 2 ? 700 : undefined,
    textDecoration:
      [fontStyle & 4 ? 'underline' : '', fontStyle & 8 ? 'line-through' : '']
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
