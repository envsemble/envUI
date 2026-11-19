import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';

const { AvatarGroup } = await importSource('AvatarGroup', 'packages/ui/src/index.ts');

const people = [
  ['alex', 'Alex Morgan'],
  ['sam', 'Sam Lee'],
  ['priya', 'Priya Shah'],
  ['jordan', 'Jordan Rivera'],
  ['taylor', 'Taylor Kim'],
].map(([id, name]) => ({ id, name, fallback: 'person' }));

function group(props) {
  const markup = renderToStaticMarkup(h(AvatarGroup, props));
  if (markup === '') return null;
  const root = firstElement(markup);
  const all = elementsOf(root);
  const overflow = all.find((element) => hasClass(element, 'env-avatar-group-overflow'));
  return {
    role: root.attributes.role,
    name: root.attributes['aria-label'],
    avatars: all.filter((element) => hasClass(element, 'env-avatar')),
    buttons: all.filter((element) => element.tag === 'button').length,
    count: overflow && textOf(overflow),
  };
}

test('an avatar group names everyone and counts the people it does not show', () => {
  const decorative = group({ people, max: 3 });
  assert.equal(decorative.role, 'group');
  assert.equal(
    decorative.name,
    '5 people: Alex Morgan, Sam Lee, Priya Shah, Jordan Rivera, Taylor Kim',
  );
  assert.equal(decorative.avatars.length, 3);
  assert.equal(decorative.avatars[0].attributes['aria-hidden'], 'true');
  assert.equal(decorative.buttons, 0);
  assert.equal(decorative.count, '+2');

  const preview = group({ people: people.slice(0, 3), total: 12, max: 2, size: 'sm' });
  assert.equal(preview.name, '12 people: Alex Morgan, Sam Lee, Priya Shah, 9 more');
  assert.equal(preview.avatars.length, 2);
  assert.equal(preview.count, '+10');
  const named = group({ 'aria-label': 'Report editors', people: people.slice(0, 2) });
  assert.equal(named.name, 'Report editors');
  assert.equal(named.count, undefined);
  const localized = group({
    people: people.slice(0, 1),
    total: 4,
    formatMore: (count) => `${count} weitere`,
  });
  assert.equal(localized.name, '4 people: Alex Morgan, 3 weitere');
  assert.equal(group({ people: [] }), null);
  for (const counts of [
    { total: Number.NaN, max: Number.NaN },
    { total: Number.POSITIVE_INFINITY, max: null },
  ]) {
    const passed = group({ people: people.slice(0, 2), ...counts });
    assert.equal(passed.name, '2 people: Alex Morgan, Sam Lee');
    assert.equal(passed.avatars.length, 2);
    assert.equal(passed.count, undefined);
  }
  assert.equal(
    group({
      people,
      max: 2,
      formatMore: (count) => `${count} weitere`,
      formatLabel: (count, names) =>
        `${count} ${count === 1 ? 'Person' : 'Personen'}: ${names.join(', ')}`,
    }).name,
    '5 Personen: Alex Morgan, Sam Lee, Priya Shah, Jordan Rivera, Taylor Kim',
  );
});

test("a person's itemProps reach their avatar, or its link or button, with the class joined", () => {
  const tagged = (person) => ({
    ...person,
    itemProps: { 'data-testid': person.id, className: 'is-owner', title: person.name },
  });
  const still = elementsOf(
    firstElement(renderToStaticMarkup(h(AvatarGroup, { people: people.slice(0, 2).map(tagged) }))),
  ).filter((element) => hasClass(element, 'env-avatar'));
  assert.deepEqual(
    still.map((avatar) => avatar.attributes['data-testid']),
    ['alex', 'sam'],
  );
  assert.ok(still.every((avatar) => hasClass(avatar, 'is-owner')));
  assert.equal(still[0].attributes['aria-hidden'], 'true');

  const pressable = elementsOf(
    firstElement(
      renderToStaticMarkup(
        h(AvatarGroup, {
          people: [tagged({ ...people[0], href: '/people/alex' }), tagged(people[1])],
          onPersonClick() {},
        }),
      ),
    ),
  ).filter((element) => hasClass(element, 'env-avatar-group-item'));
  assert.deepEqual(
    pressable.map((item) => [
      item.tag,
      item.attributes['data-testid'],
      item.attributes['aria-label'],
    ]),
    [
      ['a', 'alex', 'Alex Morgan'],
      ['button', 'sam', 'Sam Lee'],
    ],
  );
  assert.ok(pressable.every((item) => hasClass(item, 'is-owner')));
});
