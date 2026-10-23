// Generates envUI's primitive palette, packages/ui/tokens/palette.tokens.json, from a few seed
// colors per hue. Every grade is a band of WCAG 2 relative luminance, the same for every hue, so the
// contrast between two palette colors follows from their grades alone (see `guarantees`):
//
//   contrast(a, b) ≈ 21^(|grade(a) − grade(b)| / 100)
//
// Grade 0 is white and grade 100 black; grade 50 has 4.58:1 against both. A grade's band is the
// luminance of `grade ± bandHalfWidth`, so even at its edges a difference of 40 grades gives at
// least 3:1, 50 at least 4.5:1 and 70 at least 7:1, for any two hues. tests/Palette.test.mjs checks
// those guarantees over the generated file.
//
// Each hue keeps the hue and chroma of its seeds, which are today's colors: between two seeds both
// are interpolated by grade, beyond the outermost seeds they hold. Chroma is reduced at constant
// OKLCH lightness and hue until the color fits sRGB, and the lightness is solved so that the color's
// luminance, after rounding to 8-bit sRGB, lands inside the grade's band. Values are written in
// OKLCH with the sRGB hex they round to.
//
//   node scripts/GeneratePalette.mjs [--check]
//
// --check writes nothing and fails when the committed palette differs from a fresh build. The
// palette is internal: semantic tokens in packages/ui/tokens alias it, components never do.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { converter, formatHex, parse, wcagLuminance } from 'culori';
import { format, resolveConfig } from 'prettier';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const paletteFile = resolve(repositoryRoot, 'packages/ui/tokens/palette.tokens.json');

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const ln21 = Math.log(21);

/**
 * The grades every hue has. Steps of 5 cover text, icons, borders and fills; the surface ranges are
 * finer. 0–6 in steps of 2 hold the light theme's pages and panes; 6–15 in steps of 1 hold its
 * selection, hover and pressed fills, which must stay apart from each other while muted text keeps
 * 4.5:1 on them (grade 10 and lighter) and an inset focus ring 3:1 (grade 13 and lighter). 80–100 in
 * steps of 2 hold the dark theme's surfaces. Grade 0 (white) and 100 (black) exist only in the
 * neutral hue.
 */
export const grades = [
  0, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
  82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
];

/** How far, in grades, a color's luminance may sit from its grade's exact value. */
export const bandHalfWidth = 0.25;

/** The guarantees the grades give: a grade difference of at least `delta` gives at least `ratio`. */
export const guarantees = [
  { delta: 40, ratio: 3 },
  { delta: 50, ratio: 4.5 },
  { delta: 70, ratio: 7 },
];

/**
 * The hues and their seeds, today's colors. A hue's seeds are ordered from light to dark; each
 * fixes the hue and chroma at its own grade.
 */
export const hues = {
  neutral: {
    description:
      'The slightly blue-tinted gray of text, borders and surfaces in both themes, seeded from the light divider, the muted text and the dark pane, so dark surfaces keep less chroma, as dark grays read bluer.',
    seeds: ['#dadce0', '#5f6368', '#28292b'],
  },
  blue: {
    description:
      'The brand blue: primary actions, links, selection and focus. Seeded from the light selection tint, the dark theme’s soft blue and the primary blue.',
    seeds: ['#e8f0fe', '#a8c7fa', '#1a73e8'],
  },
  slate: {
    description:
      'The low-chroma blue-gray of quiet tints: the dark theme’s selection and the light theme’s navigation hover. Seeded from 0.7’s light navigation hover and press and its dark selected option.',
    seeds: ['#ccd9ea', '#a7bfdc', '#364863'],
  },
  steel: {
    description: 'The quieter blue of information, seeded from the info toast.',
    seeds: ['#295ea3'],
  },
  green: { description: 'Success.', seeds: ['#7dd49a', '#197136'] },
  teal: { description: 'The teal green of success toasts, seeded from 0.7’s.', seeds: ['#287156'] },
  amber: { description: 'Warning.', seeds: ['#f1bd55', '#855000'] },
  red: { description: 'Danger and errors.', seeds: ['#f5a9a3', '#b42318'] },
  violet: { description: 'Done: completed work.', seeds: ['#d1b1f6', '#7639c6'] },
  purple: { description: 'The accent purple of important actions.', seeds: ['#9b4ab8'] },
  // The muted hues of avatars: low chroma at one lightness, so a group of avatars reads as calm
  // and professional while its hues stay apart.
  'blue-muted': { description: 'The muted blue of avatars.', seeds: ['#43668d'] },
  'teal-muted': { description: 'The muted teal of avatars.', seeds: ['#356e71'] },
  'green-muted': { description: 'The muted green of avatars.', seeds: ['#486e4f'] },
  'amber-muted': { description: 'The muted ochre of avatars.', seeds: ['#7b5d33'] },
  'red-muted': { description: 'The muted rose of avatars.', seeds: ['#8b504c'] },
  'violet-muted': { description: 'The muted violet of avatars.', seeds: ['#665a8a'] },
  'purple-muted': { description: 'The muted plum of avatars.', seeds: ['#7e5370'] },
};

/** The relative luminance at the exact value of a grade. */
export const gradeLuminance = (grade) => 1.05 * Math.exp((-grade / 100) * ln21) - 0.05;

/** The grade whose exact luminance a color has, from 0 (white) to 100 (black). */
export const luminanceGrade = (luminance) => (100 * Math.log(1.05 / (luminance + 0.05))) / ln21;

/** The band of relative luminance a grade allows, `[min, max]`. */
export function gradeBand(grade) {
  if (grade === 0) return [1, 1];
  if (grade === 100) return [0, 0];
  return [gradeLuminance(grade + bandHalfWidth), gradeLuminance(grade - bandHalfWidth)];
}

/** WCAG 2 contrast ratio of two relative luminances. */
export const contrastRatio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const inGamut = ({ r, g, b }) =>
  [r, g, b].every((channel) => channel >= -1e-7 && channel <= 1 + 1e-7);

/** The color at an OKLCH lightness and hue with the most chroma up to `chroma` that sRGB shows. */
function fitChroma(l, chroma, h) {
  if (inGamut(toRgb({ mode: 'oklch', l, c: chroma, h }))) return { mode: 'oklch', l, c: chroma, h };
  let low = 0;
  let high = chroma;
  for (let step = 0; step < 32; step++) {
    const mid = (low + high) / 2;
    if (inGamut(toRgb({ mode: 'oklch', l, c: mid, h }))) low = mid;
    else high = mid;
  }
  return { mode: 'oklch', l, c: low, h };
}

const hexLuminance = (hex) => wcagLuminance(parse(hex));

/** The 8-bit sRGB color closest to a target luminance at a hue and chroma, inside the band. */
function solve(grade, { h, c }) {
  const target = gradeLuminance(grade);
  const [min, max] = gradeBand(grade);
  const colorAt = (l) => formatHex(toRgb(fitChroma(l, c, h)));
  let low = 0;
  let high = 1;
  for (let step = 0; step < 40; step++) {
    const mid = (low + high) / 2;
    if (wcagLuminance(toRgb(fitChroma(mid, c, h))) < target) low = mid;
    else high = mid;
  }
  // Rounding to 8 bits can push the luminance out of the band; search nearby lightness for the
  // in-band color closest to the target.
  const l = (low + high) / 2;
  let best = null;
  for (let offset = 0; offset <= 0.02; offset += 0.0005) {
    for (const candidate of [l - offset, l + offset]) {
      const hex = colorAt(candidate);
      const luminance = hexLuminance(hex);
      if (luminance < min || luminance > max) continue;
      const distance = Math.abs(luminanceGrade(luminance) - grade);
      if (!best || distance < best.distance) best = { hex, distance };
    }
    if (best) break;
  }
  if (!best) throw new Error(`No 8-bit color of hue ${h} lands in the band of grade ${grade}.`);
  return best.hex;
}

/** Hue and chroma at a grade, interpolated between a hue's seeds. */
function seedAt(seeds, grade) {
  if (grade <= seeds[0].grade) return seeds[0];
  if (grade >= seeds.at(-1).grade) return seeds.at(-1);
  const index = seeds.findIndex((seed) => seed.grade > grade);
  const [a, b] = [seeds[index - 1], seeds[index]];
  const t = (grade - a.grade) / (b.grade - a.grade);
  const turn = ((((b.h - a.h) % 360) + 540) % 360) - 180;
  return { h: (a.h + turn * t + 360) % 360, c: a.c + (b.c - a.c) * t };
}

const round = (value, digits) => Number(value.toFixed(digits));

/** The OKLCH components that round-trip to a hex, as short as they can be. */
function oklchComponents(hex) {
  const { l, c, h } = toOklch(parse(hex));
  for (let digits = 4; digits <= 8; digits++) {
    const components = [round(l, digits), round(c, digits), c < 1e-4 ? 0 : round(h ?? 0, 2)];
    const back = formatHex(
      toRgb({ mode: 'oklch', l: components[0], c: components[1], h: components[2] }),
    );
    if (back === hex) return components;
  }
  throw new Error(`OKLCH components of ${hex} do not round-trip.`);
}

/** The palette: hue → grade → { hex, oklch, luminance, grade (as measured) }. */
export function generatePalette() {
  const palette = {};
  for (const [name, hue] of Object.entries(hues)) {
    const seeds = hue.seeds
      .map((hex) => {
        const { c, h } = toOklch(parse(hex));
        return { hex, grade: luminanceGrade(hexLuminance(hex)), h: h ?? 0, c };
      })
      .sort((a, b) => a.grade - b.grade);
    palette[name] = {};
    for (const grade of grades) {
      if (name !== 'neutral' && (grade === 0 || grade === 100)) continue;
      const hex =
        grade === 0 ? '#ffffff' : grade === 100 ? '#000000' : solve(grade, seedAt(seeds, grade));
      const luminance = hexLuminance(hex);
      palette[name][grade] = {
        hex,
        oklch: oklchComponents(hex),
        luminance,
        measuredGrade: luminanceGrade(luminance),
      };
    }
  }
  return palette;
}

/** The DTCG document of the palette. */
export function paletteDocument(palette = generatePalette()) {
  const document = {
    $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
    palette: {
      $type: 'color',
      $description:
        'Generated by scripts/GeneratePalette.mjs: do not edit. envUI’s primitive palette. Each grade is a band of WCAG 2 relative luminance shared by every hue, so a difference of 40 grades gives at least 3:1, 50 at least 4.5:1 and 70 at least 7:1. Internal: only the semantic tokens alias it.',
      $extensions: {
        'com.envsemble.envui': {
          bandHalfWidth,
          guarantees,
          bands: Object.fromEntries(
            grades.map((grade) => [grade, gradeBand(grade).map((value) => round(value, 5))]),
          ),
        },
      },
    },
  };
  for (const [name, scale] of Object.entries(palette)) {
    document.palette[name] = { $description: hues[name].description };
    for (const [grade, color] of Object.entries(scale))
      document.palette[name][grade] = {
        $value: { colorSpace: 'oklch', components: color.oklch, hex: color.hex },
      };
  }
  return document;
}

/** JSON with groups expanded and each token on one line, which Prettier then wraps. */
function compact(node, indent = '') {
  const leaf = (value) =>
    value === null || typeof value !== 'object' || Array.isArray(value) || '$value' in value;
  if (leaf(node)) return JSON.stringify(node);
  const inner = `${indent}  `;
  const entries = Object.entries(node).map(
    ([key, value]) => `${inner}${JSON.stringify(key)}: ${compact(value, inner)}`,
  );
  return `{\n${entries.join(',\n')}\n${indent}}`;
}

async function formatted(document) {
  return format(compact(document), {
    ...(await resolveConfig(paletteFile)),
    filepath: paletteFile,
  });
}

/** Writes the palette, or with `check` compares it and throws when the committed one is stale. */
export async function writePalette({ check = false } = {}) {
  const contents = await formatted(paletteDocument());
  const existing = await readFile(paletteFile, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (existing === contents) return false;
  if (check)
    throw new Error(
      'packages/ui/tokens/palette.tokens.json is stale: run `npm run palette:generate` and commit the result.',
    );
  await writeFile(paletteFile, contents);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  if (process.argv.slice(2).some((argument) => argument !== '--check'))
    throw new Error('Usage: GeneratePalette.mjs [--check]');
  const changed = await writePalette({ check });
  console.log(
    check
      ? 'The palette is up to date.'
      : `Generated the palette${changed ? '' : ' (unchanged)'}: ${Object.keys(hues).length} hues.`,
  );
}
