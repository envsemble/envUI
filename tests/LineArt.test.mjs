// LineArt's markup: each drawing by its name, covering its box from where it sits, hidden from
// assistive technology unless a label makes it an image.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/LineArt.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: "export { LineArt, lineArtDrawings } from './packages/ui/src/layout/LineArt.tsx';",
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: output,
  logLevel: 'error',
});
const { LineArt, lineArtDrawings } = await import(pathToFileURL(output).href);

test('sixteen drawings, each named in kebab case and drawn in lines of its own', () => {
  assert.equal(lineArtDrawings.length, 16);
  assert.equal(new Set(lineArtDrawings).size, 16);
  const drawn = new Set();
  for (const drawing of lineArtDrawings) {
    assert.match(drawing, /^[a-z]+(-[a-z]+)*$/);
    const markup = renderToStaticMarkup(h(LineArt, { drawing }));
    const shapes = markup.match(/<(rect|circle|line|polygon|path) [^>]*>/g) ?? [];
    assert.ok(shapes.length >= 5, `${drawing} draws ${shapes.length} lines`);
    drawn.add(shapes.join(''));
  }
  assert.equal(drawn.size, 16, 'no two drawings are the same');
});

test('it is hidden and sits at the end by default, covering its box', () => {
  const markup = renderToStaticMarkup(h(LineArt, { drawing: 'golden-section' }));
  assert.match(markup, /^<svg viewBox="0 0 480 330" preserveAspectRatio="xMaxYMid slice"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.doesNotMatch(markup, /role=|aria-label/);
  assert.match(markup, /class="env-line-art" data-drawing="golden-section" data-align="end"/);
});

test('it sits at the start or in the centre, and a label makes it an image', () => {
  assert.match(
    renderToStaticMarkup(h(LineArt, { drawing: 'monochord', align: 'start' })),
    /preserveAspectRatio="xMinYMid slice"[^>]*data-align="start"/,
  );
  assert.match(
    renderToStaticMarkup(h(LineArt, { drawing: 'monochord', align: 'center' })),
    /preserveAspectRatio="xMidYMid slice"/,
  );
  const labelled = renderToStaticMarkup(
    h(LineArt, { drawing: 'pappus-chain', label: 'A chain of circles', className: 'hero' }),
  );
  assert.match(labelled, /role="img" aria-label="A chain of circles"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  assert.match(labelled, /class="env-line-art hero"/);
});
