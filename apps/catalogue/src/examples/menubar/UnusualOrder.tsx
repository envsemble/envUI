import { Menu, Menubar } from '@envsemble/envui';

export default function UnusualOrder() {
  return (
    // Wrong: people look for File first and Help last.
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="Help">
        <Menu.Item>Keyboard shortcuts</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Format">
        <Menu.Item shortcut="Ctrl+B">Bold</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View">
        <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
