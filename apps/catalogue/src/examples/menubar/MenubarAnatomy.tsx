import { Menu, Menubar } from '@envsemble/envui';

export default function MenubarAnatomy() {
  return (
    <Menubar.Root aria-label="Application menu" accessKeys>
      <Menubar.Menu label="File" accessKey="F">
        <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
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
