import assert from 'node:assert/strict';
import { test } from 'node:test';
import MiniSearch from 'minisearch';
import { readDocumentation, readProps } from '../scripts/GenerateDocumentation.mjs';
import {
  buildSearchIndex,
  cataloguePages,
  readTokens,
  searchDocuments,
} from '../scripts/SearchIndex.mjs';
import { indexOptions, queryOptions, tokenize } from '../scripts/SearchTerms.mjs';

const props = readProps();
const documents = readDocumentation(undefined, { props });
const tokens = readTokens();
const records = searchDocuments({ documents, props, tokens });
const serialized = buildSearchIndex({ documents, props, tokens });
const index = MiniSearch.loadJSON(serialized, indexOptions);
const best = (query, count = 1) =>
  index
    .search(query, queryOptions)
    .slice(0, count)
    .map(({ id }) => id);

test('words split at punctuation and at camel-case humps, which stay whole too', () => {
  assert.deepEqual(tokenize('startIcon'), ['startIcon', 'start', 'Icon']);
  assert.deepEqual(tokenize('--color-fg-muted'), ['color', 'fg', 'muted']);
  assert.deepEqual(tokenize('Menu.RadioItem'), ['Menu', 'RadioItem', 'Radio', 'Item']);
});

test('search covers every page, documented export, prop and token', () => {
  const ids = new Set(records.map(({ id }) => id));
  for (const document of documents.filter(({ id }) => id !== 'index'))
    assert.ok(ids.has(`page:${document.id}`), document.id);
  for (const token of tokens.tokens) assert.ok(ids.has(`token:${token.id}`), token.id);
  const documented = new Set(
    documents.flatMap((document) => document.frontmatter?.components ?? []),
  );
  for (const [name, entry] of Object.entries(props.exports)) {
    if (entry.kind !== 'component' || !documented.has(name)) continue;
    for (const prop of entry.props) assert.ok(ids.has(`prop:${name}.${prop.name}`), name);
  }
  assert.equal(ids.size, records.length, 'every search document has an id of its own');
  for (const { page } of cataloguePages) assert.ok(index.has(`page:${page}`), page);
});

test('search finds components by alias, props and tokens by name, and pages before their parts', () => {
  assert.deepEqual(best('text box'), ['page:text-field']);
  assert.deepEqual(best('hamburger'), ['page:app-shell']);
  assert.ok(best('startIcon', 5).includes('prop:Button.startIcon'));
  assert.ok(best('start icon', 5).includes('prop:Button.startIcon'));
  assert.deepEqual(best('--color-fg-muted'), ['token:color.fg.muted']);
  assert.deepEqual(best('fg muted'), ['token:color.fg.muted']);
  assert.deepEqual(best('button'), ['page:button']);
  assert.ok(best('loading', 3).includes('page:loading'));
  // A typo in a longer word still finds it.
  assert.deepEqual(best('chnagelog'), ['page:changelog']);
});

test('a result carries where it is: its page, view and element', () => {
  const prop = index
    .search('startIcon', queryOptions)
    .find(({ id }) => id === 'prop:Button.startIcon');
  assert.equal(prop.page, 'button');
  assert.equal(prop.view, 'props');
  assert.equal(prop.section, 'props-Button-startIcon');
  const token = index.search('--color-fg-muted', queryOptions)[0];
  assert.equal(token.page, 'tokens');
  assert.equal(token.section, 'token-color-fg-muted');
});

test('the index stays small enough to load with the offline catalogue', () => {
  // About 0.5 MB, 0.1 MB compressed, in 2026-10; the offline catalogue's budget is 25 MiB.
  assert.ok(serialized.length < 1_000_000, `${serialized.length} bytes`);
});
