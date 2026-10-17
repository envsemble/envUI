import { useState } from 'react';
import { Avatar, Badge, Link, Pagination, RelativeTime, Stack, Table } from '@envsemble/envui';

type Column = 'name' | 'updated' | 'tasks';
type Direction = 'ascending' | 'descending';

const pageSize = 5;

export default function SortAndPaginate() {
  const [sort, setSort] = useState<{ column: Column; direction: Direction }>({
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

  const direction = (column: Column): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  // A new order starts again from the first page.
  const sortBy = (column: Column) => (next: Direction) => {
    setSort({ column, direction: next });
    setPage(1);
  };

  return (
    <Stack gap={3}>
      <Table.Root aria-label="All projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
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
            <Table.Row key={project.id} interactive>
              {/* The row's one link opens the project. */}
              <Table.Cell>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell nowrap>
                <Stack direction="row" align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" fallback="initials" />
                  {project.owner}
                </Stack>
              </Table.Cell>
              <Table.Cell>
                <Badge tone={project.status === 'At risk' ? 'warning' : 'success'}>
                  {project.status}
                </Badge>
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
      <Stack direction="row" justify="end">
        <Pagination
          aria-label="Project pages"
          page={page}
          pageSize={pageSize}
          total={projects.length}
          onPageChange={setPage}
        />
      </Stack>
    </Stack>
  );
}

const projects = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Priya Shah',
    status: 'On track',
    tasks: 12,
    updated: '2026-03-04T08:15:00Z',
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Sam Lee',
    status: 'At risk',
    tasks: 5,
    updated: '2026-03-03T16:40:00Z',
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding guide',
    owner: 'Jordan Kim',
    status: 'On track',
    tasks: 8,
    updated: '2026-03-02T11:05:00Z',
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Chen Wei',
    status: 'On track',
    tasks: 21,
    updated: '2026-02-27T09:30:00Z',
  },
  {
    id: 'data-migration',
    name: 'Data migration',
    owner: 'Maria Garcia',
    status: 'At risk',
    tasks: 3,
    updated: '2026-02-24T14:20:00Z',
  },
  {
    id: 'annual-review',
    name: 'Annual review',
    owner: 'Alex Morgan',
    status: 'On track',
    tasks: 0,
    updated: '2026-02-18T10:00:00Z',
  },
  {
    id: 'brand-guidelines',
    name: 'Brand guidelines',
    owner: 'Priya Shah',
    status: 'On track',
    tasks: 6,
    updated: '2026-02-12T13:45:00Z',
  },
];
