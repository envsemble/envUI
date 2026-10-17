import { useState, type CSSProperties } from 'react';
import {
  AppShell,
  Avatar,
  List,
  NavList,
  Page,
  Sidebar,
  SidebarTrigger,
  Stack,
  Text,
  useSidebar,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Chat } from '@envsemble/envui/icons/Chat';
import { Home } from '@envsemble/envui/icons/Home';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Kim'];

/** The people at the end: rows with names, or their avatars alone while the sidebar is a rail. */
function People() {
  const { isRail } = useSidebar('end');
  if (isRail)
    return (
      <Stack gap={2} align="center">
        {people.map((name) => (
          <Avatar key={name} name={name} size="sm" />
        ))}
      </Stack>
    );
  return (
    <List.Root aria-label="People">
      {people.map((name) => (
        <List.Item key={name} start={<Avatar name={name} size="sm" />} label={name} />
      ))}
    </List.Root>
  );
}

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '24rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function TwoSidebars() {
  const [page, setPage] = useState('home');
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview}>
      <Sidebar.Root label="Main navigation">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item
              icon={<Home />}
              selected={page === 'home'}
              onClick={() => setPage('home')}
            >
              Home
            </NavList.Item>
            <NavList.Item
              icon={<Chat />}
              selected={page === 'chat'}
              onClick={() => setPage('chat')}
            >
              Conversations
            </NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Main>
        <Page width="md">
          <Text emphasis="muted">
            Each side keeps its own state: collapse one and the other stays as it is.
          </Text>
        </Page>
      </AppShell.Main>
      <Sidebar.Root side="end" label="People">
        <Sidebar.Header>
          <SidebarTrigger side="end" />
        </Sidebar.Header>
        <Sidebar.Content>
          <People />
        </Sidebar.Content>
      </Sidebar.Root>
    </AppShell.Root>
  );
}
