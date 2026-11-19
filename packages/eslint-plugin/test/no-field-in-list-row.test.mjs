import rule from '../src/rules/no-field-in-list-row.js';
import { named, ruleTester } from './RuleTester.mjs';

const field = (name, slot) => ({ messageId: 'field', data: { field: name, slot } });

ruleTester.run('no-field-in-list-row', rule, {
  valid: [
    ...named('Selection controls in a row', [
      '<List.Item label="Sync" control={<Switch checked={on} />} />',
      '<List.Item label="Archive" control={<Checkbox />} />',
      '<List.Item label="Team" description="10 seats" control={<Radio value="team" />} />',
      '<List.Item label="Report" end={<IconButton icon={<IconMore />} aria-label="More" />} />',
    ]),
    ...named("A form in an overlay a row's end opens", [
      '<List.Item label="Port" end={<Popover trigger={<IconButton icon={<IconEdit />} aria-label="Edit" />}><TextField label="Port" /></Popover>} />',
      '<List.Item label="Members" end={<Dialog title="Invite"><Select label="Role" items={roles} /></Dialog>} />',
    ]),
    ...named('A field in a form, outside a row', [
      '<Field label="Port"><TextField /></Field>',
      '<List.Item label="Report">{children}</List.Item>',
    ]),
    ...named('A field with its own label', [
      '<List.Item label="Theme" description="How envUI looks" control={<Select label="Theme" items={themes} />} />',
      '<List.Item label="View" end={<SegmentedControl aria-label="View" items={items} />} />',
      '<List.Item label="Volume" end={<><Slider label="Volume" /></>} />',
      '<List.Item label="Port" control={<TextField aria-labelledby="port-label" />} />',
      '<List.Item label="Theme" control={<RadioGroup aria-label="Theme"><Radio value="a" label="A" /></RadioGroup>} />',
      '<List.Item label="Region" control={<Select {...regionField} />} />',
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
      code: '<List.Item label="Theme" control={<RadioGroup><Radio value="a" label="A" /></RadioGroup>} />',
      errors: [field('RadioGroup', 'control')],
    },
    {
      code: '<List.Item label="Team" end={<Radio value="team" />} />',
      errors: [field('Radio', 'end')],
    },
    {
      code: '<List.Item label="Port" control={on ? <TextField /> : null} />',
      errors: [field('TextField', 'control')],
    },
    {
      code: '<List.Item label="Volume" end={<><Slider /></>} />',
      errors: [field('Slider', 'end')],
    },
    {
      code: 'import { List, SegmentedControl } from \'@envsemble/envui\'; <List.Item label="View" control={<SegmentedControl items={items} />} />;',
      errors: [
        {
          message:
            "A SegmentedControl with no label in a List.Item's control: the row's label names only a Switch, a Checkbox or a Radio in its control, so nothing names this field. Give it a label, or an aria-label or aria-labelledby when its label shouldn't show.",
        },
      ],
    },
  ],
});
