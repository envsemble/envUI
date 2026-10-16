import type { ComponentProps } from 'react';
import { Table } from '@envsemble/envui';

type Parts = {
  head: Table.HeadProps;
  body: Table.BodyProps;
  row: Table.RowProps;
  header: Table.HeaderCellProps;
  cell: Table.CellProps;
};

export type MembersTableProps = ComponentProps<typeof Table.Root> & {
  table?: Table.RootProps;
  parts?: Partial<Parts>;
  sort: Table.SortDirection;
};

export function MembersTable({ sort, ...props }: MembersTableProps) {
  return (
    <Table.Root {...props}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortDirection={sort}>Name</Table.HeaderCell>
          <Table.HeaderCell>Organization</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Alex Morgan</Table.Cell>
          <Table.Cell>Northwind Labs</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
