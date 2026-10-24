import { parseColor, type Color } from '@react-stately/color';

/** The formats a ColorPicker shows and a ColorSwatch writes a color in. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/** A color as a CSS color string, such as #6750a4, or React Aria's Color. */
export type ColorValue = string | Color;

const black = parseColor('#000000');

/**
 * CSS's space-separated rgb() and hsl(), such as rgb(103 80 164 / 50%), in the comma-separated
 * form React Aria parses: rgba(103, 80, 164, 0.5).
 */
function commaSeparated(value: string) {
  const match = /^(rgb|hsl)a?\(\s*([^,()]+?)\s*\)$/i.exec(value.trim());
  if (!match) return value;
  const [channels, alpha] = match[2].split('/').map((part) => part.trim());
  const parts = channels.split(/\s+/);
  if (parts.length !== 3) return value;
  const space = match[1].toLowerCase();
  if (alpha === undefined) return `${space}(${parts.join(', ')})`;
  const opacity = alpha.endsWith('%') ? Number.parseFloat(alpha) / 100 : Number.parseFloat(alpha);
  return `${space}a(${parts.join(', ')}, ${opacity})`;
}

/**
 * A color from a string, such as #6750a4 or 6750a4, rgb(), rgba(), hsl(), hsla() or hsb(), comma
 * or space separated, or a Color; undefined for a string that is no color.
 */
export function parseColorValue(value: ColorValue): Color | undefined {
  if (typeof value !== 'string') return value;
  // Hexadecimal digits without their #, as earlier ColorPickers took them.
  const text = /^[0-9a-f]{3,8}$/i.test(value.trim()) ? `#${value.trim()}` : value.trim();
  try {
    return parseColor(text);
  } catch {
    try {
      return parseColor(commaSeparated(value));
    } catch {
      return undefined;
    }
  }
}

/** A color from a string or a Color, black for one that is no color, opaque without alpha. */
export function toColor(value: ColorValue | undefined, alpha: boolean): Color {
  const color = (value === undefined ? undefined : parseColorValue(value)) ?? black;
  return alpha || color.getChannelValue('alpha') === 1 ? color : color.withChannelValue('alpha', 1);
}

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/**
 * A color as a CSS color string in a format: #rrggbb in lowercase, rgb(r, g, b) or
 * hsl(h, s%, l%), with its alpha (#rrggbbaa, rgba() or hsla()) while it is translucent.
 */
export function formatColor(color: Color, format: ColorFormat): string {
  const alpha = round(color.getChannelValue('alpha'), 2);
  const translucent = alpha < 1;
  if (format === 'hex') return color.toString(translucent ? 'hexa' : 'hex').toLowerCase();
  if (format === 'rgb') {
    const rgb = color.toFormat('rgb');
    const channels = (['red', 'green', 'blue'] as const).map((channel) =>
      round(rgb.getChannelValue(channel)),
    );
    return translucent ? `rgba(${channels.join(', ')}, ${alpha})` : `rgb(${channels.join(', ')})`;
  }
  const hsl = color.toFormat('hsl');
  const channels = [
    round(hsl.getChannelValue('hue')),
    `${round(hsl.getChannelValue('saturation'))}%`,
    `${round(hsl.getChannelValue('lightness'))}%`,
  ];
  return translucent ? `hsla(${channels.join(', ')}, ${alpha})` : `hsl(${channels.join(', ')})`;
}

/** Whether two colors are the same once written as #rrggbbaa. */
export function sameColor(a: Color, b: Color) {
  return a.toString('hexa') === b.toString('hexa');
}
