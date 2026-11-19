import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Meter, Progress } = await importSource('Meter', [
  "export { Meter } from './packages/ui/src/data-display/Meter.tsx';",
  "export { Progress } from './packages/ui/src/feedback/Progress.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const withRole = (element, role) =>
  elementsOf(render(element)).find((each) => each.attributes.role === role);

test('meters and progress bars read their values, Base UI’s formatted value by default and Loading while indeterminate', () => {
  const storage = withRole(h(Meter, { label: 'Storage used', value: 40 }), 'meter');
  assert.equal(storage.attributes['aria-valuenow'], '40');
  assert.match(storage.attributes['aria-valuetext'], /40/);
  assert.ok(hasClass(storage, 'env-meter'));
  const seats = withRole(
    h(Meter, { label: 'Seats assigned', value: 2, max: 5, 'aria-valuetext': '2 of 5 seats' }),
    'meter',
  );
  assert.equal(seats.attributes['aria-valuetext'], '2 of 5 seats');

  const importing = withRole(h(Progress, { label: 'Importing', value: null }), 'progressbar');
  assert.equal(importing.attributes['aria-valuenow'], undefined);
  assert.equal(importing.attributes['aria-valuetext'], 'Loading');
  assert.equal(importing.attributes['data-indeterminate'], '');
  const uploading = withRole(h(Progress, { label: 'Uploading', value: 30 }), 'progressbar');
  assert.match(uploading.attributes['aria-valuetext'], /30/);
});

test('a progress bar without a label or value text is a bare bar, named by aria-label, with no row above it', () => {
  const bare = render(h(Progress, { value: 30, 'aria-label': 'Uploading report.pdf' }));
  const bar = elementsOf(bare).find((each) => each.attributes.role === 'progressbar');
  assert.equal(bar.attributes['aria-label'], 'Uploading report.pdf');
  assert.equal(
    elementsOf(bare).some((each) => hasClass(each, 'env-progress-header')),
    false,
  );
  assert.equal(
    elementsOf(bare).some((each) => hasClass(each, 'env-progress-label')),
    false,
  );
  const labelled = render(h(Progress, { value: 30, label: 'Uploading' }));
  assert.ok(elementsOf(labelled).some((each) => hasClass(each, 'env-progress-header')));
});
