// Code written for 1.0.0-prerelease.0, run through every transform in order: what has a 1.0 form
// is rewritten, and the rest is reported where it stands.
import {
  AppShell,
  Drawer,
  LoadingState,
  NavList,
  Popover,
  Sidebar,
  Skeleton,
  Row,
  useBreakpoint,
  type StackProps,
  Panes,
  Badge,
  IconButton,
  Spinner,
} from '@envsemble/envui';

import { Close } from '@envsemble/envui/icons/Close';

export function Frame({ gap }: { gap: StackProps['gap'] }) {
  const wide = useBreakpoint('md');
  return (
    <AppShell.Root>
      <Sidebar.Root label="Main">
        <NavList.Root>
          <NavList.Item href="/" selected>
            Home
          </NavList.Item>
        </NavList.Root>
      </Sidebar.Root>
      <AppShell.Main>
        <Row gap={gap}>
          <Popover width="lg" trigger={<button type="button">Info</button>}>
            Details
          </Popover>
          <Drawer title="Filters" open={wide}>
            Filters
          </Drawer>
        </Row>
        <LoadingState label="Loading">
          <Skeleton width="40%" />
        </LoadingState>
        <Spinner showLabel label="Loading projects" />
        <IconButton variant="ghost" icon={<Close />} aria-label="Close" onClick={() => {}} />
        <IconButton icon={<span />} aria-label="More" variant="ghost" />
        <Badge variant="solid" count={3} tone="accent" />
        <Panes.Root
          behavior="list-detail"
          open={wide}
          onOpenChange={() => {}}
          backLabel="All">
          <Panes.List>List</Panes.List>
          <Panes.Detail>Detail</Panes.Detail>
        </Panes.Root>
      </AppShell.Main>
    </AppShell.Root>
  );
}
