import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { importSource } from '../../support/ImportSource.ts';
import { firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { Theme } = await importSource('Theme', [
  'export * from "./packages/ui/src/foundations/Theme.tsx";',
]);

test("Theme's boundary renders as the element of render, with the boundary's class and attributes", () => {
  const boundary = firstElement(
    renderToString(
      h(
        Theme,
        {
          theme: 'dark',
          scale: 'compact',
          className: 'inspector',
          'aria-label': 'Inspector',
          render: h('section', { className: 'own', id: 'inspector' }),
        },
        'Settings',
      ),
    ),
  );
  assert.equal(boundary.tag, 'section');
  assert.ok(hasClass(boundary, 'env-theme') && hasClass(boundary, 'inspector'));
  assert.ok(hasClass(boundary, 'own'));
  assert.equal(boundary.attributes.id, 'inspector');
  assert.equal(boundary.attributes['aria-label'], 'Inspector');
  assert.equal(boundary.attributes['data-env-theme'], 'dark');
  assert.equal(boundary.attributes['data-env-scale'], 'compact');
  assert.equal(textOf(boundary), 'Settings');
  assert.equal(firstElement(renderToString(h(Theme, { theme: 'light' }, 'x'))).tag, 'div');
});
