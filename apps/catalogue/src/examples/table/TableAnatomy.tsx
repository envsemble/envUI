import { useState } from 'react';
import { Table } from '@envsemble/envui';

const rows = [
  { name: 'Website refresh', tasks: 12 },
  { name: 'Mobile checkout', tasks: 27 },
];

export default function TableAnatomy() {
  const [direction, setDirection] = useState<Table.SortDirection>('ascending');
  const sorted = [...rows].sort((a, b) =>
    direction === 'ascending' ? a.tasks - b.tasks : b.tasks - a.tasks,
  );
  return (
    <Table.Root caption="Projects" style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell numeric sortDirection={direction} onSortChange={setDirection}>
            Open tasks
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {sorted.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell numeric>{row.tasks}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
