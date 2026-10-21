import { IconButton, Menu, Menubar, TopBar } from '@envsemble/envui';
import { Share } from '@envsemble/envui/icons/Share';

export default function InTitleBar() {
  return (
    // A desktop-style window draws its own title bar; the menubar sits at its start.
    <TopBar
      titleBar
      title="Roadmap.md"
      start={
        <Menubar.Root aria-label="Application menu">
          <Menubar.Menu label="File">
            <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
            <Menu.Item shortcut="Ctrl+O">Open…</Menu.Item>
          </Menubar.Menu>
          <Menubar.Menu label="Edit">
            <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
            <Menu.Item shortcut="Ctrl+Y">Redo</Menu.Item>
          </Menubar.Menu>
          <Menubar.Menu label="View">
            <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
            <Menu.Item shortcut="Ctrl+-">Zoom out</Menu.Item>
          </Menubar.Menu>
        </Menubar.Root>
      }
      actions={<IconButton icon={<Share />} aria-label="Share" />}
    />
  );
}
