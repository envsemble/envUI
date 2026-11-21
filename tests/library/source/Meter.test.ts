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

test('a meter or progress bar without a label or value text is a bare bar, named by aria-label, with no row above it', () => {
  for (const [Bar, name, role] of [
    [Progress, 'progress', 'progressbar'],
    [Meter, 'meter', 'meter'],
  ]) {
    const bare = render(h(Bar, { value: 30, 'aria-label': 'Uploading report.pdf' }));
    const bar = elementsOf(bare).find((each) => each.attributes.role === role);
    assert.equal(bar.attributes['aria-label'], 'Uploading report.pdf');
    assert.equal(bar.attributes['aria-labelledby'], undefined);
    assert.equal(
      elementsOf(bare).some((each) => hasClass(each, `env-${name}-header`)),
      false,
    );
    assert.equal(
      elementsOf(bare).some((each) => hasClass(each, `env-${name}-label`)),
      false,
    );
    const labelled = render(h(Bar, { value: 30, label: 'Uploading' }));
    assert.ok(elementsOf(labelled).some((each) => hasClass(each, `env-${name}-header`)));
  }
  const inline = render(h(Meter, { value: 30, layout: 'inline', 'aria-label': 'Storage' }));
  assert.equal(
    elementsOf(inline).some((each) => hasClass(each, 'env-meter-label')),
    false,
  );
});

test('an inline meter lays out its label, bar and value on one line, in that order', () => {
  const meter = withRole(
    h(Meter, { label: 'Storage', value: 40, valueText: '40%', layout: 'inline' }),
    'meter',
  );
  assert.equal(meter.attributes['data-layout'], 'inline');
  const parts = meter.children
    .filter((child) => typeof child !== 'string')
    .map((child) => child.attributes.class)
    .filter(Boolean);
  assert.deepEqual(parts, ['env-meter-label', 'env-meter-track', 'env-meter-value']);
  const stacked = withRole(h(Meter, { label: 'Storage', value: 40, valueText: '40%' }), 'meter');
  assert.equal(stacked.attributes['data-layout'], undefined);
  assert.ok(elementsOf(stacked).some((element) => hasClass(element, 'env-meter-header')));
});
