// The work of envui-graphic (envui-graphic.js): trims a picture's empty edges once, when it joins
// an application, so a Graphic's box holds the drawing and no empty space. A PNG, WebP or JPEG is
// cropped to its visible content, past a transparent or one-color border; an SVG keeps its drawing
// and has its viewBox fitted to the drawing's bounds, which are measured by rendering it. Both need
// sharp, which envUI doesn't install: the application adds it as a dev dependency to run this.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const usage = `Usage: npx envui-graphic <file>... [--out <dir>]

Trims a picture's empty edges once, when it joins the application, so envUI's Graphic shows the
drawing at its full size: crops a PNG, WebP or JPEG to its visible content, and fits an SVG's
viewBox to its drawing. Writes <name>-trimmed.<ext> next to the file, or <name>.<ext> into --out,
and prints the Graphic to use. Needs sharp: npm install --save-dev sharp.`;

const rasters = new Set(['.png', '.webp', '.jpg', '.jpeg']);

/** The longest side, in px, an SVG is rendered at to measure its drawing. */
const measureSize = 4096;

/** A failure to report as a message, without a stack. */
class UsageError extends Error {}

/** Reads the command line: the files and --out. */
export function parseArguments(args) {
  const files = [];
  let out;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') return { help: true, files, out };
    if (arg === '--out' || arg.startsWith('--out=')) {
      out = arg === '--out' ? args[(index += 1)] : arg.slice('--out='.length);
      if (!out) throw new UsageError('--out needs a folder, such as --out src/assets.');
    } else if (arg.startsWith('-')) throw new UsageError(`Unknown option ${arg}.\n\n${usage}`);
    else files.push(arg);
  }
  if (files.length === 0) throw new UsageError(usage);
  return { help: false, files, out };
}

/**
 * Where sharp is: the project's own, from the folder the command runs in, else one this package
 * can reach, such as beside it in a workspace. Undefined when neither finds it.
 */
function findSharp(directory) {
  const finders = [
    () => pathToFileURL(createRequire(join(directory, 'package.json')).resolve('sharp')).href,
    () => import.meta.resolve('sharp'),
  ];
  for (const find of finders) {
    try {
      return find();
    } catch {
      // Not there; try the next.
    }
  }
  return undefined;
}

/**
 * sharp, loaded only when the command runs. Without it, the command says what to install; when it
 * is there but fails to load, such as a native binary for another platform, it says why.
 */
export async function loadSharp(directory = process.cwd()) {
  const url = findSharp(directory);
  if (!url)
    throw new UsageError(
      'envui-graphic needs sharp to read pictures, and the project has none. Install it as a dev ' +
        'dependency, such as npm install --save-dev sharp, then run envui-graphic again.',
    );
  try {
    return (await import(url)).default;
  } catch (error) {
    throw new UsageError(`envui-graphic found sharp but couldn't load it: ${error.message}`);
  }
}

/** The numbers of an SVG's viewBox, or of its width and height where it has none. */
function viewBoxOf(root) {
  const attribute = (name) => root.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
  const viewBox = attribute('viewBox');
  if (viewBox) {
    const numbers = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (numbers.length === 4 && numbers.every(Number.isFinite) && numbers[2] > 0 && numbers[3] > 0)
      return numbers;
    throw new UsageError(`its viewBox, "${viewBox}", isn't four numbers with a size.`);
  }
  const length = (name) => {
    const value = attribute(name);
    const match = value?.trim().match(/^(\d*\.?\d+)(px)?$/);
    return match ? Number(match[1]) : undefined;
  };
  const width = length('width');
  const height = length('height');
  if (width > 0 && height > 0) return [0, 0, width, height];
  throw new UsageError('it has no viewBox, nor a width and a height in px to take one from.');
}

/** An SVG's root element with its attributes replaced, removed or added. */
function withAttributes(root, attributes) {
  let result = root;
  for (const [name, value] of Object.entries(attributes)) {
    const pattern = new RegExp(`\\s${name}\\s*=\\s*(["']).*?\\1`, 'i');
    const written = value === undefined ? '' : ` ${name}="${value}"`;
    result = pattern.test(result)
      ? result.replace(pattern, written)
      : result.replace(/^<svg\b/i, `<svg${written}`);
  }
  return result;
}

/** A number for a viewBox, to a ten-thousandth, without trailing zeros. */
const format = (value) => String(Number(value.toFixed(4)));

/**
 * The box the painted pixels of a raw RGBA buffer take, in px to a fraction: the first and last
 * column and row with any alpha, less the part of each edge's pixels the drawing leaves
 * uncovered, read from the most opaque pixel along that edge, as an edge between two pixels is
 * drawn half-transparent. Undefined when every pixel is transparent.
 */
function paintedBounds(data, width, height) {
  const alpha = (x, y) => data[(y * width + x) * 4 + 3];
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1)
      if (alpha(x, y) > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
  if (right < 0) return undefined;
  /** How much of the most covered pixel along a row or a column the drawing covers, 0 to 1. */
  const coverage = (pixels) => Math.max(...pixels) / 255;
  const column = (x) => Array.from({ length: bottom - top + 1 }, (_, i) => alpha(x, top + i));
  const row = (y) => Array.from({ length: right - left + 1 }, (_, i) => alpha(left + i, y));
  return {
    left: left + 1 - coverage(column(left)),
    top: top + 1 - coverage(row(top)),
    right: right + coverage(column(right)),
    bottom: bottom + coverage(row(bottom)),
  };
}

/**
 * Where an SVG's root element starts and ends, and its tag: the first <svg> outside comments,
 * CDATA sections, the doctype and processing instructions, which are blanked out before searching,
 * so their text keeps its place. An attribute's quoted value may hold a >.
 */
export function rootTag(source) {
  const blanked = source.replace(
    /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE(?:[^[>]|\[[\s\S]*?\])*>|<\?[\s\S]*?\?>/gi,
    (text) => ' '.repeat(text.length),
  );
  const match = /<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(blanked);
  if (!match) return undefined;
  const start = match.index;
  const end = start + match[0].length;
  return { start, end, tag: source.slice(start, end) };
}

/** The source with its root tag replaced by another. */
const withRoot = (source, root, tag) => source.slice(0, root.start) + tag + source.slice(root.end);

/**
 * An SVG with its viewBox fitted to its drawing: it is rendered with its viewBox's longest side at
 * 4096 px, and the box of its painted pixels is mapped back to the viewBox's units, so the fit is
 * within about 1/4096 of the picture, strokes, transforms and filters included. A width and a
 * height on the root are removed, since a Graphic gives the size.
 */
export async function trimSvg(source, sharp) {
  const found = rootTag(source);
  if (!found) throw new UsageError('it has no <svg> element.');
  const root = found.tag;
  const [x, y, width, height] = viewBoxOf(root);
  const scale = measureSize / Math.max(width, height);
  const pixels = { width: Math.ceil(width * scale), height: Math.ceil(height * scale) };
  const measured = withRoot(
    source,
    found,
    withAttributes(root, {
      viewBox: [x, y, width, height].join(' '),
      width: pixels.width,
      height: pixels.height,
      preserveAspectRatio: 'xMinYMin meet',
    }),
  );
  const { data, info } = await sharp(Buffer.from(measured))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = paintedBounds(data, info.width, info.height);
  if (!bounds) throw new UsageError('it draws nothing.');
  const fitted = [
    x + bounds.left / scale,
    y + bounds.top / scale,
    (bounds.right - bounds.left) / scale,
    (bounds.bottom - bounds.top) / scale,
  ];
  // Within half a pixel of every edge, the drawing already fills its viewBox.
  const unchanged =
    bounds.left < 0.5 &&
    bounds.top < 0.5 &&
    bounds.right > width * scale - 0.5 &&
    bounds.bottom > height * scale - 0.5;
  const trimmedRoot = withAttributes(root, {
    viewBox: fitted.map(format).join(' '),
    width: undefined,
    height: undefined,
  });
  return {
    unchanged,
    output: Buffer.from(withRoot(source, found, trimmedRoot)),
    before: `viewBox ${[x, y, width, height].map(format).join(' ')}`,
    after: `viewBox ${fitted.map(format).join(' ')}`,
  };
}

/** The quality a JPEG or WebP is written at again after cropping, which sharp can't read back. */
export const reencodeQuality = 95;

/**
 * A PNG, WebP or JPEG cropped to its visible content: sharp's trim, which takes away a border of
 * the top-left pixel's color, transparent or not, in the same format, with its metadata, its
 * orientation and color profile included. A PNG stays lossless; a JPEG or WebP is encoded again,
 * at quality 95, and says so.
 */
export async function trimRaster(source, sharp) {
  const { width, height, format } = await sharp(source).metadata();
  let image = sharp(source).trim().keepMetadata();
  if (format === 'jpeg') image = image.jpeg({ quality: reencodeQuality });
  if (format === 'webp') image = image.webp({ quality: reencodeQuality });
  const { data, info } = await image.toBuffer({ resolveWithObject: true });
  return {
    unchanged: info.width === width && info.height === height,
    reencoded: format === 'jpeg' || format === 'webp',
    output: data,
    before: `${width} × ${height} px`,
    after: `${info.width} × ${info.height} px`,
  };
}

/** A file's name as a JavaScript identifier, such as `logoTrimmed` for logo-trimmed.png. */
export function importName(file) {
  const words = basename(file, extname(file))
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const name = words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
  return /^[A-Za-z]/.test(name) ? name : `image${name[0]?.toUpperCase() ?? ''}${name.slice(1)}`;
}

/**
 * Where a trimmed file goes: into --out under its own name, else beside it as <name>-trimmed. It
 * never replaces the file itself: where --out is the file's own folder, it takes the suffix too.
 */
export function outputPath(file, out) {
  const extension = extname(file);
  const suffixed = `${basename(file, extension)}-trimmed${extension}`;
  if (!out) return join(dirname(file), suffixed);
  const target = join(out, basename(file));
  return resolve(target) === resolve(file) ? join(out, suffixed) : target;
}

/** The lines that tell how to show a file with Graphic. */
function graphicLines(file) {
  const name = importName(file);
  let path = relative(process.cwd(), file).replaceAll('\\', '/');
  if (!path.startsWith('.')) path = `./${path}`;
  return [
    `  import ${name} from '${path}'; // the path from the module that imports it`,
    `  <Graphic src={${name}} alt="" />`,
    "  // alt: what the picture says, such as the company's name, or '' when the text beside it says it",
  ];
}

/** Trims one file and says what it did. */
async function trimFile(file, out, sharp) {
  const extension = extname(file).toLowerCase();
  const isSvg = extension === '.svg';
  if (!isSvg && !rasters.has(extension))
    throw new UsageError(`${file}: envui-graphic trims PNG, WebP, JPEG and SVG files.`);
  let source;
  try {
    source = await readFile(resolve(file));
  } catch {
    throw new UsageError(`${file}: there is no such file.`);
  }
  let result;
  try {
    result = isSvg
      ? await trimSvg(source.toString('utf8'), sharp)
      : await trimRaster(source, sharp);
  } catch (error) {
    if (error instanceof UsageError) throw new UsageError(`${file}: ${error.message}`);
    throw new UsageError(`${file}: sharp couldn't read it (${error.message}).`);
  }
  if (result.unchanged && !out) {
    console.log(`${file} has no empty edges to trim (${result.before}). Show it as it is:`);
    console.log(graphicLines(file).join('\n'));
    return;
  }
  const target = outputPath(file, out);
  await mkdir(resolve(dirname(target)), { recursive: true });
  await writeFile(resolve(target), result.output);
  console.log(`Trimmed ${file}, ${result.before}, to ${result.after}: ${target}. Show it with:`);
  if (result.reencoded)
    console.log(
      `  (encoded again at quality ${reencodeQuality}; keep the original where its exact pixels matter)`,
    );
  console.log(graphicLines(target).join('\n'));
}

/** Runs the command with its arguments, and returns its exit code. */
export async function main(args) {
  try {
    const { help, files, out } = parseArguments(args);
    if (help) {
      console.log(usage);
      return 0;
    }
    const sharp = await loadSharp();
    for (const file of files) await trimFile(file, out, sharp);
    return 0;
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(error.message);
    return 1;
  }
}
