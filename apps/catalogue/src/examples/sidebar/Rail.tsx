import { useState, type CSSProperties } from 'react';
import { AppShell, NavList, Page, Sidebar, SidebarTrigger, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

const pages = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'projects', label: 'Projects', icon: <Category /> },
  { id: 'members', label: 'Members', icon: <ManageAccounts /> },
];

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '20rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function Rail() {
  const [page, setPage] = useState('home');
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview} defaultSidebarOpen={false}>
      <Sidebar.Root label="Main navigation" collapsible="rail" peek="hover">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
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
      </Sidebar.Root>
      <AppShell.Main>
        <Page width="sm">
          <Text emphasis="muted">
            Rest the pointer on the rail and it opens over the page, which stays where it is.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
