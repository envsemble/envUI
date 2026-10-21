import { AccountMenu, AppShell, Drawer, ListDetail, NavList, Sidebar, SplitPane } from '@envsemble/envui';
import { breakpoints, useBreakpoint, useMediaQuery, WindowFrame, type DrawerProps } from '@envsemble/envui';

// 1.0.0-prerelease.0's frame, navigation and breakpoints have no 1.0 export of the same name, so
// each is reported and stays; its Drawer is the navigation drawer's name now, which stays as it is
// for v1-structure to report, and ListDetail's elements are v1-structure's to rewrite.
export function Frame(props: DrawerProps) {
  const wide = useBreakpoint('md') || useMediaQuery(`(width >= ${breakpoints.lg})`);
  return (
    <AppShell.Root>
      <Sidebar.Root label="Main">
        <NavList.Root />
      </Sidebar.Root>
      <AppShell.Main>
        <AccountMenu.Root name="Ada" />
        <SplitPane.Root />
        <ListDetail.Root detailShown={wide} />
        <Drawer {...props} />
        <WindowFrame.Root />
      </AppShell.Main>
    </AppShell.Root>
  );
}
