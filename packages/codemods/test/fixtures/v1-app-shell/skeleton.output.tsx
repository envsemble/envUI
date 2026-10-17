import { SidebarTrigger, Sidebar, NavList, AppShell, LoadingState } from '@envsemble/envui';

export function Loading() {
  return (
    <LoadingState label="Loading projects">
      <AppShell.Root persist="app-sidebar" aria-busy>
        <Sidebar.Root label="Navigation">
          <Sidebar.Header>
            <SidebarTrigger mark={<span>B</span>} />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Skeleton items={4} />
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header />
        <AppShell.Main>
          <p>Fetching</p>
        </AppShell.Main>
      </AppShell.Root>
    </LoadingState>
  );
}
