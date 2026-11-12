// A Tooltip around a component that takes its control as an element `trigger` moves onto that
// trigger, which it knows by the component's mark (packages/ui/src/internal/trigger/triggerOwner.ts).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { createElement as h, lazy, type ComponentType } from 'react';
import { documentationDirectory } from '../../../scripts/RepositoryPaths.ts';
import { importSource } from '../../support/ImportSource.ts';

type Owner = (type: unknown, props?: { trigger?: unknown }) => boolean;

const { ui, isTriggerOwner } = await importSource<{
  ui: Record<string, unknown>;
  isTriggerOwner: Owner;
}>('TriggerOwner', [
  "export * as ui from './packages/ui/src/index.ts';",
  "export { isTriggerOwner } from './packages/ui/src/internal/trigger/triggerOwner.ts';",
]);

type PropsFile = {
  exports: Record<string, { props?: { name: string; type: string }[] }>;
};

const { exports } = JSON.parse(
  await readFile(join(documentationDirectory, 'generated/props.json'), 'utf8'),
) as PropsFile;

test('every component with an element trigger is marked as its owner', () => {
  const owners = Object.entries(exports)
    .filter(([, { props }]) =>
      props?.some(({ name, type }) => name === 'trigger' && type === 'ReactElement'),
    )
    .map(([name]) => name);
  assert.ok(owners.includes('Popover'), 'props.json lists the components with a trigger');
  const unmarked = owners.filter(
    (name) =>
      !isTriggerOwner(
        name
          .split('.')
          .reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], ui),
        {},
      ),
  );
  assert.deepEqual(unmarked, [], 'Mark these with markTriggerOwner.');
});

test("a component that React's lazy loads reads as its owner once loaded", async () => {
  let load!: (module: { default: ComponentType }) => void;
  const module = new Promise<{ default: ComponentType }>((resolve) => (load = resolve));
  const type = lazy(() => module);
  const trigger = h('button', { type: 'button' });
  // While it loads, an element trigger stands for the mark.
  assert.equal(isTriggerOwner(type, { trigger }), true);
  assert.equal(isTriggerOwner(type, {}), false);
  load({ default: ui.Popover as ComponentType });
  await module;
  assert.equal(isTriggerOwner(type, {}), true);
});
