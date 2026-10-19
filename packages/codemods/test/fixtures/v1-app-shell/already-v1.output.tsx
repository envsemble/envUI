import { AppShell, AppShell as Shell } from '@envsemble/envui';
import * as ui from '@envsemble/envui';
import { AppSidebar, PageArea } from './frame';

export function Frame({ children, busy }) {
  return (
    <>
      <AppShell.Root className="app">
        <AppSidebar />
        <PageArea>{children}</PageArea>
      </AppShell.Root>
      <Shell.Root loading={busy} title="Inbox">
        {children}
      </Shell.Root>
      <ui.AppShell.Root>
        <ui.Sidebar.Root label="Main" />
        <ui.AppShell.Main>{children}</ui.AppShell.Main>
      </ui.AppShell.Root>
    </>
  );
}
