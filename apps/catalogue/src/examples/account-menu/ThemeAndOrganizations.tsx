import { useState } from 'react';
import { AccountMenu, Menu, Stack, Surface, Text } from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

const organizations = [
  { id: 'northwind', name: 'Northwind', description: 'Owner' },
  { id: 'contoso', name: 'Contoso', description: 'Member' },
];

export default function ThemeAndOrganizations() {
  const [organization, setOrganization] = useState('northwind');
  const [status, setStatus] = useState('');
  return (
    // The theme submenu stores the choice through the ThemePreferenceProvider at the
    // application's root, so a choice here changes this page's theme.
    <Stack gap={2}>
      <Surface padding={3}>
        <Stack direction="row" align="center" justify="between" gap={2}>
          <Text variant="title" render={<span />}>
            {organizations.find((each) => each.id === organization)?.name}
          </Text>
          <AccountMenu.Root name="Alex Morgan" description="alex@example.com">
            <Menu.Item href="/account" icon={<ManageAccounts />}>
              Account settings
            </Menu.Item>
            <AccountMenu.ThemeSubmenu />
            <AccountMenu.OrganizationSubmenu
              items={organizations}
              value={organization}
              onValueChange={setOrganization}
              onCreate={() => setStatus('Create organization')}
            />
            <Menu.Separator />
            <Menu.Item icon={<Logout />} onClick={() => setStatus('Signed out')}>
              Sign out
            </Menu.Item>
          </AccountMenu.Root>
        </Stack>
      </Surface>
      <Text variant="caption" emphasis="muted" role="status">
        {status}
      </Text>
    </Stack>
  );
}
