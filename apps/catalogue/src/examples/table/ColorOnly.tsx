import { Badge, Table } from '@envsemble/envui';

export default function ColorOnly() {
  return (
    // States told apart by color alone: without color vision, or in print, they read the same.
    <Table.Root aria-label="Projects">
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
            <Badge tone="accent" variant="solid">
              ●
            </Badge>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Onboarding emails</Table.Cell>
          <Table.Cell>
            <Badge tone="warning" variant="solid">
              ●
            </Badge>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
