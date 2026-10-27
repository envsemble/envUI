// TableOfContents: the outline it builds from headings, the current section it finds from where
// the page has scrolled, the shape that marks the reader's place and the springs it moves on, and
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
  swellAt,
  springStep,
  springAtRest,
  waveReach,
  wavePath,
  wavePlace,
  waveThin,
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

test('the shape stays on the current entry, then glides on to the next as it nears', () => {
  assert.equal(wavePlace(2), 2);
  assert.equal(wavePlace(2.4), 2);
  assert.equal(wavePlace(2.75), 2.5);
  assert.ok(wavePlace(2.9) > 2.8 && wavePlace(2.9) < 3);
  assert.equal(wavePlace(3), 3);
});

test("the shape swells at the reader's place, half 0.9 entries away, and none two and a half away", () => {
  assert.equal(swellAt(4, 4, []), 1);
  assert.ok(Math.abs(swellAt(4.9, 4, []) - 0.5) < 0.01);
  assert.ok(swellAt(4.5, 4, []) > 0.85);
  assert.ok(swellAt(6, 4, []) < 0.02);
  assert.equal(swellAt(6.5, 4, []), 0);
  assert.equal(swellAt(0, 4, []), 0);
  // The entry under the pointer swells it a little, by how far its swell has grown.
  assert.ok(swellAt(0, 4, [1]) > 0.3 && swellAt(0, 4, [1]) < 0.5);
  assert.ok(swellAt(0, 4, [0.5]) < swellAt(0, 4, [1]));
  assert.equal(swellAt(0, null, []), 0);
  // In a short list, the bulge is shorter, so the thin stroke still shows.
  assert.equal(waveReach(12), 1);
  assert.equal(waveReach(3), 0.5);
  assert.ok(swellAt(4.9, 4, [], undefined, 0.5) < 0.2);
});

test('moving, the bulge leans back and stretches; landing, it squashes a little past its fullest', () => {
  const lean = { lean: 0.5, stretch: 0 };
  // Moving down, its upper side is drawn out and its lower side drawn in.
  assert.ok(swellAt(2.5, 4, [], lean) > swellAt(2.5, 4, []));
  assert.ok(swellAt(5.5, 4, [], lean) < swellAt(5.5, 4, []));
  // Stretched, taller and thinner; squashed, shorter and fuller, never more than 8% past.
  const stretched = { lean: 0, stretch: 0.6 };
  assert.ok(swellAt(4, 4, [], stretched) < 1);
  assert.ok(swellAt(6, 4, [], stretched) > swellAt(6, 4, []));
  const squashed = { lean: 0, stretch: -1 };
  assert.ok(swellAt(4, 4, [], squashed) > 1 && swellAt(4, 4, [], squashed) <= 1.05);
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
  // A push, such as its carrier slowing, moves it off its target.
  const pushed = { value: 0, velocity: 0 };
  springStep(pushed, 0, 18, 0.4, 0.05, { push: -100 });
  assert.ok(pushed.value < 0);
});

test("the shape's outline is straight at its start, widest beside the reader's place, with round ends", () => {
  const layout = { anchors: [10, 40, 70, 100, 130, 160], top: 4, bottom: 166, full: 12 };
  const path = wavePath(layout, 2, []);
  const edge = [...path.matchAll(/L([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const widest = Math.max(...edge.map(([x]) => x));
  assert.equal(widest, 12);
  // Its fullest is a short run, round at the top, centred beside the place.
  const run = edge.filter(([x]) => x === widest).map(([, y]) => y);
  assert.ok(Math.abs((Math.min(...run) + Math.max(...run)) / 2 - 70) <= 1);
  // Three entries away, as thin as it gets: a tenth of its fullest.
  assert.ok(Math.abs(Math.min(...edge.map(([x]) => x)) - 12 * waveThin) < 0.01);
  // It starts and ends at the box's start: the closing edge is straight down it.
  assert.match(path, /^M0 [\d.]+A[^L]*L.*A[\d. ]+ 0 0 1 0 [\d.]+Z$/);
  assert.equal((path.match(/A/g) ?? []).length, 2);
  assert.equal(wavePath({ ...layout, anchors: [] }, 0, []), '');
});
