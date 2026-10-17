import { useState, type CSSProperties } from 'react';
import {
  AppShell,
  IconButton,
  Menu,
  Menubar,
  NavList,
  Page,
  Sidebar,
  SidebarTrigger,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Description } from '@envsemble/envui/icons/Description';
import { History } from '@envsemble/envui/icons/History';
import { Search } from '@envsemble/envui/icons/Search';

const pages = [
  { id: 'documents', label: 'Documents', icon: <Description /> },
  { id: 'recent', label: 'Recent', icon: <History /> },
];

/** Stands in for the window of an installed application, which the frame fills. */
const preview = {
  '--env-app-shell-block-size': '22rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function TitleBarFrame() {
  const [page, setPage] = useState('documents');
  const current = pages.find(({ id }) => id === page) ?? pages[0];
  return (
    <AppShell.Root headerSpan="full" titleBar landmarks={false} style={preview}>
      <AppShell.Header
        start={
          <>
            <SidebarTrigger mark={<Apps />} />
            <Menubar.Root aria-label="Application menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
                <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="View">
                <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
            <IconButton icon={<ArrowBack />} aria-label="Back" />
          </>
        }
        end={<IconButton icon={<Search />} aria-label="Search" />}
      >
        {current.label}
      </AppShell.Header>
      <Sidebar.Root label="Document navigation">
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
            The header is the window&apos;s title bar: empty space drags the window, its controls
            are small, and the page scrolls below it.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
