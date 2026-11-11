// MarkdownEditor's markup, rendered on the server: an application's className and style reach the
// editor's root, and the source's textarea keeps its own class.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass } from '../support/Markup.mjs';

const { MarkdownEditor } = await importSource('MarkdownEditor', 'packages/ui/src/markdown.ts');

test('className and style reach the root, and the textarea keeps its own class', () => {
  const root = firstElement(
    renderToStaticMarkup(
      h(MarkdownEditor, {
        label: 'Required source',
        name: 'requiredSource',
        required: true,
        className: 'required-markdown-editor',
        style: { maxInlineSize: '40rem' },
      }),
    ),
  );
  assert.ok(hasClass(root, 'env-markdown-editor'));
  assert.ok(hasClass(root, 'required-markdown-editor'));
  assert.equal(root.attributes.style, 'max-inline-size:40rem');
  const source = elementsOf(root).find((element) => element.tag === 'textarea');
  assert.equal(source.attributes.name, 'requiredSource');
  assert.ok(hasClass(source, 'env-markdown-editor-input'));
  assert.ok(!hasClass(source, 'required-markdown-editor'));
  assert.doesNotMatch(source.attributes.style ?? '', /max-inline-size/);
});
