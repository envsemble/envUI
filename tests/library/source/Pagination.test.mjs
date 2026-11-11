// Pagination's markup, rendered on the server: the range it shows and the buttons it offers, with a
// total or without one, for a single page, an empty list, past the end and in another language.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';

const { Pagination } = await importSource('Pagination', 'packages/ui/src/index.ts');

const ignore = () => undefined;
const render = (props) =>
  renderToStaticMarkup(h(Pagination, { onPageChange: ignore, 'aria-label': 'Pages', ...props }));

/** The range text, and whether each button can be pressed. */
function state(props) {
  const pager = firstElement(render(props));
  const buttons = elementsOf(pager).filter((element) => element.tag === 'button');
  const available = (name) =>
    buttons.find((button) => button.attributes['aria-label'] === name).attributes[
      'aria-disabled'
    ] !== 'true';
  return {
    range: textOf(elementsOf(pager).find((element) => hasClass(element, 'env-pagination-range'))),
    previous: available('Previous page'),
    next: available('Next page'),
  };
}

test('ranges without a total, single pages, empty lists and other languages', () => {
  // Without a total, the range shows the page's items and hasNextPage ends the list.
  assert.deepEqual(state({ page: 1, pageSize: 50, hasNextPage: true }), {
    range: '1–50',
    previous: false,
    next: true,
  });
  assert.deepEqual(state({ page: 3, pageSize: 50, hasNextPage: false }), {
    range: '101–150',
    previous: true,
    next: false,
  });
  // A list that fits on one page can hide the pager; a later page of an open list keeps it.
  assert.equal(render({ page: 1, pageSize: 60, total: 40, hideWhenSinglePage: true }), '');
  assert.deepEqual(state({ page: 1, pageSize: 60, total: 40 }), {
    range: '1–40 of 40',
    previous: false,
    next: false,
  });
  assert.deepEqual(state({ page: 3, pageSize: 50, hasNextPage: false, hideWhenSinglePage: true }), {
    range: '101–150',
    previous: true,
    next: false,
  });
  assert.equal(state({ page: 1, pageSize: 60, total: 0 }).range, '0 of 0');
  assert.equal(state({ page: 5, pageSize: 60, total: 241 }).range, '241 of 241');
  // A page beyond the end shows the last page.
  assert.deepEqual(state({ page: 9, pageSize: 60, total: 245 }), {
    range: '241–245 of 245',
    previous: true,
    next: false,
  });
  // Another language names the buttons and formats the range; the buttons show only their icons.
  const german = firstElement(
    render({
      'aria-label': 'Seiten',
      page: 2,
      pageSize: 20,
      total: 1234,
      previousLabel: 'Vorherige Seite',
      nextLabel: 'Nächste Seite',
      formatRange: ({ start, end, total }) =>
        `${start.toLocaleString('de')}–${end.toLocaleString('de')} von ${total?.toLocaleString('de')}`,
    }),
  );
  assert.equal(
    textOf(elementsOf(german).find((element) => hasClass(element, 'env-pagination-range'))),
    '21–40 von 1.234',
  );
  const buttons = elementsOf(german).filter((element) => element.tag === 'button');
  assert.deepEqual(buttons.map(textOf), ['', '']);
  assert.deepEqual(
    buttons.map((button) => button.attributes['aria-label']),
    ['Vorherige Seite', 'Nächste Seite'],
  );
  // A pager is a navigation landmark, named Pagination by default.
  const named = firstElement(
    renderToStaticMarkup(h(Pagination, { page: 1, pageSize: 10, total: 30, onPageChange: ignore })),
  );
  assert.equal(named.tag, 'nav');
  assert.equal(named.attributes['aria-label'], 'Pagination');
});
