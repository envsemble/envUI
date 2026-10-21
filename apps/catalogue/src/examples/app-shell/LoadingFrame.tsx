import type { CSSProperties } from 'react';
import { AppShell, NavList, Sidebar, SidebarTrigger, Surface, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Folder } from '@envsemble/envui/icons/Folder';

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '18rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function LoadingFrame() {
  return (
    // The same parts, and the same persist key, keep the frame where it will be; the navigation
    // and the page are skeletons until the workspace's data arrives.
    <AppShell.Root persist="app.frame" landmarks={false} scroll="main" style={preview}>
      <Sidebar.Root label="Main navigation">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
        </Sidebar.Header>
        <Sidebar.Content>
          <Surface skeleton background="page" padding={0} radius="none">
            <NavList.Root>
              {['Overview', 'Projects', 'Members', 'Settings'].map((label) => (
                <NavList.Item key={label} href="#" icon={<Folder />}>
                  {label}
                </NavList.Item>
              ))}
            </NavList.Root>
          </Surface>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header>
        <Surface skeleton background="page" padding={0} radius="none">
          <Text variant="title" />
        </Surface>
      </AppShell.Header>
      <AppShell.Main>
        <Surface skeleton background="page" radius="none">
          <Text variant="headline" />
          <Text />
        </Surface>
      </AppShell.Main>
    </AppShell.Root>
  );
}
