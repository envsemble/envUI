import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { TextField, Textarea, Field } = await importSource('Field', [
  "export * as Field from './packages/ui/src/forms/Field.tsx';",
  "export { TextField } from './packages/ui/src/forms/TextField.tsx';",
  "export { Textarea } from './packages/ui/src/forms/Textarea.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const find = (root, matches) => elementsOf(root).find(matches);
const control = (root, tag) => find(root, (element) => element.tag === tag);
const labelOf = (root, element) =>
  textOf(
    find(root, (each) => each.tag === 'label' && each.attributes.for === element.attributes.id),
  );

test('fields associate labels, hints, and validation messages', () => {
  const project = render(
    h(TextField, { label: 'Project name', description: 'A descriptive name', required: true }),
  );
  const projectInput = control(project, 'input');
  assert.equal(labelOf(project, projectInput), 'Project name');
  assert.deepEqual(descriptions(project, projectInput), ['A descriptive name']);
  assert.ok(hasClass(project, 'env-field'));
  assert.equal(project.attributes['data-invalid'], undefined);
  const hint = project.children.find((child) => hasClass(child, 'env-field-description'));
  assert.equal(textOf(hint), 'A descriptive name');

  const notes = render(h(Textarea, { label: 'Notes', description: 'Optional supporting details' }));
  assert.deepEqual(descriptions(notes, control(notes, 'textarea')), [
    'Optional supporting details',
  ]);

  const invalid = render(
    h(TextField, { label: 'Invalid sample', error: 'Please correct this value' }),
  );
  const invalidInput = control(invalid, 'input');
  assert.equal(invalidInput.attributes['aria-invalid'], 'true');
  assert.deepEqual(descriptions(invalid, invalidInput), ['Please correct this value']);
  assert.equal(invalid.attributes['data-invalid'], '');
  const error = invalid.children.find((child) => hasClass(child, 'env-field-error'));
  assert.equal(textOf(error), 'Please correct this value');
});

test("Field.Error renders as the application's element, and its icon can be swapped or left out", () => {
  const error = (props) =>
    elementsOf(
      render(h(Field.Root, { invalid: true }, h(Field.Error, props, 'Use 3 or more.'))),
    ).find((element) => hasClass(element, 'env-field-error'));
  const compact = error({ render: h('p', { className: 'compact' }), icon: null });
  assert.equal(compact.tag, 'p');
  assert.ok(hasClass(compact, 'compact'));
  assert.equal(textOf(compact), 'Use 3 or more.');
  assert.ok(!elementsOf(compact).some((element) => element.tag === 'svg'));
  const own = error({ icon: h('span', { 'aria-hidden': true, className: 'own-icon' }, '!') });
  assert.ok(elementsOf(own).some((element) => hasClass(element, 'own-icon')));
  assert.ok(!elementsOf(own).some((element) => element.tag === 'svg'));
  const usual = error({});
  assert.equal(usual.tag, 'div');
  assert.ok(elementsOf(usual).some((element) => element.tag === 'svg'));
});
