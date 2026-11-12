// CopyButton's markup: the name it falls back to when it has no words of its own. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { firstElement, hasClass } from '../../support/Markup.ts';

const { CopyButton } = await importSource('CopyButton', [
  "export { CopyButton } from './packages/ui/src/actions/CopyButton.tsx';",
]);

test('a copy button without words or a name of its own is named Copy, and icon-only', () => {
  // An empty label, a label of no elements, and a blank aria-label leave the default name.
  for (const [props, name] of [
    [{ children: '' }, 'Copy'],
    [{ children: [] }, 'Copy'],
    [{ 'aria-label': ' ' }, 'Copy'],
    [{ 'aria-label': '', copyLabel: 'Kopieren' }, 'Kopieren'],
  ] as const) {
    const button = firstElement(renderToStaticMarkup(h(CopyButton, { value: 'Text', ...props })));
    assert.equal(button.tag, 'button');
    assert.equal(button.attributes['aria-label'], name, JSON.stringify(props));
    // A label without words leaves the button icon-only, its name in the tooltip.
    assert.ok(hasClass(button, 'env-icon-button'), JSON.stringify(props));
  }
});
