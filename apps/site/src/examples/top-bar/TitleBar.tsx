import { IconButton, Menu, Menubar, TopBar } from '@envsemble/envui';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function TitleBar() {
  return (
    <TopBar
      titleBar
      title="Roadmap.md"
      start={
        <Menubar.Root aria-label="Application menu">
          <Menubar.Menu label="File">
            <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
          </Menubar.Menu>
          <Menubar.Menu label="Edit">
            <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
          </Menubar.Menu>
        </Menubar.Root>
      }
      end={<IconButton icon={<IconShare />} aria-label="Share" />}
    />
  );
}
