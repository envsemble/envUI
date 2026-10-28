// Readable code colors, computed where the code themes load: whichever version of the themes
// an application installs, each token color that falls short of a contrast on code's background is
// moved, by its OKLCH lightness alone, to the closest color that reaches it. Small enough to ship:
// sRGB, OKLab and WCAG contrast, without a color library.

type Rgb = [number, number, number];
type Lab = [number, number, number];

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const fromLinear = (channel: number) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

/** A hex color as sRGB channels from 0 to 1; #rgb and #rrggbb, with any alpha ignored. */
function parseHex(hex: string): Rgb {
  let digits = hex.replace('#', '');
  if (digits.length <= 4) digits = [...digits].map((digit) => digit + digit).join('');
  return [0, 2, 4].map((start) => Number.parseInt(digits.slice(start, start + 2), 16) / 255) as Rgb;
}

const formatHex = (rgb: Rgb) =>
  `#${rgb
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

/** The relative luminance of a color, as WCAG defines it. */
function luminance(color: string) {
  const [r, g, b] = parseHex(color).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio of two colors. */
export function contrastRatio(a: string, b: string) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function toOklab(color: string): Lab {
  const [r, g, b] = parseHex(color).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab to linear sRGB, which may fall outside 0–1 for a color outside the gamut. */
function oklabToLinear([lightness, a, b]: Lab): Rgb {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/**
 * The color of an OKLCH lightness, chroma and hue, with its chroma lowered as far as it must be to
 * fit sRGB at that lightness; the hue stays.
 */
function fromOklch(lightness: number, chroma: number, hue: number) {
  const at = (c: number): Lab => [lightness, c * Math.cos(hue), c * Math.sin(hue)];
  let fits = 0;
  let misses = chroma;
  if (inGamut(oklabToLinear(at(chroma)))) fits = chroma;
  else
    for (let step = 0; step < 14; step += 1) {
      const middle = (fits + misses) / 2;
      if (inGamut(oklabToLinear(at(middle)))) fits = middle;
      else misses = middle;
    }
  return formatHex(oklabToLinear(at(fits)).map(fromLinear) as Rgb);
}

/** A color at an opacity over a background, as the browser composites it. */
export function over(color: string, alpha: number, background: string) {
  const [top, bottom] = [parseHex(color), parseHex(background)];
  return formatHex(
    top.map((channel, index) => channel * alpha + bottom[index]! * (1 - alpha)) as Rgb,
  );
}

/** The distance of two colors in OKLab, about 0.02 for a difference people just notice. */
function colorDistance(a: string, b: string) {
  const [x, y] = [toOklab(a), toOklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/** Which way a color moves to stand out: darker on a light background, lighter on a dark one. */
export type Direction = 'darker' | 'lighter';

/**
 * The color closest to `color` that reaches `target` against every background: the same OKLCH hue,
 * at the lightness nearest its own that reaches it, with the chroma the gamut allows there. `beyond`
 * is the lightness, if any, it must at least move past.
 */
function readableColor(
  color: string,
  backgrounds: readonly string[],
  target: number,
  direction: Direction,
  beyond?: number,
) {
  const reachesTarget = (candidate: string) =>
    backgrounds.every((background) => contrastRatio(candidate, background) >= target);
  if (beyond === undefined && reachesTarget(color)) return color;
  const [lightness, a, b] = toOklab(color);
  // A grey keeps no chroma, rather than the rounding error of its conversion.
  const chroma = Math.hypot(a, b) < 1e-4 ? 0 : Math.hypot(a, b);
  const hue = Math.atan2(b, a);
  const at = (l: number) => fromOklch(l, chroma, hue);
  const passes = (l: number) =>
    reachesTarget(at(l)) &&
    (beyond === undefined || (direction === 'darker' ? l <= beyond : l >= beyond));
  // Lightness that passes, and lightness that does not; the answer lies between.
  let reaches = direction === 'darker' ? 0 : 1;
  let misses = lightness;
  for (let step = 0; step < 20; step += 1) {
    const middle = (reaches + misses) / 2;
    if (passes(middle)) reaches = middle;
    else misses = middle;
  }
  return at(reaches);
}

/**
 * The color nearest `color` that `accepts`: itself if it does, or else the same OKLCH hue, moved in
 * `direction` to the lightness nearest its own that it accepts, with the chroma the gamut allows
 * there. `accepts` must hold at the far end, black or white, and at every lightness beyond one it
 * holds at.
 */
export function nearestColor(
  color: string,
  accepts: (candidate: string) => boolean,
  direction: Direction,
) {
  if (accepts(color)) return color;
  const [lightness, a, b] = toOklab(color);
  const chroma = Math.hypot(a, b) < 1e-4 ? 0 : Math.hypot(a, b);
  const hue = Math.atan2(b, a);
  const at = (l: number) => fromOklch(l, chroma, hue);
  let reaches = direction === 'darker' ? 0 : 1;
  let misses = lightness;
  for (let step = 0; step < 20; step += 1) {
    const middle = (reaches + misses) / 2;
    if (accepts(at(middle))) reaches = middle;
    else misses = middle;
  }
  return at(reaches);
}

/**
 * Readable replacements for the colors of a theme that fall short of `target` against its
 * backgrounds, as a map from each lowercase original to its replacement. Replacements of colors
 * that were distinct are kept apart by `minimumDistance` in OKLab, or by their original distance
 * if that was smaller, so that tokens do not merge; one that would land too near another moves
 * further. Colors move in order, the one furthest from the target first, so they keep their order
 * of lightness.
 */
export function readableReplacements(
  colors: readonly string[],
  backgrounds: readonly string[],
  target: number,
  direction: Direction,
  minimumDistance = 0.02,
) {
  const originals = [...new Set(colors.map((color) => color.toLowerCase()))];
  const lightness = (color: string) => toOklab(color)[0];
  const short = originals
    .filter((color) => backgrounds.some((background) => contrastRatio(color, background) < target))
    .sort((x, y) =>
      direction === 'darker' ? lightness(y) - lightness(x) : lightness(x) - lightness(y),
    );
  const final = new Map(originals.map((color) => [color, color]));
  for (const color of short) final.delete(color);
  const tooNear = (color: string, candidate: string) =>
    [...final].find(
      ([original, placed]) =>
        colorDistance(placed, candidate) <
        Math.min(minimumDistance, colorDistance(original, color)),
    );
  const replacements: Record<string, string> = {};
  for (const color of short) {
    let candidate = readableColor(color, backgrounds, target, direction);
    // Past the colors it lands too near, a step at a time, within the gamut.
    for (let attempt = 0; attempt < 20 && tooNear(color, candidate); attempt += 1) {
      const step = direction === 'darker' ? -minimumDistance : minimumDistance;
      const next = Math.min(1, Math.max(0, lightness(candidate) + step));
      candidate = readableColor(color, backgrounds, target, direction, next);
    }
    final.set(color, candidate);
    if (candidate !== color) replacements[color] = candidate;
  }
  return replacements;
}
