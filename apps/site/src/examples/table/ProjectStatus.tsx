import { Badge, Link, Table, Text } from '@envsemble/envui';

const projects = [
  {
    id: 'website',
    name: 'Website refresh',
    team: 'Marketing',
    owner: 'Alex Morgan',
    openTasks: 12,
    status: 'In progress',
  },
  {
    id: 'onboarding',
    name: 'Onboarding emails',
    team: 'Growth',
    owner: 'Sam Lee',
    openTasks: 4,
    status: 'Blocked',
  },
  {
    id: 'billing',
    name: 'Billing migration',
    team: 'Finance',
    owner: 'Priya Shah',
    openTasks: 0,
    status: 'Done',
  },
  {
    id: 'checkout',
    name: 'Mobile checkout',
    team: 'Product',
    owner: 'Alex Morgan',
    openTasks: 27,
    status: 'In progress',
  },
] as const;

const tones = { 'In progress': 'primary', Blocked: 'warning', Done: 'success' } as const;

export default function ProjectStatus() {
  return (
    // On a phone, each project is a block of its own rather than a row that scrolls sideways.
    <Table.Root caption="Projects" narrowLayout="stack">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {projects.map((project) => (
          <Table.Row key={project.id} interactive>
            <Table.Cell nowrap>
              <Link href={`/projects/${project.id}`} underline={false}>
                {project.name}
              </Link>
              <Text variant="caption">{project.team}</Text>
            </Table.Cell>
            <Table.Cell nowrap label="Owner">
              {project.owner}
            </Table.Cell>
            <Table.Cell numeric label="Open tasks">
              {project.openTasks}
            </Table.Cell>
            <Table.Cell label="Status">
              <Badge tone={tones[project.status]}>{project.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
