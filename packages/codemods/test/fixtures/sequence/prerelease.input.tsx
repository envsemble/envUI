// Code written for 1.0.0-prerelease.0, run through every transform in order: what has a 1.0 form
// is rewritten, and the rest is reported where it stands.
import {
  AppShell,
  Drawer,
  ListDetail,
  LoadingState,
  NavList,
  Popover,
  Sidebar,
  Skeleton,
  Stack,
  useBreakpoint,
  type StackProps,
} from '@envsemble/envui';

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
        <Stack direction="row" gap={gap}>
          <Popover width="lg" trigger={<button type="button">Info</button>}>
            Details
          </Popover>
          <Drawer title="Filters" open={wide}>
            Filters
          </Drawer>
        </Stack>
        <LoadingState label="Loading">
          <Skeleton width="40%" />
        </LoadingState>
        <ListDetail.Root detailShown={wide} onBack={() => {}} backLabel="All">
          <ListDetail.List>List</ListDetail.List>
          <ListDetail.Detail>Detail</ListDetail.Detail>
        </ListDetail.Root>
      </AppShell.Main>
    </AppShell.Root>
  );
}
