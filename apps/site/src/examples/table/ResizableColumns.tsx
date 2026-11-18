import { useState } from 'react';
import { Table } from '@envsemble/envui';

const documents = [
  {
    id: 'plan',
    name: 'Launch plan with timeline, owners and risks',
    owner: 'Priya Shah',
    updated: 'Today',
    pages: 24,
  },
  { id: 'notes', name: 'Interview notes', owner: 'Sam Lee', updated: 'Yesterday', pages: 6 },
  { id: 'brief', name: 'Design brief', owner: 'Alex Morgan', updated: 'Mar 2', pages: 11 },
];

export default function ResizableColumns() {
  const [widths, setWidths] = useState([46, 22, 16, 16]);
  return (
    <Table.Root
      aria-label="Documents"
      resizableColumns
      columnWidths={widths}
      onColumnWidthsChange={setWidths}
      minColumnWidths={12}
    >
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell>Updated</Table.HeaderCell>
          <Table.HeaderCell numeric>Pages</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {documents.map((entry) => (
          <Table.Row key={entry.id}>
            <Table.Cell nowrap>{entry.name}</Table.Cell>
            <Table.Cell nowrap>{entry.owner}</Table.Cell>
            <Table.Cell nowrap>{entry.updated}</Table.Cell>
            <Table.Cell numeric>{entry.pages}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
