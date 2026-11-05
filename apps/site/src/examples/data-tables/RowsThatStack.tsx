import { useState } from 'react';
import {
  Avatar,
  Badge,
  Column,
  Link,
  Pagination,
  RelativeTime,
  Row,
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

export default function RowsThatStack() {
  const [page, setPage] = useState(1);
  return (
    <Column gap={3}>
      {/* Where its region is narrower than 36 rem, each row stacks into a block titled by its
          name, with its status beside it and each other value under its column's name. */}
      <Table.Root aria-label="All projects" narrowLayout="stack">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell>Updated</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => (
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
