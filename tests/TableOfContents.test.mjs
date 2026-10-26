// TableOfContents: the outline it builds from headings, the current section it finds from where
// the page has scrolled, and its server markup, which lists
// the sections given as items and marks none until the page hydrates.
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
const { TableOfContents, EnvUIProvider, outline, flatten, slug, uniqueId, currentSection } =
  await import(pathToFileURL(output).href);

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
