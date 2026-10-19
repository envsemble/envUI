import { Menu } from '@envsemble/envui';

export function Actions({ items }: { items: Menu.ItemProps[] }) {
  return <Menu.Root trigger="Actions">{items.length}</Menu.Root>;
}
