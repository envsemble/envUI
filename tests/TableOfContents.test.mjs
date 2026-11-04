// TableOfContents: the outline it builds from headings, the current section it finds from where
// the page has scrolled, the mark of the reader's place and the springs it moves on, and
// its server markup, which lists the sections given as items and marks none until the page
// hydrates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/TableOfContents.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export { TableOfContents } from './packages/ui/src/navigation/TableOfContents.tsx';",
      "export * from './packages/ui/src/navigation/internal/contentsOutline.ts';",
      "export * from './packages/ui/src/navigation/internal/contentsWave.ts';",
      "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
    ].join('\n'),
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  // The style sheets the modules import are the browser's concern.
  loader: { '.css': 'empty' },
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: output,
  logLevel: 'error',
});
const {
  TableOfContents,
  EnvUIProvider,
  outline,
  flatten,
  slug,
  uniqueId,
  currentSection,
  springStep,
  springAtRest,
  markExtent,
  markPath,
  trackPath,
  trackShare,
} = await import(pathToFileURL(output).href);

test('headings nest under the last heading above them of a lower level', () => {
  const items = outline([
    { id: 'a', label: 'A', level: 3 },
    { id: 'b', label: 'B', level: 2 },
    { id: 'c', label: 'C', level: 3 },
    { id: 'd', label: 'D', level: 4 },
    { id: 'e', label: 'E', level: 3 },
    { id: 'f', label: 'F', level: 2 },
  ]);
  assert.deepEqual(items, [
    { id: 'a', label: 'A' },
    {
      id: 'b',
      label: 'B',
      children: [
        { id: 'c', label: 'C', children: [{ id: 'd', label: 'D' }] },
        { id: 'e', label: 'E' },
      ],
    },
    { id: 'f', label: 'F' },
  ]);
  assert.deepEqual(
    flatten(items).map(({ id, depth }) => `${id}${depth}`),
    ['a0', 'b0', 'c1', 'd2', 'e1', 'f0'],
  );
});

test('a heading without an id gets one from its words, unique on the page', () => {
  assert.equal(slug('Invite your team'), 'invite-your-team');
  assert.equal(slug('  Données & réglages! '), 'donnees-reglages');
  assert.equal(slug('?!'), 'section');
  const taken = new Set(['setup', 'setup-2']);
  assert.equal(
    uniqueId('setup', (id) => taken.has(id)),
    'setup-3',
  );
  assert.equal(
    uniqueId('usage', (id) => taken.has(id)),
    'usage',
  );
});

test('the current section is the last past the reading line, the first at the top', () => {
  // The line is a quarter of the way down: 200 px.
  const view = { height: 800, scrolled: 1000, range: 5000 };
  const sections = [
    { id: 'one', top: -900 },
    { id: 'two', top: 150 },
    { id: 'three', top: 300 },
  ];
  assert.equal(currentSection(sections, view), 'two');
  const below = [
    { id: 'one', top: 400 },
    { id: 'two', top: 900 },
  ];
  assert.equal(currentSection(below, view), 'one');
  assert.equal(currentSection([], view), undefined);
  // A page that doesn't scroll: the first.
  const still = { height: 800, scrolled: 0, range: 0 };
  assert.equal(
    currentSection(
      [
        { id: 'one', top: 0 },
        { id: 'two', top: 300 },
      ],
      still,
    ),
    'one',
  );
});

test('sections too short to reach the line take turns over the last of the scrolling', () => {
  // 1000 px to scroll in all. a reaches the 200 px line after 200 px; b, c and d, which start at
  // 1600, 1700 and 1750 px, never do, so they share the 800 px after that: 467, 733 and 1000.
  const at = (scrolled) =>
    currentSection(
      [
        { id: 'a', top: 400 - scrolled },
        { id: 'b', top: 1600 - scrolled },
        { id: 'c', top: 1700 - scrolled },
        { id: 'd', top: 1750 - scrolled },
      ],
      { height: 800, scrolled, range: 1000 },
    );
  assert.equal(at(100), 'a');
  assert.equal(at(450), 'a');
  assert.equal(at(480), 'b');
  assert.equal(at(750), 'c');
  assert.equal(at(1000), 'd');
});

test('the server renders the sections given as items, nested, and marks none current', () => {
  const markup = renderToStaticMarkup(
    h(TableOfContents, {
      items: [
        { id: 'setup', label: 'Setup', children: [{ id: 'install', label: 'Install' }] },
        { id: 'usage', label: 'Usage' },
      ],
    }),
  );
  assert.match(markup, /^<nav aria-label="On this page" class="env-table-of-contents">/);
  assert.match(
    markup,
    /href="#setup">Setup<\/a><ol class="env-table-of-contents-list" style="--env-table-of-contents-depth:1"><li class="env-table-of-contents-item"><a class="env-table-of-contents-link" href="#install">Install<\/a><\/li><\/ol><\/li>/,
  );
  assert.match(markup, /href="#usage">Usage<\/a>/);
  assert.doesNotMatch(markup, /aria-current|data-passed/);
});

test('without items, the server renders the landmark hidden, named in the provider language', () => {
  const markup = renderToStaticMarkup(
    h(
      EnvUIProvider,
      { messages: { tableOfContents: { label: 'Auf dieser Seite' } } },
      h(TableOfContents),
    ),
  );
  assert.match(
    markup,
    /<nav aria-label="Auf dieser Seite" class="env-table-of-contents" hidden="">/,
  );
  assert.doesNotMatch(markup, /<a /);
});

// Four entries, the third on two lines.
const layout = {
  entries: [
    { top: 4, bottom: 24 },
    { top: 32, bottom: 52 },
    { top: 60, bottom: 100 },
    { top: 108, bottom: 128 },
  ],
  full: 6,
};

test("at rest the pill runs beside the current entry's text, the same above and below", () => {
  assert.deepEqual(markExtent(layout, 0), { top: 4, bottom: 24 });
  assert.deepEqual(markExtent(layout, 2), { top: 60, bottom: 100 });
  // On its way, in proportion between two entries.
  assert.deepEqual(markExtent(layout, 1.5), { top: 46, bottom: 76 });
  // Never past the list.
  assert.deepEqual(markExtent(layout, 7), { top: 108, bottom: 128 });
  // Drawn out behind it as it travels, down or up, but not past the list.
  const spacing = (128 - 4) / 4;
  assert.deepEqual(markExtent(layout, 2, 0.5), { top: 60 - spacing / 2, bottom: 100 });
  assert.deepEqual(markExtent(layout, 2, -0.5), { top: 60, bottom: 100 + spacing / 2 });
  assert.deepEqual(markExtent(layout, 0, 0.5), { top: 4, bottom: 24 });
});

test('the pill and the track are rounded and centred in their column, the track the whole list', () => {
  // The pill as wide as the column, with four round corners.
  assert.equal(
    markPath(layout, 2),
    'M3 60H3A3 3 0 0 1 6 63V97A3 3 0 0 1 3 100H3A3 3 0 0 1 0 97V63A3 3 0 0 1 3 60Z',
  );
  // The track a third as wide, centred under it, from the first entry's text to the last one's.
  assert.equal(trackShare, 1 / 3);
  assert.equal(
    trackPath(layout),
    'M3 4H3A1 1 0 0 1 4 5V127A1 1 0 0 1 3 128H3A1 1 0 0 1 2 127V5A1 1 0 0 1 3 4Z',
  );
  // No place, no pill; no entries, neither.
  assert.equal(markPath(layout, null), '');
  assert.equal(trackPath({ entries: [], full: 6 }), '');
  assert.equal(markPath({ entries: [], full: 6 }, 0), '');
});

test('a spring overshoots a little when underdamped, never when critically damped, and rests', () => {
  const peak = (damping) => {
    const spring = { value: 0, velocity: 0 };
    let most = 0;
    for (let frame = 0; frame < 120; frame += 1) {
      springStep(spring, 1, 20, damping, 1 / 60);
      most = Math.max(most, spring.value);
    }
    return [most, spring];
  };
  const [under, rested] = peak(0.5);
  assert.ok(under > 1.1 && under < 1.25);
  assert.ok(springAtRest(rested, 1, 0.002));
  const [critical] = peak(1);
  assert.ok(critical <= 1);
  // A long frame is stepped in small steps, so it lands where short frames do.
  const long = { value: 0, velocity: 0 };
  const short = { value: 0, velocity: 0 };
  springStep(long, 1, 20, 0.7, 0.048);
  for (let frame = 0; frame < 3; frame += 1) springStep(short, 1, 20, 0.7, 0.016);
  assert.ok(Math.abs(long.value - short.value) < 0.01);
});
