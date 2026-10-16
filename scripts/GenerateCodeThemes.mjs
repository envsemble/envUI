// Generates packages/ui/src/content/internal/CodeThemeContrast.ts: the token colors of the Pierre
// code themes that fall below 4.5:1 (WCAG AA for text) on the background code takes in each app
// theme, each with the closest color that reaches it. Code blocks and code diffs use the Pierre
// themes with those colors replaced, so every highlighted token is readable while the themes keep
// their look: a replacement keeps the color's OKLCH hue and chroma and moves only its lightness,
// darker on the light background and lighter on the dark one, as little as reaching the target
// takes. The backgrounds are those of CodeThemes.ts: the light theme's sidebar grey and the dark
// theme's editor background.
//
// Code diffs show tokens on tinted lines too: Diffs mixes each changed line's background and its
// emphasized words from the theme's addition and deletion colors, which also color the change
// counts. Diffs gets its own replacements, so its counts reach the target on code's background and
// its tokens on the darkest of those backgrounds in the light theme and the lightest in the dark;
// the mixes are read from Diffs' style sheet, so they follow its updates.
//
//   node scripts/GenerateCodeThemes.mjs [--check]
//
// --check writes nothing and fails when the committed file differs from a fresh build, as after an
// update of @pierre/theme. tests/CodeHighlighting.test.mjs checks the highlighted output.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  clampChroma,
  converter,
  formatHex,
  interpolate,
  wcagContrast,
  wcagLuminance,
} from 'culori';
import { format, resolveConfig } from 'prettier';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const contrastFile = resolve(
  repositoryRoot,
  'packages/ui/src/content/internal/CodeThemeContrast.ts',
);
/** The contrast replacements reach: 4.5:1 with a margin, so rounding never drops below it. */
export const targetContrast = 4.55;

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const require = createRequire(resolve(repositoryRoot, 'packages/ui/package.json'));
const load = async (name) => (await import(pathToFileURL(require.resolve(name)).href)).default;

/** The Pierre themes, each with the background code takes on it, as CodeThemes.ts chooses it. */
export async function codeThemes() {
  const light = await load('@pierre/theme/pierre-light');
  const dark = await load('@pierre/theme/pierre-dark');
  return {
    light: { theme: light, background: light.colors['sideBar.background'] },
    dark: { theme: dark, background: dark.colors['editor.background'] },
  };
}

/** Every text color a theme gives code: its foreground and each token rule's foreground. */
export function textColors(theme) {
  const colors = new Set([theme.colors['editor.foreground']]);
  for (const rule of theme.tokenColors ?? [])
    if (rule.settings?.foreground) colors.add(rule.settings.foreground);
  return [...colors].map((color) => color.toLowerCase());
}

/** The color of the same hue and chroma, at the lightness closest to it that reaches the target. */
export function readableColor(color, background, direction) {
  if (wcagContrast(color, background) >= targetContrast) return color;
  const { l, c = 0, h } = toOklch(color);
  const at = (lightness) => formatHex(clampChroma({ mode: 'oklch', l: lightness, c, h }, 'oklch'));
  // Lightness that reaches the target, and lightness that does not; the answer lies between.
  let reaches = direction === 'darker' ? 0 : 1;
  let misses = l;
  for (let step = 0; step < 40; step += 1) {
    const middle = (reaches + misses) / 2;
    if (wcagContrast(at(middle), background) >= targetContrast) reaches = middle;
    else misses = middle;
  }
  return at(reaches);
}

/** The addition and deletion colors Diffs takes from a theme, as its getHighlighterThemeStyles does. */
function changeColors(theme) {
  const colors = theme.colors;
  return {
    addition: colors['gitDecoration.addedResourceForeground'] ?? colors['terminal.ansiGreen'],
    deletion: colors['gitDecoration.deletedResourceForeground'] ?? colors['terminal.ansiRed'],
  };
}

/**
 * How Diffs tints changed lines, from its style sheet: the share of the change color mixed into a
 * line's background in Lab, and the opacity of the change color over it for emphasized words, for
 * the light and the dark theme.
 */
async function changeMixes() {
  // The style sheet beside the package's entry point, which its exports do not list.
  const style = await readFile(new URL('./style.js', import.meta.resolve('@pierre/diffs')), 'utf8');
  const kind = (name) => {
    const line = style.match(
      new RegExp(
        String.raw`--diffs-bg-${name}:var\(--diffs-bg-${name}-override,light-dark\(color-mix\(in lab, var\(--diffs-bg\) ([\d.]+)%, var\(--diffs-${name}-base\)\),color-mix\(in lab, var\(--diffs-bg\) ([\d.]+)%`,
      ),
    );
    const emphasis = style.match(
      new RegExp(
        String.raw`--diffs-bg-${name}-emphasis:var\(--diffs-bg-${name}-emphasis-override,light-dark\(rgb\(from var\(--diffs-${name}-base\) r g b / ([\d.]+)\),rgb\(from var\(--diffs-${name}-base\) r g b / ([\d.]+)\)`,
      ),
    );
    if (!line || !emphasis)
      throw new Error(`Diffs' style sheet no longer tints ${name}s as this script reads it.`);
    return {
      light: { mix: 1 - Number(line[1]) / 100, alpha: Number(emphasis[1]) },
      dark: { mix: 1 - Number(line[2]) / 100, alpha: Number(emphasis[2]) },
    };
  };
  return { addition: kind('addition'), deletion: kind('deletion') };
}

/** A color at an opacity over a background, as the browser composites it. */
function over(color, alpha, background) {
  const top = toRgb(color);
  const bottom = toRgb(background);
  const channel = (key) => top[key] * alpha + bottom[key] * (1 - alpha);
  return formatHex({ mode: 'rgb', r: channel('r'), g: channel('g'), b: channel('b') });
}

/** Diffs' replacements for one theme: its change colors, and its tokens on every line's background. */
function diffColors(theme, background, direction, mixes) {
  const changes = changeColors(theme);
  const readableChanges = Object.fromEntries(
    Object.entries(changes).map(([kind, color]) => [
      kind,
      readableColor(color.toLowerCase(), background, direction),
    ]),
  );
  const backgrounds = [background];
  for (const [kind, color] of Object.entries(readableChanges)) {
    const { mix, alpha } = mixes[kind];
    const line = formatHex(interpolate([background, color], 'lab')(mix));
    backgrounds.push(line, over(color, alpha, line));
  }
  // Dark text is hardest to read on the darkest background, light text on the lightest.
  const luminance = backgrounds.map((color) => wcagLuminance(color));
  const worst =
    backgrounds[
      luminance.indexOf(direction === 'darker' ? Math.min(...luminance) : Math.max(...luminance))
    ];
  return {
    ...Object.fromEntries(
      Object.entries(changes).map(([kind, color]) => [
        kind,
        { from: color.toLowerCase(), to: readableChanges[kind] },
      ]),
    ),
    tokens: Object.fromEntries(
      textColors(theme)
        .filter((color) => wcagContrast(color, worst) < 4.5)
        .sort()
        .map((color) => [color, readableColor(color, worst, direction)]),
    ),
  };
}

/** The replacements for both themes: original hex to readable hex, for the colors that need one. */
export async function contrastColors() {
  const themes = await codeThemes();
  const replacements = {};
  for (const [name, { theme, background }] of Object.entries(themes)) {
    const direction = name === 'light' ? 'darker' : 'lighter';
    replacements[name] = Object.fromEntries(
      textColors(theme)
        .filter((color) => wcagContrast(color, background) < 4.5)
        .sort()
        .map((color) => [color, readableColor(color, background, direction)]),
    );
  }
  return replacements;
}

/** Diffs' replacements for both themes. */
export async function diffContrastColors() {
  const themes = await codeThemes();
  const mixes = await changeMixes();
  const forTheme = (name) => ({
    addition: mixes.addition[name],
    deletion: mixes.deletion[name],
  });
  return {
    light: diffColors(themes.light.theme, themes.light.background, 'darker', forTheme('light')),
    dark: diffColors(themes.dark.theme, themes.dark.background, 'lighter', forTheme('dark')),
  };
}

/** The generated module, as the committed file must read. */
export async function codeThemesSource() {
  const replacements = await contrastColors();
  const diffReplacements = await diffContrastColors();
  const text = `// Generated by scripts/GenerateCodeThemes.mjs from @pierre/theme; do not edit.

/**
 * Token colors of the Pierre code themes below 4.5:1 on the background code takes in each app theme,
 * each with the closest color of the same OKLCH hue and chroma that reaches ${targetContrast}:1.
 */
export const contrastColors: Record<'light' | 'dark', Readonly<Record<string, string>>> = ${JSON.stringify(replacements)};

/**
 * The same for code diffs, whose tokens also sit on lines tinted with the addition and deletion
 * colors: those colors, which also color the change counts, made readable on code's background,
 * and the token colors below 4.5:1 on the strongest tint they make.
 */
export const diffContrastColors: Record<
  'light' | 'dark',
  {
    addition: { from: string; to: string };
    deletion: { from: string; to: string };
    tokens: Readonly<Record<string, string>>;
  }
> = ${JSON.stringify(diffReplacements)};
`;
  return format(text, { ...(await resolveConfig(contrastFile)), filepath: contrastFile });
}

async function main() {
  const expected = await codeThemesSource();
  if (process.argv.includes('--check')) {
    const current = await readFile(contrastFile, 'utf8').catch(() => '');
    if (current !== expected) {
      console.error(`${contrastFile} is stale: run node scripts/GenerateCodeThemes.mjs.`);
      process.exitCode = 1;
    } else console.log('The code themes reach 4.5:1.');
    return;
  }
  await writeFile(contrastFile, expected);
  console.log(`Wrote ${contrastFile}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
