import { AppShell, SidebarTrigger, Sidebar } from '@envsemble/envui';

export function Frame({ children, busy }) {
  return (
    <AppShell.Root loading={busy} className="app">
      <AppShell.SkipLinks />
      <Sidebar.Root label="Navigation">
        <Sidebar.Header>
          <SidebarTrigger />
        </Sidebar.Header>
      </Sidebar.Root>
      <AppShell.Header />
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell.Root>
  );
}
