import type { CSSProperties } from 'react';
import { AppShell, NavList, Page, Sidebar, SidebarTrigger, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

const folders = ['Research', 'Design reviews', 'Quarterly planning'];

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '20rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function Resizable() {
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview} persist="docs.resizable">
      <Sidebar.Root label="Folders" resizable minWidth={12} maxWidth={28}>
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item icon={<Description />} selected>
              All documents
            </NavList.Item>
            {folders.map((folder) => (
              <NavList.Item key={folder} icon={<Folder />}>
                {folder}
              </NavList.Item>
            ))}
          </NavList.Root>
        </Sidebar.Content>
        <Sidebar.Handle />
      </Sidebar.Root>
      <AppShell.Main>
        <Page width="sm">
          <Text emphasis="muted">
            Drag the sidebar&apos;s edge, or focus it and press the arrow keys; press Enter on it to
            collapse the sidebar. The width is remembered in rem.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
