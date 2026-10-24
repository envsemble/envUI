import { AvatarButton, Menu, TopBar } from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

export default function AvatarTrigger() {
  return (
    <TopBar
      title="Northwind"
      actions={
        // The person's own avatar, named by their name, says who is signed in.
        <Menu.Root
          aria-label="Account"
          align="end"
          trigger={<AvatarButton name="Alex Morgan" description="alex.morgan@example.com" />}
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
