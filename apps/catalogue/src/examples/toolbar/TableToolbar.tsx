import { Button, SearchField, Column, Row, Table } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';

const invoices = [
  { number: 'INV-1041', client: 'Northwind', status: 'Paid' },
  { number: 'INV-1042', client: 'Alex Morgan', status: 'Due' },
  { number: 'INV-1043', client: 'Priya Shah', status: 'Overdue' },
];

export default function TableToolbar() {
  return (
    <Column gap={3}>
      {/* Small controls above a table of small rows, so the bar matches its density. */}
      <Row wrap align="center" justify="between" gap={3}>
        <SearchField label="Search invoices" size="sm" />
        <Button variant="secondary" size="sm" startIcon={<Download />}>
          Export
        </Button>
      </Row>
      <Table.Root aria-label="Invoices" density="sm">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Invoice</Table.HeaderCell>
            <Table.HeaderCell>Client</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.number}>
              <Table.Cell nowrap>{invoice.number}</Table.Cell>
              <Table.Cell>{invoice.client}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}
