import { AppShell } from '@envsemble/envui';

export function Frame({ children, busy }) {
  return (
    <AppShell.Root loading={busy} className="app">
      {children}
    </AppShell.Root>
  );
}
