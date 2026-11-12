// DescriptionList's markup, rendered on the server: a dl of terms and their definitions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, textOf } from '../../support/Markup.ts';

const { DescriptionList } = await importSource('DescriptionList', [
  "export * as DescriptionList from './packages/ui/src/data-display/DescriptionList.tsx';",
]);

test('a description list is a dl of terms and their definitions', () => {
  const list = firstElement(
    renderToStaticMarkup(
      h(
        DescriptionList.Root,
        { 'aria-label': 'Project facts' },
        h(DescriptionList.Item, { label: 'Owner' }, 'Alex Morgan'),
        h(DescriptionList.Item, { label: 'Status' }, 'Active'),
        h(DescriptionList.Item, { label: 'Last updated' }, '4 March 2026'),
      ),
    ),
  );
  assert.equal(list.tag, 'dl');
  assert.equal(list.attributes['aria-label'], 'Project facts');
  // dl > div > dt + dd, as HTML allows.
  assert.deepEqual(
    list.children
      .filter((item) => typeof item === 'object')
      .map(
        (item) =>
          `${item.tag}>${elementsOf(item)
            .slice(1)
            .map((part) => part.tag)
            .join('+')}`,
      ),
    ['div>dt+dd', 'div>dt+dd', 'div>dt+dd'],
  );
  const texts = (tag: string) =>
    elementsOf(list)
      .filter((element) => element.tag === tag)
      .map(textOf);
  assert.deepEqual(texts('dt'), ['Owner', 'Status', 'Last updated']);
  assert.deepEqual(texts('dd'), ['Alex Morgan', 'Active', '4 March 2026']);
});
