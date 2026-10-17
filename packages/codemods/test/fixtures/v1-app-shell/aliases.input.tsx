import { AppShell as Shell } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Frame({ children, items }) {
  return (
    <>
      <Shell navigation={items} navigationLabel="Primary">
        {children}
      </Shell>
      <ui.AppShell title="Inbox">{children}</ui.AppShell>
    </>
  );
}
