import { Avatar, Button, Column, Menu, Row, Text } from '@envsemble/envui';
import { IconLogout } from '@envsemble/envui/icons/Logout';
import { IconManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { IconUnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

export default function RowTrigger() {
  return (
    // At the foot of a navigation drawer the trigger is a row with the name, as wide as the
    // drawer, and the menu opens above it.
    <Column style={{ inlineSize: '16rem' }}>
      <Menu.Root
        aria-label="Account"
        side="top"
        align="start"
        trigger={
          <Button variant="ghost" fullWidth endIcon={<IconUnfoldMore />}>
            <Row align="center" gap={2}>
              <Avatar name="Priya Shah" size="sm" />
              <Text>Priya Shah</Text>
            </Row>
          </Button>
        }
      >
        <Menu.Item href="/account" icon={<IconManageAccounts />}>
          Account settings
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<IconLogout />}>Sign out</Menu.Item>
      </Menu.Root>
    </Column>
  );
}
