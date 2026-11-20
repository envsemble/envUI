import assert from 'node:assert/strict';
import { test } from 'node:test';
import MiniSearch from 'minisearch';
import { documentedExports } from '../../scripts/docs/Compiler.ts';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';
import { readProps } from '../../scripts/docs/PageStructure.ts';
import { headingsOf } from '../../scripts/docs/MarkdownHeadings.ts';
import {
  exportSection,
  propSection,
  tokenSection,
} from '../../apps/site/src/documentation/SearchAnchors.ts';
import {
  buildSearchIndex,
  standalonePages,
  readTokens,
  searchDocuments,
} from '../../scripts/site/BuildSearchIndex.ts';
import { unlistedDocuments } from '../../apps/site/src/documentation/DocumentPlaces.ts';
import {
  indexOptions,
  queryOptionsFor,
  searchIndex,
  tokenize,
} from '../../apps/site/src/documentation/SearchTerms.ts';

const props = readProps();
const documents = readDocumentation(undefined, { props });
const tokens = readTokens();
const records = searchDocuments({ documents, props, tokens });
const serialized = buildSearchIndex({ documents, props, tokens });
const index = MiniSearch.loadJSON(serialized, indexOptions);
const best = (query, count = 1) =>
  searchIndex(index, query)
    .slice(0, count)
    .map(({ id }) => id);

test('words split at punctuation and at camel-case humps, which stay whole too', () => {
  assert.deepEqual(tokenize('startIcon'), ['startIcon', 'start', 'Icon']);
  assert.deepEqual(tokenize('--env-color-fg-muted'), ['env', 'color', 'fg', 'muted']);
  assert.deepEqual(tokenize('Menu.RadioItem'), ['Menu', 'RadioItem', 'Radio', 'Item']);
});

test('search covers every page, export, prop and token', () => {
  const ids = new Set(records.map(({ id }) => id));
  for (const document of documents)
    assert.equal(ids.has(`page:${document.id}`), !unlistedDocuments.has(document.id), document.id);
  for (const token of tokens.tokens) assert.ok(ids.has(`token:${token.id}`), token.id);
  const pageTitles = new Set(
    records.filter(({ kind }) => kind !== 'export').map(({ title }) => title),
  );
  for (const [name, entry] of Object.entries(props.exports)) {
    assert.ok(ids.has(`export:${name}`) || pageTitles.has(name), `${name} has no search document`);
    if (entry.kind === 'component')
      for (const prop of entry.props) assert.ok(ids.has(`prop:${name}.${prop.name}`), name);
  }
  assert.equal(ids.size, records.length, 'every search document has an id of its own');
  for (const { page } of standalonePages) assert.ok(index.has(`page:${page}`), page);
});

test('every search result leads to a page there is, and to an element that page renders', () => {
  const pages = new Map(documents.map((document) => [document.id, document]));
  const tokenRows = new Set(tokens.tokens.map(({ cssVariable }) => tokenSection(cssVariable)));
  const elements = (document, view) =>
    new Set(
      view === 'props'
        ? documentedExports(document.frontmatter?.components ?? [], props).flatMap((name) => {
            const entry = props.exports[name];
            return [
              exportSection(name),
              ...(entry.props ?? []).map((prop) => propSection(name, prop.name)),
            ];
          })
        : headingsOf(document.markdown).map(({ id }) => id),
    );
  for (const { id, page, view, section } of records) {
    const document = pages.get(page);
    assert.ok(document || standalonePages.some((entry) => entry.page === page), `${id}: ${page}`);
    if (!section) continue;
    const ids = page === 'docs/tokens' ? tokenRows : elements(document, view);
    assert.ok(ids.has(section), `${id}: ${page} renders no #${section}`);
  }
});

test('search finds components by alias, props and tokens by name, and pages before their parts', () => {
  assert.deepEqual(best('text box'), ['page:text-field']);
  assert.deepEqual(best('hamburger'), ['page:navigation-drawer']);
  assert.ok(best('startIcon', 5).includes('prop:TextField.startIcon'));
  assert.ok(best('start icon', 5).includes('prop:TextField.startIcon'));
  assert.deepEqual(best('--env-color-fg-muted'), ['token:color.fg.muted']);
  assert.deepEqual(best('fg muted'), ['token:color.fg.muted']);
  assert.deepEqual(best('button'), ['page:button']);
  assert.ok(best('loading', 3).includes('page:spinner'));
  assert.deepEqual(best('chnagelog'), ['page:docs/changelog']);
});

test('a whole name ranks first: an export, a prop by its export, a token', () => {
  assert.deepEqual(best('Button.variant'), ['prop:Button.variant']);
  assert.deepEqual(best('Button variant'), ['prop:Button.variant']);
  assert.deepEqual(best('button  VARIANT'), ['prop:Button.variant']);
  assert.deepEqual(best('Button size'), ['prop:Button.size']);
  assert.deepEqual(best('IconButton'), ['export:IconButton']);
  assert.deepEqual(best('ThemeToggle'), ['export:ThemeToggle']);
  assert.deepEqual(best('useToast'), ['export:useToast']);
  assert.deepEqual(best('Menu.Item'), ['export:Menu.Item']);
  assert.deepEqual(best('Theme'), ['export:Theme']);
  assert.ok(
    best('startIcon', 4).every((id) => id.startsWith('prop:') && id.endsWith('.startIcon')),
  );
});

test('a page an alias names ranks above the props of that name', () => {
  assert.deepEqual(best('modal'), ['page:dialog']);
  assert.deepEqual(best('hint'), ['page:tooltip']);
  assert.deepEqual(best('shortcut'), ['page:kbd']);
  assert.deepEqual(best('topbar'), ['page:top-bar']);
  assert.deepEqual(best('dark mode'), ['page:colors']);
  assert.deepEqual(best('icon'), ['export:Icon']);
  assert.ok(best('icon', 3).includes('page:icons'));
  assert.deepEqual(best('spacing'), ['page:spacing']);
  assert.deepEqual(best('scale'), ['page:spacing']);
  assert.deepEqual(best('density'), ['page:spacing']);
  assert.deepEqual(best('contrast'), ['page:colors']);
  assert.deepEqual(best('copy button'), ['export:CopyButton']);
  assert.ok(best('button group', 2).includes('export:ButtonGroup'));
  assert.deepEqual(best('buton'), ['page:button']);
  assert.deepEqual(best('date'), ['page:date-picker']);
  assert.deepEqual(best('time'), ['page:time-picker']);
});

test('words that name no result together find the pages whose title holds one first', () => {
  assert.deepEqual(best('primary button'), ['page:button']);
  assert.deepEqual(best('error message'), ['page:field']);
  assert.deepEqual(best('button variant'), ['prop:Button.variant']);
  assert.deepEqual(best('date pi'), ['page:date-picker']);
});

test('a result names the page it opens', () => {
  const detail = (id) => records.find((record) => record.id === id).detail;
  assert.equal(detail('export:useTheme'), 'Colors & themes');
  assert.equal(detail('export:useThemePreference'), 'Colors & themes');
  assert.equal(detail('export:ThemeToggle'), 'Install and set up');
});

test('an export on a page without a Props view leads to the section that shows it', () => {
  const place = (id) => {
    const { page, view, section } = records.find((record) => record.id === id);
    return { page, view, section };
  };
  assert.deepEqual(place('export:ThemePreferenceProvider'), {
    page: 'setup',
    view: undefined,
    section: 'theme-preference',
  });
  assert.deepEqual(place('prop:LinkProvider.component'), {
    page: 'setup',
    view: undefined,
    section: 'connect-your-router',
  });
  assert.deepEqual(place('export:useTheme'), {
    page: 'colors',
    view: 'usage',
    section: 'usage',
  });
  assert.deepEqual(place('prop:Text.variant'), {
    page: 'typography',
    view: 'props',
    section: 'props-Text-variant',
  });
  for (const record of records.filter(({ kind }) => kind === 'export' || kind === 'prop'))
    assert.ok(record.section, `${record.id} leads to no section`);
});

test('a result carries where it is: its page, view and element', () => {
  const prop = index
    .search('startIcon', queryOptionsFor('startIcon'))
    .find(({ id }) => id === 'prop:TextField.startIcon');
  assert.equal(prop.page, 'text-field');
  assert.equal(prop.view, 'props');
  assert.equal(prop.section, 'props-TextField-startIcon');
  const token = index.search('--env-color-fg-muted', queryOptionsFor('--env-color-fg-muted'))[0];
  assert.equal(token.page, 'docs/tokens');
  assert.equal(token.section, 'token-env-color-fg-muted');
});

test('the index stays small enough to load when search first opens', () => {
  assert.ok(serialized.length < 1_000_000, `${serialized.length} bytes`);
});

test('a result names its area: the catalogue, or the Docs for the reference', () => {
  const area = (id) => records.find((record) => record.id === id)?.area;
  assert.equal(area('page:button'), 'catalogue');
  assert.equal(area('page:colors'), 'catalogue');
  assert.equal(area('page:field'), 'docs');
  assert.equal(area('page:setup'), 'docs');
  assert.equal(area('prop:Button.variant'), 'docs');
  assert.equal(area('export:useTheme'), 'docs');
  assert.equal(area('token:color.fg.muted'), 'docs');
  for (const record of records) assert.ok(['catalogue', 'docs'].includes(record.area), record.id);
  const inDocs = new Set(['docs', 'docs/tokens', 'docs/changelog']);
  for (const { page, area: where } of standalonePages)
    assert.equal(where, inDocs.has(page) ? 'docs' : 'catalogue', page);
  assert.deepEqual(best('colors and themes'), ['page:colors']);
  assert.ok(!records.some(({ id }) => id.startsWith('guide:')));
});

const goldenQueries = [
  { query: 'account menu', first: 'page:menu' },
  { query: 'title bar', first: 'page:top-bar' },
  { query: 'confirm delete', first: 'page:confirm-dialog' },
  { query: 'date range', first: 'page:date-picker' },
  { query: 'dropdown', first: 'page:select' },
  { query: 'modal', first: 'page:dialog' },
  { query: 'progress bar', first: 'page:progress' },
  { query: 'breadcrumb', first: 'page:breadcrumbs' },
];
for (const { query, first, second } of goldenQueries) {
  const missing = [first, second].filter((id) => id && !records.some((record) => record.id === id));
  test(
    `"${query}" finds ${[first, second].filter(Boolean).join(' then ')}`,
    { skip: missing.length > 0 && `${missing.join(' and ')} not written yet` },
    () => {
      assert.deepEqual(best(query, second ? 2 : 1), second ? [first, second] : [first]);
    },
  );
}
