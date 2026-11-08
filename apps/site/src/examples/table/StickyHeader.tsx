import { Column, Table } from '@envsemble/envui';

const months = [
  { month: 'January', orders: 412, revenue: 18240, refunds: 6 },
  { month: 'February', orders: 388, revenue: 17105, refunds: 4 },
  { month: 'March', orders: 465, revenue: 20890, refunds: 9 },
  { month: 'April', orders: 431, revenue: 19312, refunds: 5 },
  { month: 'May', orders: 502, revenue: 22764, refunds: 7 },
  { month: 'June', orders: 476, revenue: 21508, refunds: 3 },
  { month: 'July', orders: 455, revenue: 20145, refunds: 8 },
  { month: 'August', orders: 398, revenue: 17620, refunds: 6 },
  { month: 'September', orders: 520, revenue: 23980, refunds: 10 },
  { month: 'October', orders: 547, revenue: 25210, refunds: 7 },
  { month: 'November', orders: 610, revenue: 28945, refunds: 12 },
  { month: 'December', orders: 688, revenue: 33120, refunds: 15 },
];

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function StickyHeader() {
  return (
    // The region scrolls within this height; an application's layout usually gives it one.
    <Column style={{ blockSize: '18rem' }}>
      <Table.Root aria-label="Sales by month" stickyHeader>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Month</Table.HeaderCell>
            <Table.HeaderCell numeric>Orders</Table.HeaderCell>
            <Table.HeaderCell numeric>Revenue</Table.HeaderCell>
            <Table.HeaderCell numeric>Refunds</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {months.map((row) => (
            <Table.Row key={row.month}>
              <Table.Cell nowrap>{row.month}</Table.Cell>
              <Table.Cell numeric>{number.format(row.orders)}</Table.Cell>
              <Table.Cell numeric>{money.format(row.revenue)}</Table.Cell>
              <Table.Cell numeric>{row.refunds}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}
