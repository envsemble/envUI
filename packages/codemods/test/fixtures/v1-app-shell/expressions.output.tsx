import { AppShell, NavList, Tree, SidebarTrigger, Sidebar } from '@envsemble/envui';

export function Frame({ children, layout, files }) {
  return (
    <>
      <AppShell.Root headerSpan={layout === "full" ? "full" : "main"}>
        <AppShell.SkipLinks />
        <Sidebar.Root label="Files">
          <Sidebar.Header>
            <SidebarTrigger />
          </Sidebar.Header>
          <Sidebar.Content>
            <Tree items={files} aria-label="Files" />
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header />
        <AppShell.Main>
          {children}
        </AppShell.Main>
      </AppShell.Root>
      <AppShell.Root>
        <AppShell.SkipLinks />
        <Sidebar.Root label="Main">
          <Sidebar.Header>
            <SidebarTrigger />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Root>
              <NavList.Item href="/">Home</NavList.Item>
            </NavList.Root>
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
