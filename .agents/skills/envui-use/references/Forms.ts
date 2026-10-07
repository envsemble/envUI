import type { Reference } from './Types';

const inputUsage = {
  title: 'Input',
  example: `import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />

<Input variant="plain" label="Title" name="title" />`,
  props: [
    [
      'variant',
      '"outlined" (default) or "plain": transparent, with an underline on hover or focus',
    ],
    ['label / hint / error', 'Floating label; hint and error message are linked to the control'],
    [
      'Native input props',
      'value/defaultValue, onChange, name, type, required, disabled, readOnly, ref',
    ],
  ],
} satisfies NonNullable<Reference['usage']>[number];

const textareaUsage = {
  title: 'Textarea',
  example: `import { Textarea } from '@envsemble/envui';

<Textarea label="Notes" name="notes" rows={4} sizing="fixed"
  value={notes} onChange={e => setNotes(e.target.value)} />

<Textarea label="Description" name="description" rows={4} sizing="content"
  value={description} onChange={e => setDescription(e.target.value)} />

<Textarea variant="plain" label="Notes" sizing="content" rows={3} />`,
  props: [
    [
      'variant',
      '"outlined" (default) or "plain": transparent, with an underline on hover or focus',
    ],
    [
      'sizing',
      '"fixed" (default) scrolls and resizes from the bottom edge; "content" grows and shrinks to fit',
    ],
    ['rows', 'Visible rows in fixed mode; minimum rows in content mode'],
    ['label / hint / error', 'Floating label; hint and error message are linked to the control'],
    [
      'Native textarea props',
      'rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref',
    ],
  ],
} satisfies NonNullable<Reference['usage']>[number];

export const formsReferences: Reference[] = [
  {
    id: 'color-picker',
    title: 'Color picker',
    group: 'Forms & selection',
    summary: 'A color area, hue slider and HEX field for opaque colors.',
    example: `import { ColorPicker } from '@envsemble/envui';

<ColorPicker label="Accent color" value={color} onValueChange={setColor} />

// Native forms submit the HEX field and reset uncontrolled values.
<ColorPicker label="Project color" name="accent" defaultValue="#6750a4" />`,
    props: [
      ['label', 'Required visible color name; also names the picker group and HEX field'],
      ['value / defaultValue', 'Controlled or initial opaque six-digit HEX color; default #000000'],
      ['onValueChange', 'Receives valid colors normalized to lowercase #rrggbb'],
      [
        'disabled / readOnly',
        'Prevent color-area and hue edits; the read-only HEX field remains focusable',
      ],
      ['hint / error / variant', 'Shared Input guidance, validation and field appearance'],
      [
        'Native input props',
        'name, form, required, ref and accessible attributes for the HEX field',
      ],
      ['className / style', 'Optional layout class and style on the picker root'],
    ],
    guidelines: [
      'Use for opaque colors. Supply six hexadecimal digits, optionally prefixed by #. Short HEX, alpha and other color formats are outside this API.',
      'The color area and hue slider support pointer interaction and arrow keys. They use the theme’s visible focus ring; the HEX field uses the shared Input geometry and validation.',
      'Partial or invalid HEX drafts do not call onValueChange. Recovery text is linked to the field and announced; leaving an invalid draft restores the previous valid color. Valid input is normalized to lowercase #rrggbb.',
      'Applications own the selected color and its meaning. Palette tokens, theme customization, persistence and dialogs belong to the consumer.',
      'Uncontrolled native form reset restores defaultValue without emitting onValueChange. Controlled reset retains value; the application resets its own state. Canceling the reset event preserves the draft.',
      'Disabled pickers cannot be edited or focused and are excluded from native form submission. Read-only pickers prevent edits while retaining a focusable, copyable HEX field.',
    ],
    related: ['fields', 'colors', 'accessibility'],
  },
  {
    id: 'fields',
    title: 'Text fields',
    group: 'Forms & selection',
    summary: 'Single-line inputs and multiline textareas share labels, guidance and states.',
    example: inputUsage.example,
    props: inputUsage.props,
    usage: [inputUsage, textareaUsage],
    guidelines: [
      'Use Input for one line and Textarea for multiline content. Both share the same corner radius. Fixed sizing scrolls and resizes from the full bottom edge; content sizing grows and shrinks automatically. Set rows for the initial or minimum height.',
      'The resize edge follows the field’s border color on hover, focus and error, and uses the pressed shade while dragging. Focus the edge and use Up/Down arrows to change height by one line, or Shift+Up/Down for five lines. Home restores the minimum height. Disabled fields cannot resize.',
      'Outlined fields turn their single thin border blue on hover and focus in both themes, without changing the background or adding an outline. Hover and pressed colors follow the shared HSL rule, including while focused. Invalid borders and plain-field error underlines stay red and change shade on hover or press.',
      'Labels move above the text when focused or filled. Plain fields have no border or fill at rest and show an underline on hover or focus; invalid plain fields use a red underline. Both variants retain linked recovery text.',
      'Placeholders appear while focused; use hints for lasting instructions and errors for a specific recovery step.',
      'Both support empty, filled, focus, invalid, disabled and read-only states. Validation and draft state belong to the application.',
    ],
    related: ['markdown', 'select', 'layout', 'accessibility'],
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
      'The trigger shares secondary Button colors, and the menu shares the pane Surface tone. Options have their own selection roles and grouped geometry. Keyboard navigation, typeahead and dismissal come from the component.',
      'Option focus rings appear for keyboard interaction, not pointer opening or hover.',
      'Label, hint and error use the same field structure and colors as Input and Textarea. Invalid controls use the shared red border with HSL hover and pressed shades, without background changes, and retain the standard keyboard focus ring. The application owns validation.',
    ],
    related: ['radio', 'fields', 'rows', 'accessibility'],
  },
];
