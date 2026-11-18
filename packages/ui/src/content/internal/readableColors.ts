type Rgb = [number, number, number];
type Lab = [number, number, number];

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const fromLinear = (channel: number) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

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

function luminance(color: string) {
  const [r, g, b] = parseHex(color).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

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

const gamutTolerance = 1e-4;
const inGamut = (rgb: Rgb) =>
  rgb.every((channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance);

const greyConversionError = 1e-4;
const chromaOf = (a: number, b: number) => {
  const chroma = Math.hypot(a, b);
  return chroma < greyConversionError ? 0 : chroma;
};

const chromaSearchSteps = 14;
const lightnessSearchSteps = 20;
const maxSpacingAttempts = 20;
const justNoticeableDistance = 0.02;

function fromOklch(lightness: number, chroma: number, hue: number) {
  const at = (c: number): Lab => [lightness, c * Math.cos(hue), c * Math.sin(hue)];
  let fits = 0;
  let misses = chroma;
  if (inGamut(oklabToLinear(at(chroma)))) fits = chroma;
  else
    for (let step = 0; step < chromaSearchSteps; step += 1) {
      const middle = (fits + misses) / 2;
      if (inGamut(oklabToLinear(at(middle)))) fits = middle;
      else misses = middle;
    }
  return formatHex(oklabToLinear(at(fits)).map(fromLinear) as Rgb);
}

export function scaleChroma(color: string, factor: number) {
  const [lightness, a, b] = toOklab(color);
  return fromOklch(lightness, Math.hypot(a, b) * factor, Math.atan2(b, a));
}

export function over(color: string, alpha: number, background: string) {
  const [top, bottom] = [parseHex(color), parseHex(background)];
  return formatHex(
    top.map((channel, index) => channel * alpha + bottom[index] * (1 - alpha)) as Rgb,
  );
}

function colorDistance(a: string, b: string) {
  const [x, y] = [toOklab(a), toOklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

export type LightnessDirection = 'darker' | 'lighter';

function readableColor(
  color: string,
  backgrounds: readonly string[],
  target: number,
  direction: LightnessDirection,
  mustMovePast?: number,
) {
  const reachesTarget = (candidate: string) =>
    backgrounds.every((background) => contrastRatio(candidate, background) >= target);
  if (mustMovePast === undefined && reachesTarget(color)) return color;
  const [lightness, a, b] = toOklab(color);
  const chroma = chromaOf(a, b);
  const hue = Math.atan2(b, a);
  const at = (l: number) => fromOklch(l, chroma, hue);
  const passes = (l: number) =>
    reachesTarget(at(l)) &&
    (mustMovePast === undefined ||
      (direction === 'darker' ? l <= mustMovePast : l >= mustMovePast));
  let reaches = direction === 'darker' ? 0 : 1;
  let misses = lightness;
  for (let step = 0; step < lightnessSearchSteps; step += 1) {
    const middle = (reaches + misses) / 2;
    if (passes(middle)) reaches = middle;
    else misses = middle;
  }
  return at(reaches);
}

export function nearestColor(
  color: string,
  accepts: (candidate: string) => boolean,
  direction: LightnessDirection,
) {
  if (accepts(color)) return color;
  const [lightness, a, b] = toOklab(color);
  const chroma = chromaOf(a, b);
  const hue = Math.atan2(b, a);
  const at = (l: number) => fromOklch(l, chroma, hue);
  let reaches = direction === 'darker' ? 0 : 1;
  let misses = lightness;
  for (let step = 0; step < lightnessSearchSteps; step += 1) {
    const middle = (reaches + misses) / 2;
    if (accepts(at(middle))) reaches = middle;
    else misses = middle;
  }
  return at(reaches);
}

export function readableReplacements(
  colors: readonly string[],
  backgrounds: readonly string[],
  target: number,
  direction: LightnessDirection,
  minimumDistance = justNoticeableDistance,
) {
  const originals = [...new Set(colors.map((color) => color.toLowerCase()))];
  const lightness = (color: string) => toOklab(color)[0];
  const furthestFromTargetFirst = (x: string, y: string) =>
    direction === 'darker' ? lightness(y) - lightness(x) : lightness(x) - lightness(y);
  const shortOfTarget = originals
    .filter((color) => backgrounds.some((background) => contrastRatio(color, background) < target))
    .sort(furthestFromTargetFirst);
  const placed = new Map(originals.map((color) => [color, color]));
  for (const color of shortOfTarget) placed.delete(color);
  const tooNear = (color: string, candidate: string) =>
    [...placed].find(
      ([original, placedColor]) =>
        colorDistance(placedColor, candidate) <
        Math.min(minimumDistance, colorDistance(original, color)),
    );
  const replacements: Record<string, string> = {};
  for (const color of shortOfTarget) {
    let candidate = readableColor(color, backgrounds, target, direction);
    for (let attempt = 0; attempt < maxSpacingAttempts && tooNear(color, candidate); attempt += 1) {
      const step = direction === 'darker' ? -minimumDistance : minimumDistance;
      const nextLightnessWithinGamut = Math.min(1, Math.max(0, lightness(candidate) + step));
      candidate = readableColor(color, backgrounds, target, direction, nextLightnessWithinGamut);
    }
    placed.set(color, candidate);
    if (candidate !== color) replacements[color] = candidate;
  }
  return replacements;
}
