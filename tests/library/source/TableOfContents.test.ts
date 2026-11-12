// TableOfContents: the outline it builds from headings, the current section it finds from where
// the page has scrolled, the shape that marks the reader's place and the glide it moves on, and
// its server markup, which lists the sections given as items and marks none until the page
// hydrates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const {
  TableOfContents,
  EnvUIProvider,
  outline,
  flatten,
  slug,
  uniqueId,
  currentSection,
  swellAt,
  glideAt,
  glideTo,
  glideStep,
  waveReach,
  wavePath,
  waveThin,
} = await importSource('TableOfContents', [
  "export { TableOfContents } from './packages/ui/src/navigation/TableOfContents.tsx';",
  "export * from './packages/ui/src/navigation/internal/contentsOutline.ts';",
  "export * from './packages/ui/src/navigation/internal/contentsWave.ts';",
  "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

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
  assert.equal(waveReach(3), 0.85);
  assert.ok(swellAt(4.9, 4, [], 0.85) < swellAt(4.9, 4, []));
});

test('the place glides to a far target without passing it, and follows small steps as they come', () => {
  const ease = (progress) => progress;
  const place = glideAt(0);
  // A jump glides there over the duration, eased, never past it, and rests.
  glideTo(place, 3, 0, 0.2);
  const drawn = [10, 120, 230, 250].map((now) => [glideStep(place, now, 240, ease), place.value]);
  assert.deepEqual(
    drawn.map(([moving]) => moving),
    [true, true, true, false],
  );
  assert.ok(
    drawn.every(([, value], index) => value <= 3 && (index === 0 || value > drawn[index - 1][1])),
  );
  assert.equal(place.value, 3);
  // At rest, a step as small as the scroll's is taken at once.
  glideTo(place, 3.1, 300, 0.2);
  assert.equal(place.value, 3.1);
  assert.equal(glideStep(place, 300, 240, ease), false);
  // While gliding, a small step carries the glide's end along, without starting again.
  glideTo(place, 5, 400, 0.2);
  glideStep(place, 520, 240, ease);
  const halfway = place.value;
  glideTo(place, 5.1, 520, 0.2);
  assert.equal(place.start, 400);
  glideStep(place, 640, 240, ease);
  assert.ok(place.value > halfway && Math.abs(place.value - 5.1) < 1e-9);
  // Without a duration, as under reduced motion or motion tokens of 0s, it is there at once.
  glideTo(place, 1, 700, 0.2);
  assert.equal(glideStep(place, 700, 0, ease), false);
  assert.equal(place.value, 1);
});

test('near either end the edge runs on into the round end, with no step to a second peak', () => {
  const anchors = Array.from({ length: 12 }, (_, index) => 20 + index * 41);
  const layout = { anchors, top: 8, bottom: anchors.at(-1) + 12, full: 32 };
  const ends = (path) => {
    const edge = [...path.matchAll(/L([\d.]+) ([\d.]+)/g)].map((m) => Number(m[1]));
    const radii = [...path.matchAll(/A([\d.]+)/g)].map((m) => Number(m[1]));
    return { edge, radii };
  };
  // The bulge just short of either end, and on the end entry itself.
  for (const place of [0, 0.3, 0.6, 10.4, 10.7, 11]) {
    const { edge, radii } = ends(wavePath(layout, place, []));
    // Points two pixels apart never jump in width: the shape's own slope, at most.
    for (let index = 1; index < edge.length; index += 1)
      assert.ok(Math.abs(edge[index] - edge[index - 1]) < 2, `a step of the edge at ${place}`);
    // Each round end is as wide as the edge where it starts.
    assert.ok(Math.abs(radii[0] * 2 - edge[0]) < 0.05, `the start at ${place}`);
    assert.ok(Math.abs(radii[1] * 2 - edge.at(-1)) < 0.05, `the end at ${place}`);
  }
});

test('at the first and last entries the bulge stays whole: smaller, near the entry, tapering before the end', () => {
  // Spaced as on the site: the box leaves room above the first entry and below the last.
  const anchors = Array.from({ length: 12 }, (_, index) => 30 + index * 27.5);
  const layout = { anchors, top: 0, bottom: anchors.at(-1) + 30, full: 24 };
  const edge = (path) =>
    [...path.matchAll(/L([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const radii = (path) => [...path.matchAll(/A([\d.]+)/g)].map((m) => Number(m[1]));
  const middle = Math.max(...edge(wavePath(layout, 5, [])).map(([x]) => x));
  for (const [place, end] of [
    [0, 0],
    [11, 1],
  ]) {
    const path = wavePath(layout, place, []);
    const points = edge(path);
    const widest = Math.max(...points.map(([x]) => x));
    const run = points.filter(([x]) => x > widest - 0.5).map(([, y]) => y);
    // Its fullest beside the entry, a little toward the middle at most, and most of its width.
    assert.ok(
      Math.abs((Math.min(...run) + Math.max(...run)) / 2 - anchors[place]) < 8,
      `at ${place}`,
    );
    assert.ok(widest > middle * 0.7 && widest < middle, `the width at ${place}`);
    // It tapers to the thin stroke before the end, which stays a small round tip, not a cap.
    const outer = end === 0 ? points[0] : points.at(-1);
    assert.ok(outer[0] < 24 * waveThin * 1.5, `the taper at ${place}`);
    assert.ok(radii(path)[end] < 24 * waveThin, `the round end at ${place}`);
  }
  // The same under the pointer: the swell at the last entry tapers before the end too.
  const hovered = wavePath(
    layout,
    3,
    anchors.map((_, index) => (index === 11 ? 1 : 0)),
  );
  assert.ok(radii(hovered)[1] < 24 * waveThin);
  // As the bulge moves into the end, it shrinks smoothly, without a jump.
  let before = middle;
  for (let place = 2; place >= 0; place -= 0.05) {
    const widest = Math.max(...edge(wavePath(layout, place, [])).map(([x]) => x));
    assert.ok(Math.abs(widest - before) < 1, `a jump at ${place}`);
    before = widest;
  }
});
