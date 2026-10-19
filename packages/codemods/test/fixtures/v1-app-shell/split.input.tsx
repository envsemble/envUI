import { useState } from 'react';
import { AppShell, NavList, OrganizationSwitcher, ThemeToggle } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

export function Frame({ children, loading }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AppShell.Root
      brand={<img src="/mark.svg" alt="" />}
      context={<OrganizationSwitcher items={[]} />}
      title="Projects"
      actions={<ThemeToggle />}
      navigationLabel="Main navigation"
      navigation={
        <>
          <NavList.Item href="/" icon={<Home />}>
            Home
          </NavList.Item>
          <NavList.Item href="/projects">Projects</NavList.Item>
        </>
      }
      storageKey="app-sidebar"
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      loading={loading}
      resizable
      sidebarMinWidth={200}
      sidebarMaxWidth={480}
      expandLabel="Show sidebar"
    >
      {children}
    </AppShell.Root>
  );
}
