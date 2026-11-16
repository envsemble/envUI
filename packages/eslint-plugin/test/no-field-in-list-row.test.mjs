import rule from '../src/rules/no-field-in-list-row.js';
import { named, ruleTester } from './RuleTester.mjs';

const field = (name, slot) => ({ messageId: 'field', data: { field: name, slot } });

ruleTester.run('no-field-in-list-row', rule, {
  valid: [
    ...named('Selection controls in a row', [
      '<List.Item label="Sync" control={<Switch checked={on} />} />',
      '<List.Item label="Archive" control={<Checkbox />} />',
      '<List.Item label="Theme" control={<RadioGroup><Radio value="a" label="A" /></RadioGroup>} />',
      '<List.Item label="Report" end={<IconButton icon={<IconMore />} aria-label="More" />} />',
    ]),
    ...named('A field in a form, outside a row', [
      '<Field label="Port"><TextField /></Field>',
      '<List.Item label="Report">{children}</List.Item>',
    ]),
    ...named("Another library's component of the same name", [
      'import { Select } from \'./select\'; <List.Item label="Theme" control={<Select />} />;',
    ]),
  ],
  invalid: [
    {
      code: '<List.Item label="Reach via" control={<Select items={items} />} />',
      errors: [field('Select', 'control')],
    },
    {
      code: '<List.Item label="Port" control={on ? <TextField /> : null} />',
      errors: [field('TextField', 'control')],
    },
    {
      code: '<List.Item label="Volume" end={<><Slider label="Volume" /></>} />',
      errors: [field('Slider', 'end')],
    },
    {
      code: 'import { List, SegmentedControl } from \'@envsemble/envui\'; <List.Item label="View" control={<SegmentedControl aria-label="View" items={items} />} />;',
      errors: [
        {
          message:
            "A SegmentedControl in a List.Item's control: the row doesn't label it and a list row holds only a Switch, Checkbox or RadioGroup. Put it in a form as a field with its label above it.",
        },
      ],
    },
  ],
});
