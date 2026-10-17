import type { CSSProperties } from 'react';
import {
  AppShell,
  IconButton,
  NavList,
  Page,
  Sidebar,
  SidebarTrigger,
  Text,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Label } from '@envsemble/envui/icons/Label';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '24rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function Groups() {
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview}>
      <Sidebar.Root label="Main navigation">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item icon={<Home />} selected>
              Home
            </NavList.Item>
          </NavList.Root>
          <Sidebar.Group
            label="Labels"
            action={<IconButton variant="ghost" size="sm" icon={<Add />} aria-label="New label" />}
          >
            <NavList.Root>
              <NavList.Item icon={<Label />}>Design</NavList.Item>
              <NavList.Item icon={<Label />}>Research</NavList.Item>
            </NavList.Root>
          </Sidebar.Group>
          <Sidebar.Group label="Administration">
            <NavList.Root>
              <NavList.Item icon={<Group />}>Members</NavList.Item>
              <NavList.Item icon={<Settings />}>Settings</NavList.Item>
            </NavList.Root>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Main>
        <Page width="sm">
          <Text emphasis="muted">
            Collapse the sidebar: the group headings and their actions hide, and a hairline
            separates the groups.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
