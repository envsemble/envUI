import rule from '../src/rules/no-link-in-clickable-row.js';
import { named, ruleTester } from './RuleTester.mjs';

const sameTarget = ' When it goes where the row goes, mark it data-row-target instead.';
const nested = (found, row, place) => ({
  messageId: 'nested',
  data: { found, row, place, advice: sameTarget },
});
const endSlot = 'its end slot as a Button';

ruleTester.run('no-link-in-clickable-row', rule, {
  valid: [
    ...named(
      'A plain row may hold links, an interactive row without a target only highlights, and links beside a row target stay clickable above it',
      [
        '<List.Item label="Report" end={<Button variant="text">Open</Button>} />',
        '<List.Item interactive label="Report" end={<Button variant="text">Share</Button>} />',
        '<Table.Row interactive><Table.Cell><Link href="/p/1">Project</Link></Table.Cell></Table.Row>',
        '<List.Item interactive label={<Link href="/r/1" data-row-target>Report</Link>} />',
        '<List.Item interactive label={<Button variant="text" data-row-target onClick={open}>Report</Button>} />',
        '<Table.Row interactive><Table.Cell><Link href="/r/1" data-row-target>Report</Link></Table.Cell><Table.Cell><Link href="/a">Author</Link></Table.Cell></Table.Row>',
        '<List.Item interactive label={<Link href="/r/1" data-row-target>Report</Link>} description={<>Edited by <Link href="/a">Alex Morgan</Link></>}><Button variant="text">Share</Button></List.Item>',
      ],
    ),
    ...named("A Button that isn't link-styled, in the end slot", [
      '<List.Item interactive label="Report" end={<Button variant="outline">Share</Button>} />',
    ]),
    ...named('A text Button already in the end slot of a clickable row', [
      '<List.Item onClick={open} label="Report" end={<Button variant="text">Share</Button>} />',
    ]),
    ...named('A link in the start or control slot, which sit above the row target', [
      '<List.Item interactive start={<Link href="/people/ada"><Avatar name="Ada" /></Link>} label={<Link href="/r/1" data-row-target>Report</Link>} />',
      '<List.Item onClick={open} label="Report" control={<a href="/help">Help</a>} />',
    ]),
    '<Card href="/r/1">Report</Card>',
    ...named(
      'Links in an interactive Card, which stay clickable above its target, as in an interactive List.Item',
      [
        '<Card interactive title="Report"><Link href="/help">Help</Link></Card>',
        '<Card interactive title={<Link href="/r/1" data-row-target>Report</Link>} meta={<Link href="/a">Alex</Link>} headerEnd={<Button variant="text">Edit</Button>} actions={<Link href="/r/1/share">Share</Link>} />',
        '<Card interactive title={<Link href="/r/1" data-row-target>Report</Link>} description={<>Edited by <Link href="/a">Alex Morgan</Link></>} />',
      ],
    ),
    '<Table.Row><Table.Cell><Link href="/r/1">Report</Link></Table.Cell></Table.Row>',
    ...named("Another library's component of the same name", [
      'import { Card } from \'./cards\'; <Card href="/r/1"><a href="/x">x</a></Card>;',
    ]),
  ],
  invalid: [
    {
      code: '<List.Item onClick={open} label="Report"><Button variant="text">Share</Button></List.Item>',
      errors: [nested('A Button with variant="text"', 'List.Item', endSlot)],
    },
    {
      code: '<List.Item href="/r/1" label="Report" description={<Link href="/a">Author</Link>} />',
      errors: [nested('A Link', 'List.Item', endSlot)],
    },
    {
      code: '<Card onClick={open}><a href="/help">Help</a></Card>',
      errors: [
        {
          messageId: 'nested',
          data: {
            found: 'A raw <a>',
            row: 'Card',
            place: 'beside the card as a Button',
            advice:
              " When it goes where the card goes, leave it out: the card's href or onClick takes the click.",
          },
        },
      ],
    },
    {
      code: 'import { Table } from \'@envsemble/envui\'; <Table.Row onClick={open}><Table.Cell><Button variant="text">Edit</Button></Table.Cell></Table.Row>;',
      errors: [
        {
          message:
            'A Button with variant="text" inside a clickable Table.Row: the row takes the click. Move the action into a cell of its own as a Button, or into a Menu. When it goes where the row goes, mark it data-row-target and make the row interactive in place of its onClick.',
        },
      ],
    },
  ],
});
