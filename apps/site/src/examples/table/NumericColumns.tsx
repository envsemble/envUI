import { Table } from '@envsemble/envui';

const invoices = [
  { number: 'INV-1041', client: 'Northwind', hours: 12.5, amount: 1875 },
  { number: 'INV-1042', client: 'Alex Morgan', hours: 4, amount: 600 },
  { number: 'INV-1043', client: 'Priya Shah', hours: 31.25, amount: 4687.5 },
  { number: 'INV-1044', client: 'Sam Lee', hours: 8, amount: 1200 },
];

const hours = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function NumericColumns() {
  const totalHours = invoices.reduce((sum, invoice) => sum + invoice.hours, 0);
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  return (
    <Table.Root caption="Invoices for March">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Invoice</Table.HeaderCell>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell numeric>Hours</Table.HeaderCell>
          <Table.HeaderCell numeric>Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.number}>
            <Table.Cell nowrap>{invoice.number}</Table.Cell>
            <Table.Cell nowrap>{invoice.client}</Table.Cell>
            <Table.Cell numeric>{hours.format(invoice.hours)}</Table.Cell>
            <Table.Cell numeric>{money.format(invoice.amount)}</Table.Cell>
          </Table.Row>
        ))}
        <Table.Row>
          <Table.HeaderCell scope="row" colSpan={2}>
            Total
          </Table.HeaderCell>
          <Table.Cell numeric>{hours.format(totalHours)}</Table.Cell>
          <Table.Cell numeric>{money.format(totalAmount)}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
