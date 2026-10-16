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

const tones = { 'In progress': 'accent', Blocked: 'warning', Done: 'done' } as const;

export default function ProjectStatus() {
  return (
    <Table.Root caption="Projects">
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
            <Table.Cell>
              <Link href={`/projects/${project.id}`} underline={false}>
                {project.name}
              </Link>
              <Text variant="caption">{project.team}</Text>
            </Table.Cell>
            <Table.Cell nowrap>{project.owner}</Table.Cell>
            <Table.Cell numeric>{project.openTasks}</Table.Cell>
            <Table.Cell>
              <Badge tone={tones[project.status]}>{project.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
