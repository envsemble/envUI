import { useState } from 'react';
import { Select, Stack, Table } from '@envsemble/envui';

const invoices = [
  { number: 'INV-1041', client: 'Northwind', due: '2026-03-14', amount: 1875 },
  { number: 'INV-1042', client: 'Alex Morgan', due: '2026-03-02', amount: 600 },
  { number: 'INV-1043', client: 'Priya Shah', due: '2026-03-28', amount: 4687.5 },
  { number: 'INV-1044', client: 'Sam Lee', due: '2026-03-09', amount: 1200 },
];

type Invoice = (typeof invoices)[number];
type Column = 'client' | 'due' | 'amount';
type Direction = 'ascending' | 'descending';

const orders = [
  { value: 'client ascending', label: 'Client, A to Z' },
  { value: 'client descending', label: 'Client, Z to A' },
  { value: 'due ascending', label: 'Due, soonest first' },
  { value: 'due descending', label: 'Due, latest first' },
  { value: 'amount descending', label: 'Amount, highest first' },
  { value: 'amount ascending', label: 'Amount, lowest first' },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

function compare(column: Column) {
  return (first: Invoice, second: Invoice) =>
    column === 'amount'
      ? first.amount - second.amount
      : first[column].localeCompare(second[column]);
}

export default function SortWhileStacked() {
  const [sort, setSort] = useState<{ column: Column; direction: Direction }>({
    column: 'due',
    direction: 'ascending',
  });
  // While the rows stack, the header row and its sort buttons are hidden.
  const [stacked, setStacked] = useState(false);
  const rows = [...invoices].sort((first, second) =>
    sort.direction === 'ascending'
      ? compare(sort.column)(first, second)
      : compare(sort.column)(second, first),
  );
  const direction = (column: Column): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  const sortBy = (column: Column) => () =>
    setSort((current) => ({
      column,
      direction:
        current.column === column && current.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  return (
    // As narrow as a phone or a side panel, so the rows stack.
    <Stack gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      {stacked && (
        <Select
          label="Sort by"
          value={`${sort.column} ${sort.direction}`}
          onValueChange={(value) => {
            const [column, order] = (value ?? '').split(' ');
            if (column && order)
              setSort({ column: column as Column, direction: order as Direction });
          }}
          options={orders}
        />
      )}
      <Table.Root aria-label="Invoices" narrowLayout="stack" onStackedChange={setStacked}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Invoice</Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction('client')} onSortChange={sortBy('client')}>
              Client
            </Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction('due')} onSortChange={sortBy('due')}>
              Due
            </Table.HeaderCell>
            <Table.HeaderCell
              numeric
              sortDirection={direction('amount')}
              onSortChange={sortBy('amount')}
            >
              Amount
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((invoice) => (
            <Table.Row key={invoice.number}>
              <Table.Cell>{invoice.number}</Table.Cell>
              <Table.Cell label="Client">{invoice.client}</Table.Cell>
              <Table.Cell label="Due">{date.format(new Date(invoice.due))}</Table.Cell>
              <Table.Cell label="Amount" numeric>
                {money.format(invoice.amount)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}
