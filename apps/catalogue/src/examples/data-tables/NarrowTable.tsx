import { useState } from 'react';
import { Badge, IconButton, RelativeTime, Select, Stack, Table, Tooltip } from '@envsemble/envui';
import { ArrowDownward } from '@envsemble/envui/icons/ArrowDownward';
import { ArrowUpward } from '@envsemble/envui/icons/ArrowUpward';

type Column = 'name' | 'updated' | 'tasks';
type Direction = 'ascending' | 'descending';

const columns = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Updated' },
  { value: 'tasks', label: 'Open tasks' },
];

export default function NarrowTable() {
  const [sort, setSort] = useState<{ column: Column; direction: Direction }>({
    column: 'updated',
    direction: 'descending',
  });
  // While the rows stack, the header row and its sort buttons are hidden, so a Select and an
  // IconButton above the table sort it instead.
  const [stacked, setStacked] = useState(false);

  const rows = [...projects].sort((first, second) => {
    const order =
      sort.column === 'name'
        ? first.name.localeCompare(second.name)
        : sort.column === 'updated'
          ? first.updated.localeCompare(second.updated)
          : first.tasks - second.tasks;
    return sort.direction === 'ascending' ? order : -order;
  });
  const direction = (column: Column): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  const sortBy = (column: Column) => (next: Direction) => setSort({ column, direction: next });
  const reverse = sort.direction === 'ascending' ? 'Sort descending' : 'Sort ascending';

  return (
    // As narrow as a phone or a side panel, so the rows stack.
    <Stack gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      {stacked && (
        // Small controls over small rows, so the bar matches the table's density.
        <Stack direction="row" align="end" gap={2}>
          <Select
            label="Sort by"
            size="sm"
            variant="outline"
            items={columns}
            value={sort.column}
            onValueChange={(value) => value && setSort({ ...sort, column: value as Column })}
          />
          {/* The Tooltip shows the icon-only button's name, which says what pressing it does. */}
          <Tooltip content={reverse}>
            <IconButton
              variant="outline"
              size="sm"
              icon={sort.direction === 'ascending' ? <ArrowUpward /> : <ArrowDownward />}
              aria-label={reverse}
              onClick={() =>
                setSort({
                  ...sort,
                  direction: sort.direction === 'ascending' ? 'descending' : 'ascending',
                })
              }
            />
          </Tooltip>
        </Stack>
      )}
      <Table.Root
        aria-label="Projects"
        density="sm"
        narrowLayout="stack"
        onStackedChange={setStacked}
      >
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell
              numeric
              sortDirection={direction('tasks')}
              onSortChange={sortBy('tasks')}
            >
              Open tasks
            </Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction('updated')} onSortChange={sortBy('updated')}>
              Updated
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((project) => (
            <Table.Row key={project.name}>
              <Table.Cell>{project.name}</Table.Cell>
              {/* Each cell after the first names its value while the rows stack. */}
              <Table.Cell label="Status">
                <Badge tone={project.status === 'At risk' ? 'warning' : 'success'}>
                  {project.status}
                </Badge>
              </Table.Cell>
              <Table.Cell label="Open tasks" numeric>
                {project.tasks}
              </Table.Cell>
              <Table.Cell label="Updated">
                <RelativeTime value={project.updated} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}

const projects = [
  { name: 'Website refresh', status: 'On track', tasks: 12, updated: '2026-03-04T08:15:00Z' },
  { name: 'Quarterly report', status: 'At risk', tasks: 5, updated: '2026-03-03T16:40:00Z' },
  { name: 'Onboarding guide', status: 'On track', tasks: 8, updated: '2026-03-02T11:05:00Z' },
  { name: 'Data migration', status: 'At risk', tasks: 3, updated: '2026-02-24T14:20:00Z' },
];
