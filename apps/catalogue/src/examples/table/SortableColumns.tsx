import { useState } from 'react';
import { Table } from '@envsemble/envui';

const files = [
  {
    id: 'brief',
    name: 'Project brief.pdf',
    owner: 'Alex Morgan',
    modified: '2026-03-02',
    size: 2.4,
  },
  {
    id: 'budget',
    name: 'Budget 2026.xlsx',
    owner: 'Priya Shah',
    modified: '2026-02-18',
    size: 0.8,
  },
  { id: 'logo', name: 'Logo.svg', owner: 'Sam Lee', modified: '2026-03-11', size: 0.1 },
  {
    id: 'notes',
    name: 'Interview notes.docx',
    owner: 'Sam Lee',
    modified: '2026-01-27',
    size: 1.6,
  },
];

type File = (typeof files)[number];
type Column = 'name' | 'modified' | 'size';
type Sort = { column: Column; direction: 'ascending' | 'descending' };

const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

function compare(column: Column) {
  return (first: File, second: File) =>
    column === 'size' ? first.size - second.size : first[column].localeCompare(second[column]);
}

export default function SortableColumns() {
  const [sort, setSort] = useState<Sort>({ column: 'name', direction: 'ascending' });
  // The table shows the order; the application sorts the rows.
  const rows = [...files].sort((first, second) =>
    sort.direction === 'ascending'
      ? compare(sort.column)(first, second)
      : compare(sort.column)(second, first),
  );
  const direction = (column: Column): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  // A header asks for the order pressing it gives: descending once sorted ascending.
  const sortBy = (column: Column) => (next: Sort['direction']) =>
    setSort({ column, direction: next });
  return (
    <Table.Root aria-label="Files">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
            Name
          </Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell sortDirection={direction('modified')} onSortChange={sortBy('modified')}>
            Modified
          </Table.HeaderCell>
          <Table.HeaderCell numeric sortDirection={direction('size')} onSortChange={sortBy('size')}>
            Size (MB)
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((file) => (
          <Table.Row key={file.id}>
            <Table.Cell>{file.name}</Table.Cell>
            <Table.Cell nowrap>{file.owner}</Table.Cell>
            <Table.Cell nowrap>{date.format(new Date(file.modified))}</Table.Cell>
            <Table.Cell numeric>{file.size.toFixed(1)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
