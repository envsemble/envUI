import { Menu, Menubar } from '@envsemble/envui';

export default function MenubarAnatomy() {
  return (
    // As wide as a window's bar, with room after its menus.
    <Menubar.Root aria-label="Application menu" accessKeys style={{ inlineSize: '20rem' }}>
      {/* defaultOpen shows the File menu open, as a picture. */}
      <Menubar.Menu label="File" accessKey="F" defaultOpen>
        <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
        <Menu.Item shortcut="Ctrl+O">Open…</Menu.Item>
        <Menu.Separator />
        <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit" accessKey="E">
        <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View" accessKey="V">
        <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
