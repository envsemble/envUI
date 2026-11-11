// Alert's markup: a status or no live region by tone, an alert only when it announces, its icon
// unless turned off, and a dismiss button on request. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Alert } = await importSource('Alert', [
  'export * from "./packages/ui/src/feedback/Alert.tsx";',
]);

const render = (props, children = 'The message.') =>
  firstElement(renderToString(h(Alert, props, children)));

test('notices use status and alert roles by tone, with an icon and a dismiss button on request', () => {
  // Information and success are polite status messages.
  assert.equal(render({ title: 'Sync paused' }).attributes.role, 'status');
  assert.equal(render({ tone: 'success' }).attributes.role, 'status');
  // Warnings and errors present from the start are not live regions.
  const blocked = render({
    tone: 'warning',
    title: 'Blocked',
    actions: h('a', { href: '#b' }, 'Show blockers'),
  });
  assert.equal(blocked.attributes.role, undefined);
  assert.equal(render({ tone: 'danger' }).attributes.role, undefined);
  assert.ok(
    elementsOf(blocked).some(
      (element) => element.tag === 'a' && textOf(element) === 'Show blockers',
    ),
  );
  const icon = elementsOf(blocked).find((element) => hasClass(element, 'env-alert-icon'));
  assert.equal(elementsOf(icon).filter((element) => element.tag === 'svg').length, 1);
  assert.ok(
    !elementsOf(render({ tone: 'info', icon: false })).some((element) => element.tag === 'svg'),
  );
  // One that announces, such as a failure after an action, is an alert.
  const failed = render({ tone: 'danger', announce: true, title: 'Save failed' });
  assert.equal(failed.attributes.role, 'alert');
  assert.match(textOf(failed), /Save failed/);
  const dismiss = elementsOf(render({ tone: 'danger', onDismiss() {} })).find((element) =>
    hasClass(element, 'env-alert-dismiss'),
  );
  assert.equal(dismiss.tag, 'button');
  assert.equal(dismiss.attributes['aria-label'], 'Dismiss');
});
