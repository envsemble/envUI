import { AppShell, Sidebar, useAppShell } from '@envsemble/envui';

export function Frame({ props, shell }) {
  const app = useAppShell();
  app.closeNarrowSidebar();
  return (
    <>
      <AppShell.Root {...props} />
      <AppShell.Root headerSpan="full">
        <Sidebar.Root label="Main">{shell}</Sidebar.Root>
        <AppShell.Main>Page</AppShell.Main>
      </AppShell.Root>
    </>
  );
}
