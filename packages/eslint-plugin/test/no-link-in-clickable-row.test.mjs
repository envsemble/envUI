import rule from '../src/rules/no-link-in-clickable-row.js';
import { named, ruleTester } from './RuleTester.mjs';

const nested = (found, row, place) => ({ messageId: 'nested', data: { found, row, place } });
const endSlot = 'its end slot as a Button';

ruleTester.run('no-link-in-clickable-row', rule, {
  valid: [
    ...named(
      'A plain row may hold links, and an interactive row without a target only highlights',
      [
        '<List.Item label="Report" end={<Button variant="text">Open</Button>} />',
        '<List.Item interactive label="Report" end={<Button variant="text">Share</Button>} />',
        '<Table.Row interactive><Table.Cell><Link href="/p/1">Project</Link></Table.Cell></Table.Row>',
        '<List.Item interactive label={<Link href="/r/1" data-row-target>Report</Link>} />',
        '<List.Item interactive label={<Button variant="text" data-row-target onClick={open}>Report</Button>} />',
      ],
    ),
    ...named("A Button that isn't link-styled, in the end slot", [
      '<List.Item interactive label="Report" end={<Button variant="outline">Share</Button>} />',
    ]),
    '<Card href="/r/1">Report</Card>',
    '<Table.Row><Table.Cell><Link href="/r/1">Report</Link></Table.Cell></Table.Row>',
    ...named("Another library's component of the same name", [
      'import { Card } from \'./cards\'; <Card href="/r/1"><a href="/x">x</a></Card>;',
    ]),
  ],
  invalid: [
    {
      code: '<List.Item onClick={open} label="Report" end={<Button variant="text">Share</Button>} />',
      errors: [nested('A Button with variant="text"', 'List.Item', endSlot)],
    },
    {
      code: '<List.Item label={<Link href="/r/1" data-row-target>Report</Link>}><Link href="/a">Author</Link></List.Item>',
      errors: [nested('A Link', 'List.Item', endSlot)],
    },
    {
      code: '<Card onClick={open}><a href="/help">Help</a></Card>',
      errors: [nested('A raw <a>', 'Card', 'beside the card as a Button')],
    },
    {
      code: 'import { Table } from \'@envsemble/envui\'; <Table.Row onClick={open}><Table.Cell><Button variant="text">Edit</Button></Table.Cell></Table.Row>;',
      errors: [
        {
          message:
            'A Button with variant="text" inside a clickable Table.Row: the row takes the click. Move the action into a cell of its own as a Button, or into a Menu.',
        },
      ],
    },
  ],
});
