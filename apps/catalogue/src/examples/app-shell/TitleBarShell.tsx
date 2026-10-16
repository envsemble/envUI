import { useState } from 'react';
import { AppShell, IconButton, Menu, Menubar, NavList, Stack, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Description } from '@envsemble/envui/icons/Description';
import { History } from '@envsemble/envui/icons/History';
import { Search } from '@envsemble/envui/icons/Search';

const pages = [
  { id: 'documents', label: 'Documents', icon: <Description /> },
  { id: 'recent', label: 'Recent', icon: <History /> },
];

/** Stands in for the window of an installed application, which the shell fills. */
const frame = {
  position: 'relative',
  blockSize: '22rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
  transform: 'translateZ(0)',
} as const;

export default function TitleBarShell() {
  const [page, setPage] = useState('documents');
  const current = pages.find(({ id }) => id === page) ?? pages[0];
  return (
    <div style={frame}>
      <AppShell
        topbar="full"
        titleBar
        brand={<Apps />}
        context={
          <>
            <Menubar.Root aria-label="Application menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
                <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="View">
                <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
            <IconButton variant="text" icon={<ArrowBack />} aria-label="Back" />
          </>
        }
        title={current.label}
        actions={<IconButton icon={<Search />} aria-label="Search" />}
        navigationLabel="Document navigation"
        navigation={pages.map(({ id, label, icon }) => (
          <NavList.Item key={id} icon={icon} selected={id === page} onClick={() => setPage(id)}>
            {label}
          </NavList.Item>
        ))}
      >
        <Stack gap={3} style={{ padding: '2rem' }}>
          <Text render={<h3 />} variant="headline">
            {current.label}
          </Text>
          <Text emphasis="muted">The content scrolls below the title bar.</Text>
        </Stack>
      </AppShell>
    </div>
  );
}
