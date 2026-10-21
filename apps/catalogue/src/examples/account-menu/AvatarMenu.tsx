import {
  Avatar,
  AvatarButton,
  Column,
  Menu,
  Row,
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
          {/* Who is signed in, above the person's own things. */}
          <Menu.Header>
            <Row align="center" gap={3}>
              <Avatar name={user.name} size="lg" />
              <Column>
                <Text>{user.name}</Text>
                <Text variant="body-sm" emphasis="muted">
                  {user.email}
                </Text>
              </Column>
            </Row>
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
