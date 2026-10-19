import type { CSSProperties } from 'react';
import { AppShell, Button, Page, Sidebar, SidebarTrigger, Stack, Text } from '@envsemble/envui';

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '18rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function Offcanvas() {
  return (
    <AppShell.Root headerSpan="full" landmarks={false} scroll="main" style={preview}>
      <AppShell.Header start={<SidebarTrigger />}>Results</AppShell.Header>
      <Sidebar.Root label="Filters" landmark="complementary" collapsible="offcanvas" width={16}>
        <Sidebar.Content align="stretch">
          <Stack gap={2}>
            <Button variant="secondary">Only mine</Button>
            <Button variant="secondary">Changed this week</Button>
          </Stack>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Main>
        <Page width="sm">
          <Text emphasis="muted">
            Collapsed off canvas, the filters leave the window and the results take its width.
          </Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
