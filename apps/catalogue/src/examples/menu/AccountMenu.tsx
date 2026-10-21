import { Avatar, AvatarButton, Menu, Column, Text } from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function AccountMenu() {
  return (
    // The avatar sits at the end of a topbar, so the menu lines up with the trigger's end.
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Menu.Root
        aria-label="Account"
        trigger={
          <AvatarButton
            name="Alex Morgan"
            description="alex@example.com"
            aria-label="Open account menu"
          />
        }
      >
        <Menu.Header>
          <Column gap={1} align="center">
            <Avatar name="Alex Morgan" size="lg" />
            <Text>Alex Morgan</Text>
            <Text variant="body-sm">alex@example.com</Text>
          </Column>
        </Menu.Header>
        <Menu.Item href="/account" icon={<ManageAccounts />}>
          Account settings
        </Menu.Item>
        <Menu.Item icon={<Settings />}>Preferences</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
      </Menu.Root>
    </div>
  );
}
