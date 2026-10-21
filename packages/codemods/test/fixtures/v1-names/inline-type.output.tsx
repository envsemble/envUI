import { Button, type Menu, Menubar, type Table } from '@envsemble/envui';

export function Summary(props: { item: Menu.ItemProps; details: Menubar.MenuOpenChangeDetails; sort: Table.SortDirection }) {
  return (
    <Menubar.Root>
      <Button>{props.item.children}</Button>
    </Menubar.Root>
  );
}
