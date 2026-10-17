import assert from 'node:assert/strict';
import { test } from 'node:test';
import MiniSearch from 'minisearch';
import {
  documentedExports,
  readDocumentation,
  readProps,
} from '../scripts/GenerateDocumentation.mjs';
import { headingsOf } from '../scripts/MarkdownHeadings.mjs';
import { exportSection, propSection, tokenSection } from '../scripts/SearchAnchors.mjs';
import {
  buildSearchIndex,
  cataloguePages,
  readTokens,
  searchDocuments,
} from '../scripts/SearchIndex.mjs';
import { indexOptions, queryOptionsFor, tokenize } from '../scripts/SearchTerms.mjs';

const props = readProps();
const documents = readDocumentation(undefined, { props });
const tokens = readTokens();
const records = searchDocuments({ documents, props, tokens });
const serialized = buildSearchIndex({ documents, props, tokens });
const index = MiniSearch.loadJSON(serialized, indexOptions);
const best = (query, count = 1) =>
  index
    .search(query, queryOptionsFor(query))
    .slice(0, count)
    .map(({ id }) => id);

test('words split at punctuation and at camel-case humps, which stay whole too', () => {
  assert.deepEqual(tokenize('startIcon'), ['startIcon', 'start', 'Icon']);
  assert.deepEqual(tokenize('--env-color-fg-muted'), ['env', 'color', 'fg', 'muted']);
  assert.deepEqual(tokenize('Menu.RadioItem'), ['Menu', 'RadioItem', 'Radio', 'Item']);
});

test('search covers every page, export, prop and token', () => {
  const ids = new Set(records.map(({ id }) => id));
  for (const document of documents.filter(({ id }) => id !== 'index'))
    assert.ok(ids.has(`page:${document.id}`), document.id);
  for (const token of tokens.tokens) assert.ok(ids.has(`token:${token.id}`), token.id);
  const pageTitles = new Set(
    records.filter(({ kind }) => kind !== 'export').map(({ title }) => title),
  );
  // Every export in props.json is found: as an export of its own, or as the page of its name, such
  // as Button, or a namespace, such as Menu, whose page has its name.
  for (const [name, entry] of Object.entries(props.exports)) {
    assert.ok(ids.has(`export:${name}`) || pageTitles.has(name), `${name} has no search document`);
    if (entry.kind === 'component')
      for (const prop of entry.props) assert.ok(ids.has(`prop:${name}.${prop.name}`), name);
  }
  assert.equal(ids.size, records.length, 'every search document has an id of its own');
  for (const { page } of cataloguePages) assert.ok(index.has(`page:${page}`), page);
});

test('every search result leads to a page there is, and to an element that page renders', () => {
  const pages = new Map(documents.map((document) => [document.id, document]));
  const tokenRows = new Set(tokens.tokens.map(({ cssVariable }) => tokenSection(cssVariable)));
  // The ids a page renders: its headings, and on its Props view each export's props and their rows
  // (apps/catalogue/src/template/PropsTables.tsx).
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
    assert.ok(document || cataloguePages.some((entry) => entry.page === page), `${id}: ${page}`);
    if (!section) continue;
    const ids = page === 'tokens' ? tokenRows : elements(document, view);
    assert.ok(ids.has(section), `${id}: ${page} renders no #${section}`);
  }
});

test('search finds components by alias, props and tokens by name, and pages before their parts', () => {
  assert.deepEqual(best('text box'), ['page:text-field']);
  assert.deepEqual(best('hamburger'), ['page:sidebar']);
  assert.ok(best('startIcon', 5).includes('prop:Button.startIcon'));
  assert.ok(best('start icon', 5).includes('prop:Button.startIcon'));
  assert.deepEqual(best('--env-color-fg-muted'), ['token:color.fg.muted']);
  assert.deepEqual(best('fg muted'), ['token:color.fg.muted']);
  // A 0.7 name finds the token that replaces it.
  assert.ok(best('--color-text-muted', 3).includes('token:color.fg.muted'));
  assert.deepEqual(best('button'), ['page:button']);
  assert.ok(best('loading', 3).includes('page:loading'));
  // A typo in a longer word still finds it.
  assert.deepEqual(best('chnagelog'), ['page:changelog']);
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
  // A prop's name alone still finds the props of that name, ahead of other matches.
  assert.ok(
    best('startIcon', 4).every((id) => id.startsWith('prop:') && id.endsWith('.startIcon')),
  );
});

test('a page an alias names ranks above the props of that name', () => {
  // Many exports have a prop of the alias's name, such as Dialog's modal or a field's hint.
  assert.deepEqual(best('modal'), ['page:dialog']);
  assert.deepEqual(best('hint'), ['page:tooltip']);
  assert.deepEqual(best('shortcut'), ['page:kbd']);
  assert.deepEqual(best('placeholder'), ['page:skeleton']);
  assert.deepEqual(best('topbar'), ['page:app-shell']);
  assert.deepEqual(best('dark mode'), ['page:colors']);
  // An export's own name counts more than a page's alias of it.
  assert.deepEqual(best('icon'), ['export:Icon']);
  assert.ok(best('icon', 3).includes('page:icons'));
  // A page whose title names the topic, as Spacing & shape names spacing, ranks above pages and
  // props that only mention it.
  assert.deepEqual(best('spacing'), ['page:spacing']);
  assert.deepEqual(best('scale'), ['page:scale']);
  assert.deepEqual(best('density'), ['page:scale']);
  assert.deepEqual(best('contrast'), ['page:colors']);
  // An export's name written out finds the export before the page that lists it as an alias.
  assert.deepEqual(best('copy button'), ['export:CopyButton']);
  assert.ok(best('button group', 2).includes('export:ButtonGroup'));
  // A five-letter word with a typo still finds it.
  assert.deepEqual(best('buton'), ['page:button']);
});

test('a result names the page it opens', () => {
  const detail = (id) => records.find((record) => record.id === id).detail;
  assert.equal(detail('export:useTheme'), 'Colors & themes');
  assert.equal(detail('export:useThemePreference'), 'Colors & themes');
  assert.equal(detail('export:ThemeToggle'), 'Install the private package');
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
    section: 'react-usage',
  });
  assert.deepEqual(place('prop:Text.variant'), {
    page: 'typography',
    view: 'usage',
    section: 'react-usage',
  });
  // Every export and prop on such a page has a section to go to.
  for (const record of records.filter(({ kind }) => kind === 'export' || kind === 'prop'))
    assert.ok(record.section, `${record.id} leads to no section`);
});

test('a result carries where it is: its page, view and element', () => {
  const prop = index
    .search('startIcon', queryOptionsFor('startIcon'))
    .find(({ id }) => id === 'prop:Button.startIcon');
  assert.equal(prop.page, 'button');
  assert.equal(prop.view, 'props');
  assert.equal(prop.section, 'props-Button-startIcon');
  const token = index.search('--env-color-fg-muted', queryOptionsFor('--env-color-fg-muted'))[0];
  assert.equal(token.page, 'tokens');
  assert.equal(token.section, 'token-env-color-fg-muted');
});

test('the index stays small enough to load with the offline catalogue', () => {
  // About 0.5 MB, 0.1 MB compressed, in 2026-10; the offline catalogue's budget is 25 MiB.
  assert.ok(serialized.length < 1_000_000, `${serialized.length} bytes`);
});

test('a pattern or template names its kind, and what it composes finds it', () => {
  const loading = records.find(({ id }) => id === 'page:loading');
  assert.equal(loading.kind, 'pattern');
  assert.equal(loading.detail, 'Pattern · Keep people informed');
  assert.match(loading.keywords, /\bSkeleton\b/);
  assert.match(loading.keywords, /Keep people informed/);
  for (const record of records.filter(({ kind }) => kind === 'template'))
    assert.equal(record.detail, 'Template', record.id);
});

/**
 * Queries people ask, and the pages they lead to: each runs once the pages it names are written.
 * `first` must be the best result; `among` must be in the first `within`.
 */
const goldenQueries = [
  { query: 'error summary', first: 'page:forms' },
  { query: 'sign in', first: 'page:sign-in-page' },
  { query: 'login page', first: 'page:sign-in-page' },
  { query: 'dashboard', first: 'page:dashboard-page' },
  { query: '404', first: 'page:error-pages' },
  { query: 'not found', first: 'page:error-pages' },
  { query: 'empty state', first: 'page:empty-state', second: 'page:empty-states' },
  { query: 'undo delete', first: 'page:destructive-actions' },
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
