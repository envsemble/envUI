import { NavigationItem } from '@envsemble/envui';
import type { NavigationItemProps } from '@envsemble/envui';

const items: NavigationItemProps[] = [
  { href: '/projects', label: 'Projects' },
  { href: '/members', label: 'Members' },
];

export function Sidebar() {
  return (
    <nav>
      {items.map((item) => (
        <NavigationItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
