import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readFile, mkdtemp, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  importName,
  outputPath,
  parseArguments,
  rootTag,
  trimRaster,
  trimSvg,
} from '../../packages/ui/bin/trimGraphic.js';

// envui-graphic, the library's command that trims a picture's empty edges, on the files in
// tests/graphic: an SVG with empty space in its viewBox, one whose stroke and transform reach past
// its path, and PNG, JPEG and WebP files with a transparent or white border.

const fixtures = fileURLToPath(new URL('../graphic/', import.meta.url));
const bin = fileURLToPath(new URL('../../packages/ui/bin/envui-graphic.js', import.meta.url));
let scratch;

before(async () => {
  scratch = await mkdtemp(join(tmpdir(), 'envui-graphic-'));
  await cp(fixtures, scratch, { recursive: true });
});
after(async () => {
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

/** The four numbers of an SVG's viewBox. */
const viewBox = (svg) =>
  svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(' ')
    .map(Number);

/** Whether each number is within a tolerance of the one expected. */
function assertClose(actual, expected, tolerance, message) {
  assert.equal(actual.length, expected.length, message);
  actual.forEach((value, index) =>
    assert.ok(
      Math.abs(value - expected[index]) <= tolerance,
      `${message}: ${actual.join(' ')} is not ${expected.join(' ')}`,
    ),
  );
}

test("an SVG's viewBox is fitted to its drawing, and its width and height go", async () => {
  const source = await readFile(join(fixtures, 'padded-logo.svg'), 'utf8');
  const { output, unchanged } = await trimSvg(source, sharp);
  const svg = output.toString('utf8');
  assert.equal(unchanged, false);
  assertClose(viewBox(svg), [28, 28, 64, 64], 0.05, 'the rect and the circle inside it');
  assert.doesNotMatch(svg.match(/<svg[^>]*>/)[0], /\s(width|height)=/);
  // The drawing itself is kept as it was.
  assert.ok(svg.includes('<rect x="28" y="28" width="64" height="64" fill="#0d9488"/>'));
});

test("an SVG's bounds count its strokes and transforms, and a trimmed SVG stays as it is", async () => {
  const source = await readFile(join(fixtures, 'stroked-line.svg'), 'utf8');
  const { output } = await trimSvg(source, sharp);
  // The path runs from 20 to 60 across, moved 10 right and 20 down, in a stroke 10 wide.
  assertClose(viewBox(output.toString('utf8')), [30, 35, 40, 10], 0.05, 'the stroked line');
  const again = await trimSvg(output.toString('utf8'), sharp);
  assert.equal(again.unchanged, true);
});

test('the root element is found past comments, CDATA and the doctype that mention <svg>', async () => {
  const source = [
    '<?xml version="1.0"?>',
    `<!DOCTYPE svg [ <!ENTITY a "<svg viewBox='0 0 1 1'>"> ]>`,
    '<!-- exported from <svg viewBox="0 0 9 9"> -->',
    '<svg xmlns="http://www.w3.org/2000/svg" data-note="a > b" viewBox="0 0 120 120">',
    '<style><![CDATA[ /* <svg viewBox="0 0 5 5"> */ ]]></style>',
    '<rect x="28" y="28" width="64" height="64"/></svg>',
  ].join('\n');
  assert.match(rootTag(source).tag, /data-note="a > b" viewBox="0 0 120 120">$/);
  const svg = (await trimSvg(source, sharp)).output.toString('utf8');
  assertClose(viewBox(svg.slice(rootTag(svg).start)), [28, 28, 64, 64], 0.05, 'the real root');
  // The comment keeps what it said.
  assert.ok(svg.includes('<!-- exported from <svg viewBox="0 0 9 9"> -->'));
});

test('an SVG that draws nothing, or has no size, is refused with the reason', async () => {
  await assert.rejects(
    trimSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>', sharp),
    /draws nothing/,
  );
  await assert.rejects(
    trimSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4"/></svg>', sharp),
    /no viewBox/,
  );
});

test('a PNG loses its transparent border, and a JPEG and a WebP their white one', async () => {
  const png = await trimRaster(await readFile(join(fixtures, 'padded-logo.png')), sharp);
  assert.deepEqual(
    await sharp(png.output)
      .metadata()
      .then(({ width, height, format }) => [width, height, format]),
    [64, 64, 'png'],
  );
  for (const [file, format] of [
    ['white-border.jpg', 'jpeg'],
    ['white-border.webp', 'webp'],
  ]) {
    const trimmed = await trimRaster(await readFile(join(fixtures, file)), sharp);
    const { width, height, format: written } = await sharp(trimmed.output).metadata();
    assert.equal(written, format, file);
    // The dark 40 by 20 px block, give or take a pixel of the JPEG's blur.
    assertClose([width, height], [40, 20], 1, file);
  }
});

test('a cropped JPEG keeps its orientation and metadata, and is said to be encoded again', async () => {
  const turned = await sharp(await readFile(join(fixtures, 'white-border.jpg')))
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  const trimmed = await trimRaster(turned, sharp);
  assert.equal(trimmed.reencoded, true);
  assert.equal((await sharp(trimmed.output).metadata()).orientation, 6);
  const png = await trimRaster(await readFile(join(fixtures, 'padded-logo.png')), sharp);
  assert.equal(png.reencoded, false);
});

test('the command writes the trimmed file beside the original or into --out, and prints the Graphic', () => {
  const run = (...args) =>
    execFileSync(process.execPath, [bin, ...args], { cwd: scratch, encoding: 'utf8' });
  const beside = run('padded-logo.png');
  assert.match(beside, /Trimmed padded-logo\.png, 120 × 120 px, to 64 × 64 px/);
  assert.match(beside, /import paddedLogoTrimmed from '\.\/padded-logo-trimmed\.png'/);
  assert.match(beside, /<Graphic src=\{paddedLogoTrimmed\} alt="" \/>/);
  const out = run('padded-logo.svg', '--out', 'assets');
  assert.match(out, /import paddedLogo from '\.\/assets\/padded-logo\.svg'/);
  assert.match(run('assets/padded-logo.svg'), /has no empty edges to trim/);
  assert.throws(() => run('notes.txt'), /trims PNG, WebP, JPEG and SVG files/);
  run('padded-logo.png', '--out', '.');
  assert.deepEqual(
    readFileSync(join(scratch, 'padded-logo.png')),
    readFileSync(join(fixtures, 'padded-logo.png')),
  );
});

test('the command reads its arguments and names files for an import', () => {
  assert.deepEqual(parseArguments(['logo.png', '--out=dist']), {
    help: false,
    files: ['logo.png'],
    out: 'dist',
  });
  assert.throws(() => parseArguments([]), /Usage: npx envui-graphic/);
  assert.throws(() => parseArguments(['--outline']), /Unknown option --outline/);
  assert.equal(importName('src/Acme Logo@2x.png'), 'acmeLogo2x');
  assert.equal(importName('2024-mark.svg'), 'image2024Mark');
  assert.equal(outputPath(join('a', 'logo.svg')), join('a', 'logo-trimmed.svg'));
  assert.equal(outputPath('logo.svg', 'out'), join('out', 'logo.svg'));
  // --out naming the file's own folder never replaces the file.
  assert.equal(outputPath(join('a', 'logo.svg'), 'a'), join('a', 'logo-trimmed.svg'));
});
