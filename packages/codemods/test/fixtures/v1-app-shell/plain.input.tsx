import { AppShell } from '@envsemble/envui';

export function Frame({ children, busy }) {
  return (
    <AppShell loading={busy} className="app">
      {children}
    </AppShell>
  );
}
