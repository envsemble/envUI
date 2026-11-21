import { Table } from '@envsemble/envui';

const rows = { Beta: 'Live', Docs: 'Due', Blog: 'New' };
export const Releases = () => (
  <Table.Root caption="Releases">
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Release</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {Object.entries(rows).map(([name, state]) => (
        <Table.Row key={name}>
          <Table.Cell>{name}</Table.Cell>
          <Table.Cell>{state}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
);
