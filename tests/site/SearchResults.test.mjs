// What the site's search shows (apps/site/src/search/SearchResults.ts): the suggestions before people
// type, the groups of results and the palette's rows of them, and where a result opens.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importSource } from '../support/importSource.mjs';

const search = await importSource('SearchResults', 'apps/site/src/search/SearchResults.ts');
const routes = await importSource('SearchRoutes', 'apps/site/src/routes/SiteRoutes.ts');

/** A search result, named by the query unless said otherwise. */
const result = (kind, title, fields = {}) => ({
  id: `${kind}:${title}`,
  kind,
  title,
  owner: '',
  detail: kind,
  page: title.toLowerCase(),
  area: 'catalogue',
  named: true,
  namesProp: false,
  ...fields,
});
const none = new Set();
const shape = (groups) =>
  groups.map(({ name, results, hidden }) => [name, results.map(({ title }) => title), hidden]);

test("before people type, search suggests the page's counterpart, then the start of either part", () => {
  const button = routes.findPage('components/button');
  const suggestions = search.suggestionsFor(button);
  assert.deepEqual(
    suggestions.map(({ id }) => id),
    ['docs/components/button', 'docs', 'components', 'patterns', 'docs/tokens'],
  );
  assert.equal(suggestions[0].suggested, undefined);
  assert.equal(suggestions[0].description, 'Docs · This page in code, with its props');
  assert.equal(suggestions[1].suggested, 'docs');
  assert.ok(suggestions.every(({ group }) => group === 'Suggested'));
  // A page without a counterpart, or none, suggests the start of either part alone.
  assert.deepEqual(
    search.suggestionsFor(undefined).map(({ id }) => id),
    ['docs', 'components', 'patterns', 'docs/tokens'],
  );
});

test("a whole page opens in the reader's part; a place on a page opens where it is", () => {
  const button = routes.findPage('components/button');
  assert.equal(search.inReadersPart('docs/components/button', button), 'components/button');
  assert.equal(
    search.inReadersPart('docs/components/button?prop=size', button),
    'docs/components/button?prop=size',
  );
  assert.equal(search.inReadersPart('docs/components/button', undefined), 'docs/components/button');
});

test('results named by the query come first, and those that only mention it fold into one row', () => {
  const groups = search.groupResults(
    [
      result('pattern', 'Forms', { named: false }),
      result('component', 'DatePicker'),
      result('pattern', 'Filtering', { named: false }),
      result('guide', 'Dates'),
    ],
    none,
  );
  assert.deepEqual(shape(groups), [
    ['Components', ['DatePicker'], 0],
    ['Pages', ['Dates'], 0],
    ['Also mentioned in', [], 2],
  ]);
  // Expanded, the row's results show in place.
  assert.deepEqual(
    shape(
      search.groupResults(
        [
          result('component', 'DatePicker'),
          result('pattern', 'Forms', { named: false }),
          result('pattern', 'Filtering', { named: false }),
        ],
        new Set(['Also mentioned in']),
      ),
    ).at(-1),
    ['Also mentioned in', ['Forms', 'Filtering'], 0],
  );
});

test("the named components' props come first, pass-through props last, as many as the query names", () => {
  const prop = (title, owner, namesProp = false) => result('prop', title, { owner, namesProp });
  const groups = search.groupResults(
    [
      prop('startDate', 'CalendarHeatmap', true),
      prop('className', 'DatePicker', true),
      prop('value', 'DatePicker', true),
      prop('min', 'DatePicker.Field', true),
      prop('open', 'DatePicker'),
      result('component', 'DatePicker'),
    ],
    none,
  );
  assert.deepEqual(shape(groups), [
    ['Components', ['DatePicker'], 0],
    ['Props', ['value', 'min', 'className'], 2],
  ]);
  // A query that names no prop by its own name shows them all in the group's row.
  const textarea = search.groupResults(
    [result('component', 'Textarea'), prop('size', 'Textarea'), prop('variant', 'Textarea')],
    none,
  );
  assert.deepEqual(shape(textarea).at(-1), ['Props', [], 2]);
});

test('a short group one result past its limit shows that one rather than a row for it', () => {
  const tokens = ['a', 'b', 'c', 'd'].map((name) => result('token', name));
  assert.deepEqual(shape(search.groupResults(tokens, none)), [['Tokens', ['a', 'b', 'c', 'd'], 0]]);
  const five = [...tokens, result('token', 'e')];
  assert.deepEqual(shape(search.groupResults(five, none)), [['Tokens', ['a', 'b', 'c'], 2]]);
});

test("a row names its part only where another reads the same, and a group's row counts the rest", () => {
  const rows = search.resultRows([
    {
      name: 'Pages',
      results: [
        result('page', 'Colors', { detail: 'Foundation' }),
        result('page', 'Colors', { id: 'docs:Colors', area: 'docs', detail: 'Foundation' }),
        result('guide', 'Setup', { detail: 'Guide' }),
      ],
      hidden: 0,
    },
    { name: 'Tokens', results: [result('token', 'space')], hidden: 4 },
    { name: 'Also mentioned in', results: [], hidden: 1 },
  ]);
  assert.deepEqual(
    rows.map(({ id, label, description, kind }) => [id, label, description, kind]),
    [
      ['page:Colors', 'Colors', 'Catalogue · Foundation', 'page'],
      ['docs:Colors', 'Colors', 'Docs · Foundation', 'page'],
      ['guide:Setup', 'Setup', 'Guide', 'guide'],
      ['token:space', 'space', 'token', 'token'],
      [search.moreId('Tokens'), '4 more tokens', undefined, 'more'],
      [search.moreId('Also mentioned in'), '1 result', undefined, 'more'],
    ],
  );
});
