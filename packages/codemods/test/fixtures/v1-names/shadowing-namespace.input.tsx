import { Menu, MenuItem, Input, TextField, Pager, DirectionLink } from '@envsemble/envui';
import type { MenuItemProps } from '@envsemble/envui';

export function Settings() {
  return (
    <Menu.Root trigger="Settings">
      <MenuItem>Profile</MenuItem>
      <Input label="Organization" />
    </Menu.Root>
  );
}

// Locals named like the namespaces and the new names: the rewrites must not bind to them.
export function Custom() {
  const Menu = 'nav';
  const TextField = 'input';
  const Pager = 'footer';
  return (
    <Menu>
      <MenuItem>Members</MenuItem>
      <Input label="Name" />
      <TextField />
      <DirectionLink direction="next" href="/2" />
      <Pager />
    </Menu>
  );
}

// A type alias is no namespace, so Menu.ItemProps still reaches the import.
export function Typed() {
  type Menu = string;
  const props: MenuItemProps = { children: 'Members' };
  return props;
}

// An enum is a namespace, so Menu.ItemProps would reach it.
export function Enumerated() {
  enum Menu {
    Members,
  }
  const props: MenuItemProps = { children: 'Members' };
  return [props, Menu.Members];
}
