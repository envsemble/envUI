import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Table, EnvUIProvider } = await importSource('Table', [
  "export * as Table from './packages/ui/src/data-display/Table.tsx';",
  "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const byTag = (root, tag) => elementsOf(root).filter((element) => element.tag === tag);
const labelledName = (root, element, outside = {}) =>
  element.attributes['aria-labelledby']
    .split(' ')
    .map((id) => {
      const named = elementsOf(root).find((each) => each.attributes.id === id);
      return named ? textOf(named) : outside[id];
    })
    .join(' ');
const tableWithHeaderRow = (props, ...headers) =>
  render(
    h(
      Table.Root,
      props,
      h(Table.Head, null, h(Table.Row, null, ...headers)),
      h(Table.Body, null, h(Table.Row, null, h(Table.Cell, null, 'Quarterly report'))),
    ),
  );

test('a header named by aria-label or aria-labelledby lends its name to its sort button', () => {
  const table = tableWithHeaderRow(
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

test('stackBelow is the length the region compares, a bare number in rem, 36 rem by default', () => {
  const threshold = (stackBelow) =>
    /--_table-stack-below:([^;]+)/.exec(
      render(h(Table.Root, { 'aria-label': 'Stacking', narrowLayout: 'stack', stackBelow }))
        .attributes.style,
    )?.[1];
  assert.equal(threshold('37.5'), '37.5rem');
  assert.equal(threshold(37.5), '37.5rem');
  assert.equal(threshold('60rem'), '60rem');
  assert.equal(threshold('calc(20rem + 160px)'), 'calc(20rem + 160px)');
  assert.equal(threshold(undefined), '36rem');
  assert.equal(render(h(Table.Root, { 'aria-label': 'Scrolling' })).attributes.style, undefined);
});

test("a header's end sits beside its sort button, outside it, and the header keeps its label as its name", () => {
  const table = tableWithHeaderRow(
    { 'aria-label': 'Work items' },
    h(
      Table.HeaderCell,
      {
        sortDirection: 'none',
        onSortChange: () => {},
        end: h('button', { type: 'button', 'aria-label': 'Filter status' }),
      },
      'Status',
    ),
    h(Table.HeaderCell, { end: h('button', { type: 'button' }, 'Help') }, 'Owner'),
  );
  const [sortable, plain] = byTag(table, 'th');
  const [sortButton, filter] = byTag(sortable, 'button');
  assert.equal(sortButton.attributes.class, 'env-table-sort-button');
  assert.equal(byTag(sortButton, 'button').length, 1);
  assert.equal(filter.attributes['aria-label'], 'Filter status');
  assert.equal(labelledName(table, sortable), 'Status');
  assert.equal(labelledName(table, plain), 'Owner');
});

test('Table.Foot is a tfoot that keeps its roles while rows stack, and regionProps reach the region', () => {
  const table = render(
    h(
      Table.Root,
      {
        'aria-label': 'Invoices',
        narrowLayout: 'stack',
        regionProps: {
          style: { maxBlockSize: '20rem' },
          className: 'own-region',
          'data-testid': 'invoices',
          role: 'presentation',
          tabIndex: -1,
        },
      },
      h(Table.Body, null, h(Table.Row, null, h(Table.Cell, null, '12 hours'))),
      h(
        Table.Foot,
        null,
        h(
          Table.Row,
          null,
          h(Table.HeaderCell, { scope: 'row' }, 'Total'),
          h(Table.Cell, null, '12 hours'),
        ),
      ),
    ),
  );
  assert.equal(table.attributes.role, 'region');
  assert.equal(table.attributes.tabindex, '0');
  assert.equal(table.attributes.class, 'env-table-region own-region');
  assert.equal(table.attributes['data-testid'], 'invoices');
  assert.match(table.attributes.style, /max-block-size:20rem/);
  assert.match(table.attributes.style, /--_table-stack-below:36rem/);
  const [foot] = byTag(table, 'tfoot');
  assert.equal(foot.attributes.class, 'env-table-foot');
  assert.equal(foot.attributes.role, 'rowgroup');
  assert.equal(byTag(foot, 'th')[0].attributes.role, 'rowheader');
  assert.equal(byTag(foot, 'td')[0].attributes.role, 'cell');
});
