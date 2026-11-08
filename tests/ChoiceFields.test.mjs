// Choice controls take a field's words: RadioGroup a description and an error, Checkbox and Switch
// a description, Slider an error, each linked to the control. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from './support/importSource.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { RadioGroup, Radio, Checkbox, Switch, Slider } = await importSource('ChoiceFields', [
  "export * from './packages/ui/src/forms/Radio.tsx';",
  "export * from './packages/ui/src/forms/Checkbox.tsx';",
  "export * from './packages/ui/src/forms/Switch.tsx';",
  "export * from './packages/ui/src/forms/Slider.tsx';",
]);

const describedText = (markup, element) => {
  const ids = new RegExp(`<${element}[^>]*aria-describedby="([^"]+)"`).exec(markup)?.[1];
  assert.ok(ids, `the ${element} is described`);
  // The text of each describing element, past an icon before it, such as an error's.
  return ids
    .split(' ')
    .map(
      (id) =>
        new RegExp(`id="${id}"[^>]*>(?:<svg.*?</svg>)?(?:<span[^>]*>)?([^<]*)<`).exec(markup)?.[1],
    );
};

test('a radio group is described by its description and its error, in that order', () => {
  const markup = renderToString(
    h(
      RadioGroup,
      { label: 'Visibility', description: 'Who sees the plan.', error: 'Choose who sees it.' },
      h(Radio, { value: 'team', label: 'Team' }),
    ),
  );
  assert.deepEqual(describedText(markup, 'fieldset'), [
    'Who sees the plan.',
    'Choose who sees it.',
  ]);
});

test('a controlled radio group with a null value has no option chosen', () => {
  const markup = renderToString(
    h(
      RadioGroup,
      { label: 'Visibility', value: null, defaultValue: 'team' },
      h(Radio, { value: 'team', label: 'Team' }),
    ),
  );
  assert.doesNotMatch(markup, /checked=""/);
});

test('a checkbox and a switch read their description with their label', () => {
  for (const Control of [Checkbox, Switch]) {
    const markup = renderToString(
      h(Control, { label: 'Weekly digest', description: 'Every Monday morning.' }),
    );
    assert.match(
      markup,
      /-label">Weekly digest<small class="env-(checkbox|switch)-description">Every Monday morning\.<\/small>/,
    );
  }
});

test('a slider is described by its error', () => {
  const markup = renderToString(h(Slider, { label: 'Budget', error: 'Keep it under 80%.' }));
  assert.match(markup, /Keep it under 80%\./);
  assert.match(markup, /aria-describedby="[^"]*-error"/);
});
