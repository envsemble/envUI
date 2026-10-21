import type { CSSProperties } from 'react';
import {
  AppShell,
  LoadingState,
  NavList,
  Sidebar,
  SidebarTrigger,
  Skeleton,
  Column,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '18rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function LoadingFrame() {
  return (
    // The same parts, and the same persist key, keep the frame where it will be.
    <LoadingState label="Loading workspace">
      <AppShell.Root persist="app.frame" landmarks={false} scroll="main" style={preview}>
        <Sidebar.Root label="Main navigation">
          <Sidebar.Header>
            <SidebarTrigger mark={<Apps />} />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Skeleton items={4} />
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header>
          <Skeleton width="6rem" />
        </AppShell.Header>
        <AppShell.Main>
          <Column gap={3} style={{ padding: '1.5rem' }}>
            <Skeleton width="40%" height="1.25rem" />
            <Skeleton />
            <Skeleton width="80%" />
          </Column>
        </AppShell.Main>
      </AppShell.Root>
    </LoadingState>
  );
}
