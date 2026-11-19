import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Alert } = await importSource('Alert', [
  'export * from "./packages/ui/src/feedback/Alert.tsx";',
]);

const render = (props: Record<string, unknown>, children = 'The message.') =>
  firstElement(renderToString(h(Alert, props, children)));

test('notices use status and alert roles by tone, with an icon and a dismiss button on request', () => {
  assert.equal(render({ title: 'Sync paused' }).attributes.role, 'status');
  assert.equal(render({ tone: 'success' }).attributes.role, 'status');
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
  assert.ok(icon);
  assert.equal(elementsOf(icon).filter((element) => element.tag === 'svg').length, 1);
  assert.ok(
    !elementsOf(render({ tone: 'info', icon: false })).some((element) => element.tag === 'svg'),
  );
  const failed = render({ tone: 'danger', announce: true, title: 'Save failed' });
  assert.equal(failed.attributes.role, 'alert');
  assert.match(textOf(failed), /Save failed/);
  const dismiss = elementsOf(render({ tone: 'danger', onDismiss() {} })).find((element) =>
    hasClass(element, 'env-alert-dismiss'),
  );
  assert.ok(dismiss);
  assert.equal(dismiss.tag, 'button');
  assert.equal(dismiss.attributes['aria-label'], 'Dismiss');
});

test('a title takes content, and actions at the end sit in the row after the message, outside its column', () => {
  const alert = render({
    title: h('span', null, 'Deploy of ', h('code', null, 'main'), ' failed'),
    actions: h('button', null, 'Retry'),
    actionsPlacement: 'end',
  });
  const title = elementsOf(alert).find((element) => hasClass(element, 'env-alert-title'))!;
  assert.equal(textOf(title), 'Deploy of main failed');
  assert.ok(elementsOf(title).some((element) => element.tag === 'code'));
  const row = elementsOf(alert).find((element) => hasClass(element, 'env-alert-row'))!;
  const [content, action] = row.children as (typeof alert)[];
  assert.ok(hasClass(content, 'env-alert-content'));
  assert.ok(hasClass(action, 'env-alert-action'));
  assert.ok(!elementsOf(content).some((element) => hasClass(element, 'env-alert-action')));
  const below = render({ actions: h('button', null, 'Retry') });
  assert.equal(
    elementsOf(below).some((element) => hasClass(element, 'env-alert-row')),
    false,
  );
  const belowContent = elementsOf(below).find((element) => hasClass(element, 'env-alert-content'))!;
  assert.ok(elementsOf(belowContent).some((element) => hasClass(element, 'env-alert-action')));
});
