// LineArt's markup: each drawing by its name, covering its box from where it sits, hidden from
// assistive technology unless a label makes it an image, and its lines ready to move in the order
// of each drawing's construction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from './support/importSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { LineArt, lineArtDrawings, lineArtShapes } = await importSource('LineArt', [
  "export { LineArt, lineArtDrawings } from './packages/ui/src/layout/LineArt.tsx';",
  "export { lineArtShapes } from './packages/ui/src/layout/internal/lineArtShapes.tsx';",
]);

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

test('it is hidden and sits at the end on its foot by default, covering its box', () => {
  const markup = renderToStaticMarkup(h(LineArt, { drawing: 'golden-section' }));
  // Its sheet moved so the golden rectangle reaches the box's end and foot.
  assert.match(markup, /^<svg viewBox="-14 -30 480 330" preserveAspectRatio="xMaxYMax slice"/);
  assert.match(
    renderToStaticMarkup(h(LineArt, { drawing: 'monochord' })),
    /^<svg viewBox="0 0 480 330"/,
  );
  assert.match(markup, /aria-hidden="true"/);
  assert.doesNotMatch(markup, /role=|aria-label/);
  assert.match(markup, /class="env-line-art" data-drawing="golden-section" data-align="end"/);
});

test('it sits at the start or in the centre, and a label makes it an image', () => {
  assert.match(
    renderToStaticMarkup(h(LineArt, { drawing: 'monochord', align: 'start' })),
    /preserveAspectRatio="xMinYMax slice"[^>]*data-align="start"/,
  );
  assert.match(
    renderToStaticMarkup(h(LineArt, { drawing: 'monochord', align: 'center' })),
    /preserveAspectRatio="xMidYMax slice"/,
  );
  const labelled = renderToStaticMarkup(
    h(LineArt, { drawing: 'pappus-chain', label: 'A chain of circles', className: 'hero' }),
  );
  assert.match(labelled, /role="img" aria-label="A chain of circles"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  assert.match(labelled, /class="env-line-art hero"/);
});

test("each drawing's order moves every one of its lines once, in beats", () => {
  for (const drawing of lineArtDrawings) {
    const markup = renderToStaticMarkup(h(LineArt, { drawing }));
    const count = (markup.match(/<(rect|circle|line|polygon|path) /g) ?? []).length;
    const order = lineArtShapes[drawing].order.flat();
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      Array.from({ length: count }, (_, index) => index),
      `${drawing} orders each of its ${count} lines once`,
    );
    assert.ok(lineArtShapes[drawing].order.length >= 4, `${drawing} draws in at least four beats`);
  }
});

test('in motion, each line is one long and starts at its place in the order', () => {
  const still = renderToStaticMarkup(h(LineArt, { drawing: 'monochord' }));
  assert.doesNotMatch(still, /pathLength|data-motion|--env-line-art-at/);
  for (const motion of ['appear', 'disappear', 'play', 'loop']) {
    const markup = renderToStaticMarkup(h(LineArt, { drawing: 'monochord', motion }));
    assert.match(markup, new RegExp(`data-motion="${motion}"`));
    assert.equal(
      /data-turn="in"/.test(markup),
      motion === 'loop',
      `${motion} turns only in a loop`,
    );
    const lines = markup.match(/<(rect|circle|line|polygon|path) [^>]*>/g);
    assert.ok(lines.every((line) => /pathLength="1"/.test(line)));
    // Monochord's string first, then its ends, the arc over the whole and each stop with its arc.
    const at = lines.map((line) => Number(/--env-line-art-at:\s*([\d.]+)/.exec(line)[1]));
    assert.deepEqual(at, [0, 0.2, 0.2, 0.4, 0.6, 0.6, 0.8, 0.8, 1, 1]);
  }
});
