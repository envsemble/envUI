// A button's variant and tone from its container: a toolbar's ghost default where it has the
// button's tone, followed by ConfirmButton and CopyButton, and a pair no variant is designed in
// rendered neutral and reported. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement } from '../../support/Markup.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

const { Button, ConfirmButton, CopyButton, Toolbar } = await importSource('Button', [
  "export * from './packages/ui/src/actions/Button.tsx';",
  "export * from './packages/ui/src/actions/ConfirmButton.tsx';",
  "export * from './packages/ui/src/actions/CopyButton.tsx';",
  "export * as Toolbar from './packages/ui/src/actions/Toolbar.tsx';",
]);

/** The variant and tone of each button in the markup, by its data-testid. */
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
  // Ghost has danger but no accent: an accent button stays the primary accent one.
  assert.deepEqual(toolbar.accent, ['primary', 'accent']);
  assert.deepEqual(toolbar.danger, ['ghost', 'danger']);
  // ConfirmButton and CopyButton follow the toolbar, and else rest outline and secondary.
  assert.deepEqual(toolbar.confirm, ['ghost', 'neutral']);
  assert.deepEqual(toolbar.copy, ['ghost', 'neutral']);
  const resting = emphasis(h('div', null, confirm('confirm'), copy('copy')));
  assert.deepEqual(resting.confirm, ['outline', 'neutral']);
  assert.deepEqual(resting.copy, ['secondary', 'neutral']);
});

test('a pair no variant is designed in renders neutral, and is reported', (context) => {
  const errors: string[] = [];
  context.mock.method(console, 'error', (...args: unknown[]) => errors.push(args.join(' ')));
  // Past the types on purpose: the undesigned pair the runtime check must catch.
  const pair = emphasis(
    h(Button, { variant: 'secondary', tone: 'danger', 'data-testid': 'undesigned' }, 'Undesigned'),
  );
  assert.deepEqual(pair.undesigned, ['secondary', 'neutral']);
  assert.equal(
    errors.filter((text) => text.includes('a secondary button has no danger tone')).length,
    1,
  );
});
