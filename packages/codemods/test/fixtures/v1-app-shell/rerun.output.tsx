import { useState } from 'react';
import {
  AppShell,
  NavList,
  OrganizationSwitcher,
  ThemeToggle,
  SidebarTrigger,
  Sidebar,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

export function Frame({ children, loading }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AppShell.Root
      loading={loading}
      persist="app-sidebar"
      sidebarOpen={!collapsed}
      onSidebarOpenChange={open => setCollapsed(!open)}>
      <AppShell.SkipLinks />
      <Sidebar.Root label="Main navigation" resizable minWidth={12.5} maxWidth={30}>
        <Sidebar.Header>
          <SidebarTrigger mark={<img src="/mark.svg" alt="" />} expandLabel="Show sidebar" />
          <OrganizationSwitcher items={[]} />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item href="/" icon={<Home />}>
              Home
            </NavList.Item>
            <NavList.Item href="/projects">Projects</NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header end={<ThemeToggle />}>
        Projects
      </AppShell.Header>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell.Root>
  );
}
