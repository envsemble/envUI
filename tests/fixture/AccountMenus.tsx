import { useState } from 'react';
import {
  AccountMenu,
  EnvUIProvider,
  Menu,
  Stack,
  ThemePreferenceProvider,
  useThemePreference,
  type ThemePreference,
} from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Settings } from '@envsemble/envui/icons/Settings';
// Internal: the contexts a sidebar provides, expanded and showing icons only.
import {
  InSidebarContext,
  SidebarCompactContext,
} from '../../packages/ui/src/navigation/internal/SidebarCompact.js';

const organizations = [
  { id: 'northwind', name: 'Northwind', description: 'Owner' },
  { id: 'contoso', name: 'Contoso', description: 'Member' },
];

/** The stored preference of the provider around it, for the spec to read. */
function StoredTheme() {
  const { preference, theme } = useThemePreference();
  return (
    <output data-testid="bound-theme">
      {preference} {theme}
    </output>
  );
}

/**
 * Account menus, mounted with ?fixture=account-menus: one bound to a ThemePreferenceProvider with a
 * theme and an organization submenu, one whose theme the application stores itself, the automatic
 * trigger in an expanded sidebar and in a rail, and one in right-to-left text.
 */
export function AccountMenusFixture() {
  const [organization, setOrganization] = useState('northwind');
  const [stored, setStored] = useState<ThemePreference>('dark');
  const [log, setLog] = useState('');
  return (
    <ThemePreferenceProvider storageKey="fixture-account-theme" applyToDocument={false}>
      <Stack gap={5} className="fixture-section" style={{ inlineSize: '18rem' }}>
        <StoredTheme />
        <div data-testid="bound">
          <AccountMenu.Root name="Alex Morgan" description="alex@example.com">
            <Menu.Item icon={<Settings />} onClick={() => setLog('settings')}>
              Account settings
            </Menu.Item>
            <AccountMenu.ThemeSubmenu />
            <AccountMenu.OrganizationSubmenu
              items={organizations}
              value={organization}
              onValueChange={setOrganization}
              onCreate={() => setLog('create')}
            />
            <Menu.Separator />
            <Menu.Item icon={<Logout />} onClick={() => setLog('sign out')}>
              Sign out
            </Menu.Item>
          </AccountMenu.Root>
        </div>
        <div data-testid="controlled">
          <AccountMenu.Root name="Sam Lee" trigger="row" aria-label="Sam's account">
            <AccountMenu.ThemeSubmenu value={stored} onValueChange={setStored} closeOnClick />
          </AccountMenu.Root>
        </div>
        <InSidebarContext value>
          <div data-testid="sidebar">
            <AccountMenu.Root name="Priya Shah" description="priya@example.com">
              <Menu.Item>Profile</Menu.Item>
            </AccountMenu.Root>
          </div>
          <SidebarCompactContext value>
            <div data-testid="rail">
              <AccountMenu.Root name="Priya Shah" aria-label="Rail account">
                <Menu.Item>Profile</Menu.Item>
              </AccountMenu.Root>
            </div>
          </SidebarCompactContext>
        </InSidebarContext>
        <EnvUIProvider dir="rtl">
          {/* Room at the left for the menu and its submenu, which open toward it. */}
          <div dir="rtl" data-testid="rtl" style={{ marginLeft: '30rem', width: '18rem' }}>
            <AccountMenu.Root name="Alex Morgan" trigger="row" aria-label="RTL account">
              <AccountMenu.ThemeSubmenu />
            </AccountMenu.Root>
          </div>
        </EnvUIProvider>
        <output data-testid="account-log">
          {log} {organization} {stored}
        </output>
      </Stack>
    </ThemePreferenceProvider>
  );
}
