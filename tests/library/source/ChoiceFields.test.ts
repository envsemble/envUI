import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { RadioGroup, Radio, Checkbox, Switch, Slider, List } = await importSource('ChoiceFields', [
  "export * as List from './packages/ui/src/data-display/List.tsx';",
  "export * from './packages/ui/src/forms/Radio.tsx';",
  "export * from './packages/ui/src/forms/Checkbox.tsx';",
  "export * from './packages/ui/src/forms/Switch.tsx';",
  "export * from './packages/ui/src/forms/Slider.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const find = (root, matches) => elementsOf(root).find(matches);

test('a radio group is described by its description and its error, in that order', () => {
  const group = render(
    h(
      RadioGroup,
      { label: 'Visibility', description: 'Who sees the plan.', error: 'Choose who sees it.' },
      h(Radio, { value: 'team', label: 'Team' }),
    ),
  );
  assert.equal(group.tag, 'fieldset');
  assert.deepEqual(descriptions(group, group), ['Who sees the plan.', 'Choose who sees it.']);
});

test('a controlled radio group with a null value has no option chosen', () => {
  const group = render(
    h(
      RadioGroup,
      { label: 'Visibility', value: null, defaultValue: 'team' },
      h(Radio, { value: 'team', label: 'Team' }),
    ),
  );
  const radios = elementsOf(group).filter((element) => element.attributes.type === 'radio');
  assert.equal(radios.length, 1);
  for (const radio of radios) assert.equal(radio.attributes.checked, undefined);
});

test('a checkbox and a switch read their description with their label', () => {
  for (const [Control, name] of [
    [Checkbox, 'checkbox'],
    [Switch, 'switch'],
  ]) {
    const label = render(
      h(Control, { label: 'Weekly digest', description: 'Every Monday morning.' }),
    );
    assert.equal(label.tag, 'label');
    assert.ok(elementsOf(label).some((element) => element.attributes.type === 'checkbox'));
    const description = find(label, (element) => hasClass(element, `env-${name}-description`));
    assert.equal(textOf(description), 'Every Monday morning.');
    assert.equal(textOf(label), 'Weekly digestEvery Monday morning.');
  }
});

test('a slider is described by its error', () => {
  const slider = render(h(Slider, { label: 'Budget', error: 'Keep it under 80%.' }));
  const input = find(slider, (element) => element.attributes.type === 'range');
  assert.deepEqual(descriptions(slider, input), ['Keep it under 80%.']);
});

test('a choice control takes its class and style on its root, the label, and its native props on the input', () => {
  for (const [Control, name, props] of [
    [Checkbox, 'checkbox', { label: 'Subscribe', name: 'subscribe' }],
    [Switch, 'switch', { label: 'Alerts', name: 'alerts' }],
    [Radio, 'radio', { label: 'Team', value: 'team' }],
  ]) {
    const control = h(Control, {
      ...props,
      className: `app-${name}`,
      style: { marginInlineStart: '3px' },
      'data-testid': `${name}-input`,
    });
    const root = render(Control === Radio ? h(RadioGroup, { label: 'Plan' }, control) : control);
    const label = find(root, (element) => element.tag === 'label');
    assert.equal(label.attributes.class, `env-${name} app-${name}`, name);
    assert.equal(label.attributes.style, 'margin-inline-start:3px', name);
    const input = find(label, (element) => element.tag === 'input');
    assert.equal(input.attributes.class, `env-${name}-input`, name);
    assert.equal(input.attributes['data-testid'], `${name}-input`, name);
    if (props.name) assert.equal(input.attributes.name, props.name, name);
    assert.equal(label.attributes['data-testid'], undefined, name);
  }
});

test('a radio without a label takes its name and description from the List.Item it is the control of', () => {
  const group = render(
    h(
      RadioGroup,
      { label: 'Plan', defaultValue: 'team' },
      h(
        List.Root,
        null,
        h(List.Item, {
          label: 'Team',
          description: '10 seats, shared projects',
          control: h(Radio, { value: 'team' }),
        }),
      ),
      h(Radio, { value: 'custom', 'aria-label': 'Custom plan' }),
    ),
  );
  const [team, custom] = elementsOf(group).filter((element) => element.attributes.type === 'radio');
  const label = find(
    group,
    (element) => element.attributes.id === team.attributes['aria-labelledby'],
  );
  assert.equal(textOf(label), 'Team');
  assert.deepEqual(descriptions(group, team), ['10 seats, shared projects']);
  assert.equal(team.attributes.name, custom.attributes.name);
  assert.equal(custom.attributes['aria-label'], 'Custom plan');
  assert.equal(custom.attributes['aria-labelledby'], undefined);
  assert.ok(!elementsOf(group).some((element) => hasClass(element, 'env-radio-label')));
});

test('a slider takes content in its label and its shown value, and announces the formatted value', () => {
  const slider = render(
    h(Slider, {
      label: h('span', null, h('svg', { 'aria-hidden': true }), 'Volume'),
      defaultValue: 40,
      formatValue: (value) => `${value} percent`,
      renderValue: (value) => h('span', null, h('strong', null, value), '%'),
    }),
  );
  const input = find(slider, (element) => element.attributes.type === 'range');
  const label = find(slider, (element) => hasClass(element, 'env-slider-label'));
  assert.equal(textOf(label), 'Volume');
  assert.ok(find(label, (element) => element.tag === 'svg'));
  assert.equal(input.attributes['aria-valuetext'], '40 percent');
  const output = find(slider, (element) => element.tag === 'output');
  assert.equal(textOf(output), '40%');
  assert.ok(find(output, (element) => element.tag === 'strong'));
});
