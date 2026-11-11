// MonthPicker's states in its markup: disabled, read-only, and invalid with its error describing the
// field. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, findElement, firstElement } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { MonthPicker } = await importSource('MonthPicker', [
  "export { MonthPicker } from './packages/ui/src/forms/MonthPicker.tsx';",
]);

/** The rendered field and its trigger, the combobox that opens the months. */
function render(props: Record<string, unknown>) {
  const root = firstElement(renderToString(h(MonthPicker, { locale: 'en-GB', ...props })));
  return [root, findElement(root, (element) => element.attributes.role === 'combobox')] as const;
}

test('disabled, read-only and invalid fields', () => {
  const [, disabled] = render({ label: 'Disabled month', defaultValue: '2026-10', disabled: true });
  assert.equal(disabled.attributes.disabled, '');
  const [, readOnly] = render({
    label: 'Read only month',
    defaultValue: '2026-10',
    readOnly: true,
  });
  assert.equal(readOnly.attributes['aria-readonly'], 'true');
  const [root, invalid] = render({ label: 'Invalid month', error: 'Choose a later month.' });
  assert.equal(invalid.attributes['aria-invalid'], 'true');
  assert.deepEqual(descriptions(root, invalid), ['Choose a later month.']);
});
