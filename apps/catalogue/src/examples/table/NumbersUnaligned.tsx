import { Table } from '@envsemble/envui';

const invoices = [
  { id: 'INV-1042', amount: '1,240.00' },
  { id: 'INV-1043', amount: '86.50' },
  { id: 'INV-1044', amount: '12,905.25' },
];

export default function NumbersUnaligned() {
  return (
    // Amounts as text: aligned to the start, their digits don't line up.
    <Table.Root aria-label="Invoices">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Invoice</Table.HeaderCell>
          <Table.HeaderCell>Amount (EUR)</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
