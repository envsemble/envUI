import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildParts, partsFile, removedParts, serializeParts } from '../scripts/GenerateParts.mjs';

const { parts, problems } = buildParts();
const component = (name) => parts.components[name];
const state = (entry, attribute) => entry.states.find((item) => item.attribute === attribute);

test('docs/generated/parts.json matches the source, and every part has a description', () => {
  assert.deepEqual(problems, []);
  assert.equal(
    readFileSync(partsFile, 'utf8'),
    serializeParts(parts),
    'Run `npm run docs:parts` and commit docs/generated/parts.json.',
  );
});

test('a component lists its root, its part classes and the states it is styled by', () => {
  const card = component('Card');
  assert.equal(card.root, 'env-card');
  assert.equal(card.parts[0].class, 'env-card', 'the root comes first');
  assert.ok(card.parts.some((part) => part.class === 'env-card-header' && part.description));
  // Values come from the attribute's type, and "" is an attribute set without a value.
  assert.deepEqual(state(card, 'data-layout').values, ['feature', 'stack']);
  assert.deepEqual(state(card, 'data-actions').values, ['']);
  // A class built from a value is expanded over the value's type.
  assert.ok(component('Avatar').parts.some((part) => part.class === 'env-avatar-fallback-person'));
  // The style sheets add the states Base UI sets, on the part they style.
  assert.deepEqual(state(component('Menu'), 'data-highlighted')?.parts, ['env-menu-item']);
  // A component whose root is not env-<name> takes it from packages/ui/src/parts.json.
  assert.equal(component('Dialog').root, 'env-dialog-popup');
});

test('shared anatomy lists the components that render it', () => {
  const row = parts.shared.ListRow;
  assert.equal(row.root, 'env-list-row');
  assert.ok(row.usedBy.includes('Select'));
  assert.ok(component('Select').uses.includes('ListRow'));
});

test('a part or state that goes is reported until a changeset names it', () => {
  const before = {
    components: {
      Card: {
        parts: [{ class: 'env-card' }, { class: 'env-card-meta' }],
        states: [{ attribute: 'data-layout', values: ['feature', 'stack'] }],
      },
    },
    shared: {},
  };
  const after = {
    components: {
      Card: {
        parts: [{ class: 'env-card' }],
        states: [{ attribute: 'data-layout', values: ['stack'] }],
      },
    },
    shared: {},
  };
  assert.deepEqual(removedParts(before, before), []);
  assert.deepEqual(
    removedParts(before, after).map(({ label, recorded }) => [label, recorded]),
    [
      ['Card: .env-card-meta', false],
      ["Card: [data-layout='feature']", false],
    ],
  );
  const recorded = removedParts(before, after, 'Card drops `env-card-meta` and `data-layout`.');
  assert.ok(recorded.every((item) => item.recorded));
  // A longer name that starts with the class doesn't name it.
  assert.ok(!removedParts(before, after, 'Renames env-card-meta-text.')[0].recorded);
});
