import type { Menu, Table } from '@envsemble/envui';

export interface Column {
  label: string;
  sort?: Table.SortDirection;
  actions?: Menu.ItemProps[];
}
