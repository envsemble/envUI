import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, elementsOf, firstElement, hasClass } from '../../support/Markup.ts';
import { createElement as h, Fragment } from 'react';
import { renderToString } from 'react-dom/server';

const { List } = await importSource('List', [
  "export * as List from './packages/ui/src/data-display/List.tsx';",
]);

const slides = ['Intro', 'Roadmap', 'Budget', 'Questions'];
const link = (slide) => h('a', { href: `#${slide.toLowerCase()}`, 'data-row-target': '' }, slide);
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
  for (const handle of found) {
    assert.equal(handle.tag, 'button');
    assert.equal(handle.attributes['aria-pressed'], 'false');
    assert.match(descriptions(root, handle)[0], /^Press Space or Enter, or click/);
  }
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

test("a titled list's headerEnd sits beside its heading, outside it", () => {
  const root = render(
    h(
      List.Root,
      { title: 'Members', headerEnd: h('button', { type: 'button' }, 'Add member') },
      h(List.Item, { label: 'Alex Morgan' }),
    ),
  );
  const header = elementsOf(root).find((element) => hasClass(element, 'env-list-header'));
  const heading = elementsOf(header).find((element) => element.tag === 'h2');
  const headerEnd = elementsOf(header).find((element) => hasClass(element, 'env-list-header-end'));
  assert.ok(heading && headerEnd);
  assert.equal(elementsOf(heading).filter((element) => element.tag === 'button').length, 0);
  assert.equal(elementsOf(headerEnd).filter((element) => element.tag === 'button').length, 1);
  const list = elementsOf(root).find((element) => element.tag === 'ul');
  assert.equal(list.attributes['aria-labelledby'], heading.attributes.id);
});

test("handlePlacement end puts each row's handle last, after its end content", () => {
  const root = render(
    h(
      List.Root,
      { 'aria-label': 'Slides', onReorder() {}, handlePlacement: 'end' },
      slides.map((slide) => h(List.Item, { key: slide, label: slide, end: 'Draft' })),
    ),
  );
  const rows = elementsOf(root).filter((element) => element.tag === 'li');
  assert.equal(rows.length, slides.length);
  for (const [index, row] of rows.entries()) {
    const last = row.children.filter((child) => typeof child !== 'string').at(-1);
    assert.ok(hasClass(last, 'env-list-item-handle'));
    assert.equal(last.attributes['data-placement'], 'end');
    assert.equal(last.attributes['aria-label'], `Reorder ${slides[index]}`);
  }
});
