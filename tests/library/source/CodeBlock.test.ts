import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import {
  elementsOf,
  firstElement,
  hasClass,
  textOf,
  type MarkupElement,
} from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { CodeBlock } = await importSource('CodeBlock', [
  "export { CodeBlock } from './packages/ui/src/content/CodeBlock.tsx';",
]);

const render = (props: Record<string, unknown>) =>
  firstElement(renderToStaticMarkup(h(CodeBlock, props, 'npm install')));
const pre = (root: MarkupElement) => {
  const found = elementsOf(root).find((element) => element.tag === 'pre');
  assert.ok(found);
  return found;
};

test('a label takes any content and names the code, and headerEnd sits before the copy button', () => {
  const root = render({
    label: h('a', { href: '/files/install.sh' }, 'install.sh'),
    headerEnd: h('button', { type: 'button' }, 'Run'),
    copyable: true,
  });
  const [header] = elementsOf(root).filter((element) => hasClass(element, 'env-code-block-header'));
  assert.ok(elementsOf(header).some((element) => element.tag === 'a'));
  const labelId = pre(root).attributes['aria-labelledby'];
  assert.ok(labelId);
  const label = elementsOf(header).find((element) => element.attributes.id === labelId);
  assert.ok(label);
  assert.equal(textOf(label), 'install.sh');
  assert.equal(pre(root).attributes['aria-label'], undefined);
  const buttons = elementsOf(header).filter((element) => element.tag === 'button');
  assert.deepEqual(
    buttons.map((button) => button.attributes['aria-label'] ?? textOf(button)),
    ['Run', 'Copy code'],
  );
  assert.equal(
    elementsOf(header).filter((element) => hasClass(element, 'env-code-block-header-end')).length,
    1,
  );
});

test('code without a label takes the generic name of its language', () => {
  const code = pre(render({ copyable: true }));
  assert.equal(code.attributes['aria-label'], 'Plain text code');
  assert.equal(code.attributes['aria-labelledby'], undefined);
});
