import type { CSSProperties } from 'react';
import type { CodeToken } from './codeHighlighting.js';

/**
 * A token's style: its colors as custom properties, in the light code theme and the dark one, each
 * standard and high-contrast, among which the style sheet chooses by the nearest Theme (Code.css),
 * so the markup is the same in either theme: also a page rendered on the server, before it
 * hydrates, when only the root knows the reader's theme. A token without high-contrast styles
 * keeps its standard color at high contrast. Its font style is the light theme's, as the code
 * themes style a token alike (tests/library/package/CodeHighlighting.test.mjs).
 */
export function tokenStyle({ light, dark, lightHigh, darkHigh }: CodeToken): CSSProperties {
  const { fontStyle = 0 } = light;
  return {
    '--env-code-token': light.color,
    '--env-code-token-high': lightHigh?.color ?? light.color,
    '--env-code-token-dark': dark.color,
    '--env-code-token-dark-high': darkHigh?.color ?? dark.color,
    fontStyle: fontStyle & 1 ? 'italic' : undefined,
    fontWeight: fontStyle & 2 ? 700 : undefined,
    textDecoration:
      [fontStyle & 4 ? 'underline' : '', fontStyle & 8 ? 'line-through' : '']
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
