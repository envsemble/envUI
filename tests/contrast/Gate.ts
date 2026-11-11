// The contrast gate's measuring, in Node: what a theme's pairs need resolved, and, once the
// browser has resolved them (tests/component/Contrast.test.tsx), each pair's measure against its
// minimum and tests/contrast/Exceptions.json. The component tests reach it through their commands.
import { readFileSync } from 'node:fs';
import { cssColor, pairName, pairs, type ContrastPair } from './Pairs.ts';
import { minimumOf } from './Snapshot.ts';
import { themes, type ContrastTheme } from './Themes.ts';
import {
  apcaContrast,
  colorDifference,
  contrastRatio,
  flatten,
  formatTable,
  formatValue,
  isDistance,
  parseColor,
  type ContrastRow,
  type Rgb,
} from './Contrast.ts';

export const exceptionsFile = 'tests/contrast/Exceptions.json';

export interface ContrastException {
  pair: string;
  theme: string;
  ratio: number;
  note: string;
}

export function readExceptions() {
  return (
    JSON.parse(readFileSync(exceptionsFile, 'utf8')) as {
      exceptions: ContrastException[];
    }
  ).exceptions;
}

/** How far a listed failure may measure below its recorded ratio, for color rounding in engines. */
const tolerance = 0.05;

function themeNamed(name: string) {
  const theme = themes.find((each) => each.name === name);
  if (!theme) throw new Error(`tests/contrast/Themes.ts has no theme "${name}".`);
  return theme;
}

/** The pairs a theme measures: those of its contrast, or of both. */
const measuredIn = (theme: ContrastTheme) =>
  pairs.filter((pair) => !pair.contrast || pair.contrast === theme.contrast);

/** The colors a theme's pairs name, each as the CSS color the browser resolves. */
export function contrastColors(themeName: string): Record<string, string> {
  const names = new Set(measuredIn(themeNamed(themeName)).flatMap((pair) => [pair.fg, ...pair.bg]));
  return Object.fromEntries([...names].map((name) => [name, cssColor(name)]));
}

function measure(
  pair: ContrastPair,
  theme: ContrastTheme,
  resolved: Readonly<Record<string, string | null>>,
  canvas: Rgb,
  exceptions: readonly ContrastException[],
): ContrastRow {
  const name = pairName(pair);
  const min = minimumOf(pair, theme);
  const row = { pair: name, theme: theme.name, kind: pair.kind, min };
  const unresolved = [pair.fg, ...pair.bg].filter((color) => resolved[color] === null);
  if (unresolved.length > 0)
    return {
      ...row,
      ratio: null,
      apca: null,
      status: 'FAIL: does not resolve',
      detail: `${unresolved.join(', ')} doesn't resolve to a color here: define it, or rename it in tests/contrast/Pairs.ts.`,
    };
  const background = flatten(
    pair.bg.map((color) => parseColor(resolved[color]!)),
    canvas,
  );
  const foreground = flatten([parseColor(resolved[pair.fg]!)], background);
  const distance = isDistance(pair.kind);
  const ratio = distance
    ? colorDifference(foreground, background)
    : contrastRatio(foreground, background);
  const measured = {
    ...row,
    ratio,
    apca: distance ? null : apcaContrast(foreground, background),
  };
  const exception = exceptions.find((each) => each.pair === name && each.theme === theme.name);
  if (ratio >= min)
    return exception
      ? {
          ...measured,
          status: 'FAIL: exception now passes',
          detail: `It measures ${formatValue(pair.kind, ratio)} against ${min}: remove its entry from ${exceptionsFile}.`,
        }
      : { ...measured, status: 'pass' };
  if (!exception)
    return {
      ...measured,
      status: 'FAIL: below minimum',
      detail: `${pair.note ? `${pair.note}. ` : ''}Fix the colors. Only if the failure is accepted for now, list it in ${exceptionsFile}: ${JSON.stringify({ pair: name, theme: theme.name, ratio: Number(formatValue(pair.kind, ratio)), note: '…' })}`,
    };
  if (ratio < exception.ratio - tolerance)
    return {
      ...measured,
      status: 'FAIL: worse than its exception',
      detail: `It measures ${formatValue(pair.kind, ratio)}, below the ${formatValue(pair.kind, exception.ratio)} recorded in ${exceptionsFile}: fix the colors rather than lowering the record.`,
    };
  return { ...measured, status: 'known exception', detail: exception.note };
}

/**
 * Measures a theme's pairs from the colors the browser resolved, null for one that doesn't
 * resolve, over the boundary's canvas. Set ENVUI_CONTRAST_REPORT=1 to print every pair's ratio and
 * APCA Lc.
 */
export function measureContrast(
  themeName: string,
  resolved: Readonly<Record<string, string | null>>,
  canvas: string,
) {
  const theme = themeNamed(themeName);
  const exceptions = readExceptions();
  const rows = measuredIn(theme).map((pair) =>
    measure(pair, theme, resolved, parseColor(canvas), exceptions),
  );
  if (process.env.ENVUI_CONTRAST_REPORT) console.log(`\n${formatTable(rows)}\n`);
  const failures = rows.filter((row) => row.status.startsWith('FAIL'));
  const known = rows.filter((row) => row.status === 'known exception').length;
  return {
    failures: failures.length,
    message: [
      `${failures.length} of ${rows.length} pairs fail in the ${theme.name} theme ` +
        `(${known} more are known exceptions):`,
      '',
      formatTable(failures),
    ].join('\n'),
  };
}
