import { Checkbox, Column, Link, Pagination, Table } from '@envsemble/envui';

const projects = [
  { id: 'website-refresh', name: 'Website refresh', tasks: 12 },
  { id: 'quarterly-report', name: 'Quarterly report', tasks: 5 },
];

export default function DataTableAnatomy() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 30rem)' }}>
      <Table.Root aria-label="Projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              <Checkbox aria-label="Select all projects" checked="mixed" />
            </Table.HeaderCell>
            <Table.HeaderCell sortDirection="ascending" onSortChange={() => {}}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project, index) => (
            <Table.Row key={project.id} selected={index === 0}>
              <Table.Cell>
                <Checkbox aria-label={`Select ${project.name}`} defaultChecked={index === 0} />
              </Table.Cell>
              <Table.Cell>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell numeric>{project.tasks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pagination
        aria-label="Project pages"
        page={1}
        pageSize={2}
        total={6}
        onPageChange={() => {}}
      />
    </Column>
  );
}
