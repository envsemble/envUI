import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  buildParts,
  isPrivateState,
  partsFile,
  removedParts,
  serializeParts,
} from '../scripts/docs/GenerateParts.ts';

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
  assert.equal(state(card, 'data-layout'), undefined, 'the feature layout is a pattern');
  assert.deepEqual(state(component('Badge'), 'data-variant').values, ['outline', 'soft', 'solid']);
  assert.deepEqual(state(card, 'data-actions').values, ['']);
  // A class built from a value is expanded over the value's type.
  assert.ok(component('Avatar').parts.some((part) => part.class === 'env-avatar-fallback-person'));
  // The style sheets add the states Base UI sets, on the part they style.
  assert.deepEqual(state(component('Menu'), 'data-highlighted')?.parts, [
    'env-menu-choice',
    'env-menu-item',
  ]);
  // A component whose root is not env-<name> takes it from packages/ui/src/parts.json.
  assert.equal(component('Dialog').root, 'env-dialog');
});

test('a component lists its color properties, each registered so it does not inherit', () => {
  const colors = (name) => (component(name).colors ?? []).map((color) => color.property);
  assert.deepEqual(colors('Button'), [
    '--env-button-container',
    '--env-button-content',
    '--env-button-outline',
    '--env-button-selected',
    '--env-button-selected-content',
  ]);
  // IconButton is a Button, and takes its properties.
  assert.deepEqual(colors('IconButton'), colors('Button'));
  for (const name of ['Card', 'List', 'Drawer', 'TextField', 'Checkbox', 'Switch', 'Slider'])
    assert.ok(colors(name).length > 0, `${name} lists its color properties`);
  for (const entry of Object.values(parts.components))
    for (const color of entry.colors ?? []) {
      assert.match(color.property, /^--env-[a-z]+(?:-[a-z]+)*$/);
      assert.ok(color.description, `${color.property} has a description`);
    }
});

test('a color property that goes is reported until a major changeset names it', () => {
  const before = {
    components: {
      Button: {
        parts: [{ class: 'env-button' }],
        states: [],
        colors: [{ property: '--env-button-container' }, { property: '--env-button-outline' }],
      },
    },
  };
  const after = {
    components: {
      Button: {
        parts: [{ class: 'env-button' }],
        states: [],
        colors: [{ property: '--env-button-container' }],
      },
    },
  };
  assert.deepEqual(removedParts(before, after), [
    { label: 'Button: --env-button-outline', name: '--env-button-outline', recorded: false },
  ]);
  assert.equal(
    removedParts(before, after, [major('`--env-button-outline` is gone.')])[0].recorded,
    true,
  );
  assert.deepEqual(removedParts(before, before), []);
});

test('shared anatomy lists the components that render it', () => {
  const row = parts.shared.ListRow;
  assert.equal(row.root, 'env-list-row');
  assert.ok(row.usedBy.includes('Select'));
  assert.ok(component('Select').uses.includes('ListRow'));
});

test('a state set through a class name held in a variable is on that part', () => {
  // Reference.tsx sets `const className = 'env-rich-text-reference'` and then
  // `<span className={className} data-reference-id={…}>`.
  assert.deepEqual(state(component('RichText'), 'data-reference-id'), {
    attribute: 'data-reference-id',
    values: [],
    parts: ['env-rich-text-reference'],
  });
});

const major = (text) => `---\n'@envsemble/envui': major\n---\n\n${text}\n`;
const minor = (text) => `---\n'@envsemble/envui': minor\n---\n\n${text}\n`;

test('a part or state that goes is reported until a major changeset names it', () => {
  const before = {
    components: {
      Card: {
        parts: [{ class: 'env-card' }, { class: 'env-card-meta' }],
        states: [{ attribute: 'data-layout', values: ['feature', 'stack'], parts: ['env-card'] }],
      },
    },
    shared: {},
  };
  const after = {
    components: {
      Card: {
        parts: [{ class: 'env-card' }],
        states: [{ attribute: 'data-layout', values: ['stack'], parts: ['env-card'] }],
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
  const recorded = removedParts(before, after, [
    major('Card drops `env-card-meta` and `data-layout="feature"`.'),
  ]);
  assert.ok(recorded.every((item) => item.recorded));
  // A longer name that starts with the class doesn't name it.
  assert.ok(!removedParts(before, after, [major('Renames env-card-meta-text.')])[0].recorded);
  // A value needs its attribute and the value named, not the attribute alone.
  const value = (changesets) =>
    removedParts(before, after, changesets).find((item) => item.name === 'data-layout').recorded;
  assert.equal(value([major('Card drops `data-layout`.')]), false);
  assert.equal(value([major('Card drops `data-layout`.'), major('Lists lose `feature`.')]), false);
  assert.equal(value([major("Card's `data-layout` no longer takes `feature`.")]), true);
  // Only a major changeset of @envsemble/envui records a removal.
  const meta = (changesets) => removedParts(before, after, changesets)[0].recorded;
  assert.equal(meta([minor('Card drops `env-card-meta`.')]), false);
  assert.equal(meta(['Card drops `env-card-meta`.']), false);
  assert.equal(
    meta([`---\n'@envsemble/eslint-plugin-envui': major\n---\n\nCard drops \`env-card-meta\`.\n`]),
    false,
  );
  assert.equal(
    meta([
      `---\n"@envsemble/eslint-plugin-envui": minor\n"@envsemble/envui": major\n---\n\nCard drops \`env-card-meta\`.\n`,
    ]),
    true,
  );
});

test('a part that moves to another group, or a value list that becomes free-form, is not gone', () => {
  const before = {
    components: {
      Menu: {
        parts: [{ class: 'env-menu' }, { class: 'env-menu-row' }],
        states: [
          { attribute: 'data-tone', values: ['danger', 'neutral'], parts: ['env-menu-row'] },
          { attribute: 'data-size', values: ['small'], parts: ['env-menu'] },
        ],
      },
    },
    shared: {},
  };
  const after = {
    components: {
      Menu: {
        parts: [{ class: 'env-menu' }],
        states: [{ attribute: 'data-size', values: [], parts: ['env-menu'] }],
      },
    },
    shared: {
      ListRow: {
        parts: [{ class: 'env-menu-row' }],
        states: [
          { attribute: 'data-tone', values: ['danger', 'neutral'], parts: ['env-menu-row'] },
        ],
      },
    },
  };
  assert.deepEqual(removedParts(before, after), []);
  // A value the moved part no longer takes is still gone.
  after.shared.ListRow.states[0].values = ['neutral'];
  assert.deepEqual(
    removedParts(before, after).map(({ label }) => label),
    ["Menu: [data-tone='danger']"],
  );
});

test('data-env-ssr-* attributes are private, and the contract leaves them out', () => {
  assert.equal(isPrivateState('data-env-ssr-placement'), true);
  assert.equal(isPrivateState('data-env-theme-switching'), true);
  assert.equal(isPrivateState('data-stacked'), false);
  // PanelDock sets and styles them until it reads its layout; its public states stay.
  const dock = component('PanelDock');
  assert.ok(state(dock, 'data-stacked'));
  const groups = [...Object.values(parts.components), ...Object.values(parts.shared)];
  assert.deepEqual(
    groups.flatMap((group) => group.states.filter((item) => isPrivateState(item.attribute))),
    [],
  );
});
