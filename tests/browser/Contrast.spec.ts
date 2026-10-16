import { readFileSync } from 'node:fs';

import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { cssColor, dropped, pairName, pairs, type ContrastPair } from '../contrast/Pairs';
import { themes, type ContrastTheme } from '../contrast/Themes';
import {
  apcaContrast,
  colorDifference,
  contrastRatio,
  flatten,
  formatTable,
  formatValue,
  parseColor,
  type ContrastRow,
  type Rgb,
} from '../contrast/Contrast';

/**
 * The contrast gate. Every pair in tests/contrast/Pairs.ts is resolved in every theme of
 * tests/contrast/Themes.ts by the browser, so var(), relative colors, color-mix() and light-dark()
 * resolve as shipped, and is measured with WCAG 2.x, or as a ΔEOK distance for the difference
 * pairs, which must be told apart rather than read against each other. Pairs that fail today are listed in
 * tests/contrast/Exceptions.json; the gate fails on a new failure, on a listed failure that got
 * worse, and on a listed failure that now passes, so the list only shrinks.
 *
 * Set ENVUI_CONTRAST_REPORT=1 to print every pair's ratio and APCA Lc; each run also attaches the
 * full table to its test result.
 */

const exceptionsFile = 'tests/contrast/Exceptions.json';

/** The generated token list: every custom property the token build writes. */
const tokenList = JSON.parse(readFileSync('packages/ui/src/generated/tokens.json', 'utf8')) as {
  tokens: { cssVariable: string }[];
};

interface ContrastException {
  pair: string;
  theme: string;
  ratio: number;
  note: string;
}

const { exceptions } = JSON.parse(readFileSync(exceptionsFile, 'utf8')) as {
  exceptions: ContrastException[];
};

/** How far a listed failure may measure below its recorded ratio, for color rounding in engines. */
const tolerance = 0.05;

function exceptionFor(pair: string, theme: string) {
  return exceptions.find((exception) => exception.pair === pair && exception.theme === theme);
}

/** Resolves each named color inside a theme boundary, or null where it doesn't resolve. */
async function resolveColors(
  page: Page,
  attributes: ContrastTheme['attributes'],
  names: readonly string[],
) {
  const colors = Object.fromEntries(names.map((name) => [name, cssColor(name)]));
  return page.evaluate(
    ({ attributes, colors }) => {
      const boundary = document.createElement('div');
      boundary.className = 'env-theme';
      for (const [name, value] of Object.entries(attributes)) boundary.setAttribute(name, value);
      const holder = document.createElement('div');
      const probe = document.createElement('span');
      holder.append(probe);
      boundary.append(holder);
      document.body.append(boundary);
      // A color that doesn't resolve, such as an undefined token, leaves the probe with the color it
      // inherits, so reading it under two different inherited colors exposes it.
      const read = (value: string, inherited: string) => {
        holder.style.color = inherited;
        probe.style.color = value;
        return getComputedStyle(probe).color;
      };
      const resolved: Record<string, string | null> = {};
      for (const [name, value] of Object.entries(colors)) {
        probe.style.color = '';
        const first = read(value, 'rgb(1, 2, 3)');
        const second = read(value, 'rgb(4, 5, 6)');
        resolved[name] = probe.style.color !== '' && first === second ? first : null;
      }
      const canvas = getComputedStyle(boundary).backgroundColor;
      boundary.remove();
      return { resolved, canvas };
    },
    { attributes, colors },
  );
}

/** The minimum a pair is held to in a theme: its own lowered one for the theme's contrast, if any. */
function minimumOf(pair: ContrastPair, theme: ContrastTheme) {
  return pair.minimum?.[theme.contrast] ?? theme.minimums[pair.kind];
}

function measure(
  pair: ContrastPair,
  theme: ContrastTheme,
  resolved: Readonly<Record<string, string | null>>,
  canvas: Rgb,
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
  const difference = pair.kind === 'difference';
  const ratio = difference
    ? colorDifference(foreground, background)
    : contrastRatio(foreground, background);
  const measured = {
    ...row,
    ratio,
    apca: difference ? null : apcaContrast(foreground, background),
  };
  const exception = exceptionFor(name, theme.name);
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

test.describe('contrast', { tag: '@contrast' }, () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Colors resolve the same in every engine, so one engine measures them.',
  );

  test('the pair registry and its exceptions agree', () => {
    const problems: string[] = [];
    const declared = new Set<string>();
    for (const pair of pairs) {
      const name = pairName(pair);
      if (declared.has(name))
        problems.push(`${name} is declared twice in tests/contrast/Pairs.ts.`);
      declared.add(name);
      for (const color of [pair.fg, ...pair.bg]) {
        try {
          cssColor(color);
        } catch (error) {
          problems.push(`${name}: ${(error as Error).message}`);
        }
      }
      const scoped = pair.contrast !== undefined || pair.minimum !== undefined;
      if (scoped && !pair.rationale?.trim())
        problems.push(
          `${name} is measured only at high contrast or below its kind's minimum: give it a rationale that says why WCAG doesn't require more.`,
        );
      if (!scoped && pair.rationale)
        problems.push(`${name} has a rationale but no scope or minimum: move it to its note.`);
      for (const theme of themes) {
        const lowered = pair.minimum?.[theme.contrast];
        if (lowered !== undefined && lowered >= theme.minimums[pair.kind])
          problems.push(
            `${name} lowers its ${theme.contrast} minimum to ${lowered}, which is not below its kind's.`,
          );
      }
    }
    for (const entry of dropped) {
      if (declared.has(entry.pair))
        problems.push(
          `${entry.pair} is listed as dropped in tests/contrast/Pairs.ts but is still measured.`,
        );
      if (!entry.rationale.trim())
        problems.push(`The dropped pair ${entry.pair} needs a rationale.`);
    }
    const themeNames = new Set(themes.map((theme) => theme.name));
    const listed = new Set<string>();
    for (const exception of exceptions) {
      const key = `${exception.pair} in ${exception.theme}`;
      if (listed.has(key)) problems.push(`${exceptionsFile} lists ${key} twice.`);
      listed.add(key);
      if (!declared.has(exception.pair))
        problems.push(
          `${exceptionsFile} lists ${exception.pair}, which tests/contrast/Pairs.ts doesn't declare: rename or remove the entry.`,
        );
      if (!themeNames.has(exception.theme))
        problems.push(
          `${exceptionsFile} lists ${key}, but tests/contrast/Themes.ts has no theme "${exception.theme}".`,
        );
      if (typeof exception.ratio !== 'number')
        problems.push(`${exceptionsFile}: ${key} needs the ratio it measured.`);
      if (!exception.note?.trim())
        problems.push(
          `${exceptionsFile}: ${key} needs a note saying why it fails and what fixes it.`,
        );
    }
    expect(problems.length, problems.join('\n')).toBe(0);
  });

  // Playwright requires the fixtures object as the first parameter, even when no fixture is used.
  // eslint-disable-next-line no-empty-pattern
  test('every pair measured below the WCAG minimum, or not at all, says why', async ({}, testInfo) => {
    const lines = [
      ...pairs
        .filter((pair) => pair.contrast !== undefined || pair.minimum !== undefined)
        .map(
          (pair) =>
            `${pairName(pair)} [${
              pair.contrast
                ? `${pair.contrast} contrast only`
                : Object.entries(pair.minimum ?? {})
                    .map(([contrast, value]) => `${value}:1 at ${contrast} contrast`)
                    .join(', ')
            }]: ${pair.rationale}`,
        ),
      ...dropped.map((entry) => `${entry.pair} [dropped]: ${entry.rationale}`),
    ];
    await testInfo.attach('scoped-and-dropped-pairs.txt', {
      body: lines.join('\n'),
      contentType: 'text/plain',
    });
    if (process.env.ENVUI_CONTRAST_REPORT) console.log(`\n${lines.join('\n')}\n`);
    expect(lines.length, 'The scoped, lowered and dropped pairs are listed').toBeGreaterThan(0);
    expect(
      lines.filter((line) => line.endsWith(': ') || line.endsWith(': undefined')),
      'Every scoped, lowered or dropped pair has a rationale',
    ).toEqual([]);
  });

  for (const theme of themes) {
    test(`every pair meets its minimum in the ${theme.name} theme`, async ({ page }, testInfo) => {
      if (theme.media) await page.emulateMedia(theme.media);
      await page.goto(`${fixtureUrl}/contrast.html`);
      await page.waitForSelector('body[data-styles-ready]', { state: 'attached' });
      const measured = pairs.filter((pair) => !pair.contrast || pair.contrast === theme.contrast);
      const names = [...new Set(measured.flatMap((pair) => [pair.fg, ...pair.bg]))];
      const { resolved, canvas } = await resolveColors(page, theme.attributes, names);
      const rows = measured.map((pair) => measure(pair, theme, resolved, parseColor(canvas)));

      const report = formatTable(rows);
      await testInfo.attach(`contrast-${theme.name}.txt`, {
        body: report,
        contentType: 'text/plain',
      });
      if (process.env.ENVUI_CONTRAST_REPORT) console.log(`\n${report}\n`);

      const failures = rows.filter((row) => row.status.startsWith('FAIL'));
      const known = rows.filter((row) => row.status === 'known exception').length;
      expect(
        failures.length,
        [
          `${failures.length} of ${rows.length} pairs fail in the ${theme.name} theme ` +
            `(${known} more are known exceptions):`,
          '',
          formatTable(failures),
        ].join('\n'),
      ).toBe(0);
    });
  }

  test('prefers-contrast: more applies the high-contrast themes unless a boundary opts out', async ({
    page,
  }) => {
    await page.goto(`${fixtureUrl}/contrast.html`);
    await page.waitForSelector('body[data-styles-ready]', { state: 'attached' });
    // Every token, of every type, not only the colors the pairs name.
    const names = tokenList.tokens.map((token) => token.cssVariable);
    for (const scheme of ['light', 'dark']) {
      const read = async (attributes: Record<string, string>) =>
        page.evaluate(
          ({ attributes, names }) => {
            const boundary = document.createElement('div');
            boundary.className = 'env-theme';
            for (const [name, value] of Object.entries(attributes))
              boundary.setAttribute(name, value);
            document.body.append(boundary);
            const style = getComputedStyle(boundary);
            const values = Object.fromEntries(
              names.map((name) => [name, style.getPropertyValue(name).trim()]),
            );
            boundary.remove();
            return values;
          },
          { attributes: { 'data-env-theme': scheme, ...attributes }, names },
        );
      await page.emulateMedia({ contrast: 'no-preference' });
      const standard = await read({});
      const high = await read({ 'data-env-contrast': 'high' });
      expect(high, `${scheme}: high contrast changes colors`).not.toEqual(standard);
      await page.emulateMedia({ contrast: 'more' });
      expect(await read({}), `${scheme}: prefers-contrast: more`).toEqual(high);
      expect(await read({ 'data-env-contrast': 'standard' }), `${scheme}: opted out`).toEqual(
        standard,
      );
    }
  });
});
