import { AppShell } from '@envsemble/envui';

export function Frame({ children, busy }) {
  return (
    <AppShell.Root loading={busy} className="app">
      <AppShell.SkipLinks />
      <AppShell.Header />
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell.Root>
  );
}
