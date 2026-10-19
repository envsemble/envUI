import { Menu, Menu as EnvMenu, TextField as EnvTextField, TextField, Pager, Pager as EnvPager } from '@envsemble/envui';

export function Settings() {
  return (
    <Menu.Root trigger="Settings">
      <Menu.Item>Profile</Menu.Item>
      <TextField label="Organization" />
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
      <EnvMenu.Item>Members</EnvMenu.Item>
      <EnvTextField label="Name" />
      <TextField />
      <EnvPager.Next href="/2" />
      <Pager />
    </Menu>
  );
}

// A type alias is no namespace, so Menu.ItemProps still reaches the import.
export function Typed() {
  type Menu = string;
  const props: Menu.ItemProps = { children: 'Members' };
  return props;
}

// An enum is a namespace, so Menu.ItemProps would reach it.
export function Enumerated() {
  enum Menu {
    Members,
  }
  const props: EnvMenu.ItemProps = { children: 'Members' };
  return [props, Menu.Members];
}
