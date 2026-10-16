import { NavList } from '@envsemble/envui';

const items: NavList.ItemProps[] = [
  { href: '/projects', label: 'Projects' },
  { href: '/members', label: 'Members' },
];

export function Sidebar() {
  return (
    <nav>
      {items.map((item) => (
        <NavList.Item key={item.href} {...item} />
      ))}
    </nav>
  );
}
