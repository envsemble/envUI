import type { CSSProperties } from 'react';
import { AppShell, DescriptionList, Page, Sidebar, SidebarTrigger, Text } from '@envsemble/envui';

/** Stands in for the window; an application renders the frame at its root. */
const preview = {
  '--env-app-shell-block-size': '18rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function EndSidebar() {
  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview}>
      <AppShell.Header end={<SidebarTrigger side="end" />}>Launch plan</AppShell.Header>
      <AppShell.Main>
        <Page width="sm">
          <Text emphasis="muted">
            The details sit beside the page, below the header, and resize from their edge.
          </Text>
        </Page>
      </AppShell.Main>
      <AppShell.Aside label="Details" resizable>
        <Sidebar.Content align="stretch">
          <DescriptionList.Root>
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Due">14 November</DescriptionList.Item>
            <DescriptionList.Item label="Status">In review</DescriptionList.Item>
          </DescriptionList.Root>
        </Sidebar.Content>
      </AppShell.Aside>
    </AppShell.Root>
  );
}
