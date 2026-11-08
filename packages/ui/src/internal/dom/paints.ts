// What an element paints, from its computed style. Dev mode reads it for its planes and the
// readout; the site's fit reads it to centre what a picture shows.

import { pixelsOf } from './lengths.js';

/**
 * Whether a color paints nothing: transparent, or of no alpha, as `rgba(0, 0, 0, 0)` or
 * `oklch(0.5 0.1 200 / 0)`. An opaque `rgb(255, 0, 0)` ends in a 0 too, its blue.
 */
const isTransparent = (color: string) =>
  color === 'transparent' || /^rgba\([^)]*,\s*0\s*\)$/.test(color) || /\/\s*0%?\s*\)$/.test(color);

/**
 * What an element paints: a background, a border or a shadow. A border of a transparent color
 * paints nothing, though it takes room. The site's fit measures what a picture paints by it too.
 */
export function paintsOf(style: CSSStyleDeclaration): string[] {
  const paints: string[] = [];
  if (!isTransparent(style.backgroundColor)) paints.push(`background ${style.backgroundColor}`);
  if (style.backgroundImage !== 'none') paints.push('a background image');
  const sides = (['top', 'right', 'bottom', 'left'] as const).filter(
    (side) =>
      pixelsOf(style.getPropertyValue(`border-${side}-width`)) > 0 &&
      !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`)) &&
      !isTransparent(style.getPropertyValue(`border-${side}-color`)),
  );
  if (sides.length) paints.push(`a border (${sides.join(', ')})`);
  if (style.boxShadow !== 'none') paints.push('a shadow');
  return paints;
}
