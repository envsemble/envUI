import { useState } from 'react';
import { IconButton, Table } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';

const entries = [
  { id: 'brief', project: 'Website refresh', person: 'Alex Morgan', hours: 6.5 },
  { id: 'audit', project: 'Northwind launch', person: 'Priya Shah', hours: 3 },
  { id: 'copy', project: 'Website refresh', person: 'Sam Lee', hours: 4.25 },
];

const hours = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 });

export default function HeaderEndAndTotals() {
  const [direction, setDirection] = useState<'ascending' | 'descending'>('descending');
  const rows = [...entries].sort((first, second) =>
    direction === 'ascending' ? first.hours - second.hours : second.hours - first.hours,
  );
  return (
    <Table.Root aria-label="Hours this week">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell
            end={
              <IconButton
                size="sm"
                variant="ghost"
                icon={<IconFilterList />}
                aria-label="Filter projects"
              />
            }
          >
            Project
          </Table.HeaderCell>
          <Table.HeaderCell>Person</Table.HeaderCell>
          <Table.HeaderCell numeric sortDirection={direction} onSortChange={setDirection}>
            Hours
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((entry) => (
          <Table.Row key={entry.id}>
            <Table.Cell nowrap>{entry.project}</Table.Cell>
            <Table.Cell nowrap>{entry.person}</Table.Cell>
            <Table.Cell numeric>{hours.format(entry.hours)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.HeaderCell scope="row" colSpan={2}>
            Total
          </Table.HeaderCell>
          <Table.Cell numeric>
            {hours.format(entries.reduce((sum, entry) => sum + entry.hours, 0))}
          </Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table.Root>
  );
}
