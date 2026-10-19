import { useState, type CSSProperties } from 'react';
import {
  AppShell,
  IconButton,
  NavList,
  Page,
  SearchTrigger,
  Sidebar,
  SidebarTrigger,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Description } from '@envsemble/envui/icons/Description';
import { History } from '@envsemble/envui/icons/History';
import { Notifications } from '@envsemble/envui/icons/Notifications';

const pages = [
  { id: 'documents', label: 'Documents', icon: <Description /> },
  { id: 'recent', label: 'Recent', icon: <History /> },
];

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '22rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function HeaderAcross() {
  const [page, setPage] = useState('documents');
  const current = pages.find(({ id }) => id === page) ?? pages[0];
  return (
    <AppShell.Root headerSpan="full" landmarks={false} scroll="main" style={preview}>
      <AppShell.Header
        start={<SidebarTrigger mark={<Apps />} />}
        end={
          <>
            <SearchTrigger iconOnly listen={false} />
            <IconButton variant="ghost" icon={<Notifications />} aria-label="Notifications" />
          </>
        }
      >
        {current.label}
      </AppShell.Header>
      <Sidebar.Root label="Document navigation" collapsible="offcanvas">
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
        <Page width="md">
          <Text emphasis="muted">
            The header runs across the window and the sidebar sits below it; collapsed, it leaves
            the window entirely.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
