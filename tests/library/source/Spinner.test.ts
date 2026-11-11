// Spinner's markup: hidden without a label, a progress bar named by one, and with showLabel a busy
// status with its label beside the arc, Loading by default in the provider's language.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Spinner, EnvUIProvider } = await importSource('Spinner', [
  "export { Spinner } from './packages/ui/src/feedback/Spinner.tsx';",
  "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

const render = (element) => firstElement(renderToStaticMarkup(element));
/** The label shown beside the arc, if the spinner shows one. */
const shownLabel = (spinner) =>
  elementsOf(spinner).find((element) => hasClass(element, 'env-spinner-label'));

test('a spinner without a label is hidden, and with one a progress bar it names', () => {
  const hidden = render(h(Spinner));
  assert.ok(hasClass(hidden, 'env-spinner'));
  assert.equal(hidden.attributes['aria-hidden'], 'true');
  assert.equal(hidden.attributes['data-label-hidden'], '');
  const named = render(h(Spinner, { label: 'Refreshing members' }));
  assert.equal(named.attributes.role, 'progressbar');
  assert.equal(named.attributes['aria-label'], 'Refreshing members');
  assert.equal(shownLabel(named), undefined);
});

test('with showLabel, a busy status shows the label beside the arc', () => {
  const spinner = render(h(Spinner, { label: 'Loading project', showLabel: true }));
  assert.ok(hasClass(spinner, 'env-spinner'));
  assert.equal(spinner.attributes.role, 'status');
  assert.equal(spinner.attributes['aria-busy'], 'true');
  assert.equal(spinner.attributes['data-size'], 'md');
  for (const element of elementsOf(spinner)) {
    assert.equal(element.attributes['aria-label'], undefined);
    assert.notEqual(element.attributes.role, 'progressbar');
  }
  const arc = elementsOf(spinner).find((element) => element.tag === 'svg');
  assert.equal(arc.attributes['aria-hidden'], 'true');
  assert.equal(textOf(shownLabel(spinner)), 'Loading project');
});

test("without a label, showLabel says Loading, in the provider's language", () => {
  assert.equal(textOf(shownLabel(render(h(Spinner, { showLabel: true })))), 'Loading');
  const translated = render(
    h(
      EnvUIProvider,
      { messages: { common: { loading: 'Wird geladen' } } },
      h(Spinner, { showLabel: true }),
    ),
  );
  assert.equal(textOf(shownLabel(translated)), 'Wird geladen');
});
