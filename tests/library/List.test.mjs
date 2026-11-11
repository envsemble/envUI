// List's markup: a reorderable list's handles, also on rows of a component that passes its props on
// to List.Item, and none on one that drops them; and the current row marked on its target. Server
// markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';
import { descriptions, elementsOf, firstElement, hasClass } from '../support/Markup.mjs';
import { createElement as h, Fragment } from 'react';
import { renderToString } from 'react-dom/server';

const { List } = await importSource('List', [
  "export * as List from './packages/ui/src/data-display/List.tsx';",
]);

const slides = ['Intro', 'Roadmap', 'Budget', 'Questions'];
const link = (slide) => h('a', { href: `#${slide.toLowerCase()}`, 'data-row-target': '' }, slide);
/** The list and what follows it, as one root, so its handles' description is in reach. */
const render = (list) => firstElement(renderToString(h('div', null, list)));
const handles = (root) =>
  elementsOf(root).filter((element) => hasClass(element, 'env-list-item-handle'));

test('rows of a component that passes its props on to List.Item get their handles', () => {
  const SlideRow = ({ slide, ...props }) => h(List.Item, { ...props, label: slide });
  const root = render(
    h(
      List.Root,
      { 'aria-label': 'Slides', onReorder() {} },
      slides.map((slide) => h(SlideRow, { key: slide, slide })),
    ),
  );
  const found = handles(root);
  assert.deepEqual(
    found.map((handle) => handle.attributes['aria-label']),
    slides.map((slide) => `Reorder ${slide}`),
  );
  // The handle says how to move its row without a pointer, and whether the row is lifted.
  for (const handle of found) {
    assert.equal(handle.tag, 'button');
    assert.equal(handle.attributes['aria-pressed'], 'false');
    assert.match(descriptions(root, handle)[0], /^Press Space or Enter, or click/);
  }
  // A component that drops them leaves its rows without handles.
  const BareSlideRow = ({ slide }) => h(List.Item, { interactive: true, label: link(slide) });
  const bare = render(
    h(
      List.Root,
      { 'aria-label': 'Bare slides', onReorder() {} },
      slides.map((slide) => h(BareSlideRow, { key: slide, slide })),
    ),
  );
  assert.equal(handles(bare).length, 0);
});

test('marks the current row on its target and selects the row', () => {
  const root = render(
    h(
      Fragment,
      null,
      h(
        List.Root,
        { 'aria-label': 'Slides' },
        slides.map((slide) =>
          h(List.Item, {
            key: slide,
            interactive: true,
            current: slide === 'Roadmap',
            label: link(slide),
          }),
        ),
      ),
    ),
  );
  const marked = elementsOf(root).filter((element) => 'aria-current' in element.attributes);
  assert.deepEqual(
    marked.map((element) => [
      element.tag,
      element.attributes.href,
      element.attributes['aria-current'],
    ]),
    [['a', '#roadmap', 'true']],
  );
  const rows = elementsOf(root).filter((element) => element.tag === 'li');
  assert.deepEqual(
    rows.map((row) => 'data-selected' in row.attributes),
    [false, true, false, false],
  );
});
