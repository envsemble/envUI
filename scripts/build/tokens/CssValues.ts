import type { TokenNormalized } from '@terrazzo/parser';
import { transformCSSValue, type TransformCSSValueOptions } from '@terrazzo/token-tools/css';
import { converter, formatHex } from 'culori';
import { envuiExtensions, isInternal } from './Themes.ts';

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

const zeroKeepingUnitForCalc = ({ unit }: DtcgLength) => `0${unit}`;

function typography(token: TokenNormalized, options: TransformCSSValueOptions) {
  const parts = transformCSSValue(token, options);
  const unit = envuiExtensions(token).lineHeightUnit;
  if (!unit || typeof parts !== 'object' || typeof parts['line-height'] !== 'string') return parts;
  if (!/^\d+(?:\.\d+)?$/.test(parts['line-height'])) return parts;
  return { ...parts, 'line-height': `${parts['line-height']}${unit}` };
}

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
      return (value as DtcgLength).value === 0
        ? zeroKeepingUnitForCalc(value as DtcgLength)
        : undefined;
    case 'fontFamily':
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
