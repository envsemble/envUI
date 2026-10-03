import type { Reference } from './Types';

const inputUsage = {
  title: 'Input',
  example: `import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />`,
  props: [
    ['label / hint / error', 'React content; hint and error are linked to the control'],
    [
      'Native input props',
      'value/defaultValue, onChange, name, type, required, disabled, readOnly, ref',
    ],
  ],
} satisfies NonNullable<Reference['usage']>[number];

const textareaUsage = {
  title: 'Textarea',
  example: `import { Textarea } from '@envsemble/envui';

<Textarea label="Description" name="description" rows={4}
  value={description} onChange={e => setDescription(e.target.value)} />`,
  props: [
    ['label / hint / error', 'React content with accessible connections'],
    [
      'Native textarea props',
      'rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref',
    ],
  ],
} satisfies NonNullable<Reference['usage']>[number];

export const formsReferences: Reference[] = [
  {
    id: 'fields',
    title: 'Text fields',
    group: 'Forms & selection',
    summary: 'Single-line inputs and multiline textareas share labels, guidance and states.',
    example: inputUsage.example,
    props: inputUsage.props,
    usage: [inputUsage, textareaUsage],
    guidelines: [
      'Use Input for one line and Textarea for multiline content. Set rows to reflect the expected amount of entry and allow resizing.',
      'Keep the label visible. Use hints for instructions and errors for a specific recovery step.',
      'Both support empty, filled, focus, invalid, disabled and read-only states. Validation and draft state belong to the application.',
    ],
    related: ['select', 'layout', 'accessibility'],
  },
  {
    id: 'checkbox',
    title: 'Checkboxes',
    group: 'Forms & selection',
    summary: 'Independent choices; partial selection represents a group.',
    example: `import { Checkbox } from '@envsemble/envui';

<Checkbox label="Include archived items" name="archived"
  checked={included} onCheckedChange={setIncluded} />`,
    props: [
      ['checked / defaultChecked', 'boolean or "mixed"'],
      ['onCheckedChange', 'Receives the next boolean selection'],
      ['label / native props', 'Visible label, name, value, required, disabled and ref'],
    ],
    guidelines: [
      'Use for choices that can be selected independently. Use mixed for a partially selected parent group.',
      'A Select all checkbox selects or clears its children. Derive mixed from those children; changing an individual choice restores partial selection.',
      'Keep a visible label and retain native form participation. The application computes aggregate selection.',
    ],
    related: ['radio', 'switch', 'accessibility'],
  },
  {
    id: 'switch',
    title: 'Switches',
    group: 'Forms & selection',
    summary: 'Use for an on/off setting that applies immediately.',
    example: `import { Switch } from '@envsemble/envui';

<Switch label="Enable notifications" name="notifications"
  checked={enabled} onCheckedChange={setEnabled} />`,
    props: [
      ['checked / defaultChecked', 'boolean'],
      ['onCheckedChange', 'Receives the next boolean'],
      ['label / native props', 'Visible label, disabled, name and ref'],
    ],
    guidelines: [
      'Use for a binary setting. Label the setting consistently in either state.',
      'Use checkbox semantics when the choice is part of a submitted selection.',
    ],
    related: ['checkbox', 'colors', 'accessibility'],
  },
  {
    id: 'radio',
    title: 'Radio groups',
    group: 'Forms & selection',
    summary: 'Choose one option from a visible set.',
    example: `import { RadioGroup, Radio } from '@envsemble/envui';

<RadioGroup label="Access" name="access" value={access}
  onValueChange={setAccess} variant="rows">
  <Radio value="team" label="Team" detail="Everyone in your workspace" />
  <Radio value="private" label="Private" detail="Only invited people" />
</RadioGroup>`,
    props: [
      ['RadioGroup', 'label, name, value/defaultValue, onValueChange, required, disabled'],
      ['variant', 'inline (default) or rows'],
      ['Radio', 'value, label, detail, disabled and native input props'],
    ],
    guidelines: [
      'Use radios when one alternative must be selected and the choices benefit from being visible together.',
      'Selectable rows reuse the grouped-row geometry. Use a unique group name for each form.',
    ],
    related: ['select', 'checkbox', 'rows'],
  },
  {
    id: 'select',
    title: 'Selects',
    group: 'Forms & selection',
    summary: 'Choose one option while keeping alternatives collapsed.',
    example: `import { Select } from '@envsemble/envui';

<Select label="Visibility" name="visibility" value={visibility}
  onValueChange={setVisibility} options={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
  ]} />`,
    props: [
      ['options', 'Array of { value, label, disabled? }'],
      ['value / defaultValue', 'Selected string, or null'],
      ['onValueChange', 'Receives selected string or null'],
      [
        'label / hint / error',
        'Visible label and linked guidance or validation, shared with text fields',
      ],
      ['Native participation', 'name, disabled, required and form'],
    ],
    guidelines: [
      'Use a select to save space when a single choice has several alternatives.',
      'Use the tonal trigger, selected indication and grouped option geometry. Keyboard navigation, typeahead and dismissal come from the component.',
      'Option focus rings appear for keyboard interaction, not pointer opening or hover.',
      'Label, hint and error use the same field structure as Input and Textarea. The application owns validation.',
    ],
    related: ['radio', 'fields', 'rows', 'accessibility'],
  },
];
