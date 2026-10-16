import { blend, clampRgb, converter, differenceEuclidean, parse, wcagContrast } from 'culori';
import { isDistance, type ContrastKind } from './Pairs';

export interface Rgb {
  mode: 'rgb';
  r: number;
  g: number;
  b: number;
  alpha: number;
}

const toRgb = converter('rgb');
const white: Rgb = { mode: 'rgb', r: 1, g: 1, b: 1, alpha: 1 };

/** Parses a computed CSS color into sRGB, clamped to the gamut a screen shows. */
export function parseColor(css: string): Rgb {
  const parsed = parse(css);
  if (parsed === undefined) throw new Error(`Cannot parse the computed color "${css}".`);
  const { r, g, b, alpha } = clampRgb(toRgb(parsed));
  return { mode: 'rgb', r, g, b, alpha: alpha ?? 1 };
}

/** Paints layers, nearest first, over a backdrop and then white, and returns the opaque result. */
export function flatten(layers: readonly Rgb[], backdrop: Rgb): Rgb {
  const painted = blend([white, backdrop, ...[...layers].reverse()], 'normal', 'rgb');
  return { mode: 'rgb', r: painted.r, g: painted.g, b: painted.b, alpha: 1 };
}

export function contrastRatio(foreground: Rgb, background: Rgb): number {
  return wcagContrast(foreground, background);
}

const oklabDistance = differenceEuclidean('oklab');

/** How far apart two opaque colors look: their Euclidean distance in OKLab, ΔEOK. */
export function colorDifference(a: Rgb, b: Rgb): number {
  return oklabDistance(a, b);
}

/**
 * APCA lightness contrast (Lc) of text on a background, after APCA-W3 0.0.98G-4g. Printed for
 * information only: WCAG 2.x ratios are what the gate checks.
 */
export function apcaContrast(text: Rgb, background: Rgb): number {
  const luminance = ({ r, g, b }: Rgb) => {
    const y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    return y > 0.022 ? y : y + (0.022 - y) ** 1.414;
  };
  const textY = luminance(text);
  const backgroundY = luminance(background);
  if (Math.abs(backgroundY - textY) < 0.0005) return 0;
  if (backgroundY > textY) {
    const contrast = (backgroundY ** 0.56 - textY ** 0.57) * 1.14;
    return contrast < 0.1 ? 0 : (contrast - 0.027) * 100;
  }
  const contrast = (backgroundY ** 0.65 - textY ** 0.62) * 1.14;
  return contrast > -0.1 ? 0 : (contrast + 0.027) * 100;
}

export type ContrastStatus =
  | 'pass'
  | 'known exception'
  | 'FAIL: below minimum'
  | 'FAIL: worse than its exception'
  | 'FAIL: exception now passes'
  | 'FAIL: does not resolve';

export interface ContrastRow {
  pair: string;
  theme: string;
  kind: ContrastKind;
  ratio: number | null;
  min: number;
  apca: number | null;
  status: ContrastStatus;
  detail?: string;
}

export const formatRatio = (ratio: number) => (Math.floor(ratio * 100) / 100).toFixed(2);

/** A measured value as the table shows it: a ratio to 2 decimals, a ΔEOK distance to 4. */
export const formatValue = (kind: ContrastKind, value: number) =>
  isDistance(kind) ? (Math.floor(value * 10000) / 10000).toFixed(4) : formatRatio(value);

/** A plain-text table of rows, one per line, with a detail line under each row that has one. */
export function formatTable(rows: readonly ContrastRow[]): string {
  const header = ['pair', 'theme', 'kind', 'value', 'min', 'APCA Lc', 'status'];
  const cells = rows.map((row) => [
    row.pair,
    row.theme,
    row.kind,
    row.ratio === null ? '-' : formatValue(row.kind, row.ratio),
    isDistance(row.kind) ? row.min.toFixed(4) : row.min.toFixed(2),
    row.apca === null ? '-' : row.apca.toFixed(1),
    row.status,
  ]);
  const widths = header.map((title, column) =>
    Math.max(title.length, ...cells.map((cell) => cell[column].length)),
  );
  const numeric = new Set([3, 4, 5]);
  const line = (cell: readonly string[]) =>
    cell
      .map((value, column) =>
        numeric.has(column) ? value.padStart(widths[column]) : value.padEnd(widths[column]),
      )
      .join('  ')
      .trimEnd();
  const lines = [line(header), line(widths.map((width) => '-'.repeat(width)))];
  rows.forEach((row, index) => {
    lines.push(line(cells[index]));
    if (row.detail) lines.push(`    ${row.detail}`);
  });
  return lines.join('\n');
}
