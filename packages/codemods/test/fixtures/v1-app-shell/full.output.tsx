import {
  AppShell,
  Button,
  Menubar,
  Tree,
  useAppShell,
  SidebarTrigger,
  Sidebar,
  useSidebar,
} from '@envsemble/envui';

function Notes() {
  const {
    getScrollElement
  } = useAppShell();

  const {
    dismiss: closeNarrowSidebar
  } = useSidebar();

  return <Button onClick={() => (closeNarrowSidebar(), getScrollElement())}>Open</Button>;
}

function Back() {
  const {
    dismiss: closeNarrowSidebar
  } = useSidebar();
  return <Button onClick={closeNarrowSidebar}>Back</Button>;
}

export function Window({ width, onWidth, min }) {
  return (
    <AppShell.Root
      titleBar
      sidebarWidth={width}
      onSidebarWidthChange={onWidth}
      headerSpan="full"
      defaultSidebarOpen={false}>
      <AppShell.SkipLinks />
      <Sidebar.Root label="Notes" minWidth={min / 16}>
        <Sidebar.Content fill>
          <Tree items={[]} aria-label="Files" />
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header
        start={<>
          <SidebarTrigger mark="N" />
          <Menubar.Root aria-label="Menu" />
        </>}>
        Notes
      </AppShell.Header>
      <AppShell.Main>
        <Notes />
        <Back />
      </AppShell.Main>
    </AppShell.Root>
  );
}
