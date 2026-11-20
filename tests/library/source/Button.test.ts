import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement } from '../../support/Markup.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

const { Button, ConfirmButton, CopyButton, IconButton, Toolbar } = await importSource('Button', [
  "export * from './packages/ui/src/actions/Button.tsx';",
  "export * from './packages/ui/src/actions/ConfirmButton.tsx';",
  "export * from './packages/ui/src/actions/CopyButton.tsx';",
  "export * as Toolbar from './packages/ui/src/actions/Toolbar.tsx';",
]);

function emphasis(element: ReactElement) {
  return Object.fromEntries(
    elementsOf(firstElement(renderToString(element)))
      .filter((each) => each.tag === 'button')
      .map((button) => [
        button.attributes['data-testid'],
        [button.attributes['data-variant'], button.attributes['data-tone']],
      ]),
  );
}

const confirm = (testId: string) =>
  h(ConfirmButton, { confirmLabel: 'Remove', onConfirm() {}, 'data-testid': testId }, 'Remove');
const copy = (testId: string) =>
  h(CopyButton, { value: 'text', 'aria-label': 'Copy text', 'data-testid': testId });

test("a button takes its container's variant where it has the button's tone", () => {
  const toolbar = emphasis(
    h(
      Toolbar.Root,
      { 'aria-label': 'Emphasis' },
      h(Button, { tone: 'accent', 'data-testid': 'accent' }, 'Publish'),
      h(Button, { tone: 'danger', 'data-testid': 'danger' }, 'Delete'),
      confirm('confirm'),
      copy('copy'),
    ),
  );
  assert.deepEqual(toolbar.accent, ['primary', 'accent']);
  assert.deepEqual(toolbar.danger, ['ghost', 'danger']);
  assert.deepEqual(toolbar.confirm, ['ghost', 'neutral']);
  assert.deepEqual(toolbar.copy, ['ghost', 'neutral']);
  const resting = emphasis(h('div', null, confirm('confirm'), copy('copy')));
  assert.deepEqual(resting.confirm, ['outline', 'neutral']);
  assert.deepEqual(resting.copy, ['secondary', 'neutral']);
});

test('a pair no variant is designed in renders neutral, and is reported', (context) => {
  const errors: string[] = [];
  context.mock.method(console, 'error', (...args: unknown[]) => errors.push(args.join(' ')));
  const undesignedPairPastTheTypes = emphasis(
    h(Button, { variant: 'secondary', tone: 'danger', 'data-testid': 'undesigned' }, 'Undesigned'),
  );
  assert.deepEqual(undesignedPairPastTheTypes.undesigned, ['secondary', 'neutral']);
  assert.equal(
    errors.filter((text) => text.includes('a secondary button has no danger tone')).length,
    1,
  );
});

test('a button shows one start slot before its label, hidden from assistive technology', () => {
  for (const content of [
    h('span', { className: 'avatar' }, 'PS'),
    h('svg', { className: 'env-icon-symbol' }),
  ]) {
    const root = firstElement(renderToString(h(Button, { start: content }, 'Assign')));
    const [start, label, ...rest] = root.children.filter((child) => typeof child !== 'string');
    assert.equal(start.attributes.class, 'env-button-start');
    assert.equal(start.attributes['aria-hidden'], 'true');
    assert.ok(!elementsOf(start).some((element) => element.attributes.class === 'env-icon'));
    assert.equal(label.attributes.class, 'env-button-label');
    assert.deepEqual(rest, []);
  }
});

test("a button renders as another element with the button's look, content and state", () => {
  const upload = firstElement(
    renderToString(
      h(
        Button,
        { render: h('label', { htmlFor: 'logo', className: 'own' }), variant: 'secondary' },
        'Upload',
      ),
    ),
  );
  assert.equal(upload.tag, 'label');
  assert.equal(upload.attributes.for, 'logo');
  assert.equal(upload.attributes.class, 'env-button own');
  assert.equal(upload.attributes['data-variant'], 'secondary');
  assert.equal(upload.attributes.type, undefined);
  assert.ok(elementsOf(upload).some((element) => element.attributes.class === 'env-button-label'));
  const off = firstElement(
    renderToString(h(Button, { render: h('label'), disabled: true }, 'Upload')),
  );
  assert.equal(off.attributes['aria-disabled'], 'true');
  assert.equal(off.attributes.disabled, undefined);
});

test("an icon button renders as another element, such as a file input's label, with its look and icon", () => {
  const attach = firstElement(
    renderToString(
      h(IconButton, {
        render: h('label', { htmlFor: 'files' }),
        icon: h('svg'),
        'aria-label': 'Attach files',
        variant: 'ghost',
      }),
    ),
  );
  assert.equal(attach.tag, 'label');
  assert.equal(attach.attributes.for, 'files');
  assert.equal(attach.attributes.class, 'env-button env-icon-button');
  assert.equal(attach.attributes['aria-label'], 'Attach files');
  assert.equal(attach.attributes['data-variant'], 'ghost');
  assert.equal(attach.attributes.type, undefined);
  assert.ok(elementsOf(attach).some((element) => element.attributes.class === 'env-button-icon'));
});
