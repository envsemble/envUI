import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { documentationDirectory } from '../../../scripts/RepositoryPaths.ts';

type PropsFile = {
  exports: Record<string, { props?: { name: string; default?: string }[] }>;
};

const { exports } = JSON.parse(
  await readFile(join(documentationDirectory, 'generated/props.json'), 'utf8'),
) as PropsFile;

const namedOtherwise: Record<string, string> = {
  'SearchField placeholder': 'It is the input’s placeholder attribute.',
  'Pager.Previous label': 'Each part takes one of the pager’s two keys as its label.',
  'Pager.Next label': 'Each part takes one of the pager’s two keys as its label.',
  'Panes.ResizeHandle label': 'It is the handle’s accessible name.',
  'Table.HeaderCell sortLabel': 'It stands for two keys, sortAscending and sortDescending.',
  'CommandPalette emptyLabel': 'It stands for two keys, emptyQuery and empty.',
  'CommandPalette emptyDescription': 'It overrides emptyHint, the empty state’s description.',
};

const messageKey = /messages\.\w+\.(\w+)/;

function namedAfterItsKey(name: string, key: string) {
  if (key === 'label') return name === 'label' || name === 'aria-label';
  return name === `${key}Label`;
}

test('a prop that overrides a built-in string is named after its key, <key>Label', () => {
  const overrides = Object.entries(exports).flatMap(([component, { props = [] }]) =>
    props.flatMap(({ name, default: fallback }) => {
      const key = fallback?.match(messageKey)?.[1];
      return key === undefined ? [] : [{ prop: `${component} ${name}`, name, key }];
    }),
  );
  assert.ok(
    overrides.some(({ prop }) => prop === 'CopyButton copiedLabel'),
    'props.json gives the messages a prop overrides as its default',
  );
  const misnamed = overrides
    .filter(({ prop, name, key }) => !namedAfterItsKey(name, key) && !(prop in namedOtherwise))
    .map(({ prop, key }) => `${prop} overrides ${key}: name it ${key}Label`);
  assert.deepEqual(misnamed, []);
  const stale = Object.keys(namedOtherwise).filter(
    (prop) => !overrides.some((override) => override.prop === prop),
  );
  assert.deepEqual(stale, [], 'These no longer override a message: remove them from the list.');
});
