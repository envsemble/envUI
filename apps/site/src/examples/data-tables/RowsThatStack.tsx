import { useState } from 'react';
import {
  Avatar,
  Badge,
  Column,
  Link,
  Pagination,
  RelativeTime,
  Row,
  Select,
  Table,
} from '@envsemble/envui';

const projects = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Priya Shah',
    status: 'On track',
    updated: '2026-03-04T08:15:00Z',
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Sam Lee',
    status: 'At risk',
    updated: '2026-03-03T16:40:00Z',
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding guide',
    owner: 'Jordan Kim',
    status: 'On track',
    updated: '2026-03-02T11:05:00Z',
  },
];

type SortColumn = 'name' | 'updated';
type Direction = 'ascending' | 'descending';

const orders = [
  { value: 'updated descending', label: 'Updated, newest first' },
  { value: 'updated ascending', label: 'Updated, oldest first' },
  { value: 'name ascending', label: 'Name, A to Z' },
  { value: 'name descending', label: 'Name, Z to A' },
];

export default function RowsThatStack() {
  const [page, setPage] = useState(1);
  const [stacked, setStacked] = useState(false);
  const [sort, setSort] = useState<{ column: SortColumn; direction: Direction }>({
    column: 'updated',
    direction: 'descending',
  });
  const sorted = [...projects].sort((first, second) => {
    const order = first[sort.column].localeCompare(second[sort.column]);
    return sort.direction === 'ascending' ? order : -order;
  });
  const sortBy = (column: SortColumn) => (direction: Direction) => setSort({ column, direction });
  const direction = (column: SortColumn) => (sort.column === column ? sort.direction : 'none');
  return (
    <Column gap={3}>
      {/* The header and its sort buttons are hidden while rows stack, so a Select above the
          rows shows and changes the order. */}
      {stacked && (
        <Select
          label="Sort by"
          showLabel
          size="sm"
          items={orders}
          value={`${sort.column} ${sort.direction}`}
          onValueChange={(value) => {
            if (!value) return;
            const [column, next] = value.split(' ') as [SortColumn, Direction];
            setSort({ column, direction: next });
          }}
          style={{ alignSelf: 'start' }}
        />
      )}
      {/* Where its region is narrower than 36 rem, each row stacks into a block titled by its
          name, with its status beside it and each other value under its column's name. */}
      <Table.Root aria-label="All projects" narrowLayout="stack" onStackedChange={setStacked}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction('updated')} onSortChange={sortBy('updated')}>
              Updated
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {sorted.map((project) => (
            <Table.Row key={project.id} interactive>
              <Table.Cell>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell label="Status">
                <Badge tone={project.status === 'At risk' ? 'warning' : 'success'}>
                  {project.status}
                </Badge>
              </Table.Cell>
              <Table.Cell label="Owner" nowrap>
                <Row align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" fallback="initials" />
                  {project.owner}
                </Row>
              </Table.Cell>
              <Table.Cell label="Updated" nowrap>
                <RelativeTime value={project.updated} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Row justify="end">
        <Pagination
          aria-label="Project pages"
          page={page}
          pageSize={3}
          total={6}
          onPageChange={setPage}
        />
      </Row>
    </Column>
  );
}
