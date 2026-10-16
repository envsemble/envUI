import { Menu } from '@envsemble/envui';
import type { MenuItemProps } from '@envsemble/envui';

export function Actions({ items }: { items: MenuItemProps[] }) {
  return <Menu trigger="Actions">{items.length}</Menu>;
}
