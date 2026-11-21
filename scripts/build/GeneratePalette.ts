import { resolve } from 'node:path';
import { converter, formatHex, parse, wcagLuminance, type Oklch, type Rgb } from 'culori';
import { formatted, GeneratedOutput } from './GeneratedFiles.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

export const paletteFile = resolve(repositoryRoot, 'packages/ui/tokens/palette.tokens.json');

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const ln21 = Math.log(21);

export const grades = [
  0, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
  80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
];

export const bandHalfWidth = 0.25;

export const betweenHalfWidth = 0.1;

export const gradeKey = (grade: number) => String(grade).replace('.', '-');

export const keyGrade = (key: string) => Number(key.replace('-', '.'));

export const guarantees = [
  { delta: 40, ratio: 3 },
  { delta: 50, ratio: 4.5 },
  { delta: 70, ratio: 7 },
];

interface Hue {
  description: string;
  seeds: string[];
  between?: number[];
}

interface Seed {
  hex: string;
  grade: number;
  h: number;
  c: number;
}

interface PaletteColor {
  hex: string;
  oklch: number[];
  luminance: number;
  measuredGrade: number;
}

export const hues: Record<string, Hue> = {
  neutral: {
    description:
      'The slightly blue-tinted gray of text, borders and surfaces in both themes, seeded from the light divider, the muted text and the dark pane, so dark surfaces keep less chroma, as dark grays read bluer.',
    seeds: ['#dadce0', '#5f6368', '#28292b'],
  },
  gray: {
    description:
      'The nearly neutral gray of the light theme’s text, edges and surfaces, after One UI’s greys, seeded from its background, secondary text and dark gray. Its in-between grades 2.5 and 2.75 lie between the light recessed surface and the panes: 2.75 is the popups’ fill.',
    seeds: ['#f3f3f5', '#848487', '#252528'],
    between: [2.5, 2.75],
  },
  blue: {
    description:
      'The brand blue: primary actions, links, selection and focus. Seeded from the light selection tint, the dark theme’s soft blue and the primary blue.',
    seeds: ['#e8f0fe', '#a8c7fa', '#1a73e8'],
  },
  slate: {
    description:
      'The low-chroma blue-gray of quiet tints: the dark theme’s selection, and done, the tone of completed work, which recedes beside the status hues. Seeded from 0.7’s light navigation hover and press and its dark selected option.',
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
  purple: {
    description:
      'The accent purple of important actions. Its light seed, a lilac at the chroma of the dark theme’s soft blue, keeps the dark accent fill as soft as the primary’s; from grade 40 the purple keeps its full chroma.',
    seeds: ['#dbb2ec', '#bc6ada', '#9b4ab8'],
  },
  powder: { description: 'The powder blue of avatars.', seeds: ['#c2e4f8', '#2d5883'] },
  seafoam: { description: 'The seafoam of avatars.', seeds: ['#bae9e0', '#16615f'] },
  sage: { description: 'The sage of avatars.', seeds: ['#d0e6c5', '#425e3b'] },
  butter: { description: 'The butter yellow of avatars.', seeds: ['#f0dda5', '#704d1c'] },
  blush: { description: 'The blush pink of avatars.', seeds: ['#ffd0d2', '#843b3e'] },
  periwinkle: { description: 'The periwinkle of avatars.', seeds: ['#d9d9ff', '#504c8a'] },
  orchid: { description: 'The orchid of avatars.', seeds: ['#f8d0ea', '#783f61'] },
  oat: { description: 'The warm oat neutral of avatars.', seeds: ['#e8dccf', '#625245'] },
};

export const gradeLuminance = (grade: number) => 1.05 * Math.exp((-grade / 100) * ln21) - 0.05;

export const luminanceGrade = (luminance: number) =>
  (100 * Math.log(1.05 / (luminance + 0.05))) / ln21;

export function gradeBand(grade: number) {
  if (grade === 0) return [1, 1];
  if (grade === 100) return [0, 0];
  const half = Number.isInteger(grade) ? bandHalfWidth : betweenHalfWidth;
  return [gradeLuminance(grade + half), gradeLuminance(grade - half)];
}

export function hueGrades(name: string) {
  const hue = hues[name];
  return [...grades, ...(hue.between ?? [])]
    .filter((grade) => name === 'neutral' || (grade !== 0 && grade !== 100))
    .sort((a, b) => a - b);
}

export const contrastRatio = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const inGamut = ({ r, g, b }: Rgb) =>
  [r, g, b].every((channel) => channel >= -1e-7 && channel <= 1 + 1e-7);

function fitChroma(l: number, chroma: number, h: number): Oklch {
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

const hexLuminance = (hex: string) => wcagLuminance(parse(hex));

function closestInBand8BitColor(grade: number, { h, c }: { h: number; c: number }) {
  const target = gradeLuminance(grade);
  const [min, max] = gradeBand(grade);
  const colorAt = (l: number) => formatHex(toRgb(fitChroma(l, c, h)));
  let low = 0;
  let high = 1;
  for (let step = 0; step < 40; step++) {
    const mid = (low + high) / 2;
    if (wcagLuminance(toRgb(fitChroma(mid, c, h))) < target) low = mid;
    else high = mid;
  }
  const unroundedLightness = (low + high) / 2;
  let best: { hex: string; distance: number } | null = null;
  for (let offset = 0; offset <= 0.02; offset += 0.0005) {
    for (const candidate of [unroundedLightness - offset, unroundedLightness + offset]) {
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

function seedHueAndChromaAt(seeds: Seed[], grade: number) {
  if (grade <= seeds[0].grade) return seeds[0];
  if (grade >= seeds.at(-1)!.grade) return seeds.at(-1)!;
  const index = seeds.findIndex((seed) => seed.grade > grade);
  const [a, b] = [seeds[index - 1], seeds[index]];
  const t = (grade - a.grade) / (b.grade - a.grade);
  const turn = ((((b.h - a.h) % 360) + 540) % 360) - 180;
  return { h: (a.h + turn * t + 360) % 360, c: a.c + (b.c - a.c) * t };
}

const round = (value: number, digits: number) => Number(value.toFixed(digits));

function oklchComponents(hex: string) {
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

export function generatePalette() {
  const palette: Record<string, Record<string, PaletteColor>> = {};
  for (const [name, hue] of Object.entries(hues)) {
    const seeds = hue.seeds
      .map((hex) => {
        const { c, h } = toOklch(parse(hex));
        return { hex, grade: luminanceGrade(hexLuminance(hex)), h: h ?? 0, c };
      })
      .sort((a, b) => a.grade - b.grade);
    palette[name] = {};
    for (const grade of hueGrades(name)) {
      const hex =
        grade === 0
          ? '#ffffff'
          : grade === 100
            ? '#000000'
            : closestInBand8BitColor(grade, seedHueAndChromaAt(seeds, grade));
      const luminance = hexLuminance(hex);
      palette[name][gradeKey(grade)] = {
        hex,
        oklch: oklchComponents(hex),
        luminance,
        measuredGrade: luminanceGrade(luminance),
      };
    }
  }
  return palette;
}

export function paletteDocument(palette = generatePalette()) {
  const document: { $schema: string; palette: Record<string, unknown> } = {
    $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
    palette: {
      $type: 'color',
      $description:
        'Generated by scripts/build/GeneratePalette.ts: do not edit. envUI’s primitive palette. Each grade is a band of WCAG 2 relative luminance shared by every hue, so a difference of 40 grades gives at least 3:1, 50 at least 4.5:1 and 70 at least 7:1. Internal: only the semantic tokens alias it.',
      $extensions: {
        'com.envsemble.envui': {
          bandHalfWidth,
          guarantees,
          betweenHalfWidth,
          bands: Object.fromEntries(
            [...new Set(Object.keys(hues).flatMap(hueGrades))]
              .sort((a, b) => a - b)
              .map((grade) => [gradeKey(grade), gradeBand(grade).map((value) => round(value, 5))]),
          ),
        },
      },
    },
  };
  for (const [name, scale] of Object.entries(palette)) {
    const group: Record<string, unknown> = { $description: hues[name].description };
    for (const [grade, color] of Object.entries(scale))
      group[grade] = {
        $value: { colorSpace: 'oklch', components: color.oklch, hex: color.hex },
      };
    document.palette[name] = group;
  }
  return document;
}

function jsonWithOneTokenPerLine(node: unknown, indent = ''): string {
  const leaf = (value: unknown) =>
    value === null || typeof value !== 'object' || Array.isArray(value) || '$value' in value;
  if (leaf(node)) return JSON.stringify(node);
  const inner = `${indent}  `;
  const entries = Object.entries(node as Record<string, unknown>).map(
    ([key, value]) => `${inner}${JSON.stringify(key)}: ${jsonWithOneTokenPerLine(value, inner)}`,
  );
  return `{\n${entries.join(',\n')}\n${indent}}`;
}

export async function writePalette({ check = false } = {}) {
  const contents = await formatted(paletteFile, jsonWithOneTokenPerLine(paletteDocument()));
  const output = new GeneratedOutput({ check, regenerate: 'npm run palette:generate' });
  const changed = output.writeOrCheck(paletteFile, contents);
  output.throwIfStale();
  return changed;
}

if (import.meta.main) {
  const check = process.argv.includes('--check');
  if (process.argv.slice(2).some((argument) => argument !== '--check'))
    throw new Error('Usage: GeneratePalette.ts [--check]');
  const changed = await writePalette({ check });
  console.log(
    check
      ? 'The palette is up to date.'
      : `Generated the palette${changed ? '' : ' (unchanged)'}: ${Object.keys(hues).length} hues.`,
  );
}
