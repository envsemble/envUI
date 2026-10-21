import { IconButton, Menu, TopBar } from '@envsemble/envui';
import { AccountCircle } from '@envsemble/envui/icons/AccountCircle';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

export default function GenericTrigger() {
  return (
    <TopBar
      title="Northwind"
      actions={
        // The same icon for everyone: nothing says who is signed in.
        <Menu.Root
          aria-label="Account"
          align="end"
          trigger={<IconButton icon={<AccountCircle />} aria-label="My account" />}
        >
          <Menu.Item href="/account" icon={<ManageAccounts />}>
            Account settings
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
        </Menu.Root>
      }
    />
  );
}
