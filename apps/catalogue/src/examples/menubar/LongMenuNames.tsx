import { Menu, Menubar } from '@envsemble/envui';

export default function LongMenuNames() {
  return (
    // Wrong: long names crowd the bar and are slower to scan.
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File and export">
        <Menu.Item>Export…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Editing tools">
        <Menu.Item>Find…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Insert content">
        <Menu.Item>Table</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
