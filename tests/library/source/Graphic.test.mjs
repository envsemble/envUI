// Graphic's markup: alt names it as one image, its file's own img never named again, and an empty
// alt hides it as decoration. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass } from '../../support/Markup.mjs';

const { Graphic } = await importSource('Graphic', [
  "export { Graphic } from './packages/ui/src/data-display/Graphic.tsx';",
]);

/** The graphic's own element: a file's markup leads with the link that preloads it. */
const render = (props, ...children) =>
  elementsOf(
    firstElement(`<div>${renderToStaticMarkup(h(Graphic, props, ...children))}</div>`),
  ).find((element) => hasClass(element, 'env-graphic'));

test('alt names a graphic as an image, and an empty alt hides it as decoration', () => {
  for (const named of [
    render({ src: 'logo.png', alt: 'Acme', size: 'md' }),
    render({ alt: 'Acme', size: 'md' }, h('svg', { viewBox: '0 0 24 24' })),
    render({ src: 'logo.svg', alt: 'Acme', size: 'md', tint: 'text' }),
  ]) {
    assert.equal(named.attributes.role, 'img');
    assert.equal(named.attributes['aria-label'], 'Acme');
    assert.equal(named.attributes['aria-hidden'], undefined);
    // The file's own img is never named twice.
    for (const image of elementsOf(named).filter((element) => element.tag === 'img'))
      assert.equal(image.attributes.alt, '');
  }
  const decorative = render({ src: 'logo.png', alt: '', size: 'md' });
  assert.equal(decorative.attributes['aria-hidden'], 'true');
  assert.equal(decorative.attributes.role, undefined);
  assert.equal(decorative.attributes['aria-label'], undefined);
});
