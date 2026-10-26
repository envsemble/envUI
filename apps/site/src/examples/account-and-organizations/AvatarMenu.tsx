import {
  Avatar,
  AvatarButton,
  Column,
  Menu,
  Text,
  ThemeRadioGroup,
  TopBar,
} from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Palette } from '@envsemble/envui/icons/Palette';

const user = { name: 'Alex Morgan', email: 'alex.morgan@example.com' };

export default function AvatarMenu() {
  return (
    <TopBar
      title="Northwind"
      actions={
        // The avatar at the end of the top bar opens the menu, which lines up with its end.
        <Menu.Root
          aria-label="Account"
          align="end"
          trigger={<AvatarButton name={user.name} description={user.email} />}
        >
          {/* Who is signed in, centered above the person's own things. The header is not an
              item, so focus starts on Account settings and the menu's label still names it. */}
          <Menu.Header>
            <Column align="center" gap={1} padding={2} style={{ textAlign: 'center' }}>
              <Avatar name={user.name} size="lg" />
              <Text>{user.name}</Text>
              <Text variant="body-sm" emphasis="muted">
                {user.email}
              </Text>
            </Column>
          </Menu.Header>
          <Menu.Item href="/account" icon={<ManageAccounts />}>
            Account settings
          </Menu.Item>
          <Menu.Submenu label="Theme" icon={<Palette />}>
            <ThemeRadioGroup />
          </Menu.Submenu>
          <Menu.Separator />
          <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
        </Menu.Root>
      }
    />
  );
}
