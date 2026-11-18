import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement } from '../../support/Markup.ts';

const { Toolbar } = await importSource('Toolbar', 'packages/ui/src/index.ts');

const icon = h('svg');
function controls(props: Record<string, unknown>, ...children: ReactNode[]) {
  const toolbar = firstElement(renderToStaticMarkup(h(Toolbar.Root, props, ...children)));
  return Object.fromEntries(
    elementsOf(toolbar)
      .filter((element) => element.attributes['aria-label'] && element !== toolbar)
      .map((element) => [element.attributes['aria-label'], element]),
  );
}

test('a toolbar announces shortcuts in ARIA key names and shows no tooltip while disabled', () => {
  const { Redo, Strong } = controls(
    { 'aria-label': 'Partly disabled' },
    h(Toolbar.Button, { icon, label: 'Redo', shortcut: 'Ctrl+K Ctrl+Z' }),
    h(Toolbar.Button, { icon, label: 'Strong', shortcut: '⌘B' }),
  );
  assert.equal(Redo.attributes['aria-keyshortcuts'], undefined);
  assert.equal(Strong.attributes['aria-keyshortcuts'], 'Meta+B');
  const { Highlight } = controls(
    { 'aria-label': 'Disabled toolbar', disabled: true },
    h(Toolbar.Button, { icon, label: 'Highlight', shortcut: 'Ctrl+Shift+B' }),
  );
  assert.equal(Highlight.attributes['aria-keyshortcuts'], 'Control+Shift+B');
  assert.equal(Highlight.attributes.disabled, '');
  assert.equal(Highlight.attributes['data-base-ui-tooltip-trigger'], undefined);
  assert.equal(Strong.attributes['data-base-ui-tooltip-trigger'], '');
});

test('a disabled toolbar disables its links too', () => {
  const { Shortcuts } = controls(
    { 'aria-label': 'Disabled toolbar', disabled: true },
    h(Toolbar.Link, { href: '#shortcuts', icon, label: 'Shortcuts' }),
  );
  assert.equal(Shortcuts.attributes['aria-disabled'], 'true');
  assert.equal(Shortcuts.attributes.href, undefined);
  assert.equal(Shortcuts.attributes.tabindex, '-1');
  const { Help } = controls(
    { 'aria-label': 'Formatting' },
    h(Toolbar.Link, { href: '#help', icon, label: 'Help' }),
  );
  assert.equal(Help.attributes.href, '#help');
});
