import { useState } from 'react';
import { Avatar, Link, Pagination, RelativeTime, Column, Row, Table, Text } from '@envsemble/envui';

type SortColumn = 'name' | 'updated' | 'tasks';
type Direction = 'ascending' | 'descending';

const pageSize = 4;

const columnNames: Record<SortColumn, string> = {
  name: 'name',
  updated: 'updated',
  tasks: 'open tasks',
};

export default function SortAndPaginate() {
  const [sort, setSort] = useState<{ column: SortColumn; direction: Direction }>({
    column: 'updated',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);

  // The application sorts the rows, here in memory, and shows one page of them.
  const sorted = [...projects].sort((first, second) => {
    const order =
      sort.column === 'name'
        ? first.name.localeCompare(second.name)
        : sort.column === 'updated'
          ? first.updated.localeCompare(second.updated)
          : first.tasks - second.tasks;
    return sort.direction === 'ascending' ? order : -order;
  });
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const direction = (column: SortColumn): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  // A new order starts again from the first page.
  const sortBy = (column: SortColumn) => (next: Direction) => {
    setSort({ column, direction: next });
    setPage(1);
  };

  return (
    // As wide as the room it has, with the names whole on one line.
    <Column gap={3} style={{ inlineSize: '100%' }}>
      <Table.Root aria-label="All projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
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
            <Table.Row key={project.id} interactive>
              {/* The row's one link opens the project. */}
              <Table.Cell nowrap>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell nowrap>
                <Row align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" fallback="initials" />
                  {project.owner}
                </Row>
              </Table.Cell>
              {/* Numbers that compare down a column align to the end, in tabular figures. */}
              <Table.Cell numeric>{project.tasks}</Table.Cell>
              <Table.Cell nowrap>
                <RelativeTime value={project.updated} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Row wrap align="center" justify="between" gap={3}>
        {/* The new order is announced politely; the header's arrow alone isn't read out. */}
        <Text role="status" variant="body-sm" emphasis="muted">
          Sorted by {columnNames[sort.column]}, {sort.direction}
        </Text>
        <Pagination
          aria-label="Project pages"
          page={page}
          pageSize={pageSize}
          total={projects.length}
          onPageChange={setPage}
        />
      </Row>
    </Column>
  );
}

/** A time some hours before now, as an ISO date, so the sample reads as recent. */
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const projects = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Priya Shah',
    tasks: 12,
    updated: ago(2),
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Sam Lee',
    tasks: 5,
    updated: ago(26),
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding guide',
    owner: 'Jordan Kim',
    tasks: 8,
    updated: ago(50),
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Chen Wei',
    tasks: 21,
    updated: ago(144),
  },
  {
    id: 'data-migration',
    name: 'Data migration',
    owner: 'Maria Garcia',
    tasks: 3,
    updated: ago(240),
  },
  {
    id: 'annual-review',
    name: 'Annual review',
    owner: 'Alex Morgan',
    tasks: 0,
    updated: ago(408),
  },
];
