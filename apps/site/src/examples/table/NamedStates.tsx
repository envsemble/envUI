import { Badge, Table } from '@envsemble/envui';

export default function NamedStates() {
  return (
    <Table.Root aria-label="Projects, states named">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Website refresh</Table.Cell>
          <Table.Cell>
            <Badge tone="accent">In progress</Badge>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Onboarding emails</Table.Cell>
          <Table.Cell>
            <Badge tone="warning">Blocked</Badge>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
