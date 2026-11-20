import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildParts, serializeParts } from '../../scripts/docs/parts/Contract.ts';
import { partsFile } from '../../scripts/RepositoryPaths.ts';
import { removedParts } from '../../scripts/docs/parts/ContractComparison.ts';
import { isPrivateState } from '../../scripts/docs/parts/Library.ts';

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
  assert.equal(state(card, 'data-layout'), undefined, 'the feature layout is a pattern');
  assert.deepEqual(state(component('Badge'), 'data-variant').values, ['outline', 'soft', 'solid']);
  assert.deepEqual(state(card, 'data-actions').values, ['']);
  assert.ok(component('Avatar').parts.some((part) => part.class === 'env-avatar-fallback-person'));
  assert.deepEqual(state(component('Menu'), 'data-highlighted')?.parts, [
    'env-menu-choice',
    'env-menu-item',
  ]);
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
  assert.deepEqual(colors('IconButton'), colors('Button'));
  for (const name of [
    'Card',
    'List',
    'NavigationDrawer',
    'TextField',
    'Checkbox',
    'Switch',
    'Slider',
  ])
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
  assert.deepEqual(state(component('Menu'), 'data-tone'), {
    attribute: 'data-tone',
    values: ['danger', 'neutral'],
    parts: ['env-menu-item'],
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
  assert.ok(!removedParts(before, after, [major('Renames env-card-meta-text.')])[0].recorded);
  const value = (changesets) =>
    removedParts(before, after, changesets).find((item) => item.name === 'data-layout').recorded;
  assert.equal(value([major('Card drops `data-layout`.')]), false);
  assert.equal(value([major('Card drops `data-layout`.'), major('Lists lose `feature`.')]), false);
  assert.equal(value([major("Card's `data-layout` no longer takes `feature`.")]), true);
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
  const table = component('Table');
  assert.ok(state(table, 'data-stacked'));
  const groups = [...Object.values(parts.components), ...Object.values(parts.shared)];
  assert.deepEqual(
    groups.flatMap((group) => group.states.filter((item) => isPrivateState(item.attribute))),
    [],
  );
});

test('a part that goes counts as removed only when the last release shipped it', () => {
  const card = (parts, values) => ({
    components: {
      Card: {
        parts: parts.map((name) => ({ class: name })),
        states: [{ attribute: 'data-layout', values, parts: ['env-card'] }],
        colors: [{ property: '--env-card-container' }],
      },
    },
    shared: {},
  });
  const released = card(['env-card', 'env-card-meta'], ['stack']);
  const before = card(['env-card', 'env-card-meta', 'env-card-badge'], ['stack', 'feature']);
  const after = {
    components: { Card: { parts: [{ class: 'env-card' }], states: [] } },
    shared: {},
  };
  const labels = (release) => removedParts(before, after, [], release).map(({ label }) => label);
  assert.deepEqual(labels(released), [
    'Card: .env-card-meta',
    'Card: --env-card-container',
    'Card: [data-layout]',
    "Card: [data-layout='stack']",
  ]);
  assert.deepEqual(labels(undefined), [
    'Card: .env-card-meta',
    'Card: .env-card-badge',
    'Card: --env-card-container',
    'Card: [data-layout]',
    "Card: [data-layout='stack']",
    "Card: [data-layout='feature']",
  ]);
});

const stateAttributeParts = {
  'data-active': ['env-document-tabs-item'],
  'data-current': [
    'env-navigation-bar-item',
    'env-navigation-drawer-item',
    'env-navigation-rail-item',
  ],
  'data-selected': [
    'env-avatar',
    'env-color-picker-swatch',
    'env-combobox-item',
    'env-connected-row',
    'env-list-item',
    'env-list-row',
    'env-select-item',
  ],
  'data-highlighted': [
    'env-list-row',
    'env-menu-choice',
    'env-menu-item',
    'env-select-item',
    'env-tree-item',
  ],
};

test('each of the four state attributes keeps one meaning, on the parts reviewed for it', () => {
  const carriers = Object.fromEntries(
    Object.keys(stateAttributeParts).map((attribute) => [attribute, new Set<string>()]),
  );
  for (const entry of [...Object.values(parts.components), ...Object.values(parts.shared)])
    for (const { attribute, parts: styled } of entry.states)
      for (const part of styled) carriers[attribute]?.add(part);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(carriers).map(([attribute, styled]) => [attribute, [...styled].sort()]),
    ),
    stateAttributeParts,
    'data-active marks what shows, data-current the page’s destination, data-selected what is chosen and data-highlighted the list’s cursor: give a part the one that means its state, then list it in stateAttributeParts.',
  );
});
