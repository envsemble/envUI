// Table's markup: a sort button named by its header and what pressing does, also where the header
// is named by aria-label or aria-labelledby; a region named as its table is, with the strings from
// EnvUIProvider's messages; and stackBelow as the length the region's container query compares,
// a bare number in rem. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';
import { elementsOf, firstElement, textOf } from '../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Table, EnvUIProvider } = await importSource('Table', [
  "export * as Table from './packages/ui/src/data-display/Table.tsx';",
  "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const byTag = (root, tag) => elementsOf(root).filter((element) => element.tag === tag);
/** The name aria-labelledby gives an element, from the texts of the ids in `root` or `outside`. */
const labelledName = (root, element, outside = {}) =>
  element.attributes['aria-labelledby']
    .split(' ')
    .map((id) => {
      const named = elementsOf(root).find((each) => each.attributes.id === id);
      return named ? textOf(named) : outside[id];
    })
    .join(' ');
/** A table of one header row with these headers. */
const headed = (props, ...headers) =>
  render(
    h(
      Table.Root,
      props,
      h(Table.Head, null, h(Table.Row, null, ...headers)),
      h(Table.Body, null, h(Table.Row, null, h(Table.Cell, null, 'Quarterly report'))),
    ),
  );

test('a header named by aria-label or aria-labelledby lends its name to its sort button', () => {
  const table = headed(
    { 'aria-label': 'Icon headers' },
    h(
      Table.HeaderCell,
      { 'aria-label': 'Priority', sortDirection: 'none', onSortChange: () => {} },
      h('svg'),
    ),
    h(Table.HeaderCell, { 'aria-labelledby': 'due-date', onSortChange: () => {} }, h('svg')),
  );
  const [priority, due] = byTag(table, 'th');
  assert.equal(priority.attributes['aria-label'], 'Priority');
  assert.equal(priority.attributes['aria-sort'], 'none');
  const [priorityButton, dueButton] = byTag(table, 'button');
  assert.equal(labelledName(table, priorityButton), 'Priority sort ascending');
  assert.equal(due.attributes['aria-labelledby'], 'due-date');
  assert.equal(
    labelledName(table, dueButton, { 'due-date': 'Due date' }),
    'Due date sort ascending',
  );
});

test('a table named by aria-labelledby names its scroll region too, and its strings come from messages', () => {
  const region = render(
    h(
      EnvUIProvider,
      { messages: { table: { sortAscending: 'aufsteigend sortieren' } } },
      h(
        Table.Root,
        { 'aria-labelledby': 'labelled-table' },
        h(
          Table.Head,
          null,
          h(Table.Row, null, h(Table.HeaderCell, { onSortChange: () => {} }, 'Quarter')),
        ),
      ),
    ),
  );
  assert.equal(region.attributes.role, 'region');
  assert.equal(region.attributes.tabindex, '0');
  assert.equal(region.attributes['aria-labelledby'], 'labelled-table');
  assert.equal(byTag(region, 'table')[0].attributes['aria-labelledby'], 'labelled-table');
  assert.equal(labelledName(region, byTag(region, 'button')[0]), 'Quarter aufsteigend sortieren');
});

test('stackBelow is the length the region compares, a bare number in rem', () => {
  const threshold = (stackBelow) =>
    /--env-table-stack-below:([^;]+)/.exec(
      render(h(Table.Root, { 'aria-label': 'Stacking', narrowLayout: 'stack', stackBelow }))
        .attributes.style,
    )?.[1];
  assert.equal(threshold('37.5'), '37.5rem');
  assert.equal(threshold(37.5), '37.5rem');
  assert.equal(threshold('60rem'), '60rem');
  assert.equal(threshold('calc(20rem + 160px)'), 'calc(20rem + 160px)');
  // 36 rem by default; a table that scrolls instead compares nothing.
  assert.equal(threshold(undefined), '36rem');
  assert.equal(render(h(Table.Root, { 'aria-label': 'Scrolling' })).attributes.style, undefined);
});
