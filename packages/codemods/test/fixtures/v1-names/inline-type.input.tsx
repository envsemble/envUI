import { Button, type MenuItemProps, type MenubarMenuOpenChangeDetails, Menubar, type TableSortDirection } from '@envsemble/envui';

export function Summary(props: { item: MenuItemProps; details: MenubarMenuOpenChangeDetails; sort: TableSortDirection }) {
  return (
    <Menubar>
      <Button>{props.item.children}</Button>
    </Menubar>
  );
}
