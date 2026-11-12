// AvatarGroup's markup, rendered on the server: a group named after everyone in it, which counts
// the people it does not show.
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

/** The group's name, its avatars and its count. */
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
  // Decorative avatars leave the names to the group.
  assert.equal(decorative.avatars.length, 3);
  assert.equal(decorative.avatars[0].attributes['aria-hidden'], 'true');
  assert.equal(decorative.buttons, 0);
  assert.equal(decorative.count, '+2');

  // A preview of twelve counts those it cannot name.
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
  // Missing numbers count and show everyone passed; so do an endless total and a max of null.
  for (const counts of [
    { total: Number.NaN, max: Number.NaN },
    { total: Number.POSITIVE_INFINITY, max: null },
  ]) {
    const passed = group({ people: people.slice(0, 2), ...counts });
    assert.equal(passed.name, '2 people: Alex Morgan, Sam Lee');
    assert.equal(passed.avatars.length, 2);
    assert.equal(passed.count, undefined);
  }
  // formatLabel names the group in another language.
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
