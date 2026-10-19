import { AppShell, Button, Menubar, Tree, useAppShell } from '@envsemble/envui';

function Notes() {
  const { closeNarrowSidebar, getScrollElement } = useAppShell();
  return <Button onClick={() => (closeNarrowSidebar(), getScrollElement())}>Open</Button>;
}

function Back() {
  const { closeNarrowSidebar } = useAppShell();
  return <Button onClick={closeNarrowSidebar}>Back</Button>;
}

export function Window({ width, onWidth, min }) {
  return (
    <AppShell.Root
      topbar="full"
      titleBar
      defaultCollapsed
      brand="N"
      context={<Menubar.Root aria-label="Menu" />}
      title="Notes"
      navigationLabel="Notes"
      navigation={null}
      sidebarContent={<Tree items={[]} aria-label="Files" />}
      sidebarWidth={width}
      onSidebarWidthChange={onWidth}
      sidebarMinWidth={min}
    >
      <Notes />
      <Back />
    </AppShell.Root>
  );
}
