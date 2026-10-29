import { IconButton, Menu, TopBar } from '@envsemble/envui';
import { IconAccountCircle } from '@envsemble/envui/icons/AccountCircle';
import { IconLogout } from '@envsemble/envui/icons/Logout';
import { IconManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

export default function GenericTrigger() {
  return (
    <TopBar
      title="Northwind"
      actions={
        // The same icon for everyone: nothing says who is signed in.
        <Menu.Root
          aria-label="Account"
          align="end"
          trigger={<IconButton icon={<IconAccountCircle />} aria-label="My account" />}
        >
          <Menu.Item href="/account" icon={<IconManageAccounts />}>
            Account settings
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item icon={<IconLogout />}>Sign out</Menu.Item>
        </Menu.Root>
      }
    />
  );
}
