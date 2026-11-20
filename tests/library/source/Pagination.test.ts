import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { Pagination } = await importSource('Pagination', 'packages/ui/src/index.ts');

const ignore = () => undefined;
const render = (props) =>
  renderToStaticMarkup(h(Pagination, { onPageChange: ignore, 'aria-label': 'Pages', ...props }));

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

test('ranges without a total, single pages, empty lists, past the end and in other languages, in a landmark named Pagination by default', () => {
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
  assert.deepEqual(state({ page: 9, pageSize: 60, total: 245 }), {
    range: '241–245 of 245',
    previous: true,
    next: false,
  });
  const german = firstElement(
    render({
      'aria-label': 'Seiten',
      page: 2,
      pageSize: 20,
      total: 1234,
      previousLabel: 'Vorherige Seite',
      nextLabel: 'Nächste Seite',
      renderRange: ({ start, end, total }) =>
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
  const named = firstElement(
    renderToStaticMarkup(h(Pagination, { page: 1, pageSize: 10, total: 30, onPageChange: ignore })),
  );
  assert.equal(named.tag, 'nav');
  assert.equal(named.attributes['aria-label'], 'Pagination');
});

test('with pageHref the controls are links to the pages before and after, and one with no page reports aria-disabled with no destination', () => {
  const pager = firstElement(
    renderToStaticMarkup(
      h(Pagination, {
        'aria-label': 'Pages',
        page: 1,
        pageSize: 10,
        total: 25,
        pageHref: (page) => `?page=${page}`,
      }),
    ),
  );
  const links = elementsOf(pager).filter((element) => element.tag === 'a');
  const [previous, next] = links;
  assert.equal(links.length, 2);
  assert.equal(elementsOf(pager).filter((element) => element.tag === 'button').length, 0);
  assert.equal(previous.attributes['aria-label'], 'Previous page');
  assert.equal(previous.attributes.href, undefined);
  assert.equal(previous.attributes['aria-disabled'], 'true');
  assert.equal(next.attributes['aria-label'], 'Next page');
  assert.equal(next.attributes.href, '?page=2');
  assert.equal(next.attributes['aria-disabled'], undefined);
});
