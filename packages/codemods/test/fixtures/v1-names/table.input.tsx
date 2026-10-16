import type { ComponentProps } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@envsemble/envui';
import type {
  TableBodyProps,
  TableCellProps,
  TableHeaderCellProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  TableSortDirection,
} from '@envsemble/envui';

type Parts = {
  head: TableHeadProps;
  body: TableBodyProps;
  row: TableRowProps;
  header: TableHeaderCellProps;
  cell: TableCellProps;
};

export type MembersTableProps = ComponentProps<typeof Table> & {
  table?: TableProps;
  parts?: Partial<Parts>;
  sort: TableSortDirection;
};

export function MembersTable({ sort, ...props }: MembersTableProps) {
  return (
    <Table {...props}>
      <TableHead>
        <TableRow>
          <TableHeaderCell sortDirection={sort}>Name</TableHeaderCell>
          <TableHeaderCell>Organization</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alex Morgan</TableCell>
          <TableCell>Northwind Labs</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
