import { useState, type CSSProperties } from 'react';
import {
  AccountMenu,
  AppShell,
  Menu,
  NavList,
  OrganizationSwitcher,
  Page,
  PageHeader,
  Sidebar,
  SidebarTrigger,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Settings } from '@envsemble/envui/icons/Settings';

const organizations = [
  { id: 'northwind', label: 'Northwind', description: 'Admin' },
  { id: 'example', label: 'Example Labs', description: 'Member' },
];
const pages = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'projects', label: 'Projects', icon: <Category /> },
  { id: 'members', label: 'Members', icon: <ManageAccounts /> },
];

/**
 * Stands in for the window. An application renders AppShell.Root at its root, where the document
 * scrolls under the header; this preview scrolls Main in a box and adds no landmarks to the page
 * around it.
 */
const preview = {
  '--env-app-shell-block-size': '26rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function SidebarFrame() {
  const [page, setPage] = useState('home');
  const [organization, setOrganization] = useState('northwind');
  const current = pages.find(({ id }) => id === page) ?? pages[0];
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview}>
      <AppShell.SkipLinks />
      <Sidebar.Root label="Main navigation">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
          <OrganizationSwitcher
            items={organizations}
            value={organization}
            onValueChange={setOrganization}
          />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            {pages.map(({ id, label, icon }) => (
              <NavList.Item key={id} icon={icon} selected={id === page} onClick={() => setPage(id)}>
                {label}
              </NavList.Item>
            ))}
          </NavList.Root>
        </Sidebar.Content>
        <Sidebar.Footer>
          <AccountMenu.Root name="Alex Morgan" description="alex@example.com" aria-label="Account">
            <Menu.Item icon={<Settings />}>Account settings</Menu.Item>
          </AccountMenu.Root>
        </Sidebar.Footer>
      </Sidebar.Root>
      <AppShell.Header>{current.label}</AppShell.Header>
      <AppShell.Main>
        <Page width="md" header={<PageHeader title={current.label} headingLevel={3} />}>
          <Text emphasis="muted">
            Collapse the sidebar with the mark: it becomes a rail of icons that opens over the
            content while the pointer rests on it.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
