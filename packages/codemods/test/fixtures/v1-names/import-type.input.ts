import type { MenuItemProps, TableSortDirection } from '@envsemble/envui';

export interface Column {
  label: string;
  sort?: TableSortDirection;
  actions?: MenuItemProps[];
}
