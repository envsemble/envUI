import { Badge, Table, Text } from '@envsemble/envui';

const orders = [
  {
    id: '2041',
    customer: 'Alex Morgan',
    placed: 'Mar 4',
    address: '12 Harbor Street, Springfield',
    items: 3,
    status: 'Shipped',
  },
  {
    id: '2042',
    customer: 'Priya Shah',
    placed: 'Mar 5',
    address: '410 Elm Avenue, Apartment 6B, Riverside',
    items: 1,
    status: 'Processing',
  },
  {
    id: '2043',
    customer: 'Sam Lee',
    placed: 'Mar 5',
    address: '7 Mill Lane, Fairview',
    items: 5,
    status: 'Delivered',
  },
] as const;

const tones = { Shipped: 'primary', Processing: 'warning', Delivered: 'success' } as const;

export default function StackedRows() {
  return (
    // Below stackBelow, 36 rem of the table's region, each row becomes a block.
    <Table.Root aria-label="Orders" narrowLayout="stack">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Order</Table.HeaderCell>
          <Table.HeaderCell>Ship to</Table.HeaderCell>
          <Table.HeaderCell numeric>Items</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {orders.map((order) => (
          <Table.Row key={order.id}>
            {/* The first cell titles the stacked row. */}
            <Table.Cell>
              Order {order.id} · {order.customer}
              <Text variant="caption">Placed {order.placed}</Text>
            </Table.Cell>
            <Table.Cell label="Ship to">{order.address}</Table.Cell>
            <Table.Cell label="Items" numeric>
              {order.items}
            </Table.Cell>
            <Table.Cell label="Status">
              <Badge tone={tones[order.status]}>{order.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
