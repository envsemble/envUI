import { AppShell as Shell, SidebarTrigger, Sidebar } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Frame({ children, items }) {
  return (
    <>
      <Shell.Root>
        <Shell.SkipLinks />
        <Sidebar.Root label="Primary">
          <Sidebar.Header>
            <SidebarTrigger />
          </Sidebar.Header>
          <Sidebar.Content>
            {items}
          </Sidebar.Content>
        </Sidebar.Root>
        <Shell.Header />
        <Shell.Main>
          {children}
        </Shell.Main>
      </Shell.Root>
      <ui.AppShell.Root>
        <ui.AppShell.SkipLinks />
        <ui.AppShell.Header>
          Inbox
        </ui.AppShell.Header>
        <ui.AppShell.Main>
          {children}
        </ui.AppShell.Main>
      </ui.AppShell.Root>
    </>
  );
}
