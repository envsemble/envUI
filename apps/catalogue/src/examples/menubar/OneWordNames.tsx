import { Menu, Menubar } from '@envsemble/envui';

export default function OneWordNames() {
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File">
        <Menu.Item>Export…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item>Find…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Insert">
        <Menu.Item>Table</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
