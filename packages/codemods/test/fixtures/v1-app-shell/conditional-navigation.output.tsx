import { AppShell, NavList, SidebarTrigger, Sidebar } from '@envsemble/envui';

export function Frame({ children, admin, members, links, pages, pathname }) {
  return (
    <>
      <AppShell.Root>
        <AppShell.SkipLinks />
        <Sidebar.Root label="Primary">
          <Sidebar.Header>
            <SidebarTrigger />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Root>
              <NavList.Item href="/">Home</NavList.Item>
              {admin ? <NavList.Item href="/admin">Admin</NavList.Item> : null}
              {members && <NavList.Item href="/members">Members</NavList.Item>}
              {pages.map((page) => (
                <NavList.Item key={page.href} href={page.href} selected={page.href === pathname}>
                  {page.label}
                </NavList.Item>
              ))}
            </NavList.Root>
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header />
        <AppShell.Main>
          {children}
        </AppShell.Main>
      </AppShell.Root>
      <AppShell.Root>
        <AppShell.SkipLinks />
        <Sidebar.Root label="Secondary">
          <Sidebar.Header>
            <SidebarTrigger />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Item href="/">Home</NavList.Item>
            {links}
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header />
        <AppShell.Main>
          {children}
        </AppShell.Main>
      </AppShell.Root>
    </>
  );
}
