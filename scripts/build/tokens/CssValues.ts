// How Tokens.css writes a token's value: the transform plugin-css calls for each token.
import type { TokenNormalized } from '@terrazzo/parser';
import { transformCSSValue, type TransformCSSValueOptions } from '@terrazzo/token-tools/css';
import { converter, formatHex } from 'culori';
import { envuiExtensions, isInternal } from './Themes.ts';

/** A DTCG color, as the parser normalizes it. */
interface DtcgColor {
  colorSpace: string;
  components: number[];
  alpha?: number;
  hex?: string;
}

interface DtcgLength {
  value: number;
  unit: string;
}

interface ShadowLayer {
  inset?: boolean;
  offsetX: DtcgLength;
  offsetY: DtcgLength;
  blur: DtcgLength;
  spread: DtcgLength;
  color: DtcgColor;
}

const toRgb = converter('rgb');
const channel = (value: number) => Math.round(Math.min(1, Math.max(0, value)) * 255);
const round = (value: number, digits: number) => Number(value.toFixed(digits));

/**
 * A DTCG color as CSS: opaque colors as their sRGB hex, translucent ones as rgb() with the exact
 * alpha, so the browser, the contrast gate and the token list all see the same 8-bit values.
 */
function cssColor(color: DtcgColor) {
  const alpha = color.alpha ?? 1;
  if (alpha === 0) return 'transparent';
  const space = ({ oklch: 'oklch', srgb: 'rgb', hsl: 'hsl' } as const)[
    color.colorSpace as 'oklch' | 'srgb' | 'hsl'
  ];
  if (!space) throw new Error(`Unsupported color space ${color.colorSpace}.`);
  const [a, b, c] = color.components;
  const rgb = toRgb(
    space === 'oklch'
      ? { mode: 'oklch', l: a, c: b, h: c }
      : space === 'hsl'
        ? { mode: 'hsl', h: a, s: b / 100, l: c / 100 }
        : { mode: 'rgb', r: a, g: b, b: c },
  );
  if (alpha === 1) return color.hex ?? formatHex(rgb);
  return `rgb(${channel(rgb.r)} ${channel(rgb.g)} ${channel(rgb.b)} / ${round(alpha, 4)})`;
}

const length = ({ value, unit }: DtcgLength) => (value === 0 ? '0' : `${value}${unit}`);

/**
 * A typography token's parts, as plugin-css writes them, with the line height in em where the
 * token's `$extensions` ask for it (`lineHeightUnit: 'em'`): the font shorthands of the type roles
 * keep the line height of their own size, also in descendants with another font size.
 */
function typography(token: TokenNormalized, options: TransformCSSValueOptions) {
  const parts = transformCSSValue(token, options);
  const unit = envuiExtensions(token).lineHeightUnit;
  if (!unit || typeof parts !== 'object' || typeof parts['line-height'] !== 'string') return parts;
  if (!/^\d+(?:\.\d+)?$/.test(parts['line-height'])) return parts;
  return { ...parts, 'line-height': `${parts['line-height']}${unit}` };
}

/**
 * CSS values: colors as cssColor() writes them, shadows with those colors, a zero length as `0`,
 * font names in single quotes, and numbers marked with a CSS unit (percentages). A token that
 * aliases another public token is written as var(), plugin-css's default; one that aliases the
 * palette or a high-contrast value carries the resolved value, because those never become CSS.
 */
export function transform(token: TokenNormalized, options: TransformCSSValueOptions) {
  if (token.aliasChain?.length && !isInternal(token.aliasChain[0])) return undefined;
  const value: unknown = token.$value;
  switch (token.$type) {
    case 'typography':
      return typography(token, options);
    case 'color':
      return cssColor(value as DtcgColor);
    case 'shadow':
      return (Array.isArray(value) ? (value as ShadowLayer[]) : [value as ShadowLayer])
        .map((layer) =>
          [
            ...(layer.inset ? ['inset'] : []),
            length(layer.offsetX),
            length(layer.offsetY),
            length(layer.blur),
            length(layer.spread),
            cssColor(layer.color),
          ].join(' '),
        )
        .join(', ');
    case 'dimension':
      // A zero keeps its unit, so a calc() that adds a length to it, such as a row density's
      // padding and a space, stays valid.
      return (value as DtcgLength).value === 0 ? `0${(value as DtcgLength).unit}` : undefined;
    case 'fontFamily':
      // Single quotes, as Prettier writes them, so the CSS and the token list carry the same text.
      return (value as string[])
        .map((name) => (/^[a-z-]+$/.test(name) ? name : `'${name}'`))
        .join(', ');
    case 'number': {
      const unit = envuiExtensions(token).cssUnit;
      return unit ? `${value as number}${unit}` : undefined;
    }
    default:
      return undefined;
  }
}
