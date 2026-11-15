import { pixelsOf } from './lengths.js';

const paintsNothing = (color: string) =>
  color === 'transparent' || /^rgba\([^)]*,\s*0\s*\)$/.test(color) || /\/\s*0%?\s*\)$/.test(color);

/**
 * What an element paints: a background, a border or a shadow. A border of a transparent color
 * paints nothing, though it takes room. The site's fit measures what a picture paints by it too.
 */
export function paintsOf(style: CSSStyleDeclaration): string[] {
  const paints: string[] = [];
  if (!paintsNothing(style.backgroundColor)) paints.push(`background ${style.backgroundColor}`);
  if (style.backgroundImage !== 'none') paints.push('a background image');
  const sides = (['top', 'right', 'bottom', 'left'] as const).filter(
    (side) =>
      pixelsOf(style.getPropertyValue(`border-${side}-width`)) > 0 &&
      !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`)) &&
      !paintsNothing(style.getPropertyValue(`border-${side}-color`)),
  );
  if (sides.length) paints.push(`a border (${sides.join(', ')})`);
  if (style.boxShadow !== 'none') paints.push('a shadow');
  return paints;
}
