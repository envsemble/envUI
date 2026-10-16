import { Button, Dialog, DialogClose, Table } from '@envsemble/envui';

const changes = [
  { document: 'Launch plan', author: 'Priya Shah', updated: 'Today, 09:40', edits: 14 },
  { document: 'Budget 2027', author: 'Sam Lee', updated: 'Yesterday', edits: 6 },
  { document: 'Hiring guide', author: 'Alex Morgan', updated: '12 October', edits: 3 },
];

export default function ReviewChanges() {
  return (
    <Dialog
      size="wide"
      trigger={<Button variant="secondary">Review changes</Button>}
      title="Review changes"
      description="Three documents changed since your last review."
      actions={<DialogClose variant="primary">Mark as reviewed</DialogClose>}
    >
      <Table.Root aria-label="Changed documents">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Document</Table.HeaderCell>
            <Table.HeaderCell>Changed by</Table.HeaderCell>
            <Table.HeaderCell>Updated</Table.HeaderCell>
            <Table.HeaderCell numeric>Edits</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {changes.map((change) => (
            <Table.Row key={change.document}>
              <Table.Cell>{change.document}</Table.Cell>
              <Table.Cell>{change.author}</Table.Cell>
              <Table.Cell>{change.updated}</Table.Cell>
              <Table.Cell numeric>{change.edits}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Dialog>
  );
}
